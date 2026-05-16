import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { UnitsProvider } from './src/context/UnitsContext';
import { Colors } from './src/constants/theme';

const NAV_LIGHT = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: Colors.n50, card: Colors.n0, border: Colors.n200 },
};

const NAV_DARK = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: '#0E1117', card: '#161A23', border: '#262C3B' },
};

function AppInner() {
  const { isDark } = useTheme();
  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer theme={isDark ? NAV_DARK : NAV_LIGHT}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <UnitsProvider>
          <AppInner />
        </UnitsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
