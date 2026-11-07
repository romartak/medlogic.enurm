import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MetaRecord } from '@/lib/metacog'

/** Cuántas respuestas recientes se guardan (suficiente para ver la tendencia sin crecer sin límite). */
const MAX_RECORDS = 800

interface MetacogState {
  records: MetaRecord[]
  /** Si pregunta «¿qué tan seguro estás?» antes de responder en Práctica. */
  askConfidence: boolean
  record: (r: MetaRecord) => void
  setAskConfidence: (v: boolean) => void
  clear: () => void
}

/** Tiempo y seguridad de cada respuesta. Solo vive en este dispositivo. */
export const useMetacog = create<MetacogState>()(
  persist(
    (set, get) => ({
      records: [],
      askConfidence: true,
      record: (r) => set({ records: [...get().records, r].slice(-MAX_RECORDS) }),
      setAskConfidence: (askConfidence) => set({ askConfidence }),
      clear: () => set({ records: [] }),
    }),
    { name: 'medlogic-metacog', version: 1, partialize: (s) => ({ records: s.records, askConfidence: s.askConfidence }) },
  ),
)
