import type { Question, QuestionAttempt } from '@/types'
import { shuffle } from './utils'

export type StatusFilter = 'all' | 'unseen' | 'failed' | 'bookmarked'

export interface SelectionFilters {
  specialties: string[]
  years: number[]
  status: StatusFilter
  difficulty?: (1 | 2 | 3)[]
  search?: string
}

export function filterQuestions(questions: Question[], f: SelectionFilters, attempts: Record<string, QuestionAttempt>, bookmarks: string[]): Question[] {
  const bm = new Set(bookmarks)
  const term = f.search?.trim().toLowerCase()
  return questions.filter((q) => {
    if (f.specialties.length && !f.specialties.includes(q.specialty)) return false
    if (f.years.length && (q.year === undefined || !f.years.includes(q.year))) return false
    if (f.difficulty?.length && (!q.difficulty || !f.difficulty.includes(q.difficulty))) return false
    const a = attempts[q.id]
    if (f.status === 'unseen' && a) return false
    if (f.status === 'failed' && (!a || a.lastCorrect)) return false
    if (f.status === 'bookmarked' && !bm.has(q.id)) return false
    if (term && !`${q.stem} ${q.topic ?? ''} ${q.options.join(' ')}`.toLowerCase().includes(term)) return false
    return true
  })
}

/**
 * Selección proporcional por especialidad (como en un examen real): reparte `count`
 * según el peso de cada especialidad en el conjunto filtrado.
 */
export function proportionalPick(pool: Question[], count: number): Question[] {
  if (pool.length <= count) return shuffle(pool)
  const groups = new Map<string, Question[]>()
  for (const q of shuffle(pool)) {
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
  return shuffle(picked)
}

/** Orden aleatorio de opciones para una pregunta (order[pos] = índice original). */
export function optionOrder(q: Question, shuffleOptions: boolean): number[] {
  const base = q.options.map((_, i) => i)
  if (!shuffleOptions) return base
  // No mezclar si alguna opción hace referencia a otras ("todas las anteriores", "A y B"…).
  const refers = q.options.some((o) => /anteriores|ninguna|todas|\b[a-e]\s*y\s*[a-e]\b/i.test(o))
  return refers ? base : shuffle(base)
}
