# CivicSafe - Complete Source Code & Explanations Book
This document automatically compiles all functional source code files from both the backend server and React Native mobile application, along with structural explanations.

---

## File: backend\src\app.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Project configuration component file

**Detailed Functionality:**
> This is a setup configuration file containing metadata and settings parameters required by the project to build, compile, and run correctly in different environments.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the app.ts layer.

### Source Code:
```typescript
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// Logging Middleware
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes Mounted under /api
app.use('/api', routes);

// 404 Not Found Handler
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    errors: null,
  });
});

// Global Error Handler Middleware (must be registered last)
app.use(errorHandler);

export default app;

```

---

## File: backend\src\config\cloudinary.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Configuration setup file for the backend server

**Detailed Functionality:**
> We created this file to setup all the configurations of our backend server in one place. It reads sensitive information from our hidden .env file (like the MongoDB connection string, email passwords, and Firebase keys) using dotenv. This is very important because we should not hardcode passwords directly in our code files for security reasons.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the cloudinary.ts layer.

### Source Code:
```typescript
import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { logger } from '../utils/logger';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

logger.info('Cloudinary configured');

export { cloudinary };

```

---

## File: backend\src\config\db.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Configuration setup file for the backend server

**Detailed Functionality:**
> We created this file to setup all the configurations of our backend server in one place. It reads sensitive information from our hidden .env file (like the MongoDB connection string, email passwords, and Firebase keys) using dotenv. This is very important because we should not hardcode passwords directly in our code files for security reasons.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the db.ts layer.

### Source Code:
```typescript
import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Connects to MongoDB using the URI from env config.
 * Logs success or exits the process on failure — a failed DB connection
 * means the server is non-functional, so we crash-fast rather than limp along.
 */
export const connectDB = async (): Promise<void> => {
  try {
    // Set public DNS servers to resolve MongoDB SRV hostnames reliably on Windows / local network configurations
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (dnsError) {
      logger.warn('Failed to set public DNS servers, connecting with system default resolver', { dnsError });
    }

    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    process.exit(1);
  }
};

```

---

## File: backend\src\config\env.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Configuration setup file for the backend server

**Detailed Functionality:**
> We created this file to setup all the configurations of our backend server in one place. It reads sensitive information from our hidden .env file (like the MongoDB connection string, email passwords, and Firebase keys) using dotenv. This is very important because we should not hardcode passwords directly in our code files for security reasons.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the env.ts layer.

### Source Code:
```typescript
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (one level above src/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ---------------------------------------------------------------------------
// Helper — throws if a required variable is missing *and* we're in production.
// In development it returns the fallback (or empty string) so the app can
// still start for local iteration without every secret present.
// ---------------------------------------------------------------------------

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? '';
}

// ---------------------------------------------------------------------------
// Exported typed env object — every backend file imports from here,
// never reads process.env directly.
// ---------------------------------------------------------------------------

export const env = {
  PORT: parseInt(required('PORT', '3000'), 10),
  NODE_ENV: required('NODE_ENV', 'development'),
  MONGO_URI: required('MONGO_URI', 'mongodb://localhost:27017/ocean-preventions'),

  // Firebase Admin SDK
  FIREBASE_PROJECT_ID: required('FIREBASE_PROJECT_ID'),
  FIREBASE_CLIENT_EMAIL: required('FIREBASE_CLIENT_EMAIL'),
  FIREBASE_PRIVATE_KEY: required('FIREBASE_PRIVATE_KEY'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: required('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: required('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: required('CLOUDINARY_API_SECRET'),

  // JWT
  JWT_SECRET: required('JWT_SECRET', 'dev-secret-change-me'),
  JWT_EXPIRES_IN: required('JWT_EXPIRES_IN', '7d'),

  // Admin invite
  ADMIN_INVITE_CODE: required('ADMIN_INVITE_CODE', 'DEV_INVITE'),

  // CORS
  CORS_ORIGIN: required('CORS_ORIGIN', '*'),

  // SMTP Mail Config
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'CivicSafe <no-reply@civicsafe.com>',

  // Gemini AI SDK
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
} as const;

```

---

## File: backend\src\config\firebase.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Configuration setup file for the backend server

**Detailed Functionality:**
> We created this file to setup all the configurations of our backend server in one place. It reads sensitive information from our hidden .env file (like the MongoDB connection string, email passwords, and Firebase keys) using dotenv. This is very important because we should not hardcode passwords directly in our code files for security reasons.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the firebase.ts layer.

### Source Code:
```typescript
import * as admin from 'firebase-admin';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Firebase Admin initialisation.
 *
 * We build the ServiceAccount credential from individual env vars rather than
 * requiring a JSON key-file on disk.
 * Wrap in try/catch to warn the user about placeholder keys instead of crashing.
 */
let isFirebaseInitialized = false;

if (!admin.apps.length) {
  try {
    const isPlaceholder = 
      !env.FIREBASE_PRIVATE_KEY || 
      env.FIREBASE_PRIVATE_KEY.includes('your_firebase_private_key');

    if (isPlaceholder) {
      logger.warn(
        'Firebase Private Key contains a placeholder or is empty. Phone OTP authentication checks will fail. Update your .env credentials to proceed.'
      );
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          // .env stores the key with escaped newlines → convert to real newlines
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      isFirebaseInitialized = true;
      logger.info('Firebase Admin SDK initialised successfully');
    }
  } catch (error) {
    logger.warn('Failed to initialize Firebase Admin SDK. Verification features will be offline.', { error });
  }
} else {
  isFirebaseInitialized = true;
}

/** Firebase Auth instance — used to verify phone OTP tokens from the mobile client */
export const firebaseAuth = isFirebaseInitialized ? admin.auth() : null;

/** Firebase Messaging instance — used to send push notifications via FCM */
export const firebaseMessaging = isFirebaseInitialized ? admin.messaging() : null;
export { isFirebaseInitialized };

```

---

## File: backend\src\controllers\admin.controller.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Controller]` `[Business Logic]` `[Admin Panel]` `[Management]`

**Architecture Role:**
> Backend controller file (handles request and response)

**Detailed Functionality:**
> This file is a controller which is responsible for handling all the requests sent by the mobile app. For example, when a citizen submits a report or logs in, this controller receives that data, checks if it is correct, does the processing, and saves it into MongoDB. After doing this, it sends a response back to the app (like a success message or an error message). We use try-catch blocks here so that if something goes wrong, the server does not crash and we can show a clean error message.

**Core Logic:**
> Specifically, this file implements features for the admin authority panel. It allows municipal officers to fetch reports, view analytical summaries, and coordinate resolution tasks.

### Source Code:
```typescript
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

```

---

## File: backend\src\controllers\auth.controller.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Controller]` `[Business Logic]` `[Authentication]` `[Security]` `[Login]`

**Architecture Role:**
> Backend controller file (handles request and response)

**Detailed Functionality:**
> This file is a controller which is responsible for handling all the requests sent by the mobile app. For example, when a citizen submits a report or logs in, this controller receives that data, checks if it is correct, does the processing, and saves it into MongoDB. After doing this, it sends a response back to the app (like a success message or an error message). We use try-catch blocks here so that if something goes wrong, the server does not crash and we can show a clean error message.

**Core Logic:**
> Specifically, this file is responsible for the authentication system. It writes code to register new users, verify their credentials, and maintain secure logged-in sessions using JWT tokens.

### Source Code:
```typescript
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { firebaseAuth } from '../config/firebase';
import { env } from '../config/env';
import User from '../models/User.model';
import OTP from '../models/OTP.model';
import { sendOTPEmail } from '../services/email.service';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { registerSchema, loginSchema } from '../utils/validators';
import { logger } from '../utils/logger';
import { JwtPayload } from '../types/jwt';

// ---------------------------------------------------------------------------
// Helper — sign a backend JWT from a User document
// ---------------------------------------------------------------------------

const signToken = (id: string, role: 'citizen' | 'admin'): string => {
  const payload: JwtPayload = { id, role };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------

/**
 * Flow:
 *  1. Verify Firebase ID token (issued by phone OTP on the client).
 *  2. If role='admin', validate ADMIN_INVITE_CODE.
 *  3. Upsert User by firebaseUid (handles first-time + re-registration).
 *  4. Issue backend JWT and return user + token.
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation failed', 400, parsed.error.flatten());
    return;
  }

  const { idToken, name, phone, role, inviteCode, fcmToken } = parsed.data;

  // Admin registration requires a backend-validated invite code
  if (role === 'admin') {
    if (!inviteCode || inviteCode !== env.ADMIN_INVITE_CODE) {
      sendError(res, 'Invalid admin invite code', 403);
      return;
    }
  }

  let firebaseUid: string;
  if (!firebaseAuth) {
    const decodedToken = jwt.decode(idToken) as any;
    if (decodedToken && (decodedToken.sub || decodedToken.user_id)) {
      firebaseUid = decodedToken.sub || decodedToken.user_id;
    } else if (env.NODE_ENV === 'development') {
      firebaseUid = `mock-uid-${phone.replace(/[^0-9]/g, '')}`;
    } else {
      sendError(res, 'Firebase Authentication is not configured on the server.', 500);
      return;
    }
  } else {
    try {
      const decoded = await firebaseAuth.verifyIdToken(idToken);
      firebaseUid = decoded.uid;
    } catch (err) {
      logger.error('Firebase token verification failed', { err });
      sendError(res, 'Invalid or expired Firebase token', 401);
      return;
    }
  }

  // Upsert — allows re-registration without duplicate errors
  const user = await User.findOneAndUpdate(
    { firebaseUid },
    {
      $set: {
        name,
        phone,
        role,
        firebaseUid,
        verificationStatus: 'verified',
        ...(fcmToken ? { fcmToken } : {}),
      },
      $setOnInsert: { /* createdAt is handled by timestamps */ },
    },
    { upsert: true, new: true, runValidators: true }
  );

  const token = signToken(user._id.toString(), user.role);
  sendSuccess(res, { user, token }, 'Registration successful', 201);
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

/**
 * Verifies the Firebase ID token, looks up the User by firebaseUid,
 * optionally refreshes the FCM token, and issues a fresh backend JWT.
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation failed', 400, parsed.error.flatten());
    return;
  }

  const { idToken, fcmToken } = parsed.data;

  let firebaseUid: string;
  if (!firebaseAuth) {
    const decodedToken = jwt.decode(idToken) as any;
    if (decodedToken && (decodedToken.sub || decodedToken.user_id)) {
      firebaseUid = decodedToken.sub || decodedToken.user_id;
    } else if (env.NODE_ENV === 'development') {
      // In local dev without Firebase, accept mock-jwt-token values passed by frontend stubs
      if (idToken.includes('admin')) {
        firebaseUid = 'mock-uid-admin';
      } else {
        firebaseUid = 'mock-uid-citizen';
      }
    } else {
      sendError(res, 'Firebase Authentication is not configured on the server.', 500);
      return;
    }
  } else {
    try {
      const decoded = await firebaseAuth.verifyIdToken(idToken);
      firebaseUid = decoded.uid;
    } catch (err) {
      logger.error('Firebase token verification failed', { err });
      sendError(res, 'Invalid or expired Firebase token', 401);
      return;
    }
  }

  const user = await User.findOne({ firebaseUid });
  if (!user) {
    sendError(res, 'User not found. Please register first.', 404);
    return;
  }

  // Refresh FCM token if the client sends an updated one
  if (fcmToken && fcmToken !== user.fcmToken) {
    user.fcmToken = fcmToken;
    await user.save();
  }

  const token = signToken(user._id.toString(), user.role);
  sendSuccess(res, { user, token }, 'Login successful');
});

// ---------------------------------------------------------------------------
// GET /api/auth/me    (auth-protected)
// ---------------------------------------------------------------------------

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // req.user is set by authMiddleware
  const user = await User.findById(req.user!.id).select('-fcmToken');
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }
  sendSuccess(res, { user });
});

// ---------------------------------------------------------------------------
// PATCH /api/auth/me/push-token    (auth-protected)
// ---------------------------------------------------------------------------

export const updatePushToken = asyncHandler(async (req: Request, res: Response) => {
  const { fcmToken } = req.body;
  if (!fcmToken) {
    sendError(res, 'fcmToken is required', 400);
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { fcmToken },
    { new: true }
  );

  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  sendSuccess(res, null, 'Push token updated successfully');
});

export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    sendError(res, 'A valid email address is required', 400);
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await OTP.findOneAndUpdate(
    { email: email.toLowerCase() },
    { otp, expiresAt },
    { upsert: true, new: true }
  );

  await sendOTPEmail(email.toLowerCase(), otp);

  sendSuccess(res, null, 'OTP sent successfully to your email');
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    sendError(res, 'Email and OTP are required', 400);
    return;
  }

  const record = await OTP.findOne({
    email: email.toLowerCase(),
    otp: otp.toString().trim(),
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    sendError(res, 'Incorrect or expired OTP. Please request a new one.', 400);
    return;
  }

  await OTP.deleteOne({ _id: record._id });

  sendSuccess(res, null, 'Email verified successfully!');
});


```

---

## File: backend\src\controllers\feedback.controller.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Controller]` `[Business Logic]`

**Architecture Role:**
> Backend controller file (handles request and response)

**Detailed Functionality:**
> This file is a controller which is responsible for handling all the requests sent by the mobile app. For example, when a citizen submits a report or logs in, this controller receives that data, checks if it is correct, does the processing, and saves it into MongoDB. After doing this, it sends a response back to the app (like a success message or an error message). We use try-catch blocks here so that if something goes wrong, the server does not crash and we can show a clean error message.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the feedback.controller.ts layer.

### Source Code:
```typescript
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

```

---

## File: backend\src\controllers\report.controller.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Controller]` `[Business Logic]` `[Issue Reporting]` `[Data Flow]`

**Architecture Role:**
> Backend controller file (handles request and response)

**Detailed Functionality:**
> This file is a controller which is responsible for handling all the requests sent by the mobile app. For example, when a citizen submits a report or logs in, this controller receives that data, checks if it is correct, does the processing, and saves it into MongoDB. After doing this, it sends a response back to the app (like a success message or an error message). We use try-catch blocks here so that if something goes wrong, the server does not crash and we can show a clean error message.

**Core Logic:**
> Specifically, this file manages the user reports. It handles report submissions, image uploads, GPS coordinates tagging (latitude/longitude), and status progress timeline updates.

### Source Code:
```typescript
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

```

---

## File: backend\src\middleware\authMiddleware.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Authentication]` `[Security]` `[Login]`

**Architecture Role:**
> Backend middleware file (acts like a security guard)

**Detailed Functionality:**
> This is a middleware file which acts like a security guard for our server. Before any request goes to the controllers (like fetching admin reports), it goes through this file. This file checks if the user is logged in by verifying their token. If the token is invalid or missing, it blocks them and says they cannot access the data. This helps in keeping our application secure so that unauthorized users cannot change or view private data.

**Core Logic:**
> Specifically, this file is responsible for the authentication system. It writes code to register new users, verify their credentials, and maintain secure logged-in sessions using JWT tokens.

### Source Code:
```typescript

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/jwt';

/**
 * Verifies the JWT from the `Authorization: Bearer <token>` header.
 *
 * On success → attaches `req.user = { id, role }` and calls next().
 * On failure → responds with 401 and a machine-readable message.
 *
 * NOTE: This middleware does NOT check roles — use `requireRole()` from
 * roleMiddleware.ts for that.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required — no token provided',
    });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

```

---

## File: backend\src\middleware\errorHandler.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Backend middleware file (acts like a security guard)

**Detailed Functionality:**
> This is a middleware file which acts like a security guard for our server. Before any request goes to the controllers (like fetching admin reports), it goes through this file. This file checks if the user is logged in by verifying their token. If the token is invalid or missing, it blocks them and says they cannot access the data. This helps in keeping our application secure so that unauthorized users cannot change or view private data.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the errorHandler.ts layer.

### Source Code:
```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Global Express error-handling middleware.
 *
 * Must be registered LAST in the middleware chain (after all routes).
 * Express identifies error handlers by their 4-parameter signature.
 */
export const errorHandler = (
  err: Error & { status?: number; errors?: unknown },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.status ?? 500;

  logger.error(err.message, {
    stack: err.stack,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    errors: err.errors ?? null,
  });
};

```

---

## File: backend\src\middleware\roleMiddleware.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Backend middleware file (acts like a security guard)

**Detailed Functionality:**
> This is a middleware file which acts like a security guard for our server. Before any request goes to the controllers (like fetching admin reports), it goes through this file. This file checks if the user is logged in by verifying their token. If the token is invalid or missing, it blocks them and says they cannot access the data. This helps in keeping our application secure so that unauthorized users cannot change or view private data.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the roleMiddleware.ts layer.

### Source Code:
```typescript
import { Request, Response, NextFunction } from 'express';

/**
 * Higher-order middleware factory that restricts access to a specific role.
 *
 * Usage in a route definition:
 *   router.get('/admin-only', authMiddleware, requireRole('admin'), handler);
 *
 * Must be placed AFTER `authMiddleware` in the middleware chain — it reads
 * `req.user.role` which is set by the auth layer.
 */
export const requireRole = (...allowedRoles: Array<'citizen' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden — requires one of: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

```

---

## File: backend\src\middleware\uploadMiddleware.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Backend middleware file (acts like a security guard)

**Detailed Functionality:**
> This is a middleware file which acts like a security guard for our server. Before any request goes to the controllers (like fetching admin reports), it goes through this file. This file checks if the user is logged in by verifying their token. If the token is invalid or missing, it blocks them and says they cannot access the data. This helps in keeping our application secure so that unauthorized users cannot change or view private data.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the uploadMiddleware.ts layer.

### Source Code:
```typescript
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Multer instance using in-memory storage.
 *
 * Memory storage keeps the file buffer in RAM — suitable for small images
 * that are immediately streamed to Cloudinary (never written to disk).
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${ALLOWED_MIMETYPES.join(', ')}`));
    }
  },
});

/** Single image upload — field name "image" */
export const uploadSingle = upload.single('image');

```

---

## File: backend\src\models\Feedback.model.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Database]` `[Mongoose Schema]`

**Architecture Role:**
> Database model schema file (defines collection structure in MongoDB)

**Detailed Functionality:**
> This is the model file where we define the structure of our database collections using Mongoose. Since we are using MongoDB, we need to specify what fields a document must have. For example, a User model must have name, phone number, and role, while a Report must have category, image, and GPS coordinates. We also define the data types (like String, Number, or Date) so that no wrong data gets saved in the database by mistake.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the Feedback.model.ts layer.

### Source Code:
```typescript
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

```

---

## File: backend\src\models\OTP.model.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Database]` `[Mongoose Schema]`

**Architecture Role:**
> Database model schema file (defines collection structure in MongoDB)

**Detailed Functionality:**
> This is the model file where we define the structure of our database collections using Mongoose. Since we are using MongoDB, we need to specify what fields a document must have. For example, a User model must have name, phone number, and role, while a Report must have category, image, and GPS coordinates. We also define the data types (like String, Number, or Date) so that no wrong data gets saved in the database by mistake.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the OTP.model.ts layer.

### Source Code:
```typescript
import { Schema, model, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default model<IOTP>('OTP', OTPSchema);

```

---

## File: backend\src\models\Report.model.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Database]` `[Mongoose Schema]` `[Issue Reporting]` `[Data Flow]`

**Architecture Role:**
> Database model schema file (defines collection structure in MongoDB)

**Detailed Functionality:**
> This is the model file where we define the structure of our database collections using Mongoose. Since we are using MongoDB, we need to specify what fields a document must have. For example, a User model must have name, phone number, and role, while a Report must have category, image, and GPS coordinates. We also define the data types (like String, Number, or Date) so that no wrong data gets saved in the database by mistake.

**Core Logic:**
> Specifically, this file manages the user reports. It handles report submissions, image uploads, GPS coordinates tagging (latitude/longitude), and status progress timeline updates.

### Source Code:
```typescript
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

```

---

## File: backend\src\models\StatusHistory.model.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Database]` `[Mongoose Schema]`

**Architecture Role:**
> Database model schema file (defines collection structure in MongoDB)

**Detailed Functionality:**
> This is the model file where we define the structure of our database collections using Mongoose. Since we are using MongoDB, we need to specify what fields a document must have. For example, a User model must have name, phone number, and role, while a Report must have category, image, and GPS coordinates. We also define the data types (like String, Number, or Date) so that no wrong data gets saved in the database by mistake.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the StatusHistory.model.ts layer.

### Source Code:
```typescript
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

```

---

## File: backend\src\models\User.model.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Database]` `[Mongoose Schema]`

**Architecture Role:**
> Database model schema file (defines collection structure in MongoDB)

**Detailed Functionality:**
> This is the model file where we define the structure of our database collections using Mongoose. Since we are using MongoDB, we need to specify what fields a document must have. For example, a User model must have name, phone number, and role, while a Report must have category, image, and GPS coordinates. We also define the data types (like String, Number, or Date) so that no wrong data gets saved in the database by mistake.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the User.model.ts layer.

### Source Code:
```typescript
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

```

---

## File: backend\src\routes\admin.routes.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[API Route]` `[Endpoints]` `[Admin Panel]` `[Management]`

**Architecture Role:**
> Backend route mapper file (links URLs to code)

**Detailed Functionality:**
> This file is used to map specific website URLs (endpoints like /login or /reports) to their respective controller functions. When the mobile app hits a URL, this file tells the Express server which function to execute. We also add our middleware guards here to protect specific routes so that only authorized users can open them.

**Core Logic:**
> Specifically, this file implements features for the admin authority panel. It allows municipal officers to fetch reports, view analytical summaries, and coordinate resolution tasks.

### Source Code:
```typescript
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

```

---

## File: backend\src\routes\auth.routes.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[API Route]` `[Endpoints]` `[Authentication]` `[Security]` `[Login]`

**Architecture Role:**
> Backend route mapper file (links URLs to code)

**Detailed Functionality:**
> This file is used to map specific website URLs (endpoints like /login or /reports) to their respective controller functions. When the mobile app hits a URL, this file tells the Express server which function to execute. We also add our middleware guards here to protect specific routes so that only authorized users can open them.

**Core Logic:**
> Specifically, this file is responsible for the authentication system. It writes code to register new users, verify their credentials, and maintain secure logged-in sessions using JWT tokens.

### Source Code:
```typescript
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, getMe, updatePushToken, sendOTP, verifyOTP } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rate limiter: max 10 auth requests (registration, login) per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    errors: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', authMiddleware, getMe);
router.patch('/me/push-token', authMiddleware, updatePushToken);

export default router;

```

---

## File: backend\src\routes\feedback.routes.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[API Route]` `[Endpoints]`

**Architecture Role:**
> Backend route mapper file (links URLs to code)

**Detailed Functionality:**
> This file is used to map specific website URLs (endpoints like /login or /reports) to their respective controller functions. When the mobile app hits a URL, this file tells the Express server which function to execute. We also add our middleware guards here to protect specific routes so that only authorized users can open them.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the feedback.routes.ts layer.

### Source Code:
```typescript
import { Router } from 'express';
import { submitFeedback } from '../controllers/feedback.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.post('/', authMiddleware, requireRole('citizen'), submitFeedback);

export default router;

```

---

## File: backend\src\routes\index.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[API Route]` `[Endpoints]`

**Architecture Role:**
> Backend route mapper file (links URLs to code)

**Detailed Functionality:**
> This file is used to map specific website URLs (endpoints like /login or /reports) to their respective controller functions. When the mobile app hits a URL, this file tells the Express server which function to execute. We also add our middleware guards here to protect specific routes so that only authorized users can open them.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the index.ts layer.

### Source Code:
```typescript
import { Router, Request, Response } from 'express';
import authRouter from './auth.routes';
import reportRouter from './report.routes';
import adminRouter from './admin.routes';
import feedbackRouter from './feedback.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/reports', reportRouter);
router.use('/admin', adminRouter);
router.use('/feedback', feedbackRouter);

// Health check endpoint returned at /api/health
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
  });
});

export default router;

```

---

## File: backend\src\routes\report.routes.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[API Route]` `[Endpoints]` `[Issue Reporting]` `[Data Flow]`

**Architecture Role:**
> Backend route mapper file (links URLs to code)

**Detailed Functionality:**
> This file is used to map specific website URLs (endpoints like /login or /reports) to their respective controller functions. When the mobile app hits a URL, this file tells the Express server which function to execute. We also add our middleware guards here to protect specific routes so that only authorized users can open them.

**Core Logic:**
> Specifically, this file manages the user reports. It handles report submissions, image uploads, GPS coordinates tagging (latitude/longitude), and status progress timeline updates.

### Source Code:
```typescript
import { Router } from 'express';
import { createReport, getUserReports, getReportById } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { uploadSingle } from '../middleware/uploadMiddleware';

const router = Router();

// Protect all report routes under auth
router.use(authMiddleware);

// Citizen only reporting, accepts multipart image with name "image"
router.post('/', requireRole('citizen'), uploadSingle, createReport);

// Citizen fetching their own reports (note: route matches user/:id as specified)
router.get('/user/:id', getUserReports);

// Get single report details (ownership checked inside controller)
router.get('/:id', getReportById);

export default router;

```

---

## File: backend\src\services\aiService.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Service]` `[Integration]` `[AI Model]` `[Gemini API]`

**Architecture Role:**
> Backend service integration file (connects external APIs)

**Detailed Functionality:**
> We use this file to write code that connects our backend server to external third-party services. This includes uploading images to Cloudinary, calling the Google Gemini AI for smart checks, or sending emails. By putting this logic in a service file, our main controller code stays neat and simple, and we can easily reuse these functions in different parts of the project.

**Core Logic:**
> Specifically, this file connects our app to the Google Gemini AI. We write detailed prompts instructing the AI how to check if photos are valid (detecting fake images/selfies) or verifying if resolution photos match the original incident landmarks to prevent cheating.

### Source Code:
```typescript
import { logger } from '../utils/logger';
import { validateReportWithGemini } from './geminiService';

export interface AiAnalysisResult {
  aiDetection: {
    label: string;
    confidence: number;
  };
  aiValidation: {
    isValid: boolean;
    confidence: number;
    reason: string;
    reasonHindi: string;
  };
}

/**
 * Analyses a report image via Gemini to return a predicted label,
 * validation flag, and confidence score.
 *
 * @param imageUrl - Public URL of the uploaded image (Cloudinary)
 * @param category - Category reported by the user
 * @param description - Description typed by the user
 */
export const analyzeImage = async (
  imageUrl: string,
  category: string,
  description: string
): Promise<AiAnalysisResult> => {
  logger.info('AI analysis requested via Gemini', { imageUrl, category });

  // Execute Gemini validation
  const validation = await validateReportWithGemini(imageUrl, category, description);

  const result: AiAnalysisResult = {
    aiDetection: {
      label: validation.isValid ? category : 'clean_area',
      confidence: validation.confidence,
    },
    aiValidation: {
      isValid: validation.isValid,
      confidence: validation.confidence,
      reason: validation.reason,
      reasonHindi: validation.reasonHindi,
    },
  };

  logger.info('AI analysis completed successfully', result);
  return result;
};

```

---

## File: backend\src\services\email.service.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Service]` `[Integration]` `[AI Model]` `[Gemini API]`

**Architecture Role:**
> Backend service integration file (connects external APIs)

**Detailed Functionality:**
> We use this file to write code that connects our backend server to external third-party services. This includes uploading images to Cloudinary, calling the Google Gemini AI for smart checks, or sending emails. By putting this logic in a service file, our main controller code stays neat and simple, and we can easily reuse these functions in different parts of the project.

**Core Logic:**
> Specifically, this file connects our app to the Google Gemini AI. We write detailed prompts instructing the AI how to check if photos are valid (detecting fake images/selfies) or verifying if resolution photos match the original incident landmarks to prevent cheating.

### Source Code:
```typescript
import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  logger.info('SMTP transporter configured successfully');
} else {
  logger.info('SMTP credentials missing. Email service will run in MOCK mode (printing codes to console).');
}

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: env.SMTP_FROM,
    to: email,
    subject: 'CivicSafe - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2563eb; margin: 0; font-size: 24px;">CivicSafe Verification</h2>
          <p style="color: #6b7280; font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Secure & Clean Incident Tracker</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6;">
          <p style="font-size: 16px; color: #1f2937; margin-top: 0;">Hello,</p>
          <p style="font-size: 15px; color: #4b5563; line-height: 22px;">Thank you for registering with CivicSafe. To verify your email address, please use the 6-digit One-Time Password (OTP) code below:</p>
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 6px; padding: 12px 30px; background-color: #eff6ff; border: 1.5px dashed #3b82f6; border-radius: 8px;">
              ${otp}
            </div>
          </div>
          <p style="font-size: 13px; color: #9ca3af; margin-bottom: 0;">This OTP code is valid for 5 minutes and can only be used once.</p>
        </div>
      </div>
    `,
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Verification OTP sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send verification email via SMTP', { error });
      throw new Error('Could not send verification email. Please try again later.');
    }
  } else {
    logger.info(`
============================================
[MOCK EMAIL SENT]
To: ${email}
Subject: CivicSafe - Email Verification OTP
OTP Code: ${otp}
============================================
    `);
  }
};

```

---

## File: backend\src\services\geminiService.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Service]` `[Integration]` `[AI Model]` `[Gemini API]`

**Architecture Role:**
> Backend service integration file (connects external APIs)

**Detailed Functionality:**
> We use this file to write code that connects our backend server to external third-party services. This includes uploading images to Cloudinary, calling the Google Gemini AI for smart checks, or sending emails. By putting this logic in a service file, our main controller code stays neat and simple, and we can easily reuse these functions in different parts of the project.

**Core Logic:**
> Specifically, this file connects our app to the Google Gemini AI. We write detailed prompts instructing the AI how to check if photos are valid (detecting fake images/selfies) or verifying if resolution photos match the original incident landmarks to prevent cheating.

### Source Code:
```typescript
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  reason: string;
  reasonHindi: string;
}

/**
 * Validates a user's report using Google Gemini 2.5 Flash.
 * Compares the image contents with the selected category and text description.
 *
 * @param imageUrl - Cloudinary public URL of the uploaded image
 * @param category - User selected report category
 * @param description - User typed description
 */
export const validateReportWithGemini = async (
  imageUrl: string,
  category: string,
  description: string
): Promise<ValidationResult> => {
  if (!env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY is not configured. Falling back to mock validation.');
    // Simulated mock validation success
    return {
      isValid: true,
      confidence: 0.95,
      reason: 'Mock validation passed (Gemini API key missing)',
      reasonHindi: 'मॉक सत्यापन सफल (जेमिनी एपीआई कुंजी गायब)',
    };
  }

  try {
    logger.info('Starting Gemini multimodal image validation...', { imageUrl });

    // 1. Download image from Cloudinary as binary buffer
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from Cloudinary: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    // 2. Prepare Gemini client
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 3. Construct prompt and parts
    const prompt = `You are a civic issue validator for the CivicSafe application.
Analyze this report image and user-provided metadata:
Category: ${category}
Description: ${description}

Task:
1. Analyze the image to detect if it shows a real civic/environmental issue or safety hazard (e.g. garbage dumps, plastic waste, water pollution, potholes, broken roads, overflowing sewers, or safety hazards).
2. Compare the image with the Category and Description. Determine if they match and represent an authentic report.
3. Check if the image is a selfie, screenshot, clean indoor living space, or a photo taken of a screen/monitor (suggesting location/image spoofing). If so, it is invalid.

You must return a valid JSON object matching this schema:
{
  "isValid": boolean, // true if image shows a real environmental/safety issue matching description & category. false if clean, selfie, spoof, or mismatch.
  "confidence": number, // float in [0.0, 1.0] representing validation confidence
  "reason": string, // Short description explaining your decision in English (keep under 15 words)
  "reasonHindi": string // Short description explaining your decision in Hindi (keep under 15 words)
}`;

    const imagePart: Part = {
      inlineData: {
        data: base64Data,
        mimeType: 'image/jpeg',
      },
    };

    // 4. Request validation
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            imagePart,
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.text();
    logger.info('Gemini validation response text:', { text });

    const parsed: ValidationResult = JSON.parse(text);
    return {
      isValid: typeof parsed.isValid === 'boolean' ? parsed.isValid : true,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
      reason: parsed.reason || 'Completed analysis',
      reasonHindi: parsed.reasonHindi || 'सत्यापन पूर्ण हुआ',
    };
  } catch (error) {
    logger.error('Error during Gemini report validation:', { error });
    // Default fallback to true to prevent blocking users on API downtime
    return {
      isValid: true,
      confidence: 0.5,
      reason: 'Validation bypassed due to system error',
      reasonHindi: 'सिस्टम त्रुटi के कारण सत्यापन को बायपास किया गया',
    };
  }
};

export interface ResolutionVerificationResult {
  isVerified: boolean;
  confidence: number;
  reason: string;
  reasonHindi: string;
}

/**
 * Compares the original incident image with the resolution image using Gemini.
 * Matches landmarks to verify same location and checks if incident is resolved.
 */
export const verifyResolutionWithGemini = async (
  originalImageUrl: string,
  resolutionImageUrl: string,
  category: string
): Promise<ResolutionVerificationResult> => {
  if (!env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY is not configured. Falling back to mock resolution verification.');
    return {
      isVerified: true,
      confidence: 0.95,
      reason: 'Mock verification passed (API key missing)',
      reasonHindi: 'मॉक सत्यापन सफल (एपीआई कुंजी गायब)',
    };
  }

  try {
    logger.info('Starting Gemini multimodal resolution verification...', { originalImageUrl, resolutionImageUrl });

    // 1. Fetch both images as binary data
    const [originalRes, resolutionRes] = await Promise.all([
      fetch(originalImageUrl),
      fetch(resolutionImageUrl),
    ]);

    if (!originalRes.ok || !resolutionRes.ok) {
      throw new Error(`Failed to fetch one or both images: A: ${originalRes.statusText}, B: ${resolutionRes.statusText}`);
    }

    const [origBuffer, resBuffer] = await Promise.all([
      originalRes.arrayBuffer(),
      resolutionRes.arrayBuffer(),
    ]);

    const origBase64 = Buffer.from(origBuffer).toString('base64');
    const resBase64 = Buffer.from(resBuffer).toString('base64');

    // 2. Prepare Gemini client
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 3. Construct prompt
    const prompt = `You are a civic issue resolution validator.
Analyze these two images:
Image A: The original reported incident (Category: ${category}).
Image B: The uploaded cleanup/resolution evidence.

Task:
1. Verify if Image B is taken in the same location as Image A by matching structural background features (e.g. buildings, walls, trees, street poles, floor patterns, or window frames). Note that the camera angles, zoom, and time of day will differ.
2. Verify if the incident reported in Image A (such as garbage piles, leaks, or potholes) has been successfully cleaned, resolved, or repaired in Image B.

You must return a valid JSON object matching this schema:
{
  "isVerified": boolean, // true if both images are in the same location AND the issue is cleaned/resolved. false if mismatched locations or the issue is still active.
  "confidence": number, // float in [0.0, 1.0] representing verification confidence
  "reason": string, // Short description of matching landmarks and cleanliness in English (under 15 words)
  "reasonHindi": string // Short description of matching landmarks and cleanliness in Hindi (under 15 words)
}`;

    const origPart: Part = {
      inlineData: {
        data: origBase64,
        mimeType: 'image/jpeg',
      },
    };

    const resPart: Part = {
      inlineData: {
        data: resBase64,
        mimeType: 'image/jpeg',
      },
    };

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            origPart,
            resPart,
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.text();
    logger.info('Gemini resolution verification response text:', { text });

    const parsed: ResolutionVerificationResult = JSON.parse(text);
    return {
      isVerified: typeof parsed.isVerified === 'boolean' ? parsed.isVerified : true,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
      reason: parsed.reason || 'Verification processed successfully',
      reasonHindi: parsed.reasonHindi || 'सत्यापन सफलतापूर्वक पूर्ण हुआ',
    };
  } catch (error) {
    logger.error('Error during Gemini resolution verification:', { error });
    throw error;
  }
};

```

---

## File: backend\src\services\imageUploadService.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Service]` `[Integration]`

**Architecture Role:**
> Backend service integration file (connects external APIs)

**Detailed Functionality:**
> We use this file to write code that connects our backend server to external third-party services. This includes uploading images to Cloudinary, calling the Google Gemini AI for smart checks, or sending emails. By putting this logic in a service file, our main controller code stays neat and simple, and we can easily reuse these functions in different parts of the project.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the imageUploadService.ts layer.

### Source Code:
```typescript
import { cloudinary } from '../config/cloudinary';
import { logger } from '../utils/logger';

/**
 * Uploads a raw Buffer to Cloudinary via upload_stream and returns the
 * secure URL of the hosted image.
 *
 * @param buffer  - The file buffer (from multer memoryStorage)
 * @param folder  - Cloudinary folder path, e.g. "ocean-preventions/reports"
 * @returns       - Secure HTTPS URL of the uploaded image
 */
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          logger.error('Cloudinary upload failed', { error });
          return reject(error ?? new Error('Cloudinary returned no result'));
        }
        logger.info('Cloudinary upload success', { url: result.secure_url });
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary using its secure URL.
 *
 * @param imageUrl - Secure HTTPS URL of the hosted image
 */
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    const parts = imageUrl.split('/image/upload/');
    if (parts.length < 2) return;

    // Skip version (e.g. "v1783595070") to get folder + filename
    const remaining = parts[1];
    const subparts = remaining.split('/');
    if (subparts.length < 2) return;

    const fullPath = subparts.slice(1).join('/');
    const publicId = fullPath.substring(0, fullPath.lastIndexOf('.'));

    logger.info('Deleting invalid/rejected report image from Cloudinary...', { publicId });
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.warn('Failed to delete image from Cloudinary (non-blocking)', { error });
  }
};

```

---

## File: backend\src\services\notificationService.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Service]` `[Integration]` `[Push Notifications]` `[Alerts]`

**Architecture Role:**
> Backend service integration file (connects external APIs)

**Detailed Functionality:**
> We use this file to write code that connects our backend server to external third-party services. This includes uploading images to Cloudinary, calling the Google Gemini AI for smart checks, or sending emails. By putting this logic in a service file, our main controller code stays neat and simple, and we can easily reuse these functions in different parts of the project.

**Core Logic:**
> Specifically, this file implements push notifications using Expo Notifications. It registers the device token with the server and triggers real-time popup alerts whenever a report status changes.

### Source Code:
```typescript
import { logger } from '../utils/logger';

/**
 * Sends a push notification to a single device via Expo Push Notifications.
 *
 * @param expoPushToken - The recipient's Expo push token
 * @param title         - Notification title (shown in the system tray)
 * @param body          - Notification body text
 * @param data          - Optional key-value payload for in-app handling
 */
export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) {
    logger.warn('Push notification skipped — Invalid Expo Push Token.');
    return;
  }
  
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        title,
        body,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Expo Push API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    logger.info('Push notification sent', { response: responseData, expoPushToken: expoPushToken.slice(0, 30) + '…' });
  } catch (error) {
    logger.error('Push notification failed', { error, expoPushToken: expoPushToken.slice(0, 30) + '…' });
  }
};

```

---

## File: backend\src\services\routingService.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]` `[Service]` `[Integration]`

**Architecture Role:**
> Backend service integration file (connects external APIs)

**Detailed Functionality:**
> We use this file to write code that connects our backend server to external third-party services. This includes uploading images to Cloudinary, calling the Google Gemini AI for smart checks, or sending emails. By putting this logic in a service file, our main controller code stays neat and simple, and we can easily reuse these functions in different parts of the project.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the routingService.ts layer.

### Source Code:
```typescript
import { ReportCategory, ReportPriority } from '../models/Report.model';

// ---------------------------------------------------------------------------
// Department Routing
// ---------------------------------------------------------------------------

/**
 * Maps a report category to the responsible government department.
 *
 * Garbage/pollution categories → Municipal Sanitation
 * Suspicious/emergency categories → Police/Emergency
 */
export const resolveDepartment = (category: ReportCategory): string => {
  switch (category) {
    case 'garbage_dump':
    case 'plastic_pollution':
    case 'waste_accumulation':
    case 'water_pollution':
      return 'Municipal Sanitation';

    case 'suspicious_object':
    case 'emergency_situation':
      return 'Police/Emergency';

    default: {
      // Exhaustiveness check — TypeScript will error here if a new category
      // is added to the enum but not handled in this switch.
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
};

// ---------------------------------------------------------------------------
// Priority Derivation
// ---------------------------------------------------------------------------

/**
 * Derives a priority level from the category and optional AI confidence score.
 *
 * Rules:
 *  - emergency_situation & suspicious_object → always 'high'
 *  - Other categories default to 'medium'
 *  - If aiConfidence is provided and < 0.4, downgrade to 'low'
 *    (the detection was uncertain, so the report is less likely urgent)
 */
export const derivePriority = (
  category: ReportCategory,
  aiConfidence?: number
): ReportPriority => {
  // Emergency and suspicious objects are always high-priority
  if (category === 'emergency_situation' || category === 'suspicious_object') {
    return 'high';
  }

  // If AI ran but has low confidence, the report is likely minor
  if (aiConfidence !== undefined && aiConfidence < 0.4) {
    return 'low';
  }

  return 'medium';
};

```

---

## File: backend\src\types\express.d.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Backend typescript data types definitions file

**Detailed Functionality:**
> This file defines the TypeScript interfaces and types for our backend. We use it to tell the compiler exactly what variables and parameters our code will use. This helps in avoiding coding mistakes and syntax errors because TypeScript will warn us if we use the wrong variable type.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the express.d.ts layer.

### Source Code:
```typescript
/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from './jwt';

/**
 * Augments the Express Request interface so that req.user is available
 * on any request that has passed through authMiddleware.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

```

---

## File: backend\src\types\jwt.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Backend typescript data types definitions file

**Detailed Functionality:**
> This file defines the TypeScript interfaces and types for our backend. We use it to tell the compiler exactly what variables and parameters our code will use. This helps in avoiding coding mistakes and syntax errors because TypeScript will warn us if we use the wrong variable type.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the jwt.ts layer.

### Source Code:
```typescript
export interface JwtPayload {
  id: string;
  role: 'citizen' | 'admin';
}

```

---

## File: backend\src\utils\logger.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Backend utility helper file

**Detailed Functionality:**
> This file contains small utility helper functions that we need in many places. For example, we have loggers to print clean logs in the terminal, check functions to validate emails, and generic functions to format responses so that we do not have to write the same code again and again.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the logger.ts layer.

### Source Code:
```typescript
export const logger = {
  info: (message: string, ...meta: any[]) => {
    console.log(JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString(), ...meta }));
  },
  warn: (message: string, ...meta: any[]) => {
    console.warn(JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString(), ...meta }));
  },
  error: (message: string, ...meta: any[]) => {
    console.error(JSON.stringify({ level: 'error', message, timestamp: new Date().toISOString(), ...meta }));
  }
};
```

---

## File: backend\src\utils\responseHandler.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Backend utility helper file

**Detailed Functionality:**
> This file contains small utility helper functions that we need in many places. For example, we have loggers to print clean logs in the terminal, check functions to validate emails, and generic functions to format responses so that we do not have to write the same code again and again.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the responseHandler.ts layer.

### Source Code:
```typescript
import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, message: string = 'Success', statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res: Response, message: string = 'Error', statusCode: number = 500, errors: any = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};
```

---

## File: backend\src\utils\validators.ts

### Architectural Role:
**File Tags:**
`[Backend]` `[Node.js]` `[Server-Side]`

**Architecture Role:**
> Backend utility helper file

**Detailed Functionality:**
> This file contains small utility helper functions that we need in many places. For example, we have loggers to print clean logs in the terminal, check functions to validate emails, and generic functions to format responses so that we do not have to write the same code again and again.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the validators.ts layer.

### Source Code:
```typescript
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

```

---

## File: app\src\components\admin\AnalyticsCard.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the AnalyticsCard.tsx layer.

### Source Code:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface AnalyticsCardProps {
  count: number | string;
  label: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  count,
  label,
  iconName,
  iconColor,
  bgColor,
}) => {
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.BarChart2;

  const getBottomRightBorderColor = (bg: string) => {
    switch (bg) {
      case '#EFF6FF': return '#DBEAFE';
      case '#FFF7ED': return '#FED7AA';
      case '#F0FDF4': return '#D1FAE5';
      case '#FFFBEB': return '#FEF08A';
      default: return '#E5E7EB';
    }
  };

  const brColor = getBottomRightBorderColor(bgColor);

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderBottomColor: brColor, borderRightColor: brColor }]}>
      <View style={styles.header}>
        <Text style={styles.count}>{count}</Text>
        <View style={styles.iconCircle}>
          <IconComponent size={20} color={iconColor} />
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: Colors.spacing.md,
    marginHorizontal: Colors.spacing.xs,
    justifyContent: 'space-between',
    minHeight: 90,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  count: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  label: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

```

---

## File: app\src\components\admin\MapMarker.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the MapMarker.tsx layer.

### Source Code:
```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Colors } from '../../constants/colors';
import { Report } from '../../types/report.types';

interface MapMarkerProps {
  report: Report;
  onPress: () => void;
}

export const MapMarker: React.FC<MapMarkerProps> = ({ report, onPress }) => {
  const getMarkerColor = () => {
    if (report.status === 'resolved') {
      return Colors.environmentalGreen;
    }

    if (report.priority === 'high' || report.category === 'emergency_situation') {
      return Colors.alertOrange;
    }
    // mediumlow pending incidents are yellow
    return '#F59E0B'; // amber yellow
  };

  const color = getMarkerColor();

  return (
    <Marker
      coordinate={{
        latitude: report.latitude,
        longitude: report.longitude,
      }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={[styles.outerPin, { borderColor: color }]}>
        <View style={[styles.innerDot, { backgroundColor: color }]} />
      </View>
      <View style={[styles.arrow, { borderTopColor: color }]} />
    </Marker>
  );
};

const styles = StyleSheet.create({
  outerPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  innerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  arrow: {
    width: 0,
    height: 0,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});

```

---

## File: app\src\components\admin\ReportListItem.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]` `[Issue Reporting]` `[Data Flow]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file manages the user reports. It handles report submissions, image uploads, GPS coordinates tagging (latitude/longitude), and status progress timeline updates.

### Source Code:
```tsx
import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Report, ReportPriority, ReportStatus } from '../../types/report.types';
import { CATEGORIES } from '../../constants/categories';
import { useTranslation } from '../../hooks/useTranslation';

interface ReportListItemProps {
  report: Report;
  onPress: () => void;
}

const getStatusLabel = (status: ReportStatus, t: any) => {
  switch (status) {
    case 'submitted':
      return t('statusSubmitted' as any) || 'Submitted';
    case 'under_review':
      return t('statusUnderReview' as any) || 'Under Review';
    case 'assigned':
      return t('statusAssigned' as any) || 'Assigned';
    case 'action_started':
      return t('statusActionStarted' as any) || 'In Progress';
    case 'resolved':
      return t('statusResolved' as any) || 'Resolved';
    default:
      return status;
  }
};

const getStatusColors = (status: ReportStatus) => {
  switch (status) {
    case 'submitted':
      return { color: '#6B7280', bg: '#F3F4F6' };
    case 'under_review':
    case 'assigned':
      return { color: Colors.primaryBlue, bg: '#EFF6FF' };
    case 'action_started':
      return { color: Colors.alertOrange, bg: '#FFF7ED' };
    case 'resolved':
      return { color: Colors.environmentalGreen, bg: '#F0FDF4' };
    default:
      return { color: '#6B7280', bg: '#F3F4F6' };
  }
};

const getPriorityLabel = (priority: ReportPriority | undefined, isHindi: boolean) => {
  switch (priority) {
    case 'high':
      return isHindi ? 'उच्च' : 'High';
    case 'medium':
      return isHindi ? 'मध्यम' : 'Medium';
    case 'low':
      return isHindi ? 'निम्न' : 'Low';
    default:
      return isHindi ? 'अनिर्धारित' : 'Unassigned';
  }
};

const getPriorityColor = (priority?: ReportPriority) => {
  switch (priority) {
    case 'high':
      return Colors.alertOrange;
    case 'medium':
      return '#F59E0B'; // yellow
    case 'low':
      return Colors.environmentalGreen;
    default:
      return '#6B7280';
  }
};

export const ReportListItem: React.FC<ReportListItemProps> = ({ report, onPress }) => {
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';

  const categoryItem = CATEGORIES.find((c) => c.id === report.category);
  const categoryLabel = categoryItem
    ? t(categoryItem.id as any)
    : report.category;

  const statusLabel = getStatusLabel(report.status, t);
  const statusColors = getStatusColors(report.status);
  const priorityLabel = getPriorityLabel(report.priority, isHindi);
  const priorityColor = getPriorityColor(report.priority);

  const formattedDate = new Date(report.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: report.imageURL }} style={styles.thumbnail} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.category} numberOfLines={1}>
            {categoryLabel}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        <View style={styles.priorityRow}>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={styles.priorityText}>
            {priorityLabel} {isHindi ? 'प्राथमिकता' : 'Priority'}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.badgeText, { color: statusColors.color }]}>
              {statusLabel}
            </Text>
          </View>
          {report.assignedDepartment ? (
            <Text style={styles.department} numberOfLines={1}>
              {report.assignedDepartment}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.sm,
    marginBottom: Colors.spacing.sm,
    borderWidth: 1,
    borderColor: '#EFF6FF',
    ...Colors.shadow.soft,
    alignItems: 'center',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: Colors.radius.sm,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    marginLeft: Colors.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    flex: 1,
    marginRight: Colors.spacing.xs,
  },
  date: {
    fontSize: 10,
    color: Colors.grayText,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 11,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
  },
  department: {
    fontSize: 11,
    color: Colors.grayText,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
    marginLeft: Colors.spacing.xs,
  },
});

```

---

## File: app\src\components\admin\StatusUpdater.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the StatusUpdater.tsx layer.

### Source Code:
```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { ReportStatus } from '../../types/report.types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { updateReportStatus } from '../../services/adminService';
import { useTranslation } from '../../hooks/useTranslation';

interface StatusUpdaterProps {
  reportId: string;
  currentStatus: ReportStatus;
  onStatusUpdated: () => void;
}

interface StatusOption {
  status: ReportStatus;
  labelEn: string;
  labelHi: string;
}

const OPTIONS: StatusOption[] = [
  { status: 'under_review', labelEn: 'Review', labelHi: 'समीक्षा' },
  { status: 'assigned', labelEn: 'Assign', labelHi: 'आवंटन' },
  { status: 'action_started', labelEn: 'Action', labelHi: 'कार्रवाई' },
];

export const StatusUpdater: React.FC<StatusUpdaterProps> = ({
  reportId,
  currentStatus,
  onStatusUpdated,
}) => {
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';

  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(
    OPTIONS.some((o) => o.status === currentStatus)
      ? currentStatus
      : 'under_review'
  );
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateReportStatus(reportId, selectedStatus, remarks.trim() || undefined);
      Alert.alert(
        t('success' as any) || 'Success',
        t('statusUpdatedSuccess' as any) || 'Status updated successfully'
      );
      setRemarks('');
      onStatusUpdated();
    } catch (error: any) {
      console.error('Error updating status:', error);
      Alert.alert(
        t('error' as any) || 'Error',
        error.message || 'An error occurred while updating status.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('updateStatus' as any) || 'Update Status'}</Text>

      <View style={styles.segmentContainer}>
        {OPTIONS.map((opt) => {
          const isActive = selectedStatus === opt.status;
          const label = isHindi ? opt.labelHi : opt.labelEn;
          return (
            <TouchableOpacity
              key={opt.status}
              style={[styles.segment, isActive ? styles.segmentActive : null]}
              onPress={() => setSelectedStatus(opt.status)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, isActive ? styles.segmentTextActive : null]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Input
        label={t('remarksLabel' as any) || 'Remarks / Comments'}
        placeholder={t('remarksPlaceholder' as any) || 'Add any notes or context...'}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        numberOfLines={2}
        style={styles.inputArea}
      />

      <Button
        title={isHindi ? 'बदलाव लागू करें' : 'Apply Changes'}
        onPress={handleUpdate}
        loading={loading}
        variant="primary"
        style={styles.submitBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
    marginBottom: Colors.spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: Colors.radius.sm,
    padding: 3,
    marginBottom: Colors.spacing.md,
  },
  segment: {
    flex: 1,
    paddingVertical: Colors.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Colors.radius.sm - 2,
  },
  segmentActive: {
    backgroundColor: Colors.white,
    ...Colors.shadow.soft,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
  },
  segmentTextActive: {
    color: Colors.primaryBlue,
  },
  inputArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  submitBtn: {
    height: 48,
    marginTop: Colors.spacing.xs,
  },
});

```

---

## File: app\src\components\auth\OTPInput.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the OTPInput.tsx layer.

### Source Code:
```tsx
import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>(Array(length).fill(null));

  const handleChange = (text: string, index: number) => {
    // only accept digits
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);

    if (digit && index < length - 1) {
      // advance focus to next box
      inputRefs.current[index + 1]?.focus();
    }

    if (updated.every((d) => d !== '')) {
      onComplete(updated.join(''));
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {

      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref; }}
          style={[styles.box, digit ? styles.boxFilled : null]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Colors.spacing.sm,
  },
  box: {
    flex: 1,
    height: 56,
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: Colors.white,
    textAlign: 'center',
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    ...Colors.shadow.soft,
  },
  boxFilled: {
    borderColor: Colors.primaryBlue,
    backgroundColor: '#EEF4FF', // faint blue tint on filled boxes
  },
});

```

---

## File: app\src\components\auth\PhoneInput.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the PhoneInput.tsx layer.

### Source Code:
```tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Phone } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  theme?: 'light' | 'dark';
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChangeText, error, theme }) => {
  const hasError = Boolean(error);
  const isDark = theme === 'dark';

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, isDark && { color: '#D1D5DB' }]}>Mobile Number</Text>

      <View style={[
        styles.row,
        isDark && { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
        hasError && styles.rowError
      ]}>
        <TouchableOpacity style={styles.countryBadge} activeOpacity={0.7}>
          <Text style={[styles.countryText, isDark && { color: '#ffffff' }]}>🇮🇳 +91</Text>
        </TouchableOpacity>

        <View style={[styles.divider, isDark && { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

        <Phone size={16} color={isDark ? '#60A5FA' : Colors.grayText} style={styles.icon} />

        <TextInput
          style={[styles.input, isDark && { color: '#ffffff' }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter phone number"
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : Colors.grayText}
          keyboardType="phone-pad"
          maxLength={10}
          returnKeyType="done"
        />
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Colors.spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    height: 52,
    overflow: 'hidden',
    ...Colors.shadow.soft,
  },
  rowError: {
    borderColor: Colors.alertOrange,
  },
  countryBadge: {
    paddingHorizontal: Colors.spacing.sm,
    height: '100%',
    justifyContent: 'center',
  },
  countryText: {
    fontSize: 15,
    color: Colors.darkText,
    fontWeight: Typography.fontWeight.semibold,
  },
  divider: {
    width: 1,
    height: '55%',
    backgroundColor: '#E5E7EB',
  },
  icon: {
    marginLeft: Colors.spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: Colors.spacing.sm,
    fontSize: Typography.fontSize.body,
    color: Colors.darkText,
  },
  errorText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.alertOrange,
    marginTop: Colors.spacing.xs,
  },
});

```

---

## File: app\src\components\auth\RoleSelector.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the RoleSelector.tsx layer.

### Source Code:
```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Shield, User, LucideIcon } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type Role = 'citizen' | 'admin';

interface RoleSelectorProps {
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
}

interface Option {
  role: Role;
  label: string;
  Icon: LucideIcon;
}

const OPTIONS: Option[] = [
  { role: 'citizen', label: "I'm a Citizen", Icon: User },
  { role: 'admin', label: "I'm an Authority", Icon: Shield },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleChange,
}) => {
  return (
    <View style={styles.container}>
      {OPTIONS.map(({ role, label, Icon }) => {
        const isActive = selectedRole === role;
        return (
          <TouchableOpacity
            key={role}
            style={[styles.segment, isActive && styles.segmentActive]}
            onPress={() => onRoleChange(role)}
            activeOpacity={0.8}
          >
            <Icon
              size={16}
              color={isActive ? Colors.white : Colors.grayText}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: Colors.radius.md,
    padding: 4,
    marginBottom: Colors.spacing.lg,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Colors.spacing.sm,
    borderRadius: Colors.radius.sm,
  },
  segmentActive: {
    backgroundColor: Colors.primaryBlue,
    // subtle shadow to lift the active pill
    shadowColor: Colors.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grayText,
  },
  labelActive: {
    color: Colors.white,
  },
});

```

---

## File: app\src\components\common\AnimatedTabScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the AnimatedTabScreen.tsx layer.

### Source Code:
```tsx
import React, { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface AnimatedTabScreenProps {
  children: React.ReactNode;
}

export const AnimatedTabScreen: React.FC<AnimatedTabScreenProps> = ({ children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const slideY = useRef(new Animated.Value(12)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.96);
      slideY.setValue(12);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(slideY, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.96);
        slideY.setValue(12);
      };
    }, [])
  );

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }, { translateY: slideY }],
        backgroundColor: 'transparent',
      }}
    >
      {children}
    </Animated.View>
  );
};

```

---

## File: app\src\components\common\Button.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the Button.tsx layer.

### Source Code:
```tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const containerStyles: StyleProp<ViewStyle> = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    isDisabled && styles.disabled,
    style,
  ];

  const labelStyles: StyleProp<TextStyle> = [
    styles.label,
    variant === 'primary' && styles.labelPrimary,
    variant === 'secondary' && styles.labelSecondary,
    variant === 'outline' && styles.labelOutline,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.white : Colors.primaryBlue}
          size="small"
        />
      ) : (
        <Text style={labelStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Colors.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Colors.spacing.xl,
  },
  primary: {
    backgroundColor: Colors.primaryBlue,
    // soft shadow on the cta
    shadowColor: Colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: Colors.environmentalGreen,
    shadowColor: Colors.environmentalGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primaryBlue,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
  },
  labelPrimary: {
    color: Colors.white,
  },
  labelSecondary: {
    color: Colors.white,
  },
  labelOutline: {
    color: Colors.primaryBlue,
  },
});

```

---

## File: app\src\components\common\Card.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the Card.tsx layer.

### Source Code:
```tsx
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    borderWidth: 1,
    borderColor: '#EFF6FF',
    ...Colors.shadow.soft,
  },
});

```

---

## File: app\src\components\common\ErrorBoundary.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the ErrorBoundary.tsx layer.

### Source Code:
```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught an unhandled crash]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={36} color={Colors.alertOrange} />
            </View>

            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subTitle}>
              An unexpected crash occurred in the application session.
            </Text>

            {this.state.error?.message ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText} numberOfLines={3}>
                  {this.state.error.message}
                </Text>
              </View>
            ) : null}

            <Button
              title="Restart Application"
              onPress={this.handleReset}
              variant="primary"
              style={styles.retryBtn}
            />
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Colors.spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.alertOrange + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Colors.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
  },
  subTitle: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Colors.spacing.lg,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: Colors.radius.sm,
    padding: Colors.spacing.md,
    marginBottom: Colors.spacing.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  errorText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#374151',
    lineHeight: 16,
  },
  retryBtn: {
    width: '100%',
  },
});

```

---

## File: app\src\components\common\Input.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the Input.tsx layer.

### Source Code:
```tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, containerStyle, style, ...rest }, ref) => {
    const hasError = Boolean(error);
    const isMultiline = rest.multiline;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View style={[
          styles.inputRow,
          hasError && styles.inputRowError,
          isMultiline && styles.inputRowMultiline
        ]}>
          {leftIcon ? <View style={styles.iconSlot}>{leftIcon}</View> : null}
          <TextInput
            ref={ref}
            style={[styles.input, leftIcon ? styles.inputWithIcon : null, style]}
            placeholderTextColor={Colors.grayText}
            {...rest}
          />
        </View>

        {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Colors.spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    height: 52,
    paddingHorizontal: Colors.spacing.md,
    ...Colors.shadow.soft,
  },
  inputRowError: {
    borderColor: Colors.alertOrange,
  },
  inputRowMultiline: {
    height: 'auto',
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: Colors.spacing.sm,
  },
  iconSlot: {
    marginRight: Colors.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    color: Colors.darkText,
    paddingVertical: 0, // prevents android extra padding
  },
  inputWithIcon: {
    marginLeft: 0,
  },
  errorText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.alertOrange,
    marginTop: Colors.spacing.xs,
  },
});

```

---

## File: app\src\components\common\Loader.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the Loader.tsx layer.

### Source Code:
```tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface LoaderProps {
  style?: StyleProp<ViewStyle>;
  size?: 'small' | 'large';
}

export const Loader: React.FC<LoaderProps> = ({ style, size = 'large' }) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={Colors.primaryBlue} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

```

---

## File: app\src\components\dashboard\CategoryTile.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the CategoryTile.tsx layer.

### Source Code:
```tsx
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { CategoryItem } from '../../constants/categories';
import { useTranslation } from '../../hooks/useTranslation';

interface CategoryTileProps {
  category: CategoryItem;
  onPress: () => void;
}

export const CategoryTile: React.FC<CategoryTileProps> = ({ category, onPress }) => {
  const IconComponent = (LucideIcons as any)[category.iconName] || LucideIcons.HelpCircle;
  const brColor = `${category.color}35`;
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.tile, { borderBottomColor: brColor, borderRightColor: brColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${category.color}15` }]}>
        <IconComponent size={24} color={category.color} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {t(category.id as any)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Colors.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    margin: Colors.spacing.xs,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Colors.spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    textAlign: 'center',
    marginTop: 4,
  },
});

```

---

## File: app\src\components\dashboard\RecentReportCard.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]` `[Issue Reporting]` `[Data Flow]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file manages the user reports. It handles report submissions, image uploads, GPS coordinates tagging (latitude/longitude), and status progress timeline updates.

### Source Code:
```tsx
import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Report, ReportStatus } from '../../types/report.types';
import { CATEGORIES } from '../../constants/categories';
import { useTranslation } from '../../hooks/useTranslation';

interface RecentReportCardProps {
  report: Report;
  onPress: () => void;
}

const getCategoryLabelHi = (categoryId: string) => {
  switch (categoryId) {
    case 'garbage_dump':
      return 'कचरा डंप';
    case 'plastic_pollution':
      return 'प्लास्टिक प्रदूषण';
    case 'waste_accumulation':
      return 'कचरा संचय';
    case 'water_pollution':
      return 'जल प्रदूषण';
    case 'suspicious_object':
      return 'संदिग्ध वस्तु';
    case 'emergency_situation':
      return 'आपातकालीन स्थिति';
    default:
      return categoryId;
  }
};

const getStatusStyles = (status: ReportStatus, isHindi: boolean) => {
  if (isHindi) {
    switch (status) {
      case 'submitted':
        return { label: 'जमा की गई', color: '#6B7280', bg: '#F3F4F6' };
      case 'under_review':
        return { label: 'समीक्षा के अधीन', color: Colors.primaryBlue, bg: '#EFF6FF' };
      case 'assigned':
        return { label: 'आवंटित', color: Colors.primaryBlue, bg: '#EFF6FF' };
      case 'action_started':
        return { label: 'कार्रवाई शुरू', color: Colors.alertOrange, bg: '#FFF7ED' };
      case 'resolved':
        return { label: 'हल', color: Colors.environmentalGreen, bg: '#F0FDF4' };
      default:
        return { label: status, color: '#6B7280', bg: '#F3F4F6' };
    }
  } else {
    switch (status) {
      case 'submitted':
        return { label: 'Submitted', color: '#6B7280', bg: '#F3F4F6' };
      case 'under_review':
        return { label: 'Under Review', color: Colors.primaryBlue, bg: '#EFF6FF' };
      case 'assigned':
        return { label: 'Assigned', color: Colors.primaryBlue, bg: '#EFF6FF' };
      case 'action_started':
        return { label: 'Action Started', color: Colors.alertOrange, bg: '#FFF7ED' };
      case 'resolved':
        return { label: 'Resolved', color: Colors.environmentalGreen, bg: '#F0FDF4' };
      default:
        return { label: status, color: '#6B7280', bg: '#F3F4F6' };
    }
  }
};

export const RecentReportCard: React.FC<RecentReportCardProps> = ({ report, onPress }) => {
  const { language } = useTranslation();
  const isHindi = language === 'hi';

  const categoryItem = CATEGORIES.find((c) => c.id === report.category);
  const statusStyles = getStatusStyles(report.status, isHindi);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const formattedDate = new Date(report.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const resolvedCategoryLabel = categoryItem
    ? (isHindi ? getCategoryLabelHi(report.category) : categoryItem.label)
    : report.category;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Image source={{ uri: report.imageURL }} style={styles.thumbnail} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.category} numberOfLines={1}>
              {resolvedCategoryLabel}
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          {report.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {report.description}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <View style={[styles.badge, { backgroundColor: statusStyles.bg }]}>
              <Text style={[styles.badgeText, { color: statusStyles.color }]}>
                {statusStyles.label}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.sm,
    marginBottom: Colors.spacing.sm,
    ...Colors.shadow.soft,
    alignItems: 'center',
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: Colors.radius.sm,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    marginLeft: Colors.spacing.md,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  category: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    flex: 1,
    marginRight: Colors.spacing.xs,
  },
  date: {
    fontSize: 11,
    color: Colors.grayText,
  },
  description: {
    fontSize: 13,
    color: Colors.grayText,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
});

```

---

## File: app\src\components\report\AIDetectionBadge.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]` `[AI Model]` `[Gemini API]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file connects our app to the Google Gemini AI. We write detailed prompts instructing the AI how to check if photos are valid (detecting fake images/selfies) or verifying if resolution photos match the original incident landmarks to prevent cheating.

### Source Code:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface AIDetectionBadgeProps {
  label: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
}

export const AIDetectionBadge: React.FC<AIDetectionBadgeProps> = ({
  label,
  confidence,
  priority,
}) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return Colors.alertOrange;
      case 'medium':
        return Colors.primaryBlue;
      default:
        return Colors.grayText;
    }
  };

  const priorityColor = getPriorityColor();

  return (
    <View style={styles.badgeContainer}>
      <View style={styles.header}>
        <Sparkles size={14} color={Colors.primaryBlue} />
        <Text style={styles.headerTitle}>AI Smart Tag</Text>
      </View>
      <Text style={styles.bodyText}>
        Detected: <Text style={styles.boldText}>{label}</Text> {'\n'}
        Confidence: <Text style={styles.boldText}>{confidence}%</Text> • Priority:{' '}
        <Text style={[styles.boldText, { color: priorityColor }]}>
          {priority.toUpperCase()}
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: '#EFF6FF', // light blue background
    borderRadius: Colors.radius.sm,
    padding: Colors.spacing.sm,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginTop: Colors.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 12,
    color: Colors.darkText,
    lineHeight: 16,
  },
  boldText: {
    fontWeight: Typography.fontWeight.bold,
  },
});

```

---

## File: app\src\components\report\PreventionTips.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the PreventionTips.tsx layer.

### Source Code:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { ReportCategoryType } from '../../constants/categories';

interface PreventionTipsProps {
  category: ReportCategoryType;
}

const TIPS: Record<ReportCategoryType, { title: string; tips: string[]; isSafety: boolean }> = {
  garbage_dump: {
    title: 'Sanitation Guidelines',
    isSafety: false,
    tips: [
      'Dispose of garbage only in designated collection bins.',
      'Do not burn trash openly, as it releases toxic chemical fumes.',
      'Keep household waste bins covered to prevent pests and disease spread.',
    ],
  },
  plastic_pollution: {
    title: 'Plastic Reduction Tips',
    isSafety: false,
    tips: [
      'Switch to reusable bags, bottles, and metal/bamboo straws.',
      'Segregate plastic waste correctly to ensure it gets sent to recycling centers.',
      'Avoid buying products wrapped in excessive single-use plastic layers.',
    ],
  },
  waste_accumulation: {
    title: 'Waste Management Rules',
    isSafety: false,
    tips: [
      'Segregate your waste at the source (organic, dry, and hazardous).',
      'Compost organic kitchen waste locally to reduce landfill volumes.',
      'Coordinate with community cleanup drives for periodic clearing.',
    ],
  },
  water_pollution: {
    title: 'Water Safety Precautions',
    isSafety: false,
    tips: [
      'Never dump motor oil, chemicals, or household waste into storm drains.',
      'Minimize pesticide and chemical fertilizer application on lawns.',
      'Report large discharges or suspicious coloring in local waterways immediately.',
    ],
  },
  suspicious_object: {
    title: 'Emergency Safety Rules',
    isSafety: true,
    tips: [
      'Do not touch, kick, or move the object under any circumstances.',
      'Maintain a safe distance of at least 100 meters immediately.',
      'Alert other people nearby to move away from the vicinity.',
      'Call local authorities or emergency responders at once.',
    ],
  },
  emergency_situation: {
    title: 'Critical Emergency Steps',
    isSafety: true,
    tips: [
      'Remain calm and quickly assess the safest path to safety.',
      'Evacuate the area and find secure shelter away from immediate danger.',
      'Call emergency numbers immediately and provide clear location details.',
      'Only assist others if doing so does not jeopardize your own life.',
    ],
  },
};

export const PreventionTips: React.FC<PreventionTipsProps> = ({ category }) => {
  const data = TIPS[category];
  if (!data) return null;

  const Icon = data.isSafety ? ShieldAlert : CheckCircle2;
  const iconColor = data.isSafety ? Colors.alertOrange : Colors.environmentalGreen;

  return (
    <View style={[styles.container, data.isSafety ? styles.safetyContainer : null]}>
      <View style={styles.header}>
        <Icon size={20} color={iconColor} />
        <Text style={[styles.title, { color: data.isSafety ? Colors.alertOrange : Colors.darkText }]}>
          {data.title}
        </Text>
      </View>
      <View style={styles.tipsList}>
        {data.tips.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Text style={[styles.bullet, { color: iconColor }]}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
  },
  safetyContainer: {
    borderColor: '#FFEDD5',
    backgroundColor: '#FFFBEB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Colors.spacing.sm,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
  },
  tipsList: {
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    marginRight: 6,
    lineHeight: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.grayText,
    lineHeight: 18,
  },
});

```

---

## File: app\src\components\report\ReportTimeline.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[UI Component]` `[Layout]` `[Issue Reporting]` `[Data Flow]`

**Architecture Role:**
> Mobile app reusable UI component

**Detailed Functionality:**
> This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.

**Core Logic:**
> Specifically, this file manages the user reports. It handles report submissions, image uploads, GPS coordinates tagging (latitude/longitude), and status progress timeline updates.

### Source Code:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { ReportStatus } from '../../types/report.types';
import { useTranslation } from '../../hooks/useTranslation';

interface TimelineStep {
  status: ReportStatus;
  label: string;
  labelHi: string;
}

const STEPS: TimelineStep[] = [
  { status: 'submitted', label: 'Submitted', labelHi: 'जमा की गई' },
  { status: 'under_review', label: 'Under Review', labelHi: 'समीक्षा के अधीन' },
  { status: 'assigned', label: 'Assigned', labelHi: 'आवंटित' },
  { status: 'action_started', label: 'Action Started', labelHi: 'कार्रवाई शुरू' },
  { status: 'resolved', label: 'Resolved', labelHi: 'हल' },
];

interface ReportTimelineProps {
  currentStatus: ReportStatus;
  historyLogs?: { status: ReportStatus; changedAt: string; remarks?: string }[];
}

export const ReportTimeline: React.FC<ReportTimelineProps> = ({ currentStatus, historyLogs = [] }) => {
  const { language } = useTranslation();
  const isHindi = language === 'hi';
  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        const matchedLog = historyLogs.find((log) => log.status === step.status);
        const logDate = matchedLog
          ? new Date(matchedLog.changedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : null;

        return (
          <View key={step.status} style={styles.stepRow}>
            {}
            <View style={styles.leftColumn}>
              {}
              {index < STEPS.length - 1 ? (
                <View
                  style={[
                    styles.connector,
                    isCompleted ? styles.connectorCompleted : null,
                  ]}
                />
              ) : null}

              {}
              <View
                style={[
                  styles.nodeCircle,
                  isCompleted ? styles.circleCompleted : null,
                  isCurrent ? styles.circleCurrent : null,
                  isFuture ? styles.circleFuture : null,
                ]}
              >
                {isCompleted ? (
                  <Check size={12} color={Colors.white} strokeWidth={3} />
                ) : isCurrent ? (
                  <View style={styles.currentDot} />
                ) : null}
              </View>
            </View>

            {}
            <View style={styles.rightColumn}>
              <View style={styles.headerRow}>
                <Text
                  style={[
                    styles.stepLabel,
                    isCurrent ? styles.labelCurrent : null,
                    isFuture ? styles.labelFuture : null,
                  ]}
                >
                  {isHindi ? step.labelHi : step.label}
                </Text>
                {logDate ? <Text style={styles.logDate}>{logDate}</Text> : null}
              </View>

              {matchedLog?.remarks ? (
                <Text style={styles.remarks} numberOfLines={2}>
                  {matchedLog.remarks}
                </Text>
              ) : isCurrent ? (
                <Text style={styles.placeholderRemarks}>
                  {isHindi ? 'अगली कार्रवाई का इंतजार है...' : 'Waiting for next action...'}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Colors.spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    ...Colors.shadow.soft,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 65,
  },
  leftColumn: {
    alignItems: 'center',
    width: 30,
    marginRight: Colors.spacing.sm,
  },
  connector: {
    width: 2,
    position: 'absolute',
    top: 24,
    bottom: -16,
    backgroundColor: '#E5E7EB',
  },
  connectorCompleted: {
    backgroundColor: Colors.environmentalGreen,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    zIndex: 1,
  },
  circleCompleted: {
    backgroundColor: Colors.environmentalGreen,
    borderColor: Colors.environmentalGreen,
  },
  circleCurrent: {
    backgroundColor: Colors.white,
    borderColor: Colors.primaryBlue,
  },
  circleFuture: {
    backgroundColor: Colors.white,
    borderColor: '#D1D5DB',
  },
  currentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryBlue,
  },
  rightColumn: {
    flex: 1,
    paddingBottom: Colors.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  labelCurrent: {
    color: Colors.primaryBlue,
  },
  labelFuture: {
    color: Colors.grayText,
  },
  logDate: {
    fontSize: 11,
    color: Colors.grayText,
  },
  remarks: {
    fontSize: 13,
    color: Colors.darkText,
    marginTop: 2,
    lineHeight: 17,
  },
  placeholderRemarks: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.grayText,
    marginTop: 2,
  },
});

```

---

## File: app\src\config\firebaseConfig.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]`

**Architecture Role:**
> Project configuration component file

**Detailed Functionality:**
> This is a setup configuration file containing metadata and settings parameters required by the project to build, compile, and run correctly in different environments.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the firebaseConfig.ts layer.

### Source Code:
```typescript


import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence, getAuth } from 'firebase/auth';

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDxvsbs8LUFP_lo4rdEIQy59BcNeeXcPtg',
  authDomain: 'ocean-preventions.firebaseapp.com',
  projectId: 'ocean-preventions',
  storageBucket: 'ocean-preventions.firebasestorage.app',
  messagingSenderId: '298705653505',
  appId: '1:298705653505:android:530b530e4f867c16e21500',
};

const firebaseApp =
  getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

export const firebaseAuth = (() => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: inMemoryPersistence,
    });
  } catch {

    return getAuth(firebaseApp);
  }
})();

```

---

## File: app\src\constants\categories.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]`

**Architecture Role:**
> Mobile app global styling and design tokens file

**Detailed Functionality:**
> This file stores all the global styles and constant configurations like color codes (primary blue, environmental green), font sizes, spacing parameters, and static lists of categories. It helps us manage the app theme easily, as changing a color code here will update it everywhere in the app.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the categories.ts layer.

### Source Code:
```typescript
export type ReportCategoryType =
  | 'garbage_dump'
  | 'plastic_pollution'
  | 'waste_accumulation'
  | 'water_pollution'
  | 'suspicious_object'
  | 'emergency_situation';

export interface CategoryItem {
  id: ReportCategoryType;
  label: string;
  iconName: string; // lucide icon name to be rendered
  color: string;
  group: 'environmental' | 'safety';
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'garbage_dump',
    label: 'Garbage Dump',
    iconName: 'Trash2',
    color: '#10B981',
    group: 'environmental',
  },
  {
    id: 'plastic_pollution',
    label: 'Plastic Pollution',
    iconName: 'Package',
    color: '#06B6D4',
    group: 'environmental',
  },
  {
    id: 'waste_accumulation',
    label: 'Waste Accumulation',
    iconName: 'Layers',
    color: '#8B5CF6',
    group: 'environmental',
  },
  {
    id: 'water_pollution',
    label: 'Water Pollution',
    iconName: 'Droplet',
    color: '#3B82F6',
    group: 'environmental',
  },
  {
    id: 'suspicious_object',
    label: 'Suspicious Object',
    iconName: 'AlertTriangle',
    color: '#F59E0B',
    group: 'safety',
  },
  {
    id: 'emergency_situation',
    label: 'Emergency Situation',
    iconName: 'ShieldAlert',
    color: '#EF4444',
    group: 'safety',
  },
];

```

---

## File: app\src\constants\colors.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]`

**Architecture Role:**
> Mobile app global styling and design tokens file

**Detailed Functionality:**
> This file stores all the global styles and constant configurations like color codes (primary blue, environmental green), font sizes, spacing parameters, and static lists of categories. It helps us manage the app theme easily, as changing a color code here will update it everywhere in the app.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the colors.ts layer.

### Source Code:
```typescript
export const Colors = {
  primaryBlue: '#1E63D6',
  environmentalGreen: '#2E9E5B',
  background: '#FAFAFA',
  darkText: '#1A1A1A',
  grayText: '#6B7280',
  alertOrange: '#FF6B35',
  white: '#FFFFFF',

  // border radius scale
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
  },

  // spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  shadow: {
    soft: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 0,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 0,
    },
  },
} as const;

export type ColorsType = typeof Colors;
```

---

## File: app\src\constants\roles.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]`

**Architecture Role:**
> Mobile app global styling and design tokens file

**Detailed Functionality:**
> This file stores all the global styles and constant configurations like color codes (primary blue, environmental green), font sizes, spacing parameters, and static lists of categories. It helps us manage the app theme easily, as changing a color code here will update it everywhere in the app.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the roles.ts layer.

### Source Code:
```typescript
export const ROLE_CITIZEN = 'citizen' as const;
export const ROLE_ADMIN = 'admin' as const;

export type UserRole = typeof ROLE_CITIZEN | typeof ROLE_ADMIN;

```

---

## File: app\src\constants\translations.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]`

**Architecture Role:**
> Mobile app global styling and design tokens file

**Detailed Functionality:**
> This file stores all the global styles and constant configurations like color codes (primary blue, environmental green), font sizes, spacing parameters, and static lists of categories. It helps us manage the app theme easily, as changing a color code here will update it everywhere in the app.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the translations.ts layer.

### Source Code:
```typescript
export const TRANSLATIONS = {
  en: {
    // general  common
    appName: "CivicSafe",
    next: "Next",
    submit: "Submit",
    cancel: "Cancel",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    back: "Back",
    openMap: "Open Map",
    viewDetails: "View Details & Act",
    all: "All",
    pending: "Pending",
    resolved: "Resolved",
    allCategories: "All Categories",
    incidentTracker: "Incident Tracker",
    noIncidentsFound: "No incidents match your selection.",

    // splash screen
    slogan: "Report. Track. Resolve.",
    getStarted: "Get Started",
    alreadyHaveAccount: "Already have an account? ",
    logIn: "Log In",

    // onboarding screen
    skip: "Skip",
    slide1Title: "Report in Real-Time",
    slide1Desc: "Capture photo evidence on the spot with your camera. Your GPS location and timestamp are automatically recorded — no gallery uploads allowed, ensuring authentic evidence.",
    slide2Title: "Automatic Routing",
    slide2Desc: "Reports are instantly routed to the right department — Municipal Sanitation for pollution, Police & Emergency for suspicious objects. No manual guesswork needed.",
    slide3Title: "Track Live Progress",
    slide3Desc: "Follow your report through 5 stages: Submitted → Under Review → Assigned → Action Started → Resolved. Get push notifications at every step.",

    // login screen
    welcomeBack: "Welcome Back",
    enterEmailSignIn: "Select your role and log in with your email",
    emailAddress: "Email Address",
    emailPlaceholder: "your@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Your password",
    loggingIn: "Logging in...",
    dontHaveAccount: "Don't have an account? ",
    createAccountLink: "Create Account",

    // signup screen
    createAccount: "Create Account",
    joinCommunity: "Join CivicSafe to start reporting issues in your community",
    fullName: "Full Name",
    registering: "Registering...",
    haveAccount: "Already have an account? Log In",
    selectRolePrompt: "Choose your role:",

    // dashboard
    cleanSurroundsHint: "Let's keep our surroundings clean and safe.",
    reportAnIncident: "Report an Incident",
    recentReports: "Recent Reports",
    noRecentReports: "No recent reports.",
    selectCategoryPrompt: "Select a category below to submit a new report:",
    hello: "Hello",

    // select category
    selectCategoryTitle: "Select Category",
    chooseMatchingCategory: "Choose the category that matches the incident:",

    // description screen
    describeIssueTitle: "Describe the Issue",
    provideIncidentDetails: "Provide details about the incident:",
    contextPlaceholder: "Provide more context...",
    writeDescError: "Please write a description first",

    // review submit screen
    reviewSubmitTitle: "Review & Submit",
    confirmDetails: "Confirm details before sending:",
    categoryLabel: "Category:",
    locationCoords: "Location coordinates:",
    descriptionLabel: "Description:",
    submitReportBtn: "Submit Report",
    submitting: "Submitting...",
    emergencyWarning: "🚨 This report will trigger a safety emergency call to 112!",

    // report tracking
    trackReportsTitle: "Track Reports",
    noReportsYet: "No reports submitted yet.",

    // report details
    reportDetailsTitle: "Report Details",
    routingTimeline: "Routing Timeline",
    resolutionComparison: "Resolution Comparison",
    beforeIncident: "Before (Incident)",
    afterResolved: "After (Resolved)",
    resolutionNotes: "Resolution Notes",
    leaveFeedbackBtn: "Leave Feedback",
    rateResolutionTitle: "Rate Resolution Work",
    howSatisfiedPrompt: "How satisfied are you with the cleanup response and resolution?",
    starRatingLabel: "Star Rating",
    writeCommentPlaceholder: "Write a comment...",
    submitFeedbackBtn: "Submit Feedback",
    feedbackSuccessTitle: "Thank You",
    feedbackSuccessMsg: "Your feedback has been submitted successfully.",

    // profile screen
    profileTitle: "Account Profile",
    settingsTab: "Settings",
    logOutBtn: "Log Out",
    reportsSubmittedCount: "Reports Submitted",

    // settings screen
    settingsTitle: "Settings",
    pushNotificationsLabel: "Push Notifications",
    pushNotificationsSub: "Get status alerts for reported incidents",
    appLanguageLabel: "App Language",
    appLanguageSub: "Choose your preferred display language",

    // authority dashboard
    authorityHub: "Authority Hub",
    welcomeOfficer: "Welcome, ",
    incidentLiveMap: "Incident Live Map",
    liveMapDesc: "View reported issues coordinates on dynamic map view",
    overviewAnalytics: "Overview Analytics",
    totalReports: "Total Reports",
    pendingIssues: "Pending Issues",
    resolvedCases: "Resolved Cases",
    safetyEmergencies: "Safety Emergencies",
    recentIncidents: "Recent Incidents",
    refresh: "Refresh",
    officerProfile: "Officer Profile",
    appLanguage: "App Language / भाषा",
    notifications: "Notifications",
    reportIncidentSub: "Report emergencies, pollution, or trash instantly.",
    environmentalPollution: "Environmental Pollution",
    safetySecurity: "Safety & Security",
    didYouKnow: "Did you know?",
    safetyTipTeaser: "Safety is our top priority. For safety incidents, keep at least 100 meters distance and alert authorities.",
    tabHome: "Home",
    tabReports: "My Reports",
    tabProfile: "Profile",

    // admin  status translations
    tabDashboard: "Dashboard",
    tabLiveMap: "Live Map",
    tabReportsAdmin: "Reports",
    tabAnalytics: "Analytics",
    deptAll: "All Departments",
    deptSanitation: "Municipal Sanitation",
    deptPolice: "Police/Emergency",
    statusAll: "All Statuses",
    statusSubmitted: "Submitted",
    statusUnderReview: "Under Review",
    statusAssigned: "Assigned",
    statusActionStarted: "In Progress",
    statusResolved: "Resolved",
    analyticsTitle: "Overview Analytics",
    reportsByStatus: "Reports by Status",
    reportsByCategory: "Reports by Category",
    noDataAvailable: "No statistics available.",

    // category translations
    garbage_dump: "Garbage Dump",
    plastic_pollution: "Plastic Pollution",
    waste_accumulation: "Waste Accumulation",
    water_pollution: "Water Pollution",
    suspicious_object: "Suspicious Object",
    emergency_situation: "Emergency Situation",

    // upload resolution screen keys
    imageRequiredError: "Please take a photo of the resolved cleanup first",
    notesRequiredError: "Please provide resolution notes",
    uploadResolutionTitle: "Upload Resolution",
    takePhotoBtn: "Take Photo",
    resolutionNotesLabel: "Resolution Notes",
    resolutionNotesPlaceholder: "Describe what action was taken to resolve the issue...",
    submitResolutionBtn: "Submit Resolution",

    // status updater keys
    statusUpdatedSuccess: "Status updated successfully",
    updateStatus: "Update Status",
    remarksLabel: "Remarks / Comments",
    remarksPlaceholder: "Add any notes or context...",

    // admin detail  list keys
    assignToMe: "Assign to Me",
    reportDetails: "Report Details",
    searchPlaceholder: "Search by ID, desc, or location...",
    noReportsFound: "No reports match your filters.",
    verifyEmail: "Verify Your Email",
    aiValidationTitle: "AI Validation Warning",
    aiValidationSub: "Our civic AI model detected an issue with your submission:",
    aiValidationButton: "Edit & Correct Report"
  },
  hi: {
    // general  common
    appName: "सिविकसेफ",
    next: "अगला",
    submit: "सबमिट",
    cancel: "रद्द करें",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    back: "पीछे",
    openMap: "नक्शा खोलें",
    viewDetails: "विवरण देखें और कार्रवाई करें",
    all: "सभी",
    pending: "लंबित",
    resolved: "सुलझाए गए",
    allCategories: "सभी श्रेणियां",
    incidentTracker: "घटना ट्रैकर",
    noIncidentsFound: "आपकी पसंद से कोई घटना मेल नहीं खाती।",

    // splash screen
    slogan: "रिपोर्ट. ट्रैक. समाधान।",
    getStarted: "शुरू करें",
    alreadyHaveAccount: "पहले से ही एक खाता है? ",
    logIn: "लॉग इन",

    // onboarding screen
    skip: "छोड़ें",
    slide1Title: "वास्तविक समय में रिपोर्ट करें",
    slide1Desc: "कैमरे से तुरंत फोटो साक्ष्य लें। आपका जीपीएस स्थान और समय स्वचालित रूप से रिकॉर्ड किया जाता है - गैलरी अपलोड की अनुमति नहीं है, जिससे प्रामाणिक साक्ष्य सुनिश्चित होता है।",
    slide2Title: "स्वचालित रूटिंग",
    slide2Desc: "रिपोर्ट तुरंत सही विभाग को भेजी जाती है - प्रदूषण के लिए नगर निगम स्वच्छता, संदिग्ध वस्तुओं के लिए पुलिस और आपातकालीन स्थिति। किसी मैन्युअल अनुमान की आवश्यकता नहीं है।",
    slide3Title: "लाइव प्रगति ट्रैक करें",
    slide3Desc: "अपनी रिपोर्ट को 5 चरणों में ट्रैक करें: जमा की गई → समीक्षा के अधीन → आवंटित → कार्रवाई शुरू → हल। हर कदम पर पुश नोटिफिकेशन प्राप्त करें।",

    // login screen
    welcomeBack: "वापसी पर स्वागत है",
    enterEmailSignIn: "अपनी भूमिका चुनें और अपने ईमेल से लॉग इन करें",
    emailAddress: "ईमेल पता",
    emailPlaceholder: "your@email.com",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "आपका पासवर्ड",
    loggingIn: "लॉग इन हो रहा है...",
    dontHaveAccount: "खाता नहीं है? ",
    createAccountLink: "खाता बनाएं",

    // signup screen
    createAccount: "खाता बनाएं",
    joinCommunity: "अपने समुदाय में समस्याओं की रिपोर्ट करने के लिए सिविकसेफ से जुड़ें",
    fullName: "पूरा नाम",
    registering: "पंजीकरण हो रहा है...",
    haveAccount: "पहले से ही एक खाता है? लॉग इन",
    selectRolePrompt: "अपनी भूमिका चुनें:",

    // dashboard
    cleanSurroundsHint: "आइए अपने परिवेश को साफ और सुरक्षित रखें।",
    reportAnIncident: "घटना की रिपोर्ट करें",
    recentReports: "हाल की रिपोर्ट",
    noRecentReports: "कोई हाल की रिपोर्ट नहीं।",
    selectCategoryPrompt: "एक नई रिपोर्ट जमा करने के लिए नीचे एक श्रेणी चुनें:",
    hello: "नमस्ते",

    // select category
    selectCategoryTitle: "श्रेणी चुनें",
    chooseMatchingCategory: "घटना से मेल खाने वाली श्रेणी चुनें:",

    // description screen
    describeIssueTitle: "समस्या का वर्णन करें",
    provideIncidentDetails: "घटना के बारे में विवरण प्रदान करें:",
    contextPlaceholder: "अधिक संदर्भ प्रदान करें...",
    writeDescError: "कृपया पहले एक विवरण लिखें",

    // review submit screen
    reviewSubmitTitle: "समीक्षा करें और सबमिट करें",
    confirmDetails: "भेजने से पहले विवरण की पुष्टि करें:",
    categoryLabel: "श्रेणी:",
    locationCoords: "स्थान निर्देशांक:",
    descriptionLabel: "विवरण:",
    submitReportBtn: "रिपोर्ट सबमिट करें",
    submitting: "सबमिट हो रहा है...",
    emergencyWarning: "🚨 यह रिपोर्ट 112 पर आपातकालीन सुरक्षा कॉल शुरू करेगी!",

    // report tracking
    trackReportsTitle: "रिपोर्ट ट्रैक करें",
    noReportsYet: "अभी तक कोई रिपोर्ट सबमिट नहीं की गई है।",

    // report details
    reportDetailsTitle: "रिपोर्ट का विवरण",
    routingTimeline: "रूटिंग टाइमलाइन",
    resolutionComparison: "समाधान तुलना",
    beforeIncident: "पहले (घटना)",
    afterResolved: "बाद में (हल)",
    resolutionNotes: "समाधान नोट्स",
    leaveFeedbackBtn: "फीडबैक छोड़ें",
    rateResolutionTitle: "समाधान कार्य को रेट करें",
    howSatisfiedPrompt: "आप सफाई प्रतिक्रिया और समाधान से कितने संतुष्ट हैं?",
    starRatingLabel: "स्टार रेटिंग",
    writeCommentPlaceholder: "अपनी टिप्पणी लिखें...",
    submitFeedbackBtn: "फीडबैक सबमिट करें",
    feedbackSuccessTitle: "धन्यवाद",
    feedbackSuccessMsg: "आपका फीडबैक सफलतापूर्वक सबमिट कर दिया गया है।",

    // profile screen
    profileTitle: "खाता प्रोफ़ाइल",
    settingsTab: "सेटिंग्स",
    logOutBtn: "लॉग आउट",
    reportsSubmittedCount: "सबमिट की गई रिपोर्ट",

    // settings screen
    settingsTitle: "सेटिंग्स",
    pushNotificationsLabel: "पुश नोटिफिकेशन",
    pushNotificationsSub: "रिपोर्ट की गई घटनाओं के लिए स्थिति अलर्ट प्राप्त करें",
    appLanguageLabel: "ऐप की भाषा",
    appLanguageSub: "अपनी पसंदीदा प्रदर्शन भाषा चुनें",

    // authority dashboard
    authorityHub: "प्राधिकरण हब",
    welcomeOfficer: "स्वागत है, ",
    incidentLiveMap: "लाइव घटना मानचित्र",
    liveMapDesc: "गतिशील मानचित्र दृश्य पर रिपोर्ट किए गए मुद्दों के निर्देशांक देखें",
    overviewAnalytics: "अवलोकन विश्लेषण",
    totalReports: "कुल रिपोर्ट",
    pendingIssues: "लंबित मुद्दे",
    resolvedCases: "सुलझाए गए मामले",
    safetyEmergencies: "सुरक्षा आपात स्थिति",
    recentIncidents: "हाल की घटनाएं",
    refresh: "ताज़ा करें",
    officerProfile: "अधिकारी प्रोफ़ाइल",
    appLanguage: "App Language / Language",
    notifications: "सूचनाएं",
    reportIncidentSub: "आपातकाल, प्रदूषण या कचरे की तुरंत रिपोर्ट करें।",
    environmentalPollution: "पर्यावरण प्रदूषण",
    safetySecurity: "सुरक्षा और संरक्षा",
    didYouKnow: "क्या आप जानते हैं?",
    safetyTipTeaser: "सुरक्षा हमारी सर्वोच्च प्राथमिकता है। सुरक्षा घटनाओं के लिए, कम से कम 100 मीटर की दूरी बनाए रखें और अधिकारियों को सतर्क करें।",
    tabHome: "मुख्य पृष्ठ",
    tabReports: "मेरी रिपोर्ट",
    tabProfile: "प्रोफ़ाइल",

    // admin  status translations
    tabDashboard: "डैशबोर्ड",
    tabLiveMap: "लाइव नक्शा",
    tabReportsAdmin: "रिपोर्ट्स",
    tabAnalytics: "विश्लेषण",
    deptAll: "सभी विभाग",
    deptSanitation: "नगर निगम स्वच्छता",
    deptPolice: "पुलिस/आपातकालीन",
    statusAll: "सभी स्थितियाँ",
    statusSubmitted: "जमा किया गया",
    statusUnderReview: "समीक्षा के अधीन",
    statusAssigned: "आवंटित",
    statusActionStarted: "प्रगति पर है",
    statusResolved: "सुलझाया गया",
    analyticsTitle: "अवलोकन विश्लेषण",
    reportsByStatus: "स्थिति के अनुसार रिपोर्ट",
    reportsByCategory: "श्रेणी के अनुसार रिपोर्ट",
    noDataAvailable: "कोई आँकड़े उपलब्ध नहीं हैं।",

    // category translations
    garbage_dump: "कचरा डंप",
    plastic_pollution: "प्लास्टिक प्रदूषण",
    waste_accumulation: "कचरा संचय",
    water_pollution: "जल प्रदूषण",
    suspicious_object: "संदिग्ध वस्तु",
    emergency_situation: "आपातकालीन स्थिति",

    // upload resolution screen keys
    imageRequiredError: "कृपया पहले सुलझाए गए काम की फोटो लें",
    notesRequiredError: "कृपया समाधान नोट प्रदान करें",
    uploadResolutionTitle: "समाधान अपलोड करें",
    takePhotoBtn: "फोटो लें",
    resolutionNotesLabel: "समाधान नोट्स",
    resolutionNotesPlaceholder: "वर्णन करें कि समस्या को हल करने के लिए क्या कार्रवाई की गई...",
    submitResolutionBtn: "समाधान सबमिट करें",

    // status updater keys
    statusUpdatedSuccess: "स्थिति सफलतापूर्वक अपडेट की गई",
    updateStatus: "स्थिति अपडेट करें",
    remarksLabel: "टिप्पणी / विचार",
    remarksPlaceholder: "कोई नोट या संदर्भ जोड़ें...",

    // admin detail  list keys
    assignToMe: "मुझे आवंटित करें",
    reportDetails: "रिपोर्ट विवरण",
    searchPlaceholder: "आईडी, विवरण या स्थान से खोजें...",
    noReportsFound: "आपके फ़िल्टर से कोई रिपोर्ट मेल नहीं खाती।",
    verifyEmail: "ईमेल सत्यापित करें",
    aiValidationTitle: "एआई सत्यापन चेतावनी",
    aiValidationSub: "हमारे नागरिक एआई मॉडल ने आपकी रिपोर्ट में एक समस्या का पता लगाया है:",
    aiValidationButton: "विवरण सुधारें"
  }
};

```

---

## File: app\src\constants\typography.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]`

**Architecture Role:**
> Mobile app global styling and design tokens file

**Detailed Functionality:**
> This file stores all the global styles and constant configurations like color codes (primary blue, environmental green), font sizes, spacing parameters, and static lists of categories. It helps us manage the app theme easily, as changing a color code here will update it everywhere in the app.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the typography.ts layer.

### Source Code:
```typescript
export const Typography = {
  fontFamily: {

    sans: 'System',
  },
  fontSize: {
    h1: 28,
    h2: 22,
    body: 16,
    caption: 12,
  },
  fontWeight: {
    bold: '700' as const,
    semibold: '600' as const,
    regular: '400' as const,
  },
  lineHeight: {
    h1: 34,
    h2: 28,
    body: 22,
    caption: 16,
  },
} as const;

export type TypographyType = typeof Typography;

```

---

## File: app\src\context\useAuthStore.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[State Management]` `[Zustand]` `[Authentication]` `[Security]` `[Login]`

**Architecture Role:**
> Mobile app global state store (Zustand)

**Detailed Functionality:**
> We created this store using a library called Zustand. In React Native, passing data between different screens is very difficult and confusing. To solve this, Zustand acts like a central global box where we can store variables like the user login token or active profile details. Any screen in the app can easily read or update this data instantly without complex coding.

**Core Logic:**
> Specifically, this file is responsible for the authentication system. It writes code to register new users, verify their credentials, and maintain secure logged-in sessions using JWT tokens.

### Source Code:
```typescript
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const SECURE_STORE_TOKEN_KEY = 'op_auth_token';
const SECURE_STORE_USER_KEY = 'op_auth_user';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setSession: async (user: User, token: string) => {
    set({ isLoading: true });
    try {
      await SecureStore.setItemAsync(SECURE_STORE_TOKEN_KEY, token);
      await SecureStore.setItemAsync(SECURE_STORE_USER_KEY, JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Error saving auth session:', error);
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SECURE_STORE_USER_KEY);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Error clearing auth session:', error);
      set({ isLoading: false });
    }
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(SECURE_STORE_USER_KEY);

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error hydrating auth session:', error);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

```

---

## File: app\src\context\useSettingsStore.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[State Management]` `[Zustand]`

**Architecture Role:**
> Mobile app global state store (Zustand)

**Detailed Functionality:**
> We created this store using a library called Zustand. In React Native, passing data between different screens is very difficult and confusing. To solve this, Zustand acts like a central global box where we can store variables like the user login token or active profile details. Any screen in the app can easily read or update this data instantly without complex coding.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the useSettingsStore.ts layer.

### Source Code:
```typescript
import { create } from 'zustand';

interface SettingsState {
  pushEnabled: boolean;
  language: 'en' | 'hi';
  tabBarVisible: boolean;
  togglePush: () => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  setTabBarVisible: (visible: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  pushEnabled: true,
  language: 'en',
  tabBarVisible: true,
  togglePush: () => set((state) => ({ pushEnabled: !state.pushEnabled })),
  setLanguage: (lang) => set({ language: lang }),
  setTabBarVisible: (visible) => set({ tabBarVisible: visible }),
}));

```

---

## File: app\src\hooks\useTranslation.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]`

**Architecture Role:**
> Mobile app custom React hook

**Detailed Functionality:**
> This is a custom React Hook that we wrote to separate complex logic from our screen design files. It handles reusable state lifecycles, checks permissions, or maps translation strings (like Hindi/English toggling) to make our code more clean and modular.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the useTranslation.ts layer.

### Source Code:
```typescript
import { useSettingsStore } from '../context/useSettingsStore';
import { TRANSLATIONS } from '../constants/translations';

export type TranslationKey = keyof typeof TRANSLATIONS['en'];

export const useTranslation = () => {
  const language = useSettingsStore((s) => s.language) || 'en';

  const t = (key: TranslationKey): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || String(key);
  };

  return { t, language };
};

```

---

## File: app\src\navigation\AdminNavigator.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[Admin Panel]` `[Management]`

**Architecture Role:**
> Mobile app screen routing navigator configuration

**Detailed Functionality:**
> This file controls the screen navigation flow of our application using React Navigation. It sets up navigation stacks and tab bars. For example, it writes logic to ensure that if a user is not logged in, they are locked in the login screen, and once they log in successfully, it redirects them to the main citizen dashboard or admin pages.

**Core Logic:**
> Specifically, this file implements features for the admin authority panel. It allows municipal officers to fetch reports, view analytical summaries, and coordinate resolution tasks.

### Source Code:
```tsx
import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, StyleSheet, Animated } from 'react-native';
import { LayoutDashboard, Map, FileSpreadsheet, BarChart2 } from 'lucide-react-native';
import { AdminTabParamList, ReportsStackParamList } from '../types/navigation.types';
import { AdminDashboardScreen } from '../screens/admin/dashboard/AdminDashboardScreen';
import { LiveMapScreen } from '../screens/admin/map/LiveMapScreen';
import { ReportListScreen } from '../screens/admin/reports/ReportListScreen';
import { AdminReportDetailScreen } from '../screens/admin/reports/AdminReportDetailScreen';
import { UploadResolutionScreen } from '../screens/admin/resolution/UploadResolutionScreen';
import { AnalyticsScreen } from '../screens/admin/analytics/AnalyticsScreen';
import { Colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedTabScreen } from '../components/common/AnimatedTabScreen';
import { useSettingsStore } from '../context/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();

const AdminReportsStackNavigator = () => {
  return (
    <ReportsStack.Navigator
      initialRouteName="ReportList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <ReportsStack.Screen name="ReportList" component={ReportListScreen} />
      <ReportsStack.Screen name="ReportDetail" component={AdminReportDetailScreen} />
      <ReportsStack.Screen name="UploadResolution" component={UploadResolutionScreen} />
    </ReportsStack.Navigator>
  );
};

const AnimatedDashboard = () => (
  <AnimatedTabScreen>
    <AdminDashboardScreen />
  </AnimatedTabScreen>
);

const AnimatedLiveMap = () => (
  <AnimatedTabScreen>
    <LiveMapScreen />
  </AnimatedTabScreen>
);

const AnimatedReports = () => (
  <AnimatedTabScreen>
    <AdminReportsStackNavigator />
  </AnimatedTabScreen>
);

const AnimatedAnalytics = () => (
  <AnimatedTabScreen>
    <AnalyticsScreen />
  </AnimatedTabScreen>
);

const AnimatedTabBar = (props: any) => {
  const tabBarVisible = useSettingsStore((s) => s.tabBarVisible);
  const tabBarAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(tabBarAnim, {
      toValue: tabBarVisible ? 1 : 0,
      tension: 45,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [tabBarVisible]);

  const scale = tabBarAnim;
  const translateY = tabBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [45, 0],
  });
  const opacity = tabBarAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.1, 1],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        transform: [{ translateY }, { scale }],
        opacity,
        zIndex: 99,
        backgroundColor: 'transparent',
      }}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

export const AdminNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryBlue,
        tabBarInactiveTintColor: Colors.grayText,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          backgroundColor: 'transparent',
          borderRadius: 24,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderWidth: 1,
          borderColor: 'rgba(229, 231, 235, 0.5)',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 8,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.98)', 'rgba(245, 247, 250, 0.92)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AnimatedDashboard}
        options={{
          tabBarLabel: t('tabDashboard' as any) || 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={AnimatedLiveMap}
        options={{
          tabBarLabel: t('tabLiveMap' as any) || 'Live Map',
          tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={AnimatedReports}
        options={{
          tabBarLabel: t('tabReportsAdmin' as any) || 'Reports',
          tabBarIcon: ({ color, size }) => <FileSpreadsheet color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnimatedAnalytics}
        options={{
          tabBarLabel: t('tabAnalytics' as any) || 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};


```

---

## File: app\src\navigation\AuthNavigator.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[Authentication]` `[Security]` `[Login]`

**Architecture Role:**
> Mobile app screen routing navigator configuration

**Detailed Functionality:**
> This file controls the screen navigation flow of our application using React Navigation. It sets up navigation stacks and tab bars. For example, it writes logic to ensure that if a user is not logged in, they are locked in the login screen, and once they log in successfully, it redirects them to the main citizen dashboard or admin pages.

**Core Logic:**
> Specifically, this file is responsible for the authentication system. It writes code to register new users, verify their credentials, and maintain secure logged-in sessions using JWT tokens.

### Source Code:
```tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation.types';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'none', // minimal motion style requirement
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

```

---

## File: app\src\navigation\CitizenNavigator.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]`

**Architecture Role:**
> Mobile app screen routing navigator configuration

**Detailed Functionality:**
> This file controls the screen navigation flow of our application using React Navigation. It sets up navigation stacks and tab bars. For example, it writes logic to ensure that if a user is not logged in, they are locked in the login screen, and once they log in successfully, it redirects them to the main citizen dashboard or admin pages.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the CitizenNavigator.tsx layer.

### Source Code:
```tsx
import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Animated, StyleSheet } from 'react-native';
import { Home, ClipboardList, User } from 'lucide-react-native';
import {
  CitizenTabParamList,
  ReportStackParamList,
  ReportsStackParamList,
  ProfileStackParamList,
} from '../types/navigation.types';
import { CitizenDashboardScreen } from '../screens/citizen/dashboard/CitizenDashboardScreen';
import { ReportTrackingScreen } from '../screens/citizen/tracking/ReportTrackingScreen';
import { ReportDetailScreen } from '../screens/citizen/tracking/ReportDetailScreen';
import { ProfileScreen } from '../screens/citizen/profile/ProfileScreen';
import { SettingsScreen } from '../screens/citizen/profile/SettingsScreen';
import { SelectCategoryScreen } from '../screens/citizen/report/SelectCategoryScreen';
import { CameraScreen } from '../screens/citizen/report/CameraScreen';
import { DescriptionScreen } from '../screens/citizen/report/DescriptionScreen';
import { ReviewSubmitScreen } from '../screens/citizen/report/ReviewSubmitScreen';
import { SafetyTipsScreen } from '../screens/citizen/report/SafetyTipsScreen';
import { Colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedTabScreen } from '../components/common/AnimatedTabScreen';
import { useSettingsStore } from '../context/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';

const Tab = createBottomTabNavigator<CitizenTabParamList>();
const Stack = createNativeStackNavigator<ReportStackParamList>();
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const ReportStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SelectCategory"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SelectCategory" component={SelectCategoryScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Description" component={DescriptionScreen} />
      <Stack.Screen name="ReviewSubmit" component={ReviewSubmitScreen} />
      <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} />
    </Stack.Navigator>
  );
};

const ReportsStackNavigator = () => {
  return (
    <ReportsStack.Navigator
      initialRouteName="ReportList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <ReportsStack.Screen name="ReportList" component={ReportTrackingScreen} />
      <ReportsStack.Screen name="ReportDetail" component={ReportDetailScreen} />
    </ReportsStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator
      initialRouteName="ProfileHome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
};

const AnimatedDashboard = () => (
  <AnimatedTabScreen>
    <CitizenDashboardScreen />
  </AnimatedTabScreen>
);

const AnimatedReports = () => (
  <AnimatedTabScreen>
    <ReportsStackNavigator />
  </AnimatedTabScreen>
);

const AnimatedProfile = () => (
  <AnimatedTabScreen>
    <ProfileStackNavigator />
  </AnimatedTabScreen>
);

const AnimatedTabBar = (props: any) => {
  const tabBarVisible = useSettingsStore((s) => s.tabBarVisible);
  const tabBarAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(tabBarAnim, {
      toValue: tabBarVisible ? 1 : 0,
      tension: 45,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [tabBarVisible]);

  const scale = tabBarAnim;
  const translateY = tabBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [45, 0],
  });
  const opacity = tabBarAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.1, 1],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        transform: [{ translateY }, { scale }],
        opacity,
        zIndex: 99,
        backgroundColor: 'transparent',
      }}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

export const CitizenNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryBlue,
        tabBarInactiveTintColor: Colors.grayText,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          backgroundColor: 'transparent',
          borderRadius: 24,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderWidth: 1,
          borderColor: 'rgba(229, 231, 235, 0.5)',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 8,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.98)', 'rgba(245, 247, 250, 0.92)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={AnimatedDashboard}
        options={{
          tabBarLabel: t('tabHome' as any) || 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={AnimatedReports}
        options={{
          tabBarLabel: t('tabReports' as any) || 'My Reports',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={AnimatedProfile}
        options={{
          tabBarLabel: t('tabProfile' as any) || 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ReportStack"
        component={ReportStackNavigator}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
};

```

---

## File: app\src\navigation\RootNavigator.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]`

**Architecture Role:**
> Mobile app screen routing navigator configuration

**Detailed Functionality:**
> This file controls the screen navigation flow of our application using React Navigation. It sets up navigation stacks and tab bars. For example, it writes logic to ensure that if a user is not logged in, they are locked in the login screen, and once they log in successfully, it redirects them to the main citizen dashboard or admin pages.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the RootNavigator.tsx layer.

### Source Code:
```tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../context/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { CitizenNavigator } from './CitizenNavigator';
import { AdminNavigator } from './AdminNavigator';
import { Colors } from '../constants/colors';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../services/notificationService';

export const RootNavigator = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated && user) {

      registerForPushNotificationsAsync();

      const subscription = Notifications.addNotificationReceivedListener((notification) => {
        const { title, body } = notification.request.content;
        Alert.alert(title || 'Alert', body || '');
      });

      // handle notification clicks
      const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log('Notification clicked with data:', data);
      });

      return () => {
        subscription.remove();
        responseSubscription.remove();
      };
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthNavigator />;
  }

  // rolebased routing gate
  if (user.role === 'admin') {
    return <AdminNavigator />;
  }

  return <CitizenNavigator />;
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

```

---

## File: app\src\screens\admin\analytics\AnalyticsScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the AnalyticsScreen.tsx layer.

### Source Code:
```tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  BarChart2, 
  Activity, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  TrendingUp
} from 'lucide-react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getAnalytics } from '../../../services/adminService';
import { Card } from '../../../components/common/Card';
import { CATEGORIES } from '../../../constants/categories';
import { useTranslation } from '../../../hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChartBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  delay: number;
}

const ChartBar: React.FC<ChartBarProps> = ({ label, value, max, color, delay }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const barWidth = useRef(new Animated.Value(0)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(barOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.spring(barWidth, {
          toValue: percentage,
          tension: 40,
          friction: 8,
          useNativeDriver: false,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  const animatedWidth = barWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.barRow, { opacity: barOpacity }]}>
      <Text style={styles.barLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            { width: animatedWidth, backgroundColor: color },
          ]}
        />
      </View>
      <View style={styles.valueWrapper}>
        <Text style={styles.barValue}>{value}</Text>
      </View>
    </Animated.View>
  );
};

interface AnimatedStatProps {
  targetValue: number;
  duration?: number;
}

const AnimatedStat: React.FC<AnimatedStatProps> = ({ targetValue, duration = 800 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animRef.setValue(0);
    const listener = animRef.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });
    Animated.timing(animRef, {
      toValue: targetValue,
      duration,
      useNativeDriver: false,
    }).start();
    return () => animRef.removeListener(listener);
  }, [targetValue]);

  return <Text style={styles.statVal}>{displayValue}</Text>;
};

interface AnimatedPieChartProps {
  data: { name: string; population: number; color: string; legendFontColor: string; legendFontSize: number }[];
  width: number;
  height: number;
  delay?: number;
}

const AnimatedPieChart: React.FC<AnimatedPieChartProps> = ({ data, width, height, delay = 600 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }, { rotate }],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PieChart
        data={data}
        width={width}
        height={height}
        chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="10"
        absolute
      />
    </Animated.View>
  );
};

export const AnalyticsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [byStatus, setByStatus] = useState<{ label: string; count: number; rawStatus: string }[]>([]);
  const [byCategory, setByCategory] = useState<{ label: string; count: number; color: string }[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;
  const statsY = useRef(new Animated.Value(15)).current;
  const chart1Y = useRef(new Animated.Value(20)).current;
  const chart2Y = useRef(new Animated.Value(20)).current;
  const contentScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-15);
    statsY.setValue(15);
    chart1Y.setValue(20);
    chart2Y.setValue(20);
    contentScale.setValue(1);
    contentOpacity.setValue(1);

    Animated.stagger(90, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(headerY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(statsY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(chart1Y, {
        toValue: 0,
        tension: 45,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(chart2Y, {
        toValue: 0,
        tension: 45,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRefresh = () => {
    Animated.parallel([
      Animated.timing(contentScale, {
        toValue: 0.85,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRefreshing(true);
      loadAnalytics(true).then(() => {
        Animated.parallel([
          Animated.spring(contentScale, {
            toValue: 1,
            tension: 85,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    });
  };

  const loadAnalytics = async (isRef = false) => {
    try {
      if (isRef) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await getAnalytics();
      setTotal(data.totalReports || 0);

      const resolved = data.byStatus.find((s: any) => s._id === 'resolved')?.count || 0;
      setResolvedCount(resolved);

      const statusData = data.byStatus.map((s: any) => {
        const raw = s._id;
        const statusKey = `status${raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_([a-z])/g, (g: string) => g[1].toUpperCase())}`;
        return {
          label: t(statusKey as any) || raw.replace('_', ' ').toUpperCase(),
          count: s.count,
          rawStatus: raw,
        };
      });
      setByStatus(statusData);

      const categoryData = data.byCategory.map((c: any) => {
        const cat = CATEGORIES.find((catItem) => catItem.id === c._id);
        const categoryLabel = cat
          ? t(cat.id as any)
          : c._id;
        return {
          label: categoryLabel,
          count: c.count,
          color: cat?.color || Colors.primaryBlue,
        };
      }).sort((a, b) => b.count - a.count);
      setByCategory(categoryData);

    } catch (error) {
      console.error('Error loading analytics screen data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (!loading) {
      runEntranceAnimation();
    }
  }, [loading]);

  const maxStatus = byStatus.reduce((max, item) => (item.count > max ? item.count : max), 0);

  const getStatusColor = (rawStatus: string) => {
    switch (rawStatus) {
      case 'submitted':
        return '#9CA3AF';
      case 'under_review':
        return '#60A5FA';
      case 'assigned':
        return '#A78BFA';
      case 'action_started':
        return '#F59E0B';
      case 'resolved':
        return '#10B981';
      default:
        return Colors.primaryBlue;
    }
  };

  const activeTickets = total - resolvedCount;

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }] }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {t('analyticsTitle' as any) || 'Overview Analytics'}
          </Text>
          <TouchableOpacity 
            style={styles.refreshBtn} 
            onPress={handleRefresh} 
            disabled={loading || refreshing}
            activeOpacity={0.8}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={Colors.primaryBlue} />
            ) : (
              <RefreshCw size={18} color={Colors.primaryBlue} />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
        </View>
      ) : (
        <Animated.View style={{ opacity: contentOpacity, transform: [{ scale: contentScale }], flex: 1, backgroundColor: 'transparent' }}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: statsY }] }}>
              <View style={styles.gridContainer}>
                <Card style={[styles.statCard, { borderLeftColor: Colors.primaryBlue, borderLeftWidth: 4 }]}>
                  <View style={styles.statIconWrapper}>
                    <BarChart2 size={20} color={Colors.primaryBlue} />
                  </View>
                  <AnimatedStat targetValue={total} />
                  <Text style={styles.statLabel}>
                    {t('totalReports' as any) || 'Total Reports'}
                  </Text>
                </Card>

                <Card style={[styles.statCard, { borderLeftColor: '#F59E0B', borderLeftWidth: 4 }]}>
                  <View style={[styles.statIconWrapper, { backgroundColor: '#FFF7ED' }]}>
                    <Clock size={20} color="#F59E0B" />
                  </View>
                  <AnimatedStat targetValue={activeTickets} />
                  <Text style={styles.statLabel}>
                    {t('pendingIssues' as any) || 'Pending Issues'}
                  </Text>
                </Card>

                <Card style={[styles.statCard, { borderLeftColor: '#10B981', borderLeftWidth: 4 }]}>
                  <View style={[styles.statIconWrapper, { backgroundColor: '#F0FDF4' }]}>
                    <CheckCircle2 size={20} color="#10B981" />
                  </View>
                  <AnimatedStat targetValue={resolvedCount} />
                  <Text style={styles.statLabel}>
                    {t('resolvedCases' as any) || 'Resolved Cases'}
                  </Text>
                </Card>
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: chart1Y }] }}>
              <View style={styles.chartSection}>
                <View style={styles.sectionHeader}>
                  <Activity size={16} color={Colors.primaryBlue} />
                  <Text style={styles.chartTitle}>
                    {t('reportsByStatus' as any) || 'Reports by Status'}
                  </Text>
                </View>
                <Card style={styles.chartCard}>
                  {byStatus.length === 0 ? (
                    <Text style={styles.emptyText}>
                      {t('noDataAvailable' as any) || 'No statistics available.'}
                    </Text>
                  ) : (
                    byStatus.map((item, index) => (
                      <ChartBar
                        key={index}
                        label={item.label}
                        value={item.count}
                        max={maxStatus}
                        color={getStatusColor(item.rawStatus)}
                        delay={400 + index * 120}
                      />
                    ))
                  )}
                </Card>
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: chart2Y }] }}>
              <View style={styles.chartSection}>
                <View style={styles.sectionHeader}>
                  <TrendingUp size={16} color={Colors.environmentalGreen} />
                  <Text style={styles.chartTitle}>
                    {t('reportsByCategory' as any) || 'Reports by Category'}
                  </Text>
                </View>
                <Card style={styles.chartCard}>
                  {byCategory.length === 0 ? (
                    <Text style={styles.emptyText}>
                      {t('noDataAvailable' as any) || 'No statistics available.'}
                    </Text>
                  ) : (
                    <AnimatedPieChart
                      data={byCategory.map((item) => ({
                        name: item.label,
                        population: item.count,
                        color: item.color,
                        legendFontColor: Colors.darkText,
                        legendFontSize: 10,
                      }))}
                      width={SCREEN_WIDTH - 64}
                      height={180}
                      delay={500}
                    />
                  )}
                </Card>
              </View>
            </Animated.View>

          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  refreshBtn: {
    padding: 6,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    gap: Colors.spacing.sm,
    marginBottom: Colors.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: 12,
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderTopLeftRadius: Colors.radius.sm,
    borderBottomLeftRadius: Colors.radius.sm,
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statVal: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
  },
  chartSection: {
    marginBottom: Colors.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Colors.spacing.xs,
    marginTop: Colors.spacing.sm,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartCard: {
    padding: Colors.spacing.md,
    gap: 14,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  barLabel: {
    width: 95,
    fontSize: 11,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    marginRight: Colors.spacing.sm,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 55,
    justifyContent: 'flex-end',
    marginLeft: Colors.spacing.sm,
  },
  barValue: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
    paddingVertical: Colors.spacing.md,
  },
});

```

---

## File: app\src\screens\admin\dashboard\AdminDashboardScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]` `[Admin Panel]` `[Management]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file implements features for the admin authority panel. It allows municipal officers to fetch reports, view analytical summaries, and coordinate resolution tasks.

### Source Code:
```tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Map, RefreshCw, BarChart2, ShieldAlert, CheckCircle, LogOut, User, X, Globe, Mail, Shield, Bell, TrendingUp, Clipboard } from 'lucide-react-native';
import { useAuthStore } from '../../../context/useAuthStore';
import { useSettingsStore } from '../../../context/useSettingsStore';
import { logout } from '../../../services/authService';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getAnalytics, getAllReports } from '../../../services/adminService';
import { AnalyticsCard } from '../../../components/admin/AnalyticsCard';
import { ReportListItem } from '../../../components/admin/ReportListItem';
import { Report } from '../../../types/report.types';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../../../hooks/useTranslation';
import { BlurView } from 'expo-blur';

const getCategoryLabelHi = (categoryId: string) => {
  switch (categoryId) {
    case 'garbage_dump':
      return 'कचरा डंप';
    case 'plastic_pollution':
      return 'प्लास्टिक प्रदूषण';
    case 'waste_accumulation':
      return 'कचरा संचय';
    case 'water_pollution':
      return 'जल प्रदूषण';
    case 'suspicious_object':
      return 'संदिग्ध वस्तु';
    case 'emergency_situation':
      return 'आपातकालीन स्थिति';
    default:
      return categoryId;
  }
};

const getRelativeTime = (timestamp: string | number, isHindi: boolean) => {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (isHindi) {
    if (mins < 1) return 'अभी-अभी';
    if (mins < 60) return `${mins} मिनट पहले`;
    if (hours < 24) return `${hours} घंटे पहले`;
    return `${days} दिन पहले`;
  } else {
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
};

type NavigationProp = NativeStackNavigationProp<any>;

export const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const { language, setLanguage } = useSettingsStore();
  const { t } = useTranslation();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    highPriority: 0,
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileVisible, setProfileVisible] = useState(false);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(0);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const notificationsAnim = useRef(new Animated.Value(0)).current;

  const isHindi = language === 'hi';
  const submittedReports = allReports.filter((r) => r.status === 'submitted');

  const notifications = submittedReports.map((report) => {
    const categoryLabel = isHindi ? getCategoryLabelHi(report.category) : report.category;
    
    const title = isHindi ? 'नई रिपोर्ट दर्ज' : 'New Incident Reported';
    const desc = isHindi 
      ? `एक नया ${categoryLabel} मामला दर्ज किया गया है। समीक्षा और कार्रवाई की आवश्यकता है।`
      : `A new report for ${categoryLabel} has been registered. Action required.`;
      
    return {
      id: report.id,
      title,
      desc,
      time: getRelativeTime(report.createdAt, isHindi),
      icon: 'clipboard',
      color: Colors.primaryBlue,
      bgColor: Colors.primaryBlue + '15',
      updatedAtTime: new Date(report.updatedAt || report.createdAt).getTime(),
    };
  });

  const hasUnseenNotifications = submittedReports.some(
    (report) => new Date(report.updatedAt || report.createdAt).getTime() > lastSeenTimestamp
  );

  useEffect(() => {
    if (submittedReports.length > 0 && lastSeenTimestamp === 0) {
      const latestTime = Math.max(...submittedReports.map(r => new Date(r.updatedAt || r.createdAt).getTime()));
      setLastSeenTimestamp(latestTime);
    }
  }, [allReports]);

  const showNotifications = () => {
    setNotificationsVisible(true);
    setLastSeenTimestamp(Date.now());
    notificationsAnim.setValue(0);
    Animated.spring(notificationsAnim, {
      toValue: 1,
      tension: 65,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const hideNotifications = () => {
    Animated.timing(notificationsAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setNotificationsVisible(false);
    });
  };

  const handleNotificationPress = (reportId: string) => {
    hideNotifications();
    navigation.navigate('Reports', {
      screen: 'ReportDetail',
      params: { reportId },
    });
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const statsY = useRef(new Animated.Value(20)).current;
  const listY = useRef(new Animated.Value(20)).current;
  const mapScale = useRef(new Animated.Value(0.95)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const listScale = useRef(new Animated.Value(1)).current;
  const listOpacity = useRef(new Animated.Value(1)).current;
  const statsScale = useRef(new Animated.Value(1)).current;
  const statsOpacity = useRef(new Animated.Value(1)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  const lastScrollY = useRef(0);
  const setTabBarVisible = useSettingsStore((s) => s.setTabBarVisible);

  useEffect(() => {
    setTabBarVisible(true);
    return () => setTabBarVisible(true);
  }, []);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (Math.abs(currentOffset - lastScrollY.current) > 15) {
      if (currentOffset > lastScrollY.current && currentOffset > 60) {
        setTabBarVisible(false);
      } else {
        setTabBarVisible(true);
      }
      lastScrollY.current = currentOffset;
    }
  };

  const showProfile = () => {
    setProfileVisible(true);
    modalAnim.setValue(0);
    Animated.spring(modalAnim, {
      toValue: 1,
      tension: 65,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const hideProfile = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setProfileVisible(false);
    });
  };

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    statsY.setValue(20);
    listY.setValue(20);
    mapScale.setValue(0.95);
    listScale.setValue(1);
    listOpacity.setValue(1);
    statsScale.setValue(1);
    statsOpacity.setValue(1);

    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(mapScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(statsY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(listY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const runFloatingAnimation = () => {
    floatAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const runWaveAnimation = () => {
    waveAnim.setValue(0);
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  const handleRefresh = () => {
    Animated.parallel([
      Animated.timing(listScale, {
        toValue: 0.85,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(listOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(statsScale, {
        toValue: 0.85,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(statsOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      })
    ]).start(async () => {
      await loadDashboardData();
      Animated.stagger(100, [
        Animated.parallel([
          Animated.spring(statsScale, {
            toValue: 1,
            tension: 85,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(statsOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]),
        Animated.parallel([
          Animated.spring(listScale, {
            toValue: 1,
            tension: 85,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(listOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ])
      ]).start();
    });
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, reportsData] = await Promise.all([
        getAnalytics(),
        getAllReports({ limit: 50 }),
      ]);

      const total = analyticsData.totalReports;
      const resolved = analyticsData.byStatus.find((s) => s._id === 'resolved')?.count || 0;
      const pending = total - resolved;

      const highCategoryCount =
        analyticsData.byCategory.find((c) => c._id === 'emergency_situation')?.count || 0;

      setStats({
        total,
        pending,
        resolved,
        highPriority: highCategoryCount,
      });
      
      const reportsList = reportsData.reports || [];
      setAllReports(reportsList);
      setRecentReports(reportsList.slice(0, 5));
    } catch (error) {
      console.error('Error loading admin dashboard details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    runEntranceAnimation();
    runFloatingAnimation();
    runWaveAnimation();
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
      runEntranceAnimation();
      runFloatingAnimation();
      runWaveAnimation();
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const mapTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const waveScale1 = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.08],
  });
  const waveOpacity1 = waveAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0.3, 0.15, 0],
  });
  const waveScale2 = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.0, 1.0, 1.08],
  });
  const waveOpacity2 = waveAnim.interpolate({
    inputRange: [0, 0.5, 0.9, 1],
    outputRange: [0, 0.3, 0.15, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>

        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: statsY }] }]}>
          <View style={{ flex: 1, marginRight: Colors.spacing.sm }}>
            <Text style={styles.greeting}>{t('authorityHub')}</Text>
            <Text style={styles.adminName}>{t('welcomeOfficer')}{user?.name || 'Officer'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationBtn} onPress={showNotifications} activeOpacity={0.8}>
              <Bell size={20} color={Colors.primaryBlue} />
              {hasUnseenNotifications && <View style={styles.badgeDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileBtn} onPress={showProfile} activeOpacity={0.8}>
              <User size={20} color={Colors.primaryBlue} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <LogOut size={20} color={Colors.alertOrange} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.mapCtaContainer, { opacity: fadeAnim, transform: [{ scale: mapScale }, { translateY: mapTranslateY }] }]}>
          <Animated.View
            style={[
              styles.mapCtaWave,
              {
                transform: [{ scale: waveScale1 }],
                opacity: waveOpacity1,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.mapCtaWave,
              {
                transform: [{ scale: waveScale2 }],
                opacity: waveOpacity2,
              },
            ]}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('Map')}
            activeOpacity={0.85}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mapCta}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Colors.spacing.md,
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  borderWidth: 0,
                }}
              >
                <Map size={24} color={Colors.white} />
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0)', borderWidth: 0 }}>
                  <Text style={styles.mapCtaTitle}>{t('incidentLiveMap')}</Text>
                  <Text style={styles.mapCtaSub} numberOfLines={2}>
                    {t('liveMapDesc')}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: statsY }] }}>
          <Text style={styles.sectionTitle}>{t('overviewAnalytics')}</Text>
          <Animated.View style={{ opacity: statsOpacity, transform: [{ scale: statsScale }], backgroundColor: 'transparent' }}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primaryBlue} style={styles.loader} />
            ) : (
              <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                  <AnalyticsCard
                    count={stats.total}
                    label={t('totalReports')}
                    iconName="BarChart2"
                    iconColor={Colors.primaryBlue}
                    bgColor="#EFF6FF"
                  />
                  <AnalyticsCard
                    count={stats.pending}
                    label={t('pendingIssues')}
                    iconName="ShieldAlert"
                    iconColor={Colors.alertOrange}
                    bgColor="#FFF7ED"
                  />
                </View>
                <View style={styles.statsRow}>
                  <AnalyticsCard
                    count={stats.resolved}
                    label={t('resolvedCases')}
                    iconName="CheckCircle"
                    iconColor={Colors.environmentalGreen}
                    bgColor="#F0FDF4"
                  />
                  <AnalyticsCard
                    count={stats.highPriority}
                    label={t('safetyEmergencies')}
                    iconName="ShieldAlert"
                    iconColor={Colors.alertOrange}
                    bgColor="#FFFBEB"
                  />
                </View>
              </View>
            )}
          </Animated.View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: listY }] }}>
          <View style={styles.reportsHeader}>
            <Text style={styles.sectionTitle}>{t('recentIncidents')}</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
              <RefreshCw size={14} color={Colors.primaryBlue} />
              <Text style={styles.refreshText}>{t('refresh')}</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={{ opacity: listOpacity, transform: [{ scale: listScale }], backgroundColor: 'transparent' }}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primaryBlue} style={styles.loader} />
            ) : recentReports.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  {isHindi ? 'वर्तमान में किसी रिपोर्ट पर ध्यान देने की आवश्यकता नहीं है।' : 'No reports require attention right now.'}
                </Text>
              </View>
            ) : (
              <View style={styles.reportsList}>
                {recentReports.map((report) => (
                  <ReportListItem
                    key={report.id}
                    report={report}
                    onPress={() =>
                      navigation.navigate('Reports', {
                        screen: 'ReportDetail',
                        params: { reportId: report.id },
                      })
                    }
                  />
                ))}
              </View>
            )}
          </Animated.View>
        </Animated.View>

      </ScrollView>

      <Modal
        visible={profileVisible}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
        onRequestClose={hideProfile}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideProfile}
        >
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: modalAnim }]}>
            <BlurView
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.28)' }]}
              intensity={35}
              tint="dark"
              experimentalBlurMethod={"regular" as any}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: modalAnim,
                transform: [
                  { scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.93, 1] }) },
                  { translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) }
                ]
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('officerProfile')}</Text>
              <TouchableOpacity onPress={hideProfile}>
                <X size={20} color={Colors.grayText} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'OF'}
                </Text>
              </View>
              <Text style={styles.profileName}>{user?.name || 'Officer'}</Text>
              <View style={styles.roleBadge}>
                <Shield size={12} color={Colors.primaryBlue} style={{ marginRight: 4 }} />
                <Text style={styles.roleBadgeText}>{isHindi ? 'अधिकारी / एडमिन' : 'Officer / Admin'}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Mail size={16} color={Colors.grayText} style={{ marginRight: 8 }} />
                <Text style={styles.detailText}>{user?.phone || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.settingsSection}>
              <Text style={styles.settingsTitle}>{t('appLanguage')}</Text>
              <View style={styles.languageToggleContainer}>
                <TouchableOpacity
                  style={[styles.langBtn, language === 'en' ? styles.langBtnActive : null]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={[styles.langText, language === 'en' ? styles.langTextActive : null]}>EN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langBtn, language === 'hi' ? styles.langBtnActive : null]}
                  onPress={() => setLanguage('hi')}
                >
                  <Text style={[styles.langText, language === 'hi' ? styles.langTextActive : null]}>HI</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalLogoutBtn}
              onPress={() => {
                hideProfile();
                handleLogout();
              }}
              activeOpacity={0.8}
            >
              <LogOut size={16} color={Colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.modalLogoutText}>{t('logOutBtn')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={notificationsVisible}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
        onRequestClose={hideNotifications}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideNotifications}
        >
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: notificationsAnim }]}>
            <BlurView
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.22)' }]}
              intensity={25}
              tint="dark"
              experimentalBlurMethod={"regular" as any}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: notificationsAnim,
                transform: [
                  { scale: notificationsAnim.interpolate({ inputRange: [0, 1], outputRange: [0.93, 1] }) },
                  { translateY: notificationsAnim.interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) }
                ]
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('notifications')}</Text>
              <TouchableOpacity onPress={hideNotifications}>
                <X size={20} color={Colors.grayText} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationScroll} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotificationsContainer}>
                  <Bell size={40} color={Colors.grayText + '44'} style={{ marginBottom: 10 }} />
                  <Text style={styles.emptyNotificationsText}>
                    {isHindi ? 'कोई नई सूचना नहीं' : 'No new notifications'}
                  </Text>
                  <Text style={styles.emptyNotificationsSub}>
                    {isHindi 
                      ? 'जब नए मामले दर्ज होंगे तो हम आपको सूचित करेंगे।' 
                      : "We'll alert you when there are new reports filed in your jurisdiction."}
                  </Text>
                </View>
              ) : (
                notifications.map((item, index) => {
                  return (
                    <View key={item.id}>
                      {index > 0 && <View style={styles.notificationDivider} />}
                      <TouchableOpacity
                        style={styles.notificationItem}
                        onPress={() => handleNotificationPress(item.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.notificationIconContainer, { backgroundColor: item.bgColor }]}>
                          <Clipboard size={18} color={item.color} />
                        </View>
                        <View style={styles.notificationContent}>
                          <Text style={styles.notificationItemTitle}>{item.title}</Text>
                          <Text style={styles.notificationItemDesc}>{item.desc}</Text>
                          <Text style={styles.notificationItemTime}>{item.time}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
  },
  greeting: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  adminName: {
    fontSize: 13,
    color: Colors.grayText,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadow.soft,
  },
  mapCtaContainer: {
    position: 'relative',
    marginBottom: Colors.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  mapCtaWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  mapCta: {
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Colors.shadow.medium,
  },
  mapCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Colors.spacing.md,
    flex: 1,
  },
  mapCtaTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  mapCtaSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loader: {
    marginVertical: Colors.spacing.lg,
  },
  statsContainer: {
    gap: 8,
    marginBottom: Colors.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.xs,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshText: {
    fontSize: 12,
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.grayText,
  },
  reportsList: {
    marginTop: Colors.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Colors.spacing.lg,
  },
  modalCard: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.lg,
    padding: Colors.spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: Colors.spacing.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryBlue,
    marginBottom: Colors.spacing.sm,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
  },
  profileName: {
    fontSize: 17,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: Colors.spacing.md,
  },
  detailsSection: {
    paddingVertical: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.grayText,
  },
  settingsSection: {
    marginBottom: Colors.spacing.md,
  },
  settingsTitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  languageToggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  langBtn: {
    flex: 1,
    height: 38,
    borderRadius: Colors.radius.sm,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langBtnActive: {
    backgroundColor: Colors.primaryBlue,
    borderColor: Colors.primaryBlue,
  },
  langText: {
    fontSize: 12,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.bold,
  },
  langTextActive: {
    color: Colors.white,
  },
  modalLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.alertOrange,
    height: 44,
    borderRadius: Colors.radius.sm,
    marginTop: Colors.spacing.sm,
  },
  modalLogoutText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
    fontSize: 14,
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    ...Colors.shadow.soft,
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.alertOrange,
  },
  notificationScroll: {
    marginTop: Colors.spacing.xs,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Colors.spacing.xs,
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Colors.spacing.md,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 2,
  },
  notificationItemDesc: {
    fontSize: 12,
    color: Colors.grayText,
    lineHeight: 16,
    marginBottom: 4,
  },
  notificationItemTime: {
    fontSize: 10,
    color: Colors.grayText + '99',
  },
  notificationDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: Colors.spacing.sm,
  },
  emptyNotificationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Colors.spacing.xl,
  },
  emptyNotificationsText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    marginBottom: 4,
  },
  emptyNotificationsSub: {
    fontSize: 12,
    color: Colors.grayText,
    textAlign: 'center',
    paddingHorizontal: Colors.spacing.lg,
  },
});

```

---

## File: app\src\screens\admin\map\LiveMapScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the LiveMapScreen.tsx layer.

### Source Code:
```tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  Linking,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X, Navigation, Filter, Layers } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getAllReports } from '../../../services/adminService';
import { getCurrentLocation } from '../../../services/locationService';
import { Card } from '../../../components/common/Card';
import { Report } from '../../../types/report.types';
import { CATEGORIES } from '../../../constants/categories';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSettingsStore } from '../../../context/useSettingsStore';

type NavigationProp = NativeStackNavigationProp<any>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DEFAULT_REGION = {
  latitude: 18.9400,
  longitude: 72.8200,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export const LiveMapScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(DEFAULT_REGION);

  const lastScrollY = useRef(0);
  const setTabBarVisible = useSettingsStore((s) => s.setTabBarVisible);

  useEffect(() => {
    setTabBarVisible(true);
    return () => setTabBarVisible(true);
  }, []);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (Math.abs(currentOffset - lastScrollY.current) > 15) {
      if (currentOffset > lastScrollY.current && currentOffset > 60) {
        setTabBarVisible(false);
      } else {
        setTabBarVisible(true);
      }
      lastScrollY.current = currentOffset;
    }
  };
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-20)).current;
  const filterY = useRef(new Animated.Value(-10)).current;
  const listY = useRef(new Animated.Value(20)).current;
  const listScale = useRef(new Animated.Value(1)).current;
  const listOpacity = useRef(new Animated.Value(1)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-20);
    filterY.setValue(-10);
    listY.setValue(20);
    listScale.setValue(1);
    listOpacity.setValue(1);

    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(headerY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(filterY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(listY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const updateStatusFilter = (newStatus: 'all' | 'pending' | 'resolved') => {
    Animated.parallel([
      Animated.timing(listScale, {
        toValue: 0.9,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(listOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStatusFilter(newStatus);
      Animated.parallel([
        Animated.spring(listScale, {
          toValue: 1,
          tension: 90,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const updateCategoryFilter = (newCategory: string) => {
    Animated.parallel([
      Animated.timing(listScale, {
        toValue: 0.9,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(listOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCategoryFilter(newCategory);
      Animated.parallel([
        Animated.spring(listScale, {
          toValue: 1,
          tension: 90,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && report.status !== 'resolved') ||
      (statusFilter === 'resolved' && report.status === 'resolved');

    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;

    return matchesStatus && matchesCategory;
  });

  const initMapData = async () => {
    try {
      setLoading(true);

      const loc = await getCurrentLocation();
      if (loc) {
        setRegion({
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      }

      const data = await getAllReports({ limit: 100 });
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching live map details:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        runEntranceAnimation();
      }, 50);
    }
  };

  useEffect(() => {
    initMapData();
  }, []);

  const handleMarkerPress = (report: Report) => {
    setSelectedReport(report);
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
          <Text style={styles.loaderText}>    Loading live map coordinates...</Text>
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: Colors.spacing.md, paddingTop: insets.top + Colors.spacing.md, backgroundColor: Colors.background }}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Colors.spacing.sm }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.darkText }}>{t('incidentTracker')}</Text>
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <X size={20} color={Colors.darkText} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: filterY }], zIndex: 10 }}>
            <View style={styles.filterSection}>
              <View style={styles.statusRow}>
                <Filter size={16} color={Colors.grayText} style={{ marginRight: 6 }} />
                {(['all', 'pending', 'resolved'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusTab,
                      statusFilter === status && styles.statusTabActive,
                    ]}
                    onPress={() => updateStatusFilter(status)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.statusTabText,
                        statusFilter === status && styles.statusTabTextActive,
                      ]}
                    >
                      {status === 'all'
                        ? t('all')
                        : status === 'pending'
                          ? t('pending')
                          : t('resolved')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryScrollContent}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    categoryFilter === 'all' && styles.categoryChipActive,
                  ]}
                  onPress={() => updateCategoryFilter('all')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      categoryFilter === 'all' && styles.categoryChipTextActive,
                    ]}
                  >
                    {t('allCategories')}
                  </Text>
                </TouchableOpacity>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      categoryFilter === cat.id && styles.categoryChipActive,
                    ]}
                    onPress={() => updateCategoryFilter(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        categoryFilter === cat.id && styles.categoryChipTextActive,
                      ]}
                    >
                      {t(cat.id as any)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: listY }], flex: 1, width: '100%' }}>
            <Animated.View style={{ opacity: listOpacity, transform: [{ scale: listScale }], flex: 1, width: '100%', backgroundColor: 'transparent' }}>
              {filteredReports.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Colors.spacing.lg }}>
                  <Text style={{ fontSize: 14, color: Colors.grayText, textAlign: 'center' }}>{t('noIncidentsFound')}</Text>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Colors.spacing.xl }} onScroll={handleScroll} scrollEventThrottle={16}>
                  {filteredReports.map((report) => {
                    const matchedCat = CATEGORIES.find(c => c.id === report.category);
                    return (
                      <Card key={report.id} style={{ padding: Colors.spacing.md, marginBottom: Colors.spacing.sm }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: Colors.darkText }}>
                              {matchedCat ? t(matchedCat.id as any) : report.category}
                            </Text>
                            <Text style={{ fontSize: 12, color: Colors.grayText, marginTop: 2 }}>
                              GPS: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                            </Text>
                          </View>
                          <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: Colors.radius.sm,
                            backgroundColor: report.status === 'resolved' ? '#ECFDF5' : '#FEF3C7'
                          }}>
                            <Text style={{
                              fontSize: 10,
                              fontWeight: 'bold',
                              color: report.status === 'resolved' ? '#059669' : '#D97706'
                            }}>
                              {getStatusLabel(report.status)}
                            </Text>
                          </View>
                        </View>

                        {report.description ? (
                          <Text style={{ fontSize: 13, color: Colors.darkText, marginTop: Colors.spacing.xs, lineHeight: 18 }} numberOfLines={2}>
                            {report.description}
                          </Text>
                        ) : null}

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: Colors.spacing.sm }}>
                          <TouchableOpacity
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: Colors.primaryBlue,
                              borderRadius: Colors.radius.sm,
                              paddingVertical: 8,
                              paddingHorizontal: Colors.spacing.md,
                              gap: 6
                            }}
                            activeOpacity={0.8}
                            onPress={() => {
                              const url = Platform.select({
                                ios: `maps:0,0?q=${report.latitude},${report.longitude}`,
                                android: `geo:0,0?q=${report.latitude},${report.longitude}(Incident)`,
                              }) || `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;
                              Linking.openURL(url).catch((err) => console.error('Failed to open map app:', err));
                            }}
                          >
                            <Navigation size={14} color={Colors.white} />
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: Colors.white }}>
                              {t('openMap')}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: Colors.white,
                              borderColor: '#E5E7EB',
                              borderWidth: 1,
                              borderRadius: Colors.radius.sm,
                              paddingVertical: 8,
                              paddingHorizontal: Colors.spacing.md,
                              justifyContent: 'center'
                            }}
                            activeOpacity={0.8}
                            onPress={() => {
                              navigation.navigate('Reports', {
                                screen: 'ReportDetail',
                                params: { reportId: report.id },
                              });
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: 'semibold', color: Colors.darkText }}>
                              {t('viewDetails')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </Card>
                    );
                  })}
                </ScrollView>
              )}
            </Animated.View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterSection: {
    marginBottom: Colors.spacing.md,
    backgroundColor: Colors.white,
    padding: Colors.spacing.sm,
    borderRadius: Colors.radius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Colors.spacing.sm,
    paddingHorizontal: 2,
  },
  statusTab: {
    flex: 1,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusTabActive: {
    backgroundColor: Colors.primaryBlue,
    borderColor: Colors.primaryBlue,
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
  },
  statusTabTextActive: {
    color: Colors.white,
  },
  categoryScroll: {
    marginTop: 2,
  },
  categoryScrollContent: {
    paddingHorizontal: 2,
    paddingRight: 10,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 6,
  },
  categoryChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grayText,
  },
  categoryChipTextActive: {
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.bold,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Colors.spacing.sm,
  },
  loaderText: {
    fontSize: 13,
    color: Colors.grayText,
  },
  mapWrapper: {
    flex: 1,
  },
  floatingClose: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: Colors.spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadow.medium,
  },
  previewPanel: {
    position: 'absolute',
    bottom: Colors.spacing.lg,
    left: Colors.spacing.md,
    right: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    ...Colors.shadow.medium,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 6,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  panelContent: {
    flexDirection: 'row',
    marginBottom: Colors.spacing.md,
  },
  panelThumbnail: {
    width: 60,
    height: 60,
    borderRadius: Colors.radius.sm,
    backgroundColor: '#E5E7EB',
  },
  panelMeta: {
    flex: 1,
    marginLeft: Colors.spacing.md,
    justifyContent: 'center',
  },
  panelCategory: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  panelStatus: {
    fontSize: 12,
    color: Colors.grayText,
    marginTop: 2,
  },
  statusBold: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
  },
  panelCoords: {
    fontSize: 11,
    color: Colors.grayText,
    marginTop: 4,
  },
  detailsBtn: {
    height: 44,
    borderRadius: Colors.radius.sm,
    backgroundColor: Colors.primaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  detailsBtnText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
    fontSize: 14,
  },
});

```

---

## File: app\src\screens\admin\reports\AdminReportDetailScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]` `[Admin Panel]` `[Management]` `[Issue Reporting]` `[Data Flow]` `[AI Model]` `[Gemini API]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file implements features for the admin authority panel. It allows municipal officers to fetch reports, view analytical summaries, and coordinate resolution tasks.

### Source Code:
```tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, User, Calendar, MapPin, CheckSquare } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getReportById } from '../../../services/reportService';
import { updateReportStatus } from '../../../services/adminService';
import { useAuthStore } from '../../../context/useAuthStore';
import { StatusUpdater } from '../../../components/admin/StatusUpdater';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Report, StatusHistory } from '../../../types/report.types';
import { CATEGORIES } from '../../../constants/categories';
import { ReportsStackParamList } from '../../../types/navigation.types';
import { useSettingsStore } from '../../../context/useSettingsStore';
import { useTranslation } from '../../../hooks/useTranslation';

type NavigationProp = NativeStackNavigationProp<ReportsStackParamList, 'ReportDetail'>;
type ScreenRouteProp = RouteProp<ReportsStackParamList, 'ReportDetail'>;

export const AdminReportDetailScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { reportId } = route.params;

  const currentAdmin = useAuthStore((s) => s.user);
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';

  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const lastScrollY = useRef(0);
  const setTabBarVisible = useSettingsStore((s) => s.setTabBarVisible);

  useEffect(() => {
    setTabBarVisible(true);
    return () => setTabBarVisible(true);
  }, []);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (Math.abs(currentOffset - lastScrollY.current) > 15) {
      if (currentOffset > lastScrollY.current && currentOffset > 60) {
        setTabBarVisible(false);
      } else {
        setTabBarVisible(true);
      }
      lastScrollY.current = currentOffset;
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(20)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    contentY.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(contentY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (!loading && report) {
      runEntranceAnimation();
    }
  }, [loading]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const data = await getReportById(reportId);
      setReport(data.report);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching admin report details:', error);
      Alert.alert(
        t('error' as any) || 'Error',
        isHindi ? 'रिपोर्ट विवरण लोड करने में विफल।' : 'Failed to load report details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadReportData();
    });
    return unsubscribe;
  }, [navigation, reportId]);

  const handleAssignToMe = async () => {
    if (!report || !currentAdmin) return;
    setAssigning(true);
    try {
      await updateReportStatus(report.id, report.status, 'Assigned to officer: ' + currentAdmin.name, currentAdmin.id);
      Alert.alert(
        isHindi ? 'आवंटित' : 'Assigned',
        isHindi ? 'यह घटना रिपोर्ट आपको सौंप दी गई है।' : 'Incident report has been assigned to you.'
      );
      loadReportData();
    } catch (error: any) {
      console.error('Error self-assigning report:', error);
      Alert.alert(
        isHindi ? 'आवंटन विफल' : 'Assignment Failed',
        error.message || 'An error occurred.'
      );
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {isHindi ? 'रिपोर्ट नहीं मिली।' : 'Report not found.'}
        </Text>
      </SafeAreaView>
    );
  }

  const categoryItem = CATEGORIES.find((c) => c.id === report.category);
  const categoryLabel = categoryItem
    ? t(categoryItem.id as any)
    : report.category;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return { bg: '#F3F4F6', text: '#374151', label: t('statusSubmitted' as any) || 'Submitted' };
      case 'under_review':
        return { bg: '#FEF3C7', text: '#D97706', label: t('statusUnderReview' as any) || 'Under Review' };
      case 'assigned':
        return { bg: '#DBEAFE', text: '#2563EB', label: t('statusAssigned' as any) || 'Assigned' };
      case 'action_started':
        return { bg: '#FFEDD5', text: '#EA580C', label: t('statusActionStarted' as any) || 'In Progress' };
      case 'resolved':
        return { bg: '#D1FAE5', text: '#059669', label: t('statusResolved' as any) || 'Resolved' };
      default:
        return { bg: '#F3F4F6', text: '#374151', label: status.toUpperCase() };
    }
  };

  const formattedDate = new Date(report.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isAssignedToMe = report.assignedAdminId === currentAdmin?.id;

  const userIdStr = typeof report.userId === 'object' && report.userId 
    ? ((report.userId as any).id || (report.userId as any)._id || '') 
    : (report.userId || '');
  const userDisplayId = userIdStr ? userIdStr.slice(-6) : 'Unknown';

  const resolvedEvent = history.find((h) => h.status === 'resolved');
  const badgeConfig = getStatusBadge(report.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('ReportList')}>
          <ArrowLeft size={20} color={Colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isHindi ? 'समीक्षा: ' : 'Review: '}{categoryLabel}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: contentY }], flex: 1, backgroundColor: 'transparent' }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
          
          <View style={styles.statusBadgeRow}>
            <View style={[styles.badgeContainer, { backgroundColor: badgeConfig.bg }]}>
              <Text style={[styles.badgeText, { color: badgeConfig.text }]}>
                ● {badgeConfig.label}
              </Text>
            </View>
          </View>

          <View style={styles.imageContainer}>
            <Image source={{ uri: report.imageURL }} style={styles.mainImage} />
          </View>

          {report.status !== 'resolved' ? (
            <View style={styles.actionsPanel}>
              {!isAssignedToMe ? (
                <Button
                  title={t('assignToMe' as any) || 'Assign to Me'}
                  onPress={handleAssignToMe}
                  loading={assigning}
                  variant="outline"
                  style={styles.actionBtn}
                />
              ) : (
                <View style={styles.ownershipBadge}>
                  <Text style={styles.ownershipText}>
                    {isHindi ? '✓ आपको आवंटित' : '✓ Assigned to You'}
                  </Text>
                </View>
              )}

              {report.status === 'action_started' && (
                <Button
                  title={isHindi ? 'घटना हल करें' : 'Resolve Incident'}
                  onPress={() => navigation.navigate('UploadResolution', { reportId: report.id })}
                  variant="secondary"
                  style={styles.actionBtn}
                />
              )}
            </View>
          ) : null}

          {report.status !== 'resolved' && (
            <StatusUpdater
              reportId={report.id}
              currentStatus={report.status}
              onStatusUpdated={loadReportData}
            />
          )}

          {report.status === 'resolved' && (
            <View style={styles.resolutionContainer}>
              <Text style={styles.sectionTitle}>
                {isHindi ? 'समाधान का विवरण' : 'Resolution Details'}
              </Text>
              <Card style={styles.detailsCard}>
                <View style={styles.resolutionHeader}>
                  <CheckSquare size={18} color="#059669" />
                  <Text style={styles.resolutionTitle}>
                    {isHindi ? 'मामला सुलझ गया' : 'Issue Resolved'}
                  </Text>
                </View>

                <View style={styles.descriptionBlock}>
                  <Text style={styles.descriptionLabel}>
                    {isHindi ? 'आधिकारिक समाधान टिप्पणी' : 'Official Resolution Remarks'}
                  </Text>
                  <Text style={styles.descriptionText}>
                    {report.resolutionNotes || (isHindi ? 'कोई समाधान नोट नहीं दिया गया है।' : 'No resolution notes provided.')}
                  </Text>
                </View>

                {resolvedEvent && (
                  <View style={styles.resolverBlock}>
                    <Text style={styles.resolverLabel}>
                      {isHindi ? 'द्वारा सुलझाया गया: ' : 'Resolved by: '}<Text style={styles.resolverValue}>{resolvedEvent.changedBy.name}</Text>
                    </Text>
                    <Text style={styles.resolverDate}>
                      {isHindi ? 'दिनांक: ' : 'Date: '}{new Date(resolvedEvent.changedAt).toLocaleString()}
                    </Text>
                  </View>
                )}
              </Card>

              {report.resolutionImage ? (
                <View style={{ marginTop: Colors.spacing.md }}>
                  <Text style={styles.sectionTitle}>
                    {isHindi ? 'समाधान प्रमाण फोटो' : 'Resolution Proof Photo'}
                  </Text>
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: report.resolutionImage }} style={styles.mainImage} />
                  </View>
                </View>
              ) : null}
            </View>
          )}

          <Text style={styles.sectionTitle}>{t('reportDetails' as any) || 'Report Details'}</Text>
          <Card style={styles.detailsCard}>
            <View style={styles.metaRow}>
              <User size={16} color={Colors.grayText} />
              <Text style={styles.metaText}>
                {isHindi ? `रिपोर्टर संदर्भ: उपयोगकर्ता_${userDisplayId}` : `Reporter Reference: User_${userDisplayId}`}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Calendar size={16} color={Colors.grayText} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <MapPin size={16} color={Colors.grayText} />
              <Text style={styles.metaText}>
                {isHindi ? 'जीपीएस निर्देशांक: ' : 'GPS Coordinates: '}{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
              </Text>
            </View>

            {report.description ? (
              <View style={styles.descriptionBlock}>
                <Text style={styles.descriptionLabel}>
                  {isHindi ? 'नागरिक का विवरण' : 'Citizen Description'}
                </Text>
                <Text style={styles.descriptionText}>{report.description}</Text>
              </View>
            ) : null}
          </Card>

          <Text style={styles.sectionTitle}>
            {isHindi ? 'घटना का स्थान' : 'Incident Location'}
          </Text>
          <Card style={styles.detailsCard}>
            <Text style={{ fontSize: 13, color: Colors.darkText, marginBottom: Colors.spacing.sm, lineHeight: 18 }}>
              {isHindi 
                ? `यह घटना जीपीएस निर्देशांक: ${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)} पर दर्ज की गई थी। आप नेविगेशन के लिए अपने डिवाइस के नक्शे के एप्लिकेशन में सीधे इस स्थान को खोल सकते हैं।`
                : `This incident was reported at GPS coordinates: ${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}. You can open this location directly in your device's native maps application for navigation.`
              }
            </Text>
            <Button
              title={t('openMap' as any) || 'Open Map'}
              onPress={() => {
                const url = Platform.select({
                  ios: `maps:0,0?q=${report.latitude},${report.longitude}`,
                  android: `geo:0,0?q=${report.latitude},${report.longitude}(Incident)`,
                }) || `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;
                Linking.openURL(url).catch((err) => console.error('Failed to open map app:', err));
              }}
              variant="outline"
            />
          </Card>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 14,
    color: Colors.grayText,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Colors.spacing.md,
  },
  placeholder: {
    width: 28,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: 110,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: Colors.radius.md,
    overflow: 'hidden',
    marginBottom: Colors.spacing.md,
    ...Colors.shadow.soft,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadgeRow: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: Colors.spacing.md,
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  resolutionContainer: {
    width: '100%',
    marginBottom: Colors.spacing.md,
  },
  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Colors.spacing.md,
  },
  resolutionTitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#059669',
  },
  resolverBlock: {
    marginTop: Colors.spacing.md,
    paddingTop: Colors.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resolverLabel: {
    fontSize: 13,
    color: Colors.darkText,
  },
  resolverValue: {
    fontWeight: 'bold',
  },
  resolverDate: {
    fontSize: 11,
    color: Colors.grayText,
    marginTop: 4,
  },
  actionsPanel: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Colors.spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 48,
  },
  ownershipBadge: {
    flex: 1,
    height: 48,
    borderRadius: Colors.radius.md,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownershipText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
    marginTop: Colors.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsCard: {
    padding: Colors.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Colors.spacing.sm,
  },
  metaText: {
    fontSize: 13,
    color: Colors.darkText,
  },
  descriptionBlock: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: Colors.spacing.sm,
    marginTop: Colors.spacing.xs,
  },
  descriptionLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: Colors.darkText,
    lineHeight: 18,
  },
  mapContainer: {
    width: '100%',
    height: 150,
    borderRadius: Colors.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: Colors.spacing.xs,
    ...Colors.shadow.soft,
  },
});

```

---

## File: app\src\screens\admin\reports\ReportListScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]` `[Issue Reporting]` `[Data Flow]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file manages the user reports. It handles report submissions, image uploads, GPS coordinates tagging (latitude/longitude), and status progress timeline updates.

### Source Code:
```tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, X, Filter } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getAllReports } from '../../../services/adminService';
import { ReportListItem } from '../../../components/admin/ReportListItem';
import { Report, ReportStatus } from '../../../types/report.types';
import { CATEGORIES } from '../../../constants/categories';
import { useSettingsStore } from '../../../context/useSettingsStore';
import { useTranslation } from '../../../hooks/useTranslation';

const STATUS_FILTERS: { id: 'all' | ReportStatus; key: string; defaultLabel: string }[] = [
  { id: 'all', key: 'statusAll', defaultLabel: 'All Statuses' },
  { id: 'submitted', key: 'statusSubmitted', defaultLabel: 'Submitted' },
  { id: 'under_review', key: 'statusUnderReview', defaultLabel: 'Under Review' },
  { id: 'assigned', key: 'statusAssigned', defaultLabel: 'Assigned' },
  { id: 'action_started', key: 'statusActionStarted', defaultLabel: 'In Progress' },
  { id: 'resolved', key: 'statusResolved', defaultLabel: 'Resolved' },
];

const DEPT_FILTERS = [
  { id: 'all', key: 'deptAll', defaultLabel: 'All Departments' },
  { id: 'Municipal Sanitation', key: 'deptSanitation', defaultLabel: 'Municipal Sanitation' },
  { id: 'Police/Emergency', key: 'deptPolice', defaultLabel: 'Police/Emergency' },
];

export const ReportListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [selectedStatus, setSelectedStatus] = useState<'all' | ReportStatus>('all');
  const [selectedDept, setSelectedDept] = useState('all');

  const lastScrollY = useRef(0);
  const setTabBarVisible = useSettingsStore((s) => s.setTabBarVisible);

  useEffect(() => {
    setTabBarVisible(true);
    return () => setTabBarVisible(true);
  }, []);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (Math.abs(currentOffset - lastScrollY.current) > 15) {
      if (currentOffset > lastScrollY.current && currentOffset > 60) {
        setTabBarVisible(false);
      } else {
        setTabBarVisible(true);
      }
      lastScrollY.current = currentOffset;
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;
  const searchY = useRef(new Animated.Value(-10)).current;
  const filterY = useRef(new Animated.Value(-10)).current;
  const listY = useRef(new Animated.Value(20)).current;
  const listScale = useRef(new Animated.Value(1)).current;
  const listOpacity = useRef(new Animated.Value(1)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-15);
    searchY.setValue(-10);
    filterY.setValue(-10);
    listY.setValue(20);
    listScale.setValue(1);
    listOpacity.setValue(1);

    Animated.stagger(70, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(headerY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(searchY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(filterY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(listY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateFilterChange = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(listScale, {
        toValue: 0.9,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(listOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      Animated.parallel([
        Animated.spring(listScale, {
          toValue: 1,
          tension: 90,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleStatusChange = (status: 'all' | ReportStatus) => {
    animateFilterChange(() => setSelectedStatus(status));
  };

  const handleDeptChange = (dept: string) => {
    animateFilterChange(() => setSelectedDept(dept));
  };

  const handleRefresh = () => {
    Animated.parallel([
      Animated.timing(listScale, {
        toValue: 0.85,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(listOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRefreshing(true);
      fetchReportsData(true).then(() => {
        Animated.parallel([
          Animated.spring(listScale, {
            toValue: 1,
            tension: 85,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(listOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    });
  };

  const fetchReportsData = async (isARefresh = false) => {
    try {
      if (!isARefresh) setLoading(true);

      const filters: any = {
        limit: 50,
      };

      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      if (selectedDept !== 'all') {
        filters.department = selectedDept;
      }

      const data = await getAllReports(filters);
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching admin reports list:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [selectedStatus, selectedDept]);

  useEffect(() => {
    if (!loading) {
      runEntranceAnimation();
    }
  }, [loading]);

  const filteredReports = reports.filter((r) => {
    const categoryName = CATEGORIES.find((c) => c.id === r.category) ? t(r.category as any) : r.category;
    const matchesSearch =
      categoryName.toLowerCase().includes(searchText.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchText.toLowerCase()));
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }] }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('tabReports' as any) || 'Reports'}</Text>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: searchY }] }}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.grayText} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchPlaceholder' as any) || "Search by ID, desc, or location..."}
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={Colors.grayText}
              returnKeyType="done"
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <X size={18} color={Colors.grayText} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: filterY }] }}>
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <Text style={styles.filterGroupLabel}>{isHindi ? 'स्थिति:' : 'Status:'}</Text>
            {STATUS_FILTERS.map((item) => {
              const isActive = selectedStatus === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.filterChip, isActive ? styles.chipActive : null]}
                  onPress={() => handleStatusChange(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                    {t(item.key as any) || item.defaultLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.filterDivider} />

            <Text style={styles.filterGroupLabel}>{isHindi ? 'विभाग:' : 'Dept:'}</Text>
            {DEPT_FILTERS.map((item) => {
              const isActive = selectedDept === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.filterChip, isActive ? styles.chipActive : null]}
                  onPress={() => handleDeptChange(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                    {t(item.key as any) || item.defaultLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: listY }], flex: 1 }}>
        <Animated.View style={{ opacity: listOpacity, transform: [{ scale: listScale }], flex: 1, backgroundColor: 'transparent' }}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primaryBlue} />
            </View>
          ) : filteredReports.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                {t('noReportsFound' as any) || 'No reports match your filters.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredReports}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <ReportListItem
                  report={item}
                  onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
                />
              )}
            />
          )}
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  searchContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: Colors.radius.sm,
    height: 44,
    paddingHorizontal: Colors.spacing.md,
  },
  searchIcon: {
    marginRight: Colors.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.darkText,
  },
  filtersWrapper: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: Colors.spacing.xs,
  },
  filtersScroll: {
    paddingHorizontal: Colors.spacing.md,
    alignItems: 'center',
    gap: 8,
  },
  filterGroupLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
  },
  filterChip: {
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: Colors.primaryBlue,
  },
  chipText: {
    fontSize: 12,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
  },
  chipTextActive: {
    color: Colors.white,
  },
  filterDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Colors.spacing.lg,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
  },
  listContent: {
    padding: Colors.spacing.md,
    paddingBottom: 100,
  },
});

```

---

## File: app\src\screens\admin\resolution\UploadResolutionScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the UploadResolutionScreen.tsx layer.

### Source Code:
```tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { uploadResolution } from '../../../services/adminService';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { ReportsStackParamList } from '../../../types/navigation.types';
import { useTranslation } from '../../../hooks/useTranslation';

type NavigationProp = NativeStackNavigationProp<ReportsStackParamList, 'UploadResolution'>;
type ScreenRouteProp = RouteProp<ReportsStackParamList, 'UploadResolution'>;

export const UploadResolutionScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { reportId } = route.params;

  const { t, language } = useTranslation();
  const isHindi = language === 'hi';

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    contentY.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(contentY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        isHindi ? 'अनुमति अस्वीकृत' : 'Permission Denied',
        isHindi 
          ? 'इमेज चुनने के लिए हमें आपकी फोटो लाइब्रेरी तक पहुंच चाहिए।' 
          : 'We need access to your photo library to pick images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        isHindi ? 'अनुमति अस्वीकृत' : 'Permission Denied',
        isHindi 
          ? 'फोटो लेने के लिए हमें आपके कैमरे तक पहुंच चाहिए।' 
          : 'We need access to your camera to take photos.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      Alert.alert(
        t('error' as any) || 'Error',
        t('imageRequiredError' as any) || 'Please take a photo of the resolved cleanup first'
      );
      return;
    }

    if (!notes.trim()) {
      Alert.alert(
        t('error' as any) || 'Error',
        t('notesRequiredError' as any) || 'Please provide resolution notes'
      );
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      
      const fileUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;
      formData.append('image', {
        uri: fileUri,
        type: 'image/jpeg',
        name: 'resolution_work.jpg',
      } as any);

      formData.append('notes', notes.trim());

      await uploadResolution(reportId, formData);
      Alert.alert(
        isHindi ? 'मामला सुलझ गया' : 'Incident Resolved',
        isHindi 
          ? 'समाधान लॉग सफलतापूर्वक सबमिट हो गए हैं। नागरिक को सूचित कर दिया गया है।' 
          : 'Resolution logs submitted successfully. Citizen has been notified.'
      );
      navigation.goBack();
    } catch (error: any) {
      console.error('Error submitting resolution:', error);
      const backendMsg = error?.response?.data?.message || error.message || 'An error occurred while uploading resolution details.';
      Alert.alert(
        t('error' as any) || 'Error',
        backendMsg
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <X size={20} color={Colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('uploadResolutionTitle' as any) || 'Upload Resolution'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: contentY }], flex: 1, backgroundColor: 'transparent' }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <Card style={styles.infoCard}>
            <AlertCircle size={16} color={Colors.primaryBlue} />
            <Text style={styles.infoText}>
              {isHindi 
                ? 'एडमिन फील्ड कार्यकर्ताओं द्वारा भेजे गए स्क्रीनशॉट/रिपोर्ट अपलोड करने के लिए गैलरी से मौजूदा फोटो चुन सकते हैं।' 
                : 'Admins may choose existing photos from the gallery to upload screenshots/reports sent by operational field workers.'
              }
            </Text>
          </Card>

          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => setImageUri(null)}>
                <X size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pickerOptionsContainer}>
              <TouchableOpacity style={styles.pickerOption} onPress={takePhoto} activeOpacity={0.8}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.primaryBlue + '15' }]}>
                  <Camera size={24} color={Colors.primaryBlue} />
                </View>
                <Text style={styles.pickerOptionLabel}>
                  {t('takePhotoBtn' as any) || 'Take Photo'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.pickerOption} onPress={pickFromGallery} activeOpacity={0.8}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.environmentalGreen + '15' }]}>
                  <ImageIcon size={24} color={Colors.environmentalGreen} />
                </View>
                <Text style={styles.pickerOptionLabel}>
                  {isHindi ? 'गैलरी से चुनें' : 'Choose from Gallery'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Card style={styles.notesCard}>
            <Input
              label={t('resolutionNotesLabel' as any) || 'Resolution Notes'}
              placeholder={t('resolutionNotesPlaceholder' as any) || 'Describe what action was taken to resolve the issue...'}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              containerStyle={styles.inputContainer}
            />
          </Card>

          <Button
            title={t('submitResolutionBtn' as any) || 'Submit Resolution'}
            onPress={handleSubmit}
            variant="secondary"
            loading={submitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  placeholder: {
    width: 28,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: Colors.spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    padding: Colors.spacing.md,
    gap: 8,
    marginBottom: Colors.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.grayText,
    lineHeight: 16,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: Colors.radius.md,
    overflow: 'hidden',
    marginBottom: Colors.spacing.md,
    ...Colors.shadow.soft,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: Colors.spacing.sm,
    right: Colors.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOptionsContainer: {
    flexDirection: 'row',
    gap: Colors.spacing.md,
    marginBottom: Colors.spacing.md,
  },
  pickerOption: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    paddingVertical: Colors.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Colors.spacing.sm,
  },
  pickerOptionLabel: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  notesCard: {
    padding: Colors.spacing.md,
    marginBottom: Colors.spacing.lg,
  },
  inputContainer: {
    marginBottom: 0,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  submitBtn: {
    width: '100%',
  },
});

```

---

## File: app\src\screens\auth\LoginScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the LoginScreen.tsx layer.

### Source Code:
```tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mail, Key } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Button } from '../../components/common/Button';
import { loginWithEmail, loginWithBackend, resetPassword } from '../../services/authService';
import { validateEmail } from '../../utils/validators';
import { AuthStackParamList } from '../../types/navigation.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;
  
  const blob1X = useRef(new Animated.Value(-50)).current;
  const blob1Y = useRef(new Animated.Value(-50)).current;
  const blob2X = useRef(new Animated.Value(SCREEN_WIDTH - 100)).current;
  const blob2Y = useRef(new Animated.Value(SCREEN_HEIGHT - 200)).current;

  const animateBlobs = () => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(blob1X, { toValue: SCREEN_WIDTH - 150, duration: 8000, useNativeDriver: true }),
          Animated.timing(blob1Y, { toValue: 200, duration: 6000, useNativeDriver: true }),
          Animated.timing(blob1X, { toValue: 50, duration: 7000, useNativeDriver: true }),
          Animated.timing(blob1Y, { toValue: -50, duration: 8000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(blob2X, { toValue: 0, duration: 9000, useNativeDriver: true }),
          Animated.timing(blob2Y, { toValue: SCREEN_HEIGHT - 400, duration: 7000, useNativeDriver: true }),
          Animated.timing(blob2X, { toValue: SCREEN_WIDTH - 200, duration: 8000, useNativeDriver: true }),
          Animated.timing(blob2Y, { toValue: SCREEN_HEIGHT - 200, duration: 6000, useNativeDriver: true }),
        ])
      ])
    ).start();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    animateBlobs();
  }, []);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = (): boolean => {
    const next: typeof errors = {
      email: validateEmail(email),
      password: password.length < 6 ? 'Password is required' : undefined,
    };
    setErrors(next);
    return Object.values(next).every((e) => !e);
  };

  const handleForgotPassword = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors((e) => ({ ...e, email: emailError }));
      Alert.alert(
        isHindi ? 'त्रुटि' : 'Error',
        isHindi ? 'कृपया पासवर्ड रीसेट करने के लिए पहले एक वैध ईमेल पता दर्ज करें।' : 'Please enter a valid email address first to reset your password.'
      );
      return;
    }

    setLoading(true);
    setSubmitError('');
    try {
      await resetPassword(email);
      Alert.alert(
        isHindi ? 'ईमेल भेजा गया' : 'Email Sent',
        isHindi 
          ? 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है।' 
          : 'A password reset link has been sent to your email.'
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      setSubmitError(error.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setSubmitError('');
    try {
      const idToken = await loginWithEmail(email, password);
      await loginWithBackend(idToken, email);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <Animated.View style={[styles.glowBlob1, { transform: [{ translateX: blob1X }, { translateY: blob1Y }] }]} />
      <Animated.View style={[styles.glowBlob2, { transform: [{ translateX: blob2X }, { translateY: blob2Y }] }]} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: cardFade, transform: [{ translateY: cardSlide }] }}>
            
            <View style={styles.logoRow}>
              <View style={styles.emojiLogoContainer}>
                <Text style={styles.emojiLogo}>🌏</Text>
              </View>
              <View style={styles.brandTextBox}>
                <Text style={styles.brandTitle}>CivicSafe</Text>
                <Text style={styles.brandSub}>SECURE & CLEAN INCIDENT TRACKER</Text>
              </View>
            </View>

            <View style={styles.glassContainer}>
              <BlurView intensity={70} tint="light" style={styles.blurCard}>
                <Text style={styles.heading}>{t('welcomeBack')}</Text>
                <Text style={styles.subheading}>{t('enterEmailSignIn')}</Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>{t('emailAddress')}</Text>
                  <View style={[
                    styles.glowingInputRow,
                    isEmailFocused && styles.glowingInputRowActive,
                    Boolean(errors.email) && styles.glowingInputRowError
                  ]}>
                    <Mail size={18} color={isEmailFocused ? '#2563EB' : '#9CA3AF'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('emailPlaceholder')}
                      placeholderTextColor="rgba(156, 163, 175, 0.7)"
                      value={email}
                      onChangeText={(val) => { setEmail(val); if (errors.email) setErrors((e) => ({ ...e, email: undefined })); }}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email ? <Text style={styles.errorLabel}>{errors.email}</Text> : null}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>{t('passwordLabel')}</Text>
                  <View style={[
                    styles.glowingInputRow,
                    isPasswordFocused && styles.glowingInputRowActive,
                    Boolean(errors.password) && styles.glowingInputRowError
                  ]}>
                    <Key size={18} color={isPasswordFocused ? '#2563EB' : '#9CA3AF'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('passwordPlaceholder')}
                      placeholderTextColor="rgba(156, 163, 175, 0.7)"
                      value={password}
                      onChangeText={(val) => { setPassword(val); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      secureTextEntry
                    />
                  </View>
                  {errors.password ? <Text style={styles.errorLabel}>{errors.password}</Text> : null}
                </View>

                <View style={styles.forgotPasswordContainer}>
                  <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                    <Text style={styles.forgotPasswordText}>
                      {isHindi ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {submitError ? (
                  <Text style={styles.submitErrorText}>{submitError}</Text>
                ) : null}

                <Button
                  title={t('logIn')}
                  onPress={handleLogin}
                  loading={loading}
                  variant="primary"
                  style={styles.loginBtn}
                />
              </BlurView>
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupHint}>{t('dontHaveAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
                <Text style={styles.signupLink}>{t('createAccountLink')}</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  flex: { flex: 1 },
  glowBlob1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    zIndex: -2,
  },
  glowBlob2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    zIndex: -2,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Colors.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: Colors.spacing.xl,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingLeft: 4,
  },
  emojiLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
  },
  emojiLogo: {
    fontSize: 24,
  },
  brandTextBox: {
    marginLeft: Colors.spacing.md,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  glassContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.45)',
    ...Colors.shadow.medium,
  },
  blurCard: {
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 13,
    color: Colors.grayText,
    lineHeight: 18,
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  glowingInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 231, 235, 0.8)',
    height: 52,
    paddingHorizontal: Colors.spacing.md,
  },
  glowingInputRowActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  glowingInputRowError: {
    borderColor: Colors.alertOrange,
  },
  inputIcon: {
    marginRight: Colors.spacing.sm,
  },
  textInput: {
    flex: 1,
    color: Colors.darkText,
    fontSize: 14,
  },
  errorLabel: {
    color: Colors.alertOrange,
    fontSize: 11,
    marginTop: 4,
  },
  submitErrorText: {
    color: Colors.alertOrange,
    fontSize: 12,
    marginBottom: 14,
  },
  loginBtn: {
    height: 50,
    borderRadius: Colors.radius.md,
    backgroundColor: Colors.primaryBlue,
    borderColor: Colors.primaryBlue,
    marginTop: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 6,
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: Typography.fontWeight.semibold,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 4,
  },
  signupHint: { fontSize: 14, color: Colors.grayText },
  signupLink: {
    fontSize: 14,
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.bold,
  },
});

```

---

## File: app\src\screens\auth\SignupScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the SignupScreen.tsx layer.

### Source Code:
```tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User, Mail, Key } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { RoleSelector } from '../../components/auth/RoleSelector';
import { PhoneInput } from '../../components/auth/PhoneInput';
import { Button } from '../../components/common/Button';
import { registerWithEmail, registerWithBackend, sendFirebaseVerificationEmail, checkEmailVerified } from '../../services/authService';
import { firebaseAuth } from '../../config/firebaseConfig';
import {
  validatePhone,
  validateEmail,
  validateName,
  validateInviteCode,
} from '../../utils/validators';
import { AuthStackParamList } from '../../types/navigation.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isInviteFocused, setIsInviteFocused] = useState(false);

  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;

  const blob1X = useRef(new Animated.Value(-50)).current;
  const blob1Y = useRef(new Animated.Value(-50)).current;
  const blob2X = useRef(new Animated.Value(SCREEN_WIDTH - 100)).current;
  const blob2Y = useRef(new Animated.Value(SCREEN_HEIGHT - 200)).current;

  const animateBlobs = () => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(blob1X, { toValue: SCREEN_WIDTH - 150, duration: 8000, useNativeDriver: true }),
          Animated.timing(blob1Y, { toValue: 200, duration: 6000, useNativeDriver: true }),
          Animated.timing(blob1X, { toValue: 50, duration: 7000, useNativeDriver: true }),
          Animated.timing(blob1Y, { toValue: -50, duration: 8000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(blob2X, { toValue: 0, duration: 9000, useNativeDriver: true }),
          Animated.timing(blob2Y, { toValue: SCREEN_HEIGHT - 400, duration: 7000, useNativeDriver: true }),
          Animated.timing(blob2X, { toValue: SCREEN_WIDTH - 200, duration: 8000, useNativeDriver: true }),
          Animated.timing(blob2Y, { toValue: SCREEN_HEIGHT - 200, duration: 6000, useNativeDriver: true }),
        ])
      ])
    ).start();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    animateBlobs();
  }, []);

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    inviteCode?: string;
  }>({});

  const clearErrors = () => {
    setErrors({});
    setSubmitError('');
  };

  const validate = (): boolean => {
    const next: typeof errors = {
      name: validateName(name),
      phone: validatePhone(phone),
      email: validateEmail(email),
      password: password.length < 6 ? 'Password must be at least 6 characters' : undefined,
      inviteCode: role === 'admin' ? validateInviteCode(inviteCode) : undefined,
    };
    setErrors(next);
    return Object.values(next).every((e) => !e);
  };

  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationVerifying, setVerificationVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationResent, setVerificationResent] = useState(false);

  const handleCreateAccount = async () => {
    if (!validate()) return;

    setLoading(true);
    setSubmitError('');
    try {
      await registerWithEmail(email.trim(), password);
      await sendFirebaseVerificationEmail();
      setVerificationModalVisible(true);
      setVerificationResent(false);
      setVerificationError('');
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    setVerificationError('');
    setVerificationVerifying(true);
    try {
      const isVerified = await checkEmailVerified();
      if (!isVerified) {
        setVerificationError('Email is not verified yet. Please check your inbox and click the verification link.');
        setVerificationVerifying(false);
        return;
      }

      setVerificationModalVisible(false);
      setLoading(true);

      if (firebaseAuth.currentUser) {
        const idToken = await firebaseAuth.currentUser.getIdToken();
        await registerWithBackend(idToken, {
          name: name.trim(),
          phone: `+91${phone.trim()}`,
          email: email.trim(),
          role,
          inviteCode: role === 'admin' ? inviteCode.trim() : undefined,
        });
      }
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : 'Verification failed.');
    } finally {
      setVerificationVerifying(false);
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setVerificationError('');
    setVerificationResent(false);
    try {
      await sendFirebaseVerificationEmail();
      setVerificationResent(true);
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : 'Failed to resend verification email.');
    }
  };

  const handleCancelVerification = async () => {
    try {
      if (firebaseAuth.currentUser) {
        await firebaseAuth.currentUser.delete();
      }
    } catch (err) {
      console.warn('Failed to delete temporary user on cancel', err);
    }
    setVerificationModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <Animated.View style={[styles.glowBlob1, { transform: [{ translateX: blob1X }, { translateY: blob1Y }] }]} />
      <Animated.View style={[styles.glowBlob2, { transform: [{ translateX: blob2X }, { translateY: blob2Y }] }]} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: cardFade, transform: [{ translateY: cardSlide }] }}>
            
            <View style={styles.logoRow}>
              <View style={styles.emojiLogoContainer}>
                <Text style={styles.emojiLogo}>🌏</Text>
              </View>
              <View style={styles.brandTextBox}>
                <Text style={styles.brandTitle}>CivicSafe</Text>
                <Text style={styles.brandSub}>SECURE & CLEAN INCIDENT TRACKER</Text>
              </View>
            </View>

            <View style={styles.glassContainer}>
              <BlurView intensity={70} tint="light" style={styles.blurCard}>
                <Text style={styles.heading}>{t('createAccount')}</Text>
                <Text style={styles.subheading}>{t('joinCommunity')}</Text>

                <View style={styles.roleSelectorWrapper}>
                  <RoleSelector
                    selectedRole={role}
                    onRoleChange={(r) => {
                      setRole(r);
                      clearErrors();
                    }}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>{t('fullName')}</Text>
                  <View style={[
                    styles.glowingInputRow,
                    isNameFocused && styles.glowingInputRowActive,
                    Boolean(errors.name) && styles.glowingInputRowError
                  ]}>
                    <User size={18} color={isNameFocused ? '#2563EB' : '#9CA3AF'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('fullName')}
                      placeholderTextColor="rgba(156, 163, 175, 0.7)"
                      value={name}
                      onChangeText={(val) => { setName(val); if (errors.name) setErrors((e) => ({ ...e, name: undefined })); }}
                      onFocus={() => setIsNameFocused(true)}
                      onBlur={() => setIsNameFocused(false)}
                      autoCapitalize="words"
                    />
                  </View>
                  {errors.name ? <Text style={styles.errorLabel}>{errors.name}</Text> : null}
                </View>

                <View style={styles.inputWrapper}>
                  <PhoneInput
                    value={phone}
                    onChangeText={(val) => { setPhone(val); if (errors.phone) setErrors((e) => ({ ...e, phone: undefined })); }}
                    error={errors.phone}
                    theme="light"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>{t('emailAddress')}</Text>
                  <View style={[
                    styles.glowingInputRow,
                    isEmailFocused && styles.glowingInputRowActive,
                    Boolean(errors.email) && styles.glowingInputRowError
                  ]}>
                    <Mail size={18} color={isEmailFocused ? '#2563EB' : '#9CA3AF'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('emailPlaceholder')}
                      placeholderTextColor="rgba(156, 163, 175, 0.7)"
                      value={email}
                      onChangeText={(val) => { setEmail(val); if (errors.email) setErrors((e) => ({ ...e, email: undefined })); }}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email ? <Text style={styles.errorLabel}>{errors.email}</Text> : null}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>{t('passwordLabel')}</Text>
                  <View style={[
                    styles.glowingInputRow,
                    isPasswordFocused && styles.glowingInputRowActive,
                    Boolean(errors.password) && styles.glowingInputRowError
                  ]}>
                    <Key size={18} color={isPasswordFocused ? '#2563EB' : '#9CA3AF'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('passwordPlaceholder')}
                      placeholderTextColor="rgba(156, 163, 175, 0.7)"
                      value={password}
                      onChangeText={(val) => { setPassword(val); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      secureTextEntry
                    />
                  </View>
                  {errors.password ? <Text style={styles.errorLabel}>{errors.password}</Text> : null}
                </View>

                {role === 'admin' && (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Admin Invite Code</Text>
                    <View style={[
                      styles.glowingInputRow,
                      isInviteFocused && styles.glowingInputRowActive,
                      Boolean(errors.inviteCode) && styles.glowingInputRowError
                    ]}>
                      <Key size={18} color={isInviteFocused ? '#2563EB' : '#9CA3AF'} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter your invite code"
                        placeholderTextColor="rgba(156, 163, 175, 0.7)"
                        value={inviteCode}
                        onChangeText={(val) => { setInviteCode(val); if (errors.inviteCode) setErrors((e) => ({ ...e, inviteCode: undefined })); }}
                        onFocus={() => setIsInviteFocused(true)}
                        onBlur={() => setIsInviteFocused(false)}
                        autoCapitalize="characters"
                      />
                    </View>
                    {errors.inviteCode ? <Text style={styles.errorLabel}>{errors.inviteCode}</Text> : null}
                  </View>
                )}

                {submitError ? (
                  <Text style={styles.submitErrorText}>{submitError}</Text>
                ) : null}

                <Button
                  title={t('createAccount')}
                  onPress={handleCreateAccount}
                  loading={loading}
                  variant="primary"
                  style={styles.signupBtn}
                />
              </BlurView>
            </View>

            <View style={styles.loginRow}>
              <Text style={styles.loginHint}>{t('alreadyHaveAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                <Text style={styles.loginLink}>{t('logIn')}</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {verificationModalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleCancelVerification}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} />
          </TouchableOpacity>

          <View style={styles.modalCenterCardContainer}>
            <View style={styles.otpSolidCard}>
              <Text style={styles.modalTitle}>{t('verifyEmail') || 'Verify Your Email'}</Text>
              <Text style={styles.modalSub}>
                We have sent a verification link to your email address:
                {"\n"}
                <Text style={{ fontWeight: 'bold', color: Colors.primaryBlue }}>{email}</Text>
                {"\n\n"}
                Please click the link in your email inbox to verify, then tap Continue.
              </Text>

              {verificationError ? <Text style={[styles.errorLabel, { textAlign: 'center', marginBottom: 10 }]}>{verificationError}</Text> : null}
              {verificationResent ? <Text style={styles.resendSuccessText}>Verification email resent successfully!</Text> : null}

              <View style={styles.modalActionsRow}>
                <Button
                  title="Cancel"
                  onPress={handleCancelVerification}
                  variant="secondary"
                  style={[styles.halfBtn, { paddingHorizontal: 0 }]}
                  textStyle={{ fontSize: 13 }}
                />
                <Button
                  title="Continue"
                  onPress={handleVerifyAndRegister}
                  loading={verificationVerifying}
                  variant="primary"
                  style={[styles.halfBtn, { paddingHorizontal: 0 }]}
                  textStyle={{ fontSize: 13 }}
                />
              </View>

              <TouchableOpacity onPress={handleResendEmail} style={styles.resendLinkBtn} activeOpacity={0.7}>
                <Text style={styles.resendLinkText}>Resend Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  flex: { flex: 1 },
  glowBlob1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    zIndex: -2,
  },
  glowBlob2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    zIndex: -2,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Colors.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: Colors.spacing.xl,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingLeft: 4,
  },
  emojiLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
  },
  emojiLogo: {
    fontSize: 24,
  },
  brandTextBox: {
    marginLeft: Colors.spacing.md,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  glassContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.45)',
    ...Colors.shadow.medium,
  },
  blurCard: {
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 13,
    color: Colors.grayText,
    lineHeight: 18,
    marginBottom: 24,
  },
  roleSelectorWrapper: {
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  glowingInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 231, 235, 0.8)',
    height: 52,
    paddingHorizontal: Colors.spacing.md,
  },
  glowingInputRowActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  glowingInputRowError: {
    borderColor: Colors.alertOrange,
  },
  inputIcon: {
    marginRight: Colors.spacing.sm,
  },
  textInput: {
    flex: 1,
    color: Colors.darkText,
    fontSize: 14,
  },
  errorLabel: {
    color: Colors.alertOrange,
    fontSize: 11,
    marginTop: 4,
  },
  submitErrorText: {
    color: Colors.alertOrange,
    fontSize: 12,
    marginBottom: 14,
  },
  signupBtn: {
    height: 50,
    borderRadius: Colors.radius.md,
    backgroundColor: Colors.primaryBlue,
    borderColor: Colors.primaryBlue,
    marginTop: 8,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 4,
  },
  loginHint: { fontSize: 14, color: Colors.grayText },
  loginLink: {
    fontSize: 14,
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.bold,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalCenterCardContainer: {
    width: '100%',
    maxWidth: 340,
  },
  otpSolidCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    ...Colors.shadow.medium,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    color: Colors.grayText,
    marginBottom: 20,
    lineHeight: 18,
    textAlign: 'center',
  },
  modalActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  halfBtn: {
    flex: 1,
    height: 46,
  },
  resendLinkBtn: {
    marginTop: 20,
    padding: 4,
  },
  resendLinkText: {
    fontSize: 13,
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.bold,
  },
  resendSuccessText: {
    color: '#10B981',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

```

---

## File: app\src\screens\citizen\dashboard\CitizenDashboardScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the CitizenDashboardScreen.tsx layer.

### Source Code:
```tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Info, User as UserIcon, Bell, X, CheckCircle, TrendingUp, Clipboard } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../../../context/useAuthStore';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { CATEGORIES } from '../../../constants/categories';
import { CategoryTile } from '../../../components/dashboard/CategoryTile';
import { RecentReportCard } from '../../../components/dashboard/RecentReportCard';
import { getUserReports } from '../../../services/reportService';
import { Report } from '../../../types/report.types';
import { RootStackParamList } from '../../../types/navigation.types';
import { useSettingsStore } from '../../../context/useSettingsStore';

const getCategoryLabelHi = (categoryId: string) => {
  switch (categoryId) {
    case 'garbage_dump':
      return 'कचरा डंप';
    case 'plastic_pollution':
      return 'प्लास्टिक प्रदूषण';
    case 'waste_accumulation':
      return 'कचरा संचय';
    case 'water_pollution':
      return 'जल प्रदूषण';
    case 'suspicious_object':
      return 'संदिग्ध वस्तु';
    case 'emergency_situation':
      return 'आपातकालीन स्थिति';
    default:
      return categoryId;
  }
};

const getRelativeTime = (timestamp: string | number, isHindi: boolean) => {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (isHindi) {
    if (mins < 1) return 'अभी-अभी';
    if (mins < 60) return `${mins} मिनट पहले`;
    if (hours < 24) return `${hours} घंटे पहले`;
    return `${days} दिन पहले`;
  } else {
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
};

const getNotificationDetails = (status: string, categoryLabel: string, isHindi: boolean) => {
  if (isHindi) {
    switch (status) {
      case 'resolved':
        return {
          title: 'मामला सुलझ गया',
          desc: `आपकी ${categoryLabel} की रिपोर्ट सफलतापूर्वक सुलझा ली गई है।`,
          icon: 'check',
          color: Colors.environmentalGreen,
          bgColor: Colors.environmentalGreen + '15',
        };
      case 'action_started':
        return {
          title: 'कार्रवाई शुरू',
          desc: `आपकी ${categoryLabel} रिपोर्ट पर सफाई का काम शुरू हो गया है।`,
          icon: 'trending',
          color: Colors.alertOrange,
          bgColor: Colors.alertOrange + '15',
        };
      case 'assigned':
        return {
          title: 'अधिकारी नियुक्त',
          desc: `आपकी ${categoryLabel} रिपोर्ट अधिकारी को सौंप दी गई है।`,
          icon: 'trending',
          color: Colors.primaryBlue,
          bgColor: Colors.primaryBlue + '15',
        };
      case 'under_review':
        return {
          title: 'समीक्षा के अधीन',
          desc: `अधिकारी वर्तमान में ${categoryLabel} की रिपोर्ट की समीक्षा कर रहे हैं।`,
          icon: 'clipboard',
          color: Colors.grayText,
          bgColor: Colors.grayText + '15',
        };
      case 'submitted':
      default:
        return {
          title: 'रिपोर्ट दर्ज',
          desc: `आपकी ${categoryLabel} रिपोर्ट सफलतापूर्वक दर्ज कर ली गई है।`,
          icon: 'clipboard',
          color: Colors.primaryBlue,
          bgColor: Colors.primaryBlue + '15',
        };
    }
  } else {
    switch (status) {
      case 'resolved':
        return {
          title: 'Incident Resolved',
          desc: `The reported ${categoryLabel} has been successfully resolved.`,
          icon: 'check',
          color: Colors.environmentalGreen,
          bgColor: Colors.environmentalGreen + '15',
        };
      case 'action_started':
        return {
          title: 'Action Initiated',
          desc: `Work has started on your ${categoryLabel} report.`,
          icon: 'trending',
          color: Colors.alertOrange,
          bgColor: Colors.alertOrange + '15',
        };
      case 'assigned':
        return {
          title: 'Officer Assigned',
          desc: `Your report for ${categoryLabel} has been assigned to an officer.`,
          icon: 'trending',
          color: Colors.primaryBlue,
          bgColor: Colors.primaryBlue + '15',
        };
      case 'under_review':
        return {
          title: 'Report Under Review',
          desc: `Officers are currently reviewing your report for ${categoryLabel}.`,
          icon: 'clipboard',
          color: Colors.grayText,
          bgColor: Colors.grayText + '15',
        };
      case 'submitted':
      default:
        return {
          title: 'Report Registered',
          desc: `Your ${categoryLabel} report has been successfully registered.`,
          icon: 'clipboard',
          color: Colors.primaryBlue,
          bgColor: Colors.primaryBlue + '15',
        };
    }
  }
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CitizenDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t, language } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isHindi = language === 'hi';

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(0);

  const notifications = reports.map((report) => {
    const categoryItem = CATEGORIES.find((c) => c.id === report.category);
    const categoryLabel = categoryItem
      ? (isHindi && (categoryItem as any).labelHi ? (categoryItem as any).labelHi : categoryItem.label)
      : report.category;
    
    // hindi category mapping fallback
    const resolvedLabel = isHindi ? getCategoryLabelHi(report.category) : categoryLabel;

    const details = getNotificationDetails(report.status, resolvedLabel, isHindi);
    return {
      id: report.id,
      title: details.title,
      desc: details.desc,
      time: getRelativeTime(report.createdAt, isHindi),
      icon: details.icon,
      color: details.color,
      bgColor: details.bgColor,
      updatedAtTime: new Date(report.updatedAt || report.createdAt).getTime(),
    };
  });

  const hasUnseenNotifications = reports.some(
    (report) => new Date(report.updatedAt || report.createdAt).getTime() > lastSeenTimestamp
  );

  useEffect(() => {
    if (reports.length > 0 && lastSeenTimestamp === 0) {
      const latestTime = Math.max(...reports.map(r => new Date(r.updatedAt || r.createdAt).getTime()));
      setLastSeenTimestamp(latestTime);
    }
  }, [reports]);

  const lastScrollY = useRef(0);
  const setTabBarVisible = useSettingsStore((s) => s.setTabBarVisible);

  useEffect(() => {
    setTabBarVisible(true);
    return () => setTabBarVisible(true);
  }, []);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (Math.abs(currentOffset - lastScrollY.current) > 15) {
      if (currentOffset > lastScrollY.current && currentOffset > 60) {
        setTabBarVisible(false);
      } else {
        setTabBarVisible(true);
      }
      lastScrollY.current = currentOffset;
    }
  };

  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const notificationsAnim = useRef(new Animated.Value(0)).current;

  const showNotifications = () => {
    setNotificationsVisible(true);
    setLastSeenTimestamp(Date.now());
    notificationsAnim.setValue(0);
    Animated.spring(notificationsAnim, {
      toValue: 1,
      tension: 65,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const hideNotifications = () => {
    Animated.timing(notificationsAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setNotificationsVisible(false);
    });
  };

  const handleNotificationPress = (reportId: string) => {
    hideNotifications();
    navigation.navigate('Reports' as any, {
      screen: 'ReportDetail',
      params: { reportId },
    } as any);
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;
  const ctaScale = useRef(new Animated.Value(0.95)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const grid1Y = useRef(new Animated.Value(20)).current;
  const grid2Y = useRef(new Animated.Value(20)).current;
  const reportsY = useRef(new Animated.Value(25)).current;

  const runFloatingAnimation = () => {
    floatAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const runWaveAnimation = () => {
    waveAnim.setValue(0);
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-15);
    ctaScale.setValue(0.95);
    grid1Y.setValue(20);
    grid2Y.setValue(20);
    reportsY.setValue(25);

    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(headerY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(ctaScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(grid1Y, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(grid2Y, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(reportsY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    runFloatingAnimation();
    runWaveAnimation();
  }, []);

  useEffect(() => {
    if (!loading) {
      runEntranceAnimation();
    }
  }, [loading]);

  const loadData = async (silent = false) => {
    const userId = user?.id || (user as any)?._id;
    if (!userId) return;
    try {
      if (!silent) setLoading(true);
      const data = await getUserReports(userId, 1, 5);
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching dashboard reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(reports.length > 0);

    const unsubscribe = navigation.addListener('focus', () => {
      loadData(true);
    });
    return unsubscribe;
  }, [navigation, user]);

  const environmentalCategories = CATEGORIES.filter((c) => c.group === 'environmental');
  const safetyCategories = CATEGORIES.filter((c) => c.group === 'safety');

  const startReport = (category?: string) => {
    if (category) {
      navigation.navigate('ReportStack' as any, {
        screen: 'Camera',
        params: { category: category as any, fromDashboard: true },
      } as any);
    } else {
      navigation.navigate('ReportStack' as any, {
        screen: 'SelectCategory',
      } as any);
    }
  };

  const ctaTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const waveScale1 = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.08],
  });
  const waveOpacity1 = waveAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0.3, 0.15, 0],
  });
  const waveScale2 = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.0, 1.0, 1.08],
  });
  const waveOpacity2 = waveAnim.interpolate({
    inputRange: [0, 0.5, 0.9, 1],
    outputRange: [0, 0.3, 0.15, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
        
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }] }}>
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: Colors.spacing.sm }}>
              <Text style={styles.greeting}>{t('hello')}, {user?.name || 'Citizen'}</Text>
              <Text style={styles.subGreeting}>{t('cleanSurroundsHint')}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationBtn} onPress={showNotifications} activeOpacity={0.8}>
                <Bell size={20} color={Colors.primaryBlue} />
                {hasUnseenNotifications && <View style={styles.badgeDot} />}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.ctaCtaContainer, { opacity: fadeAnim, transform: [{ scale: ctaScale }, { translateY: ctaTranslateY }] }]}>
          <Animated.View
            style={[
              styles.ctaCtaWave,
              {
                transform: [{ scale: waveScale1 }],
                opacity: waveOpacity1,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ctaCtaWave,
              {
                transform: [{ scale: waveScale2 }],
                opacity: waveOpacity2,
              },
            ]}
          />
          <TouchableOpacity style={[styles.ctaCard, { marginBottom: 0 }]} onPress={() => startReport()} activeOpacity={0.95}>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>{t('reportAnIncident')}</Text>
              <Text style={styles.ctaSubtitle}>{t('reportIncidentSub' as any)}</Text>
            </View>
            <View style={styles.ctaButtonCircle}>
              <Plus size={24} color={Colors.white} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: grid1Y }] }}>
          <Text style={styles.sectionTitle}>{t('environmentalPollution' as any)}</Text>
          <View style={styles.grid}>
            {environmentalCategories.map((cat) => (
              <CategoryTile
                key={cat.id}
                category={cat}
                onPress={() => startReport(cat.id)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: grid2Y }] }}>
          <Text style={styles.sectionTitle}>{t('safetySecurity' as any)}</Text>
          <View style={styles.grid}>
            {safetyCategories.map((cat) => (
              <CategoryTile
                key={cat.id}
                category={cat}
                onPress={() => startReport(cat.id)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: reportsY }] }}>
          <Text style={styles.sectionTitle}>{t('recentReports')}</Text>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primaryBlue} style={styles.loader} />
          ) : reports.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('noRecentReports')}</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {reports.map((report) => (
                <View key={report.id} style={styles.reportCardWrapper}>
                  <RecentReportCard
                    report={report}
                    onPress={() => {
                      navigation.navigate('Reports' as any, {
                        screen: 'ReportDetail',
                        params: { reportId: report.id },
                      } as any);
                    }}
                  />
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.tipsTeaserCard}>
            <View style={styles.tipsIconCircle}>
              <Info size={18} color={Colors.primaryBlue} />
            </View>
            <View style={styles.tipsTeaserText}>
              <Text style={styles.tipsTeaserTitle}>{t('didYouKnow' as any)}</Text>
              <Text style={styles.tipsTeaserDescription}>
                {t('safetyTipTeaser' as any)}
              </Text>
            </View>
          </View>
        </Animated.View>

      </ScrollView>

      <Modal
        visible={notificationsVisible}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
        onRequestClose={hideNotifications}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideNotifications}
        >
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: notificationsAnim }]}>
            <BlurView
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.22)' }]}
              intensity={25}
              tint="dark"
              experimentalBlurMethod={"regular" as any}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: notificationsAnim,
                transform: [
                  { scale: notificationsAnim.interpolate({ inputRange: [0, 1], outputRange: [0.93, 1] }) },
                  { translateY: notificationsAnim.interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) }
                ]
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('notifications')}</Text>
              <TouchableOpacity onPress={hideNotifications}>
                <X size={20} color={Colors.grayText} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationScroll} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotificationsContainer}>
                  <Bell size={40} color={Colors.grayText + '44'} style={{ marginBottom: 10 }} />
                  <Text style={styles.emptyNotificationsText}>
                    {isHindi ? 'कोई नई सूचना नहीं' : 'No new notifications'}
                  </Text>
                  <Text style={styles.emptyNotificationsSub}>
                    {isHindi 
                      ? 'जब आपकी रिपोर्ट में अपडेट होंगे तो हम आपको सूचित करेंगे।' 
                      : "We'll alert you when there are updates to your reports."}
                  </Text>
                </View>
              ) : (
                notifications.map((item, index) => {
                  return (
                    <View key={item.id}>
                      {index > 0 && <View style={styles.notificationDivider} />}
                      <TouchableOpacity
                        style={styles.notificationItem}
                        onPress={() => handleNotificationPress(item.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.notificationIconContainer, { backgroundColor: item.bgColor }]}>
                          {item.icon === 'check' ? (
                            <CheckCircle size={18} color={item.color} />
                          ) : item.icon === 'trending' ? (
                            <TrendingUp size={18} color={item.color} />
                          ) : (
                            <Clipboard size={18} color={item.color} />
                          )}
                        </View>
                        <View style={styles.notificationContent}>
                          <Text style={styles.notificationItemTitle}>{item.title}</Text>
                          <Text style={styles.notificationItemDesc}>{item.desc}</Text>
                          <Text style={styles.notificationItemTime}>{item.time}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: Colors.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.lg,
    marginTop: Colors.spacing.xs,
  },
  greeting: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  subGreeting: {
    fontSize: 13,
    color: Colors.grayText,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryBlue + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    ...Colors.shadow.soft,
  },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.alertOrange,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Colors.spacing.lg,
  },
  modalCard: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.lg,
    padding: Colors.spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: '75%',
    ...Colors.shadow.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  notificationScroll: {
    marginTop: Colors.spacing.xs,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Colors.spacing.xs,
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Colors.spacing.md,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 2,
  },
  notificationItemDesc: {
    fontSize: 12,
    color: Colors.grayText,
    lineHeight: 16,
    marginBottom: 4,
  },
  notificationItemTime: {
    fontSize: 10,
    color: Colors.grayText + '99',
  },
  notificationDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: Colors.spacing.sm,
  },
  emptyNotificationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Colors.spacing.xl,
  },
  emptyNotificationsText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    marginBottom: 4,
  },
  emptyNotificationsSub: {
    fontSize: 12,
    color: Colors.grayText,
    textAlign: 'center',
    paddingHorizontal: Colors.spacing.lg,
  },
  ctaCtaContainer: {
    position: 'relative',
    marginBottom: Colors.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ctaCtaWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  ctaCard: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Colors.shadow.medium,
  },
  ctaTextContainer: {
    flex: 1,
    marginRight: Colors.spacing.sm,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 16,
  },
  ctaButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
    marginTop: Colors.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Colors.spacing.md,
    marginHorizontal: -Colors.spacing.xs,
  },
  loader: {
    marginVertical: Colors.spacing.lg,
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Colors.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.grayText,
  },
  horizontalScroll: {
    paddingRight: Colors.spacing.md,
    marginBottom: Colors.spacing.md,
  },
  reportCardWrapper: {
    width: 290,
    marginRight: Colors.spacing.sm,
  },
  tipsTeaserCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    alignItems: 'center',
    marginTop: Colors.spacing.xs,
  },
  tipsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Colors.spacing.md,
  },
  tipsTeaserText: {
    flex: 1,
  },
  tipsTeaserTitle: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
  },
  tipsTeaserDescription: {
    fontSize: 12,
    color: Colors.grayText,
    lineHeight: 16,
    marginTop: 2,
  },
});

```

---

## File: app\src\screens\citizen\profile\ProfileScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the ProfileScreen.tsx layer.

### Source Code:
```tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User as UserIcon, Settings, LogOut, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../../context/useAuthStore';
import { logout } from '../../../services/authService';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { Card } from '../../../components/common/Card';
import { ProfileStackParamList } from '../../../types/navigation.types';
import { useSettingsStore } from '../../../context/useSettingsStore';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const lastScrollY = useRef(0);
  const setTabBarVisible = useSettingsStore((s) => s.setTabBarVisible);

  useEffect(() => {
    setTabBarVisible(true);
    return () => setTabBarVisible(true);
  }, []);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (Math.abs(currentOffset - lastScrollY.current) > 15) {
      if (currentOffset > lastScrollY.current && currentOffset > 60) {
        setTabBarVisible(false);
      } else {
        setTabBarVisible(true);
      }
      lastScrollY.current = currentOffset;
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;
  const userCardY = useRef(new Animated.Value(15)).current;
  const menuCardY = useRef(new Animated.Value(20)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-15);
    userCardY.setValue(15);
    menuCardY.setValue(20);

    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(headerY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(userCardY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(menuCardY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    runEntranceAnimation();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }] }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profileTitle')}</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
        
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: userCardY }] }}>
          <Card style={styles.userCard}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <UserIcon size={32} color={Colors.primaryBlue} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.name}>{user?.name || 'Citizen'}</Text>
                <Text style={styles.phone}>{user?.phone}</Text>
              </View>
              {user?.verificationStatus === 'verified' && (
                <View style={styles.badge}>
                  <CheckCircle2 size={16} color={Colors.environmentalGreen} />
                  <Text style={styles.badgeText}>Verified</Text>
                </View>
              )}
            </View>

            {user?.email ? (
              <View style={styles.emailContainer}>
                <Text style={styles.emailLabel}>Email Address</Text>
                <Text style={styles.emailValue}>{user.email}</Text>
              </View>
            ) : null}

            <View style={styles.metaContainer}>
              <Text style={styles.metaText}>
                Joined on: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: menuCardY }] }}>
          <Card style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.8}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.primaryBlue + '15' }]}>
                  <Settings size={18} color={Colors.primaryBlue} />
                </View>
                <Text style={styles.menuLabel}>{t('settingsTab')}</Text>
              </View>
              <ChevronRight size={18} color={Colors.grayText} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.alertOrange + '15' }]}>
                  <LogOut size={18} color={Colors.alertOrange} />
                </View>
                <Text style={[styles.menuLabel, styles.logoutLabel]}>{t('logOutBtn')}</Text>
              </View>
              <ChevronRight size={18} color={Colors.grayText} />
            </TouchableOpacity>
          </Card>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  content: {
    padding: Colors.spacing.md,
    paddingBottom: 110,
    gap: Colors.spacing.md,
  },
  userCard: {
    padding: Colors.spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryBlue + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: Colors.spacing.md,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  phone: {
    fontSize: 13,
    color: Colors.grayText,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.environmentalGreen,
  },
  emailContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: Colors.spacing.sm,
  },
  emailLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
  },
  emailValue: {
    fontSize: 14,
    color: Colors.darkText,
    marginTop: 2,
  },
  metaContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: Colors.spacing.sm,
  },
  metaText: {
    fontSize: 12,
    color: Colors.grayText,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Colors.spacing.md,
  },
  logoutItem: {
    // optional stylistic updates
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Colors.spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
  },
  logoutLabel: {
    color: Colors.alertOrange,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});

```

---

## File: app\src\screens\citizen\profile\SettingsScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the SettingsScreen.tsx layer.

### Source Code:
```tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Switch,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, Languages } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Card } from '../../../components/common/Card';
import { useSettingsStore } from '../../../context/useSettingsStore';
import { useTranslation } from '../../../hooks/useTranslation';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { pushEnabled, language, togglePush, setLanguage, setTabBarVisible } = useSettingsStore();

  const lastScrollY = useRef(0);

  useEffect(() => {
    setTabBarVisible(true);
    return () => setTabBarVisible(true);
  }, []);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (Math.abs(currentOffset - lastScrollY.current) > 15) {
      if (currentOffset > lastScrollY.current && currentOffset > 60) {
        setTabBarVisible(false);
      } else {
        setTabBarVisible(true);
      }
      lastScrollY.current = currentOffset;
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;
  const cardY = useRef(new Animated.Value(15)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-15);
    cardY.setValue(15);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(headerY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(cardY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    runEntranceAnimation();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }] }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={Colors.darkText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settingsTitle')}</Text>
          <View style={styles.placeholder} />
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: cardY }] }}>
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.primaryBlue + '15' }]}>
                  <Bell size={18} color={Colors.primaryBlue} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>{t('pushNotificationsLabel')}</Text>
                  <Text style={styles.settingSub}>{t('pushNotificationsSub')}</Text>
                </View>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={togglePush}
                trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                thumbColor={pushEnabled ? Colors.primaryBlue : '#F3F4F6'}
                ios_backgroundColor="#D1D5DB"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.environmentalGreen + '15' }]}>
                  <Languages size={18} color={Colors.environmentalGreen} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>{t('appLanguageLabel')}</Text>
                  <Text style={styles.settingSub}>{t('appLanguageSub')}</Text>
                </View>
              </View>
              <View style={styles.languageToggleContainer}>
                <TouchableOpacity
                  style={[styles.langBtn, language === 'en' ? styles.langBtnActive : null]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={[styles.langText, language === 'en' ? styles.langTextActive : null]}>EN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langBtn, language === 'hi' ? styles.langBtnActive : null]}
                  onPress={() => setLanguage('hi')}
                >
                  <Text style={[styles.langText, language === 'hi' ? styles.langTextActive : null]}>HI</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  placeholder: {
    width: 28,
  },
  content: {
    padding: Colors.spacing.md,
    paddingBottom: 110,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Colors.spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Colors.spacing.md,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  settingSub: {
    fontSize: 11,
    color: Colors.grayText,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  languageToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: Colors.radius.sm,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Colors.radius.sm - 2,
  },
  langBtnActive: {
    backgroundColor: Colors.white,
    ...Colors.shadow.soft,
  },
  langText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
  },
  langTextActive: {
    color: Colors.primaryBlue,
  },
});

```

---

## File: app\src\screens\citizen\report\CameraScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]` `[Hardware]` `[Camera]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file handles the camera module using Expo Camera. It lets users take live photos of incidents, toggles the phone flash hardware, and ensures they capture real-time evidence instead of uploading old gallery images.

### Source Code:
```tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X, Camera, Zap, ZapOff } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getCurrentLocation } from '../../../services/locationService';
import { ReportStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'Camera'>;
type ScreenRouteProp = RouteProp<ReportStackParamList, 'Camera'>;

export const CameraScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { category, fromDashboard } = route.params || {};

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (fromDashboard && e.data.action.type === 'POP') {
        e.preventDefault();
        navigation.getParent()?.navigate('Home');
      }
    });
    return unsubscribe;
  }, [navigation, fromDashboard]);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.noPermissionText}>We need camera access to capture incident reports.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;

    try {
      setCapturing(true);

      // take standard photo using expocamera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture photo');
      }

      const coordinates = await getCurrentLocation();
      if (!coordinates) {
        Alert.alert(
          'Location Required',
          'We need access to your device location to tag the report coordinates. Please enable GPS and try again.'
        );
        setCapturing(false);
        return;
      }

      navigation.navigate('Description', {
        category,
        imageUri: photo.uri,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error capturing report assets:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} flash={flash}>
        <SafeAreaView style={styles.overlay}>
          {}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.getParent()?.navigate('Home')}>
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.title}>Align Incident Photo</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setFlash(prev => prev === 'off' ? 'on' : 'off')}
            >
              {flash === 'on' ? (
                <Zap size={20} color="#FBBF24" fill="#FBBF24" />
              ) : (
                <ZapOff size={20} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>

          {}
          <View style={styles.frameContainer}>
            <View style={styles.frame} />
          </View>

          {}
          <View style={styles.footer}>
            <View style={styles.shutterContainer}>
              {}
              <TouchableOpacity
                style={styles.shutter}
                onPress={handleCapture}
                disabled={capturing}
              >
                {capturing ? (
                  <ActivityIndicator size="large" color={Colors.primaryBlue} />
                ) : (
                  <View style={styles.shutterInner}>
                    <Camera size={28} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.guidelineText}>
              Evidence must be captured live. Photo library selection is disabled.
            </Text>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Colors.spacing.lg,
    backgroundColor: Colors.background,
  },
  noPermissionText: {
    fontSize: 15,
    color: Colors.grayText,
    textAlign: 'center',
    marginBottom: Colors.spacing.lg,
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: Colors.primaryBlue,
    paddingHorizontal: Colors.spacing.lg,
    paddingVertical: Colors.spacing.sm,
    borderRadius: Colors.radius.md,
    marginBottom: Colors.spacing.md,
  },
  permissionBtnText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  placeholder: {
    width: 40,
  },
  frameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Colors.spacing.xl,
  },
  frame: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Colors.radius.md,
    borderStyle: 'dashed',
  },
  footer: {
    paddingBottom: Colors.spacing.xl,
    alignItems: 'center',
    paddingHorizontal: Colors.spacing.lg,
  },
  shutterContainer: {
    marginBottom: Colors.spacing.md,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelineText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

```

---

## File: app\src\screens\citizen\report\DescriptionScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the DescriptionScreen.tsx layer.

### Source Code:
```tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertCircle, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { ReportStackParamList } from '../../../types/navigation.types';
import { CATEGORIES, ReportCategoryType } from '../../../constants/categories';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'Description'>;
type ScreenRouteProp = RouteProp<ReportStackParamList, 'Description'>;

export const DescriptionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { t } = useTranslation();
  const { category: initialCategory, imageUri, latitude, longitude, timestamp } = route.params;

  const [selectedCategory, setSelectedCategory] = useState<ReportCategoryType>(initialCategory);
  const [description, setDescription] = useState('');

  const handleNext = () => {
    navigation.navigate('ReviewSubmit', {
      category: selectedCategory,
      imageUri,
      latitude,
      longitude,
      timestamp,
      description: description.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('describeIssueTitle')}</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {}
          <Card style={styles.card}>
            {}
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.thumbnail} />
              <View style={styles.metaContainer}>
                <Text style={styles.metaLabel}>Location Coordinates</Text>
                <Text style={styles.metaValue}>
                  Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                </Text>
                <Text style={styles.metaLabel}>Captured On</Text>
                <Text style={styles.metaValue}>
                  {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            {}
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Incident Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillsContainer}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.7}
                      style={[
                        styles.categoryPill,
                        isSelected && {
                          backgroundColor: cat.color,
                          borderColor: cat.color,
                        },
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected && styles.categoryPillTextSelected,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.divider} />

            {}
            <Input
              label={t('describeIssueTitle')}
              placeholder={t('contextPlaceholder')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              containerStyle={styles.inputContainer}
            />

            {}
            <View style={styles.guidelineCard}>
              <AlertCircle size={16} color={Colors.grayText} />
              <Text style={styles.guidelineText}>
                Reports must contain accurate descriptions. Intentionally false reporting will restrict account access.
              </Text>
            </View>
          </Card>

          <Button
            title={t('next')}
            onPress={handleNext}
            variant="primary"
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  placeholder: {
    width: 28,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: Colors.spacing.xl,
  },
  card: {
    padding: Colors.spacing.md,
    marginBottom: Colors.spacing.lg,
  },
  previewContainer: {
    flexDirection: 'row',
    marginBottom: Colors.spacing.md,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: Colors.radius.sm,
    backgroundColor: '#E5E7EB',
  },
  metaContainer: {
    flex: 1,
    marginLeft: Colors.spacing.md,
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    color: Colors.darkText,
    marginBottom: 8,
  },
  aiWrapper: {
    marginBottom: Colors.spacing.md,
  },
  aiLoadingContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: Colors.radius.sm,
    padding: Colors.spacing.sm,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  aiLoadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  aiLoadingTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 6,
  },
  aiProcessing: {
    fontSize: 12,
    color: Colors.grayText,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: Colors.spacing.md,
  },
  inputContainer: {
    marginBottom: Colors.spacing.sm,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  guidelineCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: Colors.spacing.sm,
  },
  guidelineText: {
    flex: 1,
    fontSize: 11,
    color: Colors.grayText,
    lineHeight: 15,
  },
  submitBtn: {
    width: '100%',
  },
  categorySection: {
    marginBottom: Colors.spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Colors.spacing.xs,
  },
  categoryPillsContainer: {
    paddingVertical: 4,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
  },
  categoryPillTextSelected: {
    color: Colors.white,
  },
});

```

---

## File: app\src\screens\citizen\report\ReviewSubmitScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the ReviewSubmitScreen.tsx layer.

### Source Code:
```tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  Linking,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin, Calendar, Clipboard, FolderOpen, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { createReport } from '../../../services/reportService';
import { CATEGORIES } from '../../../constants/categories';
import { ReportStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReviewSubmit'>;
type ScreenRouteProp = RouteProp<ReportStackParamList, 'ReviewSubmit'>;

export const ReviewSubmitScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { t, language } = useTranslation();
  const { category, imageUri, latitude, longitude, timestamp, description } = route.params;

  const [submitting, setSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const matchedCategory = CATEGORIES.find((c) => c.id === category);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const formData = new FormData();

      const fileUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;
      formData.append('image', {
        uri: fileUri,
        type: 'image/jpeg',
        name: 'report_incident.jpg',
      } as any);

      formData.append('category', category);
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      formData.append('description', description);
      formData.append('language', language);

      await createReport(formData);

      if (category === 'emergency_situation') {
        Linking.openURL('tel:112').catch((err) =>
          console.error('Failed to trigger emergency call:', err)
        );
      }

      navigation.navigate('SafetyTips', { category });
    } catch (error: any) {
      console.error('Error submitting report:', error);
      const backendMsg = error?.response?.data?.message || 'An error occurred while uploading your report. Please try again.';
      
      if (backendMsg.includes('AI Validation Failed:')) {
        const cleanMsg = backendMsg.replace('AI Validation Failed:', '').trim();
        setErrorMessage(cleanMsg);
        setShowErrorModal(true);
      } else {
        Alert.alert(t('error'), backendMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.warningIconContainer}>
              <AlertTriangle size={36} color="#DC2626" />
            </View>
            
            <Text style={styles.modalTitle}>{t('aiValidationTitle')}</Text>
            <Text style={styles.modalSub}>{t('aiValidationSub')}</Text>
            
            <View style={styles.reasonBox}>
              <Text style={styles.reasonText}>{errorMessage}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>{t('aiValidationButton')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('reviewSubmitTitle')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.mainImage} />
        </View>

        {}
        <Card style={styles.card}>
          <Text style={styles.summaryTitle}>{t('confirmDetails')}</Text>

          {}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <FolderOpen size={16} color={Colors.primaryBlue} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{t('categoryLabel')}</Text>
              <Text style={styles.infoValue}>
                {matchedCategory ? matchedCategory.label : category}
              </Text>
            </View>
          </View>

          {}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MapPin size={16} color={Colors.primaryBlue} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{t('locationCoords')}</Text>
              <Text style={styles.infoValue}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          {}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Calendar size={16} color={Colors.primaryBlue} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Captured Timestamp</Text>
              <Text style={styles.infoValue}>
                {new Date(timestamp).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          {}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Clipboard size={16} color={Colors.primaryBlue} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{t('descriptionLabel')}</Text>
              <Text style={styles.infoValue}>
                {description || <Text style={styles.emptyText}>No optional description provided.</Text>}
              </Text>
            </View>
          </View>
        </Card>

        {}
        <Button
          title={t('submitReportBtn')}
          onPress={handleSubmit}
          variant="secondary"
          loading={submitting}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  placeholder: {
    width: 28,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: Colors.spacing.xl,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: Colors.radius.md,
    overflow: 'hidden',
    marginBottom: Colors.spacing.md,
    ...Colors.shadow.soft,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: '#000', // add a black background for letterboxing
  },
  card: {
    padding: Colors.spacing.md,
    marginBottom: Colors.spacing.lg,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Colors.spacing.md,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryBlue + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Colors.spacing.md,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.darkText,
    marginTop: 2,
    lineHeight: 18,
  },
  emptyText: {
    fontStyle: 'italic',
    color: Colors.grayText,
  },
  submitBtn: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Colors.spacing.lg,
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.lg,
    padding: Colors.spacing.lg,
    alignItems: 'center',
    ...Colors.shadow.medium,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: Typography.fontWeight.bold,
    color: '#DC2626',
    marginBottom: Colors.spacing.xs,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
    marginBottom: Colors.spacing.md,
    lineHeight: 18,
  },
  reasonBox: {
    width: '100%',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    marginBottom: Colors.spacing.lg,
  },
  reasonText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    width: '100%',
    backgroundColor: Colors.primaryBlue,
    borderRadius: Colors.radius.md,
    paddingVertical: Colors.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});

```

---

## File: app\src\screens\citizen\report\SafetyTipsScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the SafetyTipsScreen.tsx layer.

### Source Code:
```tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { Button } from '../../../components/common/Button';
import { PreventionTips } from '../../../components/report/PreventionTips';
import { ReportStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'SafetyTips'>;
type ScreenRouteProp = RouteProp<ReportStackParamList, 'SafetyTips'>;

export const SafetyTipsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { t } = useTranslation();
  const { category } = route.params;

  const handleDone = () => {
    navigation.getParent()?.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.successHeader}>
          <View style={styles.iconCircle}>
            <CheckCircle size={48} color={Colors.environmentalGreen} />
          </View>
          <Text style={styles.title}>{t('success')}</Text>
          <Text style={styles.subtitle}>
            Your incident report has been submitted to the authorities. Thank you for making our community safe!
          </Text>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsHeading}>Safety Guidelines & Precautions</Text>
          <Text style={styles.tipsSubheading}>
            Please follow these guidelines based on the category you reported:
          </Text>
          <PreventionTips category={category} />
        </View>

        <Button
          title="Go to Home"
          onPress={handleDone}
          variant="primary"
          style={styles.doneBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Colors.spacing.lg,
    alignItems: 'center',
  },
  successHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    width: '100%',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.environmentalGreen + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Colors.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grayText,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Colors.spacing.md,
  },
  tipsSection: {
    width: '100%',
    marginBottom: 40,
  },
  tipsHeading: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 4,
  },
  tipsSubheading: {
    fontSize: 13,
    color: Colors.grayText,
    marginBottom: Colors.spacing.md,
    lineHeight: 18,
  },
  doneBtn: {
    width: '100%',
  },
});

```

---

## File: app\src\screens\citizen\report\SelectCategoryScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the SelectCategoryScreen.tsx layer.

### Source Code:
```tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { CATEGORIES, ReportCategoryType } from '../../../constants/categories';
import { CategoryTile } from '../../../components/dashboard/CategoryTile';
import { ReportStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'SelectCategory'>;

export const SelectCategoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategoryType | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;
  const instructionY = useRef(new Animated.Value(10)).current;
  const grid1Y = useRef(new Animated.Value(20)).current;
  const grid2Y = useRef(new Animated.Value(20)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-15);
    instructionY.setValue(10);
    grid1Y.setValue(20);
    grid2Y.setValue(20);

    Animated.stagger(85, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(headerY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(instructionY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(grid1Y, {
        toValue: 0,
        tension: 55,
        friction: 7.5,
        useNativeDriver: true,
      }),
      Animated.spring(grid2Y, {
        toValue: 0,
        tension: 55,
        friction: 7.5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    runEntranceAnimation();
  }, []);

  const handleSelect = (category: ReportCategoryType) => {
    setSelectedCategory(category);
    navigation.navigate('Camera', { category });
  };

  const environmentalCategories = CATEGORIES.filter((c) => c.group === 'environmental');
  const safetyCategories = CATEGORIES.filter((c) => c.group === 'safety');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }] }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.getParent()?.navigate('Home')}>
            <X size={20} color={Colors.darkText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('selectCategoryTitle')}</Text>
          <View style={styles.placeholder} />
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: instructionY }] }}>
          <Text style={styles.instruction}>
            {t('chooseMatchingCategory')}
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: grid1Y }] }}>
          <Text style={styles.sectionTitle}>{t('environmentalPollution' as any)}</Text>
          <View style={styles.grid}>
            {environmentalCategories.map((cat) => (
              <CategoryTile
                key={cat.id}
                category={cat}
                onPress={() => handleSelect(cat.id)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: grid2Y }] }}>
          <Text style={styles.sectionTitle}>{t('safetySecurity' as any)}</Text>
          <View style={styles.grid}>
            {safetyCategories.map((cat) => (
              <CategoryTile
                key={cat.id}
                category={cat}
                onPress={() => handleSelect(cat.id)}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  placeholder: {
    width: 28,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: Colors.spacing.xl,
  },
  instruction: {
    fontSize: 14,
    color: Colors.grayText,
    marginBottom: Colors.spacing.lg,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Colors.spacing.lg,
    marginHorizontal: -Colors.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Colors.radius.lg,
    borderTopRightRadius: Colors.radius.lg,
    padding: Colors.spacing.md,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
    paddingBottom: Colors.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  modalScroll: {
    marginBottom: Colors.spacing.md,
  },
  modalFooter: {
    paddingTop: Colors.spacing.xs,
  },
  continueButton: {
    width: '100%',
  },
});

```

---

## File: app\src\screens\citizen\tracking\ReportDetailScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]` `[Issue Reporting]` `[Data Flow]` `[AI Model]` `[Gemini API]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file manages the user reports. It handles report submissions, image uploads, GPS coordinates tagging (latitude/longitude), and status progress timeline updates.

### Source Code:
```tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Star, MapPin, Calendar, ClipboardList } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { getReportById } from '../../../services/reportService';
import { submitFeedback } from '../../../services/feedbackService';
import { ReportTimeline } from '../../../components/report/ReportTimeline';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Report, StatusHistory } from '../../../types/report.types';
import { CATEGORIES } from '../../../constants/categories';
import { ReportsStackParamList } from '../../../types/navigation.types';
import { useSettingsStore } from '../../../context/useSettingsStore';

type NavigationProp = NativeStackNavigationProp<ReportsStackParamList, 'ReportDetail'>;
type ScreenRouteProp = RouteProp<ReportsStackParamList, 'ReportDetail'>;

const getCategoryLabelHi = (categoryId: string) => {
  switch (categoryId) {
    case 'garbage_dump':
      return 'कचरा डंप';
    case 'plastic_pollution':
      return 'प्लास्टिक प्रदूषण';
    case 'waste_accumulation':
      return 'कचरा संचय';
    case 'water_pollution':
      return 'जल प्रदूषण';
    case 'suspicious_object':
      return 'संदिग्ध वस्तु';
    case 'emergency_situation':
      return 'आपातकालीन स्थिति';
    default:
      return categoryId;
  }
};

export const ReportDetailScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';
  const { reportId } = route.params;

  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const lastScrollY = useRef(0);
  const setTabBarVisible = useSettingsStore((s) => s.setTabBarVisible);

  useEffect(() => {
    setTabBarVisible(true);
    return () => setTabBarVisible(true);
  }, []);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (Math.abs(currentOffset - lastScrollY.current) > 15) {
      if (currentOffset > lastScrollY.current && currentOffset > 60) {
        setTabBarVisible(false);
      } else {
        setTabBarVisible(true);
      }
      lastScrollY.current = currentOffset;
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(20)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    contentY.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(contentY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (!loading && report) {
      runEntranceAnimation();
    }
  }, [loading]);

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getReportById(reportId);
      setReport(data.report);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching report details:', error);
      Alert.alert('Error', 'Failed to load report details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [reportId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Report not found.</Text>
      </SafeAreaView>
    );
  }

  const categoryItem = CATEGORIES.find((c) => c.id === report.category);

  const handleFeedbackSubmit = async () => {
    setFeedbackSubmitting(true);
    try {
      await submitFeedback(reportId, rating, comment);
      setFeedbackSubmitted(true);
      setFeedbackModalVisible(false);
      Alert.alert(t('feedbackSuccessTitle'), t('feedbackSuccessMsg'));
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      Alert.alert(t('error'), error.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const StarRating = () => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.8}>
          <Star
            size={36}
            color={star <= rating ? '#FBBF24' : '#D1D5DB'}
            fill={star <= rating ? '#FBBF24' : 'transparent'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isHindi ? 'रिपोर्ट: ' : 'Report: '}{categoryItem ? (isHindi ? getCategoryLabelHi(report.category) : categoryItem.label) : report.category}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: contentY }], flex: 1, backgroundColor: 'transparent' }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
          
          <Text style={styles.sectionTitle}>{t('routingTimeline')}</Text>
          <ReportTimeline
            currentStatus={report.status}
            historyLogs={history.map((h) => ({
              status: h.status,
              changedAt: h.changedAt,
              remarks: h.remarks,
            }))}
          />

          {report.status === 'resolved' && (
            <View style={styles.resolutionContainer}>
              <Text style={styles.sectionTitle}>{t('resolutionComparison')}</Text>
              <View style={styles.comparisonContainer}>
                <View style={styles.comparisonBox}>
                  <Image source={{ uri: report.imageURL }} style={styles.comparisonImage} />
                  <Text style={styles.comparisonLabel}>{t('beforeIncident')}</Text>
                </View>
                <View style={styles.comparisonBox}>
                  <Image
                    source={{ uri: report.resolutionImage || report.imageURL }}
                    style={styles.comparisonImage}
                  />
                  <Text style={styles.comparisonLabel}>{t('afterResolved')}</Text>
                </View>
              </View>
              {report.resolutionNotes ? (
                <Card style={styles.resolutionNotesCard}>
                  <Text style={styles.notesTitle}>{t('resolutionNotes')}</Text>
                  <Text style={styles.notesContent}>{report.resolutionNotes}</Text>
                </Card>
              ) : null}

              {!feedbackSubmitted && (
                <Button
                  title={t('leaveFeedbackBtn')}
                  onPress={() => setFeedbackModalVisible(true)}
                  style={styles.feedbackBtn}
                />
              )}
            </View>
          )}

          <Text style={styles.sectionTitle}>{t('reportDetailsTitle')}</Text>
          <Card style={styles.metaCard}>
            <View style={styles.metaRow}>
              <ClipboardList size={16} color={Colors.grayText} />
              <Text style={styles.metaText}>
                {isHindi ? 'श्रेणी: ' : 'Category: '}{categoryItem ? (isHindi ? getCategoryLabelHi(report.category) : categoryItem.label) : report.category}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <MapPin size={16} color={Colors.grayText} />
              <Text style={styles.metaText}>
                {isHindi ? 'जीपीएस: ' : 'GPS: '}{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Calendar size={16} color={Colors.grayText} />
              <Text style={styles.metaText}>
                {isHindi ? 'जमा करने की तारीख: ' : 'Submitted on: '}{new Date(report.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {report.description ? (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>{t('descriptionLabel')}</Text>
                <Text style={styles.descriptionText}>{report.description}</Text>
              </View>
            ) : null}
          </Card>
        </ScrollView>
      </Animated.View>

      <Modal
        visible={feedbackModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('rateResolutionTitle')}</Text>
            <Text style={styles.modalSub}>
              {t('howSatisfiedPrompt')}
            </Text>

            <StarRating />

            <Input
              label={t('descriptionLabel')}
              placeholder="Tell us what you think..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              style={styles.remarksInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <Button
                title={t('submit')}
                onPress={handleFeedbackSubmit}
                loading={feedbackSubmitting}
                style={styles.submitFeedbackBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 14,
    color: Colors.grayText,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Colors.spacing.md,
  },
  placeholder: {
    width: 28,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: 110,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
    marginTop: Colors.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resolutionContainer: {
    marginTop: Colors.spacing.sm,
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: Colors.spacing.sm,
    marginBottom: Colors.spacing.sm,
  },
  comparisonBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
  },
  comparisonImage: {
    width: '100%',
    aspectRatio: 1,
  },
  comparisonLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    paddingVertical: 6,
    color: Colors.grayText,
  },
  resolutionNotesCard: {
    padding: Colors.spacing.md,
    borderColor: '#EFF6FF',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    marginBottom: Colors.spacing.md,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
    marginBottom: 4,
  },
  notesContent: {
    fontSize: 13,
    color: Colors.darkText,
    lineHeight: 18,
  },
  feedbackBtn: {
    width: '100%',
    marginBottom: Colors.spacing.sm,
  },
  metaCard: {
    padding: Colors.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Colors.spacing.sm,
  },
  metaText: {
    fontSize: 13,
    color: Colors.darkText,
  },
  descriptionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: Colors.spacing.sm,
    marginTop: Colors.spacing.xs,
  },
  descriptionLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: Colors.darkText,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Colors.radius.lg,
    borderTopRightRadius: Colors.radius.lg,
    padding: Colors.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Colors.spacing.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
    marginBottom: Colors.spacing.lg,
    lineHeight: 18,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: Colors.spacing.lg,
  },
  remarksInput: {
    marginBottom: Colors.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Colors.spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
  },
  submitFeedbackBtn: {
    flex: 2,
  },
});

```

---

## File: app\src\screens\citizen\tracking\ReportTrackingScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]` `[Issue Reporting]` `[Data Flow]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file manages the user reports. It handles report submissions, image uploads, GPS coordinates tagging (latitude/longitude), and status progress timeline updates.

### Source Code:
```tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { getUserReports } from '../../../services/reportService';
import { useAuthStore } from '../../../context/useAuthStore';
import { Report, ReportStatus } from '../../../types/report.types';
import { RecentReportCard } from '../../../components/dashboard/RecentReportCard';
import { ReportsStackParamList } from '../../../types/navigation.types';
import { useSettingsStore } from '../../../context/useSettingsStore';

type NavigationProp = NativeStackNavigationProp<ReportsStackParamList, 'ReportList'>;

interface FilterChip {
  id: 'all' | ReportStatus;
  label: string;
}

const CHIPS: FilterChip[] = [
  { id: 'all', label: 'All' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'action_started', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
];

export const ReportTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';
  const user = useAuthStore((s) => s.user);

  const getChipLabel = (id: string, defaultLabel: string) => {
    if (isHindi) {
      switch (id) {
        case 'all':
          return 'सभी';
        case 'submitted':
          return 'जमा की गई';
        case 'under_review':
          return 'समीक्षा के अधीन';
        case 'assigned':
          return 'आवंटित';
        case 'action_started':
          return 'कार्रवाई शुरू';
        case 'resolved':
          return 'हल';
        default:
          return defaultLabel;
      }
    }
    return defaultLabel;
  };

  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [activeChip, setActiveChip] = useState<'all' | ReportStatus>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const lastScrollY = useRef(0);
  const setTabBarVisible = useSettingsStore((s) => s.setTabBarVisible);

  useEffect(() => {
    setTabBarVisible(true);
    return () => setTabBarVisible(true);
  }, []);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (Math.abs(currentOffset - lastScrollY.current) > 15) {
      if (currentOffset > lastScrollY.current && currentOffset > 60) {
        setTabBarVisible(false);
      } else {
        setTabBarVisible(true);
      }
      lastScrollY.current = currentOffset;
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;
  const chipsY = useRef(new Animated.Value(-10)).current;
  const listY = useRef(new Animated.Value(20)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-15);
    chipsY.setValue(-10);
    listY.setValue(20);

    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(headerY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(chipsY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(listY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (!loading) {
      runEntranceAnimation();
    }
  }, [loading]);

  const fetchReports = async (isARefresh = false) => {
    if (!user) return;
    try {
      if (!isARefresh) setLoading(true);
      const data = await getUserReports(user.id, 1, 50); // fetch up to 50 reports for simplicity
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error loading tracked reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports(reports.length > 0);
    const unsubscribe = navigation.addListener('focus', () => {
      fetchReports(true);
    });
    return unsubscribe;
  }, [navigation, user]);

  useEffect(() => {
    if (activeChip === 'all') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((r) => r.status === activeChip));
    }
  }, [activeChip, reports]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }] }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('trackReportsTitle')}</Text>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: chipsY }], zIndex: 10 }}>
        <View style={styles.chipsContainer}>
          <FlatList
            data={CHIPS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chipsContent}
            renderItem={({ item }) => {
              const isActive = activeChip === item.id;
              return (
                <TouchableOpacity
                  style={[styles.chip, isActive ? styles.chipActive : null]}
                  onPress={() => setActiveChip(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                    {getChipLabel(item.id, item.label)}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: listY }], flex: 1, backgroundColor: 'transparent' }}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primaryBlue} />
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>{t('noReportsYet')}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredReports}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <RecentReportCard
                report={item}
                onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
              />
            )}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  chipsContainer: {
    backgroundColor: Colors.white,
    paddingVertical: Colors.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chipsContent: {
    paddingHorizontal: Colors.spacing.md,
    gap: 8,
  },
  chip: {
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: Colors.primaryBlue,
  },
  chipText: {
    fontSize: 13,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
  },
  chipTextActive: {
    color: Colors.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Colors.spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.grayText,
    textAlign: 'center',
  },
  listContent: {
    padding: Colors.spacing.md,
    paddingBottom: Colors.spacing.xl,
  },
});

```

---

## File: app\src\screens\onboarding\OnboardingScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the OnboardingScreen.tsx layer.

### Source Code:
```tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera, Navigation, Activity, LucideIcon } from 'lucide-react-native';
import { Button } from '../../components/common/Button';
import { AuthStackParamList } from '../../types/navigation.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  id: string;
  Icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: 'report',
    Icon: Camera,
    iconColor: Colors.primaryBlue,
    title: 'Report in Real-Time',
    description:
      'Capture photo evidence on the spot with your camera. Your GPS location and timestamp are automatically recorded — no gallery uploads allowed, ensuring authentic evidence.',
  },
  {
    id: 'route',
    Icon: Navigation,
    iconColor: Colors.environmentalGreen,
    title: 'Automatic Routing',
    description:
      'Reports are instantly routed to the right department — Municipal Sanitation for pollution, Police & Emergency for suspicious objects. No manual guesswork needed.',
  },
  {
    id: 'track',
    Icon: Activity,
    iconColor: Colors.alertOrange,
    title: 'Track Live Progress',
    description:
      'Follow your report through 5 stages: Submitted → Under Review → Assigned → Action Started → Resolved. Get push notifications at every step.',
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      navigation.navigate('Login');
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  const translatedSlides = SLIDES.map((slide) => {
    let titleKey: 'slide1Title' | 'slide2Title' | 'slide3Title' = 'slide1Title';
    let descKey: 'slide1Desc' | 'slide2Desc' | 'slide3Desc' = 'slide1Desc';
    if (slide.id === 'route') {
      titleKey = 'slide2Title';
      descKey = 'slide2Desc';
    } else if (slide.id === 'track') {
      titleKey = 'slide3Title';
      descKey = 'slide3Desc';
    }
    return {
      ...slide,
      title: t(titleKey),
      description: t(descKey),
    };
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.skipText}>{t('skip')}</Text>
      </TouchableOpacity>

      {}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {translatedSlides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            {}
            <View
              style={[
                styles.illustrationCircle,
                { backgroundColor: slide.iconColor + '14' },
              ]}
            >
              <View
                style={[
                  styles.illustrationInner,
                  { backgroundColor: slide.iconColor + '22' },
                ]}
              >
                <slide.Icon size={52} color={slide.iconColor} />
              </View>
            </View>

            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      {}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {}
      <View style={styles.footer}>
        <Button
          title={isLast ? t('getStarted') : t('next')}
          onPress={goToNext}
          variant="primary"
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: Colors.spacing.lg,
    paddingTop: Colors.spacing.md,
    paddingBottom: Colors.spacing.sm,
  },
  skipText: {
    fontSize: Typography.fontSize.body,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Colors.spacing.xl,
    paddingBottom: 100,
  },
  illustrationCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Colors.spacing.xl,
  },
  illustrationInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    textAlign: 'center',
    marginBottom: Colors.spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.body,
    color: Colors.grayText,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.body,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Colors.spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primaryBlue,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#D1D5DB',
  },
  footer: {
    paddingHorizontal: Colors.spacing.xl,
    paddingBottom: Colors.spacing.xl,
  },
  nextButton: {
    width: '100%',
  },
});

```

---

## File: app\src\screens\splash\SplashScreen.tsx

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[User Interface]` `[Screen]`

**Architecture Role:**
> Mobile app page design screen component

**Detailed Functionality:**
> This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the SplashScreen.tsx layer.

### Source Code:
```tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera, MapPin, AlertTriangle, Shield, Globe } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Button } from '../../components/common/Button';
import { AuthStackParamList } from '../../types/navigation.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsStore } from '../../context/useSettingsStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_DEVICE = SCREEN_HEIGHT < 680;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettingsStore();
  const [langModalVisible, setLangModalVisible] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const logoRingAnim = useRef(new Animated.Value(1)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const float4 = useRef(new Animated.Value(0)).current;

  const modalSlide = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const floatAnimation = (val: Animated.Value, delay: number, offset: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(val, {
          toValue: offset,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(val, {
          toValue: -offset,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(val, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(ctaAnim, {
        toValue: 1,
        duration: 800,
        delay: 550,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRingAnim, {
          toValue: 1.15,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(logoRingAnim, {
          toValue: 0.98,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    floatAnimation(float1, 0, 10);
    floatAnimation(float2, 350, 12);
    floatAnimation(float3, 700, 8);
    floatAnimation(float4, 1100, 14);
  }, []);

  useEffect(() => {
    if (langModalVisible) {
      Animated.spring(modalSlide, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalSlide, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [langModalVisible]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View style={styles.backgroundAccentOuter} />
      <View style={styles.backgroundAccentInner} />

      <View style={styles.langToggle}>
        <TouchableOpacity
          style={[styles.langBtn, language === 'en' ? styles.langBtnActive : null]}
          onPress={() => setLanguage('en')}
        >
          <Text style={[styles.langText, language === 'en' ? styles.langTextActive : null]}>EN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langBtn, language === 'hi' ? styles.langBtnActive : null]}
          onPress={() => setLanguage('hi')}
        >
          <Text style={[styles.langText, language === 'hi' ? styles.langTextActive : null]}>HI</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.flexContainer}>
        { }
        <View style={styles.bubbleTrack}>
          <Animated.View style={[styles.iconBubbleWrapper, { transform: [{ translateY: float1 }], left: '8%', top: '12%' }]}>
            <View style={[styles.iconBubble, { backgroundColor: '#EFF6FF' }]}>
              <Camera size={20} color="#2563EB" />
            </View>
          </Animated.View>
          <Animated.View style={[styles.iconBubbleWrapper, { transform: [{ translateY: float2 }], right: '10%', top: '22%' }]}>
            <View style={[styles.iconBubble, { backgroundColor: '#ECFDF5' }]}>
              <MapPin size={20} color="#10B981" />
            </View>
          </Animated.View>
          <Animated.View style={[styles.iconBubbleWrapper, { transform: [{ translateY: float3 }], left: '12%', bottom: '32%' }]}>
            <View style={[styles.iconBubble, { backgroundColor: '#FFF7ED' }]}>
              <AlertTriangle size={20} color="#F59E0B" />
            </View>
          </Animated.View>
          <Animated.View style={[styles.iconBubbleWrapper, { transform: [{ translateY: float4 }], right: '15%', bottom: '26%' }]}>
            <View style={[styles.iconBubble, { backgroundColor: '#EFF6FF' }]}>
              <Shield size={20} color="#2563EB" />
            </View>
          </Animated.View>
        </View>

        { }
        <View style={styles.logoSpacer} />

        { }
        <Animated.View
          style={[
            styles.logoBlock,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.logoContainer}>
            <Animated.View
              style={[
                styles.logoHalo,
                { transform: [{ scale: logoRingAnim }] },
              ]}
            />
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌏</Text>
            </View>
          </View>

          <Text style={styles.brandName}>CivicSafe</Text>
          <Text style={styles.tagline}>{t('slogan')}</Text>
        </Animated.View>

        { }
        <Animated.View style={[styles.ctaContainer, { opacity: ctaAnim }]}>
          <Button
            title={t('getStarted')}
            onPress={() => navigation.navigate('Onboarding')}
            variant="primary"
            style={styles.ctaButton}
          />
          <View style={styles.loginRow}>
            <Text style={styles.loginHintText}>{t('alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.loginLink}>{t('logIn')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setLangModalVisible(false)}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={20}
              tint="dark"
            />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: modalSlide }],
              },
            ]}
          >
            <View style={styles.drawerHandle} />

            <View style={styles.modalHeaderRow}>
              <Globe size={24} color={Colors.primaryBlue} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Choose Language / भाषा चुनें</Text>
            </View>
            <Text style={styles.modalSub}>Select your preferred display language for reporting:</Text>

            <TouchableOpacity
              style={[styles.langOptionCard, language === 'en' ? styles.langOptionActive : null]}
              onPress={() => {
                setLanguage('en');
                setLangModalVisible(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.langOptionText, language === 'en' ? styles.langOptionTextActive : null]}>English</Text>
              {language === 'en' && <View style={styles.optionIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langOptionCard, language === 'hi' ? styles.langOptionActive : null]}
              onPress={() => {
                setLanguage('hi');
                setLangModalVisible(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.langOptionText, language === 'hi' ? styles.langOptionTextActive : null]}>हिंदी (Hindi)</Text>
              {language === 'hi' && <View style={styles.optionIndicator} />}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  flexContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Colors.spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  logoSpacer: {
    height: IS_SMALL_DEVICE ? 10 : 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    ...Colors.shadow.medium,
  },
  logoEmoji: {
    fontSize: 48,
  },
  backgroundAccentOuter: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#EFF6FF',
    opacity: 0.8,
    zIndex: -2,
  },
  backgroundAccentInner: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#ECFDF5',
    opacity: 0.6,
    zIndex: -2,
  },
  bubbleTrack: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  iconBubbleWrapper: {
    position: 'absolute',
    ...Colors.shadow.soft,
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  logoBlock: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
  },
  logoHalo: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
  },
  brandName: {
    fontSize: 32,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    letterSpacing: -1,
    marginBottom: Colors.spacing.xs,
  },
  tagline: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 4,
  },
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  ctaButton: {
    width: '100%',
    height: 52,
    borderRadius: Colors.radius.md,
    ...Colors.shadow.medium,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Colors.spacing.md,
    gap: 4,
  },
  loginHintText: {
    fontSize: 14,
    color: Colors.grayText,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.bold,
  },
  langToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: Colors.spacing.lg,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: Colors.radius.sm,
    padding: 2,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Colors.radius.sm - 2,
  },
  langBtnActive: {
    backgroundColor: Colors.white,
    ...Colors.shadow.soft,
  },
  langText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
  },
  langTextActive: {
    color: Colors.primaryBlue,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: Colors.radius.lg,
    borderTopRightRadius: Colors.radius.lg,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    ...Colors.shadow.medium,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  drawerHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.grayText,
    marginBottom: 20,
    lineHeight: 18,
  },
  langOptionCard: {
    width: '100%',
    padding: 16,
    borderRadius: Colors.radius.sm,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  langOptionActive: {
    borderColor: Colors.primaryBlue,
    backgroundColor: '#EFF6FF',
  },
  langOptionText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  langOptionTextActive: {
    color: Colors.primaryBlue,
  },
  optionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryBlue,
  },
});

```

---

## File: app\src\services\adminService.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[Service]` `[Integration]` `[Admin Panel]` `[Management]`

**Architecture Role:**
> Mobile app API connection client (Axios service)

**Detailed Functionality:**
> We created this service using Axios to connect our frontend React Native app with our backend server. It handles the base server URL and automatically attaches our authorization token in the request header so the server knows who is making the request. It makes API calls very simple to write.

**Core Logic:**
> Specifically, this file implements features for the admin authority panel. It allows municipal officers to fetch reports, view analytical summaries, and coordinate resolution tasks.

### Source Code:
```typescript
import * as SecureStore from 'expo-secure-store';
import api, { USE_MOCK } from './api';
import { Report, ReportStatus } from '../types/report.types';

const MOCK_REPORTS_KEY = 'op_mock_reports';

const getMockReports = async (): Promise<Report[]> => {
  try {
    const raw = await SecureStore.getItemAsync(MOCK_REPORTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

const saveMockReports = async (reports: Report[]) => {
  await SecureStore.setItemAsync(MOCK_REPORTS_KEY, JSON.stringify(reports));
};

interface AdminFilters {
  status?: string;
  category?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export const getAllReports = async (
  filters: AdminFilters
): Promise<{ reports: Report[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
  if (USE_MOCK) {
    let reports = await getMockReports();
    if (filters.status && filters.status !== 'all') {
      reports = reports.filter(r => r.status === filters.status);
    }
    if (filters.category) {
      reports = reports.filter(r => r.category === filters.category);
    }
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    return {
      reports: reports.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total: reports.length,
        pages: Math.ceil(reports.length / limit)
      }
    };
  }

  const response = await api.get('/admin/reports', { params: filters });
  return response.data.data;
};

export const updateReportStatus = async (
  id: string,
  status: ReportStatus,
  remarks?: string,
  assignedAdminId?: string
): Promise<Report> => {
  if (USE_MOCK) {
    const reports = await getMockReports();
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');
    
    reports[index].status = status;
    reports[index].updatedAt = new Date().toISOString();
    if (assignedAdminId) reports[index].assignedAdminId = assignedAdminId;
    
    await saveMockReports(reports);
    return reports[index];
  }

  const response = await api.patch(`/admin/reports/${id}/status`, {
    status,
    remarks,
    assignedAdminId,
  });
  return response.data.data.report;
};

export const uploadResolution = async (
  id: string,
  formData: FormData
): Promise<Report> => {
  if (USE_MOCK) {
    const reports = await getMockReports();
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');

    const parts = (formData as any)._parts || [];
    const getPart = (key: string) => parts.find(([k]: any) => k === key)?.[1];
    
    const resolutionImgObj = getPart('image');
    
    reports[index].status = 'resolved';
    reports[index].resolutionNotes = getPart('notes') || 'Resolved by authority';
    reports[index].resolutionImage = resolutionImgObj?.uri || reports[index].imageURL;
    reports[index].updatedAt = new Date().toISOString();

    await saveMockReports(reports);
    return reports[index];
  }

  const response = await api.post(`/admin/reports/${id}/resolution`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Client-Version': '2.0.0-AI',
    },
    transformRequest: (data) => data,
  });
  return response.data.data.report;
};

export const getAnalytics = async (): Promise<{
  totalReports: number;
  byStatus: { _id: string; count: number }[];
  byCategory: { _id: string; count: number }[];
  byDepartment: { _id: string; count: number }[];
}> => {
  if (USE_MOCK) {
    const reports = await getMockReports();
    const byStatusMap: Record<string, number> = {};
    const byCategoryMap: Record<string, number> = {};
    const byDepartmentMap: Record<string, number> = {};

    reports.forEach(r => {
      byStatusMap[r.status] = (byStatusMap[r.status] || 0) + 1;
      byCategoryMap[r.category] = (byCategoryMap[r.category] || 0) + 1;
      
      const dept = r.category === 'suspicious_object' || r.category === 'emergency_situation' 
        ? 'Police / Safety Dept' 
        : 'Municipal Sanitation';
      byDepartmentMap[dept] = (byDepartmentMap[dept] || 0) + 1;
    });

    return {
      totalReports: reports.length,
      byStatus: Object.keys(byStatusMap).map(k => ({ _id: k, count: byStatusMap[k] })),
      byCategory: Object.keys(byCategoryMap).map(k => ({ _id: k, count: byCategoryMap[k] })),
      byDepartment: Object.keys(byDepartmentMap).map(k => ({ _id: k, count: byDepartmentMap[k] }))
    };
  }

  const response = await api.get('/admin/analytics');
  return response.data.data;
};

```

---

## File: app\src\services\aiService.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[Service]` `[Integration]` `[AI Model]` `[Gemini API]`

**Architecture Role:**
> Mobile app API connection client (Axios service)

**Detailed Functionality:**
> We created this service using Axios to connect our frontend React Native app with our backend server. It handles the base server URL and automatically attaches our authorization token in the request header so the server knows who is making the request. It makes API calls very simple to write.

**Core Logic:**
> Specifically, this file connects our app to the Google Gemini AI. We write detailed prompts instructing the AI how to check if photos are valid (detecting fake images/selfies) or verifying if resolution photos match the original incident landmarks to prevent cheating.

### Source Code:
```typescript


interface AiScanResult {
  label: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
}

const PLAUSIBLE_LABELS = [
  { label: 'Garbage Accumulation', priority: 'medium' },
  { label: 'Plastic Pollution', priority: 'medium' },
  { label: 'Debris/Trash Dump', priority: 'medium' },
  { label: 'Water Contamination', priority: 'medium' },
  { label: 'Safety Hazard / Blockage', priority: 'high' },
  { label: 'Suspicious Material', priority: 'high' },
] as const;

export const mockAnalyzeImage = async (_imageUri: string): Promise<AiScanResult> => {
  // simulate network or processing latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const randomIndex = Math.floor(Math.random() * PLAUSIBLE_LABELS.length);
  const selected = PLAUSIBLE_LABELS[randomIndex];
  const confidence = Math.round((82 + Math.random() * 16) * 10) / 10; // e.g., 82.5 to 98

  return {
    label: selected.label,
    confidence,
    priority: selected.priority,
  };
};

```

---

## File: app\src\services\api.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[Service]` `[Integration]`

**Architecture Role:**
> Mobile app API connection client (Axios service)

**Detailed Functionality:**
> We created this service using Axios to connect our frontend React Native app with our backend server. It handles the base server URL and automatically attaches our authorization token in the request header so the server knows who is making the request. It makes API calls very simple to write.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the api.ts layer.

### Source Code:
```typescript
import axios from 'axios';
import { useAuthStore } from '../context/useAuthStore';

// base api connection config

// e.g., http192.168.1.503000api
export const API_BASE_URL = 'https://civic-app-3wdi.onrender.com/api';
export const USE_MOCK = false;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const recursivelyNormalizeIds = (obj: any): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(recursivelyNormalizeIds);
  }
  const newObj: any = {};
  for (const key of Object.keys(obj)) {
    if (key === '_id') {
      newObj.id = String(obj._id);
      newObj._id = String(obj._id);
    } else {
      newObj[key] = recursivelyNormalizeIds(obj[key]);
    }
  }
  if (obj._id && !obj.id) {
    newObj.id = String(obj._id);
    newObj._id = String(obj._id);
  }
  return newObj;
};

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = recursivelyNormalizeIds(response.data);
    }
    return response;
  },
  (error) => {

    // check for offlinenetwork issues
    if (!error.response && error.message === 'Network Error') {
      const offlineErr = new Error('No internet connection. Please verify your network settings and try again.');
      return Promise.reject(offlineErr);
    }

    return Promise.reject(error);
  }
);

export default api;

```

---

## File: app\src\services\authService.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[Service]` `[Integration]` `[Authentication]` `[Security]` `[Login]`

**Architecture Role:**
> Mobile app API connection client (Axios service)

**Detailed Functionality:**
> We created this service using Axios to connect our frontend React Native app with our backend server. It handles the base server URL and automatically attaches our authorization token in the request header so the server knows who is making the request. It makes API calls very simple to write.

**Core Logic:**
> Specifically, this file is responsible for the authentication system. It writes code to register new users, verify their credentials, and maintain secure logged-in sessions using JWT tokens.

### Source Code:
```typescript

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { firebaseAuth, FIREBASE_CONFIG } from '../config/firebaseConfig';
import { useAuthStore } from '../context/useAuthStore';
import { User } from '../types/user.types';
import api, { USE_MOCK } from './api';

function firebaseErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    switch ((err as { code: string }).code) {
      case 'auth/invalid-verification-code':
        return 'Incorrect OTP. Please check and try again.';
      case 'auth/code-expired':
        return 'OTP has expired. Please request a new one.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a few minutes and try again.';
      case 'auth/invalid-phone-number':
        return 'The phone number format is invalid.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        break;
    }
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred. Please try again.';
}

// 1. register with firebase emailpassword

export const registerWithEmail = async (email: string, password: string): Promise<string> => {
  if (USE_MOCK) {
    return 'mock-id-token';
  }
  try {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const idToken = await credential.user.getIdToken();
    return idToken;
  } catch (err) {
    throw new Error(firebaseErrorMessage(err));
  }
};

export const sendFirebaseVerificationEmail = async (): Promise<void> => {
  if (USE_MOCK) {
    console.log('[MOCK] Sending Firebase verification email');
    return;
  }
  if (firebaseAuth.currentUser) {
    try {
      await sendEmailVerification(firebaseAuth.currentUser);
    } catch (err) {
      throw new Error(firebaseErrorMessage(err));
    }
  }
};

export const checkEmailVerified = async (): Promise<boolean> => {
  if (USE_MOCK) {
    return true;
  }
  if (firebaseAuth.currentUser) {
    try {
      await firebaseAuth.currentUser.reload();
      return firebaseAuth.currentUser.emailVerified;
    } catch (err) {
      throw new Error(firebaseErrorMessage(err));
    }
  }
  return false;
};

// 2. login with firebase emailpassword

export const loginWithEmail = async (email: string, password: string): Promise<string> => {
  if (USE_MOCK) {
    return 'mock-id-token';
  }
  try {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const idToken = await credential.user.getIdToken();
    return idToken;
  } catch (err) {
    throw new Error(firebaseErrorMessage(err));
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  if (USE_MOCK) {
    console.log('[MOCK] Sending password reset email to:', email);
    return;
  }
  try {
    await sendPasswordResetEmail(firebaseAuth, email);
  } catch (err) {
    throw new Error(firebaseErrorMessage(err));
  }
};

interface RegisterProfile {
  name: string;
  phone: string;
  email?: string;
  role: 'citizen' | 'admin';
  inviteCode?: string;
}

import * as SecureStore from 'expo-secure-store';

const MOCK_USERS_KEY = 'op_mock_users';

const getMockUsers = async (): Promise<User[]> => {
  try {
    const raw = await SecureStore.getItemAsync(MOCK_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

const saveMockUser = async (user: User) => {
  const users = await getMockUsers();
  const index = users.findIndex(u => u.email?.toLowerCase() === user.email?.toLowerCase());
  if (index !== -1) {
    users[index] = user;
  } else {
    users.push(user);
  }
  await SecureStore.setItemAsync(MOCK_USERS_KEY, JSON.stringify(users));
};

export const registerWithBackend = async (
  idToken: string,
  profile: RegisterProfile
): Promise<void> => {
  if (USE_MOCK) {
    const user: User = {
      id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
      name: profile.name || 'Citizen User',
      phone: profile.phone || '9999999999',
      email: profile.email || 'mock@civicsafe.com',
      role: profile.role || 'citizen',
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    };
    await saveMockUser(user);
    const token = 'mock-token';
    await useAuthStore.getState().setSession(user, token);
    return;
  }
  try {
    const res = await api.post('/auth/register', {
      idToken,
      name: profile.name,
      phone: profile.phone,
      email: profile.email || undefined,
      role: profile.role,
      inviteCode: profile.inviteCode || undefined,
    });
    const data = res.data.data as any;
    const user = { ...data.user, id: data.user.id || data.user._id } as User;
    const token = data.token as string;
    await useAuthStore.getState().setSession(user, token);
  } catch (err: unknown) {

    const axiosErr = err as { response?: { data?: { message?: string } } };
    const message = axiosErr?.response?.data?.message ?? firebaseErrorMessage(err);
    throw new Error(message);
  }
};

export const loginWithBackend = async (
  idToken: string,
  email?: string,
  role?: 'citizen' | 'admin'
): Promise<void> => {
  if (USE_MOCK) {
    const users = await getMockUsers();
    let user = email ? users.find(u => u.email?.toLowerCase() === email.toLowerCase()) : null;
    if (!user) {
      const derivedName = email ? email.split('@')[0] : 'Citizen';
      const capitalizedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
      const isMockAdmin = email ? email.toLowerCase().includes('admin') : false;
      user = {
        id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
        name: capitalizedName,
        phone: '9999999999',
        email: email || 'mock@civicsafe.com',
        role: isMockAdmin ? 'admin' : (role || 'citizen'),
        verificationStatus: 'verified',
        createdAt: new Date().toISOString(),
      };
      await saveMockUser(user);
    }
    const token = 'mock-token';
    await useAuthStore.getState().setSession(user, token);
    return;
  }
  try {
    const res = await api.post('/auth/login', { idToken });
    const data = res.data.data as any;
    const user = { ...data.user, id: data.user.id || data.user._id } as User;
    if (user && role && user.role !== role) {
      throw new Error(`This account is registered as ${user.role}, not ${role}.`);
    }
    const token = data.token as string;
    await useAuthStore.getState().setSession(user, token);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('registered as')) {
      throw err;
    }
    const axiosErr = err as { response?: { data?: { message?: string } } };
    const message = axiosErr?.response?.data?.message ?? firebaseErrorMessage(err);
    throw new Error(message);
  }
};

// 5. logout

export const logout = async (): Promise<void> => {
  try {
    await signOut(firebaseAuth);
  } catch {

  }
  await useAuthStore.getState().logout();
};

```

---

## File: app\src\services\cameraService.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[Service]` `[Integration]` `[Hardware]` `[Camera]`

**Architecture Role:**
> Mobile app API connection client (Axios service)

**Detailed Functionality:**
> We created this service using Axios to connect our frontend React Native app with our backend server. It handles the base server URL and automatically attaches our authorization token in the request header so the server knows who is making the request. It makes API calls very simple to write.

**Core Logic:**
> Specifically, this file handles the camera module using Expo Camera. It lets users take live photos of incidents, toggles the phone flash hardware, and ensures they capture real-time evidence instead of uploading old gallery images.

### Source Code:
```typescript
import { Camera } from 'expo-camera';

export const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
};

```

---

## File: app\src\services\feedbackService.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[Service]` `[Integration]`

**Architecture Role:**
> Mobile app API connection client (Axios service)

**Detailed Functionality:**
> We created this service using Axios to connect our frontend React Native app with our backend server. It handles the base server URL and automatically attaches our authorization token in the request header so the server knows who is making the request. It makes API calls very simple to write.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the feedbackService.ts layer.

### Source Code:
```typescript
import * as SecureStore from 'expo-secure-store';
import api, { USE_MOCK } from './api';
import { Feedback, Report } from '../types/report.types';

const MOCK_REPORTS_KEY = 'op_mock_reports';

export const submitFeedback = async (
  reportId: string,
  rating: number,
  comment?: string
): Promise<Feedback> => {
  if (USE_MOCK) {
    try {
      const raw = await SecureStore.getItemAsync(MOCK_REPORTS_KEY);
      if (raw) {
        const reports: Report[] = JSON.parse(raw);
        const report = reports.find((r) => r.id === reportId);
        if (report) {

          report.resolutionNotes = (report.resolutionNotes || '') + `\n\n[Citizen Rating: ${rating} Stars. Comment: ${comment || 'No comment.'}]`;
          await SecureStore.setItemAsync(MOCK_REPORTS_KEY, JSON.stringify(reports));
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    // return a mock feedback response object
    return {
      id: 'mock-feedback-' + Math.random().toString(36).substr(2, 9),
      reportId,
      userId: 'mock-user-id',
      rating,
      comment: comment || '',
      createdAt: new Date().toISOString()
    };
  }

  const response = await api.post('/feedback', {
    reportId,
    rating,
    comment: comment || undefined,
  });
  return response.data.data.feedback;
};

```

---

## File: app\src\services\locationService.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[Service]` `[Integration]` `[GPS]` `[Geolocation]`

**Architecture Role:**
> Mobile app API connection client (Axios service)

**Detailed Functionality:**
> We created this service using Axios to connect our frontend React Native app with our backend server. It handles the base server URL and automatically attaches our authorization token in the request header so the server knows who is making the request. It makes API calls very simple to write.

**Core Logic:**
> Specifically, this file manages GPS location services. It requests device permissions, reads the physical sensor coordinates, and tags them to ensure accurate mapping.

### Source Code:
```typescript
import * as Location from 'expo-location';

export const requestLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const getCurrentLocation = async (): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error fetching current location:', error);
    return null;
  }
};

```

---

## File: app\src\services\notificationService.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[Service]` `[Integration]` `[Push Notifications]` `[Alerts]`

**Architecture Role:**
> Mobile app API connection client (Axios service)

**Detailed Functionality:**
> We created this service using Axios to connect our frontend React Native app with our backend server. It handles the base server URL and automatically attaches our authorization token in the request header so the server knows who is making the request. It makes API calls very simple to write.

**Core Logic:**
> Specifically, this file implements push notifications using Expo Notifications. It registers the device token with the server and triggers real-time popup alerts whenever a report status changes.

### Source Code:
```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  let token = null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }

    // retrieve token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || '4f808b23-0d53-488b-8a13-97bd5834fe14';
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('[Push Notification Device Token]:', token);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // save token to backend
    if (token) {
      await api.patch('/auth/me/push-token', { fcmToken: token });
    }
  } catch (error) {
    console.error('Error during push notification registration:', error);
  }

  return token;
};

```

---

## File: app\src\services\reportService.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[Service]` `[Integration]` `[Issue Reporting]` `[Data Flow]`

**Architecture Role:**
> Mobile app API connection client (Axios service)

**Detailed Functionality:**
> We created this service using Axios to connect our frontend React Native app with our backend server. It handles the base server URL and automatically attaches our authorization token in the request header so the server knows who is making the request. It makes API calls very simple to write.

**Core Logic:**
> Specifically, this file manages the user reports. It handles report submissions, image uploads, GPS coordinates tagging (latitude/longitude), and status progress timeline updates.

### Source Code:
```typescript
import * as SecureStore from 'expo-secure-store';
import api, { USE_MOCK } from './api';
import { Report } from '../types/report.types';

const MOCK_REPORTS_KEY = 'op_mock_reports';

const getMockReports = async (): Promise<Report[]> => {
  try {
    const raw = await SecureStore.getItemAsync(MOCK_REPORTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }

  const samples: Report[] = [
    {
      id: 'mock-report-1',
      userId: 'mock-user-id',
      category: 'garbage_dump',
      imageURL: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500',
      latitude: 28.6139,
      longitude: 77.2090,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Garbage piled up near the park entrance. Needs immediate cleanup.',
      status: 'resolved',
      resolutionImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500',
      resolutionNotes: 'Municipal sanitation team cleaned the trash dump and sanitized the area.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-report-2',
      userId: 'mock-user-id',
      category: 'water_pollution',
      imageURL: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=500',
      latitude: 28.6150,
      longitude: 77.2100,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      description: 'Open sewage drain overflowing onto the side street. Strong foul odor.',
      status: 'action_started',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    }
  ];

  await SecureStore.setItemAsync(MOCK_REPORTS_KEY, JSON.stringify(samples));
  return samples;
};

const saveMockReports = async (reports: Report[]) => {
  await SecureStore.setItemAsync(MOCK_REPORTS_KEY, JSON.stringify(reports));
};

export const createReport = async (formData: FormData): Promise<Report> => {
  if (USE_MOCK) {
    const reports = await getMockReports();
    const parts = (formData as any)._parts || [];
    const getPart = (key: string) => parts.find(([k]: any) => k === key)?.[1];

    const imageObj = getPart('image');

    const newReport: Report = {
      id: 'mock-report-' + Math.random().toString(36).substr(2, 9),
      userId: 'mock-user-id',
      category: (getPart('category') as any) || 'garbage_dump',
      imageURL: imageObj?.uri || 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500',
      latitude: Number(getPart('latitude')) || 28.6139,
      longitude: Number(getPart('longitude')) || 77.2090,
      timestamp: new Date().toISOString(),
      description: getPart('description') || '',
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reports.unshift(newReport);
    await saveMockReports(reports);
    return newReport;
  }

  const response = await api.post('/reports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Client-Version': '2.0.0-AI',
    },
    transformRequest: (data) => data,
  });
  return response.data.data.report;
};

export const getUserReports = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ reports: Report[]; pagination: any }> => {
  if (USE_MOCK) {
    const reports = await getMockReports();
    return {
      reports,
      pagination: { total: reports.length, page, limit }
    };
  }

  const response = await api.get(`/reports/user/${userId}`, {
    params: { page, limit },
  });
  return response.data.data;
};

export const getReportById = async (
  id: string
): Promise<{ report: Report; history: any[] }> => {
  if (USE_MOCK) {
    const reports = await getMockReports();
    const report = reports.find((r) => r.id === id);
    if (!report) throw new Error('Report not found');
    

    const history = [
      { status: 'submitted', changedAt: report.createdAt, remarks: 'Report submitted by citizen.' }
    ];
    if (report.status === 'action_started' || report.status === 'resolved') {
      history.push({ status: 'action_started', changedAt: report.updatedAt, remarks: 'Action initiated by local municipality.' });
    }
    if (report.status === 'resolved') {
      history.push({ status: 'resolved', changedAt: report.updatedAt, remarks: 'Issue resolved successfully.' });
    }
    
    return { report, history };
  }

  const response = await api.get(`/reports/${id}`);
  return response.data.data;
};

```

---

## File: app\src\types\navigation.types.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]`

**Architecture Role:**
> Mobile app TypeScript data types definitions file

**Detailed Functionality:**
> This file defines TypeScript types and interfaces for our frontend mobile application. It ensures type safety by specifying what props a screen needs or what keys a report model has, helping us write bug-free code.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the navigation.types.ts layer.

### Source Code:
```typescript
import { NavigatorScreenParams } from '@react-navigation/native';
import { ReportCategoryType } from '../constants/categories';

export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  CitizenTabs: NavigatorScreenParams<CitizenTabParamList>;
  AdminTabs: NavigatorScreenParams<AdminTabParamList>;
};

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
};

export type ReportStackParamList = {
  SelectCategory: undefined;
  Camera: { category: ReportCategoryType; fromDashboard?: boolean };
  Description: {
    category: ReportCategoryType;
    imageUri: string;
    latitude: number;
    longitude: number;
    timestamp: number;
  };
  ReviewSubmit: {
    category: ReportCategoryType;
    imageUri: string;
    latitude: number;
    longitude: number;
    timestamp: number;
    description: string;
  };
  SafetyTips: {
    category: ReportCategoryType;
  };
};

export type ReportsStackParamList = {
  ReportList: undefined;
  ReportDetail: { reportId: string };
  UploadResolution: { reportId: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
};

export type CitizenTabParamList = {
  Home: undefined;
  Reports: NavigatorScreenParams<ReportsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  ReportStack: NavigatorScreenParams<ReportStackParamList>;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Map: undefined;
  Reports: NavigatorScreenParams<ReportsStackParamList>;
  Analytics: undefined;
};

```

---

## File: app\src\types\report.types.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]` `[Issue Reporting]` `[Data Flow]`

**Architecture Role:**
> Mobile app TypeScript data types definitions file

**Detailed Functionality:**
> This file defines TypeScript types and interfaces for our frontend mobile application. It ensures type safety by specifying what props a screen needs or what keys a report model has, helping us write bug-free code.

**Core Logic:**
> Specifically, this file manages the user reports. It handles report submissions, image uploads, GPS coordinates tagging (latitude/longitude), and status progress timeline updates.

### Source Code:
```typescript
import { ReportCategoryType } from '../constants/categories';

export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'action_started'
  | 'resolved';

export type ReportPriority = 'low' | 'medium' | 'high';

export interface AiDetection {
  label: string;
  confidence: number;
}

export interface StatusHistory {
  id: string;
  reportId: string;
  status: ReportStatus;
  changedBy: {
    id: string;
    name: string;
    role: string;
  };
  remarks?: string;
  changedAt: string; // iso date string
}

export interface Feedback {
  id: string;
  reportId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string; // iso date string
}

export interface Report {
  id: string;
  userId: string;
  category: ReportCategoryType;
  description?: string;
  imageURL: string;
  latitude: number;
  longitude: number;
  timestamp: string; // iso date string
  status: ReportStatus;
  assignedDepartment?: string;
  priority?: ReportPriority;
  assignedAdminId?: string;
  resolutionImage?: string;
  resolutionNotes?: string;
  aiDetection?: AiDetection;
  createdAt: string; // iso date string
  updatedAt: string; // iso date string
}

```

---

## File: app\src\types\user.types.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]`

**Architecture Role:**
> Mobile app TypeScript data types definitions file

**Detailed Functionality:**
> This file defines TypeScript types and interfaces for our frontend mobile application. It ensures type safety by specifying what props a screen needs or what keys a report model has, helping us write bug-free code.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the user.types.ts layer.

### Source Code:
```typescript
import { UserRole } from '../constants/roles';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  verificationStatus: 'pending' | 'verified';
  department?: string;
  createdAt: string; // iso date string
}

```

---

## File: app\src\utils\validators.ts

### Architectural Role:
**File Tags:**
`[Frontend]` `[React Native]` `[Mobile App]`

**Architecture Role:**
> Mobile app local utility helper

**Detailed Functionality:**
> This file contains basic utility functions for the mobile app, like input formatters or email validators, to ensure that the user inputs are correct before sending them to the backend.

**Core Logic:**
> Specifically, this file contains helper methods and configurations that support the core functionalities of the validators.ts layer.

### Source Code:
```typescript

export const validatePhone = (phone: string): string | undefined => {
  const t = phone.trim();
  if (!t) return 'Phone number is required';
  if (!/^\d{10}$/.test(t)) return 'Enter a valid 10-digit phone number';
  if (!/^[6-9]/.test(t)) return 'Must start with 6, 7, 8, or 9 (Indian number)';
  return undefined;
};

export const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return undefined; // optional
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Enter a valid email address';
  }
  return undefined;
};

export const validateName = (name: string): string | undefined => {
  const t = name.trim();
  if (!t) return 'Full name is required';
  if (t.length < 2) return 'Name must be at least 2 characters';
  if (t.length > 100) return 'Name is too long';
  return undefined;
};

export const validateInviteCode = (code: string): string | undefined => {
  if (!code.trim()) return 'Admin invite code is required';
  return undefined;
};

```

---

