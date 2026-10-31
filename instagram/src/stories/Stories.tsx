import type { ReactNode } from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { QUIZZES } from '../data'
import { C, DAYS_LEFT, FONT, SITE } from '../theme'
import { Background, BrandBar, Enter, Grad, LETTERS, Option, Pill, StickerSlot, Title, usePop } from '../ui'

/**
 * Las historias dejan libres las franjas de arriba (≈ 220 px) y abajo (≈ 320 px),
 * donde Instagram pone el perfil, la barra de progreso y la caja de respuesta.
 */
function StoryFrame({ tone = 'dark', children }: { tone?: 'dark' | 'indigo' | 'light'; children: ReactNode }) {
  return (
    <Background tone={tone}>
      <BrandBar top={230} light={tone === 'light'} />
      <AbsoluteFill style={{ padding: '370px 80px 340px', display: 'flex', flexDirection: 'column', gap: 40 }}>{children}</AbsoluteFill>
    </Background>
  )
}

/** 1 · Respuesta de la pregunta del post. */
export function StoryRespuesta() {
  const frame = useCurrentFrame()
  const q = QUIZZES.murphy
  const reveal = frame > 75
  return (
    <StoryFrame>
      <Enter>
        <Pill>Respuesta del post de hoy</Pill>
      </Enter>
      <Enter delay={6}>
        <Title size={80}>{q.stem}</Title>
      </Enter>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {q.options.map((o, i) => (
          <Enter key={o} delay={12 + i * 5}>
            <Option letter={LETTERS[i]} text={o} size={42} state={!reveal ? 'idle' : i === q.answer ? 'right' : 'dim'} />
          </Enter>
        ))}
      </div>
      {reveal && (
        <Enter delay={80}>
          <div style={{ fontSize: 40, lineHeight: 1.35, color: 'rgba(255,255,255,0.9)' }}>💡 {q.why}</div>
        </Enter>
      )}
      <Enter delay={95} style={{ marginTop: 'auto' }}>
        <div style={{ fontFamily: FONT.display, fontSize: 46, fontWeight: 800, color: C.white, textAlign: 'center' }}>
          ¿La acertaste? Responde a esta historia 🙌
        </div>
      </Enter>
    </StoryFrame>
  )
}

/** 2 · Encuesta. */
export function StoryEncuesta() {
  return (
    <StoryFrame tone="indigo">
      <Enter>
        <Pill color="#c7d2fe" bg="rgba(129,140,248,0.18)">Encuesta rápida</Pill>
      </Enter>
      <Enter delay={6}>
        <Title size={112}>
          ¿Ya empezaste a estudiar para el <Grad from={C.brand300} to={C.accent400}>ENURM 2027</Grad>?
        </Title>
      </Enter>
      <Enter delay={14}>
        <div style={{ fontSize: 42, color: 'rgba(255,255,255,0.85)', lineHeight: 1.35 }}>Sin pena: aquí nadie juzga. Mañana compartimos los resultados.</div>
      </Enter>
      <Enter delay={22}>
        <StickerSlot label="Pega aquí el sticker de ENCUESTA: «Sí, ya arranqué» / «Empiezo esta semana»" height={320} />
      </Enter>
    </StoryFrame>
  )
}

/** 3 · Quiz con el sticker nativo. */
export function StoryQuiz() {
  const q = QUIZZES.calcitonina
  const pop = usePop(4)
  return (
    <StoryFrame>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ fontSize: 110, transform: `scale(${pop}) rotate(${(1 - pop) * -30}deg)` }}>🧠</div>
        <Enter delay={4}>
          <Pill>Quiz · {q.specialty}</Pill>
        </Enter>
      </div>
      <Enter delay={10}>
        <Title size={96}>{q.stem}</Title>
      </Enter>
      <Enter delay={18}>
        <StickerSlot label={`Pega aquí el sticker de QUIZ con: ${q.options.join(' · ')} (correcta: ${q.options[q.answer]})`} height={460} />
      </Enter>
      <Enter delay={26}>
        <div style={{ fontSize: 38, color: C.mint, textAlign: 'center', fontWeight: 600 }}>1 082 preguntas así, gratis, en {SITE}</div>
      </Enter>
    </StoryFrame>
  )
}

/** 4 · Slider de emoji. */
export function StorySlider() {
  const frame = useCurrentFrame()
  const faces = ['😰', '😬', '🙂', '😎']
  const active = Math.floor(frame / 18) % faces.length
  return (
    <StoryFrame tone="light">
      <Enter>
        <Pill color={C.brand600} bg="rgba(11,165,149,0.12)">Sé sincero</Pill>
      </Enter>
      <Enter delay={6}>
        <Title size={108} color={C.brand950}>
          ¿Qué tan listo te sientes para el ENURM hoy?
        </Title>
      </Enter>
      <Enter delay={14}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
          {faces.map((f, i) => (
            <div key={f} style={{ fontSize: 130, transform: `scale(${i === active ? 1.25 : 0.85})`, opacity: i === active ? 1 : 0.45 }}>
              {f}
            </div>
          ))}
        </div>
      </Enter>
      <Enter delay={22}>
        <StickerSlot light label="Pega aquí el sticker de SLIDER con el emoji 😎" height={240} />
      </Enter>
    </StoryFrame>
  )
}

/** 5 · Cuenta atrás. */
export function StoryCuentaAtras() {
  const frame = useCurrentFrame()
  const n = Math.round(interpolate(frame, [0, 60], [DAYS_LEFT + 60, DAYS_LEFT], { extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3) }))
  return (
    <StoryFrame>
      <Enter>
        <Pill>ENURM 2027 · domingo 7 de marzo</Pill>
      </Enter>
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 380, lineHeight: 1, letterSpacing: -16, fontVariantNumeric: 'tabular-nums' }}>
          <Grad>{n}</Grad>
        </div>
        <Title size={84}>días</Title>
      </div>
      <Enter delay={60}>
        <div style={{ fontSize: 44, lineHeight: 1.35, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
          Activa el recordatorio y te avisamos cuando falte poco ⏰
        </div>
      </Enter>
      <Enter delay={70}>
        <StickerSlot label="Pega aquí el sticker de CUENTA REGRESIVA «ENURM 2027»" height={260} />
      </Enter>
    </StoryFrame>
  )
}

/** 6 · Caja de preguntas. */
export function StoryPreguntas() {
  const pop = usePop(2)
  return (
    <StoryFrame tone="indigo">
      <div style={{ fontSize: 160, textAlign: 'center', transform: `scale(${pop})` }}>🙋</div>
      <Enter delay={8}>
        <Title size={104} style={{ textAlign: 'center' }}>
          Pregúntanos lo que quieras del <Grad from={C.brand300} to={C.accent400}>ENURM</Grad>
        </Title>
      </Enter>
      <Enter delay={16}>
        <div style={{ fontSize: 40, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4, textAlign: 'center' }}>
          Cómo organizarte, qué temas pesan más, cómo usar la app… Respondemos todo en historias.
        </div>
      </Enter>
      <Enter delay={24}>
        <StickerSlot label="Pega aquí el sticker de PREGUNTAS" height={300} />
      </Enter>
    </StoryFrame>
  )
}

/** 7 · Reto con enlace. */
export function StoryReto() {
  const frame = useCurrentFrame()
  const seconds = Math.max(0, 600 - Math.floor(frame / 3))
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return (
    <StoryFrame>
      <Enter>
        <Pill color={C.amber} bg="rgba(251,191,36,0.14)">🔥 Reto de hoy</Pill>
      </Enter>
      <Enter delay={6}>
        <Title size={112}>
          10 preguntas.
          <br />
          <Grad from={C.amber} to={C.rose}>10 minutos.</Grad>
        </Title>
      </Enter>
      <Enter delay={12}>
        <div style={{ fontFamily: FONT.display, fontSize: 150, fontWeight: 800, color: C.white, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
          {mm}:{ss}
        </div>
      </Enter>
      <Enter delay={20}>
        <div style={{ fontSize: 42, lineHeight: 1.4, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
          Haz un simulacro rápido, sube la captura de tu nota y etiquétanos. Compartimos las mejores 🏆
        </div>
      </Enter>
      <Enter delay={28}>
        <StickerSlot label={`Pega aquí el sticker de ENLACE → ${SITE}`} height={200} />
      </Enter>
    </StoryFrame>
  )
}
