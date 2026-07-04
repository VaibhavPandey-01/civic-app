import { Router } from 'express';
import { getAllReports, updateReportStatus, uploadResolution, getAnalytics } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { uploadSingle } from '../middleware/uploadMiddleware';

const router = Router();

// Apply auth and admin role restrictions to all admin endpoints
router.use(authMiddleware, requireRole('admin'));

router.get('/reports', getAllReports);
router.patch('/reports/:id/status', updateReportStatus);
router.post('/reports/:id/resolution', uploadSingle, uploadResolution);
router.get('/analytics', getAnalytics);

export default router;
