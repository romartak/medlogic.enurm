import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Heart, HeartCrack } from 'lucide-react'
import { useBank } from '@/store/bank'
import { useProgress } from '@/store/progress'
import { playSound } from '@/lib/fx'
import { shuffle } from '@/lib/utils'
import { GameShell, type EndGame } from './GameShell'
import { QuickQuestion } from './QuickQuestion'

const LIVES = 3

function Round({ end }: { end: EndGame }) {
  const questions = useBank((s) => s.questions)
  const recordAnswer = useProgress((s) => s.recordAnswer)
  // Empieza por las fáciles y sube la dificultad.
  const deck = useMemo(() => shuffle(questions).sort((a, b) => (a.difficulty ?? 2) - (b.difficulty ?? 2)), [questions])
  const [i, setI] = useState(0)
  const [lives, setLives] = useState(LIVES)
  const [score, setScore] = useState(0)

  const onAnswer = (ok: boolean, choice: number) => {
    const q = deck[i % deck.length]
    recordAnswer(q, choice)
    playSound(ok ? 'correct' : 'wrong')
    if (ok) {
      setScore(score + 1)
      setI(i + 1)
      return
    }
    const l = lives - 1
    setLives(l)
    if (l <= 0) end(score, <span className="text-muted">Sobreviviste {score} preguntas.</span>)
    else setI(i + 1)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {Array.from({ length: LIVES }).map((_, k) => (
            <AnimatePresence key={k} mode="wait">
              {k < lives ? (
                <motion.span key="h" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 1.6, opacity: 0 }}>
                  <Heart className="size-7 fill-rose-500 text-rose-500" />
                </motion.span>
              ) : (
                <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <HeartCrack className="size-7 text-muted" />
                </motion.span>
              )}
            </AnimatePresence>
          ))}
        </div>
        <div className="text-right">
          <div className="text-[11px] text-muted">Aciertos</div>
          <motion.div key={score} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="font-display text-2xl font-bold">
            {score}
          </motion.div>
        </div>
      </div>
      <QuickQuestion key={i} question={deck[i % deck.length]} onAnswer={onAnswer} />
    </div>
  )
}

export default function Survival() {
  return (
    <GameShell id="supervivencia" rules={['Empiezas con 3 vidas.', 'Cada error cuesta una vida.', 'La dificultad aumenta a medida que avanzas.', 'Sin límite de tiempo: piensa bien.']}>
      {(end) => <Round end={end} />}
    </GameShell>
  )
}
