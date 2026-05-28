import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import {
  Exercise, PlannedSet, LoggedSet,
  getExercises, getPlannedSets, logSet, getSessionLogs,
  finishSession, deleteSession, getSessionStats, SessionStats, upsertPlannedSet,
} from '../../db/workout';
import { addXp } from '../../db/stats';

const FEELING_LABELS = ['', 'Легко', 'Нормально', 'Тяжело'];
const FEELING_COLORS = ['', '#3CA86E', '#EC8B2F', '#E0455A'];
const FEELING_BG = ['', '#E8F7F0', '#FDF3E8', '#FDF0F0'];
const WORKOUT_XP = 10;

interface ExerciseWithSets extends Exercise {
  plannedSets: PlannedSet[];
}

interface Props {
  navigation: any;
  route: { params: { sessionId: string; dayId: string; dayName: string } };
}

// ── Stopwatch state per exercise ────────────────────────────────────────────
interface SwState {
  startedAt: number | null;  // null = stopped
  accumulated: number;       // seconds accumulated before current run
  laps: number[];            // lap durations in seconds
  lastLapAt: number;         // seconds at last lap
}

export function ActiveWorkoutScreen({ navigation, route }: Props) {
  const { sessionId, dayId, dayName } = route.params;
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [exercises, setExercises] = useState<ExerciseWithSets[]>([]);
  const [loggedSets, setLoggedSets] = useState<Record<string, LoggedSet[]>>({});

  // Tick every second to update all timers
  const [tick, setTick] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Global workout timer
  const workoutStartRef = useRef(Date.now());

  // Per-exercise stopwatches
  const [swStates, setSwStates] = useState<Record<string, SwState>>({});

  // Rest countdown
  const [restStartAt, setRestStartAt] = useState<number | null>(null);
  const [restDuration, setRestDuration] = useState<number>(90);
  const [restTimerEnabled, setRestTimerEnabled] = useState(true);

  // Set logging modal
  interface SetEdit {
    exerciseId: string;
    exerciseName: string;
    setNumber: number;
    target: PlannedSet | null;
    reps: string;
    weight: string;
    feeling: number;
    swSeconds: number;
  }
  const [setEdit, setSetEdit] = useState<SetEdit | null>(null);

  // Session complete
  const [sessionDone, setSessionDone] = useState(false);
  const [doneStats, setDoneStats] = useState<SessionStats | null>(null);

  // Load exercises
  useEffect(() => {
    (async () => {
      const list = await getExercises(dayId);
      const withSets = await Promise.all(list.map(async ex => ({
        ...ex,
        plannedSets: await getPlannedSets(ex.id),
      })));
      setExercises(withSets);
      const logs = await getSessionLogs(sessionId);
      const byEx: Record<string, LoggedSet[]> = {};
      for (const l of logs) {
        if (!byEx[l.exercise_id ?? l.exercise_name]) byEx[l.exercise_id ?? l.exercise_name] = [];
        byEx[l.exercise_id ?? l.exercise_name].push(l);
      }
      setLoggedSets(byEx);
    })();
  }, [dayId, sessionId]);

  // Start tick
  useEffect(() => {
    tickRef.current = setInterval(() => setTick(t => t + 1), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const globalElapsed = Math.floor((Date.now() - workoutStartRef.current) / 1000);

  const fmtTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s2 = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s2).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s2).padStart(2, '0')}`;
  };

  // Rest timer
  const restRemaining = restStartAt != null
    ? Math.max(0, restDuration - Math.floor((Date.now() - restStartAt) / 1000))
    : null;

  // Auto-dismiss rest timer at 0
  useEffect(() => {
    if (restRemaining === 0) {
      setRestStartAt(null);
    }
  }, [restRemaining]);

  // Stopwatch helpers
  const getSwElapsed = useCallback((exId: string) => {
    const sw = swStates[exId];
    if (!sw) return 0;
    const running = sw.startedAt != null
      ? Math.floor((Date.now() - sw.startedAt) / 1000)
      : 0;
    return sw.accumulated + running;
  }, [swStates, tick]);

  const toggleSw = (exId: string) => {
    setSwStates(prev => {
      const sw = prev[exId] ?? { startedAt: null, accumulated: 0, laps: [], lastLapAt: 0 };
      if (sw.startedAt != null) {
        // Stop
        const elapsed = Math.floor((Date.now() - sw.startedAt) / 1000);
        return { ...prev, [exId]: { ...sw, startedAt: null, accumulated: sw.accumulated + elapsed } };
      } else {
        // Start
        return { ...prev, [exId]: { ...sw, startedAt: Date.now() } };
      }
    });
  };

  const lapSw = (exId: string) => {
    setSwStates(prev => {
      const sw = prev[exId];
      if (!sw || sw.startedAt == null) return prev;
      const totalNow = sw.accumulated + Math.floor((Date.now() - sw.startedAt) / 1000);
      const lapDuration = totalNow - sw.lastLapAt;
      return {
        ...prev,
        [exId]: { ...sw, laps: [...sw.laps, lapDuration], lastLapAt: totalNow },
      };
    });
  };

  const resetSw = (exId: string) => {
    setSwStates(prev => ({
      ...prev,
      [exId]: { startedAt: null, accumulated: 0, laps: [], lastLapAt: 0 },
    }));
  };

  // Open set log modal
  const openSetLog = (ex: ExerciseWithSets, setNumber: number) => {
    const existing = ex.plannedSets.find(ps => ps.set_number === setNumber);
    const already = (loggedSets[ex.id] ?? []).find(ls => ls.set_number === setNumber);
    const sw = swStates[ex.id];
    const swSecs = sw ? getSwElapsed(ex.id) : 0;
    setSetEdit({
      exerciseId: ex.id,
      exerciseName: ex.name,
      setNumber,
      target: existing ?? null,
      reps: already?.reps != null ? String(already.reps) : (existing?.target_reps != null ? String(existing.target_reps) : ''),
      weight: already?.weight != null ? String(already.weight) : (existing?.target_weight != null ? String(existing.target_weight) : ''),
      feeling: already?.feeling ?? 2,
      swSeconds: swSecs,
    });
  };

  const saveSet = async () => {
    if (!setEdit) return;
    const reps = setEdit.reps ? parseInt(setEdit.reps, 10) : null;
    const weight = setEdit.weight ? parseFloat(setEdit.weight) : null;

    const ex = exercises.find(e => e.id === setEdit.exerciseId);
    await logSet(
      sessionId,
      setEdit.exerciseId,
      setEdit.exerciseName,
      setEdit.setNumber,
      reps,
      weight,
      setEdit.feeling,
      setEdit.swSeconds > 0 ? setEdit.swSeconds : null,
    );

    // Refresh logs
    const logs = await getSessionLogs(sessionId);
    const byEx: Record<string, LoggedSet[]> = {};
    for (const l of logs) {
      const key = l.exercise_id ?? l.exercise_name;
      if (!byEx[key]) byEx[key] = [];
      byEx[key].push(l);
    }
    setLoggedSets(byEx);

    // Start rest countdown
    if (restTimerEnabled && ex && ex.rest_seconds > 0) {
      setRestDuration(ex.rest_seconds);
      setRestStartAt(Date.now());
    }

    setSetEdit(null);
  };

  const finishWorkout = async () => {
    Alert.alert('Завершить тренировку?', '', [
      { text: 'Продолжить', style: 'cancel' },
      {
        text: 'Завершить', style: 'default',
        onPress: async () => {
          const durationSecs = globalElapsed;
          await finishSession(sessionId, durationSecs);

          // Sync logged sets back to the program plan so next session has updated weights/reps
          const allLogs = await getSessionLogs(sessionId);
          await Promise.all(
            allLogs
              .filter(l => l.exercise_id != null)
              .map(l => upsertPlannedSet(l.exercise_id!, l.set_number, l.reps, l.weight)),
          );

          await addXp(WORKOUT_XP * exercises.length);
          const stats = await getSessionStats(sessionId);
          setDoneStats(stats);
          setSessionDone(true);
        },
      },
    ]);
  };

  const discardWorkout = () => {
    Alert.alert('Отменить тренировку?', 'Все данные будут удалены', [
      { text: 'Нет', style: 'cancel' },
      {
        text: 'Отменить тренировку', style: 'destructive',
        onPress: async () => {
          await deleteSession(sessionId);
          navigation.goBack();
        },
      },
    ]);
  };

  const getNextSetNumber = (exId: string, plannedCount: number) => {
    const done = (loggedSets[exId] ?? []).length;
    return Math.min(done + 1, Math.max(done + 1, plannedCount + 1));
  };

  if (sessionDone && doneStats) {
    return <SessionCompleteScreen stats={doneStats} dayName={dayName} elapsed={globalElapsed} navigation={navigation} colors={colors} s={s} fmtTime={fmtTime} />;
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBack} onPress={discardWorkout}>
          <Icon name="close" size={20} color={colors.text3} strokeWidth={2} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{dayName}</Text>
          <View style={s.timerRow}>
            <Icon name="stopwatch" size={13} color={colors.mint} />
            <Text style={s.timerText}>{fmtTime(globalElapsed)}</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity
            style={[s.timerToggle, restTimerEnabled && s.timerToggleOn]}
            onPress={() => setRestTimerEnabled(v => !v)}
            activeOpacity={0.75}
          >
            <Icon name="stopwatch" size={14} color={restTimerEnabled ? colors.mint : colors.text4} />
          </TouchableOpacity>
          <TouchableOpacity style={s.finishBtn} onPress={finishWorkout}>
            <Text style={s.finishBtnText}>Готово</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {exercises.map((ex, idx) => {
          const sw = swStates[ex.id] ?? { startedAt: null, accumulated: 0, laps: [], lastLapAt: 0 };
          const swElapsed = getSwElapsed(ex.id);
          const swRunning = sw.startedAt != null;
          const logs = loggedSets[ex.id] ?? [];
          const nextSet = getNextSetNumber(ex.id, ex.plannedSets.length);
          const allDone = logs.length >= Math.max(ex.plannedSets.length, 1);

          return (
            <View key={ex.id} style={[s.exCard, allDone && s.exCardDone]}>
              {/* Exercise header */}
              <View style={s.exHead}>
                <View style={s.exNumBadge}>
                  {allDone
                    ? <Icon name="check" size={14} color={colors.mint} strokeWidth={2.5} />
                    : <Text style={s.exNumText}>{idx + 1}</Text>
                  }
                </View>
                <View style={s.exHeadInfo}>
                  <Text style={s.exName}>{ex.name}</Text>
                  <View style={s.restInfo}>
                    <Icon name="clock" size={11} color={colors.text4} />
                    <Text style={s.restHint}>отдых {ex.rest_seconds}с</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={s.historyBtn}
                  onPress={() => navigation.navigate('ExerciseHistory', { exerciseName: ex.name })}
                >
                  <Icon name="chart-bar" size={16} color={colors.accent} />
                </TouchableOpacity>
              </View>

              {/* Stopwatch (timer a) */}
              <View style={s.stopwatchSection}>
                <Text style={[s.swDisplay, swRunning && { color: colors.mint }]}>
                  {fmtTime(swElapsed)}
                </Text>
                <View style={s.swBtns}>
                  <TouchableOpacity style={[s.swBtn, swRunning && s.swBtnActive]} onPress={() => toggleSw(ex.id)}>
                    <Icon name={swRunning ? 'pause' : 'play'} size={14} color={swRunning ? '#fff' : colors.mint} strokeWidth={2} />
                    <Text style={[s.swBtnText, swRunning && { color: '#fff' }]}>
                      {swRunning ? 'Стоп' : 'Старт'}
                    </Text>
                  </TouchableOpacity>
                  {swRunning && (
                    <TouchableOpacity style={s.swLapBtn} onPress={() => lapSw(ex.id)}>
                      <Icon name="lap" size={14} color={colors.accent} strokeWidth={1.8} />
                      <Text style={s.swLapText}>Круг</Text>
                    </TouchableOpacity>
                  )}
                  {swElapsed > 0 && !swRunning && (
                    <TouchableOpacity style={s.swResetBtn} onPress={() => resetSw(ex.id)}>
                      <Icon name="rotate" size={13} color={colors.text4} />
                    </TouchableOpacity>
                  )}
                </View>
                {sw.laps.length > 0 && (
                  <View style={s.lapsList}>
                    {sw.laps.map((lap, li) => (
                      <Text key={li} style={s.lapItem}>Круг {li + 1}: {fmtTime(lap)}</Text>
                    ))}
                  </View>
                )}
              </View>

              {/* Sets table */}
              <View style={s.setsSection}>
                {/* Header */}
                <View style={s.setsHead}>
                  <Text style={[s.shCol, s.shNum]}>#</Text>
                  <Text style={[s.shCol, { flex: 1 }]}>Цель</Text>
                  <Text style={[s.shCol, s.shReps]}>Повт</Text>
                  <Text style={[s.shCol, s.shWeight]}>Вес</Text>
                  <Text style={[s.shCol, s.shFeeling]}>Ощущ.</Text>
                  <View style={s.shDone} />
                </View>

                {/* Planned + logged rows */}
                {Array.from({ length: Math.max(ex.plannedSets.length, logs.length, nextSet) }, (_, i) => {
                  const setNum = i + 1;
                  const planned = ex.plannedSets.find(ps => ps.set_number === setNum);
                  const logged = logs.find(l => l.set_number === setNum);
                  const isCurrent = setNum === nextSet && !logged;
                  const isDone = !!logged;

                  return (
                    <View key={setNum} style={[s.setRow, isCurrent && s.setRowCurrent, isDone && s.setRowDone]}>
                      <Text style={[s.srCol, s.shNum, isDone && s.srDoneText]}>{setNum}</Text>
                      <Text style={[s.srCol, { flex: 1 }, isDone && s.srDoneText]}>
                        {planned
                          ? [planned.target_reps && `${planned.target_reps}пов`, planned.target_weight && `${planned.target_weight}кг`].filter(Boolean).join(' / ') || '—'
                          : '—'}
                      </Text>
                      <Text style={[s.srCol, s.shReps, isDone && s.srDoneText]}>
                        {logged?.reps != null ? logged.reps : (isCurrent ? '—' : '')}
                      </Text>
                      <Text style={[s.srCol, s.shWeight, isDone && s.srDoneText]}>
                        {logged?.weight != null ? logged.weight : (isCurrent ? '—' : '')}
                      </Text>
                      <View style={s.shFeeling}>
                        {logged ? (
                          <View style={[s.feelingDot, { backgroundColor: FEELING_BG[logged.feeling] }]}>
                            <Text style={[s.feelingDotText, { color: FEELING_COLORS[logged.feeling] }]}>
                              {FEELING_LABELS[logged.feeling][0]}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        style={[s.shDone, isDone && s.loggedBtn]}
                        onPress={() => openSetLog(ex, setNum)}
                      >
                        {isDone
                          ? <Icon name="edit" size={13} color={colors.text4} />
                          : <View style={[s.logBtn, isCurrent && s.logBtnActive]}>
                              <Icon name="check" size={13} color={isCurrent ? '#fff' : colors.text4} strokeWidth={2.5} />
                            </View>
                        }
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {/* Add extra set */}
                <TouchableOpacity style={s.addSetRow} onPress={() => openSetLog(ex, (logs.length + 1))}>
                  <Icon name="plus" size={13} color={colors.text4} strokeWidth={2} />
                  <Text style={s.addSetText}>Ещё подход</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={s.bottomFinish} onPress={finishWorkout}>
          <Icon name="check" size={18} color="#fff" strokeWidth={2.5} />
          <Text style={s.bottomFinishText}>Завершить тренировку</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Rest timer overlay */}
      <Modal visible={restRemaining != null && restRemaining > 0} transparent animationType="slide">
        <View style={s.restOverlay}>
          <View style={[s.restSheet, { paddingBottom: insets.bottom + 28 }]}>
            <Text style={s.restLabel}>Отдых</Text>
            <Text style={s.restCountdown}>{fmtTime(restRemaining ?? 0)}</Text>
            <View style={s.restProgressTrack}>
              <View style={[s.restProgressFill, {
                width: restStartAt
                  ? `${Math.max(0, (restRemaining ?? 0) / restDuration * 100)}%` as any
                  : '100%',
              }]} />
            </View>
            <View style={s.restBtns}>
              <TouchableOpacity
                style={s.restAddBtn}
                onPress={() => setRestStartAt(prev => prev ? prev - 30000 : null)}
              >
                <Text style={s.restAddText}>+30с</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.restSkipBtn} onPress={() => setRestStartAt(null)}>
                <Text style={s.restSkipText}>Пропустить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Set logging modal */}
      <Modal visible={!!setEdit} transparent animationType="slide">
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.modal, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={s.modalTitle}>
              {setEdit?.exerciseName} · Подход {setEdit?.setNumber}
            </Text>
            {setEdit?.target && (
              <Text style={s.modalHint}>
                Цель: {[
                  setEdit.target.target_reps && `${setEdit.target.target_reps} повт`,
                  setEdit.target.target_weight && `${setEdit.target.target_weight} кг`,
                ].filter(Boolean).join(' / ')}
              </Text>
            )}

            {/* Reps + Weight */}
            <View style={s.setInputRow}>
              <View style={s.setInputGroup}>
                <Text style={s.setInputLabel}>Повторения</Text>
                <View style={s.setInputControl}>
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => setSetEdit(p => p && { ...p, reps: String(Math.max(0, (parseInt(p.reps, 10) || 0) - 1)) })}
                  >
                    <Icon name="minus" size={16} color={colors.text} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <TextInput
                    style={s.setValueInput}
                    value={setEdit?.reps ?? ''}
                    onChangeText={v => setSetEdit(p => p && { ...p, reps: v })}
                    keyboardType="number-pad"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => setSetEdit(p => p && { ...p, reps: String((parseInt(p.reps, 10) || 0) + 1) })}
                  >
                    <Icon name="plus" size={16} color={colors.text} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={s.setInputGroup}>
                <Text style={s.setInputLabel}>Вес (кг)</Text>
                <View style={s.setInputControl}>
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => setSetEdit(p => p && { ...p, weight: String(Math.max(0, parseFloat(p.weight || '0') - 2.5)) })}
                  >
                    <Icon name="minus" size={16} color={colors.text} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <TextInput
                    style={s.setValueInput}
                    value={setEdit?.weight ?? ''}
                    onChangeText={v => setSetEdit(p => p && { ...p, weight: v })}
                    keyboardType="decimal-pad"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => setSetEdit(p => p && { ...p, weight: String(parseFloat(p.weight || '0') + 2.5) })}
                  >
                    <Icon name="plus" size={16} color={colors.text} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Feeling */}
            <Text style={s.setInputLabel}>Ощущения</Text>
            <View style={s.feelingRow}>
              {[1, 2, 3].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    s.feelingBtn,
                    { borderColor: FEELING_COLORS[f] },
                    setEdit?.feeling === f && { backgroundColor: FEELING_COLORS[f] },
                  ]}
                  onPress={() => setSetEdit(p => p && { ...p, feeling: f })}
                >
                  <Text style={[s.feelingBtnText, setEdit?.feeling === f && { color: '#fff' }]}>
                    {FEELING_LABELS[f]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setSetEdit(null)}>
                <Text style={s.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={saveSet}>
                <Icon name="check" size={16} color="#fff" strokeWidth={2.5} />
                <Text style={s.saveText}>Записать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Session Complete ────────────────────────────────────────────────────────
function SessionCompleteScreen({
  stats, dayName, elapsed, navigation, colors, s, fmtTime,
}: {
  stats: SessionStats;
  dayName: string;
  elapsed: number;
  navigation: any;
  colors: any;
  s: any;
  fmtTime: (n: number) => string;
}) {
  return (
    <SafeAreaView style={[s.container, { justifyContent: 'center', padding: 24 }]} edges={['top']}>
      <View style={s.doneCard}>
        <Icon name="trophy" size={48} color={colors.peak} strokeWidth={1.5} />
        <Text style={s.doneTitle}>Тренировка завершена!</Text>
        <Text style={s.doneSub}>{dayName}</Text>

        <View style={s.doneGrid}>
          <View style={s.doneStat}>
            <Text style={s.doneStatNum}>{fmtTime(elapsed)}</Text>
            <Text style={s.doneStatLbl}>Время</Text>
          </View>
          <View style={s.doneStatDiv} />
          <View style={s.doneStat}>
            <Text style={s.doneStatNum}>{stats.totalSets}</Text>
            <Text style={s.doneStatLbl}>Подходов</Text>
          </View>
          <View style={s.doneStatDiv} />
          <View style={s.doneStat}>
            <Text style={s.doneStatNum}>{stats.totalReps}</Text>
            <Text style={s.doneStatLbl}>Повторений</Text>
          </View>
        </View>

        {stats.totalVolume > 0 && (
          <View style={s.volumeBlock}>
            <Text style={s.volumeNum}>{stats.totalVolume.toLocaleString('ru-RU')} кг</Text>
            <Text style={s.volumeLbl}>общий объём</Text>
          </View>
        )}

        <TouchableOpacity style={s.doneBtn} onPress={() => navigation.popToTop()}>
          <Text style={s.doneBtnText}>Закрыть</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  headerBack: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: c.text },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  timerText: { fontSize: 13, fontWeight: '700', color: c.mint },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerToggle: {
    width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.surface2, borderWidth: 1, borderColor: c.border,
  },
  timerToggleOn: { backgroundColor: c.mintSoft, borderColor: c.mint },
  finishBtn: {
    backgroundColor: c.mint, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  finishBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  content: { padding: 12, paddingBottom: 40 },

  // Exercise card
  exCard: {
    backgroundColor: c.surface, borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: c.border, overflow: 'hidden',
  },
  exCardDone: { borderColor: c.mint + '60', backgroundColor: c.mintSoft + '50' },
  exHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  exNumBadge: {
    width: 28, height: 28, borderRadius: 99,
    backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center',
  },
  exNumText: { fontSize: 13, fontWeight: '800', color: c.text3 },
  exHeadInfo: { flex: 1 },
  historyBtn: { padding: 6 },
  exName: { fontSize: 16, fontWeight: '700', color: c.text },
  restInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  restHint: { fontSize: 12, color: c.text4 },

  // Stopwatch
  stopwatchSection: {
    borderTopWidth: 1, borderTopColor: c.border,
    padding: 12, backgroundColor: c.bg + '80',
  },
  swDisplay: { fontSize: 32, fontWeight: '800', color: c.text, textAlign: 'center', letterSpacing: 1 },
  swBtns: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 8 },
  swBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: c.mintSoft, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  swBtnActive: { backgroundColor: c.mint },
  swBtnText: { fontSize: 14, fontWeight: '700', color: c.mint },
  swLapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: c.accentSurface, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  swLapText: { fontSize: 14, fontWeight: '700', color: c.accent },
  swResetBtn: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.surface2, borderRadius: 10,
  },
  lapsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, justifyContent: 'center' },
  lapItem: { fontSize: 12, color: c.text3, backgroundColor: c.surface2, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },

  // Sets table
  setsSection: { borderTopWidth: 1, borderTopColor: c.border, padding: 12 },
  setsHead: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: c.border },
  shCol: { fontSize: 11, fontWeight: '700', color: c.text3, textTransform: 'uppercase' },
  shNum: { width: 24 },
  shReps: { width: 50, textAlign: 'center' },
  shWeight: { width: 58, textAlign: 'center' },
  shFeeling: { width: 40, alignItems: 'center', justifyContent: 'center' },
  shDone: { width: 32, alignItems: 'center', justifyContent: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderRadius: 8, marginVertical: 1 },
  setRowCurrent: { backgroundColor: c.mintSoft + '80' },
  setRowDone: { opacity: 0.7 },
  srCol: { fontSize: 14, color: c.text, fontWeight: '600' },
  srDoneText: { color: c.text3 },
  feelingDot: { width: 24, height: 24, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  feelingDotText: { fontSize: 10, fontWeight: '800' },
  loggedBtn: { opacity: 0.6 },
  logBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' },
  logBtnActive: { backgroundColor: c.mint },
  addSetRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 8, marginTop: 4, borderTopWidth: 1, borderTopColor: c.border + '40' },
  addSetText: { fontSize: 13, color: c.text4 },

  // Rest timer
  restOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  restSheet: {
    backgroundColor: c.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, alignItems: 'center', gap: 12,
  },
  restLabel: { fontSize: 14, fontWeight: '700', color: c.text3, textTransform: 'uppercase', letterSpacing: 1 },
  restCountdown: { fontSize: 64, fontWeight: '800', color: c.text, letterSpacing: -2 },
  restProgressTrack: { width: '100%', height: 6, backgroundColor: c.border, borderRadius: 99, overflow: 'hidden' },
  restProgressFill: { height: 6, backgroundColor: c.mint, borderRadius: 99 },
  restBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  restAddBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: c.surface2, alignItems: 'center',
  },
  restAddText: { fontSize: 16, fontWeight: '700', color: c.text3 },
  restSkipBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 14,
    backgroundColor: c.mint, alignItems: 'center',
  },
  restSkipText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Set logging modal
  overlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' },
  modal: {
    backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, gap: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: c.text },
  modalHint: { fontSize: 13, color: c.text3, marginTop: -4 },
  setInputRow: { flexDirection: 'row', gap: 12 },
  setInputGroup: { flex: 1, gap: 6 },
  setInputLabel: { fontSize: 12, fontWeight: '700', color: c.text3 },
  setInputControl: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.inputBg, borderRadius: 12,
    borderWidth: 1, borderColor: c.border, overflow: 'hidden',
  },
  stepBtn: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
  setValueInput: { flex: 1, height: 48, color: c.text, fontSize: 18, fontWeight: '800' },
  feelingRow: { flexDirection: 'row', gap: 8 },
  feelingBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 2, alignItems: 'center',
  },
  feelingBtnText: { fontSize: 13, fontWeight: '700', color: c.text3 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: c.surface2, borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: c.text3, fontWeight: '700' },
  saveBtn: { flex: 2, backgroundColor: c.mint, borderRadius: 12, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Bottom finish button
  bottomFinish: {
    backgroundColor: c.mint, borderRadius: 16, padding: 18, marginTop: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: c.mint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12,
    elevation: 6,
  },
  bottomFinishText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Session complete
  doneCard: {
    backgroundColor: c.surface, borderRadius: 24, padding: 28,
    alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: c.border,
  },
  doneTitle: { fontSize: 22, fontWeight: '800', color: c.text },
  doneSub: { fontSize: 14, color: c.text3 },
  doneGrid: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  doneStat: { flex: 1, alignItems: 'center', gap: 4 },
  doneStatNum: { fontSize: 22, fontWeight: '800', color: c.text },
  doneStatLbl: { fontSize: 12, color: c.text4, fontWeight: '600' },
  doneStatDiv: { width: 1, height: 40, backgroundColor: c.border },
  volumeBlock: { backgroundColor: c.mintSoft, borderRadius: 14, padding: 14, alignItems: 'center', width: '100%' },
  volumeNum: { fontSize: 24, fontWeight: '800', color: c.mint },
  volumeLbl: { fontSize: 12, color: c.mint, fontWeight: '600' },
  doneBtn: {
    backgroundColor: c.mint, borderRadius: 14, padding: 16,
    width: '100%', alignItems: 'center', marginTop: 8,
  },
  doneBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
