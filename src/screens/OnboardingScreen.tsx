import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import { useLang } from '../context/LanguageContext';
import { setProfileValue } from '../db/database';

const { width } = Dimensions.get('window');

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const c = useColors();
  const { t } = useLang();
  const o = t.onboarding;

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [days, setDays] = useState(4);
  const slideAnim = useState(new Animated.Value(0))[0];

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -16, duration: 120, useNativeDriver: true }),
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
    <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
      {/* Progress dots */}
      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, { backgroundColor: c.border }, i === step && styles.dotActive]} />
        ))}
      </View>

      <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }] }]}>
        {step === 0 && (
          <>
            <Text style={[styles.title, { color: c.text }]}>{o.goal_title}</Text>
            <Text style={[styles.sub, { color: c.text2 }]}>{o.goal_sub}</Text>
            <View style={styles.options}>
              {o.goals.map(g => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.optionCard, { borderColor: c.border, backgroundColor: c.surface2 }, goal === g.id && styles.optionCardActive]}
                  onPress={() => { setGoal(g.id); Haptics.selectionAsync(); }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.optionEmoji}>{g.emoji}</Text>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: c.text }, goal === g.id && styles.optionLabelActive]}>{g.label}</Text>
                    <Text style={[styles.optionSub, { color: c.text3 }]}>{g.sub}</Text>
                  </View>
                  {goal === g.id && <View style={styles.checkDot} />}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={[styles.title, { color: c.text }]}>{o.level_title}</Text>
            <Text style={[styles.sub, { color: c.text2 }]}>{o.level_sub}</Text>
            <View style={styles.options}>
              {o.levels.map(l => (
                <TouchableOpacity
                  key={l.id}
                  style={[styles.optionCard, { borderColor: c.border, backgroundColor: c.surface2 }, level === l.id && styles.optionCardActive]}
                  onPress={() => { setLevel(l.id); Haptics.selectionAsync(); }}
                  activeOpacity={0.75}
                >
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: c.text }, level === l.id && styles.optionLabelActive]}>{l.label}</Text>
                    <Text style={[styles.optionSub, { color: c.text3 }]}>{l.sub}</Text>
                  </View>
                  {level === l.id && <View style={styles.checkDot} />}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={[styles.title, { color: c.text }]}>{o.days_title}</Text>
            <Text style={[styles.sub, { color: c.text2 }]}>{o.days_sub}</Text>
            <View style={styles.daysRow}>
              {[3, 4, 5, 6].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayBtn, { borderColor: c.border, backgroundColor: c.surface2 }, days === d && styles.dayBtnActive]}
                  onPress={() => { setDays(d); Haptics.selectionAsync(); }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.dayNum, { color: c.text3 }, days === d && styles.dayNumActive]}>{d}</Text>
                  <Text style={[styles.dayLabel, { color: c.text3 }, days === d && styles.dayLabelActive]}>days</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.daysHint, { color: c.text2 }]}>{o.days_hints[days]}</Text>
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
          <Text style={styles.primaryBtnText}>{step < 2 ? o.continue : o.start}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 16 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 20, backgroundColor: Colors.green },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6, marginBottom: 8 },
  sub: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.lg },
  options: { gap: Spacing.sm },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5,
  },
  optionCardActive: { borderColor: Colors.green, backgroundColor: Colors.greenSoft },
  optionEmoji: { fontSize: 22 },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '600' },
  optionLabelActive: { color: Colors.greenPressed },
  optionSub: { fontSize: 12, marginTop: 2 },
  checkDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.green },
  daysRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  dayBtn: { flex: 1, aspectRatio: 0.9, borderRadius: Radius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dayBtnActive: { borderColor: Colors.green, backgroundColor: Colors.greenSoft },
  dayNum: { fontSize: 28, fontWeight: '800' },
  dayNumActive: { color: Colors.green },
  dayLabel: { fontSize: 11, fontWeight: '500' },
  dayLabelActive: { color: Colors.greenPressed },
  daysHint: { fontSize: 13, textAlign: 'center', fontStyle: 'italic' },
  footer: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  primaryBtn: {
    backgroundColor: Colors.green, borderRadius: Radius.full, height: 56,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 6,
  },
  primaryBtnDisabled: { backgroundColor: Colors.n300, shadowOpacity: 0 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
