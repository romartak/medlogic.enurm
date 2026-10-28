import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ArrowRight, BookOpen, Check, ChevronRight, ClipboardList, Clock, Lightbulb, RotateCcw, Star, Stethoscope, X } from 'lucide-react'
import { CASES, caseById, type ClinicalCase } from '@/data/cases'
import { Button, Card, PageHeader, SpecialtyBadge } from '@/components/ui/primitives'
import { useProgress } from '@/store/progress'
import { celebrate, playSound } from '@/lib/fx'
import { cn } from '@/lib/utils'

/** Mejor puntaje por caso (0–100). */
const useCaseScores = create<{ best: Record<string, number>; save: (id: string, score: number) => void }>()(
  persist(
    (set, get) => ({
      best: {},
      save: (id, score) => set({ best: { ...get().best, [id]: Math.max(score, get().best[id] ?? 0) } }),
    }),
    { name: 'medlogic-casos', version: 1 },
  ),
)

function stars(score: number) {
  return score >= 90 ? 3 : score >= 70 ? 2 : score > 0 ? 1 : 0
}

function CaseList() {
  const best = useCaseScores((s) => s.best)
  return (
    <div>
      <PageHeader icon={<Stethoscope className="size-6" />} eyebrow="Aprende como en la guardia" title="Casos clínicos" subtitle="El paciente llega y tú decides: qué estudio pedir, cuál es el diagnóstico y cómo tratarlo. Cada decisión se explica." />
      <div className="grid gap-4 md:grid-cols-2">
        {CASES.map((c, i) => {
          const s = best[c.id]
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={`/casos/${c.id}`} className="card card-hover group flex h-full flex-col p-5">
                <div className="flex items-center gap-2">
                  <SpecialtyBadge id={c.specialty} />
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted">
                    <Clock className="size-3.5" /> {c.minutes} min
                  </span>
                </div>
                <h2 className="mt-3 font-display text-lg font-bold">{c.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{c.intro}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="flex gap-0.5" aria-label={s ? `${stars(s)} de 3 estrellas` : 'Sin hacer'}>
                    {[1, 2, 3].map((n) => (
                      <Star key={n} className={cn('size-4', s && n <= stars(s) ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600')} />
                    ))}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-brand-700 dark:text-brand-400">
                    {s ? `Mejor: ${s} %` : 'Empezar'} <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function CasePlayer({ c, onRestart }: { c: ClinicalCase; onRestart: () => void }) {
  const navigate = useNavigate()
  const addXp = useProgress((s) => s.addXp)
  const save = useCaseScores((s) => s.save)
  const [step, setStep] = useState(0)
  const [tried, setTried] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [revealed, setRevealed] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const s = c.steps[step]
  const score = useMemo(() => Math.max(0, Math.round(100 - (mistakes / (c.steps.length * 3)) * 100 * 1.5)), [mistakes, c.steps.length])

  const choose = (i: number) => {
    if (solved || tried.includes(i)) return
    setTried([...tried, i])
    if (s.options[i].correct) {
      setSolved(true)
      playSound('correct')
      if (s.reveal) setRevealed((r) => [...r, s.reveal!])
    } else {
      setMistakes((m) => m + 1)
      playSound('wrong')
    }
  }

  const next = () => {
    if (step + 1 >= c.steps.length) {
      setDone(true)
      save(c.id, score)
      addXp(Math.round(score / 5))
      if (score >= 70) celebrate(score >= 90 ? 'big' : 'small')
      return
    }
    setStep(step + 1)
    setTried([])
    setSolved(false)
  }

  if (done) {
    const n = stars(score)
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Card className="p-6 text-center">
          <div className="flex justify-center gap-1">
            {[1, 2, 3].map((k) => (
              <motion.span key={k} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 * k, type: 'spring' }}>
                <Star className={cn('size-10', k <= n ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600')} />
              </motion.span>
            ))}
          </div>
          <h2 className="mt-3 font-display text-2xl font-extrabold">Caso resuelto: {score} %</h2>
          <p className="mt-1 text-sm text-muted">{mistakes === 0 ? 'Ninguna decisión equivocada. Excelente manejo.' : `${mistakes} ${mistakes === 1 ? 'decisión equivocada' : 'decisiones equivocadas'} en el camino.`}</p>
        </Card>
        <Card className="p-6">
          <h3 className="flex items-center gap-2 font-semibold">
            <Lightbulb className="size-5 text-amber-500" /> Lo que tienes que recordar
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {c.keyPoints.map((k) => (
              <li key={k} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {k}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted">
            <BookOpen className="mt-0.5 size-3.5 shrink-0" /> {c.reference}
          </p>
        </Card>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button size="lg" variant="outline" onClick={onRestart}>
            <RotateCcw className="size-5" /> Repetir el caso
          </Button>
          <Button size="lg" onClick={() => navigate('/casos')}>
            Otro caso <ArrowRight className="size-5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/casos" className="grid size-11 place-items-center rounded-xl text-muted hover:text-[var(--text)]" aria-label="Salir del caso">
            <X className="size-5" />
          </Link>
          <div className="h-2 flex-1 overflow-hidden rounded-full surface-2">
            <motion.div className="h-full w-full origin-left rounded-full bg-brand-500" animate={{ scaleX: (step + (solved ? 1 : 0)) / c.steps.length }} />
          </div>
          <span className="text-sm font-bold tabular-nums">
            {step + 1}/{c.steps.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="card p-5 sm:p-6">
            <span className="inline-flex rounded-full bg-violet-500/15 px-3 py-1 text-xs font-bold tracking-wide text-violet-700 uppercase dark:text-violet-300">{s.stage}</span>
            <h2 className="mt-3 font-display text-xl font-bold">{s.prompt}</h2>
            <div className="mt-5 space-y-2.5">
              {s.options.map((o, i) => {
                const was = tried.includes(i)
                const state = was ? (o.correct ? 'ok' : 'bad') : solved && o.correct ? 'ok' : 'idle'
                return (
                  <div key={i}>
                    <button
                      onClick={() => choose(i)}
                      disabled={solved || was}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left font-medium transition-colors',
                        state === 'ok' ? 'border-emerald-500 bg-emerald-500/10' : state === 'bad' ? 'border-rose-500 bg-rose-500/10' : 'border-soft bg-[var(--surface)] hover:border-brand-500/40',
                        solved && state === 'idle' && 'opacity-60',
                      )}
                    >
                      <span className={cn('mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border text-xs font-bold', state === 'ok' ? 'border-emerald-500 bg-emerald-500 text-white' : state === 'bad' ? 'border-rose-500 bg-rose-500 text-white' : 'border-soft text-muted')}>
                        {state === 'ok' ? <Check className="size-3.5" /> : state === 'bad' ? <X className="size-3.5" /> : String.fromCharCode(65 + i)}
                      </span>
                      <span className="leading-snug">{o.text}</span>
                    </button>
                    {was && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={cn('mt-1.5 px-2 text-sm', o.correct ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300')}>
                        {o.why}
                      </motion.p>
                    )}
                  </div>
                )
              })}
            </div>
            {!solved && tried.length > 0 && <p className="mt-4 text-sm text-muted">Piénsalo otra vez y elige otra opción.</p>}
            {solved && (
              <Button size="lg" className="mt-5 w-full" onClick={next}>
                {step + 1 >= c.steps.length ? 'Terminar el caso' : 'Continuar'} <ArrowRight className="size-5" />
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <aside className="space-y-3 max-lg:order-first lg:sticky lg:top-24 lg:h-fit">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ClipboardList className="size-4" /> Expediente
          </div>
          <h1 className="mt-2 font-display text-lg font-bold">{c.title}</h1>
          <p className="mt-2 text-sm leading-relaxed">{c.intro}</p>
          {c.vitals && <p className="mt-3 rounded-xl surface-2 px-3 py-2 font-mono text-xs">{c.vitals}</p>}
          {revealed.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-soft pt-4">
              <div className="text-xs font-semibold tracking-wide text-muted uppercase">Nuevos hallazgos</div>
              {revealed.map((r, i) => (
                <motion.p key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl bg-sky-500/10 px-3 py-2 text-sm">
                  {r}
                </motion.p>
              ))}
            </div>
          )}
        </Card>
      </aside>
    </div>
  )
}

export default function Cases() {
  const { id } = useParams()
  const [run, setRun] = useState(0)
  if (!id) return <CaseList />
  const c = caseById(id)
  if (!c)
    return (
      <Card className="p-6">
        Caso no encontrado. <Link to="/casos" className="font-semibold text-brand-700 underline dark:text-brand-400">Ver todos los casos</Link>
      </Card>
    )
  return <CasePlayer key={`${c.id}-${run}`} c={c} onRestart={() => setRun((r) => r + 1)} />
}
