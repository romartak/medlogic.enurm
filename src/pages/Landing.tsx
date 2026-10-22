import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, BookOpen, Flame, CalendarDays, ChartColumn, Check, Gamepad2, GraduationCap, HeartHandshake, Layers, Newspaper, Sparkles, Target, Compass, LayoutGrid, CalendarCheck, Calculator } from 'lucide-react'
import { Logo, GithubIcon } from '@/components/ui/Logo'
import { buttonClass } from '@/components/ui/primitives'
import { useBank } from '@/store/bank'
import { SPECIALTIES } from '@/data/specialties'
import { Icon } from '@/components/ui/Icon'
import { GUIDES } from '@/data/guides'
import { BUILTIN_CARDS } from '@/data/flashcards'
import { REPO_URL } from '@/components/layout/AppLayout'

const FEATURES = [
  { icon: Target, title: 'Práctica inteligente', body: 'Filtra por especialidad, año o tus errores. Retroalimentación inmediata con explicación.', color: '#06c4b0' },
  { icon: GraduationCap, title: 'Simulacros reales', body: 'Exámenes cronometrados tipo ENURM con resultados por especialidad y revisión completa.', color: '#6366f1' },
  { icon: Layers, title: 'Flashcards con SRS', body: 'Repetición espaciada (SM-2) para memorizar lo que más se pregunta, a largo plazo.', color: '#ec4899' },
  { icon: BookOpen, title: 'Guías de alto rendimiento', body: 'Resúmenes claros con tablas, perlas y alertas de lo que no puedes olvidar.', color: '#f59e0b' },
  { icon: Gamepad2, title: 'Juegos clínicos', body: 'Contrarreloj, supervivencia, parejas, verdadero/falso y diagnóstico en 5 pistas.', color: '#22c55e' },
  { icon: ChartColumn, title: 'Analíticas', body: 'Precisión por especialidad, calendario de actividad y puntaje estimado.', color: '#0ea5e9' },
  { icon: CalendarCheck, title: 'Plan diario personalizado', body: 'Según tu fecha de examen, tu tiempo y tus puntos débiles. Cambia de fase a medida que se acerca el día.', color: '#a855f7' },
  { icon: LayoutGrid, title: 'Espacio por especialidad', body: 'Temas de alto rendimiento, perlas, preguntas, flashcards y guías de cada área.', color: '#14b8a6' },
  { icon: Calculator, title: 'Herramientas clínicas', body: 'Glasgow, Parkland, TFG, anion gap, CHA₂DS₂-VASc, Alvarado y más.', color: '#64748b' },
  { icon: Sparkles, title: 'Prompts de IA', body: 'Prompts listos para ChatGPT, Claude o Gemini: mejora tus diapositivas, crea flashcards y estudia con un tutor.', color: '#ec4899' },
  { icon: Newspaper, title: 'Actualizaciones', body: 'Cambios recientes en guías clínicas que pueden aparecer en el examen.', color: '#ef4444' },
]

const STEPS = [
  { icon: Sparkles, title: 'Responde el cuestionario', body: 'Cuándo tomarás el ENURM, qué residencia quieres, cuánto tiempo tienes y cómo te sientes en cada área.' },
  { icon: CalendarDays, title: 'Sigue tu plan del día', body: 'Tareas concretas: preguntas de dos especialidades, flashcards, una guía y simulacros semanales.' },
  { icon: ChartColumn, title: 'Mide y ajusta', body: 'El plan se recalcula con tu precisión real: más tiempo para lo que más fallas y lo que más pesa.' },
]

function FloatingCard({ className, delay, children }: { className: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay, type: 'spring', stiffness: 120, damping: 18 }} className={`glass absolute rounded-2xl p-4 shadow-lift ${className}`}>
      <div className="animate-float" style={{ animationDelay: `${delay}s` }}>
        {children}
      </div>
    </motion.div>
  )
}

export default function Landing() {
  const total = useBank((s) => s.questions.length)
  const source = useBank((s) => s.source)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 80])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3])

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] grid-pattern opacity-60" />
      <div className="pointer-events-none absolute top-24 -left-32 -z-10 size-96 rounded-full bg-brand-400/25 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-60 -right-32 -z-10 size-96 rounded-full bg-accent-500/25 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className={buttonClass('ghost', 'md', 'max-sm:hidden')}>
            <GithubIcon className="size-4" /> Código abierto
          </a>
          <Link to="/inicio" className={buttonClass('primary', 'md')}>
            Entrar <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-16">
        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <HeartHandshake className="size-3.5" /> 100% gratis · Siempre · Para todos los médicos
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-5 text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-6xl">
            Prepárate para el <span className="text-gradient">ENURM</span> con método, no con suerte.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-5 max-w-xl text-lg text-muted">
            Banco de preguntas de todos los años, simulacros cronometrados, flashcards con repetición espaciada, guías, juegos y analíticas. Todo en un solo lugar.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-8 flex flex-wrap gap-3">
            <Link to="/inicio" className={buttonClass('primary', 'lg')}>
              Empezar a estudiar <ArrowRight className="size-5" />
            </Link>
            <Link to="/simulacro" className={buttonClass('outline', 'lg')}>
              <GraduationCap className="size-5" /> Hacer un simulacro
            </Link>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {['Sin registro', 'Sin anuncios', 'Tu progreso se guarda en tu dispositivo'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="size-4 text-brand-500" /> {t}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Ilustración interactiva */}
        <div className="relative mx-auto h-[420px] w-full max-w-lg sm:h-[480px]">
          <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 90, damping: 16 }} className="card absolute inset-x-6 top-10 p-6 shadow-lift sm:inset-x-10">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-500">Ginecología y Obstetricia</span>
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
                  <span className={`grid size-6 place-items-center rounded-md text-[11px] font-bold ${i === 2 ? 'bg-emerald-500 text-white' : 'surface-2 text-muted'}`}>{i === 2 ? <Check className="size-3.5" /> : 'ABCD'[i]}</span>
                  {o}
                </motion.div>
              ))}
            </div>
          </motion.div>
          <FloatingCard className="-top-2 right-0 sm:-right-4" delay={0.7}>
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
          <FloatingCard className="bottom-6 -left-2 sm:-left-6" delay={0.9}>
            <div className="text-xs text-muted">Puntaje estimado</div>
            <div className="font-display text-2xl font-bold text-gradient">78%</div>
            <div className="mt-2 flex h-8 items-end gap-1">
              {[40, 55, 48, 62, 70, 66, 78].map((h, i) => (
                <motion.span key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 1 + i * 0.06 }} className="w-2.5 rounded-sm bg-brand-gradient" />
              ))}
            </div>
          </FloatingCard>
          <FloatingCard className="right-2 bottom-0 sm:-right-2" delay={1.1}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-amber-500" /> Logro: Semana perfecta
            </div>
          </FloatingCard>
        </div>
      </section>

      {/* Números */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="card grid grid-cols-2 divide-[var(--border)] overflow-hidden sm:grid-cols-4 sm:divide-x">
          {[
            { n: source === 'sample' ? 'Todos los años' : total.toLocaleString('es-DO'), l: source === 'sample' ? 'del ENURM (próximamente)' : 'preguntas en el banco' },
            { n: SPECIALTIES.length, l: 'áreas del examen' },
            { n: BUILTIN_CARDS.length + '+', l: 'flashcards' },
            { n: GUIDES.length, l: 'guías de estudio' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-5 text-center sm:p-6">
              <div className="font-display text-2xl font-extrabold sm:text-3xl">{s.n}</div>
              <div className="text-xs text-muted sm:text-sm">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Funciones */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Todos los métodos de estudio, en una sola plataforma</h2>
          <p className="mt-3 text-muted">Combina técnicas con evidencia: práctica de recuperación, repetición espaciada, intercalado y simulación del examen.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: (i % 4) * 0.08 }} className="card card-hover group p-6">
              <span className="grid size-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ backgroundColor: `${f.color}1a`, color: f.color }}>
                <f.icon className="size-6" />
              </span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Un plan hecho para ti</h2>
          <p className="mt-3 text-muted">En dos minutos tienes un plan diario que se adapta a tu calendario y a tus resultados.</p>
        </div>
        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute top-8 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-brand-500/0 via-brand-500/50 to-brand-500/0 md:block" />
          {STEPS.map((st, i) => (
            <motion.div key={st.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="relative text-center">
              <div className="relative mx-auto grid size-16 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <st.icon className="size-7" />
                <span className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-[var(--surface)] text-xs font-bold text-brand-600 shadow">{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{st.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{st.body}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link to="/bienvenida" className={buttonClass('primary', 'lg')}>
            <Sparkles className="size-5" /> Crear mi plan gratis
          </Link>
        </div>
      </section>

      {/* Especialidades */}
      <section className="overflow-hidden py-6">
        <div className="relative flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div className="flex shrink-0 gap-3 pr-3" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 50, ease: 'linear', repeat: Infinity }}>
            {[...SPECIALTIES, ...SPECIALTIES].map((s, i) => (
              <span key={i} className="card flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium">
                <span style={{ color: s.color }}>
                  <Icon name={s.icon} className="size-4" />
                </span>
                {s.name}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white shadow-glow sm:p-14">
          <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Un regalo para todos los médicos en formación</h2>
            <p className="mt-3 text-white/85">MedLogic ENURM es y será siempre gratuito y de código abierto. Empieza hoy: cada pregunta cuenta.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/inicio" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-slate-900 transition-transform hover:scale-[1.03] active:scale-95">
                Comenzar ahora <ArrowRight className="size-5" />
              </Link>
              <Link to="/como-prepararte" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white/15 px-6 font-semibold text-white backdrop-blur transition-colors hover:bg-white/25">
                <Compass className="size-5" /> Cómo prepararte
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-soft">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
          <Logo />
          <p className="text-center">Contenido educativo. No sustituye el juicio clínico ni las guías oficiales.</p>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[var(--text)]">
            <GithubIcon className="size-4" /> GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
