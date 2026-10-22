import type { CardState, DeckConfig, Grade, RevKind } from './types'

const MIN = 60_000
const DAY = 86_400_000

export const DEFAULT_CONFIG: DeckConfig = {
  id: 'default',
  name: 'Predeterminado',
  newPerDay: 20,
  reviewsPerDay: 200,
  learningSteps: [1, 10],
  graduatingInterval: 1,
  easyInterval: 4,
  relearningSteps: [10],
  minimumInterval: 1,
  lapseNewInterval: 0,
  leechThreshold: 8,
  leechAction: 'tag',
  startingEase: 2.5,
  easyBonus: 1.3,
  intervalModifier: 1,
  hardInterval: 1.2,
  maximumInterval: 36500,
  newOrder: 'sequential',
  reviewOrder: 'due',
  newReviewMix: 'mix',
  buryNewSiblings: true,
  buryReviewSiblings: true,
}

export const PRESETS: DeckConfig[] = [
  DEFAULT_CONFIG,
  { ...DEFAULT_CONFIG, id: 'intensivo', name: 'ENURM intensivo', newPerDay: 50, reviewsPerDay: 500, learningSteps: [1, 10, 60], relearningSteps: [10, 60], maximumInterval: 180 },
  { ...DEFAULT_CONFIG, id: 'recta-final', name: 'Recta final', newPerDay: 0, reviewsPerDay: 9999, maximumInterval: 30, intervalModifier: 0.8 },
]

/* ---------- días con hora de corte (como Anki) ---------- */

/** Número de día local; el día cambia a la hora de corte (por defecto 4:00). */
export function dayNumber(ts: number, rolloverHour = 4): number {
  const d = new Date(ts - rolloverHour * 3_600_000)
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY)
}

/** Marca de tiempo en la que empieza un día Anki. */
export function dayStart(day: number, rolloverHour = 4): number {
  const d = new Date(day * DAY)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), rolloverHour).getTime()
}

export function newCardState(position = 0): CardState {
  return { type: 'new', due: 0, interval: 0, ease: 0, reps: 0, lapses: 0, step: 0, lastReview: 0, position }
}

/* ---------- variación aleatoria (fuzz) de Anki ---------- */

export function fuzzRange(ivl: number): [number, number] {
  if (ivl < 2.5) return [ivl, ivl]
  if (ivl < 7) return [ivl - 1, ivl + 1]
  if (ivl < 30) {
    const f = Math.max(2, Math.round(ivl * 0.15))
    return [ivl - f, ivl + f]
  }
  const f = Math.max(4, Math.round(ivl * 0.05))
  return [ivl - f, ivl + f]
}

export interface AnswerResult {
  state: CardState
  kind: RevKind
  /** El repaso convirtió la tarjeta en sanguijuela (leech). */
  leech: boolean
}

export interface AnswerOptions {
  now: number
  rolloverHour?: number
  /** Generador aleatorio en [0, 1) para el fuzz; usa () => 0.5 para resultados deterministas. */
  rng?: () => number
}

function learningDelay(steps: number[], step: number, grade: Grade): number {
  const s = steps.length ? steps : [1]
  if (grade === 1) return s[0]
  if (grade === 2) {
    // "Difícil" repite el paso actual; en el primero usa el promedio de los dos primeros (Anki v3).
    if (step === 0) return s.length > 1 ? (s[0] + s[1]) / 2 : s[0] * 1.5
    return s[Math.min(step, s.length - 1)]
  }
  return s[Math.min(step, s.length - 1)]
}

/**
 * Aplica una respuesta a una tarjeta siguiendo el algoritmo SM-2 de Anki
 * (pasos de aprendizaje, graduación, lapsos, reaprendizaje, factor de facilidad y fuzz).
 */
export function answerCard(prev: CardState, grade: Grade, conf: DeckConfig, opts: AnswerOptions): AnswerResult {
  const { now, rolloverHour = 4, rng = Math.random } = opts
  const today = dayNumber(now, rolloverHour)
  const s: CardState = { ...prev, reps: prev.reps + 1, lastReview: now }
  const steps = conf.learningSteps
  const relearn = conf.relearningSteps

  const scheduleReview = (ivl: number) => {
    let days = Math.min(conf.maximumInterval, Math.max(1, Math.round(ivl)))
    const [lo, hi] = fuzzRange(days)
    if (hi > lo) days = Math.min(conf.maximumInterval, Math.round(lo + rng() * (hi - lo)))
    s.type = 'review'
    s.interval = days
    s.step = 0
    s.due = dayStart(today + days, rolloverHour)
  }

  const graduate = (ivl: number) => {
    s.ease = prev.ease || conf.startingEase
    s.type = 'review'
    s.interval = Math.min(conf.maximumInterval, ivl)
    s.step = 0
    s.due = dayStart(today + s.interval, rolloverHour)
  }

  // Nuevas y en aprendizaje
  if (prev.type === 'new' || prev.type === 'learning') {
    const kind: RevKind = prev.type === 'new' ? 'new' : 'learn'
    s.ease = prev.ease || conf.startingEase
    if (grade === 4) {
      graduate(conf.easyInterval)
      return { state: s, kind, leech: false }
    }
    if (grade === 3) {
      const next = prev.type === 'new' ? 1 : prev.step + 1
      if (!steps.length || next >= steps.length) {
        graduate(conf.graduatingInterval)
      } else {
        s.type = 'learning'
        s.step = next
        s.due = now + steps[next] * MIN
      }
      return { state: s, kind, leech: false }
    }
    if (!steps.length) {
      graduate(conf.graduatingInterval)
      return { state: s, kind, leech: false }
    }
    s.type = 'learning'
    s.step = grade === 1 ? 0 : prev.type === 'new' ? 0 : prev.step
    s.due = now + learningDelay(steps, s.step, grade) * MIN
    return { state: s, kind, leech: false }
  }

  // Reaprendizaje (después de un lapso)
  if (prev.type === 'relearning') {
    if (grade === 4 || (grade === 3 && prev.step + 1 >= relearn.length)) {
      s.type = 'review'
      s.step = 0
      s.interval = Math.max(conf.minimumInterval, prev.interval) + (grade === 4 ? 1 : 0)
      s.due = dayStart(today + s.interval, rolloverHour)
    } else if (grade === 3) {
      s.step = prev.step + 1
      s.due = now + relearn[s.step] * MIN
    } else {
      s.step = grade === 1 ? 0 : prev.step
      s.due = now + learningDelay(relearn, s.step, grade) * MIN
    }
    return { state: s, kind: 'relearn', leech: false }
  }

  // Repaso
  const ivl = Math.max(1, prev.interval)
  const dueDay = dayNumber(prev.due, rolloverHour)
  const daysLate = Math.max(0, today - dueDay)
  const mod = conf.intervalModifier

  if (grade === 1) {
    s.lapses = prev.lapses + 1
    s.ease = Math.max(1.3, prev.ease - 0.2)
    s.interval = Math.max(conf.minimumInterval, Math.round(ivl * conf.lapseNewInterval))
    let leech = false
    if (conf.leechThreshold > 0 && s.lapses >= conf.leechThreshold && (s.lapses - conf.leechThreshold) % Math.max(1, Math.floor(conf.leechThreshold / 2)) === 0) {
      leech = true
      s.leech = true
      if (conf.leechAction === 'suspend') s.suspended = true
    }
    if (relearn.length) {
      s.type = 'relearning'
      s.step = 0
      s.due = now + relearn[0] * MIN
    } else {
      s.type = 'review'
      s.due = dayStart(today + s.interval, rolloverHour)
    }
    return { state: s, kind: 'review', leech }
  }

  const hardIvl = Math.max(ivl + 1, ivl * conf.hardInterval * mod)
  const goodIvl = Math.max(hardIvl + 1, (ivl + daysLate / 2) * prev.ease * mod)
  const easyIvl = Math.max(goodIvl + 1, (ivl + daysLate) * prev.ease * conf.easyBonus * mod)
  if (grade === 2) {
    s.ease = Math.max(1.3, prev.ease - 0.15)
    scheduleReview(hardIvl)
  } else if (grade === 3) {
    scheduleReview(goodIvl)
  } else {
    s.ease = prev.ease + 0.15
    scheduleReview(easyIvl)
  }
  return { state: s, kind: 'review', leech: false }
}

/** Texto corto de un intervalo, como en los botones de Anki: "<1m", "10m", "1h", "4d", "2,3mes", "1,1a". */
export function formatInterval(ms: number): string {
  const min = ms / MIN
  if (min < 1) return '<1m'
  if (min < 60) return `${Math.round(min)}m`
  const h = min / 60
  if (h < 24) return `${Math.round(h)}h`
  const d = ms / DAY
  if (d < 30) return `${Math.round(d)}d`
  if (d < 365) return `${(d / 30).toFixed(1).replace('.', ',').replace(',0', '')}mes`
  return `${(d / 365).toFixed(1).replace('.', ',').replace(',0', '')}a`
}

/** Intervalo que mostraría cada botón (sin fuzz). */
export function previewIntervals(state: CardState, conf: DeckConfig, now: number, rolloverHour = 4): Record<Grade, string> {
  const out = {} as Record<Grade, string>
  for (const g of [1, 2, 3, 4] as Grade[]) {
    const r = answerCard(state, g, conf, { now, rolloverHour, rng: () => 0.5 })
    const ms = r.state.type === 'review' ? r.state.interval * DAY : r.state.due - now
    out[g] = formatInterval(ms)
  }
  return out
}

export function isDueNow(s: CardState, now: number, rolloverHour = 4): boolean {
  if (s.type === 'new') return false
  if (s.type === 'learning' || s.type === 'relearning') return s.due <= now
  return dayNumber(s.due, rolloverHour) <= dayNumber(now, rolloverHour)
}

/** Joven (< 21 días) o madura, como en las estadísticas de Anki. */
export function maturityOf(s: CardState | undefined): 'new' | 'learning' | 'young' | 'mature' {
  if (!s || s.type === 'new') return 'new'
  if (s.type === 'learning' || s.type === 'relearning') return 'learning'
  return s.interval >= 21 ? 'mature' : 'young'
}
