import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Card, Title, Caption } from '../../components/Themed';
import LineChart from '../../components/LineChart';

const { width } = Dimensions.get('window');

interface Bar { label: string; value: number }

interface Props {
  bars: Bar[];
}

export function ReadinessTrend({ bars }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const p = i18n.progress;
  const chartWidth = width - t.spacing.md * 4;

  return (
    <Card>
      <Title style={{ fontSize: t.font.size.xl }}>{p.readiness_trend}</Title>
      <Caption style={{ marginTop: t.spacing.xxs, marginBottom: t.spacing.inset }}>{p.last_checkins(bars.length)}</Caption>
      <LineChart data={bars} width={chartWidth} height={90} color={t.colorPrimary} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: t.spacing.sm }}>
        {bars.map((b, i) => (
          <View key={i} style={{ alignItems: 'center' }}>
            <Caption>{b.label}</Caption>
            <Text style={{
              fontSize: t.font.size.md, fontWeight: t.font.weight.bold, marginTop: t.spacing.xxs,
              color: b.value >= 70 ? t.colorSuccess : b.value >= 50 ? t.colorWarning : t.colorError,
            }}>
              {b.value}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
