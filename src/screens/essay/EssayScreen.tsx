import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../../context/SettingsContext';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import { claudeChat } from '../../services/claude';
import { addXp, ESSAY_XP } from '../../db/stats';
import { saveEssaySession, getEssaySessions, EssaySession } from '../../db/essays';
import { useLlama, LlamaStatus } from '../../hooks/useLlama';

type Stage =
  | 'level-select'
  | 'reading'
  | 'writing-retelling'
  | 'checking-retelling'
  | 'feedback-retelling'
  | 'writing-essay'
  | 'checking-essay'
  | 'feedback-essay';

const LEVELS = [
  { value: 1, label: 'Очень просто', words: '80–120',  color: '#3CA86E' },
  { value: 2, label: 'Просто',       words: '120–180', color: '#7DBD3F' },
  { value: 3, label: 'Средне',       words: '180–280', color: '#A5BE36' },
  { value: 4, label: 'Сложно',       words: '280–400', color: '#EC8B2F' },
  { value: 5, label: 'Эксперт',      words: '400+',    color: '#E0455A' },
];

const TOPICS = [
  { id: 'any',     label: 'Любая',      emoji: '🎲' },
  { id: 'history', label: 'История',    emoji: '📜' },
  { id: 'science', label: 'Наука',      emoji: '🔬' },
  { id: 'nature',  label: 'Природа',    emoji: '🌿' },
  { id: 'art',     label: 'Искусство',  emoji: '🎨' },
  { id: 'tech',    label: 'Технологии', emoji: '💻' },
];

export function EssayScreen() {
  const { settings } = useSettings();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const llama = useLlama();

  const [stage, setStage] = useState<Stage>('level-select');
  const [level, setLevel] = useState(3);
  const [topic, setTopic] = useState('any');
  const [sourceText, setSourceText] = useState('');
  const [essayTopic, setEssayTopic] = useState('');
  const [retellingInput, setRetellingInput] = useState('');
  const [essayInput, setEssayInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<EssaySession[]>([]);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [historyDone, setHistoryDone] = useState(false);
  const PAGE = 3;

  const loadHistory = useCallback(async (offset: number, replace = false) => {
    const rows = await getEssaySessions(PAGE + 1, offset);
    const hasMore = rows.length > PAGE;
    const page = rows.slice(0, PAGE);
    setHistory(prev => replace ? page : [...prev, ...page]);
    setHistoryOffset(offset + PAGE);
    setHistoryDone(!hasMore);
  }, []);

  useEffect(() => { loadHistory(0, true); }, [loadHistory]);

  const checkAI = (): boolean => {
    if (llama.isReady || settings.claudeApiKey) return true;
    Alert.alert(
      'Нужен AI',
      'Загрузи модель на устройство (кнопка выше) или укажи API-ключ Claude в настройках.',
    );
    return false;
  };

  const aiGenerate = async (system: string, user: string, maxTokens = 600): Promise<string> => {
    if (llama.isReady) {
      return llama.generate(system, user, maxTokens);
    }
    return claudeChat(settings.claudeApiKey, [{ role: 'user', content: user }], system);
  };

  const generateText = async () => {
    if (!checkAI()) return;
    setLoading(true);
    try {
      const topicDesc = topic !== 'any' ? `, тема: ${TOPICS.find(t => t.id === topic)?.label ?? topic}` : '';
      const text = await aiGenerate(
        SYSTEM_GENERATE,
        `Уровень сложности: ${level}/5${topicDesc}`,
        700,
      );
      setSourceText(text);
      setStage('reading');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkRetelling = async () => {
    if (!retellingInput.trim()) return;
    if (!checkAI()) return;
    setLoading(true);
    try {
      const result = await aiGenerate(
        SYSTEM_CHECK_RETELLING,
        `Оригинальный текст:\n${sourceText}\n\nИзложение ученика:\n${retellingInput}`,
        600,
      );
      setFeedback(result);
      setStage('feedback-retelling');
      await addXp(ESSAY_XP.retelling);
      await saveEssaySession('retelling', sourceText, retellingInput, result);
      loadHistory(0, true);
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const generateEssayTopic = async () => {
    if (!checkAI()) return;
    setLoading(true);
    try {
      const topicDesc = topic !== 'any' ? `, тема: ${TOPICS.find(t => t.id === topic)?.label ?? topic}` : '';
      const result = await aiGenerate(
        SYSTEM_ESSAY_TOPIC,
        `Уровень сложности: ${level}/5${topicDesc}`,
        100,
      );
      setEssayTopic(result);
      setStage('writing-essay');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkEssay = async () => {
    if (!essayInput.trim()) return;
    if (!checkAI()) return;
    setLoading(true);
    try {
      const result = await aiGenerate(
        SYSTEM_CHECK_ESSAY,
        `Тема сочинения: ${essayTopic}\n\nСочинение ученика:\n${essayInput}`,
        600,
      );
      setFeedback(result);
      setStage('feedback-essay');
      await addXp(ESSAY_XP.essay);
      await saveEssaySession('essay', essayTopic, essayInput, result);
      loadHistory(0, true);
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage('level-select');
    setSourceText(''); setEssayTopic(''); setRetellingInput('');
    setEssayInput(''); setFeedback('');
  };

  const isWorking = loading || llama.status === 'inferring';

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {stage === 'level-select' && (
          <LevelSelect level={level} topic={topic}
            onLevelChange={setLevel} onTopicChange={setTopic}
            onGenerate={generateText} loading={isWorking}
            llamaStatus={llama.status} llamaProgress={llama.progress}
            llamaError={llama.errorMessage}
            onDownload={llama.download}
            hasApiKey={!!settings.claudeApiKey}
            history={history} historyDone={historyDone}
            onLoadMore={() => loadHistory(historyOffset)}
            s={s} colors={colors} />
        )}
        {stage === 'reading' && (
          <Reading text={sourceText} onDone={() => setStage('writing-retelling')} s={s} />
        )}
        {stage === 'writing-retelling' && (
          <Writing title="Напиши изложение" hint="Перескажи прочитанный текст своими словами"
            value={retellingInput} onChange={setRetellingInput}
            onSubmit={checkRetelling} loading={isWorking} s={s} colors={colors} />
        )}
        {stage === 'feedback-retelling' && (
          <Feedback title="Обратная связь" text={feedback}
            onNext={generateEssayTopic} nextLabel="Перейти к сочинению →"
            loading={isWorking} s={s} />
        )}
        {stage === 'writing-essay' && (
          <Writing title={`Сочинение: ${essayTopic}`} hint="Напиши своё сочинение по теме"
            value={essayInput} onChange={setEssayInput}
            onSubmit={checkEssay} loading={isWorking} s={s} colors={colors} />
        )}
        {(stage === 'checking-retelling' || stage === 'checking-essay') && (
          <View style={s.center}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={s.loadingText}>Проверяю...</Text>
          </View>
        )}
        {stage === 'feedback-essay' && (
          <Feedback title="Обратная связь" text={feedback}
            onNext={reset} nextLabel="Начать заново"
            loading={false} s={s} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Model banner ─────────────────────────────────────────────────────────────

function ModelBanner({ status, progress, errorMessage, onDownload, s, colors }: {
  status: LlamaStatus; progress: number; errorMessage: string | null;
  onDownload: () => void; s: any; colors: Colors;
}) {
  if (status === 'ready') return null;

  if (status === 'requires_build') {
    return (
      <View style={s.banner}>
        <Text style={s.bannerText}>Для AI на устройстве нужна нативная сборка (expo run:android / expo run:ios)</Text>
      </View>
    );
  }

  if (status === 'downloading') {
    const pct = Math.round(progress);
    return (
      <View style={s.banner}>
        <View style={s.bannerRow}>
          <Text style={s.bannerTitle}>Загружаю модель… {pct}%</Text>
          <Text style={s.bannerSub}>~1.1 ГБ · не закрывай приложение</Text>
        </View>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${pct}%` as any }]} />
        </View>
      </View>
    );
  }

  if (status === 'loading_model') {
    return (
      <View style={s.banner}>
        <ActivityIndicator size="small" color={colors.mint} />
        <Text style={s.bannerTitle}>Загружаю модель в память…</Text>
      </View>
    );
  }

  // idle or error
  return (
    <View style={s.bannerDownload}>
      <View style={s.bannerDownloadInfo}>
        <Text style={s.bannerTitle}>AI на устройстве</Text>
        <Text style={s.bannerSub}>Qwen2.5-1.5B · ~1.1 ГБ · бесплатно</Text>
        {errorMessage && <Text style={s.bannerError}>{errorMessage}</Text>}
      </View>
      <TouchableOpacity style={s.bannerBtn} onPress={onDownload} activeOpacity={0.85}>
        <Icon name="arrow-down" size={14} color="#fff" />
        <Text style={s.bannerBtnText}>{status === 'error' ? 'Повтор' : 'Скачать'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Sub-screens ───────────────────────────────────────────────────────────────

function LevelSelect({ level, topic, onLevelChange, onTopicChange, onGenerate, loading,
  llamaStatus, llamaProgress, llamaError, onDownload, hasApiKey,
  history, historyDone, onLoadMore, s, colors }: {
  level: number; topic: string;
  onLevelChange: (v: number) => void; onTopicChange: (v: string) => void;
  onGenerate: () => void; loading: boolean;
  llamaStatus: LlamaStatus; llamaProgress: number; llamaError: string | null;
  onDownload: () => void; hasApiKey: boolean;
  history: EssaySession[]; historyDone: boolean; onLoadMore: () => void;
  s: any; colors: Colors;
}) {
  const current = LEVELS[level - 1];
  const aiReady = llamaStatus === 'ready';
  const generateLabel = aiReady
    ? 'Сгенерировать текст'
    : hasApiKey ? 'Сгенерировать текст (Cloud)' : 'Сгенерировать текст';

  return (
    <View>
      <LinearGradient
        colors={['#2A2249', '#5B47E0', '#7B5FE8']}
        style={s.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={s.heroIconRow}>
          <Icon name="book" size={20} color="#fff" strokeWidth={2} />
          <Text style={s.heroTag}>Изложение · AI</Text>
        </View>
        <Text style={s.heroTitle}>Перескажи текст{'\n'}своими словами</Text>
        <Text style={s.heroDesc}>AI сгенерирует текст под твой уровень. Прочти, перескажи — получи разбор.</Text>
      </LinearGradient>

      <View style={s.section}>
        {/* Model banner — hidden when ready */}
        <ModelBanner
          status={llamaStatus} progress={llamaProgress}
          errorMessage={llamaError} onDownload={onDownload}
          s={s} colors={colors}
        />

        {/* Level grid */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>Уровень</Text>
          <Text style={[s.sectionValue, { color: current.color }]}>{current.words} слов</Text>
        </View>
        <View style={s.levelGrid}>
          {LEVELS.map(l => (
            <TouchableOpacity
              key={l.value}
              style={[s.levelCell, level === l.value && { backgroundColor: l.color, borderColor: l.color }]}
              onPress={() => onLevelChange(l.value)}
              activeOpacity={0.85}
            >
              <Text style={[s.levelNum, level === l.value && { color: '#fff' }]}>{l.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[s.levelDesc, { backgroundColor: current.color + '18', borderColor: current.color + '44' }]}>
          <Text style={[s.levelDescTitle, { color: current.color }]}>{current.label}</Text>
          <Text style={s.levelDescSub}>{current.words} слов</Text>
        </View>

        {/* Topics */}
        <Text style={[s.sectionLabel, { marginTop: 16, marginBottom: 10 }]}>Тема</Text>
        <View style={s.topicsWrap}>
          {TOPICS.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[s.topicChip, topic === t.id && s.topicChipActive]}
              onPress={() => onTopicChange(t.id)}
              activeOpacity={0.8}
            >
              <Text style={s.topicEmoji}>{t.emoji}</Text>
              <Text style={[s.topicLabel, topic === t.id && { color: '#fff' }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[s.btn, loading && s.btnDisabled]}
          onPress={onGenerate}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="wand" size={18} color="#fff" strokeWidth={1.75} />
              <Text style={s.btnText}>{generateLabel}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {history.length > 0 && (
        <View style={s.section}>
          <Text style={[s.sectionLabel, { marginBottom: 10 }]}>История</Text>
          {history.map(item => (
            <View key={item.id} style={s.historyCard}>
              <View style={s.historyCardHeader}>
                <Text style={s.historyType}>
                  {item.type === 'retelling' ? 'Изложение' : 'Сочинение'}
                </Text>
                <Text style={s.historyDate}>
                  {new Date(item.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <Text style={s.historySource} numberOfLines={2}>{item.source_text}</Text>
              <Text style={s.historyFeedback} numberOfLines={3}>{item.feedback}</Text>
            </View>
          ))}
          {!historyDone && (
            <TouchableOpacity style={s.loadMoreBtn} onPress={onLoadMore} activeOpacity={0.75}>
              <Text style={s.loadMoreText}>Загрузить ещё</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function Reading({ text, onDone, s }: { text: string; onDone: () => void; s: any }) {
  return (
    <View style={s.section}>
      <Text style={s.stageTitle}>Прочитай текст</Text>
      <View style={s.textBox}>
        <Text style={s.sourceText}>{text}</Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={onDone} activeOpacity={0.85}>
        <Text style={s.btnText}>Готов писать изложение →</Text>
      </TouchableOpacity>
    </View>
  );
}

function Writing({ title, hint, value, onChange, onSubmit, loading, s, colors }: {
  title: string; hint: string; value: string;
  onChange: (v: string) => void; onSubmit: () => void; loading: boolean; s: any; colors: Colors;
}) {
  return (
    <View style={s.section}>
      <Text style={s.stageTitle}>{title}</Text>
      <Text style={s.stageHint}>{hint}</Text>
      <TextInput
        style={s.textarea}
        multiline
        value={value}
        onChangeText={onChange}
        placeholder="Начни писать здесь..."
        placeholderTextColor={colors.text4}
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[s.btn, (!value.trim() || loading) && s.btnDisabled]}
        onPress={onSubmit}
        disabled={!value.trim() || loading}
        activeOpacity={0.85}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Проверить →</Text>}
      </TouchableOpacity>
    </View>
  );
}

function Feedback({ title, text, onNext, nextLabel, loading, s }: {
  title: string; text: string; onNext: () => void; nextLabel: string; loading: boolean; s: any;
}) {
  return (
    <View style={s.section}>
      <Text style={s.stageTitle}>{title}</Text>
      <View style={s.feedbackBox}>
        <View style={s.feedbackHeader}>
          <Icon name="sparkle" size={16} color="#3CA86E" />
          <Text style={s.feedbackHeaderText}>Анализ от AI</Text>
        </View>
        <Text style={s.feedbackText}>{text}</Text>
      </View>
      <TouchableOpacity
        style={[s.btn, loading && s.btnDisabled]}
        onPress={onNext}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{nextLabel}</Text>}
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  scroll: { paddingBottom: 40 },
  hero: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  heroIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  heroTag: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.9)', letterSpacing: 0.5, textTransform: 'uppercase' },
  heroTitle: { fontSize: 30, fontWeight: '800', color: '#fff', lineHeight: 38, marginBottom: 10, letterSpacing: -0.5 },
  heroDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: c.text2, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionValue: { fontSize: 13, fontWeight: '700' },
  levelGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  levelCell: {
    flex: 1, aspectRatio: 1, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border,
  },
  levelNum: { fontSize: 20, fontWeight: '800', color: c.text3 },
  levelDesc: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 4,
  },
  levelDescTitle: { fontSize: 15, fontWeight: '700' },
  levelDescSub: { fontSize: 13, color: c.text3 },
  topicsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  topicChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99,
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
  },
  topicChipActive: { backgroundColor: c.accent, borderColor: c.accent },
  topicEmoji: { fontSize: 14 },
  topicLabel: { fontSize: 13, fontWeight: '700', color: c.text },
  btn: {
    backgroundColor: c.accent, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  stageTitle: { fontSize: 22, fontWeight: '800', color: c.text, marginBottom: 8, letterSpacing: -0.3 },
  stageHint: { fontSize: 14, color: c.text3, marginBottom: 14, lineHeight: 20 },
  textBox: {
    backgroundColor: c.surface, borderRadius: 14, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: c.border,
  },
  sourceText: { color: c.text, fontSize: 16, lineHeight: 26 },
  textarea: {
    backgroundColor: c.inputBg, borderRadius: 14, padding: 14,
    color: c.text, fontSize: 15, borderWidth: 1, borderColor: c.border,
    minHeight: 180, marginBottom: 16,
  },
  feedbackBox: {
    backgroundColor: c.successBg, borderRadius: 14, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: c.successBorder,
  },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  feedbackHeaderText: { fontSize: 12, fontWeight: '800', color: c.mint, textTransform: 'uppercase', letterSpacing: 0.5 },
  feedbackText: { color: c.successText, fontSize: 15, lineHeight: 24 },
  center: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  loadingText: { color: c.text3, fontSize: 16 },

  // Model banner
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: c.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: c.border, marginBottom: 20,
  },
  bannerRow: { flex: 1 },
  bannerTitle: { fontSize: 13, fontWeight: '700', color: c.text },
  bannerSub: { fontSize: 11, color: c.text4, marginTop: 2 },
  bannerText: { flex: 1, fontSize: 12, color: c.text4, lineHeight: 16 },
  bannerError: { fontSize: 11, color: c.rateForgot ?? '#E0455A', marginTop: 3 },
  bannerDownload: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: c.mintSoft, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: c.mint + '40', marginBottom: 20,
  },
  bannerDownloadInfo: { flex: 1, marginRight: 12 },
  bannerBtn: {
    backgroundColor: c.mint, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  bannerBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  progressTrack: {
    height: 4, backgroundColor: c.border, borderRadius: 2, marginTop: 8, overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: c.mint, borderRadius: 2 },
  historyCard: {
    backgroundColor: c.surface2, borderRadius: 14, padding: 14, marginBottom: 10,
  },
  historyCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  historyType: { fontSize: 13, fontWeight: '700', color: c.accent },
  historyDate: { fontSize: 12, color: c.text4 },
  historySource: { fontSize: 13, color: c.text2, marginBottom: 6, lineHeight: 18 },
  historyFeedback: { fontSize: 12, color: c.text3, lineHeight: 17 },
  loadMoreBtn: { alignItems: 'center', paddingVertical: 12 },
  loadMoreText: { color: c.accent, fontSize: 14, fontWeight: '600' },
});

// ── Prompts ───────────────────────────────────────────────────────────────────

const SYSTEM_GENERATE = `Ты учитель русского языка. Сгенерируй текст для изложения.
Уровень 1 — очень простой (80-120 слов). Уровень 2 — простой (120-180 слов).
Уровень 3 — средний (180-280 слов). Уровень 4 — сложный (280-400 слов).
Уровень 5 — продвинутый (400+ слов).
Если указана тема, сгенерируй текст по ней.
Верни только сам текст без заголовков и пояснений.`;

const SYSTEM_CHECK_RETELLING = `Ты учитель русского языка. Проверь изложение ученика.
Дай подробную обратную связь:
1. Что передано верно
2. Что упущено или искажено
3. Ошибки в стиле и языке
4. Конкретные советы по улучшению
Пиши на русском языке, дружелюбно и конструктивно.`;

const SYSTEM_ESSAY_TOPIC = `Ты учитель русского языка. Предложи интересную тему для сочинения.
Уровень 1-2: простые бытовые темы.
Уровень 3: размышления о жизни, природе.
Уровень 4-5: философские, социальные темы.
Если указана конкретная тема, предложи тему из этой области.
Верни только формулировку темы без лишних слов.`;

const SYSTEM_CHECK_ESSAY = `Ты учитель русского языка. Проверь сочинение ученика.
Дай подробную обратную связь:
1. Раскрытие темы
2. Структура и логика
3. Языковые и стилевые достоинства
4. Ошибки и недостатки
5. Конкретные советы по улучшению слога
Пиши на русском языке, дружелюбно и конструктивно.`;
