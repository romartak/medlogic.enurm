import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, GraduationCap } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { buttonClass } from '@/components/ui/primitives'

/**
 * Página para direcciones que no existen. Antes se redirigía al inicio, pero así quien llega por un
 * enlace roto (un mensaje de WhatsApp viejo, por ejemplo) no sabía qué había pasado.
 */
export default function NotFound() {
  useEffect(() => {
    const previous = document.title
    document.title = 'Página no encontrada · MedLogic ENURM'
    // Una dirección rota no debe acabar en el índice de Google (la reescritura de Vercel devuelve 200).
    const robots = document.querySelector('meta[name="robots"]')
    const previousRobots = robots?.getAttribute('content') ?? null
    robots?.setAttribute('content', 'noindex')
    return () => {
      document.title = previous
      if (robots && previousRobots !== null) robots.setAttribute('content', previousRobots)
    }
  }, [])

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Ir a la portada de MedLogic ENURM">
          <Logo />
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-24 sm:px-6">
        <div className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase dark:text-brand-400">Error 404</div>
        <h1 className="mt-3 text-3xl font-extrabold text-balance sm:text-4xl">Esta página no existe</h1>
        <p className="mt-3 text-pretty text-muted">
          Puede que el enlace esté mal escrito o que la página se haya movido. Tu progreso está a salvo: sigue guardado en tu cuenta.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/inicio" className={buttonClass('primary', 'lg', 'w-full sm:w-auto')}>
            <ArrowLeft className="size-5" /> Ir a mi inicio
          </Link>
          <Link to="/" className={buttonClass('outline', 'lg', 'w-full sm:w-auto')}>
            <Compass className="size-5" /> Ver la portada
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-soft surface-2 p-4 text-sm text-muted">
          <p className="flex items-center gap-2 font-semibold text-[var(--text)]">
            <GraduationCap className="size-4 text-brand-600 dark:text-brand-400" /> ¿Buscabas estudiar?
          </p>
          <p className="mt-1">
            Desde la portada puedes crear tu plan gratis, hacer un simulacro o repasar tus errores.
          </p>
        </div>
      </main>
    </div>
  )
}
