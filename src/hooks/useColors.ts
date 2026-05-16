import { useTheme } from '../context/ThemeContext';
import { Colors, DarkColors } from '../constants/theme';

export function useColors() {
  const { isDark } = useTheme();
  return {
    ...Colors,
    bg: isDark ? DarkColors.bg : Colors.n50,
    surface: isDark ? DarkColors.surface : Colors.n0,
    surface2: isDark ? DarkColors.surface2 : Colors.n100,
    border: isDark ? DarkColors.border : Colors.n200,
    text: isDark ? DarkColors.text : Colors.n900,
    text2: isDark ? DarkColors.text2 : Colors.n500,
    text3: isDark ? DarkColors.text3 : Colors.n400,
    isDark,
  };
}
