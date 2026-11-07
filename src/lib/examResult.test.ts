import { describe, expect, it } from 'vitest'
import { gradeExam } from './examResult'
import type { Question } from '@/types'

const q = (id: string, specialty: string, answer: number): Question => ({ id, specialty, stem: 's', options: ['a', 'b', 'c'], answer })

describe('gradeExam', () => {
  const qs = [q('1', 'cardiologia', 0), q('2', 'cardiologia', 1), q('3', 'pediatria', 2)]
  it('cuenta aciertos totales y por especialidad; las en blanco no suman', () => {
    const r = gradeExam({ title: 'T', questions: qs, answers: [0, 2, null], startedAt: 0, totalSec: 600, now: 100_000 })
    expect(r.correct).toBe(1)
    expect(r.total).toBe(3)
    expect(r.bySpecialty).toEqual({ cardiologia: { total: 2, correct: 1 }, pediatria: { total: 1, correct: 0 } })
    expect(r.questionIds).toEqual(['1', '2', '3'])
    expect(r.durationSec).toBe(100)
  })
  it('la duración no pasa del tiempo límite', () => {
    expect(gradeExam({ title: 'T', questions: qs, answers: [null, null, null], startedAt: 0, totalSec: 60, now: 9_999_000 }).durationSec).toBe(60)
  })
})
