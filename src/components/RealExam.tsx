import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock, LayoutGrid, Send } from 'lucide-react'
import type { ExamConfig } from '@/pages/Exam'
import { useProgress } from '@/store/progress'
import { useCountdown } from '@/hooks/useCountdown'
import { useHotkeys } from '@/hooks/useHotkeys'
import { gradeExam } from '@/lib/examResult'
import { celebrate, playSound } from '@/lib/fx'
import { Button } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { cn, formatClock, LETTERS } from '@/lib/utils'

/** Pide pantalla completa (debe llamarse desde un clic). Si el navegador no lo permite, sigue sin ella. */
export function enterFullscreen() {
  try {
    void document.documentElement.requestFullscreen?.().catch(() => {})
  } catch {
    /* sin pantalla completa */
  }
}

function leaveFullscreen() {
  try {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
  } catch {
    /* ya estaba fuera */
  }
}

/**
 * Examen en condiciones reales: ocupa toda la pantalla, el cronómetro es el único reloj, las respuestas
 * se marcan en una hoja de burbujas y no hay marcadores, notas ni retroalimentación hasta entregar.
 * Las opciones se muestran en su orden original, como en el papel.
 */
export function RealExam({ config, onExit }: { config: ExamConfig; onExit: () => void }) {
  const { questions } = config
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const saveExam = useProgress((s) => s.saveExam)
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [confirm, setConfirm] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [startedAt] = useState(Date.now())
  const totalSec = config.minutes * 60
  const q = questions[index]
  const answered = useMemo(() => answers.filter((a) => a !== null).length, [answers])

  const submit = () => {
    questions.forEach((qq, i) => {
      if (answers[i] !== null) recordAnswer(qq, answers[i]!)
    })
    const result = gradeExam({ title: config.title, questions, answers, startedAt, totalSec })
    saveExam(result)
    leaveFullscreen()
    if (result.correct / questions.length >= 0.6) {
      celebrate('big')
      playSound('win')
    }
    navigate(`/simulacro/${result.id}`)
  }

  const [left] = useCountdown(totalSec, true, submit)
  const lowTime = left < 300

  // Al salir (entregar o abandonar) se deja la pantalla completa; mientras corre, avisa antes de cerrar la pestaña.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => {
      window.removeEventListener('beforeunload', warn)
      leaveFullscreen()
    }
  }, [])

  // La hoja sigue a la pregunta actual cuando se navega con las flechas o los botones.
  useEffect(() => {
    document.querySelectorAll('ol[aria-label="Hoja de respuestas"] [aria-current="true"]').forEach((el) => el.scrollIntoView({ block: 'nearest' }))
  }, [index, sheetOpen])

  const mark = (i: number, opt: number) => setAnswers((cur) => cur.map((a, j) => (j === i ? (a === opt ? null : opt) : a)))

  useHotkeys((e) => {
    const li = LETTERS.indexOf(e.key.toUpperCase())
    if (li >= 0 && li < q.options.length) mark(index, li)
    else if (e.key === 'ArrowRight') setIndex((i) => Math.min(questions.length - 1, i + 1))
    else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
  }, !confirm && !sheetOpen)

  // Hoja compacta: las filas se acomodan en tantas columnas como quepan, así se ven muchas preguntas a la vez
  // y no queda un hueco vacío a la derecha. Con 4 opciones las burbujas miden 24 px; con 5, 20 px.
  const Sheet = (
    <ol className="grid gap-x-3 gap-y-0 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]" aria-label="Hoja de respuestas">
      {questions.map((qq, i) => {
        const small = qq.options.length > 4
        return (
          <li key={qq.id} aria-current={i === index ? 'true' : undefined} className={cn('flex items-center justify-between gap-1.5 rounded-lg px-1.5 py-[3px]', i === index && 'bg-brand-500/10 ring-1 ring-brand-500/30')}>
            <button
              type="button"
              onClick={() => {
                setIndex(i)
                setSheetOpen(false)
              }}
              className="relative w-6 text-right text-[11px] font-bold tabular-nums text-muted after:absolute after:-inset-y-2 after:-inset-x-1"
              aria-label={`Ir a la pregunta ${i + 1}`}
            >
              {i + 1}
            </button>
            <div className="flex w-[117px] shrink-0 justify-start gap-[3px]" role="group" aria-label={`Pregunta ${i + 1}`}>
              {qq.options.map((_, o) => {
                const on = answers[i] === o
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => {
                      setIndex(i)
                      mark(i, o)
                    }}
                    aria-pressed={on}
                    aria-label={`Pregunta ${i + 1}, opción ${LETTERS[o]}`}
                    className={cn(
                      'relative grid place-items-center rounded-full border-[1.5px] text-[10px] font-bold transition-colors after:absolute after:-inset-[3px]',
                      small ? 'size-5' : 'size-6',
                      on ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900' : 'border-slate-400 text-slate-600 hover:border-brand-500 dark:border-slate-500 dark:text-slate-300',
                    )}
                  >
                    {LETTERS[o]}
                  </button>
                )
              })}
            </div>
          </li>
        )
      })}
    </ol>
  )

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[var(--surface)] text-[var(--text)]" role="region" aria-label="Examen en modo real">
      <header className="flex items-center gap-3 border-b border-soft px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold tracking-wider text-muted uppercase">Modo examen real</div>
          <div className="truncate font-display font-bold">{config.title}</div>
        </div>
        <div className={cn('flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-lg font-bold tabular-nums sm:text-xl', lowTime ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : 'surface-2')} role="timer" aria-label={`Tiempo restante ${formatClock(left)}`}>
          <Clock className="size-5" aria-hidden /> {formatClock(left)}
        </div>
        <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setSheetOpen(true)} aria-label="Abrir hoja de respuestas">
          <LayoutGrid className="size-4" />
        </Button>
        <Button variant="success" onClick={() => setConfirm(true)} aria-label="Entregar examen">
          <Send className="size-4" /> <span className="hidden sm:inline">Entregar</span>
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_540px]">
        <div className="min-h-0 overflow-y-auto px-4 py-6 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="text-sm font-semibold text-muted tabular-nums">
              Pregunta {index + 1} de {questions.length}
            </div>
            <p className="mt-3 text-lg leading-relaxed font-medium whitespace-pre-line">{q.stem}</p>
            {q.image && <img src={q.image} alt="Imagen de la pregunta" className="mt-4 max-h-80 rounded-xl border border-soft object-contain" />}
            <div className="mt-6 flex flex-col gap-2.5" role="radiogroup" aria-label="Opciones">
              {q.options.map((text, o) => {
                const on = answers[index] === o
                return (
                  <button key={o} type="button" role="radio" aria-checked={on} onClick={() => mark(index, o)} className={cn('flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left text-[15px] transition-colors', on ? 'border-slate-900 bg-slate-900/[0.04] dark:border-white dark:bg-white/[0.06]' : 'border-soft hover:border-slate-400')}>
                    <span className={cn('mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold', on ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900' : 'border-slate-400 text-slate-600 dark:border-slate-500 dark:text-slate-300')}>{LETTERS[o]}</span>
                    <span>{text}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-8 flex items-center justify-between gap-2">
              <Button variant="outline" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
                <ArrowLeft className="size-4" /> Anterior
              </Button>
              <Button onClick={() => setIndex(Math.min(questions.length - 1, index + 1))} disabled={index + 1 >= questions.length}>
                Siguiente <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <aside className="hidden min-h-0 flex-col border-l border-soft lg:flex" aria-label="Hoja de respuestas">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <h2 className="font-semibold">Hoja de respuestas</h2>
            <span className="rounded-full surface-2 px-2.5 py-0.5 text-xs font-semibold tabular-nums">
              {answered} de {questions.length} respondidas
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{Sheet}</div>
          <div className="border-t border-soft p-4">
            <Button variant="ghost" size="sm" className="w-full text-muted" onClick={onExit}>
              Abandonar sin guardar
            </Button>
          </div>
        </aside>
      </div>

      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} title={`Hoja de respuestas · ${answered}/${questions.length}`}>
        <div className="max-h-[62vh] overflow-y-auto pr-1">{Sheet}</div>
        <Button variant="ghost" size="sm" className="mt-3 w-full text-muted" onClick={onExit}>
          Abandonar sin guardar
        </Button>
      </Modal>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="¿Entregar el examen?">
        <p className="text-sm text-muted">
          Respondiste <b className="text-[var(--text)]">{answered}</b> de {questions.length} preguntas.
          {answered < questions.length && ` Quedan ${questions.length - answered} en blanco.`} Al entregar verás tu nota y la explicación de cada una.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirm(false)}>
            Seguir respondiendo
          </Button>
          <Button variant="success" onClick={submit}>
            Entregar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
