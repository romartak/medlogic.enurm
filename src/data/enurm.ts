/**
 * Calendario del ENURM (Examen Nacional Único de Residencias Médicas, República Dominicana).
 *
 * El examen lo aplica la Facultad de Ciencias de la Salud de la UASD el primer domingo de marzo.
 * Fechas verificadas en prensa y en avisos del Ministerio de Salud Pública (ver `source`).
 * Para un año sin fecha confirmada se proyecta el primer domingo de marzo; al publicarse la
 * convocatoria oficial basta con añadir el año a CONFIRMED.
 */
export interface EnurmDate {
  year: number
  /** ISO yyyy-mm-dd. */
  iso: string
  date: Date
  /** true si la fecha está publicada; false si es la proyección del primer domingo de marzo. */
  confirmed: boolean
  source?: string
}

const CONFIRMED: Record<number, { iso: string; source: string }> = {
  2018: { iso: '2018-03-04', source: 'https://eldia.com.do/uasd-imparte-examen-nacional-unico-a-aspirantes-a-residencias-medicas-redoblan-seguridad/' },
  2019: { iso: '2019-03-03', source: 'https://acento.com.do/actualidad/este-domingo-examen-nacional-unico-residencias-medicas-la-uasd-8656643.html' },
  2024: { iso: '2024-03-03', source: 'https://eldia.com.do/uasd-imparte-examen-residencias-medicas-a-5810-profesionales/' },
  2025: { iso: '2025-03-02', source: 'https://acento.com.do/actualidad/ministerio-de-salud-convoca-al-concurso-de-residencias-medicas-2025-9500616.html' },
  2026: { iso: '2026-03-01', source: 'https://psrm.msp.gob.do/assets/Aviso_Concurso_2026_REQUISITO.pdf' },
}

/** Datos del examen y del concurso, con su fuente. */
export const ENURM_FACTS = {
  rule: 'Primer domingo de marzo',
  organizer: 'Facultad de Ciencias de la Salud, UASD',
  questions: 100,
  minutes: 120,
  /** Puntaje mínimo para concursar por una plaza de especialidad. */
  minScore: 60,
  /** Años que vale la calificación. */
  validYears: 2,
  official: 'https://psrm.msp.gob.do/',
} as const

const pad = (n: number) => String(n).padStart(2, '0')

function firstSundayOfMarch(year: number): Date {
  const d = new Date(year, 2, 1, 8)
  d.setDate(1 + ((7 - d.getDay()) % 7))
  return d
}

export function enurmDate(year: number): EnurmDate {
  const c = CONFIRMED[year]
  if (c) {
    const [y, m, d] = c.iso.split('-').map(Number)
    return { year, iso: c.iso, date: new Date(y, m - 1, d, 8), confirmed: true, source: c.source }
  }
  const date = firstSundayOfMarch(year)
  return { year, iso: `${year}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, date, confirmed: false }
}

/** Próximas convocatorias, empezando por la primera cuyo día de examen no ha pasado. */
export function upcomingEnurm(count = 3, now = new Date()): EnurmDate[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let year = now.getFullYear()
  if (enurmDate(year).date < today) year++
  return Array.from({ length: count }, (_, i) => enurmDate(year + i))
}

export function formatEnurmDate(d: EnurmDate, opts: { weekday?: boolean } = {}): string {
  return d.date.toLocaleDateString('es-DO', { weekday: opts.weekday ? 'long' : undefined, day: 'numeric', month: 'long', year: 'numeric' })
}
