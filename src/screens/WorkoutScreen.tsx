import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '../constants/theme';

const DAYS = [
  { label: 'M', date: '13', type: 'push', done: true },
  { label: 'T', date: '14', type: 'pull', done: true },
  { label: 'W', date: '15', type: 'rest', done: true },
  { label: 'T', date: '16', type: 'legs', active: true },
  { label: 'F', date: '17', type: 'pull' },
  { label: 'S', date: '18', type: 'rest' },
  { label: 'S', date: '19', type: 'cardio' },
];

const TYPE_COLOR: Record<string, string> = {
  push: Colors.green,
  pull: Colors.teal,
  legs: Colors.green,
  cardio: Colors.light,
  rest: Colors.n300,
};

const SESSIONS = [
  { day: 'Mon', date: 'May 13', name: 'Push · Chest + Triceps', muscles: ['Chest', 'Shoulders', 'Triceps'], dur: '52 min', done: true },
  { day: 'Tue', date: 'May 14', name: 'Pull · Back + Biceps', muscles: ['Back', 'Biceps'], dur: '48 min', done: true },
  { day: 'Wed', date: 'May 15', name: 'Rest day', rest: true, done: true },
  { day: 'Thu · today', date: 'May 16', name: 'Upper · Heavy', muscles: ['Chest', 'Back', 'Shoulders'], dur: '42 min', today: true },
  { day: 'Fri', date: 'May 17', name: 'Pull · Back volume', muscles: ['Back', 'Biceps', 'Rear delts'], dur: '55 min' },
  { day: 'Sat', date: 'May 18', name: 'Rest day', rest: true },
  { day: 'Sun', date: 'May 19', name: 'Zone 2 Cardio', muscles: ['Cardiovascular'], dur: '40 min' },
];

export default function WorkoutScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>WEEK 12 · HYPERTROPHY BLOCK</Text>
          <Text style={styles.title}>This week</Text>
        </View>

        {/* Week strip */}
        <View style={styles.weekStrip}>
          {DAYS.map((d, i) => (
            <TouchableOpacity key={i} style={[styles.dayBtn, d.active && styles.dayBtnActive]}>
              <Text style={[styles.dayLabel, d.active && styles.dayLabelActive]}>{d.label}</Text>
              <Text style={[styles.dayDate, d.active && styles.dayDateActive]}>{d.date}</Text>
              <View style={[
                styles.dayDot,
                { backgroundColor: d.type === 'rest' ? Colors.n300 : TYPE_COLOR[d.type] },
                d.active && { opacity: 1 },
                d.done && !d.active && { opacity: 0.5 },
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sessions */}
        <View style={styles.sessions}>
          {SESSIONS.map((s, i) => (
            <View key={i} style={[
              styles.sessionCard,
              s.today && styles.sessionCardToday,
              s.done && !s.today && styles.sessionCardDone,
            ]}>
              <View style={styles.sessionDate}>
                <Text style={[styles.sessionDay, s.today && styles.sessionDayToday]}>
                  {s.day.split(' ')[0]}
                </Text>
                <Text style={[styles.sessionDateNum, s.today && styles.sessionDayToday]}>
                  {s.date.split(' ')[1]}
                </Text>
              </View>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionName, s.rest && styles.sessionNameMuted]}>{s.name}</Text>
                {!s.rest && s.muscles && (
                  <View style={styles.muscleRow}>
                    {s.muscles.slice(0, 3).map(m => (
                      <View key={m} style={styles.muscleTag}>
                        <Text style={styles.muscleTagText}>{m}</Text>
                      </View>
                    ))}
                    <Text style={styles.durText}>· {s.dur}</Text>
                  </View>
                )}
              </View>
              {s.today && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>Today</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: Spacing.md, marginTop: Spacing.sm }}>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Regenerate program</Text>
          </TouchableOpacity>
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
  weekStrip: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: 6,
    marginBottom: Spacing.md,
  },
  dayBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.n0,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.n200,
  },
  dayBtnActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  dayLabel: { fontSize: 9, fontWeight: '600', color: Colors.n400, textTransform: 'uppercase', letterSpacing: 0.6 },
  dayLabelActive: { color: 'rgba(255,255,255,0.6)' },
  dayDate: { fontSize: 14, fontWeight: '700', color: Colors.n900 },
  dayDateActive: { color: '#fff' },
  dayDot: { width: 6, height: 6, borderRadius: 3 },
  sessions: { paddingHorizontal: Spacing.md, gap: 8 },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.n0,
    borderRadius: Radius.md,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.n200,
    shadowColor: '#0F1726',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sessionCardToday: { backgroundColor: Colors.greenSoft, borderColor: Colors.green },
  sessionCardDone: { opacity: 0.65 },
  sessionDate: { width: 36, alignItems: 'center' },
  sessionDay: { fontSize: 9, fontWeight: '700', color: Colors.n400, textTransform: 'uppercase', letterSpacing: 0.5 },
  sessionDayToday: { color: Colors.greenPressed },
  sessionDateNum: { fontSize: 17, fontWeight: '700', color: Colors.n900, letterSpacing: -0.3 },
  sessionInfo: { flex: 1 },
  sessionName: { fontSize: 14, fontWeight: '700', color: Colors.n900, letterSpacing: -0.1 },
  sessionNameMuted: { color: Colors.n500 },
  muscleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  muscleTag: {
    backgroundColor: Colors.tealSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  muscleTagText: { fontSize: 10, fontWeight: '600', color: '#00868F' },
  durText: { fontSize: 10, color: Colors.n400 },
  todayBadge: {
    backgroundColor: Colors.green,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  todayBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  secondaryBtn: {
    height: 52,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.n300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: Colors.n900 },
});
