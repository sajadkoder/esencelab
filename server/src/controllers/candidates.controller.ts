import { Request, Response } from 'express';
import { CandidatesService } from '../services/candidates.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export class CandidatesController {
  static async getAll(req: Request, res: Response) {
    try {
      const filters = {
        status: req.query.status as string,
        minScore: req.query.minScore ? Number(req.query.minScore) : undefined
      };
      const candidates = await CandidatesService.getAll(filters);
      res.json(candidates);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Fetch failed', message: error.message });
      }
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const candidate = await CandidatesService.getById(req.params.id);
      if (!candidate) {
        return res.status(404).json({ error: 'Not found', message: 'Candidate not found' });
      }
      res.json(candidate);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Fetch failed', message: error.message });
      }
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const candidate = await CandidatesService.getByUserId(req.user.id);
      if (!candidate) {
        return res.status(404).json({ error: 'Not found', message: 'Profile not found' });
      }
      res.json(candidate);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Fetch failed', message: error.message });
      }
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const candidate = await CandidatesService.create({
        ...req.body,
        user_id: req.user.id
      });
      res.status(201).json(candidate);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Create failed', message: error.message });
      }
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const candidate = await CandidatesService.updateStatus(req.params.id, req.body);
      res.json(candidate);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Update failed', message: error.message });
      }
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const candidate = await CandidatesService.getByUserId(req.user.id);
      if (!candidate) {
        return res.status(404).json({ error: 'Not found' });
      }
      const updated = await CandidatesService.updateProfile(candidate.id, req.body);
      res.json(updated);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Update failed', message: error.message });
      }
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: 'Bad request', message: 'Search query required' });
      }
      const candidates = await CandidatesService.search(query);
      res.json(candidates);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Search failed', message: error.message });
      }
    }
  }
}
