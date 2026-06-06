import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  ScrollView, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import { Card, getDueCards, getChain, sm2, updateCard } from '../../db/flashcards';
import { addXp, CARD_XP } from '../../db/stats';
import { useUserStats } from '../../hooks/useUserStats';

const { width: SCREEN_W } = Dimensions.get('window');

interface ReviewItem {
  card?: Card;
  chain?: Card[];
}

interface Props {
  navigation: any;
  route: { params: { deckId: string; deckName: string } };
}

const RATINGS = [
  { q: 0, label: 'Забыл',  hint: '<1 мин', color: '#E0455A', soft: 'rateForgotSoft' as const },
  { q: 2, label: 'Трудно', hint: '6 мин',  color: '#EC8B2F', soft: 'rateHardSoft' as const },
  { q: 3, label: 'Хорошо', hint: '1 день', color: '#A5BE36', soft: 'rateGoodSoft' as const },
  { q: 5, label: 'Легко',  hint: '4 дня',  color: '#3CA86E', soft: 'rateEasySoft' as const },
];

export function ReviewScreen({ navigation, route }: Props) {
  const { deckId, deckName } = route.params;
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [chainStep, setChainStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [ratingStats, setRatingStats] = useState({ forgot: 0, hard: 0, good: 0, easy: 0 });
  const userStats = useUserStats();

  const flipAnim = useRef(new Animated.Value(0)).current;

  const buildQueue = useCallback(async () => {
    setLoading(true);
    const dueCards = await getDueCards(deckId);
    const items: ReviewItem[] = [];
    for (const card of dueCards) {
      if (card.chain_id) {
        items.push({ chain: await getChain(card.chain_id) });
      } else {
        items.push({ card });
      }
    }
    setQueue(items);
    setLoading(false);
    if (items.length === 0) setDone(true);
  }, [deckId]);

  useEffect(() => { buildQueue(); }, [buildQueue]);

  const flipCard = () => {
    if (revealed) return;
    setRevealed(true);
    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const resetFlip = () => {
    setRevealed(false);
    flipAnim.setValue(0);
  };

  const advance = () => {
    if (current + 1 >= queue.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setChainStep(0);
      resetFlip();
    }
  };

  const handleQuality = async (quality: number, label: string) => {
    const currentItem = queue[current];
    if (!currentItem) return;
    if (currentItem.card) {
      await updateCard(currentItem.card.id, sm2(currentItem.card, quality));
    } else if (currentItem.chain) {
      await Promise.all(currentItem.chain.map(c => updateCard(c.id, sm2(c, quality))));
    }
    const xpKey = label === 'Забыл' ? 'forgot' : label === 'Трудно' ? 'hard' : label === 'Хорошо' ? 'good' : 'easy';
    setRatingStats(prev => ({ ...prev, [xpKey]: prev[xpKey] + 1 }));
    await addXp(CARD_XP[xpKey]);
    advance();
  };

  const nextChainStep = () => {
    const currentItem = queue[current];
    if (!currentItem?.chain) return;
    if (chainStep + 1 < currentItem.chain.length) {
      setChainStep(s => s + 1);
      resetFlip();
    } else {
      setChainStep(currentItem.chain.length);
      setRevealed(true);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (done) {
    return <SessionComplete
      colors={colors}
      deckName={deckName}
      total={queue.length}
      stats={ratingStats}
      streak={userStats.streak}
      onBack={() => navigation.goBack()}
      onAgain={() => { setDone(false); setCurrent(0); resetFlip(); setRatingStats({ forgot: 0, hard: 0, good: 0, easy: 0 }); buildQueue(); userStats.refresh(); }}
    />;
  }

  const currentItem = queue[current];
  const progress = current / queue.length;

  if (currentItem?.chain) {
    return (
      <ChainReview
        colors={colors}
        s={s}
        chain={currentItem.chain}
        chainStep={chainStep}
        revealed={revealed}
        progress={progress}
        current={current}
        total={queue.length}
        onReveal={flipCard}
        onNextStep={nextChainStep}
        onRate={handleQuality}
        onClose={() => navigation.goBack()}
        flipAnim={flipAnim}
      />
    );
  }

  const card = currentItem?.card;
  if (!card) return null;

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
          <Icon name="close" size={20} color={colors.text3} />
        </TouchableOpacity>
        <View style={s.progressWrap}>
          <View style={s.progressTrackTop}>
            <View style={[s.progressFillTop, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={s.progressText}>{current + 1} / {queue.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Stack shadow cards */}
        {current + 2 < queue.length && <View style={[s.stackCard, s.stackCard3]} />}
        {current + 1 < queue.length && <View style={[s.stackCard, s.stackCard2]} />}

        {/* 3D flip card */}
        <FlipCardView
          card={card}
          revealed={revealed}
          flipAnim={flipAnim}
          onFlip={flipCard}
          colors={colors}
          s={s}
        />

        {!revealed ? (
          <TouchableOpacity style={s.revealBtn} onPress={flipCard} activeOpacity={0.85}>
            <Text style={s.revealText}>Показать ответ</Text>
          </TouchableOpacity>
        ) : (
          <RatingButtons onRate={handleQuality} s={s} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FlipCardView({ card, revealed, flipAnim, onFlip, colors, s }: any) {
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={s.cardContainer}>
      {/* Front */}
      <Animated.View style={[s.cardFace, { transform: [{ rotateY: frontInterpolate }] }]}>
        <TouchableOpacity style={s.cardFaceInner} onPress={onFlip} activeOpacity={0.97}>
          <Text style={s.cardHint}>Нажми, чтобы открыть</Text>
          <View style={s.cardFrontContent}>
            <Text style={s.cardFrontText}>{card.front}</Text>
          </View>
          <View style={s.cardBranding}>
            <Icon name="peak" size={18} color={colors.accent} strokeWidth={1.5} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Back */}
      <Animated.View style={[s.cardFace, s.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
        <View style={s.cardFaceInner}>
          <Text style={s.cardBackLabel}>{card.front}</Text>
          <View style={s.cardBackContent}>
            <Text style={s.cardBackText}>{card.back}</Text>
          </View>
          <View style={s.cardBranding}>
            <Icon name="peak" size={18} color={colors.accent} strokeWidth={1.5} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function RatingButtons({ onRate, s }: { onRate: (q: number, label: string) => void; s: any }) {
  return (
    <View style={s.ratings}>
      <Text style={s.ratingsLabel}>Как хорошо ты знал?</Text>
      <View style={s.ratingsRow}>
        {RATINGS.map(r => (
          <TouchableOpacity
            key={r.q}
            style={[s.ratingBtn, { backgroundColor: r.color + '22', borderColor: r.color + '55' }]}
            onPress={() => onRate(r.q, r.label)}
            activeOpacity={0.8}
          >
            <Text style={[s.ratingLabel, { color: r.color }]}>{r.label}</Text>
            <Text style={[s.ratingHint, { color: r.color + 'AA' }]}>{r.hint}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ChainReview({ colors, s, chain, chainStep, revealed, progress, current, total, onReveal, onNextStep, onRate, onClose, flipAnim }: any) {
  const isFinalReview = chainStep >= chain.length;
  const showCard = isFinalReview ? null : chain[chainStep];
  const isLastCard = chainStep === chain.length - 1;

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
          <Icon name="close" size={20} color={colors.text3} />
        </TouchableOpacity>
        <View style={s.progressWrap}>
          <View style={s.progressTrackTop}>
            <View style={[s.progressFillTop, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={s.progressText}>{current + 1} / {total}</Text>
        </View>
        <View style={s.chainBadgePill}>
          <Icon name="link" size={12} color={colors.accent} />
          <Text style={s.chainBadgeText}>{chain.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {!isFinalReview && showCard && (
          <>
            <Text style={s.stepHint}>Шаг {chainStep + 1} из {chain.length}</Text>
            <FlipCardView
              card={showCard}
              revealed={revealed}
              flipAnim={flipAnim}
              onFlip={onReveal}
              colors={colors}
              s={s}
            />
            {revealed ? (
              <TouchableOpacity style={s.nextBtn} onPress={onNextStep}>
                <Text style={s.nextBtnText}>{isLastCard ? 'Оценить цепочку →' : 'Следующая →'}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={s.revealBtn} onPress={onReveal}>
                <Text style={s.revealText}>Показать ответ</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {isFinalReview && (
          <>
            <Text style={s.stepHint}>Оцени, как ты знаешь всю цепочку</Text>
            <View style={s.chainSummary}>
              {chain.map((c: Card, i: number) => (
                <View key={c.id} style={s.chainSummaryItem}>
                  <Text style={s.chainSummaryPos}>{i + 1}</Text>
                  <View>
                    <Text style={s.chainSummaryFront}>{c.front}</Text>
                    <Text style={s.chainSummaryBack}>{c.back}</Text>
                  </View>
                </View>
              ))}
            </View>
            <RatingButtons onRate={onRate} s={s} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionComplete({ colors, deckName, total, stats, streak, onBack, onAgain }: any) {
  const s = useMemo(() => makeStyles(colors), [colors]);
  const accuracy = total > 0 ? Math.round(((stats.good + stats.easy) / total) * 100) : 0;
  const xpGained = stats.forgot * 5 + stats.hard * 8 + stats.good * 12 + stats.easy * 15;
  const title = accuracy >= 80 ? 'Великолепно!' : accuracy >= 60 ? 'Хорошая работа' : 'Идём дальше';

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.doneContent}>
        {/* Trophy */}
        <View style={s.trophyWrap}>
          <View style={s.trophyCircle}>
            <Icon name="trophy" size={48} color="#fff" strokeWidth={1.6} />
          </View>
        </View>

        <Text style={s.doneLabel}>Сессия завершена</Text>
        <Text style={s.doneTitle}>{title}</Text>
        <Text style={s.doneMeta}>{deckName} · {total} карточек</Text>

        {/* XP gained */}
        {xpGained > 0 && (
          <View style={s.xpPill}>
            <Icon name="sparkle" size={16} color={colors.peak} strokeWidth={2} />
            <Text style={s.xpText}>+{xpGained} XP</Text>
          </View>
        )}

        {/* Stats grid */}
        <View style={s.statsGrid}>
          {[
            { label: 'Забыл',  count: stats.forgot, color: '#E0455A', soft: colors.rateForgotSoft },
            { label: 'Трудно', count: stats.hard,   color: '#EC8B2F', soft: colors.rateHardSoft },
            { label: 'Хорошо', count: stats.good,   color: '#A5BE36', soft: colors.rateGoodSoft },
            { label: 'Легко',  count: stats.easy,   color: '#3CA86E', soft: colors.rateEasySoft },
          ].map(r => (
            <View key={r.label} style={[s.statCell, { backgroundColor: r.soft }]}>
              <Text style={[s.statCount, { color: r.color }]}>{r.count}</Text>
              <Text style={[s.statLabel, { color: r.color }]}>{r.label}</Text>
            </View>
          ))}
        </View>

        {/* Streak */}
        <View style={s.streakCard}>
          <Icon name="flame" size={20} color="#E97354" strokeWidth={2.2} />
          <Text style={s.streakCardText}>Серия — {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}</Text>
          <Text style={s.streakCardPlus}>+1</Text>
        </View>
      </ScrollView>

      <View style={s.doneBtns}>
        <TouchableOpacity style={s.doneSecBtn} onPress={onBack}>
          <Text style={s.doneSecText}>К колодам</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.donePrimBtn} onPress={onAgain}>
          <Text style={s.donePrimText}>Ещё раз</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CARD_H = 260;

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 10, gap: 10,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 99,
    backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: c.border,
  },
  progressWrap: { flex: 1, gap: 4 },
  progressTrackTop: {
    height: 5, backgroundColor: c.border, borderRadius: 99, overflow: 'hidden',
  },
  progressFillTop: { height: 5, backgroundColor: c.accent, borderRadius: 99 },
  progressText: { fontSize: 11, color: c.text4, fontWeight: '700', textAlign: 'right' },
  chainBadgePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: c.accentSurface, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 99,
  },
  chainBadgeText: { fontSize: 12, fontWeight: '800', color: c.accent },
  content: { padding: 16, paddingBottom: 32 },
  stepHint: { fontSize: 14, color: c.text3, marginBottom: 12 },

  // Card stack shadows
  stackCard: {
    position: 'absolute', left: 32, right: 32, height: CARD_H,
    backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.border,
  },
  stackCard2: { top: 8, opacity: 0.55, transform: [{ scaleX: 0.96 }] },
  stackCard3: { top: 16, opacity: 0.3, transform: [{ scaleX: 0.92 }] },

  // 3D flip card
  cardContainer: { height: CARD_H, marginBottom: 16 },
  cardFace: {
    position: 'absolute', width: '100%', height: '100%',
    backfaceVisibility: 'hidden',
  },
  cardFaceInner: {
    flex: 1, backgroundColor: c.surface, borderRadius: 20,
    borderWidth: 1, borderColor: c.border,
    padding: 20, justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: c.isDark ? 0.4 : 0.1, shadowRadius: 12, elevation: 4,
  },
  cardBack: { transform: [{ rotateY: '180deg' }] },
  cardHint: { fontSize: 12, color: c.text4, fontWeight: '600', textAlign: 'center' },
  cardFrontContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardFrontText: {
    fontSize: 32, fontWeight: '800', color: c.text,
    textAlign: 'center', lineHeight: 40, letterSpacing: -0.5,
  },
  cardBranding: { alignItems: 'flex-end', opacity: 0.4 },
  cardBackLabel: {
    fontSize: 12, fontWeight: '700', color: c.text4,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  cardBackContent: { flex: 1, justifyContent: 'center' },
  cardBackText: { fontSize: 20, color: c.text, lineHeight: 30, fontWeight: '600' },

  revealBtn: {
    backgroundColor: c.surface2, borderRadius: 14,
    padding: 16, alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: c.border,
  },
  revealText: { color: c.text3, fontWeight: '700', fontSize: 16 },

  nextBtn: { backgroundColor: c.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16 },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  ratings: { gap: 10 },
  ratingsLabel: { color: c.text3, fontSize: 14, textAlign: 'center', fontWeight: '600' },
  ratingsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  ratingBtn: {
    flex: 1, borderRadius: 12, padding: 14,
    alignItems: 'center', minWidth: '45%',
    borderWidth: 1.5, gap: 2,
  },
  ratingLabel: { fontWeight: '800', fontSize: 14 },
  ratingHint: { fontSize: 11, fontWeight: '600' },

  chainSummary: { gap: 8, marginBottom: 20 },
  chainSummaryItem: {
    flexDirection: 'row', gap: 10, backgroundColor: c.surface,
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: c.border,
  },
  chainSummaryPos: { color: c.accent, fontWeight: '800', width: 20, marginTop: 2 },
  chainSummaryFront: { color: c.text, fontWeight: '700', fontSize: 14 },
  chainSummaryBack: { color: c.text3, fontSize: 13, marginTop: 2 },

  // Session complete
  doneContent: { padding: 24, alignItems: 'center', gap: 8, paddingBottom: 120 },
  trophyWrap: { marginBottom: 8 },
  trophyCircle: {
    width: 100, height: 100, borderRadius: 99,
    backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: c.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20,
    elevation: 10,
  },
  doneLabel: {
    fontSize: 11, fontWeight: '800', color: c.accent,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  doneTitle: { fontSize: 30, fontWeight: '800', color: c.text, letterSpacing: -0.5 },
  doneMeta: { fontSize: 14, color: c.text3, marginBottom: 8 },
  xpPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: c.peakSoft, paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 99, marginBottom: 8,
  },
  xpText: { fontSize: 20, fontWeight: '800', color: c.peak },
  statsGrid: { flexDirection: 'row', gap: 8, width: '100%', marginBottom: 8 },
  statCell: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 2 },
  statCount: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  streakCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: c.surface, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: c.border, width: '100%',
  },
  streakCardText: { flex: 1, fontSize: 14, fontWeight: '700', color: c.text },
  streakCardPlus: { fontWeight: '700', fontSize: 13, color: c.text4 },
  doneBtns: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10, padding: 16,
    paddingBottom: 32, backgroundColor: c.bg,
    borderTopWidth: 1, borderTopColor: c.border,
  },
  doneSecBtn: {
    flex: 1, backgroundColor: c.surface2, borderRadius: 14,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: c.border,
  },
  doneSecText: { color: c.text2, fontWeight: '700', fontSize: 15 },
  donePrimBtn: {
    flex: 1, backgroundColor: c.accent, borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  donePrimText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
