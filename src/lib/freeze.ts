import type { DayActivity } from '@/types'
import { computeStreak } from './stats'
import { addDays, dayKey } from './utils'

/**
 * Congeladores de racha: si un día se falla, un congelador lo «cubre» y la racha sigue viva.
 *  - Se gana uno cada vez que la racha llega a un múltiplo de 7 (7, 14, 21…), y se guardan hasta 2.
 *  - Se usa solo, para ayer, si ayer no se estudió, la racha llevaba 3 días o más y queda alguno.
 *  - Un día congelado no suma a la racha: solo evita que se rompa.
 */
export interface StreakFreeze {
  /** Congeladores disponibles ahora. */
  available: number
  /** Último múltiplo de 7 por el que ya se dio uno (para no darlo dos veces). */
  awardedAt: number
  /** Días (aaaa-mm-dd) que quedaron cubiertos. */
  frozen: string[]
}

export const EMPTY_FREEZE: StreakFreeze = { available: 0, awardedAt: 0, frozen: [] }
export const MAX_FREEZES = 2
/** Racha mínima para que valga la pena cubrirla. */
export const MIN_STREAK_TO_FREEZE = 3

const active = (d: DayActivity | undefined) => !!d && d.answered + d.cards + d.minutes > 0

export interface FreezePlan {
  state: StreakFreeze
  /** Día que se cubrió en esta pasada, si se usó un congelador. */
  used: string | null
  /** true si se ganó un congelador en esta pasada. */
  awarded: boolean
}

/** Calcula el siguiente estado de los congeladores. Si nada cambia, devuelve el mismo objeto de estado. */
export function planFreeze(activity: Record<string, DayActivity>, state: StreakFreeze, today = new Date()): FreezePlan {
  let { available, awardedAt } = state
  let frozen = state.frozen
  let used: string | null = null

  // 1. ¿Ayer se falló y la racha estaba viva? Se cubre con un congelador.
  const yesterday = addDays(today, -1)
  const yKey = dayKey(yesterday)
  const before = addDays(today, -2)
  const alive = (d: Date) => active(activity[dayKey(d)]) || frozen.includes(dayKey(d))
  if (available > 0 && !active(activity[yKey]) && !frozen.includes(yKey) && alive(before) && computeStreak(activity, before, frozen) >= MIN_STREAK_TO_FREEZE) {
    frozen = [...frozen, yKey]
    available -= 1
    used = yKey
  }

  // 2. ¿La racha llegó a un múltiplo de 7 nuevo? Se gana un congelador.
  const streak = computeStreak(activity, today, frozen)
  const milestone = Math.floor(streak / 7) * 7
  let awarded = false
  if (milestone > awardedAt) {
    if (available < MAX_FREEZES) {
      available += 1
      awarded = true
    }
    awardedAt = milestone
  } else if (streak < awardedAt) {
    awardedAt = milestone // la racha se rompió: los próximos múltiplos vuelven a dar premio
  }

  // 3. Se olvidan los días cubiertos de hace más de 60 días.
  const limit = dayKey(addDays(today, -60))
  const kept = frozen.filter((k) => k >= limit)
  if (kept.length !== frozen.length) frozen = kept

  const same = available === state.available && awardedAt === state.awardedAt && frozen === state.frozen
  return { state: same ? state : { available, awardedAt, frozen }, used, awarded }
}

const DAY = /^\d{4}-\d{2}-\d{2}$/
const num = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(0, Math.floor(v))) : 0)

/** Limpia un estado de congeladores que viene de fuera (respaldo, nube): solo se aceptan los tipos esperados. */
export function sanitizeFreeze(v: unknown): StreakFreeze {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return EMPTY_FREEZE
  const o = v as Record<string, unknown>
  const frozen = Array.isArray(o.frozen) ? o.frozen.filter((k): k is string => typeof k === 'string' && DAY.test(k)).slice(-120) : []
  return { available: num(o.available, MAX_FREEZES), awardedAt: num(o.awardedAt, 5000), frozen }
}
