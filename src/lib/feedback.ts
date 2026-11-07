import { getSupabase, isSupabaseConfigured } from './supabase'
import { useAuth } from '@/store/auth'

/**
 * Calidad del banco con ayuda de quienes lo usan: reportar un error en una pregunta y votar si una explicación sirvió.
 * Todo pasa por funciones de Supabase (ver supabase/migrations/0008); nada falla hacia afuera si no hay red o cuentas.
 */
export type ReportReason = 'respuesta' | 'enunciado' | 'explicacion' | 'otro'

export const REPORT_REASONS: { value: ReportReason; label: string; hint: string }[] = [
  { value: 'respuesta', label: 'La respuesta correcta está mal', hint: 'Otra opción es la correcta según la bibliografía.' },
  { value: 'enunciado', label: 'El enunciado tiene un error', hint: 'Mal redactado, incompleto o con una opción repetida.' },
  { value: 'explicacion', label: 'La explicación está mal o confunde', hint: 'Dice algo incorrecto o no justifica la respuesta.' },
  { value: 'otro', label: 'Otro problema', hint: 'Cuéntanos qué viste.' },
]

export const MAX_DETAIL = 500
/** Con menos votos que estos no se muestran totales: no dicen nada todavía. */
export const MIN_VOTES_SHOWN = 5

const REPORTED_KEY = 'medlogic-reportes-enviados'
const VOTES_KEY = 'medlogic-votos-explicacion'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* sin almacenamiento: a lo sumo se vuelve a mostrar el botón */
  }
}

export const hasReported = (questionId: string): boolean => readJson<string[]>(REPORTED_KEY, []).includes(questionId)

function markReported(questionId: string) {
  const list = readJson<string[]>(REPORTED_KEY, [])
  if (!list.includes(questionId)) writeJson(REPORTED_KEY, [...list, questionId].slice(-500))
}

export type ReportResult = 'ok' | 'ya_reportada' | 'sin-sesion' | 'limite' | 'error'

/** Envía el reporte de una pregunta. Requiere cuenta: sin ella devuelve «sin-sesion». */
export async function sendReport(questionId: string, reason: ReportReason, detail: string): Promise<ReportResult> {
  const user = useAuth.getState().user
  if (!isSupabaseConfigured || !user) return 'sin-sesion'
  try {
    const supabase = await getSupabase()
    if (!supabase) return 'sin-sesion'
    const { data, error } = await supabase.rpc('reportar_pregunta', { p_pregunta: questionId, p_motivo: reason, p_detalle: detail.trim().slice(0, MAX_DETAIL) || null })
    if (error) return error.code === '54000' ? 'limite' : 'error'
    markReported(questionId)
    inReview = null // el conteo de «en revisión» pudo cambiar
    return data === 'ya_reportada' ? 'ya_reportada' : 'ok'
  } catch {
    return 'error'
  }
}

// ── Preguntas en revisión (3 o más reportes de personas distintas) ─────────────────────────
let inReview: { at: number; ids: Promise<Set<string>> } | null = null
const REVIEW_TTL_MS = 10 * 60_000

/** Identificadores de las preguntas en revisión. Se consulta una vez cada 10 minutos como máximo. */
export function fetchInReview(): Promise<Set<string>> {
  if (!isSupabaseConfigured) return Promise.resolve(new Set())
  if (inReview && Date.now() - inReview.at < REVIEW_TTL_MS) return inReview.ids
  const ids = (async () => {
    try {
      const supabase = await getSupabase()
      if (!supabase) return new Set<string>()
      const { data, error } = await supabase.rpc('preguntas_en_revision')
      if (error) throw error
      return new Set(((data ?? []) as { pregunta: string }[]).map((r) => r.pregunta))
    } catch {
      inReview = null
      return new Set<string>()
    }
  })()
  inReview = { at: Date.now(), ids }
  return ids
}

// ── Votos sobre las explicaciones ─────────────────────────────────────────────────────────
export interface ExplanationVotes {
  utiles: number
  noUtiles: number
}

/** Lo que votó esta persona en este dispositivo (true = útil), o null si no ha votado. */
export const myVote = (questionId: string): boolean | null => {
  const v = readJson<Record<string, boolean>>(VOTES_KEY, {})[questionId]
  return typeof v === 'boolean' ? v : null
}

const votesCache = new Map<string, Promise<ExplanationVotes | null>>()

/** Totales públicos de una explicación, o null si no hay cuentas o falla la consulta. */
export function fetchExplanationVotes(questionId: string): Promise<ExplanationVotes | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null)
  const hit = votesCache.get(questionId)
  if (hit) return hit
  const p = (async () => {
    try {
      const supabase = await getSupabase()
      if (!supabase) return null
      const { data, error } = await supabase.rpc('votos_de_explicacion', { p_pregunta: questionId })
      if (error) throw error
      const row = ((data ?? []) as { utiles: number | string; no_utiles: number | string }[])[0]
      return { utiles: Number(row?.utiles ?? 0), noUtiles: Number(row?.no_utiles ?? 0) }
    } catch {
      votesCache.delete(questionId)
      return null
    }
  })()
  votesCache.set(questionId, p)
  return p
}

/**
 * Guarda el voto en este dispositivo y, si hay cuenta, lo envía. «local» = solo quedó en este dispositivo
 * (sin cuenta o sin red): la persona igual ve su voto, pero no suma a los totales.
 */
export async function voteExplanation(questionId: string, useful: boolean): Promise<'ok' | 'local'> {
  const votes = readJson<Record<string, boolean>>(VOTES_KEY, {})
  votes[questionId] = useful
  const keys = Object.keys(votes)
  if (keys.length > 3000) delete votes[keys[0]]
  writeJson(VOTES_KEY, votes)
  const user = useAuth.getState().user
  if (!isSupabaseConfigured || !user) return 'local'
  try {
    const supabase = await getSupabase()
    if (!supabase) return 'local'
    const { error } = await supabase.rpc('votar_explicacion', { p_pregunta: questionId, p_util: useful })
    if (error) return 'local'
    votesCache.delete(questionId)
    return 'ok'
  } catch {
    return 'local'
  }
}

/** «12 personas la marcaron útil (86 %)», o null si todavía hay pocos votos. */
export function votesLabel(v: ExplanationVotes | null): string | null {
  if (!v) return null
  const total = v.utiles + v.noUtiles
  if (total < MIN_VOTES_SHOWN) return null
  const pct = Math.round((v.utiles / total) * 100)
  return `${v.utiles} de ${total} personas la marcaron útil (${pct} %)`
}
