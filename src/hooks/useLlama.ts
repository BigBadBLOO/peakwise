import { useCallback, useEffect, useRef, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { TurboModuleRegistry } from 'react-native';

export type LlamaStatus =
  | 'idle'
  | 'requires_build'
  | 'downloading'
  | 'loading_model'
  | 'ready'
  | 'inferring'
  | 'error';

export interface UseLlamaResult {
  status: LlamaStatus;
  progress: number;
  errorMessage: string | null;
  isReady: boolean;
  download: () => void;
  deleteModel: () => Promise<void>;
  generate: (system: string, user: string, maxTokens?: number) => Promise<string>;
}

const MODEL_URL =
  'https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf';
const MODEL_FILE = 'peakwise_model.gguf';
const MIN_MODEL_BYTES = 100 * 1024 * 1024; // 100 MB sanity check

// Module-level singleton — survives re-renders and navigation
let sharedCtx: any = null;

function isNativeAvailable(): boolean {
  try {
    return TurboModuleRegistry.get('RNLlama') !== null;
  } catch {
    return false;
  }
}

function getLlama() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('llama.rn');
}

export function useLlama(): UseLlamaResult {
  const [status, setStatus] = useState<LlamaStatus>(() => {
    if (!isNativeAvailable()) return 'requires_build';
    if (sharedCtx) return 'ready';
    return 'idle';
  });
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mounted = useRef(true);
  const downloadRef = useRef<FileSystem.DownloadResumable | null>(null);

  useEffect(() => {
    mounted.current = true;
    if (!isNativeAvailable()) return;

    if (sharedCtx) {
      setStatus('ready');
      return;
    }

    // Auto-load model if already downloaded
    (async () => {
      try {
        const path = FileSystem.documentDirectory + MODEL_FILE;
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists && (info as any).size > MIN_MODEL_BYTES) {
          if (!mounted.current) return;
          setStatus('loading_model');
          const { initLlama } = getLlama();
          sharedCtx = await initLlama({ model: path, n_ctx: 2048, n_threads: 4, n_gpu_layers: 0 });
          if (mounted.current) setStatus('ready');
        }
      } catch (e: any) {
        if (mounted.current) {
          setErrorMessage(e?.message ?? 'Ошибка загрузки модели');
          setStatus('error');
        }
      }
    })();

    return () => { mounted.current = false; };
  }, []);

  const download = useCallback(() => {
    if (!isNativeAvailable()) return;
    if (status === 'downloading' || status === 'loading_model' || status === 'ready') return;

    setStatus('downloading');
    setProgress(0);
    setErrorMessage(null);

    const path = FileSystem.documentDirectory + MODEL_FILE;

    const resumable = FileSystem.createDownloadResumable(
      MODEL_URL,
      path,
      {},
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        if (!mounted.current) return;
        const pct = totalBytesExpectedToWrite > 0
          ? totalBytesWritten / totalBytesExpectedToWrite
          : 0;
        setProgress(pct);
      }
    );
    downloadRef.current = resumable;

    resumable.downloadAsync().then(async (result) => {
      if (!result || !mounted.current) return;
      setStatus('loading_model');
      try {
        const { initLlama } = getLlama();
        sharedCtx = await initLlama({ model: path, n_ctx: 2048, n_threads: 4, n_gpu_layers: 0 });
        if (mounted.current) setStatus('ready');
      } catch (e: any) {
        if (mounted.current) {
          setErrorMessage(e?.message ?? 'Ошибка инициализации модели');
          setStatus('error');
        }
      }
    }).catch((e: any) => {
      if (!mounted.current) return;
      setErrorMessage(e?.message ?? 'Ошибка скачивания');
      setStatus('error');
    });
  }, [status]);

  const generate = useCallback(async (
    system: string,
    user: string,
    maxTokens = 600
  ): Promise<string> => {
    if (!sharedCtx) throw new Error('Модель не загружена');
    if (!mounted.current) throw new Error('Компонент размонтирован');

    setStatus('inferring');
    try {
      const result = await sharedCtx.completion({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        n_predict: maxTokens,
        stop: ['<end_of_turn>', '<eos>'],
      });
      return result.text ?? '';
    } finally {
      if (mounted.current) setStatus('ready');
    }
  }, []);

  const deleteModel = useCallback(async () => {
    sharedCtx = null;
    const path = FileSystem.documentDirectory + MODEL_FILE;
    await FileSystem.deleteAsync(path, { idempotent: true });
    if (mounted.current) {
      setStatus('idle');
      setProgress(0);
      setErrorMessage(null);
    }
  }, []);

  return {
    status,
    progress,
    errorMessage,
    isReady: status === 'ready',
    download,
    deleteModel,
    generate,
  };
}
