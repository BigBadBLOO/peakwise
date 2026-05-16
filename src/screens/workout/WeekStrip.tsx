import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { PlanDay } from '../../db/database';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface Props {
  plan: PlanDay[];
  completedDates: Set<string>;
}

export function WeekStrip({ plan, completedDates }: Props) {
  const t = useTokens();

  const TYPE_COLOR: Record<string, string> = {
    push:      t.colorPrimary,
    upper:     t.colorPrimary,
    full_body: t.colorPrimary,
    lower:     t.colorPrimary,
    legs:      t.colorPrimary,
    pull:      t.colorTeal,
    cardio:    t.colorWarning,
    rest:      t.borderDefault,
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: t.spacing.md, gap: t.spacing.xs, marginBottom: t.spacing.md }}>
      {plan.map((day, i) => {
        const isToday = day.date === today;
        const isDone = completedDates.has(day.date) && day.session_type !== 'rest';
        const isRest = day.session_type === 'rest';
        const dateNum = new Date(day.date + 'T00:00:00').getDate().toString();

        return (
          <TouchableOpacity
            key={day.date}
            style={{
              flex: 1, paddingVertical: t.spacing.snug, borderRadius: t.radius.md,
              backgroundColor: isToday ? t.colorNavy : t.bgCard,
              borderWidth: 1,
              borderColor: isToday ? t.colorNavy : t.borderDefault,
              alignItems: 'center', gap: t.spacing.xs,
              opacity: isDone && !isToday ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: t.font.size.xxs, fontWeight: t.font.weight.semibold, letterSpacing: t.font.tracking.wider, textTransform: 'uppercase', color: isToday ? t.textOnNavySoft : t.textTertiary }}>
              {DAY_LABELS[i]}
            </Text>
            <Text style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.bold, color: isToday ? t.textOnColor : t.textPrimary }}>
              {dateNum}
            </Text>
            <View style={{ width: 6, height: 6, borderRadius: t.radius.xs, backgroundColor: isRest ? t.borderDefault : (TYPE_COLOR[day.session_type] ?? t.colorPrimary) }} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
