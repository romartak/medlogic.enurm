import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { TRUE_FALSE, type TrueFalseItem } from '@/data/games'
import { useCountdown } from '@/hooks/useCountdown'
import { useHotkeys } from '@/hooks/useHotkeys'
import { playSound } from '@/lib/fx'
import { cn, shuffle } from '@/lib/utils'
import { GameShell, type EndGame } from './GameShell'

const ROUNDS = 15
const SECONDS = 8

function Item({ item, index, total, score, onDone }: { item: TrueFalseItem; index: number; total: number; score: number; onDone: (ok: boolean, pts: number) => void }) {
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [left] = useCountdown(SECONDS, feedback === null, () => answer(null))

  function answer(v: boolean | null) {
    if (feedback !== null) return
    const ok = v === item.answer
    playSound(ok ? 'correct' : 'wrong')
    setFeedback(ok)
    const pts = ok ? 10 + Math.round(left) : 0
    setTimeout(() => onDone(ok, pts), 1400)
  }

  useHotkeys((e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'f') answer(false)
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'v') answer(true)
  })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-muted">
          {index + 1} / {total}
        </span>
        <span className="font-display text-xl font-bold">{score} pts</span>
      </div>
      <div className="mb-5 h-2 overflow-hidden rounded-full surface-2">
        <div className={cn('h-full rounded-full transition-[width] duration-200', left < 3 ? 'bg-rose-500' : 'bg-brand-gradient')} style={{ width: `${(left / SECONDS) * 100}%` }} />
      </div>
      <motion.div initial={{ opacity: 0, rotateX: -30, y: 20 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 22 }} className={cn('card flex min-h-56 flex-col items-center justify-center p-8 text-center transition-colors', feedback === true && 'border-emerald-500 bg-emerald-500/5', feedback === false && 'border-rose-500 bg-rose-500/5')}>
        <p className="font-display text-xl leading-snug font-semibold sm:text-2xl">{item.statement}</p>
        <AnimatePresence>
          {feedback !== null && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
              <div className={cn('text-sm font-bold', item.answer ? 'text-emerald-600' : 'text-rose-600')}>{item.answer ? 'VERDADERO' : 'FALSO'}</div>
              <p className="mt-1 text-sm text-muted">{item.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => answer(false)} disabled={feedback !== null} className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-rose-500 text-lg font-bold text-white shadow-lg transition-colors hover:bg-rose-600 disabled:opacity-60">
          <X className="size-6" /> Falso
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => answer(true)} disabled={feedback !== null} className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-bold text-white shadow-lg transition-colors hover:bg-emerald-600 disabled:opacity-60">
          <Check className="size-6" /> Verdadero
        </motion.button>
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        Teclado: <span className="kbd">F</span> / <span className="kbd">←</span> falso · <span className="kbd">V</span> / <span className="kbd">→</span> verdadero
      </p>
    </div>
  )
}

function Round({ end }: { end: EndGame }) {
  const items = useMemo(() => shuffle(TRUE_FALSE).slice(0, ROUNDS), [])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)

  const onDone = (ok: boolean, pts: number) => {
    const s = score + pts
    const c = correct + (ok ? 1 : 0)
    if (i + 1 >= items.length) {
      end(s, <span className="text-muted">{c} de {items.length} correctas</span>)
      return
    }
    setScore(s)
    setCorrect(c)
    setI(i + 1)
  }

  return <Item key={i} item={items[i]} index={i} total={items.length} score={score} onDone={onDone} />
}

export default function TrueFalse() {
  return (
    <GameShell id="verdadero-falso" rules={[`${ROUNDS} afirmaciones, ${SECONDS} segundos cada una.`, 'Acierto: 10 puntos + los segundos que te sobren.', 'Si se acaba el tiempo cuenta como error.']}>
      {(end) => <Round end={end} />}
    </GameShell>
  )
}
