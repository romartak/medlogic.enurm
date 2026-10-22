import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Eye, Lightbulb, X } from 'lucide-react'
import { CLUE_CASES } from '@/data/games'
import { Button } from '@/components/ui/primitives'
import { playSound } from '@/lib/fx'
import { cn, shuffle } from '@/lib/utils'
import { GameShell, type EndGame } from './GameShell'

const CASES_PER_GAME = 5

function Round({ end }: { end: EndGame }) {
  const cases = useMemo(() => shuffle(CLUE_CASES).slice(0, CASES_PER_GAME).map((c) => ({ ...c, options: shuffle(c.options) })), [])
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(1)
  const [guess, setGuess] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [solved, setSolved] = useState(0)
  const c = cases[i]
  const points = (6 - shown) * 20

  const choose = (opt: string) => {
    if (guess) return
    setGuess(opt)
    const ok = opt === c.diagnosis
    playSound(ok ? 'correct' : 'wrong')
    if (ok) {
      setScore((s) => s + points)
      setSolved((s) => s + 1)
    }
  }

  const next = () => {
    if (i + 1 >= cases.length) {
      end(score, <span className="text-muted">{solved} de {cases.length} casos resueltos</span>)
      return
    }
    setI(i + 1)
    setShown(1)
    setGuess(null)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-muted">
          Caso {i + 1} / {cases.length}
        </span>
        <span className="font-display text-xl font-bold">{score} pts</span>
      </div>
      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Lightbulb className="size-5 text-amber-500" /> Pistas
          </h2>
          {!guess && <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-600">Vale {points} pts</span>}
        </div>
        <ol className="space-y-2">
          <AnimatePresence initial={false}>
            {c.clues.slice(0, guess ? 5 : shown).map((clue, k) => (
              <motion.li key={k} initial={{ opacity: 0, x: -16, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} className="flex gap-3 rounded-xl surface-2 p-3 text-sm">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-500 text-xs font-bold text-white">{k + 1}</span>
                {clue}
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
        {!guess && shown < 5 && (
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShown(shown + 1)}>
            <Eye className="size-4" /> Revelar otra pista (−20 pts)
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {c.options.map((o) => {
          const state = !guess ? 'idle' : o === c.diagnosis ? 'correct' : o === guess ? 'wrong' : 'dim'
          return (
            <motion.button
              key={o}
              whileTap={{ scale: 0.97 }}
              onClick={() => choose(o)}
              className={cn(
                'flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors',
                state === 'idle' && 'border-soft bg-[var(--surface)] hover:border-brand-500/50',
                state === 'correct' && 'border-emerald-500 bg-emerald-500/10',
                state === 'wrong' && 'border-rose-500 bg-rose-500/10',
                state === 'dim' && 'border-soft opacity-50',
              )}
            >
              {o}
              {state === 'correct' && <Check className="size-4 text-emerald-500" />}
              {state === 'wrong' && <X className="size-4 text-rose-500" />}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {guess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.06] p-4 text-sm">{c.explanation}</div>
            <Button size="lg" className="mt-4 w-full" onClick={next}>
              {i + 1 < cases.length ? 'Siguiente caso' : 'Ver puntuación'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Clues() {
  return (
    <GameShell id="pistas" rules={[`${CASES_PER_GAME} casos clínicos por partida.`, 'Empiezas con una pista; puedes revelar hasta 5.', 'Con 1 pista el diagnóstico vale 100 puntos; cada pista extra resta 20.']}>
      {(end) => <Round end={end} />}
    </GameShell>
  )
}
