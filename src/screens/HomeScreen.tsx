import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '../constants/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>THURSDAY · MAY 16</Text>
            <Text style={styles.greeting}>Morning, Alex</Text>
          </View>
        </View>

        {/* Status card */}
        <View style={styles.card}>
          <View style={[styles.statusBadge, { backgroundColor: Colors.green }]}>
            <Text style={styles.statusLabel}>READY</Text>
          </View>
          <Text style={styles.cardTitle}>You're fully recovered.</Text>
          <Text style={styles.cardSub}>
            Perfect day for an intense workout. Push your big lifts today.
          </Text>

          <View style={styles.readinessMeter}>
            <View style={styles.readinessFill} />
          </View>
          <Text style={styles.readinessLabel}>Readiness · 92</Text>
        </View>

        {/* Today's workout */}
        <View style={styles.card}>
          <View style={styles.workoutBadge}>
            <Text style={styles.workoutBadgeText}>AI · 42 MIN</Text>
          </View>
          <Text style={styles.cardMeta}>TODAY'S WORKOUT</Text>
          <Text style={styles.cardTitle}>Upper Body · Heavy</Text>
          <Text style={styles.cardSub}>Built around your bench-press progression block.</Text>

          <View style={styles.exerciseList}>
            {[
              ['Barbell Bench Press', '4 × 6–8', '72.5 kg'],
              ['Pull-ups (weighted)', '4 × 8', '+10 kg'],
              ['Seated DB Shoulder Press', '3 × 10', '22 kg'],
            ].map(([name, sets, weight]) => (
              <View key={name} style={styles.exerciseRow}>
                <View style={styles.dot} />
                <Text style={styles.exerciseName}>{name}</Text>
                <Text style={styles.exerciseSets}>{sets}</Text>
                <Text style={styles.exerciseWeight}>{weight}</Text>
              </View>
            ))}
            <Text style={styles.moreExercises}>+ 2 more exercises</Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Start workout</Text>
          </TouchableOpacity>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          {[
            ['Streak', '12d'],
            ['Sleep', '7.4h'],
            ['HRV', '64ms'],
          ].map(([label, value]) => (
            <View key={label} style={[styles.card, styles.statCard]}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{value}</Text>
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
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  date: { fontSize: 11, fontWeight: '600', color: Colors.n400, letterSpacing: 0.6 },
  greeting: { fontSize: 26, fontWeight: '700', color: Colors.n900, letterSpacing: -0.6, marginTop: 2 },
  card: {
    backgroundColor: Colors.n0,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    shadowColor: '#0F1726',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  statusLabel: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  cardMeta: { fontSize: 11, fontWeight: '600', color: Colors.n400, letterSpacing: 0.6, textTransform: 'uppercase' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.n900, letterSpacing: -0.2, marginTop: 4 },
  cardSub: { fontSize: 13, color: Colors.n500, marginTop: 4, lineHeight: 18 },
  readinessMeter: {
    height: 6,
    backgroundColor: Colors.n100,
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  readinessFill: {
    width: '92%',
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 3,
  },
  readinessLabel: { fontSize: 11, color: Colors.n400, marginTop: 4, fontWeight: '600', letterSpacing: 0.4 },
  workoutBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  workoutBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.greenPressed, letterSpacing: 0.4 },
  exerciseList: {
    backgroundColor: Colors.n50,
    borderRadius: Radius.sm,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  exerciseName: { flex: 1, fontSize: 13, color: Colors.n800, fontWeight: '500' },
  exerciseSets: { fontSize: 11, color: Colors.n400 },
  exerciseWeight: { fontSize: 11, color: Colors.n600, fontWeight: '600', minWidth: 52, textAlign: 'right' },
  moreExercises: { fontSize: 11, color: Colors.n400, marginTop: 2 },
  primaryBtn: {
    backgroundColor: Colors.green,
    borderRadius: Radius.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 0,
    padding: 12,
  },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.n400, letterSpacing: 0.4, textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.n900, letterSpacing: -0.3, marginTop: 4 },
});
