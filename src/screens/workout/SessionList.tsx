import React from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../../hooks/useTokens';

const SESSIONS = [
  { day: 'Mon', date: '13', name: 'Push · Chest + Triceps',   muscles: ['Chest', 'Shoulders', 'Triceps'],       dur: '52 min', done: true  },
  { day: 'Tue', date: '14', name: 'Pull · Back + Biceps',     muscles: ['Back', 'Biceps'],                      dur: '48 min', done: true  },
  { day: 'Wed', date: '15', name: 'Rest day',                  rest: true,                                                     done: true  },
  { day: 'Thu', date: '16', name: 'Upper · Heavy',            muscles: ['Chest', 'Back', 'Shoulders'],          dur: '42 min', today: true },
  { day: 'Fri', date: '17', name: 'Pull · Back volume',       muscles: ['Back', 'Biceps', 'Rear delts'],        dur: '55 min'              },
  { day: 'Sat', date: '18', name: 'Rest day',                  rest: true                                                                  },
  { day: 'Sun', date: '19', name: 'Zone 2 Cardio',            muscles: ['Cardiovascular'],                      dur: '40 min'              },
];

export function SessionList() {
  const t = useTokens();

  return (
    <View style={{ paddingHorizontal: t.spacing.md, gap: t.spacing.sm }}>
      {SESSIONS.map((s, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: s.today ? t.colorPrimarySubtle : t.bgCard,
            borderRadius: t.radius.md, padding: t.spacing.md, gap: t.spacing.inset,
            borderWidth: 1,
            borderColor: s.today ? t.colorPrimary : t.borderDefault,
            opacity: s.done && !s.today ? 0.6 : 1,
          }}
        >
          <View style={{ width: 36, alignItems: 'center' }}>
            <Text style={{ fontSize: t.font.size.xxs, fontWeight: t.font.weight.bold, textTransform: 'uppercase', letterSpacing: t.font.tracking.mid, color: s.today ? t.colorPrimaryPressed : t.textTertiary }}>
              {s.day}
            </Text>
            <Text style={{ fontSize: t.font.size.title, fontWeight: t.font.weight.bold, letterSpacing: t.font.tracking.card, color: s.today ? t.colorPrimaryPressed : t.textPrimary }}>
              {s.date}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.bold, color: s.rest ? t.textSecondary : t.textPrimary, letterSpacing: t.font.tracking.dense }}>
              {s.name}
            </Text>
            {!s.rest && s.muscles && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs, marginTop: t.spacing.xs, flexWrap: 'wrap' }}>
                {s.muscles.slice(0, 3).map(m => (
                  <View key={m} style={{ backgroundColor: t.colorTealSubtle, paddingHorizontal: t.spacing.sm, paddingVertical: t.spacing.xxs, borderRadius: t.radius.tag }}>
                    <Text style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: t.colorTeal }}>{m}</Text>
                  </View>
                ))}
                <Text style={{ fontSize: t.font.size.xs, color: t.textTertiary }}>· {s.dur}</Text>
              </View>
            )}
          </View>

          {s.today && (
            <View style={{ backgroundColor: t.colorPrimary, paddingHorizontal: t.spacing.snug, paddingVertical: t.spacing.xs, borderRadius: t.radius.full }}>
              <Text style={{ color: t.textOnColor, fontSize: t.font.size.xs, fontWeight: t.font.weight.bold, letterSpacing: t.font.tracking.wide }}>Today</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
