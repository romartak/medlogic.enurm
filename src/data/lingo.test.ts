import { describe, expect, it } from 'vitest'
import { LINGO_BY_ID, LINGO_ITEMS, LINGO_REFS, LINGO_UNITS } from './lingo'
import {
  blitzPool,
  blitzQuestion,
  buildExercise,
  buildLesson,
  contextExercise,
  findExercise,
  isBuildCorrect,
  meaningExercise,
  oppositeExercise,
  partExercise,
  termExercise,
  trueFalseExercise,
} from '@/lib/lingo'

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
          if ('options' in e) {
            expect(e.options.length).toBe(e.kind === 'truefalse' ? 2 : 4)
            expect(new Set(e.options).size).toBe(e.options.length)
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

describe('formas de practicar', () => {
  it('pares de contrarios y casos clínicos apuntan a términos que existen', () => {
    for (const [a, b] of LINGO_REFS.opposites) {
      expect(LINGO_BY_ID.get(a)?.opposite, a).toBe(b)
      expect(LINGO_BY_ID.get(b)?.opposite, b).toBe(a)
    }
    for (const id of LINGO_REFS.confusable) expect(LINGO_BY_ID.has(id), id).toBe(true)
    for (const id of LINGO_REFS.contexts) {
      const item = LINGO_BY_ID.get(id)
      expect(item, id).toBeDefined()
      expect(item!.context!.split('___').length, id).toBe(2)
    }
  })

  it('cada ejercicio tiene opciones distintas y una sola correcta', () => {
    for (let round = 0; round < 5; round++)
      for (const item of LINGO_ITEMS) {
        const all = [meaningExercise(item), termExercise(item), trueFalseExercise(item), contextExercise(item), oppositeExercise(item), findExercise(item), partExercise(item)]
        for (const e of all) {
          if (!e || !('options' in e)) continue
          expect(new Set(e.options).size, `${e.kind} ${item.id}`).toBe(e.options.length)
          expect(e.options.length, `${e.kind} ${item.id}`).toBe(e.kind === 'truefalse' ? 2 : 4)
          expect(e.answer, `${e.kind} ${item.id}`).toBeGreaterThanOrEqual(0)
        }
      }
  })

  it('las opciones de lo contrario incluyen el contrario y no la misma palabra', () => {
    const item = LINGO_BY_ID.get('t-hiperglucemia')!
    const ex = oppositeExercise(item)!
    expect(ex.kind).toBe('opposite')
    if (ex.kind !== 'opposite') return
    expect(ex.options[ex.answer]).toBe('hipoglucemia')
    expect(ex.options).not.toContain('hiperglucemia')
  })

  it('en prefijos no se ofrece como distractor un sinónimo (sub- e infra- = debajo)', () => {
    const sub = LINGO_BY_ID.get('prefijo-sub')!
    for (let i = 0; i < 30; i++) {
      const ex = meaningExercise(sub)
      if (ex.kind !== 'meaning') continue
      expect(ex.options.filter((o) => /debajo/.test(o))).toHaveLength(1)
    }
  })

  it('nunca ofrece como distractor una palabra que también sería correcta', () => {
    const anterior = LINGO_BY_ID.get('t-anterior')!
    for (let i = 0; i < 40; i++) {
      for (const e of [contextExercise(anterior), termExercise(anterior), oppositeExercise(LINGO_BY_ID.get('t-posterior')!)]) {
        if (e && 'options' in e) expect(e.options).not.toContain('ventral')
      }
    }
  })

  it('el reto relámpago tiene palabras desde el principio', () => {
    const pool = blitzPool({})
    expect(pool.length).toBeGreaterThanOrEqual(12)
    for (let i = 0; i < 50; i++) expect('options' in blitzQuestion(pool)).toBe(true)
  })
})
