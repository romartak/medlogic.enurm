import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Info } from 'lucide-react'
import { useBank } from '@/store/bank'
import { examYears, hotTopics, RECENT_WINDOW, specialtiesByAppearances } from '@/lib/hot'
import { getSpecialty } from '@/data/specialties'
import { Card, PageHeader } from '@/components/ui/primitives'

const ROWS = 30

export default function HotTopics() {
  const questions = useBank((s) => s.questions)
  const [specialty, setSpecialty] = useState('')
  const years = useMemo(() => examYears(questions), [questions])
  const specialties = useMemo(() => specialtiesByAppearances(questions), [questions])
  const topics = useMemo(() => hotTopics(questions, specialty || undefined), [questions, specialty])
  const top = topics.slice(0, 3)
  const rows = topics.slice(0, ROWS)
  const max = Math.max(1, ...rows.flatMap((t) => Object.values(t.byYear)))
  const last = years[years.length - 1]

  if (!years.length) {
    return (
      <div>
        <PageHeader icon={<Flame className="size-6" />} title="Temas calientes del ENURM" subtitle="Qué temas se repiten año tras año." />
        <Card className="p-6 text-sm text-muted">Todavía no hay datos de años de aparición en el banco cargado.</Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={<Flame className="size-6" />} eyebrow={`ENURM ${years[0]}–${last}`} title="Temas calientes" subtitle="Qué temas se repiten año tras año en los exámenes recopilados, para estudiar primero lo que más sale." />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex w-full flex-col gap-1.5 text-sm font-medium sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          Especialidad
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="h-11 w-full rounded-xl border border-soft bg-[var(--surface)] px-3 text-sm outline-none focus:border-brand-500 sm:w-auto">
            <option value="">Todas</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {getSpecialty(s.id).name}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-muted">{topics.length} temas con apariciones</span>
      </div>

      <section aria-labelledby="top3" className="grid gap-3 sm:grid-cols-3">
        <h2 id="top3" className="sr-only">
          Los temas más constantes
        </h2>
        {top.map((t, i) => (
          <Card key={`${t.specialty}-${t.topic}`} className="flex flex-col p-4">
            <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">#{i + 1} más constante</span>
            <span className="mt-1 font-display font-bold text-balance">{t.topic}</span>
            <span className="text-xs text-muted">{getSpecialty(t.specialty).name}</span>
            <span className="mt-3 text-sm">
              Salió en <b>{t.recentYears}</b> de los últimos {RECENT_WINDOW} años · {t.total} apariciones
            </span>
            <Link to={`/practica?specialty=${t.specialty}`} className="mt-3 inline-flex h-11 items-center justify-center rounded-xl bg-brand-500/10 px-4 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-500/20 dark:text-brand-300">
              Practicar {getSpecialty(t.specialty).short}
            </Link>
          </Card>
        ))}
      </section>

      <Card className="p-0">
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 className="font-semibold">Mapa de calor: tema × año</h2>
          <span className="text-xs text-muted">más oscuro = más preguntas</span>
        </div>
        <div className="overflow-x-auto px-2 pb-5 sm:px-5" tabIndex={0} role="region" aria-label="Mapa de calor de temas por año, desplazable">
          <table className="mt-3 w-full min-w-[820px] border-separate border-spacing-[3px] text-xs">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 w-56 bg-[var(--surface)] pr-2 text-left font-semibold text-muted">
                  Tema
                </th>
                {years.map((y) => (
                  <th key={y} scope="col" className="w-7 text-center font-medium text-muted tabular-nums">
                    {String(y).slice(2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={`${t.specialty}-${t.topic}`}>
                  <th scope="row" className="sticky left-0 z-10 max-w-56 truncate bg-[var(--surface)] pr-2 text-left font-medium" title={`${t.topic} · ${getSpecialty(t.specialty).name}`}>
                    {t.topic}
                  </th>
                  {years.map((y) => {
                    const n = t.byYear[y] ?? 0
                    return (
                      <td key={y} title={n ? `${y}: ${n} ${n === 1 ? 'pregunta' : 'preguntas'}` : `${y}: ninguna`} className="h-6 rounded-[5px] text-center text-[10px] font-bold tabular-nums" style={n ? { backgroundColor: `rgb(234 88 12 / ${0.18 + 0.82 * Math.sqrt(n / max)})`, color: n / max > 0.45 ? '#fff' : 'inherit' } : { backgroundColor: 'var(--surface-2)' }}>
                        {n ? n : <span className="sr-only">0</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="flex items-start gap-2 text-xs text-muted">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Se calcula con la recopilación de exámenes {years[0]}–{last}, agrupando preguntas parecidas. Que un tema se repita no garantiza que salga en el próximo examen: úsalo para priorizar, no para dejar temas fuera.
      </p>
    </div>
  )
}
