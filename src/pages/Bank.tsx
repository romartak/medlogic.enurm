import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Bookmark, Check, ChevronLeft, ChevronRight, Filter, Library, Search, X } from 'lucide-react'
import { useBank } from '@/store/bank'
import { useProgress } from '@/store/progress'
import { filterQuestions, type StatusFilter } from '@/lib/selection'
import { SpecialtyPicker, YearPicker } from '@/components/Filters'
import { Badge, Button, Card, EmptyState, PageHeader, Segmented, SpecialtyBadge } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { QuestionCard } from '@/components/QuestionCard'
import { cn } from '@/lib/utils'

const PER_PAGE = 20

export default function Bank() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const questions = useBank((s) => s.questions)
  const byId = useBank((s) => s.byId)
  const { attempts, bookmarks } = useProgress()
  const [search, setSearch] = useState(() => params.get('q') ?? '')
  const [specialties, setSpecialties] = useState<string[]>(() => (params.get('specialty') ? [params.get('specialty')!] : []))
  const [years, setYears] = useState<number[]>([])
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(0)
  const [showFilters, setShowFilters] = useState(() => params.has('specialty'))

  const list = useMemo(() => filterQuestions(questions, { specialties, years, status, search }, attempts, bookmarks), [questions, specialties, years, status, search, attempts, bookmarks])
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE))
  const current = list.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const openId = params.get('id')
  const open = openId ? byId.get(openId) : undefined
  const openIndex = open ? list.findIndex((q) => q.id === open.id) : -1

  const setOpen = (id: string | null) => {
    const p = new URLSearchParams(params)
    if (id) p.set('id', id)
    else p.delete('id')
    setParams(p, { replace: true })
  }
  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v)
    setPage(0)
  }
  const activeFilters = specialties.length + years.length + (status !== 'all' ? 1 : 0)

  return (
    <div>
      <PageHeader
        icon={<Library className="size-6" />}
        title="Banco de preguntas"
        subtitle={`${questions.length.toLocaleString('es-DO')} preguntas. Busca, filtra y revisa con la respuesta y la explicación.`}
        actions={
          <Button variant="outline" onClick={() => navigate('/practica')}>
            Practicar
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
            placeholder="Buscar en enunciados, opciones y temas…"
            className="h-11 w-full rounded-xl border border-soft bg-[var(--surface)] pr-9 pl-10 text-sm outline-none focus:border-brand-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted" aria-label="Limpiar búsqueda">
              <X className="size-4" />
            </button>
          )}
        </label>
        <Button variant={showFilters ? 'secondary' : 'outline'} onClick={() => setShowFilters(!showFilters)}>
          <Filter className="size-4" /> Filtros {activeFilters > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand-500 text-xs text-white">{activeFilters}</span>}
        </Button>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 space-y-5 p-5">
            <div>
              <div className="mb-2 text-sm font-semibold">Especialidad</div>
              <SpecialtyPicker value={specialties} onChange={resetPage(setSpecialties)} />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">Año</div>
              <YearPicker value={years} onChange={resetPage(setYears)} />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">Estado</div>
              <Segmented className="flex-wrap" value={status} onChange={resetPage(setStatus)} options={[{ value: 'all', label: 'Todas' }, { value: 'unseen', label: 'No vistas' }, { value: 'failed', label: 'Falladas' }, { value: 'bookmarked', label: 'Marcadas' }, { value: 'highyield', label: 'High yield' }]} />
            </div>
          </Card>
        </motion.div>
      )}

      <div className="mb-3 text-sm text-muted">{list.length.toLocaleString('es-DO')} resultados</div>

      {list.length === 0 ? (
        <EmptyState icon={<Search className="size-7" />} title="Sin resultados" body="Prueba con otros términos o quita algunos filtros." />
      ) : (
        <div className="space-y-2">
          {current.map((q, i) => {
            const a = attempts[q.id]
            return (
              <motion.button key={q.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }} onClick={() => setOpen(q.id)} className="card card-hover flex w-full items-start gap-3 p-4 text-left">
                <span className={cn('mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg', !a ? 'surface-2 text-muted' : a.lastCorrect ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600')}>
                  {!a ? <span className="size-1.5 rounded-full bg-current" /> : a.lastCorrect ? <Check className="size-4" /> : <X className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-medium">{q.stem}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-1.5">
                    <SpecialtyBadge id={q.specialty} />
                    {q.year && <Badge>{q.year}</Badge>}
                    {q.topic && <Badge>{q.topic}</Badge>}
                    {bookmarks.includes(q.id) && <Bookmark className="size-3.5 fill-amber-500/30 text-amber-500" />}
                  </span>
                </span>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted" />
              </motion.button>
            )
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="size-4" /> Anterior
          </Button>
          <span className="text-sm text-muted tabular-nums">
            {page + 1} / {pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>
            Siguiente <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} className="sm:max-w-3xl">
        {open && (
          <>
            <QuestionCard question={open} mode="review" selected={attempts[open.id]?.lastChoice ?? null} compact />
            {openIndex >= 0 && (
              <div className="mt-4 flex justify-between">
                <Button variant="ghost" size="sm" disabled={openIndex <= 0} onClick={() => setOpen(list[openIndex - 1].id)}>
                  <ChevronLeft className="size-4" /> Anterior
                </Button>
                <Button variant="ghost" size="sm" disabled={openIndex >= list.length - 1} onClick={() => setOpen(list[openIndex + 1].id)}>
                  Siguiente <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
