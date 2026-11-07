import type { DayActivity } from '@/types'
import { addDays, dayKey } from './utils'

/**
 * Ligas semanales. Cada semana (lunes a domingo) se suman puntos por estudiar; los puntos de la semana
 * deciden tu liga y compites con quienes están en la misma liga. El domingo la tabla se reinicia.
 * Los umbrales deben coincidir con la función liga_de() de supabase/migrations/0008 (una prueba lo comprueba).
 */
export interface League {
  id: 'bronce' | 'plata' | 'oro' | 'zafiro' | 'diamante'
  level: 1 | 2 | 3 | 4 | 5
  name: string
  /** Puntos de la semana para entrar en esta liga. */
  min: number
  color: string
}

export const LEAGUES: League[] = [
  { id: 'bronce', level: 1, name: 'Bronce', min: 0, color: '#b45309' },
  { id: 'plata', level: 2, name: 'Plata', min: 100, color: '#64748b' },
  { id: 'oro', level: 3, name: 'Oro', min: 300, color: '#a16207' },
  { id: 'zafiro', level: 4, name: 'Zafiro', min: 600, color: '#2563eb' },
  { id: 'diamante', level: 5, name: 'Diamante', min: 1000, color: '#7c3aed' },
]

/** Puntos de liga: 10 por acierto, 2 por fallo (también cuenta intentarlo) y 2 por tarjeta repasada. */
export const POINTS = { correct: 10, wrong: 2, card: 2 } as const

export function dayPoints(d: DayActivity | undefined): number {
  if (!d) return 0
  const wrong = Math.max(0, d.answered - d.correct)
  return d.correct * POINTS.correct + wrong * POINTS.wrong + d.cards * POINTS.card
}

export function leagueFor(points: number): League {
  let found = LEAGUES[0]
  for (const l of LEAGUES) if (points >= l.min) found = l
  return found
}

/** La liga siguiente y cuántos puntos faltan, o null si ya está en la más alta. */
export function nextLeague(points: number): { league: League; missing: number } | null {
  const cur = leagueFor(points)
  const next = LEAGUES.find((l) => l.level === cur.level + 1)
  return next ? { league: next, missing: next.min - points } : null
}

/** Lunes (a medianoche, hora local) de la semana de una fecha. */
export function weekStart(date: Date = new Date()): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return addDays(d, -((d.getDay() + 6) % 7))
}

/** Semana ISO («2026-W45»): la misma que usa la base de datos para agrupar la liga. */
export function isoWeekId(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/** Puntos de la semana de `date` (lunes a domingo). */
export function weekPoints(activity: Record<string, DayActivity>, date: Date = new Date()): number {
  const start = weekStart(date)
  let total = 0
  for (let i = 0; i < 7; i++) total += dayPoints(activity[dayKey(addDays(start, i))])
  return total
}

/** Días que quedan de la semana contando hoy (de 1 el domingo a 7 el lunes). */
export function daysLeftInWeek(date: Date = new Date()): number {
  return 7 - ((date.getDay() + 6) % 7)
}
