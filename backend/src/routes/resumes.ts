import { Router, Response } from 'express';
import multer from 'multer';
import prisma from '../config/db';
import { authenticate, AuthRequest } from '../middleware/auth';
import axios from 'axios';
import path from 'path';

const router = Router();
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let parsedData: any = null;
    let skills: string[] = [];

    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL || 'http://localhost:3002'}/ai/parse-resume`,
        {
          filePath: req.file.path,
          fileName: req.file.originalname,
        },
        { timeout: 30000 }
      );
      parsedData = aiResponse.data.parsedData;
      skills = aiResponse.data.skills || [];
    } catch (aiError) {
      console.error('AI parsing failed:', aiError);
    }

    const existingResume = await prisma.resume.findFirst({
      where: { userId: req.user.id },
    });

    let resume;
    if (existingResume) {
      resume = await prisma.resume.update({
        where: { id: existingResume.id },
        data: {
          fileUrl: `/uploads/${req.file.filename}`,
          fileName: req.file.originalname,
          parsedData,
          skills,
        },
      });
    } else {
      resume = await prisma.resume.create({
        data: {
          userId: req.user.id,
          fileUrl: `/uploads/${req.file.filename}`,
          fileName: req.file.originalname,
          parsedData,
          skills,
        },
      });
    }

    res.json({ data: resume });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload resume' });
  }
});

router.get('/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ data: resume });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: resume });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const resume = await prisma.resume.findUnique({ where: { id } });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.resume.delete({ where: { id } });

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete resume' });
  }
});

export default router;
