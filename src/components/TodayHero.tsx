import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, CalendarDays, Flame, GraduationCap, Target, Trophy } from 'lucide-react'
import { useDailyPlan } from '@/hooks/useDailyPlan'
import { getSpecialty } from '@/data/specialties'
import { PHASES } from '@/lib/plan'
import { ProgressBar, Ring } from '@/components/ui/primitives'

interface Props {
  greeting: string
  /** Meta diaria (preguntas) y lo respondido hoy. */
  goal: number
  todayAnswered: number
  /** Precisión global de 0 a 1, o null si aún no hay respuestas. */
  accuracy: number | null
  streak: number
  /** Congeladores de racha disponibles. */
  freezes: number
  daysLeft: number | null
  level: number
  levelTitle: string
  xpCurrent: number
  xpNeeded: number
  xpProgress: number
  isNew: boolean
  share?: ReactNode
}


const TONES = {
  brand: { box: 'bg-brand-500/[0.08]', chip: 'bg-brand-500/15 text-brand-700 dark:text-brand-300', text: 'text-brand-900 dark:text-brand-100' },
  orange: { box: 'bg-orange-500/[0.08]', chip: 'bg-orange-500/15 text-orange-700 dark:text-orange-300', text: 'text-orange-900 dark:text-orange-100' },
  sky: { box: 'bg-sky-500/[0.08]', chip: 'bg-sky-500/15 text-sky-700 dark:text-sky-300', text: 'text-sky-900 dark:text-sky-100' },
} as const

/** Ficha de una cifra: ícono en círculo de color, el dato grande y una frase corta debajo. */
function Tile({ icon, tone, label, value, hint }: { icon: ReactNode; tone: keyof typeof TONES; label: string; value: string; hint: string }) {
  const t = TONES[tone]
  return (
    <div className={`flex flex-col justify-between rounded-2xl p-3.5 ${t.box}`}>
      <span className={`flex items-center gap-2 text-xs font-semibold ${t.text}`}>
        <span className={`grid size-8 place-items-center rounded-full ${t.chip}`}>{icon}</span>
        {label}
      </span>
      <span className="mt-2 font-display text-[22px] leading-none font-extrabold tabular-nums sm:text-2xl">{value}</span>
      <span className={`mt-1 text-xs opacity-80 ${t.text}`}>{hint}</span>
    </div>
  )
}

/**
 * Encabezado del Inicio: una sola decisión («Hoy toca…» y un botón grande), con las cifras clave debajo.
 * Todo lo demás del Inicio queda más abajo, para no pedirle al usuario que elija entre diez cosas a la vez.
 */
export function TodayHero(p: Props) {
  const { plan, tasks, completed, total, allDone } = useDailyPlan()
  const next = tasks.find((t) => !t.complete && !t.optional) ?? tasks.find((t) => !t.complete)
  const focus = plan.focus.slice(0, 2).map((f) => getSpecialty(f).name)
  const goalMet = p.todayAnswered >= p.goal

  let title: string
  let sub: string
  let cta = { to: '/practica?auto=1', label: 'Práctica rápida' }
  if (p.isNew) {
    title = 'Empieza tu primera sesión'
    sub = `Tu meta de hoy: ${p.goal} preguntas. Con 5 ya estás en marcha.`
  } else if (plan.restDay) {
    title = 'Hoy es día de descanso'
    sub = plan.message
  } else if (allDone) {
    title = 'Plan de hoy completado'
    sub = 'Buen trabajo. Cada pregunta extra suma, pero también puedes descansar.'
  } else {
    title = focus.length ? `Hoy toca ${focus.join(' y ')}` : 'Tu plan de hoy'
    sub = `${total - completed} ${total - completed === 1 ? 'tarea pendiente' : 'tareas pendientes'}${plan.minutes ? ` · unos ${plan.minutes} min` : ''}${next ? ` · siguiente: ${next.title}` : ''}`
    if (next) cta = { to: next.link, label: 'Empezar' }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} aria-labelledby="hoy-title" className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-6 p-5 sm:p-8">
        <div className="min-w-0 flex-1 basis-72">
          <p className="text-sm font-medium text-muted">{p.greeting}</p>
          <h1 id="hoy-title" className="mt-1 text-2xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-prose text-sm text-pretty text-muted sm:text-base">{sub}</p>
          <div className="mt-4 sm:hidden" role="img" aria-label={`${p.todayAnswered} de ${p.goal} preguntas hoy`}>
            <div className="mb-1 flex justify-between text-xs text-muted tabular-nums">
              <span>Meta de hoy</span>
              <span>
                {p.todayAnswered} de {p.goal}
              </span>
            </div>
            <ProgressBar value={Math.min(1, p.todayAnswered / Math.max(1, p.goal))} color={goalMet ? '#10b981' : undefined} height="h-2.5" />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link to={cta.to} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-brand-600 px-6 text-base font-semibold text-white shadow-lift transition-transform hover:bg-brand-700 active:scale-[0.97]">
              {cta.label} <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link to="/simulacro" className="inline-flex h-12 items-center gap-2 rounded-2xl surface-2 px-5 text-sm font-semibold transition-colors hover:bg-brand-500/10">
              <GraduationCap className="size-4" aria-hidden /> Simulacro
            </Link>
            {p.share}
          </div>
        </div>
        <div className="hidden shrink-0 items-center sm:flex">
          <Ring value={Math.min(1, p.todayAnswered / Math.max(1, p.goal))} size={132} stroke={11} color={goalMet ? '#10b981' : undefined}>
            <div className="leading-none">
              <div className="font-display text-3xl font-extrabold tabular-nums">{p.todayAnswered}</div>
              <div className="mt-1 text-xs text-muted">de {p.goal} hoy</div>
            </div>
          </Ring>
        </div>
      </div>

      <div role="group" aria-label="Tu resumen" className="grid grid-cols-2 gap-2.5 px-5 pb-5 sm:grid-cols-4 sm:gap-3 sm:px-8 sm:pb-8">
        <Tile icon={<Target className="size-[18px]" aria-hidden />} tone="brand" label="Aciertos" value={p.accuracy === null ? '—' : `${Math.round(p.accuracy * 100)} %`} hint={p.accuracy === null ? 'Responde para medirlos' : p.accuracy >= 0.7 ? 'Vas muy bien' : 'Sigue practicando'} />
        <Tile icon={<Flame className="size-[18px]" aria-hidden />} tone="orange" label="Racha" value={`${p.streak} ${p.streak === 1 ? 'día' : 'días'}`} hint={p.freezes > 0 ? `${p.freezes} ${p.freezes === 1 ? 'congelador listo' : 'congeladores listos'}` : p.todayAnswered > 0 ? 'Hoy ya sumaste' : 'Estudia hoy para mantenerla'} />
        {p.daysLeft === null || p.daysLeft < 0 ? (
          <Link to="/plan" className="group flex flex-col justify-between rounded-2xl border-2 border-dashed border-sky-500/40 bg-sky-500/[0.06] p-3.5 transition-colors hover:bg-sky-500/10">
            <span className="flex items-center gap-2 text-xs font-semibold text-sky-800 dark:text-sky-200">
              <span className="grid size-8 place-items-center rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300">
                <CalendarDays className="size-[18px]" aria-hidden />
              </span>
              ENURM
            </span>
            <span className="mt-2 font-display text-[15px] leading-tight font-bold text-sky-900 dark:text-sky-100">Elige la fecha de tu examen</span>
            <span className="mt-1 text-xs font-semibold text-sky-700 group-hover:underline dark:text-sky-300">Fijar fecha →</span>
          </Link>
        ) : (
          <Tile icon={<CalendarDays className="size-[18px]" aria-hidden />} tone="sky" label="Para el ENURM" value={p.daysLeft === 0 ? '¡Hoy!' : `${p.daysLeft} días`} hint={`Fase: ${PHASES[plan.phase].name}`} />
        )}
        <div className="flex flex-col justify-between rounded-2xl bg-violet-500/[0.08] p-3.5">
          <span className="flex items-center gap-2 text-xs font-semibold text-violet-900 dark:text-violet-200">
            <span className="grid size-8 place-items-center rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-300">
              <Trophy className="size-[18px]" aria-hidden />
            </span>
            Nivel
          </span>
          <span className="mt-2 font-display text-[22px] leading-none font-extrabold tabular-nums sm:text-2xl">{p.level}</span>
          <span className="mt-1 text-xs text-violet-900/80 dark:text-violet-200/80">{p.levelTitle}</span>
          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-violet-500/15" role="img" aria-label={`${p.xpCurrent} de ${p.xpNeeded} XP para el siguiente nivel`}>
            <motion.span className="block h-full w-full origin-left rounded-full bg-violet-500" initial={{ scaleX: 0 }} animate={{ scaleX: p.xpProgress }} transition={{ duration: 0.9 }} />
          </span>
        </div>
      </div>
    </motion.section>
  )
}
