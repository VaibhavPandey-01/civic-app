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
