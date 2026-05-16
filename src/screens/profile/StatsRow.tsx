import React from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Card, Caption } from '../../components/Themed';

export function StatsRow() {
  const t = useTokens();
  const { t: i18n } = useLang();
  const p = i18n.profile;

  const stats: [string, string][] = [
    ['124', p.workouts],
    ['12',  p.week_streak],
    ['18.4t', p.best_week],
  ];

  return (
    <Card style={{ flexDirection: 'row' }}>
      {stats.map(([value, label]) => (
        <View key={label} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: t.font.size.large, fontWeight: t.font.weight.bold, letterSpacing: t.font.tracking.feature, color: t.textPrimary }}>{value}</Text>
          <Caption style={{ marginTop: t.spacing.xxs }}>{label}</Caption>
        </View>
      ))}
    </Card>
  );
}
