import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';

export function errorHandler(
  error: any,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  const response: ApiResponse<null> = {
    success: false,
    error: message,
  };

  res.status(statusCode).json(response);
}

export function notFoundHandler(
  req: AuthenticatedRequest,
  res: Response
): void {
  const response: ApiResponse<null> = {
    success: false,
    error: 'Route not found',
  };

  res.status(404).json(response);
}
