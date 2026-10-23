import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Timer, Trophy, X, Zap } from 'lucide-react'
import { KIND_LABEL } from '@/data/lingo'
import { blitzPool, blitzQuestion, type LingoExercise } from '@/lib/lingo'
import { useLingo } from '@/store/lingo'
import { useProgress } from '@/store/progress'
import { celebrate, playLesson } from '@/lib/fx'
import { cn } from '@/lib/utils'

const SECONDS = 60

/** Enunciado corto de cada pregunta del reto. */
function Prompt({ ex }: { ex: LingoExercise }) {
  switch (ex.kind) {
    case 'meaning':
      return (
        <>
          <div className="text-xs font-semibold text-muted uppercase">¿Qué significa? · {KIND_LABEL[ex.item.kind]}</div>
          <div className="mt-1 font-display text-3xl font-extrabold break-words">{ex.item.term}</div>
        </>
      )
    case 'term':
      return (
        <>
          <div className="text-xs font-semibold text-muted uppercase">¿Cuál es {ex.item.kind === 'sigla' ? 'la sigla' : 'el término'}?</div>
          <div className="mt-1 text-xl font-semibold">«{ex.item.meaning}»</div>
        </>
      )
    case 'truefalse':
      return (
        <>
          <div className="text-xs font-semibold text-muted uppercase">¿Verdadero o falso?</div>
          <div className="mt-1 text-xl">
            <b className="font-display">{ex.item.term}</b> significa «{ex.statement}»
          </div>
        </>
      )
    case 'context':
      return (
        <>
          <div className="text-xs font-semibold text-muted uppercase">Completa el caso</div>
          <div className="mt-1 text-lg font-medium">{ex.item.context!.replace('___', '_____')}</div>
        </>
      )
    default:
      return null
  }
}

export default function LingoBlitz() {
  const navigate = useNavigate()
  const lessons = useLingo((s) => s.lessons)
  const answerWord = useLingo((s) => s.answer)
  const finishBlitz = useLingo((s) => s.finishBlitz)
  const addXp = useProgress((s) => s.addXp)
  const pool = useMemo(() => blitzPool(lessons), [lessons])

  const [round, setRound] = useState(0)
  const [q, setQ] = useState(() => blitzQuestion(pool))
  const [left, setLeft] = useState(SECONDS)
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [result, setResult] = useState<{ xp: number; record: boolean } | null>(null)
  const scoreRef = useRef(0)
  const lock = useRef(false)

  // Cuenta regresiva; al llegar a cero se guarda el resultado.
  useEffect(() => {
    if (result) return
    if (left <= 0) {
      const prevBest = useLingo.getState().blitzBest
      const xp = finishBlitz(scoreRef.current)
      addXp(xp)
      setResult({ xp, record: scoreRef.current > prevBest && scoreRef.current > 0 })
      playLesson('complete')
      if (scoreRef.current > prevBest && scoreRef.current > 0) celebrate('big')
      return
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [left, result, finishBlitz, addXp])

  const choose = (i: number) => {
    if (lock.current || result || !('options' in q)) return
    lock.current = true
    setPicked(i)
    const ok = i === q.answer
    answerWord(q.item.id, ok)
    playLesson(ok ? 'correct' : 'wrong')
    if (ok) {
      scoreRef.current += 1
      setScore(scoreRef.current)
    } else setWrong((w) => w + 1)
    setTimeout(
      () => {
        setQ(blitzQuestion(pool))
        setPicked(null)
        lock.current = false
      },
      ok ? 350 : 900,
    )
  }

  // Teclado: 1–4 para responder.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key)
      if ('options' in q && n >= 1 && n <= q.options.length) choose(n - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const again = () => {
    scoreRef.current = 0
    lock.current = false
    setScore(0)
    setWrong(0)
    setLeft(SECONDS)
    setPicked(null)
    setResult(null)
    setQ(blitzQuestion(pool))
    setRound((r) => r + 1)
  }

  if (result) {
    const best = useLingo.getState().blitzBest
    const total = score + wrong
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="grid size-24 place-items-center rounded-[2rem] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lift">
          {result.record ? <Trophy className="size-12" /> : <Timer className="size-12" />}
        </motion.div>
        <h1 className="mt-6 font-display text-3xl font-extrabold">{result.record ? '¡Nuevo récord!' : '¡Se acabó el tiempo!'}</h1>
        <p className="mt-2 max-w-sm text-muted">
          {score} {score === 1 ? 'respuesta correcta' : 'respuestas correctas'} de {total} en {SECONDS} segundos.
        </p>
        <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-amber-400/60 p-3">
            <div className="text-xs font-bold tracking-wide text-amber-700 uppercase dark:text-amber-300">XP ganado</div>
            <div className="mt-1 flex items-center justify-center gap-1.5 font-display text-2xl font-extrabold">
              <Zap className="size-5 fill-amber-400 text-amber-500" /> {result.xp}
            </div>
          </div>
          <div className="rounded-2xl border-2 border-emerald-500/50 p-3">
            <div className="text-xs font-bold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">Tu récord</div>
            <div className="mt-1 flex items-center justify-center gap-1.5 font-display text-2xl font-extrabold">
              <Trophy className="size-5 text-emerald-600" /> {best}
            </div>
          </div>
        </div>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <button onClick={again} className="rounded-2xl border-b-4 border-black/20 bg-amber-500 py-3.5 font-bold tracking-wide text-white uppercase">
            Jugar otra vez
          </button>
          <button onClick={() => navigate('/terminologia')} className="rounded-2xl border-2 border-soft py-3.5 font-bold tracking-wide uppercase">
            Salir
          </button>
        </div>
      </div>
    )
  }

  if (!('options' in q)) return null

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 bg-[var(--bg)]/95 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button onClick={() => navigate('/terminologia')} className="grid size-10 shrink-0 place-items-center rounded-xl text-muted hover:text-[var(--text)]" aria-label="Salir del reto">
            <X className="size-6" />
          </button>
          <div className="h-4 flex-1 overflow-hidden rounded-full surface-2" role="timer" aria-label={`${left} segundos`}>
            <motion.div key={round} className={cn('h-full rounded-full', left <= 10 ? 'bg-rose-500' : 'bg-amber-500')} initial={{ width: '100%' }} animate={{ width: `${(left / SECONDS) * 100}%` }} transition={{ duration: 1, ease: 'linear' }} />
          </div>
          <div className="flex w-14 items-center justify-end gap-1 font-bold tabular-nums" aria-label={`${score} correctas`}>
            <Check className="size-5 text-emerald-600" />
            {score}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-2 pb-12">
        <div className={cn('mb-4 text-center font-display text-4xl font-extrabold tabular-nums', left <= 10 && 'text-rose-600 dark:text-rose-400')}>{left}</div>
        <AnimatePresence mode="wait">
          <motion.div key={`${q.item.id}-${q.kind}-${score + wrong}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.15 }}>
            <div className="mb-6 rounded-2xl border-2 border-soft bg-[var(--surface)] p-4">
              <Prompt ex={q} />
            </div>
            <div className={cn('grid gap-2.5', q.options.length === 2 && 'grid-cols-2')}>
              {q.options.map((o, i) => {
                const revealed = picked !== null
                const isAnswer = revealed && i === q.answer
                const isWrong = revealed && i === picked && i !== q.answer
                return (
                  <button
                    key={o}
                    onClick={() => choose(i)}
                    className={cn(
                      'flex min-h-14 items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-medium transition-colors',
                      isAnswer ? 'border-emerald-500 bg-emerald-500/10' : isWrong ? 'border-rose-500 bg-rose-500/10' : 'border-soft bg-[var(--surface)] hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]',
                    )}
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-soft text-xs font-bold text-muted">{i + 1}</span>
                    <span className="leading-snug">{o}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
