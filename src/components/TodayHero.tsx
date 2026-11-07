import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, CalendarDays, Flame, GraduationCap, Trophy } from 'lucide-react'
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
  daysLeft: number | null
  level: number
  levelTitle: string
  xpCurrent: number
  xpNeeded: number
  xpProgress: number
  isNew: boolean
  share?: ReactNode
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

      <dl className="grid grid-cols-3 divide-x divide-[var(--border)] border-t border-soft">
        <div className="px-4 py-3.5 sm:px-8 sm:py-4">
          <dt className="text-xs font-medium text-muted">Aciertos</dt>
          <dd className="mt-0.5 font-display text-xl font-extrabold tabular-nums sm:text-2xl">{p.accuracy === null ? '—' : `${Math.round(p.accuracy * 100)} %`}</dd>
        </div>
        <div className="px-4 py-3.5 sm:px-8 sm:py-4">
          <dt className="flex items-center gap-1 text-xs font-medium text-muted">
            <Flame className="size-3 text-orange-500" aria-hidden /> Racha
          </dt>
          <dd className="mt-0.5 font-display text-xl font-extrabold tabular-nums sm:text-2xl">{p.streak} {p.streak === 1 ? 'día' : 'días'}</dd>
        </div>
        <div className="px-4 py-3.5 sm:px-8 sm:py-4">
          <dt className="flex items-center gap-1 text-xs font-medium text-muted">
            <CalendarDays className="size-3" aria-hidden /> Para el ENURM
          </dt>
          <dd className="mt-0.5 font-display text-xl font-extrabold tabular-nums sm:text-2xl">
            {p.daysLeft === null || p.daysLeft < 0 ? (
              <Link to="/plan" className="text-sm font-semibold text-brand-700 hover:underline sm:text-base dark:text-brand-300">
                Fijar fecha →
              </Link>
            ) : p.daysLeft === 0 ? (
              '¡Hoy!'
            ) : (
              `${p.daysLeft} días`
            )}
          </dd>
          {p.daysLeft !== null && p.daysLeft > 0 && <div className="hidden text-xs text-muted sm:block">Fase: {PHASES[plan.phase].name}</div>}
        </div>
      </dl>

      <div className="flex items-center gap-3 border-t border-soft px-5 py-3 text-xs text-muted sm:px-8">
        <Trophy className="size-3.5 shrink-0" aria-hidden />
        <span className="shrink-0 font-semibold text-[var(--text)]">
          Nivel {p.level} · {p.levelTitle}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full surface-2">
          <motion.div className="h-full w-full origin-left rounded-full bg-brand-gradient" initial={{ scaleX: 0 }} animate={{ scaleX: p.xpProgress }} transition={{ duration: 0.9 }} />
        </div>
        <span className="shrink-0 tabular-nums">
          {p.xpCurrent}/{p.xpNeeded} XP
        </span>
      </div>
    </motion.section>
  )
}
