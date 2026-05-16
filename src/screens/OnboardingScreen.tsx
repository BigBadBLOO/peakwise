import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Animated, Dimensions, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing } from '../constants/theme';
import { setProfileValue } from '../db/database';

const { width } = Dimensions.get('window');

interface Props {
  onDone: () => void;
}

const GOALS = [
  { id: 'strength', emoji: '🏋️', label: 'Build strength', sub: 'Focus on heavy compound lifts' },
  { id: 'hypertrophy', emoji: '💪', label: 'Build muscle', sub: 'Volume-focused hypertrophy training' },
  { id: 'endurance', emoji: '🏃', label: 'Improve endurance', sub: 'Cardio and conditioning' },
  { id: 'lose_weight', emoji: '🔥', label: 'Lose weight', sub: 'Caloric deficit + activity' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner', sub: 'Less than 1 year of training' },
  { id: 'intermediate', label: 'Intermediate', sub: '1–3 years of consistent training' },
  { id: 'advanced', label: 'Advanced', sub: '3+ years, know my lifts well' },
];

const DAYS_OPTIONS = [3, 4, 5, 6];

export default function OnboardingScreen({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [days, setDays] = useState(4);
  const slideAnim = useState(new Animated.Value(0))[0];

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    setStep(s => s + 1);
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('onboarded', 'true').catch(() => {});
    } else {
      await setProfileValue('goal', goal).catch(() => {});
      await setProfileValue('level', level).catch(() => {});
      await setProfileValue('days_per_week', String(days)).catch(() => {});
      await setProfileValue('onboarded', 'true').catch(() => {});
    }
    onDone();
  };

  const canContinue = step === 0 ? !!goal : step === 1 ? !!level : true;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress dots */}
      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }] }]}>
        {step === 0 && (
          <>
            <Text style={styles.title}>What's your main goal?</Text>
            <Text style={styles.sub}>We'll build your program around this.</Text>
            <View style={styles.options}>
              {GOALS.map(g => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.optionCard, goal === g.id && styles.optionCardActive]}
                  onPress={() => { setGoal(g.id); Haptics.selectionAsync(); }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.optionEmoji}>{g.emoji}</Text>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, goal === g.id && styles.optionLabelActive]}>
                      {g.label}
                    </Text>
                    <Text style={styles.optionSub}>{g.sub}</Text>
                  </View>
                  {goal === g.id && <View style={styles.checkDot} />}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.title}>Your experience level?</Text>
            <Text style={styles.sub}>This helps calibrate weights and volume.</Text>
            <View style={styles.options}>
              {LEVELS.map(l => (
                <TouchableOpacity
                  key={l.id}
                  style={[styles.optionCard, level === l.id && styles.optionCardActive]}
                  onPress={() => { setLevel(l.id); Haptics.selectionAsync(); }}
                  activeOpacity={0.75}
                >
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, level === l.id && styles.optionLabelActive]}>
                      {l.label}
                    </Text>
                    <Text style={styles.optionSub}>{l.sub}</Text>
                  </View>
                  {level === l.id && <View style={styles.checkDot} />}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>Days per week?</Text>
            <Text style={styles.sub}>How many days can you commit to training?</Text>
            <View style={styles.daysRow}>
              {DAYS_OPTIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayBtn, days === d && styles.dayBtnActive]}
                  onPress={() => { setDays(d); Haptics.selectionAsync(); }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.dayNum, days === d && styles.dayNumActive]}>{d}</Text>
                  <Text style={[styles.dayLabel, days === d && styles.dayLabelActive]}>days</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.daysHint}>
              {days === 3 && 'Full-body or push/pull/legs split'}
              {days === 4 && 'Upper/lower split — great balance'}
              {days === 5 && 'PPL + 2 extra sessions'}
              {days === 6 && 'Advanced: 6-day PPL'}
            </Text>
          </>
        )}
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
          onPress={step < 2 ? goNext : handleFinish}
          activeOpacity={0.85}
          disabled={!canContinue}
        >
          <Text style={styles.primaryBtnText}>
            {step < 2 ? 'Continue' : 'Start training'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.n0 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.n200 },
  dotActive: { width: 20, backgroundColor: Colors.green },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  title: { fontSize: 28, fontWeight: '800', color: Colors.n900, letterSpacing: -0.6, marginBottom: 8 },
  sub: { fontSize: 15, color: Colors.n500, lineHeight: 22, marginBottom: Spacing.lg },
  options: { gap: Spacing.sm },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.n200,
    backgroundColor: Colors.n0,
  },
  optionCardActive: {
    borderColor: Colors.green,
    backgroundColor: Colors.greenSoft,
  },
  optionEmoji: { fontSize: 22 },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: Colors.n900 },
  optionLabelActive: { color: Colors.greenPressed },
  optionSub: { fontSize: 12, color: Colors.n400, marginTop: 2 },
  checkDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.green },
  daysRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  dayBtn: {
    flex: 1,
    aspectRatio: 0.9,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.n200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnActive: { borderColor: Colors.green, backgroundColor: Colors.greenSoft },
  dayNum: { fontSize: 28, fontWeight: '800', color: Colors.n400 },
  dayNumActive: { color: Colors.green },
  dayLabel: { fontSize: 11, color: Colors.n400, fontWeight: '500' },
  dayLabelActive: { color: Colors.greenPressed },
  daysHint: { fontSize: 13, color: Colors.n500, textAlign: 'center', fontStyle: 'italic' },
  footer: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  primaryBtn: {
    backgroundColor: Colors.green,
    borderRadius: Radius.full,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryBtnDisabled: { backgroundColor: Colors.n300, shadowOpacity: 0 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
