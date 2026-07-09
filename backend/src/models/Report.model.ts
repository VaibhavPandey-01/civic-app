import { Schema, model, Document, Types } from 'mongoose';

// ----------------------------------------------------------------------------
// Shared enum values (also consumed by StatusHistory)
// ----------------------------------------------------------------------------

export const REPORT_CATEGORIES = [
  'garbage_dump',
  'plastic_pollution',
  'waste_accumulation',
  'water_pollution',
  'suspicious_object',
  'emergency_situation',
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_STATUSES = [
  'submitted',
  'under_review',
  'assigned',
  'action_started',
  'resolved',
  'invalid',
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_PRIORITIES = ['low', 'medium', 'high'] as const;
export type ReportPriority = (typeof REPORT_PRIORITIES)[number];

// ----------------------------------------------------------------------------
// TypeScript Interface
// ----------------------------------------------------------------------------

export interface IAiDetection {
  label: string;
  confidence: number; // 0.0 – 1.0
}

export interface IAiValidation {
  isValid: boolean;
  confidence: number; // 0.0 – 1.0
  reason: string;
}

export interface IReport extends Document {
  userId: Types.ObjectId;
  category: ReportCategory;
  description?: string;
  imageURL: string;
  latitude: number;
  longitude: number;
  /** ISO timestamp of when the citizen captured the report (device time) */
  timestamp: Date;
  status: ReportStatus;
  assignedDepartment?: string;
  priority?: ReportPriority;
  assignedAdminId?: Types.ObjectId;
  resolutionImage?: string;
  resolutionNotes?: string;
  /**
   * Optional AI-assisted label surfaced from the image at upload time.
   * Confidence is a float in [0, 1].
   */
  aiDetection?: IAiDetection;
  aiValidation?: IAiValidation;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------------------------------------------------------------
// Schema
// ----------------------------------------------------------------------------

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: REPORT_CATEGORIES, required: true },
    description: { type: String, trim: true },
    imageURL: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: 'submitted',
    },
    assignedDepartment: { type: String, trim: true },
    priority: { type: String, enum: REPORT_PRIORITIES },
    assignedAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionImage: { type: String },
    resolutionNotes: { type: String, trim: true },
    aiDetection: {
      label: { type: String },
      confidence: { type: Number, min: 0, max: 1 },
    },
    aiValidation: {
      isValid: { type: Boolean, default: true },
      confidence: { type: Number, min: 0, max: 1 },
      reason: { type: String },
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// ----------------------------------------------------------------------------
// Indexes
// NOTE: For real geospatial queries, migrate {latitude, longitude} to a GeoJSON
// Point field and add a 2dsphere index. The current flat-field approach supports
// bounding-box queries but not native $near / $geoWithin operators.
// ----------------------------------------------------------------------------

ReportSchema.index({ status: 1 });
ReportSchema.index({ category: 1 });
// Compound index to support map queries filtered by both location proximity and status
ReportSchema.index({ latitude: 1, longitude: 1 });
// Speed up fetching a citizen's own reports
ReportSchema.index({ userId: 1, createdAt: -1 });
// Admin dashboard — all reports sorted by recency
ReportSchema.index({ createdAt: -1 });

export default model<IReport>('Report', ReportSchema);
