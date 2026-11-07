import { getSupabase, isSupabaseConfigured } from './supabase'
import { dayKey } from './utils'
import { useAuth } from '@/store/auth'

/**
 * Compañero de estudio: dos personas se unen con un código y cada una ve si la otra ya estudió hoy y su racha.
 * Nada más: ni respuestas ni resultados. Todo pasa por funciones de Supabase (migración 0008).
 */
export interface BuddyRow {
  pareja: string
  nombre: string
  estudio_hoy: boolean
  racha: number
  ultimo_estudio: string | null
  desde: string
}

export type JoinResult = 'ok' | 'codigo_invalido' | 'es_tuyo' | 'ya_son' | 'lleno' | 'sin-sesion' | 'error'

/** Letras y números del código (sin I, O, 0 ni 1, que se confunden). Debe coincidir con la base de datos. */
const CODE = /^[A-HJ-NP-Z2-9]{8}$/

/** Limpia lo que escribe o pega la persona: mayúsculas, sin guiones ni espacios. Devuelve null si no parece un código. */
export function parseInviteCode(input: string | null | undefined): string | null {
  const clean = (input ?? '').toUpperCase().replace(/[\s-]/g, '')
  return CODE.test(clean) ? clean : null
}

/** «ABCD2345» → «ABCD-2345», más fácil de leer y de dictar. */
export const formatCode = (code: string): string => (code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code)

/** Enlace que abre la página de compañeros con el código ya puesto. */
export const inviteLink = (code: string, origin = typeof location !== 'undefined' ? location.origin : 'https://medlogicenurm.vercel.app'): string => `${origin}/#/companero?codigo=${code}`

export function inviteText(code: string, origin?: string): string {
  return `Estudiemos juntos para el ENURM en MedLogic: así vemos si el otro ya estudió hoy y nos motivamos. Mi código es ${formatCode(code)}. Entra aquí: ${inviteLink(code, origin)}`
}

export function nudgeText(name: string): string {
  return `¿Ya estudiaste hoy${name && name !== 'Compañero' ? `, ${name}` : ''}? Yo ya hice mis preguntas en MedLogic. ¡Vamos que la racha no se rompe!`
}

/** Código pendiente de usar: se guarda si la persona abre una invitación antes de crear su cuenta. */
export const PENDING_KEY = 'medlogic-companero-pendiente'

export function rememberPendingCode(code: string) {
  try {
    localStorage.setItem(PENDING_KEY, code)
  } catch {
    /* sin almacenamiento: tendrá que volver a pegar el código */
  }
}

export function takePendingCode(): string | null {
  try {
    const c = parseInviteCode(localStorage.getItem(PENDING_KEY))
    localStorage.removeItem(PENDING_KEY)
    return c
  } catch {
    return null
  }
}

async function client() {
  if (!isSupabaseConfigured || !useAuth.getState().user) return null
  return getSupabase()
}

/** Mi código para invitar (vale 48 horas; mientras vale, es siempre el mismo). */
export async function getMyCode(): Promise<string> {
  const supabase = await client()
  if (!supabase) throw new Error('sin-sesion')
  const { data, error } = await supabase.rpc('companero_codigo')
  if (error) throw error
  return String(data)
}

export async function joinWithCode(code: string): Promise<JoinResult> {
  const supabase = await client()
  if (!supabase) return 'sin-sesion'
  const { data, error } = await supabase.rpc('companero_unirse', { p_codigo: code })
  if (error) return 'error'
  return (['ok', 'codigo_invalido', 'es_tuyo', 'ya_son', 'lleno'] as const).find((r) => r === data) ?? 'error'
}

export async function fetchBuddies(today: string = dayKey()): Promise<BuddyRow[]> {
  const supabase = await client()
  if (!supabase) return []
  const { data, error } = await supabase.rpc('companero_estado', { p_hoy: today })
  if (error) throw error
  return ((data ?? []) as BuddyRow[]).map((r) => ({ ...r, racha: Number(r.racha) }))
}

export async function leaveBuddy(pairId: string): Promise<boolean> {
  const supabase = await client()
  if (!supabase) return false
  const { error } = await supabase.rpc('companero_dejar', { p_pareja: pairId })
  return !error
}

/** «Ya estudió hoy», «Estudió ayer», «Hace 4 días sin estudiar», «Aún no estudia». */
export function studyStatus(b: Pick<BuddyRow, 'estudio_hoy' | 'ultimo_estudio'>, today: string = dayKey()): string {
  if (b.estudio_hoy) return 'Ya estudió hoy'
  if (!b.ultimo_estudio) return 'Aún no ha estudiado'
  const [y, m, d] = b.ultimo_estudio.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  const days = Math.round((new Date(ty, tm - 1, td).getTime() - new Date(y, m - 1, d).getTime()) / 86_400_000)
  if (days <= 0) return 'Ya estudió hoy'
  return days === 1 ? 'Estudió ayer' : `Hace ${days} días sin estudiar`
}
