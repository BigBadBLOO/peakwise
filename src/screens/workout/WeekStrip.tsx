import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTokens } from '../../hooks/useTokens';

const DAYS = [
  { label: 'M', date: '13', type: 'push',   done: true   },
  { label: 'T', date: '14', type: 'pull',   done: true   },
  { label: 'W', date: '15', type: 'rest',   done: true   },
  { label: 'T', date: '16', type: 'legs',   active: true },
  { label: 'F', date: '17', type: 'pull'                 },
  { label: 'S', date: '18', type: 'rest'                 },
  { label: 'S', date: '19', type: 'cardio'               },
];

export function WeekStrip() {
  const t = useTokens();

  const TYPE_COLOR: Record<string, string> = {
    push: t.colorPrimary, pull: t.colorTeal, legs: t.colorPrimary, cardio: t.colorWarning,
  };

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: t.spacing.md, gap: t.spacing.xs, marginBottom: t.spacing.md }}>
      {DAYS.map((d, i) => (
        <TouchableOpacity
          key={i}
          style={{
            flex: 1, paddingVertical: t.spacing.snug, borderRadius: t.radius.md,
            backgroundColor: d.active ? t.colorNavy : t.bgCard,
            borderWidth: 1,
            borderColor: d.active ? t.colorNavy : t.borderDefault,
            alignItems: 'center', gap: t.spacing.xs,
            opacity: d.done && !d.active ? 0.6 : 1,
          }}
        >
          <Text style={{ fontSize: t.font.size.xxs, fontWeight: t.font.weight.semibold, letterSpacing: t.font.tracking.wider, textTransform: 'uppercase', color: d.active ? t.textOnNavySoft : t.textTertiary }}>
            {d.label}
          </Text>
          <Text style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.bold, color: d.active ? t.textOnColor : t.textPrimary }}>
            {d.date}
          </Text>
          <View style={{
            width: 6, height: 6, borderRadius: t.radius.xs,
            backgroundColor: d.type === 'rest' ? t.borderDefault : (TYPE_COLOR[d.type] ?? t.colorPrimary),
          }} />
        </TouchableOpacity>
      ))}
    </View>
  );
}
