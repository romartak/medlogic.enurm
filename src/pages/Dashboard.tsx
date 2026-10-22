import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, CalendarDays, Flame, GraduationCap, Layers, Newspaper, RotateCcw, Sparkles, Target, Trophy, Zap } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useProgress, levelFromXp, levelTitle } from '@/store/progress'
import { useBank } from '@/store/bank'
import { computeStreak, dailySeries, overview, predictedScore, specialtyStats, weakest } from '@/lib/stats'
import { Card, ProgressBar, Ring, SpecialtyIcon, StatCard } from '@/components/ui/primitives'
import { DailyPlanCard } from '@/components/DailyPlanCard'
import { QuestionCard } from '@/components/QuestionCard'
import { BUILTIN_CARDS } from '@/data/flashcards'
import { UPDATES } from '@/data/updates'
import { getSpecialty } from '@/data/specialties'
import { isDue } from '@/lib/srs'
import { dayKey, daysBetween, formatDate, hashString, pct } from '@/lib/utils'
import { playSound } from '@/lib/fx'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { attempts, activity, xp, settings, srs, customCards, exams } = useProgress()
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
  const allCards = [...BUILTIN_CARDS, ...customCards]
  const dueCards = allCards.filter((c) => srs[c.id] && isDue(srs[c.id])).length
  const newCards = allCards.filter((c) => !srs[c.id]).length
  const daysLeft = settings.examDate ? daysBetween(new Date(), new Date(settings.examDate + 'T00:00:00')) : null

  // Pregunta del día: determinista según la fecha.
  const qotd = useMemo(() => {
    if (!questions.length) return null
    const idx = parseInt(hashString(dayKey()), 36) % questions.length
    return questions[idx]
  }, [questions])
  const [qotdChoice, setQotdChoice] = useState<number | null>(null)

  const goalProgress = Math.min(1, ov.todayAnswered / Math.max(1, settings.dailyGoal))

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-glow sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute right-40 -bottom-28 size-60 rounded-full bg-fuchsia-400/20 blur-2xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{greeting()}{settings.name ? `, ${settings.name}` : ''} 👋</p>
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
                <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: `${lvl.progress * 100}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Ring value={goalProgress} size={132} stroke={11} color="#fff" track="rgb(255 255 255 / 0.22)">
              <div>
                <div className="font-display text-3xl font-extrabold">{ov.todayAnswered}</div>
                <div className="text-[11px] text-white/80">de {settings.dailyGoal} hoy</div>
              </div>
            </Ring>
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate('/practica?auto=1')} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold whitespace-nowrap text-slate-900 shadow-lg transition-transform hover:scale-[1.03] active:scale-95">
                <Zap className="size-4" /> Práctica rápida
              </button>
              <Link to="/simulacro" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/15 px-4 text-sm whitespace-nowrap font-semibold backdrop-blur transition-colors hover:bg-white/25">
                <GraduationCap className="size-4" /> Simulacro
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      <DailyPlanCard />

      {source === 'sample' && (
        <Card className="flex items-start gap-3 border-dashed p-4 sm:items-center">
          <Sparkles className="size-5 shrink-0 text-amber-500" />
          <p className="flex-1 text-sm text-muted">
            Estás usando <b className="text-[var(--text)]">preguntas de muestra</b> ({questions.length}). El banco completo con las preguntas de todos los años del ENURM se está preparando y aparecerá aquí automáticamente.
          </p>
        </Card>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={<Flame className="size-5" />} label="Racha" value={`${streak} ${streak === 1 ? 'día' : 'días'}`} hint={streak ? 'No la rompas hoy' : 'Empieza una racha hoy'} color="#f97316" />
        <StatCard icon={<Target className="size-5" />} label="Precisión" value={`${Math.round(ov.accuracy * 100)}%`} hint={`${ov.correct} de ${ov.answered} correctas`} color="#06c4b0" delay={0.05} />
        <StatCard icon={<Layers className="size-5" />} label="Cobertura del banco" value={`${Math.round(ov.coverage * 100)}%`} hint={`${ov.uniqueSeen} de ${questions.length} vistas`} color="#6366f1" delay={0.1} />
        <StatCard icon={<Sparkles className="size-5" />} label="Puntaje estimado" value={predicted === null ? '—' : `${predicted}%`} hint={predicted === null ? 'Responde 10+ preguntas' : 'Según tu rendimiento'} color="#ec4899" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Acciones */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { to: '/repaso', icon: RotateCcw, title: 'Repasar errores', value: failedCount, hint: failedCount ? 'pendientes de corregir' : 'sin errores pendientes', color: '#ef4444' },
              { to: '/flashcards', icon: Layers, title: 'Flashcards', value: dueCards, hint: `para hoy · ${newCards} nuevas`, color: '#8b5cf6' },
              { to: '/simulacro', icon: GraduationCap, title: 'Simulacros', value: exams.length, hint: exams[0] ? `último: ${pct(exams[0].correct, exams[0].total)}%` : 'aún sin simulacros', color: '#0ea5e9' },
            ].map((a, i) => (
              <motion.div key={a.to} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                <Link to={a.to} className="card card-hover group flex h-full flex-col p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl" style={{ backgroundColor: `${a.color}1a`, color: a.color }}>
                      <a.icon className="size-5" />
                    </span>
                    <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="mt-4 font-display text-3xl font-bold">{a.value}</div>
                  <div className="text-sm font-semibold">{a.title}</div>
                  <div className="text-xs text-muted">{a.hint}</div>
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
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dash-bar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06c4b0" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} interval={2} />
                  <Tooltip cursor={{ fill: 'var(--surface-2)' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} formatter={(v) => [v, 'Preguntas']} />
                  <Bar dataKey="answered" fill="url(#dash-bar)" radius={[6, 6, 2, 2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

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
