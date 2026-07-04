import { Schema, model, Document } from 'mongoose';

// ----------------------------------------------------------------------------
// TypeScript Interface
// ----------------------------------------------------------------------------

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  role: 'citizen' | 'admin';
  verificationStatus: 'pending' | 'verified';
  firebaseUid?: string;
  /** For admin users: the department they belong to, e.g. "Municipal Sanitation" */
  department?: string;
  /** FCM registration token for push notifications — updated on each login (not in original spec; added to support notification service) */
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------------------------------------------------------------
// Schema
// ----------------------------------------------------------------------------

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    role: {
      type: String,
      enum: ['citizen', 'admin'] as const,
      default: 'citizen',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified'] as const,
      default: 'pending',
    },
    /**
     * sparse: true allows multiple documents to omit this field (null/undefined)
     * without violating the unique constraint — citizens won't have a firebaseUid
     * until they complete phone OTP verification.
     */
    firebaseUid: { type: String, unique: true, sparse: true },
    department: { type: String, trim: true },
    fcmToken: { type: String },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

export default model<IUser>('User', UserSchema);
