import { Request, Response, NextFunction } from 'express';

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  CSV_PARSE_ERROR = 'CSV_PARSE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
}

export class AppError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 * Catches all errors and formats them consistently
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    res.status(400).json({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      details: err.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle generic errors
  res.status(500).json({
    code: ErrorCode.INTERNAL_ERROR,
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString(),
  });
};

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    code: ErrorCode.NOT_FOUND,
    message: 'Route not found',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors and pass them to error middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
