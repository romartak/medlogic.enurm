import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import Fuse from 'fuse.js'
import { BookOpen, CornerDownLeft, FileQuestion, Layers, LayoutGrid, Search } from 'lucide-react'
import { ALL_NAV } from './nav'
import { useBank } from '@/store/bank'
import { GUIDES } from '@/data/guides'
import { BUILTIN_CARDS } from '@/data/flashcards'
import { getSpecialty, normalizeText, SPECIALTIES } from '@/data/specialties'
import { cn } from '@/lib/utils'

interface Result {
  key: string
  kind: 'page' | 'specialty' | 'question' | 'guide' | 'card'
  title: string
  subtitle?: string
  to: string
}

const KIND_LABEL: Record<Result['kind'], string> = { page: 'Páginas', specialty: 'Especialidades', question: 'Preguntas', guide: 'Guías', card: 'Flashcards' }

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const questions = useBank((s) => s.questions)

  const qFuse = useMemo(() => new Fuse(questions, { keys: [{ name: 'stem', weight: 2 }, 'topic', 'explanation', 'options'], threshold: 0.35, ignoreLocation: true, minMatchCharLength: 3 }), [questions])
  const gFuse = useMemo(() => new Fuse(GUIDES, { keys: ['title', 'summary', 'sections.heading', 'sections.bullets'], threshold: 0.35, ignoreLocation: true }), [])
  const cFuse = useMemo(() => new Fuse(BUILTIN_CARDS, { keys: ['front', 'back'], threshold: 0.3, ignoreLocation: true }), [])

  const results = useMemo<Result[]>(() => {
    const q = query.trim()
    const pages: Result[] = ALL_NAV.filter((n) => !q || n.label.toLowerCase().includes(q.toLowerCase()) || n.description.toLowerCase().includes(q.toLowerCase())).map((n) => ({
      key: `p-${n.to}`,
      kind: 'page',
      title: n.label,
      subtitle: n.description,
      to: n.to,
    }))
    if (q.length < 2) return pages.slice(0, 8)
    const nq = normalizeText(q)
    const specs: Result[] = SPECIALTIES.filter((s) => normalizeText(`${s.name} ${s.aliases.join(' ')}`).includes(nq)).slice(0, 3).map((s) => ({ key: `s-${s.id}`, kind: 'specialty', title: s.name, subtitle: 'Espacio de la especialidad', to: `/especialidades/${s.id}` }))
    const guides: Result[] = gFuse.search(q, { limit: 4 }).map(({ item }) => ({ key: `g-${item.id}`, kind: 'guide', title: item.title, subtitle: getSpecialty(item.specialty).name, to: `/guias/${item.id}` }))
    const qs: Result[] = qFuse.search(q, { limit: 6 }).map(({ item }) => ({
      key: `q-${item.id}`,
      kind: 'question',
      title: item.stem,
      subtitle: [getSpecialty(item.specialty).name, item.year, item.topic].filter(Boolean).join(' · '),
      to: `/banco?id=${encodeURIComponent(item.id)}`,
    }))
    const cards: Result[] = cFuse.search(q, { limit: 3 }).map(({ item }) => ({ key: `c-${item.id}`, kind: 'card', title: item.front, subtitle: item.back, to: `/flashcards/${item.deck}` }))
    return [...pages.slice(0, 4), ...specs, ...guides, ...qs, ...cards]
  }, [query, qFuse, gFuse, cFuse])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = (r: Result | undefined) => {
    if (!r) return
    navigate(r.to)
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(results.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(results[active])
    } else if (e.key === 'Escape') onClose()
  }

  let lastKind: string | null = null

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-[8vh] sm:p-4 sm:pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-slate-950/55" onClick={onClose} />
          <motion.div
            className="card relative w-full max-w-2xl overflow-hidden shadow-2xl"
            initial={{ y: -12, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -12, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-soft px-4">
              <Search className="size-5 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca un tema, fármaco, signo… (p. ej. «preeclampsia»)"
                className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
                aria-label="Buscar"
              />
              <span className="kbd">Esc</span>
            </div>
            <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
              {results.length === 0 && <div className="px-4 py-10 text-center text-sm text-muted">Sin resultados para «{query}».</div>}
              {results.map((r, i) => {
                const header = r.kind !== lastKind ? KIND_LABEL[r.kind] : null
                lastKind = r.kind
                const IconC = r.kind === 'question' ? FileQuestion : r.kind === 'guide' ? BookOpen : r.kind === 'card' ? Layers : r.kind === 'specialty' ? LayoutGrid : (ALL_NAV.find((n) => n.to === r.to)?.icon ?? Search)
                return (
                  <div key={r.key}>
                    {header && <div className="px-3 pt-3 pb-1 text-xs font-bold tracking-[0.18em] text-muted uppercase">{header}</div>}
                    <button
                      data-idx={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(r)}
                      className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors', i === active ? 'bg-brand-500/10' : '')}
                    >
                      <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', i === active ? 'bg-brand-500 text-white' : 'surface-2 text-muted')}>
                        <IconC className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-sm font-medium">{r.title}</span>
                        {r.subtitle && <span className="line-clamp-1 text-xs text-muted">{r.subtitle}</span>}
                      </span>
                      {i === active && <CornerDownLeft className="size-4 text-muted" />}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="hidden items-center gap-4 border-t border-soft px-4 py-2 text-xs text-muted sm:flex">
              <span className="flex items-center gap-1">
                <span className="kbd">↑</span>
                <span className="kbd">↓</span> navegar
              </span>
              <span className="flex items-center gap-1">
                <span className="kbd">↵</span> abrir
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
