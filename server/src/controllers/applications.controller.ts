import { Request, Response } from 'express';
import { ApplicationsService } from '../services/applications.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { CandidatesService } from '../services/candidates.service.js';

export class ApplicationsController {
  static async getUserApplications(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const applications = await ApplicationsService.getByUserId(req.user.id);
      res.json(applications);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Fetch failed', message: error.message });
      }
    }
  }

  static async apply(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { jobId } = req.body;
      if (!jobId) {
        return res.status(400).json({ error: 'Bad request', message: 'Job ID required' });
      }

      let candidate = await CandidatesService.getByUserId(req.user.id);
      if (!candidate) {
        candidate = await CandidatesService.create({
          user_id: req.user.id,
          name: '',
          email: req.user.email,
          skills: [],
          education: [],
          experience: [],
          match_score: 0
        });
      }

      const application = await ApplicationsService.create(candidate.id, jobId);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Apply failed', message: error.message });
      }
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const application = await ApplicationsService.updateStatus(req.params.id, status);
      res.json(application);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Update failed', message: error.message });
      }
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await ApplicationsService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Delete failed', message: error.message });
      }
    }
  }
}
