import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Global Express error-handling middleware.
 *
 * Must be registered LAST in the middleware chain (after all routes).
 * Express identifies error handlers by their 4-parameter signature.
 */
export const errorHandler = (
  err: Error & { status?: number; errors?: unknown },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.status ?? 500;

  logger.error(err.message, {
    stack: err.stack,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    errors: err.errors ?? null,
  });
};
