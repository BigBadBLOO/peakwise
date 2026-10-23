import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Colors } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { Icon } from '../../components/Icon';
import { isBridgeConfigured } from '../../services/claude';
import {
  CoachMode, COACH_GREETING, ADJUST_REQUEST, coachReply,
} from '../../services/programCoach';
import {
  ImportProgram, WorkoutExport, exportProgramData, importProgram, updateProgramPlan,
} from '../../db/workout';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface Turn {
  role: 'user' | 'assistant';
  content: string;          // полный ответ, уходит в стенограмму
  text: string;             // что показываем
  program: ImportProgram | null;
  hidden?: boolean;
}

interface Props {
  navigation: any;
  route: { params?: { programId?: string; programName?: string } };
}

export function ProgramCoachScreen({ navigation, route }: Props) {
  const programId = route.params?.programId;
  const mode: CoachMode = programId ? 'adjust' : 'create';
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { settings } = useSettings();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollRef = useRef<ScrollView>(null);

  const [turns, setTurns] = useState<Turn[]>(
    mode === 'create'
      ? [{ role: 'assistant', content: COACH_GREETING, text: COACH_GREETING, program: null }]
      : [],
  );
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const dataRef = useRef<WorkoutExport | null>(null);

  const ask = useCallback(async (history: Turn[]) => {
    setThinking(true);
    setError(null);
    try {
      if (mode === 'adjust' && !dataRef.current) {
        dataRef.current = await exportProgramData(programId!);
      }
      const reply = await coachReply(
        settings.bridge, mode,
        history.map(t => ({ role: t.role, content: t.content })),
        dataRef.current,
      );
      setTurns([...history, { role: 'assistant', content: reply.raw, text: reply.text, program: reply.program }]);
    } catch (e: any) {
      setTurns(history);
      setError(e.message);
    } finally {
      setThinking(false);
    }
  }, [mode, programId, settings.bridge]);

  useEffect(() => {
    if (!isBridgeConfigured(settings.bridge)) {
      setError('Подписка Claude не подключена. Открой Настройки → AI Provider.');
      return;
    }
    if (mode === 'adjust') {
      const first: Turn[] = [{ role: 'user', content: ADJUST_REQUEST, text: ADJUST_REQUEST, program: null, hidden: true }];
      setTurns(first);
      ask(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text || thinking) return;
    const next: Turn[] = [...turns, { role: 'user', content: text, text, program: null }];
    setTurns(next);
    setInput('');
    ask(next);
  };

  const retry = () => {
    if (turns.length && turns[turns.length - 1].role === 'user') ask(turns);
  };

  const apply = async (program: ImportProgram) => {
    setApplying(true);
    try {
      if (mode === 'adjust') {
        await updateProgramPlan(programId!, program);
        Alert.alert('Готово', 'Программа на следующую неделю обновлена');
        navigation.navigate('Program', { programId, programName: program.name });
      } else {
        const created = await importProgram(program);
        navigation.replace('Program', { programId: created.id, programName: created.name });
      }
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setApplying(false);
    }
  };

  const lastProgramIndex = turns.reduce((acc, t, i) => (t.program ? i : acc), -1);

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.list}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      >
        {turns.filter(t => !t.hidden).map((t, i) => {
          const realIndex = turns.indexOf(t);
          return (
            <View key={i} style={t.role === 'user' ? s.userRow : s.botRow}>
              {!!t.text && (
                <View style={[s.bubble, t.role === 'user' ? s.userBubble : s.botBubble]}>
                  <Text style={t.role === 'user' ? s.userText : s.botText}>{t.text}</Text>
                </View>
              )}
              {t.program && (
                <ProgramPreview
                  program={t.program}
                  latest={realIndex === lastProgramIndex}
                  applying={applying}
                  actionLabel={mode === 'adjust' ? 'Применить на неделю' : 'Создать программу'}
                  onApply={() => apply(t.program!)}
                  s={s}
                  colors={colors}
                />
              )}
            </View>
          );
        })}

        {thinking && (
          <View style={s.botRow}>
            <View style={[s.bubble, s.botBubble, s.thinking]}>
              <ActivityIndicator size="small" color={colors.mint} />
              <Text style={s.thinkingText}>
                {mode === 'adjust' && turns.length <= 1 ? 'Анализирую тренировки…' : 'Думаю…'}
              </Text>
            </View>
          </View>
        )}

        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
            {turns.length > 0 && turns[turns.length - 1].role === 'user' && isBridgeConfigured(settings.bridge) && (
              <TouchableOpacity onPress={retry} style={s.retryBtn}>
                <Icon name="rotate" size={14} color={colors.text} />
                <Text style={s.retryText}>Повторить</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <View style={[s.inputBar, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder={mode === 'adjust' ? 'Например: на этой неделе только 2 тренировки' : 'Напиши ответ…'}
          placeholderTextColor={colors.text4}
          multiline
          editable={!thinking}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || thinking) && s.sendBtnOff]}
          onPress={send}
          disabled={!input.trim() || thinking}
        >
          <Icon name="arrow-up" size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function ProgramPreview({ program, latest, applying, actionLabel, onApply, s, colors }: {
  program: ImportProgram;
  latest: boolean;
  applying: boolean;
  actionLabel: string;
  onApply: () => void;
  s: ReturnType<typeof makeStyles>;
  colors: Colors;
}) {
  return (
    <View style={[s.preview, !latest && s.previewOld]}>
      <Text style={s.previewTitle}>{program.name}</Text>
      {!!program.description && <Text style={s.previewDesc}>{program.description}</Text>}
      {program.days.map((d, di) => (
        <View key={di} style={s.previewDay}>
          <Text style={s.previewDayName}>
            {d.weekday != null ? `${WEEKDAYS[d.weekday]} · ` : ''}{d.name}
          </Text>
          {d.exercises.map((ex, ei) => (
            <Text key={ei} style={s.previewEx}>
              {ex.name} — {formatSets(ex.sets)}
            </Text>
          ))}
        </View>
      ))}
      {latest && (
        <TouchableOpacity style={s.applyBtn} onPress={onApply} disabled={applying}>
          {applying
            ? <ActivityIndicator color="#fff" size="small" />
            : <>
                <Icon name="check" size={16} color="#fff" strokeWidth={2.5} />
                <Text style={s.applyText}>{actionLabel}</Text>
              </>}
        </TouchableOpacity>
      )}
      {!latest && <Text style={s.previewHint}>предыдущий вариант</Text>}
    </View>
  );
}

function formatSets(sets: ImportProgram['days'][number]['exercises'][number]['sets']): string {
  if (!sets.length) return '—';
  const first = sets[0];
  const same = sets.every(x => x.target_reps === first.target_reps && x.target_weight === first.target_weight);
  const one = (x: typeof first) =>
    `${x.target_reps ?? '—'}${x.target_weight != null ? ` × ${x.target_weight} кг` : ''}`;
  return same ? `${sets.length}×${one(first)}` : sets.map(one).join(', ');
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  list: { padding: 16, gap: 10, paddingBottom: 24 },
  userRow: { alignItems: 'flex-end', gap: 8 },
  botRow: { alignItems: 'flex-start', gap: 8 },
  bubble: { maxWidth: '88%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { backgroundColor: c.mint, borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderBottomLeftRadius: 4 },
  userText: { color: '#fff', fontSize: 15, lineHeight: 21 },
  botText: { color: c.text, fontSize: 15, lineHeight: 21 },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  thinkingText: { color: c.text3, fontSize: 14 },

  preview: {
    alignSelf: 'stretch', backgroundColor: c.surface, borderRadius: 16,
    borderWidth: 1.5, borderColor: c.mint, padding: 14, gap: 8,
  },
  previewOld: { borderColor: c.border, opacity: 0.6 },
  previewTitle: { fontSize: 16, fontWeight: '800', color: c.text },
  previewDesc: { fontSize: 13, color: c.text3, marginTop: -4 },
  previewDay: { gap: 2, paddingTop: 6, borderTopWidth: 1, borderTopColor: c.border },
  previewDayName: { fontSize: 14, fontWeight: '700', color: c.mint },
  previewEx: { fontSize: 13, color: c.text2, lineHeight: 19 },
  previewHint: { fontSize: 11, color: c.text4, textAlign: 'center' },
  applyBtn: {
    marginTop: 6, backgroundColor: c.mint, borderRadius: 12, padding: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  applyText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  errorBox: {
    backgroundColor: c.rateForgotSoft, borderRadius: 12, padding: 12, gap: 8,
  },
  errorText: { color: c.rateForgot, fontSize: 13, fontWeight: '600' },
  retryBtn: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: c.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  retryText: { color: c.text, fontSize: 13, fontWeight: '700' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border,
  },
  input: {
    flex: 1, maxHeight: 120, backgroundColor: c.inputBg, borderRadius: 18,
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10,
    color: c.text, fontSize: 15, borderWidth: 1, borderColor: c.border,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: c.mint,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnOff: { opacity: 0.4 },
});
