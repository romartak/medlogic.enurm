import { useId } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

/** La «M» de MedLogic dibujada como un latido: pie plano, subida, valle, subida y vuelta al pie, con un punto al final. */
const PULSE = 'M9 40H15L22 18 32 44 42 18 49 40H52'
/** El punto del final: la señal que sigue viva. */
const DOT = { cx: 56, cy: 40, r: 3.2, fill: '#a7f3d0' }
const STROKE = 4.6

/**
 * Fondo de la marca: un cuadrado de esquinas amplias en verde azulado, con un brillo suave arriba a la izquierda y
 * un filo interior casi invisible. Es el mismo en el favicon, los iconos de la aplicación y la pantalla de carga.
 */
function MarkBase({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14bfac" />
          <stop offset="0.55" stopColor="#078377" />
          <stop offset="1" stopColor="#055b53" />
        </linearGradient>
        <radialGradient id={`${id}-h`} cx="0.28" cy="0.18" r="0.78">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${id}-g)`} />
      <rect width="64" height="64" rx="18" fill={`url(#${id}-h)`} />
      <rect x="0.5" y="0.5" width="63" height="63" rx="17.5" fill="none" stroke="#fff" strokeOpacity="0.18" />
    </>
  )
}

export function LogoMark({ className }: { className?: string }) {
  const id = `lm${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg viewBox="0 0 64 64" className={className ?? 'size-9'} aria-hidden>
      <MarkBase id={id} />
      <path d={PULSE} fill="none" stroke="#fff" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <circle {...DOT} />
    </svg>
  )
}

/** Logo con el trazo dibujándose: una vez (entrada) o en bucle (pantalla de carga). */
export function AnimatedLogoMark({ className, loop = false, delay = 0 }: { className?: string; loop?: boolean; delay?: number }) {
  const id = `la${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg viewBox="0 0 64 64" className={className ?? 'size-16'} aria-hidden>
      <MarkBase id={id} />
      <path d={PULSE} fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <motion.path
        d={PULSE}
        fill="none"
        stroke="#fff"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={loop ? { pathLength: [0, 1, 1], opacity: [1, 1, 0] } : { pathLength: 1, opacity: 1 }}
        transition={loop ? { duration: 1.8, times: [0, 0.55, 1], ease: 'easeInOut', repeat: Infinity, delay } : { duration: 0.9, ease: [0.65, 0, 0.35, 1], delay }}
      />
      <motion.circle
        {...DOT}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={loop ? { opacity: [0, 0, 1, 1, 0], scale: [0.4, 0.4, 1, 1, 1] } : { opacity: 1, scale: 1 }}
        style={{ transformOrigin: `${DOT.cx}px ${DOT.cy}px` }}
        transition={loop ? { duration: 1.8, times: [0, 0.5, 0.6, 0.85, 1], repeat: Infinity, delay } : { duration: 0.3, delay: delay + 0.8 }}
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="leading-none">
        <span className="block font-display text-[18px] font-extrabold tracking-tight">MedLogic</span>
        <span className="mt-1 block text-[10px] font-bold tracking-[0.24em] text-brand-700 uppercase dark:text-brand-400">ENURM</span>
      </span>
    </span>
  )
}

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.67.56.1.77-.24.77-.54v-1.9c-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.8 10.8 0 0 1 5.65 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.33-2.64 5.28-5.15 5.56.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.78.54a11.26 11.26 0 0 0 7.68-10.67C23.25 5.48 18.27.5 12 .5Z" />
    </svg>
  )
}
