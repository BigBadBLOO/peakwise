import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../constants/theme';

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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function ActiveWorkoutScreen({ onFinish, onBack }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const totalDone = Object.values(completedSets).reduce((a, b) => a + b, 0);
  const progress = TOTAL_SETS > 0 ? totalDone / TOTAL_SETS : 0;

  const currentExerciseIndex = EXERCISES.findIndex(
    e => (completedSets[e.name] ?? 0) < e.sets
  );

  const markSet = useCallback((exercise: Exercise) => {
    const done = completedSets[exercise.name] ?? 0;
    if (done >= exercise.sets) return;
    setCompletedSets(prev => ({ ...prev, [exercise.name]: done + 1 }));
  }, [completedSets]);

  const handleFeedback = (type: 'easy' | 'hard') => {
    const label = type === 'easy' ? 'Too Easy noted' : 'Too Hard noted';
    Alert.alert(label, 'Your next session will be adjusted automatically.');
  };

  const handleFinish = () => {
    if (totalDone < TOTAL_SETS) {
      Alert.alert(
        'Finish early?',
        `You've completed ${totalDone} of ${TOTAL_SETS} sets. End workout?`,
        [
          { text: 'Keep going', style: 'cancel' },
          { text: 'Finish', style: 'destructive', onPress: onFinish },
        ]
      );
    } else {
      onFinish();
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
                  <View
                    key={si}
                    style={[styles.setDot, si < done && styles.setDotDone]}
                  />
                ))}
              </View>

              {isCurrent && !isComplete && (
                <View style={styles.activeControls}>
                  <View style={styles.feedbackRow}>
                    <TouchableOpacity
                      style={styles.feedbackBtn}
                      onPress={() => handleFeedback('easy')}
                    >
                      <Text style={styles.feedbackBtnText}>Too easy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.feedbackBtn, styles.feedbackBtnHard]}
                      onPress={() => handleFeedback('hard')}
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
  progressFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.n400,
    fontWeight: '600',
    marginHorizontal: Spacing.md,
    marginTop: 6,
    marginBottom: 8,
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
  exerciseCardDone: { opacity: 0.6 },
  exerciseTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  exerciseInfo: { flex: 1, marginRight: 12 },
  exerciseName: { fontSize: 15, fontWeight: '600', color: Colors.n900 },
  textDone: { textDecorationLine: 'line-through', color: Colors.n400 },
  exerciseMeta: { fontSize: 12, color: Colors.n400, marginTop: 2 },
  doneCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCounter: { fontSize: 18, fontWeight: '700', color: Colors.n500 },
  dotsRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  setDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.n200,
  },
  setDotDone: { backgroundColor: Colors.green },
  activeControls: { marginTop: 14, gap: 10 },
  feedbackRow: { flexDirection: 'row', gap: 8 },
  feedbackBtn: {
    flex: 1,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBtnHard: { backgroundColor: '#FEE8E9' },
  feedbackBtnText: { fontSize: 13, fontWeight: '600', color: Colors.greenPressed },
  feedbackBtnTextHard: { color: Colors.rest },
  setDoneBtn: {
    backgroundColor: Colors.green,
    borderRadius: Radius.full,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  setDoneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  finishFullBtn: {
    backgroundColor: Colors.navy,
    borderRadius: Radius.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.md,
    marginTop: 8,
  },
  finishFullBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
