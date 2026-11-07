/** Qué tan seguro estaba la persona al responder. */
export type Confidence = 'seguro' | 'dudo' | 'adivino'

export const CONFIDENCE_LABEL: Record<Confidence, string> = { seguro: 'Seguro', dudo: 'Dudo', adivino: 'Adivino' }

/** Una respuesta con su tiempo y, si la persona lo indicó, su nivel de seguridad. */
export interface MetaRecord {
  id: string
  spec: string
  /** Milisegundos desde que se mostró la pregunta hasta que respondió. */
  ms: number
  conf: Confidence | null
  ok: boolean
  at: number
}

/**
 * Por qué se falla una pregunta, según el tiempo y la seguridad (sin IA, solo reglas):
 *  - impulsivo: respondió mucho más rápido que de costumbre (probable lectura apresurada);
 *  - dudoso: tardó mucho o dijo «dudo» (estaba entre dos opciones);
 *  - desconocimiento: adivinó o respondió en tiempo normal (no lo sabía).
 */
export type ErrorKind = 'impulsivo' | 'dudoso' | 'desconocimiento'

export const ERROR_LABEL: Record<ErrorKind, string> = {
  impulsivo: 'Respondí muy rápido',
  dudoso: 'Dudé entre opciones',
  desconocimiento: 'No lo sabía',
}

export function median(values: number[]): number {
  if (!values.length) return 0
  const s = [...values].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/** Tiempos por debajo de 5 s se consideran apresurados aunque la mediana sea baja. */
const FAST_FLOOR_MS = 5_000

export function classifyError(r: MetaRecord, medianMs: number): ErrorKind {
  if (r.conf === 'adivino') return 'desconocimiento'
  if (r.ms < Math.max(FAST_FLOOR_MS, medianMs * 0.4)) return 'impulsivo'
  if (r.conf === 'dudo' || (medianMs > 0 && r.ms > medianMs * 1.6)) return 'dudoso'
  return 'desconocimiento'
}

export interface CalibrationRow {
  conf: Confidence
  n: number
  correct: number
  /** Aciertos de 0 a 1 (0 si no hay respuestas). */
  accuracy: number
}

export interface MetaSummary {
  total: number
  /** Respuestas con nivel de seguridad indicado. */
  rated: number
  medianMs: number
  calibration: CalibrationRow[]
  /** Aciertos en los que la persona dijo «adivino»: no cuentan como dominados. */
  luckyRight: number
  /** Fallos en los que la persona estaba «seguro»: el punto ciego más caro. */
  overconfidentWrong: number
  errors: Record<ErrorKind, number>
  wrong: number
}

export function summarize(records: MetaRecord[]): MetaSummary {
  const med = median(records.map((r) => r.ms))
  const order: Confidence[] = ['seguro', 'dudo', 'adivino']
  const calibration = order.map((conf) => {
    const rs = records.filter((r) => r.conf === conf)
    const correct = rs.filter((r) => r.ok).length
    return { conf, n: rs.length, correct, accuracy: rs.length ? correct / rs.length : 0 }
  })
  const errors: Record<ErrorKind, number> = { impulsivo: 0, dudoso: 0, desconocimiento: 0 }
  let wrong = 0
  for (const r of records) {
    if (r.ok) continue
    wrong++
    errors[classifyError(r, med)]++
  }
  return {
    total: records.length,
    rated: records.filter((r) => r.conf).length,
    medianMs: med,
    calibration,
    luckyRight: records.filter((r) => r.ok && r.conf === 'adivino').length,
    overconfidentWrong: records.filter((r) => !r.ok && r.conf === 'seguro').length,
    errors,
    wrong,
  }
}

/** Mensaje inmediato tras responder, o null si no hay nada útil que decir. */
export function feedbackFor(conf: Confidence | null, ok: boolean): string | null {
  if (conf === 'seguro' && !ok) return 'Estabas seguro y fallaste: este es un punto ciego. Vale la pena repasarlo.'
  if (conf === 'adivino' && ok) return 'Acertaste adivinando: cuenta como suerte, no como dominado.'
  if (conf === 'seguro' && ok) return 'Seguro y correcto: buen dominio.'
  if (conf === 'dudo' && ok) return 'Dudabas y acertaste: refuerza la explicación para que no sea suerte.'
  return null
}
