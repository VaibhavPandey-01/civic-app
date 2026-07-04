/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from './jwt';

/**
 * Augments the Express Request interface so that req.user is available
 * on any request that has passed through authMiddleware.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
