import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { CloudOff, Cloud, Eye, EyeOff, KeyRound, Laptop, LogOut, Mail, RefreshCw, ShieldCheck, Smartphone, UserRound } from 'lucide-react'
import { authErrorMessage, authRedirectUrl, isSupabaseConfigured, supabase } from '@/lib/supabase'
import { syncNow } from '@/lib/sync'
import { displayName, useAuth } from '@/store/auth'
import { Button, Card, PageHeader, Segmented } from '@/components/ui/primitives'
import { toast } from '@/store/toasts'
import { cn, formatDate } from '@/lib/utils'

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

function PasswordInput({ value, onChange, autoComplete, id }: { value: string; onChange: (v: string) => void; autoComplete: string; id: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input id={id} type={show ? 'text' : 'password'} required minLength={8} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} className={cn(field, 'pr-12')} />
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
          Ajustes
        </Link>{' '}
        puedes descargar una copia de tu progreso.
      </p>
    </Card>
  )
}

/* ---------- Acceso ---------- */

type Mode = 'signin' | 'signup' | 'reset' | 'magic'

function AuthForm() {
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState<null | { title: string; body: string }>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast({ kind: 'success', title: 'Sesión iniciada' })
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: name.trim() }, emailRedirectTo: authRedirectUrl() } })
        if (error) throw error
        if (!data.session) setSent({ title: 'Confirma tu correo', body: `Te enviamos un enlace a ${email}. Ábrelo desde este dispositivo para activar tu cuenta.` })
        else toast({ kind: 'success', title: '¡Cuenta creada!' })
      } else if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: authRedirectUrl() } })
        if (error) throw error
        setSent({ title: 'Revisa tu correo', body: `Te enviamos un enlace de acceso a ${email}. Ábrelo desde este dispositivo.` })
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: authRedirectUrl() })
        if (error) throw error
        setSent({ title: 'Revisa tu correo', body: `Si existe una cuenta con ${email}, recibirás un enlace para crear una contraseña nueva.` })
      }
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
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

  const titles: Record<Mode, string> = { signin: 'Inicia sesión', signup: 'Crea tu cuenta gratis', reset: 'Recupera tu contraseña', magic: 'Entra con un enlace' }

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1fr_440px]">
      <div className="order-last lg:order-first lg:pt-6">
        <h2 className="font-display text-2xl font-bold">Tu progreso, en todos tus dispositivos</h2>
        <p className="mt-2 text-muted">La cuenta es gratis y opcional: sin ella todo sigue funcionando en este navegador.</p>
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
        {(mode === 'signin' || mode === 'signup') && (
          <Segmented
            value={mode}
            onChange={(m) => (setMode(m), setError(''))}
            className="mb-6 grid w-full grid-cols-2"
            options={[
              { value: 'signin', label: 'Iniciar sesión' },
              { value: 'signup', label: 'Crear cuenta' },
            ]}
          />
        )}
        <h2 className="font-display text-xl font-bold">{titles[mode]}</h2>

        {(mode === 'signin' || mode === 'signup') && (
          <>
            <Button variant="outline" size="lg" className="mt-5 w-full" onClick={google}>
              <GoogleIcon className="size-5" /> Continuar con Google
            </Button>
            <div className="my-5 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-[var(--border)]" /> o con tu correo <span className="h-px flex-1 bg-[var(--border)]" />
            </div>
          </>
        )}

        <form onSubmit={submit} className={cn('space-y-4', (mode === 'reset' || mode === 'magic') && 'mt-5')}>
          {mode === 'signup' && (
            <label className="block text-sm font-medium" htmlFor="acc-name">
              ¿Cómo te llamamos?
              <input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Dra. / Dr. …" className={field} />
            </label>
          )}
          <label className="block text-sm font-medium" htmlFor="acc-email">
            Correo electrónico
            <input id="acc-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" className={field} />
          </label>
          {(mode === 'signin' || mode === 'signup') && (
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="acc-pass" className="text-sm font-medium">
                  Contraseña
                </label>
                {mode === 'signin' && (
                  <button type="button" onClick={() => (setMode('reset'), setError(''))} className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400">
                    ¿La olvidaste?
                  </button>
                )}
              </div>
              <PasswordInput id="acc-pass" value={password} onChange={setPassword} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
              {mode === 'signup' && <p className="mt-1.5 text-xs text-muted">Mínimo 8 caracteres.</p>}
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy && <RefreshCw className="size-4 animate-spin" />}
            {mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Crear cuenta' : mode === 'magic' ? 'Enviarme el enlace' : 'Enviarme el enlace'}
          </Button>
        </form>

        {(mode === 'signin' || mode === 'signup') && (
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
        )}

        <div className="mt-5 text-center text-sm">
          {mode === 'signin' && (
            <button onClick={() => (setMode('magic'), setError(''))} className="font-medium text-muted hover:text-[var(--text)]">
              Prefiero recibir un enlace de acceso por correo
            </button>
          )}
          {(mode === 'reset' || mode === 'magic') && (
            <button onClick={() => (setMode('signin'), setError(''))} className="font-medium text-muted hover:text-[var(--text)]">
              ← Volver a iniciar sesión
            </button>
          )}
        </div>
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
        <PasswordInput id="new-pass" value={password} onChange={setPassword} autoComplete="new-password" />
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

/* ---------- Cuenta conectada ---------- */

const SYNC_LABEL = {
  idle: 'Preparando…',
  syncing: 'Sincronizando…',
  synced: 'Al día',
  offline: 'Sin conexión: se subirá al volver',
  error: 'No se pudo sincronizar',
  conflict: 'Elige qué progreso conservar',
} as const

function Profile() {
  const navigate = useNavigate()
  const { user, sync, lastSyncedAt, signOut } = useAuth()
  const name = displayName(user)
  const provider = (user?.app_metadata as { provider?: string } | undefined)?.provider
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-brand-gradient font-display text-2xl font-extrabold text-white">{name.charAt(0).toUpperCase() || <UserRound className="size-7" />}</span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-xl font-bold">{name}</div>
          <div className="truncate text-sm text-muted">{user?.email}</div>
          <div className="mt-1 text-xs text-muted">Acceso con {provider === 'google' ? 'Google' : 'correo'}</div>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await signOut()
            toast({ kind: 'info', title: 'Sesión cerrada', body: 'Tu progreso sigue guardado en este dispositivo y en tu cuenta.' })
            navigate('/inicio')
          }}
        >
          <LogOut className="size-4" /> Cerrar sesión
        </Button>
      </Card>
      <Card className="flex flex-wrap items-center gap-4 p-6">
        <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl', sync === 'error' || sync === 'offline' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300')}>
          {sync === 'offline' ? <CloudOff className="size-6" /> : <Cloud className="size-6" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">Sincronización: {SYNC_LABEL[sync]}</div>
          <div className="text-sm text-muted">{lastSyncedAt ? `Última copia: ${formatDate(new Date(lastSyncedAt).getTime(), { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}` : 'Tu progreso se guarda en la nube automáticamente.'}</div>
        </div>
        <Button variant="secondary" onClick={() => void syncNow()} disabled={sync === 'syncing'}>
          <RefreshCw className={cn('size-4', sync === 'syncing' && 'animate-spin')} /> Sincronizar ahora
        </Button>
      </Card>
    </div>
  )
}

export default function Account() {
  const { status, recovering } = useAuth()
  const ready = status !== 'loading'

  return (
    <div>
      <PageHeader icon={<UserRound className="size-6" />} title={status === 'signed-in' ? 'Mi cuenta' : 'Tu cuenta'} subtitle={status === 'signed-in' ? 'Tu perfil y la sincronización de tu progreso.' : 'Guarda tu progreso en la nube y estudia desde cualquier dispositivo.'} />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {!isSupabaseConfigured ? <NotConfigured /> : !ready ? <div className="skeleton mx-auto h-80 max-w-md rounded-2xl" /> : recovering ? <NewPassword /> : status === 'signed-in' ? <Profile /> : <AuthForm />}
      </motion.div>
    </div>
  )
}
