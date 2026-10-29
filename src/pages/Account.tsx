import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { CloudOff, Cloud, Eye, EyeOff, KeyRound, Laptop, Mail, RefreshCw, ShieldCheck, Smartphone, UserRound } from 'lucide-react'
import { authErrorMessage, authRedirectUrl, isSupabaseConfigured, supabase } from '@/lib/supabase'
import { useAuth } from '@/store/auth'
import { Button, Card, PageHeader, Segmented } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { hadAccount, markHadAccount, takeNotice } from '@/lib/account'
import { useProgress } from '@/store/progress'
import type { Honorific } from '@/types'
import { toast } from '@/store/toasts'
import { addressName, cleanName, cn, splitName } from '@/lib/utils'
import { captchaEnabled, Turnstile } from '@/components/Turnstile'
import { CONTACT_EMAIL } from '@/components/AccountSection'

const RECOVERY_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Olvidé mi contraseña de MedLogic ENURM')}&body=${encodeURIComponent('Hola, olvidé mi contraseña. Mi cuenta es este correo.')}`

/**
 * La cuenta se pide al entrar a una sección concreta. El mensaje sigue esa intención («venías al
 * simulacro») en vez de hablar siempre en abstracto de «guardar el progreso»: menos gente se va.
 */
function intentCopy(from?: string) {
  const path = (from ?? '').split('?')[0]
  if (path.startsWith('/simulacro'))
    return {
      subtitle: 'Crea tu cuenta gratis y haz tu simulacro: 100 preguntas con cronómetro y resultados por especialidad.',
      modal: 'Tu simulacro te espera. Crea tu cuenta gratis y guardamos tus respuestas y tus resultados mientras lo haces.',
    }
  if (path.startsWith('/practica'))
    return {
      subtitle: 'Crea tu cuenta gratis y practica con el análisis de cada opción: por qué la correcta lo es y por qué las demás no.',
      modal: 'Tu práctica te espera. Crea tu cuenta gratis y guardamos cada pregunta que respondas, con su explicación.',
    }
  if (path.startsWith('/plan') || path.startsWith('/bienvenida'))
    return {
      subtitle: 'Crea tu cuenta gratis y empieza tu plan diario: tareas concretas hasta el día del ENURM.',
      modal: 'Tu plan te espera. Crea tu cuenta gratis y lo guardamos para que lo sigas desde cualquier dispositivo.',
    }
  if (path.startsWith('/flashcards') || path.startsWith('/repaso'))
    return {
      subtitle: 'Crea tu cuenta gratis y guarda tus flashcards y tus errores para repasarlos justo antes de olvidarlos.',
      modal: 'Tus flashcards te esperan. Crea tu cuenta gratis y tu repaso espaciado te sigue a cualquier dispositivo.',
    }
  return null
}

/** Tratamientos del cuestionario. Al registrarse solo se preguntan si la persona no los puso allí. */
const TREATMENTS: { value: Honorific; label: string }[] = [
  { value: 'dr', label: 'Dr.' },
  { value: 'dra', label: 'Dra.' },
  { value: 'lic', label: 'Lic.' },
  { value: 'est', label: 'Est.' },
  { value: 'none', label: 'N/A' },
]

/** El acceso con Google se activa cuando ya esté listo en Google Cloud y Supabase; hasta entonces solo correo y contraseña. */
const GOOGLE_LOGIN_ENABLED = false

const field = 'mt-1.5 h-12 w-full rounded-xl border border-soft surface-2 px-4 outline-none transition-colors focus:border-brand-500'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.9l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  )
}

function PasswordInput({ value, onChange, autoComplete, id, name }: { value: string; onChange: (v: string) => void; autoComplete: string; id: string; name: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input id={id} name={name} type={show ? 'text' : 'password'} required minLength={8} maxLength={72} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} className={cn(field, 'pr-12')} />
      <button type="button" onClick={() => setShow(!show)} className="absolute top-1.5 right-1 grid size-12 place-items-center text-muted hover:text-[var(--text)]" aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
        {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  )
}

/* ---------- Sin Supabase configurado ---------- */

function NotConfigured() {
  return (
    <Card className="mx-auto max-w-xl p-6 text-center sm:p-8">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl surface-2 text-muted">
        <CloudOff className="size-7" />
      </div>
      <h2 className="mt-4 font-display text-xl font-bold">Las cuentas aún no están activadas aquí</h2>
      <p className="mt-2 text-sm text-muted">
        Esta versión de prueba guarda todo en tu navegador. Cuando la página esté publicada con su base de datos podrás crear tu cuenta y estudiar desde cualquier dispositivo sin perder nada.
      </p>
      <p className="mt-4 text-sm text-muted">
        Mientras tanto, desde{' '}
        <Link to="/ajustes" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">
          Configuración
        </Link>{' '}
        puedes descargar una copia de tu progreso.
      </p>
    </Card>
  )
}

/* ---------- Acceso ---------- */

type Mode = 'signin' | 'signup'

function AuthForm({ from, initialMode }: { from?: string; initialMode?: Mode }) {
  const intent = intentCopy(from)
  // Quien llega por primera vez desde el cuestionario del plan abre «Crear cuenta»; quien ya tuvo cuenta, «Iniciar sesión».
  const [mode, setMode] = useState<Mode>(initialMode ?? (!hadAccount() ? 'signup' : 'signin'))
  const [nudge, setNudge] = useState(!!from)
  // Mensaje de una sola vez tras cerrar sesión o borrar la cuenta (no se abre el aviso de «crear cuenta»).
  const [notice] = useState(takeNotice)
  const settings = useProgress((s) => s.settings)
  const updateSettings = useProgress((s) => s.updateSettings)
  // Lo que ya respondió en el cuestionario no se vuelve a preguntar.
  const answered = settings.honorific !== null || settings.name.trim() !== ''
  const [treatment, setTreatment] = useState<Honorific>('none')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState<null | { title: string; body: string }>(null)
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaRound, setCaptchaRound] = useState(0)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    if (mode === 'signup' && password !== password2) return setError('Las contraseñas no coinciden.')
    if (captchaEnabled && !captchaToken) return setError('Espera a que termine la verificación anti-robots.')
    const captcha = captchaEnabled ? { captchaToken } : {}
    setBusy(true)
    setError('')
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password, options: captcha })
        if (error) throw error
        toast({ kind: 'success', title: 'Sesión iniciada' })
      } else if (mode === 'signup') {
        const typed = splitName(answered ? settings.name : name)
        const chosen = answered ? settings.honorific : treatment
        const honorific = chosen && chosen !== 'none' ? chosen : (typed.title ?? chosen)
        const callName = typed.name.slice(0, 60)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: addressName({ name: callName, honorific }), call_name: callName, treatment: honorific }, emailRedirectTo: authRedirectUrl(), ...captcha },
        })
        if (error) throw error
        if (!answered) updateSettings({ name: callName, honorific })
        if (!data.session) setSent({ title: 'Confirma tu correo', body: `Te enviamos un enlace a ${email}. Ábrelo desde este dispositivo para activar tu cuenta.` })
        else toast({ kind: 'success', title: '¡Cuenta creada!' })
      }
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
      // Cada token de verificación sirve una sola vez.
      if (captchaEnabled) {
        setCaptchaToken('')
        setCaptchaRound((r) => r + 1)
      }
    }
  }

  const google = async () => {
    if (!supabase) return
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: authRedirectUrl() } })
    if (error) setError(authErrorMessage(error))
  }

  if (sent)
    return (
      <Card className="mx-auto max-w-md p-6 text-center sm:p-8">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
          <Mail className="size-7" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold">{sent.title}</h2>
        <p className="mt-2 text-sm text-muted">{sent.body}</p>
        <Button variant="outline" className="mt-6" onClick={() => (setSent(null), setMode('signin'))}>
          Volver
        </Button>
      </Card>
    )

  const titles: Record<Mode, string> = { signin: 'Inicia sesión', signup: 'Crea tu cuenta gratis' }

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1fr_440px]">
      <Modal open={nudge && !busy} onClose={() => setNudge(false)} title="Guarda tu plan y tu progreso" className="sm:max-w-md">
        <div className="-mt-1 space-y-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
            <Cloud className="size-7" />
          </div>
          <p className="text-sm text-muted">
            {intent?.modal ?? 'Crea tu cuenta gratis con tu correo. Así tu plan y todo lo que respondas se guardan en la nube desde el primer momento y no se pierden, aunque cambies de teléfono.'}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button size="lg" className="sm:flex-1" onClick={() => (setMode('signup'), setNudge(false))}>
              Crear mi cuenta
            </Button>
            <Button size="lg" variant="outline" className="sm:flex-1" onClick={() => (setMode('signin'), setNudge(false))}>
              Ya tengo cuenta
            </Button>
          </div>
        </div>
      </Modal>
      <div className="order-last lg:order-first lg:pt-6">
        <h2 className="font-display text-2xl font-bold">Tu progreso, en todos tus dispositivos</h2>
        <p className="mt-2 text-muted">La cuenta es gratis y opcional. Sin ella todo funciona, pero tu progreso solo se guarda en este navegador. Con ella se guarda en la nube y es el mismo en todos tus dispositivos.</p>
        <ul className="mt-6 space-y-4">
          {[
            [Smartphone, 'Empieza en el teléfono, sigue en la computadora', 'Preguntas, flashcards, plan y terminología se sincronizan solos.'],
            [ShieldCheck, 'Tus datos son solo tuyos', 'Cada cuenta solo puede leer su propio progreso. No vendemos ni compartimos nada.'],
            [Laptop, 'Nada se pierde', 'Si borras el navegador o cambias de teléfono, tu progreso te espera en la nube.'],
          ].map(([I, title, body]) => {
            const Ico = I as typeof Smartphone
            return (
              <li key={title as string} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
                  <Ico className="size-5" />
                </span>
                <div>
                  <div className="font-semibold">{title as string}</div>
                  <div className="text-sm text-muted">{body as string}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <Card className="p-6 sm:p-8">
        <Segmented
          value={mode}
          onChange={(m) => (setMode(m), setError(''))}
          className="mb-6 grid w-full grid-cols-2"
          options={[
            { value: 'signin', label: 'Iniciar sesión' },
            { value: 'signup', label: 'Crear cuenta' },
          ]}
        />
        {notice && (
          <p role="status" className="mb-4 rounded-xl bg-brand-500/10 px-4 py-3 text-sm">
            {notice === 'deleted' ? 'Tu cuenta fue eliminada. Gracias por haber estudiado con MedLogic.' : 'Cerraste sesión. Tu progreso quedó guardado en tu cuenta y este dispositivo quedó limpio.'}
          </p>
        )}
        <h2 className="font-display text-xl font-bold">{titles[mode]}</h2>

        {GOOGLE_LOGIN_ENABLED && (
          <>
            <Button variant="outline" size="lg" className="mt-5 w-full" onClick={google}>
              <GoogleIcon className="size-5" /> Continuar con Google
            </Button>
            <div className="my-5 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-[var(--border)]" /> o con tu correo <span className="h-px flex-1 bg-[var(--border)]" />
            </div>
          </>
        )}

        <form onSubmit={submit} className={cn('space-y-4', !GOOGLE_LOGIN_ENABLED && 'mt-5')}>
          {mode === 'signup' && answered && (
            <div className="flex items-center gap-3 rounded-2xl border border-brand-500/25 bg-brand-500/10 px-4 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-gradient font-display font-bold text-white">{(cleanName(settings.name) || addressName(settings) || '·').charAt(0).toUpperCase()}</span>
              <div className="min-w-0 text-sm">
                <div className="truncate font-display text-base font-bold">{addressName(settings) || 'Tu perfil del cuestionario'}</div>
                <div className="text-muted">Guardaremos tu plan y tu progreso.</div>
              </div>
            </div>
          )}
          {mode === 'signup' && !answered && (
            <>
              <fieldset>
                <legend className="text-sm font-medium">¿Cómo prefieres que te llamemos?</legend>
                <div role="radiogroup" className="mt-2 flex flex-wrap gap-2">
                  {TREATMENTS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      role="radio"
                      aria-checked={treatment === t.value}
                      onClick={() => setTreatment(t.value)}
                      className={cn(
                        'h-10 rounded-full border px-4 text-sm font-medium transition-colors',
                        treatment === t.value ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-soft surface-2 text-muted hover:text-[var(--text)]',
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block text-sm font-medium" htmlFor="acc-apodo">
                Tu nombre o apellido <span className="font-normal text-muted">(opcional)</span>
                {/* Sin «name» en id/name y con autocomplete="off": así el iPhone no ofrece tarjetas ni contactos aquí. */}
                <input id="acc-apodo" name="apodo" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} onBlur={() => {
                    const t = splitName(name)
                    setName(t.name)
                    if (t.title && treatment === 'none') setTreatment(t.title)
                  }} autoComplete="off" autoCorrect="off" autoCapitalize="words" spellCheck={false} enterKeyHint="next" data-form-type="other" data-lpignore="true" placeholder="Escribe tu nombre o tu apellido" className={field} />
              </label>
            </>
          )}
          <label className="block text-sm font-medium" htmlFor="acc-email">
            Correo electrónico
            <input id="acc-email" name="email" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" className={field} />
          </label>
          <div>
            <label htmlFor="acc-pass" className="text-sm font-medium">
              Contraseña
            </label>
            <PasswordInput id="acc-pass" name="password" value={password} onChange={setPassword} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
            {mode === 'signup' && <p className="mt-1.5 text-xs text-muted">Mínimo 8 caracteres.</p>}
          </div>
          {mode === 'signup' && (
            <div>
              <label htmlFor="acc-pass2" className="text-sm font-medium">
                Repite la contraseña
              </label>
              <PasswordInput id="acc-pass2" name="password-confirm" value={password2} onChange={setPassword2} autoComplete="new-password" />
            </div>
          )}

          <Turnstile onToken={setCaptchaToken} round={captchaRound} />

          {error && (
            <p role="alert" className="rounded-xl bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy && <RefreshCw className="size-4 animate-spin" />}
            {mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </Button>
          {mode === 'signup' && <p className="text-center text-xs text-muted">Gratis para siempre · sin anuncios · sin tarjeta</p>}
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Al continuar aceptas los{' '}
          <a href={`${import.meta.env.BASE_URL}terminos/`} className="font-semibold underline">
            Términos
          </a>{' '}
          y la{' '}
          <a href={`${import.meta.env.BASE_URL}privacidad/`} className="font-semibold underline">
            Política de privacidad
          </a>
          .
        </p>

        {mode === 'signin' && (
          <p className="mt-5 text-center text-sm text-muted">
            ¿Olvidaste tu contraseña?{' '}
            <a href={RECOVERY_MAILTO} className="font-semibold text-brand-700 hover:underline dark:text-brand-400">
              Escríbenos a {CONTACT_EMAIL}
            </a>{' '}
            desde el correo de tu cuenta y te ayudamos.
          </p>
        )}
      </Card>
    </div>
  )
}

/* ---------- Nueva contraseña (tras el enlace de recuperación) ---------- */

function NewPassword() {
  const setSync = useAuth((s) => s.setSync)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase!.auth.updateUser({ password })
    setBusy(false)
    if (error) return setError(authErrorMessage(error))
    setSync({ recovering: false })
    toast({ kind: 'success', title: 'Contraseña actualizada' })
  }
  return (
    <Card className="mx-auto max-w-md p-6 sm:p-8">
      <div className="grid size-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
        <KeyRound className="size-6" />
      </div>
      <h2 className="mt-4 font-display text-xl font-bold">Crea tu contraseña nueva</h2>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <label htmlFor="new-pass" className="block text-sm font-medium">
          Contraseña nueva
        </label>
        <PasswordInput id="new-pass" name="password" value={password} onChange={setPassword} autoComplete="new-password" />
        {error && (
          <p role="alert" className="rounded-xl bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          Guardar contraseña
        </Button>
      </form>
    </Card>
  )
}

export default function Account() {
  const { status, recovering } = useAuth()
  const ready = status !== 'loading'
  // Quien llegó aquí porque la página pide iniciar sesión vuelve a donde iba al entrar.
  const state = useLocation().state as { from?: string; mode?: Mode } | null
  const from = state?.from?.startsWith('/') ? state.from : undefined
  const intent = intentCopy(from)
  useEffect(() => {
    if (status === 'signed-in') markHadAccount()
  }, [status])
  // Se vuelve a la sección que la persona quería abrir (el simulacro, la práctica…), no al inicio genérico.
  if (status === 'signed-in' && !recovering && from && from !== '/cuenta') return <Navigate to={from} replace />

  return (
    <div>
      <PageHeader
        icon={<UserRound className="size-6" />}
        title={status === 'signed-in' ? 'Mi cuenta' : 'Tu cuenta'}
        subtitle={status === 'signed-in' ? 'Tu perfil y la sincronización de tu progreso.' : (intent?.subtitle ?? 'Es opcional: con una cuenta gratis tu progreso se guarda en la nube y lo usas en cualquier dispositivo.')}
      />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {!isSupabaseConfigured ? <NotConfigured /> : !ready ? <div className="skeleton mx-auto h-80 max-w-md rounded-2xl" /> : recovering ? <NewPassword /> : status === 'signed-in' ? <Navigate to="/ajustes" replace /> : <AuthForm from={from} initialMode={state?.mode} />}
      </motion.div>
    </div>
  )
}
