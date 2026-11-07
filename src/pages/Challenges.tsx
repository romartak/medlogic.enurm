import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Crosshair, PartyPopper } from 'lucide-react'
import { useBank } from '@/store/bank'
import { useChallenge } from '@/store/challenge'
import { CHALLENGE, progressOf } from '@/lib/challenge'
import { hotTopics, RECENT_WINDOW } from '@/lib/hot'
import { getSpecialty } from '@/data/specialties'
import { ChallengeDots } from '@/components/ChallengeCard'
import { Button, Card, PageHeader, SpecialtyBadge } from '@/components/ui/primitives'
import { formatDate } from '@/lib/utils'

export default function Challenges() {
  const questions = useBank((s) => s.questions)
  const { active, history, start, abandon } = useChallenge()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [confirmAbandon, setConfirmAbandon] = useState(false)
  const suggestions = useMemo(() => hotTopics(questions).slice(0, 6), [questions])

  const progress = active ? progressOf(active) : null
  const busy = progress?.state === 'activo'
  const proposed = { specialty: params.get('especialidad') ?? '', topic: params.get('tema') ?? '' }
  const hasProposal = !!proposed.specialty && !!proposed.topic && !busy

  const begin = (specialty: string, topic: string) => {
    start(specialty, topic)
    navigate('/retos', { replace: true })
  }
  const practiceUrl = active ? `/practica?specialty=${active.specialty}&topic=${encodeURIComponent(active.topic)}&count=${CHALLENGE.perDay}&auto=1` : '/practica'

  return (
    <div className="space-y-6">
      <PageHeader icon={<Crosshair className="size-6" />} eyebrow="Constancia" title="Retos de 7 días" subtitle={`Practica ${CHALLENGE.perDay} preguntas de una especialidad en ${CHALLENGE.daysNeeded} de los próximos ${CHALLENGE.windowDays} días, empezando por un tema que sale mucho en el ENURM.`} />

      {hasProposal && (
        <Card className="border-brand-500/40 bg-brand-500/[0.05] p-5">
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">Te proponen</p>
          <h2 className="mt-0.5 font-display text-xl font-bold text-balance">Reto de 7 días: {proposed.topic}</h2>
          <p className="mt-1 text-sm text-muted">
            Empiezas hoy. Cada día que hagas {CHALLENGE.perDay} preguntas de {getSpecialty(proposed.specialty).name} cuenta; con {CHALLENGE.daysNeeded} días cumplidos ganas {CHALLENGE.reward} XP.
          </p>
          <Button className="mt-4" onClick={() => begin(proposed.specialty, proposed.topic)}>
            Empezar el reto
          </Button>
        </Card>
      )}

      {active && progress && (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <SpecialtyBadge id={active.specialty} />
              <h2 className="mt-2 font-display text-2xl font-extrabold text-balance">{active.topic}</h2>
              <p className="mt-1 text-sm text-muted tabular-nums">
                Empezó el {formatDate(new Date(active.startedDay + 'T12:00:00').getTime())} · {progress.daysDone} de {CHALLENGE.daysNeeded} días cumplidos
              </p>
            </div>
            {progress.state === 'completado' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white">
                <PartyPopper className="size-4" aria-hidden /> Completado
              </span>
            )}
          </div>

          <div className="mt-5">
            <ChallengeDots challenge={active} />
          </div>

          {progress.state === 'activo' && (
            <>
              <p className="mt-4 text-sm">
                Hoy llevas <b className="tabular-nums">{progress.todayN}</b> de {CHALLENGE.perDay} preguntas. Te {progress.daysLeft === 1 ? 'queda 1 día' : `quedan ${progress.daysLeft} días`}
                {progress.spare > 0 ? ` y puedes saltarte ${progress.spare === 1 ? '1' : progress.spare}.` : ': ya no puedes saltarte ninguno.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to={practiceUrl} className="inline-flex h-11 items-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
                  {progress.todayN >= CHALLENGE.perDay ? 'Practicar más' : `Hacer mis ${CHALLENGE.perDay} de hoy`}
                </Link>
                <Button variant="ghost" onClick={() => (confirmAbandon ? (abandon(), setConfirmAbandon(false)) : setConfirmAbandon(true))}>
                  {confirmAbandon ? 'Sí, abandonar' : 'Abandonar reto'}
                </Button>
              </div>
            </>
          )}
          {progress.state === 'completado' && (
            <div className="mt-4 text-sm">
              <p>
                ¡Lo lograste! Ganaste <b>{CHALLENGE.reward} XP</b>. Elige otro tema abajo para seguir.
              </p>
            </div>
          )}
          {progress.state === 'vencido' && (
            <div className="mt-4 space-y-3 text-sm">
              <p>Esta vez no alcanzaron los días, y no pasa nada: lo que practicaste ya cuenta para tu progreso.</p>
              <Button onClick={() => begin(active.specialty, active.topic)}>Intentarlo de nuevo</Button>
            </div>
          )}
        </Card>
      )}

      <section aria-labelledby="temas">
        <h2 id="temas" className="mb-1 font-display text-lg font-bold">
          {busy ? 'Temas calientes' : 'Elige un tema caliente'}
        </h2>
        <p className="mb-3 text-sm text-muted">{busy ? 'Termina tu reto actual para empezar otro.' : 'Son los que más se repiten en los últimos exámenes.'}</p>
        {suggestions.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((t) => (
              <li key={`${t.specialty}-${t.topic}`} className="card flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display font-bold">{t.topic}</div>
                  <div className="text-xs text-muted">
                    {getSpecialty(t.specialty).name} · salió en {t.recentYears} de los últimos {RECENT_WINDOW} años
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => begin(t.specialty, t.topic)} aria-label={`Empezar el reto de ${t.topic}`}>
                  Empezar
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <Card className="p-5 text-sm text-muted">Cargando los temas del banco…</Card>
        )}
      </section>

      {history.length > 0 && (
        <section aria-labelledby="historial">
          <h2 id="historial" className="mb-2 font-display text-lg font-bold">
            Retos completados
          </h2>
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.completedAt} className="card flex items-center justify-between gap-3 p-3.5 text-sm">
                <span className="min-w-0 truncate font-semibold">{h.topic}</span>
                <span className="shrink-0 text-xs text-muted">{formatDate(h.completedAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
