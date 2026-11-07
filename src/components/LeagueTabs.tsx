import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Landmark, RefreshCw, Shield, Users } from 'lucide-react'
import { fetchLeague, fetchUniversityChallenge, publishStats, type ChallengeRow, type LeagueRow } from '@/lib/ranking'
import { daysLeftInWeek, isoWeekId, leagueFor, LEAGUES, nextLeague, POINTS, weekPoints } from '@/lib/league'
import { universityLabel } from '@/data/universities'
import { useProgress } from '@/store/progress'
import { Card, ProgressBar } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

type Load = 'loading' | 'ready' | 'error'

function useWeekPoints() {
  const activity = useProgress((s) => s.activity)
  return useMemo(() => weekPoints(activity), [activity])
}

function Skeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton h-14 rounded-2xl" />
      ))}
    </div>
  )
}

function ErrorCard({ what, retry }: { what: string; retry: () => void }) {
  return (
    <Card className="flex items-center justify-between gap-3 p-5 text-sm">
      <span>No se pudo cargar {what}.</span>
      <button onClick={retry} className="inline-flex items-center gap-1.5 font-semibold text-brand-700 dark:text-brand-300">
        <RefreshCw className="size-4" aria-hidden /> Reintentar
      </button>
    </Card>
  )
}

/** Liga de la semana: tu liga según los puntos que llevas y la tabla de quienes están en ella. */
export function LeaguePanel() {
  const points = useWeekPoints()
  const league = leagueFor(points)
  const next = nextLeague(points)
  const left = daysLeftInWeek()
  const [rows, setRows] = useState<LeagueRow[]>([])
  const [state, setState] = useState<Load>('loading')

  const load = useCallback(async () => {
    setState('loading')
    try {
      await publishStats(true) // para que la tabla incluya los puntos de este momento
      setRows(await fetchLeague(isoWeekId()))
      setState('ready')
    } catch {
      setState('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const span = next ? next.league.min - league.min : 1
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-5 p-5 sm:p-6" style={{ background: `linear-gradient(135deg, ${league.color}22, transparent 70%)` }}>
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl text-white shadow-lift" style={{ backgroundColor: league.color }}>
            <Shield className="size-8" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 basis-56">
            <p className="text-xs font-semibold tracking-wider text-muted uppercase">Tu liga esta semana</p>
            <h2 className="font-display text-3xl font-extrabold">Liga {league.name}</h2>
            <p className="mt-0.5 text-sm text-muted tabular-nums">
              {points.toLocaleString('es-DO')} puntos · {left === 1 ? 'último día' : `${left} días`} para que cierre la semana
            </p>
          </div>
        </div>
        <div className="border-t border-soft p-5 sm:p-6">
          {next ? (
            <>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-semibold">Siguiente: {next.league.name}</span>
                <span className="text-muted tabular-nums">te faltan {next.missing} puntos</span>
              </div>
              <ProgressBar value={(points - league.min) / span} color={next.league.color} height="h-2.5" />
            </>
          ) : (
            <p className="text-sm font-semibold">Estás en la liga más alta. Mantén el ritmo hasta el domingo.</p>
          )}
          <ol className="mt-5 grid grid-cols-5 gap-1.5" aria-label="Ligas">
            {LEAGUES.map((l) => (
              <li key={l.id} aria-current={l.id === league.id ? 'true' : undefined} className={cn('rounded-xl px-1.5 py-2 text-center text-[11px] leading-tight font-semibold sm:text-xs', l.id === league.id ? 'text-white' : 'surface-2 text-muted')} style={l.id === league.id ? { backgroundColor: l.color } : undefined}>
                {l.name}
                <span className="block font-normal tabular-nums">{l.min}+</span>
              </li>
            ))}
          </ol>
        </div>
      </Card>

      <section aria-labelledby="rivales">
        <h2 id="rivales" className="mb-2 font-display font-bold">
          Quienes están en tu liga
        </h2>
        {state === 'loading' ? (
          <Skeleton />
        ) : state === 'error' ? (
          <ErrorCard what="la liga" retry={() => void load()} />
        ) : rows.length ? (
          <ol className="space-y-2">
            {rows.map((r, i) => (
              <motion.li key={`${r.posicion}-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }} className={cn('card flex items-center gap-3 p-3.5', r.es_yo && 'border-brand-500/50 bg-brand-500/[0.06]')}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full surface-2 text-sm font-bold tabular-nums">{r.posicion}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {r.nombre}
                  {r.es_yo && <span className="ml-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">(tú)</span>}
                </span>
                <span className="text-right text-sm font-bold whitespace-nowrap tabular-nums">{r.puntos.toLocaleString('es-DO')} pts</span>
              </motion.li>
            ))}
          </ol>
        ) : (
          <Card className="flex items-center gap-3 p-6 text-sm text-muted">
            <Users className="size-5 shrink-0" aria-hidden /> Todavía no hay nadie en tu liga esta semana. Responde unas preguntas y aparecerás aquí; la tabla empieza de cero cada lunes.
          </Card>
        )}
      </section>

      <p className="text-xs text-muted">
        Cómo se ganan los puntos: {POINTS.correct} por cada acierto, {POINTS.wrong} por cada fallo (intentarlo también cuenta) y {POINTS.card} por cada tarjeta repasada. Compites solo con quienes están en tu misma liga, y todos empiezan de cero cada lunes.
      </p>
    </div>
  )
}

/** Reto de la semana: qué universidad suma más puntos por estudiante. */
export function UniversityChallengePanel() {
  const university = useProgress((s) => s.profile.university)
  const points = useWeekPoints()
  const [rows, setRows] = useState<ChallengeRow[]>([])
  const [state, setState] = useState<Load>('loading')
  const noUni = !university || university === 'sin-decir'

  const load = useCallback(async () => {
    setState('loading')
    try {
      await publishStats(true)
      setRows(await fetchUniversityChallenge(isoWeekId()))
      setState('ready')
    } catch {
      setState('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const mine = rows.find((r) => r.es_la_mia)
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <p className="text-xs font-semibold tracking-wider text-muted uppercase">Reto de la semana</p>
        <h2 className="font-display text-2xl font-extrabold text-balance">¿Qué universidad estudia más?</h2>
        <p className="mt-1 text-sm text-muted">
          Se compara el promedio de puntos por estudiante activo, para que ganen las que más estudian y no las más grandes. Esta semana llevas <b className="text-[var(--text)] tabular-nums">{points.toLocaleString('es-DO')}</b> puntos
          {noUni ? '.' : ` para ${universityLabel(university)}.`}
        </p>
        {noUni && (
          <p className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
            Elige tu universidad en <Link to="/plan" className="font-semibold underline">Mi plan</Link> (rehacer el cuestionario) para sumar puntos a tu equipo.
          </p>
        )}
        {mine && <p className="mt-3 text-sm font-semibold text-brand-700 dark:text-brand-300">Tu universidad va en el puesto {rows.indexOf(mine) + 1} de {rows.length}.</p>}
      </Card>

      {state === 'loading' ? (
        <Skeleton />
      ) : state === 'error' ? (
        <ErrorCard what="el reto" retry={() => void load()} />
      ) : rows.length ? (
        <ol className="space-y-2">
          {rows.map((u, i) => (
            <motion.li key={u.universidad} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }} className={cn('card flex items-center gap-3 p-3.5', u.es_la_mia && 'border-brand-500/50 bg-brand-500/[0.06]')}>
              <span className="grid size-9 shrink-0 place-items-center rounded-full surface-2 text-sm font-bold tabular-nums">{i + 1}</span>
              <Landmark className="size-5 shrink-0 text-muted" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">
                  {universityLabel(u.universidad)}
                  {u.es_la_mia && <span className="ml-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">(la tuya)</span>}
                </div>
                <div className="text-xs text-muted tabular-nums">{u.participantes} estudiantes activos</div>
              </div>
              <div className="text-right text-sm font-bold whitespace-nowrap tabular-nums">
                {u.puntos_promedio.toLocaleString('es-DO')}
                <span className="block text-[11px] font-normal text-muted">pts por estudiante</span>
              </div>
            </motion.li>
          ))}
        </ol>
      ) : (
        <Card className="flex items-center gap-3 p-6 text-sm text-muted">
          <Users className="size-5 shrink-0" aria-hidden /> Una universidad entra al reto cuando tiene al menos 3 estudiantes activos esta semana, para no exponer a nadie. Invita a tus compañeros: el reto empieza de cero cada lunes.
        </Card>
      )}
    </div>
  )
}
