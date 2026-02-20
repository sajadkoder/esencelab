import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (user.role === 'student') {
      const candidate = await prisma.candidate.findFirst({
        where: { clerkUserId: user.id },
      });

      if (!candidate) {
        return res.json({ data: { myApplications: 0, shortlisted: 0, interviews: 0, pending: 0 } });
      }

      const applications = await prisma.application.findMany({
        where: { candidateId: candidate.id },
      });

      const stats = {
        myApplications: applications.length,
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
        interviews: applications.filter(a => a.status === 'interview').length,
        pending: applications.filter(a => a.status === 'pending').length,
      };

      return res.json({ data: stats });
    }

    if (user.role === 'employer') {
      const jobs = await prisma.job.findMany({
        where: { employerId: user.id },
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
      const [totalProfiles, totalJobs, totalApplications, totalCandidates, totalCourses] = await Promise.all([
        prisma.profile.count(),
        prisma.job.count(),
        prisma.application.count(),
        prisma.candidate.count(),
        prisma.course.count(),
      ]);

      const stats = {
        totalUsers: totalProfiles,
        totalJobs,
        totalApplications,
        totalCandidates,
        totalCourses,
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
