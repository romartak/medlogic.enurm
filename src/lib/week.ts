import type { DayActivity } from '@/types'
import { dayPoints, isoWeekId, leagueFor, weekStart, type League } from './league'
import { addDays, dayKey, pct } from './utils'

export interface WeekSummary {
  id: string
  start: Date
  end: Date
  answered: number
  correct: number
  /** 0–100, o null si no respondió nada. */
  accuracy: number | null
  minutes: number
  cards: number
  /** Días de la semana con algo de estudio. */
  activeDays: number
  /** Día con más preguntas respondidas. */
  best: { day: string; answered: number } | null
  /** Especialidad con más preguntas esta semana. */
  topSpecialty: { id: string; answered: number } | null
  points: number
  league: League
  /** La semana anterior, para comparar. */
  prev: { answered: number; points: number }
  streak: number
}

function sumWeek(activity: Record<string, DayActivity>, start: Date) {
  let answered = 0
  let correct = 0
  let minutes = 0
  let cards = 0
  let activeDays = 0
  let points = 0
  let best: WeekSummary['best'] = null
  const spec = new Map<string, number>()
  for (let i = 0; i < 7; i++) {
    const key = dayKey(addDays(start, i))
    const d = activity[key]
    if (!d) continue
    answered += d.answered
    correct += d.correct
    minutes += d.minutes
    cards += d.cards
    points += dayPoints(d)
    if (d.answered + d.cards + d.minutes > 0) activeDays++
    if (d.answered > 0 && (!best || d.answered > best.answered)) best = { day: key, answered: d.answered }
    for (const [id, n] of Object.entries(d.bySpec ?? {})) spec.set(id, (spec.get(id) ?? 0) + n)
  }
  const top = [...spec.entries()].sort((a, b) => b[1] - a[1])[0]
  return { answered, correct, minutes, cards, activeDays, points, best, topSpecialty: top ? { id: top[0], answered: top[1] } : null }
}

/** Resumen de la semana en curso (lunes a domingo), con la anterior para comparar. */
export function weekSummary(activity: Record<string, DayActivity>, streak: number, now: Date = new Date()): WeekSummary {
  const start = weekStart(now)
  const cur = sumWeek(activity, start)
  const prev = sumWeek(activity, addDays(start, -7))
  return {
    id: isoWeekId(now),
    start,
    end: addDays(start, 6),
    ...cur,
    accuracy: cur.answered ? pct(cur.correct, cur.answered) : null,
    league: leagueFor(cur.points),
    prev: { answered: prev.answered, points: prev.points },
    streak,
  }
}

/** Texto para acompañar la tarjeta semanal al compartirla (WhatsApp, Instagram…). */
export function weekShareText(s: WeekSummary, site: string): string {
  const parts = [`Mi semana en MedLogic ENURM: ${s.answered} ${s.answered === 1 ? 'pregunta' : 'preguntas'}`]
  if (s.accuracy !== null) parts[0] += ` (${s.accuracy} % de aciertos)`
  parts.push(`${s.activeDays} ${s.activeDays === 1 ? 'día' : 'días'} de estudio`)
  if (s.streak >= 2) parts.push(`racha de ${s.streak} días`)
  parts.push(`liga ${s.league.name}`)
  return `${parts.join(', ')}. Prepárate gratis para el ENURM: https://${site}`
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** «2–8 nov» o, si cruza de mes, «28 oct – 3 nov». */
export function formatWeekRange(start: Date, end: Date): string {
  return start.getMonth() === end.getMonth() ? `${start.getDate()}–${end.getDate()} ${MONTHS[end.getMonth()]}` : `${start.getDate()} ${MONTHS[start.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]}`
}

/** Puntos de cada día de la semana (lunes a domingo), para dibujar las barritas. */
export function weekDayPoints(activity: Record<string, DayActivity>, start: Date): { day: string; points: number; isFuture: boolean }[] {
  const today = dayKey()
  return Array.from({ length: 7 }, (_, i) => {
    const day = dayKey(addDays(start, i))
    return { day, points: dayPoints(activity[day]), isFuture: day > today }
  })
}
