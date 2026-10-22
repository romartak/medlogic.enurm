import { describe, expect, it } from 'vitest'
import { GUIDES } from '@/data/guides'
import { guideNotes, guideQuestions } from './guidePractice'

describe('práctica de guías', () => {
  it('cada guía genera preguntas con una sola respuesta correcta', () => {
    for (const g of GUIDES) {
      const qs = guideQuestions(g)
      expect(qs.length, g.id).toBeGreaterThanOrEqual(3)
      for (const q of qs) {
        if (q.kind !== 'choice') continue
        expect(q.options.length).toBeGreaterThanOrEqual(2)
        expect(new Set(q.options).size).toBe(q.options.length)
        expect(q.answer).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('crea flashcards con ids estables (no se duplican al repetir)', () => {
    const g = GUIDES[0]
    const a = guideNotes(g, 'd', g.specialty).map((n) => n.id)
    const b = guideNotes(g, 'd', g.specialty).map((n) => n.id)
    expect(a).toEqual(b)
    expect(new Set(a).size).toBe(a.length)
  })
})
