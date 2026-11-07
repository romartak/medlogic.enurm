import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { dayPoints, daysLeftInWeek, isoWeekId, leagueFor, LEAGUES, nextLeague, weekPoints, weekStart } from './league'
import { dayKey } from './utils'
import type { DayActivity } from '@/types'

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day, 12)
const act = (answered: number, correct: number, cards = 0): DayActivity => ({ answered, correct, cards, minutes: 0 })

describe('puntos y ligas', () => {
  it('10 por acierto, 2 por fallo y 2 por tarjeta', () => {
    expect(dayPoints(act(10, 7, 5))).toBe(7 * 10 + 3 * 2 + 5 * 2)
    expect(dayPoints(undefined)).toBe(0)
    expect(dayPoints(act(0, 0))).toBe(0)
  })
  it('la liga cambia justo en cada umbral', () => {
    expect(leagueFor(0).id).toBe('bronce')
    expect(leagueFor(99).id).toBe('bronce')
    expect(leagueFor(100).id).toBe('plata')
    expect(leagueFor(299).id).toBe('plata')
    expect(leagueFor(300).id).toBe('oro')
    expect(leagueFor(600).id).toBe('zafiro')
    expect(leagueFor(1000).id).toBe('diamante')
    expect(leagueFor(99999).id).toBe('diamante')
  })
  it('dice cuánto falta para la siguiente liga', () => {
    expect(nextLeague(40)).toMatchObject({ missing: 60, league: { id: 'plata' } })
    expect(nextLeague(1200)).toBeNull()
  })
  it('los umbrales coinciden con liga_de() de la base de datos', () => {
    const sql = readFileSync('supabase/migrations/0008_comunidad_y_calidad.sql', 'utf8')
    const pairs = [...sql.matchAll(/when p_puntos >= (\d+) then (\d)/g)].map((m) => ({ min: Number(m[1]), level: Number(m[2]) }))
    expect(pairs.length).toBe(LEAGUES.length - 1)
    for (const p of pairs) expect(LEAGUES.find((l) => l.level === p.level)?.min).toBe(p.min)
  })
})

describe('semanas', () => {
  it('semana ISO igual a la de otra implementación', () => {
    expect(isoWeekId(d(2026, 11, 7))).toBe('2026-W45')
    expect(isoWeekId(d(2026, 11, 2))).toBe('2026-W45') // lunes
    expect(isoWeekId(d(2026, 11, 8))).toBe('2026-W45') // domingo
    expect(isoWeekId(d(2026, 11, 9))).toBe('2026-W46')
    expect(isoWeekId(d(2026, 1, 1))).toBe('2026-W01')
    expect(isoWeekId(d(2024, 12, 30))).toBe('2025-W01')
    expect(isoWeekId(d(2021, 1, 3))).toBe('2020-W53')
    expect(isoWeekId(d(2025, 12, 29))).toBe('2026-W01')
    expect(isoWeekId(d(2026, 12, 31))).toBe('2026-W53')
  })
  it('la semana empieza el lunes', () => {
    expect(dayKey(weekStart(d(2026, 11, 7)))).toBe('2026-11-02')
    expect(dayKey(weekStart(d(2026, 11, 2)))).toBe('2026-11-02')
    expect(dayKey(weekStart(d(2026, 11, 8)))).toBe('2026-11-02')
  })
  it('suma solo los días de esa semana', () => {
    const activity = { '2026-11-01': act(50, 50), '2026-11-02': act(10, 10), '2026-11-08': act(5, 0), '2026-11-09': act(99, 99) }
    expect(weekPoints(activity, d(2026, 11, 5))).toBe(100 + 10)
  })
  it('días que quedan de la semana', () => {
    expect(daysLeftInWeek(d(2026, 11, 2))).toBe(7) // lunes
    expect(daysLeftInWeek(d(2026, 11, 8))).toBe(1) // domingo
  })
})
