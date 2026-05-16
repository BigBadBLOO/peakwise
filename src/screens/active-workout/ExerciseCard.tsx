import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTokens } from '../../hooks/useTokens';
import { useUnits } from '../../context/UnitsContext';
import { RestTimer } from './RestTimer';

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weightKg: number;
}

const DEFAULT_REST = 90;

interface Props {
  exercise: Exercise;
  done: number;
  isCurrent: boolean;
  isComplete: boolean;
  isResting: boolean;
  feedback: string | undefined;
  activeWorkoutLabels: {
    rest: string;
    skip_rest: string;
    too_easy: string;
    too_hard: string;
    set_done: (n: number) => string;
  };
  onMarkSet: () => void;
  onRestDone: () => void;
  onFeedback: (type: 'easy' | 'hard') => void;
}

export function ExerciseCard({ exercise, done, isCurrent, isComplete, isResting, feedback, activeWorkoutLabels: aw, onMarkSet, onRestDone, onFeedback }: Props) {
  const t = useTokens();
  const { format } = useUnits();

  return (
    <View style={{
      backgroundColor: t.bgCard, borderRadius: t.radius.md,
      padding: t.spacing.md, marginHorizontal: t.spacing.md, marginBottom: t.spacing.sm,
      borderWidth: isCurrent ? 1.5 : 0,
      borderColor: isCurrent ? t.colorPrimary : 'transparent',
      opacity: isComplete ? 0.55 : 1,
      shadowColor: isCurrent ? t.colorPrimary : t.shadowSurface,
      shadowOffset: { width: 0, height: isCurrent ? t.shadow.active.offsetY : t.shadow.sm.offsetY },
      shadowOpacity: isCurrent ? t.shadow.active.opacity : t.shadow.sm.opacity,
      shadowRadius: isCurrent ? t.shadow.active.radius : t.shadow.sm.radius,
      elevation: isCurrent ? t.shadow.active.elevation : t.shadow.sm.elevation,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: t.spacing.inset }}>
          <Text style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: isComplete ? t.textTertiary : t.textPrimary, textDecorationLine: isComplete ? 'line-through' : 'none' }}>
            {exercise.name}
          </Text>
          <Text style={{ fontSize: t.font.size.small, color: t.textTertiary, marginTop: t.spacing.xxs }}>
            {exercise.sets} × {exercise.reps} · {format(exercise.weightKg)}
          </Text>
        </View>
        {isComplete ? (
          <View style={{ width: 28, height: 28, borderRadius: t.radius.full, backgroundColor: t.colorPrimary, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark" size={18} color={t.textOnColor} />
          </View>
        ) : (
          <Text style={{ fontSize: t.font.size.title, fontWeight: t.font.weight.bold, color: t.textTertiary }}>{done}/{exercise.sets}</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: t.spacing.xs, marginTop: t.spacing.snug }}>
        {Array.from({ length: exercise.sets }).map((_, i) => (
          <View key={i} style={{ flex: 1, height: 6, borderRadius: t.radius.xs, backgroundColor: i < done ? t.colorPrimary : t.bgSubtle }} />
        ))}
      </View>

      {isResting && (
        <RestTimer seconds={DEFAULT_REST} onDone={onRestDone} restLabel={aw.rest} skipLabel={aw.skip_rest} />
      )}

      {isCurrent && !isComplete && !isResting && (
        <View style={{ marginTop: t.spacing.md, gap: t.spacing.snug }}>
          <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
            <TouchableOpacity
              style={{ flex: 1, height: 36, borderRadius: t.radius.full, backgroundColor: feedback === 'easy' ? t.colorPrimary : t.colorPrimarySubtle, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => onFeedback('easy')}
            >
              <Text style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.semibold, color: feedback === 'easy' ? t.textOnColor : t.colorPrimaryPressed }}>{aw.too_easy}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, height: 36, borderRadius: t.radius.full, backgroundColor: feedback === 'hard' ? t.colorError : t.colorErrorSubtle, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => onFeedback('hard')}
            >
              <Text style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.semibold, color: t.colorError }}>{aw.too_hard}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: t.colorPrimary, borderRadius: t.radius.full, height: 48, alignItems: 'center', justifyContent: 'center', shadowColor: t.colorPrimary, shadowOffset: { width: 0, height: t.shadow.button.offsetY }, shadowOpacity: t.shadow.button.opacity, shadowRadius: t.shadow.button.radius, elevation: t.shadow.button.elevation }}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onMarkSet(); }}
          >
            <Text style={{ color: t.textOnColor, fontSize: t.font.size.xl, fontWeight: t.font.weight.bold }}>{aw.set_done(done + 1)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
