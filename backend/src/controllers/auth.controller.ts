import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { firebaseAuth } from '../config/firebase';
import { env } from '../config/env';
import User from '../models/User.model';
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
    if (env.NODE_ENV === 'development') {
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
    if (env.NODE_ENV === 'development') {
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

