import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../types/index.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error: ApiError = {
        error: 'Unauthorized',
        message: 'No token provided',
        statusCode: 401
      };
      return res.status(401).json(error);
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET!;
    
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };
    req.user = decoded;
    
    next();
  } catch {
    const error: ApiError = {
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      statusCode: 401
    };
    return res.status(401).json(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      const error: ApiError = {
        error: 'Unauthorized',
        message: 'User not authenticated',
        statusCode: 401
      };
      return res.status(401).json(error);
    }

    if (!roles.includes(req.user.role)) {
      const error: ApiError = {
        error: 'Forbidden',
        message: 'Insufficient permissions',
        statusCode: 403
      };
      return res.status(403).json(error);
    }

    next();
  };
};
