import { Request, Response, NextFunction } from 'express';

/**
 * Higher-order middleware factory that restricts access to a specific role.
 *
 * Usage in a route definition:
 *   router.get('/admin-only', authMiddleware, requireRole('admin'), handler);
 *
 * Must be placed AFTER `authMiddleware` in the middleware chain — it reads
 * `req.user.role` which is set by the auth layer.
 */
export const requireRole = (...allowedRoles: Array<'citizen' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden — requires one of: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
