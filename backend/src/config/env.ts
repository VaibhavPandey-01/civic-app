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
