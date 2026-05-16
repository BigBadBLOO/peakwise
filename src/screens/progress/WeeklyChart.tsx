import React from 'react';
import { View } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Card, Title, Caption, Body } from '../../components/Themed';
import BarChart from '../../components/BarChart';

interface Bar { label: string; value: number; active?: boolean }

interface Props {
  bars: Bar[];
}

export function WeeklyChart({ bars }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const p = i18n.progress;

  return (
    <Card>
      <Title style={{ fontSize: t.font.size.xl }}>{p.this_week}</Title>
      <Caption style={{ marginTop: t.spacing.xxs, marginBottom: t.spacing.inset }}>{p.workouts_per_day}</Caption>
      {bars.every(b => b.value === 0) ? (
        <View style={{ height: 80, alignItems: 'center', justifyContent: 'center' }}>
          <Body style={{ fontStyle: 'italic' }}>{p.no_workouts_week}</Body>
        </View>
      ) : (
        <BarChart data={bars} height={100} color={t.bgSubtle} />
      )}
    </Card>
  );
}
