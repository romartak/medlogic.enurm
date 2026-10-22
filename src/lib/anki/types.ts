/**
 * Modelo de datos inspirado en Anki: notas → tarjetas, mazos jerárquicos ("Padre::Hijo"),
 * presets de opciones compartidos entre mazos y registro de repasos (revlog).
 */

export type NoteType = 'basic' | 'reversed' | 'cloze'

export interface Note {
  id: string
  deckId: string
  type: NoteType
  /** Frente (en cloze: texto con {{c1::...}}). Admite HTML básico. */
  front: string
  back: string
  /** Campo "Extra" de Anki: se muestra solo en el reverso. */
  extra?: string
  tags: string[]
  specialty?: string
  createdAt: number
  modifiedAt: number
  source: 'builtin' | 'user' | 'error'
}

export interface Card {
  id: string
  noteId: string
  /** 0 = frente→reverso, 1 = reverso→frente; en cloze, número de hueco − 1. */
  ord: number
  deckId: string
  note: Note
}

export type CardType = 'new' | 'learning' | 'review' | 'relearning'

/** 1 = Otra vez, 2 = Difícil, 3 = Bien, 4 = Fácil (como en Anki). */
export type Grade = 1 | 2 | 3 | 4

export interface CardState {
  type: CardType
  /** Marca de tiempo (ms) en la que vence. Para repasos, el inicio del día de vencimiento. */
  due: number
  /** Intervalo en días (repaso). */
  interval: number
  /** Factor de facilidad (2,5 = 250 %). */
  ease: number
  reps: number
  lapses: number
  /** Índice del paso de (re)aprendizaje actual. */
  step: number
  lastReview: number
  suspended?: boolean
  /** Día (número de día Anki) hasta el que está enterrada, inclusive. */
  buriedUntil?: number
  /** Bandera de color 0–7. */
  flag?: number
  leech?: boolean
  /** Orden de aparición de las nuevas (posición en la cola de nuevas). */
  position?: number
}

export interface DeckConfig {
  id: string
  name: string
  newPerDay: number
  reviewsPerDay: number
  /** Pasos de aprendizaje en minutos. */
  learningSteps: number[]
  graduatingInterval: number
  easyInterval: number
  /** Pasos de reaprendizaje en minutos. */
  relearningSteps: number[]
  minimumInterval: number
  /** Porcentaje del intervalo anterior que se conserva tras un lapso (0 = vuelve a 1 día). */
  lapseNewInterval: number
  leechThreshold: number
  leechAction: 'suspend' | 'tag'
  startingEase: number
  easyBonus: number
  intervalModifier: number
  hardInterval: number
  maximumInterval: number
  newOrder: 'sequential' | 'random'
  reviewOrder: 'due' | 'random'
  newReviewMix: 'mix' | 'after' | 'before'
  buryNewSiblings: boolean
  buryReviewSiblings: boolean
}

export interface Deck {
  id: string
  /** Nombre completo con jerarquía: "ENURM::Pediatría". */
  name: string
  description?: string
  builtin?: boolean
  /** Mazo filtrado: se llena con una búsqueda. */
  filtered?: { query: string; limit: number; order: 'random' | 'due' | 'added' | 'lapses'; reschedule: boolean }
}

export type RevKind = 'new' | 'learn' | 'review' | 'relearn' | 'cram'

export interface RevlogEntry {
  /** Marca de tiempo del repaso. */
  ts: number
  cid: string
  grade: Grade
  kind: RevKind
  /** Intervalo resultante en días (negativo = segundos en aprendizaje, como Anki). */
  ivl: number
  lastIvl: number
  ease: number
  /** Tiempo que tardó en responder (ms). */
  time: number
}

export interface AnkiSettings {
  /** Hora en que empieza el día siguiente (Anki usa las 4:00). */
  rolloverHour: number
  /** Minutos que se puede adelantar el aprendizaje si no hay nada más. */
  learnAheadMinutes: number
  showIntervals: boolean
  showRemaining: boolean
  showTimer: boolean
}
