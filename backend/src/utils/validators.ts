import { z } from 'zod';
import { REPORT_CATEGORIES, REPORT_STATUSES } from '../models/Report.model';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  idToken: z.string().min(1, 'Firebase ID token is required'),
  name: z.string().min(1).max(100).trim(),
  phone: z.string().min(7).max(20).trim(),
  role: z.enum(['citizen', 'admin']).default('citizen'),
  /** Only required when role === 'admin' */
  inviteCode: z.string().optional(),
  fcmToken: z.string().optional(),
});

export const loginSchema = z.object({
  idToken: z.string().min(1, 'Firebase ID token is required'),
  fcmToken: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

/**
 * Multipart bodies arrive as strings — coerce latitude/longitude to numbers.
 */
export const createReportSchema = z.object({
  category: z.enum(REPORT_CATEGORIES),
  description: z.string().max(1000).optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const updateStatusSchema = z.object({
  status: z.enum(REPORT_STATUSES),
  remarks: z.string().max(500).optional(),
  /** Mongo ObjectId string of the admin being assigned */
  assignedAdminId: z.string().optional(),
});

export const uploadResolutionSchema = z.object({
  notes: z.string().max(1000).optional(),
});

export const adminReportsQuerySchema = z.object({
  status: z.enum(REPORT_STATUSES).optional(),
  category: z.enum(REPORT_CATEGORIES).optional(),
  department: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export const submitFeedbackSchema = z.object({
  reportId: z.string().min(1, 'reportId is required'),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Shared pagination (citizen report list)
// ---------------------------------------------------------------------------

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
