import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { signupSchema, loginSchema } from '../validators/auth.validator.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const input = signupSchema.parse(req.body);
      const result = await AuthService.signup(input);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Signup failed', message: error.message });
      }
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const input = loginSchema.parse(req.body);
      const result = await AuthService.login(input);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: 'Login failed', message: error.message });
      }
    }
  }

  static async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      }
      const user = await AuthService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Not found', message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Server error', message: error.message });
      }
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      }
      const user = await AuthService.updateUser(req.user.id, req.body);
      res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Update failed', message: error.message });
      }
    }
  }
}
