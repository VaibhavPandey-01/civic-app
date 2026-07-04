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
