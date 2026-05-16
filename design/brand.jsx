// Peakwise logo system

function PeakMark({ size = 56, fill = '#0EBE6F', accent = '#0F1726', flat = false }) {
  const a = flat ? fill : accent;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M32 10 L52 46 H38 L32 35 Z"
        fill={flat ? fill : fill} opacity={flat ? 1 : 0.55}/>
      <path d="M22 18 L42 54 H10 Z" fill={fill}/>
      <path d="M6 40 H17 L22 33 L27 44 L33 30 L38 38"
        stroke={a} strokeWidth="3" fill="none"
        strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M34 34 L38 38 L34 42"
        stroke={a} strokeWidth="3" fill="none"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Wordmark({ color = '#0F1726', accentDot = '#0EBE6F', size = 36 }) {
  return (
    <div style={{
      fontFamily: PW.font, fontWeight: 800, fontSize: size,
      letterSpacing: -size * 0.035, color, lineHeight: 1,
      display: 'inline-flex', alignItems: 'baseline',
    }}>
      <span>peakw</span>
      <span style={{ position: 'relative', display: 'inline-block' }}>
        i
        <span style={{
          position: 'absolute', top: -size * 0.06, left: '50%',
          transform: 'translateX(-50%)',
          width: size * 0.16, height: size * 0.16, borderRadius: '50%',
          background: accentDot,
        }}/>
      </span>
      <span>se</span>
    </div>
  );
}

function PeakLockup({ size = 36, dark = false, mono = false }) {
  const t = dark ? '#fff' : PW.navy;
  const mark = mono
    ? <PeakMark size={size * 1.4} fill={t} flat />
    : <PeakMark size={size * 1.4} fill={PW.green} accent={t}/>;
  const wordmark = (
    <Wordmark
      color={t}
      accentDot={mono ? t : PW.green}
      size={size}
    />
  );
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.35 }}>
      {mark}{wordmark}
    </div>
  );
}

function PeakAppIcon({ size = 180 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: `linear-gradient(155deg, ${PW.green} 0%, #0AA85F 60%, #099856 100%)`,
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 12px 32px rgba(14,190,111,0.32), 0 2px 6px rgba(15,23,38,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.32), transparent 55%)',
      }}/>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 64 64" fill="none"
        style={{ position: 'relative', zIndex: 1 }}>
        <path d="M32 10 L52 46 H38 L32 35 Z" fill="#FFFFFF" opacity="0.5"/>
        <path d="M22 18 L42 54 H10 Z" fill="#FFFFFF"/>
        <path d="M6 40 H17 L22 33 L27 44 L33 30 L38 38"
          stroke="#0F1726" strokeWidth="3" fill="none"
          strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M34 34 L38 38 L34 42"
          stroke="#0F1726" strokeWidth="3" fill="none"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

Object.assign(window, { PeakMark, Wordmark, PeakLockup, PeakAppIcon });
