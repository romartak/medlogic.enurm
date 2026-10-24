import { supabase } from './supabase'
import { hasLocalProgress, MAX_SNAPSHOT_BYTES, onProgressChange, restoreSnapshot, takeSnapshot } from './backup'
import { useAuth } from '@/store/auth'
import { publishStats } from './ranking'

/**
 * Sincronización del progreso con Supabase (tabla public.user_state, una fila por usuario).
 * Estrategia: la última copia gana, con detección de conflicto la primera vez que una cuenta
 * se conecta en un dispositivo que ya tiene progreso propio.
 */
const META_KEY = 'medlogic-sync'
const PUSH_DELAY = 4000

interface SyncMeta {
  userId: string
  /** updated_at de la última copia que este dispositivo subió o descargó. */
  lastSyncedAt: string | null
  /** Hay cambios locales sin subir. */
  dirty: boolean
}

function readMeta(): SyncMeta | null {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) ?? 'null')
  } catch {
    return null
  }
}

function writeMeta(meta: SyncMeta | null) {
  try {
    if (meta) localStorage.setItem(META_KEY, JSON.stringify(meta))
    else localStorage.removeItem(META_KEY)
  } catch {
    /* almacenamiento no disponible */
  }
}

let applying = false
let timer: ReturnType<typeof setTimeout> | null = null

async function pull(userId: string): Promise<{ snapshot: unknown; updatedAt: string } | null> {
  const { data, error } = await supabase!.from('user_state').select('snapshot, updated_at').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data ? { snapshot: data.snapshot, updatedAt: data.updated_at as string } : null
}

async function push(userId: string): Promise<void> {
  const auth = useAuth.getState()
  if (auth.conflict) return
  const snapshot = takeSnapshot()
  // Mismo límite que la base de datos: evita subir copias enormes (p. ej. mazos con muchas imágenes).
  if (new Blob([JSON.stringify(snapshot)]).size > MAX_SNAPSHOT_BYTES) return auth.setSync({ sync: 'error' })
  auth.setSync({ sync: 'syncing' })
  try {
    const { data, error } = await supabase!.from('user_state').upsert({ user_id: userId, snapshot }).select('updated_at').single()
    if (error) throw error
    writeMeta({ userId, lastSyncedAt: data.updated_at as string, dirty: false })
    useAuth.getState().setSync({ sync: 'synced', lastSyncedAt: data.updated_at as string })
    // El resumen público del ranking viaja con cada sincronización (con su propio límite de frecuencia).
    void publishStats()
  } catch {
    useAuth.getState().setSync({ sync: navigator.onLine ? 'error' : 'offline' })
  }
}

function apply(userId: string, remote: { snapshot: unknown; updatedAt: string }) {
  applying = true
  try {
    restoreSnapshot(remote.snapshot)
  } finally {
    applying = false
  }
  writeMeta({ userId, lastSyncedAt: remote.updatedAt, dirty: false })
  useAuth.getState().setSync({ sync: 'synced', lastSyncedAt: remote.updatedAt, conflict: null })
}

/** Compara la copia local con la de la nube y decide qué hacer. */
export async function reconcile(userId: string): Promise<void> {
  const auth = useAuth.getState()
  auth.setSync({ sync: 'syncing' })
  try {
    const meta = readMeta()
    const remote = await pull(userId)
    const sameAccount = meta?.userId === userId
    if (!remote) return await push(userId)
    if (sameAccount && meta.lastSyncedAt === remote.updatedAt) {
      if (meta.dirty) await push(userId)
      else auth.setSync({ sync: 'synced', lastSyncedAt: remote.updatedAt })
      return
    }
    if ((sameAccount && !meta.dirty) || !hasLocalProgress()) return apply(userId, remote)
    auth.setSync({ sync: 'conflict', conflict: { remote: remote.snapshot, updatedAt: remote.updatedAt } })
  } catch {
    auth.setSync({ sync: navigator.onLine ? 'error' : 'offline' })
  }
}

/** Resuelve un conflicto quedándose con la copia de la nube o con la de este dispositivo. */
export async function resolveConflict(keep: 'cloud' | 'device'): Promise<void> {
  const { user, conflict, setSync } = useAuth.getState()
  if (!user || !conflict) return
  if (keep === 'cloud') return apply(user.id, { snapshot: conflict.remote, updatedAt: conflict.updatedAt })
  setSync({ conflict: null })
  await push(user.id)
}

export function syncNow(): Promise<void> {
  const user = useAuth.getState().user
  return user ? reconcile(user.id) : Promise.resolve()
}

/** Arranca la sincronización: al iniciar sesión, al cambiar el progreso y al volver a la pestaña. */
export function startSync(): () => void {
  if (!supabase) return () => {}
  let current: string | null = null

  const unsubAuth = useAuth.subscribe((s) => {
    const id = s.status === 'signed-in' ? (s.user?.id ?? null) : null
    if (id === current) return
    current = id
    if (id) void reconcile(id)
    else writeMeta(null)
  })

  const unsubProgress = onProgressChange(() => {
    if (applying || !current) return
    const meta = readMeta()
    writeMeta({ userId: current, lastSyncedAt: meta?.userId === current ? meta.lastSyncedAt : null, dirty: true })
    if (timer) clearTimeout(timer)
    const id = current
    timer = setTimeout(() => void push(id), PUSH_DELAY)
  })

  const onVisible = () => {
    if (!current) return
    if (document.visibilityState === 'hidden') {
      if (timer && readMeta()?.dirty) {
        clearTimeout(timer)
        void push(current)
      }
    } else if (!readMeta()?.dirty) void reconcile(current)
  }
  document.addEventListener('visibilitychange', onVisible)

  return () => {
    unsubAuth()
    unsubProgress()
    document.removeEventListener('visibilitychange', onVisible)
  }
}
