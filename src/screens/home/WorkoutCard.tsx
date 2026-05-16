import React from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { useUnits } from '../../context/UnitsContext';
import { Card, Surface, Badge, Overline, Title, Body, Caption, PrimaryButton } from '../../components/Themed';

const EXERCISES: { name: string; sets: string; weightKg: number }[] = [
  { name: 'Barbell Bench Press',       sets: '4 × 6–8', weightKg: 72.5 },
  { name: 'Pull-ups (weighted)',        sets: '4 × 8',   weightKg: 10   },
  { name: 'Seated DB Shoulder Press',  sets: '3 × 10',  weightKg: 22   },
];

interface Props {
  onStart: () => void;
}

export function WorkoutCard({ onStart }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const { format } = useUnits();
  const h = i18n.home;

  return (
    <Card>
      <Badge variant="success" style={{ position: 'absolute', top: t.spacing.md, right: t.spacing.md }}>
        AI · 42 MIN
      </Badge>
      <Overline style={{ marginBottom: t.spacing.xs }}>{h.todays_workout}</Overline>
      <Title>Upper Body · Heavy</Title>
      <Body style={{ marginTop: t.spacing.xs }}>{h.ai_built}</Body>

      <Surface style={{ padding: t.spacing.inset, marginTop: t.spacing.inset, gap: t.spacing.sm }}>
        {EXERCISES.map(({ name, sets, weightKg }) => (
          <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
            <View style={{ width: 6, height: 6, borderRadius: t.radius.xs, backgroundColor: t.colorPrimary }} />
            <Text style={{ flex: 1, fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: t.textPrimary }}>{name}</Text>
            <Text style={{ fontSize: t.font.size.sm, color: t.textTertiary }}>{sets}</Text>
            <Text style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: t.textSecondary, minWidth: 60, textAlign: 'right' }}>
              {format(weightKg)}
            </Text>
          </View>
        ))}
        <Caption style={{ marginTop: t.spacing.xxs }}>{h.more_exercises(2)}</Caption>
      </Surface>

      <PrimaryButton style={{ marginTop: t.spacing.md }} onPress={onStart}>
        {h.start_workout}
      </PrimaryButton>
    </Card>
  );
}
