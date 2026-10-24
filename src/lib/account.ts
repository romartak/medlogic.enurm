import { supabase } from './supabase'
import { useAuth } from '@/store/auth'
import { useProgress } from '@/store/progress'
import { useAnki } from '@/store/anki'
import { useLingo } from '@/store/lingo'

const SYNC_META_KEY = 'medlogic-sync'
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

/**
 * Borra la cuenta y todo lo que está en la nube (perfil, progreso, ranking, simulacro nacional) y limpia
 * el progreso de este dispositivo. Primero la base de datos; solo si eso sale bien se cierra la sesión.
 */
export async function deleteMyAccount(): Promise<void> {
  if (!supabase) throw new Error('Las cuentas no están activadas.')
  const { error } = await supabase.rpc('delete_own_account')
  if (error) throw error
  // La sesión local ya no sirve: se cierra sin avisar al servidor y, después, se borra el progreso local
  // (en ese orden, para que no se intente subir nada de una cuenta que ya no existe).
  await supabase.auth.signOut({ scope: 'local' })
  try {
    localStorage.removeItem(SYNC_META_KEY)
  } catch {
    /* almacenamiento no disponible */
  }
  useAuth.setState({ sync: 'idle', conflict: null, lastSyncedAt: null })
  useProgress.getState().resetProgress()
  useAnki.getState().resetAll()
  useLingo.getState().reset()
}
