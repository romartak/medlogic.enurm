import type { SrsGrade, SrsState } from '@/types'

const DAY = 86_400_000
const MIN = 60_000

export function newSrsState(now = Date.now()): SrsState {
  return { ease: 2.5, interval: 0, reps: 0, due: now, lapses: 0, lastReview: 0 }
}

/**
 * Variante de SM-2 con cuatro botones (Otra vez, Difícil, Bien, Fácil).
 * `interval` se expresa en días; una tarjeta fallada vuelve a aparecer a los 10 minutos.
 */
export function review(prev: SrsState | undefined, grade: SrsGrade, now = Date.now()): SrsState {
  const s = prev ?? newSrsState(now)
  let { ease, interval, reps, lapses } = s

  if (grade === 0) {
    lapses += 1
    reps = 0
    interval = 0
    ease = Math.max(1.3, ease - 0.2)
    return { ease, interval, reps, lapses, due: now + 10 * MIN, lastReview: now }
  }

  if (grade === 1) {
    interval = reps === 0 ? 1 : Math.max(interval + 1, Math.round(interval * 1.2))
    ease = Math.max(1.3, ease - 0.15)
  } else if (grade === 2) {
    interval = reps === 0 ? 1 : reps === 1 ? 4 : Math.round(interval * ease)
  } else {
    interval = reps === 0 ? 4 : Math.round(Math.max(interval, 1) * ease * 1.3)
    ease = ease + 0.15
  }

  reps += 1
  interval = Math.min(interval, 365)
  return { ease, interval, reps, lapses, due: now + interval * DAY, lastReview: now }
}

/** Texto corto con el próximo intervalo que daría cada botón. */
export function previewInterval(prev: SrsState | undefined, grade: SrsGrade): string {
  const next = review(prev, grade, 0)
  if (grade === 0) return '10 min'
  const d = next.interval
  if (d < 30) return `${d} d`
  if (d < 365) return `${Math.round(d / 30)} m`
  return '1 a'
}

export function isDue(s: SrsState | undefined, now = Date.now()): boolean {
  return !s || s.due <= now
}

/** 0 = nueva, 1 = aprendiendo, 2 = joven (< 21 d), 3 = madura. */
export function maturity(s: SrsState | undefined): 0 | 1 | 2 | 3 {
  if (!s || s.lastReview === 0) return 0
  if (s.reps === 0 || s.interval < 1) return 1
  return s.interval < 21 ? 2 : 3
}
