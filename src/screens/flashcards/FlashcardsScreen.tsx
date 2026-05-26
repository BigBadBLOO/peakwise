import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Deck, createDeck, deleteDeck, getDecks, getDeckStats } from '../../db/flashcards';
import { DeckScreen } from './DeckScreen';
import { ReviewScreen } from './ReviewScreen';

export type FlashcardsParamList = {
  Decks: undefined;
  Deck: { deckId: string; deckName: string };
  Review: { deckId: string; deckName: string };
};

const Stack = createNativeStackNavigator<FlashcardsParamList>();

export function FlashcardsScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
        contentStyle: { backgroundColor: '#0f0f1a' },
      }}
    >
      <Stack.Screen name="Decks" component={DecksListScreen} options={{ title: 'Карточки' }} />
      <Stack.Screen
        name="Deck"
        component={DeckScreen}
        options={({ route }) => ({ title: (route.params as any).deckName })}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={({ route }) => ({ title: `Повторение: ${(route.params as any).deckName}` })}
      />
    </Stack.Navigator>
  );
}

function DecksListScreen({ navigation }: any) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState<Record<string, { total: number; due: number }>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await getDecks();
    setDecks(list);
    const s: Record<string, { total: number; due: number }> = {};
    await Promise.all(list.map(async d => {
      s[d.id] = await getDeckStats(d.id);
    }));
    setStats(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const addDeck = () => {
    Alert.prompt('Новая колода', 'Название колоды:', async (name) => {
      if (!name?.trim()) return;
      await createDeck(name.trim());
      load();
    });
  };

  const removeDeck = (deck: Deck) => {
    Alert.alert('Удалить колоду', `Удалить "${deck.name}" и все карточки?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => { await deleteDeck(deck.id); load(); },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#7c6af7" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <FlatList
        data={decks}
        keyExtractor={d => d.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🃏</Text>
            <Text style={s.emptyText}>Нет колод</Text>
            <Text style={s.emptyHint}>Создай первую колоду карточек</Text>
          </View>
        }
        renderItem={({ item }) => {
          const st = stats[item.id] ?? { total: 0, due: 0 };
          return (
            <TouchableOpacity
              style={s.deckCard}
              onPress={() => navigation.navigate('Deck', { deckId: item.id, deckName: item.name })}
              onLongPress={() => removeDeck(item)}
            >
              <View style={s.deckInfo}>
                <Text style={s.deckName}>{item.name}</Text>
                <Text style={s.deckMeta}>{st.total} карточек</Text>
              </View>
              {st.due > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{st.due}</Text>
                </View>
              )}
              {st.due > 0 && (
                <TouchableOpacity
                  style={s.reviewBtn}
                  onPress={() => navigation.navigate('Review', { deckId: item.id, deckName: item.name })}
                >
                  <Text style={s.reviewBtnText}>Повторить</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />
      <View style={s.fab}>
        <TouchableOpacity style={s.fabBtn} onPress={addDeck}>
          <Text style={s.fabText}>+ Новая колода</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 90 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  emptyHint: { fontSize: 14, color: '#666' },
  deckCard: {
    backgroundColor: '#1e1e30',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deckInfo: { flex: 1 },
  deckName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  deckMeta: { fontSize: 13, color: '#666', marginTop: 2 },
  badge: {
    backgroundColor: '#7c6af7',
    borderRadius: 12,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  reviewBtn: {
    backgroundColor: '#2a2040',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reviewBtnText: { color: '#7c6af7', fontWeight: '600', fontSize: 13 },
  fab: { position: 'absolute', bottom: 20, left: 16, right: 16 },
  fabBtn: {
    backgroundColor: '#7c6af7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  fabText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
