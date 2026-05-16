import type { TextStyle } from 'react-native';

// ─── Primitive palette ────────────────────────────────────────────────────────
// Used only within this file. Never import in screens/components.

const palette = {
  green500:  '#0EBE6F',
  green600:  '#0AA85F',
  green50:   '#E5F8EF',
  navy900:   '#0F1726',
  teal500:   '#00C2D1',
  teal50:    '#E0F7F9',
  amber500:  '#F2A60C',
  amber50:   '#FFF3D4',
  red500:    '#F2545B',
  red50:     '#FEE8E9',

  white:      '#FFFFFF',
  neutral50:  '#F6F7F9',
  neutral100: '#EEF0F3',
  neutral200: '#E1E4E9',
  neutral300: '#C7CCD3',
  neutral400: '#9099A4',
  neutral500: '#5F6875',
  neutral900: '#0E1117',

  dark900:   '#0E1117',
  dark800:   '#161A23',
  dark700:   '#1E2330',
  dark600:   '#262C3B',
  darkText1: '#F1F3F6',
  darkText2: '#AFB6C2',
  darkText3: '#6E7785',
} as const;

// ─── Semantic token interface ─────────────────────────────────────────────────
// The only type that screens and components are allowed to use.

export interface Tokens {
  // Backgrounds
  bgScreen: string;   // SafeAreaView / screen root
  bgCard:   string;   // Cards, modals, elevated surfaces
  bgSubtle: string;   // Inputs, tags, recessed areas

  // Text
  textPrimary:   string;  // Headlines, main body content
  textSecondary: string;  // Supporting / descriptive text
  textTertiary:  string;  // Captions, placeholders, muted labels
  textOnColor:   string;  // Text on colored backgrounds (white)

  // On-navy text (for navy/dark surface overlays)
  textOnNavyMuted: string;  // Semi-transparent white (0.5) on navy
  textOnNavySoft:  string;  // Soft white (0.6) on navy
  bgOnNavy:        string;  // Subtle white panel (0.1) on navy

  // Border
  borderDefault: string;

  // Shadow
  shadowSurface: string;  // Card / surface drop shadow color
  shadow: {
    // Subtle — settings groups, flat cards
    sm:     { offsetY: number; opacity: number; radius: number; elevation: number };
    // Standard — cards, modals
    md:     { offsetY: number; opacity: number; radius: number; elevation: number };
    // Active card highlight — isCurrent exercise card
    active: { offsetY: number; opacity: number; radius: number; elevation: number };
    // Prominent — primary buttons (colored shadow)
    button: { offsetY: number; opacity: number; radius: number; elevation: number };
    // Bottom sheet — upward shadow on modals
    sheet:  { offsetY: number; opacity: number; radius: number; elevation: number };
  };

  // Brand / Primary action
  colorPrimary:        string;
  colorPrimaryPressed: string;
  colorPrimarySubtle:  string;

  // Status
  colorSuccess:       string;
  colorWarning:       string;
  colorError:         string;
  colorWarningSubtle: string;
  colorErrorSubtle:   string;

  // Specialty surfaces
  colorNavy:       string;
  colorTeal:       string;
  colorTealSubtle: string;

  // Typography scale
  font: {
    size: {
      xxs:        number;  //  9 — micro labels (week strip, tiny overlines)
      xs:         number;  // 10 — tiny labels, overlines
      sm:         number;  // 11 — captions, badges
      small:      number;  // 12 — small secondary text
      md:         number;  // 13 — secondary body, toggles
      base:       number;  // 14 — body text
      lg:         number;  // 15 — labels, settings
      xl:         number;  // 16 — buttons, section titles
      title:      number;  // 18 — card/section headings
      large:      number;  // 20 — metrics, large numbers
      subheading: number;  // 22 — sub-headings, avatar name, emoji display
      display:    number;  // 26 — feature display (greeting, streak count)
      heading:    number;  // 28 — screen headings
      hero:       number;  // 32 — focal point text (avatar initial)
      giant:      number;  // 40 — emoji placeholder display
    };
    weight: {
      regular:  TextStyle['fontWeight'];  // '400'
      medium:   TextStyle['fontWeight'];  // '500'
      semibold: TextStyle['fontWeight'];  // '600'
      bold:     TextStyle['fontWeight'];  // '700'
      heavy:    TextStyle['fontWeight'];  // '800'
    };
    tracking: {
      tight:    number;  // -0.6 — large headings
      tighter:  number;  // -0.5 — large metric/timer displays
      feature:  number;  // -0.4 — display-level feature text
      card:     number;  // -0.3 — card-level text (exercise names, dates)
      snug:     number;  // -0.2 — titles
      dense:    number;  // -0.1 — dense body text
      normal:   number;  //  0   — body (default, no tracking)
      wide:     number;  //  0.4 — captions
      mid:      number;  //  0.5 — day strip labels
      wider:    number;  //  0.6 — badges, labels
      widest:   number;  //  0.8 — overlines, allcaps
    };
  };

  // Spacing scale (4-pt grid)
  spacing: {
    xxs:   number;  //  2 — hairline gaps, toggle border inset
    xs:    number;  //  4 — icon insets, tiny vertical padding
    sm:    number;  //  8 — component internal gaps
    snug:  number;  // 10 — chip/badge horizontal padding
    inset: number;  // 12 — inner surface/card padding
    md:    number;  // 16 — standard card/section padding
    loose: number;  // 20 — between question/section blocks
    lg:    number;  // 24 — section separation
    xl:    number;  // 32 — screen-level vertical spacing
  };

  // Border radius
  radius: {
    xs:   number;  //  3 — progress bars, small pills
    sm:   number;  //  8 — surfaces, inner cards
    tag:  number;  //  6 — small inline tags/labels
    chip: number;  // 12 — medium rounded interactive elements
    md:   number;  // 16 — cards, modals
    lg:   number;  // 24 — sheets
    full: number;  // 9999 — buttons, badges, toggles
  };

  isDark: boolean;
}

// ─── Shared values ────────────────────────────────────────────────────────────

const font: Tokens['font'] = {
  size: {
    xxs:        9,
    xs:         10,
    sm:         11,
    small:      12,
    md:         13,
    base:       14,
    lg:         15,
    xl:         16,
    title:      18,
    large:      20,
    subheading: 22,
    display:    26,
    heading:    28,
    hero:       32,
    giant:      40,
  },
  weight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
    heavy:    '800' as const,
  },
  tracking: {
    tight:   -0.6,
    tighter: -0.5,
    feature: -0.4,
    card:    -0.3,
    snug:    -0.2,
    dense:   -0.1,
    normal:   0,
    wide:     0.4,
    mid:      0.5,
    wider:    0.6,
    widest:   0.8,
  },
};

const spacing: Tokens['spacing'] = {
  xxs:    2,
  xs:     4,
  sm:     8,
  snug:  10,
  inset: 12,
  md:    16,
  loose: 20,
  lg:    24,
  xl:    32,
};

const radius: Tokens['radius'] = { xs: 3, tag: 6, sm: 8, chip: 12, md: 16, lg: 24, full: 9999 };

// ─── Light theme ──────────────────────────────────────────────────────────────

export const lightTokens: Tokens = {
  bgScreen: palette.neutral50,
  bgCard:   palette.white,
  bgSubtle: palette.neutral100,

  textPrimary:   palette.neutral900,
  textSecondary: palette.neutral500,
  textTertiary:  palette.neutral400,
  textOnColor:   palette.white,

  textOnNavyMuted: 'rgba(255,255,255,0.5)',
  textOnNavySoft:  'rgba(255,255,255,0.6)',
  bgOnNavy:        'rgba(255,255,255,0.1)',

  borderDefault: palette.neutral200,

  shadowSurface: palette.navy900,
  shadow: {
    sm:     { offsetY: 1, opacity: 0.04, radius: 4,  elevation: 1 },
    md:     { offsetY: 2, opacity: 0.06, radius: 8,  elevation: 2 },
    active: { offsetY: 4, opacity: 0.12, radius: 12, elevation: 3 },
    button: { offsetY: 6, opacity: 0.32, radius: 12, elevation: 4 },
    sheet:  { offsetY: -4, opacity: 0.15, radius: 20, elevation: 20 },
  },

  colorPrimary:        palette.green500,
  colorPrimaryPressed: palette.green600,
  colorPrimarySubtle:  palette.green50,

  colorSuccess:       palette.green500,
  colorWarning:       palette.amber500,
  colorError:         palette.red500,
  colorWarningSubtle: palette.amber50,
  colorErrorSubtle:   palette.red50,

  colorNavy:       palette.navy900,
  colorTeal:       palette.teal500,
  colorTealSubtle: palette.teal50,

  font,
  spacing,
  radius,
  isDark: false,
};

// ─── Dark theme ───────────────────────────────────────────────────────────────

export const darkTokens: Tokens = {
  bgScreen: palette.dark900,
  bgCard:   palette.dark800,
  bgSubtle: palette.dark700,

  textPrimary:   palette.darkText1,
  textSecondary: palette.darkText2,
  textTertiary:  palette.darkText3,
  textOnColor:   palette.white,

  textOnNavyMuted: 'rgba(255,255,255,0.5)',
  textOnNavySoft:  'rgba(255,255,255,0.6)',
  bgOnNavy:        'rgba(255,255,255,0.1)',

  borderDefault: palette.dark600,

  shadowSurface: '#000',
  shadow: {
    sm:     { offsetY: 1, opacity: 0.08, radius: 4,  elevation: 1 },
    md:     { offsetY: 2, opacity: 0.40, radius: 8,  elevation: 2 },
    active: { offsetY: 4, opacity: 0.20, radius: 12, elevation: 3 },
    button: { offsetY: 6, opacity: 0.32, radius: 12, elevation: 4 },
    sheet:  { offsetY: -4, opacity: 0.15, radius: 20, elevation: 20 },
  },

  colorPrimary:        palette.green500,
  colorPrimaryPressed: palette.green600,
  colorPrimarySubtle:  palette.green50,

  colorSuccess:       palette.green500,
  colorWarning:       palette.amber500,
  colorError:         palette.red500,
  colorWarningSubtle: palette.amber50,
  colorErrorSubtle:   palette.red50,

  colorNavy:       palette.navy900,
  colorTeal:       palette.teal500,
  colorTealSubtle: palette.teal50,

  font,
  spacing,
  radius,
  isDark: true,
};
