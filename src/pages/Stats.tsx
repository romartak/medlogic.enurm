import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Area, AreaChart, CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartColumn, Clock, Flame, Target, Trophy } from 'lucide-react'
import { useProgress } from '@/store/progress'
import { useBank } from '@/store/bank'
import { bestStreak, computeStreak, dailySeries, overview, predictedScore, specialtyStats } from '@/lib/stats'
import { Card, EmptyState, PageHeader, ProgressBar, Segmented, SpecialtyIcon, StatCard } from '@/components/ui/primitives'
import { getSpecialty } from '@/data/specialties'
import { addDays, dayKey, formatDate, pct } from '@/lib/utils'

const tooltipStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, color: 'var(--text)' }

function Heatmap({ activity }: { activity: Record<string, { answered: number; cards: number }> }) {
  const weeks = 20
  const today = new Date()
  const start = addDays(today, -today.getDay() - (weeks - 1) * 7)
  const cells: { key: string; v: number; date: Date }[] = []
  for (let i = 0; i < (weeks - 1) * 7 + today.getDay() + 1; i++) {
    const d = addDays(start, i)
    if (d > today) break
    const a = activity[dayKey(d)]
    cells.push({ key: dayKey(d), v: a ? a.answered + a.cards : 0, date: d })
  }
  const max = Math.max(10, ...cells.map((c) => c.v))
  const level = (v: number) => (v === 0 ? 0 : v < max * 0.25 ? 1 : v < max * 0.5 ? 2 : v < max * 0.75 ? 3 : 4)
  const colors = ['var(--surface-2)', 'rgb(6 196 176 / 0.3)', 'rgb(6 196 176 / 0.55)', 'rgb(6 196 176 / 0.8)', '#06c4b0']
  const columns: (typeof cells)[] = []
  cells.forEach((c, i) => {
    const col = Math.floor(i / 7)
    ;(columns[col] ??= []).push(c)
  })
  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((c) => (
              <motion.div key={c.key} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.015 }} title={`${formatDate(c.date.getTime())}: ${c.v} actividades`} className="size-3 rounded-[3px] sm:size-3.5" style={{ backgroundColor: colors[level(c.v)] }} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-muted">
        Menos
        {colors.map((c) => (
          <span key={c} className="size-3 rounded-[3px]" style={{ backgroundColor: c }} />
        ))}
        Más
      </div>
    </div>
  )
}

export default function Stats() {
  const { attempts, activity, exams } = useProgress()
  const questions = useBank((s) => s.questions)
  const [range, setRange] = useState<14 | 30 | 90>(30)
  const ov = overview(attempts, activity, questions.length)
  const stats = useMemo(() => specialtyStats(attempts, questions), [attempts, questions])
  const series = dailySeries(activity, range)
  const predicted = predictedScore(stats)
  const radar = stats
    .filter((s) => s.answered > 0)
    .sort((a, b) => b.answered - a.answered)
    .slice(0, 8)
    .map((s) => ({ name: getSpecialty(s.specialty).short, value: Math.round(s.accuracy * 100) }))
  const examSeries = [...exams].reverse().map((e, i) => ({ n: i + 1, score: pct(e.correct, e.total), label: formatDate(e.date, { day: 'numeric', month: 'short' }) }))

  if (ov.answered === 0 && Object.keys(activity).length === 0) {
    return (
      <div>
        <PageHeader icon={<ChartColumn className="size-6" />} title="Estadísticas" />
        <EmptyState icon={<ChartColumn className="size-7" />} title="Aún no hay datos" body="Responde preguntas, haz un simulacro o repasa flashcards y aquí verás tu evolución." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={<ChartColumn className="size-6" />} title="Estadísticas" subtitle="Mide tu progreso y enfoca tu tiempo donde más rinde." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={<Target className="size-5" />} label="Respondidas" value={ov.answered.toLocaleString('es-DO')} hint={`${Math.round(ov.accuracy * 100)}% de precisión`} color="#06c4b0" />
        <StatCard icon={<Clock className="size-5" />} label="Tiempo de estudio" value={`${Math.floor(ov.minutes / 60)} h ${ov.minutes % 60} m`} color="#6366f1" delay={0.05} />
        <StatCard icon={<Flame className="size-5" />} label="Racha actual / mejor" value={`${computeStreak(activity)} / ${bestStreak(activity)}`} hint="días" color="#f97316" delay={0.1} />
        <StatCard icon={<Trophy className="size-5" />} label="Puntaje estimado" value={predicted === null ? '—' : `${predicted}%`} hint="ponderado por especialidad" color="#ec4899" delay={0.15} />
      </div>

      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Actividad y precisión</h2>
          <Segmented value={range} onChange={setRange} options={[{ value: 14, label: '14 d' }, { value: 30, label: '30 d' }, { value: 90, label: '90 d' }]} />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="st-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06c4b0" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#06c4b0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} minTickGap={20} />
              <YAxis yAxisId="l" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis yAxisId="r" orientation="right" domain={[0, 100]} hide />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => (name === 'accuracy' ? [`${v}%`, 'Precisión'] : [v, 'Preguntas'])} />
              <Area yAxisId="l" type="monotone" dataKey="answered" stroke="#06c4b0" strokeWidth={2} fill="url(#st-area)" />
              <Area yAxisId="r" type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2} fill="none" connectNulls dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-[#06c4b0]" /> Preguntas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-[#6366f1]" /> Precisión
          </span>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 font-semibold">Calendario de estudio</h2>
          <Heatmap activity={activity} />
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="mb-2 font-semibold">Perfil por especialidad</h2>
          {radar.length < 3 ? (
            <p className="py-10 text-center text-sm text-muted">Responde preguntas de al menos 3 especialidades para ver tu radar.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} outerRadius="72%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Precisión']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {examSeries.length > 1 && (
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 font-semibold">Evolución en simulacros</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={examSeries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Puntaje']} />
                <Line type="monotone" dataKey="score" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4, fill: '#ec4899' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card className="p-5 sm:p-6">
        <h2 className="mb-4 font-semibold">Detalle por especialidad</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-3 font-medium">Especialidad</th>
                <th className="pb-3 font-medium">Respondidas</th>
                <th className="w-1/4 pb-3 font-medium">Precisión</th>
                <th className="w-1/4 pb-3 font-medium">Cobertura</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => {
                const sp = getSpecialty(s.specialty)
                return (
                  <tr key={s.specialty} className="border-t border-soft">
                    <td className="py-3">
                      <span className="flex items-center gap-3">
                        <SpecialtyIcon id={s.specialty} size="sm" />
                        <span className="font-medium">{sp.name}</span>
                      </span>
                    </td>
                    <td className="py-3 tabular-nums">{s.answered}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={s.accuracy} color={s.accuracy >= 0.7 ? '#10b981' : s.accuracy >= 0.5 ? '#f59e0b' : s.answered ? '#ef4444' : undefined} height="h-1.5" />
                        <span className="w-10 text-right tabular-nums">{s.answered ? `${Math.round(s.accuracy * 100)}%` : '—'}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={s.seen / s.total} color={sp.color} height="h-1.5" />
                        <span className="w-16 text-right text-xs text-muted tabular-nums">
                          {s.seen}/{s.total}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
