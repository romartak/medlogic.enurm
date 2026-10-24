import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, ChevronLeft, Clock, Flame, Play, RotateCcw, Shuffle, Target, X } from 'lucide-react'
import type { Question } from '@/types'
import { useBank } from '@/store/bank'
import { useProgress } from '@/store/progress'
import { filterQuestions, optionOrder, type StatusFilter } from '@/lib/selection'
import { SpecialtyPicker, YearPicker } from '@/components/Filters'
import { Button, Card, PageHeader, ProgressBar, Ring, Segmented, SpecialtyBadge } from '@/components/ui/primitives'
import { QuestionCard } from '@/components/QuestionCard'
import { useHotkeys } from '@/hooks/useHotkeys'
import { celebrate, playSound } from '@/lib/fx'
import { cn, formatClock, LETTERS, pct, shuffle } from '@/lib/utils'
import { XpPill } from '@/components/layout/AppLayout'

interface Config {
  specialties: string[]
  years: number[]
  status: StatusFilter
  count: number
}

export default function Practice() {
  const [params] = useSearchParams()
  const questions = useBank((s) => s.questions)
  const hasYears = useMemo(() => questions.some((q) => q.year), [questions])
  const status = useBank((s) => s.status)
  const { attempts, bookmarks } = useProgress()
  const [config, setConfig] = useState<Config>(() => ({
    specialties: params.get('specialty') ? [params.get('specialty')!] : [],
    years: params.get('year') ? [Number(params.get('year'))] : [],
    status: (params.get('status') as StatusFilter) || 'all',
    count: Number(params.get('count')) || 20,
  }))
  const [session, setSession] = useState<Question[] | null>(null)

  const pool = useMemo(() => filterQuestions(questions, { ...config }, attempts, bookmarks), [questions, config, attempts, bookmarks])

  const start = (qs = pool) => {
    // Prioriza las no vistas y luego el resto, para cubrir el banco más rápido.
    const unseen = shuffle(qs.filter((q) => !attempts[q.id]))
    const seen = shuffle(qs.filter((q) => attempts[q.id]))
    setSession([...unseen, ...seen].slice(0, config.count))
  }

  const autoStarted = useRef(false)
  useEffect(() => {
    if (params.get('auto') && status === 'ready' && !autoStarted.current && pool.length) {
      autoStarted.current = true
      start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pool.length])

  if (session) return <PracticeSession questions={session} onExit={() => setSession(null)} onRestart={(qs) => setSession(shuffle(qs))} />

  return (
    <div>
      <PageHeader icon={<Target className="size-6" />} eyebrow="Modo tutor" title="Práctica" subtitle="Responde y recibe la explicación al instante. Ideal para aprender tema por tema." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card className="p-5 sm:p-6">
            <h2 className="mb-3 font-semibold">Especialidades</h2>
            <SpecialtyPicker value={config.specialties} onChange={(specialties) => setConfig({ ...config, specialties })} />
          </Card>
          {hasYears && (
            <Card className="p-5 sm:p-6">
              <h2 className="mb-3 font-semibold">Año del examen</h2>
              <YearPicker value={config.years} onChange={(years) => setConfig({ ...config, years })} />
            </Card>
          )}
          <Card className="p-5 sm:p-6">
            <h2 className="mb-3 font-semibold">Preguntas</h2>
            <Segmented
              value={config.status}
              onChange={(s) => setConfig({ ...config, status: s })}
              options={[
                { value: 'all', label: 'Todas' },
                { value: 'unseen', label: 'No vistas' },
                { value: 'failed', label: 'Falladas' },
                { value: 'bookmarked', label: 'Marcadas' },
              ]}
            />
          </Card>
        </div>

        <div>
          <Card className="sticky top-24 p-5 sm:p-6">
            <h2 className="font-semibold">Tu sesión</h2>
            <p className="mt-1 text-sm text-muted">
              <b className="text-[var(--text)]">{pool.length.toLocaleString('es-DO')}</b> preguntas coinciden con tus filtros.
            </p>
            <div className="mt-5">
              <div className="mb-2 text-sm font-medium">Cantidad</div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 40, 100].map((n) => (
                  <button key={n} onClick={() => setConfig({ ...config, count: n })} className={cn('h-10 rounded-xl border text-sm font-semibold transition-all', config.count === n ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-soft text-muted hover:border-brand-500/40')}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <Button size="lg" className="mt-6 w-full" disabled={!pool.length} onClick={() => start()}>
              <Play className="size-5 fill-current" /> Empezar ({Math.min(config.count, pool.length)})
            </Button>
            <p className="mt-4 text-center text-xs text-muted">
              Atajos: <span className="kbd">1</span>–<span className="kbd">5</span> elegir · <span className="kbd">↵</span> siguiente
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PracticeSession({ questions, onExit, onRestart }: { questions: Question[]; onExit: () => void; onRestart: (qs: Question[]) => void }) {
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const shuffleOpts = useProgress((s) => s.settings.shuffleOptions)
  const correctRun = useProgress((s) => s.correctRun)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [done, setDone] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const orders = useMemo(() => questions.map((q) => optionOrder(q, shuffleOpts)), [questions, shuffleOpts])
  const navigate = useNavigate()

  useEffect(() => {
    if (done) return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [done])

  const q = questions[index]
  const selected = answers[index]
  const answered = answers.filter((a) => a !== null).length
  const correct = answers.filter((a, i) => a === questions[i].answer).length

  const choose = (orig: number) => {
    if (selected !== null || done) return
    const next = [...answers]
    next[index] = orig
    setAnswers(next)
    const ok = recordAnswer(q, orig)
    playSound(ok ? 'correct' : 'wrong')
  }

  const next = () => {
    if (selected === null) return
    if (index + 1 < questions.length) setIndex(index + 1)
    else finish()
  }

  const finish = () => {
    setDone(true)
    const c = answers.filter((a, i) => a === questions[i].answer).length
    const ratio = c / Math.max(1, answers.filter((a) => a !== null).length)
    if (ratio >= 0.7) {
      celebrate(ratio >= 0.9 ? 'big' : 'small')
      playSound('win')
    }
  }

  useHotkeys((e) => {
    if (done) return
    const n = Number(e.key)
    if (n >= 1 && n <= q.options.length) choose(orders[index][n - 1])
    const li = LETTERS.indexOf(e.key.toUpperCase())
    if (li >= 0 && li < q.options.length && Number.isNaN(n)) choose(orders[index][li])
    if (e.key === 'Enter' || e.key === 'ArrowRight') next()
  })

  if (done) {
    const total = answered
    const wrongQs = questions.filter((qq, i) => answers[i] !== null && answers[i] !== qq.answer)
    const ratio = total ? correct / total : 0
    return (
      <div className="mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 text-center sm:p-10">
          <div className="text-sm font-semibold tracking-wider text-brand-600 uppercase dark:text-brand-400">Sesión completada</div>
          <div className="mt-6 flex justify-center">
            <Ring value={ratio} size={170} stroke={14}>
              <div>
                <div className="font-display text-4xl font-extrabold">{Math.round(ratio * 100)}%</div>
                <div className="text-xs text-muted">
                  {correct} / {total}
                </div>
              </div>
            </Ring>
          </div>
          <h2 className="mt-6 text-2xl font-bold">{ratio >= 0.85 ? '¡Excelente trabajo!' : ratio >= 0.65 ? '¡Buen resultado!' : ratio >= 0.4 ? 'Vas avanzando' : 'Cada error es aprendizaje'}</h2>
          <p className="mt-1 text-sm text-muted">
            Tiempo: {formatClock(elapsed)} · {total ? Math.round(elapsed / total) : 0} s por pregunta
          </p>
          <div className="mt-3 flex justify-center">
            <XpPill amount={correct * 10 + (total - correct) * 2} />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {wrongQs.length > 0 && (
              <Button variant="primary" onClick={() => onRestart(wrongQs)}>
                <RotateCcw className="size-4" /> Repetir falladas ({wrongQs.length})
              </Button>
            )}
            <Button variant="outline" onClick={onExit}>
              <Shuffle className="size-4" /> Nueva sesión
            </Button>
            <Button variant="ghost" onClick={() => navigate('/estadisticas')}>
              Ver estadísticas
            </Button>
          </div>
        </motion.div>

        <h3 className="mt-8 mb-3 font-display font-bold">Revisión</h3>
        <div className="space-y-2">
          {questions.map((qq, i) => {
            if (answers[i] === null) return null
            const ok = answers[i] === qq.answer
            return (
              <details key={qq.id} className="card group p-4 open:shadow-lift">
                <summary className="flex cursor-pointer list-none items-start gap-3">
                  <span className={cn('mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-white', ok ? 'bg-emerald-500' : 'bg-rose-500')}>{ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}</span>
                  <span className="line-clamp-2 flex-1 text-sm">{qq.stem}</span>
                  <SpecialtyBadge id={qq.specialty} className="hidden sm:inline-flex" />
                </summary>
                <div className="mt-4">
                  <QuestionCard question={qq} mode="review" selected={answers[i]} compact />
                </div>
              </details>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onExit} aria-label="Salir">
          <ChevronLeft className="size-4" /> Salir
        </Button>
        <div className="flex-1">
          <ProgressBar value={(index + (selected !== null ? 1 : 0)) / questions.length} />
        </div>
        <span className="text-sm font-semibold tabular-nums">
          {index + 1}/{questions.length}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full surface-2 px-3 py-1 font-medium text-muted">
          <Clock className="size-3.5" /> {formatClock(elapsed)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-600 dark:text-emerald-400">
          <Check className="size-3.5" /> {correct}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 font-semibold text-rose-600 dark:text-rose-400">
          <X className="size-3.5" /> {answered - correct}
        </span>
        <AnimatePresence>
          {correctRun >= 3 && (
            <motion.span key="run" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-3 py-1 font-bold text-orange-500">
              <Flame className="size-3.5" /> {correctRun} seguidas
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={q.id + index} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
          <QuestionCard question={q} mode="tutor" selected={selected} revealed={selected !== null} onSelect={choose} order={orders[index]} />
        </motion.div>
      </AnimatePresence>

      <div className="glass sticky bottom-24 z-10 mt-5 flex items-center justify-between gap-3 rounded-2xl p-2.5 shadow-lift lg:bottom-4">
        <Button variant="outline" onClick={finish} disabled={answered === 0}>
          Terminar
        </Button>
        <AnimatePresence>
          {selected !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 sm:flex-none">
              <Button size="lg" onClick={next} className="w-full shadow-lift sm:w-auto">
                {index + 1 < questions.length ? 'Siguiente' : 'Ver resultados'} <ArrowRight className="size-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        {pct(correct, Math.max(1, answered))}% de aciertos en esta sesión
      </p>
    </div>
  )
}
