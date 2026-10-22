import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock, Flag, GraduationCap, History, LayoutGrid, Play, Send, Timer, X } from 'lucide-react'
import type { ExamResult, Question } from '@/types'
import { useBank } from '@/store/bank'
import { useProgress } from '@/store/progress'
import { filterQuestions, optionOrder, proportionalPick } from '@/lib/selection'
import { SpecialtyPicker } from '@/components/Filters'
import { Badge, Button, Card, EmptyState, PageHeader, ProgressBar, Ring, Segmented, SpecialtyIcon } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { QuestionCard } from '@/components/QuestionCard'
import { useCountdown } from '@/hooks/useCountdown'
import { useHotkeys } from '@/hooks/useHotkeys'
import { celebrate, playSound } from '@/lib/fx'
import { cn, formatClock, formatDate, formatDuration, LETTERS, pct, uid } from '@/lib/utils'
import { getSpecialty } from '@/data/specialties'

interface ExamConfig {
  title: string
  questions: Question[]
  minutes: number
}

const PRESETS = [
  { id: 'full', label: 'Completo', count: 100, minutes: 120, description: 'Formato de examen completo' },
  { id: 'half', label: 'Medio', count: 50, minutes: 60, description: 'Media jornada' },
  { id: 'quick', label: 'Rápido', count: 20, minutes: 24, description: 'Para un rato libre' },
] as const

export default function Exam() {
  const questions = useBank((s) => s.questions)
  const years = useBank((s) => s.years)
  const { attempts, bookmarks, exams } = useProgress()
  const [preset, setPreset] = useState<string>('quick')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [custom, setCustom] = useState({ count: 30, minutes: 36 })
  const [running, setRunning] = useState<ExamConfig | null>(null)

  const pool = useMemo(() => filterQuestions(questions, { specialties, years: [], status: 'all' }, attempts, bookmarks), [questions, specialties, attempts, bookmarks])
  const p = PRESETS.find((x) => x.id === preset)
  const count = Math.min(p ? p.count : custom.count, pool.length)
  const minutes = p ? Math.round((p.minutes * count) / p.count) || 1 : custom.minutes

  const startCustom = () => setRunning({ title: p ? `Simulacro ${p.label.toLowerCase()}` : 'Simulacro personalizado', questions: proportionalPick(pool, count), minutes })
  const startYear = (y: number) => {
    const qs = questions.filter((q) => q.year === y).sort((a, b) => a.id.localeCompare(b.id, 'es', { numeric: true }))
    setRunning({ title: `ENURM ${y}`, questions: qs, minutes: Math.max(10, Math.round(qs.length * 1.2)) })
  }

  if (running) return <ExamRunner config={running} onExit={() => setRunning(null)} />

  return (
    <div>
      <PageHeader icon={<GraduationCap className="size-6" />} eyebrow="Modo examen" title="Simulacro" subtitle="Condiciones reales: tiempo limitado, sin retroalimentación hasta el final y resultados por especialidad." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-4">
            {[...PRESETS, { id: 'custom', label: 'Personalizado', count: custom.count, minutes: custom.minutes, description: 'Tú decides' }].map((x) => (
              <button
                key={x.id}
                onClick={() => setPreset(x.id)}
                className={cn('card card-hover relative p-4 text-left transition-all', preset === x.id && 'ring-2 ring-brand-500')}
              >
                {preset === x.id && (
                  <motion.span layoutId="preset-check" className="absolute top-3 right-3 grid size-5 place-items-center rounded-full bg-brand-500 text-white">
                    <Check className="size-3" />
                  </motion.span>
                )}
                <div className="font-display text-lg font-bold">{x.label}</div>
                <div className="mt-1 text-xs text-muted">{x.description}</div>
                <div className="mt-3 flex items-center gap-3 text-xs font-semibold">
                  <span>{x.count} preg.</span>
                  <span className="flex items-center gap-1 text-muted">
                    <Timer className="size-3" /> {x.minutes} min
                  </span>
                </div>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {preset === 'custom' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <Card className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
                  <label className="block">
                    <span className="flex justify-between text-sm font-medium">
                      Preguntas <b>{custom.count}</b>
                    </span>
                    <input type="range" min={5} max={200} step={5} value={custom.count} onChange={(e) => setCustom({ count: +e.target.value, minutes: Math.round(+e.target.value * 1.2) })} className="mt-3 w-full accent-[var(--color-brand-500)]" />
                  </label>
                  <label className="block">
                    <span className="flex justify-between text-sm font-medium">
                      Minutos <b>{custom.minutes}</b>
                    </span>
                    <input type="range" min={5} max={240} step={1} value={custom.minutes} onChange={(e) => setCustom({ ...custom, minutes: +e.target.value })} className="mt-3 w-full accent-[var(--color-brand-500)]" />
                  </label>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-1 font-semibold">Especialidades incluidas</h2>
            <p className="mb-3 text-xs text-muted">Las preguntas se reparten de forma proporcional, como en el examen real.</p>
            <SpecialtyPicker value={specialties} onChange={setSpecialties} />
          </Card>

          {years.length > 0 && (
            <Card className="p-5 sm:p-6">
              <h2 className="mb-1 font-semibold">Exámenes completos por año</h2>
              <p className="mb-4 text-xs text-muted">Resuelve el examen de un año tal como salió.</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {years.map((y) => {
                  const n = questions.filter((q) => q.year === y).length
                  return (
                    <button key={y} onClick={() => startYear(y)} className="group flex items-center justify-between rounded-xl border border-soft px-4 py-3 text-left transition-all hover:border-brand-500/50 hover:bg-brand-500/5">
                      <span>
                        <span className="block font-display font-bold">ENURM {y}</span>
                        <span className="text-xs text-muted">{n} preguntas</span>
                      </span>
                      <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <h2 className="font-semibold">Resumen</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Preguntas</dt>
                <dd className="font-semibold">{count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Tiempo</dt>
                <dd className="font-semibold">{minutes} min</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Ritmo</dt>
                <dd className="font-semibold">{count ? Math.round((minutes * 60) / count) : 0} s / pregunta</dd>
              </div>
            </dl>
            <Button size="lg" className="mt-6 w-full" disabled={!count} onClick={startCustom}>
              <Play className="size-5 fill-current" /> Iniciar simulacro
            </Button>
            {pool.length < (p?.count ?? custom.count) && <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">Solo hay {pool.length} preguntas disponibles con estos filtros.</p>}
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <History className="size-4" /> Historial
            </h2>
            {exams.length === 0 ? (
              <p className="text-sm text-muted">Tus simulacros aparecerán aquí.</p>
            ) : (
              <ul className="-mx-2 space-y-1">
                {exams.slice(0, 8).map((e) => {
                  const score = pct(e.correct, e.total)
                  return (
                    <li key={e.id}>
                      <Link to={`/simulacro/${e.id}`} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]">
                        <span className={cn('grid size-10 place-items-center rounded-xl text-sm font-bold', score >= 70 ? 'bg-emerald-500/15 text-emerald-600' : score >= 50 ? 'bg-amber-500/15 text-amber-600' : 'bg-rose-500/15 text-rose-600')}>{score}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{e.title}</span>
                          <span className="text-xs text-muted">
                            {formatDate(e.date)} · {e.correct}/{e.total}
                          </span>
                        </span>
                        <ChevronRight className="size-4 text-muted" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function ExamRunner({ config, onExit }: { config: ExamConfig; onExit: () => void }) {
  const { questions } = config
  const shuffleOpts = useProgress((s) => s.settings.shuffleOptions)
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const saveExam = useProgress((s) => s.saveExam)
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [flags, setFlags] = useState<Set<number>>(new Set())
  const [confirm, setConfirm] = useState(false)
  const [gridOpen, setGridOpen] = useState(false)
  const [startedAt] = useState(Date.now())
  const orders = useMemo(() => questions.map((q) => optionOrder(q, shuffleOpts)), [questions, shuffleOpts])
  const totalSec = config.minutes * 60

  const submit = () => {
    const bySpecialty: ExamResult['bySpecialty'] = {}
    let correct = 0
    questions.forEach((q, i) => {
      const b = (bySpecialty[q.specialty] ??= { total: 0, correct: 0 })
      b.total++
      if (answers[i] === q.answer) {
        b.correct++
        correct++
      }
      if (answers[i] !== null) recordAnswer(q, answers[i]!)
    })
    const result: ExamResult = {
      id: uid('ex'),
      title: config.title,
      date: Date.now(),
      durationSec: Math.min(totalSec, Math.round((Date.now() - startedAt) / 1000)),
      total: questions.length,
      correct,
      bySpecialty,
      questionIds: questions.map((q) => q.id),
      answers,
    }
    saveExam(result)
    const ratio = correct / questions.length
    if (ratio >= 0.6) {
      celebrate('big')
      playSound('win')
    }
    navigate(`/simulacro/${result.id}`, { replace: false })
  }

  const [left] = useCountdown(totalSec, true, submit)
  const answered = answers.filter((a) => a !== null).length
  const q = questions[index]
  const lowTime = left < 300

  const choose = (orig: number) => {
    const next = [...answers]
    next[index] = next[index] === orig ? null : orig
    setAnswers(next)
  }
  const toggleFlag = () => {
    const f = new Set(flags)
    if (f.has(index)) f.delete(index)
    else f.add(index)
    setFlags(f)
  }

  useHotkeys((e) => {
    const n = Number(e.key)
    if (n >= 1 && n <= q.options.length) choose(orders[index][n - 1])
    else if (e.key === 'ArrowRight') setIndex(Math.min(questions.length - 1, index + 1))
    else if (e.key === 'ArrowLeft') setIndex(Math.max(0, index - 1))
    else if (e.key.toLowerCase() === 'm') toggleFlag()
    else {
      const li = LETTERS.indexOf(e.key.toUpperCase())
      if (li >= 0 && li < q.options.length) choose(orders[index][li])
    }
  }, !confirm)

  const Grid = (
    <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
      {questions.map((_, i) => (
        <button
          key={i}
          onClick={() => {
            setIndex(i)
            setGridOpen(false)
          }}
          className={cn(
            'relative grid aspect-square place-items-center rounded-lg text-[11px] font-bold transition-all',
            i === index ? 'ring-2 ring-brand-500 ring-offset-1 ring-offset-[var(--surface)]' : '',
            answers[i] !== null ? 'bg-brand-500 text-white' : 'surface-2 text-muted hover:bg-brand-500/15',
          )}
        >
          {i + 1}
          {flags.has(i) && <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-amber-500 ring-2 ring-[var(--surface)]" />}
        </button>
      ))}
    </div>
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0">
        <div className="glass sticky top-16 z-10 -mx-4 mb-5 flex items-center gap-3 px-4 py-3 sm:mx-0 sm:rounded-2xl">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{config.title}</div>
            <ProgressBar value={answered / questions.length} className="mt-1.5" height="h-1.5" />
          </div>
          <motion.div animate={lowTime ? { scale: [1, 1.06, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }} className={cn('flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-sm font-bold tabular-nums', lowTime ? 'bg-rose-500/15 text-rose-500' : 'surface-2')}>
            <Clock className="size-4" /> {formatClock(left)}
          </motion.div>
          <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setGridOpen(true)} aria-label="Ver todas las preguntas">
            <LayoutGrid className="size-4" />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <QuestionCard
              question={q}
              mode="exam"
              selected={answers[index]}
              onSelect={choose}
              order={orders[index]}
              header={
                <span className="font-display text-sm font-bold">
                  {index + 1} <span className="text-muted">/ {questions.length}</span>
                </span>
              }
            />
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex items-center justify-between gap-2">
          <Button variant="outline" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
            <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Anterior</span>
          </Button>
          <Button variant={flags.has(index) ? 'secondary' : 'ghost'} onClick={toggleFlag} className={flags.has(index) ? 'text-amber-600' : ''}>
            <Flag className={cn('size-4', flags.has(index) && 'fill-amber-500 text-amber-500')} /> <span className="hidden sm:inline">{flags.has(index) ? 'Marcada' : 'Marcar para revisar'}</span>
          </Button>
          {index + 1 < questions.length ? (
            <Button onClick={() => setIndex(index + 1)}>
              <span className="hidden sm:inline">Siguiente</span> <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button variant="success" onClick={() => setConfirm(true)}>
              <Send className="size-4" /> Entregar
            </Button>
          )}
        </div>
      </div>

      <aside className="hidden lg:block">
        <Card className="sticky top-24 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Preguntas</h3>
            <span className="text-xs text-muted">
              {answered}/{questions.length}
            </span>
          </div>
          {Grid}
          <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-muted">
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded bg-brand-500" /> Respondida
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-amber-500" /> Marcada
            </span>
          </div>
          <Button variant="success" className="mt-5 w-full" onClick={() => setConfirm(true)}>
            <Send className="size-4" /> Entregar examen
          </Button>
          <Button variant="ghost" size="sm" className="mt-2 w-full text-muted" onClick={onExit}>
            Abandonar
          </Button>
        </Card>
      </aside>

      <Modal open={gridOpen} onClose={() => setGridOpen(false)} title="Ir a la pregunta">
        {Grid}
        <Button variant="success" className="mt-5 w-full" onClick={() => setConfirm(true)}>
          <Send className="size-4" /> Entregar examen
        </Button>
        <Button variant="ghost" size="sm" className="mt-2 w-full text-muted" onClick={onExit}>
          Abandonar sin guardar
        </Button>
      </Modal>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="¿Entregar el simulacro?">
        <p className="text-sm text-muted">
          Respondiste <b className="text-[var(--text)]">{answered}</b> de {questions.length} preguntas.
          {answered < questions.length && ` Quedan ${questions.length - answered} sin responder.`}
          {flags.size > 0 && ` Tienes ${flags.size} marcadas para revisar.`}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirm(false)}>
            Seguir respondiendo
          </Button>
          <Button variant="success" onClick={submit}>
            Entregar
          </Button>
        </div>
      </Modal>
    </div>
  )
}

/** Resultados de un simulacro guardado (/simulacro/:id). */
export function ExamResults() {
  const { id } = useParams()
  const exam = useProgress((s) => s.exams.find((e) => e.id === id))
  const exams = useProgress((s) => s.exams)
  const byId = useBank((s) => s.byId)
  const [filter, setFilter] = useState<'all' | 'wrong' | 'blank'>('all')

  if (!exam) return <EmptyState icon={<GraduationCap className="size-7" />} title="Simulacro no encontrado" action={<Link to="/simulacro" className="text-sm font-semibold text-brand-600">Volver</Link>} />

  const score = exam.correct / exam.total
  const blank = exam.answers.filter((a) => a === null).length
  const prev = exams.find((e) => e.date < exam.date)
  const delta = prev ? Math.round(score * 100) - pct(prev.correct, prev.total) : null
  const specs = Object.entries(exam.bySpecialty).sort((a, b) => b[1].total - a[1].total)
  const items = exam.questionIds
    .map((qid, i) => ({ q: byId.get(qid), a: exam.answers[i], i }))
    .filter(({ q, a }) => q && (filter === 'all' || (filter === 'wrong' && a !== null && a !== q.answer) || (filter === 'blank' && a === null)))

  return (
    <div>
      <Link to="/simulacro" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)]">
        <ArrowLeft className="size-4" /> Simulacros
      </Link>
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card flex flex-col items-center p-6 text-center sm:p-8">
          <div className="text-xs font-semibold tracking-wider text-muted uppercase">{exam.title}</div>
          <div className="mt-5">
            <Ring value={score} size={180} stroke={14}>
              <div>
                <div className="font-display text-5xl font-extrabold">{Math.round(score * 100)}</div>
                <div className="text-xs text-muted">puntos de 100</div>
              </div>
            </Ring>
          </div>
          {delta !== null && (
            <Badge color={delta >= 0 ? '#10b981' : '#ef4444'} className="mt-4">
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} pts vs. anterior
            </Badge>
          )}
          <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-emerald-500/10 p-3">
              <div className="font-display text-xl font-bold text-emerald-600">{exam.correct}</div>
              <div className="text-[11px] text-muted">Correctas</div>
            </div>
            <div className="rounded-xl bg-rose-500/10 p-3">
              <div className="font-display text-xl font-bold text-rose-600">{exam.total - exam.correct - blank}</div>
              <div className="text-[11px] text-muted">Incorrectas</div>
            </div>
            <div className="rounded-xl surface-2 p-3">
              <div className="font-display text-xl font-bold">{blank}</div>
              <div className="text-[11px] text-muted">En blanco</div>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">
            {formatDate(exam.date, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {formatDuration(exam.durationSec)}
          </p>
        </motion.div>

        <Card className="p-5 sm:p-6 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Resultado por especialidad</h2>
          <ul className="space-y-3">
            {specs.map(([sid, v], i) => {
              const s = getSpecialty(sid)
              return (
                <motion.li key={sid} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3">
                  <SpecialtyIcon id={sid} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate font-medium">{s.name}</span>
                      <span className="shrink-0 text-muted">
                        {v.correct}/{v.total} · <b className="text-[var(--text)]">{pct(v.correct, v.total)}%</b>
                      </span>
                    </div>
                    <ProgressBar value={v.correct / v.total} color={s.color} className="mt-1.5" height="h-1.5" />
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </Card>
      </div>

      <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Revisión de preguntas</h2>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Todas' },
            { value: 'wrong', label: 'Incorrectas' },
            { value: 'blank', label: 'En blanco' },
          ]}
        />
      </div>
      <div className="space-y-4">
        {items.length === 0 && <p className="text-sm text-muted">No hay preguntas en esta categoría.</p>}
        {items.map(({ q, a, i }) => (
          <QuestionCard
            key={q!.id + i}
            question={q!}
            mode="review"
            selected={a}
            compact
            header={
              <span className={cn('inline-flex items-center gap-1 text-sm font-bold', a === null ? 'text-muted' : a === q!.answer ? 'text-emerald-600' : 'text-rose-600')}>
                {a === null ? '—' : a === q!.answer ? <Check className="size-4" /> : <X className="size-4" />} {i + 1}
              </span>
            }
          />
        ))}
      </div>
    </div>
  )
}
