import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarDays, Coffee, Pause, Play, RotateCcw, Target, Timer } from 'lucide-react'
import { useProgress } from '@/store/progress'
import { useBank } from '@/store/bank'
import { specialtyStats } from '@/lib/stats'
import { getSpecialty } from '@/data/specialties'
import { Button, Card, PageHeader, Ring, Segmented, SpecialtyIcon } from '@/components/ui/primitives'
import { addDays, cn, dayKey, formatClock } from '@/lib/utils'
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
        <div key={p.l} className="rounded-2xl bg-white/15 p-3 text-center backdrop-blur sm:p-4">
          <div className="relative h-9 overflow-hidden font-display text-3xl font-extrabold tabular-nums sm:h-11 sm:text-4xl">
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

export default function Planner() {
  const navigate = useNavigate()
  const settings = useProgress((s) => s.settings)
  const update = useProgress((s) => s.updateSettings)
  const attempts = useProgress((s) => s.attempts)
  const activity = useProgress((s) => s.activity)
  const questions = useBank((s) => s.questions)

  // Prioridad = peso en el banco × debilidad (las no practicadas cuentan como 50%).
  const priorities = useMemo(() => {
    const st = specialtyStats(attempts, questions)
    const total = st.reduce((n, s) => n + s.total, 0) || 1
    return st
      .map((s) => ({ id: s.specialty, p: (s.total / total) * (1.5 - (s.answered >= 5 ? s.accuracy : 0.5)) }))
      .sort((a, b) => b.p - a.p)
  }, [attempts, questions])

  const today = new Date()
  const week = Array.from({ length: 7 }, (_, d) => {
    const date = addDays(today, d - today.getDay())
    const n = priorities.length || 1
    const focus = [priorities[(2 * d) % n], priorities[(2 * d + 1) % n]].filter(Boolean).filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
    const a = activity[dayKey(date)]
    return { date, focus, done: a?.answered ?? 0, isToday: d === today.getDay(), past: d < today.getDay() }
  })

  return (
    <div className="space-y-6">
      <PageHeader icon={<CalendarDays className="size-6" />} title="Plan de estudio" subtitle="Organiza tu preparación: fecha del examen, meta diaria y un plan semanal que se adapta a tus puntos débiles." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-glow sm:p-8">
            <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-white/80">Cuenta regresiva</div>
                  <h2 className="text-2xl font-extrabold">{settings.examDate ? 'Tu examen ENURM' : 'Define la fecha de tu examen'}</h2>
                </div>
                <input type="date" value={settings.examDate ?? ''} min={dayKey()} onChange={(e) => update({ examDate: e.target.value || null })} className="h-10 rounded-xl border-0 bg-white/20 px-3 text-sm font-semibold text-white backdrop-blur outline-none [color-scheme:dark] focus:bg-white/30" aria-label="Fecha del examen" />
              </div>
              {settings.examDate && <Countdown date={settings.examDate} />}
            </div>
          </motion.div>

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">Plan de esta semana</h2>
              <span className="text-xs text-muted">Se recalcula con tu rendimiento</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-7">
              {week.map((d, i) => {
                const goalMet = d.done >= settings.dailyGoal
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={cn('flex flex-row items-center gap-3 rounded-2xl border p-3 sm:flex-col sm:items-stretch sm:text-center', d.isToday ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/30' : 'border-soft', d.past && !goalMet && 'opacity-60')}>
                    <div className="w-12 shrink-0 sm:w-auto">
                      <div className="text-[11px] font-semibold text-muted uppercase">{WEEKDAYS[d.date.getDay()]}</div>
                      <div className="font-display text-xl font-bold">{d.date.getDate()}</div>
                    </div>
                    <div className="flex flex-1 flex-wrap gap-1.5 sm:flex-col sm:items-center">
                      {d.focus.map((f) => (
                        <button key={f.id} onClick={() => navigate(`/practica?specialty=${f.id}&auto=1`)} className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-[11px] font-semibold transition-colors hover:bg-slate-900/5 dark:hover:bg-white/5" title={`Practicar ${getSpecialty(f.id).name}`}>
                          <SpecialtyIcon id={f.id} size="sm" />
                          <span className="sm:hidden">{getSpecialty(f.id).short}</span>
                        </button>
                      ))}
                    </div>
                    <div className={cn('shrink-0 text-xs font-semibold', goalMet ? 'text-emerald-600' : 'text-muted')}>
                      {d.done}/{settings.dailyGoal}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-4 font-semibold">Prioridades de estudio</h2>
            <ol className="space-y-2">
              {priorities.slice(0, 6).map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="w-5 text-center font-display font-bold text-muted">{i + 1}</span>
                  <SpecialtyIcon id={p.id} size="sm" />
                  <span className="flex-1 text-sm font-medium">{getSpecialty(p.id).name}</span>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/practica?specialty=${p.id}&auto=1`)}>
                    Practicar
                  </Button>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Pomodoro />
          <Card className="p-5 sm:p-6">
            <h2 className="font-semibold">Meta diaria</h2>
            <p className="mt-1 text-sm text-muted">Preguntas por día</p>
            <div className="mt-4 text-center font-display text-5xl font-extrabold text-gradient">{settings.dailyGoal}</div>
            <input type="range" min={10} max={200} step={5} value={settings.dailyGoal} onChange={(e) => update({ dailyGoal: +e.target.value })} className="mt-4 w-full accent-[var(--color-brand-500)]" aria-label="Meta diaria" />
            <div className="mt-1 flex justify-between text-[11px] text-muted">
              <span>10</span>
              <span>200</span>
            </div>
            {settings.examDate && (
              <p className="mt-4 rounded-xl surface-2 p-3 text-xs text-muted">
                A este ritmo responderás unas <b className="text-[var(--text)]">{(Math.max(0, Math.round((new Date(settings.examDate).getTime() - Date.now()) / 86_400_000)) * settings.dailyGoal).toLocaleString('es-DO')}</b> preguntas antes del examen.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
