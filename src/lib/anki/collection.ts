import type { Card, Deck, Note, RevlogEntry } from './types'
import { cardId, cardOrds } from './render'
import { BUILTIN_CARDS, BUILTIN_CLOZES, DECKS } from '@/data/flashcards'
import { getSpecialty } from '@/data/specialties'
import { hashString, LETTERS } from '@/lib/utils'
import type { Question, QuestionAttempt } from '@/types'

export const ALL_DECK = 'todas'
export const SPEC_PREFIX = 'esp-'
export const PATH_PREFIX = 'path:'

export const BUILTIN_DECKS: Deck[] = [
  ...DECKS.map((d) => ({ id: d.id, name: `ENURM::${d.name}`, description: d.description, builtin: true })),
  { id: 'mis-tarjetas', name: 'Mis tarjetas', description: 'Tus propias notas. Crea submazos con "::" (por ejemplo "Mis tarjetas::Cardio").', builtin: true },
  { id: 'mis-errores', name: 'Mis errores', description: 'Se llena solo con las preguntas que fallas en práctica y simulacros.', builtin: true },
]

/** Notas incluidas con la plataforma (estables entre versiones: sus ids no cambian). */
export const BUILTIN_NOTES: Note[] = [
  ...BUILTIN_CARDS.map<Note>((c, i) => ({
    id: c.id,
    deckId: c.deck,
    type: 'basic',
    front: c.front,
    back: c.back,
    tags: ['enurm', c.deck, ...(c.specialty ? [c.specialty] : [])],
    specialty: c.specialty,
    createdAt: i + 1,
    modifiedAt: 0,
    source: 'builtin',
  })),
  ...BUILTIN_CLOZES.map<Note>((c, i) => ({
    id: `fc-cloze-${hashString(c.text)}`,
    deckId: 'cloze',
    type: 'cloze',
    front: c.text,
    back: '',
    tags: ['enurm', 'cloze', c.specialty],
    specialty: c.specialty,
    createdAt: 10_000 + i,
    modifiedAt: 0,
    source: 'builtin',
  })),
]

export function errorNotes(attempts: Record<string, QuestionAttempt>, byId: Map<string, Question>): Note[] {
  const out: Note[] = []
  for (const [id, a] of Object.entries(attempts)) {
    if (a.lastCorrect) continue
    const q = byId.get(id)
    if (!q) continue
    out.push({
      id: `err-${q.id}`,
      deckId: 'mis-errores',
      type: 'basic',
      front: q.stem,
      back: `<b>${LETTERS[q.answer]}) ${q.options[q.answer]}</b>${q.explanation ? `<br><br>${q.explanation.replace(/</g, '&lt;')}` : ''}`,
      tags: ['error', q.specialty, ...(q.year ? [String(q.year)] : [])],
      specialty: q.specialty,
      createdAt: a.lastAt,
      modifiedAt: a.lastAt,
      source: 'error',
    })
  }
  return out
}

export interface Collection {
  notes: Note[]
  cards: Card[]
  decks: Deck[]
  deckById: Map<string, Deck>
  cardsByNote: Map<string, Card[]>
}

export function buildCollection(userNotes: Note[], userDecks: Deck[], overrides: Record<string, Partial<Note>>, errors: Note[]): Collection {
  const notes = [...BUILTIN_NOTES.map((n) => (overrides[n.id] ? { ...n, ...overrides[n.id] } : n)), ...userNotes, ...errors.map((n) => (overrides[n.id] ? { ...n, ...overrides[n.id] } : n))]
  const decks = [...BUILTIN_DECKS, ...userDecks]
  const deckById = new Map(decks.map((d) => [d.id, d]))
  const cards: Card[] = []
  const cardsByNote = new Map<string, Card[]>()
  for (const note of notes) {
    const list = cardOrds(note).map((ord) => ({ id: cardId(note.id, ord), noteId: note.id, ord, deckId: deckById.has(note.deckId) ? note.deckId : 'mis-tarjetas', note }))
    cardsByNote.set(note.id, list)
    cards.push(...list)
  }
  return { notes, cards, decks, deckById, cardsByNote }
}

/** Nombre visible de cualquier clave de mazo (real, virtual por especialidad o nodo padre). */
export function deckLabel(col: Collection, key: string): string {
  if (key === ALL_DECK) return 'Todas las tarjetas'
  if (key.startsWith(SPEC_PREFIX)) return getSpecialty(key.slice(SPEC_PREFIX.length)).name
  if (key.startsWith(PATH_PREFIX)) return key.slice(PATH_PREFIX.length)
  return col.deckById.get(key)?.name ?? 'Mazo'
}

/** Tarjetas de un mazo, incluyendo sus submazos. Los mazos filtrados se resuelven aparte (búsqueda). */
export function cardsInDeck(col: Collection, key: string): Card[] {
  if (key === ALL_DECK) return col.cards
  if (key.startsWith(SPEC_PREFIX)) {
    const spec = key.slice(SPEC_PREFIX.length)
    return col.cards.filter((c) => c.note.specialty === spec)
  }
  const name = key.startsWith(PATH_PREFIX) ? key.slice(PATH_PREFIX.length) : col.deckById.get(key)?.name
  if (!name) return []
  const ids = new Set(col.decks.filter((d) => !d.filtered && (d.name === name || d.name.startsWith(name + '::'))).map((d) => d.id))
  return col.cards.filter((c) => ids.has(c.deckId))
}

export interface DeckNode {
  key: string
  name: string
  fullName: string
  depth: number
  deck?: Deck
  children: DeckNode[]
}

/** Árbol de mazos a partir de los nombres "Padre::Hijo"; crea nodos padre virtuales si hace falta. */
export function deckTree(decks: Deck[]): DeckNode[] {
  const roots: DeckNode[] = []
  const byPath = new Map<string, DeckNode>()
  const sorted = [...decks].sort((a, b) => a.name.localeCompare(b.name, 'es'))
  for (const d of sorted) {
    const parts = d.name.split('::')
    let parentList = roots
    for (let i = 0; i < parts.length; i++) {
      const path = parts.slice(0, i + 1).join('::')
      let node = byPath.get(path)
      if (!node) {
        node = { key: `${PATH_PREFIX}${path}`, name: parts[i], fullName: path, depth: i, children: [] }
        byPath.set(path, node)
        parentList.push(node)
      }
      if (i === parts.length - 1) {
        node.deck = d
        node.key = d.id
      }
      parentList = node.children
    }
  }
  return roots
}

export function revlogByCard(revlog: RevlogEntry[]): Map<string, RevlogEntry[]> {
  const m = new Map<string, RevlogEntry[]>()
  for (const r of revlog) {
    const l = m.get(r.cid)
    if (l) l.push(r)
    else m.set(r.cid, [r])
  }
  return m
}
