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

export default function Specialties() {
  const questions = useBank((s) => s.questions)
  const counts = useBank((s) => s.specialtyCounts)
  const attempts = useProgress((s) => s.attempts)
  const stats = useMemo(() => specialtyStats(attempts, questions), [attempts, questions])

  return (
    <div>
      <PageHeader icon={<LayoutGrid className="size-6" />} title="Especialidades" subtitle="Un espacio para cada área del examen: temas de alto rendimiento, perlas, preguntas, flashcards, guías y tu progreso." />

      <div className="space-y-10">
        {AREAS.map((area, ai) => {
          const areaStats = stats.filter((s) => area.specialties.includes(s.specialty))
          const answered = areaStats.reduce((a, s) => a + s.answered, 0)
          const correct = areaStats.reduce((a, s) => a + s.correct, 0)
          return (
            <motion.section key={area.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ai * 0.05 }}>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl text-white shadow-md" style={{ background: `linear-gradient(135deg, ${area.color}, ${area.color}aa)` }}>
                  <Icon name={area.icon} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-bold">{area.name}</h2>
                  <p className="truncate text-xs text-muted">{area.description}</p>
                </div>
                {answered > 0 && <span className="text-sm font-semibold text-muted">{Math.round((correct / answered) * 100)}%</span>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {area.specialties.map((id, i) => {
                  const s = getSpecialty(id)
                  const st = stats.find((x) => x.specialty === id)
                  const guides = GUIDES.filter((g) => g.specialty === id).length
                  const cards = BUILTIN_CARDS.filter((c) => c.specialty === id).length
                  return (
                    <motion.div key={id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: ai * 0.05 + i * 0.03 }}>
                      <Link to={`/especialidades/${id}`} className="card card-hover group relative flex items-center gap-4 overflow-hidden p-4">
                        <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: s.color }} />
                        <Ring value={st?.answered ? st.accuracy : 0} size={56} stroke={5} color={s.color}>
                          <span style={{ color: s.color }}>
                            <Icon name={s.icon} className="size-5" />
                          </span>
                        </Ring>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400">{s.name}</div>
                          <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted">
                            <span className="flex items-center gap-1">
                              <Target className="size-3" /> {counts[id] ?? 0}
                            </span>
                            {guides > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="size-3" /> {guides}
                              </span>
                            )}
                            {cards > 0 && (
                              <span className="flex items-center gap-1">
                                <Layers className="size-3" /> {cards}
                              </span>
                            )}
                            {st?.answered ? <span className="font-semibold" style={{ color: s.color }}>{Math.round(st.accuracy * 100)}% precisión</span> : null}
                          </div>
                          <ProgressBar value={st && st.total ? st.seen / st.total : 0} color={s.color} height="h-1" className="mt-2" />
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>
          )
        })}
      </div>
    </div>
  )
}
