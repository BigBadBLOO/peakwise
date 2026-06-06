import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Alert, Modal, TextInput, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import {
  Program, getPrograms, createProgram, deleteProgram, getProgramStats,
  exportWorkoutData, importProgram, ImportProgram,
} from '../../db/workout';
import { ProgramScreen } from './ProgramScreen';
import { DayScreen } from './DayScreen';
import { ActiveWorkoutScreen } from './ActiveWorkoutScreen';
import { ExerciseHistoryScreen } from './ExerciseHistoryScreen';

export type WorkoutParamList = {
  Programs: undefined;
  Program: { programId: string; programName: string };
  Day: { dayId: string; dayName: string; programId: string };
  ActiveWorkout: { sessionId: string; dayId: string; dayName: string };
  ExerciseHistory: { exerciseName: string };
};

const Stack = createNativeStackNavigator<WorkoutParamList>();

export function WorkoutScreen() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.tabBg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="Programs" component={ProgramsListScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Program"
        component={ProgramScreen}
        options={({ route }) => ({ title: (route.params as any).programName })}
      />
      <Stack.Screen
        name="Day"
        component={DayScreen}
        options={({ route }) => ({ title: (route.params as any).dayName })}
      />
      <Stack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="ExerciseHistory"
        component={ExerciseHistoryScreen}
        options={({ route }) => ({ title: (route.params as any).exerciseName })}
      />
    </Stack.Navigator>
  );
}

function ProgramsListScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, { sessionCount: number; lastDate: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getPrograms();
      setPrograms(list);
      const sm: typeof statsMap = {};
      await Promise.all(list.map(async p => { sm[p.id] = await getProgramStats(p.id); }));
      setStatsMap(sm);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const data = await exportWorkoutData();
      const json = JSON.stringify(data, null, 2);
      const path = FileSystem.cacheDirectory + 'peakwise_workouts.json';
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Экспорт тренировок' });
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось экспортировать данные');
    }
  }, []);

  const handleImport = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      const json = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const data: ImportProgram = JSON.parse(json);
      if (!data.name || !Array.isArray(data.days)) {
        Alert.alert('Ошибка', 'Неверный формат файла программы');
        return;
      }
      await importProgram(data);
      await load();
      Alert.alert('Готово', `Программа "${data.name}" загружена`);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось загрузить программу');
    }
  }, [load]);

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const save = async () => {
    if (!newName.trim()) return;
    await createProgram(newName.trim(), newDesc.trim());
    setModalVisible(false);
    await load();
  };

  const remove = (p: Program) => {
    Alert.alert('Удалить программу', `Удалить "${p.name}" и все тренировки?`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await deleteProgram(p.id); await load(); } },
    ]);
  };

  const totalSessions = Object.values(statsMap).reduce((s, st) => s + st.sessionCount, 0);

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <LinearGradient
        colors={[colors.isDark ? '#1A2A1A' : '#EAF5EE', colors.isDark ? '#0F0D17' : '#FAF8F2']}
        style={s.hero}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      >
        <View style={s.heroRow}>
          <View>
            <Text style={s.heroTitle}>Тренировки</Text>
            <Text style={s.heroSub}>{programs.length} программ · {totalSessions} сессий</Text>
          </View>
          <View style={s.heroActions}>
            <TouchableOpacity style={s.heroBadge} onPress={handleImport} activeOpacity={0.7}>
              <Icon name="upload" size={18} color={colors.mint} strokeWidth={1.8} />
            </TouchableOpacity>
            <TouchableOpacity style={s.heroBadge} onPress={handleExport} activeOpacity={0.7}>
              <Icon name="download" size={18} color={colors.mint} strokeWidth={1.8} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={programs}
        keyExtractor={p => p.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Icon name="dumbbell" size={40} color={colors.text4} strokeWidth={1.5} />
            <Text style={s.emptyText}>Нет программ</Text>
            <Text style={s.emptyHint}>Создай свою первую программу тренировок</Text>
          </View>
        }
        renderItem={({ item }) => {
          const st = statsMap[item.id] ?? { sessionCount: 0, lastDate: null };
          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => navigation.navigate('Program', { programId: item.id, programName: item.name })}
              onLongPress={() => remove(item)}
              activeOpacity={0.8}
            >
              <View style={s.cardIcon}>
                <Icon name="dumbbell" size={20} color={colors.mint} strokeWidth={1.8} />
              </View>
              <View style={s.cardInfo}>
                <Text style={s.cardName}>{item.name}</Text>
                {!!item.description && <Text style={s.cardDesc}>{item.description}</Text>}
                <Text style={s.cardMeta}>
                  {st.sessionCount > 0
                    ? `${st.sessionCount} тренировок · последняя ${formatDate(st.lastDate!)}`
                    : 'Ещё не тренировался'}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.text4} />
            </TouchableOpacity>
          );
        }}
      />

      <View style={s.fab}>
        <TouchableOpacity
          style={s.fabBtn}
          onPress={() => { setNewName(''); setNewDesc(''); setModalVisible(true); }}
          activeOpacity={0.85}
        >
          <Icon name="plus" size={18} color="#fff" strokeWidth={2.5} />
          <Text style={s.fabText}>Новая программа</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.modal, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={s.modalTitle}>Новая программа</Text>
            <TextInput
              style={s.input}
              placeholder="Название программы"
              placeholderTextColor={colors.text4}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <TextInput
              style={[s.input, { minHeight: 60 }]}
              placeholder="Описание (необязательно)"
              placeholderTextColor={colors.text4}
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
            />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, !newName.trim() && s.saveBtnDisabled]}
                onPress={save}
                disabled={!newName.trim()}
              >
                <Text style={s.saveText}>Создать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg },
  hero: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroTitle: { fontSize: 28, fontWeight: '800', color: c.text, letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: c.text3, marginTop: 2 },
  heroActions: { flexDirection: 'row', gap: 8 },
  heroBadge: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: c.mintSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  list: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 18, fontWeight: '700', color: c.text },
  emptyHint: { fontSize: 14, color: c.text4, textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: c.surface, borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: c.border,
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: c.mintSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: c.text },
  cardDesc: { fontSize: 13, color: c.text3, marginTop: 2 },
  cardMeta: { fontSize: 12, color: c.text4, marginTop: 3 },
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
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: c.surface2, borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: c.text3, fontWeight: '700' },
  saveBtn: { flex: 1, backgroundColor: c.mint, borderRadius: 12, padding: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: '#fff', fontWeight: '700' },
});
