import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, CircleHelp, EyeOff, Flag, Pause, Pencil, Play, RotateCcw, Search, Tag, Trash2, X } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { useAnki } from '@/store/anki'
import { compileSearch, SEARCH_HELP } from '@/lib/anki/search'
import { revlogByCard } from '@/lib/anki/collection'
import { dayNumber, maturityOf } from '@/lib/anki/scheduler'
import { plainText, renderCard } from '@/lib/anki/render'
import type { Card } from '@/lib/anki/types'
import { Button, Card as UICard, PageHeader } from '@/components/ui/primitives'
import { CardHtml, FLAGS, useNoteEditor } from '@/components/anki/common'
import { cn, formatDate } from '@/lib/utils'
import { toast } from '@/store/toasts'

type SortKey = 'sort' | 'deck' | 'due' | 'ivl' | 'ease' | 'reps' | 'lapses' | 'added'

const QUICK: { label: string; q: string }[] = [
  { label: 'Pendientes hoy', q: 'is:due' },
  { label: 'Nuevas', q: 'is:new' },
  { label: 'Aprendiendo', q: 'is:learn' },
  { label: 'En repaso', q: 'is:review' },
  { label: 'Suspendidas', q: 'is:suspended' },
  { label: 'Enterradas', q: 'is:buried' },
  { label: 'Sanguijuelas', q: 'is:leech' },
  { label: 'Marcadas', q: 'tag:marcada' },
  { label: 'Falladas hoy', q: 'rated:1:1' },
  { label: 'Agregadas hoy', q: 'added:1' },
]

export default function Browser() {
  const [params, setParams] = useSearchParams()
  const col = useCollection()
  const states = useAnki((s) => s.states)
  const revlog = useAnki((s) => s.revlog)
  const rollover = useAnki((s) => s.settings.rolloverHour)
  const patchStates = useAnki((s) => s.patchStates)
  const forget = useAnki((s) => s.forget)
  const deleteNotes = useAnki((s) => s.deleteNotes)
  const addTags = useAnki((s) => s.addTags)
  const removeTags = useAnki((s) => s.removeTags)
  const moveNotes = useAnki((s) => s.moveNotes)
  const openEditor = useNoteEditor((s) => s.open)

  const [query, setQuery] = useState(params.get('q') ?? '')
  const [applied, setApplied] = useState(params.get('q') ?? '')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'sort', dir: 1 })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [active, setActive] = useState<string | null>(null)
  const [limit, setLimit] = useState(150)
  const [help, setHelp] = useState(false)

  const byCard = useMemo(() => revlogByCard(revlog), [revlog])
  const results = useMemo(() => {
    const pred = compileSearch(applied, { now: Date.now(), rolloverHour: rollover, deckName: (id) => col.deckById.get(id)?.name ?? '', state: (id) => states[id], revlog: byCard })
    const list = col.cards.filter(pred)
    const val = (c: Card): number | string => {
      const s = states[c.id]
      switch (sort.key) {
        case 'deck':
          return col.deckById.get(c.deckId)?.name ?? ''
        case 'due':
          return s && s.type !== 'new' ? s.due : Number.MAX_SAFE_INTEGER
        case 'ivl':
          return s?.interval ?? 0
        case 'ease':
          return s?.ease ?? 0
        case 'reps':
          return s?.reps ?? 0
        case 'lapses':
          return s?.lapses ?? 0
        case 'added':
          return c.note.createdAt
        default:
          return plainText(c.note.front).toLowerCase()
      }
    }
    return list.sort((a, b) => {
      const x = val(a)
      const y = val(b)
      return (typeof x === 'string' ? x.localeCompare(y as string, 'es') : x - (y as number)) * sort.dir
    })
  }, [applied, col, states, byCard, rollover, sort])

  const tags = useMemo(() => {
    const m = new Map<string, number>()
    for (const n of col.notes) for (const t of n.tags) m.set(t, (m.get(t) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)
  }, [col.notes])

  const run = (q: string) => {
    setQuery(q)
    setApplied(q)
    setSelected(new Set())
    setLimit(150)
    setParams(q ? { q } : {}, { replace: true })
  }

  const selCards = results.filter((c) => selected.has(c.id))
  const selNotes = [...new Map(selCards.map((c) => [c.noteId, c.note])).values()]
  const ids = selCards.map((c) => c.id)
  const today = dayNumber(Date.now(), rollover)
  const activeCard = results.find((c) => c.id === active) ?? null
  const activeRender = activeCard ? renderCard(activeCard) : null

  const header = (k: SortKey, label: string, cls = '') => (
    <th className={cn('cursor-pointer px-3 py-2.5 font-semibold whitespace-nowrap select-none hover:text-[var(--text)]', cls)} onClick={() => setSort({ key: k, dir: sort.key === k ? ((-sort.dir) as 1 | -1) : 1 })}>
      <span className="inline-flex items-center gap-1">
        {label}
        {sort.key === k && (sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
      </span>
    </th>
  )

  const act = (msg: string, fn: () => void) => {
    if (!selCards.length) return
    fn()
    toast({ kind: 'success', title: msg })
  }

  return (
    <div>
      <Link to="/flashcards" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)]">
        <ArrowLeft className="size-4" /> Mazos
      </Link>
      <PageHeader icon={<Search className="size-6" />} title="Explorar tarjetas" subtitle="Busca con la sintaxis de Anki, selecciona y aplica acciones en lote." />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          run(query)
        }}
        className="mb-4 flex gap-2"
      >
        <label className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='deck:"ENURM*" is:due tag:cardio' className="h-11 w-full rounded-xl border border-soft bg-[var(--surface)] pr-9 pl-10 font-mono text-sm outline-none focus:border-brand-500" />
          {query && (
            <button type="button" onClick={() => run('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted" aria-label="Limpiar">
              <X className="size-4" />
            </button>
          )}
        </label>
        <Button type="submit">Buscar</Button>
        <Button type="button" variant="ghost" onClick={() => setHelp(!help)} aria-label="Ayuda de búsqueda">
          <CircleHelp className="size-4" />
        </Button>
      </form>

      {help && (
        <UICard className="mb-4 grid gap-x-6 gap-y-1.5 p-4 text-xs sm:grid-cols-2">
          {SEARCH_HELP.map(([q, d]) => (
            <button key={q} onClick={() => run(q)} className="flex gap-3 text-left hover:text-brand-600">
              <code className="shrink-0 rounded bg-brand-500/10 px-1.5 text-brand-700 dark:text-brand-300">{q}</code>
              <span className="text-muted">{d}</span>
            </button>
          ))}
        </UICard>
      )}

      <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
        <aside className="hidden space-y-5 text-sm lg:block">
          <div>
            <div className="mb-1.5 text-xs font-bold tracking-wider text-muted uppercase">Estado</div>
            {QUICK.map((f) => (
              <button key={f.q} onClick={() => run(f.q)} className={cn('block w-full rounded-lg px-2 py-1 text-left hover:bg-slate-900/5 dark:hover:bg-white/5', applied === f.q && 'bg-brand-500/10 text-brand-700 dark:text-brand-300')}>
                {f.label}
              </button>
            ))}
          </div>
          <div>
            <div className="mb-1.5 text-xs font-bold tracking-wider text-muted uppercase">Banderas</div>
            <div className="flex flex-wrap gap-1.5 px-2">
              {FLAGS.map((f) => (
                <button key={f.n} title={f.name} onClick={() => run(`flag:${f.n}`)} className="size-5 rounded-full" style={{ backgroundColor: f.color }} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-xs font-bold tracking-wider text-muted uppercase">Mazos</div>
            {col.decks
              .filter((d) => !d.filtered)
              .map((d) => (
                <button key={d.id} onClick={() => run(`deck:"${d.name}"`)} className="block w-full truncate rounded-lg px-2 py-1 text-left hover:bg-slate-900/5 dark:hover:bg-white/5" title={d.name}>
                  {d.name}
                </button>
              ))}
          </div>
          <div>
            <div className="mb-1.5 text-xs font-bold tracking-wider text-muted uppercase">Etiquetas</div>
            <div className="flex flex-wrap gap-1 px-1">
              {tags.map(([t, n]) => (
                <button key={t} onClick={() => run(`tag:${t}`)} className="rounded-md surface-2 px-1.5 py-0.5 text-xs text-muted hover:text-[var(--text)]">
                  {t} <span className="opacity-60">{n}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="mr-2 text-muted">
              {results.length} tarjetas{selected.size ? ` · ${selected.size} seleccionadas` : ''}
            </span>
            {selected.size > 0 && (
              <>
                <Button size="sm" variant="outline" onClick={() => act('Suspendidas', () => patchStates(ids, { suspended: true }))}>
                  <Pause className="size-3.5" /> Suspender
                </Button>
                <Button size="sm" variant="outline" onClick={() => act('Reactivadas', () => patchStates(ids, { suspended: false, buriedUntil: undefined }))}>
                  <Play className="size-3.5" /> Reactivar
                </Button>
                <Button size="sm" variant="outline" onClick={() => act('Enterradas hasta mañana', () => patchStates(ids, { buriedUntil: today }))}>
                  <EyeOff className="size-3.5" /> Enterrar
                </Button>
                <select
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (!Number.isNaN(v)) act('Bandera aplicada', () => patchStates(ids, { flag: v }))
                    e.target.value = ''
                  }}
                  defaultValue=""
                  className="h-8 rounded-lg border border-soft bg-[var(--surface)] px-2 text-xs"
                  aria-label="Bandera"
                >
                  <option value="" disabled>
                    Bandera…
                  </option>
                  <option value="0">Sin bandera</option>
                  {FLAGS.map((f) => (
                    <option key={f.n} value={f.n}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <select
                  onChange={(e) => {
                    if (e.target.value) act('Notas movidas', () => moveNotes(selNotes, e.target.value))
                    e.target.value = ''
                  }}
                  defaultValue=""
                  className="h-8 max-w-40 rounded-lg border border-soft bg-[var(--surface)] px-2 text-xs"
                  aria-label="Cambiar mazo"
                >
                  <option value="" disabled>
                    Cambiar mazo…
                  </option>
                  {col.decks
                    .filter((d) => !d.filtered && d.id !== 'mis-errores')
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </select>
                <Button size="sm" variant="ghost" onClick={() => { const t = window.prompt('Etiquetas a agregar (separadas por espacio)'); if (t) act('Etiquetas agregadas', () => addTags(selNotes, t.split(/\s+/).filter(Boolean))) }}>
                  <Tag className="size-3.5" /> +Etiqueta
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { const t = window.prompt('Etiquetas a quitar'); if (t) act('Etiquetas quitadas', () => removeTags(selNotes, t.split(/\s+/).filter(Boolean))) }}>
                  <Tag className="size-3.5" /> −Etiqueta
                </Button>
                <Button size="sm" variant="ghost" onClick={() => window.confirm('¿Reiniciar el progreso de las tarjetas seleccionadas? Volverán a ser nuevas.') && act('Tarjetas reiniciadas', () => forget(ids))}>
                  <RotateCcw className="size-3.5" /> Olvidar
                </Button>
                {selNotes.every((n) => n.source === 'user') && (
                  <Button size="sm" variant="ghost" className="text-rose-500" onClick={() => window.confirm(`¿Eliminar ${selNotes.length} notas?`) && act('Notas eliminadas', () => { deleteNotes(selNotes.map((n) => n.id)); setSelected(new Set()) })}>
                    <Trash2 className="size-3.5" /> Eliminar
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <UICard className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr className="border-b border-soft">
                    <th className="w-8 px-3 py-2.5">
                      <input
                        type="checkbox"
                        aria-label="Seleccionar todo"
                        checked={results.length > 0 && selected.size === results.length}
                        onChange={(e) => setSelected(e.target.checked ? new Set(results.map((c) => c.id)) : new Set())}
                        className="accent-[var(--color-brand-500)]"
                      />
                    </th>
                    {header('sort', 'Frente')}
                    {header('deck', 'Mazo', 'hidden md:table-cell')}
                    {header('due', 'Vence')}
                    {header('ivl', 'Intervalo')}
                    {header('ease', 'Facilidad', 'hidden md:table-cell')}
                    {header('lapses', 'Olvidos', 'hidden md:table-cell')}
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, limit).map((c) => {
                    const s = states[c.id]
                    const m = s?.suspended ? 'suspended' : maturityOf(s)
                    const flag = s?.flag ? FLAGS.find((f) => f.n === s.flag) : undefined
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setActive(c.id)}
                        onDoubleClick={() => openEditor({ noteId: c.noteId })}
                        className={cn('cursor-pointer border-b border-soft transition-colors', active === c.id ? 'bg-brand-500/10' : s?.suspended ? 'bg-amber-500/[0.06]' : 'hover:bg-slate-900/[0.02] dark:hover:bg-white/[0.02]')}
                      >
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            aria-label="Seleccionar"
                            checked={selected.has(c.id)}
                            onChange={(e) => {
                              const n = new Set(selected)
                              if (e.target.checked) n.add(c.id)
                              else n.delete(c.id)
                              setSelected(n)
                            }}
                            className="accent-[var(--color-brand-500)]"
                          />
                        </td>
                        <td className="max-w-xs px-3 py-2">
                          <span className="flex items-center gap-2">
                            {flag && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: flag.color }} />}
                            <span className="truncate">{plainText(c.note.type === 'cloze' ? c.note.front : c.ord === 1 ? c.note.back : c.note.front)}</span>
                          </span>
                        </td>
                        <td className="hidden max-w-[180px] truncate px-3 py-2 text-xs text-muted md:table-cell">{col.deckById.get(c.deckId)?.name}</td>
                        <td className="px-3 py-2 text-xs whitespace-nowrap">
                          {m === 'suspended' ? <span className="text-amber-600">Suspendida</span> : !s || s.type === 'new' ? <span className="text-sky-500">Nueva</span> : formatDate(s.due, { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-3 py-2 text-xs">{s?.interval ? `${s.interval} d` : '—'}</td>
                        <td className="hidden px-3 py-2 text-xs md:table-cell">{s?.ease ? `${Math.round(s.ease * 100)} %` : '—'}</td>
                        <td className="hidden px-3 py-2 text-xs md:table-cell">{s?.lapses ?? 0}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {results.length > limit && (
                <div className="p-3 text-center">
                  <Button variant="ghost" size="sm" onClick={() => setLimit(limit + 300)}>
                    Mostrar más ({results.length - limit})
                  </Button>
                </div>
              )}
              {results.length === 0 && <p className="p-8 text-center text-sm text-muted">Sin resultados.</p>}
            </UICard>

            <UICard className="h-fit p-4 xl:sticky xl:top-24">
              {activeCard && activeRender ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted uppercase">Vista previa</span>
                    <Button size="sm" variant="outline" onClick={() => openEditor({ noteId: activeCard.noteId })}>
                      <Pencil className="size-3.5" /> Editar
                    </Button>
                  </div>
                  <div className="rounded-xl surface-2 p-3 text-center text-sm">
                    <CardHtml html={activeRender.front} />
                  </div>
                  <div className="rounded-xl border border-brand-500/30 p-3 text-center text-sm">
                    <CardHtml html={activeRender.back} />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeCard.note.tags.map((t) => (
                      <span key={t} className="rounded-md surface-2 px-1.5 py-0.5 text-xs text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Flag className="size-4 text-muted" />
                    {FLAGS.map((f) => (
                      <button key={f.n} title={f.name} onClick={() => patchStates([activeCard.id], (st) => ({ flag: st.flag === f.n ? 0 : f.n }))} className={cn('size-4 rounded-full', states[activeCard.id]?.flag === f.n && 'ring-2 ring-offset-2 ring-offset-[var(--surface)]')} style={{ backgroundColor: f.color }} />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted">
                  Selecciona una tarjeta para verla.
                  <br />
                  Doble clic para editar.
                </p>
              )}
            </UICard>
          </div>
        </div>
      </div>
    </div>
  )
}
