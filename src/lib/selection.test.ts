import { describe, expect, it } from 'vitest'
import type { Question } from '@/types'
import { filterQuestions, isHighYield } from './selection'

const base = { specialty: 'cardiologia', options: ['a', 'b'], answer: 0 }
const qs: Question[] = [
  { ...base, id: 'a', stem: 'Una vez' },
  { ...base, id: 'b', stem: 'Dos veces', appearances: 2 },
  { ...base, id: 'c', stem: 'Tres veces', appearances: 3 },
  { ...base, id: 'd', stem: 'Una sola, declarada', appearances: 1 },
]

describe('alto rendimiento (high yield)', () => {
  it('son las preguntas que salieron 2 o más veces', () => {
    expect(qs.map(isHighYield)).toEqual([false, true, true, false])
  })
  it('el filtro deja solo esas', () => {
    const r = filterQuestions(qs, { specialties: [], years: [], status: 'highyield' }, {}, [])
    expect(r.map((q) => q.id)).toEqual(['b', 'c'])
  })
})
