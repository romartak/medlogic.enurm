import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase. Se activa solo si están definidas VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
 * (ver .env.example y docs/DESPLIEGUE.md). Sin ellas la app funciona igual, con el progreso guardado
 * solo en el navegador.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          // PKCE devuelve ?code= en la URL, compatible con el enrutado por # de la app.
          flowType: 'pkce',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'medlogic-auth',
        },
      })
    : null

export const isSupabaseConfigured = supabase !== null

/** URL a la que Supabase devuelve al usuario tras confirmar el correo, Google o recuperar la contraseña. */
export function authRedirectUrl(): string {
  return `${window.location.origin}${window.location.pathname}`
}

/** Mensajes de error de Supabase Auth en español. */
export function authErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err ?? '')
  const map: [RegExp, string][] = [
    [/invalid login credentials/i, 'Correo o contraseña incorrectos.'],
    [/email not confirmed/i, 'Confirma tu correo: te enviamos un enlace al registrarte.'],
    [/user already registered/i, 'Ya existe una cuenta con ese correo. Inicia sesión.'],
    [/password should be at least/i, 'La contraseña debe tener al menos 8 caracteres.'],
    [/rate limit|too many requests/i, 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.'],
    [/unable to validate email|invalid email/i, 'Escribe un correo válido.'],
    [/provider is not enabled/i, 'Ese método de acceso aún no está activado.'],
    [/failed to fetch|network/i, 'Sin conexión con el servidor. Revisa tu internet.'],
    [/same password|different from the old/i, 'La nueva contraseña debe ser distinta de la anterior.'],
  ]
  return map.find(([re]) => re.test(msg))?.[1] ?? 'Algo salió mal. Inténtalo de nuevo.'
}
