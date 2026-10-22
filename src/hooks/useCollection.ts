import { useMemo } from 'react'
import { useAnki, configFor } from '@/store/anki'
import { useProgress } from '@/store/progress'
import { useBank } from '@/store/bank'
import { buildCollection, cardsInDeck, errorNotes, type Collection } from '@/lib/anki/collection'
import { buildQueues, type QueueInput } from '@/lib/anki/queue'
import { compileSearch } from '@/lib/anki/search'
import { dayNumber } from '@/lib/anki/scheduler'
import type { Card } from '@/lib/anki/types'

export function useCollection(): Collection {
  const notes = useAnki((s) => s.notes)
  const decks = useAnki((s) => s.decks)
  const overrides = useAnki((s) => s.overrides)
  const attempts = useProgress((s) => s.attempts)
  const byId = useBank((s) => s.byId)
  const errors = useMemo(() => errorNotes(attempts, byId), [attempts, byId])
  return useMemo(() => buildCollection(notes, decks, overrides, errors), [notes, decks, overrides, errors])
}

/** Entradas de la cola para un mazo (real, virtual o filtrado) en este momento. */
export function useQueueInputFactory(col: Collection) {
  const states = useAnki((s) => s.states)
  const revlog = useAnki((s) => s.revlog)
  const configs = useAnki((s) => s.configs)
  const deckConfig = useAnki((s) => s.deckConfig)
  const extraLimits = useAnki((s) => s.extraLimits)
  const settings = useAnki((s) => s.settings)

  return useMemo(() => {
    const now = Date.now()
    const today = dayNumber(now, settings.rolloverHour)
    const todayLog = revlog.filter((r) => dayNumber(r.ts, settings.rolloverHour) === today)

    return (key: string, nowOverride?: number): QueueInput & { cards: Card[] } => {
      const deck = col.deckById.get(key)
      let cards: Card[]
      if (deck?.filtered) {
        const pred = compileSearch(deck.filtered.query, { now, rolloverHour: settings.rolloverHour, deckName: (id) => col.deckById.get(id)?.name ?? '', state: (id) => states[id] })
        cards = col.cards.filter(pred).slice(0, deck.filtered.limit)
      } else cards = cardsInDeck(col, key)
      const ids = new Set(cards.map((c) => c.id))
      const conf = configFor({ configs, deckConfig }, key)
      const extra = extraLimits[key]
      const filtered = !!deck?.filtered
      return {
        cards,
        states,
        // En mazos filtrados no hay límites diarios (como en Anki).
        conf: filtered ? { ...conf, newPerDay: 9999, reviewsPerDay: 9999 } : conf,
        now: nowOverride ?? now,
        rolloverHour: settings.rolloverHour,
        learnAheadMinutes: settings.learnAheadMinutes,
        newDoneToday: todayLog.filter((r) => r.kind === 'new' && ids.has(r.cid)).length,
        reviewsDoneToday: todayLog.filter((r) => r.kind === 'review' && ids.has(r.cid)).length,
        newExtra: extra && extra.day === today ? extra.newExtra : 0,
        reviewExtra: extra && extra.day === today ? extra.reviewExtra : 0,
      }
    }
  }, [col, states, revlog, configs, deckConfig, extraLimits, settings])
}

/** Totales de hoy en todas las tarjetas (para el plan diario y el inicio). */
export function useCardTotals() {
  const col = useCollection()
  const factory = useQueueInputFactory(col)
  return useMemo(() => {
    const q = buildQueues(factory('todas'))
    return { due: q.counts.review + q.counts.learn, newAvailable: q.counts.new, ...q.counts }
  }, [factory])
}
