import { supabase } from './supabase'
import { overview, computeStreak } from './stats'
import { useProgress } from '@/store/progress'
import { useAuth, displayName } from '@/store/auth'

/**
 * Ranking de estudiantes (Supabase: tabla public.leaderboard y funciones ranking_*, ver
 * supabase/migrations/0003). La app sube un resumen del progreso al sincronizar; nunca las respuestas.
 */
export type RankingOrder = 'xp' | 'answered' | 'accuracy' | 'minutes'

export interface RankingRow {
  posicion: number
  nombre: string
  universidad: string | null
  respondidas: number
  acierto: number
  xp: number
  minutos: number
  racha: number
  es_yo: boolean
}

export interface MyPosition {
  posicion_pais: number
  total_pais: number
  posicion_universidad: number
  total_universidad: number
  universidad: string | null
}

export interface UniversityRow {
  universidad: string
  estudiantes: number
  respondidas: number
  acierto: number
  xp_promedio: number
}

/** «Robinson Santos» → «Robinson S.»: suficiente para reconocerse sin exponer el nombre completo. */
export function shortName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  // Con título («Dra. Genao», «Dr. Pérez Gómez») se conserva el apellido: «Dra. Genao».
  if (/^dra?\.?$/i.test(parts[0]) && parts[1]) return `${parts[0]} ${parts[1].slice(0, 20)}`
  const first = parts[0].slice(0, 20)
  return parts[1] ? `${first} ${parts[1][0].toUpperCase()}.` : first
}

/** Resumen público del progreso de este dispositivo. */
export function myPublicStats() {
  const p = useProgress.getState()
  const ov = overview(p.attempts, p.activity, 0)
  const user = useAuth.getState().user
  const name = shortName(p.settings.name || displayName(user))
  return {
    display_name: name || null,
    show_name: p.settings.rankingShowName,
    university: p.profile.university,
    answered: ov.answered,
    correct: Math.min(ov.correct, ov.answered),
    minutes: Math.round(ov.minutes),
    xp: Math.round(p.xp),
    streak: computeStreak(p.activity),
  }
}

let lastPublish = 0
const MIN_GAP = 60_000

/** Sube el resumen al ranking (como mucho una vez por minuto, salvo `force`). */
export async function publishStats(force = false): Promise<boolean> {
  const user = useAuth.getState().user
  if (!supabase || !user) return false
  if (!force && Date.now() - lastPublish < MIN_GAP) return false
  lastPublish = Date.now()
  const { error } = await supabase.from('leaderboard').upsert({ user_id: user.id, ...myPublicStats() })
  return !error
}

export async function fetchRanking(order: RankingOrder, university: string | null) {
  if (!supabase) return { rows: [] as RankingRow[], me: null as MyPosition | null }
  const [list, me] = await Promise.all([
    supabase.rpc('ranking_lista', { p_orden: order, p_universidad: university, p_limite: 50 }),
    supabase.rpc('ranking_mi_posicion', { p_orden: order }),
  ])
  if (list.error) throw list.error
  const rows = (list.data ?? []).map((r: RankingRow) => ({ ...r, posicion: Number(r.posicion), acierto: Number(r.acierto) }))
  const mine = (me.data ?? [])[0] as MyPosition | undefined
  return {
    rows,
    me: mine
      ? { ...mine, posicion_pais: Number(mine.posicion_pais), total_pais: Number(mine.total_pais), posicion_universidad: Number(mine.posicion_universidad), total_universidad: Number(mine.total_universidad) }
      : null,
  }
}

export async function fetchUniversities(): Promise<UniversityRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('ranking_universidades')
  if (error) throw error
  return (data ?? []).map((r: UniversityRow) => ({ ...r, estudiantes: Number(r.estudiantes), respondidas: Number(r.respondidas), acierto: Number(r.acierto), xp_promedio: Number(r.xp_promedio) }))
}
