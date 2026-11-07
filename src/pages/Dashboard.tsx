import { LocalProgressCard } from '@/components/AccountNote'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Languages, BookOpen, Check, ChartColumn, GraduationCap, Layers, Newspaper, RotateCcw, Share2, Sparkles, Target, Timer } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useProgress, levelFromXp, levelTitle } from '@/store/progress'
import { resolveExamDate } from '@/lib/plan'
import { useBank } from '@/store/bank'
import { computeStreak, dailySeries, overview, predictedScore, specialtyStats, weakest } from '@/lib/stats'
import { Badge, Card, ProgressBar, SpecialtyIcon, StatCard } from '@/components/ui/primitives'
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
import { InstallCard } from '@/components/InstallCard'
import { StreakNudge } from '@/components/StreakNudge'
import { InterestCard } from '@/components/InterestCard'
import { TodayHero } from '@/components/TodayHero'
import { WeekCard } from '@/components/WeekCard'
import { ChallengeCard } from '@/components/ChallengeCard'
import { useChallenge } from '@/store/challenge'

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
function ShareButton({ stats, className, iconOnly = false }: { stats: ShareStats; className?: string; iconOnly?: boolean }) {
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
    <button
      onClick={go}
      disabled={busy}
      aria-label={iconOnly ? 'Compartir progreso' : undefined}
      className={cn('inline-flex h-11 items-center justify-center gap-2 text-sm font-semibold transition-colors disabled:opacity-60', iconOnly ? 'w-11 rounded-2xl' : 'rounded-xl px-4', className)}
    >
      <Share2 className={cn('size-4 shrink-0', busy && iconOnly && 'animate-pulse')} /> {!iconOnly && (busy ? 'Creando…' : 'Compartir progreso')}
    </button>
  )
}

/** Todo lo que se puede hacer, a la vista: un acceso grande por función, con una frase que dice para qué sirve. */
function FunctionsGrid() {
  const edition = currentEdition()
  const national = useNational((s) => s.attempts[edition])
  const tally = duelTally(useDuels((s) => s.duels))
  // Un color por función (no por categoría) para reconocerlas de un vistazo.
  const items: { to: string; color: string; hint?: string }[] = [
    { to: '/practica', color: '#0d9488', hint: 'Preguntas con explicación inmediata' },
    { to: '/simulacro', color: '#0284c7', hint: 'Examen cronometrado, con modo examen real' },
    { to: '/casos', color: '#7c3aed', hint: 'Decide paso a paso como en la guardia' },
    { to: '/flashcards', color: '#4f46e5', hint: 'Repetición espaciada para no olvidar' },
    { to: '/guias', color: '#d97706', hint: 'Resúmenes de alto rendimiento' },
    { to: '/temas-calientes', color: '#ea580c', hint: 'Lo que más se repite en el ENURM' },
    { to: '/terminologia', color: '#059669', hint: 'Términos médicos por partes' },
    { to: '/especialidades', color: '#db2777', hint: 'Un espacio por cada área del examen' },
    { to: '/simulacro-nacional', color: '#2563eb', hint: national ? `Hecho: ${pct(national.correct, national.total)} %` : `${editionLabel(edition)} · ${daysLeftInEdition()} días` },
    { to: '/ecg/monitor', color: '#dc2626', hint: 'Ritmos en vivo como en la emergencia' },
    { to: '/duelo', color: '#f97316', hint: tally.total ? `${tally.wins} ganados · ${tally.losses} perdidos` : 'Reta a un amigo' },
    { to: '/herramientas', color: '#475569', hint: 'Calculadoras y escalas clínicas' },
  ]
  return (
    <section aria-labelledby="funciones">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="funciones" className="font-display text-lg font-bold text-balance">
          Todo lo que puedes hacer
        </h2>
        <Link to="/banco" className="shrink-0 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
          Banco <span className="max-sm:hidden">de preguntas </span>→
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {items.map((it) => {
          const nav = ALL_NAV.find((n) => n.to === it.to)
          if (!nav) return null
          const color = it.color
          return (
            <li key={it.to}>
              <Link to={it.to} className="card card-hover group flex h-full flex-col gap-3 p-4">
                <span className="grid size-11 place-items-center rounded-2xl transition-transform group-hover:scale-105" style={{ backgroundColor: `${color}1f`, color }}>
                  <nav.icon className="size-6" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[15px] leading-tight font-bold">{nav.label}</span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-snug text-muted">{it.hint ?? nav.description}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { attempts, activity, xp, settings, exams, profile, guidesRead, streakFreeze: freeze } = useProgress()
  const cardTotals = useCardTotals()
  const activeChallenge = useChallenge((s) => s.active)
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const questions = useBank((s) => s.questions)
  const source = useBank((s) => s.source)
  const byId = useBank((s) => s.byId)

  const ov = overview(attempts, activity, questions.length)
  const streak = computeStreak(activity, new Date(), freeze.frozen)
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
  // Lo respondido hoy se lee del progreso guardado: así sigue respondida al volver de otra actividad.
  const qotdAttempt = qotd ? attempts[qotd.id] : undefined
  const qotdChoice = qotdAttempt && dayKey(qotdAttempt.lastAt) === dayKey() ? qotdAttempt.lastChoice : null

  const shareStats: ShareStats = { predicted, streak, accuracy: ov.accuracy, answered: ov.answered, level: lvl.level, levelTitle: levelTitle(lvl.level), daysLeft }

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
      <StreakNudge />
      <TodayHero
        greeting={`${greeting()}${addressName(settings) ? `, ${addressName(settings)}` : ''}`}
        goal={settings.dailyGoal}
        todayAnswered={ov.todayAnswered}
        accuracy={ov.answered ? ov.accuracy : null}
        streak={streak}
        freezes={freeze.available}
        daysLeft={daysLeft}
        level={lvl.level}
        levelTitle={levelTitle(lvl.level)}
        xpCurrent={lvl.current}
        xpNeeded={lvl.needed}
        xpProgress={lvl.progress}
        isNew={isNew}
        share={!isNew ? <ShareButton stats={shareStats} className="surface-2 hover:bg-brand-500/10" /> : undefined}
      />

      {/* Quien estudia sin cuenta: su progreso queda solo en este navegador */}
      <LocalProgressCard />

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

      <FunctionsGrid />

      <ChallengeCard challenge={activeChallenge} />

      <WeekCard />

      <InterestCard />

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
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatCard icon={<Layers className="size-5" />} label="Cobertura" value={`${Math.round(ov.coverage * 100)}%`} hint={`${ov.uniqueSeen} de ${questions.length} vistas`} color="#6366f1" delay={0.1} />
          <StatCard icon={<Sparkles className="size-5" />} label="Puntaje estimado" value={predicted === null ? '—' : `${predicted}%`} hint={predicted === null ? 'Responde 10+ preguntas' : 'Según tu rendimiento'} color="#ec4899" delay={0.15} />
        </div>
      )}

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
                {qotdChoice !== null ? (
                  <Badge color="#10b981">
                    <Check className="size-3" /> Respondida hoy
                  </Badge>
                ) : (
                  <span className="text-xs text-muted">{formatDate(Date.now(), { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                )}
              </div>
              <QuestionCard
                question={qotd}
                mode="tutor"
                compact
                selected={qotdChoice}
                revealed={qotdChoice !== null}
                onSelect={(i) => {
                  if (qotdChoice !== null) return
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
                      <stop offset="0%" stopColor="#12b8a6" />
                      <stop offset="100%" stopColor="#066a60" />
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

          <InstallCard />

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
