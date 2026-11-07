import { Link } from 'react-router-dom'
import { ArrowRight, Check, Crosshair } from 'lucide-react'
import { CHALLENGE, progressOf, windowDays, type Challenge } from '@/lib/challenge'
import { getSpecialty } from '@/data/specialties'
import { cn } from '@/lib/utils'

/** Los 7 días del reto como puntos: hecho, hoy, perdido o por venir. */
export function ChallengeDots({ challenge }: { challenge: Challenge }) {
  const days = windowDays(challenge)
  return (
    <ol className="flex gap-1.5" aria-label="Días del reto">
      {days.map((d, i) => (
        <li
          key={d.day}
          aria-label={`Día ${i + 1}: ${d.done ? 'cumplido' : d.future ? 'por venir' : d.isToday ? `hoy, ${Math.min(d.n, CHALLENGE.perDay)} de ${CHALLENGE.perDay}` : 'sin cumplir'}`}
          className={cn('grid size-8 place-items-center rounded-full text-xs font-bold tabular-nums', d.done ? 'bg-emerald-600 text-white' : d.isToday ? 'border-2 border-brand-500 bg-brand-500/10 text-brand-800 dark:text-brand-200' : d.future ? 'surface-2 text-muted' : 'bg-rose-500/10 text-rose-700 dark:text-rose-300')}
        >
          {d.done ? <Check className="size-4" aria-hidden /> : i + 1}
        </li>
      ))}
    </ol>
  )
}

/** Resumen del reto activo para el Inicio. No se dibuja si no hay un reto en marcha. */
export function ChallengeCard({ challenge }: { challenge: Challenge | null }) {
  if (!challenge) return null
  const p = progressOf(challenge)
  if (p.state !== 'activo') return null
  const spec = getSpecialty(challenge.specialty)
  const to = `/practica?specialty=${challenge.specialty}&topic=${encodeURIComponent(challenge.topic)}&count=${CHALLENGE.perDay}&auto=1`
  return (
    <section aria-labelledby="reto-activo" className="card overflow-hidden p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-orange-700 uppercase dark:text-orange-300">
            <Crosshair className="size-3.5" aria-hidden /> Reto de 7 días
          </p>
          <h2 id="reto-activo" className="mt-0.5 font-display text-lg font-bold text-balance">
            {challenge.topic}
          </h2>
          <p className="text-xs text-muted">
            {spec.name} · {p.daysDone} de {CHALLENGE.daysNeeded} días cumplidos · hoy {p.todayN}/{CHALLENGE.perDay}
          </p>
        </div>
        <Link to={to} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
          {p.todayN >= CHALLENGE.perDay ? 'Practicar más' : `Hacer mis ${CHALLENGE.perDay}`} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ChallengeDots challenge={challenge} />
        <Link to="/retos" className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
          Ver reto →
        </Link>
      </div>
    </section>
  )
}
