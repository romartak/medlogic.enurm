import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DayActivity, ExamResult, Flashcard, Question, QuestionAttempt, Settings, SrsGrade, SrsState } from '@/types'
import { review } from '@/lib/srs'
import { dayKey } from '@/lib/utils'
import { ACHIEVEMENTS } from '@/data/achievements'
import { computeStreak } from '@/lib/stats'
import { useToasts } from './toasts'

export const GAME_IDS = ['contrarreloj', 'supervivencia', 'verdadero-falso', 'parejas', 'pistas'] as const
export type GameId = (typeof GAME_IDS)[number]

interface ProgressData {
  attempts: Record<string, QuestionAttempt>
  activity: Record<string, DayActivity>
  bookmarks: string[]
  notes: Record<string, string>
  exams: ExamResult[]
  srs: Record<string, SrsState>
  customCards: Flashcard[]
  guidesRead: string[]
  highscores: Partial<Record<GameId, number>>
  achievements: Record<string, number>
  xp: number
  correctRun: number
  bestRun: number
  totalCardsReviewed: number
  settings: Settings
}

interface ProgressActions {
  recordAnswer: (q: Question, choice: number) => boolean
  toggleBookmark: (id: string) => void
  setNote: (id: string, note: string) => void
  saveExam: (r: ExamResult) => void
  reviewCard: (id: string, grade: SrsGrade) => void
  addCustomCard: (c: Flashcard) => void
  deleteCustomCard: (id: string) => void
  markGuideRead: (id: string) => void
  recordGame: (id: GameId, score: number) => boolean
  addMinutes: (n: number) => void
  updateSettings: (s: Partial<Settings>) => void
  resetProgress: () => void
  importBackup: (data: Partial<ProgressData>) => void
}

export type ProgressState = ProgressData & ProgressActions

const DEFAULT_SETTINGS: Settings = {
  name: '',
  theme: 'system',
  dailyGoal: 40,
  examDate: null,
  sound: true,
  shuffleOptions: false,
  reduceMotion: false,
}

const INITIAL: ProgressData = {
  attempts: {},
  activity: {},
  bookmarks: [],
  notes: {},
  exams: [],
  srs: {},
  customCards: [],
  guidesRead: [],
  highscores: {},
  achievements: {},
  xp: 0,
  correctRun: 0,
  bestRun: 0,
  totalCardsReviewed: 0,
  settings: DEFAULT_SETTINGS,
}

const EMPTY_DAY: DayActivity = { answered: 0, correct: 0, cards: 0, minutes: 0 }

function bumpDay(activity: Record<string, DayActivity>, patch: Partial<DayActivity>): Record<string, DayActivity> {
  const k = dayKey()
  const d = activity[k] ?? EMPTY_DAY
  return {
    ...activity,
    [k]: {
      answered: d.answered + (patch.answered ?? 0),
      correct: d.correct + (patch.correct ?? 0),
      cards: d.cards + (patch.cards ?? 0),
      minutes: d.minutes + (patch.minutes ?? 0),
    },
  }
}

/** Reglas de desbloqueo de logros; cada una recibe el estado ya actualizado. */
const RULES: Record<string, (s: ProgressData, specialtiesSeen: number) => boolean> = {
  'first-answer': (s) => Object.keys(s.attempts).length >= 1,
  'answers-100': (s) => totalAnswered(s) >= 100,
  'answers-500': (s) => totalAnswered(s) >= 500,
  'answers-1000': (s) => totalAnswered(s) >= 1000,
  'streak-3': (s) => computeStreak(s.activity) >= 3,
  'streak-7': (s) => computeStreak(s.activity) >= 7,
  'streak-30': (s) => computeStreak(s.activity) >= 30,
  'first-exam': (s) => s.exams.length >= 1,
  'exam-80': (s) => s.exams.some((e) => e.total >= 20 && e.correct / e.total >= 0.8),
  'cards-50': (s) => s.totalCardsReviewed >= 50,
  'cards-300': (s) => s.totalCardsReviewed >= 300,
  'game-master': (s) => ['contrarreloj', 'supervivencia', 'verdadero-falso', 'parejas'].every((g) => s.highscores[g as GameId] !== undefined),
  'all-specialties': (_s, n) => n >= 10,
  'guide-reader': (s) => s.guidesRead.length >= 5,
  'perfect-10': (s) => s.bestRun >= 10,
}

function totalAnswered(s: ProgressData): number {
  let n = 0
  for (const a of Object.values(s.activity)) n += a.answered
  return n
}

/** Se mantiene fuera del estado persistido: especialidades vistas, para el logro "Médico integral". */
const specialtiesSeen = new Set<string>()

function checkAchievements(s: ProgressData): Pick<ProgressData, 'achievements' | 'xp'> | null {
  const unlocked: string[] = []
  for (const a of ACHIEVEMENTS) {
    if (s.achievements[a.id]) continue
    const rule = RULES[a.id]
    if (rule && rule(s, specialtiesSeen.size)) unlocked.push(a.id)
  }
  if (!unlocked.length) return null
  const achievements = { ...s.achievements }
  let xp = s.xp
  for (const id of unlocked) {
    const a = ACHIEVEMENTS.find((x) => x.id === id)!
    achievements[id] = Date.now()
    xp += a.xp
    useToasts.getState().push({ kind: 'achievement', title: a.title, body: `${a.description} · +${a.xp} XP`, icon: a.icon })
  }
  return { achievements, xp }
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => {
      /** Aplica un cambio y evalúa logros en el mismo paso. */
      const commit = (patch: Partial<ProgressData>) => {
        const next = { ...get(), ...patch }
        const extra = checkAchievements(next)
        set(extra ? { ...patch, ...extra } : patch)
      }

      return {
        ...INITIAL,

        recordAnswer: (q, choice) => {
          const s = get()
          const correct = choice === q.answer
          const prev = s.attempts[q.id]
          specialtiesSeen.add(q.specialty)
          const correctRun = correct ? s.correctRun + 1 : 0
          commit({
            attempts: {
              ...s.attempts,
              [q.id]: {
                seen: (prev?.seen ?? 0) + 1,
                correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
                lastCorrect: correct,
                lastAt: Date.now(),
                lastChoice: choice,
              },
            },
            activity: bumpDay(s.activity, { answered: 1, correct: correct ? 1 : 0 }),
            xp: s.xp + (correct ? 10 : 2),
            correctRun,
            bestRun: Math.max(s.bestRun, correctRun),
          })
          return correct
        },

        toggleBookmark: (id) => {
          const b = get().bookmarks
          set({ bookmarks: b.includes(id) ? b.filter((x) => x !== id) : [id, ...b] })
        },

        setNote: (id, note) => {
          const notes = { ...get().notes }
          if (note.trim()) notes[id] = note
          else delete notes[id]
          set({ notes })
        },

        saveExam: (r) => {
          commit({ exams: [r, ...get().exams].slice(0, 60), xp: get().xp + 30 })
        },

        reviewCard: (id, grade) => {
          const s = get()
          commit({
            srs: { ...s.srs, [id]: review(s.srs[id], grade) },
            activity: bumpDay(s.activity, { cards: 1 }),
            totalCardsReviewed: s.totalCardsReviewed + 1,
            xp: s.xp + (grade === 0 ? 1 : 3),
          })
        },

        addCustomCard: (c) => set({ customCards: [c, ...get().customCards] }),
        deleteCustomCard: (id) => {
          const srs = { ...get().srs }
          delete srs[id]
          set({ customCards: get().customCards.filter((c) => c.id !== id), srs })
        },

        markGuideRead: (id) => {
          const g = get().guidesRead
          if (g.includes(id)) return
          commit({ guidesRead: [...g, id], xp: get().xp + 15 })
        },

        recordGame: (id, score) => {
          const s = get()
          const prev = s.highscores[id]
          const isRecord = prev === undefined || score > prev
          commit({ highscores: { ...s.highscores, [id]: isRecord ? score : prev }, xp: s.xp + Math.min(50, Math.round(score / 2)) })
          return isRecord && score > 0
        },

        addMinutes: (n) => set({ activity: bumpDay(get().activity, { minutes: n }) }),

        updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

        resetProgress: () => {
          specialtiesSeen.clear()
          set({ ...INITIAL, settings: get().settings })
        },

        importBackup: (data) => {
          const clean: Partial<ProgressData> = {}
          for (const k of Object.keys(INITIAL) as (keyof ProgressData)[]) {
            if (data[k] !== undefined) (clean as Record<string, unknown>)[k] = data[k]
          }
          set({ ...clean, settings: { ...DEFAULT_SETTINGS, ...(data.settings ?? get().settings) } })
        },
      }
    },
    {
      name: 'medlogic-progress',
      version: 1,
      partialize: (s) => {
        const out: Partial<ProgressData> = {}
        for (const k of Object.keys(INITIAL) as (keyof ProgressData)[]) (out as Record<string, unknown>)[k] = s[k]
        return out as ProgressData
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProgressData>
        return { ...current, ...p, settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) } }
      },
    },
  ),
)

/** Registra las especialidades ya respondidas al arrancar (necesita el banco cargado). */
export function seedSpecialtiesSeen(attempts: Record<string, QuestionAttempt>, byId: Map<string, Question>) {
  for (const id of Object.keys(attempts)) {
    const q = byId.get(id)
    if (q) specialtiesSeen.add(q.specialty)
  }
}

// Niveles: el nivel n se alcanza con 50·n·(n−1) XP acumulados.
export function levelFromXp(xp: number) {
  let level = 1
  while (50 * (level + 1) * level <= xp) level++
  const base = 50 * level * (level - 1)
  const next = 50 * (level + 1) * level
  return { level, current: xp - base, needed: next - base, progress: (xp - base) / (next - base) }
}

const TITLES = ['Estudiante', 'Interno', 'Pasante', 'Médico general', 'Residente R1', 'Residente R2', 'Residente R3', 'Jefe de residentes', 'Especialista', 'Maestro clínico']
export function levelTitle(level: number): string {
  return TITLES[Math.min(TITLES.length - 1, Math.floor((level - 1) / 2))]
}
