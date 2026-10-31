import { AbsoluteFill } from 'remotion'
import { QUIZZES } from '../data'
import { C, DAYS_LEFT, FONT } from '../theme'
import { Background, BrandBar, Footer, Grad, LETTERS, Logo, Option, Pill, Title } from '../ui'

const PAD = 72

/** 1 · Pregunta del día: la gente comenta su letra. */
export function PostPregunta() {
  const q = QUIZZES.murphy
  return (
    <Background>
      <BrandBar />
      <AbsoluteFill style={{ padding: PAD, paddingTop: 190, gap: 34 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Pill>Pregunta del día</Pill>
          <Pill color={C.accent400} bg="rgba(99,102,241,0.16)">{q.specialty}</Pill>
        </div>
        <Title size={76}>{q.stem}</Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 10 }}>
          {q.options.map((o, i) => (
            <Option key={o} letter={LETTERS[i]} text={o} />
          ))}
        </div>
        <div style={{ marginTop: 'auto', marginBottom: 70, fontFamily: FONT.display, fontSize: 44, fontWeight: 800, color: C.white, textAlign: 'center' }}>
          Comenta <Grad>A, B, C o D</Grad> 👇
        </div>
      </AbsoluteFill>
      <Footer text="La respuesta, en las historias" />
    </Background>
  )
}

/** 2 · Mito o realidad. */
export function PostMito() {
  return (
    <Background tone="indigo">
      <BrandBar />
      <AbsoluteFill style={{ padding: PAD, paddingTop: 220, alignItems: 'center', textAlign: 'center' }}>
        <Pill color="#c7d2fe" bg="rgba(129,140,248,0.18)">Neurología</Pill>
        <Title size={110} style={{ marginTop: 50 }}>
          ¿<Grad from={C.rose} to={C.amber}>Mito</Grad> o <Grad>realidad</Grad>?
        </Title>
        <div
          style={{
            marginTop: 70,
            padding: '56px 60px',
            borderRadius: 44,
            background: 'rgba(255,255,255,0.08)',
            border: '3px solid rgba(255,255,255,0.16)',
            fontFamily: FONT.display,
            fontSize: 60,
            fontWeight: 700,
            lineHeight: 1.2,
            color: C.white,
          }}
        >
          “El temblor del Parkinson empeora cuando el paciente se mueve.”
        </div>
        <div style={{ display: 'flex', gap: 30, marginTop: 70 }}>
          <Choice emoji="❌" label="Mito" color={C.rose} />
          <Choice emoji="✅" label="Realidad" color="#34d399" />
        </div>
      </AbsoluteFill>
      <Footer text="Vota en comentarios · respuesta en el pie de foto" />
    </Background>
  )
}

function Choice({ emoji, label, color }: { emoji: string; label: string; color: string }) {
  return (
    <div
      style={{
        width: 400,
        padding: '34px 0',
        borderRadius: 32,
        border: `4px solid ${color}`,
        background: `${color}22`,
        color: C.white,
        fontFamily: FONT.display,
        fontSize: 52,
        fontWeight: 800,
      }}
    >
      {emoji} {label}
    </div>
  )
}

/** 3 · Cuenta atrás + pregunta para comentar. */
export function PostCuentaAtras() {
  return (
    <Background>
      <BrandBar />
      <AbsoluteFill style={{ padding: PAD, paddingTop: 210, alignItems: 'center', textAlign: 'center' }}>
        <Pill>ENURM 2027 · 7 de marzo</Pill>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 340, lineHeight: 1, letterSpacing: -14, marginTop: 30 }}>
          <Grad>{DAYS_LEFT}</Grad>
        </div>
        <Title size={80} style={{ marginTop: -10 }}>días para el examen</Title>
        <div style={{ marginTop: 70, fontSize: 44, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>¿Cuántas horas estudias al día?</div>
        <div style={{ display: 'flex', gap: 22, marginTop: 34 }}>
          {['1 h', '2 h', '4 h', '6 h+'].map((h) => (
            <div
              key={h}
              style={{
                width: 210,
                padding: '30px 0',
                borderRadius: 28,
                background: 'rgba(255,255,255,0.08)',
                border: '3px solid rgba(255,255,255,0.16)',
                fontFamily: FONT.display,
                fontSize: 52,
                fontWeight: 800,
                color: C.white,
              }}
            >
              {h}
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <Footer text="Cuéntanos en comentarios 👇 · sin juzgar a nadie" />
    </Background>
  )
}

/** 4 · Etiqueta a tu rival de estudio. */
export function PostEtiqueta() {
  return (
    <Background tone="indigo">
      <BrandBar />
      <AbsoluteFill style={{ padding: PAD, paddingTop: 200, alignItems: 'center', textAlign: 'center' }}>
        <Title size={92}>
          Etiqueta a quien te <Grad from={C.amber} to={C.rose}>ganaría</Grad> un duelo de 10 preguntas
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 70 }}>
          <Player emoji="🧑‍⚕️" name="Tú" score="7" color={C.brand400} />
          <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 90, color: C.amber }}>VS</div>
          <Player emoji="👩‍⚕️" name="@tu_pana" score="?" color={C.accent400} />
        </div>
        <div style={{ marginTop: 60, fontSize: 38, lineHeight: 1.35, color: 'rgba(255,255,255,0.85)', maxWidth: 820 }}>
          Crea el duelo en MedLogic, mándale el enlace y que hable el marcador.
        </div>
      </AbsoluteFill>
      <Footer text="Duelos gratis · enlace en la bio" />
    </Background>
  )
}

function Player({ emoji, name, score, color }: { emoji: string; name: string; score: string; color: string }) {
  return (
    <div style={{ width: 330, padding: '40px 0', borderRadius: 44, background: 'rgba(255,255,255,0.08)', border: `4px solid ${color}` }}>
      <div style={{ fontSize: 130 }}>{emoji}</div>
      <div style={{ fontSize: 40, fontWeight: 700, color: C.white, marginTop: 10 }}>{name}</div>
      <div style={{ fontFamily: FONT.display, fontSize: 96, fontWeight: 800, color, marginTop: 6 }}>{score}/10</div>
    </div>
  )
}

/** 5 · Perla para guardar: escala de Glasgow. */
export function PostPerla() {
  const rows: [string, number, string][] = [
    ['Ocular', 4, 'Espontánea · al hablarle · a la presión · nada'],
    ['Verbal', 5, 'Orientado · confuso · palabras · sonidos · nada'],
    ['Motora', 6, 'Obedece · localiza · retira · flexión · extensión · nada'],
  ]
  return (
    <Background tone="light">
      <BrandBar light />
      <AbsoluteFill style={{ padding: PAD, paddingTop: 180, gap: 26 }}>
        <Pill color={C.brand600} bg="rgba(11,165,149,0.12)">🔖 Perla para guardar</Pill>
        <Title size={80} color={C.brand950}>
          Escala de Glasgow
          <br />
          en 30 segundos
        </Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 10 }}>
          {rows.map(([name, max, detail]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 30, padding: '22px 30px', borderRadius: 32, background: C.white, boxShadow: '0 18px 40px -12px rgba(15,23,42,0.18)' }}>
              <div style={{ width: 108, height: 108, borderRadius: 28, display: 'grid', placeItems: 'center', background: C.brand500, color: C.white, fontFamily: FONT.display, fontSize: 66, fontWeight: 800 }}>{max}</div>
              <div>
                <div style={{ fontFamily: FONT.display, fontSize: 48, fontWeight: 800, color: C.brand950 }}>{name}</div>
                <div style={{ fontSize: 28, color: '#335d5a', marginTop: 6, lineHeight: 1.3 }}>{detail}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
          {[
            ['3–15', 'puntaje mínimo y máximo'],
            ['≤ 8', 'TCE grave: protege la vía aérea'],
          ].map(([big, small]) => (
            <div key={big} style={{ flex: 1, padding: '22px 28px', borderRadius: 28, background: C.brand950, color: C.white }}>
              <div style={{ fontFamily: FONT.display, fontSize: 54, fontWeight: 800, color: C.brand300 }}>{big}</div>
              <div style={{ fontSize: 26, marginTop: 2, opacity: 0.9 }}>{small}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <Footer light text="Guárdalo y compártelo con tu grupo de estudio" />
    </Background>
  )
}

/** 6 · ¿Qué residencia quieres? */
export function PostResidencia() {
  const tiles: [string, string][] = [
    ['🫀', 'Cardiología'],
    ['🔪', 'Cirugía'],
    ['👶', 'Pediatría'],
    ['🤰', 'Gineco-obstetricia'],
    ['🧠', 'Neurología'],
    ['🩺', 'Medicina interna'],
    ['🚑', 'Emergencias'],
    ['🦴', 'Ortopedia'],
    ['👁️', 'Oftalmología'],
  ]
  return (
    <Background>
      <BrandBar />
      <AbsoluteFill style={{ padding: PAD, paddingTop: 180, alignItems: 'center', textAlign: 'center' }}>
        <Title size={84}>
          ¿Qué residencia <Grad>quieres</Grad>?
        </Title>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 40, width: '100%' }}>
          {tiles.map(([emoji, name]) => (
            <div key={name} style={{ padding: '22px 10px', borderRadius: 32, background: 'rgba(255,255,255,0.07)', border: '3px solid rgba(255,255,255,0.14)' }}>
              <div style={{ fontSize: 80 }}>{emoji}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.white, marginTop: 10 }}>{name}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 36, fontFamily: FONT.display, fontSize: 44, fontWeight: 800, color: C.white }}>
          Responde con un emoji 👇
        </div>
      </AbsoluteFill>
      <Footer text="Tu plan en MedLogic se adapta a la residencia que elijas" />
    </Background>
  )
}

/** 7 · Todo lo que hay gratis. */
export function PostGratis() {
  const items: [string, string, string][] = [
    ['📚', '1 082', 'preguntas con explicación'],
    ['⏱️', '100', 'preguntas por simulacro, con reloj'],
    ['🃏', 'Anki', 'flashcards con repaso espaciado'],
    ['🩻', '18', 'casos clínicos y lector de ECG'],
    ['🧮', '12', 'calculadoras clínicas'],
    ['🔥', '0', 'anuncios, pagos o cuenta obligatoria'],
  ]
  return (
    <Background>
      <BrandBar />
      <AbsoluteFill style={{ padding: PAD, paddingTop: 190, gap: 26 }}>
        <Title size={92}>
          Todo esto es <Grad>gratis</Grad>.<br />De verdad.
        </Title>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 14 }}>
          {items.map(([emoji, big, small]) => (
            <div key={small} style={{ padding: '30px 30px', borderRadius: 32, background: 'rgba(255,255,255,0.07)', border: '3px solid rgba(255,255,255,0.14)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 56 }}>{emoji}</span>
                <span style={{ fontFamily: FONT.display, fontSize: 54, fontWeight: 800, color: C.brand300 }}>{big}</span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 600, color: C.white, marginTop: 10, lineHeight: 1.25 }}>{small}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', marginBottom: 74, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <Logo size={60} />
          <span style={{ fontFamily: FONT.display, fontSize: 42, fontWeight: 800, color: C.white }}>Enlace en la bio 🔗</span>
        </div>
      </AbsoluteFill>
      <Footer text="Hecho por y para médicos en formación 🇩🇴" />
    </Background>
  )
}
