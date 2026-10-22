import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Brain, Check, Eye, Layers, Play, RotateCcw, Sparkles, Trophy, X } from 'lucide-react'
import type { Guide } from '@/types'
import { guideNotes, guideQuestions, type GuideQuestion } from '@/lib/guidePractice'
import { Button, Card, ProgressBar } from '@/components/ui/primitives'
import { useAnki } from '@/store/anki'
import { useProgress } from '@/store/progress'
import { getSpecialty } from '@/data/specialties'
import { celebrate, playSound } from '@/lib/fx'
import { toast } from '@/store/toasts'
import { cn } from '@/lib/utils'

/** Crea (una sola vez) las flashcards de la guía en el mazo «Guías::<título>». */
function useGuideFlashcards(guide: Guide) {
  const notes = useAnki((s) => s.notes)
  const added = notes.filter((n) => n.id.startsWith(`guia-${guide.id}-`)).length
  const create = () => {
    const anki = useAnki.getState()
    const deckId = anki.addDeck(`Guías::${guide.title}`)
    const existing = new Set(anki.notes.map((n) => n.id))
    const fresh = guideNotes(guide, deckId, guide.specialty).filter((n) => !existing.has(n.id))
    if (fresh.length) anki.importNotes(fresh)
    toast({ kind: 'success', title: `${fresh.length} flashcards creadas`, body: `Mazo «Guías::${guide.title}». Se repasan con repetición espaciada.` })
    return deckId
  }
  return { added, create }
}

function Quiz({ questions, onFinish }: { questions: GuideQuestion[]; onFinish: (correct: number) => void }) {
  const [i, setI] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(0)
  const q = questions[i]

  const next = (ok: boolean) => {
    const total = correct + (ok ? 1 : 0)
    if (i + 1 >= questions.length) return onFinish(total)
    setCorrect(total)
    setI(i + 1)
    setSelected(null)
    setRevealed(false)
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3 text-xs font-semibold text-muted">
        <span className="tabular-nums">
          {i + 1}/{questions.length}
        </span>
        <ProgressBar value={(i + (revealed ? 1 : 0)) / questions.length} height="h-2" className="flex-1" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
          <div className="text-xs font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-400">{q.context}</div>
          <p className="mt-1 font-semibold">{q.prompt}</p>

          {q.kind === 'choice' ? (
            <div className="mt-4 grid gap-2">
              {q.options.map((o, k) => {
                const isAnswer = revealed && k === q.answer
                const isWrong = revealed && k === selected && k !== q.answer
                return (
                  <button
                    key={o}
                    disabled={revealed}
                    onClick={() => {
                      setSelected(k)
                      setRevealed(true)
                      playSound(k === q.answer ? 'correct' : 'wrong')
                    }}
                    className={cn('flex items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left text-sm transition-colors', isAnswer ? 'border-emerald-500 bg-emerald-500/10' : isWrong ? 'border-rose-500 bg-rose-500/10' : 'border-soft hover:border-brand-500/40')}
                  >
                    <span className={cn('mt-px grid size-5 shrink-0 place-items-center rounded-md text-[10px] font-bold', isAnswer ? 'bg-emerald-600 text-white' : isWrong ? 'bg-rose-600 text-white' : 'surface-2 text-muted')}>{isAnswer ? <Check className="size-3" /> : isWrong ? <X className="size-3" /> : 'ABCD'[k]}</span>
                    <span className="leading-snug">{o}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-4">
              {revealed ? (
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] p-4 text-sm leading-relaxed">
                  {q.answer}
                </motion.p>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setRevealed(true)}>
                  <Eye className="size-4" /> Piensa la respuesta y muéstrala
                </Button>
              )}
            </div>
          )}

          {revealed && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              {q.kind === 'choice' ? (
                <Button onClick={() => next(selected === q.answer)}>{i + 1 >= questions.length ? 'Ver resultado' : 'Siguiente'}</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => next(false)}>
                    No la recordaba
                  </Button>
                  <Button variant="success" onClick={() => next(true)}>
                    <Check className="size-4" /> La recordaba
                  </Button>
                </>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/** «¿Ya la leíste? Practícala»: quiz de la guía, flashcards y preguntas del banco de su especialidad. */
export function GuidePractice({ guide }: { guide: Guide }) {
  const [round, setRound] = useState(0)
  const [state, setState] = useState<'intro' | 'quiz' | 'done'>('intro')
  const [score, setScore] = useState(0)
  const questions = useMemo(() => guideQuestions(guide), [guide, round]) // eslint-disable-line react-hooks/exhaustive-deps
  const markRead = useProgress((s) => s.markGuideRead)
  const read = useProgress((s) => s.guidesRead.includes(guide.id))
  const { added, create } = useGuideFlashcards(guide)
  const sp = getSpecialty(guide.specialty)
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0

  return (
    <Card id="practicar" className="mt-6 scroll-mt-24 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-soft bg-brand-500/[0.06] px-5 py-4 sm:px-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white">
          <Brain className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold">¿Ya la leíste? Practícala</h3>
          <p className="text-sm text-muted">Responder sin mirar fija mucho más que releer.</p>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        {state === 'intro' && (
          <div className="grid gap-3 sm:grid-cols-3">
            <button onClick={() => setState('quiz')} className="group flex flex-col items-start gap-2 rounded-2xl border-2 border-brand-500/40 bg-brand-500/[0.05] p-4 text-left transition-colors hover:border-brand-500">
              <Play className="size-5 text-brand-700 dark:text-brand-400" />
              <span className="font-semibold">Repaso de esta guía</span>
              <span className="text-xs text-muted">{questions.length} preguntas sobre lo que acabas de leer · 3 min</span>
            </button>
            <button
              onClick={() => (added ? undefined : create())}
              disabled={added > 0}
              className="flex flex-col items-start gap-2 rounded-2xl border-2 border-soft p-4 text-left transition-colors hover:border-violet-500/50 disabled:cursor-default"
            >
              <Layers className="size-5 text-violet-600 dark:text-violet-400" />
              <span className="font-semibold">{added ? 'Flashcards creadas' : 'Crear sus flashcards'}</span>
              <span className="text-xs text-muted">{added ? `${added} tarjetas en tu colección. ` : 'Tablas, perlas y alertas en tarjetas con repetición espaciada.'}</span>
              {added > 0 && (
                <Link to="/flashcards" className="text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300">
                  Ir a Flashcards →
                </Link>
              )}
            </button>
            <Link to={`/practica?specialty=${guide.specialty}&auto=1`} className="flex flex-col items-start gap-2 rounded-2xl border-2 border-soft p-4 transition-colors hover:border-sky-500/50">
              <Sparkles className="size-5 text-sky-700 dark:text-sky-300" />
              <span className="font-semibold">Preguntas tipo ENURM</span>
              <span className="text-xs text-muted">Del banco de {sp.name}, con el porqué de cada opción.</span>
            </Link>
          </div>
        )}

        {state === 'quiz' && (
          <Quiz
            key={round}
            questions={questions}
            onFinish={(c) => {
              setScore(c)
              setState('done')
              const good = c / questions.length >= 0.7
              if (good) {
                celebrate('small')
                if (!read) markRead(guide.id)
              }
            }}
          />
        )}

        {state === 'done' && (
          <div className="text-center">
            <Trophy className={cn('mx-auto size-10', pct >= 70 ? 'text-amber-500' : 'text-muted')} />
            <div className="mt-2 font-display text-3xl font-extrabold">{pct}%</div>
            <p className="mt-1 text-sm text-muted">
              {score} de {questions.length}. {pct >= 70 ? (read ? '¡Bien! La tienes fresca.' : '¡Bien! Marcamos la guía como leída.') : 'Vuelve a mirar las tablas y repite: a la segunda se queda.'}
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => (setRound(round + 1), setState('quiz'))}>
                <RotateCcw className="size-4" /> Repetir con otras preguntas
              </Button>
              {!added && (
                <Button onClick={create}>
                  <Layers className="size-4" /> Crear sus flashcards
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
