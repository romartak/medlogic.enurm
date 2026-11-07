import { describe, expect, it } from 'vitest'
import { classifyError, feedbackFor, median, summarize, type MetaRecord } from './metacog'

const r = (over: Partial<MetaRecord>): MetaRecord => ({ id: 'q', spec: 'x', ms: 30_000, conf: null, ok: true, at: 0, ...over })

describe('median', () => {
  it('maneja vacío, impar y par', () => {
    expect(median([])).toBe(0)
    expect(median([3, 1, 2])).toBe(2)
    expect(median([1, 2, 3, 10])).toBe(2.5)
  })
})

describe('classifyError', () => {
  it('adivinar es desconocimiento, sin importar el tiempo', () => {
    expect(classifyError(r({ ok: false, conf: 'adivino', ms: 1_000 }), 30_000)).toBe('desconocimiento')
  })
  it('responder muy rápido es impulsivo', () => {
    expect(classifyError(r({ ok: false, ms: 4_000 }), 30_000)).toBe('impulsivo')
  })
  it('dudar o tardar mucho es dudoso', () => {
    expect(classifyError(r({ ok: false, conf: 'dudo', ms: 25_000 }), 30_000)).toBe('dudoso')
    expect(classifyError(r({ ok: false, ms: 60_000 }), 30_000)).toBe('dudoso')
  })
  it('lo demás es desconocimiento', () => {
    expect(classifyError(r({ ok: false, conf: 'seguro', ms: 28_000 }), 30_000)).toBe('desconocimiento')
  })
})

describe('summarize', () => {
  it('calcula calibración, suerte, puntos ciegos y errores', () => {
    const recs = [
      r({ conf: 'seguro', ok: true }),
      r({ conf: 'seguro', ok: false }),
      r({ conf: 'adivino', ok: true }),
      r({ conf: 'adivino', ok: false }),
      r({ conf: null, ok: false, ms: 2_000 }),
    ]
    const s = summarize(recs)
    expect(s.total).toBe(5)
    expect(s.rated).toBe(4)
    expect(s.calibration[0]).toMatchObject({ conf: 'seguro', n: 2, correct: 1, accuracy: 0.5 })
    expect(s.luckyRight).toBe(1)
    expect(s.overconfidentWrong).toBe(1)
    expect(s.wrong).toBe(3)
    expect(s.errors.impulsivo).toBe(1)
  })
  it('sin datos devuelve ceros', () => {
    const s = summarize([])
    expect(s.total).toBe(0)
    expect(s.calibration.every((c) => c.accuracy === 0)).toBe(true)
  })
})

describe('feedbackFor', () => {
  it('avisa del punto ciego y de la suerte', () => {
    expect(feedbackFor('seguro', false)).toContain('punto ciego')
    expect(feedbackFor('adivino', true)).toContain('suerte')
    expect(feedbackFor(null, true)).toBeNull()
  })
})
