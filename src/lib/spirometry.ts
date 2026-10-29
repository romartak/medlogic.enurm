/**
 * Interpretación didáctica de una espirometría con los criterios clásicos que se preguntan en el ENURM:
 * cociente FEV1/FVC fijo de 0,70 (GOLD), FVC < 80 % del predicho para sospechar restricción, grados GOLD
 * por el FEV1 y respuesta al broncodilatador de la ATS/ERS 2005 (≥ 12 % y ≥ 200 mL). La ATS/ERS 2022
 * recomienda usar el límite inferior de la normalidad (LIN, z-score) cuando el equipo lo da.
 */

export type SpiroPattern = 'normal' | 'obstructivo' | 'restrictivo' | 'mixto'

export interface SpiroInput {
  /** Litros, prebroncodilatador. */
  fev1: number
  fvc: number
  /** % del valor predicho. */
  fev1Pred: number
  fvcPred: number
  /** Valores posbroncodilatador en litros, si se hizo la prueba. */
  post?: { fev1: number; fvc: number }
}

export interface BdResponse {
  /** Cambio del FEV1 y de la FVC en mL y en % respecto al basal. */
  fev1: { ml: number; pct: number }
  fvc: { ml: number; pct: number }
  positive: boolean
}

export interface SpiroResult {
  ratio: number
  pattern: SpiroPattern
  /** GOLD 1–4 cuando hay obstrucción. */
  gold?: 1 | 2 | 3 | 4
  /** Gravedad por FEV1 % del predicho (ATS/ERS 2005), para patrones no obstructivos. */
  severity?: 'leve' | 'moderada' | 'moderadamente grave' | 'grave' | 'muy grave'
  bd?: BdResponse
  /** Cociente posbroncodilatador (para el diagnóstico de EPOC). */
  postRatio?: number
}

export const RATIO_CUTOFF = 0.7
export const FVC_CUTOFF = 80

export function goldGrade(fev1Pred: number): 1 | 2 | 3 | 4 {
  if (fev1Pred >= 80) return 1
  if (fev1Pred >= 50) return 2
  if (fev1Pred >= 30) return 3
  return 4
}

export function atsSeverity(fev1Pred: number): NonNullable<SpiroResult['severity']> {
  if (fev1Pred >= 70) return 'leve'
  if (fev1Pred >= 60) return 'moderada'
  if (fev1Pred >= 50) return 'moderadamente grave'
  if (fev1Pred >= 35) return 'grave'
  return 'muy grave'
}

/** Respuesta positiva: aumento ≥ 12 % y ≥ 200 mL del FEV1 o de la FVC respecto al basal. */
export function bronchodilatorResponse(pre: { fev1: number; fvc: number }, post: { fev1: number; fvc: number }): BdResponse {
  const change = (a: number, b: number) => ({ ml: Math.round((b - a) * 1000), pct: Math.round(((b - a) / a) * 1000) / 10 })
  const fev1 = change(pre.fev1, post.fev1)
  const fvc = change(pre.fvc, post.fvc)
  const ok = (c: { ml: number; pct: number }) => c.ml >= 200 && c.pct >= 12
  return { fev1, fvc, positive: ok(fev1) || ok(fvc) }
}

export function interpretSpirometry(input: SpiroInput): SpiroResult {
  const ratio = input.fev1 / input.fvc
  const obstructed = ratio < RATIO_CUTOFF
  const lowFvc = input.fvcPred < FVC_CUTOFF
  const pattern: SpiroPattern = obstructed ? (lowFvc ? 'mixto' : 'obstructivo') : lowFvc ? 'restrictivo' : 'normal'
  const result: SpiroResult = { ratio, pattern }
  if (obstructed) result.gold = goldGrade(input.fev1Pred)
  else if (pattern === 'restrictivo') result.severity = atsSeverity(input.fev1Pred)
  if (input.post) {
    result.bd = bronchodilatorResponse(input, input.post)
    result.postRatio = input.post.fev1 / input.post.fvc
  }
  return result
}

export type LoopShape = 'normal' | 'obstructivo' | 'restrictivo' | 'fija' | 'extratoracica' | 'intratoracica'

/**
 * Puntos de una curva flujo-volumen esquemática: volumen en L (0 = capacidad pulmonar total) y flujo en L/s
 * (espiración arriba, inspiración abajo).
 */
export function loopPoints(shape: LoopShape, n = 60): { v: number; f: number }[] {
  const fvc = shape === 'restrictivo' ? 3 : shape === 'obstructivo' ? 4.2 : 5
  const pef = shape === 'obstructivo' ? 5.5 : shape === 'restrictivo' ? 7.5 : 9
  const pif = 6
  const capOut = shape === 'fija' || shape === 'intratoracica' ? 3 : Infinity
  const capIn = shape === 'fija' || shape === 'extratoracica' ? 3 : Infinity
  const peakAt = 0.12 * fvc
  const out: { v: number; f: number }[] = []
  for (let i = 0; i <= n; i++) {
    const v = (i / n) * fvc
    let f: number
    if (v <= peakAt) f = pef * Math.sin(((v / peakAt) * Math.PI) / 2)
    else {
      const x = (v - peakAt) / (fvc - peakAt)
      // Obstrucción: caída cóncava («excavada»); restricción: casi recta; normal: ligeramente convexa.
      f = pef * (shape === 'obstructivo' ? (1 - x) ** 2.6 : shape === 'restrictivo' ? 1 - x : 1 - x ** 1.35)
    }
    out.push({ v, f: Math.min(f, capOut) })
  }
  for (let i = n; i >= 0; i--) {
    const v = (i / n) * fvc
    out.push({ v, f: -Math.min(pif * Math.sin((v / fvc) * Math.PI), capIn) })
  }
  return out
}
