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

interface Tone {
  /** Hz */
  f: number
  /** inicio (s) */
  t: number
  /** duración (s) */
  d: number
  type?: OscillatorType
  gain?: number
  /** Hz final, para deslizar el tono */
  to?: number
}

function playTones(tones: Tone[]) {
  if (!useProgress.getState().settings.sound) return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const now = ctx.currentTime + 0.01
    const master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
    for (const tone of tones) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = tone.type ?? 'sine'
      osc.frequency.setValueAtTime(tone.f, now + tone.t)
      if (tone.to) osc.frequency.exponentialRampToValueAtTime(tone.to, now + tone.t + tone.d)
      const peak = tone.gain ?? 0.12
      g.gain.setValueAtTime(0.0001, now + tone.t)
      g.gain.exponentialRampToValueAtTime(peak, now + tone.t + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, now + tone.t + tone.d)
      osc.connect(g).connect(master)
      osc.start(now + tone.t)
      osc.stop(now + tone.t + tone.d + 0.02)
    }
  } catch {
    /* audio no disponible */
  }
}

/**
 * Sonidos de las lecciones de terminología, al estilo de las apps de idiomas:
 * acierto con dos campanitas ascendentes, error con un «bonk» grave, fanfarria al terminar.
 */
export function playLesson(kind: 'correct' | 'wrong' | 'complete' | 'tap' | 'fail') {
  const sounds: Record<typeof kind, Tone[]> = {
    correct: [
      { f: 1046.5, t: 0, d: 0.22, type: 'triangle', gain: 0.14 },
      { f: 2093, t: 0, d: 0.12, type: 'sine', gain: 0.03 },
      { f: 1568, t: 0.09, d: 0.34, type: 'triangle', gain: 0.14 },
      { f: 3136, t: 0.09, d: 0.16, type: 'sine', gain: 0.025 },
    ],
    wrong: [
      { f: 196, t: 0, d: 0.16, type: 'square', gain: 0.05, to: 170 },
      { f: 147, t: 0.13, d: 0.28, type: 'square', gain: 0.05, to: 120 },
      { f: 98, t: 0.13, d: 0.28, type: 'sine', gain: 0.1 },
    ],
    complete: [
      { f: 523.3, t: 0, d: 0.16, type: 'triangle' },
      { f: 659.3, t: 0.12, d: 0.16, type: 'triangle' },
      { f: 784, t: 0.24, d: 0.16, type: 'triangle' },
      { f: 1046.5, t: 0.36, d: 0.55, type: 'triangle', gain: 0.14 },
      { f: 784, t: 0.36, d: 0.55, type: 'sine', gain: 0.06 },
      { f: 1318.5, t: 0.36, d: 0.55, type: 'sine', gain: 0.05 },
    ],
    tap: [{ f: 1800, t: 0, d: 0.04, type: 'sine', gain: 0.025 }],
    fail: [
      { f: 392, t: 0, d: 0.22, type: 'triangle', gain: 0.1 },
      { f: 349.2, t: 0.2, d: 0.22, type: 'triangle', gain: 0.1 },
      { f: 293.7, t: 0.4, d: 0.5, type: 'triangle', gain: 0.1 },
    ],
  }
  playTones(sounds[kind])
}
