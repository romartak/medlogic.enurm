import { create } from 'zustand'
import { cn } from '@/lib/utils'

/** Banderas de color como en Anki (1–7). */
export const FLAGS = [
  { n: 1, name: 'Roja', color: '#ef4444' },
  { n: 2, name: 'Naranja', color: '#f97316' },
  { n: 3, name: 'Verde', color: '#22c55e' },
  { n: 4, name: 'Azul', color: '#3b82f6' },
  { n: 5, name: 'Rosa', color: '#ec4899' },
  { n: 6, name: 'Turquesa', color: '#14b8a6' },
  { n: 7, name: 'Morada', color: '#8b5cf6' },
]

export function CardHtml({ html, className }: { html: string; className?: string }) {
  // El HTML ya viene sanitizado por renderCard/sanitizeHtml.
  return <div className={cn('anki-content', className)} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Números de colores de Anki: nuevas (azul), aprendiendo (rojo), pendientes (verde). */
export function CountTriplet({ n, l, r, active, size = 'sm' }: { n: number; l: number; r: number; active?: 'new' | 'learn' | 'review'; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'text-2xl font-display font-extrabold' : 'text-sm font-semibold tabular-nums'
  return (
    <span className={cn('inline-flex items-center gap-3', cls)}>
      <span className={cn('text-sky-500', !n && 'opacity-30', active === 'new' && 'underline decoration-2 underline-offset-4')}>{n}</span>
      <span className={cn('text-rose-500', !l && 'opacity-30', active === 'learn' && 'underline decoration-2 underline-offset-4')}>{l}</span>
      <span className={cn('text-emerald-500', !r && 'opacity-30', active === 'review' && 'underline decoration-2 underline-offset-4')}>{r}</span>
    </span>
  )
}

interface EditorRequest {
  noteId?: string
  prefill?: { front?: string; back?: string; extra?: string; deckId?: string; tags?: string[]; specialty?: string; type?: 'basic' | 'reversed' | 'cloze' }
}

/** Estado global del editor de notas (se abre desde cualquier parte: preguntas, explorador, repaso). */
export const useNoteEditor = create<{ request: EditorRequest | null; open: (r?: EditorRequest) => void; close: () => void }>((set) => ({
  request: null,
  open: (r = {}) => set({ request: r }),
  close: () => set({ request: null }),
}))
