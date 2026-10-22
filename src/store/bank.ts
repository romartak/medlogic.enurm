import { create } from 'zustand'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import type { Question } from '@/types'
import { SAMPLE_QUESTIONS } from '@/data/sampleQuestions'
import { normalizeRows } from '@/lib/importer'

const IMPORTED_KEY = 'medlogic-imported-questions'

export type BankSource = 'sample' | 'bundled' | 'imported' | 'mixed'

interface BankState {
  status: 'idle' | 'loading' | 'ready' | 'error'
  questions: Question[]
  byId: Map<string, Question>
  years: number[]
  /** Conteo de preguntas por especialidad. */
  specialtyCounts: Record<string, number>
  source: BankSource
  bundledCount: number
  importedCount: number
  load: () => Promise<void>
  saveImported: (qs: Question[], mode: 'merge' | 'replace') => Promise<void>
  clearImported: () => Promise<void>
}

/** Carga public/data/questions.json si existe (el banco oficial que se publica con la web). */
async function fetchBundled(): Promise<Question[]> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/questions.json`, { cache: 'no-cache' })
    if (!res.ok) return []
    const data = await res.json()
    const rows = Array.isArray(data) ? data : (data.questions ?? [])
    if (!Array.isArray(rows) || rows.length === 0) return []
    return normalizeRows(rows).questions
  } catch {
    return []
  }
}

async function readImported(): Promise<Question[]> {
  try {
    return ((await idbGet(IMPORTED_KEY)) as Question[] | undefined) ?? []
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

function merge(bundled: Question[], imported: Question[]): { questions: Question[]; source: BankSource } {
  if (!bundled.length && !imported.length) return { questions: SAMPLE_QUESTIONS, source: 'sample' }
  const map = new Map<string, Question>()
  for (const q of bundled) map.set(q.id, q)
  for (const q of imported) map.set(q.id, q)
  const source: BankSource = bundled.length && imported.length ? 'mixed' : bundled.length ? 'bundled' : 'imported'
  return { questions: [...map.values()], source }
}

let bundledCache: Question[] | null = null

export const useBank = create<BankState>((set, get) => ({
  status: 'idle',
  questions: [],
  byId: new Map(),
  years: [],
  specialtyCounts: {},
  source: 'sample',
  bundledCount: 0,
  importedCount: 0,

  load: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading' })
    try {
      const [bundled, imported] = await Promise.all([bundledCache ? Promise.resolve(bundledCache) : fetchBundled(), readImported()])
      bundledCache = bundled
      const { questions, source } = merge(bundled, imported)
      set({ status: 'ready', questions, source, bundledCount: bundled.length, importedCount: imported.length, ...derive(questions) })
    } catch {
      set({ status: 'error', questions: SAMPLE_QUESTIONS, source: 'sample', ...derive(SAMPLE_QUESTIONS) })
    }
  },

  saveImported: async (qs, mode) => {
    const current = mode === 'merge' ? await readImported() : []
    const map = new Map(current.map((q) => [q.id, q]))
    for (const q of qs) map.set(q.id, q)
    await idbSet(IMPORTED_KEY, [...map.values()])
    set({ status: 'idle' })
    await get().load()
  },

  clearImported: async () => {
    await idbDel(IMPORTED_KEY)
    set({ status: 'idle' })
    await get().load()
  },
}))
