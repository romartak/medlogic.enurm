import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { useProgress } from '@/store/progress'
import { streakAtRisk } from '@/lib/stats'

/** Aviso dentro de la app, a partir de las 5 p. m.: la racha sigue viva pero hoy no se ha estudiado nada. */
export function StreakNudge() {
  const activity = useProgress((s) => s.activity)
  const now = new Date()
  const days = now.getHours() >= 17 ? streakAtRisk(activity, now) : 0
  if (!days) return null
  return (
    <Link to="/practica?auto=1" className="flex items-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 transition-colors hover:bg-orange-500/15">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-300">
        <Flame className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">Tu racha de {days} días se rompe hoy</span>
        <span className="block text-sm text-muted">Con 5 preguntas la salvas. Toca para empezar.</span>
      </span>
    </Link>
  )
}
