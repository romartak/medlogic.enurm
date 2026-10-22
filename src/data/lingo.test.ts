import { describe, expect, it } from 'vitest'
import { LINGO_BY_ID, LINGO_ITEMS, LINGO_UNITS } from './lingo'
import { buildExercise, buildLesson, isBuildCorrect } from '@/lib/lingo'

describe('contenido de terminología', () => {
  it('cada término compuesto se forma exactamente con sus partes', () => {
    for (const i of LINGO_ITEMS.filter((x) => x.parts)) expect(i.parts!.map((p) => p.text).join(''), i.term).toBe(i.term)
  })

  it('los ids son únicos y todas las lecciones apuntan a términos existentes', () => {
    expect(new Set(LINGO_ITEMS.map((i) => i.id)).size).toBe(LINGO_ITEMS.length)
    for (const u of LINGO_UNITS) for (const l of u.lessons) for (const id of l.items) expect(LINGO_BY_ID.has(id), id).toBe(true)
  })

  it('genera lecciones con opciones válidas', () => {
    for (const u of LINGO_UNITS)
      for (const l of u.lessons) {
        const ex = buildLesson(l.items.map((id) => LINGO_BY_ID.get(id)!))
        expect(ex.length).toBeGreaterThan(l.items.length)
        for (const e of ex) {
          if (e.kind === 'meaning' || e.kind === 'term' || e.kind === 'part') {
            expect(e.options.length).toBe(4)
            expect(new Set(e.options).size).toBe(4)
            expect(e.answer).toBeGreaterThanOrEqual(0)
          }
        }
      }
  })

  it('construir una palabra con sus piezas en orden es correcto', () => {
    const item = LINGO_BY_ID.get('t-hepatomegalia')!
    const ex = buildExercise(item)!
    expect(ex.kind).toBe('build')
    expect(isBuildCorrect(item, ['hepato', 'megalia'])).toBe(true)
    expect(isBuildCorrect(item, ['megalia', 'hepato'])).toBe(false)
  })
})
