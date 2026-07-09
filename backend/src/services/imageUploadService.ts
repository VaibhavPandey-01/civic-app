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
