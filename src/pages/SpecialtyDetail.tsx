import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, GraduationCap, Layers, Lightbulb, Newspaper, Play, RotateCcw, Search, Target, X } from 'lucide-react'
import { SPECIALTIES, getSpecialty } from '@/data/specialties'
import { SPECIALTY_INFO } from '@/data/specialtyInfo'
import { areaOf } from '@/data/areas'
import { GUIDES } from '@/data/guides'
import { UPDATES } from '@/data/updates'
import { BUILTIN_CARDS } from '@/data/flashcards'
import { useBank } from '@/store/bank'
import { useProgress } from '@/store/progress'
import { specialtyStats } from '@/lib/stats'
import { Icon } from '@/components/ui/Icon'
import { Button, Card, EmptyState, ProgressBar, Ring } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import { normalizeText as normalizeTopic } from '@/data/specialties'

function MiniFlashcard({ front, back, color }: { front: string; back: string; color: string }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button onClick={() => setFlipped(!flipped)} className="perspective h-36 w-full text-left" aria-label={flipped ? 'Ver pregunta' : 'Ver respuesta'}>
      <motion.div className="preserve-3d relative h-full w-full" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
        <div className="backface-hidden card absolute inset-0 grid place-items-center p-4 text-center text-sm font-semibold">{front}</div>
        <div className="backface-hidden card absolute inset-0 grid place-items-center overflow-y-auto p-4 text-center text-sm" style={{ transform: 'rotateY(180deg)', borderColor: color }}>
          {back}
        </div>
      </motion.div>
    </button>
  )
}

export default function SpecialtyDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const questions = useBank((s) => s.questions)
  const byId = useBank((s) => s.byId)
  const attempts = useProgress((s) => s.attempts)
  const guidesRead = useProgress((s) => s.guidesRead)
  const s = getSpecialty(id)
  const info = SPECIALTY_INFO[id]
  const area = areaOf(id)

  const specQuestions = useMemo(() => questions.filter((q) => q.specialty === id), [questions, id])
  const st = useMemo(() => specialtyStats(attempts, specQuestions)[0], [attempts, specQuestions])

  // Temas presentes en el banco con su rendimiento.
  const bankTopics = useMemo(() => {
    const map = new Map<string, { name: string; total: number; answered: number; correct: number }>()
    for (const q of specQuestions) {
      if (!q.topic) continue
      const k = normalizeTopic(q.topic)
      const t = map.get(k) ?? { name: q.topic, total: 0, answered: 0, correct: 0 }
      t.total++
      const a = attempts[q.id]
      if (a) {
        t.answered += a.seen
        t.correct += a.correct
      }
      map.set(k, t)
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  }, [specQuestions, attempts])

  const errors = Object.entries(attempts)
    .filter(([qid, a]) => !a.lastCorrect && byId.get(qid)?.specialty === id)
    .sort((a, b) => b[1].lastAt - a[1].lastAt)
    .map(([qid]) => byId.get(qid)!)
  const guides = GUIDES.filter((g) => g.specialty === id)
  const updates = UPDATES.filter((u) => u.specialty === id)
  const cards = BUILTIN_CARDS.filter((c) => c.specialty === id)
  const idx = SPECIALTIES.findIndex((x) => x.id === id)
  const prev = SPECIALTIES[(idx - 1 + SPECIALTIES.length) % SPECIALTIES.length]
  const next = SPECIALTIES[(idx + 1) % SPECIALTIES.length]

  if (!info && specQuestions.length === 0) {
    return <EmptyState icon={<Search className="size-7" />} title="Especialidad no encontrada" action={<Link to="/especialidades" className="text-sm font-semibold text-brand-600">Ver especialidades</Link>} />
  }

  const accuracy = st?.answered ? st.accuracy : 0
  const coverage = st?.total ? st.seen / st.total : 0

  return (
    <div className="space-y-6">
      <Link to="/especialidades" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)]">
        <ArrowLeft className="size-4" /> Especialidades
      </Link>

      {/* Hero */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lift sm:p-8" style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc 45%, #312e81)` }}>
        <div className="pointer-events-none absolute -top-10 -right-10 text-white/10">
          <Icon name={s.icon} className="size-72" strokeWidth={1} />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex-1">
            {area && <div className="text-xs font-semibold tracking-wider text-white/75 uppercase">{area.name}</div>}
            <h1 className="mt-1 flex items-center gap-3 text-3xl font-extrabold sm:text-4xl">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                <Icon name={s.icon} className="size-6" />
              </span>
              {s.name}
            </h1>
            {info && <p className="mt-3 max-w-2xl text-white/85">{info.description}</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={() => navigate(`/practica?specialty=${id}&count=20&auto=1`)} disabled={!specQuestions.length} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-900 shadow-lg transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-50">
                <Play className="size-4 fill-current" /> Practicar
              </button>
              <Link to={`/simulacro?specialty=${id}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25">
                <GraduationCap className="size-4" /> Simulacro
              </Link>
              {cards.length > 0 && (
                <Link to={`/flashcards/esp-${id}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25">
                  <Layers className="size-4" /> Flashcards
                </Link>
              )}
              {errors.length > 0 && (
                <button onClick={() => navigate(`/practica?specialty=${id}&status=failed&auto=1`)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25">
                  <RotateCcw className="size-4" /> Mis errores ({errors.length})
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-80">
            <div className="col-span-2 flex items-center gap-4 rounded-2xl bg-white/15 p-4 backdrop-blur">
              <Ring value={accuracy} size={72} stroke={7} color="#fff" track="rgb(255 255 255 / 0.25)">
                <span className="font-display text-lg font-bold">{st?.answered ? `${Math.round(accuracy * 100)}%` : '—'}</span>
              </Ring>
              <div>
                <div className="text-sm font-semibold">Precisión</div>
                <div className="text-xs text-white/75">{st?.answered ? `${st.correct} de ${st.answered} correctas` : 'Aún no has respondido'}</div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
              <div className="font-display text-2xl font-bold">{specQuestions.length}</div>
              <div className="text-[11px] text-white/75">preguntas en el banco</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
              <div className="font-display text-2xl font-bold">{Math.round(coverage * 100)}%</div>
              <div className="text-[11px] text-white/75">del banco visto</div>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {info && (
            <Card className="p-5 sm:p-6">
              <h2 className="mb-1 font-semibold">Temas de alto rendimiento</h2>
              <p className="mb-4 text-xs text-muted">Lo que más se pregunta. Toca un tema para buscarlo en el banco.</p>
              <div className="flex flex-wrap gap-2">
                {info.topics.map((t, i) => (
                  <motion.button
                    key={t}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/banco?specialty=${id}&q=${encodeURIComponent(t)}`)}
                    className="rounded-xl border border-soft px-3 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderLeft: `3px solid ${s.color}` }}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </Card>
          )}

          {info && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
                <Lightbulb className="size-5 text-amber-500" /> Perlas
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {info.pearls.map((p, i) => (
                  <motion.div key={p} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card relative overflow-hidden p-4 text-sm leading-relaxed">
                    <span className="absolute top-3 right-3 font-display text-3xl font-black opacity-10" style={{ color: s.color }}>
                      {i + 1}
                    </span>
                    {p}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {bankTopics.length > 0 && (
            <Card className="p-5 sm:p-6">
              <h2 className="mb-4 font-semibold">Temas en el banco</h2>
              <ul className="space-y-3">
                {bankTopics.slice(0, 12).map((t) => (
                  <li key={t.name}>
                    <button onClick={() => navigate(`/banco?specialty=${id}&q=${encodeURIComponent(t.name)}`)} className="group w-full text-left">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium group-hover:text-brand-600">{t.name}</span>
                        <span className="text-xs text-muted">
                          {t.total} preg.{t.answered ? ` · ${Math.round((t.correct / t.answered) * 100)}%` : ''}
                        </span>
                      </div>
                      <ProgressBar value={t.answered ? t.correct / t.answered : 0} color={s.color} height="h-1" className="mt-1.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {cards.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Flashcards rápidas</h2>
                <Link to={`/flashcards/esp-${id}`} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
                  Estudiar todas ({cards.length})
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {cards.slice(0, 3).map((c) => (
                  <MiniFlashcard key={c.id} front={c.front} back={c.back} color={s.color} />
                ))}
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <Card className="p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Tus últimos errores</h2>
                <button onClick={() => navigate(`/practica?specialty=${id}&status=failed&auto=1`)} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
                  Repasarlos
                </button>
              </div>
              <ul className="space-y-2">
                {errors.slice(0, 4).map((q) => (
                  <li key={q.id}>
                    <Link to={`/banco?id=${encodeURIComponent(q.id)}`} className="flex items-start gap-3 rounded-xl p-2 -mx-2 text-sm transition-colors hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-rose-500/15 text-rose-500">
                        <X className="size-3" />
                      </span>
                      <span className="line-clamp-2">{q.stem}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <BookOpen className="size-4" style={{ color: s.color }} /> Guías
            </h2>
            {guides.length === 0 ? (
              <p className="text-sm text-muted">Pronto habrá guías de esta especialidad.</p>
            ) : (
              <ul className="space-y-2">
                {guides.map((g) => (
                  <li key={g.id}>
                    <Link to={`/guias/${g.id}`} className="flex items-center gap-3 rounded-xl p-2 -mx-2 transition-colors hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]">
                      <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold', guidesRead.includes(g.id) ? 'bg-emerald-500/15 text-emerald-600' : 'surface-2 text-muted')}>{guidesRead.includes(g.id) ? '✓' : g.minutes}</span>
                      <span className="min-w-0 flex-1 text-sm font-medium">{g.title}</span>
                      <ChevronRight className="size-4 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {updates.length > 0 && (
            <Card className="p-5 sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <Newspaper className="size-4 text-rose-500" /> Actualizaciones
              </h2>
              <ul className="space-y-3">
                {updates.map((u) => (
                  <li key={u.id}>
                    <Link to={`/actualizaciones#${u.id}`} className="block text-sm hover:text-brand-600">
                      <span className="font-medium">{u.title}</span>
                      <span className="mt-0.5 block text-xs text-muted">{u.source}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-5 sm:p-6">
            <h2 className="mb-3 font-semibold">Tu progreso</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Preguntas vistas</dt>
                <dd className="font-semibold">
                  {st?.seen ?? 0} / {specQuestions.length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Respuestas</dt>
                <dd className="font-semibold">{st?.answered ?? 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Errores pendientes</dt>
                <dd className="font-semibold">{errors.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Guías leídas</dt>
                <dd className="font-semibold">
                  {guides.filter((g) => guidesRead.includes(g.id)).length} / {guides.length}
                </dd>
              </div>
            </dl>
            {specQuestions.length > 0 && (
              <Button className="mt-4 w-full" onClick={() => navigate(`/practica?specialty=${id}&status=unseen&auto=1`)}>
                <Target className="size-4" /> Preguntas no vistas
              </Button>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Link to={`/especialidades/${prev.id}`} className="card card-hover p-3 text-xs">
              <ArrowLeft className="mb-1 size-4 text-muted" />
              <span className="line-clamp-1 font-semibold">{prev.name}</span>
            </Link>
            <Link to={`/especialidades/${next.id}`} className="card card-hover p-3 text-right text-xs">
              <ArrowRight className="mb-1 ml-auto size-4 text-muted" />
              <span className="line-clamp-1 font-semibold">{next.name}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
