import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { search, status } = req.query;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { role: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: candidates });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ data: candidate });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ message: 'Failed to fetch candidate' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, role, skills, education, experience, resumeUrl, resumeText } = req.body;

    const candidate = await prisma.candidate.create({
      data: {
        userId: req.user.role === 'student' ? req.user.id : undefined,
        clerkUserId: req.user.id,
        name,
        email,
        role,
        skills: skills || [],
        education: education || [],
        experience: experience || [],
        resumeUrl,
        resumeText,
      },
    });

    res.status(201).json({ data: candidate });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ message: 'Failed to create candidate' });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, skills, education, experience, resumeUrl, resumeText, status, matchScore } = req.body;

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role !== undefined && { role }),
        ...(skills && { skills }),
        ...(education && { education }),
        ...(experience && { experience }),
        ...(resumeUrl !== undefined && { resumeUrl }),
        ...(resumeText !== undefined && { resumeText }),
        ...(status && { status }),
        ...(matchScore !== undefined && { matchScore }),
      },
    });

    res.json({ data: candidate });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ message: 'Failed to update candidate' });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.candidate.delete({ where: { id } });

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ message: 'Failed to delete candidate' });
  }
});

export default router;
