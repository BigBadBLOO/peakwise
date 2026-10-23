import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import { BridgeConfig } from '../services/claude';

export type ModuleId = 'essay' | 'flashcards' | 'workout' | 'habits';

export interface ModuleConfig {
  id: ModuleId;
  label: string;
  icon: string;
  enabled: boolean;
  order: number;
}

const DEFAULT_MODULES: ModuleConfig[] = [
  { id: 'flashcards', label: 'Карточки', icon: '🃏', enabled: true, order: 0 },
  { id: 'workout', label: 'Тренировки', icon: '💪', enabled: true, order: 1 },
  { id: 'essay', label: 'Изложение', icon: '✍️', enabled: true, order: 2 },
  { id: 'habits', label: 'Привычки', icon: '🔄', enabled: true, order: 3 },
];

interface Settings {
  bridge: BridgeConfig;
  modules: ModuleConfig[];
}

interface SettingsContextValue {
  settings: Settings;
  setBridge: (bridge: BridgeConfig) => Promise<void>;
  setModules: (modules: ModuleConfig[]) => Promise<void>;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const MODULES_KEY = 'settings:modules';
const BRIDGE_URL_KEY = 'settings:bridgeUrl';
const BRIDGE_TOKEN_SECURE_KEY = 'claude_bridge_token';
const LEGACY_API_KEY_SECURE_KEY = 'claude_api_key';
const LEGACY_MODEL_FILE = 'peakwise_model.gguf';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    bridge: { url: '', token: '' },
    modules: DEFAULT_MODULES,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedModules, storedUrl, storedToken] = await Promise.all([
          AsyncStorage.getItem(MODULES_KEY).catch(() => null),
          AsyncStorage.getItem(BRIDGE_URL_KEY).catch(() => null),
          SecureStore.getItemAsync(BRIDGE_TOKEN_SECURE_KEY).catch(() => null),
        ]);
        // API-ключ больше не используется — ИИ работает по подписке через мост
        SecureStore.deleteItemAsync(LEGACY_API_KEY_SECURE_KEY).catch(() => {});
        // Локальная Gemma тоже больше не нужна — освобождаем ~1.6 ГБ
        FileSystem.deleteAsync(FileSystem.documentDirectory + LEGACY_MODEL_FILE, { idempotent: true }).catch(() => {});

        let modules: ModuleConfig[] = storedModules ? JSON.parse(storedModules) : DEFAULT_MODULES;
        // Ensure any new default modules are added when user upgrades
        for (const def of DEFAULT_MODULES) {
          if (!modules.find(m => m.id === def.id)) {
            modules = [...modules, { ...def, order: modules.length }];
          }
        }
        setSettings({
          bridge: { url: storedUrl ?? '', token: storedToken ?? '' },
          modules,
        });
      } catch {
        // Keep defaults on any error
      }
      setIsLoaded(true);
    })();
  }, []);

  const setBridge = async (bridge: BridgeConfig) => {
    await Promise.all([
      AsyncStorage.setItem(BRIDGE_URL_KEY, bridge.url),
      SecureStore.setItemAsync(BRIDGE_TOKEN_SECURE_KEY, bridge.token),
    ]);
    setSettings(prev => ({ ...prev, bridge }));
  };

  const setModules = async (modules: ModuleConfig[]) => {
    await AsyncStorage.setItem(MODULES_KEY, JSON.stringify(modules));
    setSettings(prev => ({ ...prev, modules }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setBridge, setModules, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
  return ctx;
}
