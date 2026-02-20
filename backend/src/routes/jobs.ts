import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { search, jobType, location, status } = req.query;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { company: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (jobType) {
      where.jobType = jobType;
    }
    
    if (location) {
      where.location = { contains: location as string, mode: 'insensitive' };
    }
    
    if (status) {
      where.status = status;
    } else {
      where.status = 'active';
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        employer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: { jobs } });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        employer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ data: job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Failed to fetch job' });
  }
});

router.post('/', authenticate, authorize('employer', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, company, description, requirements, skills, location, salaryMin, salaryMax, jobType, status } = req.body;

    const job = await prisma.job.create({
      data: {
        title,
        company,
        description,
        requirements: requirements || [],
        skills: skills || [],
        location,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        jobType: jobType || 'full_time',
        status: status || 'active',
        employerId: req.user.id,
      },
      include: {
        employer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({ data: job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create job' });
  }
});

router.put('/:id', authenticate, authorize('employer', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, company, description, requirements, skills, location, salaryMin, salaryMax, jobType, status } = req.body;

    const existingJob = await prisma.job.findUnique({ where: { id } });
    
    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role !== 'admin' && existingJob.employerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(company && { company }),
        ...(description && { description }),
        ...(requirements && { requirements }),
        ...(skills && { skills }),
        ...(location !== undefined && { location }),
        ...(salaryMin !== undefined && { salaryMin }),
        ...(salaryMax !== undefined && { salaryMax }),
        ...(jobType && { jobType }),
        ...(status && { status }),
      },
      include: {
        employer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({ data: job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Failed to update job' });
  }
});

router.delete('/:id', authenticate, authorize('employer', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingJob = await prisma.job.findUnique({ where: { id } });
    
    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role !== 'admin' && existingJob.employerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.job.delete({ where: { id } });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
});

export default router;
