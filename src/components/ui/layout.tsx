import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, ViewProps, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTokens } from '../../hooks/useTokens';

export function Screen({ style, children, ...props }: ViewProps) {
  const t = useTokens();
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: t.bgScreen }, style]} {...props}>
      {children}
    </SafeAreaView>
  );
}

export function ScreenScroll({ style, ...props }: ScrollViewProps) {
  const t = useTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bgScreen }}>
      <ScrollView showsVerticalScrollIndicator={false} style={[{ flex: 1 }, style]} {...props} />
    </SafeAreaView>
  );
}

export function Card({ style, ...props }: ViewProps) {
  const t = useTokens();
  return (
    <View
      style={[
        {
          backgroundColor: t.bgCard,
          borderRadius: t.radius.md,
          padding: t.spacing.md,
          marginHorizontal: t.spacing.md,
          marginTop: t.spacing.sm,
          shadowColor: t.shadowSurface,
          shadowOffset: { width: 0, height: t.shadow.md.offsetY },
          shadowOpacity: t.shadow.md.opacity,
          shadowRadius: t.shadow.md.radius,
          elevation: t.shadow.md.elevation,
        },
        style,
      ]}
      {...props}
    />
  );
}

export function Surface({ style, ...props }: ViewProps) {
  const t = useTokens();
  return (
    <View
      style={[{ backgroundColor: t.bgSubtle, borderRadius: t.radius.sm }, style]}
      {...props}
    />
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  const t = useTokens();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: t.borderDefault }, style]} />;
}

export function Row({ style, ...props }: ViewProps) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]} {...props} />;
}
