import { Request, Response } from 'express';
import { JobsService } from '../services/jobs.service.js';
import { createJobSchema } from '../validators/jobs.validator.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export class JobsController {
  static async getAll(req: Request, res: Response) {
    try {
      const filters = {
        status: req.query.status as string,
        location: req.query.location as string
      };
      const jobs = await JobsService.getAll(filters);
      res.json(jobs);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Fetch failed', message: error.message });
      }
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const job = await JobsService.getById(req.params.id);
      if (!job) {
        return res.status(404).json({ error: 'Not found', message: 'Job not found' });
      }
      res.json(job);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Fetch failed', message: error.message });
      }
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      }
      const input = createJobSchema.parse(req.body);
      const job = await JobsService.create(req.user.id, input);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Create failed', message: error.message });
      }
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const job = await JobsService.update(req.params.id, req.body);
      res.json(job);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Update failed', message: error.message });
      }
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await JobsService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Delete failed', message: error.message });
      }
    }
  }

  static async getByEmployer(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const jobs = await JobsService.getJobsByEmployer(req.user.id);
      res.json(jobs);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Fetch failed', message: error.message });
      }
    }
  }
}
