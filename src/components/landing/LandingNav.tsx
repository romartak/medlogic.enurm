import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useScroll } from 'motion/react'
import { ArrowRight, CalendarDays, CircleHelp, Compass, LayoutGrid, LogIn, Menu, X, type LucideIcon } from 'lucide-react'
import { AnimatedLogoMark } from '@/components/ui/Logo'
import { buttonClass } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { useProgress } from '@/store/progress'
import { hadAccount } from '@/lib/account'

export type SectionLink = readonly [href: string, label: string]

type Go = (href: string) => (e: MouseEvent) => void

const META: Record<string, { short: string; desc: string; icon: LucideIcon }> = {
  '#examen': { short: 'Examen', desc: 'Fecha, puntaje y requisitos', icon: CalendarDays },
  '#funciones': { short: 'Funciones', desc: 'Todo lo que puedes estudiar', icon: LayoutGrid },
  '#plan': { short: 'Método', desc: 'Tu plan diario paso a paso', icon: Compass },
  '#preguntas': { short: 'Preguntas', desc: 'Lo que todos preguntan', icon: CircleHelp },
}

/** Índice de la sección que se está leyendo (-1 = arriba del todo). Solo cambia el estado al cruzar de una a otra. */
function useActiveSection(hrefs: readonly string[]) {
  const { scrollY } = useScroll()
  const [active, setActive] = useState(-1)
  useEffect(() => {
    const update = () => {
      const line = window.innerHeight * 0.35
      let idx = -1
      hrefs.forEach((h, i) => {
        const el = document.querySelector(h)
        if (el && el.getBoundingClientRect().top <= line) idx = i
      })
      setActive((p) => (p === idx ? p : idx))
    }
    update()
    return scrollY.on('change', update)
  }, [hrefs, scrollY])
  return active
}

/** Quien ya usó la plataforma (con o sin cuenta) vuelve a entrar: se le ofrece seguir, no empezar de cero. */
export function useReturning(): boolean {
  const status = useAuth((s) => s.status)
  const started = useProgress((s) => s.profile.completed || s.profile.skipped || Object.keys(s.attempts).length > 0)
  return status === 'signed-in' || started || hadAccount()
}

/**
 * Cabecera de la portada: una píldora flotante. En escritorio, un resaltado se desliza hasta la sección que se lee
 * (o hasta la que señala el cursor); en el teléfono la píldora muestra la sección actual y se despliega con la lista.
 */
export function LandingNav({ sections, onGo }: { sections: readonly SectionLink[]; onGo: Go }) {
  const [hrefs] = useState(() => sections.map(([h]) => h))
  const active = useActiveSection(hrefs)
  const [hover, setHover] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [raised, setRaised] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  useEffect(() => scrollY.on('change', (v) => setRaised(v > 12)), [scrollY])

  // El panel del teléfono se cierra al tocar fuera y con Escape.
  useEffect(() => {
    if (!open) return
    const out = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', out)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', out)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const shown = hover ?? active

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:pt-4">
      <div ref={wrap} className="mx-auto flex flex-col items-center">
        <div className={cn('pointer-events-auto flex w-full items-center gap-2 rounded-full border border-soft bg-[color-mix(in_oklab,var(--surface)_96%,transparent)] p-1.5 transition-shadow duration-300 md:w-auto', 'pl-2.5', raised ? 'shadow-lift' : 'shadow-soft')}>
          <Link to="/" aria-label="MedLogic ENURM, inicio" className="relative flex min-w-0 flex-1 items-center gap-2.5 before:absolute before:-inset-1 md:flex-none md:pr-3">
            <AnimatedLogoMark delay={0.15} className="size-7 shrink-0" />
            <span className="flex items-baseline whitespace-nowrap">
              <span className="font-display text-[18px] leading-none font-extrabold tracking-tight">MedLogic</span>
              <span className="ml-[7px] text-[10.5px] leading-none font-bold tracking-[0.22em] text-brand-700 uppercase dark:text-brand-400">ENURM</span>
            </span>
          </Link>

          {/* Escritorio: cuatro secciones del mismo ancho y un resaltado que se desliza */}
          <nav aria-label="Secciones" className="relative mx-1 hidden grid-cols-4 md:grid" onMouseLeave={() => setHover(null)} style={{ ['--i' as string]: Math.max(0, shown), ['--o' as string]: shown < 0 ? 0 : 1 }}>
            <span aria-hidden className="seg-glide" />
            {sections.map(([href, name], i) => (
              <a
                key={href}
                href={href}
                onClick={onGo(href)}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-current={active === i ? 'location' : undefined}
                className={cn('relative z-10 inline-flex h-9 w-26 items-center justify-center text-sm font-semibold transition-colors duration-200', shown === i ? 'text-brand-700 dark:text-brand-300' : 'text-muted')}
              >
                {META[href]?.short ?? name}
              </a>
            ))}
          </nav>

          {/* Teléfono: botón cuadrado que abre la lista de secciones */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="landing-secciones"
            aria-label="Secciones de la página"
            className="surface-2 relative grid size-9 shrink-0 place-items-center rounded-xl text-[var(--text)] transition-[background-color,scale] duration-200 before:absolute before:-inset-1 active:scale-[0.95] md:hidden"
          >
            {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </button>

          <Link
            to="/inicio"
            className="relative hidden h-9 shrink-0 items-center gap-1.5 rounded-full bg-brand-700 px-4 text-sm font-semibold text-white md:inline-flex transition-[background-color,scale] duration-200 before:absolute before:-inset-1 hover:bg-brand-600 active:scale-[0.97] dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            Entrar <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div id="landing-secciones" data-open={open} className="drop-panel pointer-events-auto mt-2 w-full rounded-3xl border border-soft bg-[var(--surface)] p-2 shadow-lift md:hidden" inert={!open}>
          {sections.map(([href, name], i) => {
            const m = META[href]
            const I = m?.icon ?? LayoutGrid
            return (
              <a
                key={href}
                href={href}
                onClick={(e) => {
                  onGo(href)(e)
                  setOpen(false)
                }}
                className={cn('flex min-h-14 items-center gap-3 rounded-2xl px-2.5 py-2 transition-colors active:bg-slate-900/5 dark:active:bg-white/5', active === i && 'bg-brand-500/10')}
              >
                <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', active === i ? 'bg-brand-600 text-white' : 'bg-brand-500/10 text-brand-700 dark:text-brand-300')}>
                  <I className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block leading-tight font-bold">{m?.short ?? name}</span>
                  <span className="block text-sm text-muted">{m?.desc ?? name}</span>
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </header>
  )
}

/**
 * Barra al alcance del pulgar (solo teléfono): entrar a la plataforma sin estirar el dedo hasta arriba.
 * Quien ya la usó ve «Continuar»; quien no tiene sesión puede iniciarla desde aquí si ya tiene cuenta.
 */
export function EnterBar() {
  const returning = useReturning()
  const status = useAuth((s) => s.status)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-2 rounded-3xl border border-soft bg-[var(--surface)] p-2 shadow-lift">
        {status === 'signed-out' && (
          <Link to="/cuenta" state={{ mode: 'signin' }} className={buttonClass('ghost', 'lg', 'shrink-0 px-4 text-sm')}>
            <LogIn className="size-5" /> Iniciar sesión
          </Link>
        )}
        <Link to="/inicio" className={buttonClass('primary', 'lg', 'min-w-0 flex-1')}>
          {returning ? 'Continuar' : 'Entrar'} <ArrowRight className="size-5" />
        </Link>
      </div>
    </div>
  )
}
