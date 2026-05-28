import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../../context/SettingsContext';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import { claudeChat } from '../../services/claude';
import { addXp, ESSAY_XP } from '../../db/stats';
import { saveEssaySession, getEssaySessions, EssaySession } from '../../db/essays';
import { useLlama, LlamaStatus } from '../../hooks/useLlama';

type Mode = 'retelling' | 'essay' | 'both';

type Stage =
  | 'mode-select'
  | 'level-select'
  | 'reading'
  | 'writing-retelling'
  | 'feedback-retelling'
  | 'writing-essay'
  | 'feedback-essay'
  | 'history-detail';

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

const MODES: { id: Mode; icon: string; label: string; desc: string; color: string }[] = [
  { id: 'retelling', icon: '📖', label: 'Изложение',        desc: 'Прочти текст и перескажи своими словами', color: '#5B47E0' },
  { id: 'essay',     icon: '✏️', label: 'Сочинение',        desc: 'Напиши на заданную тему',                 color: '#3CA86E' },
  { id: 'both',      icon: '🎯', label: 'Изложение + Сочинение', desc: 'Полный урок: оба задания подряд',    color: '#EC8B2F' },
];

export function EssayScreen() {
  const { settings } = useSettings();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const llama = useLlama();

  const [mode, setMode] = useState<Mode>('retelling');
  const [stage, setStage] = useState<Stage>('mode-select');
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
  const [selectedSession, setSelectedSession] = useState<EssaySession | null>(null);
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
    Alert.alert('Нужен AI', 'Загрузи модель на устройство или укажи API-ключ Claude в настройках.');
    return false;
  };

  const aiGenerate = async (system: string, user: string, maxTokens = 600): Promise<string> => {
    if (llama.isReady) return llama.generate(system, user, maxTokens);
    return claudeChat(settings.claudeApiKey, [{ role: 'user', content: user }], system);
  };

  const aiGenerateText = async (level: number, topicDesc: string): Promise<string> => {
    const user = `Напиши текст для изложения. Уровень сложности: ${level}/5${topicDesc}.\nТекст:`;
    for (let attempt = 0; attempt < 3; attempt++) {
      const text = await aiGenerate(SYSTEM_GENERATE, user, 700);
      if (isValidGeneratedText(text, level)) return text;
    }
    throw new Error('Не удалось сгенерировать текст. Попробуй ещё раз.');
  };

  const generateText = async () => {
    if (!checkAI()) return;
    setLoading(true);
    try {
      const topicDesc = topic !== 'any' ? `, тема: ${TOPICS.find(t => t.id === topic)?.label ?? topic}` : '';
      const text = await aiGenerateText(level, topicDesc);
      setSourceText(text);
      setStage('reading');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkRetelling = async () => {
    if (!retellingInput.trim() || !checkAI()) return;
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
      const result = await aiGenerate(SYSTEM_ESSAY_TOPIC, `Уровень сложности: ${level}/5${topicDesc}`, 100);
      setEssayTopic(result);
      setStage('writing-essay');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkEssay = async () => {
    if (!essayInput.trim() || !checkAI()) return;
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
    setStage('mode-select');
    setSourceText(''); setEssayTopic(''); setRetellingInput('');
    setEssayInput(''); setFeedback('');
  };

  const selectMode = (m: Mode) => { setMode(m); setStage('level-select'); };

  const isWorking = loading || llama.status === 'inferring';

  // After retelling feedback: go to essay if mode=both, else reset
  const afterRetelling = mode === 'both' ? generateEssayTopic : reset;
  const afterRetellingLabel = mode === 'both' ? 'Перейти к сочинению →' : 'Начать заново';

  // Generate button action and label for level-select
  const onGenerate = mode === 'essay' ? generateEssayTopic : generateText;
  const generateLabel = mode === 'essay' ? 'Придумать тему' : 'Сгенерировать текст';

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {stage === 'mode-select' && (
          <ModeSelect
            onSelect={selectMode}
            history={history} historyDone={historyDone}
            onLoadMore={() => loadHistory(historyOffset)}
            onHistoryItem={item => { setSelectedSession(item); setStage('history-detail'); }}
            llamaStatus={llama.status} llamaProgress={llama.progress}
            llamaError={llama.errorMessage} onDownload={llama.download} onDelete={llama.deleteModel}
            s={s} colors={colors}
          />
        )}

        {stage === 'history-detail' && selectedSession && (
          <HistoryDetail session={selectedSession} onBack={() => setStage('mode-select')} s={s} colors={colors} />
        )}

        {stage === 'level-select' && (
          <LevelSelect
            mode={mode} level={level} topic={topic}
            onBack={() => setStage('mode-select')}
            onLevelChange={setLevel} onTopicChange={setTopic}
            onGenerate={onGenerate} generateLabel={generateLabel}
            loading={isWorking} s={s} colors={colors}
          />
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
            onNext={afterRetelling} nextLabel={afterRetellingLabel}
            loading={isWorking} s={s} />
        )}

        {stage === 'writing-essay' && (
          <Writing title={`Сочинение: ${essayTopic}`} hint="Напиши своё сочинение по теме"
            value={essayInput} onChange={setEssayInput}
            onSubmit={checkEssay} loading={isWorking} s={s} colors={colors} />
        )}

        {stage === 'feedback-essay' && (
          <Feedback title="Обратная связь" text={feedback}
            onNext={reset} nextLabel="Начать заново"
            loading={false} s={s} />
        )}

      </ScrollView>
    </View>
  );
}

// ── Mode select ───────────────────────────────────────────────────────────────

function ModeSelect({ onSelect, history, historyDone, onLoadMore, onHistoryItem,
  llamaStatus, llamaProgress, llamaError, onDownload, onDelete, s, colors }: {
  onSelect: (m: Mode) => void;
  history: EssaySession[]; historyDone: boolean; onLoadMore: () => void;
  onHistoryItem: (item: EssaySession) => void;
  llamaStatus: LlamaStatus; llamaProgress: number; llamaError: string | null;
  onDownload: () => void; onDelete: () => void; s: any; colors: Colors;
}) {
  return (
    <View>
      <LinearGradient
        colors={['#2A2249', '#5B47E0', '#7B5FE8']}
        style={s.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={s.heroIconRow}>
          <Icon name="book" size={20} color="#fff" />
          <Text style={s.heroTag}>Изложение · AI</Text>
        </View>
        <Text style={s.heroTitle}>Что будем{'\n'}делать сегодня?</Text>
        <Text style={s.heroDesc}>Выбери формат урока — AI подготовит задание под твой уровень.</Text>
      </LinearGradient>

      <View style={s.section}>
        <ModelBanner status={llamaStatus} progress={llamaProgress}
          errorMessage={llamaError} onDownload={onDownload} onDelete={onDelete} s={s} colors={colors} />

        {MODES.map(m => (
          <TouchableOpacity key={m.id} style={s.modeCard} onPress={() => onSelect(m.id)} activeOpacity={0.82}>
            <View style={[s.modeIcon, { backgroundColor: m.color + '22' }]}>
              <Text style={s.modeEmoji}>{m.icon}</Text>
            </View>
            <View style={s.modeInfo}>
              <Text style={s.modeLabel}>{m.label}</Text>
              <Text style={s.modeDesc}>{m.desc}</Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.text4} />
          </TouchableOpacity>
        ))}
      </View>

      {history.length > 0 && (
        <View style={s.section}>
          <Text style={[s.sectionLabel, { marginBottom: 10 }]}>История</Text>
          {history.map(item => (
            <TouchableOpacity key={item.id} style={s.historyCard} onPress={() => onHistoryItem(item)} activeOpacity={0.8}>
              <View style={s.historyCardHeader}>
                <Text style={s.historyType}>{item.type === 'retelling' ? 'Изложение' : 'Сочинение'}</Text>
                <Text style={s.historyDate}>
                  {new Date(item.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <Text style={s.historySource} numberOfLines={2}>{item.source_text}</Text>
              <Text style={s.historyFeedback} numberOfLines={3}>{item.feedback}</Text>
            </TouchableOpacity>
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

// ── Level select ──────────────────────────────────────────────────────────────

function LevelSelect({ mode, level, topic, onBack, onLevelChange, onTopicChange,
  onGenerate, generateLabel, loading, s, colors }: {
  mode: Mode; level: number; topic: string;
  onBack: () => void;
  onLevelChange: (v: number) => void; onTopicChange: (v: string) => void;
  onGenerate: () => void; generateLabel: string; loading: boolean;
  s: any; colors: Colors;
}) {
  const current = LEVELS[level - 1];
  const modeInfo = MODES.find(m => m.id === mode)!;

  return (
    <View>
      <LinearGradient
        colors={['#2A2249', '#5B47E0', '#7B5FE8']}
        style={s.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={s.backRow} onPress={onBack} activeOpacity={0.7}>
          <Icon name="chevron-left" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={s.backText}>Назад</Text>
        </TouchableOpacity>
        <Text style={s.heroTitle}>{modeInfo.label}</Text>
        <Text style={s.heroDesc}>{modeInfo.desc}</Text>
      </LinearGradient>

      <View style={s.section}>
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
          onPress={onGenerate} disabled={loading} activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <><Icon name="wand" size={18} color="#fff" /><Text style={s.btnText}>{generateLabel}</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Model banner ──────────────────────────────────────────────────────────────

function ModelBanner({ status, progress, errorMessage, onDownload, onDelete, s, colors }: {
  status: LlamaStatus; progress: number; errorMessage: string | null;
  onDownload: () => void; onDelete: () => void; s: any; colors: Colors;
}) {
  if (status === 'ready') {
    return (
      <View style={s.bannerReady}>
        <Text style={s.bannerReadyText}>✓ Gemma-2-2B загружена</Text>
        <TouchableOpacity onPress={onDelete} activeOpacity={0.7}>
          <Text style={s.bannerDeleteText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'requires_build') {
    return (
      <View style={s.banner}>
        <Text style={s.bannerText}>Для AI на устройстве нужна нативная сборка (expo run:android)</Text>
      </View>
    );
  }

  if (status === 'downloading') {
    const pct = Math.round(progress * 100);
    return (
      <View style={s.banner}>
        <View style={s.bannerRow}>
          <Text style={s.bannerTitle}>Загружаю модель… {pct}%</Text>
          <Text style={s.bannerSub}>~1.6 ГБ · не закрывай приложение</Text>
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

  return (
    <View style={s.bannerDownload}>
      <View style={s.bannerDownloadInfo}>
        <Text style={s.bannerTitle}>AI на устройстве</Text>
        <Text style={s.bannerSub}>Gemma-2-2B · ~1.6 ГБ · бесплатно</Text>
        {errorMessage && <Text style={s.bannerError}>{errorMessage}</Text>}
      </View>
      <TouchableOpacity style={s.bannerBtn} onPress={onDownload} activeOpacity={0.85}>
        <Icon name="arrow-down" size={14} color="#fff" />
        <Text style={s.bannerBtnText}>{status === 'error' ? 'Повтор' : 'Скачать'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── History detail ────────────────────────────────────────────────────────────

function HistoryDetail({ session, onBack, s, colors }: {
  session: EssaySession; onBack: () => void; s: any; colors: Colors;
}) {
  const date = new Date(session.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const typeLabel = session.type === 'retelling' ? 'Изложение' : 'Сочинение';

  return (
    <View style={s.detailContainer}>
      <TouchableOpacity style={s.backRow} onPress={onBack} activeOpacity={0.7}>
        <Icon name="back" size={18} color={colors.accent} />
        <Text style={[s.backText, { color: colors.accent }]}>Назад</Text>
      </TouchableOpacity>

      <View style={s.detailHeader}>
        <Text style={s.detailType}>{typeLabel}</Text>
        <Text style={s.detailDate}>{date}</Text>
      </View>

      <View style={s.detailSection}>
        <Text style={s.detailLabel}>{session.type === 'retelling' ? 'Исходный текст' : 'Тема'}</Text>
        <Text style={s.detailBody}>{session.source_text}</Text>
      </View>

      <View style={s.detailSection}>
        <Text style={s.detailLabel}>Твой ответ</Text>
        <Text style={s.detailBody}>{session.user_text}</Text>
      </View>

      <View style={[s.detailSection, s.detailFeedbackBox]}>
        <Text style={s.detailLabel}>Обратная связь</Text>
        <Text style={s.detailBody}>{session.feedback}</Text>
      </View>
    </View>
  );
}

// ── Reading / Writing / Feedback ──────────────────────────────────────────────

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
        style={s.textarea} multiline value={value} onChangeText={onChange}
        placeholder="Начни писать здесь..." placeholderTextColor={colors.text4}
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[s.btn, (!value.trim() || loading) && s.btnDisabled]}
        onPress={onSubmit} disabled={!value.trim() || loading} activeOpacity={0.85}
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
        onPress={onNext} disabled={loading} activeOpacity={0.85}
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
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  backText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: c.text2, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionValue: { fontSize: 13, fontWeight: '700' },
  // Mode cards
  modeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: c.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: c.border, marginBottom: 10,
  },
  modeIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modeEmoji: { fontSize: 22 },
  modeInfo: { flex: 1 },
  modeLabel: { fontSize: 16, fontWeight: '800', color: c.text, marginBottom: 3 },
  modeDesc: { fontSize: 13, color: c.text3, lineHeight: 18 },
  // Level grid
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
    backgroundColor: c.mint, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9,
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  bannerBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  progressTrack: { height: 4, backgroundColor: c.border, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: c.mint, borderRadius: 2 },
  bannerReady: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: c.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: c.border, marginBottom: 20,
  },
  bannerReadyText: { fontSize: 13, color: c.text3 },
  bannerDeleteText: { fontSize: 13, color: c.rateForgot ?? '#E0455A', fontWeight: '600' },
  // History
  historyCard: { backgroundColor: c.surface2, borderRadius: 14, padding: 14, marginBottom: 10 },
  historyCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  historyType: { fontSize: 13, fontWeight: '700', color: c.accent },
  historyDate: { fontSize: 12, color: c.text4 },
  historySource: { fontSize: 13, color: c.text2, marginBottom: 6, lineHeight: 18 },
  historyFeedback: { fontSize: 12, color: c.text3, lineHeight: 17 },
  loadMoreBtn: { alignItems: 'center', paddingVertical: 12 },
  loadMoreText: { color: c.accent, fontSize: 14, fontWeight: '600' },
  // History detail
  detailContainer: { padding: 20, paddingBottom: 40 },
  detailHeader: { marginBottom: 20 },
  detailType: { fontSize: 22, fontWeight: '800', color: c.text, marginBottom: 4 },
  detailDate: { fontSize: 13, color: c.text4 },
  detailSection: {
    backgroundColor: c.surface, borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: c.border,
  },
  detailFeedbackBox: { backgroundColor: c.accentSurface, borderColor: c.accent + '40' },
  detailLabel: { fontSize: 11, fontWeight: '700', color: c.text4, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  detailBody: { fontSize: 14, color: c.text, lineHeight: 22 },
});

// ── Prompts ───────────────────────────────────────────────────────────────────

const BAD_PATTERNS = [
  /добрый день/i, /как я могу помочь/i, /чем могу помочь/i,
  /я.*ассистент/i, /я.*помощник/i, /я.*языковая модель/i,
  /конечно.*помогу/i, /рад.*помочь/i,
];

function isValidGeneratedText(text: string, level: number): boolean {
  const trimmed = text.trim();
  const minWords = [40, 60, 90, 140, 200][level - 1] ?? 40;
  if (trimmed.split(/\s+/).length < minWords) return false;
  if (BAD_PATTERNS.some(p => p.test(trimmed))) return false;
  return true;
}

const SYSTEM_GENERATE = `Ты — генератор учебных текстов для изложений. Твоя единственная задача: написать связный художественный или научно-популярный текст на заданном уровне сложности.

Правила:
- Пиши только сам текст, без приветствий, пояснений и заголовков
- Не обращайся к пользователю
- Не объясняй, что ты делаешь
- Начинай текст сразу с первого предложения

Уровень 1 — 80-120 слов, простые предложения.
Уровень 2 — 120-180 слов, несложный язык.
Уровень 3 — 180-280 слов, средняя сложность.
Уровень 4 — 280-400 слов, богатый язык.
Уровень 5 — 400+ слов, сложный литературный стиль.`;

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
