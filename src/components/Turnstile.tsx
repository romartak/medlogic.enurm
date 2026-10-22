import { useEffect, useRef } from 'react'
import { useProgress } from '@/store/progress'

/**
 * Verificación anti-bots de Cloudflare Turnstile (gratis, casi siempre invisible para personas).
 * Se activa solo si existe VITE_TURNSTILE_SITE_KEY y la clave secreta está puesta en
 * Supabase → Authentication → Bot and Abuse Protection (ver docs/DESPLIEGUE.md).
 */
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY
export const captchaEnabled = Boolean(SITE_KEY)

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  remove: (id: string) => void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let loader: Promise<TurnstileApi> | null = null
function loadTurnstile(): Promise<TurnstileApi> {
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')))
    s.onerror = () => {
      loader = null
      reject(new Error('turnstile'))
    }
    document.head.appendChild(s)
  })
  return loader
}

/** Widget de verificación. Cambia `round` para pedir un token nuevo (cada token sirve una sola vez). */
export function Turnstile({ onToken, round }: { onToken: (token: string) => void; round: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const theme = useProgress((s) => s.settings.theme)
  const cb = useRef(onToken)
  cb.current = onToken

  useEffect(() => {
    if (!SITE_KEY) return
    let id: string | null = null
    let api: TurnstileApi | null = null
    let alive = true
    loadTurnstile()
      .then((t) => {
        if (!alive || !ref.current) return
        api = t
        id = t.render(ref.current, {
          sitekey: SITE_KEY,
          language: 'es',
          theme: theme === 'system' ? 'auto' : theme,
          size: 'flexible',
          callback: (token: string) => cb.current(token),
          'expired-callback': () => cb.current(''),
          'error-callback': () => cb.current(''),
        })
      })
      .catch(() => cb.current(''))
    return () => {
      alive = false
      if (api && id) api.remove(id)
    }
  }, [round, theme])

  if (!SITE_KEY) return null
  return <div ref={ref} className="min-h-[65px]" />
}
