import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Clipboard } from 'react-native';

function ErrorScreen({ message }: { message: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    Clipboard.setString(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={s.root}>
      <Text style={s.title}>Ошибка запуска</Text>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <Text style={s.body} selectable>{message}</Text>
      </ScrollView>
      <Pressable style={s.btn} onPress={copy}>
        <Text style={s.btnText}>{copied ? 'Скопировано!' : 'Скопировать'}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 24 },
  title: { color: '#ff5555', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  scroll: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 8 },
  scrollContent: { padding: 12 },
  body: { color: '#e0e0e0', fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
  btn: { marginTop: 16, backgroundColor: '#333', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

let AppRoot: React.ComponentType | null = null;
let importError: string | null = null;

try {
  AppRoot = require('./src/AppRoot').AppRoot;
} catch (e: any) {
  importError = e?.message + '\n\n' + e?.stack;
}

export default function App() {
  const [fatalError, setFatalError] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      const err = (global as any).__fatalError;
      if (err) setFatalError(err);
    };
    check();
    const id = setInterval(check, 500);
    return () => clearInterval(id);
  }, []);

  const err = importError || fatalError;
  if (err) return <ErrorScreen message={err} />;
  if (!AppRoot) return null;
  return <AppRoot />;
}
