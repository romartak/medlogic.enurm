import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CloudOff, X } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { buttonClass } from '@/components/ui/primitives'

const DISMISS_KEY = 'medlogic-aviso-local'
const DISMISS_DAYS = 7

/** Hay cuentas disponibles y esta persona estudia sin ninguna: su progreso vive solo en este navegador. */
export function useLocalOnly(): boolean {
  return useAuth((s) => s.status) === 'signed-out'
}

function dismissedRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY))
    return at > 0 && Date.now() - at < DISMISS_DAYS * 86_400_000
  } catch {
    return false
  }
}

/**
 * Aviso para quien estudia sin cuenta: el progreso se guarda solo en este navegador. La cuenta es opcional y
 * gratuita; con ella el progreso es el mismo en todos los dispositivos. Se puede cerrar y vuelve a la semana.
 */
export function LocalProgressCard() {
  const localOnly = useLocalOnly()
  const [hidden, setHidden] = useState(dismissedRecently)
  if (!localOnly || hidden) return null
  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* almacenamiento no disponible: se oculta solo en esta visita */
    }
    setHidden(true)
  }
  return (
    <section aria-label="Aviso sobre tu progreso" className="card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
          <CloudOff className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Estás estudiando sin cuenta</h2>
          <p className="mt-0.5 text-sm text-pretty text-muted">
            Tu progreso se guarda solo en este navegador. Con una cuenta gratis (es opcional) se guarda en la nube y es el mismo en todos tus dispositivos.
          </p>
        </div>
        <button type="button" onClick={dismiss} aria-label="Cerrar aviso" className="-mt-1 -mr-1.5 grid size-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-slate-900/5 dark:hover:bg-white/5">
          <X className="size-4" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:pl-12">
        <Link to="/cuenta" state={{ mode: 'signup' }} className={buttonClass('primary', 'md', 'px-3')}>
          Crear cuenta gratis
        </Link>
        <button type="button" onClick={dismiss} className={buttonClass('secondary', 'md', 'px-3')}>
          Seguir sin cuenta
        </button>
      </div>
    </section>
  )
}

/** Versión corta del aviso para los menús: una línea y un enlace. */
export function LocalProgressLine({ className = '' }: { className?: string }) {
  if (!useLocalOnly()) return null
  return (
    <p className={`flex items-center gap-2 text-xs text-muted ${className}`}>
      <CloudOff className="size-4 shrink-0" />
      <span>
        Sin cuenta: tu progreso queda solo en este navegador.{' '}
        <Link to="/cuenta" state={{ mode: 'signup' }} className="font-semibold text-brand-700 underline dark:text-brand-400">
          Crear cuenta
        </Link>
      </span>
    </p>
  )
}
