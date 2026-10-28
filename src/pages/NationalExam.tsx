import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarClock, ChevronRight, Flag, Landmark, Play, Trophy, Users } from 'lucide-react'
import { Button, Card, PageHeader } from '@/components/ui/primitives'
import { ExamRunner, type ExamConfig } from '@/pages/Exam'
import { useBank } from '@/store/bank'
import { useAuth } from '@/store/auth'
import { useProgress } from '@/store/progress'
import { isSupabaseConfigured } from '@/lib/supabase'
import { currentEdition, daysLeftInEdition, editionLabel, fetchNationalResults, NATIONAL_MINUTES, NATIONAL_SIZE, nationalQuestions, sendNational, useNational, type NationalResults } from '@/lib/national'
import { universityLabel } from '@/data/universities'
import { formatDuration, pct } from '@/lib/utils'

export default function NationalExam() {
  const bank = useBank((s) => s.questions)
  const status = useAuth((s) => s.status)
  const university = useProgress((s) => s.profile.university)
  const edition = useMemo(() => currentEdition(), [])
  const attempt = useNational((s) => s.attempts[edition])
  const record = useNational((s) => s.record)
  const [running, setRunning] = useState<ExamConfig | null>(null)
  const [results, setResults] = useState<NationalResults | null>(null)
  const [loading, setLoading] = useState(false)
  const label = editionLabel(edition)
  const left = daysLeftInEdition()
  const signedIn = status === 'signed-in'

  // Entrega pendiente (sin conexión al terminar) y percentil del país.
  useEffect(() => {
    if (!attempt || !signedIn) return
    let alive = true
    setLoading(true)
    sendNational(edition)
      .then((ok) => (ok ? fetchNationalResults(edition) : null))
      .then((r) => alive && setResults(r))
      .catch(() => alive && setResults(null))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [attempt, signedIn, edition])

  const start = () => setRunning({ title: `Simulacro nacional · ${label}`, questions: nationalQuestions(bank, edition), minutes: NATIONAL_MINUTES })

  if (running) return <ExamRunner config={running} onExit={() => setRunning(null)} onSubmitted={(r) => record(edition, r)} />

  return (
    <div className="space-y-6">
      <PageHeader icon={<Flag className="size-6" />} eyebrow="Una vez al mes" title={`Simulacro nacional · ${label}`} subtitle="El mismo examen para todos los estudiantes del país. Al terminar ves en qué percentil quedaste: lo más parecido al ENURM real." />

      {!attempt ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="relative overflow-hidden p-6 lg:col-span-2">
            <div className="pointer-events-none absolute -top-20 -right-16 size-60 rounded-full bg-brand-500/15 blur-3xl" />
            <div className="relative">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  [String(NATIONAL_SIZE), 'preguntas'],
                  [`${NATIONAL_MINUTES / 60} h`, 'de tiempo'],
                  ['1', 'intento que cuenta'],
                ].map(([v, k]) => (
                  <div key={k} className="rounded-2xl surface-2 p-4">
                    <div className="font-display text-2xl font-extrabold">{v}</div>
                    <div className="text-xs text-muted">{k}</div>
                  </div>
                ))}
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                <li>• Mismas condiciones que el ENURM: sin ver las respuestas hasta el final.</li>
                <li>• Busca 2 horas tranquilas: el reloj no se detiene.</li>
                <li>• Solo cuenta tu primer intento de este mes.</li>
              </ul>
              <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={start} disabled={bank.length < NATIONAL_SIZE}>
                <Play className="size-5 fill-current" /> Empezar el simulacro de {label.split(' ')[0].toLowerCase()}
              </Button>
              {!signedIn && (
                <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
                  {isSupabaseConfigured ? (
                    <>
                      Tu resultado entra al percentil del país cuando tienes la sesión iniciada. <Link to="/cuenta" className="font-semibold underline">Inicia sesión</Link> antes de empezar.
                    </>
                  ) : (
                    'El percentil del país se activará pronto; tu resultado quedará guardado.'
                  )}
                </p>
              )}
            </div>
          </Card>
          <Card className="flex flex-col gap-3 p-6">
            <CalendarClock className="size-7 text-brand-600 dark:text-brand-400" />
            <div className="font-display text-xl font-bold">{left === 1 ? 'Último día' : `Cierra en ${left} días`}</div>
            <p className="text-sm text-muted">Cada mes hay una edición nueva, con preguntas distintas. Anúnciala a tus compañeros: mientras más participen, más real es el percentil.</p>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-glow lg:col-span-2">
            <div className="text-sm text-white/80">Tu resultado de {label.toLowerCase()}</div>
            <div className="mt-1 flex items-end gap-3">
              <span className="font-display text-6xl font-extrabold">{pct(attempt.correct, attempt.total)}%</span>
              <span className="mb-2 text-white/85">
                {attempt.correct} de {attempt.total} · {formatDuration(attempt.seconds)}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/15 p-3">
                <div className="font-display text-2xl font-bold">{results?.percentil != null ? `${results.percentil}` : '—'}</div>
                <div className="text-xs text-white/80">percentil</div>
              </div>
              <div className="rounded-2xl bg-white/15 p-3">
                <div className="font-display text-2xl font-bold">{results ? `#${results.posicion}` : '—'}</div>
                <div className="text-xs text-white/80">{results ? `de ${results.participantes}` : 'posición'}</div>
              </div>
              <div className="rounded-2xl bg-white/15 p-3">
                <div className="font-display text-2xl font-bold">{results ? `${results.promedio}%` : '—'}</div>
                <div className="text-xs text-white/80">promedio del país</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-white/85">
              {loading
                ? 'Calculando tu posición…'
                : results?.percentil != null
                  ? `Sacaste más que el ${results.percentil} % de los que lo han hecho hasta ahora. El percentil se mueve mientras más gente participe.`
                  : results
                    ? 'Eres de los primeros en hacerlo este mes: vuelve más tarde para ver tu percentil.'
                    : signedIn
                      ? 'No se pudo cargar el percentil ahora. Vuelve a abrir esta página más tarde.'
                      : isSupabaseConfigured
                        ? 'Inicia sesión para que tu resultado entre al percentil del país.'
                        : 'El percentil del país se activará pronto. Tu resultado ya quedó guardado.'}
            </p>
          </motion.div>
          <div className="space-y-4">
            {results && results.promedio_universidad != null && university && university !== 'sin-decir' && (
              <Card className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Landmark className="size-4" /> {universityLabel(university)}
                </div>
                <div className="mt-2 font-display text-2xl font-bold">{results.promedio_universidad}%</div>
                <div className="text-xs text-muted">promedio de {results.participantes_universidad} {results.participantes_universidad === 1 ? 'estudiante' : 'estudiantes'} de tu universidad</div>
              </Card>
            )}
            {results && (
              <Card className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Trophy className="size-4 text-amber-500" /> Mejor nota del país
                </div>
                <div className="mt-2 font-display text-2xl font-bold">{results.mejor}%</div>
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Users className="size-3.5" /> {results.participantes} participantes
                </div>
              </Card>
            )}
            <Link to={`/simulacro/${attempt.examId}`} className="card card-hover flex items-center justify-between p-5 font-semibold">
              Repasar mis respuestas <ChevronRight className="size-4 text-muted" />
            </Link>
            <p className="text-xs text-muted">La próxima edición abre el día 1 del mes que viene.</p>
          </div>
        </div>
      )}
    </div>
  )
}
