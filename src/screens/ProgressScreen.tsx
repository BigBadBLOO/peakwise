import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '../constants/theme';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import { getRecentWorkouts, getRecentCheckins, Workout, Checkin } from '../db/database';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - Spacing.md * 4;

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BENCH_PROGRESS = [
  { value: 65 }, { value: 67.5 }, { value: 70 }, { value: 70 },
  { value: 72.5 }, { value: 72.5 }, { value: 75 },
];

function buildWeekBars(workouts: Workout[]) {
  const now = new Date();
  return WEEK_LABELS.map((label, i) => {
    const day = new Date(now);
    const dayOfWeek = now.getDay() || 7;
    day.setDate(now.getDate() - (dayOfWeek - 1) + i);
    const dateStr = day.toISOString().split('T')[0];
    const isToday = dateStr === now.toISOString().split('T')[0];
    const count = workouts.filter(w => w.date === dateStr && w.completed).length;
    return { label, value: count, active: isToday };
  });
}

function buildReadinessBars(checkins: Checkin[]) {
  return checkins.slice(0, 7).reverse().map(c => {
    const date = new Date(c.date);
    return {
      label: WEEK_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1],
      value: c.readiness,
    };
  });
}

export default function ProgressScreen() {
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
      const dateStr = d.toISOString().split('T')[0];
      if (workouts.some(w => w.date === dateStr && w.completed)) s++;
      else if (i > 0) break;
    }
    setStreak(s);
  }, [workouts]);

  const weekBars = buildWeekBars(workouts);
  const readinessBars = checkins.length > 1 ? buildReadinessBars(checkins) : [];
  const totalWorkouts = workouts.filter(w => w.completed).length;
  const avgReadiness = checkins.length > 0
    ? Math.round(checkins.reduce((a, c) => a + c.readiness, 0) / checkins.length)
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
        </View>

        {/* Streak hero */}
        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>CURRENT STREAK</Text>
            <Text style={styles.heroValue}>{streak} {streak === 1 ? 'day' : 'days'} 🔥</Text>
            <Text style={styles.heroSub}>{totalWorkouts} workouts logged total</Text>
          </View>
          {avgReadiness !== null && (
            <View style={styles.avgBadge}>
              <Text style={styles.avgNum}>{avgReadiness}</Text>
              <Text style={styles.avgLabel}>avg{'\n'}readiness</Text>
            </View>
          )}
        </View>

        {/* Weekly workouts bar chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This week</Text>
          <Text style={styles.cardSub}>Completed workouts per day</Text>
          <View style={styles.chartWrap}>
            {weekBars.every(b => b.value === 0) ? (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyText}>No workouts logged yet this week</Text>
              </View>
            ) : (
              <BarChart data={weekBars} height={100} />
            )}
          </View>
        </View>

        {/* Readiness line chart */}
        {readinessBars.length > 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Readiness trend</Text>
            <Text style={styles.cardSub}>Last {readinessBars.length} check-ins</Text>
            <View style={styles.chartWrap}>
              <LineChart data={readinessBars} width={CHART_WIDTH} height={90} />
            </View>
            <View style={styles.readinessLegend}>
              {readinessBars.map((b, i) => (
                <View key={i} style={styles.legendItem}>
                  <Text style={styles.legendLabel}>{b.label}</Text>
                  <Text style={[styles.legendValue, {
                    color: b.value >= 70 ? Colors.green : b.value >= 50 ? Colors.light : Colors.rest,
                  }]}>{b.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bench press line chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bench Press</Text>
          <Text style={styles.cardSub}>Weight progression (kg)</Text>
          <View style={styles.chartWrap}>
            <LineChart data={BENCH_PROGRESS} width={CHART_WIDTH} height={90} />
          </View>
          <View style={styles.prRow}>
            <View style={styles.prBadge}>
              <Text style={styles.prLabel}>CURRENT</Text>
              <Text style={styles.prValue}>72.5 kg</Text>
            </View>
            <View style={[styles.prBadge, styles.prBadgePR]}>
              <Text style={styles.prLabel}>ALL-TIME PR</Text>
              <Text style={[styles.prValue, { color: Colors.green }]}>75 kg</Text>
            </View>
          </View>
        </View>

        {/* Recent workouts list */}
        {workouts.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent workouts</Text>
            {workouts.slice(0, 5).map((w, i) => (
              <View key={w.id} style={[
                styles.workoutRow,
                i < Math.min(workouts.length, 5) - 1 && styles.workoutBorder,
              ]}>
                <View style={[styles.workoutDot, { backgroundColor: w.completed ? Colors.green : Colors.n300 }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.workoutName}>{w.name}</Text>
                  <Text style={styles.workoutDate}>{w.date}</Text>
                </View>
                <Text style={styles.workoutDuration}>
                  {Math.round(w.duration_seconds / 60)}m
                </Text>
              </View>
            ))}
          </View>
        )}

        {workouts.length === 0 && checkins.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📈</Text>
            <Text style={styles.emptyStateTitle}>No data yet</Text>
            <Text style={styles.emptyStateSub}>
              Complete your first workout and check-in to see progress here.
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.n50 },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: Colors.n900, letterSpacing: -0.6 },
  heroCard: {
    backgroundColor: Colors.navy,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8 },
  heroValue: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginTop: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  avgBadge: {
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.sm, padding: 12,
  },
  avgNum: { fontSize: 26, fontWeight: '800', color: Colors.green },
  avgLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 2, lineHeight: 14 },
  card: {
    backgroundColor: Colors.n0,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#0F1726',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.n900, letterSpacing: -0.2 },
  cardSub: { fontSize: 12, color: Colors.n400, marginTop: 2, marginBottom: 12 },
  chartWrap: { alignItems: 'flex-start' },
  emptyChart: { height: 80, alignItems: 'center', justifyContent: 'center', width: '100%' },
  emptyText: { fontSize: 13, color: Colors.n400, fontStyle: 'italic' },
  readinessLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  legendItem: { alignItems: 'center' },
  legendLabel: { fontSize: 10, color: Colors.n400 },
  legendValue: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  prRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 12 },
  prBadge: { flex: 1, backgroundColor: Colors.n50, borderRadius: Radius.sm, padding: 12 },
  prBadgePR: { backgroundColor: Colors.greenSoft },
  prLabel: { fontSize: 10, fontWeight: '600', color: Colors.n400, letterSpacing: 0.4 },
  prValue: { fontSize: 20, fontWeight: '700', color: Colors.n900, marginTop: 2 },
  workoutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  workoutBorder: { borderBottomWidth: 1, borderBottomColor: Colors.n100 },
  workoutDot: { width: 8, height: 8, borderRadius: 4 },
  workoutName: { fontSize: 14, fontWeight: '600', color: Colors.n900 },
  workoutDate: { fontSize: 11, color: Colors.n400, marginTop: 1 },
  workoutDuration: { fontSize: 13, fontWeight: '600', color: Colors.n500 },
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: Spacing.xl },
  emptyStateEmoji: { fontSize: 40, marginBottom: 12 },
  emptyStateTitle: { fontSize: 18, fontWeight: '700', color: Colors.n900 },
  emptyStateSub: { fontSize: 14, color: Colors.n400, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
