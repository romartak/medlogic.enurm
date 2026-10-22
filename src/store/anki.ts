import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnkiSettings, Card, CardState, Deck, DeckConfig, Grade, Note, RevlogEntry } from '@/lib/anki/types'
import { answerCard, dayNumber, DEFAULT_CONFIG, newCardState, PRESETS } from '@/lib/anki/scheduler'
import { uid } from '@/lib/utils'
import { useProgress } from './progress'

export const CUSTOM_DECK_ID = 'mis-tarjetas'
export const ERRORS_DECK_ID = 'mis-errores'

interface UndoEntry {
  cardId: string
  prev: CardState | undefined
  siblings: Record<string, CardState | undefined>
  revlogLength: number
}

interface AnkiData {
  notes: Note[]
  /** Ediciones del usuario sobre notas incluidas. */
  overrides: Record<string, Partial<Pick<Note, 'front' | 'back' | 'extra' | 'tags' | 'deckId'>>>
  decks: Deck[]
  states: Record<string, CardState>
  configs: DeckConfig[]
  deckConfig: Record<string, string>
  revlog: RevlogEntry[]
  extraLimits: Record<string, { day: number; newExtra: number; reviewExtra: number }>
  collapsed: string[]
  settings: AnkiSettings
  migrated: boolean
}

interface AnkiActions {
  answer: (card: Card, grade: Grade, timeMs: number, opts?: { reschedule?: boolean; siblings?: Card[] }) => { leech: boolean }
  undo: () => string | null
  canUndo: () => boolean
  patchStates: (cardIds: string[], patch: Partial<CardState> | ((s: CardState) => Partial<CardState>)) => void
  forget: (cardIds: string[]) => void
  addNote: (n: Omit<Note, 'id' | 'createdAt' | 'modifiedAt' | 'source'> & { id?: string }) => string
  updateNote: (note: Note, patch: Partial<Pick<Note, 'front' | 'back' | 'extra' | 'tags' | 'deckId' | 'type' | 'specialty'>>) => void
  deleteNotes: (noteIds: string[]) => void
  addTags: (notes: Note[], tags: string[]) => void
  removeTags: (notes: Note[], tags: string[]) => void
  moveNotes: (notes: Note[], deckId: string) => void
  addDeck: (name: string, extra?: Partial<Deck>) => string
  renameDeck: (id: string, name: string) => void
  deleteDeck: (id: string) => void
  setDeckDescription: (id: string, description: string) => void
  saveConfig: (c: DeckConfig) => void
  addConfig: (base: DeckConfig, name: string) => string
  deleteConfig: (id: string) => void
  setDeckConfig: (deckId: string, configId: string) => void
  extendLimits: (deckId: string, newExtra: number, reviewExtra: number) => void
  toggleCollapsed: (deckId: string) => void
  updateSettings: (s: Partial<AnkiSettings>) => void
  importNotes: (notes: Note[]) => void
  migrateLegacy: (srs: Record<string, { ease: number; interval: number; reps: number; due: number; lapses: number; lastReview: number }>, custom: { id: string; front: string; back: string; specialty?: string }[]) => void
  importBackup: (data: Partial<AnkiData>) => void
  resetAll: () => void
}

export type AnkiState = AnkiData & AnkiActions

const INITIAL: AnkiData = {
  notes: [],
  overrides: {},
  decks: [],
  states: {},
  configs: PRESETS,
  deckConfig: {},
  revlog: [],
  extraLimits: {},
  collapsed: [],
  settings: { rolloverHour: 4, learnAheadMinutes: 20, showIntervals: true, showRemaining: true, showTimer: false },
  migrated: false,
}

const MAX_REVLOG = 30_000
const undoStack: UndoEntry[] = []

export function configFor(s: Pick<AnkiData, 'configs' | 'deckConfig'>, deckId: string): DeckConfig {
  const id = s.deckConfig[deckId] ?? 'default'
  return s.configs.find((c) => c.id === id) ?? s.configs.find((c) => c.id === 'default') ?? DEFAULT_CONFIG
}

export const useAnki = create<AnkiState>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      answer: (card, grade, timeMs, opts = {}) => {
        const s = get()
        const now = Date.now()
        const rh = s.settings.rolloverHour
        const prev = s.states[card.id]
        const conf = configFor(s, card.deckId)
        const reschedule = opts.reschedule !== false
        const base = prev ?? newCardState()
        const res = answerCard(base, grade, conf, { now, rolloverHour: rh })

        const states = { ...s.states }
        const siblingsPrev: Record<string, CardState | undefined> = {}
        if (reschedule) {
          states[card.id] = res.state
          // Enterrar hermanas (otras tarjetas de la misma nota) hasta mañana.
          const bury = (base.type === 'new' && conf.buryNewSiblings) || (base.type === 'review' && conf.buryReviewSiblings)
          if (bury) {
            for (const sib of opts.siblings ?? []) {
              if (sib.id === card.id) continue
              const st = states[sib.id]
              const isNew = !st || st.type === 'new'
              const isReview = st?.type === 'review'
              if ((isNew && conf.buryNewSiblings) || (isReview && conf.buryReviewSiblings)) {
                siblingsPrev[sib.id] = st
                states[sib.id] = { ...(st ?? newCardState()), buriedUntil: dayNumber(now, rh) }
              }
            }
          }
        }

        undoStack.push({ cardId: card.id, prev, siblings: siblingsPrev, revlogLength: s.revlog.length })
        if (undoStack.length > 50) undoStack.shift()

        const entry: RevlogEntry = {
          ts: now,
          cid: card.id,
          grade,
          kind: reschedule ? res.kind : 'cram',
          ivl: res.state.type === 'review' ? res.state.interval : -Math.round((res.state.due - now) / 1000),
          lastIvl: base.type === 'review' ? base.interval : 0,
          ease: res.state.ease,
          time: Math.min(timeMs, 60_000),
        }
        const revlog = s.revlog.length >= MAX_REVLOG ? [...s.revlog.slice(-MAX_REVLOG + 1), entry] : [...s.revlog, entry]
        set({ states, revlog })
        useProgress.getState().recordCardReview(grade)
        return { leech: reschedule && res.leech }
      },

      undo: () => {
        const u = undoStack.pop()
        if (!u) return null
        const s = get()
        const states = { ...s.states }
        if (u.prev) states[u.cardId] = u.prev
        else delete states[u.cardId]
        for (const [id, st] of Object.entries(u.siblings)) {
          if (st) states[id] = st
          else delete states[id]
        }
        set({ states, revlog: s.revlog.slice(0, u.revlogLength) })
        return u.cardId
      },

      canUndo: () => undoStack.length > 0,

      patchStates: (ids, patch) => {
        const states = { ...get().states }
        for (const id of ids) {
          const cur = states[id] ?? newCardState()
          states[id] = { ...cur, ...(typeof patch === 'function' ? patch(cur) : patch) }
        }
        set({ states })
      },

      forget: (ids) => {
        const states = { ...get().states }
        for (const id of ids) delete states[id]
        set({ states })
      },

      addNote: (n) => {
        const id = n.id ?? uid('nota')
        const now = Date.now()
        set({ notes: [...get().notes, { ...n, id, createdAt: now, modifiedAt: now, source: 'user' }] })
        return id
      },

      updateNote: (note, patch) => {
        if (note.source === 'user') {
          set({ notes: get().notes.map((n) => (n.id === note.id ? { ...n, ...patch, modifiedAt: Date.now() } : n)) })
        } else {
          const o = get().overrides
          set({ overrides: { ...o, [note.id]: { ...o[note.id], ...patch } } })
        }
      },

      deleteNotes: (ids) => {
        const set_ = new Set(ids)
        const states = { ...get().states }
        for (const k of Object.keys(states)) if (set_.has(k.split('::')[0])) delete states[k]
        set({ notes: get().notes.filter((n) => !set_.has(n.id)), states })
      },

      addTags: (notes, tags) => {
        for (const n of notes) get().updateNote(n, { tags: [...new Set([...n.tags, ...tags])] })
      },

      removeTags: (notes, tags) => {
        for (const n of notes) get().updateNote(n, { tags: n.tags.filter((t) => !tags.includes(t)) })
      },

      moveNotes: (notes, deckId) => {
        for (const n of notes) get().updateNote(n, { deckId })
      },

      addDeck: (name, extra = {}) => {
        const clean = name
          .split('::')
          .map((p) => p.trim())
          .filter(Boolean)
          .join('::')
        const existing = get().decks.find((d) => d.name.toLowerCase() === clean.toLowerCase())
        if (existing) return existing.id
        const id = uid('mazo')
        set({ decks: [...get().decks, { id, name: clean, ...extra }] })
        return id
      },

      renameDeck: (id, name) => set({ decks: get().decks.map((d) => (d.id === id ? { ...d, name } : d)) }),

      deleteDeck: (id) => {
        const notes = get().notes.map((n) => (n.deckId === id ? { ...n, deckId: CUSTOM_DECK_ID } : n))
        set({ decks: get().decks.filter((d) => d.id !== id), notes })
      },

      setDeckDescription: (id, description) => set({ decks: get().decks.map((d) => (d.id === id ? { ...d, description } : d)) }),

      saveConfig: (c) => set({ configs: get().configs.map((x) => (x.id === c.id ? c : x)) }),

      addConfig: (base, name) => {
        const id = uid('preset')
        set({ configs: [...get().configs, { ...base, id, name }] })
        return id
      },

      deleteConfig: (id) => {
        if (id === 'default') return
        const deckConfig = Object.fromEntries(Object.entries(get().deckConfig).filter(([, v]) => v !== id))
        set({ configs: get().configs.filter((c) => c.id !== id), deckConfig })
      },

      setDeckConfig: (deckId, configId) => set({ deckConfig: { ...get().deckConfig, [deckId]: configId } }),

      extendLimits: (deckId, newExtra, reviewExtra) => {
        const day = dayNumber(Date.now(), get().settings.rolloverHour)
        const cur = get().extraLimits[deckId]
        const base = cur && cur.day === day ? cur : { day, newExtra: 0, reviewExtra: 0 }
        set({ extraLimits: { ...get().extraLimits, [deckId]: { day, newExtra: base.newExtra + newExtra, reviewExtra: base.reviewExtra + reviewExtra } } })
      },

      toggleCollapsed: (deckId) => {
        const c = get().collapsed
        set({ collapsed: c.includes(deckId) ? c.filter((x) => x !== deckId) : [...c, deckId] })
      },

      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      importNotes: (notes) => set({ notes: [...get().notes, ...notes] }),

      migrateLegacy: (srs, custom) => {
        if (get().migrated) return
        const states = { ...get().states }
        for (const [id, o] of Object.entries(srs)) {
          if (states[id]) continue
          if (o.reps > 0) states[id] = { type: 'review', due: o.due, interval: Math.max(1, o.interval), ease: o.ease || 2.5, reps: o.reps, lapses: o.lapses, step: 0, lastReview: o.lastReview }
          else if (o.lastReview > 0) states[id] = { type: 'learning', due: o.due, interval: 0, ease: o.ease || 2.5, reps: 1, lapses: o.lapses, step: 0, lastReview: o.lastReview }
        }
        const now = Date.now()
        const known = new Set(get().notes.map((n) => n.id))
        const notes = [
          ...get().notes,
          ...custom.filter((c) => !known.has(c.id)).map<Note>((c) => ({ id: c.id, deckId: CUSTOM_DECK_ID, type: 'basic', front: c.front, back: c.back, tags: [], specialty: c.specialty, createdAt: now, modifiedAt: now, source: 'user' })),
        ]
        set({ states, notes, migrated: true })
      },

      importBackup: (data) => {
        const clean: Partial<AnkiData> = {}
        for (const k of Object.keys(INITIAL) as (keyof AnkiData)[]) if (data[k] !== undefined) (clean as Record<string, unknown>)[k] = data[k]
        set({ ...clean, migrated: true })
      },

      resetAll: () => {
        undoStack.length = 0
        set({ ...INITIAL, notes: get().notes, decks: get().decks, configs: get().configs, deckConfig: get().deckConfig, settings: get().settings, migrated: true })
      },
    }),
    {
      name: 'medlogic-anki',
      version: 1,
      partialize: (s) => {
        const out: Partial<AnkiData> = {}
        for (const k of Object.keys(INITIAL) as (keyof AnkiData)[]) (out as Record<string, unknown>)[k] = s[k]
        return out as AnkiData
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AnkiData>
        // Conserva presets nuevos que agregue la app sin perder los del usuario.
        const configs = [...(p.configs ?? [])]
        for (const preset of PRESETS) if (!configs.some((c) => c.id === preset.id)) configs.push(preset)
        return { ...current, ...p, configs: configs.map((c) => ({ ...DEFAULT_CONFIG, ...c })), settings: { ...INITIAL.settings, ...(p.settings ?? {}) } }
      },
    },
  ),
)
