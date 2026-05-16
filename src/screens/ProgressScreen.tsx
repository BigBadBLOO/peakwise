import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import { useLang } from '../context/LanguageContext';
import { Screen } from '../components/Themed';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import { getRecentWorkouts, getRecentCheckins, Workout, Checkin } from '../db/database';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - Spacing.md * 4;
const WEEK_LABELS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_LABELS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const BENCH_PROGRESS = [
  { value: 65 }, { value: 67.5 }, { value: 70 }, { value: 70 },
  { value: 72.5 }, { value: 72.5 }, { value: 75 },
];

export default function ProgressScreen() {
  const c = useColors();
  const { t, lang } = useLang();
  const p = t.progress;
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
      const isToday = dateStr === now.toISOString().split('T')[0];
      return { label, value: ws.filter(w => w.date === dateStr && w.completed).length, active: isToday };
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
    ? Math.round(checkins.reduce((a, ch) => a + ch.readiness, 0) / checkins.length)
    : null;

  const streakText = streak === 1 ? `1 ${p.streak_day}` : `${streak} ${p.streak_days}`;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.text }]}>{p.title}</Text>
        </View>

        {/* Streak hero */}
        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>{p.streak_label}</Text>
            <Text style={styles.heroValue}>{streakText} 🔥</Text>
            <Text style={styles.heroSub}>{p.workouts_total(totalWorkouts)}</Text>
          </View>
          {avgReadiness !== null && (
            <View style={styles.avgBadge}>
              <Text style={styles.avgNum}>{avgReadiness}</Text>
              <Text style={styles.avgLabel}>{p.avg_readiness}</Text>
            </View>
          )}
        </View>

        {/* Weekly bar chart */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>{p.this_week}</Text>
          <Text style={[styles.cardSub, { color: c.text3 }]}>{p.workouts_per_day}</Text>
          <View style={styles.chartWrap}>
            {weekBars.every(b => b.value === 0) ? (
              <View style={styles.emptyChart}>
                <Text style={[styles.emptyText, { color: c.text3 }]}>{p.no_workouts_week}</Text>
              </View>
            ) : (
              <BarChart data={weekBars} height={100} color={c.surface2} />
            )}
          </View>
        </View>

        {/* Readiness trend */}
        {readinessBars.length > 1 && (
          <View style={[styles.card, { backgroundColor: c.surface }]}>
            <Text style={[styles.cardTitle, { color: c.text }]}>{p.readiness_trend}</Text>
            <Text style={[styles.cardSub, { color: c.text3 }]}>{p.last_checkins(readinessBars.length)}</Text>
            <View style={styles.chartWrap}>
              <LineChart data={readinessBars} width={CHART_WIDTH} height={90} />
            </View>
            <View style={styles.readinessLegend}>
              {readinessBars.map((b, i) => (
                <View key={i} style={styles.legendItem}>
                  <Text style={[styles.legendLabel, { color: c.text3 }]}>{b.label}</Text>
                  <Text style={[styles.legendValue, {
                    color: b.value >= 70 ? Colors.green : b.value >= 50 ? Colors.light : Colors.rest,
                  }]}>{b.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bench press */}
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>{p.bench_press}</Text>
          <Text style={[styles.cardSub, { color: c.text3 }]}>{p.weight_progression}</Text>
          <View style={styles.chartWrap}>
            <LineChart data={BENCH_PROGRESS} width={CHART_WIDTH} height={90} />
          </View>
          <View style={styles.prRow}>
            <View style={[styles.prBadge, { backgroundColor: c.surface2 }]}>
              <Text style={[styles.prLabel, { color: c.text3 }]}>{p.current}</Text>
              <Text style={[styles.prValue, { color: c.text }]}>72.5 kg</Text>
            </View>
            <View style={[styles.prBadge, styles.prBadgePR]}>
              <Text style={[styles.prLabel, { color: Colors.greenPressed }]}>{p.all_time_pr}</Text>
              <Text style={[styles.prValue, { color: Colors.green }]}>75 kg</Text>
            </View>
          </View>
        </View>

        {/* Recent workouts */}
        {workouts.length > 0 && (
          <View style={[styles.card, { backgroundColor: c.surface }]}>
            <Text style={[styles.cardTitle, { color: c.text }]}>{p.recent_workouts}</Text>
            {workouts.slice(0, 5).map((w, i) => (
              <View key={w.id} style={[
                styles.workoutRow,
                i < Math.min(workouts.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: c.border },
              ]}>
                <View style={[styles.workoutDot, { backgroundColor: w.completed ? Colors.green : c.border }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.workoutName, { color: c.text }]}>{w.name}</Text>
                  <Text style={[styles.workoutDate, { color: c.text3 }]}>{w.date}</Text>
                </View>
                <Text style={[styles.workoutDuration, { color: c.text2 }]}>
                  {Math.round(w.duration_seconds / 60)}m
                </Text>
              </View>
            ))}
          </View>
        )}

        {workouts.length === 0 && checkins.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📈</Text>
            <Text style={[styles.emptyStateTitle, { color: c.text }]}>{p.no_data}</Text>
            <Text style={[styles.emptyStateSub, { color: c.text2 }]}>{p.no_data_sub}</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  heroCard: {
    backgroundColor: Colors.navy, borderRadius: Radius.md, padding: Spacing.md,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  heroLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8 },
  heroValue: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginTop: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  avgBadge: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.sm, padding: 12 },
  avgNum: { fontSize: 26, fontWeight: '800', color: Colors.green },
  avgLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 2, lineHeight: 14 },
  card: {
    borderRadius: Radius.md, padding: Spacing.md,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    shadowColor: '#0F1726', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  cardSub: { fontSize: 12, marginTop: 2, marginBottom: 12 },
  chartWrap: { alignItems: 'flex-start' },
  emptyChart: { height: 80, alignItems: 'center', justifyContent: 'center', width: '100%' },
  emptyText: { fontSize: 13, fontStyle: 'italic' },
  readinessLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  legendItem: { alignItems: 'center' },
  legendLabel: { fontSize: 10 },
  legendValue: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  prRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 12 },
  prBadge: { flex: 1, borderRadius: Radius.sm, padding: 12 },
  prBadgePR: { backgroundColor: Colors.greenSoft },
  prLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4 },
  prValue: { fontSize: 20, fontWeight: '700', marginTop: 2 },
  workoutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  workoutDot: { width: 8, height: 8, borderRadius: 4 },
  workoutName: { fontSize: 14, fontWeight: '600' },
  workoutDate: { fontSize: 11, marginTop: 1 },
  workoutDuration: { fontSize: 13, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: Spacing.xl },
  emptyStateEmoji: { fontSize: 40, marginBottom: 12 },
  emptyStateTitle: { fontSize: 18, fontWeight: '700' },
  emptyStateSub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
