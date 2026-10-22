import type { DayActivity, Question, QuestionAttempt } from '@/types'
import { addDays, dayKey } from './utils'

function isActive(d: DayActivity | undefined): boolean {
  return !!d && d.answered + d.cards + d.minutes > 0
}

/** Días consecutivos de estudio terminando hoy (o ayer, si hoy aún no se ha estudiado). */
export function computeStreak(activity: Record<string, DayActivity>, today = new Date()): number {
  let cursor = today
  if (!isActive(activity[dayKey(cursor)])) cursor = addDays(cursor, -1)
  let n = 0
  while (isActive(activity[dayKey(cursor)])) {
    n++
    cursor = addDays(cursor, -1)
  }
  return n
}

export function bestStreak(activity: Record<string, DayActivity>): number {
  const days = Object.keys(activity).filter((k) => isActive(activity[k])).sort()
  let best = 0
  let run = 0
  let prev: Date | null = null
  for (const k of days) {
    const [y, m, d] = k.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    run = prev && dayKey(addDays(prev, 1)) === k ? run + 1 : 1
    best = Math.max(best, run)
    prev = date
  }
  return best
}

export interface SpecialtyStat {
  specialty: string
  answered: number
  correct: number
  /** Preguntas distintas vistas. */
  seen: number
  total: number
  accuracy: number
}

/** Rendimiento por especialidad basado en el último intento de cada pregunta. */
export function specialtyStats(attempts: Record<string, QuestionAttempt>, questions: Question[]): SpecialtyStat[] {
  const map = new Map<string, SpecialtyStat>()
  for (const q of questions) {
    let s = map.get(q.specialty)
    if (!s) {
      s = { specialty: q.specialty, answered: 0, correct: 0, seen: 0, total: 0, accuracy: 0 }
      map.set(q.specialty, s)
    }
    s.total++
    const a = attempts[q.id]
    if (a) {
      s.seen++
      s.answered += a.seen
      s.correct += a.correct
    }
  }
  for (const s of map.values()) s.accuracy = s.answered ? s.correct / s.answered : 0
  return [...map.values()].sort((a, b) => b.total - a.total)
}

export interface Overview {
  answered: number
  correct: number
  accuracy: number
  uniqueSeen: number
  coverage: number
  todayAnswered: number
  todayCorrect: number
  minutes: number
}

export function overview(attempts: Record<string, QuestionAttempt>, activity: Record<string, DayActivity>, totalQuestions: number): Overview {
  let answered = 0
  let correct = 0
  let minutes = 0
  for (const d of Object.values(activity)) {
    answered += d.answered
    correct += d.correct
    minutes += d.minutes
  }
  const uniqueSeen = Object.keys(attempts).length
  const t = activity[dayKey()]
  return {
    answered,
    correct,
    accuracy: answered ? correct / answered : 0,
    uniqueSeen,
    coverage: totalQuestions ? Math.min(1, uniqueSeen / totalQuestions) : 0,
    todayAnswered: t?.answered ?? 0,
    todayCorrect: t?.correct ?? 0,
    minutes,
  }
}

/** Serie diaria de los últimos `days` días para gráficos. */
export function dailySeries(activity: Record<string, DayActivity>, days = 30) {
  const out: { key: string; label: string; answered: number; correct: number; accuracy: number | null; cards: number }[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i)
    const k = dayKey(d)
    const a = activity[k]
    out.push({
      key: k,
      label: d.toLocaleDateString('es-DO', { day: 'numeric', month: 'short' }),
      answered: a?.answered ?? 0,
      correct: a?.correct ?? 0,
      accuracy: a && a.answered ? Math.round((a.correct / a.answered) * 100) : null,
      cards: a?.cards ?? 0,
    })
  }
  return out
}

/**
 * Estimación del puntaje: precisión reciente ponderada por la distribución del banco,
 * penalizando especialidades no vistas (se asume 25%, el azar con 4 opciones).
 */
export function predictedScore(stats: SpecialtyStat[]): number | null {
  const totalQ = stats.reduce((n, s) => n + s.total, 0)
  const answered = stats.reduce((n, s) => n + s.answered, 0)
  if (!totalQ || answered < 10) return null
  let score = 0
  for (const s of stats) {
    const weight = s.total / totalQ
    // Con pocas respuestas la precisión se acerca a la media global (suavizado bayesiano).
    const k = 5
    const acc = s.answered ? (s.correct + 0.25 * k) / (s.answered + k) : 0.25
    score += weight * acc
  }
  return Math.round(score * 100)
}

export function weakest(stats: SpecialtyStat[], n = 3): SpecialtyStat[] {
  return stats
    .filter((s) => s.answered >= 3)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, n)
}
