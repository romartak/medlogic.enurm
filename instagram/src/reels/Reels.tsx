import type { ReactNode } from 'react'
import { AbsoluteFill, Easing, interpolate, OffthreadVideo, Series, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { QUIZZES, type Quiz } from '../data'
import { C, DAYS_LEFT, FONT, SITE } from '../theme'
import { Background, BrandBar, Enter, Grad, LETTERS, Logo, Option, Pill, Title, usePop } from '../ui'

/** Funde la escena al entrar y al salir para que los cortes no sean bruscos. */
function Scene({ children, fade = 8 }: { children: ReactNode; fade?: number }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = interpolate(frame, [0, fade, durationInFrames - fade, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return <AbsoluteFill style={{ opacity, padding: '330px 80px 360px', display: 'flex', flexDirection: 'column', gap: 40 }}>{children}</AbsoluteFill>
}

function Outro({ line }: { line: ReactNode }) {
  const pop = usePop(0)
  return (
    <Scene>
      <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44, textAlign: 'center' }}>
        <div style={{ transform: `scale(${pop})` }}>
          <Logo size={200} />
        </div>
        <Enter delay={6}>
          <Title size={92}>{line}</Title>
        </Enter>
        <Enter delay={14}>
          <Pill size={34}>{SITE}</Pill>
        </Enter>
        <Enter delay={20}>
          <div style={{ fontSize: 40, color: 'rgba(255,255,255,0.85)' }}>Gratis · sin anuncios · enlace en la bio</div>
        </Enter>
      </div>
    </Scene>
  )
}

/* ------------------------------------------------------------------ */
/* Reel 1 · Responde en 5 segundos                                     */
/* ------------------------------------------------------------------ */

const Q_FRAMES = 195
const THINK = 150

function QuizScene({ q, n }: { q: Quiz; n: number }) {
  const frame = useCurrentFrame()
  const left = interpolate(frame, [15, THINK], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const secs = Math.ceil(left * 5)
  const reveal = frame >= THINK
  return (
    <Scene>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pill>
          Pregunta {n}/3 · {q.specialty}
        </Pill>
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontFamily: FONT.display,
            fontSize: 70,
            fontWeight: 800,
            color: reveal ? '#34d399' : secs <= 2 ? C.rose : C.white,
            background: `conic-gradient(${secs <= 2 ? C.rose : C.brand400} ${left * 360}deg, rgba(255,255,255,0.12) 0deg)`,
          }}
        >
          <div style={{ width: 106, height: 106, borderRadius: '50%', background: C.brand950, display: 'grid', placeItems: 'center' }}>{reveal ? '✓' : secs}</div>
        </div>
      </div>
      <Enter>
        <Title size={84}>{q.stem}</Title>
      </Enter>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {q.options.map((o, i) => (
          <Enter key={o} delay={6 + i * 4}>
            <Option letter={LETTERS[i]} text={o} size={44} state={!reveal ? 'idle' : i === q.answer ? 'right' : 'dim'} />
          </Enter>
        ))}
      </div>
      {reveal && (
        <Enter delay={THINK + 4}>
          <div style={{ fontSize: 40, lineHeight: 1.35, color: 'rgba(255,255,255,0.9)' }}>💡 {q.why}</div>
        </Enter>
      )}
    </Scene>
  )
}

export function ReelQuiz() {
  const qs = [QUIZZES.ectopico, QUIZZES.parkinson, QUIZZES.hipocalcemia]
  return (
    <Background>
      <BrandBar top={200} />
      <Series>
        <Series.Sequence durationInFrames={70}>
          <Scene>
            <div style={{ margin: 'auto 0', textAlign: 'center' }}>
              <Enter>
                <div style={{ fontSize: 170 }}>⏱️</div>
              </Enter>
              <Enter delay={5}>
                <Title size={120}>
                  Tienes <Grad>5 segundos</Grad>
                </Title>
              </Enter>
              <Enter delay={12}>
                <div style={{ fontSize: 50, color: 'rgba(255,255,255,0.85)', marginTop: 30 }}>3 preguntas reales tipo ENURM. ¿Cuántas sacas?</div>
              </Enter>
            </div>
          </Scene>
        </Series.Sequence>
        {qs.map((q, i) => (
          <Series.Sequence key={q.id} durationInFrames={Q_FRAMES}>
            <QuizScene q={q} n={i + 1} />
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={100}>
          <Outro
            line={
              <>
                ¿Sacaste 3/3? <Grad>Coméntalo</Grad> 👇
              </>
            }
          />
        </Series.Sequence>
      </Series>
    </Background>
  )
}

/* ------------------------------------------------------------------ */
/* Reel 2 · Recorrido por la app con las grabaciones reales            */
/* ------------------------------------------------------------------ */

const FEATURES: { file: string; emoji: string; title: string; detail: string; frames: number }[] = [
  { file: 'pregunta.mp4', emoji: '📚', title: 'Preguntas con explicación', detail: 'Por qué la correcta lo es y por qué las demás no', frames: 150 },
  { file: 'simulacro.mp4', emoji: '⏱️', title: 'Simulacros con reloj', detail: '100 preguntas, nota final y resultado por especialidad', frames: 150 },
  { file: 'flashcards.mp4', emoji: '🃏', title: 'Flashcards estilo Anki', detail: 'Repaso espaciado para que no se te olvide', frames: 150 },
  { file: 'plan.mp4', emoji: '🗓️', title: 'Tu plan de cada día', detail: 'Según los días que faltan y tus puntos débiles', frames: 150 },
]

function Phone({ src }: { src: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const lift = interpolate(frame, [0, fps * 0.6], [80, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  return (
    <div
      style={{
        alignSelf: 'center',
        width: 560,
        height: 1180,
        padding: 18,
        borderRadius: 76,
        background: '#0b1514',
        border: '3px solid rgba(255,255,255,0.18)',
        boxShadow: `0 60px 120px -30px rgba(0,0,0,0.7), 0 0 120px -20px ${C.brand500}`,
        transform: `translateY(${lift}px) rotate(${interpolate(frame, [0, 150], [-1.5, 1.5])}deg)`,
        overflow: 'hidden',
      }}
    >
      <OffthreadVideo src={staticFile(src)} muted style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 60 }} />
    </div>
  )
}

function FeatureScene({ f, n }: { f: (typeof FEATURES)[number]; n: number }) {
  return (
    <AbsoluteFill style={{ padding: '300px 70px 0', display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Enter distance={30}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontSize: 80 }}>{f.emoji}</span>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2, color: C.brand300 }}>{n}/4</div>
            <Title size={64}>{f.title}</Title>
          </div>
        </div>
      </Enter>
      <Enter delay={6} distance={30}>
        <div style={{ fontSize: 36, color: 'rgba(255,255,255,0.85)' }}>{f.detail}</div>
      </Enter>
      <Phone src={f.file} />
    </AbsoluteFill>
  )
}

export function ReelApp() {
  return (
    <Background>
      <BrandBar top={170} />
      <Series>
        <Series.Sequence durationInFrames={75}>
          <Scene>
            <div style={{ margin: 'auto 0', textAlign: 'center' }}>
              <Enter>
                <Title size={116}>
                  Prepara el ENURM <Grad>gratis</Grad>
                </Title>
              </Enter>
              <Enter delay={10}>
                <div style={{ fontSize: 52, color: 'rgba(255,255,255,0.85)', marginTop: 34 }}>Así se ve por dentro 👇</div>
              </Enter>
            </div>
          </Scene>
        </Series.Sequence>
        {FEATURES.map((f, i) => (
          <Series.Sequence key={f.file} durationInFrames={f.frames}>
            <FeatureScene f={f} n={i + 1} />
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={100}>
          <Outro
            line={
              <>
                Guárdalo y <Grad>empieza hoy</Grad>
              </>
            }
          />
        </Series.Sequence>
      </Series>
    </Background>
  )
}

/* ------------------------------------------------------------------ */
/* Reel 3 · Cuenta atrás y plan en 3 pasos                             */
/* ------------------------------------------------------------------ */

/** Trazo de ECG que se dibuja de izquierda a derecha, como en el logo. */
function EcgLine({ progress, y = 0 }: { progress: number; y?: number }) {
  const beat = 'l60 0 l20 -12 l20 12 l24 0 l14 30 l22 -190 l22 220 l16 -60 l34 0 l30 -26 l30 26 l88 0'
  const d = `M -20 120 ${beat} ${beat} ${beat}`
  return (
    <svg width={1080} height={300} viewBox="0 0 1080 300" style={{ position: 'absolute', left: 0, top: y }}>
      <path d={d} fill="none" stroke={C.brand300} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} style={{ filter: `drop-shadow(0 0 18px ${C.brand400})` }} />
    </svg>
  )
}

function Step({ n, title, detail, delay }: { n: number; title: string; detail: string; delay: number }) {
  return (
    <Enter delay={delay}>
      <div style={{ display: 'flex', gap: 30, alignItems: 'center', padding: '34px 36px', borderRadius: 36, background: 'rgba(255,255,255,0.07)', border: '3px solid rgba(255,255,255,0.14)' }}>
        <div style={{ width: 110, height: 110, flexShrink: 0, borderRadius: 30, display: 'grid', placeItems: 'center', background: C.brand500, fontFamily: FONT.display, fontSize: 64, fontWeight: 800, color: C.white }}>{n}</div>
        <div>
          <div style={{ fontFamily: FONT.display, fontSize: 50, fontWeight: 800, color: C.white }}>{title}</div>
          <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.8)', marginTop: 8, lineHeight: 1.3 }}>{detail}</div>
        </div>
      </div>
    </Enter>
  )
}

function CountdownScene() {
  const frame = useCurrentFrame()
  const n = Math.round(interpolate(frame, [10, 75], [365, DAYS_LEFT], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }))
  const draw = interpolate(frame, [0, 90], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <Scene>
      <EcgLine progress={draw} y={1300} />
      <div style={{ margin: 'auto 0', textAlign: 'center' }}>
        <Pill>ENURM 2027 · 7 de marzo</Pill>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 400, lineHeight: 1, letterSpacing: -16, marginTop: 30, fontVariantNumeric: 'tabular-nums' }}>
          <Grad>{n}</Grad>
        </div>
        <Title size={90}>días. Ni uno más.</Title>
      </div>
    </Scene>
  )
}

export function ReelPlan() {
  return (
    <Background>
      <BrandBar top={200} />
      <Series>
        <Series.Sequence durationInFrames={120}>
          <CountdownScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <Scene>
            <div style={{ margin: 'auto 0', textAlign: 'center' }}>
              <Enter>
                <Title size={110}>No estudies todo.</Title>
              </Enter>
              <Enter delay={22}>
                <Title size={110} style={{ marginTop: 20 }}>
                  Estudia <Grad>lo que toca hoy.</Grad>
                </Title>
              </Enter>
            </div>
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={210}>
          <Scene>
            <Enter>
              <Title size={84}>
                Tu plan en <Grad>3 pasos</Grad>
              </Title>
            </Enter>
            <Step n={1} delay={12} title="Elige tu meta" detail="Convocatoria, residencia y horas reales que tienes" />
            <Step n={2} delay={40} title="Recibe tu plan" detail="Tareas concretas para hoy según tu fase y tus fallos" />
            <Step n={3} delay={68} title="Cumple y sube tu racha" detail="Preguntas, flashcards y simulacros que se ajustan solos" />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={100}>
          <Outro
            line={
              <>
                Empieza tu plan <Grad>hoy</Grad>
              </>
            }
          />
        </Series.Sequence>
      </Series>
    </Background>
  )
}
