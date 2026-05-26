import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../../context/SettingsContext';
import { claudeChat } from '../../services/claude';

type Stage =
  | 'level-select'
  | 'reading'
  | 'writing-retelling'
  | 'checking-retelling'
  | 'feedback-retelling'
  | 'writing-essay'
  | 'checking-essay'
  | 'feedback-essay';

const LEVELS: { value: number; label: string; desc: string }[] = [
  { value: 1, label: '1', desc: 'Начальный — простые тексты' },
  { value: 2, label: '2', desc: 'Ниже среднего' },
  { value: 3, label: '3', desc: 'Средний уровень' },
  { value: 4, label: '4', desc: 'Выше среднего' },
  { value: 5, label: '5', desc: 'Продвинутый' },
];

export function EssayScreen() {
  const { settings } = useSettings();
  const [stage, setStage] = useState<Stage>('level-select');
  const [level, setLevel] = useState(3);
  const [sourceText, setSourceText] = useState('');
  const [essayTopic, setEssayTopic] = useState('');
  const [retellingInput, setRetellingInput] = useState('');
  const [essayInput, setEssayInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const checkKey = () => {
    if (!settings.claudeApiKey) {
      Alert.alert('Нет токена', 'Укажи токен Claude API в настройках');
      return false;
    }
    return true;
  };

  const generateText = async () => {
    if (!checkKey()) return;
    setLoading(true);
    try {
      const text = await claudeChat(
        settings.claudeApiKey,
        [{ role: 'user', content: `Уровень сложности: ${level}/5` }],
        SYSTEM_GENERATE,
      );
      setSourceText(text.trim());
      setStage('reading');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkRetelling = async () => {
    if (!retellingInput.trim()) return;
    if (!checkKey()) return;
    setLoading(true);
    try {
      const result = await claudeChat(
        settings.claudeApiKey,
        [
          {
            role: 'user',
            content: `Оригинальный текст:\n${sourceText}\n\nИзложение ученика:\n${retellingInput}`,
          },
        ],
        SYSTEM_CHECK_RETELLING,
      );
      setFeedback(result.trim());
      setStage('feedback-retelling');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const generateEssayTopic = async () => {
    if (!checkKey()) return;
    setLoading(true);
    try {
      const topic = await claudeChat(
        settings.claudeApiKey,
        [{ role: 'user', content: `Уровень сложности: ${level}/5` }],
        SYSTEM_ESSAY_TOPIC,
      );
      setEssayTopic(topic.trim());
      setStage('writing-essay');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkEssay = async () => {
    if (!essayInput.trim()) return;
    if (!checkKey()) return;
    setLoading(true);
    try {
      const result = await claudeChat(
        settings.claudeApiKey,
        [
          {
            role: 'user',
            content: `Тема сочинения: ${essayTopic}\n\nСочинение ученика:\n${essayInput}`,
          },
        ],
        SYSTEM_CHECK_ESSAY,
      );
      setFeedback(result.trim());
      setStage('feedback-essay');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage('level-select');
    setSourceText('');
    setEssayTopic('');
    setRetellingInput('');
    setEssayInput('');
    setFeedback('');
  };

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {stage === 'level-select' && (
          <LevelSelect level={level} onChange={setLevel} onNext={generateText} loading={loading} />
        )}
        {stage === 'reading' && (
          <Reading
            text={sourceText}
            onDone={() => setStage('writing-retelling')}
          />
        )}
        {stage === 'writing-retelling' && (
          <Writing
            title="Напиши изложение"
            hint="Перескажи прочитанный текст своими словами"
            value={retellingInput}
            onChange={setRetellingInput}
            onSubmit={checkRetelling}
            loading={loading}
          />
        )}
        {stage === 'feedback-retelling' && (
          <Feedback
            title="Обратная связь по изложению"
            text={feedback}
            onNext={generateEssayTopic}
            nextLabel="Перейти к сочинению →"
            loading={loading}
          />
        )}
        {stage === 'writing-essay' && (
          <Writing
            title={`Сочинение: ${essayTopic}`}
            hint="Напиши своё сочинение по теме"
            value={essayInput}
            onChange={setEssayInput}
            onSubmit={checkEssay}
            loading={loading}
          />
        )}
        {(stage === 'checking-retelling' || stage === 'checking-essay') && (
          <View style={s.center}>
            <ActivityIndicator color="#7c6af7" size="large" />
            <Text style={s.loadingText}>Проверяю...</Text>
          </View>
        )}
        {stage === 'feedback-essay' && (
          <Feedback
            title="Обратная связь по сочинению"
            text={feedback}
            onNext={reset}
            nextLabel="Начать заново"
            loading={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LevelSelect({
  level, onChange, onNext, loading,
}: {
  level: number;
  onChange: (v: number) => void;
  onNext: () => void;
  loading: boolean;
}) {
  return (
    <View>
      <Text style={s.title}>Выбери уровень сложности</Text>
      <View style={s.levels}>
        {LEVELS.map(l => (
          <TouchableOpacity
            key={l.value}
            style={[s.levelBtn, level === l.value && s.levelBtnActive]}
            onPress={() => onChange(l.value)}
          >
            <Text style={[s.levelNum, level === l.value && s.levelNumActive]}>{l.label}</Text>
            <Text style={[s.levelDesc, level === l.value && s.levelDescActive]}>{l.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={onNext} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnText}>Сгенерировать текст →</Text>}
      </TouchableOpacity>
    </View>
  );
}

function Reading({ text, onDone }: { text: string; onDone: () => void }) {
  return (
    <View>
      <Text style={s.title}>Прочитай текст</Text>
      <View style={s.textBox}>
        <Text style={s.sourceText}>{text}</Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={onDone}>
        <Text style={s.btnText}>Готов писать изложение →</Text>
      </TouchableOpacity>
    </View>
  );
}

function Writing({
  title, hint, value, onChange, onSubmit, loading,
}: {
  title: string; hint: string; value: string;
  onChange: (v: string) => void; onSubmit: () => void; loading: boolean;
}) {
  return (
    <View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.hint}>{hint}</Text>
      <TextInput
        style={s.textarea}
        multiline
        numberOfLines={10}
        value={value}
        onChangeText={onChange}
        placeholder="Начни писать здесь..."
        placeholderTextColor="#555"
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[s.btn, (!value.trim() || loading) && s.btnDisabled]}
        onPress={onSubmit}
        disabled={!value.trim() || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnText}>Проверить →</Text>}
      </TouchableOpacity>
    </View>
  );
}

function Feedback({
  title, text, onNext, nextLabel, loading,
}: {
  title: string; text: string; onNext: () => void; nextLabel: string; loading: boolean;
}) {
  return (
    <View>
      <Text style={s.title}>{title}</Text>
      <View style={s.feedbackBox}>
        <Text style={s.feedbackText}>{text}</Text>
      </View>
      <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={onNext} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnText}>{nextLabel}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const SYSTEM_GENERATE = `Ты учитель русского языка. Сгенерируй текст для изложения.
Уровень 1 — очень простой текст (50-80 слов).
Уровень 2 — простой (80-120 слов).
Уровень 3 — средний (120-180 слов).
Уровень 4 — сложный (180-250 слов).
Уровень 5 — продвинутый (250-350 слов).
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
Верни только формулировку темы без лишних слов.`;

const SYSTEM_CHECK_ESSAY = `Ты учитель русского языка. Проверь сочинение ученика.
Дай подробную обратную связь:
1. Раскрытие темы
2. Структура и логика
3. Языковые и стилевые достоинства
4. Ошибки и недостатки
5. Конкретные советы по улучшению слога
Пиши на русском языке, дружелюбно и конструктивно.`;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 16 },
  hint: { fontSize: 14, color: '#aaa', marginBottom: 12 },
  levels: { gap: 8, marginBottom: 20 },
  levelBtn: {
    backgroundColor: '#1e1e30',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  levelBtnActive: { borderColor: '#7c6af7', backgroundColor: '#2a2040' },
  levelNum: { fontSize: 18, fontWeight: '700', color: '#666' },
  levelNumActive: { color: '#7c6af7' },
  levelDesc: { fontSize: 13, color: '#555', marginTop: 2 },
  levelDescActive: { color: '#bbb' },
  textBox: {
    backgroundColor: '#1e1e30',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  sourceText: { color: '#e0e0e0', fontSize: 16, lineHeight: 26 },
  textarea: {
    backgroundColor: '#1e1e30',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2d2d4e',
    minHeight: 180,
    marginBottom: 16,
  },
  feedbackBox: {
    backgroundColor: '#1a2a1a',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a4a2a',
  },
  feedbackText: { color: '#c8e6c9', fontSize: 15, lineHeight: 24 },
  btn: {
    backgroundColor: '#7c6af7',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#3a3a5a', opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  center: { alignItems: 'center', paddingVertical: 40, gap: 16 },
  loadingText: { color: '#aaa', fontSize: 16 },
});
