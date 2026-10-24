import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Crown, Eye, EyeOff, Landmark, Lock, Medal, RefreshCw, Users } from 'lucide-react'
import { Card, PageHeader, Segmented } from '@/components/ui/primitives'
import { useAuth } from '@/store/auth'
import { useProgress } from '@/store/progress'
import { isSupabaseConfigured } from '@/lib/supabase'
import { fetchRanking, fetchUniversities, myPublicStats, publishStats, type MyPosition, type RankingOrder, type RankingRow, type UniversityRow } from '@/lib/ranking'
import { universityLabel } from '@/data/universities'
import { cn } from '@/lib/utils'

const ORDERS: { value: RankingOrder; label: string; unit: (r: RankingRow) => string }[] = [
  { value: 'xp', label: 'XP', unit: (r) => `${r.xp.toLocaleString('es-DO')} XP` },
  { value: 'answered', label: 'Preguntas', unit: (r) => `${r.respondidas.toLocaleString('es-DO')} preguntas` },
  { value: 'accuracy', label: 'Precisión', unit: (r) => `${Math.round(r.acierto * 100)} %` },
  { value: 'minutes', label: 'Tiempo', unit: (r) => `${Math.round(r.minutos / 60)} h` },
]

function Podium({ pos }: { pos: number }) {
  if (pos > 3) return <span className="w-8 text-center font-display text-sm font-bold text-muted tabular-nums">{pos}</span>
  const color = pos === 1 ? 'text-amber-500' : pos === 2 ? 'text-slate-400' : 'text-orange-700'
  return <span className="grid w-8 place-items-center">{pos === 1 ? <Crown className={cn('size-5', color)} /> : <Medal className={cn('size-5', color)} />}</span>
}

/** Lo que se ve antes de que exista la base de datos o sin sesión: tus propios números. */
function Preview({ reason }: { reason: 'no-db' | 'signed-out' }) {
  const s = myPublicStats()
  const university = useProgress((st) => st.profile.university)
  const other = useProgress((st) => st.profile.universityOther)
  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Lock className="size-7" />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold">{reason === 'no-db' ? 'El ranking se activa muy pronto' : 'Inicia sesión para entrar al ranking'}</h2>
          <p className="mt-1 text-sm text-muted">
            {reason === 'no-db'
              ? 'Cuando se activen las cuentas, aquí verás tu posición en el país y en tu universidad. Tu progreso de hoy ya cuenta: sigue estudiando.'
              : 'Con tu cuenta, tu progreso aparece en el ranking del país y de tu universidad. Solo se muestra tu primer nombre e inicial, y puedes ocultarlo.'}
          </p>
        </div>
        {reason === 'signed-out' && (
          <Link to="/cuenta" className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient px-5 text-sm font-semibold text-white">
            Iniciar sesión
          </Link>
        )}
      </Card>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['XP', s.xp.toLocaleString('es-DO')],
          ['Preguntas', s.answered.toLocaleString('es-DO')],
          ['Precisión', s.answered ? `${Math.round((s.correct / s.answered) * 100)} %` : '—'],
          ['Universidad', university ? universityLabel(university, other) : 'Sin elegir'],
        ].map(([k, v]) => (
          <Card key={k} className="p-4">
            <div className="text-xs font-semibold text-muted">{k}</div>
            <div className="mt-1 truncate font-display text-xl font-bold">{v}</div>
          </Card>
        ))}
      </div>
      {!university && (
        <p className="text-sm text-muted">
          Elige tu universidad en <Link to="/plan" className="font-semibold text-brand-700 underline dark:text-brand-400">Mi plan → Rehacer el cuestionario</Link> para compararte con tus compañeros.
        </p>
      )}
    </div>
  )
}

export default function Ranking() {
  const status = useAuth((s) => s.status)
  const university = useProgress((s) => s.profile.university)
  const showName = useProgress((s) => s.settings.rankingShowName)
  const updateSettings = useProgress((s) => s.updateSettings)
  const [order, setOrder] = useState<RankingOrder>('xp')
  const [scope, setScope] = useState<'pais' | 'universidad' | 'universidades'>('pais')
  const [rows, setRows] = useState<RankingRow[]>([])
  const [me, setMe] = useState<MyPosition | null>(null)
  const [unis, setUnis] = useState<UniversityRow[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [published, setPublished] = useState(true)

  const load = useCallback(async () => {
    setState('loading')
    try {
      setPublished(await publishStats(true))
      if (scope === 'universidades') setUnis(await fetchUniversities())
      else {
        const r = await fetchRanking(order, scope === 'universidad' ? university : null)
        setRows(r.rows)
        setMe(r.me)
      }
      setState('ready')
    } catch {
      setState('error')
    }
  }, [order, scope, university])

  useEffect(() => {
    if (status === 'signed-in') void load()
  }, [status, load])

  const header = <PageHeader icon={<Medal className="size-6" />} eyebrow="Progreso" title="Ranking" subtitle="Tu posición frente a los demás estudiantes del país y de tu universidad." />

  if (!isSupabaseConfigured || status === 'disabled')
    return (
      <div>
        {header}
        <Preview reason="no-db" />
      </div>
    )
  if (status !== 'signed-in')
    return (
      <div>
        {header}
        <Preview reason="signed-out" />
      </div>
    )

  const unit = ORDERS.find((o) => o.value === order)!.unit
  const uniDisabled = !university || university === 'sin-decir'

  return (
    <div className="space-y-6">
      {header}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="relative overflow-hidden p-5">
          <div className="text-xs font-semibold text-muted">Tu posición en el país</div>
          <div className="mt-1 font-display text-3xl font-extrabold">{me ? `#${me.posicion_pais}` : '—'}</div>
          <div className="text-xs text-muted">{me ? `de ${me.total_pais} estudiantes` : 'Responde preguntas para entrar'}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold text-muted">En {university ? universityLabel(university) : 'tu universidad'}</div>
          <div className="mt-1 font-display text-3xl font-extrabold">{me && !uniDisabled ? `#${me.posicion_universidad}` : '—'}</div>
          <div className="text-xs text-muted">{me && !uniDisabled ? `de ${me.total_universidad} estudiantes` : uniDisabled ? 'Elige tu universidad en Mi plan' : '—'}</div>
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <button
            onClick={() => {
              updateSettings({ rankingShowName: !showName })
              setTimeout(() => void load(), 50)
            }}
            className="grid size-11 shrink-0 place-items-center rounded-xl surface-2"
            aria-label={showName ? 'Ocultar mi nombre' : 'Mostrar mi nombre'}
          >
            {showName ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </button>
          <div className="text-sm">
            <div className="font-semibold">{showName ? 'Sales con tu nombre' : 'Sales como «Estudiante»'}</div>
            <div className="text-xs text-muted">Toca para {showName ? 'ocultarlo' : 'mostrarlo'}. Solo primer nombre e inicial.</div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          value={scope}
          onChange={setScope}
          className="grid grid-cols-3 sm:inline-flex"
          options={[
            { value: 'pais', label: 'País' },
            { value: 'universidad', label: 'Mi universidad' },
            { value: 'universidades', label: 'Universidades' },
          ]}
        />
        {scope !== 'universidades' && <Segmented value={order} onChange={setOrder} className="grid grid-cols-4 sm:inline-flex" options={ORDERS.map((o) => ({ value: o.value, label: o.label }))} />}
      </div>

      {scope === 'universidad' && uniDisabled ? (
        <Card className="p-6 text-sm text-muted">
          Elige tu universidad en <Link to="/plan" className="font-semibold text-brand-700 underline dark:text-brand-400">Mi plan</Link> (rehacer el cuestionario) para ver el ranking de tus compañeros.
        </Card>
      ) : state === 'loading' ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton h-14 rounded-2xl" />
          ))}
        </div>
      ) : state === 'error' ? (
        <Card className="flex items-center justify-between gap-3 p-5 text-sm">
          <span>No se pudo cargar el ranking.</span>
          <button onClick={() => void load()} className="inline-flex items-center gap-1.5 font-semibold text-brand-700 dark:text-brand-400">
            <RefreshCw className="size-4" /> Reintentar
          </button>
        </Card>
      ) : scope === 'universidades' ? (
        unis.length ? (
          <ol className="space-y-2">
            {unis.map((u, i) => (
              <motion.li key={u.universidad} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }} className={cn('card flex items-center gap-3 p-3.5', u.universidad === university && 'border-brand-500/50 bg-brand-500/[0.06]')}>
                <Podium pos={i + 1} />
                <Landmark className="size-5 shrink-0 text-muted" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{universityLabel(u.universidad)}</div>
                  <div className="text-xs text-muted">
                    {u.estudiantes} estudiantes · {Math.round(u.acierto * 100)} % de precisión
                  </div>
                </div>
                <div className="text-right text-sm font-bold tabular-nums">{u.xp_promedio.toLocaleString('es-DO')} XP</div>
              </motion.li>
            ))}
          </ol>
        ) : (
          <Card className="flex items-center gap-3 p-6 text-sm text-muted">
            <Users className="size-5 shrink-0" /> Las universidades aparecen cuando tienen al menos 3 estudiantes en el ranking. Invita a tus compañeros.
          </Card>
        )
      ) : rows.length ? (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <motion.li key={`${r.posicion}-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }} className={cn('card flex items-center gap-3 p-3.5', r.es_yo && 'border-brand-500/50 bg-brand-500/[0.06]')}>
              <Podium pos={r.posicion} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">
                  {r.nombre}
                  {r.es_yo && <span className="ml-1.5 text-xs font-bold text-brand-700 dark:text-brand-400">(tú)</span>}
                </div>
                <div className="truncate text-xs text-muted">
                  {r.universidad ? universityLabel(r.universidad) : 'Sin universidad'} · racha de {r.racha} {r.racha === 1 ? 'día' : 'días'}
                </div>
              </div>
              <div className="text-right text-sm font-bold whitespace-nowrap tabular-nums">{unit(r)}</div>
            </motion.li>
          ))}
        </ol>
      ) : (
        <Card className="p-6 text-sm text-muted">{order === 'accuracy' ? 'Para salir en precisión hace falta responder al menos 50 preguntas.' : 'Todavía no hay nadie aquí. ¡Sé el primero!'}</Card>
      )}

      {state === 'ready' && !published && (
        <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">No se pudo actualizar tu resumen ahora mismo; lo que ves puede no incluir tu último progreso. Se reintenta al seguir estudiando.</p>
      )}
      <p className="text-xs text-muted">
        Aparecen todas las cuentas activas en los últimos 120 días, incluso las que apenas empiezan. Tu resumen (preguntas, precisión, tiempo, XP y racha) se actualiza cada vez que se sincroniza tu progreso; tus respuestas no se comparten.
      </p>
    </div>
  )
}
