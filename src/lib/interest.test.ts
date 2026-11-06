import { describe, expect, it } from 'vitest'
import { buildInsights, formatMinutes, interestScore, sectionOf, topInterests, type UsageMap } from './interest'

const NOW = Date.UTC(2026, 10, 6)
const min = (m: number) => m * 60_000
const u = (m: number, visits: number, last = NOW) => ({ ms: min(m), visits, last })

describe('sectionOf', () => {
  it('une las subpáginas con su sección', () => {
    expect(sectionOf('/casos/infarto')).toBe('/casos')
    expect(sectionOf('/ecg/monitor')).toBe('/ecg/monitor')
    expect(sectionOf('/flashcards/mazo1/estudiar')).toBe('/flashcards')
  })
  it('ignora inicio, ajustes y rutas desconocidas', () => {
    expect(sectionOf('/inicio')).toBeNull()
    expect(sectionOf('/ajustes')).toBeNull()
    expect(sectionOf('/no-existe')).toBeNull()
  })
})

describe('interestScore', () => {
  it('pierde la mitad a las dos semanas', () => {
    const fresh = interestScore(u(10, 0), NOW)
    const old = interestScore(u(10, 0, NOW - 14 * 86_400_000), NOW)
    expect(old).toBeCloseTo(fresh / 2, 5)
  })
})

describe('topInterests', () => {
  it('ordena por interés y reparte el porcentaje', () => {
    const usage: UsageMap = { '/casos': u(30, 4), '/guias': u(10, 2), '/practica': u(5, 1) }
    const top = topInterests(usage, 3, NOW)
    expect(top.map((t) => t.to)).toEqual(['/casos', '/guias', '/practica'])
    expect(top.reduce((a, t) => a + t.share, 0)).toBeCloseTo(1, 5)
    expect(top[0].minutes).toBe(30)
  })
})

describe('buildInsights', () => {
  it('no concluye nada con muy poco uso', () => {
    expect(buildInsights({ '/casos': u(2, 1) }, NOW)).toEqual([])
  })
  it('destaca la sección donde más tiempo pasa y la compara con la siguiente', () => {
    const r = buildInsights({ '/casos': u(40, 3), '/guias': u(10, 2) }, NOW)
    expect(r[0]).toMatchObject({ id: 'top', to: '/casos' })
    expect(r[0].text).toContain('Casos clínicos')
    expect(r[0].text).toContain('Guías')
  })
  it('propone medirse si solo lee y repasa', () => {
    const r = buildInsights({ '/guias': u(30, 5), '/practica': u(2, 1) }, NOW)
    expect(r.some((i) => i.id === 'test-yourself' && i.to === '/practica')).toBe(true)
  })
  it('no lo propone si ya practica lo suficiente', () => {
    const r = buildInsights({ '/guias': u(12, 5), '/practica': u(10, 3) }, NOW)
    expect(r.some((i) => i.id === 'test-yourself')).toBe(false)
  })
  it('sugiere la primera sección central sin abrir', () => {
    const r = buildInsights({ '/practica': u(10, 3), '/simulacro': u(5, 1) }, NOW)
    expect(r.find((i) => i.id.startsWith('try-'))?.to).toBe('/casos')
  })
  it('devuelve como máximo tres sugerencias', () => {
    expect(buildInsights({ '/guias': u(40, 6) }, NOW).length).toBeLessThanOrEqual(3)
  })
})

describe('formatMinutes', () => {
  it('formatea minutos y horas', () => {
    expect(formatMinutes(45)).toBe('45 min')
    expect(formatMinutes(130)).toBe('2 h 10 min')
    expect(formatMinutes(120)).toBe('2 h')
  })
})
