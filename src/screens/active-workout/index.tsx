import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { saveWorkout } from '../../db/database';
import { ExerciseCard, Exercise } from './ExerciseCard';

interface Props {
  onFinish: () => void;
  onBack: () => void;
}

const EXERCISES: Exercise[] = [
  { name: 'Barbell Bench Press',       sets: 4, reps: '6–8', weightKg: 72.5 },
  { name: 'Pull-ups (weighted)',        sets: 4, reps: '8',   weightKg: 10   },
  { name: 'Seated DB Shoulder Press',  sets: 3, reps: '10',  weightKg: 22   },
  { name: 'Cable Rows',                sets: 3, reps: '12',  weightKg: 55   },
  { name: 'Tricep Pushdowns',          sets: 3, reps: '15',  weightKg: 30   },
];

const TOTAL_SETS = EXERCISES.reduce((acc, e) => acc + e.sets, 0);

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function ActiveWorkoutScreen({ onFinish, onBack }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const aw = i18n.active_workout;

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
  const currentExerciseIndex = EXERCISES.findIndex(e => (completedSets[e.name] ?? 0) < e.sets);

  const markSet = useCallback((exercise: Exercise) => {
    const done = completedSets[exercise.name] ?? 0;
    if (done >= exercise.sets) return;
    setCompletedSets(prev => ({ ...prev, [exercise.name]: done + 1 }));
    if (done + 1 < exercise.sets) setResting(exercise.name);
  }, [completedSets]);

  const persistAndFinish = async () => {
    const sets = EXERCISES.flatMap(e =>
      Array.from({ length: completedSets[e.name] ?? 0 }, (_, i) => ({
        exercise_name: e.name, set_number: i + 1,
        reps: e.reps, weight: `${e.weightKg} kg`,
        feedback: feedbacks[e.name],
      }))
    );
    await saveWorkout(
      { date: new Date().toISOString().split('T')[0], name: 'Upper Body · Heavy', duration_seconds: Math.floor((Date.now() - startTime.current) / 1000), completed: totalDone === TOTAL_SETS ? 1 : 0 },
      sets
    ).catch(() => {});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onFinish();
  };

  const handleFinish = () => {
    if (totalDone < TOTAL_SETS) {
      Alert.alert(aw.finish_early_title, aw.finish_early_msg(totalDone, TOTAL_SETS), [
        { text: aw.keep_going, style: 'cancel' },
        { text: aw.finish, style: 'destructive', onPress: persistAndFinish },
      ]);
    } else {
      persistAndFinish();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bgScreen }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.inset }}>
        <TouchableOpacity onPress={onBack} style={{ padding: t.spacing.xs }} hitSlop={8}>
          <Ionicons name="chevron-down" size={24} color={t.textTertiary} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: t.font.size.heading, fontWeight: t.font.weight.bold, color: t.textPrimary, letterSpacing: t.font.tracking.tight }}>{formatTime(elapsed)}</Text>
          <Text style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: t.textTertiary, letterSpacing: t.font.tracking.widest, marginTop: t.spacing.xxs }}>{aw.elapsed}</Text>
        </View>
        <TouchableOpacity onPress={handleFinish} style={{ backgroundColor: t.bgSubtle, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm, borderRadius: t.radius.full }}>
          <Text style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.semibold, color: t.textPrimary }}>{aw.finish}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 4, backgroundColor: t.bgSubtle, marginHorizontal: t.spacing.md, borderRadius: t.radius.xs, overflow: 'hidden' }}>
        <View style={{ height: '100%', backgroundColor: t.colorPrimary, borderRadius: t.radius.xs, width: `${Math.round(progress * 100)}%` as any }} />
      </View>
      <Text style={{ fontSize: t.font.size.sm, color: t.textTertiary, fontWeight: t.font.weight.semibold, marginHorizontal: t.spacing.md, marginTop: t.spacing.xs, marginBottom: t.spacing.sm }}>
        {aw.sets(totalDone, TOTAL_SETS)}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {EXERCISES.map((exercise, index) => {
          const done = completedSets[exercise.name] ?? 0;
          return (
            <ExerciseCard
              key={exercise.name}
              exercise={exercise}
              done={done}
              isCurrent={index === currentExerciseIndex}
              isComplete={done >= exercise.sets}
              isResting={resting === exercise.name}
              feedback={feedbacks[exercise.name]}
              activeWorkoutLabels={aw}
              onMarkSet={() => markSet(exercise)}
              onRestDone={() => setResting(null)}
              onFeedback={type => { Haptics.selectionAsync(); setFeedbacks(prev => ({ ...prev, [exercise.name]: type })); }}
            />
          );
        })}

        <TouchableOpacity
          style={{ backgroundColor: t.colorNavy, borderRadius: t.radius.full, height: 52, alignItems: 'center', justifyContent: 'center', marginHorizontal: t.spacing.md, marginTop: t.spacing.sm }}
          onPress={handleFinish}
        >
          <Text style={{ color: t.textOnColor, fontSize: t.font.size.xl, fontWeight: t.font.weight.bold }}>{aw.complete}</Text>
        </TouchableOpacity>

        <View style={{ height: t.spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}
