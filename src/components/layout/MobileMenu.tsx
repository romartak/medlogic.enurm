import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NavLink } from 'react-router-dom'
import { ChevronRight, LayoutGrid, Play, Search, Target, X } from 'lucide-react'
import { useProgress } from '@/store/progress'
import { cn } from '@/lib/utils'
import { ALL_NAV, NAV_GROUPS, type NavItem } from './nav'
import { useScrollLock } from '@/hooks/useScrollLock'

/** Accesos rápidos del teléfono: lo que más se abre además de la barra inferior. */
const QUICK = ['/simulacro', '/flashcards', '/casos', '/repaso', '/ecg']

function BigSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative mx-4 mt-3">
      <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-brand-600 dark:text-brand-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="¿Qué quieres hacer?"
        aria-label="Buscar función"
        enterKeyHint="search"
        className="h-14 w-full rounded-2xl border-2 border-brand-500/60 bg-[var(--surface)] pr-11 pl-12 text-[17px] shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-brand-500)_12%,transparent)] transition-colors placeholder:text-muted focus:border-brand-500 focus:outline-none"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Borrar búsqueda" className="absolute top-1/2 right-1.5 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

function Row({ item, onPick, hint }: { item: NavItem; onPick: () => void; hint?: string }) {
  return (
    <NavLink
      to={item.to}
      onClick={onPick}
      className={({ isActive }) => cn('flex min-h-14 items-center gap-3 border-b border-soft px-0.5 py-2 transition-colors active:bg-slate-900/5 dark:active:bg-white/5', isActive && 'bg-brand-500/[0.07]')}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
        <item.icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block leading-tight font-bold">{item.label}</span>
        <span className="line-clamp-2 block text-sm leading-snug text-muted">{hint ?? item.description}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted" />
    </NavLink>
  )
}

/** Retoma lo último que se estudió; si aún no hay nada, propone la primera práctica. */
function ResumeCard({ onPick }: { onPick: () => void }) {
  const last = useProgress((s) => s.lastSection)
  const item = last ? ALL_NAV.find((n) => n.to === last.to) : undefined
  const to = item?.to ?? '/practica?auto=1'
  const Icon = item?.icon ?? Target
  return (
    <NavLink to={to} onClick={onPick} className="flex items-center gap-3.5 rounded-3xl bg-brand-gradient p-4 pl-4 text-white active:brightness-95">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15">
        <Icon className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-white/80">{item ? 'Continúa donde lo dejaste' : 'Empieza ahora'}</span>
        <span className="block truncate text-[17px] leading-tight font-bold">{item ? item.label : 'La pregunta del día'}</span>
      </span>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-brand-700">
        <Play className="size-5 fill-current" />
      </span>
    </NavLink>
  )
}

/**
 * Panel con TODAS las funciones, pensado para llegar rápido: una búsqueda grande, retomar lo último, accesos rápidos
 * y las categorías plegadas (se abre una a la vez). Se abre desde la pestaña «Funciones» de la barra inferior;
 * en escritorio no existe (está la barra lateral).
 */
export function FunctionsSheet({ open, onClose, footer }: { open: boolean; onClose: () => void; footer?: ReactNode }) {
  const [query, setQuery] = useState('')
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [open, onClose])

  const q = query.trim().toLowerCase()
  const results = useMemo(() => (q ? ALL_NAV.filter((i) => `${i.label} ${i.description}`.toLowerCase().includes(q)) : []), [q])
  const quick = QUICK.map((to) => ALL_NAV.find((n) => n.to === to)).filter((n): n is NavItem => !!n)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div className="absolute inset-0 touch-none bg-slate-950/55" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Funciones"
            className="absolute inset-x-0 top-10 bottom-0 flex flex-col overscroll-none rounded-t-3xl bg-[var(--surface)] shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', transition: { duration: 0.22, ease: [0.77, 0, 0.175, 1] } }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="flex items-center justify-between gap-3 px-5 pt-4">
              <div>
                <p className="font-display text-xl font-extrabold">Funciones</p>
                <p className="text-sm text-muted">{q ? `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}` : 'Busca o elige una sección'}</p>
              </div>
              <button onClick={onClose} className="-mr-2 grid size-11 place-items-center rounded-xl text-muted" aria-label="Cerrar funciones">
                <X className="size-5" />
              </button>
            </div>
            <BigSearch value={query} onChange={setQuery} />

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">
              {q ? (
                results.length ? (
                  <div className="mt-3 border-t border-soft">
                    {results.map((i) => (
                      <Row key={i.to} item={i} onPick={onClose} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-10 text-center text-sm text-muted">No hay funciones que coincidan con «{query}».</p>
                )
              ) : (
                <>
                  <p className="mt-5 mb-2 px-1 text-xs font-bold tracking-[0.14em] text-muted uppercase">Retomar</p>
                  <ResumeCard onPick={onClose} />

                  <p className="mt-5 mb-2 px-1 text-xs font-bold tracking-[0.14em] text-muted uppercase">Accesos rápidos</p>
                  <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
                    {quick.map((i) => (
                      <NavLink key={i.to} to={i.to} onClick={onClose} className="flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-soft bg-[var(--surface)] pr-3.5 pl-2 text-sm font-semibold transition-transform active:scale-[0.96]">
                        <span className="grid size-7 place-items-center rounded-lg bg-brand-500/10 text-brand-700 dark:text-brand-300">
                          <i.icon className="size-4" />
                        </span>
                        {i.label}
                      </NavLink>
                    ))}
                  </div>

                  {/* Todas abiertas: quien no rebusca igual ve todo lo que ofrece la app. */}
                  {NAV_GROUPS.map((g) => (
                    <section key={g.title} aria-labelledby={`fx-${g.title}`}>
                      <h2 id={`fx-${g.title}`} className="mt-6 mb-1 px-1 font-display text-[17px] font-extrabold">
                        {g.title} <span className="ml-1 font-sans text-sm font-semibold text-muted">{g.items.length}</span>
                      </h2>
                      <div className="border-t border-soft">
                        {g.items.map((i) => (
                          <Row key={i.to} item={i} onPick={onClose} />
                        ))}
                      </div>
                    </section>
                  ))}
                </>
              )}
            </div>
            {footer && <div className="border-t border-soft px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/** Acceso a todas las funciones como una pestaña más de la barra inferior. */
export function FunctionsTab({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors ${active ? 'text-brand-600 dark:text-brand-400' : 'text-muted'}`}
    >
      {active && <motion.span layoutId="tab-active" className="absolute inset-x-3 inset-y-1 rounded-xl bg-brand-500/10" />}
      <LayoutGrid className="relative size-5" />
      <span className="relative min-[400px]:hidden">Más</span>
      <span className="relative max-[399px]:hidden">Funciones</span>
    </button>
  )
}
