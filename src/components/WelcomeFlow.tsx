import { useEffect, useId, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, GraduationCap, UserRound, X } from 'lucide-react'
import type { Honorific } from '@/types'
import { useWelcome } from '@/store/welcome'
import { useProgress } from '@/store/progress'
import { displayName, useAuth } from '@/store/auth'
import { AnimatedLogoMark } from '@/components/ui/Logo'
import { Shape, SHAPES, revealPlan } from '@/components/PlanReveal'
import { UniversityPicker } from '@/components/UniversityPicker'
import { Button } from '@/components/ui/primitives'
import { saveProfile } from '@/lib/account'
import { motionAllowed } from '@/lib/fx'
import { googleIdentity } from '@/lib/oauth'
import { welcomeSteps, type WelcomeStep } from '@/lib/welcome'
import { formatEnurmDate, upcomingEnurm } from '@/data/enurm'
import { UNIVERSITY_NEEDS_NAME } from '@/data/universities'
import { useScrollLock } from '@/hooks/useScrollLock'
import { addressName, cn, splitName } from '@/lib/utils'

const HONORIFICS: { id: Honorific; label: string }[] = [
  { id: 'dr', label: 'Dr.' },
  { id: 'dra', label: 'Dra.' },
  { id: 'lic', label: 'Lic.' },
  { id: 'est', label: 'Est.' },
  { id: 'none', label: 'Sin título' },
]

/** Cómo saludar: «Dra. Ana», o el nombre que vino de Google o del correo. */
function useGreeting(): string {
  const settings = useProgress((s) => s.settings)
  const user = useAuth((s) => s.user)
  return addressName(settings) || googleIdentity(user).first || displayName(user)
}

/** El logo que se dibuja, ondas y formas que salen disparadas: la misma entrada de la pantalla «Ábrelo en Safari». */
function BrandBurst({ delay = 0, className }: { delay?: number; className?: string }) {
  const animate = motionAllowed()
  return (
    <div className="relative grid place-items-center" aria-hidden>
      {animate &&
        [0, 1, 2].map((i) => (
          <motion.span key={i} className="absolute size-24 rounded-full border-2" style={{ borderColor: i === 1 ? '#6366f1' : '#0ba595' }} initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: [0.3, 2.8], opacity: [0, 0.7, 0] }} transition={{ duration: 1.1, delay: delay + 0.35 + i * 0.14, ease: 'easeOut' }} />
        ))}
      {animate &&
        SHAPES.map((s, i) => (
          <motion.span
            key={i}
            className="absolute"
            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
            animate={{ x: [0, s.x * 0.8, s.x * 0.9], y: [0, s.y * 0.8, s.y * 0.9 + 12], scale: [0, 1, 0.9], rotate: s.rotate, opacity: [1, 1, 0] }}
            transition={{ duration: 1.5, times: [0, 0.45, 1], delay: delay + 0.37 + (i % 4) * 0.03, ease: [0.16, 1, 0.3, 1] }}
          >
            <Shape kind={s.kind} color={s.color} size={s.size} />
          </motion.span>
        ))}
      <motion.div initial={animate ? { scale: 0, rotate: -120 } : false} animate={{ scale: animate ? [0, 1.18, 1] : 1, rotate: 0 }} transition={{ duration: 0.75, delay, ease: [0.34, 1.56, 0.64, 1] }}>
        <AnimatedLogoMark delay={delay + 0.3} className={cn('size-24 drop-shadow-[0_18px_40px_rgba(13,148,136,0.35)]', className)} />
      </motion.div>
    </div>
  )
}

const FRAME = 'fixed inset-0 z-[95] overflow-y-auto bg-[var(--bg)]'
const GLOW = 'pointer-events-none fixed inset-0 bg-[radial-gradient(520px_circle_at_50%_30%,rgba(20,184,166,0.16),transparent_62%),radial-gradient(460px_circle_at_60%_70%,rgba(99,102,241,0.10),transparent_60%)]'

/** Saludo breve al volver a entrar: la marca se dibuja y se pasa solo al panel. */
function WelcomeBack({ onClose }: { onClose: () => void }) {
  const who = useGreeting()
  useEffect(() => {
    const t = setTimeout(onClose, motionAllowed() ? 2300 : 900)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <motion.div className={cn(FRAME, 'grid place-items-center')} role="status" aria-live="polite" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }}>
      <div className={GLOW} />
      <div className="relative px-6 text-center">
        <div className="grid place-items-center">
          <BrandBurst />
        </div>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mt-8 font-display text-3xl font-extrabold tracking-tight text-balance">
          {who ? `¡Hola de nuevo, ${who}!` : '¡Hola de nuevo!'}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.5 }} className="mt-2 text-muted">
          Tu progreso está al día.
        </motion.p>
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.1, duration: 1.1, ease: 'easeInOut' }} className="mx-auto mt-6 h-1 w-28 origin-left rounded-full bg-brand-500" />
      </div>
    </motion.div>
  )
}

/** Cuenta nueva: animación de bienvenida y un cuestionario corto con lo que falta del perfil. */
function NewAccount({ onClose }: { onClose: () => void }) {
  const titleId = useId()
  useScrollLock(true)
  const user = useAuth((s) => s.user)
  const who = useGreeting()
  const upcoming = useMemo(() => upcomingEnurm(3), [])
  const [steps] = useState<WelcomeStep[]>(() => welcomeSteps(useProgress.getState().profile))
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const [name, setName] = useState(() => useProgress.getState().settings.name)
  const [honorific, setHonorific] = useState<Honorific>(() => useProgress.getState().settings.honorific ?? 'none')
  const [examYear, setExamYear] = useState<number | null>(() => useProgress.getState().profile.examYear)
  const [university, setUniversity] = useState<string | null>(() => useProgress.getState().profile.university)
  const [universityOther, setUniversityOther] = useState(() => useProgress.getState().profile.universityOther)
  const step = steps[i]
  const last = i === steps.length - 1
  const fromGoogle = (user?.app_metadata as { provider?: string } | undefined)?.provider === 'google'
  const questions = steps.length - 1

  const typed = splitName(name)
  const preview = addressName({ name, honorific })
  const valid = step !== 'university' || !university || !UNIVERSITY_NEEDS_NAME.has(university) || universityOther.trim().length > 1

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const go = (to: number) => {
    setDir(to > i ? 1 : -1)
    setI(to)
  }

  const finish = () => {
    const profile = useProgress.getState()
    // Primero lo local (queda guardado al instante); saveProfile lo lleva a la cuenta, al perfil y al ranking.
    if (examYear != null && examYear !== profile.profile.examYear) profile.updateProfile({ examYear, examMonth: 3 })
    void saveProfile({ name, honorific, university, universityOther })
    const call = addressName({ name: typed.name, honorific })
    revealPlan(call ? `Vamos a estudiar, ${call}` : 'Empecemos a estudiar', onClose, '¡Todo listo!')
  }

  const next = () => (last ? finish() : go(i + 1))

  return (
    <motion.div className={FRAME} role="dialog" aria-modal="true" aria-labelledby={titleId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
      <div className={GLOW} />
      <div className="relative mx-auto flex min-h-full max-w-md flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <header className="flex h-11 items-center justify-between">
          <div className="flex items-center gap-1.5" aria-label={step === 'intro' ? 'Bienvenida' : `Pregunta ${i} de ${questions}`}>
            {step !== 'intro' &&
              Array.from({ length: questions }, (_, k) => (
                <span key={k} className={cn('h-1.5 rounded-full transition-all duration-300', k < i ? 'w-6 bg-brand-500' : 'w-1.5 bg-slate-300 dark:bg-slate-600', k === i - 1 && 'w-6')} />
              ))}
          </div>
          <button type="button" onClick={onClose} className="relative inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-medium text-muted after:absolute after:-inset-1 hover:text-[var(--text)]">
            Saltar <X className="size-4" />
          </button>
        </header>

        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.main
            key={step}
            custom={dir}
            variants={{ in: (d: number) => ({ opacity: 0, x: d * 28 }), show: { opacity: 1, x: 0 }, out: (d: number) => ({ opacity: 0, x: d * -28 }) }}
            initial="in"
            animate="show"
            exit="out"
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-1 flex-col justify-center py-6"
          >
            {step === 'intro' && (
              <div className="text-center">
                <div className="grid place-items-center">
                  <BrandBurst />
                </div>
                <motion.h2 id={titleId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mt-8 font-display text-3xl font-extrabold tracking-tight text-balance">
                  {who ? `¡Te damos la bienvenida, ${who}!` : '¡Te damos la bienvenida!'}
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.5 }} className="mt-3 text-pretty text-muted">
                  Tu cuenta gratis está lista{fromGoogle ? ' con tu cuenta de Google' : ''}. {questions === 1 ? 'Una pregunta rápida' : `${questions} preguntas rápidas`} y dejamos MedLogic a tu medida.
                </motion.p>
                {user?.email && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.25 }} className="mt-2 truncate text-sm text-muted">
                    {user.email}
                  </motion.p>
                )}
              </div>
            )}

            {step === 'name' && (
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
                  <UserRound className="size-6" />
                </span>
                <h2 id={titleId} className="mt-4 font-display text-2xl font-extrabold tracking-tight text-balance">
                  ¿Cómo quieres que te llamemos?
                </h2>
                <p className="mt-2 text-sm text-muted">{fromGoogle ? 'Tomamos tu nombre de Google. Cámbialo si prefieres otro.' : 'Así te saludaremos en la plataforma.'}</p>
                <div role="radiogroup" aria-label="Trato" className="mt-5 flex flex-wrap gap-2">
                  {HONORIFICS.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      role="radio"
                      aria-checked={honorific === h.id}
                      onClick={() => setHonorific(h.id)}
                      className={cn('h-11 rounded-full border px-4 text-sm font-medium transition-colors', honorific === h.id ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-soft surface-2 text-muted hover:text-[var(--text)]')}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
                <label className="mt-4 block text-sm font-medium" htmlFor="welcome-nombre">
                  Tu nombre o apellido
                  <input
                    id="welcome-nombre"
                    name="apodo"
                    maxLength={60}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => {
                      const t = splitName(name)
                      setName(t.name)
                      if (t.title && honorific === 'none') setHonorific(t.title)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), next())}
                    autoComplete="off"
                    autoCapitalize="words"
                    spellCheck={false}
                    enterKeyHint="next"
                    data-form-type="other"
                    data-lpignore="true"
                    placeholder="Escribe tu nombre o tu apellido"
                    className="mt-1.5 h-12 w-full rounded-xl border border-soft surface-2 px-4 outline-none transition-colors focus:border-brand-500"
                  />
                </label>
                <p className="mt-3 text-sm text-muted" aria-live="polite">
                  Te saludaremos como: <b className="text-[var(--text)]">{preview ? preview.charAt(0).toUpperCase() + preview.slice(1) : 'sin nombre'}</b>
                </p>
              </div>
            )}

            {step === 'exam' && (
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
                  <CalendarDays className="size-6" />
                </span>
                <h2 id={titleId} className="mt-4 font-display text-2xl font-extrabold tracking-tight text-balance">
                  ¿En qué convocatoria del ENURM te presentas?
                </h2>
                <p className="mt-2 text-sm text-muted">Con esto ajustamos tu plan: más fundamentos si falta tiempo, más repaso si ya está cerca.</p>
                <div role="radiogroup" aria-label="Convocatoria" className="mt-5 space-y-2">
                  {upcoming.map((e) => (
                    <button
                      key={e.year}
                      type="button"
                      role="radio"
                      aria-checked={examYear === e.year}
                      onClick={() => setExamYear(e.year)}
                      className={cn('flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-colors', examYear === e.year ? 'border-brand-500 bg-brand-500/[0.07]' : 'border-soft bg-[var(--surface)] hover:border-brand-500/40')}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">ENURM {e.year}</span>
                        <span className="block text-sm text-muted">{formatEnurmDate(e)}</span>
                      </span>
                      {examYear === e.year && <Check className="size-5 shrink-0 text-brand-600 dark:text-brand-400" />}
                    </button>
                  ))}
                  <button type="button" role="radio" aria-checked={examYear === null} onClick={() => setExamYear(null)} className={cn('flex w-full items-center rounded-2xl border-2 px-4 py-3.5 text-left font-medium transition-colors', examYear === null ? 'border-brand-500 bg-brand-500/[0.07]' : 'border-soft bg-[var(--surface)] text-muted hover:border-brand-500/40')}>
                    Todavía no lo sé
                  </button>
                </div>
              </div>
            )}

            {step === 'university' && (
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
                  <GraduationCap className="size-6" />
                </span>
                <h2 id={titleId} className="mt-4 font-display text-2xl font-extrabold tracking-tight text-balance">
                  ¿De qué universidad vienes?
                </h2>
                <p className="mt-2 text-sm text-muted">Es opcional. Sirve para el ranking por universidad.</p>
                <div className="mt-4 max-h-[44vh] overflow-y-auto pr-1">
                  <UniversityPicker
                    value={university}
                    other={universityOther}
                    onChange={(id, other) => {
                      setUniversity(id)
                      setUniversityOther(other)
                    }}
                  />
                </div>
              </div>
            )}
          </motion.main>
        </AnimatePresence>

        <footer className="flex items-center gap-2">
          {i > 1 && (
            <Button variant="ghost" size="lg" onClick={() => go(i - 1)} aria-label="Atrás">
              <ArrowLeft className="size-5" />
            </Button>
          )}
          <Button size="lg" className="min-w-0 flex-1" onClick={next} disabled={!valid}>
            {step === 'intro' ? 'Empezar' : last ? 'Terminar' : 'Continuar'} {!last || step === 'intro' ? <ArrowRight className="size-5" /> : <Check className="size-5" />}
          </Button>
        </footer>
      </div>
    </motion.div>
  )
}

/** Se monta una vez en la app: muestra la bienvenida que pida el resto del código con useWelcome. */
export function WelcomeFlow() {
  const kind = useWelcome((s) => s.kind)
  const close = useWelcome((s) => s.close)
  return <AnimatePresence>{kind === 'new' ? <NewAccount key="new" onClose={close} /> : kind === 'back' ? <WelcomeBack key="back" onClose={close} /> : null}</AnimatePresence>
}
