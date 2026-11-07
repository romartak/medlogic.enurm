import { useEffect, useState } from 'react'

const KEY = 'medlogic-offline'

export interface OfflineSaved {
  at: number
  files: number
  bytes: number
}

/** Registra el service worker (solo en producción) cuando la página ya terminó de cargar. */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {})
  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
}

export function readSaved(): OfflineSaved | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as OfflineSaved) : null
  } catch {
    return null
  }
}

function writeSaved(v: OfflineSaved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {
    /* sin almacenamiento: la descarga igual quedó en el caché del navegador */
  }
}

/** Peso de la descarga completa, para mostrarlo antes de empezar. */
export async function fetchPrecacheInfo(): Promise<{ bytes: number; files: number } | null> {
  try {
    const res = await fetch('/precache.json', { cache: 'no-store' })
    if (!res.ok) return null
    const j = (await res.json()) as { bytes: number; files: string[] }
    return { bytes: j.bytes, files: j.files.length }
  } catch {
    return null
  }
}

/** Pide al service worker guardar toda la app. Avisa del avance y resuelve cuando termina. */
export async function downloadForOffline(info: { bytes: number; files: number }, onProgress: (done: number, total: number) => void): Promise<{ failed: number }> {
  if (!('serviceWorker' in navigator)) throw new Error('Este navegador no permite guardar para usar sin conexión.')
  const reg = await navigator.serviceWorker.ready
  const worker = reg.active
  if (!worker) throw new Error('El modo sin conexión todavía no está listo. Recarga la página e inténtalo de nuevo.')
  return new Promise((resolve) => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; done?: number; total?: number; failed?: number }
      if (d.type === 'precache-progress') onProgress(d.done ?? 0, d.total ?? info.files)
      if (d.type === 'precache-done') {
        navigator.serviceWorker.removeEventListener('message', onMsg)
        const failed = d.failed ?? 0
        if (!failed) writeSaved({ at: Date.now(), files: info.files, bytes: info.bytes })
        resolve({ failed })
      }
    }
    navigator.serviceWorker.addEventListener('message', onMsg)
    worker.postMessage({ type: 'precache' })
  })
}

/** true mientras el navegador tenga conexión. */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

export const formatMB = (bytes: number) => `${(bytes / 1048576).toFixed(bytes < 10_485_760 ? 1 : 0)} MB`
