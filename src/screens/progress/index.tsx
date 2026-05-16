import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Screen, Heading } from '../../components/Themed';
import { getRecentWorkouts, getRecentCheckins, Workout, Checkin } from '../../db/database';
import { StreakHero } from './StreakHero';
import { WeeklyChart } from './WeeklyChart';
import { ReadinessTrend } from './ReadinessTrend';
import { BenchPressCard } from './BenchPressCard';
import { RecentWorkouts } from './RecentWorkouts';

const WEEK_LABELS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_LABELS_RU = ['Пн',  'Вт',  'Ср',  'Чт',  'Пт',  'Сб',  'Вс'];

export default function ProgressScreen() {
  const t = useTokens();
  const { t: i18n, lang } = useLang();
  const p = i18n.progress;
  const weekLabels = lang === 'ru' ? WEEK_LABELS_RU : WEEK_LABELS_EN;

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getRecentWorkouts(30).then(setWorkouts).catch(() => {});
    getRecentCheckins(7).then(setCheckins).catch(() => {});
  }, []);

  useEffect(() => {
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (workouts.some(w => w.date === d.toISOString().split('T')[0] && w.completed)) s++;
      else if (i > 0) break;
    }
    setStreak(s);
  }, [workouts]);

  function buildWeekBars(ws: Workout[]) {
    const now = new Date();
    return weekLabels.map((label, i) => {
      const day = new Date(now);
      const dayOfWeek = now.getDay() || 7;
      day.setDate(now.getDate() - (dayOfWeek - 1) + i);
      const dateStr = day.toISOString().split('T')[0];
      return {
        label,
        value: ws.filter(w => w.date === dateStr && w.completed).length,
        active: dateStr === now.toISOString().split('T')[0],
      };
    });
  }

  function buildReadinessBars(cs: Checkin[]) {
    return cs.slice(0, 7).reverse().map(ch => {
      const date = new Date(ch.date);
      return { label: weekLabels[date.getDay() === 0 ? 6 : date.getDay() - 1], value: ch.readiness };
    });
  }

  const weekBars = buildWeekBars(workouts);
  const readinessBars = checkins.length > 1 ? buildReadinessBars(checkins) : [];
  const totalWorkouts = workouts.filter(w => w.completed).length;
  const avgReadiness = checkins.length > 0
    ? Math.round(checkins.reduce((a, c) => a + c.readiness, 0) / checkins.length)
    : null;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: t.spacing.md, paddingTop: t.spacing.md, paddingBottom: t.spacing.sm }}>
          <Heading>{p.title}</Heading>
        </View>

        <StreakHero streak={streak} totalWorkouts={totalWorkouts} avgReadiness={avgReadiness} />
        <WeeklyChart bars={weekBars} />
        {readinessBars.length > 1 && <ReadinessTrend bars={readinessBars} />}
        <BenchPressCard />
        {workouts.length > 0 && <RecentWorkouts workouts={workouts} />}

        {workouts.length === 0 && checkins.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: t.spacing.xl, paddingHorizontal: t.spacing.xl }}>
            <Text style={{ fontSize: t.font.size.giant, marginBottom: t.spacing.inset }}>📈</Text>
            <Heading style={{ fontSize: t.font.size.large }}>{p.no_data}</Heading>
            <Text style={{ fontSize: t.font.size.base, color: t.textSecondary, textAlign: 'center', marginTop: t.spacing.sm }}>{p.no_data_sub}</Text>
          </View>
        )}

        <View style={{ height: t.spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}
