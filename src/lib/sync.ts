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
// La base de datos acepta como mucho una actualización por segundo y usuario (ver migración 0002).
const PUSH_DELAY = 2000

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
/** Tras cerrar sesión o borrar la cuenta no se sube ni se baja nada más (el dispositivo se está limpiando). */
let paused = false
let timer: ReturnType<typeof setTimeout> | null = null

/** Detiene la sincronización para siempre en esta carga de la página (se usa justo antes de limpiar el dispositivo). */
export function pauseSync(): void {
  paused = true
  if (timer) clearTimeout(timer)
  timer = null
}

async function pull(userId: string): Promise<{ snapshot: unknown; updatedAt: string } | null> {
  const { data, error } = await supabase!.from('user_state').select('snapshot, updated_at').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data ? { snapshot: data.snapshot, updatedAt: data.updated_at as string } : null
}

async function push(userId: string): Promise<void> {
  const auth = useAuth.getState()
  if (paused || auth.conflict) return
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
  // Con el progreso ya bajado de la nube, el ranking recibe el resumen de este dispositivo.
  void publishStats()
}

/** Compara la copia local con la de la nube y decide qué hacer. */
export async function reconcile(userId: string): Promise<void> {
  if (paused) return
  const auth = useAuth.getState()
  auth.setSync({ sync: 'syncing' })
  try {
    const meta = readMeta()
    const remote = await pull(userId)
    const sameAccount = meta?.userId === userId
    if (!remote) return await push(userId)
    if (sameAccount && meta.lastSyncedAt === remote.updatedAt) {
      if (meta.dirty) await push(userId)
      else {
        auth.setSync({ sync: 'synced', lastSyncedAt: remote.updatedAt })
        void publishStats()
      }
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

/**
 * Sube lo que esté pendiente y dice si ya no queda nada sin guardar en la nube.
 * Se usa antes de cerrar sesión: si devuelve false, cerrar sesión borraría progreso que solo está en este dispositivo.
 */
export async function flushPending(): Promise<boolean> {
  const { user } = useAuth.getState()
  if (!supabase || !user) return true
  if (timer) clearTimeout(timer)
  timer = null
  // Si justo se está subiendo, espera a que termine (máximo unos segundos).
  for (let i = 0; i < 60 && useAuth.getState().sync === 'syncing'; i++) await new Promise((r) => setTimeout(r, 100))
  if (useAuth.getState().conflict) return false
  if (readMeta()?.dirty) await push(user.id)
  const saved = !readMeta()?.dirty && !useAuth.getState().conflict
  // Que el ranking quede al día antes de limpiar el dispositivo (un envío diferido se perdería).
  if (saved) await publishStats(true)
  return saved
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
    if (applying || paused || !current) return
    const meta = readMeta()
    writeMeta({ userId: current, lastSyncedAt: meta?.userId === current ? meta.lastSyncedAt : null, dirty: true })
    if (timer) clearTimeout(timer)
    const id = current
    timer = setTimeout(() => void push(id), PUSH_DELAY)
  })

  /** Sube ya lo que esté pendiente (sin esperar al temporizador). */
  const flush = () => {
    if (!current || paused) return
    if (timer && readMeta()?.dirty) {
      clearTimeout(timer)
      timer = null
      void push(current)
    }
  }

  const onVisible = () => {
    if (!current || paused) return
    if (document.visibilityState === 'hidden') flush()
    else if (!readMeta()?.dirty) void reconcile(current)
  }
  document.addEventListener('visibilitychange', onVisible)
  // Al cerrar la pestaña o salir de la página también se sube lo pendiente.
  window.addEventListener('pagehide', flush)

  return () => {
    unsubAuth()
    unsubProgress()
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('pagehide', flush)
  }
}
