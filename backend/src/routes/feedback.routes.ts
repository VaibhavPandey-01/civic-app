import { Router } from 'express';
import { submitFeedback } from '../controllers/feedback.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.post('/', authMiddleware, requireRole('citizen'), submitFeedback);

export default router;
