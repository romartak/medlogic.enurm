import { useEffect } from 'react'
import { create } from 'zustand'
import { AnimatePresence, motion } from 'motion/react'
import { AnimatedLogoMark } from '@/components/ui/Logo'
import { motionAllowed, playSound } from '@/lib/fx'

interface RevealState {
  open: boolean
  subtitle: string
  onCovered: (() => void) | null
  show: (opts: { subtitle: string; onCovered: () => void }) => void
  hide: () => void
}

const useReveal = create<RevealState>()((set) => ({
  open: false,
  subtitle: '',
  onCovered: null,
  show: ({ subtitle, onCovered }) => set({ open: true, subtitle, onCovered }),
  hide: () => set({ open: false, onCovered: null }),
}))

/**
 * Presentación al crear el plan: un círculo de color cubre la pantalla, la deja en blanco,
 * entra el logo con ondas y formas, y el círculo se cierra mostrando el plan.
 * `onCovered` se llama cuando la pantalla ya está tapada (ahí se cambia de página).
 * Con «reducir movimiento» no hay animación: se llama a `onCovered` directamente.
 */
export function revealPlan(subtitle: string, onCovered: () => void) {
  if (!motionAllowed()) return onCovered()
  let done = false
  const once = () => {
    if (!done) (done = true), onCovered()
  }
  useReveal.getState().show({ subtitle, onCovered: once })
}

const EASE = [0.76, 0, 0.24, 1] as const
const COLORS = ['#0ba595', '#6366f1', '#ec4899', '#f59e0b', '#14b8a6', '#8b5cf6']
const SHAPES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2 + (i % 2 ? 0.18 : -0.1)
  const dist = 150 + (i % 3) * 46
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, color: COLORS[i % COLORS.length], kind: (['dot', 'square', 'ring', 'plus', 'tri'] as const)[i % 5], rotate: (i % 2 ? 1 : -1) * (90 + i * 20), size: 13 + (i % 3) * 6 }
})

function Shape({ kind, color, size }: { kind: (typeof SHAPES)[number]['kind']; color: string; size: number }) {
  if (kind === 'dot') return <span className="block rounded-full" style={{ width: size, height: size, background: color }} />
  if (kind === 'square') return <span className="block rounded-[3px]" style={{ width: size, height: size, background: color }} />
  if (kind === 'ring') return <span className="block rounded-full" style={{ width: size + 6, height: size + 6, border: `3px solid ${color}` }} />
  if (kind === 'tri') return <span className="block" style={{ width: size + 4, height: size + 4, background: color, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
  return (
    <span className="relative block" style={{ width: size + 6, height: size + 6 }}>
      <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full" style={{ background: color }} />
      <span className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full" style={{ background: color }} />
    </span>
  )
}

export function PlanReveal() {
  const { open, subtitle, onCovered, hide } = useReveal()

  useEffect(() => {
    if (!open) return
    const timers = [setTimeout(() => onCovered?.(), 850), setTimeout(() => playSound('win'), 750), setTimeout(hide, 3000)]
    const skip = (e: KeyboardEvent) => e.key === 'Escape' && hide()
    window.addEventListener('keydown', skip)
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', skip)
    }
  }, [open, onCovered, hide])

  const close = () => {
    onCovered?.()
    hide()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="reveal"
          className="fixed inset-0 z-[100] cursor-pointer overflow-hidden"
          onClick={close}
          role="status"
          aria-live="polite"
          initial={{ clipPath: 'circle(150% at 50% 50%)' }}
          exit={{ clipPath: 'circle(0% at 50% 50%)', transition: { duration: 0.6, ease: EASE } }}
        >
          {/* 1. Círculo de color que crece */}
          <motion.div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0ba595, #6366f1)' }} initial={{ clipPath: 'circle(0% at 50% 50%)' }} animate={{ clipPath: 'circle(75% at 50% 50%)' }} transition={{ duration: 0.55, ease: EASE }} />
          {/* 2. Le sigue uno blanco: la página queda en blanco */}
          <motion.div className="absolute inset-0 bg-white" initial={{ clipPath: 'circle(0% at 50% 50%)' }} animate={{ clipPath: 'circle(75% at 50% 50%)' }} transition={{ duration: 0.6, ease: EASE, delay: 0.28 }} />

          <div className="absolute inset-0 grid place-items-center">
            <div className="relative grid place-items-center">
              {/* 3. Ondas expansivas */}
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="absolute size-28 rounded-full border-2" style={{ borderColor: i === 1 ? '#6366f1' : '#0ba595' }} initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: [0.3, 2.8], opacity: [0, 0.7, 0] }} transition={{ duration: 1.1, delay: 0.8 + i * 0.14, ease: 'easeOut' }} />
              ))}
              {/* 4. Formas que salen disparadas */}
              {SHAPES.map((s, i) => (
                <motion.span
                  key={i}
                  className="absolute"
                  initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                  animate={{ x: [0, s.x, s.x * 1.12], y: [0, s.y, s.y * 1.12 + 14], scale: [0, 1, 0.9], rotate: s.rotate, opacity: [1, 1, 0] }}
                  transition={{ duration: 1.5, times: [0, 0.45, 1], delay: 0.82 + (i % 4) * 0.03, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Shape kind={s.kind} color={s.color} size={s.size} />
                </motion.span>
              ))}
              {/* 5. Entra el logo */}
              <motion.div initial={{ scale: 0, rotate: -120 }} animate={{ scale: [0, 1.18, 1], rotate: 0 }} transition={{ duration: 0.75, delay: 0.7, ease: [0.34, 1.56, 0.64, 1] }} className="relative">
                <AnimatedLogoMark delay={1.05} className="size-24 drop-shadow-[0_18px_40px_rgba(13,148,136,0.35)] sm:size-28" />
              </motion.div>
            </div>

            <div className="absolute inset-x-4 top-[calc(50%+96px)] text-center sm:top-[calc(50%+110px)]">
              <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Tu plan está listo
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.38, duration: 0.5 }} className="mt-2 text-balance text-slate-500">
                {subtitle}
              </motion.p>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.45, duration: 1.4, ease: 'easeInOut' }} className="mx-auto mt-6 h-1 w-28 origin-left rounded-full bg-brand-500" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
