import { firebaseMessaging } from '../config/firebase';
import { logger } from '../utils/logger';

/**
 * Sends a push notification to a single device via Firebase Cloud Messaging.
 *
 * @param fcmToken  - The recipient's FCM registration token
 * @param title     - Notification title (shown in the system tray)
 * @param body      - Notification body text
 * @param data      - Optional key-value payload for in-app handling
 */
export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  if (!firebaseMessaging) {
    logger.warn('Push notification skipped — Firebase Admin SDK is unconfigured.');
    return;
  }
  try {
    const messageId = await firebaseMessaging.send({
      token: fcmToken,
      notification: { title, body },
      data,
    });
    logger.info('Push notification sent', { messageId, fcmToken: fcmToken.slice(0, 12) + '…' });
  } catch (error) {
    // Log but don't throw — a failed push should never crash the request.
    // The caller can decide whether to retry.
    logger.error('Push notification failed', { error, fcmToken: fcmToken.slice(0, 12) + '…' });
  }
};
