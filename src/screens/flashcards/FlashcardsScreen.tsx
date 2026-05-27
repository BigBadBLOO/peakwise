import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Alert, ActivityIndicator, Modal, TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import { Deck, createDeck, deleteDeck, getDecks, getDeckStats } from '../../db/flashcards';
import { useUserStats } from '../../hooks/useUserStats';
import { DeckScreen } from './DeckScreen';
import { ReviewScreen } from './ReviewScreen';

export type FlashcardsParamList = {
  Decks: undefined;
  Deck: { deckId: string; deckName: string };
  Review: { deckId: string; deckName: string };
};

const Stack = createNativeStackNavigator<FlashcardsParamList>();

export function FlashcardsScreen() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.tabBg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="Decks" component={DecksListScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Deck"
        component={DeckScreen}
        options={({ route }) => ({
          title: (route.params as any).deckName,
          headerStyle: { backgroundColor: colors.tabBg },
          headerTintColor: colors.text,
        })}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function DecksListScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const userStats = useUserStats();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState<Record<string, { total: number; due: number; mastered: number }>>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deckName, setDeckName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const list = await getDecks();
    setDecks(list);
    const st: Record<string, { total: number; due: number; mastered: number }> = {};
    await Promise.all(list.map(async d => { st[d.id] = await getDeckStats(d.id); }));
    setStats(st);
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => { load(); userStats.refresh(); });
    return unsub;
  }, [navigation, load, userStats.refresh]);

  const openAdd = () => { setDeckName(''); setModalVisible(true); };

  const saveNewDeck = async () => {
    if (!deckName.trim()) return;
    await createDeck(deckName.trim());
    setModalVisible(false);
    load();
  };

  const removeDeck = (deck: Deck) => {
    Alert.alert('Удалить колоду', `Удалить "${deck.name}" и все карточки?`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await deleteDeck(deck.id); load(); } },
    ]);
  };

  const totalDue = Object.values(stats).reduce((acc, st) => acc + st.due, 0);
  const totalCards = Object.values(stats).reduce((acc, st) => acc + st.total, 0);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Gradient hero header */}
      <LinearGradient
        colors={[colors.isDark ? '#2A2249' : '#ECEAFB', colors.isDark ? '#0F0D17' : '#FAF8F2']}
        style={s.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={s.heroRow}>
          <View>
            <Text style={s.heroTitle}>Карточки</Text>
            <Text style={s.heroSub}>{totalCards} карточек · {decks.length} колод</Text>
          </View>
          <View style={s.heroRight}>
            <View style={s.streakPill}>
              <Icon name="flame" size={14} color={colors.peak} strokeWidth={2} />
              <Text style={s.streakText}>{userStats.streak}</Text>
            </View>
          </View>
        </View>

        {totalDue > 0 && (
          <TouchableOpacity
            style={s.dueBar}
            onPress={() => {
              const firstWithDue = decks.find(d => (stats[d.id]?.due ?? 0) > 0);
              if (firstWithDue) navigation.navigate('Review', { deckId: firstWithDue.id, deckName: firstWithDue.name });
            }}
          >
            <View style={s.dueBarLeft}>
              <Icon name="play" size={14} color="#fff" />
              <Text style={s.dueBarText}>Повторить сегодня</Text>
            </View>
            <View style={s.dueBadge}>
              <Text style={s.dueBadgeText}>{totalDue}</Text>
            </View>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <FlatList
        data={decks}
        keyExtractor={d => d.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Icon name="stack" size={40} color={colors.text4} />
            <Text style={s.emptyText}>Нет колод</Text>
            <Text style={s.emptyHint}>Создай первую колоду карточек</Text>
          </View>
        }
        renderItem={({ item }) => {
          const st = stats[item.id] ?? { total: 0, due: 0, mastered: 0 };
          const masteredPct = st.total > 0 ? Math.round((st.mastered / st.total) * 100) : 0;
          const allMastered = st.total > 0 && st.mastered === st.total;
          return (
            <TouchableOpacity
              style={s.deckCard}
              onPress={() => navigation.navigate('Deck', { deckId: item.id, deckName: item.name })}
              onLongPress={() => removeDeck(item)}
              activeOpacity={0.8}
            >
              <View style={s.deckTop}>
                <View style={s.deckInfo}>
                  <View style={s.deckNameRow}>
                    <Text style={s.deckName}>{item.name}</Text>
                    {allMastered && (
                      <View style={s.masteredBadge}>
                        <Icon name="check" size={11} color={colors.mint} strokeWidth={2.5} />
                        <Text style={s.masteredBadgeText}>Освоено</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.deckMeta}>{st.total} карточек · {st.mastered} освоено</Text>
                </View>
                <View style={s.deckActions}>
                  {st.due > 0 && (
                    <TouchableOpacity
                      style={s.reviewBtn}
                      onPress={() => navigation.navigate('Review', { deckId: item.id, deckName: item.name })}
                    >
                      <Text style={s.reviewBtnText}>Повторить {st.due}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${masteredPct}%` as any }, allMastered && s.progressFillMastered]} />
              </View>
              <Text style={s.masteredText}>{masteredPct}% освоено</Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={s.fab}>
        <TouchableOpacity style={s.fabBtn} onPress={openAdd} activeOpacity={0.85}>
          <Icon name="plus" size={18} color="#fff" strokeWidth={2.5} />
          <Text style={s.fabText}>Новая колода</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={[s.modal, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={s.modalTitle}>Новая колода</Text>
            <TextInput
              style={s.input}
              placeholder="Название колоды"
              placeholderTextColor={colors.text4}
              value={deckName}
              onChangeText={setDeckName}
              autoFocus
              onSubmitEditing={saveNewDeck}
            />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, !deckName.trim() && s.saveBtnDisabled]}
                onPress={saveNewDeck}
                disabled={!deckName.trim()}
              >
                <Text style={s.saveText}>Создать</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg },
  hero: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: c.text, letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: c.text3, marginTop: 2 },
  heroRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: c.peakSoft, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 99,
  },
  streakText: { fontSize: 13, fontWeight: '800', color: c.peak },
  dueBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: c.accent, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  dueBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dueBarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  dueBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2,
  },
  dueBadgeText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  list: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 18, fontWeight: '700', color: c.text },
  emptyHint: { fontSize: 14, color: c.text4 },
  deckCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: c.border,
  },
  deckTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  deckInfo: { flex: 1 },
  deckNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  deckName: { fontSize: 16, fontWeight: '700', color: c.text },
  deckMeta: { fontSize: 12, color: c.text4, marginTop: 2 },
  masteredBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: c.mintSoft, borderRadius: 99,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  masteredBadgeText: { fontSize: 11, fontWeight: '700', color: c.mint },
  deckActions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  reviewBtn: {
    backgroundColor: c.accentSurface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reviewBtnText: { color: c.accent, fontWeight: '700', fontSize: 12 },
  progressTrack: {
    height: 4, backgroundColor: c.border, borderRadius: 99, overflow: 'hidden', marginBottom: 6,
  },
  progressFill: { height: 4, backgroundColor: c.mint, borderRadius: 99 },
  progressFillMastered: { backgroundColor: c.accent },
  masteredText: { fontSize: 11, color: c.text4, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 20, left: 16, right: 16 },
  fabBtn: {
    backgroundColor: c.accent, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: c.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16,
    elevation: 8,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  overlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' },
  modal: {
    backgroundColor: c.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: c.text },
  input: {
    backgroundColor: c.inputBg,
    borderRadius: 12,
    padding: 14,
    color: c.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: c.border,
  },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, backgroundColor: c.surface2, borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  cancelText: { color: c.text3, fontWeight: '700' },
  saveBtn: {
    flex: 1, backgroundColor: c.accent, borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: '#fff', fontWeight: '700' },
});
