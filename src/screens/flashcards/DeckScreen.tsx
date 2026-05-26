import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, TextInput, Modal, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card, createCard, deleteCard, getCards,
} from '../../db/flashcards';

interface Props {
  navigation: any;
  route: { params: { deckId: string; deckName: string } };
}

export function DeckScreen({ navigation, route }: Props) {
  const { deckId } = route.params;
  const [cards, setCards] = useState<Card[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isChain, setIsChain] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setCards(await getCards(deckId));
  }, [deckId]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const openAdd = (chainLink?: string) => {
    setFront('');
    setBack('');
    setIsChain(!!chainLink);
    setChainId(chainLink ?? null);
    setModalVisible(true);
  };

  const saveCard = async () => {
    if (!front.trim() || !back.trim()) return;

    // Determine chain
    let cId = chainId;
    let cPos = 0;

    if (isChain && cId) {
      // Add to existing chain
      const chainCards = cards.filter(c => c.chain_id === cId);
      cPos = chainCards.length;
    } else if (isChain && !cId) {
      // Start new chain — generate id
      cId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      cPos = 0;
    }

    await createCard(deckId, front.trim(), back.trim(), cId ?? undefined, cPos);
    setModalVisible(false);
    load();
  };

  const remove = (card: Card) => {
    Alert.alert('Удалить карточку?', '', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await deleteCard(card.id); load(); } },
    ]);
  };

  // Group cards by chain
  const grouped: (Card | { type: 'chain'; chainId: string; cards: Card[] })[] = [];
  const seen = new Set<string>();

  for (const card of cards) {
    if (!card.chain_id) {
      grouped.push(card);
    } else if (!seen.has(card.chain_id)) {
      seen.add(card.chain_id);
      const chainCards = cards.filter(c => c.chain_id === card.chain_id).sort((a, b) => a.chain_position - b.chain_position);
      grouped.push({ type: 'chain', chainId: card.chain_id, cards: chainCards });
    }
  }

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <FlatList
        data={grouped}
        keyExtractor={(item: any) => item.id ?? item.chainId}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📝</Text>
            <Text style={s.emptyText}>Нет карточек</Text>
          </View>
        }
        renderItem={({ item }: any) => {
          if ('type' in item && item.type === 'chain') {
            return (
              <View style={s.chainBlock}>
                <View style={s.chainHeader}>
                  <Text style={s.chainLabel}>🔗 Цепочка ({item.cards.length} карточек)</Text>
                  <TouchableOpacity onPress={() => openAdd(item.chainId)}>
                    <Text style={s.addToChain}>+ Добавить</Text>
                  </TouchableOpacity>
                </View>
                {item.cards.map((c: Card, idx: number) => (
                  <TouchableOpacity key={c.id} style={s.chainCard} onLongPress={() => remove(c)}>
                    <Text style={s.chainPos}>{idx + 1}</Text>
                    <View style={s.cardTexts}>
                      <Text style={s.cardFront}>{c.front}</Text>
                      <Text style={s.cardBack}>{c.back}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          }
          const c = item as Card;
          return (
            <TouchableOpacity style={s.cardRow} onLongPress={() => remove(c)}>
              <View style={s.cardTexts}>
                <Text style={s.cardFront}>{c.front}</Text>
                <Text style={s.cardBack}>{c.back}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <View style={s.fab}>
        <TouchableOpacity style={[s.fabBtn, { flex: 1 }]} onPress={() => openAdd()}>
          <Text style={s.fabText}>+ Карточка</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.fabBtn, s.chainFabBtn]} onPress={() => openAdd(undefined)}>
          <Text style={s.fabText}>🔗 Цепочка</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Новая карточка</Text>
            <TextInput
              style={s.input}
              placeholder="Лицевая сторона"
              placeholderTextColor="#555"
              value={front}
              onChangeText={setFront}
              multiline
            />
            <TextInput
              style={s.input}
              placeholder="Обратная сторона"
              placeholderTextColor="#555"
              value={back}
              onChangeText={setBack}
              multiline
            />
            {!chainId && (
              <View style={s.switchRow}>
                <Text style={s.switchLabel}>Начать цепочку</Text>
                <Switch
                  value={isChain}
                  onValueChange={setIsChain}
                  trackColor={{ true: '#7c6af7' }}
                />
              </View>
            )}
            {chainId && (
              <Text style={s.chainNote}>Будет добавлена в существующую цепочку</Text>
            )}
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, (!front.trim() || !back.trim()) && s.saveBtnDisabled]}
                onPress={saveCard}
                disabled={!front.trim() || !back.trim()}
              >
                <Text style={s.saveText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  list: { padding: 16, paddingBottom: 90 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: '#666', fontSize: 16 },
  cardRow: {
    backgroundColor: '#1e1e30',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  cardTexts: { gap: 4 },
  cardFront: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cardBack: { color: '#aaa', fontSize: 14 },
  chainBlock: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#7c6af730',
    overflow: 'hidden',
  },
  chainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2a2040',
  },
  chainLabel: { color: '#7c6af7', fontWeight: '600', fontSize: 14 },
  addToChain: { color: '#7c6af7', fontSize: 13 },
  chainCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#2d2d4e',
    alignItems: 'flex-start',
  },
  chainPos: {
    color: '#7c6af7',
    fontWeight: '700',
    fontSize: 14,
    width: 20,
    marginTop: 2,
  },
  fab: { position: 'absolute', bottom: 20, left: 16, right: 16, flexDirection: 'row', gap: 8 },
  fabBtn: {
    backgroundColor: '#7c6af7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  chainFabBtn: { backgroundColor: '#4a3080' },
  fabText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#1e1e30',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  input: {
    backgroundColor: '#0f0f1a',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2d2d4e',
    minHeight: 60,
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { color: '#aaa', fontSize: 15 },
  chainNote: { color: '#7c6af7', fontSize: 13, textAlign: 'center' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, backgroundColor: '#2d2d4e', borderRadius: 10,
    padding: 14, alignItems: 'center',
  },
  cancelText: { color: '#aaa', fontWeight: '600' },
  saveBtn: {
    flex: 1, backgroundColor: '#7c6af7', borderRadius: 10,
    padding: 14, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: '#fff', fontWeight: '600' },
});
