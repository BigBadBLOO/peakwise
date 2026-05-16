import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTokens } from '../../hooks/useTokens';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function DotRating({ value, onChange }: Props) {
  const t = useTokens();

  return (
    <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity
          key={n}
          onPress={() => { onChange(n); Haptics.selectionAsync(); }}
          style={{ flex: 1, height: 44, borderRadius: t.radius.chip, alignItems: 'center', justifyContent: 'center', backgroundColor: n <= value ? t.colorPrimary : t.bgSubtle }}
          activeOpacity={0.7}
        >
          <View style={{ width: 10, height: 10, borderRadius: t.radius.full, backgroundColor: n <= value ? t.textOnColor : t.borderDefault }} />
        </TouchableOpacity>
      ))}
    </View>
  );
}
