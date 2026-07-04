
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/jwt';

/**
 * Verifies the JWT from the `Authorization: Bearer <token>` header.
 *
 * On success → attaches `req.user = { id, role }` and calls next().
 * On failure → responds with 401 and a machine-readable message.
 *
 * NOTE: This middleware does NOT check roles — use `requireRole()` from
 * roleMiddleware.ts for that.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required — no token provided',
    });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
