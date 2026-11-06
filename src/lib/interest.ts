import { ALL_NAV } from '@/components/layout/nav'
import { getSpecialty } from '@/data/specialties'
import { GUIDES } from '@/data/guides'
import type { SpecialtyStat } from '@/lib/stats'

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

/** El tema concreto de una ruta: `esp:<id>` para una especialidad o `guia:<id>` para una guía. */
export function topicOf(pathname: string): string | null {
  const m = /^\/(especialidades|guias)\/([^/]+)/.exec(pathname)
  if (!m) return null
  return `${m[1] === 'guias' ? 'guia' : 'esp'}:${decodeURIComponent(m[2])}`
}

/** Nombre legible de un tema. */
export function topicLabel(key: string): string {
  const [kind, id] = key.split(':')
  if (kind === 'esp') return getSpecialty(id).name
  return GUIDES.find((g) => g.id === id)?.title ?? id
}

/** A dónde llevar a quien le interesa un tema: practicar la especialidad o abrir la guía. */
const topicLink = (key: string) => (key.startsWith('esp:') ? `/practica?specialty=${key.slice(4)}` : `/guias/${key.slice(5)}`)

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

const PERIODS: [number, string][] = [
  [5, 'madrugada'],
  [12, 'mañana'],
  [19, 'tarde'],
  [24, 'noche'],
]

/** «8 p. m.», «12 a. m.»… */
export function formatHour(h: number): string {
  const x = ((h % 24) + 24) % 24
  return `${x % 12 === 0 ? 12 : x % 12} ${x < 12 ? 'a. m.' : 'p. m.'}`
}

export interface HourProfile {
  /** Hora de inicio de la ventana de dos horas con más estudio. */
  start: number
  /** Parte del tiempo total que cae en esa ventana, de 0 a 1. */
  share: number
  period: string
}

/** La ventana de dos horas en que más estudia, o null si hay menos de 15 minutos de datos. */
export function hourProfile(hours: number[]): HourProfile | null {
  const total = hours.reduce((a, b) => a + b, 0)
  if (total < 15 * 60_000) return null
  let best = 0
  let bestMs = -1
  for (let h = 0; h < 24; h++) {
    const ms = hours[h] + hours[(h + 1) % 24]
    if (ms > bestMs) {
      bestMs = ms
      best = h
    }
  }
  return { start: best, share: bestMs / total, period: PERIODS.find(([end]) => best < end)![1] }
}

/** Datos extra, ya calculados fuera, que afinan las sugerencias. */
export interface InsightContext {
  topics?: UsageMap
  hours?: number[]
  events?: Record<string, { n: number; last: number }>
  sessions?: { count: number; ms: number }
  /** Rendimiento por especialidad (de `specialtyStats`). */
  stats?: SpecialtyStat[]
  /** ¿Ya tiene un recordatorio diario configurado? */
  hasReminder?: boolean
}

/**
 * Reglas (sin IA) que convierten el comportamiento en sugerencias, de más a menos importante:
 *  1. Su punto débil (por aciertos) frente a lo que más estudia.
 *  2. Marca preguntas pero no entra a Repaso.
 *  3. El tema que más le interesa (especialidad o guía).
 *  4. Dónde pasa más tiempo, comparado con la segunda sección.
 *  5. Dedica mucho a leer y repasar y casi nada a medirse.
 *  6. Estudia siempre a la misma hora y no tiene recordatorio.
 *  7. Sesiones muy cortas → flashcards.
 *  8. Secciones centrales que nunca ha abierto.
 */
export function buildInsights(usage: UsageMap, now = Date.now(), ctx: InsightContext = {}): Insight[] {
  const used = Object.entries(usage).filter(([to]) => !IGNORED.has(to))
  const totalMin = used.reduce((a, [, u]) => a + u.ms / 60_000, 0)
  if (totalMin < MIN_TOTAL_MIN) return []

  const out: Insight[] = []
  const minOf = (to: string) => (usage[to]?.ms ?? 0) / 60_000
  const [top, second] = topInterests(usage, 2, now)
  const topTopic = Object.entries(ctx.topics ?? {})
    .map(([key, u]) => ({ key, u, score: interestScore(u, now) }))
    .sort((a, b) => b.score - a.score)[0]

  // 1. Punto débil.
  const weak = (ctx.stats ?? []).filter((s) => s.answered >= 10 && s.accuracy < 0.6).sort((a, b) => a.accuracy - b.accuracy)[0]
  if (weak) {
    const name = getSpecialty(weak.specialty).name
    const favorite = topTopic?.key.startsWith('esp:') && topTopic.u.ms >= 2 * 60_000 ? topTopic.key.slice(4) : null
    const contrast = favorite && favorite !== weak.specialty ? ` Pasas más tiempo en ${getSpecialty(favorite).name}.` : ''
    out.push({ id: 'weak', text: `Tu punto débil es ${name}: ${Math.round(weak.accuracy * 100)} % de aciertos.${contrast}`, action: `Practicar ${name}`, to: `/practica?specialty=${weak.specialty}` })
  }

  // 2. Marca preguntas pero no las repasa.
  const marked = ctx.events?.marcar?.n ?? 0
  if (marked >= 5 && !(usage['/repaso']?.visits > 0)) {
    out.push({ id: 'marked', text: `Has marcado ${marked} veces preguntas para repasar, pero no has entrado a Repaso.`, action: 'Abrir Repaso', to: '/repaso' })
  }

  // 3. Tema favorito.
  if (topTopic && topTopic.u.ms >= 3 * 60_000 && !(weak && topTopic.key === `esp:${weak.specialty}`)) {
    const label = topicLabel(topTopic.key)
    const min = Math.round(topTopic.u.ms / 60_000)
    out.push({ id: 'topic', text: `Te interesa ${label} (${min} min).`, action: topTopic.key.startsWith('esp:') ? 'Practicar sus preguntas' : 'Seguir leyendo', to: topicLink(topTopic.key) })
  }

  // 4. Sección con más tiempo.
  if (top && top.minutes >= 2) {
    const versus = second && second.minutes >= 1 && top.minutes >= second.minutes * 1.5 ? `, bastante más que en ${second.label} (${second.minutes} min)` : ''
    out.push({ id: 'top', text: `Es donde más tiempo pasas: ${top.label}, ${top.minutes} min${versus}.`, action: `Seguir en ${top.label}`, to: top.to })
  }

  // 5. Lee mucho, se mide poco.
  const reading = minOf('/guias') + minOf('/flashcards') + minOf('/terminologia')
  const testing = minOf('/practica') + minOf('/simulacro')
  if (reading >= 10 && testing < reading * 0.25) {
    out.push({ id: 'test-yourself', text: 'Dedicas mucho tiempo a leer y repasar, pero casi nada a medirte. Las preguntas fijan lo estudiado.', action: 'Hacer práctica', to: '/practica' })
  }

  // 6. Hora fija de estudio sin recordatorio.
  const hp = ctx.hours ? hourProfile(ctx.hours) : null
  if (hp && hp.share >= 0.4 && ctx.hasReminder === false) {
    out.push({ id: 'hour', text: `Estudias sobre todo por la ${hp.period}, de ${formatHour(hp.start)} a ${formatHour(hp.start + 2)}. Un recordatorio a esa hora te ayuda a mantener la costumbre.`, action: 'Poner recordatorio', to: '/ajustes' })
  }

  // 7. Sesiones muy cortas.
  const s = ctx.sessions
  if (s && s.count >= 5) {
    const avg = s.ms / 60_000 / s.count
    if (avg < 5) out.push({ id: 'short', text: `Tus sesiones duran ${Math.max(1, Math.round(avg))} min en promedio. Para ratos cortos, las flashcards rinden bien.`, action: 'Ir a flashcards', to: '/flashcards' })
  }

  // 8. Secciones centrales sin abrir.
  const untouched = CORE.filter((to) => (!usage[to] || usage[to].visits === 0) && !out.some((i) => i.to === to))
  if (untouched.length) {
    const to = untouched[0]
    out.push({ id: `try-${to}`, text: `Todavía no has probado ${labelOf(to)}.`, action: `Probar ${labelOf(to)}`, to })
  }

  return out.slice(0, 4)
}

/** Formatea minutos para mostrar: «45 min», «2 h 10 min». */
export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} h ${m} min` : `${h} h`
}
