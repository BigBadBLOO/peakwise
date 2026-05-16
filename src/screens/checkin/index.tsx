import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { PrimaryButton, GhostButton } from '../../components/Themed';
import { DotRating } from './DotRating';

interface Props {
  visible: boolean;
  onDone: (answers: number[]) => void;
  onSkip: () => void;
}

export default function CheckinScreen({ visible, onDone, onSkip }: Props) {
  const [answers, setAnswers] = useState([0, 0, 0, 0]);
  const t = useTokens();
  const { t: i18n } = useLang();
  const ci = i18n.checkin;

  const allAnswered = answers.every(a => a > 0);

  const set = (i: number, v: number) => {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
  };

  const handleDone = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDone(answers);
    setAnswers([0, 0, 0, 0]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15,23,38,0.5)' }} onPress={onSkip} />
        <View style={{ backgroundColor: t.bgCard, borderTopLeftRadius: t.radius.lg, borderTopRightRadius: t.radius.lg, paddingHorizontal: t.spacing.md, paddingTop: t.spacing.inset, maxHeight: '90%', shadowColor: t.shadowSurface, shadowOffset: { width: 0, height: t.shadow.sheet.offsetY }, shadowOpacity: t.shadow.sheet.opacity, shadowRadius: t.shadow.sheet.radius, elevation: t.shadow.sheet.elevation }}>
          <View style={{ width: 40, height: 5, borderRadius: t.radius.xs, backgroundColor: t.borderDefault, alignSelf: 'center', marginBottom: t.spacing.md }} />
          <View style={{ marginBottom: t.spacing.loose }}>
            <Text style={{ fontSize: t.font.size.subheading, fontWeight: t.font.weight.bold, letterSpacing: t.font.tracking.feature, color: t.textPrimary }}>{ci.greeting}</Text>
            <Text style={{ fontSize: t.font.size.base, marginTop: t.spacing.xs, color: t.textSecondary }}>{ci.subtitle}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {ci.questions.map((q, i) => (
              <View key={i} style={{ marginBottom: t.spacing.loose }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.snug, marginBottom: t.spacing.snug }}>
                  <View style={{ width: 32, height: 32, borderRadius: t.radius.sm, backgroundColor: t.colorTealSubtle, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: t.font.size.base }}>{q.emoji}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.semibold, color: t.textPrimary }}>{q.label}</Text>
                    <Text style={{ fontSize: t.font.size.sm, marginTop: t.spacing.xxs, color: t.textTertiary }}>{q.hint}</Text>
                  </View>
                </View>
                <DotRating value={answers[i]} onChange={v => set(i, v)} />
              </View>
            ))}

            <PrimaryButton onPress={allAnswered ? handleDone : undefined} disabled={!allAnswered}>
              {ci.done}
            </PrimaryButton>
            <GhostButton onPress={onSkip}>{ci.skip}</GhostButton>
            <View style={{ height: t.spacing.md }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
