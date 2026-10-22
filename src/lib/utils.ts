/** Texto con el color de una categoría, mezclado con el color de texto para que se lea en ambos temas. */
export function tintText(color: string): { color: string } {
  return { color: `color-mix(in oklab, ${color} 55%, var(--text))` }
}

/** Fondo sólido con el color de una categoría, oscurecido para que el texto blanco tenga contraste. */
export function solidBg(color: string): { backgroundColor: string } {
  return { backgroundColor: `color-mix(in oklab, ${color} 72%, black)` }
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Fisher–Yates; devuelve una copia. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

/** Fecha local en formato YYYY-MM-DD. */
export function dayKey(d: Date | number = new Date()): string {
  const date = typeof d === 'number' ? new Date(d) : d
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function daysBetween(a: Date, b: Date): number {
  const ms = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime() - new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  return Math.round(ms / 86_400_000)
}

export function pct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function formatDuration(totalSec: number): string {
  const m = Math.round(totalSec / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  return `${h} h ${m % 60} min`
}

export function formatDate(ts: number | string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  return new Date(ts).toLocaleDateString('es-DO', opts)
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Hash corto y estable (FNV-1a) para generar ids a partir de texto. */
export function hashString(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function downloadFile(name: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function plural(n: number, one: string, many: string): string {
  return `${n.toLocaleString('es-DO')} ${n === 1 ? one : many}`
}

const VOWEL = /[aeiouáéíóúü]/i
const INSEPARABLE = new Set(['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'kl', 'kr', 'pl', 'pr', 'tr', 'ch', 'll', 'rr', 'qu', 'gu'])

/**
 * Inserta guiones suaves (U+00AD) entre sílabas de las palabras largas, con las reglas básicas del
 * español, para que el navegador las corte con guion en cajas estrechas aunque no tenga diccionario.
 */
export function softHyphens(text: string, minLength = 9): string {
  return text.replace(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g, (w) => {
    if (w.length < minLength) return w
    let out = ''
    let last = 0
    for (let i = 2; i < w.length - 2; i++) {
      const a = w[i - 1]
      const b = w[i]
      const c = w[i + 1]
      let cut = -1
      // V-CV: pa-ra
      if (VOWEL.test(a) && !VOWEL.test(b) && VOWEL.test(c)) cut = i
      // V-CCV con grupo inseparable: ta-blo
      else if (VOWEL.test(a) && INSEPARABLE.has((b + c).toLowerCase()) && VOWEL.test(w[i + 2] ?? '')) cut = i
      // VC-CV: ben-zo (salvo grupos inseparables: ca-bra)
      else if (!VOWEL.test(a) && !VOWEL.test(b) && VOWEL.test(w[i - 2]) && VOWEL.test(c) && !INSEPARABLE.has((a + b).toLowerCase())) cut = i
      if (cut > 0 && cut - last >= 2 && w.length - cut >= 3) {
        out += w.slice(last, cut) + '­'
        last = cut
      }
    }
    return out + w.slice(last)
  })
}

/** «Dra. Pérez», «doctor», «Ana» o '' según el trato elegido y el nombre opcional. */
export function addressName(s: { name: string; honorific?: 'dr' | 'dra' | 'none' | null }): string {
  const name = s.name.trim()
  if (s.honorific === 'dr') return name ? `Dr. ${name}` : 'doctor'
  if (s.honorific === 'dra') return name ? `Dra. ${name}` : 'doctora'
  return name
}

/** «30 min», «1 h», «1 h 30 min». */
export function formatMinutes(t: number): string {
  const h = Math.floor(t / 60)
  const m = Math.round(t % 60)
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`
}

/** Solo deja pasar enlaces http(s): evita «javascript:» y similares en datos importados. */
export function safeUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : undefined
  } catch {
    return undefined
  }
}

/**
 * Copia de `data` solo con las claves de `initial` y con el mismo tipo (lista, objeto, número…).
 * Protege al importar respaldos o copias de la nube: un archivo dañado o manipulado no puede
 * meter claves extrañas ni romper la app con tipos inesperados.
 */
export function pickKnown<T extends object>(initial: T, data: unknown): Partial<T> {
  const out: Partial<T> = {}
  if (!data || typeof data !== 'object' || Array.isArray(data)) return out
  const src = data as Record<string, unknown>
  const kind = (v: unknown) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v)
  for (const k of Object.keys(initial) as (keyof T & string)[]) {
    if (!Object.prototype.hasOwnProperty.call(src, k)) continue
    const want = kind(initial[k])
    const got = kind(src[k])
    // null en el estado inicial significa «vacío»: acepta null u objeto/texto/número.
    if (got === want || (want === 'null' && got !== 'array' && got !== 'undefined')) (out as Record<string, unknown>)[k] = src[k]
  }
  return out
}
