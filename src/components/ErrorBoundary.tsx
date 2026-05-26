import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface State { error: Error | null }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={s.container}>
        <Text style={s.title}>Произошла ошибка</Text>
        <ScrollView style={s.scroll}>
          <Text style={s.message}>{this.state.error.message}</Text>
          <Text style={s.stack}>{this.state.error.stack}</Text>
        </ScrollView>
        <TouchableOpacity style={s.btn} onPress={() => this.setState({ error: null })}>
          <Text style={s.btnText}>Попробовать снова</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: '700', color: '#ff6b6b', marginBottom: 16 },
  scroll: { flex: 1, marginBottom: 16 },
  message: { color: '#ff9999', fontSize: 16, marginBottom: 12 },
  stack: { color: '#666', fontSize: 11, fontFamily: 'monospace' },
  btn: { backgroundColor: '#7c6af7', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});
