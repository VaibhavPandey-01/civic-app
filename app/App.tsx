import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/context/useAuthStore';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    // Hydrate persistent user auth session from SecureStore on startup
    hydrate();
  }, [hydrate]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
