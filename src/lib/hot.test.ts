import { describe, expect, it } from 'vitest'
import { examYears, hotTopics, specialtiesByAppearances } from './hot'
import type { Question } from '@/types'

const q = (id: string, specialty: string, topic: string | undefined, years: number[] | undefined): Question => ({ id, specialty, topic, stem: 's', options: ['a', 'b'], answer: 0, years })

const bank: Question[] = [
  q('1', 'cardiologia', 'Infarto', [2015, 2016, 2024]),
  q('2', 'cardiologia', 'Infarto', [2024]),
  q('3', 'cardiologia', 'Arritmias', [2003]),
  q('4', 'pediatria', 'Vacunas', [2020, 2021]),
  q('5', 'pediatria', undefined, [2020]),
  q('6', 'pediatria', 'Sin años', undefined),
]

describe('examYears', () => {
  it('lista los años sin repetir y ordenados', () => {
    expect(examYears(bank)).toEqual([2003, 2015, 2016, 2020, 2021, 2024])
  })
})

describe('hotTopics', () => {
  it('cuenta apariciones por año y ordena por constancia reciente', () => {
    const t = hotTopics(bank)
    expect(t.map((x) => x.topic)).toEqual(['Infarto', 'Vacunas', 'Arritmias'])
    const inf = t[0]
    expect(inf.byYear[2024]).toBe(2)
    expect(inf.total).toBe(4)
    expect(inf.questions).toBe(2)
    expect(inf.yearsHit).toBe(3)
    expect(inf.recentYears).toBe(3)
  })
  it('un tema viejo no cuenta como reciente', () => {
    expect(hotTopics(bank).find((x) => x.topic === 'Arritmias')!.recentYears).toBe(0)
  })
  it('ignora preguntas sin tema o sin años y filtra por especialidad', () => {
    expect(hotTopics(bank).some((x) => x.topic === 'Sin años')).toBe(false)
    expect(hotTopics(bank, 'pediatria').map((x) => x.topic)).toEqual(['Vacunas'])
  })
})

describe('specialtiesByAppearances', () => {
  it('ordena por apariciones', () => {
    expect(specialtiesByAppearances(bank)).toEqual([
      { id: 'cardiologia', total: 5 },
      { id: 'pediatria', total: 3 },
    ])
  })
})
