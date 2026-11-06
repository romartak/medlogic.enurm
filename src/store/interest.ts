import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SectionUsage, UsageMap } from '@/lib/interest'

interface InterestState {
  usage: UsageMap
  /** Suma tiempo de uso activo a una sección. */
  addTime: (section: string, ms: number) => void
  /** Cuenta una entrada a la sección. */
  addVisit: (section: string) => void
  clear: () => void
}

const EMPTY: SectionUsage = { ms: 0, visits: 0, last: 0 }

/**
 * Qué secciones usa la persona y por cuánto tiempo. Vive solo en este dispositivo (no se sincroniza
 * ni se envía a ningún servidor): sirve únicamente para adaptar las sugerencias de Inicio.
 */
export const useInterest = create<InterestState>()(
  persist(
    (set, get) => ({
      usage: {},
      addTime: (section, ms) => {
        const u = get().usage[section] ?? EMPTY
        set({ usage: { ...get().usage, [section]: { ...u, ms: u.ms + ms, last: Date.now() } } })
      },
      addVisit: (section) => {
        const u = get().usage[section] ?? EMPTY
        set({ usage: { ...get().usage, [section]: { ...u, visits: u.visits + 1, last: Date.now() } } })
      },
      clear: () => set({ usage: {} }),
    }),
    { name: 'medlogic-interest', version: 1, partialize: (s) => ({ usage: s.usage }) },
  ),
)
