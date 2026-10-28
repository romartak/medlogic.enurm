import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Languages, BookOpen, CalendarDays, Check, ChartColumn, Flag, Flame, GraduationCap, HeartPulse, Layers, Medal, Newspaper, RotateCcw, Share2, Sparkles, Stethoscope, Swords, Target, Timer, Trophy, Zap } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useProgress, levelFromXp, levelTitle } from '@/store/progress'
import { resolveExamDate } from '@/lib/plan'
import { useBank } from '@/store/bank'
import { computeStreak, dailySeries, overview, predictedScore, specialtyStats, weakest } from '@/lib/stats'
import { Card, ProgressBar, Ring, SpecialtyIcon, StatCard } from '@/components/ui/primitives'
import { DailyPlanCard } from '@/components/DailyPlanCard'
import { QuestionCard } from '@/components/QuestionCard'
import { UPDATES } from '@/data/updates'
import { getSpecialty } from '@/data/specialties'
import { useCardTotals } from '@/hooks/useCollection'
import { addressName, cn, dayKey, daysBetween, formatDate, hashString, pct } from '@/lib/utils'
import { playSound } from '@/lib/fx'
import { LINGO_LESSONS } from '@/data/lingo'
import { lingoStreak, useLingo } from '@/store/lingo'
import { dueItems } from '@/lib/lingo'
import { shareProgress, type ShareStats } from '@/lib/shareCard'
import { toast } from '@/store/toasts'
import { currentEdition, daysLeftInEdition, editionLabel, useNational } from '@/lib/national'
import { duelTally, useDuels } from '@/lib/duel'
import { ALL_NAV } from '@/components/layout/nav'
import { hasReminder, ReminderCard } from '@/components/ReminderCard'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

/** Acceso a Terminología: siguiente lección, palabras para repasar hoy y reto relámpago. */
function LingoCard() {
  const lessons = useLingo((s) => s.lessons)
  const days = useLingo((s) => s.days)
  const words = useLingo((s) => s.words)
  const next = LINGO_LESSONS.find((l) => !lessons[l.id])
  const streak = lingoStreak(days)
  const due = dueItems(words, 50).length
  return (
    <div className="card p-5">
      <Link to={next ? `/terminologia/leccion/${next.id}` : '/terminologia'} className="group flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl border-b-4 border-emerald-800 bg-emerald-600 text-white">
          <Languages className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-muted">Terminología{streak ? ` · ${streak} ${streak === 1 ? 'día' : 'días'} de racha` : ''}</div>
          <div className="font-display font-bold">{next ? `Siguiente: ${next.title}` : 'Ruta completada'}</div>
          <div className="truncate text-xs text-muted">{next ? next.unit.title : 'Sigue con el repaso diario'}</div>
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-1" />
      </Link>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          to={due ? '/terminologia/leccion/repaso' : '/terminologia'}
          className={cn('flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold', due ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300' : 'surface-2 text-muted')}
        >
          <RotateCcw className="size-4 shrink-0" /> {due ? `Repasar ${due} ${due === 1 ? 'palabra' : 'palabras'}` : 'Sin repaso hoy'}
        </Link>
        <Link to="/terminologia/relampago" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500/15 px-3 text-sm font-semibold text-amber-700 dark:text-amber-300">
          <Timer className="size-4 shrink-0" /> Reto relámpago
        </Link>
      </div>
    </div>
  )
}

/** Genera la imagen del progreso y la comparte (o la descarga). */
function ShareButton({ stats, className }: { stats: ShareStats; className?: string }) {
  const [busy, setBusy] = useState(false)
  const go = async () => {
    setBusy(true)
    try {
      const r = await shareProgress(stats)
      if (r === 'downloaded') toast({ kind: 'success', title: 'Imagen guardada', body: 'Súbela a tus historias de Instagram o envíala por WhatsApp.' })
    } catch {
      toast({ kind: 'error', title: 'No se pudo crear la imagen' })
    } finally {
      setBusy(false)
    }
  }
  return (
    <button onClick={go} disabled={busy} className={cn('inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:opacity-60', className)}>
      <Share2 className="size-4 shrink-0" /> {busy ? 'Creando…' : 'Compartir progreso'}
    </button>
  )
}

/** Simulacro nacional, duelos, casos, ECG y ranking: accesos rápidos con el estado de cada uno. */
function ExploreCard() {
  const edition = currentEdition()
  const national = useNational((s) => s.attempts[edition])
  const tally = duelTally(useDuels((s) => s.duels))
  const items = [
    { to: '/simulacro-nacional', icon: Flag, color: '#0ea5e9', title: 'Simulacro nacional', hint: national ? `Hecho: ${pct(national.correct, national.total)} %` : `${editionLabel(edition)} · ${daysLeftInEdition()} días` },
    { to: '/duelo', icon: Swords, color: '#f97316', title: 'Duelo', hint: tally.total ? `${tally.wins} ganados · ${tally.losses} perdidos` : 'Reta a un amigo' },
    { to: '/casos', icon: Stethoscope, color: '#8b5cf6', title: 'Casos clínicos', hint: 'Decide paso a paso' },
    { to: '/ecg', icon: HeartPulse, color: '#ef4444', title: 'Lee el ECG', hint: 'Arritmias y bloqueos' },
    { to: '/ranking', icon: Medal, color: '#f59e0b', title: 'Ranking', hint: 'Tu posición en el país' },
  ]
  return (
    <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
      {items.map((it) => (
        <Link key={it.to} to={it.to} className="card card-hover group flex w-40 shrink-0 snap-start flex-col p-4 sm:w-auto">
          <span className="grid size-10 place-items-center rounded-xl" style={{ backgroundColor: `${it.color}1a`, color: it.color }}>
            <it.icon className="size-5" />
          </span>
          <span className="mt-3 font-display font-bold">{it.title}</span>
          <span className="text-xs text-muted">{it.hint}</span>
        </Link>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { attempts, activity, xp, settings, exams, profile, guidesRead } = useProgress()
  const cardTotals = useCardTotals()
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const questions = useBank((s) => s.questions)
  const source = useBank((s) => s.source)
  const byId = useBank((s) => s.byId)

  const ov = overview(attempts, activity, questions.length)
  const streak = computeStreak(activity)
  const lvl = levelFromXp(xp)
  const stats = useMemo(() => specialtyStats(attempts, questions), [attempts, questions])
  const weak = weakest(stats, 3)
  const predicted = predictedScore(stats)
  const series = dailySeries(activity, 14)
  const failedCount = Object.entries(attempts).filter(([id, a]) => !a.lastCorrect && byId.has(id)).length
  const dueCards = cardTotals.due
  const newCards = cardTotals.newAvailable
  const examDay = resolveExamDate(profile).date
  const daysLeft = examDay ? daysBetween(new Date(), examDay) : null

  // Pregunta del día: determinista según la fecha.
  const qotd = useMemo(() => {
    if (!questions.length) return null
    const idx = parseInt(hashString(dayKey()), 36) % questions.length
    return questions[idx]
  }, [questions])
  const [qotdChoice, setQotdChoice] = useState<number | null>(null)

  const shareStats: ShareStats = { predicted, streak, accuracy: ov.accuracy, answered: ov.answered, level: lvl.level, levelTitle: levelTitle(lvl.level), daysLeft }

  const goalProgress = Math.min(1, ov.todayAnswered / Math.max(1, settings.dailyGoal))
  const isNew = ov.answered === 0 && exams.length === 0
  const hasActivity = series.some((d) => d.answered > 0)
  const cardsStudied = Object.values(activity).some((d) => d.cards > 0)
  const firstSteps = [
    { done: ov.answered > 0, icon: Target, title: 'Responde tu primera pregunta', body: 'Empieza por la pregunta del día, aquí abajo.', to: '/practica?auto=1' },
    { done: cardsStudied, icon: Layers, title: 'Repasa tus primeras flashcards', body: 'Unos minutos al día bastan para no olvidar.', to: '/flashcards' },
    { done: guidesRead.length > 0, icon: BookOpen, title: 'Lee una guía de alto rendimiento', body: 'Tablas, perlas y alertas en 5–10 minutos.', to: '/guias' },
    { done: exams.length > 0, icon: GraduationCap, title: 'Haz un mini simulacro', body: 'Mide tu punto de partida con 20 preguntas.', to: '/simulacro' },
  ]
  const stepsDone = firstSteps.filter((f) => f.done).length
  const lastSection = useProgress((st) => st.lastSection)
  const lastNav = lastSection ? ALL_NAV.find((n) => n.to === lastSection.to) : undefined

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-glow sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute right-40 -bottom-28 size-60 rounded-full bg-fuchsia-400/20 blur-2xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{greeting()}{addressName(settings) ? `, ${addressName(settings)}` : ''}</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{ov.todayAnswered >= settings.dailyGoal ? '¡Meta diaria cumplida! Sigue así.' : ov.todayAnswered > 0 ? `Vas por buen camino: ${ov.todayAnswered} preguntas hoy.` : '¿Listo para tu sesión de hoy?'}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-semibold backdrop-blur">
                <Trophy className="size-4" /> Nivel {lvl.level} · {levelTitle(lvl.level)}
              </span>
              {daysLeft !== null && daysLeft >= 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-semibold backdrop-blur">
                  <CalendarDays className="size-4" /> {daysLeft === 0 ? '¡El examen es hoy!' : `${daysLeft} días para el ENURM`}
                </span>
              )}
            </div>
            <div className="mt-4 max-w-sm">
              <div className="mb-1 flex justify-between text-xs text-white/80">
                <span>{lvl.current} / {lvl.needed} XP</span>
                <span>Nivel {lvl.level + 1}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <motion.div className="h-full w-full origin-left rounded-full bg-white" initial={{ scaleX: 0 }} animate={{ scaleX: lvl.progress }} transition={{ duration: 1 }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-5">
            <Ring value={goalProgress} size={116} stroke={10} color="#fff" track="rgb(255 255 255 / 0.22)">
              <div>
                <div className="font-display text-3xl font-extrabold">{ov.todayAnswered}</div>
                <div className="text-xs text-white/80">de {settings.dailyGoal} hoy</div>
              </div>
            </Ring>
            <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-none">
              <button onClick={() => navigate('/practica?auto=1')} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold whitespace-nowrap text-slate-900 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.97]">
                <Zap className="size-4" /> Práctica rápida
              </button>
              <Link to="/simulacro" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-semibold whitespace-nowrap backdrop-blur transition-colors hover:bg-white/25">
                <GraduationCap className="size-4" /> Simulacro
              </Link>
              {!isNew && <ShareButton stats={shareStats} className="bg-white/15 whitespace-nowrap backdrop-blur hover:bg-white/25" />}
            </div>
          </div>
        </div>
      </motion.section>

      {lastNav && (
        <Link to={lastNav.to} className="card card-hover flex items-center gap-3 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-400">
            <lastNav.icon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-muted">Continuar donde lo dejaste</span>
            <span className="block truncate font-display font-bold">{lastNav.label}</span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-muted" />
        </Link>
      )}

      <DailyPlanCard />

      {source === 'sample' && (
        <Card className="flex items-start gap-3 border-dashed p-4 sm:items-center">
          <Sparkles className="size-5 shrink-0 text-amber-500" />
          <p className="flex-1 text-sm text-muted">
            Estás usando <b className="text-[var(--text)]">{questions.length} preguntas de muestra</b>. El banco completo del ENURM aparecerá aquí automáticamente.
          </p>
        </Card>
      )}

      {isNew ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-bold">Primeros pasos</h2>
              <p className="text-sm text-muted">Cuatro cosas para arrancar con buen pie. Tus métricas aparecerán aquí en cuanto empieces.</p>
            </div>
            <span className="text-sm font-semibold text-muted tabular-nums">{stepsDone}/4</span>
          </div>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {firstSteps.map((f, i) => (
              <li key={f.title}>
                <Link to={f.to} className={cn('group flex h-full items-center gap-3 rounded-xl border p-3 transition-colors', f.done ? 'border-emerald-500/30 bg-emerald-500/[0.06]' : 'border-soft hover:border-brand-500/40 hover:bg-brand-500/[0.04]')}>
                  <span className={cn('grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold', f.done ? 'bg-emerald-600 text-white' : 'surface-2 text-muted')}>{f.done ? <Check className="size-4" /> : i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className={cn('text-sm font-semibold', f.done && 'text-muted line-through')}>{f.title}</div>
                    <div className="text-xs text-muted">{f.body}</div>
                  </div>
                  <f.icon className="size-4 shrink-0 text-muted transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400" />
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={<Flame className="size-5" />} label="Racha" value={`${streak} ${streak === 1 ? 'día' : 'días'}`} hint={streak ? 'No la rompas hoy' : 'Empieza una racha hoy'} color="#f97316" />
          <StatCard icon={<Target className="size-5" />} label="Precisión" value={`${Math.round(ov.accuracy * 100)}%`} hint={`${ov.correct} de ${ov.answered} correctas`} color="#06c4b0" delay={0.05} />
          <StatCard icon={<Layers className="size-5" />} label="Cobertura" value={`${Math.round(ov.coverage * 100)}%`} hint={`${ov.uniqueSeen} de ${questions.length} vistas`} color="#6366f1" delay={0.1} />
          <StatCard icon={<Sparkles className="size-5" />} label="Puntaje estimado" value={predicted === null ? '—' : `${predicted}%`} hint={predicted === null ? 'Responde 10+ preguntas' : 'Según tu rendimiento'} color="#ec4899" delay={0.15} />
        </div>
      )}

      <ExploreCard />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Acciones */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { to: '/repaso', icon: RotateCcw, title: 'Errores', value: failedCount, hint: failedCount ? 'pendientes de corregir' : 'sin errores pendientes', color: '#ef4444' },
              { to: '/flashcards', icon: Layers, title: 'Flashcards', value: dueCards, hint: `para hoy · ${newCards} nuevas`, color: '#8b5cf6' },
              { to: '/simulacro', icon: GraduationCap, title: 'Simulacros', value: exams.length, hint: exams[0] ? `último: ${pct(exams[0].correct, exams[0].total)}%` : 'aún sin simulacros', color: '#0ea5e9' },
            ].map((a, i) => (
              <motion.div key={a.to} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                <Link to={a.to} className="card card-hover group flex h-full flex-col p-3 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid size-9 place-items-center rounded-xl sm:size-10" style={{ backgroundColor: `${a.color}1a`, color: a.color }}>
                      <a.icon className="size-5" />
                    </span>
                    <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-1 max-sm:hidden" />
                  </div>
                  <div className="mt-3 font-display text-2xl font-bold sm:mt-4 sm:text-3xl">{a.value}</div>
                  <div className="text-xs leading-tight font-semibold sm:text-sm">{a.title}</div>
                  <div className="mt-0.5 text-xs text-muted max-sm:hidden">{a.hint}</div>
                </Link>
              </motion.div>
            ))}
          </div>

          {qotd && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Pregunta del día</h2>
                <span className="text-xs text-muted">{formatDate(Date.now(), { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              <QuestionCard
                question={qotd}
                mode="tutor"
                compact
                selected={qotdChoice}
                revealed={qotdChoice !== null}
                onSelect={(i) => {
                  if (qotdChoice !== null) return
                  setQotdChoice(i)
                  playSound(recordAnswer(qotd, i) ? 'correct' : 'wrong')
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display font-bold">Últimos 14 días</h2>
              <Link to="/estadisticas" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                Ver todo
              </Link>
            </div>
            <div className="relative h-36">
              {!hasActivity && (
                <div className="absolute inset-0 z-10 grid place-items-center px-6 text-center">
                  <div>
                    <ChartColumn className="mx-auto size-6 text-muted" />
                    <p className="mt-2 text-sm text-muted">Aún no hay actividad. Cada día que estudies aparecerá aquí.</p>
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dash-bar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06c4b0" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" hide={!hasActivity} tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} interval={2} />
                  <Tooltip cursor={{ fill: 'var(--surface-2)' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} formatter={(v) => [v, 'Preguntas']} />
                  <Bar dataKey="answered" fill="url(#dash-bar)" radius={[6, 6, 2, 2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <LingoCard />

          {!hasReminder() && <ReminderCard compact />}

          <Card className="p-5">
            <h2 className="mb-1 font-display font-bold">Para reforzar</h2>
            <p className="mb-4 text-xs text-muted">Tus especialidades con menor precisión.</p>
            {weak.length === 0 ? (
              <p className="text-sm text-muted">Responde algunas preguntas para ver recomendaciones personalizadas.</p>
            ) : (
              <ul className="space-y-3">
                {weak.map((w) => (
                  <li key={w.specialty}>
                    <button onClick={() => navigate(`/practica?specialty=${w.specialty}&auto=1`)} className="group flex w-full items-center gap-3 text-left">
                      <SpecialtyIcon id={w.specialty} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="truncate">{getSpecialty(w.specialty).name}</span>
                          <span className="text-muted">{Math.round(w.accuracy * 100)}%</span>
                        </div>
                        <ProgressBar value={w.accuracy} color={getSpecialty(w.specialty).color} className="mt-1.5" height="h-1.5" />
                      </div>
                      <ArrowRight className="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display font-bold">
                <Newspaper className="size-4 text-rose-500" /> Actualizaciones
              </h2>
              <Link to="/actualizaciones" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                Ver todas
              </Link>
            </div>
            <ul className="space-y-3">
              {UPDATES.slice(0, 3).map((u) => (
                <li key={u.id}>
                  <Link to={`/actualizaciones#${u.id}`} className="block rounded-xl p-2 -m-2 transition-colors hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.03]">
                    <div className="text-sm font-medium leading-snug">{u.title}</div>
                    <div className="mt-0.5 text-xs text-muted">{u.source}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
