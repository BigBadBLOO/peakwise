import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { RootNavigator } from './navigation/RootNavigator';
import { UpdateChecker } from './components/UpdateChecker';
import { ErrorBoundary } from './components/ErrorBoundary';

export function AppRoot() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <SettingsProvider>
              <NavigationContainer>
                <UpdateChecker />
                <RootNavigator />
              </NavigationContainer>
            </SettingsProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
