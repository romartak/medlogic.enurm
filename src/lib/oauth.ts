/**
 * Regreso del inicio de sesión con Google. Google devuelve a la dirección raíz con «?code=…» (sin el «#/» de las
 * rutas), así que sin ayuda la persona caería en la portada. Antes de salir se anota a dónde ir; al volver, la
 * app espera la sesión y la lleva allí.
 */
const KEY = 'medlogic-oauth'
/** Pasado este tiempo la anotación ya no vale (la persona tardó demasiado o abandonó el inicio de sesión). */
const MAX_AGE_MS = 10 * 60 * 1000
/** Una cuenta creada hace menos de esto se considera recién creada. */
const NEW_ACCOUNT_MS = 20 * 60 * 1000

export interface OAuthMark {
  to: string
}

/** Interpreta lo guardado: solo acepta rutas internas y anotaciones recientes. */
export function parseOAuthMark(raw: string | null, now = Date.now()): OAuthMark | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw) as { to?: unknown; t?: unknown }
    if (typeof v.to !== 'string' || typeof v.t !== 'number') return null
    if (now - v.t > MAX_AGE_MS || now < v.t - 1000) return null
    // Solo rutas de la propia app: nunca una dirección externa ni «//host».
    if (!v.to.startsWith('/') || v.to.startsWith('//')) return null
    return { to: v.to }
  } catch {
    return null
  }
}

/** Anota a dónde llevar a la persona al volver de Google (por defecto, el panel). */
export function markOAuthStart(to?: string): void {
  const dest = to && to.startsWith('/') && !to.startsWith('//') && to !== '/' && to !== '/cuenta' ? to : '/inicio'
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ to: dest, t: Date.now() }))
  } catch {
    /* almacenamiento no disponible: se vuelve al panel por defecto vía ?code= */
  }
}

export function readOAuthReturn(): OAuthMark | null {
  try {
    const mark = parseOAuthMark(sessionStorage.getItem(KEY))
    if (mark) return mark
  } catch {
    /* sin almacenamiento */
  }
  // Respaldo: venir con «?code=» en la raíz y sin ruta es, en la práctica, volver de Google o de un enlace de acceso.
  return typeof window !== 'undefined' && /[?&]code=/.test(window.location.search) && !window.location.hash.startsWith('#/') ? { to: '/inicio' } : null
}

export function clearOAuthReturn(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* sin almacenamiento */
  }
}

export function isNewAccount(createdAt: string | undefined, now = Date.now()): boolean {
  const t = createdAt ? Date.parse(createdAt) : NaN
  return Number.isFinite(t) && now - t < NEW_ACCOUNT_MS && now >= t - 60_000
}

/** Nombre y correo que Google entrega (lo único que tomamos de la cuenta de Google). */
export function googleIdentity(user: { email?: string; user_metadata?: Record<string, unknown> } | null): { full: string; first: string; email: string } {
  const meta = user?.user_metadata ?? {}
  const pick = (k: string) => (typeof meta[k] === 'string' ? (meta[k] as string).trim() : '')
  const full = (pick('full_name') || pick('name')).slice(0, 80)
  const first = (pick('given_name') || full.split(/\s+/)[0] || '').slice(0, 60)
  return { full, first, email: user?.email ?? '' }
}
