import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Check, Clock, Gamepad2, GraduationCap, Info, Layers, Sparkles, Stethoscope, Target, UserRound } from 'lucide-react'
import type { Honorific, StudentRole, StudyMethod, StudyProfile } from '@/types'
import { useProgress } from '@/store/progress'
import { AREAS, RESIDENCIES } from '@/data/areas'
import { PHASES, phaseFor, resolveExamDate, specialtyPriorities, rotation, questionAdvice, DEFAULT_PROFILE } from '@/lib/plan'
import { getSpecialty } from '@/data/specialties'
import { Logo } from '@/components/ui/Logo'
import { Icon } from '@/components/ui/Icon'
import { Button, SpecialtyBadge } from '@/components/ui/primitives'
import { addressName, cn, splitName, daysBetween, formatMinutes, tintText } from '@/lib/utils'
import { revealPlan } from '@/components/PlanReveal'
import { useBank } from '@/store/bank'
import { StudyEvidence } from '@/components/StudyEvidence'
import { formatEnurmDate, upcomingEnurm } from '@/data/enurm'
import { UniversityPicker } from '@/components/UniversityPicker'
import { UNIVERSITY_NEEDS_NAME } from '@/data/universities'

const ROLES: { id: StudentRole; title: string; body: string }[] = [
  { id: 'estudiante', title: 'Estudiante de medicina', body: 'Aún cursando la carrera.' },
  { id: 'interno', title: 'Interno / pasante', body: 'En internado rotatorio o pasantía.' },
  { id: 'medico-general', title: 'Médico general', body: 'Ya ejerciendo.' },
  { id: 'egresado', title: 'Recién egresado', body: 'Terminé y me preparo a tiempo completo.' },
]

const METHODS: { id: StudyMethod; title: string; body: string; icon: typeof Target }[] = [
  { id: 'preguntas', title: 'Preguntas', body: 'Practicar con preguntas tipo examen', icon: Target },
  { id: 'flashcards', title: 'Flashcards', body: 'Memorizar con repetición espaciada', icon: Layers },
  { id: 'guias', title: 'Guías y resúmenes', body: 'Leer la teoría resumida', icon: BookOpen },
  { id: 'simulacros', title: 'Simulacros', body: 'Exámenes completos con tiempo', icon: GraduationCap },
  { id: 'juegos', title: 'Juegos', body: 'Aprender de forma más ligera', icon: Gamepad2 },
]

const WEEKDAYS = [
  { d: 1, l: 'Lun' },
  { d: 2, l: 'Mar' },
  { d: 3, l: 'Mié' },
  { d: 4, l: 'Jue' },
  { d: 5, l: 'Vie' },
  { d: 6, l: 'Sáb' },
  { d: 0, l: 'Dom' },
]

const TIMES = [30, 60, 90, 120, 180, 240]
const HONORIFICS: { id: Honorific; label: string }[] = [
  { id: 'dr', label: 'Dr.' },
  { id: 'dra', label: 'Dra.' },
  { id: 'lic', label: 'Lic.' },
  { id: 'est', label: 'Est.' },
  { id: 'none', label: 'N/A' },
]
const CONF_LABELS = { 1: 'Me cuesta', 2: 'Regular', 3: 'Lo domino' } as const

function OptionCard({ active, onClick, children, className, check = true }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string; check?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={active}
      className={cn('relative rounded-2xl border-2 p-4 text-left transition-all', active ? 'border-brand-500 bg-brand-500/[0.07] shadow-glow' : 'border-soft bg-[var(--surface)] hover:border-brand-500/40', className)}
    >
      {active && check && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2.5 right-2.5 grid size-5 place-items-center rounded-full bg-brand-500 text-white">
          <Check className="size-3" />
        </motion.span>
      )}
      {children}
    </motion.button>
  )
}

/** Lista con buscador de todas las universidades del país, más extranjera u otra. */
export default function Onboarding() {
  const navigate = useNavigate()
  const stored = useProgress((s) => s.profile)
  const settings = useProgress((s) => s.settings)
  const updateProfile = useProgress((s) => s.updateProfile)
  const updateSettings = useProgress((s) => s.updateSettings)
  const counts = useBank((s) => s.specialtyCounts)

  const [step, setStep] = useState(0)
  // Primera vez: solo lo esencial (fecha y tiempo). El resto se ofrece al final como «Afinar mi plan».
  const [fine, setFine] = useState(stored.completed)
  const [dir, setDir] = useState(1)
  const [name, setName] = useState(settings.name)
  const [honorific, setHonorific] = useState<Honorific | null>(settings.honorific ?? null)
  const upcoming = useMemo(() => upcomingEnurm(3), [])
  const [p, setP] = useState<StudyProfile>(() => ({ ...DEFAULT_PROFILE, ...stored, examYear: upcoming.some((e) => e.year === stored.examYear) ? stored.examYear : null }))
  const set = (patch: Partial<StudyProfile>) => setP((cur) => ({ ...cur, ...patch }))

  const target = resolveExamDate(p)
  const daysLeft = target.date ? daysBetween(new Date(), target.date) : null
  const phase = PHASES[phaseFor(daysLeft)]
  const priorities = useMemo(() => specialtyPriorities(p, [], counts), [p, counts])
  const firstWeek = useMemo(() => [...new Set(rotation(priorities, 7))].slice(0, 5), [priorities])
  const advice = useMemo(() => questionAdvice(p, priorities), [p, priorities])
  const questionsPerDay = advice.perDay

  const allSteps = [
    { key: 'hola', title: '¡Bienvenido a MedLogic!', subtitle: fine ? 'Responde unas preguntas rápidas y crearemos un plan de estudio diario hecho para ti.' : 'Solo 2 preguntas (menos de un minuto) y tendrás un plan diario hecho para ti. Sin presión: puedes cambiarlo cuando quieras.', valid: true },
    { key: 'rol', title: '¿En qué etapa estás?', subtitle: 'Así ajustamos el ritmo de tu plan.', valid: !!p.role },
    {
      key: 'universidad',
      title: '¿De qué universidad vienes?',
      subtitle: 'Con tu cuenta podrás ver en qué posición estás entre los estudiantes de tu universidad y del país.',
      valid: !!p.university && (!UNIVERSITY_NEEDS_NAME.has(p.university) || p.universityOther.trim().length > 1),
    },
    { key: 'fecha', title: '¿En qué convocatoria del ENURM te presentas?', subtitle: 'El plan cambia según el tiempo que te queda: de fundamentos a recta final.', valid: !!p.examYear },
    { key: 'residencia', title: '¿Qué residencia te gustaría hacer?', subtitle: 'Reforzaremos un poco más las áreas relacionadas.', valid: !!p.residency },
    { key: 'tiempo', title: '¿Cuánto tiempo puedes estudiar?', subtitle: 'Sé realista: un plan sostenible rinde más que uno ambicioso.', valid: p.studyDays.length > 0 },
    { key: 'nivel', title: '¿Cómo te sientes en cada área?', subtitle: 'Al principio priorizamos lo que te cuesta. Luego el plan se ajusta con tus resultados reales.', valid: AREAS.every((a) => p.confidence[a.id]) },
    { key: 'metodos', title: '¿Cómo te gusta estudiar?', subtitle: 'Elige todos los que quieras. Las preguntas siempre forman parte del plan.', valid: p.methods.length > 0 },
    { key: 'resumen', title: 'Tu plan está listo', subtitle: 'Puedes cambiar estas respuestas cuando quieras desde «Mi plan».', valid: true },
  ]
  const QUICK = ['hola', 'fecha', 'tiempo', 'resumen']
  const steps = fine ? allSteps : allSteps.filter((s) => QUICK.includes(s.key))
  const current = steps[step]

  const go = (delta: number) => {
    setDir(delta)
    setStep((s) => Math.max(0, Math.min(steps.length - 1, s + delta)))
  }

  /** Limpia lo escrito: sin título repetido (si lo escribió y no eligió trato, se usa ese) y con mayúscula inicial. */
  const tidy = () => {
    const { title, name: clean } = splitName(name)
    return { name: clean, honorific: honorific && honorific !== 'none' ? honorific : (title ?? honorific) }
  }
  const tidyName = () => {
    const t = tidy()
    setName(t.name)
    setHonorific(t.honorific)
  }

  const finish = () => {
    const methods: StudyMethod[] = p.methods.includes('preguntas') ? p.methods : ['preguntas', ...p.methods]
    updateProfile({ ...p, methods, completed: true, skipped: false })
    updateSettings({ ...tidy(), examDate: target.enurm?.iso ?? null, dailyGoal: questionsPerDay })
    const who = addressName(tidy())
    revealPlan(who ? `${who[0].toUpperCase()}${who.slice(1)}, tu camino al ENURM empieza hoy.` : 'Tu camino al ENURM empieza hoy.', () => navigate('/plan', { replace: true }))
  }

  const skip = () => {
    updateProfile({ skipped: true })
    navigate('/inicio', { replace: true })
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-mesh" />
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        {!stored.completed && (
          <button onClick={skip} className="text-sm font-medium text-muted hover:text-[var(--text)]">
            Omitir por ahora
          </button>
        )}
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <div className="flex gap-1.5">
          {steps.map((s, i) => (
            <div key={s.key} className="h-1.5 flex-1 overflow-hidden rounded-full surface-2">
              <motion.div className="h-full w-full origin-left rounded-full bg-brand-500" initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.4 }} />
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted">
          Paso {step + 1} de {steps.length}
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-32 sm:px-6">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.section key={current.key} custom={dir} initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }} transition={{ duration: 0.25 }}>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{current.title}</h1>
            <p className="mt-2 text-muted">{current.subtitle}</p>

            <div className="mt-8">
              {current.key === 'hola' && (
                <div className="space-y-6">
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="grid size-24 place-items-center rounded-3xl bg-brand-gradient text-white shadow-glow">
                    <Stethoscope className="size-12" />
                  </motion.div>
                  <div className="max-w-md">
                    <div className="text-sm font-medium" id="trato">¿Cómo quieres que te llamemos?</div>
                    <div className="mt-2 grid grid-cols-5 gap-2" role="radiogroup" aria-labelledby="trato">
                      {HONORIFICS.map((h) => (
                        <OptionCard key={h.id} active={honorific === h.id} onClick={() => setHonorific(h.id)} check={false} className="flex min-h-14 items-center justify-center px-2 py-3 text-center">
                          <span className="text-center text-sm font-semibold leading-tight">{h.label}</span>
                        </OptionCard>
                      ))}
                    </div>
                    <label className="mt-4 block">
                      <span className="text-sm font-medium">
                        Tu nombre o apellido <span className="font-normal text-muted">(opcional)</span>
                      </span>
                      <input value={name} onChange={(e) => setName(e.target.value)} onBlur={tidyName} placeholder="Ej.: Pichardo" autoComplete="family-name" className="mt-2 capitalize h-12 w-full rounded-xl border border-soft bg-[var(--surface)] px-4 outline-none focus:border-brand-500" />
                    </label>
                    {(honorific || name.trim()) && (
                      <p className="mt-3 text-sm text-muted">
                        Te saludaremos así: <b className="text-[var(--text)]">Buenos días{addressName({ name, honorific }) ? `, ${addressName({ name, honorific })}` : ''}</b>
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2 text-sm text-muted">
                    {['Plan diario con tareas concretas', 'Se adapta a tu fecha de examen y a tus resultados', fine ? 'Toma menos de 2 minutos' : 'Toma menos de un minuto'].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <Check className="size-4 text-brand-500" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {current.key === 'rol' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {ROLES.map((r) => (
                    <OptionCard key={r.id} active={p.role === r.id} onClick={() => set({ role: r.id })}>
                      <UserRound className="mb-3 size-6 text-brand-500" />
                      <div className="font-semibold">{r.title}</div>
                      <div className="text-sm text-muted">{r.body}</div>
                    </OptionCard>
                  ))}
                </div>
              )}

              {current.key === 'universidad' && <UniversityPicker value={p.university} other={p.universityOther} onChange={(university, universityOther) => set({ university, universityOther })} />}

              {current.key === 'fecha' && (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {upcoming.map((e) => {
                      const left = daysBetween(new Date(), e.date)
                      return (
                        <OptionCard key={e.year} active={p.examYear === e.year} onClick={() => set({ examYear: e.year, examMonth: 3 })}>
                          <div className="text-xs font-semibold tracking-wider text-muted uppercase">ENURM</div>
                          <div className="font-display text-2xl font-extrabold">{e.year}</div>
                          <div className="mt-1 text-sm font-medium first-letter:uppercase">{formatEnurmDate(e, { weekday: true })}</div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                            <span>Faltan {left} días</span>
                            <span aria-hidden>·</span>
                            <span className={e.confirmed ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}>{e.confirmed ? 'Fecha oficial' : 'Fecha proyectada'}</span>
                          </div>
                        </OptionCard>
                      )
                    })}
                  </div>
                  <div className="flex gap-3 rounded-2xl border border-soft bg-[var(--surface)] p-4 text-sm text-muted">
                    <Info className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-400" />
                    <p>
                      El ENURM se aplica una vez al año, el <b className="text-[var(--text)]">primer domingo de marzo</b>, en la UASD: así fue en 2024 (3 de marzo), 2025 (2 de marzo) y 2026 (1 de marzo). Por eso no tienes que indicar la fecha; solo elige en qué convocatoria te presentas. Si la convocatoria oficial anuncia otro día, actualizamos la fecha y tu plan se ajusta solo.
                    </p>
                  </div>
                  {daysLeft !== null && (
                    <motion.div key={daysLeft} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-2xl border border-soft bg-[var(--surface)] p-4">
                      <CalendarDays className="size-6 shrink-0" style={{ color: phase.color }} />
                      <div className="text-sm">
                        Faltan <b>{daysLeft} días</b>. Empezarás en la fase <b style={tintText(phase.color)}>{phase.name}</b>.
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {current.key === 'residencia' && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {RESIDENCIES.map((r) => (
                    <OptionCard key={r.id} active={p.residency === r.id} onClick={() => set({ residency: r.id })} className="p-3">
                      <div className="pr-5 text-sm font-semibold">{r.name}</div>
                    </OptionCard>
                  ))}
                </div>
              )}

              {current.key === 'tiempo' && (
                <div className="space-y-8">
                  <div>
                    <div className="mb-3 text-sm font-semibold">Días de estudio</div>
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                      {WEEKDAYS.map(({ d, l }) => {
                        const on = p.studyDays.includes(d)
                        return (
                          <motion.button key={d} whileTap={{ scale: 0.9 }} onClick={() => set({ studyDays: on ? p.studyDays.filter((x) => x !== d) : [...p.studyDays, d] })} className={cn('h-14 rounded-xl border-2 text-sm font-bold transition-all', on ? 'border-brand-500 bg-brand-500 text-white shadow-glow' : 'border-soft text-muted')}>
                            {l}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="mb-3 text-sm font-semibold">Tiempo por día</div>
                    <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3 lg:grid-cols-6">
                      {TIMES.map((t) => (
                        <OptionCard key={t} active={p.minutesPerDay === t} onClick={() => set({ minutesPerDay: t })} check={false} className="flex min-h-14 items-center justify-center gap-1.5 px-2 py-3">
                          <Clock className={cn('size-4 shrink-0', p.minutesPerDay === t ? 'text-brand-600 dark:text-brand-400' : 'text-muted')} />
                          <span className="font-display font-bold whitespace-nowrap">{formatMinutes(t)}</span>
                        </OptionCard>
                      ))}
                    </div>
                  </div>
                  <p className="rounded-xl surface-2 p-3 text-sm text-muted">
                    Total: <b className="text-[var(--text)]">{Math.round((p.studyDays.length * p.minutesPerDay) / 60)} horas por semana</b>. Los días sin estudio serán de descanso, con un repaso opcional de flashcards.
                  </p>
                </div>
              )}

              {current.key === 'nivel' && (
                <div className="space-y-3">
                  {AREAS.map((a) => (
                    <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-soft bg-[var(--surface)] p-4 sm:flex-row sm:items-center">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${a.color}1a`, color: a.color }}>
                        <Icon name={a.icon} className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold">{a.name}</div>
                        <div className="text-xs text-muted">{a.description}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {([1, 2, 3] as const).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => set({ confidence: { ...p.confidence, [a.id]: lvl } })}
                            className={cn(
                              'h-9 rounded-lg px-2 text-xs font-semibold transition-all',
                              p.confidence[a.id] === lvl ? (lvl === 1 ? 'bg-rose-500 text-white' : lvl === 2 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white') : 'surface-2 text-muted hover:text-[var(--text)]',
                            )}
                          >
                            {CONF_LABELS[lvl]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {current.key === 'metodos' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {METHODS.map((m) => {
                    const on = p.methods.includes(m.id)
                    return (
                      <OptionCard key={m.id} active={on} onClick={() => set({ methods: on ? p.methods.filter((x) => x !== m.id) : [...p.methods, m.id] })} className="flex items-center gap-4">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                          <m.icon className="size-5" />
                        </span>
                        <span>
                          <span className="block font-semibold">{m.title}</span>
                          <span className="block text-sm text-muted">{m.body}</span>
                        </span>
                      </OptionCard>
                    )
                  })}
                </div>
              )}

              {current.key === 'resumen' && (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-glow">
                    <Sparkles className="absolute top-5 right-5 size-6 text-white/60" />
                    <div className="text-sm text-white/80">{addressName({ name, honorific }) ? `${addressName({ name, honorific }).replace(/^./, (c) => c.toUpperCase())}, tu` : 'Tu'} punto de partida</div>
                    <div className="mt-1 font-display text-2xl font-extrabold">{phase.name}</div>
                    <p className="mt-1 max-w-md text-sm text-white/85">{phase.description}</p>
                    <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-white/15 p-3">
                        <div className="font-display text-xl font-bold">{daysLeft !== null && daysLeft >= 0 ? daysLeft : '—'}</div>
                        <div className="text-xs text-white/80">días</div>
                      </div>
                      <div className="rounded-xl bg-white/15 p-3">
                        <div className="font-display text-xl font-bold">{Math.round((p.studyDays.length * p.minutesPerDay) / 60)} h</div>
                        <div className="text-xs text-white/80">por semana</div>
                      </div>
                      <div className="rounded-xl bg-white/15 p-3">
                        <div className="font-display text-xl font-bold">≈ {questionsPerDay}</div>
                        <div className="text-xs text-white/80">preguntas/día</div>
                      </div>
                    </div>
                  </div>
                  <StudyEvidence advice={advice} minutesPerDay={p.minutesPerDay} />
                  <div className="rounded-2xl border border-soft bg-[var(--surface)] p-5">
                    <div className="text-sm font-semibold">Especialidades con más peso en tu primera semana</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {firstWeek.map((id) => (
                        <SpecialtyBadge key={id} id={id} />
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted">
                      Elegidas por su peso en el examen, tu autoevaluación{p.residency && p.residency !== 'otra' ? ` y tu interés en ${RESIDENCIES.find((r) => r.id === p.residency)?.name}` : ''}. A medida que respondas preguntas, el plan se basará en tu precisión real.
                    </p>
                  </div>
                  <ul className="grid gap-2 text-sm sm:grid-cols-2">
                    {[
                      `Preguntas de ${getSpecialty(firstWeek[0] ?? 'medicina-interna').short} y otra especialidad intercalada cada día`,
                      p.methods.includes('flashcards') ? 'Flashcards pendientes con repetición espaciada' : 'Repaso de tus errores',
                      p.methods.includes('guias') ? 'Una guía corta según el enfoque del día' : 'Perlas de alto rendimiento',
                      `Simulacro semanal de ${p.minutesPerDay < 60 ? Math.min(phase.examSize || 100, 50) : phase.examSize || 100} preguntas en condiciones de examen`,
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 rounded-xl surface-2 p-3">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand-500" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.section>
        </AnimatePresence>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-soft bg-[color-mix(in_oklab,var(--bg)_94%,transparent)] backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Button variant="ghost" onClick={() => (step === 0 ? navigate(-1) : go(-1))}>
            <ArrowLeft className="size-4" /> {step === 0 ? 'Volver' : 'Atrás'}
          </Button>
          {current.key === 'resumen' && !fine && (
            <Button
              variant="outline"
              onClick={() => {
                setFine(true)
                setDir(1)
                setStep(1)
              }}
            >
              Afinar mi plan
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button size="lg" onClick={() => go(1)} disabled={!current.valid}>
              {step === 0 ? 'Comenzar' : 'Continuar'} <ArrowRight className="size-5" />
            </Button>
          ) : (
            <Button size="lg" onClick={finish}>
              <Sparkles className="size-5" /> Crear mi plan
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
