import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeftRight, BookA, Check, Crown, Flame, Languages, Lock, RotateCcw, Search, Star, Timer, Trophy, Zap } from 'lucide-react'
import { KIND_LABEL, LINGO_BY_ID, LINGO_ITEMS, LINGO_LESSONS, LINGO_UNITS, type LingoKind } from '@/data/lingo'
import { dueItems, TOTAL_LESSONS } from '@/lib/lingo'
import { lingoStreak, useLingo } from '@/store/lingo'
import { Card, PageHeader, Ring, Segmented } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'
import { toast } from '@/store/toasts'
import { cn, dayKey, solidBg, tintText } from '@/lib/utils'

/** Desplazamiento en zigzag de los nodos de la ruta, como en Duolingo. */
const OFFSETS = [0, 44, 66, 44, 0, -44, -66, -44]

function PathView() {
  const navigate = useNavigate()
  const lessons = useLingo((s) => s.lessons)
  const active = useLingo((s) => s.active)
  const firstOpen = LINGO_LESSONS.findIndex((l) => !lessons[l.id])
  const current = firstOpen === -1 ? LINGO_LESSONS.length : firstOpen

  let globalIdx = 0
  return (
    <div className="space-y-10">
      {LINGO_UNITS.map((unit, ui) => {
        const done = unit.lessons.filter((l) => lessons[l.id]).length
        return (
          <section key={unit.id} aria-labelledby={`unit-${unit.id}`}>
            <div className="sticky top-16 z-[5] -mx-1 mb-8 rounded-2xl p-5 text-white shadow-lift" style={solidBg(unit.color)}>
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold tracking-widest text-white/80 uppercase">Unidad {ui + 1}</div>
                  <h2 id={`unit-${unit.id}`} className="font-display text-xl font-extrabold">
                    {unit.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-white/85">{unit.description}</p>
                </div>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15 font-display text-sm font-bold">
                  {done}/{unit.lessons.length}
                </span>
              </div>
            </div>
            <ol className="flex flex-col items-center gap-6">
              {unit.lessons.map((lesson) => {
                const i = globalIdx++
                const result = lessons[lesson.id]
                const state = result ? 'done' : i === current ? 'current' : i < current ? 'done' : 'locked'
                const offset = OFFSETS[i % OFFSETS.length]
                return (
                  <li key={lesson.id} className="flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
                    {state === 'current' && (
                      <motion.div initial={{ y: 6, opacity: 0 }} animate={{ y: [0, -4, 0], opacity: 1 }} transition={{ y: { repeat: 3, duration: 2, ease: 'easeInOut' } }} className="mb-2 rounded-xl border-2 border-soft bg-[var(--surface)] px-3 py-1.5 text-xs font-bold tracking-wide uppercase" style={tintText(unit.color)}>
                        {active?.lessonId === lesson.id ? 'Continuar' : 'Empezar'}
                      </motion.div>
                    )}
                    <motion.button
                      whileTap={state !== 'locked' ? { scale: 0.92, y: 4 } : undefined}
                      onClick={() => (state === 'locked' ? toast({ kind: 'info', title: 'Lección bloqueada', body: 'Completa la lección anterior para desbloquearla.' }) : navigate(`/terminologia/leccion/${lesson.id}`))}
                      aria-label={`${lesson.title}${state === 'locked' ? ' (bloqueada)' : state === 'done' ? ' (completada)' : ''}`}
                      className={cn('relative grid size-[72px] place-items-center rounded-full border-b-[6px] text-white transition-[filter] hover:brightness-110', state === 'locked' && 'border-slate-300 bg-slate-200 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500')}
                      style={state === 'locked' ? undefined : { backgroundColor: unit.color, borderColor: `color-mix(in oklab, ${unit.color} 65%, black)` }}
                    >
                      {state === 'current' && <span className="absolute -inset-2 animate-ping-few rounded-full opacity-20" style={{ backgroundColor: unit.color }} />}
                      {state === 'locked' ? <Lock className="size-7" /> : state === 'done' ? (result?.stars === 3 ? <Crown className="size-8" /> : <Check className="size-8" strokeWidth={3} />) : <Icon name={unit.icon} className="size-8" />}
                    </motion.button>
                    <div className="mt-2 text-center text-sm font-semibold">{lesson.title}</div>
                    {result && (
                      <div className="mt-0.5 flex gap-0.5" aria-label={`${result.stars} de 3 estrellas`}>
                        {[1, 2, 3].map((s) => (
                          <Star key={s} className={cn('size-3.5', s <= result.stars ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600')} />
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
      {current >= LINGO_LESSONS.length && (
        <Card className="p-6 text-center">
          <Crown className="mx-auto size-10 text-amber-500" />
          <h3 className="mt-2 font-display text-xl font-bold">¡Completaste toda la ruta!</h3>
          <p className="mt-1 text-sm text-muted">Sigue con el repaso diario para que las palabras no se te olviden.</p>
        </Card>
      )}
    </div>
  )
}

const KINDS: (LingoKind | 'todos')[] = ['todos', 'prefijo', 'sufijo', 'raíz', 'término', 'sigla']
const PLURAL: Record<LingoKind, string> = { prefijo: 'Prefijos', sufijo: 'Sufijos', raíz: 'Raíces', término: 'Términos', sigla: 'Siglas' }

function Dictionary() {
  const words = useLingo((s) => s.words)
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<LingoKind | 'todos'>('todos')
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const list = useMemo(() => {
    const nq = norm(q.trim())
    return LINGO_ITEMS.filter((i) => (kind === 'todos' || i.kind === kind) && (!nq || norm(`${i.term} ${i.meaning}`).includes(nq))).sort((a, b) => norm(a.term.replace(/^-/, '')).localeCompare(norm(b.term.replace(/^-/, ''))))
  }, [q, kind])

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca un término o un significado…" className="h-12 w-full rounded-2xl border border-soft bg-[var(--surface)] pr-4 pl-12 outline-none focus:border-brand-500" />
      </div>
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {KINDS.map((k) => (
          <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={cn('h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors', kind === k ? 'border-transparent bg-brand-600 text-white' : 'border-soft hover:border-brand-500/40')}>
            {k === 'todos' ? 'Todos' : PLURAL[k]}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">{list.length} resultados</p>
      <ul className="mt-2 grid gap-2 md:grid-cols-2">
        {list.map((i) => {
          const w = words[i.id]
          return (
            <li key={i.id} className="card flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display text-lg font-bold">{i.term}</span>
                  <span className="text-xs font-semibold tracking-wide text-muted uppercase">{KIND_LABEL[i.kind]}</span>
                </div>
                <p className="text-sm">{i.meaning}</p>
                {i.parts && (
                  <p className="mt-1 text-xs text-muted">
                    {i.parts.map((p) => `${p.text} (${p.meaning})`).join(' + ')}
                  </p>
                )}
                {i.example && <p className="mt-1 text-xs text-muted">Ej.: {i.example}</p>}
                {i.opposite && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <ArrowLeftRight className="size-3.5" /> Contrario: <b className="font-semibold text-[var(--text)]">{LINGO_BY_ID.get(i.opposite)?.term}</b>
                  </p>
                )}
                {i.context && (
                  <p className="mt-1.5 rounded-lg surface-2 px-2.5 py-1.5 text-xs leading-relaxed">
                    {i.context.split('___').map((chunk, n, all) => (
                      <span key={n}>
                        {chunk}
                        {n < all.length - 1 && <b>{i.term}</b>}
                      </span>
                    ))}
                  </p>
                )}
                <div className="mt-2 flex gap-1" aria-label={w ? `Dominio ${w.strength} de 5` : 'Aún no practicada'}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={cn('h-1.5 w-5 rounded-full', w && n <= w.strength ? 'bg-emerald-500' : 'surface-2')} />
                  ))}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Aviso para continuar una lección a medias. */
function ContinueBanner() {
  const navigate = useNavigate()
  const active = useLingo((s) => s.active)
  const activeLesson = active && active.lessonId !== 'repaso' ? LINGO_LESSONS.find((l) => l.id === active.lessonId) : null
  if (!activeLesson || !active) return null
  return (
    <Card className="flex items-center gap-4 border-emerald-500/40 bg-emerald-500/[0.06] p-4">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold tracking-wide text-emerald-800 uppercase dark:text-emerald-300">Lección a medias</div>
        <div className="font-semibold">{activeLesson.title}</div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full surface-2">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(active.idx / active.queue.length) * 100}%` }} />
        </div>
      </div>
      <button onClick={() => navigate(`/terminologia/leccion/${activeLesson.id}`)} className="h-11 shrink-0 rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-4 text-sm font-bold tracking-wide text-white uppercase">
        Continuar
      </button>
    </Card>
  )
}

/** Reto relámpago: 60 segundos para responder todo lo que puedas. */
function BlitzCard({ className }: { className?: string }) {
  const best = useLingo((s) => s.blitzBest)
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
          <Timer className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">Reto relámpago</div>
          <div className="text-sm text-muted">60 segundos: responde todas las que puedas.</div>
        </div>
      </div>
      {best > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-sm">
          <Trophy className="size-4 text-amber-500" /> Tu récord: <b>{best}</b>
        </div>
      )}
      <Link to="/terminologia/relampago" className="mt-4 flex h-11 items-center justify-center rounded-xl border-b-4 border-black/20 bg-amber-500 text-sm font-bold tracking-wide text-white uppercase">
        Jugar
      </Link>
    </Card>
  )
}

export default function LingoPath() {
  const [tab, setTab] = useState<'ruta' | 'diccionario'>('ruta')
  const { lessons, words, days, dailyGoal } = useLingo()
  const streak = lingoStreak(days)
  const today = days[dayKey()] ?? 0
  const mastered = Object.values(words).filter((w) => w.strength >= 3).length
  const due = dueItems(words, 50).length
  const doneLessons = Object.keys(lessons).filter((id) => LINGO_LESSONS.some((l) => l.id === id)).length

  return (
    <div>
      <PageHeader icon={<Languages className="size-6" />} eyebrow="Como Duolingo, pero de medicina" title="Terminología médica" subtitle="Aprende las palabras por partes: con unos pocos prefijos, raíces y sufijos entiendes cientos de términos." />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="mb-6 empty:hidden">
            <ContinueBanner />
          </div>
          <Segmented
            value={tab}
            onChange={setTab}
            className="mb-6 grid w-full grid-cols-2 sm:inline-flex sm:w-auto"
            options={[
              { value: 'ruta', label: 'Ruta de aprendizaje' },
              { value: 'diccionario', label: 'Diccionario' },
            ]}
          />
          {tab === 'ruta' ? <PathView /> : <Dictionary />}
        </div>

        <aside className="space-y-4 max-lg:order-first lg:sticky lg:top-24 lg:h-fit">
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-4">
            <Card className="flex flex-col items-center gap-1 p-3 text-center lg:flex-row lg:gap-4 lg:p-5 lg:text-left">
              <Flame className={cn('size-7 shrink-0', streak ? 'fill-orange-400 text-orange-500' : 'text-muted')} />
              <div>
                <div className="font-display text-xl font-extrabold">{streak}</div>
                <div className="text-xs text-muted">{streak === 1 ? 'día de racha' : 'días de racha'}</div>
              </div>
            </Card>
            <Card className="flex flex-col items-center gap-1 p-3 text-center lg:flex-row lg:gap-4 lg:p-5 lg:text-left">
              <Ring value={Math.min(1, today / dailyGoal)} size={36} stroke={4} color="#f59e0b">
                <Zap className="size-3.5 fill-amber-400 text-amber-500" />
              </Ring>
              <div>
                <div className="font-display text-xl font-extrabold">
                  {today}
                  <span className="text-sm font-semibold text-muted">/{dailyGoal}</span>
                </div>
                <div className="text-xs text-muted">XP de hoy</div>
              </div>
            </Card>
            <Card className="flex flex-col items-center gap-1 p-3 text-center lg:flex-row lg:gap-4 lg:p-5 lg:text-left">
              <BookA className="size-7 shrink-0 text-violet-600 dark:text-violet-400" />
              <div>
                <div className="font-display text-xl font-extrabold">{mastered}</div>
                <div className="text-xs text-muted">dominadas de {LINGO_ITEMS.length}</div>
              </div>
            </Card>
          </div>

          <Card className={cn('p-5', !due && 'max-lg:hidden')}>
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300">
                <RotateCcw className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">Repaso de palabras</div>
                <div className="text-sm text-muted">{due ? `${due} ${due === 1 ? 'palabra toca' : 'palabras tocan'} hoy` : 'Nada pendiente por ahora'}</div>
              </div>
            </div>
            {due > 0 && (
              <Link to="/terminologia/leccion/repaso" className="mt-4 flex h-11 items-center justify-center rounded-xl border-b-4 border-black/20 bg-sky-600 text-sm font-bold tracking-wide text-white uppercase">
                Repasar ahora
              </Link>
            )}
          </Card>

          {/* En el teléfono aparece cuando ya hay alguna lección hecha, para no tapar la ruta al empezar. */}
          <BlitzCard className={doneLessons ? undefined : 'max-lg:hidden'} />

          <Card className="p-5 max-lg:hidden">
            <div className="text-sm font-semibold">Tu avance</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-3xl font-extrabold">{doneLessons}</span>
              <span className="text-sm text-muted">de {TOTAL_LESSONS} lecciones</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full surface-2">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(doneLessons / TOTAL_LESSONS) * 100}%` }} />
            </div>
            <p className="mt-4 text-xs text-muted">Consejo: 1 o 2 lecciones al día, el repaso cuando toque y un reto relámpago para ganar velocidad.</p>
          </Card>
        </aside>
      </div>
    </div>
  )
}
