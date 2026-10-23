import { create } from 'zustand'
import type { Question } from '@/types'
import { SAMPLE_QUESTIONS } from '@/data/sampleQuestions'
import { normalizeRows } from '@/lib/importer'

export type BankSource = 'sample' | 'official'

interface BankState {
  status: 'idle' | 'loading' | 'ready' | 'error'
  questions: Question[]
  byId: Map<string, Question>
  years: number[]
  /** Conteo de preguntas por especialidad. */
  specialtyCounts: Record<string, number>
  source: BankSource
  load: () => Promise<void>
}

/**
 * Carga el banco publicado con la web (public/data/questions.json, generado con
 * `node scripts/build-bank.mjs`). Las preguntas de muestra se conservan siempre junto a él.
 */
async function fetchBundled(): Promise<Question[]> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/questions.json`, { cache: 'no-cache' })
    if (!res.ok) return []
    const data = await res.json()
    const rows = Array.isArray(data) ? data : (data.questions ?? [])
    if (!Array.isArray(rows) || rows.length === 0) return []
    // El archivo publicado ya está normalizado: las respuestas son índices desde 0.
    return normalizeRows(rows, { answerBase: 0 }).questions
  } catch {
    return []
  }
}

function derive(questions: Question[]) {
  const byId = new Map(questions.map((q) => [q.id, q]))
  const years = [...new Set(questions.map((q) => q.year).filter((y): y is number => typeof y === 'number'))].sort((a, b) => b - a)
  const specialtyCounts: Record<string, number> = {}
  for (const q of questions) specialtyCounts[q.specialty] = (specialtyCounts[q.specialty] ?? 0) + 1
  return { byId, years, specialtyCounts }
}

export const useBank = create<BankState>((set, get) => ({
  status: 'idle',
  questions: [],
  byId: new Map(),
  years: [],
  specialtyCounts: {},
  source: 'sample',

  load: async () => {
    if (get().status === 'loading' || get().status === 'ready') return
    set({ status: 'loading' })
    const official = await fetchBundled()
    const officialIds = new Set(official.map((q) => q.id))
    const questions = [...official, ...SAMPLE_QUESTIONS.filter((q) => !officialIds.has(q.id))]
    set({ status: 'ready', questions, source: official.length ? 'official' : 'sample', ...derive(questions) })
  },
}))
