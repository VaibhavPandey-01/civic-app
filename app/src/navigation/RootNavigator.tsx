import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../context/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { CitizenNavigator } from './CitizenNavigator';
import { AdminNavigator } from './AdminNavigator';
import { Colors } from '../constants/colors';

export const RootNavigator = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

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
