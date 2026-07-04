import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import Report from '../models/Report.model';
import Feedback from '../models/Feedback.model';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { submitFeedbackSchema } from '../utils/validators';

// ---------------------------------------------------------------------------
// POST /api/feedback    (citizen only)
// ---------------------------------------------------------------------------

export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
  const parsed = submitFeedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation failed', 400, parsed.error.flatten());
    return;
  }

  const { reportId, rating, comment } = parsed.data;
  const userId = req.user!.id;

  // 1. Verify the report exists
  const report = await Report.findById(reportId);
  if (!report) {
    sendError(res, 'Report not found', 404);
    return;
  }

  // 2. Ensure report is owned by requesting citizen
  if (report.userId.toString() !== userId) {
    sendError(res, 'Forbidden — you can only submit feedback for your own reports', 403);
    return;
  }

  // 3. Ensure the report status is 'resolved'
  if (report.status !== 'resolved') {
    sendError(res, 'Cannot submit feedback for an unresolved report', 400);
    return;
  }

  // 4. Check if feedback has already been submitted (compound unique index will catch this too,
  // but catch here for cleaner response)
  const existingFeedback = await Feedback.findOne({ reportId, userId });
  if (existingFeedback) {
    sendError(res, 'Feedback has already been submitted for this report', 400);
    return;
  }

  // 5. Create Feedback
  const feedback = await Feedback.create({
    reportId,
    userId,
    rating,
    comment
  });

  sendSuccess(res, { feedback }, 'Feedback submitted successfully', 201);
});
