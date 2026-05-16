import React from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { PlanDay } from '../../db/database';
import { SESSION_MUSCLES, SESSION_DURATION } from '../../engine/exercises';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  plan: PlanDay[];
  completedDates: Set<string>;
}

export function SessionList({ plan, completedDates }: Props) {
  const t = useTokens();

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={{ paddingHorizontal: t.spacing.md, gap: t.spacing.sm }}>
      {plan.map((day, i) => {
        const isToday = day.date === today;
        const isDone = completedDates.has(day.date) && day.session_type !== 'rest';
        const isRest = day.session_type === 'rest';
        const muscles = SESSION_MUSCLES[day.session_type] ?? [];
        const duration = SESSION_DURATION[day.session_type] ?? '';
        const dateNum = new Date(day.date + 'T00:00:00').getDate().toString();

        return (
          <View
            key={day.date}
            style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: isToday ? t.colorPrimarySubtle : t.bgCard,
              borderRadius: t.radius.md, padding: t.spacing.md, gap: t.spacing.inset,
              borderWidth: 1,
              borderColor: isToday ? t.colorPrimary : t.borderDefault,
              opacity: isDone && !isToday ? 0.6 : 1,
            }}
          >
            <View style={{ width: 36, alignItems: 'center' }}>
              <Text style={{ fontSize: t.font.size.xxs, fontWeight: t.font.weight.bold, textTransform: 'uppercase', letterSpacing: t.font.tracking.mid, color: isToday ? t.colorPrimaryPressed : t.textTertiary }}>
                {DAY_LABELS[i]}
              </Text>
              <Text style={{ fontSize: t.font.size.title, fontWeight: t.font.weight.bold, letterSpacing: t.font.tracking.card, color: isToday ? t.colorPrimaryPressed : t.textPrimary }}>
                {dateNum}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.bold, color: isRest ? t.textSecondary : t.textPrimary, letterSpacing: t.font.tracking.dense }}>
                {day.session_name}
              </Text>
              {!isRest && muscles.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs, marginTop: t.spacing.xs, flexWrap: 'wrap' }}>
                  {muscles.slice(0, 3).map(m => (
                    <View key={m} style={{ backgroundColor: t.colorTealSubtle, paddingHorizontal: t.spacing.sm, paddingVertical: t.spacing.xxs, borderRadius: t.radius.tag }}>
                      <Text style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: t.colorTeal }}>{m}</Text>
                    </View>
                  ))}
                  {duration ? <Text style={{ fontSize: t.font.size.xs, color: t.textTertiary }}>· {duration}</Text> : null}
                </View>
              )}
            </View>

            {isToday && (
              <View style={{ backgroundColor: t.colorPrimary, paddingHorizontal: t.spacing.snug, paddingVertical: t.spacing.xs, borderRadius: t.radius.full }}>
                <Text style={{ color: t.textOnColor, fontSize: t.font.size.xs, fontWeight: t.font.weight.bold, letterSpacing: t.font.tracking.wide }}>Today</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
