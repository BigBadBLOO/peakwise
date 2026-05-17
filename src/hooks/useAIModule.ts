import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import { TurboModuleRegistry } from 'react-native';

// llama.rn requires a native dev build (expo run:android / expo run:ios).
// In Expo Go, the native module is not available — we degrade gracefully.
const isLlamaAvailable = TurboModuleRegistry.get('RNLlama') !== null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let initLlama: ((params: any) => Promise<any>) | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LlamaContext = any;

if (isLlamaAvailable) {
  // Dynamic import to avoid crashing when native module is absent
  const llamaModule = require('llama.rn') as typeof import('llama.rn');
  initLlama = llamaModule.initLlama;
}
import {
  Checkin,
  PlanDay,
  getProfileValue,
  setProfileValue,
  getCheckinByDate,
} from '../db/database';
import { useLang } from '../context/LanguageContext';
import {
  AIRecommendation,
  SYSTEM_PROMPT,
  buildUserMessage,
  parseAIResponse,
} from '../engine/aiPrompt';
import { getRecommendationType, getIntensityPercent } from '../engine/aiRecommendation';

export type ModuleStatus =
  | 'idle'
  | 'requires_build'
  | 'downloading'
  | 'loading_model'
  | 'ready'
  | 'inferring'
  | 'error';

export interface AIModuleState {
  status: ModuleStatus;
  progress: number;
  download: () => void;
  recommendation: AIRecommendation | null;
  intensityPercent: number;
  errorMessage: string | null;
  isDownloaded: boolean;
  isDownloading: boolean;
}

const MODEL_URL =
  'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf';
const MODEL_FILENAME = 'peakwise_ai_model.gguf';

function getModelUri(): string {
  return (FileSystem.documentDirectory ?? '') + MODEL_FILENAME;
}

// Module-level singleton — survives re-renders and navigation
let sharedContext: LlamaContext | null = null;

async function loadModel(
  onStatus: (s: ModuleStatus) => void,
): Promise<LlamaContext> {
  if (sharedContext) return sharedContext;
  if (!initLlama) throw new Error('llama.rn native module not available');
  onStatus('loading_model');
  const modelUri = getModelUri();
  sharedContext = await initLlama(
    {
      model: modelUri,
      n_ctx: 512,
      n_threads: 4,
      n_gpu_layers: 0,
    },
    () => {},
  );
  return sharedContext;
}

export function useAIModule(todayPlan: PlanDay | null): AIModuleState {
  const { lang } = useLang();
  const [status, setStatus] = useState<ModuleStatus>(
    isLlamaAvailable ? 'idle' : 'requires_build',
  );
  const [progress, setProgress] = useState(0);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const downloadRef = useRef<FileSystem.DownloadResumable | null>(null);

  // Load checkin on focus
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') return;
      const today = new Date().toISOString().split('T')[0];
      getCheckinByDate(today).then(c => setCheckin(c));
    }, []),
  );

  // On mount: check if model was already downloaded
  useEffect(() => {
    if (Platform.OS === 'web' || !isLlamaAvailable) return;
    (async () => {
      const flag = await getProfileValue('ai_module_downloaded').catch(() => null);
      if (flag !== '1') return;
      const info = await FileSystem.getInfoAsync(getModelUri());
      if (!info.exists) {
        // File gone (e.g. app reinstall) — reset flag
        await setProfileValue('ai_module_downloaded', '0').catch(() => {});
        return;
      }
      try {
        const ctx = await loadModel(setStatus);
        sharedContext = ctx;
        setStatus('inferring');
        await runInference(ctx);
      } catch (e: unknown) {
        setErrorMessage(e instanceof Error ? e.message : 'Model load failed');
        setStatus('error');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runInference = useCallback(async (ctx: LlamaContext) => {
    setStatus('inferring');
    try {
      const userMsg = buildUserMessage(checkin, todayPlan, lang);
      const result = await ctx.completion({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg },
        ],
        n_predict: 200,
        temperature: 0.1,
        top_p: 0.9,
        stop: ['<|im_end|>', '<|endoftext|>'],
        jinja: true,
      });
      const parsed = parseAIResponse(result.text);
      if (parsed) {
        setRecommendation(parsed);
      } else {
        // Fallback: rules-based classification with empty text (card will use i18n recs)
        const type = getRecommendationType(checkin, todayPlan);
        setRecommendation({ intensity: type, title: '', explanation: '' });
      }
      setStatus('ready');
    } catch (e: unknown) {
      setErrorMessage(e instanceof Error ? e.message : 'Inference failed');
      setStatus('error');
    }
  }, [checkin, todayPlan, lang]);

  const download = useCallback(() => {
    if (!isLlamaAvailable || (status !== 'idle' && status !== 'error')) return;
    setStatus('downloading');
    setProgress(0);
    setErrorMessage(null);

    const modelUri = getModelUri();
    const resumable = FileSystem.createDownloadResumable(
      MODEL_URL,
      modelUri,
      {},
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        if (totalBytesExpectedToWrite > 0) {
          setProgress((totalBytesWritten / totalBytesExpectedToWrite) * 100);
        }
      },
    );
    downloadRef.current = resumable;

    resumable.downloadAsync()
      .then(async () => {
        await setProfileValue('ai_module_downloaded', '1').catch(() => {});
        const ctx = await loadModel(setStatus);
        sharedContext = ctx;
        await runInference(ctx);
      })
      .catch((e: unknown) => {
        setErrorMessage(e instanceof Error ? e.message : 'Download failed');
        setStatus('error');
      });
  }, [status, runInference]);

  const intensityPercent = recommendation
    ? getIntensityPercent(recommendation.intensity)
    : 0;

  return {
    status,
    progress,
    download,
    recommendation,
    intensityPercent,
    errorMessage,
    isDownloaded: status === 'ready' || status === 'inferring',
    isDownloading: status === 'downloading',
  };
}
