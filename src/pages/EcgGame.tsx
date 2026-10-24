import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Activity, ArrowRight, BookOpen, Check, HeartPulse, RotateCcw, Trophy, X } from 'lucide-react'
import { Button, Card, PageHeader } from '@/components/ui/primitives'
import { EcgStrip } from '@/components/EcgStrip'
import { ECG_PATTERNS, ecgById, makeStrip } from '@/lib/ecg'
import { useProgress } from '@/store/progress'
import { celebrate, playSound } from '@/lib/fx'
import { cn, shuffle } from '@/lib/utils'

const ROUND = 10
const SECONDS = 6

const useEcgBest = create<{ best: number; save: (n: number) => void }>()(
  persist((set, get) => ({ best: 0, save: (n) => set({ best: Math.max(get().best, n) }) }), { name: 'medlogic-ecg', version: 1 }),
)

interface Item {
  id: string
  seed: string
  options: string[]
}

function newRound(): Item[] {
  const ids = shuffle(ECG_PATTERNS.map((p) => p.id)).slice(0, ROUND)
  return ids.map((id) => ({
    id,
    seed: Math.random().toString(36).slice(2, 8),
    options: shuffle([id, ...shuffle(ECG_PATTERNS.map((p) => p.id).filter((x) => x !== id)).slice(0, 3)]),
  }))
}

/** Galería para estudiar cada ritmo antes de jugar. */
function Atlas() {
  const strips = useMemo(() => ECG_PATTERNS.map((p) => ({ p, ...makeStrip(p.id, 'atlas', SECONDS) })), [])
  return (
    <div className="space-y-4">
      {strips.map(({ p, samples }) => (
        <Card key={p.id} className="p-4 sm:p-5">
          <h3 className="font-display font-bold">{p.name}</h3>
          <EcgStrip samples={samples} seconds={SECONDS} className="mt-3" />
          <p className="mt-3 text-sm">
            <b>Cómo reconocerlo:</b> {p.clues}
          </p>
          <p className="mt-1 text-sm text-muted">
            <b className="text-[var(--text)]">Qué hacer:</b> {p.management}
          </p>
        </Card>
      ))}
    </div>
  )
}

export default function EcgGame() {
  const addXp = useProgress((s) => s.addXp)
  const best = useEcgBest((s) => s.best)
  const saveBest = useEcgBest((s) => s.save)
  const [mode, setMode] = useState<'menu' | 'play' | 'atlas'>('menu')
  const [round, setRound] = useState<Item[]>([])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const item = round[i]
  const strip = useMemo(() => (item ? makeStrip(item.id, item.seed, SECONDS) : null), [item])

  const start = () => {
    setRound(newRound())
    setI(0)
    setScore(0)
    setPicked(null)
    setFinished(false)
    setMode('play')
  }

  const choose = (id: string) => {
    if (picked) return
    setPicked(id)
    const ok = id === item.id
    playSound(ok ? 'correct' : 'wrong')
    if (ok) setScore((s) => s + 1)
  }

  const next = () => {
    if (i + 1 >= round.length) {
      const final = score
      saveBest(final)
      addXp(final * 2)
      if (final >= 8) celebrate(final === ROUND ? 'big' : 'small')
      setFinished(true)
      return
    }
    setI(i + 1)
    setPicked(null)
  }

  const header = <PageHeader icon={<HeartPulse className="size-6" />} eyebrow="Juego" title="Lee el ECG" subtitle="Mira la tira y di qué ritmo es. Arritmias, bloqueos, potasio alto y lesión aguda: lo que más sale en el ENURM." />

  if (mode === 'atlas')
    return (
      <div>
        {header}
        <div className="mb-4 flex gap-2">
          <Button onClick={start}>
            <Activity className="size-4" /> Jugar
          </Button>
          <Button variant="ghost" onClick={() => setMode('menu')}>
            Volver
          </Button>
        </div>
        <Atlas />
      </div>
    )

  if (mode === 'menu')
    return (
      <div>
        {header}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="flex flex-col p-6">
            <Activity className="size-8 text-rose-500" />
            <h2 className="mt-3 font-display text-lg font-bold">Jugar una ronda</h2>
            <p className="mt-1 text-sm text-muted">{ROUND} tiras distintas. Cada respuesta te explica cómo reconocer el ritmo y qué hacer.</p>
            {best > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-sm">
                <Trophy className="size-4 text-amber-500" /> Tu récord: <b>{best}/{ROUND}</b>
              </p>
            )}
            <Button size="lg" className="mt-5" onClick={start}>
              Empezar <ArrowRight className="size-5" />
            </Button>
          </Card>
          <Card className="flex flex-col p-6">
            <BookOpen className="size-8 text-brand-600 dark:text-brand-400" />
            <h2 className="mt-3 font-display text-lg font-bold">Estudiar los {ECG_PATTERNS.length} ritmos</h2>
            <p className="mt-1 text-sm text-muted">Cada ritmo con su tira, cómo reconocerlo y el manejo, para repasar antes de jugar.</p>
            <Button size="lg" variant="outline" className="mt-auto" onClick={() => setMode('atlas')}>
              Ver los ritmos
            </Button>
          </Card>
        </div>
        <p className="mt-6 text-xs text-muted">
          Las tiras son simulaciones didácticas de una derivación (DII). Para diagnosticar a un paciente usa siempre el ECG de 12 derivaciones. ¿Quieres más? Prueba los <Link to="/casos" className="font-semibold underline">casos clínicos</Link>.
        </p>
      </div>
    )

  if (finished)
    return (
      <div className="mx-auto max-w-xl">
        {header}
        <Card className="p-6 text-center">
          <Trophy className="mx-auto size-12 text-amber-500" />
          <h2 className="mt-3 font-display text-3xl font-extrabold">
            {score}/{ROUND}
          </h2>
          <p className="mt-1 text-muted">{score === ROUND ? '¡Perfecto! Lees ECG como cardiólogo.' : score >= 7 ? 'Muy bien. Repasa los que fallaste.' : 'Repasa los ritmos y vuelve a intentarlo.'}</p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Button size="lg" onClick={start}>
              <RotateCcw className="size-5" /> Otra ronda
            </Button>
            <Button size="lg" variant="outline" onClick={() => setMode('atlas')}>
              <BookOpen className="size-5" /> Repasar ritmos
            </Button>
          </div>
        </Card>
      </div>
    )

  const pattern = ecgById(item.id)
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setMode('menu')} className="grid size-10 place-items-center rounded-xl text-muted hover:text-[var(--text)]" aria-label="Salir">
          <X className="size-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full surface-2">
          <motion.div className="h-full rounded-full bg-rose-500" animate={{ width: `${((i + (picked ? 1 : 0)) / round.length) * 100}%` }} />
        </div>
        <span className="text-sm font-bold tabular-nums">
          {i + 1}/{round.length}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="card space-y-4 p-4 sm:p-6">
          <h2 className="font-display text-xl font-bold">¿Qué muestra esta tira?</h2>
          {strip && <EcgStrip samples={strip.samples} seconds={SECONDS} />}
          <div className="grid gap-2.5 sm:grid-cols-2">
            {item.options.map((id) => {
              const isAnswer = picked && id === item.id
              const isWrong = picked === id && id !== item.id
              return (
                <button
                  key={id}
                  onClick={() => choose(id)}
                  disabled={!!picked}
                  className={cn('flex min-h-14 items-center gap-2 rounded-2xl border-2 px-4 py-3 text-left font-medium transition-colors', isAnswer ? 'border-emerald-500 bg-emerald-500/10' : isWrong ? 'border-rose-500 bg-rose-500/10' : 'border-soft bg-[var(--surface)] hover:border-brand-500/40', picked && !isAnswer && !isWrong && 'opacity-60')}
                >
                  {isAnswer && <Check className="size-4 shrink-0 text-emerald-600" />}
                  {isWrong && <X className="size-4 shrink-0 text-rose-600" />}
                  {ecgById(id).name}
                </button>
              )
            })}
          </div>
          {picked && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn('rounded-2xl p-4 text-sm', picked === item.id ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
              <div className="font-semibold">{picked === item.id ? '¡Correcto!' : `Es: ${pattern.name}`}</div>
              <p className="mt-1">
                <b>Cómo reconocerlo:</b> {pattern.clues}
              </p>
              <p className="mt-1">
                <b>Qué hacer:</b> {pattern.management}
              </p>
            </motion.div>
          )}
          {picked && (
            <Button size="lg" className="w-full" onClick={next}>
              {i + 1 >= round.length ? 'Ver resultado' : 'Siguiente'} <ArrowRight className="size-5" />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
