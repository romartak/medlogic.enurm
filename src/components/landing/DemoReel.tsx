import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotionConfig, type Variants } from 'motion/react'
import { BatteryFull, Flame, Layers, Play, Signal, Sparkles, Trophy, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Demo {
  id: string
  title: string
  body: string
  sticker: ReactNode
  /** Inclinación del teléfono en escritorio: le da un aire de mesa de trabajo, no de catálogo. */
  tilt: string
  /** Dónde va la etiqueta si la posición alterna (arriba a la izquierda o abajo a la derecha) tapa algo del video. */
  stickerAt?: string
}

const DEMOS: Demo[] = [
  {
    id: 'pregunta',
    title: 'Entiende el porqué',
    body: 'Responde y al instante ves por qué la correcta lo es y por qué las demás no.',
    sticker: (
      <>
        <Sparkles className="size-4 text-amber-500" /> +20 XP
      </>
    ),
    tilt: 'lg:-rotate-2',
  },
  {
    id: 'simulacro',
    title: 'Simulacros con reloj',
    body: 'Como el día del examen: cronómetro, nota final y resultado por especialidad.',
    sticker: (
      <>
        <Trophy className="size-4 text-brand-600" /> 80/100
      </>
    ),
    tilt: 'lg:rotate-1 lg:translate-y-8',
  },
  {
    id: 'plan',
    title: 'Tu plan de cada día',
    body: 'Tareas concretas, tu racha y los días que faltan para el ENURM, siempre a la vista.',
    sticker: (
      <>
        <Flame className="size-4 text-orange-500" /> 6 días seguidos
      </>
    ),
    tilt: 'lg:-rotate-1',
    // Sobre el borde del teléfono: a la altura de top-16 tapaba el título «Tu plan de hoy».
    stickerAt: '-left-3 -top-3',
  },
  {
    id: 'flashcards',
    title: 'Flashcards que se repasan solas',
    body: 'Estilo Anki: cada tarjeta vuelve justo antes de que se te olvide.',
    sticker: (
      <>
        <Layers className="size-4 text-sky-600" /> Repaso espaciado
      </>
    ),
    tilt: 'lg:rotate-2 lg:translate-y-8',
  },
]

/**
 * Video corto en bucle dentro de un teléfono. Solo se descarga y se reproduce cuando está a la vista
 * (ahorra datos en el celular). Tocarlo lo pausa o lo reanuda; con «reducir movimiento» (del sistema o de
 * Configuración) se queda quieto hasta que lo toquen.
 */
function PhoneVideo({ id, title }: { id: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotionConfig()
  const [playing, setPlaying] = useState(false)
  /** Pausado a mano: no se reanuda solo al volver a la vista. */
  const [held, setHeld] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v || reduce || held) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.5 },
    )
    io.observe(v)
    // Empieza a bajar el video un poco antes de que llegue a la vista, para que no aparezca en blanco.
    const warm = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        v.preload = 'auto'
        warm.disconnect()
      },
      { rootMargin: '600px 600px' },
    )
    warm.observe(v)
    return () => {
      io.disconnect()
      warm.disconnect()
    }
  }, [reduce, held])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) {
      setHeld(false)
      void v.play().catch(() => {})
    } else {
      setHeld(true)
      v.pause()
    }
  }

  return (
    <div className="relative mx-auto w-[min(15.5rem,70vw)] rounded-[2.4rem] bg-slate-900 p-[7px] shadow-[0_30px_60px_-20px_rgb(15_23_42/0.45)] ring-1 ring-slate-900/10 dark:ring-white/10">
      <div className="overflow-hidden rounded-[1.95rem] bg-white">
        {/* Barra de estado de mentira: la isla no tapa la cabecera de la app. */}
        <div className="relative flex h-7 items-center justify-between px-5 text-[10px] font-semibold text-slate-900" aria-hidden>
          <span>9:41</span>
          <span className="absolute top-1.5 left-1/2 h-[18px] w-[68px] -translate-x-1/2 rounded-full bg-slate-900" />
          <span className="flex items-center gap-1">
            <Signal className="size-3" />
            <Wifi className="size-3" />
            <BatteryFull className="size-3.5" />
          </span>
        </div>
        <video
          ref={ref}
          className="block aspect-[390/844] w-full object-cover"
          poster={`${import.meta.env.BASE_URL}demo/${id}.webp`}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src={`${import.meta.env.BASE_URL}demo/${id}.mp4`} type="video/mp4" />
        </video>
      </div>
      <button type="button" onClick={toggle} className="absolute inset-0 grid place-items-center rounded-[2.4rem]" aria-label={`${playing ? 'Pausar' : 'Reproducir'} la demostración: ${title}`}>
        {!playing && (reduce || held) && (
          <span className="grid size-14 place-items-center rounded-full bg-slate-900/70 text-white">
            <Play className="ml-0.5 size-6 fill-current" />
          </span>
        )}
      </button>
    </div>
  )
}

/**
 * Entrada en cascada disparada por la lista entera: en el celular los teléfonos de la derecha están fuera de
 * la pantalla, y con su propio `whileInView` aparecían a medio animar al deslizar.
 */
const LIST: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const ITEM: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}
/** El rebote va solo en escala y giro: un resorte en la opacidad se pasa de 1 y parpadea. */
const sticker = (i: number): Variants => ({
  hidden: { opacity: 0, scale: 0.6, rotate: -8 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: i % 2 ? 4 : -4,
    transition: { opacity: { duration: 0.2, delay: 0.3 }, default: { type: 'spring', stiffness: 260, damping: 14, delay: 0.3 } },
  },
})

/** «Míralo en acción»: la app de verdad grabada en un celular, en vez de capturas estáticas. */
export function DemoReel() {
  return (
    <section id="en-accion" aria-labelledby="en-accion-titulo" className="relative scroll-mt-24 overflow-hidden py-16 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-24 -z-10 mx-auto h-72 max-w-5xl rounded-full bg-brand-500/10 blur-3xl" />
      <div className="mx-auto max-w-2xl px-4 text-center">
        <div className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase dark:text-brand-400">Míralo en acción</div>
        <h2 id="en-accion-titulo" className="mt-3 text-3xl font-extrabold text-balance sm:text-4xl">
          Así se estudia en MedLogic
        </h2>
        <p className="mt-3 text-pretty text-muted">Nada de capturas bonitas: esto es la app real, en un celular, tal como la vas a usar.</p>
      </div>

      {/* En el celular se desliza de lado; en escritorio, los cuatro a la vista. */}
      <motion.ul
        variants={LIST}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(1rem,calc((100vw-15.5rem)/2))] pt-4 pb-10 [scrollbar-width:none] lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:px-8 lg:pb-16"
      >
        {DEMOS.map((d, i) => (
          <motion.li key={d.id} variants={ITEM} className="w-[min(15.5rem,70vw)] shrink-0 snap-center lg:w-auto">
            <div className={cn('relative', d.tilt)}>
              <PhoneVideo id={d.id} title={d.title} />
              <motion.span
                variants={sticker(i)}
                aria-hidden
                className={cn('pointer-events-none absolute z-20 inline-flex items-center gap-1.5 rounded-full border border-soft bg-[var(--surface)] px-3 py-1.5 text-xs font-bold whitespace-nowrap shadow-lift', d.stickerAt ?? (i % 2 ? '-right-2 bottom-16' : '-left-2 top-16'))}
              >
                {d.sticker}
              </motion.span>
            </div>
            <div className="mt-6 text-center">
              <h3 className="font-display text-lg font-extrabold">{d.title}</h3>
              <p className="mx-auto mt-1 max-w-[16rem] text-sm text-pretty text-muted">{d.body}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
      <p className="-mt-4 text-center text-xs font-semibold text-muted lg:hidden" aria-hidden>
        Desliza para ver más →
      </p>
    </section>
  )
}
