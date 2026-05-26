import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'settings:theme';

export type Colors = {
  isDark: boolean;
  bg: string;
  bg2: string;
  surface: string;
  surface2: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentSurface: string;
  accentInk: string;
  peak: string;
  peakSoft: string;
  mint: string;
  mintSoft: string;
  text: string;
  text2: string;
  text3: string;
  text4: string;
  tabBg: string;
  tabBorder: string;
  inputBg: string;
  successBg: string;
  successBorder: string;
  successText: string;
  overlay: string;
  rateForgot: string;
  rateForgotSoft: string;
  rateHard: string;
  rateHardSoft: string;
  rateGood: string;
  rateGoodSoft: string;
  rateEasy: string;
  rateEasySoft: string;
  // legacy aliases
  surfaceAlt: string;
  textSub: string;
  textMuted: string;
};

const dark: Colors = {
  isDark: true,
  bg: '#0F0D17',
  bg2: '#1A1726',
  surface: '#181527',
  surface2: '#221E33',
  border: '#2C2741',
  borderStrong: '#3E3759',
  accent: '#5B47E0',
  accentSurface: '#2A2249',
  accentInk: '#C9C0FF',
  peak: '#FFB347',
  peakSoft: '#3A2E16',
  mint: '#2FB87A',
  mintSoft: '#1A3328',
  text: '#F4F1EA',
  text2: '#C5C0D2',
  text3: '#8E89A2',
  text4: '#5D5773',
  tabBg: '#181527',
  tabBorder: '#2C2741',
  inputBg: '#221E33',
  successBg: '#1A3328',
  successBorder: '#2A4D3C',
  successText: '#7CE8B5',
  overlay: '#000000bb',
  rateForgot: '#E0455A',
  rateForgotSoft: '#3A1820',
  rateHard: '#EC8B2F',
  rateHardSoft: '#3A2715',
  rateGood: '#A5BE36',
  rateGoodSoft: '#2A3115',
  rateEasy: '#3CA86E',
  rateEasySoft: '#15301F',
  // legacy
  surfaceAlt: '#221E33',
  textSub: '#8E89A2',
  textMuted: '#5D5773',
};

const light: Colors = {
  isDark: false,
  bg: '#FAF8F2',
  bg2: '#F3EFE5',
  surface: '#FFFFFF',
  surface2: '#F7F4EC',
  border: '#E6E0D2',
  borderStrong: '#CFC6B3',
  accent: '#5B47E0',
  accentSurface: '#ECEAFB',
  accentInk: '#28219E',
  peak: '#FFB347',
  peakSoft: '#FFF1DA',
  mint: '#2FB87A',
  mintSoft: '#DAF3E6',
  text: '#15131D',
  text2: '#3D3A4A',
  text3: '#6F6B7C',
  text4: '#A09BAE',
  tabBg: '#FFFFFF',
  tabBorder: '#E6E0D2',
  inputBg: '#F7F4EC',
  successBg: '#DAF3E6',
  successBorder: '#A8DDBE',
  successText: '#1A5C3A',
  overlay: '#00000077',
  rateForgot: '#E0455A',
  rateForgotSoft: '#FCE3E6',
  rateHard: '#EC8B2F',
  rateHardSoft: '#FBE6CC',
  rateGood: '#A5BE36',
  rateGoodSoft: '#ECF1CC',
  rateEasy: '#3CA86E',
  rateEasySoft: '#D6EEDF',
  // legacy
  surfaceAlt: '#F7F4EC',
  textSub: '#6F6B7C',
  textMuted: '#A09BAE',
};

interface ThemeContextValue {
  colors: Colors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(v => {
      if (v !== null) setIsDark(v === 'dark');
    });
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ colors: isDark ? dark : light, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
