import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import {
  Exercise, PlannedSet,
  getExercises, createExercise, updateExercise, deleteExercise, reorderExercises,
  getPlannedSets, upsertPlannedSet, deletePlannedSet,
} from '../../db/workout';

interface Props {
  navigation: any;
  route: { params: { dayId: string; dayName: string; programId: string } };
}

interface ExerciseWithSets extends Exercise {
  plannedSets: PlannedSet[];
}

export function DayScreen({ navigation, route }: Props) {
  const { dayId } = route.params;
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [exercises, setExercises] = useState<ExerciseWithSets[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add/Edit exercise modal
  const [exModal, setExModal] = useState(false);
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [exName, setExName] = useState('');
  const [exRest, setExRest] = useState('90');

  // Edit set modal
  const [setModal, setSetModal] = useState(false);
  const [editingSet, setEditingSet] = useState<{ exerciseId: string; setNumber: number; reps: string; weight: string } | null>(null);

  const load = useCallback(async () => {
    const list = await getExercises(dayId);
    const withSets = await Promise.all(list.map(async ex => ({
      ...ex,
      plannedSets: await getPlannedSets(ex.id),
    })));
    setExercises(withSets);
  }, [dayId]);

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const openAddExercise = () => {
    setEditingEx(null);
    setExName('');
    setExRest('90');
    setExModal(true);
  };

  const openEditExercise = (ex: Exercise) => {
    setEditingEx(ex);
    setExName(ex.name);
    setExRest(String(ex.rest_seconds));
    setExModal(true);
  };

  const saveExercise = async () => {
    if (!exName.trim()) return;
    const rest = parseInt(exRest, 10) || 90;
    if (editingEx) {
      await updateExercise(editingEx.id, exName.trim(), rest);
    } else {
      await createExercise(dayId, exName.trim(), rest);
    }
    setExModal(false);
    await load();
  };

  const removeExercise = (ex: Exercise) => {
    Alert.alert('Удалить упражнение?', ex.name, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить', style: 'destructive',
        onPress: async () => { await deleteExercise(ex.id); await load(); },
      },
    ]);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...exercises];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((e, i) => ({ ...e, order_index: i }));
    setExercises(reordered);
    await reorderExercises(reordered);
  };

  const openSetEdit = (exerciseId: string, setNumber: number, existing?: PlannedSet) => {
    setEditingSet({
      exerciseId,
      setNumber,
      reps: existing?.target_reps != null ? String(existing.target_reps) : '',
      weight: existing?.target_weight != null ? String(existing.target_weight) : '',
    });
    setSetModal(true);
  };

  const saveSet = async () => {
    if (!editingSet) return;
    const reps = editingSet.reps ? parseInt(editingSet.reps, 10) : null;
    const weight = editingSet.weight ? parseFloat(editingSet.weight) : null;
    await upsertPlannedSet(editingSet.exerciseId, editingSet.setNumber, reps, weight);
    setSetModal(false);
    await load();
  };

  const removeSet = async (exerciseId: string, setNumber: number) => {
    await deletePlannedSet(exerciseId, setNumber);
    await load();
  };

  const formatRestTime = (s: number) => {
    if (s < 60) return `${s}с`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m}м ${sec}с` : `${m}м`;
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        {exercises.length === 0 && (
          <View style={s.empty}>
            <Icon name="dumbbell" size={40} color={colors.text4} strokeWidth={1.5} />
            <Text style={s.emptyText}>Нет упражнений</Text>
            <Text style={s.emptyHint}>Добавь первое упражнение в этот день</Text>
          </View>
        )}

        {exercises.map((ex, idx) => {
          const expanded = expandedId === ex.id;
          const setCount = ex.plannedSets.length;
          return (
            <View key={ex.id} style={s.exCard}>
              {/* Exercise header */}
              <View style={s.exHeader}>
                <Icon name="drag" size={16} color={colors.text4} />
                <TouchableOpacity style={s.exInfo} onPress={() => setExpandedId(expanded ? null : ex.id)}>
                  <Text style={s.exName}>{ex.name}</Text>
                  <View style={s.exMeta}>
                    <View style={s.restBadge}>
                      <Icon name="clock" size={11} color={colors.text3} />
                      <Text style={s.restText}>{formatRestTime(ex.rest_seconds)}</Text>
                    </View>
                    <Text style={s.setCount}>
                      {setCount === 0 ? 'нет подходов' : `${setCount} подх.`}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={s.exActions}>
                  <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('ExerciseHistory', { exerciseName: ex.name })}>
                    <Icon name="chart-bar" size={15} color={colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.editBtn} onPress={() => openEditExercise(ex)}>
                    <Icon name="edit" size={15} color={colors.text3} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeExercise(ex)}>
                    <Icon name="trash" size={15} color={colors.rateForgot} />
                  </TouchableOpacity>
                  <View style={s.arrowGroup}>
                    <TouchableOpacity
                      style={[s.arrowBtn, idx === 0 && s.arrowOff]}
                      onPress={() => move(idx, -1)} disabled={idx === 0}
                    >
                      <Icon name="chevron-up" size={12} color={idx === 0 ? colors.text4 : colors.text2} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.arrowBtn, idx === exercises.length - 1 && s.arrowOff]}
                      onPress={() => move(idx, 1)} disabled={idx === exercises.length - 1}
                    >
                      <Icon name="chevron-down" size={12} color={idx === exercises.length - 1 ? colors.text4 : colors.text2} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Planned sets */}
              {expanded && (
                <View style={s.setsSection}>
                  {ex.plannedSets.length === 0 ? (
                    <Text style={s.noSetsHint}>Нет запланированных подходов</Text>
                  ) : (
                    <View style={s.setsTable}>
                      <View style={s.setsHeader}>
                        <Text style={[s.setCol, s.setColNum]}>#</Text>
                        <Text style={[s.setCol, { flex: 1 }]}>Повторения</Text>
                        <Text style={[s.setCol, { flex: 1 }]}>Вес (кг)</Text>
                        <Text style={[s.setCol, s.setColAction]} />
                      </View>
                      {ex.plannedSets.map(ps => (
                        <View key={ps.id} style={s.setRow}>
                          <Text style={[s.setCell, s.setColNum]}>{ps.set_number}</Text>
                          <TouchableOpacity
                            style={[s.setCell, { flex: 1 }]}
                            onPress={() => openSetEdit(ex.id, ps.set_number, ps)}
                          >
                            <Text style={s.setCellValue}>
                              {ps.target_reps != null ? `${ps.target_reps} повт` : '—'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[s.setCell, { flex: 1 }]}
                            onPress={() => openSetEdit(ex.id, ps.set_number, ps)}
                          >
                            <Text style={s.setCellValue}>
                              {ps.target_weight != null ? `${ps.target_weight} кг` : '—'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={s.setColAction}
                            onPress={() => removeSet(ex.id, ps.set_number)}
                          >
                            <Icon name="close" size={13} color={colors.text4} strokeWidth={2} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                  <TouchableOpacity
                    style={s.addSetBtn}
                    onPress={() => openSetEdit(ex.id, (ex.plannedSets.length + 1))}
                  >
                    <Icon name="plus" size={14} color={colors.mint} strokeWidth={2.5} />
                    <Text style={s.addSetText}>Добавить подход</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={s.fab}>
        <TouchableOpacity style={s.fabBtn} onPress={openAddExercise} activeOpacity={0.85}>
          <Icon name="plus" size={18} color="#fff" strokeWidth={2.5} />
          <Text style={s.fabText}>Добавить упражнение</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise modal */}
      <Modal visible={exModal} transparent animationType="slide">
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.modal, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={s.modalTitle}>{editingEx ? 'Изменить упражнение' : 'Новое упражнение'}</Text>
            <TextInput
              style={s.input}
              placeholder="Название упражнения"
              placeholderTextColor={colors.text4}
              value={exName}
              onChangeText={setExName}
              autoFocus={!editingEx}
            />
            <View style={s.restRow}>
              <Text style={s.restLabel}>Отдых между подходами</Text>
              <View style={s.restInputWrap}>
                <TextInput
                  style={s.restInput}
                  value={exRest}
                  onChangeText={setExRest}
                  keyboardType="number-pad"
                />
                <Text style={s.restUnit}>сек</Text>
              </View>
            </View>
            <View style={s.restPresets}>
              {[30, 60, 90, 120, 180].map(sec => (
                <TouchableOpacity
                  key={sec}
                  style={[s.presetBtn, exRest === String(sec) && s.presetBtnActive]}
                  onPress={() => setExRest(String(sec))}
                >
                  <Text style={[s.presetText, exRest === String(sec) && s.presetTextActive]}>
                    {formatRestTime(sec)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setExModal(false)}>
                <Text style={s.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, !exName.trim() && s.saveBtnDisabled]}
                onPress={saveExercise}
                disabled={!exName.trim()}
              >
                <Text style={s.saveText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Set modal */}
      <Modal visible={setModal} transparent animationType="slide">
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.modal, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={s.modalTitle}>Подход {editingSet?.setNumber}</Text>
            <View style={s.setInputRow}>
              <View style={s.setInputGroup}>
                <Text style={s.setInputLabel}>Повторения</Text>
                <View style={s.setInputControl}>
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => setEditingSet(prev => prev && {
                      ...prev, reps: String(Math.max(1, (parseInt(prev.reps, 10) || 0) - 1)),
                    })}
                  >
                    <Icon name="minus" size={16} color={colors.text} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <TextInput
                    style={s.setValueInput}
                    value={editingSet?.reps ?? ''}
                    onChangeText={v => setEditingSet(prev => prev && { ...prev, reps: v })}
                    keyboardType="number-pad"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => setEditingSet(prev => prev && {
                      ...prev, reps: String((parseInt(prev.reps, 10) || 0) + 1),
                    })}
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
                    onPress={() => setEditingSet(prev => prev && {
                      ...prev, weight: String(Math.max(0, parseFloat(prev.weight || '0') - 2.5)),
                    })}
                  >
                    <Icon name="minus" size={16} color={colors.text} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <TextInput
                    style={s.setValueInput}
                    value={editingSet?.weight ?? ''}
                    onChangeText={v => setEditingSet(prev => prev && { ...prev, weight: v })}
                    keyboardType="decimal-pad"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => setEditingSet(prev => prev && {
                      ...prev, weight: String(parseFloat(prev.weight || '0') + 2.5),
                    })}
                  >
                    <Icon name="plus" size={16} color={colors.text} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setSetModal(false)}>
                <Text style={s.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={saveSet}>
                <Text style={s.saveText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 18, fontWeight: '700', color: c.text },
  emptyHint: { fontSize: 14, color: c.text4, textAlign: 'center' },

  exCard: {
    backgroundColor: c.surface, borderRadius: 14, marginBottom: 10,
    borderWidth: 1, borderColor: c.border, overflow: 'hidden',
  },
  exHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  exInfo: { flex: 1 },
  exName: { fontSize: 15, fontWeight: '700', color: c.text },
  exMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  restBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  restText: { fontSize: 12, color: c.text3 },
  setCount: { fontSize: 12, color: c.text4 },
  exActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  arrowGroup: { gap: 2 },
  arrowBtn: {
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.surface2, borderRadius: 5,
  },
  arrowOff: { opacity: 0.3 },
  editBtn: { padding: 4 },

  setsSection: { borderTopWidth: 1, borderTopColor: c.border, padding: 12 },
  noSetsHint: { fontSize: 13, color: c.text4, textAlign: 'center', paddingVertical: 8 },
  setsTable: { marginBottom: 10 },
  setsHeader: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: c.border },
  setCol: { fontSize: 11, fontWeight: '700', color: c.text3, textTransform: 'uppercase' },
  setColNum: { width: 28 },
  setColAction: { width: 28, alignItems: 'center', justifyContent: 'center' },
  setRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border + '60',
  },
  setCell: { justifyContent: 'center' },
  setCellValue: { fontSize: 14, color: c.text, fontWeight: '600' },
  addSetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: c.mintSoft, borderRadius: 10, padding: 10,
    justifyContent: 'center',
  },
  addSetText: { color: c.mint, fontWeight: '700', fontSize: 14 },

  fab: { position: 'absolute', bottom: 20, left: 16, right: 16 },
  fabBtn: {
    backgroundColor: c.mint, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: c.mint, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16,
    elevation: 8,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  overlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' },
  modal: {
    backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: c.text },
  input: {
    backgroundColor: c.inputBg, borderRadius: 12, padding: 14,
    color: c.text, fontSize: 15, borderWidth: 1, borderColor: c.border,
  },
  restRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  restLabel: { fontSize: 14, color: c.text3, fontWeight: '600' },
  restInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  restInput: {
    width: 64, backgroundColor: c.inputBg, borderRadius: 10, padding: 10,
    color: c.text, fontSize: 16, fontWeight: '700', textAlign: 'center',
    borderWidth: 1, borderColor: c.border,
  },
  restUnit: { fontSize: 14, color: c.text3 },
  restPresets: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  presetBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    backgroundColor: c.surface2,
  },
  presetBtnActive: { backgroundColor: c.mint },
  presetText: { fontSize: 13, fontWeight: '700', color: c.text3 },
  presetTextActive: { color: '#fff' },

  setInputRow: { flexDirection: 'row', gap: 12 },
  setInputGroup: { flex: 1, gap: 6 },
  setInputLabel: { fontSize: 12, fontWeight: '700', color: c.text3 },
  setInputControl: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.inputBg, borderRadius: 12,
    borderWidth: 1, borderColor: c.border, overflow: 'hidden',
  },
  stepBtn: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
  setValueInput: {
    flex: 1, height: 48, color: c.text, fontSize: 18, fontWeight: '800',
  },

  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: c.surface2, borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: c.text3, fontWeight: '700' },
  saveBtn: { flex: 1, backgroundColor: c.mint, borderRadius: 12, padding: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: '#fff', fontWeight: '700' },
});
