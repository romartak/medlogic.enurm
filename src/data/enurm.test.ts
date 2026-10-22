import { describe, expect, it } from 'vitest'
import { enurmDate, upcomingEnurm } from './enurm'

describe('calendario del ENURM', () => {
  it('cae el primer domingo de marzo', () => {
    for (const y of [2018, 2019, 2024, 2025, 2026, 2027, 2028, 2030]) {
      const d = enurmDate(y).date
      expect(d.getDay()).toBe(0)
      expect(d.getMonth()).toBe(2)
      expect(d.getDate()).toBeLessThanOrEqual(7)
    }
    expect(enurmDate(2027).iso).toBe('2027-03-07')
    expect(enurmDate(2027).confirmed).toBe(false)
    expect(enurmDate(2026).confirmed).toBe(true)
  })

  it('ofrece la próxima convocatoria que no ha pasado', () => {
    expect(upcomingEnurm(2, new Date(2026, 9, 22)).map((e) => e.year)).toEqual([2027, 2028])
    expect(upcomingEnurm(1, new Date(2027, 1, 10))[0].year).toBe(2027)
    expect(upcomingEnurm(1, new Date(2027, 2, 7, 15))[0].year).toBe(2027)
    expect(upcomingEnurm(1, new Date(2027, 2, 8))[0].year).toBe(2028)
  })
})
