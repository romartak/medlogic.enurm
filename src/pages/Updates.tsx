import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarDays, Check, Newspaper } from 'lucide-react'
import { UPDATES } from '@/data/updates'
import { getSpecialty } from '@/data/specialties'
import { Badge, Chip, PageHeader, SpecialtyBadge } from '@/components/ui/primitives'
import { cn, formatDate } from '@/lib/utils'

export default function Updates() {
  const location = useLocation()
  const [spec, setSpec] = useState<string | null>(null)
  const sorted = useMemo(() => [...UPDATES].sort((a, b) => b.date.localeCompare(a.date)), [])
  const specs = [...new Set(sorted.map((u) => u.specialty))]
  const list = sorted.filter((u) => !spec || u.specialty === spec)
  const highlighted = location.hash.slice(1)

  useEffect(() => {
    if (highlighted) setTimeout(() => document.getElementById(highlighted)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
  }, [highlighted])

  return (
    <div>
      <PageHeader icon={<Newspaper className="size-6" />} title="Actualizaciones médicas" subtitle="Cambios recientes en guías clínicas internacionales que conviene conocer para el examen y la práctica." />
      <div className="mb-8 flex flex-wrap gap-2">
        <Chip active={!spec} onClick={() => setSpec(null)}>
          Todas
        </Chip>
        {specs.map((s) => (
          <Chip key={s} active={spec === s} onClick={() => setSpec(spec === s ? null : s)} color={getSpecialty(s).color}>
            {getSpecialty(s).short}
          </Chip>
        ))}
      </div>

      <div className="relative">
        <div className="absolute top-2 bottom-2 left-[19px] w-px bg-gradient-to-b from-brand-500/60 via-brand-500/25 to-transparent sm:left-[23px]" />
        <ul className="space-y-6">
          {list.map((u, i) => {
            const s = getSpecialty(u.specialty)
            return (
              <motion.li key={u.id} id={u.id} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: Math.min(i, 4) * 0.05 }} className="relative flex gap-4 sm:gap-6">
                <span className="relative z-10 mt-5 grid size-10 shrink-0 place-items-center rounded-full border-4 border-[var(--bg)] text-white sm:size-12" style={{ backgroundColor: s.color }}>
                  <CalendarDays className="size-4 sm:size-5" />
                </span>
                <article className={cn('card flex-1 p-5 sm:p-6', highlighted === u.id && 'ring-2 ring-brand-500')}>
                  <div className="flex flex-wrap items-center gap-2">
                    <SpecialtyBadge id={u.specialty} />
                    <Badge color={u.impact === 'Alto' ? '#ef4444' : '#f59e0b'}>Impacto {u.impact.toLowerCase()}</Badge>
                    <span className="ml-auto text-xs text-muted">{formatDate(u.date + '-01', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  <h2 className="mt-3 text-lg leading-snug font-bold sm:text-xl">{u.title}</h2>
                  <div className="mt-1 text-xs font-medium text-brand-600 dark:text-brand-400">{u.source}</div>
                  <p className="mt-3 text-sm text-muted">{u.summary}</p>
                  <ul className="mt-4 space-y-2">
                    {u.keyPoints.map((k) => (
                      <li key={k} className="flex gap-2.5 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0" style={{ color: s.color }} />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </motion.li>
            )
          })}
        </ul>
      </div>
      <p className="mt-10 text-center text-xs text-muted">Resúmenes educativos. Consulta siempre la publicación original antes de aplicarlos en la práctica clínica.</p>
    </div>
  )
}
