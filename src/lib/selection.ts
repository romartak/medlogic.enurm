import type { Question, QuestionAttempt } from '@/types'
import { seededRandom, shuffle } from './utils'
import { normalizeText } from '@/data/specialties'

const STOP = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 'con', 'por', 'para', 'una', 'uno', 'que'])

/** Palabras de búsqueda normalizadas (sin tildes ni palabras vacías). */
export function searchTokens(term: string): string[] {
  return normalizeText(term)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2 && !STOP.has(w))
}

export type StatusFilter = 'all' | 'unseen' | 'failed' | 'bookmarked' | 'highyield'

/** Años en que salió la pregunta (`years`) o, si solo se conoce uno, su `year`. */
export const yearsOf = (q: Question): number[] => (q.years?.length ? q.years : q.year ? [q.year] : [])
export const inYear = (q: Question, y: number) => yearsOf(q).includes(y)

/** Pregunta de «alto rendimiento»: apareció 2 o más veces en los exámenes recopilados. */
export const isHighYield = (q: Question) => (q.appearances ?? 1) >= 2

export interface SelectionFilters {
  specialties: string[]
  years: number[]
  status: StatusFilter
  difficulty?: (1 | 2 | 3)[]
  search?: string
}

export function filterQuestions(questions: Question[], f: SelectionFilters, attempts: Record<string, QuestionAttempt>, bookmarks: string[]): Question[] {
  const bm = new Set(bookmarks)
  const tokens = f.search ? searchTokens(f.search) : []
  return questions.filter((q) => {
    if (f.specialties.length && !f.specialties.includes(q.specialty)) return false
    if (f.years.length && !yearsOf(q).some((y) => f.years.includes(y))) return false
    if (f.difficulty?.length && (!q.difficulty || !f.difficulty.includes(q.difficulty))) return false
    const a = attempts[q.id]
    if (f.status === 'unseen' && a) return false
    if (f.status === 'failed' && (!a || a.lastCorrect)) return false
    if (f.status === 'bookmarked' && !bm.has(q.id)) return false
    if (f.status === 'highyield' && !isHighYield(q)) return false
    if (tokens.length) {
      const text = normalizeText(`${q.stem} ${q.topic ?? ''} ${q.options.join(' ')} ${q.explanation ?? ''}`)
      // Todas las palabras deben aparecer; se toleran plurales comparando por las primeras 6 letras.
      if (!tokens.every((t) => text.includes(t.length > 6 ? t.slice(0, 6) : t))) return false
    }
    return true
  })
}

/**
 * Selección proporcional por especialidad (como en un examen real): reparte `count`
 * según el peso de cada especialidad en el conjunto filtrado.
 */
export function proportionalPick(pool: Question[], count: number, rng: () => number = Math.random): Question[] {
  if (pool.length <= count) return shuffle(pool, rng)
  const groups = new Map<string, Question[]>()
  for (const q of shuffle(pool, rng)) {
    const g = groups.get(q.specialty) ?? []
    g.push(q)
    groups.set(q.specialty, g)
  }
  const picked: Question[] = []
  const quotas = [...groups.entries()].map(([k, qs]) => ({ k, qs, exact: (qs.length / pool.length) * count }))
  for (const g of quotas) picked.push(...g.qs.splice(0, Math.floor(g.exact)))
  // Reparte los restantes por mayor resto.
  quotas.sort((a, b) => (b.exact % 1) - (a.exact % 1))
  let i = 0
  while (picked.length < count) {
    const g = quotas[i % quotas.length]
    if (g.qs.length) picked.push(g.qs.shift()!)
    i++
  }
  return shuffle(picked, rng)
}

/**
 * La misma selección para todos los que usen la misma semilla (simulacro nacional, duelos):
 * se ordena el banco por id antes de mezclar para que no dependa del orden de carga.
 */
export function seededPick(pool: Question[], count: number, seed: string): Question[] {
  const sorted = [...pool].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  return proportionalPick(sorted, count, seededRandom(seed))
}

/** Orden aleatorio de opciones para una pregunta (order[pos] = índice original). */
export function optionOrder(q: Question, shuffleOptions: boolean): number[] {
  const base = q.options.map((_, i) => i)
  if (!shuffleOptions) return base
  // No mezclar si alguna opción hace referencia a otras ("todas las anteriores", "A y B"…).
  const refers = q.options.some((o) => /anteriores|ninguna|todas|\b[a-e]\s*y\s*[a-e]\b/i.test(o))
  return refers ? base : shuffle(base)
}
