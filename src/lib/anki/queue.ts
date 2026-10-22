import type { Card, CardState, DeckConfig } from './types'
import { dayNumber, dayStart } from './scheduler'
import { hashString } from '@/lib/utils'

export interface QueueInput {
  cards: Card[]
  states: Record<string, CardState>
  conf: DeckConfig
  now: number
  rolloverHour: number
  learnAheadMinutes: number
  /** Nuevas ya introducidas hoy en este mazo. */
  newDoneToday: number
  /** Repasos ya hechos hoy en este mazo. */
  reviewsDoneToday: number
  newExtra?: number
  reviewExtra?: number
}

export interface DeckCounts {
  new: number
  learn: number
  review: number
  /** Totales sin aplicar límites. */
  totalNew: number
  totalReviewDue: number
  /** Próxima tarjeta en aprendizaje que vence más tarde hoy. */
  nextLearnAt: number | null
}

interface Queues {
  learnNow: Card[]
  learnToday: Card[]
  reviews: Card[]
  news: Card[]
  counts: DeckCounts
}

/** Orden aleatorio estable durante el día (no cambia en cada render). */
function seededSort(cards: Card[], seed: number): Card[] {
  return [...cards].sort((a, b) => hashString(`${seed}${a.id}`).localeCompare(hashString(`${seed}${b.id}`)))
}

function active(s: CardState | undefined, today: number): boolean {
  if (!s) return true
  if (s.suspended) return false
  if (s.buriedUntil !== undefined && s.buriedUntil >= today) return false
  return true
}

export function buildQueues(input: QueueInput): Queues {
  const { cards, states, conf, now, rolloverHour } = input
  const today = dayNumber(now, rolloverHour)
  const endOfDay = dayStart(today + 1, rolloverHour)
  const learnAhead = now + input.learnAheadMinutes * 60_000

  const learnToday: Card[] = []
  const reviewsAll: Card[] = []
  const newsAll: Card[] = []
  for (const c of cards) {
    const s = states[c.id]
    if (!active(s, today)) continue
    if (!s || s.type === 'new') newsAll.push(c)
    else if (s.type === 'learning' || s.type === 'relearning') {
      if (s.due < endOfDay) learnToday.push(c)
    } else if (dayNumber(s.due, rolloverHour) <= today) reviewsAll.push(c)
  }

  learnToday.sort((a, b) => states[a.id].due - states[b.id].due)
  const learnNow = learnToday.filter((c) => states[c.id].due <= learnAhead)

  const reviewSorted = conf.reviewOrder === 'random' ? seededSort(reviewsAll, today) : [...reviewsAll].sort((a, b) => states[a.id].due - states[b.id].due)
  const newSorted =
    conf.newOrder === 'random'
      ? seededSort(newsAll, today)
      : [...newsAll].sort((a, b) => (states[a.id]?.position ?? a.note.createdAt) - (states[b.id]?.position ?? b.note.createdAt) || a.ord - b.ord)

  const reviewLimit = Math.max(0, conf.reviewsPerDay + (input.reviewExtra ?? 0) - input.reviewsDoneToday)
  const newLimit = Math.max(0, conf.newPerDay + (input.newExtra ?? 0) - input.newDoneToday)
  const reviews = reviewSorted.slice(0, reviewLimit)
  const news = newSorted.slice(0, newLimit)

  const later = learnToday.filter((c) => states[c.id].due > learnAhead)
  return {
    learnNow,
    learnToday,
    reviews,
    news,
    counts: {
      new: news.length,
      learn: learnToday.length,
      review: reviews.length,
      totalNew: newsAll.length,
      totalReviewDue: reviewsAll.length,
      nextLearnAt: later.length ? states[later[0].id].due : null,
    },
  }
}

export function deckCounts(input: QueueInput): DeckCounts {
  return buildQueues(input).counts
}

/**
 * Siguiente tarjeta (Anki v3): primero las de aprendizaje que vencen ahora; luego repasos y nuevas
 * mezclados según el preset; al final, aprendizaje adelantado dentro del margen.
 * `seq` es el número de tarjetas ya mostradas en la sesión (para intercalar nuevas).
 */
export function nextCard(input: QueueInput, seq: number, exclude?: string): Card | null {
  const q = buildQueues(input)
  const now = input.now
  const learnDue = q.learnNow.filter((c) => input.states[c.id].due <= now && c.id !== exclude)
  if (learnDue.length) return learnDue[0]

  const reviews = q.reviews.filter((c) => c.id !== exclude)
  const news = q.news.filter((c) => c.id !== exclude)
  if (reviews.length && news.length) {
    if (input.conf.newReviewMix === 'before') return news[0]
    if (input.conf.newReviewMix === 'after') return reviews[0]
    const ratio = Math.max(1, Math.floor(reviews.length / news.length))
    return seq % (ratio + 1) === ratio ? news[0] : reviews[0]
  }
  if (reviews.length) return reviews[0]
  if (news.length) return news[0]

  const ahead = q.learnNow.filter((c) => c.id !== exclude)
  if (ahead.length) return ahead[0]
  // Si solo queda la tarjeta recién respondida en aprendizaje, se muestra de nuevo.
  return q.learnNow[0] ?? null
}
