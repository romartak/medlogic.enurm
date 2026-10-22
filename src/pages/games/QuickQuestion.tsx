import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import type { Question } from '@/types'
import { SpecialtyBadge } from '@/components/ui/primitives'
import { useHotkeys } from '@/hooks/useHotkeys'
import { cn, LETTERS } from '@/lib/utils'

/** Pregunta compacta para juegos: muestra la respuesta correcta un instante y avisa al padre. */
export function QuickQuestion({ question: q, onAnswer, revealMs = 700 }: { question: Question; onAnswer: (correct: boolean, choice: number) => void; revealMs?: number }) {
  const [choice, setChoice] = useState<number | null>(null)

  const pick = (i: number) => {
    if (choice !== null) return
    setChoice(i)
    const ok = i === q.answer
    setTimeout(() => onAnswer(ok, i), ok ? revealMs : revealMs + 700)
  }

  useHotkeys((e) => {
    const n = Number(e.key)
    if (n >= 1 && n <= q.options.length) pick(n - 1)
  })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-6">
      <SpecialtyBadge id={q.specialty} />
      <p className="mt-3 font-medium leading-relaxed sm:text-lg">{q.stem}</p>
      <div className="mt-4 grid gap-2">
        {q.options.map((o, i) => {
          const state = choice === null ? 'idle' : i === q.answer ? 'correct' : i === choice ? 'wrong' : 'dim'
          return (
            <motion.button
              key={i}
              onClick={() => pick(i)}
              animate={state === 'wrong' ? { x: [0, -6, 6, -3, 3, 0] } : state === 'correct' ? { scale: [1, 1.03, 1] } : {}}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition-colors',
                state === 'idle' && 'border-soft hover:border-brand-500/50 hover:bg-brand-500/5',
                state === 'correct' && 'border-emerald-500 bg-emerald-500/10',
                state === 'wrong' && 'border-rose-500 bg-rose-500/10',
                state === 'dim' && 'border-soft opacity-50',
              )}
            >
              <span className={cn('grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-bold', state === 'correct' ? 'bg-emerald-500 text-white' : state === 'wrong' ? 'bg-rose-500 text-white' : 'surface-2 text-muted')}>
                {state === 'correct' ? <Check className="size-3.5" /> : state === 'wrong' ? <X className="size-3.5" /> : LETTERS[i]}
              </span>
              {o}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
