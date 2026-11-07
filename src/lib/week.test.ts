import { describe, expect, it } from 'vitest'
import { formatWeekRange, weekDayPoints, weekShareText, weekSummary } from './week'
import type { DayActivity } from '@/types'

const NOW = new Date(2026, 10, 7, 12) // sábado de la semana 2-8 de noviembre
const day = (answered: number, correct: number, bySpec: Record<string, number> = {}): DayActivity => ({ answered, correct, cards: 3, minutes: 20, bySpec })

describe('weekSummary', () => {
  const activity = {
    '2026-10-27': day(40, 20), // semana anterior
    '2026-11-02': day(30, 24, { cardiologia: 20, pediatria: 10 }),
    '2026-11-04': day(50, 40, { pediatria: 50 }),
    '2026-11-08': day(10, 10, { cardiologia: 10 }), // domingo: todavía es de esta semana
    '2026-11-09': day(99, 99), // la semana siguiente no cuenta
  }
  const s = weekSummary(activity, 4, NOW)
  it('suma lunes a domingo y calcula el porcentaje', () => {
    expect(s.id).toBe('2026-W45')
    expect(s.answered).toBe(90)
    expect(s.correct).toBe(74)
    expect(s.accuracy).toBe(82)
    expect(s.activeDays).toBe(3)
    expect(s.cards).toBe(9)
    expect(s.minutes).toBe(60)
  })
  it('encuentra el mejor día y la especialidad principal', () => {
    expect(s.best).toEqual({ day: '2026-11-04', answered: 50 })
    expect(s.topSpecialty).toEqual({ id: 'pediatria', answered: 60 })
  })
  it('compara con la semana anterior y calcula la liga', () => {
    expect(s.prev.answered).toBe(40)
    expect(s.points).toBe(74 * 10 + 16 * 2 + 9 * 2)
    expect(s.league.id).toBe('zafiro')
  })
  it('una semana sin estudio no inventa datos', () => {
    const e = weekSummary({}, 0, NOW)
    expect(e.accuracy).toBeNull()
    expect(e.best).toBeNull()
    expect(e.topSpecialty).toBeNull()
    expect(e.league.id).toBe('bronce')
  })
  it('el texto para compartir resume la semana y enlaza al sitio', () => {
    const t = weekShareText(s, 'medlogicenurm.vercel.app')
    expect(t).toContain('90 preguntas')
    expect(t).toContain('82 % de aciertos')
    expect(t).toContain('racha de 4 días')
    expect(t).toContain('liga Zafiro')
    expect(t).toContain('https://medlogicenurm.vercel.app')
  })
})

describe('formatWeekRange', () => {
  it('une los días del mismo mes y separa los de meses distintos', () => {
    expect(formatWeekRange(new Date(2026, 10, 2), new Date(2026, 10, 8))).toBe('2–8 nov')
    expect(formatWeekRange(new Date(2026, 9, 26), new Date(2026, 10, 1))).toBe('26 oct – 1 nov')
  })
})

describe('weekDayPoints', () => {
  it('da 7 días de lunes a domingo con sus puntos', () => {
    const days = weekDayPoints({ '2026-11-03': { answered: 10, correct: 5, cards: 0, minutes: 0 } }, new Date(2026, 10, 2))
    expect(days).toHaveLength(7)
    expect(days[0].day).toBe('2026-11-02')
    expect(days[1].points).toBe(5 * 10 + 5 * 2)
    expect(days[6].day).toBe('2026-11-08')
  })
})
