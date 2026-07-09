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
