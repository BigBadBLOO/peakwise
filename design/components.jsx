// Peakwise â full component library, theme-aware
// All components accept `dark` boolean; tokens flow from pwTheme(dark).

// ââ helpers ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function pwCard(t) {
  return {
    background: t.surface, borderRadius: PW.r_md, boxShadow: t.card,
    border: `1px solid ${t.border}`,
  };
}

// ââ 1. STATUS CARD ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function StatusCard({ variant = 'ready', dark = false, compact = false }) {
  const t = pwTheme(dark);
  const cfg = {
    ready: {
      tint: dark ? '#0E2820' : '#E5F8EF',
      ring: PW.green, label: 'READY', emoji: 'â¡',
      head: "You're fully recovered.",
      sub: 'Perfect day for an intense workout. Push your big lifts today.',
      ready: 0.92,
    },
    light: {
      tint: dark ? '#2A2110' : '#FFF4DC',
      ring: PW.light, label: 'EASE IN', emoji: 'ð¤',
      head: 'Take it lighter today.',
      sub: 'Sleep was short. Aim for moderate volume, skip the PRs.',
      ready: 0.62,
    },
    rest: {
      tint: dark ? '#2A1416' : '#FFE9EA',
      ring: PW.rest, label: 'REST', emoji: 'ð',
      head: 'Rest is the workout today.',
      sub: 'Your CNS is taxed. Active recovery only â walk, stretch, sauna.',
      ready: 0.31,
    },
  }[variant];

  return (
    <div style={{
      background: t.surface, borderRadius: 20, padding: 20,
      boxShadow: t.card, border: `1px solid ${t.border}`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* tint accent strip */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 1,
        background: `linear-gradient(135deg, ${cfg.tint} 0%, transparent 60%)`,
      }}/>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 9999,
            background: cfg.ring, color: '#fff',
            fontFamily: PW.font, fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#fff',
              boxShadow: '0 0 0 3px rgba(255,255,255,0.3)',
            }}/>
            {cfg.label}
          </span>
          <span style={{
            color: t.text3, fontFamily: PW.mono, fontSize: 11,
            marginLeft: 'auto',
          }}>READINESS Â· {Math.round(cfg.ready * 100)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
            border: `1px solid ${t.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, flexShrink: 0,
          }}>{cfg.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: PW.font, fontSize: 19, fontWeight: 700,
              color: t.text, letterSpacing: -0.2, lineHeight: 1.25,
            }}>{cfg.head}</div>
            <div style={{
              fontFamily: PW.font, fontSize: 13.5, color: t.text2,
              marginTop: 4, lineHeight: 1.45,
            }}>{cfg.sub}</div>
          </div>
        </div>

        {!compact && (
          <div style={{ marginTop: 18 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: 8,
            }}>
              <span style={{
                fontFamily: PW.font, fontSize: 11, fontWeight: 600,
                color: t.text3, letterSpacing: 0.6, textTransform: 'uppercase',
              }}>Muscle readiness</span>
              <span style={{ fontFamily: PW.mono, fontSize: 11, color: t.text3 }}>
                7 of 12 groups
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['#0EBE6F','#0EBE6F','#0EBE6F','#0EBE6F','#0EBE6F','#0EBE6F','#0EBE6F','#F2A60C','#F2A60C','#F2A60C','#F2545B','#F2545B']
                .map((c, i) => (
                  <div key={i} style={{
                    flex: 1, height: 6, borderRadius: 3, background: c,
                    opacity: variant === 'ready' ? 1 : variant === 'light' ? (c === PW.green ? 0.4 : 1) : (c === PW.rest ? 1 : 0.35),
                  }}/>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ââ 2/3. BUTTONS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function PrimaryButton({ children, icon, dark = false, full = true, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: full ? '100%' : 'auto', height: 52, borderRadius: 9999,
      background: disabled ? '#C7CCD3' : PW.green,
      color: '#fff', border: 'none',
      fontFamily: PW.font, fontWeight: 700, fontSize: 16, letterSpacing: -0.1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      padding: '0 24px',
      boxShadow: disabled ? 'none' : '0 6px 20px rgba(14,190,111,0.32), inset 0 -2px 0 rgba(0,0,0,0.12)',
      transition: 'transform .08s, box-shadow .15s',
    }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.985)'}
       onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
       onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      {icon}
      {children}
    </button>
  );
}

function SecondaryButton({ children, icon, dark = false, full = true, onClick }) {
  const t = pwTheme(dark);
  return (
    <button onClick={onClick} style={{
      width: full ? '100%' : 'auto', height: 52, borderRadius: 9999,
      background: 'transparent', color: t.text,
      border: `1.5px solid ${dark ? t.border2 : t.border2}`,
      fontFamily: PW.font, fontWeight: 600, fontSize: 16, letterSpacing: -0.1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: 'pointer', padding: '0 24px',
      transition: 'background .15s',
    }}>
      {icon}
      {children}
    </button>
  );
}

// ââ 4. CHECK-IN DOT RATING (1-5) âââââââââââââââââââââââââââââââââââââââââââ
function DotRating({ value = 0, onChange, dark = false, color = PW.green }) {
  const t = pwTheme(dark);
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {[1,2,3,4,5].map(n => {
        const active = n <= value;
        return (
          <button key={n} onClick={() => onChange && onChange(n)} style={{
            flex: 1, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: active ? color : (dark ? t.surface2 : t.surface2),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s, transform .08s',
            position: 'relative',
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: active ? '#fff' : (dark ? t.text3 : t.border2),
            }}/>
          </button>
        );
      })}
    </div>
  );
}

// ââ 5. EXERCISE ROW ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function ExerciseRow({
  name = 'Bench Press', muscle = 'Chest', sets = 4, reps = '6-8',
  currentSet = 2, weight = 72.5, feedback = null,
  active = false, done = false, dark = false, onFeedback,
}) {
  const t = pwTheme(dark);
  return (
    <div style={{
      background: t.surface, borderRadius: PW.r_md, padding: 16,
      boxShadow: active ? `0 0 0 2px ${PW.green}, ${t.card}` : t.card,
      border: `1px solid ${active ? 'transparent' : t.border}`,
      opacity: done ? 0.55 : 1,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: done ? PW.green : (active ? PW.greenSo : t.surface2),
          color: done ? '#fff' : (active ? PW.green : t.text2),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: PW.font, fontWeight: 700, fontSize: 15, flexShrink: 0,
        }}>
          {done ? PWIcon.check('#fff', 18) : currentSet}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: PW.font, fontWeight: 700, fontSize: 16,
              color: t.text, letterSpacing: -0.2,
              textDecoration: done ? 'line-through' : 'none',
            }}>{name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <span style={{
              display: 'inline-block', padding: '2px 8px', borderRadius: 6,
              background: dark ? 'rgba(0,194,209,0.16)' : PW.tealSo,
              color: dark ? PW.teal : '#00868F',
              fontFamily: PW.font, fontSize: 11, fontWeight: 600,
            }}>{muscle}</span>
            <span style={{
              fontFamily: PW.mono, fontSize: 12, color: t.text2,
            }}>{sets} Ã {reps}</span>
          </div>
        </div>
      </div>

      {active && (
        <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 4,
            background: t.surface2, borderRadius: 10, padding: '8px 12px',
            border: `1px solid ${t.border}`,
          }}>
            <span style={{
              fontFamily: PW.mono, fontSize: 18, fontWeight: 700, color: t.text,
            }}>{weight}</span>
            <span style={{ fontFamily: PW.font, fontSize: 11, color: t.text3 }}>kg</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            <button onClick={() => onFeedback && onFeedback('easy')} style={{
              flex: 1, height: 36, borderRadius: 10,
              background: feedback === 'easy' ? PW.green : 'transparent',
              color: feedback === 'easy' ? '#fff' : t.text2,
              border: `1px solid ${feedback === 'easy' ? PW.green : t.border}`,
              fontFamily: PW.font, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}>Too easy</button>
            <button onClick={() => onFeedback && onFeedback('hard')} style={{
              flex: 1, height: 36, borderRadius: 10,
              background: feedback === 'hard' ? PW.rest : 'transparent',
              color: feedback === 'hard' ? '#fff' : t.text2,
              border: `1px solid ${feedback === 'hard' ? PW.rest : t.border}`,
              fontFamily: PW.font, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}>Too hard</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ââ 6. PROGRESS CHART CARD âââââââââââââââââââââââââââââââââââââââââââââââââ
function ProgressChartCard({
  title = 'Bench Press', sub = '8 weeks',
  data = [62.5, 65, 65, 67.5, 70, 70, 72.5, 75], unit = 'kg',
  dark = false,
}) {
  const t = pwTheme(dark);
  const w = 280, h = 100, pad = 4;
  const min = Math.min(...data) - 2, max = Math.max(...data) + 2;
  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * (w - pad * 2),
    h - pad - ((v - min) / (max - min)) * (h - pad * 2),
  ]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const area = `${path} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`;
  const latest = data[data.length - 1], earliest = data[0];
  const delta = latest - earliest;
  return (
    <div style={{
      ...pwCard(t), padding: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontFamily: PW.font, fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
            color: t.text3, textTransform: 'uppercase',
          }}>{sub}</div>
          <div style={{
            fontFamily: PW.font, fontSize: 17, fontWeight: 700, color: t.text,
            letterSpacing: -0.2, marginTop: 2,
          }}>{title}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: PW.font, fontSize: 22, fontWeight: 700, color: t.text,
            letterSpacing: -0.5,
          }}>
            {latest}<span style={{ fontSize: 13, color: t.text3, marginLeft: 3 }}>{unit}</span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontFamily: PW.mono, fontSize: 12, color: PW.green, fontWeight: 600,
          }}>
            â {delta.toFixed(1)} {unit}
          </div>
        </div>
      </div>
      <svg width="100%" height={h + 16} viewBox={`0 0 ${w} ${h + 16}`}
        style={{ marginTop: 8 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`pwg-${title.replace(/\s/g,'')}-${dark?'d':'l'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PW.green} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={PW.green} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#pwg-${title.replace(/\s/g,'')}-${dark?'d':'l'})`}/>
        <path d={path} stroke={PW.green} strokeWidth="2.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4 : 0}
            fill={PW.green} stroke={t.surface} strokeWidth="2"/>
        ))}
      </svg>
    </div>
  );
}

// ââ 7. WEEK PROGRAM STRIP âââââââââââââââââââââââââââââââââââââââââââââââââ
function WeekStrip({ days, active = 2, dark = false, compact = false, onPick }) {
  const t = pwTheme(dark);
  // days: array of { label, date, type: 'push'|'pull'|'legs'|'cardio'|'rest', color }
  return (
    <div style={{
      display: 'flex', gap: 6, padding: compact ? 0 : '4px 0',
    }}>
      {days.map((d, i) => {
        const isActive = i === active;
        const isRest = d.type === 'rest';
        return (
          <button key={i} onClick={() => onPick && onPick(i)} style={{
            flex: 1, padding: '10px 4px', borderRadius: 14, cursor: 'pointer',
            background: isActive ? PW.navy : (dark ? t.surface : '#fff'),
            border: `1px solid ${isActive ? PW.navy : t.border}`,
            color: isActive ? '#fff' : t.text,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            fontFamily: PW.font,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 0.8,
              color: isActive ? 'rgba(255,255,255,0.6)' : t.text3,
              textTransform: 'uppercase',
            }}>{d.label}</span>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>{d.date}</span>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isRest
                ? (isActive ? 'rgba(255,255,255,0.3)' : t.border2)
                : d.color,
              boxShadow: isRest ? 'none' : `0 0 0 2px ${isActive ? 'rgba(255,255,255,0.15)' : 'transparent'}`,
            }}/>
          </button>
        );
      })}
    </div>
  );
}

// ââ 8. BODY MUSCLE MAP ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// front view; muscle groups colored by readiness state.
// state map: { chest, shoulders, biceps, abs, quads, calves, traps, lats, triceps, glutes, hams } -> 'ready'|'recovering'|'rest'
function MuscleMap({
  state = {}, dark = false, view = 'front', size = 1, showLegend = true,
}) {
  const t = pwTheme(dark);
  const col = s => s === 'rest' ? PW.rest : s === 'recovering' ? PW.light : s === 'ready' ? PW.green : (dark ? '#2A3142' : '#E1E4E9');
  const body = dark ? '#1E2330' : '#EEF0F3';
  const stroke = dark ? '#323A4D' : '#D5D9DF';
  const w = 180 * size, h = 280 * size;

  // Coordinates are hand-tuned over the silhouette
  const front = (
    <svg width={w} height={h} viewBox="0 0 180 280" fill="none">
      {/* head */}
      <ellipse cx="90" cy="26" rx="18" ry="22" fill={body} stroke={stroke}/>
      {/* neck */}
      <path d="M82 46 Q82 54 80 60 H100 Q98 54 98 46 Z" fill={body} stroke={stroke}/>
      {/* torso */}
      <path d="M55 64 Q72 56 90 56 Q108 56 125 64 L130 130 Q120 138 90 138 Q60 138 50 130 Z"
        fill={body} stroke={stroke}/>
      {/* abdomen */}
      <path d="M62 130 L60 175 Q90 184 120 175 L118 130 Z" fill={body} stroke={stroke}/>
      {/* arms upper */}
      <path d="M55 64 Q44 70 40 90 L36 130 L52 134 L60 96 Z" fill={body} stroke={stroke}/>
      <path d="M125 64 Q136 70 140 90 L144 130 L128 134 L120 96 Z" fill={body} stroke={stroke}/>
      {/* arms lower (forearms) */}
      <path d="M36 132 L34 178 L48 180 L52 134 Z" fill={body} stroke={stroke}/>
      <path d="M144 132 L146 178 L132 180 L128 134 Z" fill={body} stroke={stroke}/>
      {/* legs upper */}
      <path d="M62 178 L58 240 L82 242 L88 180 Z" fill={body} stroke={stroke}/>
      <path d="M118 178 L122 240 L98 242 L92 180 Z" fill={body} stroke={stroke}/>
      {/* legs lower */}
      <path d="M60 240 L60 274 L80 274 L82 240 Z" fill={body} stroke={stroke}/>
      <path d="M120 240 L120 274 L100 274 L98 240 Z" fill={body} stroke={stroke}/>

      {/* === Muscle overlays === */}
      {/* shoulders (delts) */}
      <path d="M55 64 Q48 66 44 80 L58 82 Q62 70 70 64 Z" fill={col(state.shoulders)} opacity={state.shoulders ? 0.95 : 0}/>
      <path d="M125 64 Q132 66 136 80 L122 82 Q118 70 110 64 Z" fill={col(state.shoulders)} opacity={state.shoulders ? 0.95 : 0}/>
      {/* chest */}
      <path d="M62 70 Q72 64 88 64 L88 110 Q72 108 60 102 Z" fill={col(state.chest)} opacity={state.chest ? 0.95 : 0}/>
      <path d="M118 70 Q108 64 92 64 L92 110 Q108 108 120 102 Z" fill={col(state.chest)} opacity={state.chest ? 0.95 : 0}/>
      {/* biceps */}
      <path d="M40 92 L36 128 L50 128 L54 96 Z" fill={col(state.biceps)} opacity={state.biceps ? 0.92 : 0}/>
      <path d="M140 92 L144 128 L130 128 L126 96 Z" fill={col(state.biceps)} opacity={state.biceps ? 0.92 : 0}/>
      {/* abs */}
      <path d="M70 112 L70 174 Q90 180 110 174 L110 112 Q90 118 70 112 Z" fill={col(state.abs)} opacity={state.abs ? 0.88 : 0}/>
      {/* quads */}
      <path d="M64 184 L60 238 L82 240 L86 186 Z" fill={col(state.quads)} opacity={state.quads ? 0.93 : 0}/>
      <path d="M116 184 L120 238 L98 240 L94 186 Z" fill={col(state.quads)} opacity={state.quads ? 0.93 : 0}/>
      {/* calves */}
      <path d="M61 244 L61 272 L78 272 L80 244 Z" fill={col(state.calves)} opacity={state.calves ? 0.92 : 0}/>
      <path d="M119 244 L119 272 L102 272 L100 244 Z" fill={col(state.calves)} opacity={state.calves ? 0.92 : 0}/>
    </svg>
  );

  const back = (
    <svg width={w} height={h} viewBox="0 0 180 280" fill="none">
      <ellipse cx="90" cy="26" rx="18" ry="22" fill={body} stroke={stroke}/>
      <path d="M82 46 Q82 54 80 60 H100 Q98 54 98 46 Z" fill={body} stroke={stroke}/>
      <path d="M55 64 Q72 56 90 56 Q108 56 125 64 L130 130 Q120 138 90 138 Q60 138 50 130 Z" fill={body} stroke={stroke}/>
      <path d="M62 130 L60 175 Q90 184 120 175 L118 130 Z" fill={body} stroke={stroke}/>
      <path d="M55 64 Q44 70 40 90 L36 130 L52 134 L60 96 Z" fill={body} stroke={stroke}/>
      <path d="M125 64 Q136 70 140 90 L144 130 L128 134 L120 96 Z" fill={body} stroke={stroke}/>
      <path d="M36 132 L34 178 L48 180 L52 134 Z" fill={body} stroke={stroke}/>
      <path d="M144 132 L146 178 L132 180 L128 134 Z" fill={body} stroke={stroke}/>
      <path d="M62 178 L58 240 L82 242 L88 180 Z" fill={body} stroke={stroke}/>
      <path d="M118 178 L122 240 L98 242 L92 180 Z" fill={body} stroke={stroke}/>
      <path d="M60 240 L60 274 L80 274 L82 240 Z" fill={body} stroke={stroke}/>
      <path d="M120 240 L120 274 L100 274 L98 240 Z" fill={body} stroke={stroke}/>

      {/* traps */}
      <path d="M68 60 Q90 56 112 60 L106 88 Q90 84 74 88 Z" fill={col(state.traps)} opacity={state.traps ? 0.95 : 0}/>
      {/* lats */}
      <path d="M58 90 L52 130 Q72 138 88 134 L88 90 Z" fill={col(state.lats)} opacity={state.lats ? 0.92 : 0}/>
      <path d="M122 90 L128 130 Q108 138 92 134 L92 90 Z" fill={col(state.lats)} opacity={state.lats ? 0.92 : 0}/>
      {/* triceps */}
      <path d="M40 92 L36 128 L50 128 L54 96 Z" fill={col(state.triceps)} opacity={state.triceps ? 0.92 : 0}/>
      <path d="M140 92 L144 128 L130 128 L126 96 Z" fill={col(state.triceps)} opacity={state.triceps ? 0.92 : 0}/>
      {/* glutes */}
      <path d="M62 158 Q72 152 88 152 L88 184 Q72 182 60 178 Z" fill={col(state.glutes)} opacity={state.glutes ? 0.94 : 0}/>
      <path d="M118 158 Q108 152 92 152 L92 184 Q108 182 120 178 Z" fill={col(state.glutes)} opacity={state.glutes ? 0.94 : 0}/>
      {/* hamstrings */}
      <path d="M64 188 L60 238 L82 240 L86 190 Z" fill={col(state.hams)} opacity={state.hams ? 0.93 : 0}/>
      <path d="M116 188 L120 238 L98 240 L94 190 Z" fill={col(state.hams)} opacity={state.hams ? 0.93 : 0}/>
      {/* calves */}
      <path d="M61 244 L61 272 L78 272 L80 244 Z" fill={col(state.calves)} opacity={state.calves ? 0.92 : 0}/>
      <path d="M119 244 L119 272 L102 272 L100 244 Z" fill={col(state.calves)} opacity={state.calves ? 0.92 : 0}/>
    </svg>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {view === 'back' ? back : front}
      </div>
      {showLegend && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 14, marginTop: 8,
          fontFamily: PW.font, fontSize: 11, color: t.text2,
        }}>
          {[['ready','Ready', PW.green], ['recovering','Recovering', PW.light], ['rest','Rest', PW.rest]].map(([k, lbl, c]) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }}/>{lbl}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ââ 9. BOTTOM NAV ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function BottomNav({ active = 'home', dark = false, onPick }) {
  const t = pwTheme(dark);
  const items = [
    { id: 'home', label: 'Home', icon: PWIcon.home },
    { id: 'workout', label: 'Workout', icon: PWIcon.dumbbell },
    { id: 'progress', label: 'Progress', icon: PWIcon.chart },
    { id: 'profile', label: 'Profile', icon: PWIcon.user },
  ];
  return (
    <div style={{
      background: dark ? 'rgba(22,26,35,0.85)' : 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `1px solid ${t.border}`,
      padding: '8px 12px 24px',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {items.map(it => {
        const isActive = it.id === active;
        const c = isActive ? PW.green : t.text3;
        return (
          <button key={it.id} onClick={() => onPick && onPick(it.id)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '6px 12px', minWidth: 56,
          }}>
            {it.icon(c, 24)}
            <span style={{
              fontFamily: PW.font, fontSize: 10.5, fontWeight: isActive ? 700 : 500,
              color: c, letterSpacing: 0.2,
            }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ââ 10. CHECK-IN MODAL (bottom sheet) ââââââââââââââââââââââââââââââââââââââ
function CheckinSheet({ dark = false, values = [4, 3, 2, 4], onChange, onDone }) {
  const t = pwTheme(dark);
  const qs = [
    { icon: PWIcon.moon, label: 'Sleep quality', hint: 'How rested do you feel?' },
    { icon: PWIcon.bolt, label: 'Energy level', hint: 'Your physical energy right now' },
    { icon: PWIcon.heart, label: 'Muscle soreness', hint: '1 = very sore, 5 = none' },
    { icon: PWIcon.smile, label: 'Mood', hint: 'Mental state this morning' },
  ];
  return (
    <div style={{
      background: t.surface, borderRadius: '24px 24px 0 0', padding: '12px 20px 24px',
      boxShadow: t.pop, fontFamily: PW.font,
    }}>
      {/* drag handle */}
      <div style={{
        width: 40, height: 5, borderRadius: 3, background: t.border2,
        margin: '0 auto 16px',
      }}/>
      <div style={{ marginBottom: 18 }}>
        <div style={{
          fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.4,
        }}>Good morning ð</div>
        <div style={{ fontSize: 14, color: t.text2, marginTop: 4 }}>
          How are you feeling? This takes 20 seconds.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {qs.map((q, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: dark ? 'rgba(0,194,209,0.16)' : PW.tealSo,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: dark ? PW.teal : '#00868F',
              }}>{q.icon(dark ? PW.teal : '#00868F', 16)}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{q.label}</div>
                <div style={{ fontSize: 11.5, color: t.text3 }}>{q.hint}</div>
              </div>
            </div>
            <DotRating value={values[i]} onChange={v => onChange && onChange(i, v)} dark={dark}/>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <PrimaryButton onClick={onDone}>Done</PrimaryButton>
      </div>
    </div>
  );
}

Object.assign(window, {
  StatusCard, PrimaryButton, SecondaryButton, DotRating, ExerciseRow,
  ProgressChartCard, WeekStrip, MuscleMap, BottomNav, CheckinSheet, pwCard,
});
