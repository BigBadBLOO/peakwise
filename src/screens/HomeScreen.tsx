import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import { useLang } from '../context/LanguageContext';
import { useUnits } from '../context/UnitsContext';
import { Screen, Card } from '../components/Themed';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ScrollView } from 'react-native';

type Nav = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const c = useColors();
  const { t } = useLang();
  const { format } = useUnits();
  const h = t.home;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.date, { color: c.text3 }]}>THURSDAY · MAY 16</Text>
          <Text style={[styles.greeting, { color: c.text }]}>Morning, Alex</Text>
        </View>

        {/* Status card */}
        <Card>
          <View style={[styles.statusBadge, { backgroundColor: Colors.green }]}>
            <Text style={styles.statusLabel}>{h.status_ready}</Text>
          </View>
          <Text style={[styles.cardTitle, { color: c.text }]}>{h.fully_recovered}</Text>
          <Text style={[styles.cardSub, { color: c.text2 }]}>{h.push_today}</Text>
          <View style={[styles.readinessMeter, { backgroundColor: c.surface2 }]}>
            <View style={styles.readinessFill} />
          </View>
          <Text style={[styles.readinessLabel, { color: c.text3 }]}>{h.readiness} · 92</Text>
        </Card>

        {/* Today's workout */}
        <Card>
          <View style={styles.workoutBadge}>
            <Text style={styles.workoutBadgeText}>AI · 42 MIN</Text>
          </View>
          <Text style={[styles.cardMeta, { color: c.text3 }]}>{h.todays_workout}</Text>
          <Text style={[styles.cardTitle, { color: c.text }]}>Upper Body · Heavy</Text>
          <Text style={[styles.cardSub, { color: c.text2 }]}>{h.ai_built}</Text>

          <View style={[styles.exerciseList, { backgroundColor: c.surface2 }]}>
            {([
              ['Barbell Bench Press', '4 × 6–8', 72.5],
              ['Pull-ups (weighted)', '4 × 8', 10],
              ['Seated DB Shoulder Press', '3 × 10', 22],
            ] as [string, string, number][]).map(([name, sets, weight]) => (
              <View key={name} style={styles.exerciseRow}>
                <View style={styles.dot} />
                <Text style={[styles.exerciseName, { color: c.text }]}>{name}</Text>
                <Text style={[styles.exerciseSets, { color: c.text3 }]}>{sets}</Text>
                <Text style={[styles.exerciseWeight, { color: c.text2 }]}>{format(weight)}</Text>
              </View>
            ))}
            <Text style={[styles.moreExercises, { color: c.text3 }]}>{h.more_exercises(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('ActiveWorkout')}
          >
            <Text style={styles.primaryBtnText}>{h.start_workout}</Text>
          </TouchableOpacity>
        </Card>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          {([
            [h.streak, '12d'],
            [h.sleep, '7.4h'],
            [h.hrv, '64ms'],
          ] as [string, string][]).map(([label, value]) => (
            <View key={label} style={[styles.statCard, { backgroundColor: c.surface }]}>
              <Text style={[styles.statLabel, { color: c.text3 }]}>{label}</Text>
              <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  date: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6 },
  greeting: { fontSize: 26, fontWeight: '700', letterSpacing: -0.6, marginTop: 2 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  statusLabel: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  cardMeta: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  cardTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2, marginTop: 4 },
  cardSub: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  readinessMeter: { height: 6, borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  readinessFill: { width: '92%', height: '100%', backgroundColor: Colors.green, borderRadius: 3 },
  readinessLabel: { fontSize: 11, marginTop: 4, fontWeight: '600', letterSpacing: 0.4 },
  workoutBadge: {
    position: 'absolute', top: Spacing.md, right: Spacing.md,
    backgroundColor: Colors.greenSoft, paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: Radius.full,
  },
  workoutBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.greenPressed, letterSpacing: 0.4 },
  exerciseList: { borderRadius: Radius.sm, padding: 12, marginTop: 12, gap: 8 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  exerciseName: { flex: 1, fontSize: 13, fontWeight: '500' },
  exerciseSets: { fontSize: 11 },
  exerciseWeight: { fontSize: 11, fontWeight: '600', minWidth: 52, textAlign: 'right' },
  moreExercises: { fontSize: 11, marginTop: 2 },
  primaryBtn: {
    backgroundColor: Colors.green, borderRadius: Radius.full, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 14,
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32, shadowRadius: 12, elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm, gap: Spacing.sm,
  },
  statCard: {
    flex: 1, borderRadius: Radius.md, padding: 12,
    shadowColor: '#0F1726', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginTop: 4 },
});
