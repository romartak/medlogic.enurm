import { describe, expect, it } from 'vitest'
import { SAMPLE_QUESTIONS } from '@/data/sampleQuestions'
import { BUILTIN_CARDS, DECKS } from '@/data/flashcards'
import { GUIDES } from '@/data/guides'
import { SPECIALTIES } from '@/data/specialties'
import { CLUE_CASES, MATCH_SETS } from '@/data/games'

describe('integridad del contenido incluido', () => {
  const specIds = new Set(SPECIALTIES.map((s) => s.id))

  it('las preguntas de muestra son válidas', () => {
    for (const q of SAMPLE_QUESTIONS) {
      expect(specIds.has(q.specialty), q.id).toBe(true)
      expect(q.answer).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(q.options.length)
    }
    expect(new Set(SAMPLE_QUESTIONS.map((q) => q.id)).size).toBe(SAMPLE_QUESTIONS.length)
  })

  it('las flashcards tienen ids únicos y mazos existentes', () => {
    expect(new Set(BUILTIN_CARDS.map((c) => c.id)).size).toBe(BUILTIN_CARDS.length)
    const decks = new Set(DECKS.map((d) => d.id))
    for (const c of BUILTIN_CARDS) expect(decks.has(c.deck)).toBe(true)
  })

  it('las guías usan especialidades conocidas', () => {
    for (const g of GUIDES) expect(specIds.has(g.specialty), g.id).toBe(true)
  })

  it('los juegos tienen datos coherentes', () => {
    for (const c of CLUE_CASES) {
      expect(c.clues).toHaveLength(5)
      expect(c.options).toContain(c.diagnosis)
    }
    for (const s of MATCH_SETS) expect(s.pairs).toHaveLength(8)
  })
})

describe('análisis de ejemplo', () => {
  it('cada análisis corresponde a su pregunta (mismo número de opciones y explicación de la correcta)', async () => {
    const { SAMPLE_ANALYSIS } = await import('@/data/sampleAnalysis')
    for (const [id, a] of Object.entries(SAMPLE_ANALYSIS)) {
      const q = SAMPLE_QUESTIONS.find((x) => x.id === id)!
      expect(q, id).toBeDefined()
      expect(a.optionExplanations?.length, id).toBe(q.options.length)
      expect(a.optionExplanations?.[q.answer].startsWith('Correcta'), `${id}: ${q.stem.slice(0, 40)}`).toBe(true)
    }
  })
})

describe('banco publicado: preguntas de alto rendimiento', async () => {
  const { readFileSync } = await import('node:fs')
  const bank = JSON.parse(readFileSync('public/data/questions.json', 'utf8')) as { id: string; appearances?: number; years?: number[] }[]

  it('las repetidas del documento quedan marcadas con su número de apariciones', () => {
    const marked = bank.filter((q) => q.appearances !== undefined)
    expect(marked.length).toBeGreaterThanOrEqual(66)
    expect(marked.every((q) => Number.isInteger(q.appearances) && q.appearances! >= 2 && q.appearances! <= 10)).toBe(true)
  })
  it('si hay años, son coherentes con las apariciones', () => {
    for (const q of bank.filter((x) => x.years)) {
      expect(q.years!.every((y) => y >= 2002 && y <= 2030)).toBe(true)
      expect(q.appearances).toBeGreaterThanOrEqual(q.years!.length)
    }
  })
})
