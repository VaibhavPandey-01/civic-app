import { Schema, model, Document, Types } from 'mongoose';

// ----------------------------------------------------------------------------
// TypeScript Interface
// ----------------------------------------------------------------------------

export interface IFeedback extends Document {
  reportId: Types.ObjectId;
  userId: Types.ObjectId;
  /** Integer rating 1 (poor) to 5 (excellent) */
  rating: number;
  comment?: string;
  createdAt: Date;
}

// ----------------------------------------------------------------------------
// Schema
// ----------------------------------------------------------------------------

const FeedbackSchema = new Schema<IFeedback>(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        // Ensure only whole-number ratings (no 3.7 stars)
        validator: (v: number) => Number.isInteger(v),
        message: 'Rating must be an integer between 1 and 5.',
      },
    },
    comment: { type: String, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false, // createdAt is managed explicitly above
  }
);

/**
 * One citizen can only leave one piece of feedback per resolved report.
 * The unique compound index enforces this at the database level.
 */
FeedbackSchema.index({ reportId: 1, userId: 1 }, { unique: true });

export default model<IFeedback>('Feedback', FeedbackSchema);
