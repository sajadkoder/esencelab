import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/index.js';

export const errorHandler = (
  err: Error & Partial<ApiError>,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`Error ${statusCode}: ${message}`);
  console.error(err.stack);

  res.status(statusCode).json({
    error: err.error || 'Server Error',
    message,
    statusCode
  });
};

export const notFound = (req: Request, res: Response) => {
  const error: ApiError = {
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404
  };
  res.status(404).json(error);
};
