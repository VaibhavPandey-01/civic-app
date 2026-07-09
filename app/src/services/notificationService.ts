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
