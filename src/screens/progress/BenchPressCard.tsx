import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { useUnits } from '../../context/UnitsContext';
import { Card, Surface, Title, Caption } from '../../components/Themed';
import LineChart from '../../components/LineChart';

const { width } = Dimensions.get('window');

const BENCH_PROGRESS = [
  { value: 65 }, { value: 67.5 }, { value: 70 },
  { value: 70  }, { value: 72.5 }, { value: 72.5 }, { value: 75 },
];
const BENCH_CURRENT_KG = 72.5;
const BENCH_PR_KG = 75;

export function BenchPressCard() {
  const t = useTokens();
  const { t: i18n } = useLang();
  const { format } = useUnits();
  const p = i18n.progress;
  const chartWidth = width - t.spacing.md * 4;

  return (
    <Card>
      <Title style={{ fontSize: t.font.size.xl }}>{p.bench_press}</Title>
      <Caption style={{ marginTop: t.spacing.xxs, marginBottom: t.spacing.inset }}>{p.weight_progression}</Caption>
      <LineChart data={BENCH_PROGRESS} width={chartWidth} height={90} color={t.colorPrimary} />
      <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.inset }}>
        <Surface style={{ flex: 1, padding: t.spacing.inset }}>
          <Caption>{p.current}</Caption>
          <Text style={{ fontSize: t.font.size.large, fontWeight: t.font.weight.bold, color: t.textPrimary, marginTop: t.spacing.xxs }}>{format(BENCH_CURRENT_KG)}</Text>
        </Surface>
        <View style={{ flex: 1, backgroundColor: t.colorPrimarySubtle, borderRadius: t.radius.sm, padding: t.spacing.inset }}>
          <Caption style={{ color: t.colorPrimaryPressed }}>{p.all_time_pr}</Caption>
          <Text style={{ fontSize: t.font.size.large, fontWeight: t.font.weight.bold, color: t.colorPrimary, marginTop: t.spacing.xxs }}>{format(BENCH_PR_KG)}</Text>
        </View>
      </View>
    </Card>
  );
}
