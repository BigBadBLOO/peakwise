// Peakwise â design system canvas
// Token cards, brand cards, components light+dark, all 5 screens light+dark.

const SwatchBlock = ({ name, hex, value, dark, big }) => {
  const t = pwTheme(dark);
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{
        width: '100%', height: big ? 90 : 64, borderRadius: 12, background: hex,
        border: hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#fff' ? '1px solid #E1E4E9' : 'none',
        boxShadow: '0 1px 2px rgba(15,23,38,0.05)',
      }}/>
      <div>
        <div style={{ fontFamily: PW.font, fontSize: 12, fontWeight: 700, color: t.text, letterSpacing: -0.1 }}>{name}</div>
        <div style={{ fontFamily: PW.mono, fontSize: 10.5, color: t.text3, marginTop: 1 }}>{hex.toUpperCase()}{value ? ' Â· ' + value : ''}</div>
      </div>
    </div>
  );
};

const TokenCard = ({ children, dark = false, padding = 24, bg }) => {
  const t = pwTheme(dark);
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box',
      background: bg || t.bg, color: t.text, fontFamily: PW.font,
      padding, overflow: 'auto',
    }}>{children}</div>
  );
};

const SectionHead = ({ eyebrow, title, dark }) => {
  const t = pwTheme(dark);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontFamily: PW.font, fontSize: 11, fontWeight: 600, letterSpacing: 1.2,
        color: PW.green, textTransform: 'uppercase',
      }}>{eyebrow}</div>
      <div style={{
        fontFamily: PW.font, fontSize: 22, fontWeight: 700, color: t.text,
        letterSpacing: -0.4, marginTop: 2,
      }}>{title}</div>
    </div>
  );
};

// === BRAND ARTBOARDS ===
const BrandLockups = () => (
  <TokenCard padding={32}>
    <SectionHead eyebrow="Logo system" title="Lockups & monochrome"/>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Primary */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #EEF0F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PeakLockup size={42}/>
      </div>
      {/* Inverted */}
      <div style={{ background: PW.navy, borderRadius: 16, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PeakLockup size={42} dark/>
      </div>
      {/* Mono on light */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #EEF0F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PeakLockup size={28} mono/>
        </div>
        <div style={{ flex: 1, background: PW.navy, borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PeakLockup size={28} dark mono/>
        </div>
      </div>

      <div style={{ marginTop: 4, paddingTop: 18, borderTop: '1px dashed #E1E4E9' }}>
        <div style={{
          fontFamily: PW.font, fontSize: 11, fontWeight: 600, color: PW.n500, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10,
        }}>Mark only</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <PeakMark size={80}/>
          <PeakMark size={48}/>
          <PeakMark size={32}/>
          <PeakMark size={24}/>
          <PeakMark size={16} flat fill={PW.navy}/>
        </div>
      </div>
    </div>
  </TokenCard>
);

const BrandAppIcon = () => (
  <TokenCard padding={32}>
    <SectionHead eyebrow="App icon" title="iOS rounded square"/>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', paddingTop: 12 }}>
      <PeakAppIcon size={200}/>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <PeakAppIcon size={96}/>
        <PeakAppIcon size={60}/>
        <PeakAppIcon size={40}/>
      </div>
      <div style={{ marginTop: 10, paddingTop: 18, borderTop: '1px dashed #E1E4E9', alignSelf: 'stretch', textAlign: 'center', fontSize: 12, color: PW.n500 }}>
        Tap targets: 60pt @1x Â· 120pt @2x Â· 180pt @3x
      </div>
    </div>
  </TokenCard>
);

// === COLOR ARTBOARDS ===
const ColorBrand = () => (
  <TokenCard padding={28}>
    <SectionHead eyebrow="Color Â· Brand" title="Primary, secondary, accent"/>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      <SwatchBlock big name="Primary green" hex={PW.green} value="readiness"/>
      <SwatchBlock big name="Secondary navy" hex={PW.navy} value="trust"/>
      <SwatchBlock big name="Accent teal" hex={PW.teal} value="ai/data"/>
      <SwatchBlock name="Green pressed" hex={PW.greenIn}/>
      <SwatchBlock name="Green soft" hex={PW.greenSo}/>
      <SwatchBlock name="Teal soft" hex={PW.tealSo}/>
    </div>

    <div style={{ height: 18 }}/>
    <SectionHead eyebrow="Color Â· Status" title="Readiness signal"/>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      <SwatchBlock big name="Ready" hex={PW.ready} value="train hard"/>
      <SwatchBlock big name="Ease in" hex={PW.light} value="moderate"/>
      <SwatchBlock big name="Rest" hex={PW.rest} value="recover"/>
    </div>
  </TokenCard>
);

const ColorNeutrals = () => (
  <TokenCard padding={28}>
    <SectionHead eyebrow="Color Â· Neutrals" title="Light scale Â· 9 steps"/>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {[
        ['n0', PW.n0], ['n50', PW.n50], ['n100', PW.n100],
        ['n200', PW.n200], ['n300', PW.n300], ['n400', PW.n400],
        ['n500', PW.n500], ['n600', PW.n600], ['n700', PW.n700],
        ['n800', PW.n800], ['n900', PW.n900], ['', '#0E1117'],
      ].slice(0, 11).map(([name, hex]) => (
        <SwatchBlock key={name} name={name} hex={hex}/>
      ))}
    </div>

    <div style={{ height: 20 }}/>
    <SectionHead eyebrow="Color Â· Dark surfaces" title="Dark mode scale"/>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      <SwatchBlock name="bg" hex={PW.d_bg}/>
      <SwatchBlock name="surface" hex={PW.d_sur}/>
      <SwatchBlock name="surface 2" hex={PW.d_sur2}/>
      <SwatchBlock name="surface 3" hex={PW.d_sur3}/>
      <SwatchBlock name="border" hex={PW.d_brd}/>
      <SwatchBlock name="border 2" hex={PW.d_brd2}/>
    </div>
  </TokenCard>
);

// === TYPOGRAPHY ===
const TypeScale = () => (
  <TokenCard padding={28}>
    <SectionHead eyebrow="Type" title="Plus Jakarta Sans"/>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[
        ['H1', 32, 700, "Train wise. Reach your peak."],
        ['H2', 24, 700, "You're fully recovered."],
        ['H3', 20, 700, "Today's workout"],
        ['H4', 17, 600, "Bench press Â· 4 Ã 6-8"],
        ['Body', 15, 400, "Perfect day for an intense workout â push your big lifts."],
        ['Body Â· medium', 15, 500, "Sleep was short. Aim for moderate volume."],
        ['Caption', 13, 500, "Last updated 2 minutes ago"],
        ['Micro', 12, 600, "READINESS Â· 92"],
      ].map(([label, size, weight, sample]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 16, paddingBottom: 12, borderBottom: '1px dashed #E1E4E9' }}>
          <div style={{ width: 110, flexShrink: 0 }}>
            <div style={{ fontFamily: PW.font, fontSize: 11, fontWeight: 600, color: PW.n500, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontFamily: PW.mono, fontSize: 10.5, color: PW.n400 }}>{size}px Â· {weight}</div>
          </div>
          <div style={{ fontFamily: PW.font, fontSize: size, fontWeight: weight, color: PW.n900, letterSpacing: size > 22 ? -0.5 : -0.1, lineHeight: 1.2 }}>
            {sample}
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: PW.n50, border: '1px solid ' + PW.n100 }}>
      <div style={{ fontFamily: PW.font, fontSize: 11, fontWeight: 600, color: PW.n500, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>Mono Â· JetBrains Mono</div>
      <div style={{ fontFamily: PW.mono, fontSize: 14, color: PW.n700 }}>72.5 kg Â· 18:42 Â· â 12% Â· W12</div>
      <div style={{ fontSize: 11.5, color: PW.n400, marginTop: 6 }}>Reserved for numeric data, timers, %, and unit-bearing metrics.</div>
    </div>
  </TokenCard>
);

// === SPACING / RADIUS / SHADOW ===
const SpaceScale = () => (
  <TokenCard padding={28}>
    <SectionHead eyebrow="Spacing" title="4px grid"/>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 22 }}>
      {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, fontFamily: PW.mono, fontSize: 11, color: PW.n500 }}>{s}</div>
          <div style={{ height: 14, background: PW.green, borderRadius: 3, width: s * 2 }}/>
          <div style={{ fontFamily: PW.mono, fontSize: 11, color: PW.n400 }}>s-{s}</div>
        </div>
      ))}
    </div>

    <SectionHead eyebrow="Radius" title="Corner tokens"/>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22 }}>
      {[['sm', 8, 'inputs, tags'], ['md', 16, 'cards'], ['lg', 24, 'sheets'], ['full', 9999, 'pills']].map(([n, r, u]) => (
        <div key={n}>
          <div style={{
            width: '100%', height: 64, background: PW.n50, border: '1px solid ' + PW.n200,
            borderRadius: r,
          }}/>
          <div style={{ fontSize: 12, fontWeight: 700, color: PW.n700, marginTop: 6 }}>{n}</div>
          <div style={{ fontFamily: PW.mono, fontSize: 10, color: PW.n400 }}>{r === 9999 ? 'â' : r + 'px'} Â· {u}</div>
        </div>
      ))}
    </div>

    <SectionHead eyebrow="Shadow" title="Elevation"/>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div>
        <div style={{
          height: 86, background: '#fff', borderRadius: 14,
          boxShadow: PW.card_l,
        }}/>
        <div style={{ fontSize: 12, fontWeight: 700, color: PW.n700, marginTop: 8 }}>Card</div>
        <div style={{ fontFamily: PW.mono, fontSize: 10.5, color: PW.n400 }}>subtle, ambient</div>
      </div>
      <div>
        <div style={{
          height: 86, background: '#fff', borderRadius: 14,
          boxShadow: PW.pop_l,
        }}/>
        <div style={{ fontSize: 12, fontWeight: 700, color: PW.n700, marginTop: 8 }}>Modal</div>
        <div style={{ fontFamily: PW.mono, fontSize: 10.5, color: PW.n400 }}>strong elevation</div>
      </div>
    </div>
  </TokenCard>
);

// === COMPONENT SHOWCASE ===
const ComponentCard = ({ name, dark, children, height = 320, dense = false }) => {
  const t = pwTheme(dark);
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box',
      background: t.bg, padding: dense ? 16 : 20, color: t.text,
      fontFamily: PW.font, display: 'flex', flexDirection: 'column', gap: 14,
      overflow: 'auto',
    }}>
      <div style={{
        fontFamily: PW.font, fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
        color: t.text3, textTransform: 'uppercase',
      }}>{name}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
};

const C_Status = ({ dark }) => (
  <ComponentCard name="01 Â· Status card" dark={dark}>
    <StatusCard variant="ready" dark={dark}/>
    <StatusCard variant="light" dark={dark} compact/>
    <StatusCard variant="rest" dark={dark} compact/>
  </ComponentCard>
);

const C_Buttons = ({ dark }) => (
  <ComponentCard name="02 Â· Buttons" dark={dark}>
    <PrimaryButton dark={dark} icon={PWIcon.bolt('#fff', 18)}>Start workout</PrimaryButton>
    <PrimaryButton dark={dark}>Done</PrimaryButton>
    <SecondaryButton dark={dark} icon={PWIcon.sparkle(dark ? '#fff' : PW.navy, 16)}>Regenerate program</SecondaryButton>
    <SecondaryButton dark={dark}>Cancel</SecondaryButton>
    <PrimaryButton dark={dark} disabled>Disabled</PrimaryButton>
  </ComponentCard>
);

const C_Rating = ({ dark }) => {
  const t = pwTheme(dark);
  return (
    <ComponentCard name="03 Â· Check-in rating" dark={dark}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 8 }}>Sleep quality</div>
        <DotRating value={4} dark={dark}/>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 8 }}>Energy level</div>
        <DotRating value={3} dark={dark}/>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 8 }}>Empty state</div>
        <DotRating value={0} dark={dark}/>
      </div>
    </ComponentCard>
  );
};

const C_Exercise = ({ dark }) => (
  <ComponentCard name="04 Â· Exercise row" dark={dark}>
    <ExerciseRow name="Barbell Bench Press" muscle="Chest" sets={4} reps="6-8" currentSet={1} done dark={dark}/>
    <ExerciseRow name="Pull-ups (weighted)" muscle="Back" sets={4} reps="8" currentSet={2} weight={10} active dark={dark}/>
    <ExerciseRow name="Cable Lateral Raise" muscle="Shoulders" sets={3} reps="12-15" currentSet={1} dark={dark}/>
  </ComponentCard>
);

const C_Chart = ({ dark }) => (
  <ComponentCard name="05 Â· Progress chart card" dark={dark}>
    <ProgressChartCard
      title="Bench Press" sub="Last 8 weeks"
      data={[62.5, 65, 65, 67.5, 70, 70, 72.5, 75]}
      dark={dark}/>
  </ComponentCard>
);

const C_Week = ({ dark }) => (
  <ComponentCard name="06 Â· Week program strip" dark={dark}>
    <WeekStrip
      days={[
        { label: 'M', date: 13, type: 'push', color: PW.green },
        { label: 'T', date: 14, type: 'pull', color: PW.teal },
        { label: 'W', date: 15, type: 'rest' },
        { label: 'T', date: 16, type: 'legs', color: PW.green },
        { label: 'F', date: 17, type: 'pull', color: PW.teal },
        { label: 'S', date: 18, type: 'rest' },
        { label: 'S', date: 19, type: 'cardio', color: PW.light },
      ]}
      active={3} dark={dark}/>
  </ComponentCard>
);

const C_Muscle = ({ dark }) => (
  <ComponentCard name="07 Â· Muscle map" dark={dark}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'center' }}>
      <MuscleMap dark={dark} view="front" size={0.7} showLegend={false}
        state={{ chest: 'ready', shoulders: 'ready', biceps: 'recovering', abs: 'ready', quads: 'rest', calves: 'ready' }}/>
      <MuscleMap dark={dark} view="back" size={0.7} showLegend={false}
        state={{ traps: 'ready', lats: 'recovering', triceps: 'ready', glutes: 'rest', hams: 'rest', calves: 'ready' }}/>
    </div>
    <div style={{
      display: 'flex', justifyContent: 'center', gap: 14,
      fontFamily: PW.font, fontSize: 11, color: pwTheme(dark).text2,
    }}>
      {[['Ready', PW.green], ['Recovering', PW.light], ['Rest', PW.rest]].map(([lbl, c]) => (
        <span key={lbl} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }}/>{lbl}
        </span>
      ))}
    </div>
  </ComponentCard>
);

const C_Nav = ({ dark }) => (
  <ComponentCard name="08 Â· Bottom navigation" dark={dark}>
    <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid ' + pwTheme(dark).border }}>
      <BottomNav dark={dark} active="home"/>
    </div>
    <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid ' + pwTheme(dark).border }}>
      <BottomNav dark={dark} active="workout"/>
    </div>
    <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid ' + pwTheme(dark).border }}>
      <BottomNav dark={dark} active="progress"/>
    </div>
  </ComponentCard>
);

const C_Sheet = ({ dark }) => (
  <ComponentCard name="09 Â· Morning check-in sheet" dark={dark} dense>
    <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid ' + pwTheme(dark).border }}>
      <CheckinSheet dark={dark} values={[4, 3, 2, 4]}/>
    </div>
  </ComponentCard>
);

const C_Tags = ({ dark }) => {
  const t = pwTheme(dark);
  return (
    <ComponentCard name="10 Â· Tags & badges" dark={dark}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>Muscle tags</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes'].map(m => (
            <span key={m} style={{
              padding: '4px 10px', borderRadius: 8,
              background: dark ? 'rgba(0,194,209,0.16)' : PW.tealSo,
              color: dark ? PW.teal : '#00868F',
              fontSize: 12, fontWeight: 600,
            }}>{m}</span>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>Status pills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[['READY', PW.green], ['EASE IN', PW.light], ['REST', PW.rest], ['AI', PW.teal]].map(([l, c]) => (
            <span key={l} style={{
              padding: '4px 12px', borderRadius: 9999, background: c, color: '#fff',
              fontSize: 11, fontWeight: 700, letterSpacing: 0.6,
            }}>{l}</span>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>Streak / chip</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 9999,
            background: dark ? PW.d_sur2 : PW.n0, border: '1px solid ' + t.border,
            fontSize: 13, fontWeight: 700, color: t.text,
          }}>🔥 12 day streak</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 9999,
            background: dark ? PW.d_sur2 : PW.n0, border: '1px solid ' + t.border,
            fontSize: 13, fontWeight: 700, color: t.text,
          }}>{PWIcon.clock(t.text2, 14)} 18:42</span>
        </div>
      </div>
    </ComponentCard>
  );
};

// === SCREEN ARTBOARD: wraps a screen in an IOSDevice frame ===
const ScreenFrame = ({ children, dark }) => (
  <div style={{
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: dark ? '#0A0C12' : '#EBECEF',
    padding: 12, boxSizing: 'border-box',
  }}>
    <IOSDevice dark={dark} width={390} height={844}>
      {children}
    </IOSDevice>
  </div>
);

// === MAIN APP ===
function App() {
  return (
    <DesignCanvas>
      {/* â Brand â */}
      <DCSection id="brand" title="Brand" subtitle="Logo, mark, app icon">
        <DCArtboard id="lockups" label="Lockups" width={440} height={620}><BrandLockups/></DCArtboard>
        <DCArtboard id="appicon" label="App icon Â· iOS" width={440} height={620}><BrandAppIcon/></DCArtboard>
      </DCSection>

      {/* â Tokens â */}
      <DCSection id="tokens" title="Design tokens" subtitle="Color, type, spacing, radius, shadow">
        <DCArtboard id="color-brand" label="Color Â· Brand & status" width={520} height={540}><ColorBrand/></DCArtboard>
        <DCArtboard id="color-neutrals" label="Color Â· Neutrals & dark surfaces" width={520} height={540}><ColorNeutrals/></DCArtboard>
        <DCArtboard id="type" label="Typography scale" width={560} height={620}><TypeScale/></DCArtboard>
        <DCArtboard id="space" label="Spacing Â· Radius Â· Shadow" width={520} height={620}><SpaceScale/></DCArtboard>
      </DCSection>

      {/* â Components â light â */}
      <DCSection id="comp-light" title="Components Â· Light" subtitle="Ten core components">
        <DCArtboard id="cl-1" label="01 Status" width={400} height={520}><C_Status dark={false}/></DCArtboard>
        <DCArtboard id="cl-2" label="02 Buttons" width={360} height={460}><C_Buttons dark={false}/></DCArtboard>
        <DCArtboard id="cl-3" label="03 Rating" width={360} height={380}><C_Rating dark={false}/></DCArtboard>
        <DCArtboard id="cl-4" label="04 Exercise row" width={400} height={420}><C_Exercise dark={false}/></DCArtboard>
        <DCArtboard id="cl-5" label="05 Chart card" width={360} height={300}><C_Chart dark={false}/></DCArtboard>
        <DCArtboard id="cl-6" label="06 Week strip" width={400} height={220}><C_Week dark={false}/></DCArtboard>
        <DCArtboard id="cl-7" label="07 Muscle map" width={420} height={420}><C_Muscle dark={false}/></DCArtboard>
        <DCArtboard id="cl-8" label="08 Bottom nav" width={400} height={360}><C_Nav dark={false}/></DCArtboard>
        <DCArtboard id="cl-9" label="09 Check-in sheet" width={380} height={560}><C_Sheet dark={false}/></DCArtboard>
        <DCArtboard id="cl-10" label="10 Tags & badges" width={400} height={360}><C_Tags dark={false}/></DCArtboard>
      </DCSection>

      {/* â Components â dark â */}
      <DCSection id="comp-dark" title="Components Â· Dark" subtitle="Same ten, dark mode">
        <DCArtboard id="cd-1" label="01 Status" width={400} height={520}><C_Status dark={true}/></DCArtboard>
        <DCArtboard id="cd-2" label="02 Buttons" width={360} height={460}><C_Buttons dark={true}/></DCArtboard>
        <DCArtboard id="cd-3" label="03 Rating" width={360} height={380}><C_Rating dark={true}/></DCArtboard>
        <DCArtboard id="cd-4" label="04 Exercise row" width={400} height={420}><C_Exercise dark={true}/></DCArtboard>
        <DCArtboard id="cd-5" label="05 Chart card" width={360} height={300}><C_Chart dark={true}/></DCArtboard>
        <DCArtboard id="cd-6" label="06 Week strip" width={400} height={220}><C_Week dark={true}/></DCArtboard>
        <DCArtboard id="cd-7" label="07 Muscle map" width={420} height={420}><C_Muscle dark={true}/></DCArtboard>
        <DCArtboard id="cd-8" label="08 Bottom nav" width={400} height={360}><C_Nav dark={true}/></DCArtboard>
        <DCArtboard id="cd-9" label="09 Check-in sheet" width={380} height={560}><C_Sheet dark={true}/></DCArtboard>
        <DCArtboard id="cd-10" label="10 Tags & badges" width={400} height={360}><C_Tags dark={true}/></DCArtboard>
      </DCSection>

      {/* â Screens â light â */}
      <DCSection id="screens-light" title="Screens Â· Light mode" subtitle="iPhone 14 Â· 390 Ã 844">
        <DCArtboard id="sl-1" label="01 Dashboard" width={420} height={880}><ScreenFrame dark={false}><Screen1Dashboard dark={false}/></ScreenFrame></DCArtboard>
        <DCArtboard id="sl-2" label="02 Morning check-in" width={420} height={880}><ScreenFrame dark={false}><Screen2Checkin dark={false}/></ScreenFrame></DCArtboard>
        <DCArtboard id="sl-3" label="03 Active workout" width={420} height={880}><ScreenFrame dark={false}><Screen3Workout dark={false}/></ScreenFrame></DCArtboard>
        <DCArtboard id="sl-4" label="04 Weekly program" width={420} height={880}><ScreenFrame dark={false}><Screen4Program dark={false}/></ScreenFrame></DCArtboard>
        <DCArtboard id="sl-5" label="05 Progress" width={420} height={880}><ScreenFrame dark={false}><Screen5Progress dark={false}/></ScreenFrame></DCArtboard>
      </DCSection>

      {/* â Screens â dark â */}
      <DCSection id="screens-dark" title="Screens Â· Dark mode" subtitle="Same flows, deep navy">
        <DCArtboard id="sd-1" label="01 Dashboard" width={420} height={880}><ScreenFrame dark={true}><Screen1Dashboard dark={true}/></ScreenFrame></DCArtboard>
        <DCArtboard id="sd-2" label="02 Morning check-in" width={420} height={880}><ScreenFrame dark={true}><Screen2Checkin dark={true}/></ScreenFrame></DCArtboard>
        <DCArtboard id="sd-3" label="03 Active workout" width={420} height={880}><ScreenFrame dark={true}><Screen3Workout dark={true}/></ScreenFrame></DCArtboard>
        <DCArtboard id="sd-4" label="04 Weekly program" width={420} height={880}><ScreenFrame dark={true}><Screen4Program dark={true}/></ScreenFrame></DCArtboard>
        <DCArtboard id="sd-5" label="05 Progress" width={420} height={880}><ScreenFrame dark={true}><Screen5Progress dark={true}/></ScreenFrame></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
