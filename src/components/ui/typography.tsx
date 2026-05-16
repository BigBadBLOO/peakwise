import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTokens } from '../../hooks/useTokens';

export function Heading({ style, ...props }: TextProps) {
  const t = useTokens();
  return (
    <Text
      style={[{ fontSize: t.font.size.heading, fontWeight: t.font.weight.heavy, color: t.textPrimary, letterSpacing: t.font.tracking.tight }, style]}
      {...props}
    />
  );
}

export function Title({ style, ...props }: TextProps) {
  const t = useTokens();
  return (
    <Text
      style={[{ fontSize: t.font.size.title, fontWeight: t.font.weight.bold, color: t.textPrimary, letterSpacing: t.font.tracking.snug }, style]}
      {...props}
    />
  );
}

export function Body({ style, ...props }: TextProps) {
  const t = useTokens();
  return (
    <Text
      style={[{ fontSize: t.font.size.base, fontWeight: t.font.weight.regular, color: t.textSecondary, lineHeight: 20 }, style]}
      {...props}
    />
  );
}

export function Caption({ style, ...props }: TextProps) {
  const t = useTokens();
  return (
    <Text
      style={[{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: t.textTertiary, letterSpacing: t.font.tracking.wide }, style]}
      {...props}
    />
  );
}

export function Label({ style, ...props }: TextProps) {
  const t = useTokens();
  return (
    <Text
      style={[{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: t.textPrimary }, style]}
      {...props}
    />
  );
}

export function Overline({ style, ...props }: TextProps) {
  const t = useTokens();
  return (
    <Text
      style={[{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: t.textTertiary, letterSpacing: t.font.tracking.widest, textTransform: 'uppercase' }, style]}
      {...props}
    />
  );
}
