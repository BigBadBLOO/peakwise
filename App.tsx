import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { SettingsProvider } from './src/context/SettingsContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { UpdateChecker } from './src/components/UpdateChecker';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Keep splash visible while JS loads
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay to let providers mount, then hide splash
    const t = setTimeout(async () => {
      setReady(true);
      await SplashScreen.hideAsync().catch(() => {});
    }, 100);
    return () => clearTimeout(t);
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#100828', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#7c6af7" size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SettingsProvider>
            <NavigationContainer>
              <UpdateChecker />
              <RootNavigator />
            </NavigationContainer>
          </SettingsProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
