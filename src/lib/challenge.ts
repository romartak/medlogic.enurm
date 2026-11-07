import { addDays, dayKey, daysBetween } from './utils'

/**
 * Reto de 7 días: practicar 5 preguntas de una especialidad en al menos 5 de los 7 días siguientes.
 * Se elige a partir de un tema caliente («Apendicitis aguda»): la práctica empieza por ese tema y sigue con el
 * resto de la especialidad, porque un solo tema no tiene preguntas suficientes para varios días.
 */
export const CHALLENGE = { windowDays: 7, daysNeeded: 5, perDay: 5, reward: 100 } as const

export interface Challenge {
  id: string
  specialty: string
  topic: string
  /** Primer día del reto (aaaa-mm-dd). */
  startedDay: string
  /** Preguntas de la especialidad respondidas cada día del reto. */
  days: Record<string, { n: number; ok: number }>
  /** Marca de tiempo en que se completó, si se completó. */
  completedAt?: number
}

export type ChallengeState = 'activo' | 'completado' | 'vencido'

export interface ChallengeProgress {
  state: ChallengeState
  /** Día del reto en que estamos (1 a 7; más de 7 si ya pasó la ventana). */
  windowDay: number
  /** Días en que ya se cumplieron las preguntas diarias. */
  daysDone: number
  /** Preguntas respondidas hoy (tope visual: perDay). */
  todayN: number
  /** Días que aún pueden contar, incluido hoy. */
  daysLeft: number
  /** Días que se pueden fallar todavía sin perder el reto. */
  spare: number
}

export function progressOf(ch: Challenge, today: Date = new Date()): ChallengeProgress {
  const [y, m, d] = ch.startedDay.split('-').map(Number)
  const windowDay = daysBetween(new Date(y, m - 1, d), today) + 1
  const daysDone = Object.values(ch.days).filter((x) => x.n >= CHALLENGE.perDay).length
  const todayN = Math.min(CHALLENGE.perDay, ch.days[dayKey(today)]?.n ?? 0)
  const daysLeft = Math.max(0, CHALLENGE.windowDays - windowDay + 1)
  const state: ChallengeState = ch.completedAt || daysDone >= CHALLENGE.daysNeeded ? 'completado' : windowDay > CHALLENGE.windowDays || daysDone + daysLeft < CHALLENGE.daysNeeded ? 'vencido' : 'activo'
  return { state, windowDay, daysDone, todayN, daysLeft, spare: Math.max(0, daysDone + daysLeft - CHALLENGE.daysNeeded) }
}

/** Los 7 días del reto con su avance, para dibujarlos. */
export function windowDays(ch: Challenge, today: Date = new Date()): { day: string; n: number; done: boolean; isToday: boolean; future: boolean }[] {
  const [y, m, d] = ch.startedDay.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  return Array.from({ length: CHALLENGE.windowDays }, (_, i) => {
    const day = dayKey(addDays(start, i))
    const n = ch.days[day]?.n ?? 0
    return { day, n, done: n >= CHALLENGE.perDay, isToday: day === dayKey(today), future: day > dayKey(today) }
  })
}

export const newChallenge = (specialty: string, topic: string, today: Date = new Date()): Challenge => ({
  id: `${dayKey(today)}-${specialty}`,
  specialty,
  topic,
  startedDay: dayKey(today),
  days: {},
})

/** Suma una respuesta de la especialidad del reto en el día de hoy. */
export function withAnswer(ch: Challenge, ok: boolean, today: Date = new Date()): Challenge {
  const key = dayKey(today)
  const cur = ch.days[key] ?? { n: 0, ok: 0 }
  return { ...ch, days: { ...ch.days, [key]: { n: cur.n + 1, ok: cur.ok + (ok ? 1 : 0) } } }
}
