import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarDays, Check, Coffee, Pause, Pencil, Play, RefreshCw, RotateCcw, Target, Timer } from 'lucide-react'
import type { PlanPhase } from '@/types'
import { useProgress } from '@/store/progress'
import { DailyPlanCard } from '@/components/DailyPlanCard'
import { useDailyPlan, usePlanInputs, useWeekPreview } from '@/hooks/useDailyPlan'
import { PHASES, PHASE_ORDER, describeProfile, questionAdvice, resolveExamDate } from '@/lib/plan'
import { StudyEvidence } from '@/components/StudyEvidence'
import { formatEnurmDate } from '@/data/enurm'
import { getSpecialty } from '@/data/specialties'
import { Button, Card, PageHeader, Ring, Segmented, SpecialtyIcon } from '@/components/ui/primitives'
import { addDays, cn, dayKey, formatClock, softHyphens, tintText } from '@/lib/utils'
import { playSound } from '@/lib/fx'
import { toast } from '@/store/toasts'

function Countdown({ date }: { date: string }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const target = new Date(date + 'T08:00:00').getTime()
  const diff = Math.max(0, target - now)
  const parts = [
    { v: Math.floor(diff / 86_400_000), l: 'días' },
    { v: Math.floor((diff / 3_600_000) % 24), l: 'horas' },
    { v: Math.floor((diff / 60_000) % 60), l: 'min' },
    { v: Math.floor((diff / 1000) % 60), l: 'seg' },
  ]
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {parts.map((p) => (
        <div key={p.l} className="rounded-2xl bg-white/15 px-1 py-3 text-center backdrop-blur sm:p-4">
          <div className="relative h-8 overflow-hidden font-display text-2xl font-extrabold tabular-nums min-[400px]:h-9 min-[400px]:text-3xl sm:h-11 sm:text-4xl">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={p.v} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="absolute inset-0">
                {String(p.v).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="text-[11px] font-medium text-white/80">{p.l}</div>
        </div>
      ))}
    </div>
  )
}

const POMODORO = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 }
type Phase = keyof typeof POMODORO

function Pomodoro() {
  const [phase, setPhase] = useState<Phase>('focus')
  const [left, setLeft] = useState(POMODORO.focus)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(0)
  const deadline = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    deadline.current = Date.now() + left * 1000
    const id = setInterval(() => {
      const l = Math.max(0, Math.round((deadline.current! - Date.now()) / 1000))
      setLeft(l)
      if (l === 0) {
        setRunning(false)
        playSound('win')
        if (phase === 'focus') {
          const n = done + 1
          setDone(n)
          toast({ kind: 'success', title: '¡Pomodoro completado!', body: 'Tómate un descanso, te lo ganaste.' })
          const next: Phase = n % 4 === 0 ? 'long' : 'short'
          setPhase(next)
          setLeft(POMODORO[next])
        } else {
          toast({ kind: 'info', title: 'Descanso terminado', body: 'A por el siguiente bloque.' })
          setPhase('focus')
          setLeft(POMODORO.focus)
        }
      }
    }, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const switchPhase = (p: Phase) => {
    setRunning(false)
    setPhase(p)
    setLeft(POMODORO[p])
  }

  const color = phase === 'focus' ? '#06c4b0' : '#6366f1'
  return (
    <Card className="flex flex-col items-center p-6">
      <div className="mb-5 flex w-full items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Timer className="size-5 text-brand-500" /> Pomodoro
        </h2>
        <span className="text-xs text-muted">{done} completados hoy</span>
      </div>
      <Segmented value={phase} onChange={switchPhase} options={[{ value: 'focus', label: 'Enfoque' }, { value: 'short', label: 'Descanso' }, { value: 'long', label: 'Largo' }]} />
      <div className="my-6">
        <Ring value={left / POMODORO[phase]} size={200} stroke={12} color={color}>
          <div>
            <div className="font-mono text-4xl font-bold tabular-nums">{formatClock(left)}</div>
            <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted">{phase === 'focus' ? <><Target className="size-3" /> Concéntrate</> : <><Coffee className="size-3" /> Descansa</>}</div>
          </div>
        </Ring>
      </div>
      <div className="flex gap-2">
        <Button size="lg" onClick={() => setRunning(!running)} className="w-36">
          {running ? <Pause className="size-5" /> : <Play className="size-5 fill-current" />} {running ? 'Pausar' : 'Iniciar'}
        </Button>
        <Button size="lg" variant="outline" onClick={() => switchPhase(phase)} aria-label="Reiniciar">
          <RotateCcw className="size-5" />
        </Button>
      </div>
    </Card>
  )
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function PhaseTimeline({ current }: { current: PlanPhase }) {
  const idx = PHASE_ORDER.indexOf(current)
  return (
    <div className="grid grid-cols-4 gap-2">
      {PHASE_ORDER.map((ph, i) => {
        const info = PHASES[ph]
        const state = idx === -1 ? 'future' : i < idx ? 'past' : i === idx ? 'current' : 'future'
        return (
          <div key={ph} className="relative">
            <div className="h-1.5 overflow-hidden rounded-full surface-2">
              <motion.div className="h-full rounded-full" style={{ backgroundColor: info.color }} initial={{ width: 0 }} animate={{ width: state === 'past' ? '100%' : state === 'current' ? '55%' : '0%' }} transition={{ duration: 0.8, delay: i * 0.1 }} />
            </div>
            <div lang="es" className={cn('mt-2 text-[11px] leading-tight font-semibold hyphens-auto [overflow-wrap:anywhere] sm:text-xs', state === 'current' ? '' : 'text-muted')} style={state === 'current' ? tintText(info.color) : undefined}>
              {softHyphens(info.name, 8)}
            </div>
            <div className="hidden text-[11px] text-muted sm:block">{ph === 'fundamentos' ? '> 6 meses' : ph === 'consolidacion' ? '2–6 meses' : ph === 'intensivo' ? '15–60 días' : '≤ 14 días'}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function Planner() {
  const navigate = useNavigate()
  const profile = useProgress((s) => s.profile)
  const planDone = useProgress((s) => s.planDone)
  const { priorities } = usePlanInputs()
  const week = useWeekPreview(7)
  const { plan, regenerate } = useDailyPlan()
  const target = resolveExamDate(profile)
  const phase = PHASES[plan.phase]
  const doneThisWeek = Object.keys(planDone).filter((k) => k >= dayKey(addDays(new Date(), -6))).length

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CalendarDays className="size-6" />}
        eyebrow={phase.name}
        title="Mi plan"
        subtitle="Tu plan diario se genera con tus respuestas al cuestionario y se ajusta a tus resultados y al tiempo que falta para el examen."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/bienvenida')}>
              <Pencil className="size-4" /> {profile.completed ? 'Editar cuestionario' : 'Responder cuestionario'}
            </Button>
            <Button variant="ghost" onClick={regenerate} title="Volver a generar el plan de hoy">
              <RefreshCw className="size-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-glow sm:p-8">
            <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-5">
              <div>
                <div className="text-sm font-medium text-white/80">Cuenta regresiva</div>
                <h2 className="text-2xl font-extrabold">{target.enurm ? `ENURM ${target.enurm.year}` : 'Aún no has elegido tu convocatoria'}</h2>
                {target.enurm && (
                  <p className="mt-1 text-sm text-white/85 first-letter:uppercase">
                    {formatEnurmDate(target.enurm, { weekday: true })}
                    {target.estimated && ' · fecha proyectada (primer domingo de marzo), pendiente de la convocatoria oficial'}
                  </p>
                )}
              </div>
              {target.date ? (
                <Countdown date={dayKey(target.date)} />
              ) : (
                <button onClick={() => navigate('/bienvenida')} className="self-start rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                  Elegir convocatoria
                </button>
              )}
            </div>
          </motion.div>

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <h2 className="font-semibold">Fases de preparación</h2>
              <span className="text-xs text-muted sm:max-w-xs sm:text-right">{phase.description}</span>
            </div>
            <PhaseTimeline current={plan.phase} />
          </Card>

          {profile.completed && <StudyEvidence advice={questionAdvice(profile, priorities)} minutesPerDay={profile.minutesPerDay} />}

          <DailyPlanCard compact />

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">Próximos 7 días</h2>
              <span className="text-xs text-muted">{doneThisWeek} planes completados en los últimos 7 días</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-7">
              {week.map((d, i) => {
                const date = new Date(d.date + 'T12:00:00')
                const exam = d.tasks.find((t) => t.kind === 'exam')
                return (
                  <motion.div key={d.date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={cn('flex flex-row items-center gap-3 rounded-2xl border p-3 sm:flex-col sm:items-stretch sm:text-center', i === 0 ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/30' : 'border-soft', d.restDay && 'opacity-70')}>
                    <div className="w-12 shrink-0 sm:w-auto">
                      <div className="text-[11px] font-semibold text-muted uppercase">{i === 0 ? 'Hoy' : WEEKDAYS[date.getDay()]}</div>
                      <div className="font-display text-xl font-bold">{date.getDate()}</div>
                    </div>
                    <div className="flex flex-1 flex-wrap items-center gap-1.5 sm:flex-col">
                      {d.restDay ? (
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <Coffee className="size-3.5" /> Descanso
                        </span>
                      ) : (
                        d.focus.map((f) => (
                          <button key={f} onClick={() => navigate(`/especialidades/${f}`)} className="flex items-center gap-1.5 rounded-lg p-0.5 text-left text-[11px] font-semibold hover:bg-slate-900/5 dark:hover:bg-white/5" title={getSpecialty(f).name}>
                            <SpecialtyIcon id={f} size="sm" />
                            <span className="sm:hidden">{getSpecialty(f).short}</span>
                          </button>
                        ))
                      )}
                      {exam && (
                        <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400" title={exam.title}>
                          Simulacro
                        </span>
                      )}
                    </div>
                    <div className="shrink-0 text-xs text-muted">{d.minutes ? `${d.minutes} min` : ''}</div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Tu perfil de estudio</h2>
              <Link to="/bienvenida" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                Editar
              </Link>
            </div>
            {profile.completed ? (
              <ul className="space-y-2 text-sm">
                {describeProfile(profile).map((l) => (
                  <li key={l} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-500" /> {l}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Responde el cuestionario para personalizar tu plan. Mientras tanto usamos un plan equilibrado de 90 minutos, 6 días por semana.</p>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-1 font-semibold">Tus prioridades</h2>
            <p className="mb-4 text-xs text-muted">Peso en el examen × debilidad × tu residencia.</p>
            <ol className="space-y-2.5">
              {priorities.slice(0, 7).map((p, i) => (
                <li key={p.id}>
                  <Link to={`/especialidades/${p.id}`} className="flex items-center gap-3 rounded-xl p-1 -m-1 transition-colors hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]">
                    <span className="w-4 text-center font-display text-sm font-bold text-muted">{i + 1}</span>
                    <SpecialtyIcon id={p.id} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{getSpecialty(p.id).name}</span>
                      <span className="block truncate text-[11px] text-muted">{p.reason}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </Card>

          <Pomodoro />
        </div>
      </div>
    </div>
  )
}
