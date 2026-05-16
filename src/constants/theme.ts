export const Colors = {
  green: '#0EBE6F',
  greenPressed: '#0AA85F',
  greenSoft: '#E5F8EF',
  navy: '#0F1726',
  teal: '#00C2D1',
  tealSoft: '#E0F7F9',

  ready: '#0EBE6F',
  light: '#F2A60C',
  rest: '#F2545B',

  n0: '#FFFFFF',
  n50: '#F6F7F9',
  n100: '#EEF0F3',
  n200: '#E1E4E9',
  n300: '#C7CCD3',
  n400: '#9099A4',
  n500: '#5F6875',
  n600: '#3D4654',
  n700: '#222935',
  n800: '#141923',
  n900: '#0E1117',

  d_bg: '#0E1117',
  d_surface: '#161A23',
  d_surface2: '#1E2330',
  d_border: '#262C3B',
  d_text: '#F1F3F6',
  d_text2: '#AFB6C2',
  d_text3: '#6E7785',
};

export const DarkColors = {
  bg: '#0E1117',
  surface: '#161A23',
  surface2: '#1E2330',
  border: '#262C3B',
  text: '#F1F3F6',
  text2: '#AFB6C2',
  text3: '#6E7785',
};

export function themed(isDark: boolean) {
  return {
    bg: isDark ? DarkColors.bg : Colors.n50,
    surface: isDark ? DarkColors.surface : Colors.n0,
    surface2: isDark ? DarkColors.surface2 : Colors.n100,
    border: isDark ? DarkColors.border : Colors.n200,
    text: isDark ? DarkColors.text : Colors.n900,
    text2: isDark ? DarkColors.text2 : Colors.n500,
    text3: isDark ? DarkColors.text3 : Colors.n400,
  };
}

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
