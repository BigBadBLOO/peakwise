import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function LevelStep({ selected, onSelect }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const o = i18n.onboarding;

  return (
    <>
      <Text style={{ fontSize: t.font.size.heading, fontWeight: t.font.weight.heavy, letterSpacing: t.font.tracking.tight, marginBottom: t.spacing.sm, color: t.textPrimary }}>{o.level_title}</Text>
      <Text style={{ fontSize: t.font.size.lg, lineHeight: 22, marginBottom: t.spacing.lg, color: t.textSecondary }}>{o.level_sub}</Text>
      <View style={{ gap: t.spacing.sm }}>
        {o.levels.map(l => (
          <TouchableOpacity
            key={l.id}
            style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, padding: t.spacing.md, borderRadius: t.radius.md, borderWidth: 1.5, borderColor: selected === l.id ? t.colorPrimary : t.borderDefault, backgroundColor: selected === l.id ? t.colorPrimarySubtle : t.bgSubtle }}
            onPress={() => { onSelect(l.id); Haptics.selectionAsync(); }}
            activeOpacity={0.75}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: selected === l.id ? t.colorPrimaryPressed : t.textPrimary }}>{l.label}</Text>
              <Text style={{ fontSize: t.font.size.small, marginTop: t.spacing.xxs, color: t.textTertiary }}>{l.sub}</Text>
            </View>
            {selected === l.id && <View style={{ width: 10, height: 10, borderRadius: t.radius.full, backgroundColor: t.colorPrimary }} />}
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}
