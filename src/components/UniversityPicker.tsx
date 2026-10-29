import { useState } from 'react'
import { Check, Landmark, Search } from 'lucide-react'
import { UNIVERSITIES, UNIVERSITY_NEEDS_NAME, UNIVERSITY_OTHER } from '@/data/universities'
import { cn } from '@/lib/utils'

/** Buscador de universidades (cuestionario y Configuración). */
export function UniversityPicker({ value, other, onChange }: { value: string | null; other: string; onChange: (id: string, other: string) => void }) {
  const [q, setQ] = useState('')
  const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const nq = norm(q.trim())
  const match = (u: { name: string; short: string; city?: string }) => !nq || norm(`${u.name} ${u.short} ${u.city ?? ''}`).includes(nq)
  const common = UNIVERSITIES.filter((u) => u.common && match(u))
  const rest = UNIVERSITIES.filter((u) => !u.common && match(u))
  const row = (id: string, title: string, sub: string) => (
    <button
      key={id}
      type="button"
      onClick={() => onChange(id, UNIVERSITY_NEEDS_NAME.has(id) ? other : '')}
      aria-pressed={value === id}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors',
        value === id ? 'border-brand-500 bg-brand-500/10' : 'border-soft bg-[var(--surface)] hover:border-brand-500/40',
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted">{sub}</span>
      </span>
      {value === id && <Check className="size-4 shrink-0 text-brand-600 dark:text-brand-400" />}
    </button>
  )
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca por nombre, siglas o ciudad…" className="h-12 w-full rounded-2xl border border-soft bg-[var(--surface)] pr-4 pl-12 outline-none focus:border-brand-500" />
      </div>
      <div className="-mx-1 max-h-[46dvh] space-y-4 overflow-y-auto px-1">
        {common.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold tracking-wide text-muted uppercase">Las más elegidas</div>
            {common.map((u) => row(u.id, `${u.short} · ${u.name}`, u.city))}
          </div>
        )}
        {rest.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold tracking-wide text-muted uppercase">Todas las demás</div>
            {rest.map((u) => row(u.id, `${u.short} · ${u.name}`, u.city))}
          </div>
        )}
        <div className="space-y-2">
          <div className="text-xs font-semibold tracking-wide text-muted uppercase">Otras opciones</div>
          {UNIVERSITY_OTHER.map((u) => row(u.id, u.name, u.id === 'extranjera' ? 'Estudiaste fuera del país' : u.id === 'otra' ? 'Si no aparece en la lista' : 'No se mostrará en el ranking por universidad'))}
        </div>
      </div>
      {value && UNIVERSITY_NEEDS_NAME.has(value) && (
        <div className="flex items-center gap-3 rounded-2xl border border-soft bg-[var(--surface)] p-3">
          <Landmark className="size-5 shrink-0 text-brand-600 dark:text-brand-400" />
          <input autoFocus value={other} onChange={(e) => onChange(value, e.target.value.slice(0, 80))} placeholder={value === 'extranjera' ? 'Nombre de la universidad y país' : 'Nombre de tu universidad'} className="h-10 min-w-0 flex-1 bg-transparent outline-none" />
        </div>
      )}
    </div>
  )
}
