// Peakwise design tokens â single source of truth.

const PW = {
  // â Brand colors â
  green:   '#0EBE6F',   // primary â readiness, growth
  greenIn: '#0AA85F',   // pressed
  greenSo: '#E5F8EF',   // soft tint
  navy:    '#0F1726',   // secondary â trust, intelligence
  teal:    '#00C2D1',   // accent â AI/data
  tealSo:  '#E0F7F9',

  // â Status â
  ready:    '#0EBE6F',
  readySo:  '#E5F8EF',
  light:    '#F2A60C',
  lightSo:  '#FFF4DC',
  rest:     '#F2545B',
  restSo:   '#FFE9EA',

  // â Light neutrals â
  n0:  '#FFFFFF',
  n50: '#F6F7F9',  // app background
  n100:'#EEF0F3',
  n200:'#E1E4E9',
  n300:'#C7CCD3',
  n400:'#9099A4',
  n500:'#5F6875',
  n600:'#3D4654',
  n700:'#222935',
  n800:'#141923',
  n900:'#0E1117',

  // â Dark surfaces â
  d_bg:   '#0E1117',
  d_sur:  '#161A23',
  d_sur2: '#1E2330',
  d_sur3: '#262C3B',
  d_brd:  '#262C3B',
  d_brd2: '#323A4D',
  d_tx:   '#F1F3F6',
  d_tx2:  '#AFB6C2',
  d_tx3:  '#6E7785',

  // â Type â
  font:   '"Plus Jakarta Sans", -apple-system, system-ui, sans-serif',
  mono:   '"JetBrains Mono", ui-monospace, monospace',

  // â Radii â
  r_sm: 8,
  r_md: 16,
  r_lg: 24,
  r_full: 9999,

  // â Shadows â
  card_l: '0 1px 2px rgba(15,23,38,0.04), 0 4px 16px rgba(15,23,38,0.04)',
  card_d: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.35)',
  pop_l:  '0 4px 12px rgba(15,23,38,0.06), 0 24px 48px rgba(15,23,38,0.10)',
  pop_d:  '0 8px 28px rgba(0,0,0,0.55)',
};

// Theme returns a token bundle for either mode
function pwTheme(dark) {
  return dark ? {
    bg: PW.d_bg, surface: PW.d_sur, surface2: PW.d_sur2, surface3: PW.d_sur3,
    border: PW.d_brd, border2: PW.d_brd2,
    text: PW.d_tx, text2: PW.d_tx2, text3: PW.d_tx3,
    card: PW.card_d, pop: PW.pop_d,
  } : {
    bg: PW.n50, surface: PW.n0, surface2: PW.n100, surface3: PW.n200,
    border: PW.n200, border2: PW.n300,
    text: PW.n900, text2: PW.n500, text3: PW.n400,
    card: PW.card_l, pop: PW.pop_l,
  };
}

// Small icon helpers â rounded/filled style (SF Symbols-ish, hand-tuned)
const PWIcon = {
  home: (c='currentColor', s=22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3.5 11.5L12 4l8.5 7.5V20a1 1 0 01-1 1h-4.5v-6h-6v6H4.5a1 1 0 01-1-1v-8.5z"
        fill={c}/>
    </svg>
  ),
  dumbbell: (c='currentColor', s=22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="9" width="3" height="6" rx="1" fill={c}/>
      <rect x="20" y="9" width="3" height="6" rx="1" fill={c}/>
      <rect x="4" y="7" width="3" height="10" rx="1.2" fill={c}/>
      <rect x="17" y="7" width="3" height="10" rx="1.2" fill={c}/>
      <rect x="7" y="10.5" width="10" height="3" rx="0.8" fill={c}/>
    </svg>
  ),
  chart: (c='currentColor', s=22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="13" width="4" height="8" rx="1.2" fill={c}/>
      <rect x="10" y="8" width="4" height="13" rx="1.2" fill={c}/>
      <rect x="17" y="4" width="4" height="17" rx="1.2" fill={c}/>
    </svg>
  ),
  user: (c='currentColor', s=22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill={c}/>
      <path d="M4 20c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5v1H4v-1z" fill={c}/>
    </svg>
  ),
  flame: (c='currentColor', s=20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 2.5s5.5 4 5.5 9.5a5.5 5.5 0 11-11 0c0-1.6.5-2.6 1.3-3.4 0 1.6 1 2.4 1.8 2.4 1 0 1.5-.7 1.4-2C11 6.4 12 4.5 12 2.5z" fill={c}/>
    </svg>
  ),
  sparkle: (c='currentColor', s=18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 3l1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7L12 3z" fill={c}/>
      <path d="M19 14l.8 2 2 .8-2 .8L19 19.5l-.8-1.9-2-.8 2-.8.8-2z" fill={c} opacity=".6"/>
    </svg>
  ),
  clock: (c='currentColor', s=18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.8"/>
      <path d="M12 7v5l3.2 2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  check: (c='currentColor', s=16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M5 12.5l4.5 4.5L19 7" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrow: (c='currentColor', s=18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14m-5-5l5 5-5 5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  plus: (c='currentColor', s=18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14m-7-7h14" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  bell: (c='currentColor', s=20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M6 17h12l-1.3-1.7c-.4-.5-.7-1.2-.7-1.9V10a4 4 0 10-8 0v3.4c0 .7-.3 1.4-.7 1.9L6 17zm4 2a2 2 0 004 0"
        stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  moon: (c='currentColor', s=18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" fill={c}/>
    </svg>
  ),
  bolt: (c='currentColor', s=18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill={c}/>
    </svg>
  ),
  heart: (c='currentColor', s=18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" fill={c}/>
    </svg>
  ),
  smile: (c='currentColor', s=18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.8"/>
      <circle cx="9" cy="10" r="1.3" fill={c}/>
      <circle cx="15" cy="10" r="1.3" fill={c}/>
      <path d="M8.5 14.5c.8 1.3 2 2 3.5 2s2.7-.7 3.5-2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  chevron: (c='currentColor', s=14, dir='right') => {
    const d = { right: 'M6 4l6 6-6 6', left: 'M14 4l-6 6 6 6', down: 'M4 7l6 6 6-6' }[dir];
    return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d={d} stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  },
  close: (c='currentColor', s=18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  logo: (c='currentColor', accent=null, s=24) => (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
      <path d="M5 30 L15 14 L20 22 L26 12 L35 30 Z" fill={c}/>
      <path d="M3 24 H10 L13 19 L17 27 L20 22"
        stroke={accent || c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
};

Object.assign(window, { PW, pwTheme, PWIcon });
