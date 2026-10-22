import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Flame, Timer } from 'lucide-react'
import { useBank } from '@/store/bank'
import { useProgress } from '@/store/progress'
import { useCountdown } from '@/hooks/useCountdown'
import { playSound } from '@/lib/fx'
import { cn, shuffle } from '@/lib/utils'
import { GameShell, type EndGame } from './GameShell'
import { QuickQuestion } from './QuickQuestion'

function Round({ end }: { end: EndGame }) {
  const questions = useBank((s) => s.questions)
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const deck = useMemo(() => shuffle(questions), [questions])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [stats, setStats] = useState({ ok: 0, total: 0 })
  const [delta, setDelta] = useState<{ v: number; k: number } | null>(null)
  const [left, adjust] = useCountdown(60, true, () =>
    end(score, (
      <span className="text-muted">
        {stats.ok} correctas de {stats.total} · mejor racha {bestStreak}
      </span>
    )),
  )

  const q = deck[i % deck.length]

  const onAnswer = (ok: boolean, choice: number) => {
    recordAnswer(q, choice)
    playSound(ok ? 'correct' : 'wrong')
    const bonus = ok ? 10 + Math.min(streak, 10) * 2 : 0
    setScore((s) => s + bonus)
    setStreak((s) => (ok ? s + 1 : 0))
    if (ok) setBestStreak((b) => Math.max(b, streak + 1))
    setStats((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }))
    const dt = ok ? 3 : -5
    adjust(dt)
    setDelta({ v: dt, k: Date.now() })
    setI((x) => x + 1)
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className={cn('card relative flex items-center justify-center gap-2 overflow-hidden py-3 font-mono text-2xl font-bold tabular-nums', left < 10 && 'text-rose-500')}>
          <Timer className="size-5" /> {Math.ceil(left)}
          <AnimatePresence>
            {delta && (
              <motion.span key={delta.k} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -24 }} transition={{ duration: 0.9 }} className={cn('absolute right-3 text-sm font-bold', delta.v > 0 ? 'text-emerald-500' : 'text-rose-500')}>
                {delta.v > 0 ? `+${delta.v}` : delta.v}s
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="card py-3 text-center">
          <div className="text-[11px] text-muted">Puntos</div>
          <motion.div key={score} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="font-display text-xl font-bold">
            {score}
          </motion.div>
        </div>
        <div className="card py-3 text-center">
          <div className="text-[11px] text-muted">Racha</div>
          <div className={cn('flex items-center justify-center gap-1 font-display text-xl font-bold', streak >= 3 && 'text-orange-500')}>
            <Flame className="size-4" /> {streak}
          </div>
        </div>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full surface-2">
        <div className="h-full rounded-full bg-brand-gradient transition-[width] duration-300" style={{ width: `${Math.min(100, (left / 60) * 100)}%` }} />
      </div>
      <QuickQuestion key={i} question={q} onAnswer={onAnswer} revealMs={350} />
    </div>
  )
}

export default function TimeAttack() {
  return (
    <GameShell id="contrarreloj" rules={['Tienes 60 segundos.', 'Acierto: +3 s y +10 puntos (más bonus por racha).', 'Error: −5 s.', 'Atajos: teclas 1 a 5.']}>
      {(end) => <Round end={end} />}
    </GameShell>
  )
}
