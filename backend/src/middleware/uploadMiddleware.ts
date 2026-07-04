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
