import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Play, RotateCcw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { useProgress, type GameId } from '@/store/progress'
import { celebrate, playSound } from '@/lib/fx'
import { GAMES } from './Games'

export type EndGame = (score: number, summary?: ReactNode) => void

export function GameShell({ id, rules, children }: { id: GameId; rules: string[]; children: (end: EndGame) => ReactNode }) {
  const game = GAMES.find((g) => g.id === id)!
  const best = useProgress((s) => s.highscores[id])
  const recordGame = useProgress((s) => s.recordGame)
  const [phase, setPhase] = useState<'intro' | 'play' | 'over'>('intro')
  const [round, setRound] = useState(0)
  const [result, setResult] = useState<{ score: number; record: boolean; summary?: ReactNode } | null>(null)

  const end: EndGame = (score, summary) => {
    const record = recordGame(id, score)
    setResult({ score, record, summary })
    setPhase('over')
    if (record) {
      celebrate('big')
      playSound('win')
    }
  }

  const start = () => {
    setRound((r) => r + 1)
    setPhase('play')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/juegos" className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)]">
        <ArrowLeft className="size-4" /> Juegos
      </Link>
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="card overflow-hidden">
            <div className={`relative bg-gradient-to-br ${game.gradient} px-6 py-12 text-center text-white sm:py-16`}>
              <div className="absolute inset-0 opacity-30 grid-pattern" />
              <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }} className="relative mx-auto grid size-20 place-items-center rounded-3xl bg-white/20 backdrop-blur">
                <game.icon className="size-10" />
              </motion.span>
              <h1 className="relative mt-5 text-3xl font-extrabold sm:text-4xl">{game.title}</h1>
              <p className="relative mx-auto mt-2 max-w-md text-white/85">{game.description}</p>
            </div>
            <div className="p-6 sm:p-8">
              <h2 className="text-sm font-semibold">Reglas</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {rules.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" />
                    {r}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="size-5 text-amber-500" />
                  {best !== undefined ? (
                    <span>
                      Tu récord: <b>{best}</b> {game.unit}
                    </span>
                  ) : (
                    <span className="text-muted">Aún sin récord</span>
                  )}
                </div>
                <Button size="lg" onClick={start} className="w-full sm:w-auto">
                  <Play className="size-5 fill-current" /> Jugar
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'play' && (
          <motion.div key={`play-${round}`} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            {children(end)}
          </motion.div>
        )}

        {phase === 'over' && result && (
          <motion.div key="over" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 20 }} className="card p-8 text-center sm:p-12">
            {result.record && (
              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                <Trophy className="size-4" /> ¡Nuevo récord!
              </motion.div>
            )}
            <div className="text-sm font-semibold tracking-wider text-muted uppercase">Puntuación</div>
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="mt-2 font-display text-7xl font-extrabold text-gradient">
              {result.score}
            </motion.div>
            <div className="text-sm text-muted">{game.unit}</div>
            {result.summary && <div className="mt-6 text-sm">{result.summary}</div>}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={start}>
                <RotateCcw className="size-5" /> Jugar de nuevo
              </Button>
              <Link to="/juegos" className="inline-flex h-12 items-center rounded-xl border border-soft px-6 font-semibold">
                Otros juegos
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
