import { Router, Request, Response } from 'express';
import authRouter from './auth.routes';
import reportRouter from './report.routes';
import adminRouter from './admin.routes';
import feedbackRouter from './feedback.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/reports', reportRouter);
router.use('/admin', adminRouter);
router.use('/feedback', feedbackRouter);

// Health check endpoint returned at /api/health
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
  });
});

export default router;
