import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Share2, Shield } from 'lucide-react'
import { useProgress } from '@/store/progress'
import { computeStreak } from '@/lib/stats'
import { weekDayPoints, formatWeekRange, weekShareText, weekSummary } from '@/lib/week'
import { daysLeftInWeek, nextLeague } from '@/lib/league'
import { shareWeek, SITE } from '@/lib/shareCard'
import { getSpecialty } from '@/data/specialties'
import { toast } from '@/store/toasts'
import { cn } from '@/lib/utils'

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/** «Tu semana»: resumen de lunes a domingo, tu liga, y la tarjeta para compartir por WhatsApp. */
export function WeekCard() {
  const activity = useProgress((s) => s.activity)
  const frozen = useProgress((s) => s.streakFreeze.frozen)
  const [busy, setBusy] = useState(false)
  const s = useMemo(() => weekSummary(activity, computeStreak(activity, new Date(), frozen)), [activity, frozen])
  const bars = useMemo(() => weekDayPoints(activity, s.start), [activity, s.start])
  const max = Math.max(1, ...bars.map((b) => b.points))
  const next = nextLeague(s.points)
  const spec = s.topSpecialty ? getSpecialty(s.topSpecialty.id).name : null
  const delta = s.answered - s.prev.answered
  const text = weekShareText(s, SITE)
  if (s.activeDays === 0 && s.prev.answered === 0) return null

  const share = async () => {
    setBusy(true)
    try {
      const r = await shareWeek({ range: formatWeekRange(s.start, s.end), answered: s.answered, accuracy: s.accuracy, activeDays: s.activeDays, streak: s.streak, league: s.league.name, leagueColor: s.league.color, points: s.points, topSpecialty: spec, delta }, text)
      if (r === 'downloaded') toast({ kind: 'success', title: 'Imagen guardada', body: 'Súbela a tus estados de WhatsApp o a tus historias.' })
    } catch {
      toast({ kind: 'error', title: 'No se pudo crear la imagen' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="tu-semana">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">{formatWeekRange(s.start, s.end)}</p>
          <h2 id="tu-semana" className="font-display text-lg font-bold">
            Tu semana
          </h2>
        </div>
        <Link to="/ranking" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-white" style={{ backgroundColor: s.league.color }} title="Ver la liga de esta semana">
          <Shield className="size-4" aria-hidden /> Liga {s.league.name}
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center sm:gap-3">
        {[
          [String(s.answered), s.answered === 1 ? 'pregunta' : 'preguntas'],
          [s.accuracy === null ? '—' : `${s.accuracy} %`, 'de aciertos'],
          [`${s.activeDays}/7`, 'días de estudio'],
        ].map(([v, l]) => (
          <div key={l} className="rounded-2xl surface-2 px-2 py-3">
            <div className="font-display text-xl font-extrabold tabular-nums sm:text-2xl">{v}</div>
            <div className="text-[11px] text-muted sm:text-xs">{l}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-end gap-1.5" role="img" aria-label={`Puntos por día: ${bars.map((b, i) => `${DAYS[i]} ${b.points}`).join(', ')}`}>
        {bars.map((b, i) => (
          <div key={b.day} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-14 w-full items-end">
              <div className={cn('w-full rounded-t-md', b.points ? 'bg-brand-500' : 'surface-2', b.isFuture && 'opacity-40')} style={{ height: `${b.points ? Math.max(8, (b.points / max) * 100) : 8}%` }} />
            </div>
            <span className="text-[10px] font-semibold text-muted">{DAYS[i]}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm text-muted">
        {delta > 0 ? `${delta} preguntas más que la semana pasada. ` : delta < 0 ? `${-delta} menos que la semana pasada: aún quedan ${daysLeftInWeek()} ${daysLeftInWeek() === 1 ? 'día' : 'días'}. ` : ''}
        {next ? `Te faltan ${next.missing} puntos para la liga ${next.league.name}.` : 'Estás en la liga más alta.'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={share} disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60">
          <Share2 className="size-4" aria-hidden /> {busy ? 'Creando…' : 'Compartir mi semana'}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-800">
          <MessageCircle className="size-4" aria-hidden /> WhatsApp
        </a>
      </div>
    </section>
  )
}
