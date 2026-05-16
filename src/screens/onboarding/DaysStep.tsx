import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';

interface Props {
  selected: number;
  onSelect: (d: number) => void;
}

export function DaysStep({ selected, onSelect }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const o = i18n.onboarding;

  return (
    <>
      <Text style={{ fontSize: t.font.size.heading, fontWeight: t.font.weight.heavy, letterSpacing: t.font.tracking.tight, marginBottom: t.spacing.sm, color: t.textPrimary }}>{o.days_title}</Text>
      <Text style={{ fontSize: t.font.size.lg, lineHeight: 22, marginBottom: t.spacing.lg, color: t.textSecondary }}>{o.days_sub}</Text>
      <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
        {[3, 4, 5, 6].map(d => (
          <TouchableOpacity
            key={d}
            style={{ flex: 1, aspectRatio: 0.9, borderRadius: t.radius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', borderColor: selected === d ? t.colorPrimary : t.borderDefault, backgroundColor: selected === d ? t.colorPrimarySubtle : t.bgSubtle }}
            onPress={() => { onSelect(d); Haptics.selectionAsync(); }}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: t.font.size.heading, fontWeight: t.font.weight.heavy, color: selected === d ? t.colorPrimary : t.textTertiary }}>{d}</Text>
            <Text style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: selected === d ? t.colorPrimaryPressed : t.textTertiary }}>days</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ fontSize: t.font.size.md, textAlign: 'center', fontStyle: 'italic', color: t.textSecondary }}>{o.days_hints[selected]}</Text>
    </>
  );
}
