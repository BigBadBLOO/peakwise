import React from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Caption } from '../../components/Themed';

interface Props {
  streak: number;
}

export function QuickStats({ streak }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const h = i18n.home;

  const stats: [string, string][] = [
    [h.streak, streak > 0 ? `${streak}d` : '—'],
    [h.sleep,  '—'],
    [h.hrv,    '—'],
  ];

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: t.spacing.md, marginTop: t.spacing.sm, gap: t.spacing.sm }}>
      {stats.map(([label, value]) => (
        <View
          key={label}
          style={{
            flex: 1, borderRadius: t.radius.md, padding: t.spacing.inset,
            backgroundColor: t.bgCard,
            shadowColor: t.shadowSurface, shadowOffset: { width: 0, height: t.shadow.sm.offsetY },
            shadowOpacity: t.shadow.sm.opacity, shadowRadius: t.shadow.sm.radius, elevation: t.shadow.sm.elevation,
          }}
        >
          <Caption style={{ textTransform: 'uppercase' }}>{label}</Caption>
          <Text style={{ fontSize: t.font.size.title, fontWeight: t.font.weight.bold, color: t.textPrimary, letterSpacing: t.font.tracking.card, marginTop: t.spacing.xs }}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}
