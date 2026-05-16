import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import { useLang } from '../context/LanguageContext';

interface Props {
  visible: boolean;
  onDone: (answers: number[]) => void;
  onSkip: () => void;
}

function DotRating({ value, onChange, c }: { value: number; onChange: (v: number) => void; c: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity
          key={n}
          onPress={() => { onChange(n); Haptics.selectionAsync(); }}
          style={[styles.ratingBtn, { backgroundColor: c.surface2 }, n <= value && styles.ratingBtnActive]}
          activeOpacity={0.7}
        >
          <View style={[styles.ratingDot, { backgroundColor: c.border }, n <= value && styles.ratingDotActive]} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function CheckinScreen({ visible, onDone, onSkip }: Props) {
  const [answers, setAnswers] = useState([0, 0, 0, 0]);
  const c = useColors();
  const { t } = useLang();
  const ci = t.checkin;

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
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onSkip} />
        <View style={[styles.sheet, { backgroundColor: c.surface }]}>
          <View style={[styles.handle, { backgroundColor: c.border }]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: c.text }]}>{ci.greeting}</Text>
            <Text style={[styles.sheetSub, { color: c.text2 }]}>{ci.subtitle}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {ci.questions.map((q, i) => (
              <View key={i} style={styles.questionBlock}>
                <View style={styles.questionHeader}>
                  <View style={[styles.questionIcon, { backgroundColor: c.isDark ? Colors.teal + '22' : Colors.tealSoft }]}>
                    <Text style={{ fontSize: 14 }}>{q.emoji}</Text>
                  </View>
                  <View>
                    <Text style={[styles.questionLabel, { color: c.text }]}>{q.label}</Text>
                    <Text style={[styles.questionHint, { color: c.text3 }]}>{q.hint}</Text>
                  </View>
                </View>
                <DotRating value={answers[i]} onChange={v => set(i, v)} c={c} />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.doneBtn, !allAnswered && styles.doneBtnDisabled]}
              onPress={allAnswered ? handleDone : undefined}
              activeOpacity={0.8}
            >
              <Text style={styles.doneBtnText}>{ci.done}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
              <Text style={[styles.skipBtnText, { color: c.text3 }]}>{ci.skip}</Text>
            </TouchableOpacity>

            <View style={{ height: 16 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,38,0.5)' },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: Spacing.md, paddingTop: 12, maxHeight: '90%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 20,
  },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { marginBottom: 20 },
  sheetTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  sheetSub: { fontSize: 14, marginTop: 4 },
  questionBlock: { marginBottom: 20 },
  questionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  questionIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  questionLabel: { fontSize: 14, fontWeight: '600' },
  questionHint: { fontSize: 11, marginTop: 1 },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingBtn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ratingBtnActive: { backgroundColor: Colors.green },
  ratingDot: { width: 10, height: 10, borderRadius: 5 },
  ratingDotActive: { backgroundColor: '#fff' },
  doneBtn: {
    backgroundColor: Colors.green, borderRadius: Radius.full, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32, shadowRadius: 12, elevation: 4,
  },
  doneBtnDisabled: { backgroundColor: Colors.n300, shadowOpacity: 0 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 14 },
  skipBtnText: { fontSize: 14, fontWeight: '500' },
});
