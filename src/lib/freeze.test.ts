import { describe, expect, it } from 'vitest'
import { EMPTY_FREEZE, planFreeze, sanitizeFreeze, type StreakFreeze } from './freeze'
import { computeStreak } from './stats'
import { addDays, dayKey } from './utils'
import type { DayActivity } from '@/types'

const TODAY = new Date(2026, 10, 7, 12)
const on = (offset: number) => dayKey(addDays(TODAY, offset))
const study = (...offsets: number[]) => Object.fromEntries(offsets.map((o) => [on(o), { answered: 10, correct: 7, cards: 0, minutes: 5 } as DayActivity]))
const run = (from: number, to: number) => study(...Array.from({ length: to - from + 1 }, (_, i) => from + i))

describe('computeStreak con días congelados', () => {
  it('un día congelado mantiene la racha pero no suma', () => {
    const a = { ...study(-1, -3, -4, -5) }
    expect(computeStreak(a, TODAY)).toBe(1)
    expect(computeStreak(a, TODAY, [on(-2)])).toBe(4)
  })
  it('sin congelar, el hueco rompe la racha como siempre', () => {
    expect(computeStreak(study(0, -1, -3), TODAY)).toBe(2)
  })
})

describe('planFreeze', () => {
  it('cubre ayer si se falló con una racha de 3 o más y hay congelador', () => {
    const activity = run(-6, -2) // 5 días y ayer (-1) sin estudiar
    const r = planFreeze(activity, { available: 1, awardedAt: 0, frozen: [] }, TODAY)
    expect(r.used).toBe(on(-1))
    expect(r.state.available).toBe(0)
    expect(r.state.frozen).toEqual([on(-1)])
    expect(computeStreak(activity, TODAY, r.state.frozen)).toBe(5)
  })
  it('no gasta uno si la racha era corta', () => {
    const r = planFreeze(run(-3, -2), { available: 2, awardedAt: 0, frozen: [] }, TODAY)
    expect(r.used).toBeNull()
    expect(r.state.available).toBe(2)
  })
  it('no gasta uno si no hay disponibles ni si ayer sí se estudió', () => {
    expect(planFreeze(run(-6, -2), EMPTY_FREEZE, TODAY).used).toBeNull()
    expect(planFreeze(run(-6, -1), { available: 2, awardedAt: 0, frozen: [] }, TODAY).used).toBeNull()
  })
  it('no gasta uno si ya pasaron dos días sin estudiar (la racha ya estaba rota)', () => {
    expect(planFreeze(run(-8, -3), { available: 2, awardedAt: 0, frozen: [] }, TODAY).used).toBeNull()
  })
  it('no cubre dos veces el mismo día', () => {
    const state: StreakFreeze = { available: 2, awardedAt: 0, frozen: [on(-1)] }
    const r = planFreeze(run(-6, -2), state, TODAY)
    expect(r.used).toBeNull()
    expect(r.state).toBe(state)
  })
  it('gana uno al llegar a 7 días y otro a los 14, con tope de 2', () => {
    let state: StreakFreeze = { ...EMPTY_FREEZE }
    let r = planFreeze(run(-6, 0), state, TODAY)
    expect(r.awarded).toBe(true)
    expect(r.state).toMatchObject({ available: 1, awardedAt: 7 })
    state = r.state
    expect(planFreeze(run(-6, 0), state, TODAY).state).toBe(state) // no lo da dos veces
    r = planFreeze(run(-13, 0), state, TODAY)
    expect(r.state).toMatchObject({ available: 2, awardedAt: 14 })
    r = planFreeze(run(-20, 0), r.state, TODAY)
    expect(r.state).toMatchObject({ available: 2, awardedAt: 21 }) // tope de 2
  })
  it('si la racha se rompe, los múltiplos de 7 vuelven a dar premio', () => {
    const r = planFreeze(study(0, -1), { available: 0, awardedAt: 14, frozen: [] }, TODAY)
    expect(r.state.awardedAt).toBe(0)
    expect(planFreeze(run(-6, 0), r.state, TODAY).awarded).toBe(true)
  })
  it('olvida los días cubiertos de hace más de 60 días', () => {
    const r = planFreeze(study(0), { available: 0, awardedAt: 0, frozen: [on(-90), on(-5)] }, TODAY)
    expect(r.state.frozen).toEqual([on(-5)])
  })
})

describe('sanitizeFreeze', () => {
  it('acepta un estado válido', () => {
    const v = { available: 1, awardedAt: 7, frozen: ['2026-11-01'] }
    expect(sanitizeFreeze(v)).toEqual(v)
  })
  it('descarta basura y limita los valores', () => {
    expect(sanitizeFreeze(null)).toEqual(EMPTY_FREEZE)
    expect(sanitizeFreeze([1, 2])).toEqual(EMPTY_FREEZE)
    expect(sanitizeFreeze({ available: 99, awardedAt: -4, frozen: ['2026-11-01', 'x', 5, '<script>'] })).toEqual({ available: 2, awardedAt: 0, frozen: ['2026-11-01'] })
    expect(sanitizeFreeze({ available: 'mucho', frozen: 'no' })).toEqual(EMPTY_FREEZE)
  })
})
