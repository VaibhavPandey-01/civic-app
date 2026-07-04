import { Router } from 'express';
import { createReport, getUserReports, getReportById } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { uploadSingle } from '../middleware/uploadMiddleware';

const router = Router();

// Protect all report routes under auth
router.use(authMiddleware);

// Citizen only reporting, accepts multipart image with name "image"
router.post('/', requireRole('citizen'), uploadSingle, createReport);

// Citizen fetching their own reports (note: route matches user/:id as specified)
router.get('/user/:id', getUserReports);

// Get single report details (ownership checked inside controller)
router.get('/:id', getReportById);

export default router;
