import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import axios from 'axios';

const router = Router();

router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { clerkUserId: req.user.id },
    });

    if (!candidate) {
      return res.json({ data: [] });
    }

    const applications = await prisma.application.findMany({
      where: { candidateId: candidate.id },
      include: {
        job: {
          include: {
            employer: { select: { id: true, name: true } },
          },
        },
        candidate: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json({ data: applications });
  } catch (error) {
    console.error('Error fetching my applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, jobId } = req.query;
    const where: any = {};

    if (req.user.role === 'student') {
      const candidate = await prisma.candidate.findFirst({
        where: { clerkUserId: req.user.id },
      });
      if (candidate) {
        where.candidateId = candidate.id;
      }
    } else if (req.user.role === 'employer') {
      where.job = { employerId: req.user.id };
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
            employer: { select: { id: true, name: true, email: true } },
          },
        },
        candidate: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json({ data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.body;

    const candidate = await prisma.candidate.findFirst({
      where: { clerkUserId: req.user.id },
    });

    if (!candidate) {
      return res.status(400).json({ message: 'Please create your candidate profile first' });
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_candidateId: { jobId, candidateId: candidate.id },
      },
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: candidate.id,
      },
      include: {
        job: true,
        candidate: true,
      },
    });

    res.status(201).json({ data: application });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ message: 'Failed to create application' });
  }
});

router.put('/:id/status', authenticate, authorize('employer', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        job: true,
        candidate: true,
      },
    });

    res.json({ data: application });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
});

export default router;
