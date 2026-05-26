import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export type ModuleId = 'essay' | 'flashcards' | 'workout';

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
];

interface Settings {
  claudeApiKey: string;
  modules: ModuleConfig[];
}

interface SettingsContextValue {
  settings: Settings;
  setClaudeApiKey: (key: string) => Promise<void>;
  setModules: (modules: ModuleConfig[]) => Promise<void>;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const MODULES_KEY = 'settings:modules';
const API_KEY_SECURE_KEY = 'claude_api_key';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    claudeApiKey: '',
    modules: DEFAULT_MODULES,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedModules, storedKey] = await Promise.all([
          AsyncStorage.getItem(MODULES_KEY).catch(() => null),
          SecureStore.getItemAsync(API_KEY_SECURE_KEY).catch(() => null),
        ]);

        let modules: ModuleConfig[] = storedModules ? JSON.parse(storedModules) : DEFAULT_MODULES;
        // Ensure any new default modules are added when user upgrades
        for (const def of DEFAULT_MODULES) {
          if (!modules.find(m => m.id === def.id)) {
            modules = [...modules, { ...def, order: modules.length }];
          }
        }
        setSettings({
          claudeApiKey: storedKey ?? '',
          modules,
        });
      } catch {
        // Keep defaults on any error
      }
      setIsLoaded(true);
    })();
  }, []);

  const setClaudeApiKey = async (key: string) => {
    await SecureStore.setItemAsync(API_KEY_SECURE_KEY, key);
    setSettings(prev => ({ ...prev, claudeApiKey: key }));
  };

  const setModules = async (modules: ModuleConfig[]) => {
    await AsyncStorage.setItem(MODULES_KEY, JSON.stringify(modules));
    setSettings(prev => ({ ...prev, modules }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setClaudeApiKey, setModules, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
  return ctx;
}
