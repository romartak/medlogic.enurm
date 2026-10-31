import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

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
  status: isSupabaseConfigured ? 'loading' : 'disabled',
  user: null,
  session: null,
  recovering: false,
  sync: 'idle',
  lastSyncedAt: null,
  conflict: null,

  init: () => {
    if (!isSupabaseConfigured) return () => {}
    let stop = () => {}
    let stopped = false
    const start = () => {
      if (stopped || started) return
      started = true
      connect()
    }
    const connect = () => void getSupabase().then((supabase) => {
      if (!supabase || stopped) return
      // Primero la suscripción: así no se pierde el evento PASSWORD_RECOVERY de un enlace recién abierto.
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        set({ session, user: session?.user ?? null, status: session ? 'signed-in' : 'signed-out', ...(event === 'PASSWORD_RECOVERY' ? { recovering: true } : {}) })
      })
      stop = () => data.subscription.unsubscribe()
      void supabase.auth.getSession().then(({ data }) => {
        if (stopped) return
        set({ session: data.session, user: data.session?.user ?? null, status: data.session ? 'signed-in' : 'signed-out' })
      })
    })
    let started = false
    let cancelWait = () => {}
    // En la portada nadie necesita la sesión para leer: se espera a que termine de pintar (o al primer toque)
    // para no competir con ella por la red del celular. Un enlace de confirmación o de Google arranca ya.
    const authLink = /[?&#](code|access_token|error_description)=|type=recovery/.test(window.location.href)
    const onLanding = window.location.hash === '' || window.location.hash === '#/'
    if (authLink || !onLanding) start()
    else {
      const events = ['pointerdown', 'keydown'] as const
      const cancel = () => {
        events.forEach((e) => window.removeEventListener(e, go))
        clearTimeout(timer)
      }
      const go = () => {
        cancel()
        start()
      }
      const timer = setTimeout(go, 3000)
      events.forEach((e) => window.addEventListener(e, go, { passive: true }))
      cancelWait = cancel
    }
    return () => {
      stopped = true
      cancelWait()
      stop()
    }
  },

  setSync: (patch) => set(patch),

  signOut: async () => {
    await (await getSupabase())?.auth.signOut()
    set({ sync: 'idle', conflict: null, lastSyncedAt: null })
  },
}))

/** Nombre para mostrar del usuario conectado. */
export function displayName(user: User | null): string {
  if (!user) return ''
  const meta = user.user_metadata as { name?: string; full_name?: string } | undefined
  return meta?.name || meta?.full_name || user.email?.split('@')[0] || ''
}
