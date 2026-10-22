import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, PartyPopper, RotateCcw, Repeat } from 'lucide-react'
import type { Flashcard, SrsGrade } from '@/types'
import { useProgress } from '@/store/progress'
import { useBank } from '@/store/bank'
import { ALL_DECK_ID, allDecks, cardsForDeck, errorCards } from '@/lib/decks'
import { isDue, previewInterval } from '@/lib/srs'
import { Button, EmptyState, ProgressBar, SpecialtyBadge } from '@/components/ui/primitives'
import { useHotkeys } from '@/hooks/useHotkeys'
import { celebrate, playSound } from '@/lib/fx'
import { cn, shuffle } from '@/lib/utils'

const NEW_PER_SESSION = 20

const GRADES: { grade: SrsGrade; label: string; className: string }[] = [
  { grade: 0, label: 'Otra vez', className: 'bg-rose-500 hover:bg-rose-600' },
  { grade: 1, label: 'Difícil', className: 'bg-amber-500 hover:bg-amber-600' },
  { grade: 2, label: 'Bien', className: 'bg-emerald-500 hover:bg-emerald-600' },
  { grade: 3, label: 'Fácil', className: 'bg-sky-500 hover:bg-sky-600' },
]

function buildQueue(cards: Flashcard[], srs: Record<string, unknown>, cram: boolean): Flashcard[] {
  if (cram) return shuffle(cards)
  const due = cards.filter((c) => srs[c.id] && isDue(srs[c.id] as never))
  const fresh = cards.filter((c) => !srs[c.id]).slice(0, NEW_PER_SESSION)
  return [...shuffle(due), ...fresh]
}

export default function FlashcardStudy() {
  const { deckId = ALL_DECK_ID } = useParams()
  const srs = useProgress((s) => s.srs)
  const customCards = useProgress((s) => s.customCards)
  const attempts = useProgress((s) => s.attempts)
  const reviewCard = useProgress((s) => s.reviewCard)
  const byId = useBank((s) => s.byId)
  const deck = allDecks().find((d) => d.id === deckId)
  const deckCards = useMemo(() => cardsForDeck(deckId, customCards, errorCards(attempts, byId)), [deckId, customCards, attempts, byId])

  const [cram, setCram] = useState(false)
  // La cola se fija al iniciar la sesión; "Otra vez" reinserta la tarjeta al final.
  const [queue, setQueue] = useState<Flashcard[]>(() => buildQueue(deckCards, srs, false))
  const [initialSize, setInitialSize] = useState(queue.length)
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [direction, setDirection] = useState(1)

  const card = queue[0]

  const restart = (asCram: boolean) => {
    const q = buildQueue(deckCards, useProgress.getState().srs, asCram)
    setCram(asCram)
    setQueue(q)
    setInitialSize(q.length)
    setReviewed(0)
    setFlipped(false)
  }

  const grade = (g: SrsGrade) => {
    if (!card || !flipped) return
    reviewCard(card.id, g)
    playSound(g === 0 ? 'wrong' : 'tick')
    setDirection(g === 0 ? -1 : 1)
    setFlipped(false)
    setReviewed((r) => r + 1)
    const rest = queue.slice(1)
    const next = g === 0 ? [...rest, card] : rest
    setQueue(next)
    if (next.length === 0) {
      celebrate('big')
      playSound('win')
    }
  }

  useHotkeys((e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (!flipped) setFlipped(true)
      else grade(2)
    }
    const n = Number(e.key)
    if (flipped && n >= 1 && n <= 4) grade((n - 1) as SrsGrade)
  })

  const header = (
    <div className="mb-6 flex items-center gap-3">
      <Link to="/flashcards" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-muted hover:text-[var(--text)]">
        <ArrowLeft className="size-4" /> Mazos
      </Link>
      <div className="min-w-0 flex-1 text-center">
        <div className="truncate font-display font-bold">{deckId === ALL_DECK_ID ? 'Repaso general' : (deck?.name ?? 'Mazo')}</div>
        {cram && <div className="text-[11px] text-amber-600">Modo intensivo</div>}
      </div>
      <span className="text-sm font-semibold tabular-nums text-muted">{queue.length} restantes</span>
    </div>
  )

  if (!card) {
    return (
      <div className="mx-auto max-w-2xl">
        {header}
        {reviewed > 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-brand-gradient text-white shadow-glow">
              <PartyPopper className="size-9" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">¡Sesión terminada!</h2>
            <p className="mt-2 text-muted">Repasaste {reviewed} tarjetas. Tu memoria te lo agradecerá en el examen.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => restart(true)}>
                <Repeat className="size-4" /> Repasar todo otra vez
              </Button>
              <Link to="/flashcards" className="inline-flex h-10 items-center rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-white">
                Volver a los mazos
              </Link>
            </div>
          </motion.div>
        ) : (
          <EmptyState
            icon={<RotateCcw className="size-7" />}
            title={deckCards.length ? 'Todo al día' : 'Este mazo está vacío'}
            body={deckCards.length ? 'No tienes tarjetas pendientes en este mazo. Vuelve mañana o repasa en modo intensivo.' : 'Agrega tarjetas o falla algunas preguntas para generar este mazo.'}
            action={
              deckCards.length > 0 && (
                <Button onClick={() => restart(true)}>
                  <Repeat className="size-4" /> Modo intensivo ({deckCards.length})
                </Button>
              )
            }
          />
        )}
      </div>
    )
  }

  const state = srs[card.id]

  return (
    <div className="mx-auto max-w-2xl">
      {header}
      <ProgressBar value={initialSize ? Math.min(1, reviewed / initialSize) : 0} className="mb-6" />

      <div className="perspective relative h-[380px] sm:h-[420px]">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={card.id + reviewed}
            custom={direction}
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            variants={{ exit: (d: number) => ({ opacity: 0, x: d * 260, rotate: d * 12, transition: { duration: 0.3 } }) }}
            exit="exit"
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="absolute inset-0"
          >
            <motion.button
              onClick={() => setFlipped((f) => !f)}
              className="preserve-3d relative h-full w-full text-left"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              aria-label={flipped ? 'Ver frente' : 'Ver respuesta'}
            >
              {/* Frente */}
              <div className="backface-hidden card absolute inset-0 flex flex-col p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  {card.specialty ? <SpecialtyBadge id={card.specialty} /> : <span />}
                  {!state && <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-[11px] font-bold text-brand-600 dark:text-brand-400">NUEVA</span>}
                </div>
                <div className="flex flex-1 items-center justify-center overflow-y-auto py-4">
                  <p className={cn('text-center font-display font-semibold whitespace-pre-line', card.front.length > 160 ? 'text-base' : 'text-xl sm:text-2xl')}>{card.front}</p>
                </div>
                <p className="text-center text-xs text-muted">
                  Toca o presiona <span className="kbd">Espacio</span> para ver la respuesta
                </p>
              </div>
              {/* Reverso */}
              <div className="backface-hidden card absolute inset-0 flex flex-col border-brand-500/30 p-6 sm:p-8" style={{ transform: 'rotateY(180deg)' }}>
                <div className="text-xs font-semibold tracking-wider text-brand-600 uppercase dark:text-brand-400">Respuesta</div>
                <div className="flex flex-1 items-center justify-center overflow-y-auto py-4">
                  <p className={cn('text-center whitespace-pre-line', card.back.length > 200 ? 'text-sm sm:text-base' : 'text-lg sm:text-xl')}>{card.back}</p>
                </div>
                <p className="line-clamp-2 text-center text-xs text-muted">{card.front}</p>
              </div>
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 h-20">
        <AnimatePresence mode="wait">
          {flipped ? (
            <motion.div key="grades" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="grid grid-cols-4 gap-2">
              {GRADES.map((g, i) => (
                <motion.button key={g.grade} whileTap={{ scale: 0.94 }} onClick={() => grade(g.grade)} className={cn('flex flex-col items-center rounded-xl py-2.5 text-white shadow-sm transition-colors', g.className)}>
                  <span className="text-sm font-bold">{g.label}</span>
                  <span className="text-[11px] opacity-85">
                    {previewInterval(state, g.grade)} · {i + 1}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button size="lg" className="w-full" onClick={() => setFlipped(true)}>
                Mostrar respuesta
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
