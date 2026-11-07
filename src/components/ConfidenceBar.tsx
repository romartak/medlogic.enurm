import { CONFIDENCE_LABEL, type Confidence } from '@/lib/metacog'
import { cn } from '@/lib/utils'

const OPTIONS: { value: Confidence; hint: string; on: string }[] = [
  { value: 'seguro', hint: 'Lo sé', on: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  { value: 'dudo', hint: 'Entre dos', on: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  { value: 'adivino', hint: 'Al azar', on: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300' },
]

/** «¿Qué tan seguro estás?»: se elige antes de responder; es opcional. */
export function ConfidenceBar({ value, onChange, onHide }: { value: Confidence | null; onChange: (v: Confidence | null) => void; onHide: () => void }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span id="conf-label" className="text-xs font-semibold text-muted">
        ¿Qué tan seguro estás?
      </span>
      <div role="radiogroup" aria-labelledby="conf-label" className="flex gap-1.5">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            data-track="confianza"
            onClick={() => onChange(value === o.value ? null : o.value)}
            className={cn('relative inline-flex h-8 items-center gap-1.5 rounded-full border-2 px-3 text-xs font-semibold transition-colors after:absolute after:-inset-y-1.5 after:inset-x-0', value === o.value ? o.on : 'border-soft text-muted hover:border-brand-500/50')}
          >
            {CONFIDENCE_LABEL[o.value]}
            <span className="hidden font-normal opacity-70 sm:inline">· {o.hint}</span>
          </button>
        ))}
      </div>
      <button type="button" onClick={onHide} className="relative ml-auto text-xs text-muted underline-offset-2 after:absolute after:-inset-3 hover:underline">
        No preguntar
      </button>
    </div>
  )
}
