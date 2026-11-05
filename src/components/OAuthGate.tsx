import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Settings2 } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useProgress } from '@/store/progress'
import { toast } from '@/store/toasts'
import { Button } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { markHadAccount } from '@/lib/account'
import { clearOAuthReturn, googleIdentity, isNewAccount, readOAuthReturn } from '@/lib/oauth'

/** Tiempo máximo de espera de la sesión al volver de Google antes de dejar pasar a la persona. */
const WAIT_MS = 15000

/**
 * Envuelve las rutas. Al volver de Google (o de un enlace de acceso) muestra la pantalla de carga en vez de la
 * portada, espera a que la sesión esté lista y lleva a la persona al panel. Si la cuenta es nueva, le da la
 * bienvenida y le recuerda que puede cambiar sus datos en Configuración.
 */
export function OAuthGate({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const navigate = useNavigate()
  const status = useAuth((s) => s.status)
  const user = useAuth((s) => s.user)
  const [mark] = useState(readOAuthReturn)
  const [waiting, setWaiting] = useState(mark !== null)
  const [welcome, setWelcome] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    if (!waiting || !mark) return
    if (status === 'signed-in' && user) {
      clearOAuthReturn()
      markHadAccount()
      const g = googleIdentity(user)
      const { settings, updateSettings } = useProgress.getState()
      // Nombre de Google como punto de partida: la persona lo puede cambiar en Configuración → Perfil.
      if (!settings.name.trim() && g.first) updateSettings({ name: g.first })
      if (isNewAccount(user.created_at)) setWelcome({ name: g.full || g.first, email: g.email })
      navigate(mark.to, { replace: true })
      setWaiting(false)
    } else if (status === 'signed-out' || status === 'disabled') {
      // Google se canceló o el intercambio falló: de vuelta a la pantalla de entrar, con aviso.
      clearOAuthReturn()
      toast({ kind: 'error', title: 'No se pudo iniciar sesión', body: 'Inténtalo de nuevo con Google o con tu correo.' })
      navigate('/cuenta', { replace: true })
      setWaiting(false)
    }
  }, [waiting, mark, status, user, navigate])

  useEffect(() => {
    if (!waiting) return
    const t = setTimeout(() => {
      clearOAuthReturn()
      setWaiting(false)
    }, WAIT_MS)
    return () => clearTimeout(t)
  }, [waiting])

  if (waiting) return <>{fallback}</>

  const close = () => setWelcome(null)
  return (
    <>
      {children}
      <Modal open={welcome !== null} onClose={close} title="¡Te damos la bienvenida a MedLogic ENURM!">
        <div className="space-y-4 text-sm">
          <p className="text-muted">Creamos tu cuenta gratis con tu cuenta de Google. Solo tomamos estos dos datos:</p>
          <dl className="space-y-2 rounded-2xl border border-soft surface-2 p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-gradient font-display font-bold text-white">{(welcome?.name || welcome?.email || '·').charAt(0).toUpperCase()}</span>
              <div className="min-w-0">
                <dt className="text-xs text-muted">Nombre</dt>
                <dd className="truncate font-semibold">{welcome?.name || 'Sin nombre'}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300">
                <Mail className="size-4" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-muted">Correo</dt>
                <dd className="truncate font-semibold">{welcome?.email}</dd>
              </div>
            </div>
          </dl>
          <p className="text-muted">¿Quieres cambiar algo, como cómo te llamamos, tu foto o tu universidad? Puedes hacerlo cuando quieras en Configuración → Perfil.</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                close()
                navigate('/ajustes')
              }}
            >
              <Settings2 className="size-4" /> Cambiar mis datos
            </Button>
            <Button onClick={close}>Empezar a estudiar</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
