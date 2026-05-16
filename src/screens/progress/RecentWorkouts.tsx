import React from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Card, Title, Caption, Body } from '../../components/Themed';
import { Workout } from '../../db/database';

interface Props {
  workouts: Workout[];
}

export function RecentWorkouts({ workouts }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const p = i18n.progress;

  return (
    <Card>
      <Title style={{ fontSize: t.font.size.xl, marginBottom: t.spacing.xs }}>{p.recent_workouts}</Title>
      {workouts.slice(0, 5).map((w, i) => (
        <View
          key={w.id}
          style={{
            flexDirection: 'row', alignItems: 'center', paddingVertical: t.spacing.snug, gap: t.spacing.inset,
            borderBottomWidth: i < Math.min(workouts.length, 5) - 1 ? 1 : 0,
            borderBottomColor: t.borderDefault,
          }}
        >
          <View style={{ width: 8, height: 8, borderRadius: t.radius.full, backgroundColor: w.completed ? t.colorPrimary : t.borderDefault }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.semibold, color: t.textPrimary }}>{w.name}</Text>
            <Caption style={{ marginTop: t.spacing.xxs }}>{w.date}</Caption>
          </View>
          <Body style={{ fontWeight: t.font.weight.semibold }}>{Math.round(w.duration_seconds / 60)}m</Body>
        </View>
      ))}
    </Card>
  );
}
