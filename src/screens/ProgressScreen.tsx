import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '../constants/theme';

const BARS = [62, 78, 71, 88, 95, 82, 100, 90];

const RECENT = [
  { date: 'Tue · May 14', name: 'Pull · Back + Biceps', dur: '48 min' },
  { date: 'Mon · May 13', name: 'Push · Chest + Triceps', dur: '52 min' },
  { date: 'Sat · May 11', name: 'Legs · Heavy', dur: '64 min' },
];

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOUR PROGRESS</Text>
          <Text style={styles.title}>The trend</Text>
        </View>

        {/* Streak hero */}
        <View style={styles.streakCard}>
          <View>
            <Text style={styles.streakEyebrow}>CURRENT STREAK</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 4 }}>
              <Text style={styles.streakNum}>12</Text>
              <Text style={styles.streakUnit}>days</Text>
            </View>
            <Text style={styles.streakBest}>Best ever: 18 days · Apr</Text>
          </View>
          <Text style={styles.streakEmoji}>🔥</Text>
        </View>

        {/* Volume chart */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardEyebrow}>WEEKLY VOLUME</Text>
              <Text style={styles.cardTitle2}>Total tonnage</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.bigNum}>18.4<Text style={styles.unit}> t</Text></Text>
              <Text style={styles.delta}>↑ 12% vs last</Text>
            </View>
          </View>

          <View style={styles.barChart}>
            {BARS.map((v, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[
                  styles.bar,
                  { height: `${v}%` as any, backgroundColor: i === BARS.length - 1 ? Colors.green : Colors.n200 },
                ]} />
                <Text style={styles.barLabel}>W{i + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bench press progress */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardEyebrow}>LAST 8 WEEKS</Text>
              <Text style={styles.cardTitle2}>Bench Press · 1RM est.</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.bigNum}>100<Text style={styles.unit}> kg</Text></Text>
              <Text style={styles.delta}>↑ 12.0 kg</Text>
            </View>
          </View>
          <View style={styles.progressBarRow}>
            {[88, 90, 90, 92.5, 92.5, 95, 97.5, 100].map((v, i) => (
              <View key={i} style={[styles.progressDot, i === 7 && styles.progressDotActive]} />
            ))}
          </View>
        </View>

        {/* Recent workouts */}
        <Text style={styles.sectionLabel}>Recent workouts</Text>
        <View style={[styles.card, { padding: 4 }]}>
          {RECENT.map((w, i) => (
            <View key={i} style={[styles.recentRow, i < RECENT.length - 1 && styles.recentBorder]}>
              <View style={styles.recentIcon}>
                <Text style={{ fontSize: 16 }}>✓</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentName}>{w.name}</Text>
                <Text style={styles.recentMeta}>{w.date} · {w.dur}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.n50 },
  header: { padding: Spacing.md, paddingBottom: Spacing.sm },
  eyebrow: { fontSize: 11, fontWeight: '600', color: Colors.n400, letterSpacing: 0.6 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.n900, letterSpacing: -0.6, marginTop: 2 },
  streakCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: 18,
    borderRadius: Radius.md,
    backgroundColor: Colors.navy,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  streakEyebrow: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.6 },
  streakNum: { fontSize: 48, fontWeight: '800', color: '#fff', letterSpacing: -1.5 },
  streakUnit: { fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 8 },
  streakBest: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  streakEmoji: { fontSize: 36 },
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
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardEyebrow: { fontSize: 10, fontWeight: '600', color: Colors.n400, letterSpacing: 0.6, textTransform: 'uppercase' },
  cardTitle2: { fontSize: 16, fontWeight: '700', color: Colors.n900, letterSpacing: -0.2, marginTop: 2 },
  bigNum: { fontSize: 22, fontWeight: '700', color: Colors.n900, letterSpacing: -0.5 },
  unit: { fontSize: 13, color: Colors.n400 },
  delta: { fontSize: 12, color: Colors.green, fontWeight: '600', marginTop: 2 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 78, marginTop: 12, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 8, color: Colors.n400 },
  progressBarRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  progressDot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.n200 },
  progressDotActive: { backgroundColor: Colors.green },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.n500,
    paddingHorizontal: Spacing.md,
    paddingBottom: 8,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    paddingHorizontal: 14,
  },
  recentBorder: { borderBottomWidth: 1, borderBottomColor: Colors.n100 },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentName: { fontSize: 13, fontWeight: '600', color: Colors.n900 },
  recentMeta: { fontSize: 11, color: Colors.n400, marginTop: 2 },
});
