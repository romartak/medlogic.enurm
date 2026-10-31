import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bookmark, BookmarkCheck, Check, NotebookPen, X } from 'lucide-react'
import { QuestionAnalysis } from './QuestionAnalysis'
import type { Question } from '@/types'
import { Badge, SpecialtyBadge } from '@/components/ui/primitives'
import { useProgress } from '@/store/progress'
import { cn, LETTERS } from '@/lib/utils'

export type QuestionMode = 'tutor' | 'exam' | 'review'

interface Props {
  question: Question
  mode: QuestionMode
  /** Índice de la opción original elegida (no el de la posición mostrada). */
  selected: number | null
  onSelect?: (originalIndex: number) => void
  revealed?: boolean
  /** Orden de presentación: order[pos] = índice original. */
  order?: number[]
  header?: React.ReactNode
  compact?: boolean
}

const DIFFICULTY = { 1: 'Fácil', 2: 'Media', 3: 'Difícil' } as const

export function QuestionCard({ question: q, mode, selected, onSelect, revealed = false, order, header, compact }: Props) {
  const bookmarks = useProgress((s) => s.bookmarks)
  const toggleBookmark = useProgress((s) => s.toggleBookmark)
  const note = useProgress((s) => s.notes[q.id] ?? '')
  const setNote = useProgress((s) => s.setNote)
  const [noteOpen, setNoteOpen] = useState(false)
  const bookmarked = bookmarks.includes(q.id)
  const showAnswer = mode === 'review' || (mode === 'tutor' && revealed)
  const positions = order ?? q.options.map((_, i) => i)

  return (
    <div className={cn('card relative overflow-hidden', compact ? 'p-4 sm:p-5' : 'p-5 sm:p-7')}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {header}
        <SpecialtyBadge id={q.specialty} />
        {q.year && <Badge>ENURM {q.year}</Badge>}
        {q.topic && <Badge className="hidden sm:inline-flex">{q.topic}</Badge>}
        {q.difficulty && <Badge className="hidden sm:inline-flex">{DIFFICULTY[q.difficulty]}</Badge>}
        {q.sample && <Badge color="#94a3b8">Muestra</Badge>}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setNoteOpen((o) => !o)} className={cn('relative rounded-lg p-2 transition-colors after:absolute after:inset-x-0 after:-inset-y-1.5 hover:bg-slate-900/5 dark:hover:bg-white/5', note ? 'text-accent-500' : 'text-muted')} aria-label="Nota personal" title="Nota personal">
            <NotebookPen className="size-4" />
          </button>
          <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleBookmark(q.id)} className={cn('relative rounded-lg p-2 transition-colors after:absolute after:inset-x-0 after:-inset-y-1.5 hover:bg-slate-900/5 dark:hover:bg-white/5', bookmarked ? 'text-amber-500' : 'text-muted')} aria-label={bookmarked ? 'Quitar de marcadas' : 'Marcar pregunta'} title="Marcar">
            {bookmarked ? <BookmarkCheck className="size-4 fill-amber-500/20" /> : <Bookmark className="size-4" />}
          </motion.button>
        </div>
      </div>

      <p className={cn('leading-relaxed font-medium whitespace-pre-line', compact ? 'text-base' : 'text-base sm:text-lg')}>{q.stem}</p>
      {q.image && <img src={q.image} alt="Imagen de la pregunta" className="mt-4 max-h-80 rounded-xl border border-soft object-contain" loading="lazy" />}

      <div className="mt-5 flex flex-col gap-2.5" role="radiogroup">
        {positions.map((orig, pos) => {
          const isSelected = selected === orig
          const isCorrect = orig === q.answer
          const state = showAnswer ? (isCorrect ? 'correct' : isSelected ? 'wrong' : 'dim') : isSelected ? 'selected' : 'idle'
          const disabled = !onSelect || (mode === 'tutor' && revealed) || mode === 'review'
          return (
            <motion.button
              key={orig}
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelect?.(orig)}
              initial={false}
              animate={state === 'wrong' ? { x: [0, -6, 6, -4, 4, 0] } : state === 'correct' && isSelected ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={cn(
                'group flex w-full items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left text-sm transition-all sm:text-[15px]',
                state === 'idle' && 'border-soft hover:border-brand-500/50 hover:bg-brand-500/[0.04]',
                state === 'selected' && 'border-brand-500 bg-brand-500/[0.08]',
                state === 'correct' && 'border-emerald-500 bg-emerald-500/10',
                state === 'wrong' && 'border-rose-500 bg-rose-500/10',
                state === 'dim' && 'border-soft opacity-60',
                disabled && 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold transition-colors',
                  state === 'idle' && 'surface-2 text-muted group-hover:bg-brand-500/15 group-hover:text-brand-600',
                  state === 'selected' && 'bg-brand-500 text-white',
                  state === 'correct' && 'bg-emerald-500 text-white',
                  state === 'wrong' && 'bg-rose-500 text-white',
                  state === 'dim' && 'surface-2 text-muted',
                )}
              >
                {state === 'correct' ? <Check className="size-4" /> : state === 'wrong' ? <X className="size-4" /> : LETTERS[pos]}
              </span>
              <span className="pt-0.5">{q.options[orig]}</span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {showAnswer && <QuestionAnalysis q={q} selected={selected} order={order} />}
      </AnimatePresence>

      <AnimatePresence>
        {noteOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <textarea
              defaultValue={note}
              onBlur={(e) => setNote(q.id, e.target.value)}
              placeholder="Escribe una nota personal para esta pregunta (se guarda al salir del campo)…"
              className="mt-4 h-24 w-full resize-none rounded-xl border border-soft surface-2 p-3 text-sm outline-none focus:border-brand-500"
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
