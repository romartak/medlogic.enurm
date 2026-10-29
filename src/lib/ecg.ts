import { seededRandom } from './utils'

/**
 * Generador de tiras de ECG (derivación DII) para el juego «Lee el ECG».
 * Cada latido se arma con curvas gaussianas (P, Q, R, S, T) sobre papel milimetrado:
 * 25 mm/s y 10 mm/mV, como un electrocardiógrafo real.
 */
export const PAPER_SPEED = 25 // mm/s
export const GAIN = 10 // mm/mV
export const SAMPLE_RATE = 250 // Hz

interface Wave {
  /** Tiempo del pico (s). */
  t: number
  /** Amplitud (mV). */
  a: number
  /** Ancho (desviación estándar, s). */
  w: number
}

export interface Beat {
  /** Tiempo del pico de la R (s). */
  r: number
  /** Onda P antes del QRS (s antes de la R); null si no hay P conducida. */
  pr: number | null
  wide?: boolean
  /** Elevación del ST (mV). */
  st?: number
  /** Onda T alta y picuda (hiperpotasemia). */
  peakedT?: boolean
  /** Latido ventricular prematuro (ancho, con T opuesta). */
  pvc?: boolean
}

export interface Strip {
  seconds: number
  beats: Beat[]
  /** Ondas P sueltas (bloqueos): tiempos de cada P. */
  extraP?: number[]
  /** Línea de base: «fibrilatoria» (FA), «sierra» (flutter), «caótica» (FV) o plana. */
  baseline?: 'fa' | 'flutter' | 'fv' | 'flat'
  noise?: number
}

function waves(b: Beat): Wave[] {
  const out: Wave[] = []
  if (b.pr !== null) out.push({ t: b.r - b.pr + 0.04, a: 0.15, w: 0.022 })
  if (b.pvc || b.wide) {
    out.push({ t: b.r, a: 1.1, w: 0.04 }, { t: b.r + 0.07, a: -0.45, w: 0.035 })
    out.push({ t: b.r + 0.3, a: b.pvc ? -0.45 : -0.35, w: 0.06 })
    return out
  }
  out.push({ t: b.r - 0.025, a: -0.1, w: 0.008 }, { t: b.r, a: 1.3, w: 0.011 }, { t: b.r + 0.028, a: -0.3, w: 0.01 })
  if (b.peakedT) out.push({ t: b.r + 0.24, a: 0.95, w: 0.03 })
  else out.push({ t: b.r + 0.27, a: 0.32, w: 0.05 })
  return out
}

/** Muestras en mV a SAMPLE_RATE. */
export function renderStrip(strip: Strip, seed = 'ecg'): number[] {
  const rng = seededRandom(seed)
  const n = Math.round(strip.seconds * SAMPLE_RATE)
  const out = new Array<number>(n).fill(0)
  const all: Wave[] = strip.beats.flatMap(waves)
  for (const p of strip.extraP ?? []) all.push({ t: p + 0.04, a: 0.15, w: 0.022 })
  // Ondas de fibrilación ventricular: varias frecuencias que cambian de amplitud.
  const fv = Array.from({ length: 4 }, () => ({ f: 3.5 + rng() * 3, ph: rng() * 6.28, a: 0.25 + rng() * 0.35 }))
  const fa = Array.from({ length: 5 }, () => ({ f: 5 + rng() * 4, ph: rng() * 6.28, a: 0.02 + rng() * 0.03 }))
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE
    let v = 0
    for (const w of all) {
      const d = t - w.t
      if (Math.abs(d) < w.w * 5) v += w.a * Math.exp(-(d * d) / (2 * w.w * w.w))
    }
    for (const b of strip.beats) {
      if (b.st && t > b.r + 0.04 && t < b.r + 0.32) {
        // Segmento ST elevado que se funde con la T (forma convexa de lesión).
        const x = (t - (b.r + 0.04)) / 0.28
        v += b.st * Math.sin(Math.PI * Math.min(1, x * 1.15)) ** 0.6
      }
    }
    if (strip.baseline === 'fa') for (const s of fa) v += s.a * Math.sin(2 * Math.PI * s.f * t + s.ph)
    if (strip.baseline === 'flutter') {
      const ph = (t * 5) % 1 // 300 por minuto
      v += ph < 0.75 ? -0.22 * (ph / 0.75) : -0.22 + 0.22 * ((ph - 0.75) / 0.25)
    }
    if (strip.baseline === 'fv') {
      const env = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.35 * t)
      for (const s of fv) v += env * s.a * Math.sin(2 * Math.PI * s.f * t + s.ph)
    }
    v += (rng() - 0.5) * (strip.noise ?? 0.015)
    out[i] = v
  }
  return out
}

/** Latidos regulares a una frecuencia dada. */
function regular(rate: number, seconds: number, opts: Omit<Beat, 'r'> = { pr: 0.16 }, start = 0.35): Beat[] {
  const rr = 60 / rate
  const beats: Beat[] = []
  for (let r = start; r < seconds - 0.3; r += rr) beats.push({ ...opts, r })
  return beats
}

export interface EcgPattern {
  id: string
  name: string
  /** Lo que hay que buscar para reconocerlo. */
  clues: string
  /** Lo que se hace (para ENURM). */
  management: string
  build: (seconds: number, rng: () => number) => Strip
}

export const ECG_PATTERNS: EcgPattern[] = [
  {
    id: 'sinusal',
    name: 'Ritmo sinusal normal',
    clues: 'Una P positiva antes de cada QRS, PR de 0,12–0,20 s (3–5 cuadritos), QRS estrecho y frecuencia de 60–100 lpm.',
    management: 'Normal: no requiere tratamiento.',
    build: (s, rng) => ({ seconds: s, beats: regular(68 + rng() * 20, s) }),
  },
  {
    id: 'taquicardia-sinusal',
    name: 'Taquicardia sinusal',
    clues: 'Ritmo sinusal (P antes de cada QRS) a más de 100 lpm; las ondas se acercan pero se conservan.',
    management: 'Tratar la causa: fiebre, dolor, anemia, hipovolemia, hipertiroidismo, ansiedad.',
    build: (s, rng) => ({ seconds: s, beats: regular(115 + rng() * 25, s, { pr: 0.13 }) }),
  },
  {
    id: 'bradicardia-sinusal',
    name: 'Bradicardia sinusal',
    clues: 'Ritmo sinusal a menos de 60 lpm: P antes de cada QRS con PR normal y mucha distancia entre latidos.',
    management: 'Si da síntomas (hipotensión, síncope): atropina 1 mg IV cada 3–5 min (máx. 3 mg); si no responde, marcapasos o dopamina/adrenalina.',
    build: (s, rng) => ({ seconds: s, beats: regular(40 + rng() * 10, s) }),
  },
  {
    id: 'fibrilacion-auricular',
    name: 'Fibrilación auricular',
    clues: 'Ritmo irregularmente irregular, sin ondas P, con línea de base ondulante (ondas f).',
    management: 'Controlar la frecuencia (betabloqueante o calcioantagonista), valorar anticoagulación con CHA₂DS₂-VASc; si está inestable, cardioversión eléctrica sincronizada.',
    build: (s, rng) => {
      const beats: Beat[] = []
      for (let r = 0.3; r < s - 0.3; r += 0.38 + rng() * 0.55) beats.push({ r, pr: null })
      return { seconds: s, beats, baseline: 'fa' }
    },
  },
  {
    id: 'flutter',
    name: 'Flutter auricular 2:1',
    clues: 'Ondas F en «dientes de sierra» a unos 300 por minuto, con un QRS cada dos ondas (150 lpm), regular.',
    management: 'Control de frecuencia y anticoagulación como en la FA; la ablación del istmo cavotricuspídeo es muy eficaz. Inestable: cardioversión sincronizada.',
    build: (s) => ({ seconds: s, beats: regular(150, s, { pr: null }, 0.32), baseline: 'flutter' }),
  },
  {
    id: 'tsv',
    name: 'Taquicardia supraventricular',
    clues: 'Taquicardia regular de QRS estrecho a 150–250 lpm, sin ondas P visibles.',
    management: 'Estable: maniobras vagales y luego adenosina 6 mg IV rápido (luego 12 mg). Inestable: cardioversión sincronizada.',
    build: (s, rng) => ({ seconds: s, beats: regular(180 + rng() * 30, s, { pr: null }, 0.25) }),
  },
  {
    id: 'tv',
    name: 'Taquicardia ventricular',
    clues: 'Taquicardia regular de QRS ancho (> 0,12 s) y deformado, sin P relacionadas.',
    management: 'Con pulso e inestable: cardioversión sincronizada. Estable: amiodarona. Sin pulso: desfibrilar como la FV (RCP).',
    build: (s, rng) => ({ seconds: s, beats: regular(160 + rng() * 30, s, { pr: null, wide: true }, 0.25) }),
  },
  {
    id: 'fv',
    name: 'Fibrilación ventricular',
    clues: 'Ondas caóticas e irregulares, sin QRS reconocibles. El paciente está en paro.',
    management: 'Paro cardiaco: RCP y desfibrilación inmediata; adrenalina 1 mg cada 3–5 min y amiodarona 300 mg tras la tercera descarga.',
    build: (s) => ({ seconds: s, beats: [], baseline: 'fv', noise: 0.03 }),
  },
  {
    id: 'asistolia',
    name: 'Asistolia',
    clues: 'Línea prácticamente plana, sin actividad eléctrica. Confirma en dos derivaciones y revisa los cables.',
    management: 'Ritmo no desfibrilable: RCP de alta calidad y adrenalina 1 mg cada 3–5 min; busca causas reversibles (5H y 5T).',
    build: (s) => ({ seconds: s, beats: [], baseline: 'flat', noise: 0.02 }),
  },
  {
    id: 'bav1',
    name: 'Bloqueo AV de primer grado',
    clues: 'Cada P conduce un QRS, pero el PR es largo (> 0,20 s, más de un cuadro grande) y constante.',
    management: 'Benigno; suele no necesitar tratamiento. Revisar fármacos que enlentecen el nodo AV.',
    build: (s, rng) => ({ seconds: s, beats: regular(65 + rng() * 10, s, { pr: 0.32 }, 0.5) }),
  },
  {
    id: 'mobitz1',
    name: 'Bloqueo AV de segundo grado Mobitz I (Wenckebach)',
    clues: 'El PR se alarga latido a latido hasta que una P no conduce (falta el QRS); luego el ciclo se repite.',
    management: 'Suele ser benigno (nodo AV); si da síntomas, atropina.',
    build: (s) => {
      const beats: Beat[] = []
      const extraP: number[] = []
      const pp = 0.8
      const prs = [0.16, 0.26, 0.34]
      let k = 0
      for (let p = 0.25; p < s - 0.5; p += pp) {
        const i = k % 4
        if (i === 3) extraP.push(p)
        else beats.push({ r: p + prs[i], pr: prs[i] })
        k++
      }
      return { seconds: s, beats, extraP }
    },
  },
  {
    id: 'mobitz2',
    name: 'Bloqueo AV de segundo grado Mobitz II',
    clues: 'PR constante, y de pronto una P que no conduce (falta el QRS) sin alargamiento previo.',
    management: 'Riesgo de pasar a bloqueo completo: marcapasos (transcutáneo si está inestable, luego definitivo).',
    build: (s) => {
      const beats: Beat[] = []
      const extraP: number[] = []
      let k = 0
      for (let p = 0.25; p < s - 0.5; p += 0.8) {
        if (k % 3 === 2) extraP.push(p)
        else beats.push({ r: p + 0.18, pr: 0.18 })
        k++
      }
      return { seconds: s, beats, extraP }
    },
  },
  {
    id: 'bav3',
    name: 'Bloqueo AV completo (tercer grado)',
    clues: 'Las P van a su ritmo y los QRS al suyo, más lento: no hay relación entre P y QRS (PR variable). Escape lento, a menudo ancho.',
    management: 'Marcapasos: transcutáneo si está inestable y después definitivo. La atropina suele no funcionar.',
    build: (s) => {
      const beats: Beat[] = []
      for (let r = 0.6; r < s - 0.3; r += 1.55) beats.push({ r, pr: null, wide: true })
      const extraP: number[] = []
      for (let p = 0.15; p < s - 0.2; p += 0.72) extraP.push(p)
      return { seconds: s, beats, extraP }
    },
  },
  {
    id: 'hiperkalemia',
    name: 'Hiperpotasemia (T picudas)',
    clues: 'Ondas T altas, estrechas y simétricas «en tienda de campaña». Si sube más: P aplanadas, QRS ancho y onda sinusoidal.',
    management: 'Gluconato de calcio IV para proteger el corazón; insulina con glucosa y salbutamol para meter el potasio; luego eliminarlo (diuréticos, resinas o diálisis).',
    build: (s, rng) => ({ seconds: s, beats: regular(72 + rng() * 15, s, { pr: 0.16, peakedT: true }) }),
  },
  {
    id: 'iamcest',
    name: 'Elevación del ST (lesión aguda)',
    clues: 'El segmento ST queda por encima de la línea de base y se funde con la T en forma convexa («lápida»). Busca el territorio y los cambios especulares en el ECG de 12 derivaciones.',
    management: 'IAM con elevación del ST: aspirina, doble antiagregación, anticoagulación y reperfusión urgente (angioplastia o fibrinólisis).',
    build: (s, rng) => ({ seconds: s, beats: regular(78 + rng() * 18, s, { pr: 0.16, st: 0.35 }) }),
  },
  {
    id: 'bigeminismo',
    name: 'Extrasístoles ventriculares en bigeminismo',
    clues: 'Cada latido normal va seguido de un latido prematuro ancho y deformado, sin P, con T en sentido opuesto.',
    management: 'Buscar causas (potasio, magnesio, isquemia, estimulantes). Si son pocas y sin cardiopatía, suelen ser benignas.',
    build: (s) => {
      const beats: Beat[] = []
      let normal = true
      for (let r = 0.4; r < s - 0.4; ) {
        beats.push(normal ? { r, pr: 0.16 } : { r, pr: null, pvc: true })
        r += normal ? 0.48 : 1.05
        normal = !normal
      }
      return { seconds: s, beats }
    },
  },
]

export const ecgById = (id: string) => ECG_PATTERNS.find((p) => p.id === id)!

/** Una tira lista para dibujar: muestras y frecuencia aproximada. */
export function makeStrip(patternId: string, seed: string, seconds = 6) {
  const rng = seededRandom(`${patternId}-${seed}`)
  const strip = ecgById(patternId).build(seconds, rng)
  return { strip, samples: renderStrip(strip, `${patternId}-${seed}`) }
}

/**
 * Tramo de ECG que se puede repetir sin costura, para el monitor en vivo. Se corta un poco antes de dos
 * latidos del mismo tipo (mismo PR y morfología) y con el mismo latido previo, en la pausa entre la T del
 * anterior y la P del siguiente: así el final empalma con el principio como un latido más.
 * Devuelve también la frecuencia ventricular (null si no hay QRS: FV, asistolia).
 */
export function loopSegment(patternId: string, seed: string, seconds = 30) {
  const { strip, samples } = makeStrip(patternId, seed, seconds)
  const beats = strip.beats
  if (beats.length < 4) return { samples, beats: [] as number[], seconds, rate: null as number | null }
  const kind = (b: Beat) => `${b.pr}|${!!b.pvc}|${!!b.wide}`
  const a = 1
  let b = beats.length - 1
  while (b > a && kind(beats[b]) !== kind(beats[a])) b--
  // La P empieza unos 0,08 s antes de su pico; la T del latido previo termina a ~0,45 s de su R.
  const lower = Math.max(beats[a].pr ?? 0, beats[b].pr ?? 0) + 0.09
  const upper = Math.min(beats[a].r - beats[a - 1].r, beats[b].r - beats[b - 1].r) - 0.45
  const lead = upper >= lower ? (lower + upper) / 2 : lower
  const from = Math.round((beats[a].r - lead) * SAMPLE_RATE)
  const to = Math.round((beats[b].r - lead) * SAMPLE_RATE)
  const kept = beats.slice(a, b).map((x) => x.r - from / SAMPLE_RATE)
  const span = (to - from) / SAMPLE_RATE
  return { samples: samples.slice(from, to), beats: kept, seconds: span, rate: Math.round((60 * kept.length) / span) }
}
