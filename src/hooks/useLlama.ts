import { useState, useEffect, useCallback, useRef } from 'react';
import { TurboModuleRegistry } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

// llama.rn only works in a native dev build — not in Expo Go.
const isLlamaAvailable = TurboModuleRegistry.get('RNLlama') !== null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let initLlama: ((params: any, cb: any) => Promise<any>) | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LlamaContext = any;

if (isLlamaAvailable) {
  const m = require('llama.rn') as typeof import('llama.rn');
  initLlama = m.initLlama;
}

const MODEL_URL =
  'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf';
const MODEL_FILENAME = 'peakwise_model.gguf';

function modelPath(): string {
  return (FileSystem.documentDirectory ?? '') + MODEL_FILENAME;
}

// Singleton — survives re-renders and screen navigation
let sharedCtx: LlamaContext | null = null;

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
  progress: number; // 0–100
  errorMessage: string | null;
  isReady: boolean;
  download: () => void;
  generate: (system: string, user: string, maxTokens?: number) => Promise<string>;
}

async function loadCtx(): Promise<LlamaContext> {
  if (sharedCtx) return sharedCtx;
  sharedCtx = await initLlama!(
    { model: modelPath(), n_ctx: 2048, n_threads: 4, n_gpu_layers: 0 },
    () => {},
  );
  return sharedCtx;
}

export function useLlama(): UseLlamaResult {
  const [status, setStatus] = useState<LlamaStatus>(
    isLlamaAvailable ? 'idle' : 'requires_build',
  );
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dlRef = useRef<FileSystem.DownloadResumable | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // On mount: if context already in memory → ready; else check disk
  useEffect(() => {
    if (!isLlamaAvailable) return;
    if (sharedCtx) { setStatus('ready'); return; }
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(modelPath());
        if (!info.exists || (info as any).size < 100_000_000) return;
        if (!mountedRef.current) return;
        setStatus('loading_model');
        await loadCtx();
        if (mountedRef.current) setStatus('ready');
      } catch {
        // Corrupted or incomplete file — let user re-download
      }
    })();
  }, []);

  const download = useCallback(() => {
    if (!isLlamaAvailable || (status !== 'idle' && status !== 'error')) return;
    setStatus('downloading');
    setProgress(0);
    setErrorMessage(null);

    const dl = FileSystem.createDownloadResumable(
      MODEL_URL,
      modelPath(),
      {},
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        if (totalBytesExpectedToWrite > 0 && mountedRef.current) {
          setProgress((totalBytesWritten / totalBytesExpectedToWrite) * 100);
        }
      },
    );
    dlRef.current = dl;

    dl.downloadAsync()
      .then(async () => {
        if (!mountedRef.current) return;
        setStatus('loading_model');
        await loadCtx();
        if (mountedRef.current) setStatus('ready');
      })
      .catch((e: unknown) => {
        if (!mountedRef.current) return;
        setErrorMessage(e instanceof Error ? e.message : 'Ошибка загрузки');
        setStatus('error');
      });
  }, [status]);

  const generate = useCallback(async (
    system: string,
    user: string,
    maxTokens = 600,
  ): Promise<string> => {
    if (!sharedCtx) throw new Error('Модель не загружена');
    if (mountedRef.current) setStatus('inferring');
    try {
      const result = await sharedCtx.completion({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        n_predict: maxTokens,
        temperature: 0.7,
        top_p: 0.9,
        stop: ['<|im_end|>', '<|endoftext|>'],
      });
      if (mountedRef.current) setStatus('ready');
      return result.text.trim();
    } catch (e) {
      if (mountedRef.current) setStatus('ready');
      throw e;
    }
  }, []);

  return {
    status,
    progress,
    errorMessage,
    isReady: status === 'ready',
    download,
    generate,
  };
}
