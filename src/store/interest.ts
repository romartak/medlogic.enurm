import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SectionUsage, UsageMap } from '@/lib/interest'

interface InterestState {
  /** Uso por sección del menú (/casos, /guias…). */
  usage: UsageMap
  /** Uso por tema concreto: una especialidad (`esp:cardiologia`) o una guía (`guia:dengue`). */
  topics: UsageMap
  /** Milisegundos de uso activo en cada hora del día (0–23). */
  hours: number[]
  /** Cuántas veces se pulsó cada botón rastreado (`data-track`). */
  events: Record<string, { n: number; last: number }>
  /** Sesiones de uso (cada vez que se abre la app) y su duración activa total. */
  sessions: { count: number; ms: number }
  addTime: (section: string, topic: string | null, ms: number) => void
  addVisit: (section: string | null, topic: string | null) => void
  track: (event: string) => void
  startSession: () => void
  clear: () => void
}

const EMPTY: SectionUsage = { ms: 0, visits: 0, last: 0 }
const emptyHours = () => new Array<number>(24).fill(0)

function bump(map: UsageMap, key: string | null, patch: Partial<SectionUsage>, add: Partial<SectionUsage>): UsageMap {
  if (!key) return map
  const u = map[key] ?? EMPTY
  return { ...map, [key]: { ms: u.ms + (add.ms ?? 0), visits: u.visits + (add.visits ?? 0), last: patch.last ?? u.last } }
}

/**
 * Qué usa la persona, cuándo y por cuánto tiempo. Vive solo en este dispositivo (no se sincroniza
 * ni se envía a ningún servidor): sirve únicamente para adaptar las sugerencias.
 */
export const useInterest = create<InterestState>()(
  persist(
    (set, get) => ({
      usage: {},
      topics: {},
      hours: emptyHours(),
      events: {},
      sessions: { count: 0, ms: 0 },
      addTime: (section, topic, ms) => {
        const now = Date.now()
        const hours = get().hours.slice()
        hours[new Date(now).getHours()] += ms
        const s = get().sessions
        set({
          usage: bump(get().usage, section, { last: now }, { ms }),
          topics: bump(get().topics, topic, { last: now }, { ms }),
          hours,
          sessions: { ...s, ms: s.ms + ms },
        })
      },
      addVisit: (section, topic) => {
        const now = Date.now()
        set({ usage: bump(get().usage, section, { last: now }, { visits: 1 }), topics: bump(get().topics, topic, { last: now }, { visits: 1 }) })
      },
      track: (event) => {
        const e = get().events[event]
        set({ events: { ...get().events, [event]: { n: (e?.n ?? 0) + 1, last: Date.now() } } })
      },
      startSession: () => set({ sessions: { ...get().sessions, count: get().sessions.count + 1 } }),
      clear: () => set({ usage: {}, topics: {}, hours: emptyHours(), events: {}, sessions: { count: 0, ms: 0 } }),
    }),
    {
      name: 'medlogic-interest',
      version: 1,
      partialize: (s) => ({ usage: s.usage, topics: s.topics, hours: s.hours, events: s.events, sessions: s.sessions }),
    },
  ),
)

/** Anota que se pulsó un botón. Se puede llamar desde cualquier parte, o marcar el elemento con `data-track="nombre"`. */
export const trackEvent = (event: string) => useInterest.getState().track(event)
