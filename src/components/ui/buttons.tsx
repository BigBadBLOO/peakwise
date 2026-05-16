import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, TextStyle } from 'react-native';
import { useTokens } from '../../hooks/useTokens';

type ButtonProps = TouchableOpacityProps & {
  children: React.ReactNode;
  textStyle?: TextStyle;
};

export function PrimaryButton({ style, textStyle, children, disabled, ...props }: ButtonProps) {
  const t = useTokens();
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: disabled ? t.borderDefault : t.colorPrimary,
          borderRadius: t.radius.full,
          height: 52,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: disabled ? 'transparent' : t.colorPrimary,
          shadowOffset: { width: 0, height: t.shadow.button.offsetY },
          shadowOpacity: disabled ? 0 : t.shadow.button.opacity,
          shadowRadius: t.shadow.button.radius,
          elevation: disabled ? 0 : t.shadow.button.elevation,
        },
        style,
      ]}
      disabled={disabled}
      activeOpacity={0.85}
      {...props}
    >
      <Text style={[{ color: t.textOnColor, fontSize: t.font.size.xl, fontWeight: t.font.weight.bold }, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ style, textStyle, children, ...props }: ButtonProps) {
  const t = useTokens();
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: t.bgSubtle,
          borderRadius: t.radius.full,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: t.borderDefault,
        },
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={[{ color: t.textPrimary, fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold }, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export function GhostButton({ style, textStyle, children, ...props }: ButtonProps) {
  const t = useTokens();
  return (
    <TouchableOpacity style={[{ alignItems: 'center', paddingVertical: t.spacing.md }, style]} activeOpacity={0.7} {...props}>
      <Text style={[{ color: t.textTertiary, fontSize: t.font.size.base, fontWeight: t.font.weight.medium }, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}
