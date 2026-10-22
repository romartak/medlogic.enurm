import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { dayKey } from '@/lib/utils'

/** Estado de un término en el repaso espaciado de «Terminología». */
export interface WordState {
  /** 0–5: cuánto lo dominas. */
  strength: number
  /** Cuándo toca repasarlo (ms). */
  due: number
  correct: number
  wrong: number
  lastSeen: number
}

export interface LessonResult {
  /** 1–3 estrellas según los errores. */
  stars: number
  times: number
  completedAt: number
}

export interface LingoData {
  lessons: Record<string, LessonResult>
  words: Record<string, WordState>
  /** XP ganado por día (clave yyyy-mm-dd), para la racha y la meta diaria. */
  days: Record<string, number>
  dailyGoal: number
}

interface LingoActions {
  /** Registra una respuesta sobre un término. */
  answer: (itemId: string, correct: boolean) => void
  /** Guarda el resultado de una lección y devuelve el XP ganado. */
  finishLesson: (lessonId: string, mistakes: number, review?: boolean) => number
  setDailyGoal: (n: number) => void
  importBackup: (data: Partial<LingoData>) => void
  reset: () => void
}

const INITIAL: LingoData = { lessons: {}, words: {}, days: {}, dailyGoal: 30 }
const MIN = 60_000
const DAY = 24 * 60 * MIN
/** Intervalos de repaso por nivel de dominio. */
const INTERVALS = [10 * MIN, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY]

export function starsFor(mistakes: number) {
  return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
}

export const useLingo = create<LingoData & LingoActions>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      answer: (itemId, correct) => {
        const now = Date.now()
        const w = get().words[itemId] ?? { strength: 0, due: now, correct: 0, wrong: 0, lastSeen: 0 }
        const strength = correct ? Math.min(5, w.strength + 1) : Math.max(0, w.strength - 2)
        const next: WordState = {
          strength,
          due: now + (correct ? INTERVALS[strength] : 0),
          correct: w.correct + (correct ? 1 : 0),
          wrong: w.wrong + (correct ? 0 : 1),
          lastSeen: now,
        }
        set({ words: { ...get().words, [itemId]: next } })
      },

      finishLesson: (lessonId, mistakes, review = false) => {
        const stars = starsFor(mistakes)
        const xp = (review ? 10 : 15) + (mistakes === 0 ? 5 : 0)
        const k = dayKey()
        const s = get()
        const prev = s.lessons[lessonId]
        set({
          lessons: review ? s.lessons : { ...s.lessons, [lessonId]: { stars: Math.max(stars, prev?.stars ?? 0), times: (prev?.times ?? 0) + 1, completedAt: Date.now() } },
          days: { ...s.days, [k]: (s.days[k] ?? 0) + xp },
        })
        return xp
      },

      setDailyGoal: (n) => set({ dailyGoal: n }),

      importBackup: (data) => set({ ...INITIAL, ...data }),

      reset: () => set(INITIAL),
    }),
    {
      name: 'medlogic-lingo',
      version: 1,
      partialize: (s) => ({ lessons: s.lessons, words: s.words, days: s.days, dailyGoal: s.dailyGoal }),
    },
  ),
)

/** Días seguidos (hasta hoy o ayer) con al menos una lección. */
export function lingoStreak(days: Record<string, number>, today = new Date()): number {
  let n = 0
  const d = new Date(today)
  if (!days[dayKey(d)]) d.setDate(d.getDate() - 1)
  while (days[dayKey(d)]) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}
