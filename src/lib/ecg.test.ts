import { describe, expect, it } from 'vitest'
import { ECG_PATTERNS, loopSegment, SAMPLE_RATE } from './ecg'

describe('tramo en bucle del monitor', () => {
  it('empalma sin salto en todos los ritmos con QRS', () => {
    for (const p of ECG_PATTERNS) {
      const seg = loopSegment(p.id, 'prueba')
      if (seg.rate === null) continue
      const { samples } = seg
      // El último punto y el primero son casi iguales (estamos en la línea de base antes de un latido).
      expect(Math.abs(samples[samples.length - 1] - samples[0]), p.id).toBeLessThan(0.08)
      expect(seg.samples.length / SAMPLE_RATE).toBeCloseTo(seg.seconds, 5)
    }
  })

  it('da la frecuencia ventricular esperada', () => {
    expect(loopSegment('flutter', 'x').rate).toBeCloseTo(150, -1)
    const bav3 = loopSegment('bav3', 'x').rate!
    expect(bav3).toBeGreaterThan(30)
    expect(bav3).toBeLessThan(45)
    const tsv = loopSegment('tsv', 'x').rate!
    expect(tsv).toBeGreaterThanOrEqual(175)
  })

  it('sin QRS no hay frecuencia', () => {
    expect(loopSegment('fv', 'x').rate).toBeNull()
    expect(loopSegment('asistolia', 'x').rate).toBeNull()
  })
})
