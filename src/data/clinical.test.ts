import { describe, expect, it } from 'vitest'
import { ATLS_QUIZ, ATLS_SECTIONS, XABCDE } from './atls'
import { FRACTURE_QUIZ, FRACTURE_SECTIONS } from './fractures'
import { SPIRO_EXAMPLES, SPIRO_QUIZ, SPIRO_SECTIONS } from './spirometry'
import { HEMO_CASES, HEMO_SECTIONS } from './hemogram'
import { allSigns, SYSTEMS } from './semiology'
import { QUADRANTS, REGIONS, TOPO_ITEMS } from './quadrants'
import { interpretSpirometry } from '@/lib/spirometry'
import { absolute, readHemogram } from '@/lib/hemogram'
import type { GuideSection, QuizItem } from '@/types'

function checkQuiz(name: string, items: QuizItem[]) {
  expect(new Set(items.map((i) => i.q)).size, `${name}: preguntas repetidas`).toBe(items.length)
  for (const it of items) {
    expect(it.answer, it.q).toBeGreaterThanOrEqual(0)
    expect(it.answer, it.q).toBeLessThan(it.options.length)
    expect(new Set(it.options).size, `${it.q}: opciones repetidas`).toBe(it.options.length)
    expect(it.why.length, it.q).toBeGreaterThan(20)
  }
}

function checkSections(name: string, sections: GuideSection[]) {
  expect(new Set(sections.map((s) => s.heading)).size, `${name}: secciones repetidas`).toBe(sections.length)
  for (const s of sections) {
    expect(s.body || s.bullets?.length || s.table, s.heading).toBeTruthy()
    for (const r of s.table?.rows ?? []) expect(r.length, `${s.heading}: ${r[0]}`).toBe(s.table!.head.length)
  }
}

describe('contenido de habilidades clínicas', () => {
  it('preguntas de práctica bien formadas', () => {
    checkQuiz('ATLS', ATLS_QUIZ)
    checkQuiz('fracturas', FRACTURE_QUIZ)
    checkQuiz('espirometría', SPIRO_QUIZ)
  })

  it('secciones con contenido y tablas completas', () => {
    checkSections('ATLS', ATLS_SECTIONS)
    checkSections('fracturas', FRACTURE_SECTIONS)
    checkSections('espirometría', SPIRO_SECTIONS)
    checkSections('hemograma', HEMO_SECTIONS)
    for (const s of SYSTEMS) checkSections(s.name, s.sections ?? [])
  })

  it('xABCDE en orden', () => {
    expect(XABCDE.map((s) => s.letter).join('')).toBe('XABCDE')
  })

  it('los ejemplos de espirometría dan el patrón que dice su nombre', () => {
    const pattern = (id: string) => interpretSpirometry(SPIRO_EXAMPLES.find((e) => e.id === id)!.input).pattern
    expect(pattern('normal')).toBe('normal')
    expect(pattern('asma')).toBe('obstructivo')
    expect(pattern('epoc')).toBe('obstructivo')
    expect(pattern('fibrosis')).toBe('restrictivo')
    expect(pattern('mixto')).toBe('mixto')
    // El asma se revierte; la EPOC no.
    const asma = interpretSpirometry(SPIRO_EXAMPLES.find((e) => e.id === 'asma')!.input)
    expect(asma.bd?.positive).toBe(true)
    expect(asma.postRatio).toBeGreaterThanOrEqual(0.7)
    const epoc = interpretSpirometry(SPIRO_EXAMPLES.find((e) => e.id === 'epoc')!.input)
    expect(epoc.bd?.positive).toBe(false)
    expect(epoc.postRatio).toBeLessThan(0.7)
  })

  it('los casos de hemograma cuadran con su propio informe', () => {
    for (const c of HEMO_CASES) {
      expect(c.answer, c.id).toBeLessThan(c.options.length)
      expect(readHemogram(c.input).summary.length, c.id).toBeGreaterThan(0)
    }
    const febril = HEMO_CASES.find((c) => c.id === 'neutropenia-febril')!.input
    expect(absolute(febril.wbc!, febril.neutPct!)).toBeLessThan(500)
    expect(readHemogram(HEMO_CASES.find((c) => c.id === 'talasemia')!.input).summary[0]).toMatch(/talasémico/)
    expect(readHemogram(HEMO_CASES.find((c) => c.id === 'pancitopenia')!.input).summary[0]).toMatch(/Pancitopenia/)
  })

  it('signos sin nombres repetidos', () => {
    const names = allSigns().map((s) => s.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('el juego de cuadrantes solo usa zonas que existen', () => {
    const regions = new Set(REGIONS.map((r) => r.id))
    const quadrants = new Set(QUADRANTS.map((q) => q.id))
    for (const t of TOPO_ITEMS) {
      expect(t.regions.length, t.prompt).toBeGreaterThan(0)
      for (const r of t.regions) expect(regions.has(r), t.prompt).toBe(true)
      for (const q of t.quadrants ?? []) expect(quadrants.has(q), t.prompt).toBe(true)
    }
    // Hacen falta al menos 12 preguntas por modo para una ronda completa.
    expect(TOPO_ITEMS.filter((t) => t.quadrants).length).toBeGreaterThanOrEqual(12)
  })
})
