import { useCallback } from 'react';

// llama.rn temporarily disabled — pending compatibility fix for Android 16 + RN 0.81.5
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
  generate: (system: string, user: string, maxTokens?: number) => Promise<string>;
}

export function useLlama(): UseLlamaResult {
  const download = useCallback(() => {}, []);
  const generate = useCallback(async (): Promise<string> => {
    throw new Error('On-device LLM not available');
  }, []);

  return {
    status: 'requires_build',
    progress: 0,
    errorMessage: null,
    isReady: false,
    download,
    generate,
  };
}
