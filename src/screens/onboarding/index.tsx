import React, { useState } from 'react';
import { View, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { setProfileValue } from '../../db/database';
import { PrimaryButton } from '../../components/Themed';
import { GoalStep } from './GoalStep';
import { LevelStep } from './LevelStep';
import { DaysStep } from './DaysStep';

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const o = i18n.onboarding;

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
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bgCard }}>
      <View style={{ flexDirection: 'row', gap: t.spacing.sm, justifyContent: 'center', marginTop: t.spacing.md }}>
        {[0, 1, 2].map(i => (
          <View key={i} style={{ height: 6, borderRadius: t.radius.xs, width: i === step ? 20 : 6, backgroundColor: i === step ? t.colorPrimary : t.borderDefault }} />
        ))}
      </View>

      <Animated.View style={{ flex: 1, paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.xl, transform: [{ translateX: slideAnim }] }}>
        {step === 0 && <GoalStep selected={goal} onSelect={setGoal} />}
        {step === 1 && <LevelStep selected={level} onSelect={setLevel} />}
        {step === 2 && <DaysStep selected={days} onSelect={setDays} />}
      </Animated.View>

      <View style={{ padding: t.spacing.lg, paddingBottom: t.spacing.xl }}>
        <PrimaryButton style={{ height: 56 }} onPress={step < 2 ? goNext : handleFinish} disabled={!canContinue}>
          {step < 2 ? o.continue : o.start}
        </PrimaryButton>
      </View>
    </SafeAreaView>
  );
}
