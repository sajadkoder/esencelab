import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (user.role === 'student') {
      const applications = await prisma.application.findMany({
        where: { studentId: user.id },
      });

      const stats = {
        myApplications: applications.length,
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
        interviews: applications.filter(a => a.status === 'interview').length,
        pending: applications.filter(a => a.status === 'pending').length,
      };

      return res.json({ data: stats });
    }

    if (user.role === 'recruiter') {
      const jobs = await prisma.job.findMany({
        where: { recruiterId: user.id },
      });

      const jobIds = jobs.map(j => j.id);

      const applications = await prisma.application.findMany({
        where: { jobId: { in: jobIds } },
      });

      const stats = {
        postedJobs: jobs.length,
        totalApplications: applications.length,
        interviewsScheduled: applications.filter(a => a.status === 'interview').length,
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      };

      return res.json({ data: stats });
    }

    if (user.role === 'admin') {
      const [totalUsers, totalJobs, totalApplications, totalResumes] = await Promise.all([
        prisma.user.count(),
        prisma.job.count(),
        prisma.application.count(),
        prisma.resume.count(),
      ]);

      const stats = {
        totalUsers,
        totalJobs,
        totalApplications,
        totalResumes,
      };

      return res.json({ data: stats });
    }

    res.json({ data: {} });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

export default router;
