import { Schema, model, Document, Types } from 'mongoose';
import { REPORT_STATUSES, ReportStatus } from './Report.model';

// ----------------------------------------------------------------------------
// TypeScript Interface
// ----------------------------------------------------------------------------

export interface IStatusHistory extends Document {
  reportId: Types.ObjectId;
  status: ReportStatus;
  changedBy: Types.ObjectId;
  remarks?: string;
  changedAt: Date;
}

// ----------------------------------------------------------------------------
// Schema
// ----------------------------------------------------------------------------

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    /** Mirrors Report.status enum — imported to keep a single source of truth. */
    status: { type: String, enum: REPORT_STATUSES, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    remarks: { type: String, trim: true },
    changedAt: { type: Date, default: Date.now },
  },
  {
    // No automatic timestamps here — changedAt is the explicit timestamp.
    // _id is kept (default) so individual history entries are addressable.
    timestamps: false,
  }
);

// Speed up timeline queries (all history for a single report, chronologically)
StatusHistorySchema.index({ reportId: 1, changedAt: 1 });

export default model<IStatusHistory>('StatusHistory', StatusHistorySchema);
