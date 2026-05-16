import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { useTokens } from '../../hooks/useTokens';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'primary';

export function Badge({
  variant = 'primary',
  style,
  textStyle,
  children,
}: {
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children: React.ReactNode;
}) {
  const t = useTokens();

  const bgMap: Record<BadgeVariant, string> = {
    success: t.colorPrimarySubtle,
    warning: t.colorWarningSubtle,
    error:   t.colorErrorSubtle,
    neutral: t.bgSubtle,
    primary: t.colorPrimary,
  };
  const textMap: Record<BadgeVariant, string> = {
    success: t.colorPrimaryPressed,
    warning: t.colorWarning,
    error:   t.colorError,
    neutral: t.textTertiary,
    primary: t.textOnColor,
  };

  return (
    <View style={[{ backgroundColor: bgMap[variant], borderRadius: t.radius.full, paddingHorizontal: t.spacing.snug, paddingVertical: t.spacing.xs }, style]}>
      <Text style={[{ fontSize: t.font.size.sm, fontWeight: t.font.weight.bold, color: textMap[variant], letterSpacing: t.font.tracking.wider }, textStyle]}>
        {children}
      </Text>
    </View>
  );
}
