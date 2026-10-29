import { describe, expect, it } from 'vitest'
import { atsSeverity, bronchodilatorResponse, goldGrade, interpretSpirometry, loopPoints } from './spirometry'

describe('espirometría', () => {
  it('normal', () => {
    const r = interpretSpirometry({ fev1: 3.6, fvc: 4.5, fev1Pred: 95, fvcPred: 98 })
    expect(r.pattern).toBe('normal')
    expect(r.ratio).toBeCloseTo(0.8)
  })

  it('obstructivo con su grado GOLD', () => {
    const r = interpretSpirometry({ fev1: 1.6, fvc: 3.4, fev1Pred: 55, fvcPred: 88 })
    expect(r.pattern).toBe('obstructivo')
    expect(r.gold).toBe(2)
  })

  it('restrictivo: cociente normal o alto con FVC baja', () => {
    const r = interpretSpirometry({ fev1: 2.1, fvc: 2.4, fev1Pred: 64, fvcPred: 60 })
    expect(r.pattern).toBe('restrictivo')
    expect(r.severity).toBe('moderada')
    expect(r.gold).toBeUndefined()
  })

  it('mixto: cociente bajo y FVC baja', () => {
    expect(interpretSpirometry({ fev1: 1.2, fvc: 2.2, fev1Pred: 40, fvcPred: 62 }).pattern).toBe('mixto')
  })

  it('el corte del cociente es estricto: 0,70 no es obstrucción', () => {
    expect(interpretSpirometry({ fev1: 2.8, fvc: 4, fev1Pred: 85, fvcPred: 90 }).pattern).toBe('normal')
  })

  it('grados GOLD en sus límites', () => {
    expect([80, 79, 50, 49, 30, 29].map(goldGrade)).toEqual([1, 2, 2, 3, 3, 4])
  })

  it('gravedad ATS/ERS en sus límites', () => {
    expect([70, 69, 60, 59, 50, 49, 35, 34].map(atsSeverity)).toEqual(['leve', 'moderada', 'moderada', 'moderadamente grave', 'moderadamente grave', 'grave', 'grave', 'muy grave'])
  })

  it('respuesta al broncodilatador: pide ≥ 12 % y ≥ 200 mL', () => {
    // +300 mL y +18,8 %: positiva (asma).
    expect(bronchodilatorResponse({ fev1: 1.6, fvc: 3.4 }, { fev1: 1.9, fvc: 3.5 }).positive).toBe(true)
    // +150 mL aunque sea +15 %: no alcanza los 200 mL.
    expect(bronchodilatorResponse({ fev1: 1, fvc: 2.5 }, { fev1: 1.15, fvc: 2.55 }).positive).toBe(false)
    // +250 mL pero solo +6,25 %: no alcanza el 12 %.
    expect(bronchodilatorResponse({ fev1: 4, fvc: 5 }, { fev1: 4.25, fvc: 5.1 }).positive).toBe(false)
    // Cuenta también la FVC.
    expect(bronchodilatorResponse({ fev1: 1.5, fvc: 2.5 }, { fev1: 1.55, fvc: 2.9 }).positive).toBe(true)
  })

  it('guarda el cociente posbroncodilatador', () => {
    const r = interpretSpirometry({ fev1: 1.4, fvc: 3, fev1Pred: 48, fvcPred: 85, post: { fev1: 1.5, fvc: 3.1 } })
    expect(r.postRatio).toBeCloseTo(0.484, 2)
    expect(r.bd?.positive).toBe(false)
  })

  it('curvas: la obstrucción baja el flujo pico y la estenosis fija aplana ambas ramas', () => {
    const peak = (s: Parameters<typeof loopPoints>[0]) => Math.max(...loopPoints(s).map((p) => p.f))
    const trough = (s: Parameters<typeof loopPoints>[0]) => Math.min(...loopPoints(s).map((p) => p.f))
    expect(peak('obstructivo')).toBeLessThan(peak('normal'))
    expect(peak('fija')).toBe(3)
    expect(trough('fija')).toBe(-3)
    expect(trough('intratoracica')).toBeLessThan(-3)
    expect(peak('extratoracica')).toBeGreaterThan(3)
  })
})
