import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { BookOpen, Check, Coffee, Gamepad2, GraduationCap, Layers, Play, RotateCcw, Sparkles, Target } from 'lucide-react'
import type { PlanTaskKind } from '@/types'
import { useDailyPlan } from '@/hooks/useDailyPlan'
import { useProgress } from '@/store/progress'
import { PHASES } from '@/lib/plan'
import { getSpecialty } from '@/data/specialties'
import { Badge, Card, ProgressBar, Ring, SpecialtyBadge } from '@/components/ui/primitives'
import { cn, formatDuration } from '@/lib/utils'

const KIND: Record<PlanTaskKind, { icon: typeof Target; color: string; unit: string }> = {
  questions: { icon: Target, color: '#06c4b0', unit: 'preguntas' },
  review: { icon: RotateCcw, color: '#ef4444', unit: 'errores' },
  flashcards: { icon: Layers, color: '#8b5cf6', unit: 'tarjetas' },
  guide: { icon: BookOpen, color: '#f59e0b', unit: '' },
  exam: { icon: GraduationCap, color: '#0ea5e9', unit: '' },
  game: { icon: Gamepad2, color: '#22c55e', unit: '' },
  rest: { icon: Coffee, color: '#64748b', unit: '' },
}

export function DailyPlanCard({ compact = false }: { compact?: boolean }) {
  const { plan, tasks, completed, total, ratio, allDone, toggleCheck } = useDailyPlan()
  const profile = useProgress((s) => s.profile)
  const phase = PHASES[plan.phase]

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3.5 border-b border-soft p-4 sm:items-center sm:gap-5 sm:p-6">
        <Ring value={ratio} size={72} stroke={7} color={allDone ? '#10b981' : phase.color}>
          {allDone ? (
            <Check className="size-7 text-emerald-500" />
          ) : (
            <div className="leading-none">
              <div className="font-display text-lg font-extrabold tabular-nums">
                {completed}/{total}
              </div>
              <div className="mt-0.5 text-xs text-muted">tareas</div>
            </div>
          )}
        </Ring>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="font-display text-base font-bold sm:text-lg">{plan.restDay ? 'Hoy: día de descanso' : 'Tu plan de hoy'}</h2>
            <Badge color={phase.color}>{phase.name}</Badge>
            {plan.minutes > 0 && <Badge>≈ {formatDuration(plan.minutes * 60)}</Badge>}
          </div>
          <p className="mt-1 text-sm text-pretty text-muted">{plan.message}</p>
          {plan.focus.length > 0 && !plan.restDay && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
              Enfoque: {plan.focus.map((f) => <SpecialtyBadge key={f} id={f} />)}
            </div>
          )}
          {!compact && (
            <Link to="/plan" className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline sm:hidden dark:text-brand-400">
              Ver semana →
            </Link>
          )}
        </div>
        {!compact && (
          <Link to="/plan" className="shrink-0 self-start text-sm font-semibold text-brand-600 hover:underline max-sm:hidden dark:text-brand-400 sm:self-center">
            Ver semana →
          </Link>
        )}
      </div>

      {!profile.completed && (
        <Link to="/bienvenida" className="flex items-center gap-3 border-b border-soft bg-amber-500/[0.07] px-5 py-3 text-sm transition-colors hover:bg-amber-500/[0.12] sm:px-6">
          <Sparkles className="size-4 shrink-0 text-amber-500" />
          <span className="flex-1">
            <b>Personaliza este plan:</b> responde el cuestionario (2 minutos) con la fecha de tu examen y tu disponibilidad.
          </span>
          <span className="font-semibold text-amber-600">Empezar →</span>
        </Link>
      )}

      {tasks.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted">{plan.phase === 'examen' ? '¡Mucho éxito hoy! 🍀' : 'Nada pendiente por hoy. Descansa.'}</p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {tasks.map((t, i) => {
            const k = KIND[t.kind]
            const color = t.specialty && t.kind === 'questions' ? getSpecialty(t.specialty).color : k.color
            return (
              <motion.li key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                <button
                  onClick={() => toggleCheck(t.id)}
                  className={cn('relative grid size-7 shrink-0 place-items-center rounded-full border-2 transition-all after:absolute after:-inset-2.5', t.complete ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-soft hover:border-brand-500')}
                  aria-label={t.complete ? 'Marcar como pendiente' : 'Marcar como hecha'}
                  title={t.complete ? 'Hecha' : 'Marcar como hecha'}
                >
                  {t.complete && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="size-4" />
                    </motion.span>
                  )}
                </button>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl max-sm:hidden" style={{ backgroundColor: `${color}1a`, color }}>
                  <k.icon className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className={cn('flex flex-wrap items-center gap-x-2 text-sm font-semibold', t.complete && 'text-muted line-through')}>
                    {t.title}
                    {t.optional && <span className="text-xs font-medium text-muted no-underline">opcional</span>}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {t.detail} · {t.minutes} min
                  </div>
                  {t.target > 1 && !compact && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={t.done / t.target} color={color} height="h-1" className="max-w-48" />
                      <span className="text-xs whitespace-nowrap text-muted tabular-nums">
                        {t.done}/{t.target} {k.unit}
                      </span>
                    </div>
                  )}
                </div>
                {!t.complete && (
                  <Link to={t.link} aria-label={`Empezar: ${t.title}`} className="inline-flex size-11 shrink-0 items-center justify-center gap-1 rounded-xl bg-brand-500/10 text-xs font-semibold sm:h-9 sm:w-auto sm:px-3 text-brand-700 transition-colors hover:bg-brand-500/20 dark:text-brand-300">
                    <Play className="size-3.5 fill-current sm:size-3" /> <span className="hidden sm:inline">Empezar</span>
                  </Link>
                )}
              </motion.li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
