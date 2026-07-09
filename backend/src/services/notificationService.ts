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
