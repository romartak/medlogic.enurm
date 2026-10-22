import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'
import {
  ArrowRight,
  BookOpen,
  Bot,
  Calculator,
  CalendarCheck,
  CalendarDays,
  ChartColumn,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Flame,
  Gamepad2,
  GraduationCap,
  HeartHandshake,
  Languages,
  Layers,
  LayoutGrid,
  ListChecks,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  X,
} from 'lucide-react'
import { Logo, GithubIcon } from '@/components/ui/Logo'
import { buttonClass } from '@/components/ui/primitives'
import { SPECIALTIES } from '@/data/specialties'
import { Icon } from '@/components/ui/Icon'
import { REPO_URL } from '@/components/layout/AppLayout'
import { ENURM_FACTS, formatEnurmDate, upcomingEnurm } from '@/data/enurm'
import { cn, daysBetween, softHyphens, tintText } from '@/lib/utils'

const STEPS = [
  { icon: Sparkles, title: 'Responde el cuestionario', body: 'Tu convocatoria del ENURM, la residencia que quieres, cuánto tiempo tienes y cómo te sientes en cada área.' },
  { icon: CalendarDays, title: 'Sigue tu plan del día', body: 'Tareas concretas: preguntas de dos especialidades, flashcards, una guía y simulacros semanales.' },
  { icon: ChartColumn, title: 'Mide y ajusta', body: 'El plan se recalcula con tu precisión real: más tiempo para lo que más fallas y lo que más pesa.' },
]

const MORE = [
  { icon: BookOpen, label: 'Guías de alto rendimiento', to: '/guias' },
  { icon: LayoutGrid, label: 'Espacio por especialidad', to: '/especialidades' },
  { icon: Calculator, label: 'Calculadoras clínicas', to: '/herramientas' },
  { icon: Newspaper, label: 'Actualizaciones de guías', to: '/actualizaciones' },
  { icon: ChartColumn, label: 'Estadísticas y puntaje estimado', to: '/estadisticas' },
  { icon: Compass, label: 'Cómo prepararte', to: '/como-prepararte' },
]

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: '¿Cuándo es el ENURM?',
    a: (
      <>
        Se aplica una vez al año, el <b>primer domingo de marzo</b>, en la UASD. Así fue en 2024 (3 de marzo), 2025 (2 de marzo) y 2026 (1 de marzo). Para los próximos años mostramos la fecha proyectada hasta que salga la convocatoria oficial.
      </>
    ),
  },
  {
    q: '¿Qué puntaje necesito para concursar?',
    a: (
      <>
        Según el aviso del Ministerio de Salud Pública, necesitas <b>{ENURM_FACTS.minScore} puntos o más</b> (de 100) para concursar por una especialidad. La calificación vale por {ENURM_FACTS.validYears} años; si lo tomas de nuevo, solo cuenta el examen más reciente. En el concurso también suman el índice académico, los honores, la pasantía y una entrevista (1–5 puntos).
      </>
    ),
  },
  {
    q: '¿Cómo es el examen?',
    a: (
      <>
        Las guías de preparación coinciden en {ENURM_FACTS.questions} preguntas de selección múltiple en unas 2 horas: alrededor de 72 segundos por pregunta. Los simulacros de MedLogic usan ese mismo formato. Confirma siempre los detalles en la convocatoria oficial.
      </>
    ),
  },
  {
    q: '¿De verdad es gratis?',
    a: <>Sí, ahora y siempre. Es un proyecto de código abierto, sin anuncios y sin registro. Nadie vende tus datos porque no los recogemos.</>,
  },
  {
    q: '¿Dónde se guarda mi progreso?',
    a: <>En tu propio navegador. Desde Ajustes puedes descargar una copia de seguridad y cargarla en otro dispositivo.</>,
  },
  {
    q: '¿De dónde salen las preguntas?',
    a: <>Hoy hay un banco de muestra. Las preguntas de años anteriores se están cargando con el análisis de cada opción, la fisiopatología y referencias verificables, y aparecerán automáticamente.</>,
  },
]

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function FloatingCard({ className, delay, children }: { className: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay, type: 'spring', stiffness: 120, damping: 18 }} className={`absolute z-10 rounded-2xl border border-soft bg-[var(--surface)] p-4 shadow-lift max-sm:hidden ${className}`}>
      <div className="animate-float" style={{ animationDelay: `${delay}s` }}>
        {children}
      </div>
    </motion.div>
  )
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase dark:text-brand-400">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-extrabold text-balance sm:text-4xl">{title}</h2>
      <p className="mt-3 text-pretty text-muted">{body}</p>
    </div>
  )
}

/* ---------- Cuenta regresiva y datos del examen ---------- */

function ExamCountdown() {
  const next = upcomingEnurm(1)[0]
  const now = useNow()
  const diff = Math.max(0, next.date.getTime() - now)
  const parts = [
    { v: Math.floor(diff / 86_400_000), l: 'días' },
    { v: Math.floor((diff / 3_600_000) % 24), l: 'horas' },
    { v: Math.floor((diff / 60_000) % 60), l: 'min' },
    { v: Math.floor((diff / 1000) % 60), l: 'seg' },
  ]
  const facts = [
    { icon: CalendarDays, value: '1.er domingo', label: 'de marzo, cada año' },
    { icon: ListChecks, value: `${ENURM_FACTS.questions} preguntas`, label: 'de selección múltiple' },
    { icon: Clock, value: '2 horas', label: '≈ 72 s por pregunta' },
    { icon: ShieldCheck, value: `${ENURM_FACTS.minScore} puntos`, label: 'mínimo para concursar' },
  ]
  return (
    <section id="examen" className="mx-auto max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card grid overflow-hidden lg:grid-cols-[1.1fr_1fr]">
        <div className="relative overflow-hidden bg-brand-gradient p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="text-sm font-medium text-white/80">Próximo examen</div>
            <h2 className="mt-1 text-3xl font-extrabold sm:text-4xl">ENURM {next.year}</h2>
            <p className="mt-1 text-white/90 first-letter:uppercase">{formatEnurmDate(next, { weekday: true })}</p>
            <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
              {parts.map((p) => (
                <div key={p.l} className="rounded-2xl bg-white/15 px-1 py-3 text-center backdrop-blur-sm">
                  <div className="font-display text-2xl font-extrabold tabular-nums sm:text-4xl">{String(p.v).padStart(2, '0')}</div>
                  <div className="text-[11px] font-medium text-white/80 sm:text-xs">{p.l}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/75">{next.confirmed ? 'Fecha oficial.' : 'Fecha proyectada: el ENURM se aplica el primer domingo de marzo. Se confirma con la convocatoria oficial.'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2">
          {facts.map((f, i) => (
            <div key={f.label} className={cn('flex flex-col justify-center gap-2 p-5 sm:p-6', i < 2 && 'border-b border-soft', i % 2 === 0 && 'border-r border-soft')}>
              <f.icon className="size-5 text-brand-600 dark:text-brand-400" />
              <div className="font-display text-lg leading-tight font-extrabold sm:text-xl">{f.value}</div>
              <div className="text-xs text-muted sm:text-sm">{f.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

/* ---------- Funciones (bento) ---------- */

function Tile({ to, className, icon: I, color, title, body, children, delay = 0 }: { to: string; className?: string; icon: typeof Target; color: string; title: string; body: string; children?: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay }} className={cn('min-w-0', className)}>
      <Link to={to} className="card card-hover group flex h-full flex-col overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${color}1f`, ...tintText(color) }}>
              <I className="size-5" />
            </span>
            <h3 className="font-display text-lg font-bold">{title}</h3>
            <ArrowRight className="ml-auto size-4 shrink-0 text-muted transition-transform group-hover:translate-x-1" />
          </div>
          <p className="mt-3 text-sm text-pretty text-muted">{body}</p>
        </div>
        {children && <div className="mt-auto px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>}
      </Link>
    </motion.div>
  )
}

function Features() {
  const options = [
    { l: 'A', t: 'Diazepam', why: 'Corta una crisis, pero es inferior al magnesio para prevenirlas.' },
    { l: 'B', t: 'Sulfato de magnesio', ok: true, why: 'De elección: reduce el riesgo de eclampsia en más de la mitad (ensayo Magpie).' },
    { l: 'C', t: 'Fenitoína', why: 'Inferior al magnesio en ensayos controlados.' },
  ]
  return (
    <section id="funciones" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Todo en un lugar" title="Todos los métodos de estudio, en una sola plataforma" body="Técnicas con evidencia: práctica de recuperación, repetición espaciada, intercalado y simulación del examen." />
      <div className="mt-12 grid gap-4 lg:grid-cols-6">
        <Tile to="/practica" className="lg:col-span-4" icon={Target} color="#0ba595" title="Práctica con análisis por opción" body="No basta con saber cuál es la correcta: cada opción explica por qué sí o por qué no, con fisiopatología, perlas y referencias.">
          <div className="space-y-2">
            {options.map((o) => (
              <div key={o.l} className={cn('flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm', o.ok ? 'border-emerald-500/50 bg-emerald-500/[0.07]' : 'border-soft')}>
                <span className={cn('grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-bold', o.ok ? 'bg-emerald-600 text-white' : 'surface-2 text-muted')}>{o.ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}</span>
                <div className="min-w-0">
                  <div className="font-semibold">{o.t}</div>
                  <div className="text-xs text-muted">{o.why}</div>
                </div>
              </div>
            ))}
          </div>
        </Tile>
        <Tile to="/flashcards" className="lg:col-span-2" icon={Layers} color="#8b5cf6" title="Flashcards estilo Anki" body="Mazos, cloze, pasos de aprendizaje y estadísticas. Repasa justo antes de olvidar." delay={0.08}>
          <div className="rounded-xl border border-soft p-4 text-center">
            <div className="text-xs text-muted">Antídoto de la heparina</div>
            <div className="mt-1 font-display text-lg font-bold">Protamina</div>
            <div className="mt-3 grid grid-cols-4 gap-1.5 text-[11px] font-semibold">
              <span className="rounded-md bg-rose-500/15 py-1.5 text-rose-700 dark:text-rose-300">Otra vez</span>
              <span className="rounded-md bg-amber-500/15 py-1.5 text-amber-800 dark:text-amber-300">Difícil</span>
              <span className="rounded-md bg-emerald-500/15 py-1.5 text-emerald-800 dark:text-emerald-300">Bien</span>
              <span className="rounded-md bg-sky-500/15 py-1.5 text-sky-800 dark:text-sky-300">Fácil</span>
            </div>
          </div>
        </Tile>
        <Tile to="/plan" className="lg:col-span-2" icon={CalendarCheck} color="#0ea5e9" title="Plan diario personalizado" body="Cambia de fase a medida que se acerca el examen y refuerza tus puntos débiles." delay={0.04}>
          <ul className="space-y-2 text-sm">
            {[
              ['30 preguntas de Pediatría', true],
              ['20 flashcards', true],
              ['Guía: Dengue', false],
            ].map(([t, done]) => (
              <li key={t as string} className="flex items-center gap-2.5">
                <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border', done ? 'border-transparent bg-brand-600 text-white' : 'border-soft')}>{done && <Check className="size-3" />}</span>
                <span className={cn(done && 'text-muted line-through')}>{t}</span>
              </li>
            ))}
          </ul>
        </Tile>
        <Tile to="/simulacro" className="lg:col-span-2" icon={GraduationCap} color="#6366f1" title="Simulacros reales" body="100 preguntas, cronómetro y resultados por especialidad, como el día del examen." delay={0.08}>
          <div className="flex items-center gap-3 rounded-xl border border-soft p-3">
            <Timer className="size-5 shrink-0 text-accent-600 dark:text-accent-400" />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between text-xs text-muted">
                <span>Pregunta 63/100</span>
                <span className="font-mono font-semibold text-[var(--text)]">00:41:12</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full surface-2">
                <div className="h-full w-[63%] rounded-full bg-brand-gradient" />
              </div>
            </div>
          </div>
        </Tile>
        <Tile to="/juegos" className="lg:col-span-2" icon={Gamepad2} color="#16a34a" title="Juegos clínicos" body="Contrarreloj, supervivencia, parejas, verdadero/falso y diagnóstico en 5 pistas." delay={0.12}>
          <div className="flex flex-wrap gap-1.5">
            {['Contrarreloj', 'Supervivencia', 'Parejas', 'V/F', '5 pistas'].map((g) => (
              <span key={g} className="rounded-full surface-2 px-2.5 py-1 text-xs font-medium">
                {g}
              </span>
            ))}
          </div>
        </Tile>
        <Tile to="/terminologia" className="lg:col-span-3" icon={Languages} color="#16a34a" title="Terminología, como en Duolingo" body="Aprende los términos médicos por partes: prefijos, raíces y sufijos en lecciones cortas, con vidas, racha y repaso." delay={0.04}>
          <div className="flex flex-wrap items-center gap-1.5 font-display text-lg font-bold">
            <span className="rounded-xl border-2 border-b-4 border-soft px-3 py-1">hepato</span>
            <span className="text-muted">+</span>
            <span className="rounded-xl border-2 border-b-4 border-soft px-3 py-1">megalia</span>
            <span className="text-sm font-medium text-muted">= hígado agrandado</span>
          </div>
        </Tile>
        <Tile to="/prompts" className="lg:col-span-3" icon={Bot} color="#ec4899" title="Prompts e IA para médicos" body="Prompts listos para ChatGPT, Claude o Gemini: convierte tus diapositivas en una clase, crea flashcards de un PDF o estudia con un tutor socrático." delay={0.08} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {MORE.map((m) => (
          <Link key={m.to} to={m.to} className="card card-hover flex items-center gap-2.5 px-3.5 py-3 text-sm font-medium">
            <m.icon className="size-4 shrink-0 text-brand-600 dark:text-brand-400" />
            <span className="min-w-0 leading-snug">{softHyphens(m.label)}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ---------- Página ---------- */

export default function Landing() {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 60])
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => scrollY.on('change', (v) => setScrolled(v > 12)), [scrollY])
  const next = upcomingEnurm(1)[0]
  const daysLeft = Math.max(0, daysBetween(new Date(), next.date))

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] grid-pattern opacity-60" />

      <header className={cn('sticky top-0 z-30 transition-colors duration-300', scrolled ? 'border-b border-soft bg-[color-mix(in_oklab,var(--bg)_85%,transparent)] backdrop-blur-xl' : 'border-b border-transparent')}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 text-sm font-medium md:flex" aria-label="Secciones">
            {[
              ['#examen', 'El examen'],
              ['#funciones', 'Funciones'],
              ['#plan', 'Cómo funciona'],
              ['#preguntas', 'Preguntas frecuentes'],
            ].map(([href, label]) => (
              <a key={href} href={href} onClick={(e) => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }) }} className="rounded-lg px-3 py-2 text-muted transition-colors hover:text-[var(--text)]">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className={buttonClass('ghost', 'md', 'max-lg:hidden')}>
              <GithubIcon className="size-4" /> Código abierto
            </a>
            <Link to="/inicio" className={buttonClass('primary', 'md')}>
              Entrar <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-8 pb-16 sm:px-6 sm:pb-20 lg:grid-cols-2 lg:px-8 lg:pt-14">
        <motion.div style={{ y: heroY }}>
          <motion.a
            href="#examen"
            onClick={(e) => { e.preventDefault(); document.querySelector('#examen')?.scrollIntoView({ behavior: 'smooth' }) }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 py-1 pr-3 pl-1 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-500/15 dark:text-brand-200"
          >
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-white">ENURM {next.year}</span>
            <span className="truncate first-letter:uppercase">{formatEnurmDate(next, { weekday: true })}</span>
          </motion.a>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-5 text-4xl leading-[1.05] font-extrabold text-balance sm:text-5xl lg:text-6xl">
            Prepárate para el{' '}
            <span className="relative whitespace-nowrap text-brand-600 dark:text-brand-400">
              ENURM
              <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-2.5 w-full text-brand-500/50">
                <path d="M2 9C40 3 120 1 198 7" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>{' '}
            con método, no con suerte.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-6 max-w-xl text-lg text-pretty text-muted">
            Preguntas tipo ENURM con el porqué de cada opción, simulacros cronometrados, flashcards estilo Anki, guías y un plan diario que se ajusta al tiempo que te queda.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/bienvenida" className={buttonClass('primary', 'lg', 'w-full sm:w-auto')}>
              Crear mi plan gratis <ArrowRight className="size-5" />
            </Link>
            <Link to="/simulacro" className={buttonClass('outline', 'lg', 'w-full bg-[var(--surface)] sm:w-auto')}>
              <GraduationCap className="size-5" /> Probar un simulacro
            </Link>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {[
              [HeartHandshake, 'Gratis para siempre'],
              [ShieldCheck, 'Sin registro ni anuncios'],
              [Check, 'Tu progreso queda en tu dispositivo'],
            ].map(([I, t]) => {
              const C = I as typeof Check
              return (
                <li key={t as string} className="flex items-center gap-1.5">
                  <C className="size-4 text-brand-600 dark:text-brand-400" /> {t as string}
                </li>
              )
            })}
          </motion.ul>
        </motion.div>

        {/* Ilustración interactiva */}
        <div className="relative mx-auto w-full max-w-lg sm:h-[610px]">
          <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 90, damping: 16 }} className="card relative p-5 shadow-lift sm:absolute sm:inset-x-10 sm:top-10 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300">Ginecología y Obstetricia</span>
              <span className="surface-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-muted">Pregunta 12/100</span>
            </div>
            <p className="text-sm font-medium sm:text-base">Embarazada de 34 semanas con TA 165/112 mmHg y cefalea. ¿Qué fármaco previene las convulsiones?</p>
            <div className="mt-4 space-y-2">
              {['Diazepam', 'Fenitoína', 'Sulfato de magnesio', 'Labetalol'].map((o, i) => (
                <motion.div
                  key={o}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-sm ${i === 2 ? 'border-emerald-500 bg-emerald-500/10' : 'border-soft'}`}
                >
                  <span className={`grid size-6 place-items-center rounded-md text-[11px] font-bold ${i === 2 ? 'bg-emerald-600 text-white' : 'surface-2 text-muted'}`}>{i === 2 ? <Check className="size-3.5" /> : 'ABCD'[i]}</span>
                  {o}
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ delay: 1.1 }} className="overflow-hidden">
              <div className="mt-3 rounded-xl bg-emerald-500/[0.08] p-3 text-xs leading-relaxed">
                <b className="text-emerald-800 dark:text-emerald-300">¿Por qué?</b> El magnesio estabiliza la membrana neuronal y es el anticonvulsivo de elección en preeclampsia grave.
              </div>
            </motion.div>
          </motion.div>
          <FloatingCard className="-top-2 -right-4" delay={0.7}>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white">
                <Flame className="size-5" />
              </span>
              <div>
                <div className="text-xs text-muted">Racha</div>
                <div className="font-display text-lg font-bold">12 días</div>
              </div>
            </div>
          </FloatingCard>
          <FloatingCard className="bottom-0 -left-6" delay={0.9}>
            <div className="text-xs text-muted">Puntaje estimado</div>
            <div className="font-display text-2xl font-bold text-brand-600 dark:text-brand-400">78%</div>
            <div className="mt-2 flex h-8 items-end gap-1">
              {[40, 55, 48, 62, 70, 66, 78].map((h, i) => (
                <motion.span key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 1 + i * 0.06 }} className="w-2.5 rounded-sm bg-brand-gradient" />
              ))}
            </div>
          </FloatingCard>
        </div>
      </section>

      <ExamCountdown />
      <Features />

      {/* Cómo funciona */}
      <section id="plan" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <SectionHeading eyebrow="Cómo funciona" title="Un plan hecho para ti" body="En dos minutos tienes un plan diario que se adapta a tu calendario y a tus resultados." />
        <ol className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          <div className="pointer-events-none absolute top-8 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-brand-500/0 via-brand-500/50 to-brand-500/0 md:block" />
          {STEPS.map((st, i) => (
            <motion.li key={st.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
              <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow md:size-16">
                <st.icon className="size-6 md:size-7" />
                <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-[var(--surface)] text-xs font-bold text-brand-700 shadow dark:text-brand-300">{i + 1}</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold md:mt-3">{st.title}</h3>
                <p className="mt-1 max-w-xs text-sm text-pretty text-muted md:mx-auto md:mt-2">{st.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
        <div className="mt-10 flex justify-center">
          <Link to="/bienvenida" className={buttonClass('primary', 'lg', 'w-full sm:w-auto')}>
            <Sparkles className="size-5" /> Crear mi plan gratis
          </Link>
        </div>
      </section>

      {/* Especialidades */}
      <section className="overflow-hidden py-4" aria-label="Especialidades">
        <div className="relative flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div className="flex shrink-0 gap-3 pr-3" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 60, ease: 'linear', repeat: Infinity }}>
            {[...SPECIALTIES, ...SPECIALTIES].map((s, i) => (
              <Link key={i} to={`/especialidades/${s.id}`} tabIndex={i >= SPECIALTIES.length ? -1 : undefined} className="card flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:border-brand-500/40">
                <span style={tintText(s.color)}>
                  <Icon name={s.icon} className="size-4" />
                </span>
                {s.name}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section id="preguntas" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24">
        <SectionHeading eyebrow="Preguntas frecuentes" title="Lo que todos preguntan" body="Datos del examen tomados de avisos oficiales y de la prensa de cada año." />
        <div className="mt-10 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="card group overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold">
                {f.q}
                <ChevronDown className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5 text-sm leading-relaxed text-pretty text-muted [&_b]:text-[var(--text)]">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white shadow-glow sm:p-14">
          <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-extrabold text-balance sm:text-4xl">Un regalo para todos los médicos en formación</h2>
            <p className="mt-3 text-white/85">MedLogic ENURM es y será siempre gratuito y de código abierto. Faltan {daysLeft} días: cada pregunta cuenta.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/bienvenida" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 font-semibold text-slate-900 transition-transform hover:scale-[1.02] active:scale-[0.97]">
                Comenzar ahora <ArrowRight className="size-5" />
              </Link>
              <Link to="/como-prepararte" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white/15 px-6 font-semibold text-white backdrop-blur transition-colors hover:bg-white/25">
                <Compass className="size-5" /> Cómo prepararte
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-soft">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 sm:grid-cols-3 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted">Plataforma gratuita y de código abierto para preparar el Examen Nacional Único de Residencias Médicas.</p>
          </div>
          {[
            { title: 'Estudiar', links: [['Práctica', '/practica'], ['Simulacro', '/simulacro'], ['Flashcards', '/flashcards'], ['Guías', '/guias']] },
            { title: 'Recursos', links: [['Cómo prepararte', '/como-prepararte'], ['Prompts de IA', '/prompts'], ['IA para médicos', '/ia'], ['Hoja de ruta', '/roadmap']] },
            { title: 'Tu cuenta', links: [['Mi plan', '/plan'], ['Estadísticas', '/estadisticas'], ['Logros', '/logros'], ['Ajustes', '/ajustes']] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold">{col.title}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map(([l, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-muted transition-colors hover:text-[var(--text)]">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-soft">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>Contenido educativo. No sustituye el juicio clínico ni las guías oficiales. Fechas y requisitos: Ministerio de Salud Pública y UASD.</p>
            <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
              <a href={`${import.meta.env.BASE_URL}privacidad/`} className="font-medium hover:text-[var(--text)]">
                Privacidad
              </a>
              <a href={`${import.meta.env.BASE_URL}terminos/`} className="font-medium hover:text-[var(--text)]">
                Términos
              </a>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium hover:text-[var(--text)]">
                <GithubIcon className="size-4" /> Código en GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
