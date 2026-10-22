import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Crown, Heart, HeartCrack, Sparkles, Star, Target, Volume2, X, Zap } from 'lucide-react'
import { KIND_LABEL, LINGO_BY_ID, lessonById, type LingoItem } from '@/data/lingo'
import { buildLesson, canSpeak, correctAnswerText, dueItems, isBuildCorrect, reviewSession, speak, type LingoExercise } from '@/lib/lingo'
import { starsFor, useLingo } from '@/store/lingo'
import { useProgress } from '@/store/progress'
import { celebrate, playLesson } from '@/lib/fx'
import { cn } from '@/lib/utils'
import { toast } from '@/store/toasts'

const HEARTS = 5

function SpeakButton({ text, className }: { text: string; className?: string }) {
  if (!canSpeak) return null
  return (
    <button type="button" onClick={() => speak(text, useLingo.getState().voiceURI)} className={cn('grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-700 transition-transform active:scale-90 dark:text-sky-300', className)} aria-label={`Escuchar «${text}»`}>
      <Volume2 className="size-5" />
    </button>
  )
}

/** Desglose «hepato = hígado · megalia = agrandamiento» o el ejemplo de un prefijo/sufijo. */
function Breakdown({ item }: { item: LingoItem }) {
  if (item.parts?.length)
    return (
      <div className="flex flex-wrap gap-1.5">
        {item.parts.map((p, i) => (
          <span key={i} className="rounded-lg bg-[var(--surface)] px-2 py-1 text-xs">
            <b>{p.text}</b> = {p.meaning}
          </span>
        ))}
      </div>
    )
  if (item.example)
    return (
      <p className="text-sm">
        Ejemplo: <b>{item.example}</b>
      </p>
    )
  return null
}

function OptionList({ options, selected, onSelect, disabled, answer, revealed }: { options: string[]; selected: number | null; onSelect: (i: number) => void; disabled: boolean; answer: number; revealed: boolean }) {
  return (
    <div className="grid gap-2.5">
      {options.map((o, i) => {
        const isAnswer = revealed && i === answer
        const isWrong = revealed && i === selected && i !== answer
        return (
          <motion.button
            key={o}
            whileTap={{ scale: 0.98 }}
            disabled={disabled}
            onClick={() => (playLesson('tap'), onSelect(i))}
            className={cn(
              'flex min-h-14 items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-medium transition-colors',
              isAnswer ? 'border-emerald-500 bg-emerald-500/10' : isWrong ? 'border-rose-500 bg-rose-500/10' : selected === i ? 'border-sky-500 bg-sky-500/10' : 'border-soft bg-[var(--surface)] hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]',
            )}
          >
            <span className={cn('grid size-7 shrink-0 place-items-center rounded-lg border text-xs font-bold', selected === i ? 'border-sky-500 text-sky-700 dark:text-sky-300' : 'border-soft text-muted')}>{i + 1}</span>
            <span className="leading-snug">{o}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

/* ---------- Emparejar ---------- */

function MatchBoard({ items, onMistake, onPair, onDone }: { items: LingoItem[]; onMistake: (item: LingoItem) => void; onPair: (item: LingoItem) => void; onDone: () => void }) {
  const left = useMemo(() => items, [items])
  const right = useMemo(() => [...items].sort(() => Math.random() - 0.5), [items])
  const [pickL, setPickL] = useState<string | null>(null)
  const [pickR, setPickR] = useState<string | null>(null)
  const [done, setDone] = useState<string[]>([])
  const [bad, setBad] = useState<string[]>([])

  useEffect(() => {
    if (!pickL || !pickR) return
    if (pickL === pickR) {
      playLesson('correct')
      const next = [...done, pickL]
      setDone(next)
      onPair(LINGO_BY_ID.get(pickL)!)
      if (next.length === items.length) setTimeout(onDone, 350)
    } else {
      playLesson('wrong')
      onMistake(LINGO_BY_ID.get(pickL)!)
      setBad([pickL, `r:${pickR}`])
      setTimeout(() => setBad([]), 500)
    }
    setPickL(null)
    setPickR(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickL, pickR])

  const tile = (active: boolean, matched: boolean, wrong: boolean) =>
    cn(
      'min-h-16 rounded-2xl border-2 border-b-4 px-3 py-2 text-sm font-medium leading-snug transition-colors disabled:cursor-default',
      matched ? 'border-transparent bg-emerald-500/10 text-emerald-800 opacity-60 dark:text-emerald-300' : wrong ? 'border-rose-500 bg-rose-500/10' : active ? 'border-sky-500 bg-sky-500/10' : 'border-soft bg-[var(--surface)]',
    )

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="grid gap-2.5">
        {left.map((i) => (
          <motion.button key={i.id} animate={bad.includes(i.id) ? { x: [0, -6, 6, 0] } : {}} disabled={done.includes(i.id)} onClick={() => setPickL(i.id)} className={tile(pickL === i.id, done.includes(i.id), bad.includes(i.id))}>
            <span className="font-display font-bold">{i.term}</span>
          </motion.button>
        ))}
      </div>
      <div className="grid gap-2.5">
        {right.map((i) => (
          <motion.button key={i.id} animate={bad.includes(`r:${i.id}`) ? { x: [0, -6, 6, 0] } : {}} disabled={done.includes(i.id)} onClick={() => setPickR(i.id)} className={tile(pickR === i.id, done.includes(i.id), bad.includes(`r:${i.id}`))}>
            {i.meaning}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/* ---------- Pantalla de lección ---------- */

type Phase = 'answer' | 'feedback' | 'done' | 'failed'

export default function LingoLesson() {
  const { lessonId = '' } = useParams()
  const navigate = useNavigate()
  const review = lessonId === 'repaso'
  const lesson = review ? null : lessonById(lessonId)
  const answerWord = useLingo((s) => s.answer)
  const finishLesson = useLingo((s) => s.finishLesson)
  const addXp = useProgress((s) => s.addXp)

  const makeQueue = useCallback(() => {
    if (review) return reviewSession(dueItems(useLingo.getState().words, 8))
    return lesson ? buildLesson(lesson.items.map((id) => LINGO_BY_ID.get(id)!).filter(Boolean)) : []
  }, [review, lesson])

  // Si la lección quedó a medias (en la última semana), se continúa donde se dejó.
  const [saved] = useState(() => {
    const a = useLingo.getState().active
    return a && a.lessonId === (review ? 'repaso' : lessonId) && a.idx < a.queue.length && Date.now() - a.savedAt < 7 * 86_400_000 ? a : null
  })
  const [queue, setQueue] = useState<LingoExercise[]>(() => saved?.queue ?? makeQueue())
  const [idx, setIdx] = useState(saved?.idx ?? 0)
  const [hearts, setHearts] = useState(saved?.hearts ?? HEARTS)
  const [mistakes, setMistakes] = useState(saved?.mistakes ?? 0)
  const [phase, setPhase] = useState<Phase>('answer')
  const [selected, setSelected] = useState<number | null>(null)
  const [chosen, setChosen] = useState<number[]>([])
  const [lastCorrect, setLastCorrect] = useState(true)
  const [requeued, setRequeued] = useState<Set<number>>(() => new Set(saved?.requeued ?? []))
  const [xpEarned, setXpEarned] = useState(0)
  const [answered, setAnswered] = useState(saved?.answered ?? 0)
  const [confirmExit, setConfirmExit] = useState(false)
  const saveActive = useLingo((s) => s.saveActive)
  const voiceURI = useLingo((s) => s.voiceURI)

  useEffect(() => {
    if (saved) toast({ kind: 'info', title: 'Continuamos donde lo dejaste' })
  }, [saved])

  // Guarda el avance tras cada paso: si sales, la lección te espera.
  useEffect(() => {
    if (phase === 'done' || phase === 'failed' || !queue.length) return
    const at = phase === 'feedback' ? idx + 1 : idx
    if (at >= queue.length) return
    saveActive({ lessonId: review ? 'repaso' : lessonId, queue, idx: at, hearts, mistakes, answered, requeued: [...requeued], savedAt: Date.now() })
  }, [phase, idx, queue, hearts, mistakes, answered, requeued, review, lessonId, saveActive])

  const ex = queue[idx] as LingoExercise | undefined
  const progress = queue.length ? Math.min(1, (idx + (phase === 'feedback' ? 1 : 0)) / queue.length) : 0

  const restart = () => {
    saveActive(null)
    setQueue(makeQueue())
    setIdx(0)
    setHearts(HEARTS)
    setMistakes(0)
    setPhase('answer')
    setSelected(null)
    setChosen([])
    setRequeued(new Set())
    setAnswered(0)
  }

  const loseHeart = () => {
    setMistakes((m) => m + 1)
    setHearts((h) => h - 1)
  }

  const canCheck = ex && (ex.kind === 'build' ? chosen.length > 0 : ex.kind === 'match' ? false : selected !== null)

  const check = () => {
    if (!ex || !canCheck || phase !== 'answer') return
    const ok = ex.kind === 'build' ? isBuildCorrect(ex.item, chosen.map((c) => ex.tiles[c])) : ex.kind !== 'match' && selected === ex.answer
    if (ex.kind !== 'match') answerWord(ex.item.id, ok)
    setAnswered((a) => a + 1)
    setLastCorrect(ok)
    playLesson(ok ? 'correct' : 'wrong')
    if (!ok) {
      // Una palabra que se presenta por primera vez no cuesta vidas: se aprende con el error.
      if (!(ex.kind === 'meaning' && ex.intro)) loseHeart()
      // Como en Duolingo: el ejercicio fallado vuelve al final una vez.
      if (!requeued.has(idx)) {
        setQueue((q) => [...q, ex])
        setRequeued((r) => new Set(r).add(idx))
      }
    }
    setPhase('feedback')
  }

  const next = () => {
    if (hearts <= 0) {
      playLesson('fail')
      saveActive(null)
      setPhase('failed')
      return
    }
    if (idx + 1 >= queue.length) {
      const xp = finishLesson(review ? 'repaso' : lessonId, mistakes, review)
      addXp(xp)
      setXpEarned(xp)
      playLesson('complete')
      celebrate(mistakes === 0 ? 'big' : 'small')
      setPhase('done')
      return
    }
    setIdx(idx + 1)
    setSelected(null)
    setChosen([])
    setPhase('answer')
  }

  // Teclado: 1–4 para elegir, Enter para comprobar o continuar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'Enter') {
        e.preventDefault()
        if (phase === 'answer') check()
        else if (phase === 'feedback') next()
      } else if (phase === 'answer' && ex && (ex.kind === 'meaning' || ex.kind === 'term' || ex.kind === 'part')) {
        const n = Number(e.key)
        if (n >= 1 && n <= ex.options.length) setSelected(n - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Pronuncia los términos nuevos al presentarlos.
  useEffect(() => {
    if (phase === 'answer' && ex?.kind === 'meaning' && ex.intro && useProgress.getState().settings.sound) speak(ex.item.term, voiceURI)
  }, [ex, phase, voiceURI])

  if (!review && !lesson)
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="font-semibold">Lección no encontrada.</p>
          <button onClick={() => navigate('/terminologia')} className="mt-3 font-semibold text-brand-700 dark:text-brand-400">
            Volver a Terminología
          </button>
        </div>
      </div>
    )

  if (review && queue.length === 0)
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div className="max-w-sm">
          <Check className="mx-auto size-10 text-emerald-600" />
          <p className="mt-3 font-display text-xl font-bold">No tienes palabras pendientes</p>
          <p className="mt-1 text-muted">Completa lecciones nuevas y aquí aparecerán los términos que toca repasar.</p>
          <button onClick={() => navigate('/terminologia')} className="mt-5 h-12 rounded-2xl bg-brand-gradient px-6 font-semibold text-white">
            Volver
          </button>
        </div>
      </div>
    )

  /* ---------- Final ---------- */
  if (phase === 'done' || phase === 'failed') {
    const done = phase === 'done'
    const stars = starsFor(mistakes)
    const accuracy = answered ? Math.round(((answered - mistakes) / answered) * 100) : 100
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className={cn('grid size-24 place-items-center rounded-[2rem] text-white shadow-lift', done ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-rose-400 to-rose-600')}>
          {done ? <Crown className="size-12" /> : <HeartCrack className="size-12" />}
        </motion.div>
        <h1 className="mt-6 font-display text-3xl font-extrabold">{done ? (review ? '¡Repaso completado!' : '¡Lección completada!') : 'Te quedaste sin vidas'}</h1>
        <p className="mt-2 max-w-sm text-muted">{done ? (mistakes === 0 ? 'Perfecta, sin un solo error.' : 'Cada error que corriges se te queda para siempre.') : 'No pasa nada: repite la lección y verás que esta vez sale.'}</p>
        {done && !review && (
          <div className="mt-5 flex gap-2">
            {[1, 2, 3].map((s) => (
              <motion.span key={s} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.25 + s * 0.15, type: 'spring' }}>
                <Star className={cn('size-10', s <= stars ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600')} />
              </motion.span>
            ))}
          </div>
        )}
        {done && (
          <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
            <div className="rounded-2xl border-2 border-amber-400/60 p-3">
              <div className="text-xs font-bold tracking-wide text-amber-700 uppercase dark:text-amber-300">XP ganado</div>
              <div className="mt-1 flex items-center justify-center gap-1.5 font-display text-2xl font-extrabold">
                <Zap className="size-5 fill-amber-400 text-amber-500" /> {xpEarned}
              </div>
            </div>
            <div className="rounded-2xl border-2 border-emerald-500/50 p-3">
              <div className="text-xs font-bold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">Precisión</div>
              <div className="mt-1 flex items-center justify-center gap-1.5 font-display text-2xl font-extrabold">
                <Target className="size-5 text-emerald-600" /> {accuracy}%
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          {!done && (
            <button onClick={restart} className="h-13 rounded-2xl border-b-4 border-black/20 bg-brand-gradient py-3.5 font-bold tracking-wide text-white uppercase">
              Intentar de nuevo
            </button>
          )}
          <button onClick={() => navigate('/terminologia')} className={cn('rounded-2xl py-3.5 font-bold tracking-wide uppercase', done ? 'border-b-4 border-black/20 bg-brand-gradient text-white' : 'border-2 border-soft')}>
            {done ? 'Continuar' : 'Salir'}
          </button>
        </div>
      </div>
    )
  }

  if (!ex) return null

  /* ---------- Ejercicio ---------- */
  const title =
    ex.kind === 'meaning' ? '¿Qué significa?' : ex.kind === 'term' ? '¿Cuál es el término?' : ex.kind === 'part' ? '¿Qué significa esta parte?' : ex.kind === 'build' ? 'Construye el término' : 'Une cada término con su significado'
  const feedbackItem = ex.kind === 'match' ? null : ex.item

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 bg-[var(--bg)]/95 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button onClick={() => (idx > 0 || phase === 'feedback' ? setConfirmExit(true) : navigate('/terminologia'))} className="grid size-10 shrink-0 place-items-center rounded-xl text-muted hover:text-[var(--text)]" aria-label="Salir de la lección">
            <X className="size-6" />
          </button>
          <div className="h-4 flex-1 overflow-hidden rounded-full surface-2" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <motion.div className="relative h-full rounded-full bg-emerald-500" animate={{ width: `${Math.max(4, progress * 100)}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}>
              <span className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/35" />
            </motion.div>
          </div>
          <div className="flex items-center gap-1 font-bold text-rose-600 tabular-nums dark:text-rose-400" aria-label={`${hearts} vidas`}>
            <motion.span key={hearts} initial={{ scale: 1.5 }} animate={{ scale: 1 }}>
              <Heart className="size-6 fill-current" />
            </motion.span>
            {hearts}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-2 pb-48">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
            {ex.kind === 'meaning' && ex.intro && (
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-xs font-bold tracking-wide text-violet-700 uppercase dark:text-violet-300">
                <Sparkles className="size-3.5" /> Palabra nueva
              </span>
            )}
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h1>

            <div className="mt-6">
              {ex.kind === 'meaning' && (
                <>
                  <div className="mb-6 flex items-center gap-3">
                    <SpeakButton text={ex.item.term} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-muted uppercase">{KIND_LABEL[ex.item.kind]}</div>
                      <div className="font-display text-3xl font-extrabold break-words">{ex.item.term}</div>
                      {ex.intro && (ex.item.example || ex.item.parts) && (
                        <div className="mt-1 text-sm text-muted">
                          Pista: {ex.item.example ? <>aparece en «{ex.item.example}»</> : ex.item.parts!.map((p) => p.text).join(' + ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <OptionList options={ex.options} selected={selected} onSelect={setSelected} disabled={phase !== 'answer'} answer={ex.answer} revealed={phase === 'feedback'} />
                </>
              )}

              {ex.kind === 'term' && (
                <>
                  <p className="mb-6 rounded-2xl border-2 border-soft bg-[var(--surface)] p-4 text-lg font-medium">«{ex.item.meaning}»</p>
                  <OptionList options={ex.options} selected={selected} onSelect={setSelected} disabled={phase !== 'answer'} answer={ex.answer} revealed={phase === 'feedback'} />
                </>
              )}

              {ex.kind === 'part' && (
                <>
                  <p className="mb-6 text-lg">
                    En <b className="font-display">{ex.item.term}</b>, ¿qué significa <mark className="rounded-md bg-sky-500/20 px-1.5 py-0.5 font-bold text-sky-800 dark:text-sky-200">{ex.part.text}</mark>?
                  </p>
                  <OptionList options={ex.options} selected={selected} onSelect={setSelected} disabled={phase !== 'answer'} answer={ex.answer} revealed={phase === 'feedback'} />
                </>
              )}

              {ex.kind === 'build' && (
                <>
                  <p className="mb-5 rounded-2xl border-2 border-soft bg-[var(--surface)] p-4 text-lg font-medium">«{ex.item.meaning}»</p>
                  <div className="flex min-h-16 flex-wrap items-center gap-2 border-b-2 border-soft pb-3" aria-label="Tu respuesta">
                    {chosen.length === 0 && <span className="text-sm text-muted">Toca las piezas en orden…</span>}
                    {chosen.map((c, i) => (
                      <motion.button layoutId={`tile-${c}`} key={c} disabled={phase !== 'answer'} onClick={() => setChosen(chosen.filter((_, j) => j !== i))} className="rounded-xl border-2 border-b-4 border-soft bg-[var(--surface)] px-3.5 py-2 font-display text-lg font-bold">
                        {ex.tiles[c]}
                      </motion.button>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {ex.tiles.map((t, i) =>
                      chosen.includes(i) ? (
                        <span key={i} className="rounded-xl bg-slate-900/[0.06] px-3.5 py-2 font-display text-lg font-bold text-transparent select-none dark:bg-white/[0.06]">
                          {t}
                        </span>
                      ) : (
                        <motion.button layoutId={`tile-${i}`} key={i} disabled={phase !== 'answer'} onClick={() => (playLesson('tap'), setChosen([...chosen, i]))} className="rounded-xl border-2 border-b-4 border-soft bg-[var(--surface)] px-3.5 py-2 font-display text-lg font-bold active:translate-y-0.5">
                          {t}
                        </motion.button>
                      ),
                    )}
                  </div>
                </>
              )}

              {ex.kind === 'match' && (
                <MatchBoard
                  items={ex.items}
                  onMistake={(item) => {
                    answerWord(item.id, false)
                    loseHeart()
                  }}
                  onPair={(item) => answerWord(item.id, true)}
                  onDone={() => {
                    setLastCorrect(true)
                    setAnswered((a) => a + 1)
                    setPhase('feedback')
                  }}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {confirmExit && (
          <motion.div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmExit(false)}>
            <motion.div role="dialog" aria-modal="true" aria-labelledby="exit-title" initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} onClick={(e) => e.stopPropagation()} className="card w-full max-w-sm p-6 text-center" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
              <h2 id="exit-title" className="font-display text-xl font-extrabold">
                ¿Seguro que quieres salir?
              </h2>
              <p className="mt-2 text-sm text-muted">Tu avance en esta lección queda guardado: cuando vuelvas, sigues desde aquí.</p>
              <button autoFocus onClick={() => setConfirmExit(false)} className="mt-5 w-full rounded-2xl border-b-4 border-black/20 bg-emerald-600 py-3.5 font-bold tracking-wide text-white uppercase">
                Seguir aprendiendo
              </button>
              <button onClick={() => navigate('/terminologia')} className="mt-2 w-full rounded-2xl py-3 font-bold tracking-wide text-rose-600 uppercase dark:text-rose-400">
                Salir
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pie: comprobar / retroalimentación */}
      <footer className="fixed inset-x-0 bottom-0 z-20">
        <AnimatePresence mode="wait" initial={false}>
          {phase === 'feedback' ? (
            <motion.div key="fb" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 32 }} className={cn('border-t-2', lastCorrect ? 'border-emerald-500/40 bg-emerald-50 dark:bg-[#0c2a20]' : 'border-rose-500/40 bg-rose-50 dark:bg-[#2c1018]')}>
              <div className="mx-auto max-w-2xl px-4 pt-5" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
                <div className="flex items-start gap-3">
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-full text-white', lastCorrect ? 'bg-emerald-600' : 'bg-rose-600')}>{lastCorrect ? <Check className="size-6" /> : <X className="size-6" />}</span>
                  <div className="min-w-0 flex-1">
                    <div className={cn('font-display text-xl font-extrabold', lastCorrect ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300')}>{lastCorrect ? ['¡Correcto!', '¡Excelente!', '¡Muy bien!'][idx % 3] : 'Respuesta correcta:'}</div>
                    {!lastCorrect && <div className="mt-0.5 font-semibold text-rose-900 dark:text-rose-200">{correctAnswerText(ex)}</div>}
                    {feedbackItem && (
                      <div className={cn('mt-2', lastCorrect ? 'text-emerald-900 dark:text-emerald-100' : 'text-rose-900 dark:text-rose-100')}>
                        {ex.kind !== 'meaning' && (
                          <p className="mb-1.5 text-sm">
                            <b>{feedbackItem.term}</b>: {feedbackItem.meaning}
                          </p>
                        )}
                        <Breakdown item={feedbackItem} />
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={next} autoFocus className={cn('mt-4 h-13 w-full rounded-2xl border-b-4 border-black/20 py-3.5 font-bold tracking-wide text-white uppercase', lastCorrect ? 'bg-emerald-600' : 'bg-rose-600')}>
                  Continuar
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t border-soft bg-[var(--bg)]">
              <div className="mx-auto max-w-2xl px-4 pt-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                {ex.kind === 'match' ? (
                  <p className="py-3.5 text-center text-sm text-muted">Toca un término y luego su significado.</p>
                ) : (
                  <button onClick={check} disabled={!canCheck} className="h-13 w-full rounded-2xl border-b-4 border-black/20 bg-emerald-600 py-3.5 font-bold tracking-wide text-white uppercase transition-opacity disabled:border-transparent disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-300">
                    Comprobar
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  )
}
