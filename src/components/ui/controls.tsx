import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, Switch as RNSwitch, SwitchProps } from 'react-native';
import { useTokens } from '../../hooks/useTokens';

export function ProgressBar({ progress, style }: { progress: number; style?: ViewStyle }) {
  const t = useTokens();
  return (
    <View style={[{ height: 6, backgroundColor: t.bgSubtle, borderRadius: t.radius.xs, overflow: 'hidden' }, style]}>
      <View
        style={{
          width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
          height: '100%',
          backgroundColor: t.colorPrimary,
          borderRadius: t.radius.xs,
        }}
      />
    </View>
  );
}

export function ThemedSwitch(props: SwitchProps) {
  const t = useTokens();
  return (
    <RNSwitch
      trackColor={{ false: t.borderDefault, true: t.colorPrimary }}
      thumbColor={t.textOnColor}
      {...props}
    />
  );
}

export function SegmentedToggle({
  options,
  selected,
  onSelect,
  style,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  style?: ViewStyle;
}) {
  const t = useTokens();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: t.borderDefault,
          borderRadius: t.radius.full,
          backgroundColor: t.bgSubtle,
          paddingHorizontal: t.spacing.xxs,
          paddingVertical: t.spacing.xxs,
        },
        style,
      ]}
    >
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          onPress={() => onSelect(opt)}
          style={{
            paddingHorizontal: t.spacing.inset,
            paddingVertical: t.spacing.xs,
            borderRadius: t.radius.full,
            backgroundColor: selected === opt ? t.colorPrimary : 'transparent',
          }}
          activeOpacity={0.75}
        >
          <Text
            style={{
              fontSize: t.font.size.md,
              fontWeight: t.font.weight.bold,
              color: selected === opt ? t.textOnColor : t.textTertiary,
            }}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
