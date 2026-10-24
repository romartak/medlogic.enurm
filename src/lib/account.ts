import { supabase } from './supabase'
import { flushPending, pauseSync } from './sync'
import { publishStats } from './ranking'
import { useAuth } from '@/store/auth'
import { addressName, splitName } from './utils'
import type { Honorific } from '@/types'
import { useProgress } from '@/store/progress'
import { useAnki } from '@/store/anki'
import { useLingo } from '@/store/lingo'

const HAD_ACCOUNT_KEY = 'medlogic-had-account'

/** ¿Ya inició sesión alguna vez en este dispositivo? Decide si se abre «Crear cuenta» o «Iniciar sesión». */
export function hadAccount(): boolean {
  try {
    return localStorage.getItem(HAD_ACCOUNT_KEY) !== null
  } catch {
    return false
  }
}

export function markHadAccount(): void {
  try {
    localStorage.setItem(HAD_ACCOUNT_KEY, '1')
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Elige la foto de perfil (null = usar la inicial). Se guarda en los datos de la cuenta. */
export async function setAvatar(avatar: string | null): Promise<void> {
  if (!supabase) throw new Error('Las cuentas no están activadas.')
  const { error } = await supabase.auth.updateUser({ data: { avatar } })
  if (error) throw error
}

/** Datos que solo viven en este dispositivo (no se sincronizan) y que también se borran al salir. */
const DEVICE_ONLY_KEYS = ['medlogic-sync', 'medlogic-casos', 'medlogic-duelos', 'medlogic-ecg', 'medlogic-nacional', 'medlogic-recordatorio', 'medlogic-roadmap-likes', 'medlogic-prompt-favs']
const NOTICE_KEY = 'medlogic-notice'

export type AccountNotice = 'logout' | 'deleted'

let notice: AccountNotice | null | undefined

/**
 * Mensaje que se muestra en la pantalla de entrar después de cerrar sesión o borrar la cuenta. Se lee una sola vez
 * por carga de la página (se borra del almacenamiento) y se recuerda, para que dé igual cuántas veces se dibuje.
 */
export function takeNotice(): AccountNotice | null {
  if (notice !== undefined) return notice
  notice = null
  try {
    const v = sessionStorage.getItem(NOTICE_KEY)
    sessionStorage.removeItem(NOTICE_KEY)
    if (v === 'logout' || v === 'deleted') notice = v
  } catch {
    /* almacenamiento no disponible */
  }
  return notice
}

/**
 * Deja este dispositivo como nuevo: sin progreso, notas, plan, nombre ni trato de la persona anterior.
 * Solo se conservan las preferencias de pantalla (tema, sonido, movimiento). Así quien use el mismo teléfono
 * después no ve ni sube nada ajeno, y al volver a entrar se descarga el progreso desde la cuenta.
 */
export function wipeDeviceData(): void {
  const { theme, sound, reduceMotion, shuffleOptions } = useProgress.getState().settings
  useProgress.setState(useProgress.getInitialState(), true)
  useAnki.setState(useAnki.getInitialState(), true)
  useLingo.setState(useLingo.getInitialState(), true)
  useProgress.getState().updateSettings({ theme, sound, reduceMotion, shuffleOptions })
  try {
    for (const k of DEVICE_ONLY_KEYS) localStorage.removeItem(k)
  } catch {
    /* almacenamiento no disponible */
  }
}

/**
 * Cierra la sesión en este dispositivo, lo limpia y recarga la página en la pantalla de entrar.
 * Antes de llamarla hay que haber subido el progreso pendiente (ver flushPending).
 */
async function endSession(notice: AccountNotice): Promise<void> {
  // 1) Que la sincronización no suba nada mientras se limpia: subiría un progreso vacío a la cuenta.
  pauseSync()
  // 2) Cerrar solo esta sesión (no las de otros dispositivos). Sin conexión puede fallar; abajo se fuerza.
  try {
    await supabase?.auth.signOut({ scope: 'local' })
  } catch {
    /* se fuerza más abajo */
  }
  // 3) Limpiar el dispositivo y recargar para que no quede nada en memoria.
  wipeDeviceData()
  try {
    localStorage.removeItem('medlogic-auth')
    sessionStorage.setItem(NOTICE_KEY, notice)
  } catch {
    /* almacenamiento no disponible */
  }
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/cuenta`)
  window.location.reload()
}

/** Cierra la sesión y deja el dispositivo limpio. */
export function logout(): Promise<void> {
  return endSession('logout')
}

/**
 * Borra la cuenta y todo lo que está en la nube (perfil, progreso, ranking, simulacro nacional) y limpia
 * este dispositivo. Primero la base de datos; solo si eso sale bien se cierra la sesión.
 */
export async function deleteMyAccount(): Promise<void> {
  if (!supabase) throw new Error('Las cuentas no están activadas.')
  const { error } = await supabase.rpc('delete_own_account')
  if (error) throw error
  await endSession('deleted')
}

export interface ProfileEdit {
  name: string
  honorific: Honorific | null
  university: string | null
  universityOther: string
}

/**
 * Guarda los cambios del perfil y los lleva a todas partes de una vez: la página (al instante), los datos
 * de la cuenta, el perfil, el progreso en la nube y el ranking. Devuelve false si lo de la nube no se pudo
 * completar (en ese caso queda guardado en este dispositivo y el progreso se reintenta solo).
 */
export async function saveProfile(edit: ProfileEdit): Promise<boolean> {
  const typed = splitName(edit.name)
  const honorific = edit.honorific && edit.honorific !== 'none' ? edit.honorific : (typed.title ?? edit.honorific)
  const name = typed.name.slice(0, 60)
  const progress = useProgress.getState()
  progress.updateSettings({ name, honorific })
  progress.updateProfile({ university: edit.university, universityOther: edit.universityOther.trim().slice(0, 80) })

  const user = useAuth.getState().user
  if (!supabase || !user) return true
  let ok = true
  const { error } = await supabase.auth.updateUser({ data: { name: addressName({ name, honorific }), call_name: name, treatment: honorific } })
  if (error) ok = false
  // El nombre del perfil de la cuenta (tabla profiles) acompaña al de los datos de la cuenta.
  const { error: perfil } = await supabase.from('profiles').update({ display_name: (addressName({ name, honorific }) || null)?.slice(0, 80) ?? null }).eq('id', user.id)
  if (perfil) ok = false
  // Sube ya el progreso (incluye nombre y universidad) y actualiza el ranking.
  if (!(await flushPending())) ok = false
  if (!(await publishStats(true))) ok = false
  return ok
}
