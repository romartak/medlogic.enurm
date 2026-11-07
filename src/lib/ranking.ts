import { getSupabase } from './supabase'
import { overview, computeStreak } from './stats'
import { isoWeekId, weekPoints } from './league'
import { useProgress } from '@/store/progress'
import { useAuth, displayName } from '@/store/auth'
import { addressName, splitName } from './utils'

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
  const { title, name } = splitName(full)
  const parts = name.split(' ').filter(Boolean)
  const label = title ? { dr: 'Dr.', dra: 'Dra.', lic: 'Lic.', est: 'Est.' }[title] : ''
  // Con título («Dra. Genao», «Dr. Pérez Gómez») se conserva el apellido: «Dra. Genao».
  if (label) return parts[0] ? `${label} ${parts[0].slice(0, 20)}` : label.replace('.', '')
  if (!parts.length) return ''
  const first = parts[0].slice(0, 20)
  return parts[1] ? `${first} ${parts[1][0].toUpperCase()}.` : first
}

/** Último día en que hubo estudio (aaaa-mm-dd), o null. Sirve para que un compañero vea si ya estudiaste hoy. */
export function lastStudyDay(activity: Record<string, { answered: number; cards: number; minutes: number }>): string | null {
  const days = Object.keys(activity).filter((k) => activity[k].answered + activity[k].cards + activity[k].minutes > 0)
  return days.length ? days.sort().at(-1)! : null
}

/** Resumen público del progreso de este dispositivo (sin la parte semanal, que puede no existir en la base). */
export function myBaseStats() {
  const p = useProgress.getState()
  const ov = overview(p.attempts, p.activity, 0)
  const user = useAuth.getState().user
  const name = shortName(addressName(p.settings) || displayName(user))
  return {
    display_name: name || null,
    show_name: p.settings.rankingShowName,
    university: p.profile.university,
    answered: ov.answered,
    correct: Math.min(ov.correct, ov.answered),
    minutes: Math.round(ov.minutes),
    xp: Math.round(p.xp),
    streak: computeStreak(p.activity, new Date(), p.streakFreeze.frozen),
  }
}

/** Resumen público completo: lo anterior más los puntos de la semana y el último día de estudio. */
export function myPublicStats() {
  const p = useProgress.getState()
  return {
    ...myBaseStats(),
    semana: isoWeekId(),
    xp_semana: Math.min(100000, weekPoints(p.activity)),
    ultimo_estudio: lastStudyDay(p.activity),
  }
}

let lastPublish = 0
let pending: ReturnType<typeof setTimeout> | null = null
const MIN_GAP = 15_000

async function upsertStats(userId: string) {
  const supabase = (await getSupabase())!
  const res = await supabase.from('leaderboard').upsert({ user_id: userId, ...myPublicStats() })
  // Si la base todavía no tiene las columnas semanales (migración 0008 sin aplicar), se sube el resumen de siempre:
  // así el ranking no se rompe mientras tanto. 42703 = columna inexistente; PGRST204 = PostgREST no la conoce.
  if (res.error && (res.error.code === '42703' || res.error.code === 'PGRST204')) {
    return supabase.from('leaderboard').upsert({ user_id: userId, ...myBaseStats() })
  }
  return res
}

/**
 * Sube el resumen al ranking. Si se pide antes de que pasen 15 s desde la última vez (salvo `force`),
 * queda programado para cuando se cumplan, de modo que el último estado siempre llega.
 */
export async function publishStats(force = false): Promise<boolean> {
  const user = useAuth.getState().user
  if (!(await getSupabase()) || !user) return false
  const wait = MIN_GAP - (Date.now() - lastPublish)
  if (!force && wait > 0) {
    if (!pending) {
      pending = setTimeout(() => {
        pending = null
        void publishStats()
      }, wait)
    }
    return false
  }
  if (pending) clearTimeout(pending)
  pending = null
  lastPublish = Date.now()
  let { error } = await upsertStats(user.id)
  // La base acepta una actualización por segundo: si justo se subió otra, se reintenta una vez.
  if (error?.code === '54000') {
    await new Promise((r) => setTimeout(r, 1200))
    ;({ error } = await upsertStats(user.id))
  }
  if (error) lastPublish = 0
  return !error
}

export async function fetchRanking(order: RankingOrder, university: string | null) {
  const supabase = await getSupabase()
  if (!supabase) return { rows: [] as RankingRow[], me: null as MyPosition | null }
  const [list, me] = await Promise.all([
    supabase.rpc('ranking_lista', { p_orden: order, p_universidad: university, p_limite: 100 }),
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
  const supabase = await getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase.rpc('ranking_universidades')
  if (error) throw error
  return (data ?? []).map((r: UniversityRow) => ({ ...r, estudiantes: Number(r.estudiantes), respondidas: Number(r.respondidas), acierto: Number(r.acierto), xp_promedio: Number(r.xp_promedio) }))
}

/** Una persona en tu liga de esta semana. */
export interface LeagueRow {
  posicion: number
  nombre: string
  liga: number
  puntos: number
  es_yo: boolean
}

/** La liga de esta semana: quienes están en tu misma liga, ordenados por puntos. */
export async function fetchLeague(week: string = isoWeekId()): Promise<LeagueRow[]> {
  const supabase = await getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase.rpc('liga_semanal', { p_semana: week, p_limite: 30 })
  if (error) throw error
  return (data ?? []).map((r: LeagueRow) => ({ ...r, posicion: Number(r.posicion), liga: Number(r.liga), puntos: Number(r.puntos) }))
}

export interface ChallengeRow {
  universidad: string
  participantes: number
  puntos_total: number
  puntos_promedio: number
  es_la_mia: boolean
}

/** El reto de la semana entre universidades (solo las que tienen 3 o más participantes). */
export async function fetchUniversityChallenge(week: string = isoWeekId()): Promise<ChallengeRow[]> {
  const supabase = await getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase.rpc('reto_universidades', { p_semana: week })
  if (error) throw error
  return (data ?? []).map((r: ChallengeRow) => ({ ...r, participantes: Number(r.participantes), puntos_total: Number(r.puntos_total), puntos_promedio: Number(r.puntos_promedio) }))
}
