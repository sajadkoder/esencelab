import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

router.get('/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ data: course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Failed to fetch course' });
  }
});

router.post('/', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, provider, url, skills, duration, level, rating, imageUrl } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        provider,
        url,
        skills: skills || [],
        duration,
        level,
        rating: rating ? Number(rating) : null,
        imageUrl,
      },
    });

    res.status(201).json({ data: course });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Failed to create course' });
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, provider, url, skills, duration, level, rating, imageUrl } = req.body;

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(provider && { provider }),
        ...(url && { url }),
        ...(skills && { skills }),
        ...(duration && { duration }),
        ...(level && { level }),
        ...(rating !== undefined && { rating: rating ? Number(rating) : null }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    res.json({ data: course });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Failed to update course' });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.course.delete({ where: { id } });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

export default router;
