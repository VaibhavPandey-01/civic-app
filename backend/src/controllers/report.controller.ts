import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import Report from '../models/Report.model';
import StatusHistory from '../models/StatusHistory.model';
import { uploadBufferToCloudinary } from '../services/imageUploadService';
import { analyzeImage } from '../services/aiService';
import { resolveDepartment, derivePriority } from '../services/routingService';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { createReportSchema, paginationQuerySchema } from '../utils/validators';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// POST /api/reports    (citizen only, multipart)
// ---------------------------------------------------------------------------

export const createReport = asyncHandler(async (req: Request, res: Response) => {
  // Validate text fields from multipart body
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation failed', 400, parsed.error.flatten());
    return;
  }

  if (!req.file) {
    sendError(res, 'An image file is required (field: "image")', 400);
    return;
  }

  const { category, description, latitude, longitude } = parsed.data;
  const userId = req.user!.id;

  // 1. Upload image to Cloudinary
  const imageURL = await uploadBufferToCloudinary(
    req.file.buffer,
    'ocean-preventions/reports'
  );

  // 2. AI analysis — best-effort; failure must NOT block report creation
  let aiDetection: { label: string; confidence: number } | undefined;
  try {
    aiDetection = await analyzeImage(imageURL);
  } catch (err) {
    // Non-fatal — log and continue without AI data
    logger.warn('AI analysis failed (non-blocking)', { err });
  }

  // 3. Auto-route to department + derive priority
  const assignedDepartment = resolveDepartment(category);
  const priority = derivePriority(category, aiDetection?.confidence);

  // 4. Persist the report
  const report = await Report.create({
    userId,
    category,
    description,
    imageURL,
    latitude,
    longitude,
    timestamp: new Date(),
    status: 'submitted',
    assignedDepartment,
    priority,
    ...(aiDetection ? { aiDetection } : {}),
  });

  // 5. Create the initial status history entry
  await StatusHistory.create({
    reportId: report._id,
    status: 'submitted',
    changedBy: userId,
    remarks: 'Report submitted by citizen',
  });

  sendSuccess(res, { report }, 'Report created successfully', 201);
});

// ---------------------------------------------------------------------------
// GET /api/reports/user/:id    (auth — citizen sees own reports)
// ---------------------------------------------------------------------------

/**
 * The :id param is intentionally ignored — we always query by req.user.id so
 * citizens cannot access other users' reports by spoofing the URL param.
 * Admins should use the /api/admin/reports endpoint for broader access.
 */
export const getUserReports = asyncHandler(async (req: Request, res: Response) => {
  const query = paginationQuerySchema.safeParse(req.query);
  if (!query.success) {
    sendError(res, 'Invalid query parameters', 400, query.error.flatten());
    return;
  }

  const { page, limit } = query.data;
  const skip = (page - 1) * limit;
  const userId = req.user!.id;

  const [reports, total] = await Promise.all([
    Report.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Report.countDocuments({ userId }),
  ]);

  sendSuccess(res, {
    reports,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ---------------------------------------------------------------------------
// GET /api/reports/:id    (auth — ownership or admin)
// ---------------------------------------------------------------------------

export const getReportById = asyncHandler(async (req: Request, res: Response) => {
  const report = await Report.findById(req.params.id).populate({
    path: 'userId',
    select: 'name phone',
  });

  if (!report) {
    sendError(res, 'Report not found', 404);
    return;
  }

  // Citizens can only view their own reports
  const reporterId = (report.userId as any)._id?.toString() || report.userId.toString();
  if (
    req.user!.role === 'citizen' &&
    reporterId !== req.user!.id
  ) {
    sendError(res, 'Forbidden', 403);
    return;
  }

  // Fetch status history separately (not embedded in the Report doc)
  const history = await StatusHistory.find({ reportId: report._id })
    .populate('changedBy', 'name role')
    .sort({ changedAt: 1 });

  sendSuccess(res, { report, history });
});
