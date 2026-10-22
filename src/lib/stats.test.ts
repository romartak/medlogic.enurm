import { describe, expect, it } from 'vitest'
import { bestStreak, computeStreak, predictedScore, specialtyStats } from './stats'
import { proportionalPick } from './selection'
import { addDays, dayKey } from './utils'
import type { Question } from '@/types'

const day = { answered: 1, correct: 1, cards: 0, minutes: 0 }

describe('rachas', () => {
  const today = new Date(2026, 9, 22)
  it('cuenta días seguidos hasta hoy', () => {
    const a = { [dayKey(today)]: day, [dayKey(addDays(today, -1))]: day, [dayKey(addDays(today, -3))]: day }
    expect(computeStreak(a, today)).toBe(2)
  })
  it('mantiene la racha si hoy aún no se ha estudiado', () => {
    const a = { [dayKey(addDays(today, -1))]: day, [dayKey(addDays(today, -2))]: day }
    expect(computeStreak(a, today)).toBe(2)
  })
  it('calcula la mejor racha histórica', () => {
    const a = Object.fromEntries([0, 1, 2, 5, 6].map((d) => [dayKey(addDays(today, -d)), day]))
    expect(bestStreak(a)).toBe(3)
  })
})

const qs: Question[] = Array.from({ length: 100 }, (_, i) => ({ id: String(i), specialty: i < 70 ? 'pediatria' : 'cirugia', stem: 's', options: ['a', 'b'], answer: 0 }))

describe('selección y estadísticas', () => {
  it('reparte un simulacro de forma proporcional por especialidad', () => {
    const picked = proportionalPick(qs, 10)
    expect(picked).toHaveLength(10)
    expect(new Set(picked.map((q) => q.id)).size).toBe(10)
    expect(picked.filter((q) => q.specialty === 'pediatria')).toHaveLength(7)
  })

  it('estima el puntaje ponderando por especialidad', () => {
    const attempts = Object.fromEntries(qs.slice(0, 20).map((q) => [q.id, { seen: 1, correct: 1, lastCorrect: true, lastAt: 0, lastChoice: 0 }]))
    const st = specialtyStats(attempts, qs)
    expect(st.find((s) => s.specialty === 'pediatria')!.accuracy).toBe(1)
    const score = predictedScore(st)!
    // Pediatría (70% del banco) 20/20 suavizado ≈ 85%; cirugía (30%) sin datos = 25% → ≈ 67.
    expect(score).toBe(67)
  })
})
