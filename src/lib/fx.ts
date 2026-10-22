import confetti from 'canvas-confetti'
import { useProgress } from '@/store/progress'

const COLORS = ['#06c4b0', '#6366f1', '#ec4899', '#f59e0b', '#22c55e']

function motionAllowed() {
  return !useProgress.getState().settings.reduceMotion && !matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function celebrate(intensity: 'small' | 'big' = 'small') {
  if (!motionAllowed()) return
  if (intensity === 'small') {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, colors: COLORS, scalar: 0.9 })
    return
  }
  const end = Date.now() + 1200
  const frame = () => {
    confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0 }, colors: COLORS })
    confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1 }, colors: COLORS })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

let ctx: AudioContext | null = null

/** Sonidos cortos sintetizados (sin archivos de audio). */
export function playSound(kind: 'correct' | 'wrong' | 'tick' | 'win') {
  if (!useProgress.getState().settings.sound) return
  try {
    ctx ??= new AudioContext()
    const now = ctx.currentTime
    const notes: Record<typeof kind, [number, number][]> = {
      correct: [[660, 0], [880, 0.08]],
      wrong: [[220, 0], [180, 0.1]],
      tick: [[1200, 0]],
      win: [[523, 0], [659, 0.1], [784, 0.2], [1046, 0.3]],
    }
    for (const [freq, t] of notes[kind]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = kind === 'wrong' ? 'sawtooth' : 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now + t)
      gain.gain.exponentialRampToValueAtTime(kind === 'tick' ? 0.03 : 0.08, now + t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.18)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + t)
      osc.stop(now + t + 0.2)
    }
  } catch {
    /* audio no disponible */
  }
}
