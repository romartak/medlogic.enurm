import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NavLink } from 'react-router-dom'
import { LayoutGrid, Search, X } from 'lucide-react'
import { ALL_NAV, NAV_GROUPS } from './nav'

const FILTER_INPUT =
  'h-10 w-full rounded-xl border border-soft bg-[var(--surface)] pl-9 pr-8 text-sm placeholder:text-muted focus:border-brand-500/50 focus:outline-none'

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar función…"
        aria-label="Buscar función"
        className={FILTER_INPUT}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Borrar búsqueda"
          className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

/** Tarjetas de dos columnas con la descripción de cada función. */
function DetailGrid({ groups, onPick }: { groups: typeof NAV_GROUPS; onPick: () => void }) {
  return (
    <>
      {groups.map((group) => (
        <section key={group.title} className="mt-4">
          <h3 className="text-[10px] font-bold tracking-[0.18em] text-muted uppercase">{group.title}</h3>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onPick}
                  className={({ isActive }) =>
                    `flex h-full gap-2.5 rounded-xl border p-2.5 transition-colors ${
                      isActive ? 'border-brand-500/40 bg-brand-500/10' : 'border-soft hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <item.icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11.5px] leading-tight font-bold">{item.label}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[10px] leading-snug text-muted">{item.description}</span>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}

/**
 * Panel con TODAS las funciones, en tarjetas de dos columnas que explican para qué sirve cada una.
 * Se abre desde la pestaña «Funciones» de la barra inferior; en escritorio no existe (está la barra lateral).
 */
export function FunctionsSheet({ open, onClose, footer }: { open: boolean; onClose: () => void; footer?: React.ReactNode }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return NAV_GROUPS
    return NAV_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((i) => `${i.label} ${i.description}`.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0)
  }, [query])

  const total = filtered.reduce((n, g) => n + g.items.length, 0)

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Funciones"
            className="absolute inset-x-0 bottom-0 top-10 flex flex-col rounded-t-3xl bg-[var(--surface)] shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="border-b border-soft px-4 pt-3 pb-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-extrabold">Funciones</p>
                  <p className="text-xs text-muted">
                    {query ? `${total} ${total === 1 ? 'resultado' : 'resultados'}` : `${ALL_NAV.length} funciones en MedLogic`}
                  </p>
                </div>
                <button onClick={onClose} className="grid size-11 place-items-center rounded-xl text-muted" aria-label="Cerrar funciones">
                  <X className="size-5" />
                </button>
              </div>
              <div className="mt-2.5">
                <SearchBox value={query} onChange={setQuery} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              {total === 0 && <p className="mt-8 text-center text-sm text-muted">No hay funciones que coincidan con «{query}».</p>}
              <DetailGrid groups={filtered} onPick={onClose} />
            </div>
            {footer && <div className="border-t border-soft px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Acceso a todas las funciones como una pestaña más de la barra inferior. */
export function FunctionsTab({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors ${active ? 'text-brand-600 dark:text-brand-400' : 'text-muted'}`}
    >
      {active && <motion.span layoutId="tab-active" className="absolute inset-x-3 inset-y-1 rounded-xl bg-brand-500/10" />}
      <LayoutGrid className="relative size-5" />
      <span className="relative">Funciones</span>
    </button>
  )
}
