import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import axios from 'axios';

const router = Router();

router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const applications = await prisma.application.findMany({
      where: { studentId: req.user.id },
      include: {
        job: {
          include: {
            recruiter: { select: { id: true, name: true } },
          },
        },
        resume: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: applications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, jobId } = req.query;
    const where: any = {};

    if (req.user.role === 'student') {
      where.studentId = req.user.id;
    } else if (req.user.role === 'recruiter') {
      where.job = { recruiterId: req.user.id };
    }

    if (status) {
      where.status = status;
    }
    if (jobId) {
      where.jobId = jobId;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          include: {
            recruiter: { select: { id: true, name: true, email: true } },
          },
        },
        student: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        resume: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: applications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

router.post('/', authenticate, authorize('student'), async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, coverLetter } = req.body;

    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_studentId: { jobId, studentId: req.user.id },
      },
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    const resume = await prisma.resume.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!resume) {
      return res.status(400).json({ message: 'Please upload a resume first' });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    let matchScore = null;
    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL || 'http://localhost:3002'}/ai/match`,
        {
          resumeSkills: resume.skills,
          jobRequirements: job.requirements || job.description,
        },
        { timeout: 10000 }
      );
      matchScore = aiResponse.data.matchScore || null;
    } catch (aiError) {
      console.error('AI matching failed:', aiError);
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        studentId: req.user.id,
        resumeId: resume.id,
        coverLetter,
        matchScore,
      },
      include: {
        job: true,
        student: { select: { id: true, name: true, email: true } },
        resume: true,
      },
    });

    res.status(201).json({ data: application });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ message: 'Failed to create application' });
  }
});

router.put('/:id/status', authenticate, authorize('recruiter', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        job: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ data: application });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update application status' });
  }
});

export default router;
