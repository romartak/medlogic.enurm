import type { Question } from '@/types'

export interface HotTopic {
  topic: string
  specialty: string
  /** Preguntas de este tema que salieron en cada año. */
  byYear: Record<number, number>
  /** Apariciones en total (una pregunta repetida en 3 años cuenta 3). */
  total: number
  /** En cuántos años distintos salió algo de este tema. */
  yearsHit: number
  /** En cuántos de los últimos `window` años salió. */
  recentYears: number
  /** Preguntas distintas del banco con este tema. */
  questions: number
}

/** Ventana «reciente»: los últimos 10 años con datos. */
export const RECENT_WINDOW = 10

/** Años con alguna aparición, de menor a mayor. */
export function examYears(questions: Question[]): number[] {
  const set = new Set<number>()
  for (const q of questions) for (const y of q.years ?? []) set.add(y)
  return [...set].sort((a, b) => a - b)
}

/** Temas ordenados por constancia reciente y luego por apariciones totales. */
export function hotTopics(questions: Question[], specialty?: string): HotTopic[] {
  const years = examYears(questions)
  const last = years[years.length - 1] ?? 0
  const map = new Map<string, HotTopic>()
  for (const q of questions) {
    if (!q.topic || !q.years?.length) continue
    if (specialty && q.specialty !== specialty) continue
    const key = `${q.specialty}::${q.topic}`
    let t = map.get(key)
    if (!t) {
      t = { topic: q.topic, specialty: q.specialty, byYear: {}, total: 0, yearsHit: 0, recentYears: 0, questions: 0 }
      map.set(key, t)
    }
    t.questions++
    for (const y of q.years) {
      t.byYear[y] = (t.byYear[y] ?? 0) + 1
      t.total++
    }
  }
  for (const t of map.values()) {
    const ys = Object.keys(t.byYear).map(Number)
    t.yearsHit = ys.length
    t.recentYears = ys.filter((y) => y > last - RECENT_WINDOW).length
  }
  return [...map.values()].sort((a, b) => b.recentYears - a.recentYears || b.total - a.total || a.topic.localeCompare(b.topic, 'es'))
}

/** Especialidades con más apariciones, para el filtro. */
export function specialtiesByAppearances(questions: Question[]): { id: string; total: number }[] {
  const c = new Map<string, number>()
  for (const q of questions) if (q.years?.length) c.set(q.specialty, (c.get(q.specialty) ?? 0) + q.years.length)
  return [...c.entries()].map(([id, total]) => ({ id, total })).sort((a, b) => b.total - a.total)
}
