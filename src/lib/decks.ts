import type { FlashDeck, Flashcard, Question, QuestionAttempt } from '@/types'
import { BUILTIN_CARDS, DECKS } from '@/data/flashcards'
import { LETTERS } from './utils'

export const ERRORS_DECK: FlashDeck = { id: 'mis-errores', name: 'Mis errores', description: 'Generado automáticamente con las preguntas que fallaste.', color: '#ef4444', icon: 'target' }
export const CUSTOM_DECK: FlashDeck = { id: 'mis-tarjetas', name: 'Mis tarjetas', description: 'Tarjetas que creaste tú.', color: '#f59e0b', icon: 'sparkles' }
export const ALL_DECK_ID = 'todas'

export function errorCards(attempts: Record<string, QuestionAttempt>, byId: Map<string, Question>): Flashcard[] {
  const out: Flashcard[] = []
  for (const [id, a] of Object.entries(attempts)) {
    if (a.lastCorrect) continue
    const q = byId.get(id)
    if (!q) continue
    out.push({
      id: `err-${q.id}`,
      deck: ERRORS_DECK.id,
      front: q.stem,
      back: `${LETTERS[q.answer]}) ${q.options[q.answer]}${q.explanation ? `\n\n${q.explanation}` : ''}`,
      specialty: q.specialty,
    })
  }
  return out
}

export function allDecks(): FlashDeck[] {
  return [...DECKS, ERRORS_DECK, CUSTOM_DECK]
}

/** Mazo virtual con todas las tarjetas de una especialidad: id "esp-<especialidad>". */
export const SPECIALTY_DECK_PREFIX = 'esp-'

export function cardsForDeck(deckId: string, custom: Flashcard[], errors: Flashcard[]): Flashcard[] {
  if (deckId === ALL_DECK_ID) return [...BUILTIN_CARDS, ...custom, ...errors]
  if (deckId.startsWith(SPECIALTY_DECK_PREFIX)) {
    const spec = deckId.slice(SPECIALTY_DECK_PREFIX.length)
    return [...BUILTIN_CARDS, ...custom, ...errors].filter((c) => c.specialty === spec)
  }
  if (deckId === ERRORS_DECK.id) return errors
  if (deckId === CUSTOM_DECK.id) return custom
  return BUILTIN_CARDS.filter((c) => c.deck === deckId)
}
