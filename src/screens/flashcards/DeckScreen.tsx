import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, TextInput, Modal, Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import { Card, createCard, deleteCard, getCards, getDeckStats } from '../../db/flashcards';

interface Props {
  navigation: any;
  route: { params: { deckId: string; deckName: string } };
}

export function DeckScreen({ navigation, route }: Props) {
  const { deckId } = route.params;
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState({ total: 0, due: 0, mastered: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isChain, setIsChain] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [c, st] = await Promise.all([getCards(deckId), getDeckStats(deckId)]);
    setCards(c);
    setStats(st);
  }, [deckId]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const openAdd = (chainLink?: string) => {
    setFront(''); setBack('');
    setIsChain(!!chainLink);
    setChainId(chainLink ?? null);
    setModalVisible(true);
  };

  const saveCard = async () => {
    if (!front.trim() || !back.trim()) return;
    let cId = chainId;
    let cPos = 0;
    if (isChain && cId) {
      cPos = cards.filter(c => c.chain_id === cId).length;
    } else if (isChain && !cId) {
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

  const masteredPct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  const grouped: (Card | { type: 'chain'; chainId: string; cards: Card[] })[] = [];
  const seen = new Set<string>();
  for (const card of cards) {
    if (!card.chain_id) {
      grouped.push(card);
    } else if (!seen.has(card.chain_id)) {
      seen.add(card.chain_id);
      const chainCards = cards
        .filter(c => c.chain_id === card.chain_id)
        .sort((a, b) => a.chain_position - b.chain_position);
      grouped.push({ type: 'chain', chainId: card.chain_id, cards: chainCards });
    }
  }

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.statBlock}>
          <Text style={s.statNum}>{stats.total}</Text>
          <Text style={s.statLbl}>Всего</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statBlock}>
          <Text style={[s.statNum, stats.due > 0 && { color: colors.accent }]}>{stats.due}</Text>
          <Text style={s.statLbl}>На сегодня</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statBlock}>
          <Text style={[s.statNum, { color: colors.mint }]}>{stats.mastered}</Text>
          <Text style={s.statLbl}>Освоено</Text>
        </View>
        {stats.due > 0 && (
          <>
            <View style={s.statDivider} />
            <TouchableOpacity
              style={s.reviewQuickBtn}
              onPress={() => navigation.navigate('Review', { deckId, deckName: route.params.deckName })}
            >
              <Icon name="play" size={13} color="#fff" />
              <Text style={s.reviewQuickText}>Повторить</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item: any) => item.id ?? item.chainId}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Icon name="cards" size={36} color={colors.text4} />
            <Text style={s.emptyText}>Нет карточек</Text>
            <Text style={s.emptyHint}>Добавь первую карточку</Text>
          </View>
        }
        renderItem={({ item }: any) => {
          if ('type' in item && item.type === 'chain') {
            return (
              <View style={s.chainBlock}>
                <View style={s.chainHeader}>
                  <View style={s.chainHeaderLeft}>
                    <Icon name="link" size={14} color={colors.accent} />
                    <Text style={s.chainLabel}>Цепочка ({item.cards.length})</Text>
                  </View>
                  <TouchableOpacity style={s.addToChainBtn} onPress={() => openAdd(item.chainId)}>
                    <Icon name="plus" size={14} color={colors.accent} strokeWidth={2.5} />
                    <Text style={s.addToChainText}>Добавить</Text>
                  </TouchableOpacity>
                </View>
                {item.cards.map((c: Card, idx: number) => (
                  <ChainCardRow key={c.id} card={c} idx={idx} onRemove={remove} s={s} />
                ))}
              </View>
            );
          }
          const c = item as Card;
          return <CardRow card={c} onRemove={remove} s={s} />;
        }}
      />

      <View style={s.fab}>
        <TouchableOpacity style={[s.fabBtn, { flex: 1 }]} onPress={() => openAdd()}>
          <Icon name="plus" size={16} color="#fff" strokeWidth={2.5} />
          <Text style={s.fabText}>Карточка</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.fabBtn, s.chainFabBtn]} onPress={() => openAdd(undefined)}>
          <Icon name="link" size={16} color={colors.accent} />
          <Text style={s.chainFabText}>Цепочка</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={[s.overlay, { paddingBottom: insets.bottom }]}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Новая карточка</Text>
            <TextInput
              style={s.input}
              placeholder="Лицевая сторона"
              placeholderTextColor={colors.text4}
              value={front}
              onChangeText={setFront}
              multiline
            />
            <TextInput
              style={s.input}
              placeholder="Обратная сторона"
              placeholderTextColor={colors.text4}
              value={back}
              onChangeText={setBack}
              multiline
            />
            {!chainId && (
              <View style={s.switchRow}>
                <Text style={s.switchLabel}>Начать цепочку</Text>
                <Switch value={isChain} onValueChange={setIsChain} trackColor={{ true: colors.accent }} />
              </View>
            )}
            {chainId && (
              <View style={s.chainNote}>
                <Icon name="link" size={14} color={colors.accent} />
                <Text style={s.chainNoteText}>Добавляется в цепочку</Text>
              </View>
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

function CardRow({ card, onRemove, s }: { card: Card; onRemove: (c: Card) => void; s: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity
      style={s.cardRow}
      onPress={() => setExpanded(v => !v)}
      onLongPress={() => onRemove(card)}
      activeOpacity={0.85}
    >
      <View style={s.cardTexts}>
        <Text style={s.cardFront}>{card.front}</Text>
        {expanded && <Text style={s.cardBack}>{card.back}</Text>}
      </View>
    </TouchableOpacity>
  );
}

function ChainCardRow({ card, idx, onRemove, s }: { card: Card; idx: number; onRemove: (c: Card) => void; s: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity
      style={s.chainCard}
      onPress={() => setExpanded(v => !v)}
      onLongPress={() => onRemove(card)}
      activeOpacity={0.85}
    >
      <Text style={s.chainPos}>{idx + 1}</Text>
      <View style={s.cardTexts}>
        <Text style={s.cardFront}>{card.front}</Text>
        {expanded && <Text style={s.cardBack}>{card.back}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border,
    paddingVertical: 12, paddingHorizontal: 20, gap: 0,
  },
  statBlock: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 20, fontWeight: '800', color: c.text },
  statLbl: { fontSize: 11, color: c.text4, fontWeight: '600' },
  statDivider: { width: 1, height: 32, backgroundColor: c.border },
  reviewQuickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: c.accent, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8,
  },
  reviewQuickText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  list: { padding: 16, paddingBottom: 90 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { color: c.text, fontSize: 16, fontWeight: '700' },
  emptyHint: { color: c.text4, fontSize: 13 },
  cardRow: {
    backgroundColor: c.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: c.border,
  },
  cardTexts: { gap: 4 },
  cardFront: { color: c.text, fontSize: 15, fontWeight: '700' },
  cardBack: { color: c.text3, fontSize: 13, lineHeight: 18 },
  chainBlock: {
    backgroundColor: c.surface2,
    borderRadius: 14, marginBottom: 12,
    borderWidth: 1, borderColor: c.accent + '30', overflow: 'hidden',
  },
  chainHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, backgroundColor: c.accentSurface,
  },
  chainHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chainLabel: { color: c.accent, fontWeight: '700', fontSize: 13 },
  addToChainBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addToChainText: { color: c.accent, fontSize: 12, fontWeight: '700' },
  chainCard: {
    flexDirection: 'row', gap: 10, padding: 12,
    borderTopWidth: 1, borderTopColor: c.border, alignItems: 'flex-start',
  },
  chainPos: { color: c.accent, fontWeight: '800', fontSize: 14, width: 20, marginTop: 2 },
  fab: { position: 'absolute', bottom: 20, left: 16, right: 16, flexDirection: 'row', gap: 8 },
  fabBtn: {
    backgroundColor: c.accent, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  chainFabBtn: { backgroundColor: c.accentSurface, borderWidth: 1, borderColor: c.accent + '40' },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  chainFabText: { color: c.accent, fontWeight: '700', fontSize: 14 },
  overlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' },
  modal: {
    backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: c.text },
  input: {
    backgroundColor: c.inputBg, borderRadius: 12, padding: 12,
    color: c.text, fontSize: 15, borderWidth: 1, borderColor: c.border, minHeight: 60,
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { color: c.text3, fontSize: 15 },
  chainNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: c.accentSurface, borderRadius: 10, padding: 10,
  },
  chainNoteText: { color: c.accent, fontSize: 13, fontWeight: '600' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, backgroundColor: c.surface2, borderRadius: 12, padding: 14, alignItems: 'center',
  },
  cancelText: { color: c.text3, fontWeight: '700' },
  saveBtn: {
    flex: 1, backgroundColor: c.accent, borderRadius: 12, padding: 14, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: '#fff', fontWeight: '700' },
});
