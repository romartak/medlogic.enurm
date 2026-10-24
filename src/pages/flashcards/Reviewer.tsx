import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Clock, EyeOff, Flag, Info, MoreHorizontal, PartyPopper, Pause, Pencil, Sparkles, Star, Undo2 } from 'lucide-react'
import { useCollection, useQueueInputFactory } from '@/hooks/useCollection'
import { useAnki, configFor } from '@/store/anki'
import { buildQueues, nextCard } from '@/lib/anki/queue'
import { deckLabel } from '@/lib/anki/collection'
import { dayNumber, newCardState, previewIntervals } from '@/lib/anki/scheduler'
import { renderCard } from '@/lib/anki/render'
import type { Card, Grade } from '@/lib/anki/types'
import { Button } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { CardHtml, CountTriplet, FLAGS, useNoteEditor } from '@/components/anki/common'
import { CustomStudy } from '@/components/anki/CustomStudy'
import { useHotkeys } from '@/hooks/useHotkeys'
import { celebrate, playSound } from '@/lib/fx'
import { cn, formatDate, shuffle, tintText } from '@/lib/utils'
import { toast } from '@/store/toasts'
import { getSpecialty } from '@/data/specialties'

const GRADES: { g: Grade; label: string; cls: string }[] = [
  { g: 1, label: 'Otra vez', cls: 'bg-rose-500 hover:bg-rose-600' },
  { g: 2, label: 'Difícil', cls: 'bg-amber-500 hover:bg-amber-600' },
  { g: 3, label: 'Bien', cls: 'bg-emerald-500 hover:bg-emerald-600' },
  { g: 4, label: 'Fácil', cls: 'bg-sky-500 hover:bg-sky-600' },
]

const KIND_LABEL = { new: 'Nueva', learning: 'Aprendiendo', review: 'Repaso', relearning: 'Reaprendiendo' } as const

function CardInfo({ card, onClose }: { card: Card; onClose: () => void }) {
  const state = useAnki((s) => s.states[card.id])
  const revlog = useAnki((s) => s.revlog)
  const deck = useCollection().deckById.get(card.deckId)
  const logs = revlog.filter((r) => r.cid === card.id)
  const avg = logs.length ? Math.round(logs.reduce((a, r) => a + r.time, 0) / logs.length / 1000) : 0
  const rows: [string, string][] = [
    ['Agregada', card.note.createdAt > 100_000 ? formatDate(card.note.createdAt) : 'Incluida con MedLogic'],
    ['Primer repaso', logs[0] ? formatDate(logs[0].ts) : '—'],
    ['Último repaso', logs.length ? formatDate(logs[logs.length - 1].ts) : '—'],
    ['Vence', state && state.type !== 'new' ? formatDate(state.due) : 'Nueva'],
    ['Intervalo', state?.interval ? `${state.interval} días` : '—'],
    ['Facilidad', state?.ease ? `${Math.round(state.ease * 100)} %` : '—'],
    ['Repasos', String(state?.reps ?? 0)],
    ['Olvidos', String(state?.lapses ?? 0)],
    ['Tiempo promedio', avg ? `${avg} s` : '—'],
    ['Tipo de tarjeta', state ? KIND_LABEL[state.type] : 'Nueva'],
    ['Tipo de nota', card.note.type === 'cloze' ? `Cloze (hueco ${card.ord + 1})` : card.note.type === 'reversed' ? `Básica + invertida (${card.ord === 0 ? 'frente' : 'reverso'})` : 'Básica'],
    ['Mazo', deck?.name ?? '—'],
    ['Etiquetas', card.note.tags.join(' ') || '—'],
  ]
  return (
    <Modal open onClose={onClose} title="Información de la tarjeta">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      {logs.length > 0 && (
        <div className="mt-5 max-h-48 overflow-y-auto rounded-xl border border-soft">
          <table className="w-full text-xs">
            <thead className="surface-2 text-left">
              <tr>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Botón</th>
                <th className="px-3 py-2">Intervalo</th>
              </tr>
            </thead>
            <tbody>
              {[...logs].reverse().map((r) => (
                <tr key={r.ts} className="border-t border-soft">
                  <td className="px-3 py-1.5">{new Date(r.ts).toLocaleString('es-DO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-3 py-1.5">{{ new: 'Nueva', learn: 'Aprend.', review: 'Repaso', relearn: 'Reaprend.', cram: 'Intensivo' }[r.kind]}</td>
                  <td className={cn('px-3 py-1.5 font-semibold', r.grade === 1 ? 'text-rose-500' : r.grade === 2 ? 'text-amber-500' : r.grade === 3 ? 'text-emerald-500' : 'text-sky-500')}>{GRADES[r.grade - 1].label}</td>
                  <td className="px-3 py-1.5">{r.ivl > 0 ? `${r.ivl} d` : `${Math.round(-r.ivl / 60)} min`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}

export default function Reviewer() {
  const { deckId = 'todas' } = useParams()
  const key = decodeURIComponent(deckId)
  const navigate = useNavigate()
  const col = useCollection()
  const factory = useQueueInputFactory(col)
  const states = useAnki((s) => s.states)
  const configs = useAnki((s) => s.configs)
  const deckConfig = useAnki((s) => s.deckConfig)
  const settings = useAnki((s) => s.settings)
  const answer = useAnki((s) => s.answer)
  const undo = useAnki((s) => s.undo)
  const patchStates = useAnki((s) => s.patchStates)
  const addTags = useAnki((s) => s.addTags)
  const openEditor = useNoteEditor((s) => s.open)
  const editorOpen = useNoteEditor((s) => !!s.request)

  const deck = col.deckById.get(key)
  const filtered = deck?.filtered
  const name = deckLabel(col, key)

  // Mazos filtrados: lista fija al iniciar (como Anki, todas sus tarjetas cuentan como pendientes).
  const staticQueue = useMemo(() => {
    if (!filtered) return null
    const cards = factory(key).cards
    const by = (fn: (c: Card) => number) => [...cards].sort((a, b) => fn(a) - fn(b))
    if (filtered.order === 'random') return shuffle(cards)
    if (filtered.order === 'added') return by((c) => c.note.createdAt)
    if (filtered.order === 'lapses') return by((c) => -(states[c.id]?.lapses ?? 0))
    return by((c) => states[c.id]?.due ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, filtered])
  const [remaining, setRemaining] = useState<Card[] | null>(staticQueue)

  const [currentId, setCurrentId] = useState<string | null>(null)
  const [lastId, setLastId] = useState<string | undefined>()
  const [shown, setShown] = useState(false)
  const [seq, setSeq] = useState(0)
  const [studied, setStudied] = useState(0)
  const [startedAt, setStartedAt] = useState(Date.now())
  const [menu, setMenu] = useState(false)
  const [info, setInfo] = useState(false)
  const [custom, setCustom] = useState(false)
  const [tick, setTick] = useState(0)
  const sessionStart = useRef(Date.now())

  const input = factory(key)
  const queues = filtered ? null : buildQueues(input)
  const current: Card | null = useMemo(() => {
    if (currentId) return col.cards.find((c) => c.id === currentId) ?? null
    return null
  }, [currentId, col.cards])

  // Elegir la siguiente tarjeta cuando no hay una en pantalla.
  useEffect(() => {
    if (currentId) return
    let next: Card | null
    if (remaining) next = remaining.find((c) => c.id !== lastId) ?? remaining[0] ?? null
    else next = nextCard({ ...input, now: Date.now() }, seq, lastId)
    if (next) {
      setCurrentId(next.id)
      setShown(false)
      setStartedAt(Date.now())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, remaining, states, tick])

  // Si solo quedan tarjetas de aprendizaje para más tarde, revisa cada 15 s.
  useEffect(() => {
    if (currentId) return
    const id = setInterval(() => setTick((t) => t + 1), 15_000)
    return () => clearInterval(id)
  }, [currentId])

  const state = current ? (states[current.id] ?? newCardState()) : null
  const conf = current ? configFor({ configs, deckConfig }, current.deckId) : null
  const rendered = current ? renderCard(current) : null
  const intervals = state && conf ? previewIntervals(state, conf, Date.now(), settings.rolloverHour) : null
  const activeKind = state ? (state.type === 'new' ? 'new' : state.type === 'review' ? 'review' : 'learn') : undefined

  const grade = (g: Grade) => {
    if (!current || !shown) return
    const siblings = col.cardsByNote.get(current.noteId) ?? []
    const res = answer(current, g, Date.now() - startedAt, { reschedule: filtered ? filtered.reschedule : true, siblings })
    playSound(g === 1 ? 'wrong' : 'tick')
    if (res.leech) toast({ kind: 'info', title: 'Tarjeta sanguijuela', body: 'La has olvidado muchas veces: considera reescribirla o dividirla.' })
    if (remaining) {
      const rest = remaining.filter((c) => c.id !== current.id)
      setRemaining(g === 1 ? [...rest, current] : rest)
      if (!rest.length && g !== 1) celebrate('big')
    }
    setLastId(current.id)
    setSeq((n) => n + 1)
    setStudied((n) => n + 1)
    setCurrentId(null)
  }

  const doUndo = () => {
    const id = undo()
    if (!id) return
    if (remaining && !remaining.some((c) => c.id === id)) {
      const c = col.cards.find((x) => x.id === id)
      if (c) setRemaining([c, ...remaining])
    }
    setStudied((n) => Math.max(0, n - 1))
    setCurrentId(id)
    setShown(true)
    toast({ kind: 'info', title: 'Respuesta deshecha' })
  }

  const skipCurrent = (msg: string, patch: Parameters<typeof patchStates>[1]) => {
    if (!current) return
    patchStates([current.id], patch)
    if (remaining) setRemaining(remaining.filter((c) => c.id !== current.id))
    setLastId(current.id)
    setCurrentId(null)
    toast({ kind: 'info', title: msg })
  }
  const bury = () => skipCurrent('Tarjeta enterrada hasta mañana', { buriedUntil: dayNumber(Date.now(), settings.rolloverHour) })
  const suspend = () => skipCurrent('Tarjeta suspendida', { suspended: true })
  const setFlag = (n: number) => current && patchStates([current.id], (s) => ({ flag: s.flag === n ? 0 : n }))
  const mark = () => {
    if (!current) return
    addTags([current.note], ['marcada'])
    toast({ kind: 'success', title: 'Nota marcada', body: 'Búscala con tag:marcada' })
  }

  useHotkeys(
    (e) => {
      const k = e.key
      if (k === ' ' || k === 'Enter') {
        e.preventDefault()
        if (!shown) setShown(true)
        else grade(3)
        return
      }
      if (shown && ['1', '2', '3', '4'].includes(k)) grade(Number(k) as Grade)
      else if (k.toLowerCase() === 'e' && current) openEditor({ noteId: current.noteId })
      else if (k === '-') bury()
      else if (k === '@' || k === '!') suspend()
      else if (k === '*') mark()
      else if (k.toLowerCase() === 'z') doUndo()
      else if (k.toLowerCase() === 'i' && current) setInfo(true)
      else if (k === 'Escape') navigate(`/flashcards/${encodeURIComponent(key)}`)
    },
    !editorOpen && !info && !custom,
  )

  // Banderas con Alt+1…7 (Ctrl+1…7 en Anki; los navegadores reservan Ctrl+número).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.altKey || e.ctrlKey) && /^[0-7]$/.test(e.key) && current) {
        e.preventDefault()
        setFlag(Number(e.key))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const counts = remaining
    ? { new: remaining.filter((c) => !states[c.id] || states[c.id].type === 'new').length, learn: 0, review: remaining.filter((c) => states[c.id] && states[c.id].type !== 'new').length }
    : (queues?.counts ?? { new: 0, learn: 0, review: 0 })
  const flag = state?.flag ? FLAGS.find((f) => f.n === state.flag) : undefined
  const elapsedMin = Math.round((Date.now() - sessionStart.current) / 60000)

  const header = (
    <div className="mb-5 flex items-center gap-3">
      <Link to={`/flashcards/${encodeURIComponent(key)}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-muted hover:text-[var(--text)]" title="Esc">
        <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Volver</span>
      </Link>
      <div className="min-w-0 flex-1 text-center">
        <div className="truncate font-display font-bold">{name}</div>
        {filtered && !filtered.reschedule && <div className="text-[11px] text-amber-600">Sin reprogramar</div>}
      </div>
      {settings.showRemaining && <CountTriplet n={counts.new} l={counts.learn} r={counts.review} active={activeKind} />}
    </div>
  )

  if (!current) {
    const nextAt = queues?.counts.nextLearnAt
    return (
      <div className="mx-auto max-w-2xl">
        {header}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-brand-gradient text-white shadow-glow">{nextAt ? <Pause className="size-9" /> : <PartyPopper className="size-9" />}</div>
          <h2 className="mt-6 text-2xl font-bold">{nextAt ? 'Pausa breve' : '¡Felicidades! Terminaste por ahora.'}</h2>
          <p className="mt-2 text-muted">
            {studied > 0 ? `Repasaste ${studied} tarjetas en ${elapsedMin} min. ` : ''}
            {nextAt ? `La siguiente tarjeta en aprendizaje vuelve a las ${new Date(nextAt).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}.` : 'Vuelve mañana para tus siguientes repasos.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {nextAt && (
              <Button variant="outline" onClick={() => setTick((t) => t + 1)}>
                <Clock className="size-4" /> Comprobar ahora
              </Button>
            )}
            <Button variant="outline" onClick={() => setCustom(true)}>
              <Sparkles className="size-4" /> Estudio personalizado
            </Button>
            <Link to="/flashcards" className="inline-flex h-10 items-center rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-white">
              Volver a los mazos
            </Link>
          </div>
        </motion.div>
        {custom && <CustomStudy open deckKey={key} deckName={name} onClose={() => setCustom(false)} />}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {header}

      <AnimatePresence mode="wait">
        <motion.div key={current.id + seq} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="card relative min-h-[320px] overflow-hidden p-6 sm:p-10">
          {flag && <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: flag.color }} />}
          <div className="mb-6 flex items-center justify-between text-[11px] font-semibold text-muted">
            <span className="flex items-center gap-2">
              <span className={cn('rounded-full px-2 py-0.5', state?.type === 'new' ? 'bg-sky-500/15 text-sky-600' : state?.type === 'review' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600')}>{KIND_LABEL[state?.type ?? 'new']}</span>
              {current.note.specialty && <span style={tintText(getSpecialty(current.note.specialty).color)}>{getSpecialty(current.note.specialty).short}</span>}
              {state?.leech && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-600">Sanguijuela</span>}
            </span>
            <div className="relative">
              <button onClick={() => setMenu(!menu)} className="grid size-8 place-items-center rounded-lg hover:bg-slate-900/5 dark:hover:bg-white/5" aria-label="Más acciones">
                <MoreHorizontal className="size-5" />
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                  <div className="card absolute top-9 right-0 z-20 w-56 p-1 text-sm font-normal text-[var(--text)] shadow-lift">
                    {[
                      { l: 'Editar nota', k: 'E', icon: Pencil, run: () => openEditor({ noteId: current.noteId }) },
                      { l: 'Marcar nota', k: '*', icon: Star, run: mark },
                      { l: 'Enterrar hasta mañana', k: '-', icon: EyeOff, run: bury },
                      { l: 'Suspender tarjeta', k: '@', icon: Pause, run: suspend },
                      { l: 'Deshacer', k: 'Z', icon: Undo2, run: doUndo },
                      { l: 'Información', k: 'I', icon: Info, run: () => setInfo(true) },
                    ].map((it) => (
                      <button
                        key={it.l}
                        onClick={() => {
                          setMenu(false)
                          it.run()
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-slate-900/5 dark:hover:bg-white/5"
                      >
                        <it.icon className="size-4 text-muted" /> <span className="flex-1">{it.l}</span> <span className="kbd">{it.k}</span>
                      </button>
                    ))}
                    <div className="flex items-center gap-1 border-t border-soft px-2 pt-2 pb-1">
                      <Flag className="mr-1 size-4 text-muted" />
                      {FLAGS.map((f) => (
                        <button key={f.n} title={`Bandera ${f.name} (Alt+${f.n})`} onClick={() => setFlag(f.n)} className={cn('size-5 rounded-full ring-offset-2 ring-offset-[var(--surface)]', state?.flag === f.n && 'ring-2')} style={{ backgroundColor: f.color, ['--tw-ring-color' as string]: f.color }} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {current.note.type === 'cloze' && shown ? (
            // En cloze, el reverso reemplaza al frente con el hueco revelado (plantilla de Anki).
            <CardHtml html={rendered!.back} className={cn('text-center', current.note.front.length > 160 ? 'text-base' : 'text-xl sm:text-2xl')} />
          ) : (
            <CardHtml html={rendered!.front} className={cn('text-center', current.note.front.length > 160 ? 'text-base' : 'text-xl sm:text-2xl')} />
          )}
          <AnimatePresence>
            {shown && current.note.type !== 'cloze' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <hr className="my-6 border-brand-500/30" />
                <CardHtml html={rendered!.back} className="text-center text-base sm:text-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="glass sticky bottom-24 z-10 mt-5 rounded-2xl p-2 shadow-lift lg:bottom-4">
        {shown ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2">
            {GRADES.map((b) => (
              <motion.button key={b.g} whileTap={{ scale: 0.94 }} onClick={() => grade(b.g)} className={cn('flex flex-col items-center rounded-xl py-2.5 text-white shadow-lift transition-colors', b.cls)}>
                {settings.showIntervals && intervals && <span className="text-[11px] font-semibold opacity-90">{intervals[b.g]}</span>}
                <span className="text-sm font-bold">{b.label}</span>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <Button size="lg" className="w-full shadow-lift" onClick={() => setShown(true)}>
            Mostrar respuesta <span className="kbd ml-2 border-white/30 bg-white/20 text-white">Espacio</span>
          </Button>
        )}
      </div>
      <p className="mt-3 hidden text-center text-xs text-muted sm:block">
        <span className="kbd">1</span>–<span className="kbd">4</span> responder · <span className="kbd">E</span> editar · <span className="kbd">-</span> enterrar · <span className="kbd">@</span> suspender · <span className="kbd">Z</span> deshacer · <span className="kbd">Alt</span>+<span className="kbd">1–7</span> bandera
      </p>

      {info && <CardInfo card={current} onClose={() => setInfo(false)} />}
    </div>
  )
}
