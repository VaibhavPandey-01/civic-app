import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Report from '../models/Report.model';
import StatusHistory from '../models/StatusHistory.model';
import User from '../models/User.model';
import { uploadBufferToCloudinary, deleteImageFromCloudinary } from '../services/imageUploadService';
import { verifyResolutionWithGemini } from '../services/geminiService';
import { sendPushNotification } from '../services/notificationService';
import { sendSuccess, sendError } from '../utils/responseHandler';
import {
  adminReportsQuerySchema,
  updateStatusSchema,
  uploadResolutionSchema,
} from '../utils/validators';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// GET /api/admin/reports
// ---------------------------------------------------------------------------

export const getAllReports = asyncHandler(async (req: Request, res: Response) => {
  const query = adminReportsQuerySchema.safeParse(req.query);
  if (!query.success) {
    sendError(res, 'Invalid query parameters', 400, query.error.flatten());
    return;
  }

  const { status, category, department, page, limit } = query.data;
  const skip = (page - 1) * limit;

  // Build filter dynamically — only include keys that were actually provided
  const filter: Record<string, unknown> = {};
  if (status) {
    filter['status'] = status;
  } else {
    filter['status'] = { $ne: 'invalid' };
  }
  if (category) filter['category'] = category;
  if (department) filter['assignedDepartment'] = department;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('userId', 'name phone')
      .populate('assignedAdminId', 'name department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  sendSuccess(res, {
    reports,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/reports/:id/status
// ---------------------------------------------------------------------------

export const updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation failed', 400, parsed.error.flatten());
    return;
  }

  const { status, remarks, assignedAdminId } = parsed.data;
  const adminId = req.user!.id;

  const report = await Report.findById(req.params.id);
  if (!report) {
    sendError(res, 'Report not found', 404);
    return;
  }

  // Apply updates
  report.status = status;
  report.assignedAdminId = new mongoose.Types.ObjectId(assignedAdminId ?? adminId);
  await report.save();

  // Append status history
  await StatusHistory.create({
    reportId: report._id,
    status,
    changedBy: adminId,
    remarks,
    changedAt: new Date(),
  });

  // Push notification to citizen (best-effort — never block the response)
  try {
    const owner = await User.findById(report.userId).select('fcmToken name');
    if (owner?.fcmToken) {
      await sendPushNotification(
        owner.fcmToken,
        'Report Status Updated',
        `Your report is now: ${status.replace('_', ' ')}`,
        { reportId: report._id.toString(), status }
      );
    }
  } catch (err) {
    logger.warn('Push notification failed after status update', { err });
  }

  sendSuccess(res, { report }, 'Status updated successfully');
});

// ---------------------------------------------------------------------------
// POST /api/admin/reports/:id/resolution    (multipart)
// ---------------------------------------------------------------------------

export const uploadResolution = asyncHandler(async (req: Request, res: Response) => {
  const parsed = uploadResolutionSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation failed', 400, parsed.error.flatten());
    return;
  }

  if (!req.file) {
    sendError(res, 'A resolution image is required (field: "image")', 400);
    return;
  }

  const report = await Report.findById(req.params.id);
  if (!report) {
    sendError(res, 'Report not found', 404);
    return;
  }

  const resolutionImage = await uploadBufferToCloudinary(
    req.file.buffer,
    'ocean-preventions/resolutions'
  );

  // Perform Gemini resolution verification if client version matches
  const clientVersion = req.headers['x-client-version'];
  const runAiValidation = clientVersion === '2.0.0-AI';

  if (runAiValidation && report.imageURL) {
    try {
      const verification = await verifyResolutionWithGemini(
        report.imageURL,
        resolutionImage,
        report.category
      );

      // If AI cannot verify the resolution, block the action!
      if (!verification.isVerified) {
        // Delete the uploaded resolution image to save space
        await deleteImageFromCloudinary(resolutionImage);

        const lang = req.body.language || 'en';
        const reason = lang === 'hi' ? verification.reasonHindi : verification.reason;

        sendError(res, `AI Resolution Verification Failed: ${reason}`, 400);
        return;
      }
    } catch (err: any) {
      logger.error('AI resolution verification failed with error', { err });
      await deleteImageFromCloudinary(resolutionImage);
      sendError(res, `AI Verification Service Error: ${err.message || 'System error during AI validation. Please try again.'}`, 500);
      return;
    }
  }

  report.resolutionImage = resolutionImage;
  report.resolutionNotes = parsed.data.notes;
  report.status = 'resolved';
  report.assignedAdminId = new mongoose.Types.ObjectId(req.user!.id);
  await report.save();

  await StatusHistory.create({
    reportId: report._id,
    status: 'resolved',
    changedBy: req.user!.id,
    remarks: parsed.data.notes ?? 'Resolution uploaded by admin',
    changedAt: new Date(),
  });

  // Notify citizen
  try {
    const owner = await User.findById(report.userId).select('fcmToken');
    if (owner?.fcmToken) {
      await sendPushNotification(
        owner.fcmToken,
        'Issue Resolved!',
        'Your report has been resolved. Tap to view before/after.',
        { reportId: report._id.toString(), status: 'resolved' }
      );
    }
  } catch (err) {
    logger.warn('Push notification failed after resolution', { err });
  }

  sendSuccess(res, { report }, 'Resolution uploaded successfully');
});

// ---------------------------------------------------------------------------
// GET /api/admin/analytics
// ---------------------------------------------------------------------------

/**
 * Returns count breakdowns by status, category, and department.
 * Uses MongoDB aggregation for single-query efficiency.
 */
export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [byStatus, byCategory, byDepartment, totalReports] = await Promise.all([
    Report.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Report.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Report.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$assignedDepartment', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Report.countDocuments(),
  ]);

  sendSuccess(res, {
    totalReports,
    byStatus,
    byCategory,
    byDepartment,
  });
});
