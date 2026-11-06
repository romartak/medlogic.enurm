import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Radar } from 'lucide-react'
import { buildInsights, formatHour, formatMinutes, hourProfile, topInterests, topicLabel } from '@/lib/interest'
import { specialtyStats } from '@/lib/stats'
import { useInterest } from '@/store/interest'
import { useProgress } from '@/store/progress'
import { useBank } from '@/store/bank'
import { hasReminder } from '@/components/ReminderCard'
import { cn } from '@/lib/utils'
import { Card, ProgressBar } from '@/components/ui/primitives'

/** «Según tu actividad»: lo que la plataforma deduce de dónde pasas el tiempo, con sugerencias. */
export function InterestCard() {
  const { usage, topics, hours, events, sessions, clear } = useInterest()
  const attempts = useProgress((s) => s.attempts)
  const questions = useBank((s) => s.questions)
  const { top, insights } = useMemo(() => {
    const stats = specialtyStats(attempts, questions)
    return { top: topInterests(usage, 3), insights: buildInsights(usage, Date.now(), { topics, hours, events, sessions, stats, hasReminder: hasReminder() }) }
  }, [usage, topics, hours, events, sessions, attempts, questions])
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

/** «Tu perfil de estudio»: a qué hora estudia, qué temas le atraen y qué botones usa más. */
export function HabitsCard() {
  const { topics, hours, events, sessions } = useInterest()
  const hp = hourProfile(hours)
  const max = Math.max(1, ...hours)
  const favorites = Object.entries(topics)
    .sort((a, b) => b[1].ms + b[1].visits * 30_000 - (a[1].ms + a[1].visits * 30_000))
    .slice(0, 4)
  const marked = events.marcar?.n ?? 0
  const noted = events.nota?.n ?? 0
  const avg = sessions.count ? Math.round(sessions.ms / 60_000 / sessions.count) : 0
  if (!hp && !favorites.length && !sessions.count) return null

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 font-display font-bold">
        <Radar className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
        Tu perfil de estudio
      </h2>

      <div className="mt-4">
        <div className="mb-1.5 text-sm font-semibold">¿A qué hora estudias?</div>
        <div role="img" aria-label={hp ? `Estudias sobre todo de ${formatHour(hp.start)} a ${formatHour(hp.start + 2)}` : 'Todavía hay pocos datos de horario'} className="flex h-16 items-end gap-[3px]">
          {hours.map((ms, h) => (
            <div key={h} title={`${formatHour(h)}: ${formatMinutes(Math.round(ms / 60_000))}`} className={cn('flex-1 rounded-t-[3px]', hp && (h === hp.start || h === (hp.start + 1) % 24) ? 'bg-brand-500' : 'bg-brand-500/30')} style={{ height: `${Math.max(4, (ms / max) * 100)}%` }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-muted tabular-nums">
          <span>12 a. m.</span>
          <span>12 p. m.</span>
          <span>11 p. m.</span>
        </div>
        {hp && <p className="mt-2 text-sm text-muted">Tu mejor momento: de {formatHour(hp.start)} a {formatHour(hp.start + 2)} ({hp.period}).</p>}
      </div>

      {favorites.length > 0 && (
        <div className="mt-5">
          <div className="mb-1.5 text-sm font-semibold">Temas que más abres</div>
          <ul className="space-y-1 text-sm">
            {favorites.map(([key, u]) => (
              <li key={key} className="flex justify-between gap-3">
                <span className="truncate">{topicLabel(key)}</span>
                <span className="shrink-0 text-xs text-muted tabular-nums">{formatMinutes(Math.round(u.ms / 60_000))} · {u.visits} {u.visits === 1 ? 'visita' : 'visitas'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
        {[
          [String(sessions.count), 'sesiones'],
          [avg ? `${avg} min` : '—', 'por sesión'],
          [String(marked + noted), 'marcas y notas'],
        ].map(([v, l]) => (
          <div key={l} className="surface-2 rounded-xl p-2">
            <dt className="text-[11px] text-muted">{l}</dt>
            <dd className="font-display text-lg font-extrabold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
