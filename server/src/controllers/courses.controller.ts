import { Request, Response } from 'express';
import { CoursesService } from '../services/courses.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export class CoursesController {
  static async getAll(req: Request, res: Response) {
    try {
      const filters = {
        level: req.query.level as string,
        skill: req.query.skill as string
      };
      const courses = await CoursesService.getAll(filters);
      res.json(courses);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Fetch failed', message: error.message });
      }
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const course = await CoursesService.getById(req.params.id);
      if (!course) {
        return res.status(404).json({ error: 'Not found', message: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Fetch failed', message: error.message });
      }
    }
  }

  static async getRecommended(req: AuthRequest, res: Response) {
    try {
      const { skills } = req.body;
      if (!skills || !Array.isArray(skills)) {
        return res.status(400).json({ error: 'Bad request', message: 'Skills array required' });
      }
      const courses = await CoursesService.getRecommended(skills);
      res.json(courses);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Fetch failed', message: error.message });
      }
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const course = await CoursesService.create(req.body);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Create failed', message: error.message });
      }
    }
  }
}
