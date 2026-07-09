import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import Report, { ReportStatus } from '../models/Report.model';
import StatusHistory from '../models/StatusHistory.model';
import User from '../models/User.model';
import { uploadBufferToCloudinary, deleteImageFromCloudinary } from '../services/imageUploadService';
import { analyzeImage, AiAnalysisResult } from '../services/aiService';
import { resolveDepartment, derivePriority } from '../services/routingService';
import { sendPushNotification } from '../services/notificationService';
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

  // 2. AI analysis & validation — best-effort; failure must NOT block report creation
  const clientVersion = req.headers['x-client-version'];
  const runAiValidation = clientVersion === '2.0.0-AI';

  let aiResult: AiAnalysisResult | undefined;

  if (runAiValidation) {
    try {
      aiResult = await analyzeImage(imageURL, category, description || '');
    } catch (err) {
      // Non-fatal — log and continue without AI data
      logger.warn('AI analysis/validation failed (non-blocking)', { err });
    }
  } else {
    logger.info('Skipping AI validation: legacy client detected', { clientVersion });
  }

  // 3. Auto-route to department + derive priority
  const assignedDepartment = resolveDepartment(category);
  const priority = derivePriority(category, aiResult?.aiDetection.confidence);

  // If AI flags it as invalid with high confidence, reject the submission!
  const isInvalid = aiResult && !aiResult.aiValidation.isValid && aiResult.aiValidation.confidence >= 0.70;
  if (isInvalid) {
    // Delete the image from Cloudinary since it's rejected
    await deleteImageFromCloudinary(imageURL);

    const lang = req.body.language || 'en';
    const reason = lang === 'hi' ? aiResult?.aiValidation.reasonHindi : aiResult?.aiValidation.reason;

    sendError(res, `AI Validation Failed: ${reason}`, 400);
    return;
  }

  const status: ReportStatus = 'submitted';

  // 4. Persist the report
  const report = await Report.create({
    userId,
    category,
    description,
    imageURL,
    latitude,
    longitude,
    timestamp: new Date(),
    status,
    assignedDepartment,
    priority,
    ...(aiResult ? {
      aiDetection: aiResult.aiDetection,
      aiValidation: aiResult.aiValidation,
    } : {}),
  });

  // 5. Create the initial status history entry
  await StatusHistory.create({
    reportId: report._id,
    status,
    changedBy: userId,
    remarks: isInvalid 
      ? `Report flagged as invalid by AI: ${aiResult?.aiValidation.reason}`
      : 'Report submitted by citizen',
  });

  // Notify all admins about the new report
  try {
    const admins = await User.find({ role: 'admin', fcmToken: { $exists: true, $ne: null } }).select('fcmToken');
    for (const adminUser of admins) {
      if (adminUser.fcmToken) {
        await sendPushNotification(
          adminUser.fcmToken,
          'New Incident Reported',
          `A new ${category.replace('_', ' ')} incident has been reported.`,
          { reportId: report._id.toString(), type: 'new_report' }
        );
      }
    }
  } catch (err) {
    logger.warn('Push notification failed to admins after report creation', { err });
  }

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
