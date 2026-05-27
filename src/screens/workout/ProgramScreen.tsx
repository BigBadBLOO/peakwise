import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Alert, Modal, TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import {
  WorkoutDay, Exercise, getDays, createDay, deleteDay, reorderDays,
  getExercises, createSession,
} from '../../db/workout';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface Props {
  navigation: any;
  route: { params: { programId: string; programName: string } };
}

export function ProgramScreen({ navigation, route }: Props) {
  const { programId } = route.params;
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [exerciseCounts, setExerciseCounts] = useState<Record<string, number>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newDayName, setNewDayName] = useState('');
  const [selectedWeekday, setSelectedWeekday] = useState<number | null>(null);

  const load = useCallback(async () => {
    const list = await getDays(programId);
    setDays(list);
    const counts: Record<string, number> = {};
    await Promise.all(list.map(async d => {
      const exs = await getExercises(d.id);
      counts[d.id] = exs.length;
    }));
    setExerciseCounts(counts);
  }, [programId]);

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const openAdd = () => {
    setNewDayName('');
    setSelectedWeekday(null);
    setModalVisible(true);
  };

  const save = async () => {
    if (!newDayName.trim()) return;
    await createDay(programId, newDayName.trim(), selectedWeekday);
    setModalVisible(false);
    await load();
  };

  const remove = (day: WorkoutDay) => {
    Alert.alert('Удалить день', `Удалить "${day.name}" и все упражнения?`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await deleteDay(day.id); await load(); } },
    ]);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...days];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((d, i) => ({ ...d, order_index: i }));
    setDays(reordered);
    await reorderDays(reordered);
  };

  const startWorkout = async (day: WorkoutDay) => {
    const session = await createSession(route.params.programId, day.id, day.name);
    navigation.navigate('ActiveWorkout', { sessionId: session.id, dayId: day.id, dayName: day.name });
  };

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <FlatList
        data={days}
        keyExtractor={d => d.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Icon name="calendar" size={40} color={colors.text4} />
            <Text style={s.emptyText}>Нет дней</Text>
            <Text style={s.emptyHint}>Добавь тренировочный день</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const exCount = exerciseCounts[item.id] ?? 0;
          return (
            <View style={s.dayCard}>
              {/* Top row: drag + info + arrows */}
              <View style={s.dayMain}>
                <TouchableOpacity style={s.dragArea} onPress={() => {}}>
                  <Icon name="drag" size={16} color={colors.text4} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.dayInfo}
                  onPress={() => navigation.navigate('Day', { dayId: item.id, dayName: item.name, programId })}
                  onLongPress={() => remove(item)}
                  activeOpacity={0.8}
                >
                  <View style={s.dayNameRow}>
                    <Text style={s.dayName}>{item.name}</Text>
                    {item.weekday !== null && (
                      <View style={s.weekdayChip}>
                        <Text style={s.weekdayText}>{WEEKDAYS[item.weekday]}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.dayMeta}>
                    {exCount === 0 ? 'Нет упражнений' : `${exCount} упр.`}
                  </Text>
                </TouchableOpacity>

                <View style={s.arrowGroup}>
                  <TouchableOpacity
                    style={[s.arrowBtn, index === 0 && s.arrowBtnOff]}
                    onPress={() => move(index, -1)}
                    disabled={index === 0}
                  >
                    <Icon name="chevron-up" size={13} color={index === 0 ? colors.text4 : colors.text2} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.arrowBtn, index === days.length - 1 && s.arrowBtnOff]}
                    onPress={() => move(index, 1)}
                    disabled={index === days.length - 1}
                  >
                    <Icon name="chevron-down" size={13} color={index === days.length - 1 ? colors.text4 : colors.text2} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Start button row */}
              {exCount > 0 && (
                <TouchableOpacity style={s.startBtn} onPress={() => startWorkout(item)}>
                  <Icon name="play" size={13} color="#fff" />
                  <Text style={s.startBtnText}>Начать тренировку</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

      <View style={s.fab}>
        <TouchableOpacity style={s.fabBtn} onPress={openAdd} activeOpacity={0.85}>
          <Icon name="plus" size={18} color="#fff" strokeWidth={2.5} />
          <Text style={s.fabText}>Добавить день</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={[s.overlay, { paddingBottom: insets.bottom }]}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Новый тренировочный день</Text>
            <TextInput
              style={s.input}
              placeholder="Название дня (напр. «День A» или «Грудь»)"
              placeholderTextColor={colors.text4}
              value={newDayName}
              onChangeText={setNewDayName}
              autoFocus
            />
            <Text style={s.inputLabel}>День недели (необязательно)</Text>
            <View style={s.weekdayRow}>
              {WEEKDAYS.map((wd, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.wdBtn, selectedWeekday === i && s.wdBtnActive]}
                  onPress={() => setSelectedWeekday(selectedWeekday === i ? null : i)}
                >
                  <Text style={[s.wdBtnText, selectedWeekday === i && s.wdBtnTextActive]}>{wd}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, !newDayName.trim() && s.saveBtnDisabled]}
                onPress={save}
                disabled={!newDayName.trim()}
              >
                <Text style={s.saveText}>Добавить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  list: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 18, fontWeight: '700', color: c.text },
  emptyHint: { fontSize: 14, color: c.text4 },
  dayCard: {
    backgroundColor: c.surface, borderRadius: 14, marginBottom: 10,
    borderWidth: 1, borderColor: c.border, overflow: 'hidden',
  },
  dayMain: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  dragArea: { padding: 4 },
  dayInfo: { flex: 1 },
  dayNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayName: { fontSize: 16, fontWeight: '700', color: c.text },
  weekdayChip: {
    backgroundColor: c.mintSoft, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  weekdayText: { fontSize: 11, fontWeight: '700', color: c.mint },
  dayMeta: { fontSize: 12, color: c.text4, marginTop: 3 },
  arrowGroup: { gap: 2 },
  arrowBtn: {
    width: 26, height: 26, alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.surface2, borderRadius: 6,
  },
  arrowBtnOff: { opacity: 0.3 },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: c.mint,
    borderTopWidth: 1, borderTopColor: c.mint + '40',
    paddingVertical: 11,
  },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
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
  inputLabel: { fontSize: 12, fontWeight: '700', color: c.text3, marginBottom: -4 },
  input: {
    backgroundColor: c.inputBg, borderRadius: 12, padding: 14,
    color: c.text, fontSize: 15, borderWidth: 1, borderColor: c.border,
  },
  weekdayRow: { flexDirection: 'row', gap: 6 },
  wdBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: c.surface2, alignItems: 'center',
  },
  wdBtnActive: { backgroundColor: c.mint },
  wdBtnText: { fontSize: 12, fontWeight: '700', color: c.text3 },
  wdBtnTextActive: { color: '#fff' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: c.surface2, borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: c.text3, fontWeight: '700' },
  saveBtn: { flex: 1, backgroundColor: c.mint, borderRadius: 12, padding: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: '#fff', fontWeight: '700' },
});
