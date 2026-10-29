import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, RotateCcw, Trophy, X } from 'lucide-react'
import { Button, Card } from '@/components/ui/primitives'
import { useProgress } from '@/store/progress'
import { celebrate, playSound } from '@/lib/fx'
import { cn, shuffle } from '@/lib/utils'
import type { QuizItem } from '@/types'

/** Ronda de práctica corta (preguntas en orden aleatorio y opciones barajadas) con explicación tras cada respuesta. */
export function PracticeQuiz({ items, title = 'Ponte a prueba', size = 8 }: { items: QuizItem[]; title?: string; size?: number }) {
  const addXp = useProgress((s) => s.addXp)
  const [run, setRun] = useState(0)
  const round = useMemo(
    () =>
      shuffle(items)
        .slice(0, size)
        .map((it) => {
          const order = shuffle(it.options.map((_, i) => i))
          return { ...it, options: order.map((i) => it.options[i]), answer: order.indexOf(it.answer) }
        }),
    // `run` rehace la ronda al repetir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, size, run],
  )
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const item = round[i]

  const choose = (k: number) => {
    if (picked !== null) return
    setPicked(k)
    const ok = k === item.answer
    playSound(ok ? 'correct' : 'wrong')
    if (ok) setScore((s) => s + 1)
  }

  const next = () => {
    if (i + 1 >= round.length) {
      setDone(true)
      addXp(score * 2)
      if (score === round.length) celebrate('small')
      return
    }
    setI(i + 1)
    setPicked(null)
  }

  const restart = () => {
    setRun((r) => r + 1)
    setI(0)
    setPicked(null)
    setScore(0)
    setDone(false)
  }

  if (done)
    return (
      <Card className="p-6 text-center">
        <Trophy className="mx-auto size-10 text-amber-500" />
        <h3 className="mt-2 font-display text-2xl font-extrabold">
          {score}/{round.length}
        </h3>
        <p className="mt-1 text-sm text-muted">{score === round.length ? '¡Perfecto!' : score >= round.length * 0.7 ? 'Muy bien. Repasa las que fallaste.' : 'Repasa el tema y vuelve a intentarlo.'}</p>
        <Button className="mt-5" onClick={restart}>
          <RotateCcw className="size-4" /> Otra ronda
        </Button>
      </Card>
    )

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <h3 className="font-display font-bold">{title}</h3>
        <div className="ml-auto h-1.5 w-24 overflow-hidden rounded-full surface-2">
          <motion.div className="h-full w-full origin-left rounded-full bg-brand-500" animate={{ scaleX: (i + (picked !== null ? 1 : 0)) / round.length }} />
        </div>
        <span className="text-sm font-bold tabular-nums">
          {i + 1}/{round.length}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`${run}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          <p className="mt-4 font-medium leading-relaxed">{item.q}</p>
          <div className="mt-4 space-y-2">
            {item.options.map((o, k) => {
              const right = picked !== null && k === item.answer
              const wrong = picked === k && k !== item.answer
              return (
                <button
                  key={k}
                  onClick={() => choose(k)}
                  disabled={picked !== null}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left text-sm transition-colors',
                    right ? 'border-emerald-500 bg-emerald-500/10' : wrong ? 'border-rose-500 bg-rose-500/10' : 'border-soft hover:border-brand-500/40',
                    picked !== null && !right && !wrong && 'opacity-60',
                  )}
                >
                  <span className={cn('grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold', right ? 'bg-emerald-500 text-white' : wrong ? 'bg-rose-500 text-white' : 'surface-2 text-muted')}>
                    {right ? <Check className="size-3.5" /> : wrong ? <X className="size-3.5" /> : String.fromCharCode(65 + k)}
                  </span>
                  <span className="pt-0.5">{o}</span>
                </button>
              )
            })}
          </div>
          {picked !== null && (
            <div className={cn('mt-4 rounded-xl p-4 text-sm', picked === item.answer ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
              <div className="font-semibold">{picked === item.answer ? '¡Correcto!' : `Respuesta: ${item.options[item.answer]}`}</div>
              <p className="mt-1 leading-relaxed">{item.why}</p>
            </div>
          )}
          {picked !== null && (
            <Button className="mt-4 w-full" onClick={next}>
              {i + 1 >= round.length ? 'Ver resultado' : 'Siguiente'} <ArrowRight className="size-4" />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  )
}
