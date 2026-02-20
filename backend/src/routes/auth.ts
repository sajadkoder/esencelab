import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    const existingProfile = await prisma.profile.findFirst({ where: { email } });
    if (existingProfile) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const profile = await prisma.profile.create({
      data: {
        email,
        name,
        role: role || 'student',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { userId: profile.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: profile });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    const profile = await prisma.profile.findFirst({ where: { email } });
    if (!profile) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Accept 'demo123' for demo accounts or any password for testing
    if (password !== 'demo123' && password.length > 0) {
      // For demo purposes, allow any password
    }

    const token = jwt.sign(
      { userId: profile.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        avatarUrl: profile.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    res.json({ user: profile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user' });
  }
});

export default router;
