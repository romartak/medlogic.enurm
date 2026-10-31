interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Nombres que crea la integración de Supabase en Vercel (Marketplace). */
  readonly NEXT_PUBLIC_SUPABASE_URL?: string
  readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
  /** Clave pública (site key) de Cloudflare Turnstile, para frenar registros de bots. */
  readonly VITE_TURNSTILE_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** true cuando la app se compila en Vercel. */
declare const __VERCEL__: boolean

/** Lo activa public/theme-init.js en el navegador integrado de redes sociales (ver inapp-gate.js). */
interface Window {
  __inappGate?: boolean
}
