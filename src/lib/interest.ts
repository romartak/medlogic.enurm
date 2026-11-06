import { ALL_NAV } from '@/components/layout/nav'

/** Tiempo y visitas acumulados en una sección de la plataforma. */
export interface SectionUsage {
  /** Milisegundos de uso activo (pestaña visible y con actividad reciente). */
  ms: number
  visits: number
  /** Última vez que se estuvo en la sección (ms desde 1970). */
  last: number
}

export type UsageMap = Record<string, SectionUsage>

/** Secciones que no cuentan como «interés» (paneles, ajustes y páginas informativas). */
const IGNORED = new Set(['/inicio', '/ajustes', '/cuenta', '/roadmap', '/actualizaciones', '/estadisticas', '/logros', '/ranking', '/ia'])

/** Secciones de estudio que vale la pena sugerir cuando la persona aún no las ha probado, por orden de valor. */
const CORE = ['/practica', '/simulacro', '/casos', '/flashcards', '/terminologia', '/guias', '/repaso']

/** La sección del menú a la que pertenece una ruta, o null si no cuenta (ajustes, inicio…). */
export function sectionOf(pathname: string): string | null {
  const hit = ALL_NAV.filter((n) => pathname === n.to || pathname.startsWith(`${n.to}/`)).sort((a, b) => b.to.length - a.to.length)[0]
  return hit && !IGNORED.has(hit.to) ? hit.to : null
}

const labelOf = (to: string) => ALL_NAV.find((n) => n.to === to)?.label ?? to

/** El interés pierde la mitad de su peso cada 14 días sin volver: lo reciente manda. */
const HALF_LIFE_DAYS = 14
const DAY_MS = 86_400_000

/** Puntaje de una sección: minutos de uso + medio punto por visita, con desvanecimiento por antigüedad. */
export function interestScore(u: SectionUsage, now = Date.now()): number {
  const age = Math.max(0, now - u.last) / DAY_MS
  return (u.ms / 60_000 + u.visits * 0.5) * Math.pow(0.5, age / HALF_LIFE_DAYS)
}

export interface Interest {
  to: string
  label: string
  minutes: number
  visits: number
  /** Parte del interés total, de 0 a 1. */
  share: number
}

/** Las secciones que más le interesan a la persona, de mayor a menor. */
export function topInterests(usage: UsageMap, n = 3, now = Date.now()): Interest[] {
  const scored = Object.entries(usage)
    .filter(([to]) => !IGNORED.has(to))
    .map(([to, u]) => ({ to, u, score: interestScore(u, now) }))
    .filter((x) => x.score > 0.05)
  const total = scored.reduce((a, x) => a + x.score, 0)
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(({ to, u, score }) => ({ to, label: labelOf(to), minutes: Math.round(u.ms / 60_000), visits: u.visits, share: total ? score / total : 0 }))
}

export interface Insight {
  id: string
  text: string
  /** Texto del botón y destino. */
  action: string
  to: string
}

/** Minutos totales de uso en secciones que cuentan; con menos de esto todavía no se saca ninguna conclusión. */
const MIN_TOTAL_MIN = 5

/**
 * Reglas (sin IA) que convierten el comportamiento en sugerencias:
 *  1. Dónde pasa más tiempo → ofrecer seguir ahí.
 *  2. Si dedica mucho a leer/repasar y casi nada a medirse → proponer un simulacro o práctica.
 *  3. Secciones centrales que nunca ha abierto → proponer la más valiosa.
 */
export function buildInsights(usage: UsageMap, now = Date.now()): Insight[] {
  const used = Object.entries(usage).filter(([to]) => !IGNORED.has(to))
  const totalMin = used.reduce((a, [, u]) => a + u.ms / 60_000, 0)
  if (totalMin < MIN_TOTAL_MIN) return []

  const out: Insight[] = []
  const [top, second] = topInterests(usage, 2, now)
  if (top && top.minutes >= 2) {
    const versus = second && second.minutes >= 1 && top.minutes >= second.minutes * 1.5 ? `, bastante más que en ${second.label} (${second.minutes} min)` : ''
    out.push({ id: 'top', text: `Es donde más tiempo pasas: ${top.label}, ${top.minutes} min${versus}.`, action: `Seguir en ${top.label}`, to: top.to })
  }

  const minOf = (to: string) => (usage[to]?.ms ?? 0) / 60_000
  const reading = minOf('/guias') + minOf('/flashcards') + minOf('/terminologia')
  const testing = minOf('/practica') + minOf('/simulacro')
  if (reading >= 10 && testing < reading * 0.25) {
    out.push({ id: 'test-yourself', text: 'Dedicas mucho tiempo a leer y repasar, pero casi nada a medirte. Las preguntas fijan lo estudiado.', action: 'Hacer práctica', to: '/practica' })
  }

  const untouched = CORE.filter((to) => (!usage[to] || usage[to].visits === 0) && !out.some((i) => i.to === to))
  if (untouched.length) {
    const to = untouched[0]
    out.push({ id: `try-${to}`, text: `Todavía no has probado ${labelOf(to)}.`, action: `Probar ${labelOf(to)}`, to })
  }

  return out.slice(0, 3)
}

/** Formatea minutos para mostrar: «45 min», «2 h 10 min». */
export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} h ${m} min` : `${h} h`
}
