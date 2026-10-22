import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Clock, MousePointerClick } from 'lucide-react'
import { MATCH_SETS } from '@/data/games'
import { playSound } from '@/lib/fx'
import { cn, formatClock, shuffle } from '@/lib/utils'
import { Segmented } from '@/components/ui/primitives'
import { GameShell, type EndGame } from './GameShell'

interface Tile {
  key: string
  pair: number
  text: string
  side: 'a' | 'b'
}

function Board({ setId, end }: { setId: string; end: EndGame }) {
  const set = MATCH_SETS.find((s) => s.id === setId) ?? MATCH_SETS[0]
  const tiles = useMemo<Tile[]>(() => shuffle(set.pairs.flatMap((p, i) => [{ key: `${i}a`, pair: i, text: p.a, side: 'a' as const }, { key: `${i}b`, pair: i, text: p.b, side: 'b' as const }])), [set])
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [miss, setMiss] = useState<number[]>([])

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const flip = (idx: number) => {
    if (open.length === 2 || open.includes(idx) || matched.has(tiles[idx].pair)) return
    const next = [...open, idx]
    setOpen(next)
    if (next.length < 2) return
    setMoves((m) => m + 1)
    const [a, b] = next.map((n) => tiles[n])
    if (a.pair === b.pair && a.side !== b.side) {
      playSound('correct')
      const m = new Set(matched).add(a.pair)
      setTimeout(() => {
        setMatched(m)
        setOpen([])
        if (m.size === set.pairs.length) {
          const score = Math.max(10, 200 - Math.max(0, moves + 1 - set.pairs.length) * 8 - seconds)
          end(score, <span className="text-muted">{moves + 1} intentos · {formatClock(seconds)}</span>)
        }
      }, 450)
    } else {
      playSound('wrong')
      setMiss(next)
      setTimeout(() => {
        setOpen([])
        setMiss([])
      }, 900)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-semibold">
          <MousePointerClick className="size-4" /> {moves} intentos
        </span>
        <span className="font-semibold">
          {matched.size}/{set.pairs.length} parejas
        </span>
        <span className="flex items-center gap-1.5 font-mono font-semibold">
          <Clock className="size-4" /> {formatClock(seconds)}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {tiles.map((t, i) => {
          const isOpen = open.includes(i) || matched.has(t.pair)
          const isMatched = matched.has(t.pair)
          const isMiss = miss.includes(i)
          return (
            <button key={t.key} onClick={() => flip(i)} className="perspective aspect-[3/4] sm:aspect-[4/3]" aria-label={isOpen ? t.text : 'Carta oculta'}>
              <motion.div className="preserve-3d relative h-full w-full" animate={{ rotateY: isOpen ? 180 : 0, x: isMiss ? [0, -4, 4, 0] : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
                <div className="backface-hidden absolute inset-0 grid place-items-center rounded-xl bg-brand-gradient text-2xl font-black text-white/80 shadow-md">?</div>
                <div
                  className={cn(
                    'backface-hidden absolute inset-0 grid place-items-center rounded-xl border-2 p-1.5 text-center text-[11px] leading-tight font-semibold sm:text-sm',
                    isMatched ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : isMiss ? 'border-rose-500 bg-rose-500/10' : 'border-brand-500 bg-[var(--surface)]',
                    t.side === 'b' && !isMatched && !isMiss && 'border-accent-500',
                  )}
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  {t.text}
                </div>
              </motion.div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Memory() {
  const [setId, setSetId] = useState(MATCH_SETS[0].id)
  return (
    <GameShell id="parejas" rules={['Voltea dos cartas por turno.', 'Une cada concepto con su pareja (borde verde-azulado ↔ borde índigo).', 'Menos intentos y menos tiempo = más puntos.']}>
      {(end) => (
        <div>
          <Segmented value={setId} onChange={setSetId} className="mb-5" options={MATCH_SETS.map((s) => ({ value: s.id, label: s.name }))} />
          <Board key={setId} setId={setId} end={end} />
        </div>
      )}
    </GameShell>
  )
}
