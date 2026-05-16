import React from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';

interface Props {
  streak: number;
  totalWorkouts: number;
  avgReadiness: number | null;
}

export function StreakHero({ streak, totalWorkouts, avgReadiness }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const p = i18n.progress;

  const streakText = streak === 1 ? `1 ${p.streak_day}` : `${streak} ${p.streak_days}`;

  return (
    <View style={{
      backgroundColor: t.colorNavy, borderRadius: t.radius.md,
      padding: t.spacing.md, marginHorizontal: t.spacing.md, marginBottom: t.spacing.sm,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <View>
        <Text style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.bold, color: t.textOnNavyMuted, letterSpacing: t.font.tracking.widest }}>{p.streak_label}</Text>
        <Text style={{ fontSize: t.font.size.heading, fontWeight: t.font.weight.heavy, color: t.textOnColor, letterSpacing: t.font.tracking.tighter, marginTop: t.spacing.xs }}>{streakText} 🔥</Text>
        <Text style={{ fontSize: t.font.size.md, color: t.textOnNavyMuted, marginTop: t.spacing.xs }}>{p.workouts_total(totalWorkouts)}</Text>
      </View>
      {avgReadiness !== null && (
        <View style={{ alignItems: 'center', backgroundColor: t.bgOnNavy, borderRadius: t.radius.sm, padding: t.spacing.inset }}>
          <Text style={{ fontSize: t.font.size.display, fontWeight: t.font.weight.heavy, color: t.colorPrimary }}>{avgReadiness}</Text>
          <Text style={{ fontSize: t.font.size.xs, color: t.textOnNavyMuted, textAlign: 'center', marginTop: t.spacing.xxs, lineHeight: 14 }}>{p.avg_readiness}</Text>
        </View>
      )}
    </View>
  );
}
