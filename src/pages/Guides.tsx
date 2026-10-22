import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'motion/react'
import { ArrowLeft, BookOpen, Check, CircleCheck, Clock, Lightbulb, Play, Search, TriangleAlert } from 'lucide-react'
import { GUIDES } from '@/data/guides'
import { getSpecialty, normalizeText, slugify } from '@/data/specialties'
import { useProgress } from '@/store/progress'
import { Badge, Button, Card, Chip, EmptyState, PageHeader, SpecialtyBadge, SpecialtyIcon } from '@/components/ui/primitives'
import { cn, tintText } from '@/lib/utils'
import { GuidePractice } from '@/components/GuidePractice'
import { celebrate } from '@/lib/fx'

export default function Guides() {
  const guidesRead = useProgress((s) => s.guidesRead)
  const [query, setQuery] = useState('')
  const [spec, setSpec] = useState<string | null>(null)
  const specs = [...new Set(GUIDES.map((g) => g.specialty))]

  const list = useMemo(() => {
    const q = normalizeText(query)
    return GUIDES.filter((g) => (!spec || g.specialty === spec) && (!q || normalizeText(`${g.title} ${g.summary}`).includes(q)))
  }, [query, spec])

  return (
    <div>
      <PageHeader icon={<BookOpen className="size-6" />} title="Guías de estudio" subtitle="Resúmenes de alto rendimiento con tablas, perlas y alertas de lo que más se pregunta." />
      <div className="mb-6 flex flex-col gap-4">
        <label className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar guía…" className="h-11 w-full rounded-xl border border-soft bg-[var(--surface)] pr-3 pl-10 text-sm outline-none focus:border-brand-500" />
        </label>
        <div className="flex flex-wrap gap-2">
          <Chip active={!spec} onClick={() => setSpec(null)}>
            Todas
          </Chip>
          {specs.map((s) => (
            <Chip key={s} active={spec === s} onClick={() => setSpec(spec === s ? null : s)} color={getSpecialty(s).color}>
              {getSpecialty(s).short}
            </Chip>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Search className="size-7" />} title="No se encontraron guías" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g, i) => {
            const s = getSpecialty(g.specialty)
            const read = guidesRead.includes(g.id)
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/guias/${g.id}`} className="card card-hover group relative flex h-full flex-col overflow-hidden p-5">
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
                  <div className="flex items-start justify-between">
                    <SpecialtyIcon id={g.specialty} />
                    {read && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                        <Check className="size-3" /> Leída
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-lg leading-snug font-bold group-hover:text-brand-600 dark:group-hover:text-brand-400">{g.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-muted">{g.summary}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" /> {g.minutes} min
                    </span>
                    <span>·</span>
                    <span>{g.level}</span>
                    <span>·</span>
                    <span style={tintText(s.color)}>{s.short}</span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function GuideDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const guide = GUIDES.find((g) => g.id === id)
  const read = useProgress((s) => (id ? s.guidesRead.includes(id) : false))
  const markRead = useProgress((s) => s.markGuideRead)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  if (!guide) return <EmptyState icon={<BookOpen className="size-7" />} title="Guía no encontrada" action={<Link to="/guias" className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">Ver guías</Link>} />

  const s = getSpecialty(guide.specialty)
  const idx = GUIDES.indexOf(guide)
  const nextGuide = GUIDES[(idx + 1) % GUIDES.length]

  return (
    <div>
      <motion.div className="fixed inset-x-0 top-16 z-20 h-1 origin-left bg-brand-gradient lg:left-64" style={{ scaleX }} />
      <Link to="/guias" className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)]">
        <ArrowLeft className="size-4" /> Guías
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
        <article className="min-w-0">
          <header className="mb-8">
            <SpecialtyBadge id={guide.specialty} />
            <h1 className="mt-3 text-3xl leading-tight font-extrabold sm:text-4xl">{guide.title}</h1>
            <p className="mt-3 text-lg text-muted">{guide.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>
                <Clock className="size-3" /> {guide.minutes} min de lectura
              </Badge>
              <Badge>{guide.level}</Badge>
              <a href="#practicar" onClick={(e) => (e.preventDefault(), document.getElementById('practicar')?.scrollIntoView({ behavior: 'smooth' }))} className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-semibold text-brand-800 hover:bg-brand-500/15 dark:text-brand-200">
                Al final: practícala ↓
              </a>
            </div>
          </header>

          <div className="space-y-6">
            {guide.sections.map((sec, i) => (
              <motion.section key={i} id={slugify(sec.heading)} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} className="card scroll-mt-24 p-5 sm:p-7">
                <h2 className="flex items-center gap-3 text-xl font-bold">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: s.color }}>
                    {i + 1}
                  </span>
                  {sec.heading}
                </h2>
                <div className="prose-guide mt-4 space-y-4 text-[15px]">
                  {sec.body && <p>{sec.body}</p>}
                  {sec.bullets && (
                    <ul className="space-y-2">
                      {sec.bullets.map((b, j) => (
                        <li key={j} className="flex gap-3">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {sec.table && (
                    <ul className="space-y-2 sm:hidden">
                      {sec.table.rows.map((r, j) => (
                        <li key={j} className="rounded-xl border border-soft p-3.5">
                          <div className="font-semibold">{r[0]}</div>
                          <dl className="mt-2 space-y-1.5 text-sm">
                            {r.slice(1).map((c, k) => (
                              <div key={k}>
                                <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">{sec.table!.head[k + 1]}</dt>
                                <dd className="leading-relaxed">{c}</dd>
                              </div>
                            ))}
                          </dl>
                        </li>
                      ))}
                    </ul>
                  )}
                  {sec.table && (
                    <div className="-mx-1 overflow-x-auto rounded-xl border border-soft max-sm:hidden">
                      <table className="w-full min-w-[480px] text-left text-sm">
                        <thead>
                          <tr className="surface-2">
                            {sec.table.head.map((h, j) => (
                              <th key={j} className="px-4 py-2.5 font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sec.table.rows.map((r, j) => (
                            <tr key={j} className="border-t border-soft">
                              {r.map((c, k) => (
                                <td key={k} className={cn('px-4 py-2.5 align-top', k === 0 && 'font-medium')}>
                                  {c}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {sec.pearl && (
                    <div className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-4">
                      <Lightbulb className="size-5 shrink-0 text-amber-500" />
                      <div>
                        <div className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">Perla ENURM</div>
                        <p className="mt-1 text-sm">{sec.pearl}</p>
                      </div>
                    </div>
                  )}
                  {sec.warning && (
                    <div className="flex gap-3 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] p-4">
                      <TriangleAlert className="size-5 shrink-0 text-rose-500" />
                      <div>
                        <div className="text-xs font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">Atención</div>
                        <p className="mt-1 text-sm">{sec.warning}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>
            ))}
          </div>

          <GuidePractice key={guide.id} guide={guide} />

          <Card className="mt-6 p-5 sm:p-6">
            <h3 className="text-sm font-semibold">Referencias</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {guide.references.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Resumen educativo. Verifica siempre la guía original vigente y los protocolos nacionales.</p>
          </Card>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              variant={read ? 'secondary' : 'primary'}
              className="flex-1"
              onClick={() => {
                if (!read) celebrate('small')
                markRead(guide.id)
              }}
              disabled={read}
            >
              <CircleCheck className="size-5" /> {read ? 'Guía completada' : 'Marcar como leída (+15 XP)'}
            </Button>
            <Button size="lg" variant="outline" className="flex-1" onClick={() => navigate(`/practica?specialty=${guide.specialty}&auto=1`)}>
              <Play className="size-5" /> Practicar {s.short}
            </Button>
          </div>

          <Link to={`/guias/${nextGuide.id}`} className="card card-hover mt-6 flex items-center justify-between p-5">
            <div>
              <div className="text-xs text-muted">Siguiente guía</div>
              <div className="font-semibold">{nextGuide.title}</div>
            </div>
            <ArrowLeft className="size-5 rotate-180 text-muted" />
          </Link>
        </article>

        <aside className="hidden lg:block">
          <nav className="sticky top-24">
            <div className="mb-3 text-[10px] font-bold tracking-[0.18em] text-muted uppercase">En esta guía</div>
            <ul className="space-y-1 border-l border-soft">
              {guide.sections.map((sec) => (
                <li key={sec.heading}>
                  <a href={`#${slugify(sec.heading)}`} onClick={(e) => (e.preventDefault(), document.getElementById(slugify(sec.heading))?.scrollIntoView({ behavior: 'smooth' }))} className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-sm text-muted hover:border-brand-500 hover:text-[var(--text)]">
                    {sec.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  )
}
