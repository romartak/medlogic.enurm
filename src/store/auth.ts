import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type AuthStatus = 'disabled' | 'loading' | 'signed-out' | 'signed-in'
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error' | 'conflict'

interface AuthState {
  status: AuthStatus
  user: User | null
  session: Session | null
  /** true tras abrir el enlace de «olvidé mi contraseña»: hay que pedir la nueva. */
  recovering: boolean
  sync: SyncStatus
  lastSyncedAt: string | null
  /** Copia de la nube que choca con el progreso de este dispositivo. */
  conflict: { remote: unknown; updatedAt: string } | null
  init: () => () => void
  setSync: (patch: Partial<Pick<AuthState, 'sync' | 'lastSyncedAt' | 'conflict' | 'recovering'>>) => void
  signOut: () => Promise<void>
}

export const useAuth = create<AuthState>()((set) => ({
  status: supabase ? 'loading' : 'disabled',
  user: null,
  session: null,
  recovering: false,
  sync: 'idle',
  lastSyncedAt: null,
  conflict: null,

  init: () => {
    if (!supabase) return () => {}
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, user: data.session?.user ?? null, status: data.session ? 'signed-in' : 'signed-out' })
    })
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      set({ session, user: session?.user ?? null, status: session ? 'signed-in' : 'signed-out', ...(event === 'PASSWORD_RECOVERY' ? { recovering: true } : {}) })
    })
    return () => data.subscription.unsubscribe()
  },

  setSync: (patch) => set(patch),

  signOut: async () => {
    await supabase?.auth.signOut()
    set({ sync: 'idle', conflict: null, lastSyncedAt: null })
  },
}))

/** Nombre para mostrar del usuario conectado. */
export function displayName(user: User | null): string {
  if (!user) return ''
  const meta = user.user_metadata as { name?: string; full_name?: string } | undefined
  return meta?.name || meta?.full_name || user.email?.split('@')[0] || ''
}
