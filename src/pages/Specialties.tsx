import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { BookOpen, Layers, LayoutGrid, Target } from 'lucide-react'
import { AREAS } from '@/data/areas'
import { getSpecialty } from '@/data/specialties'
import { GUIDES } from '@/data/guides'
import { BUILTIN_CARDS } from '@/data/flashcards'
import { useBank } from '@/store/bank'
import { useProgress } from '@/store/progress'
import { specialtyStats } from '@/lib/stats'
import { Icon } from '@/components/ui/Icon'
import { PageHeader, ProgressBar, Ring } from '@/components/ui/primitives'
import { cn, solidBg, tintText } from '@/lib/utils'

function useSpecialtyStats() {
  const questions = useBank((s) => s.questions)
  const attempts = useProgress((s) => s.attempts)
  return useMemo(() => specialtyStats(attempts, questions), [attempts, questions])
}

function AreaHeader({ area }: { area: (typeof AREAS)[number] }) {
  const stats = useSpecialtyStats()
  const areaStats = stats.filter((s) => area.specialties.includes(s.specialty))
  const answered = areaStats.reduce((a, s) => a + s.answered, 0)
  const correct = areaStats.reduce((a, s) => a + s.correct, 0)
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md" style={solidBg(area.color)}>
        <Icon name={area.icon} className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-lg font-bold">{area.name}</h2>
        <p className="text-xs text-muted">{area.description}</p>
      </div>
      {answered > 0 && <span className="text-sm font-semibold text-muted">{Math.round((correct / answered) * 100)}%</span>}
    </div>
  )
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

function SpecialtyLink({ id, description, large }: { id: string; description?: string; large?: boolean }) {
  const counts = useBank((s) => s.specialtyCounts)
  const st = useSpecialtyStats().find((x) => x.specialty === id)
  const s = getSpecialty(id)
  const guides = GUIDES.filter((g) => g.specialty === id).length
  const cards = BUILTIN_CARDS.filter((c) => c.specialty === id).length
  return (
    <Link to={`/especialidades/${id}`} className={cn('card card-hover group flex h-full items-center gap-4 p-4', large && 'sm:p-5')}>
      <Ring value={st?.answered ? st.accuracy : 0} size={large ? 64 : 56} stroke={5} color={s.color}>
        <span style={tintText(s.color)}>
          <Icon name={s.icon} className={large ? 'size-6' : 'size-5'} />
        </span>
      </Ring>
      <div className="min-w-0 flex-1">
        <div className={cn('font-semibold group-hover:text-brand-700 dark:group-hover:text-brand-300', large && 'font-display text-lg font-bold')}>{s.name}</div>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Target className="size-3" /> {plural(counts[id] ?? 0, 'pregunta', 'preguntas')}
          </span>
          {guides > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="size-3" /> {plural(guides, 'guía', 'guías')}
            </span>
          )}
          {cards > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="size-3" /> {plural(cards, 'tarjeta', 'tarjetas')}
            </span>
          )}
          {st?.answered ? <span className="font-semibold" style={tintText(s.color)}>{Math.round(st.accuracy * 100)}% precisión</span> : null}
        </div>
        <ProgressBar value={st && st.total ? st.seen / st.total : 0} color={s.color} height="h-1" className="mt-2" />
      </div>
    </Link>
  )
}

export default function Specialties() {
  // Las áreas con una sola especialidad (Pediatría, Ginecología…) se agrupan para no repetir el título.
  const blocks = useMemo(() => {
    const out: { areas: (typeof AREAS)[number][] }[] = []
    for (const a of AREAS) {
      const last = out[out.length - 1]
      if (a.specialties.length === 1 && last && last.areas.every((x) => x.specialties.length === 1)) last.areas.push(a)
      else out.push({ areas: [a] })
    }
    return out
  }, [])

  return (
    <div>
      <PageHeader icon={<LayoutGrid className="size-6" />} title="Especialidades" subtitle="Un espacio para cada área del examen: temas de alto rendimiento, perlas, preguntas, flashcards, guías y tu progreso." />

      <div className="space-y-10">
        {blocks.map((block, bi) => (
          <motion.section key={block.areas[0].id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: bi * 0.05 }}>
            {block.areas.length === 1 && block.areas[0].specialties.length > 1 ? (
              <>
                <AreaHeader area={block.areas[0]} />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {block.areas[0].specialties.map((id) => (
                    <SpecialtyLink key={id} id={id} />
                  ))}
                </div>
              </>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {block.areas.map((a) => (
                  <SpecialtyLink key={a.id} id={a.specialties[0]} description={a.description} large />
                ))}
              </div>
            )}
          </motion.section>
        ))}
      </div>
    </div>
  )
}
