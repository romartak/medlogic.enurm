import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import { useProgress } from '@/store/progress'
import { useWelcome } from '@/store/welcome'
import { toast } from '@/store/toasts'
import { markHadAccount } from '@/lib/account'
import { clearOAuthReturn, googleIdentity, isNewAccount, readOAuthReturn } from '@/lib/oauth'

/** Tiempo máximo de espera de la sesión al volver de Google antes de dejar pasar a la persona. */
const WAIT_MS = 15000

/**
 * Envuelve las rutas. Al volver de Google (o de un enlace de acceso) muestra la pantalla de carga en vez de la
 * portada, espera a que la sesión esté lista y lleva a la persona al panel. Si la cuenta es nueva, abre la
 * bienvenida con el cuestionario corto; si ya existía, un saludo breve.
 */
export function OAuthGate({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const navigate = useNavigate()
  const status = useAuth((s) => s.status)
  const user = useAuth((s) => s.user)
  const [mark] = useState(readOAuthReturn)
  const [waiting, setWaiting] = useState(mark !== null)

  useEffect(() => {
    if (!waiting || !mark) return
    if (status === 'signed-in' && user) {
      clearOAuthReturn()
      markHadAccount()
      const g = googleIdentity(user)
      const { settings, updateSettings } = useProgress.getState()
      // Nombre de Google como punto de partida: la persona lo confirma o cambia en el cuestionario.
      if (!settings.name.trim() && g.first) updateSettings({ name: g.first })
      useWelcome.getState().start(isNewAccount(user.created_at) ? 'new' : 'back')
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

  return <>{waiting ? fallback : children}</>
}
