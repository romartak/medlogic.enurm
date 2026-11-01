import { describe, expect, it } from 'vitest'
import { ATLS_QUIZ, ATLS_SECTIONS, XABCDE } from './atls'
import { FRACTURE_QUIZ, FRACTURE_SECTIONS } from './fractures'
import { SPIRO_EXAMPLES, SPIRO_QUIZ, SPIRO_SECTIONS } from './spirometry'
import { HEMO_CASES, HEMO_SECTIONS } from './hemogram'
import { allSigns, SYSTEMS } from './semiology'
import { QUADRANTS, REGIONS, TOPO_ITEMS } from './quadrants'
import { PHYSIO_QUIZ, SCHEMES, SHOCKS } from './physiopathology'
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
    checkQuiz('fisiopatología', PHYSIO_QUIZ)
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

  it('esquemas de fisiopatología coherentes', () => {
    expect(new Set(SCHEMES.map((s) => s.id)).size).toBe(SCHEMES.length)
    for (const s of SCHEMES) {
      const ids = new Set(s.nodes.map((n) => n.id))
      expect(ids.size, `${s.id}: nodos repetidos`).toBe(s.nodes.length)
      // Dos nodos no pueden ocupar la misma celda de la rejilla.
      const cells = s.nodes.map((n) => `${n.col}:${n.row}`)
      expect(new Set(cells).size, `${s.id}: nodos encimados`).toBe(cells.length)
      for (const n of s.nodes) {
        expect(n.col, `${s.id}/${n.id}`).toBeGreaterThanOrEqual(0)
        expect(n.col, `${s.id}/${n.id}`).toBeLessThanOrEqual(2)
        expect(n.label.split('\n').length, `${s.id}/${n.id}: máximo dos líneas`).toBeLessThanOrEqual(2)
        expect(n.step, `${s.id}/${n.id}`).toBeGreaterThanOrEqual(1)
        expect(n.step, `${s.id}/${n.id}`).toBeLessThanOrEqual(s.steps.length)
        expect(n.detail.length, `${s.id}/${n.id}`).toBeGreaterThan(20)
      }
      // Cada paso muestra algo nuevo.
      for (let i = 1; i <= s.steps.length; i++) expect(s.nodes.some((n) => n.step === i), `${s.id}: paso ${i} vacío`).toBe(true)
      for (const e of s.edges) {
        expect(ids.has(e.from) && ids.has(e.to), `${s.id}: ${e.from} → ${e.to}`).toBe(true)
        const [a, b] = [s.nodes.find((n) => n.id === e.from)!, s.nodes.find((n) => n.id === e.to)!]
        // Sin rodeo, las flechas solo bajan (las que suben tienen que ir por un costado).
        if (!e.route) expect(b.row, `${s.id}: ${e.from} → ${e.to}`).toBeGreaterThan(a.row)
      }
      for (const d of s.drugs) expect(ids.has(d.target), `${s.id}: ${d.name}`).toBe(true)
    }
  })

  it('los tipos de shock tienen su firma hemodinámica', () => {
    const get = (id: string) => SHOCKS.find((s) => s.id === id)!
    expect(get('cardiogenico').pcp.v).toBe(1)
    expect(get('hipovolemico').pvc.v).toBe(-1)
    expect(get('distributivo').rvs.v).toBe(-1)
    expect(get('neurogenico').fc.v).toBe(-1)
    expect(get('obstructivo').pvc.v).toBe(1)
  })
})
