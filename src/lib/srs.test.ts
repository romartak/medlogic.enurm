import { describe, expect, it } from 'vitest'
import { isDue, maturity, review } from './srs'

const DAY = 86_400_000

describe('repetición espaciada (SM-2)', () => {
  it('programa una tarjeta nueva con "Bien" para mañana y luego a 4 días', () => {
    const s1 = review(undefined, 2, 0)
    expect(s1.interval).toBe(1)
    expect(s1.due).toBe(DAY)
    const s2 = review(s1, 2, DAY)
    expect(s2.interval).toBe(4)
    const s3 = review(s2, 2, 5 * DAY)
    expect(s3.interval).toBe(10)
  })

  it('"Otra vez" reinicia la tarjeta, baja la facilidad y la repite en 10 minutos', () => {
    const s = review(review(review(undefined, 2, 0), 2, DAY), 0, 2 * DAY)
    expect(s.reps).toBe(0)
    expect(s.lapses).toBe(1)
    expect(s.ease).toBeCloseTo(2.3)
    expect(s.due).toBe(2 * DAY + 600_000)
  })

  it('nunca baja la facilidad de 1,3', () => {
    let s = review(undefined, 0, 0)
    for (let i = 0; i < 20; i++) s = review(s, 0, 0)
    expect(s.ease).toBe(1.3)
  })

  it('clasifica la madurez y detecta vencidas', () => {
    expect(maturity(undefined)).toBe(0)
    const young = review(undefined, 3, DAY)
    expect(maturity(young)).toBe(2)
    expect(maturity({ ...young, interval: 30 })).toBe(3)
    expect(isDue(young, young.due - 1)).toBe(false)
    expect(isDue(young, young.due)).toBe(true)
  })
})
