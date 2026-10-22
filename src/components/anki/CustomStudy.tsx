import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button, Toggle } from '@/components/ui/primitives'
import { useAnki } from '@/store/anki'
import { ALL_DECK, PATH_PREFIX, SPEC_PREFIX } from '@/lib/anki/collection'
import { toast } from '@/store/toasts'
import { cn } from '@/lib/utils'

type Mode = 'more-new' | 'more-review' | 'forgotten' | 'ahead' | 'preview' | 'cram'

const MODES: { id: Mode; title: string; body: string }[] = [
  { id: 'more-new', title: 'Aumentar el límite de nuevas de hoy', body: 'Suma tarjetas nuevas solo por hoy.' },
  { id: 'more-review', title: 'Aumentar el límite de repasos de hoy', body: 'Útil si te atrasaste.' },
  { id: 'forgotten', title: 'Repasar tarjetas olvidadas', body: 'Las que respondiste "Otra vez" en los últimos días.' },
  { id: 'ahead', title: 'Repasar por adelantado', body: 'Tarjetas que vencen en los próximos días (antes de un examen).' },
  { id: 'preview', title: 'Previsualizar nuevas', body: 'Ver tarjetas nuevas agregadas recientemente sin programarlas.' },
  { id: 'cram', title: 'Estudiar por estado o etiqueta', body: 'Sesión intensiva con una selección de tarjetas.' },
]

/** Consulta de búsqueda que representa un mazo (real, virtual o nodo padre). */
export function deckQuery(key: string, name: string): string {
  if (key === ALL_DECK) return ''
  if (key.startsWith(SPEC_PREFIX)) return `spec:${key.slice(SPEC_PREFIX.length)}`
  return `deck:"${key.startsWith(PATH_PREFIX) ? key.slice(PATH_PREFIX.length) : name}"`
}

export function CustomStudy({ deckKey, deckName, open, onClose }: { deckKey: string; deckName: string; open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const extendLimits = useAnki((s) => s.extendLimits)
  const addDeck = useAnki((s) => s.addDeck)
  const decks = useAnki((s) => s.decks)
  const [mode, setMode] = useState<Mode>('more-new')
  const [n, setN] = useState(10)
  const [state, setState] = useState<'all' | 'new' | 'due' | 'leech' | 'flag'>('all')
  const [tag, setTag] = useState('')
  const [reschedule, setReschedule] = useState(false)

  const run = () => {
    const base = deckQuery(deckKey, deckName)
    if (mode === 'more-new' || mode === 'more-review') {
      extendLimits(deckKey, mode === 'more-new' ? n : 0, mode === 'more-review' ? n : 0)
      toast({ kind: 'success', title: 'Límite ampliado solo por hoy' })
      onClose()
      navigate(`/flashcards/${encodeURIComponent(deckKey)}/estudiar`)
      return
    }
    let query = base
    let limit = 9999
    let resched = true
    let order: 'random' | 'due' | 'added' | 'lapses' = 'due'
    if (mode === 'forgotten') query += ` rated:${n}:1`
    if (mode === 'ahead') query += ` -is:new prop:due<=${n}`
    if (mode === 'preview') {
      query += ` is:new added:${n}`
      resched = false
      order = 'added'
    }
    if (mode === 'cram') {
      query += state === 'new' ? ' is:new' : state === 'due' ? ' is:due' : state === 'leech' ? ' is:leech' : state === 'flag' ? ' -flag:0' : ''
      if (tag.trim()) query += ` tag:${tag.trim()}`
      limit = n
      resched = reschedule
      order = 'random'
    }
    // Como Anki: la sesión personalizada reemplaza a la anterior.
    const existing = decks.find((d) => d.name === 'Sesión personalizada')
    if (existing) useAnki.setState({ decks: decks.filter((d) => d.id !== existing.id) })
    const id = addDeck('Sesión personalizada', { filtered: { query: query.trim(), limit, order, reschedule: resched }, description: `Mazo filtrado: ${query.trim() || 'todas las tarjetas'}` })
    onClose()
    navigate(`/flashcards/${id}/estudiar`)
  }

  const label = mode === 'more-new' || mode === 'more-review' ? 'Cantidad extra' : mode === 'cram' ? 'Número de tarjetas' : 'Días'

  return (
    <Modal open={open} onClose={onClose} title={`Estudio personalizado · ${deckName}`} className="sm:max-w-xl">
      <div className="space-y-2">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} className={cn('w-full rounded-xl border-2 p-3 text-left transition-colors', mode === m.id ? 'border-brand-500 bg-brand-500/[0.06]' : 'border-soft hover:border-brand-500/40')}>
            <div className="text-sm font-semibold">{m.title}</div>
            <div className="text-xs text-muted">{m.body}</div>
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{label}</span>
          <input type="number" min={1} value={n} onChange={(e) => setN(Math.max(1, Number(e.target.value)))} className="mt-1.5 h-10 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500" />
        </label>
        {mode === 'cram' && (
          <>
            <label className="block">
              <span className="text-sm font-medium">Estado</span>
              <select value={state} onChange={(e) => setState(e.target.value as typeof state)} className="mt-1.5 h-10 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500">
                <option value="all">Todas (aleatorias)</option>
                <option value="new">Solo nuevas</option>
                <option value="due">Solo pendientes</option>
                <option value="leech">Sanguijuelas</option>
                <option value="flag">Con bandera</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Etiqueta (opcional)</span>
              <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="cardiologia" className="mt-1.5 h-10 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500" />
            </label>
            <div className="sm:col-span-2">
              <Toggle checked={reschedule} onChange={setReschedule} label="Reprogramar según mis respuestas" description="Si está apagado, la sesión no cambia cuándo vuelven a aparecer las tarjetas." />
            </div>
          </>
        )}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={run}>Empezar</Button>
      </div>
    </Modal>
  )
}
