// Peakwise â 5 app screens, each themed light/dark.
// Each Screen* component returns the content inside an IOSDevice frame.

// status-bar inset (IOSDevice's status bar floats at top:0 â content needs padding)
const STATUS_INSET = 56;
const HOME_INSET = 28;

// ââ small shared bits âââââââââââââââââââââââââââââââââââââââââââââââââââââ
function ScreenScroll({ children, dark, padTop = STATUS_INSET, padBottom = 100, bg }) {
  const t = pwTheme(dark);
  return (
    <div style={{
      width: '100%', height: '100%',
      background: bg || t.bg, color: t.text, fontFamily: PW.font,
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        height: '100%', overflowY: 'auto',
        padding: `${padTop}px 0 ${padBottom}px`,
        WebkitOverflowScrolling: 'touch',
      }}>
        {children}
      </div>
    </div>
  );
}

function Greeting({ dark }) {
  const t = pwTheme(dark);
  return (
    <div style={{ padding: '0 20px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{
          fontFamily: PW.font, fontSize: 12, fontWeight: 600, letterSpacing: 0.6,
          color: t.text3, textTransform: 'uppercase',
        }}>Thursday Â· May 16</div>
        <div style={{
          fontFamily: PW.font, fontSize: 26, fontWeight: 700, color: t.text,
          letterSpacing: -0.6, marginTop: 2,
        }}>Morning, Alex</div>
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 22,
        background: dark ? PW.d_sur2 : PW.n0,
        border: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {PWIcon.bell(t.text2, 20)}
        <span style={{
          position: 'absolute', top: 10, right: 11, width: 8, height: 8,
          borderRadius: 4, background: PW.rest,
          border: `2px solid ${dark ? PW.d_sur2 : PW.n0}`,
        }}/>
      </div>
    </div>
  );
}

// ââ SCREEN 1: DASHBOARD âââââââââââââââââââââââââââââââââââââââââââââââââââ
function Screen1Dashboard({ dark = false }) {
  const t = pwTheme(dark);
  return (
    <ScreenScroll dark={dark}>
      <Greeting dark={dark}/>

      <div style={{ padding: '0 16px' }}>
        <StatusCard variant="ready" dark={dark}/>
      </div>

      {/* Muscle readiness card */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          ...pwCard(t), padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
                color: t.text3, textTransform: 'uppercase',
              }}>Body readiness</div>
              <div style={{
                fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: -0.2, marginTop: 2,
              }}>What's recovered</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['Front','Back'].map((v, i) => (
                <span key={v} style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: i === 0 ? (dark ? PW.d_sur3 : PW.n100) : 'transparent',
                  color: i === 0 ? t.text : t.text3,
                }}>{v}</span>
              ))}
            </div>
          </div>
          <MuscleMap dark={dark} view="front" size={0.85} state={{
            chest: 'ready', shoulders: 'ready', biceps: 'recovering',
            abs: 'ready', quads: 'rest', calves: 'ready',
          }}/>
        </div>
      </div>

      {/* Today's workout */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          ...pwCard(t), padding: 16, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 16, right: 16, padding: '4px 10px', borderRadius: 9999,
            background: PW.greenSo, color: PW.greenIn,
            fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
            display: dark ? 'none' : 'inline-block',
          }}>AI Â· 42 MIN</div>
          <div style={{
            position: 'absolute', top: 16, right: 16, padding: '4px 10px', borderRadius: 9999,
            background: 'rgba(14,190,111,0.18)', color: PW.green,
            fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
            display: dark ? 'inline-block' : 'none',
          }}>AI Â· 42 MIN</div>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
            color: t.text3, textTransform: 'uppercase',
          }}>Today's workout</div>
          <div style={{
            fontSize: 20, fontWeight: 700, color: t.text, letterSpacing: -0.3, marginTop: 2,
          }}>Upper Body Â· Heavy</div>
          <div style={{
            fontSize: 13, color: t.text2, marginTop: 4,
          }}>Built around your bench-press progression block.</div>

          <div style={{
            marginTop: 12, padding: 12, borderRadius: 12,
            background: dark ? PW.d_sur2 : PW.n50,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {[
              ['Barbell Bench Press', '4 Ã 6â8', '72.5 kg'],
              ['Pull-ups (weighted)', '4 Ã 8',  '+10 kg'],
              ['Seated DB Shoulder Press', '3 Ã 10', '22 kg'],
            ].map(([n, sr, w]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', background: PW.green,
                }}/>
                <span style={{ flex: 1, fontSize: 13.5, color: t.text, fontWeight: 500 }}>{n}</span>
                <span style={{ fontFamily: PW.mono, fontSize: 11.5, color: t.text3 }}>{sr}</span>
                <span style={{ fontFamily: PW.mono, fontSize: 11.5, color: t.text2, fontWeight: 600, minWidth: 52, textAlign: 'right' }}>{w}</span>
              </div>
            ))}
            <div style={{ fontSize: 11.5, color: t.text3, marginTop: 2 }}>+ 2 more exercises</div>
          </div>

          <div style={{ marginTop: 14 }}>
            <PrimaryButton icon={PWIcon.bolt('#fff', 18)}>Start workout</PrimaryButton>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div style={{ padding: '14px 16px 0', display: 'flex', gap: 10 }}>
        {[
          ['Streak', '12d', PWIcon.flame(PW.light, 18)],
          ['Sleep', '7.4h', PWIcon.moon(PW.teal, 16)],
          ['HRV', '64ms', PWIcon.heart(PW.rest, 16)],
        ].map(([l, v, i]) => (
          <div key={l} style={{
            flex: 1, ...pwCard(t), padding: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i}
              <span style={{
                fontSize: 11, fontWeight: 600, color: t.text3, letterSpacing: 0.4, textTransform: 'uppercase',
              }}>{l}</span>
            </div>
            <div style={{
              fontFamily: PW.font, fontSize: 18, fontWeight: 700, color: t.text,
              letterSpacing: -0.3, marginTop: 4,
            }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 16 }}/>

      {/* bottom nav (absolutely positioned) */}
      <div style={{ position: 'absolute', bottom: HOME_INSET, left: 0, right: 0 }}>
        <BottomNav active="home" dark={dark}/>
      </div>
    </ScreenScroll>
  );
}

// ââ SCREEN 2: CHECK-IN âââââââââââââââââââââââââââââââââââââââââââââââââââââ
function Screen2Checkin({ dark = false }) {
  const t = pwTheme(dark);
  return (
    <div style={{
      width: '100%', height: '100%',
      background: t.bg, color: t.text, fontFamily: PW.font,
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Blurred dashboard underneath */}
      <div style={{
        position: 'absolute', inset: 0,
        filter: 'blur(14px) saturate(80%)', opacity: 0.55, transform: 'scale(1.05)',
      }}>
        <ScreenScroll dark={dark}>
          <Greeting dark={dark}/>
          <div style={{ padding: '0 16px' }}>
            <StatusCard variant="ready" dark={dark}/>
          </div>
        </ScreenScroll>
      </div>
      {/* Scrim */}
      <div style={{
        position: 'absolute', inset: 0,
        background: dark ? 'rgba(0,0,0,0.5)' : 'rgba(15,23,38,0.32)',
      }}/>

      {/* Sheet pinned to bottom */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
      }}>
        <CheckinSheet dark={dark}/>
      </div>
    </div>
  );
}

// ââ SCREEN 3: ACTIVE WORKOUT ââââââââââââââââââââââââââââââââââââââââââââââ
function Screen3Workout({ dark = false }) {
  const t = pwTheme(dark);
  return (
    <ScreenScroll dark={dark} padBottom={120}>
      {/* Header */}
      <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
            color: t.text3, textTransform: 'uppercase',
          }}>In progress Â· Exercise 2 of 5</div>
          <div style={{
            fontSize: 24, fontWeight: 700, color: t.text, letterSpacing: -0.5, marginTop: 2,
          }}>Upper Body Â· Heavy</div>
        </div>
        <div style={{
          padding: '8px 12px', borderRadius: 12,
          background: dark ? PW.d_sur2 : PW.n0,
          border: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {PWIcon.clock(t.text2, 16)}
          <span style={{ fontFamily: PW.mono, fontSize: 14, fontWeight: 700, color: t.text }}>18:42</span>
        </div>
      </div>

      {/* progress bar */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{
          height: 6, borderRadius: 3, background: dark ? PW.d_sur2 : PW.n200,
          overflow: 'hidden',
        }}>
          <div style={{
            width: '38%', height: '100%', background: PW.green, borderRadius: 3,
          }}/>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 6,
          fontFamily: PW.mono, fontSize: 11, color: t.text3,
        }}>
          <span>3 sets done</span><span>14 of 22 remaining</span>
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ExerciseRow
          name="Barbell Bench Press" muscle="Chest" sets={4} reps="6-8"
          currentSet={1} done dark={dark}/>
        <ExerciseRow
          name="Pull-ups (weighted)" muscle="Back" sets={4} reps="8"
          currentSet={2} weight={10} feedback={null} active dark={dark}/>
        <ExerciseRow
          name="Seated DB Shoulder Press" muscle="Shoulders" sets={3} reps="10"
          currentSet={1} dark={dark}/>
        <ExerciseRow
          name="Cable Lateral Raise" muscle="Shoulders" sets={3} reps="12-15"
          currentSet={1} dark={dark}/>
        <ExerciseRow
          name="Triceps Rope Pushdown" muscle="Arms" sets={3} reps="12"
          currentSet={1} dark={dark}/>
      </div>

      <div style={{ height: 12 }}/>

      {/* sticky bottom CTA */}
      <div style={{
        position: 'absolute', bottom: HOME_INSET, left: 0, right: 0,
        padding: '12px 16px',
        background: dark ? 'rgba(14,17,23,0.85)' : 'rgba(246,247,249,0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${t.border}`,
      }}>
        <PrimaryButton icon={PWIcon.check('#fff', 18)}>Complete workout</PrimaryButton>
      </div>
    </ScreenScroll>
  );
}

// ââ SCREEN 4: WEEKLY PROGRAM ââââââââââââââââââââââââââââââââââââââââââââââ
function Screen4Program({ dark = false }) {
  const t = pwTheme(dark);
  const week = [
    { label: 'M', date: 13, type: 'push', color: PW.green },
    { label: 'T', date: 14, type: 'pull', color: PW.teal },
    { label: 'W', date: 15, type: 'rest', color: null },
    { label: 'T', date: 16, type: 'legs', color: PW.green },
    { label: 'F', date: 17, type: 'pull', color: PW.teal },
    { label: 'S', date: 18, type: 'rest', color: null },
    { label: 'S', date: 19, type: 'cardio', color: PW.light },
  ];

  const days = [
    { label: 'Mon', date: 'May 13', name: 'Push Â· Chest + Triceps', muscles: ['Chest','Shoulders','Triceps'], dur: '52 min', tag: 'Done', tagColor: PW.green, done: true },
    { label: 'Tue', date: 'May 14', name: 'Pull Â· Back + Biceps', muscles: ['Back','Biceps'], dur: '48 min', tag: 'Done', tagColor: PW.green, done: true },
    { label: 'Wed', date: 'May 15', name: 'Rest day', rest: true },
    { label: 'Thu Â· today', date: 'May 16', name: 'Upper Â· Heavy', muscles: ['Chest','Back','Shoulders'], dur: '42 min', tag: 'Today', tagColor: PW.green, today: true },
    { label: 'Fri', date: 'May 17', name: 'Pull Â· Back volume', muscles: ['Back','Biceps','Rear delts'], dur: '55 min' },
    { label: 'Sat', date: 'May 18', name: 'Rest day', rest: true },
    { label: 'Sun', date: 'May 19', name: 'Zone 2 Cardio', muscles: ['Cardiovascular'], dur: '40 min' },
  ];

  return (
    <ScreenScroll dark={dark}>
      <div style={{ padding: '0 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
            color: t.text3, textTransform: 'uppercase',
          }}>Week 12 Â· Hypertrophy block</div>
          <div style={{
            fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: -0.6, marginTop: 2,
          }}>This week</div>
        </div>
        <button style={{
          width: 36, height: 36, borderRadius: 10,
          background: dark ? PW.d_sur2 : PW.n0,
          border: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>{PWIcon.chevron(t.text2, 14, 'right')}</button>
      </div>

      {/* Week strip */}
      <div style={{ padding: '0 16px', marginBottom: 16 }}>
        <WeekStrip days={week} active={3} dark={dark}/>
      </div>

      {/* Day list */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {days.map((d, i) => (
          <div key={i} style={{
            ...pwCard(t), padding: 14,
            background: d.today ? (dark ? '#0E2820' : PW.greenSo) : t.surface,
            border: `1px solid ${d.today ? PW.green : t.border}`,
            opacity: d.done ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: d.today ? PW.greenIn : t.text3,
                textTransform: 'uppercase', letterSpacing: 0.6,
              }}>{d.label.split(' ')[0]}</div>
              <div style={{
                fontFamily: PW.font, fontSize: 18, fontWeight: 700,
                color: d.today ? PW.greenIn : t.text, letterSpacing: -0.3,
              }}>{d.date.split(' ')[1]}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 15, fontWeight: 700, color: d.rest ? t.text2 : t.text,
                letterSpacing: -0.2,
              }}>{d.name}</div>
              <div style={{ display: 'flex', gap: 5, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                {d.rest ? (
                  <span style={{ fontSize: 12, color: t.text3 }}>Active recovery encouraged</span>
                ) : (
                  <>
                    {d.muscles && d.muscles.slice(0, 3).map(m => (
                      <span key={m} style={{
                        padding: '2px 7px', borderRadius: 6, fontSize: 10.5, fontWeight: 600,
                        background: dark ? 'rgba(0,194,209,0.16)' : PW.tealSo,
                        color: dark ? PW.teal : '#00868F',
                      }}>{m}</span>
                    ))}
                    <span style={{ fontFamily: PW.mono, fontSize: 11, color: t.text3 }}>Â· {d.dur}</span>
                  </>
                )}
              </div>
            </div>
            {d.tag && (
              <span style={{
                padding: '4px 10px', borderRadius: 9999,
                background: d.tagColor, color: '#fff',
                fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4,
              }}>{d.tag}</span>
            )}
            {!d.tag && !d.rest && PWIcon.chevron(t.text3, 14, 'right')}
          </div>
        ))}
      </div>

      <div style={{ padding: '18px 16px 0' }}>
        <SecondaryButton dark={dark} icon={PWIcon.sparkle(t.text, 16)}>Regenerate program</SecondaryButton>
      </div>

      <div style={{ position: 'absolute', bottom: HOME_INSET, left: 0, right: 0 }}>
        <BottomNav active="workout" dark={dark}/>
      </div>
    </ScreenScroll>
  );
}

// ââ SCREEN 5: PROGRESS ââââââââââââââââââââââââââââââââââââââââââââââââââââ
function Screen5Progress({ dark = false }) {
  const t = pwTheme(dark);

  // tiny bar chart inline
  const bars = [62, 78, 71, 88, 95, 82, 100, 90];
  return (
    <ScreenScroll dark={dark}>
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
          color: t.text3, textTransform: 'uppercase',
        }}>Your progress</div>
        <div style={{
          fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: -0.6, marginTop: 2,
        }}>The trend</div>
      </div>

      {/* Streak hero */}
      <div style={{ padding: '0 16px', marginBottom: 14 }}>
        <div style={{
          padding: 18, borderRadius: 20,
          background: `linear-gradient(135deg, ${PW.navy} 0%, #1A2540 100%)`,
          color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: dark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(15,23,38,0.16)',
        }}>
          <div style={{
            position: 'absolute', right: -20, top: -20, width: 140, height: 140,
            borderRadius: '50%', background: 'rgba(14,190,111,0.18)', filter: 'blur(30px)',
          }}/>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
                color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase',
              }}>Current streak</div>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4,
              }}>
                <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1.5 }}>12</span>
                <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>days</span>
              </div>
              <div style={{
                fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4,
              }}>Best ever: 18 days Â· Apr</div>
            </div>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32,
            }}>ð¥</div>
          </div>
        </div>
      </div>

      {/* Bench press chart */}
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <ProgressChartCard
          title="Bench Press Â· 1RM est."
          sub="Last 8 weeks"
          data={[88, 90, 90, 92.5, 92.5, 95, 97.5, 100]}
          dark={dark}/>
      </div>

      {/* Weekly volume bars */}
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <div style={{ ...pwCard(t), padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
                color: t.text3, textTransform: 'uppercase',
              }}>Weekly volume</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: t.text, letterSpacing: -0.2, marginTop: 2 }}>
                Total tonnage
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: PW.font, fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.5 }}>
                18.4<span style={{ fontSize: 13, color: t.text3, marginLeft: 3 }}>t</span>
              </div>
              <div style={{ fontFamily: PW.mono, fontSize: 11.5, color: PW.green, fontWeight: 600 }}>â 12% vs last</div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 6, height: 78, marginTop: 12,
          }}>
            {bars.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%', height: `${v}%`, borderRadius: 4,
                  background: i === bars.length - 1 ? PW.green : (dark ? PW.d_sur3 : PW.n200),
                }}/>
                <span style={{ fontSize: 9, color: t.text3, fontFamily: PW.mono }}>W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Energy/sleep trend */}
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <div style={{ ...pwCard(t), padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: t.text, letterSpacing: -0.2 }}>Recovery signals</div>
            <span style={{ fontFamily: PW.mono, fontSize: 11, color: t.text3 }}>7-day avg</span>
          </div>
          <svg width="100%" height="80" viewBox="0 0 280 80" preserveAspectRatio="none">
            {/* sleep trend */}
            <path d="M0 50 L40 42 L80 46 L120 30 L160 38 L200 28 L240 22 L280 26"
              stroke={PW.teal} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            {/* energy trend */}
            <path d="M0 60 L40 55 L80 48 L120 52 L160 42 L200 46 L240 36 L280 32"
              stroke={PW.green} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.text2 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: PW.teal }}/>Sleep
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.text2 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: PW.green }}/>Energy
            </span>
          </div>
        </div>
      </div>

      {/* Recent workouts */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: t.text2,
          padding: '4px 4px 8px',
        }}>Recent workouts</div>
        <div style={{ ...pwCard(t), padding: 4 }}>
          {[
            ['Tue Â· May 14', 'Pull Â· Back + Biceps', '48 min'],
            ['Mon Â· May 13', 'Push Â· Chest + Triceps', '52 min'],
            ['Sat Â· May 11', 'Legs Â· Heavy', '64 min'],
          ].map(([d, n, t2], i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: dark ? 'rgba(14,190,111,0.16)' : PW.greenSo,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: PW.green,
              }}>{PWIcon.check(PW.green, 18)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text, letterSpacing: -0.1 }}>{n}</div>
                <div style={{ fontSize: 11.5, color: t.text3, fontFamily: PW.mono, marginTop: 2 }}>{d} Â· {t2}</div>
              </div>
              {PWIcon.chevron(t.text3, 14, 'right')}
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: HOME_INSET, left: 0, right: 0 }}>
        <BottomNav active="progress" dark={dark}/>
      </div>
    </ScreenScroll>
  );
}

Object.assign(window, {
  Screen1Dashboard, Screen2Checkin, Screen3Workout, Screen4Program, Screen5Progress,
});
