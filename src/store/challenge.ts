import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CHALLENGE, newChallenge, progressOf, withAnswer, type Challenge } from '@/lib/challenge'
import { useProgress } from '@/store/progress'
import { toast } from '@/store/toasts'

export interface ChallengeDone {
  specialty: string
  topic: string
  completedAt: number
}

interface ChallengeStore {
  active: Challenge | null
  /** Los últimos retos completados. */
  history: ChallengeDone[]
  start: (specialty: string, topic: string) => void
  /** Anota una respuesta de práctica. Devuelve true si con ella se completó el reto. */
  record: (question: { specialty: string }, ok: boolean) => boolean
  abandon: () => void
}

/** Reto de 7 días activo y su historial. Vive solo en este dispositivo. */
export const useChallenge = create<ChallengeStore>()(
  persist(
    (set, get) => ({
      active: null,
      history: [],
      start: (specialty, topic) => set({ active: newChallenge(specialty, topic) }),
      record: (question, ok) => {
        const cur = get().active
        if (!cur || cur.specialty !== question.specialty || progressOf(cur).state !== 'activo') return false
        const next = withAnswer(cur, ok)
        const finished = progressOf(next).state === 'completado'
        if (!finished) {
          set({ active: next })
          return false
        }
        const completedAt = Date.now()
        set({ active: { ...next, completedAt }, history: [{ specialty: cur.specialty, topic: cur.topic, completedAt }, ...get().history].slice(0, 20) })
        useProgress.getState().addXp(CHALLENGE.reward)
        toast({ kind: 'success', title: '¡Reto de 7 días completado!', body: `+${CHALLENGE.reward} XP por ${cur.topic}.` })
        return true
      },
      abandon: () => set({ active: null }),
    }),
    { name: 'medlogic-retos', version: 1, partialize: (s) => ({ active: s.active, history: s.history }) },
  ),
)
