import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card, getDueCards, getChain, sm2, updateCard,
} from '../../db/flashcards';

interface ReviewItem {
  // For single card
  card?: Card;
  // For chain — show all cards in sequence
  chain?: Card[];
  chainIndex?: number;
}

interface Props {
  navigation: any;
  route: { params: { deckId: string; deckName: string } };
}

export function ReviewScreen({ navigation, route }: Props) {
  const { deckId } = route.params;
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [chainStep, setChainStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const buildQueue = useCallback(async () => {
    const dueCards = await getDueCards(deckId);
    const items: ReviewItem[] = [];

    for (const card of dueCards) {
      if (card.chain_id) {
        const chain = await getChain(card.chain_id);
        items.push({ chain });
      } else {
        items.push({ card });
      }
    }

    setQueue(items);
    setLoading(false);
    if (items.length === 0) setDone(true);
  }, [deckId]);

  useEffect(() => { buildQueue(); }, [buildQueue]);

  const currentItem = queue[current];

  const advance = () => {
    if (current + 1 >= queue.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setRevealed(false);
      setChainStep(0);
    }
  };

  const handleQuality = async (quality: number) => {
    if (!currentItem) return;

    if (currentItem.card) {
      const updates = sm2(currentItem.card, quality);
      await updateCard(currentItem.card.id, updates);
    } else if (currentItem.chain) {
      // Update all chain cards with the same quality
      await Promise.all(
        currentItem.chain.map(c => updateCard(c.id, sm2(c, quality))),
      );
    }
    advance();
  };

  const nextChainStep = () => {
    if (!currentItem?.chain) return;
    if (chainStep + 1 < currentItem.chain.length) {
      setChainStep(s => s + 1);
      setRevealed(false);
    } else {
      // All chain cards shown — rate the whole chain
      setChainStep(currentItem.chain.length); // signals final review
      setRevealed(true);
    }
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator color="#7c6af7" size="large" /></View>;
  }

  if (done) {
    return (
      <SafeAreaView style={s.container} edges={['bottom']}>
        <View style={s.doneContainer}>
          <Text style={s.doneIcon}>🎉</Text>
          <Text style={s.doneTitle}>Всё повторено!</Text>
          <Text style={s.doneText}>На сегодня карточки закончились</Text>
          <TouchableOpacity style={s.btn} onPress={() => navigation.goBack()}>
            <Text style={s.btnText}>Назад к колодам</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = `${current + 1} / ${queue.length}`;

  // Chain review
  if (currentItem?.chain) {
    const chain = currentItem.chain;
    const isFinalReview = chainStep >= chain.length;
    const showCard = isFinalReview ? null : chain[chainStep];
    const isLastCard = chainStep === chain.length - 1;

    return (
      <SafeAreaView style={s.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.progressRow}>
            <Text style={s.progress}>{progress}</Text>
            <Text style={s.chainBadge}>🔗 Цепочка ({chain.length})</Text>
          </View>

          {!isFinalReview && showCard && (
            <>
              <Text style={s.stepHint}>Шаг {chainStep + 1} из {chain.length}</Text>
              <View style={s.card}>
                <Text style={s.front}>{showCard.front}</Text>
              </View>
              {revealed ? (
                <>
                  <View style={s.answerBox}>
                    <Text style={s.answer}>{showCard.back}</Text>
                  </View>
                  <TouchableOpacity style={s.nextBtn} onPress={nextChainStep}>
                    <Text style={s.nextBtnText}>
                      {isLastCard ? 'Оценить цепочку →' : 'Следующая →'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={s.revealBtn} onPress={() => setRevealed(true)}>
                  <Text style={s.revealText}>Показать ответ</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {isFinalReview && (
            <>
              <Text style={s.stepHint}>Оцени, как ты знаешь всю цепочку</Text>
              <View style={s.chainSummary}>
                {chain.map((c, i) => (
                  <View key={c.id} style={s.chainSummaryItem}>
                    <Text style={s.chainSummaryPos}>{i + 1}</Text>
                    <View>
                      <Text style={s.chainSummaryFront}>{c.front}</Text>
                      <Text style={s.chainSummaryBack}>{c.back}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <RatingButtons onRate={handleQuality} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Single card review
  const card = currentItem?.card!;
  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.progress}>{progress}</Text>
        <View style={s.card}>
          <Text style={s.front}>{card.front}</Text>
        </View>

        {revealed ? (
          <>
            <View style={s.answerBox}>
              <Text style={s.answer}>{card.back}</Text>
            </View>
            <RatingButtons onRate={handleQuality} />
          </>
        ) : (
          <TouchableOpacity style={s.revealBtn} onPress={() => setRevealed(true)}>
            <Text style={s.revealText}>Показать ответ</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const RATINGS = [
  { q: 0, label: 'Не помню', color: '#c0392b' },
  { q: 2, label: 'Плохо', color: '#e67e22' },
  { q: 3, label: 'Хорошо', color: '#27ae60' },
  { q: 5, label: 'Отлично', color: '#2980b9' },
];

function RatingButtons({ onRate }: { onRate: (q: number) => void }) {
  return (
    <View style={s.ratings}>
      <Text style={s.ratingsLabel}>Как хорошо ты знал ответ?</Text>
      <View style={s.ratingsRow}>
        {RATINGS.map(r => (
          <TouchableOpacity
            key={r.q}
            style={[s.ratingBtn, { backgroundColor: r.color }]}
            onPress={() => onRate(r.q)}
          >
            <Text style={s.ratingText}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progress: { color: '#666', fontSize: 14, marginBottom: 8, textAlign: 'right' },
  chainBadge: { color: '#7c6af7', fontSize: 14 },
  stepHint: { color: '#888', fontSize: 14, marginBottom: 12 },
  card: {
    backgroundColor: '#1e1e30',
    borderRadius: 16,
    padding: 24,
    minHeight: 140,
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  front: { color: '#fff', fontSize: 20, fontWeight: '600', textAlign: 'center', lineHeight: 30 },
  answerBox: {
    backgroundColor: '#1a2a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a4a2a',
  },
  answer: { color: '#c8e6c9', fontSize: 17, lineHeight: 26 },
  revealBtn: {
    backgroundColor: '#2d2d4e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  revealText: { color: '#aaa', fontWeight: '600', fontSize: 16 },
  nextBtn: {
    backgroundColor: '#7c6af7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  ratings: { gap: 10 },
  ratingsLabel: { color: '#aaa', fontSize: 15, textAlign: 'center' },
  ratingsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  ratingBtn: {
    flex: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    minWidth: '45%',
  },
  ratingText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  chainSummary: { gap: 8, marginBottom: 20 },
  chainSummaryItem: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#1e1e30',
    borderRadius: 10,
    padding: 12,
  },
  chainSummaryPos: { color: '#7c6af7', fontWeight: '700', width: 20, marginTop: 2 },
  chainSummaryFront: { color: '#fff', fontWeight: '600' },
  chainSummaryBack: { color: '#aaa', fontSize: 13, marginTop: 2 },
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
  doneIcon: { fontSize: 56 },
  doneTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
  doneText: { fontSize: 16, color: '#aaa', textAlign: 'center' },
  btn: { backgroundColor: '#7c6af7', borderRadius: 12, padding: 16, alignItems: 'center', width: '100%' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
