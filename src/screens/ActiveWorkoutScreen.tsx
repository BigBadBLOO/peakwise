import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, Alert, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing } from '../constants/theme';
import { saveWorkout } from '../db/database';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight: string;
}

interface Props {
  onFinish: () => void;
  onBack: () => void;
}

const EXERCISES: Exercise[] = [
  { name: 'Barbell Bench Press', sets: 4, reps: '6–8', weight: '72.5 kg' },
  { name: 'Pull-ups (weighted)', sets: 4, reps: '8', weight: '+10 kg' },
  { name: 'Seated DB Shoulder Press', sets: 3, reps: '10', weight: '22 kg' },
  { name: 'Cable Rows', sets: 3, reps: '12', weight: '55 kg' },
  { name: 'Tricep Pushdowns', sets: 3, reps: '15', weight: '30 kg' },
];

const TOTAL_SETS = EXERCISES.reduce((acc, e) => acc + e.sets, 0);
const DEFAULT_REST = 90;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const progress = useState(new Animated.Value(1))[0];

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration: seconds * 1000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(interval);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onDone();
          return 0;
        }
        if (r === 11) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const barColor = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [Colors.rest, Colors.light, Colors.green],
  });

  return (
    <View style={restStyles.container}>
      <View style={restStyles.header}>
        <Text style={restStyles.label}>Rest</Text>
        <Text style={restStyles.time}>{formatTime(remaining)}</Text>
        <TouchableOpacity onPress={onDone} style={restStyles.skipBtn}>
          <Text style={restStyles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      <View style={restStyles.track}>
        <Animated.View style={[restStyles.fill, { width: progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0%', '100%'],
        }) as any, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const restStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.n50,
    borderRadius: Radius.sm,
    padding: 12,
    marginTop: 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.n400, flex: 1 },
  time: { fontSize: 20, fontWeight: '700', color: Colors.n900, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  skipBtn: { flex: 1, alignItems: 'flex-end' },
  skipText: { fontSize: 13, color: Colors.green, fontWeight: '600' },
  track: { height: 4, backgroundColor: Colors.n200, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
});

export default function ActiveWorkoutScreen({ onFinish, onBack }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [resting, setResting] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const startTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const totalDone = Object.values(completedSets).reduce((a, b) => a + b, 0);
  const progress = TOTAL_SETS > 0 ? totalDone / TOTAL_SETS : 0;

  const currentExerciseIndex = EXERCISES.findIndex(
    e => (completedSets[e.name] ?? 0) < e.sets
  );

  const markSet = useCallback((exercise: Exercise) => {
    const done = completedSets[exercise.name] ?? 0;
    if (done >= exercise.sets) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCompletedSets(prev => ({ ...prev, [exercise.name]: done + 1 }));
    const isLastSet = done + 1 >= exercise.sets;
    if (!isLastSet) setResting(exercise.name);
  }, [completedSets]);

  const handleFeedback = (exerciseName: string, type: 'easy' | 'hard') => {
    Haptics.selectionAsync();
    setFeedbacks(prev => ({ ...prev, [exerciseName]: type }));
  };

  const persistAndFinish = async () => {
    const sets = EXERCISES.flatMap(e =>
      Array.from({ length: completedSets[e.name] ?? 0 }, (_, i) => ({
        exercise_name: e.name,
        set_number: i + 1,
        reps: e.reps,
        weight: e.weight,
        feedback: feedbacks[e.name],
      }))
    );
    await saveWorkout(
      {
        date: new Date().toISOString().split('T')[0],
        name: 'Upper Body · Heavy',
        duration_seconds: Math.floor((Date.now() - startTime.current) / 1000),
        completed: totalDone === TOTAL_SETS ? 1 : 0,
      },
      sets
    ).catch(() => {});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onFinish();
  };

  const handleFinish = () => {
    if (totalDone < TOTAL_SETS) {
      Alert.alert(
        'Finish early?',
        `You've completed ${totalDone} of ${TOTAL_SETS} sets. End workout?`,
        [
          { text: 'Keep going', style: 'cancel' },
          { text: 'Finish', style: 'destructive', onPress: persistAndFinish },
        ]
      );
    } else {
      persistAndFinish();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-down" size={24} color={Colors.n600} />
        </TouchableOpacity>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
          <Text style={styles.timerLabel}>ELAPSED</Text>
        </View>
        <TouchableOpacity onPress={handleFinish} style={styles.finishBtn}>
          <Text style={styles.finishBtnText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
      </View>
      <Text style={styles.progressLabel}>{totalDone} / {TOTAL_SETS} sets</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {EXERCISES.map((exercise, index) => {
          const done = completedSets[exercise.name] ?? 0;
          const isComplete = done >= exercise.sets;
          const isCurrent = index === currentExerciseIndex;
          const isResting = resting === exercise.name;

          return (
            <View
              key={exercise.name}
              style={[
                styles.exerciseCard,
                isCurrent && styles.exerciseCardActive,
                isComplete && styles.exerciseCardDone,
              ]}
            >
              <View style={styles.exerciseTop}>
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseName, isComplete && styles.textDone]}>
                    {exercise.name}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.sets} × {exercise.reps} · {exercise.weight}
                  </Text>
                </View>
                {isComplete ? (
                  <View style={styles.doneCheck}>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  </View>
                ) : (
                  <Text style={styles.setCounter}>{done}/{exercise.sets}</Text>
                )}
              </View>

              {/* Set dots */}
              <View style={styles.dotsRow}>
                {Array.from({ length: exercise.sets }).map((_, si) => (
                  <View key={si} style={[styles.setDot, si < done && styles.setDotDone]} />
                ))}
              </View>

              {/* Rest timer */}
              {isResting && (
                <RestTimer
                  seconds={DEFAULT_REST}
                  onDone={() => setResting(null)}
                />
              )}

              {/* Active controls (shown when current and not resting) */}
              {isCurrent && !isComplete && !isResting && (
                <View style={styles.activeControls}>
                  <View style={styles.feedbackRow}>
                    <TouchableOpacity
                      style={[
                        styles.feedbackBtn,
                        feedbacks[exercise.name] === 'easy' && styles.feedbackBtnSelected,
                      ]}
                      onPress={() => handleFeedback(exercise.name, 'easy')}
                    >
                      <Text style={styles.feedbackBtnText}>Too easy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.feedbackBtn,
                        styles.feedbackBtnHard,
                        feedbacks[exercise.name] === 'hard' && styles.feedbackBtnHardSelected,
                      ]}
                      onPress={() => handleFeedback(exercise.name, 'hard')}
                    >
                      <Text style={[styles.feedbackBtnText, styles.feedbackBtnTextHard]}>Too hard</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.setDoneBtn} onPress={() => markSet(exercise)}>
                    <Text style={styles.setDoneBtnText}>Set {done + 1} done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity style={styles.finishFullBtn} onPress={handleFinish}>
          <Text style={styles.finishFullBtnText}>Complete workout</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.n50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  timerBox: { alignItems: 'center' },
  timerText: { fontSize: 28, fontWeight: '700', color: Colors.n900, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  timerLabel: { fontSize: 10, fontWeight: '600', color: Colors.n400, letterSpacing: 0.8, marginTop: 1 },
  finishBtn: {
    backgroundColor: Colors.n100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  finishBtnText: { fontSize: 14, fontWeight: '600', color: Colors.n700 },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.n200,
    marginHorizontal: Spacing.md,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 2 },
  progressLabel: {
    fontSize: 11, color: Colors.n400, fontWeight: '600',
    marginHorizontal: Spacing.md, marginTop: 6, marginBottom: 8,
  },
  scroll: { flex: 1 },
  exerciseCard: {
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
  exerciseCardActive: {
    borderWidth: 1.5,
    borderColor: Colors.green,
    shadowColor: Colors.green,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  exerciseCardDone: { opacity: 0.55 },
  exerciseTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  exerciseInfo: { flex: 1, marginRight: 12 },
  exerciseName: { fontSize: 15, fontWeight: '600', color: Colors.n900 },
  textDone: { textDecorationLine: 'line-through', color: Colors.n400 },
  exerciseMeta: { fontSize: 12, color: Colors.n400, marginTop: 2 },
  doneCheck: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.green,
    alignItems: 'center', justifyContent: 'center',
  },
  setCounter: { fontSize: 18, fontWeight: '700', color: Colors.n500 },
  dotsRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  setDot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.n200 },
  setDotDone: { backgroundColor: Colors.green },
  activeControls: { marginTop: 14, gap: 10 },
  feedbackRow: { flexDirection: 'row', gap: 8 },
  feedbackBtn: {
    flex: 1, height: 36, borderRadius: Radius.full,
    backgroundColor: Colors.greenSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  feedbackBtnSelected: { backgroundColor: Colors.green },
  feedbackBtnHard: { backgroundColor: '#FEE8E9' },
  feedbackBtnHardSelected: { backgroundColor: Colors.rest },
  feedbackBtnText: { fontSize: 13, fontWeight: '600', color: Colors.greenPressed },
  feedbackBtnTextHard: { color: Colors.rest },
  setDoneBtn: {
    backgroundColor: Colors.green, borderRadius: Radius.full, height: 48,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 10, elevation: 4,
  },
  setDoneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  finishFullBtn: {
    backgroundColor: Colors.navy, borderRadius: Radius.full, height: 52,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: Spacing.md, marginTop: 8,
  },
  finishFullBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
