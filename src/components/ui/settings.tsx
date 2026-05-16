import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTokens } from '../../hooks/useTokens';

export function SettingRow({
  label,
  control,
  onPress,
  isLast = false,
  style,
}: {
  label: string;
  control?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
  style?: ViewStyle;
}) {
  const t = useTokens();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: t.spacing.md,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: t.borderDefault,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.regular, color: t.textPrimary }}>{label}</Text>
      {control ?? (
        <Text style={{ fontSize: t.font.size.large, fontWeight: t.font.weight.regular, color: t.borderDefault }}>›</Text>
      )}
    </TouchableOpacity>
  );
}

export function SettingGroup({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const t = useTokens();
  return (
    <View
      style={[
        {
          backgroundColor: t.bgCard,
          borderRadius: t.radius.md,
          overflow: 'hidden',
          shadowColor: t.shadowSurface,
          shadowOffset: { width: 0, height: t.shadow.sm.offsetY },
          shadowOpacity: t.shadow.sm.opacity,
          shadowRadius: t.shadow.sm.radius,
          elevation: t.shadow.sm.elevation,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
