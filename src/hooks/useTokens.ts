import { useTheme } from '../context/ThemeContext';
import { lightTokens, darkTokens, Tokens } from '../design/tokens';

export function useTokens(): Tokens {
  const { isDark } = useTheme();
  return isDark ? darkTokens : lightTokens;
}

export type { Tokens };
