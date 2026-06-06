import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Alert, ActivityIndicator, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import {
  Habit, getHabits, getArchivedHabits, createHabit, archiveHabit, deleteHabit,
  restoreHabit, approveHabit, unapproveHabit, getAllHabitsStats, getLocalDateString,
} from '../../db/habits';
import { HabitDetailScreen } from './HabitDetailScreen';

export type HabitsParamList = {
  HabitsList: undefined;
  HabitDetail: { habitId: string; habitName: string };
  ArchivedHabits: undefined;
};

const Stack = createNativeStackNavigator<HabitsParamList>();

export function HabitsScreen() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.tabBg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="HabitsList" component={HabitsListScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="HabitDetail"
        component={HabitDetailScreen}
        options={({ route }) => ({ title: (route.params as any).habitName })}
      />
      <Stack.Screen
        name="ArchivedHabits"
        component={ArchivedHabitsScreen}
        options={{ title: 'Архив привычек' }}
      />
    </Stack.Navigator>
  );
}

// ─── HabitsListScreen ─────────────────────────────────────────────────────────

function HabitsListScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<Record<string, { streak: number; total: number; approvedToday: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [habitName, setHabitName] = useState('');

  const today = useMemo(() => getLocalDateString(), []);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, st] = await Promise.all([getHabits(), getAllHabitsStats(today)]);
    setHabits(list);
    setStats(st);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const openAdd = () => { setHabitName(''); setModalVisible(true); };

  const saveHabit = async () => {
    if (!habitName.trim()) return;
    await createHabit(habitName.trim());
    setModalVisible(false);
    load();
  };

  const handleApprove = async (habitId: string, approvedToday: boolean) => {
    if (approvedToday) {
      await unapproveHabit(habitId, today);
    } else {
      await approveHabit(habitId, today);
    }
    load();
  };

  const handleLongPress = (habit: Habit) => {
    Alert.alert(habit.name, undefined, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Архивировать',
        onPress: async () => { await archiveHabit(habit.id); load(); },
      },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Удалить привычку', `Удалить "${habit.name}" и всю историю?`, [
            { text: 'Отмена', style: 'cancel' },
            {
              text: 'Удалить',
              style: 'destructive',
              onPress: async () => { await deleteHabit(habit.id); load(); },
            },
          ]);
        },
      },
    ]);
  };

  const approvedCount = habits.filter(h => stats[h.id]?.approvedToday).length;

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <LinearGradient
        colors={[colors.isDark ? '#162A1E' : '#EBF7F2', colors.isDark ? '#0F0D17' : '#FAF8F2']}
        style={s.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={s.heroRow}>
          <View>
            <Text style={s.heroTitle}>Привычки</Text>
            <Text style={s.heroSub}>
              {habits.length === 0
                ? 'Нет привычек'
                : `${approvedCount} из ${habits.length} выполнено сегодня`}
            </Text>
          </View>
          <TouchableOpacity
            style={s.archiveIconBtn}
            onPress={() => navigation.navigate('ArchivedHabits')}
          >
            <Icon name="archive" size={18} color={colors.text3} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={habits}
        keyExtractor={h => h.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Icon name="habits" size={40} color={colors.text4} />
            <Text style={s.emptyText}>Нет привычек</Text>
            <Text style={s.emptyHint}>Добавь первую привычку</Text>
          </View>
        }
        renderItem={({ item }) => {
          const st = stats[item.id] ?? { streak: 0, total: 0, approvedToday: false };
          return (
            <TouchableOpacity
              style={s.habitCard}
              onPress={() => navigation.navigate('HabitDetail', { habitId: item.id, habitName: item.name })}
              onLongPress={() => handleLongPress(item)}
              activeOpacity={0.8}
            >
              <View style={s.habitMain}>
                <Text style={s.habitName} numberOfLines={1}>{item.name}</Text>
                <View style={s.badges}>
                  <View style={s.badge}>
                    <Icon name="flame" size={12} color={colors.peak} />
                    <Text style={s.badgeText}>{st.streak}</Text>
                  </View>
                  <View style={s.badge}>
                    <Icon name="check" size={12} color={colors.mint} />
                    <Text style={s.badgeText}>{st.total}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[s.approveBtn, st.approvedToday && s.approveBtnActive]}
                onPress={() => handleApprove(item.id, st.approvedToday)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="check" size={20} color={st.approvedToday ? '#fff' : colors.text4} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />

      <View style={[s.fab, { bottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={s.fabBtn} onPress={openAdd} activeOpacity={0.85}>
          <Icon name="plus" size={18} color="#fff" strokeWidth={2.5} />
          <Text style={s.fabText}>Новая привычка</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.modal, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={s.modalTitle}>Новая привычка</Text>
            <TextInput
              style={s.input}
              placeholder="Название привычки"
              placeholderTextColor={colors.text4}
              value={habitName}
              onChangeText={setHabitName}
              autoFocus
              onSubmitEditing={saveHabit}
            />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, !habitName.trim() && s.saveBtnDisabled]}
                onPress={saveHabit}
                disabled={!habitName.trim()}
              >
                <Text style={s.saveText}>Добавить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── ArchivedHabitsScreen ─────────────────────────────────────────────────────

function ArchivedHabitsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await getArchivedHabits();
    setHabits(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const handleRestore = async (habit: Habit) => {
    await restoreHabit(habit.id);
    load();
  };

  const handleDelete = (habit: Habit) => {
    Alert.alert('Удалить привычку', `Удалить "${habit.name}" навсегда?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => { await deleteHabit(habit.id); load(); },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={habits}
      keyExtractor={h => h.id}
      contentContainerStyle={s.list}
      ListEmptyComponent={
        <View style={s.empty}>
          <Icon name="archive" size={40} color={colors.text4} />
          <Text style={s.emptyText}>Архив пуст</Text>
          <Text style={s.emptyHint}>Архивированные привычки появятся здесь</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={s.habitCard}>
          <View style={s.habitMain}>
            <Text style={[s.habitName, { color: colors.text3 }]} numberOfLines={1}>{item.name}</Text>
            <Text style={s.archivedDate}>
              Архив: {new Date(item.archived_at!).toLocaleDateString('ru-RU')}
            </Text>
          </View>
          <View style={s.archiveActions}>
            <TouchableOpacity style={s.restoreBtn} onPress={() => handleRestore(item)}>
              <Text style={s.restoreBtnText}>Восстановить</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.deleteIconBtn} onPress={() => handleDelete(item)}>
              <Icon name="trash" size={16} color={colors.rateForgot} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg },
  hero: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroTitle: { fontSize: 28, fontWeight: '800', color: c.text, letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: c.text3, marginTop: 2 },
  archiveIconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center',
  },
  list: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 18, fontWeight: '700', color: c.text },
  emptyHint: { fontSize: 14, color: c.text4 },
  habitCard: {
    backgroundColor: c.surface, borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: c.border, flexDirection: 'row', alignItems: 'center',
  },
  habitMain: { flex: 1, marginRight: 4 },
  habitName: { fontSize: 16, fontWeight: '700', color: c.text },
  badges: { flexDirection: 'row', gap: 6, marginTop: 6 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: c.surface2, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: c.text2 },
  approveBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: c.border,
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  approveBtnActive: { backgroundColor: c.mint, borderColor: c.mint },
  fab: { position: 'absolute', left: 16, right: 16 },
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
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, backgroundColor: c.surface2, borderRadius: 12, padding: 14, alignItems: 'center',
  },
  cancelText: { color: c.text3, fontWeight: '700' },
  saveBtn: { flex: 1, backgroundColor: c.mint, borderRadius: 12, padding: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: '#fff', fontWeight: '700' },
  archivedDate: { fontSize: 12, color: c.text4, marginTop: 3 },
  archiveActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  restoreBtn: {
    backgroundColor: c.accentSurface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  restoreBtnText: { color: c.accent, fontWeight: '700', fontSize: 12 },
  deleteIconBtn: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: c.rateForgotSoft, alignItems: 'center', justifyContent: 'center',
  },
});
