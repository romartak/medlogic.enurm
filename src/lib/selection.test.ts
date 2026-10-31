import { describe, expect, it } from 'vitest'
import type { Question } from '@/types'
import { filterQuestions, inYear, isHighYield, yearsOf } from './selection'

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

describe('años en que salió una pregunta', () => {
  const dos: Question = { ...base, id: 'x', stem: 'Salió dos veces', year: 2018, years: [2005, 2018], appearances: 2 }
  const uno: Question = { ...base, id: 'y', stem: 'Solo un año', year: 2010 }
  const sin: Question = { ...base, id: 'z', stem: 'Sin año' }

  it('usa todos los años conocidos, o el único año si solo hay uno', () => {
    expect(yearsOf(dos)).toEqual([2005, 2018])
    expect(yearsOf(uno)).toEqual([2010])
    expect(yearsOf(sin)).toEqual([])
    expect(inYear(dos, 2005)).toBe(true)
    expect(inYear(dos, 2010)).toBe(false)
  })
  it('el filtro por año encuentra la pregunta en cada año en que salió', () => {
    const all = [dos, uno, sin]
    const ids = (years: number[]) => filterQuestions(all, { specialties: [], years, status: 'all' }, {}, []).map((q) => q.id)
    expect(ids([2005])).toEqual(['x'])
    expect(ids([2018])).toEqual(['x'])
    expect(ids([2010, 2018])).toEqual(['x', 'y'])
    expect(ids([])).toEqual(['x', 'y', 'z'])
  })
})
