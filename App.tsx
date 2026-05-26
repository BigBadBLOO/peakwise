import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

type State = { status: 'loading' } | { status: 'ready' } | { status: 'error'; message: string };

let MainApp: React.ComponentType | null = null;

export default function App() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    (async () => {
      try {
        // Dynamic require keeps native module errors catchable
        const { AppRoot } = require('./src/AppRoot');
        MainApp = AppRoot;
        setState({ status: 'ready' });
      } catch (e: any) {
        setState({ status: 'error', message: String(e?.message ?? e) });
      } finally {
        await SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []);

  if (state.status === 'loading') {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#7c6af7" size="large" />
        <Text style={s.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={s.errorContainer}>
        <Text style={s.errorTitle}>Ошибка запуска</Text>
        <ScrollView>
          <Text style={s.errorText}>{state.message}</Text>
        </ScrollView>
      </View>
    );
  }

  if (!MainApp) return null;
  return <MainApp />;
}

const s = StyleSheet.create({
  center: {
    flex: 1, backgroundColor: '#100828',
    alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  loadingText: { color: '#7c6af7', fontSize: 16 },
  errorContainer: {
    flex: 1, backgroundColor: '#1a0000',
    padding: 24, paddingTop: 60,
  },
  errorTitle: { color: '#ff6b6b', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  errorText: { color: '#ffaaaa', fontSize: 13, fontFamily: 'monospace' },
});
