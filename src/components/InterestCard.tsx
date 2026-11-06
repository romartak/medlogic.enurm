import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Radar } from 'lucide-react'
import { buildInsights, formatMinutes, topInterests } from '@/lib/interest'
import { useInterest } from '@/store/interest'
import { Card, ProgressBar } from '@/components/ui/primitives'

/** «Según tu actividad»: lo que la plataforma deduce de dónde pasas el tiempo, con sugerencias. */
export function InterestCard() {
  const usage = useInterest((s) => s.usage)
  const clear = useInterest((s) => s.clear)
  const { top, insights } = useMemo(() => ({ top: topInterests(usage, 3), insights: buildInsights(usage) }), [usage])
  if (!insights.length) return null

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display font-bold">
          <Radar className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
          Según tu actividad
        </h2>
        <button type="button" onClick={clear} className="relative text-xs font-medium text-muted underline-offset-2 after:absolute after:-inset-3 hover:underline">
          Borrar datos
        </button>
      </div>

      <ul className="mt-4 space-y-3">
        {top.map((t) => (
          <li key={t.to}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-semibold">{t.label}</span>
              <span className="text-xs text-muted tabular-nums">{formatMinutes(t.minutes)} · {t.visits} {t.visits === 1 ? 'visita' : 'visitas'}</span>
            </div>
            <ProgressBar value={t.share} height="h-1.5" />
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 border-t border-soft pt-4">
        {insights.map((i) => (
          <Link key={i.id} to={i.to} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.04]">
            <span className="min-w-0 flex-1 text-sm">
              {i.text} <span className="font-semibold text-brand-700 dark:text-brand-300">{i.action}</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Se calcula en este dispositivo y no sale de él.</p>
    </Card>
  )
}
