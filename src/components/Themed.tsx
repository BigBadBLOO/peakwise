import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  ViewStyle, TextStyle, StyleSheet,
  ViewProps, TextProps, TouchableOpacityProps, ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../hooks/useColors';
import { Radius, Spacing } from '../constants/theme';

// ─── Screen wrapper ──────────────────────────────────────────────────────────

export function Screen({ style, ...props }: ViewProps) {
  const c = useColors();
  return <SafeAreaView style={[{ flex: 1, backgroundColor: c.bg }, style]} {...props} />;
}

export function ScreenScroll({ style, contentContainerStyle, ...props }: ScrollViewProps) {
  const c = useColors();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[{ flex: 1 }, style]}
        contentContainerStyle={contentContainerStyle}
        {...props}
      />
    </SafeAreaView>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({ style, ...props }: ViewProps) {
  const c = useColors();
  return (
    <View
      style={[styles.card, { backgroundColor: c.surface, shadowColor: c.isDark ? '#000' : '#0F1726' }, style]}
      {...props}
    />
  );
}

export function Surface({ style, ...props }: ViewProps) {
  const c = useColors();
  return <View style={[{ backgroundColor: c.surface2, borderRadius: Radius.sm }, style]} {...props} />;
}

export function Divider({ style }: { style?: ViewStyle }) {
  const c = useColors();
  return <View style={[{ height: 1, backgroundColor: c.border }, style]} />;
}

// ─── Typography ───────────────────────────────────────────────────────────────

export function Title({ style, ...props }: TextProps) {
  const c = useColors();
  return <Text style={[styles.title, { color: c.text }, style]} {...props} />;
}

export function Body({ style, ...props }: TextProps) {
  const c = useColors();
  return <Text style={[styles.body, { color: c.text2 }, style]} {...props} />;
}

export function Caption({ style, ...props }: TextProps) {
  const c = useColors();
  return <Text style={[styles.caption, { color: c.text3 }, style]} {...props} />;
}

export function Label({ style, ...props }: TextProps) {
  const c = useColors();
  return <Text style={[styles.label, { color: c.text }, style]} {...props} />;
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

import { Colors } from '../constants/theme';

export function PrimaryButton({ style, textStyle, children, ...props }: TouchableOpacityProps & { textStyle?: TextStyle; children: React.ReactNode }) {
  return (
    <TouchableOpacity style={[styles.primaryBtn, style]} activeOpacity={0.85} {...props}>
      <Text style={[styles.primaryBtnText, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ style, textStyle, children, ...props }: TouchableOpacityProps & { textStyle?: TextStyle; children: React.ReactNode }) {
  const c = useColors();
  return (
    <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: c.surface2, borderColor: c.border }, style]} activeOpacity={0.8} {...props}>
      <Text style={[styles.secondaryBtnText, { color: c.text }, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  body: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  label: { fontSize: 15, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: Colors.green,
    borderRadius: Radius.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderRadius: Radius.full,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600' },
});
