import { getSupabase, isSupabaseConfigured } from './supabase'
import { useAuth } from '@/store/auth'

/** Con menos respuestas que estas no se muestran porcentajes: un 100 % de 2 personas no dice nada. */
export const MIN_VOTES = 10

export interface CommunityVotes {
  /** Respuestas por opción (mismo orden que las opciones originales de la pregunta). */
  counts: number[]
  total: number
}

/**
 * Porcentajes enteros que suman exactamente 100 (método del mayor resto).
 * Con total 0 devuelve ceros.
 */
export function sharePercents(counts: number[]): number[] {
  const total = counts.reduce((a, b) => a + b, 0)
  if (!total) return counts.map(() => 0)
  const raw = counts.map((c) => (c / total) * 100)
  const floor = raw.map(Math.floor)
  let left = 100 - floor.reduce((a, b) => a + b, 0)
  raw
    .map((r, i) => ({ i, rest: r - Math.floor(r) }))
    .sort((a, b) => b.rest - a.rest)
    .forEach(({ i }) => {
      if (left-- > 0) floor[i]++
    })
  return floor
}

const SENT_KEY = 'medlogic-respuestas-enviadas'

function sentSet(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SENT_KEY) || '[]') as string[])
  } catch {
    return new Set()
  }
}

function markSent(key: string) {
  try {
    const set = sentSet().add(key)
    localStorage.setItem(SENT_KEY, JSON.stringify([...set].slice(-4000)))
  } catch {
    /* sin almacenamiento: a lo sumo se reenvía y la base lo ignora */
  }
}

const cache = new Map<string, Promise<CommunityVotes | null>>()

/**
 * Guarda lo que eligió esta persona en una pregunta. Solo cuenta la primera respuesta (la base lo garantiza) y solo
 * con sesión iniciada. Nunca falla hacia afuera: si no hay red o cuentas, simplemente no se guarda.
 */
export async function recordVote(questionId: string, option: number): Promise<void> {
  const user = useAuth.getState().user
  if (!isSupabaseConfigured || !user) return
  const key = `${user.id}|${questionId}`
  if (sentSet().has(key)) return
  try {
    const supabase = await getSupabase()
    if (!supabase) return
    const { error } = await supabase.from('respuestas_preguntas').insert({ user_id: user.id, pregunta: questionId, opcion: option })
    // 23505: ya había respondido antes (vale la primera). Cualquier otro error se reintenta la próxima vez.
    if (!error || error.code === '23505') {
      markSent(key)
      cache.delete(questionId)
    }
  } catch {
    /* sin conexión */
  }
}

/** Totales de la comunidad para una pregunta, o null si las cuentas no están activas o falla la consulta. */
export function fetchCommunity(questionId: string, optionCount: number): Promise<CommunityVotes | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null)
  const hit = cache.get(questionId)
  if (hit) return hit
  const p = (async () => {
    try {
      const supabase = await getSupabase()
      if (!supabase) return null
      const { data, error } = await supabase.rpc('respuestas_de_pregunta', { p_pregunta: questionId })
      if (error) throw error
      const counts = Array<number>(optionCount).fill(0)
      for (const row of (data ?? []) as { opcion: number; votos: number | string }[]) {
        if (row.opcion >= 0 && row.opcion < optionCount) counts[row.opcion] = Number(row.votos)
      }
      return { counts, total: counts.reduce((a, b) => a + b, 0) }
    } catch {
      cache.delete(questionId)
      return null
    }
  })()
  cache.set(questionId, p)
  return p
}
