import React from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { useUnits } from '../../context/UnitsContext';
import { Card, Surface, Badge, Overline, Title, Body, Caption, PrimaryButton } from '../../components/Themed';
import { PlanDay } from '../../db/database';
import { EXERCISES_BY_TYPE } from '../../engine/exercises';

interface Props {
  plan: PlanDay | null;
  onStart: () => void;
}

export function WorkoutCard({ plan, onStart }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const { format } = useUnits();
  const h = i18n.home;

  if (!plan) {
    return (
      <Card>
        <Overline style={{ marginBottom: t.spacing.xs }}>{h.todays_workout}</Overline>
        <Title>{h.no_plan}</Title>
        <Body style={{ marginTop: t.spacing.xs }}>{h.no_plan_sub}</Body>
      </Card>
    );
  }

  if (plan.session_type === 'rest') {
    return (
      <Card>
        <Overline style={{ marginBottom: t.spacing.xs }}>{h.todays_workout}</Overline>
        <Title>{h.rest_day}</Title>
        <Body style={{ marginTop: t.spacing.xs }}>{h.rest_day_sub}</Body>
      </Card>
    );
  }

  const exercises = EXERCISES_BY_TYPE[plan.session_type] ?? [];
  const preview = exercises.slice(0, 3);
  const extra = exercises.length - preview.length;

  return (
    <Card>
      <Badge variant="success" style={{ position: 'absolute', top: t.spacing.md, right: t.spacing.md }}>
        AI · ~45 MIN
      </Badge>
      <Overline style={{ marginBottom: t.spacing.xs }}>{h.todays_workout}</Overline>
      <Title>{plan.session_name}</Title>
      <Body style={{ marginTop: t.spacing.xs }}>{h.ai_built}</Body>

      {preview.length > 0 && (
        <Surface style={{ padding: t.spacing.inset, marginTop: t.spacing.inset, gap: t.spacing.sm }}>
          {preview.map(({ name, sets, reps, weightKg }) => (
            <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
              <View style={{ width: 6, height: 6, borderRadius: t.radius.xs, backgroundColor: t.colorPrimary }} />
              <Text style={{ flex: 1, fontSize: t.font.size.md, fontWeight: t.font.weight.medium, color: t.textPrimary }}>{name}</Text>
              <Text style={{ fontSize: t.font.size.sm, color: t.textTertiary }}>{sets} × {reps}</Text>
              <Text style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: t.textSecondary, minWidth: 60, textAlign: 'right' }}>
                {format(weightKg)}
              </Text>
            </View>
          ))}
          {extra > 0 && <Caption style={{ marginTop: t.spacing.xxs }}>{h.more_exercises(extra)}</Caption>}
        </Surface>
      )}

      <PrimaryButton style={{ marginTop: t.spacing.md }} onPress={onStart}>
        {h.start_workout}
      </PrimaryButton>
    </Card>
  );
}
