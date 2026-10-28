import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Clock, PartyPopper, Play, Plus, Search, Settings2, Sparkles, Trash2 } from 'lucide-react'
import { useCollection, useQueueInputFactory } from '@/hooks/useCollection'
import { useAnki } from '@/store/anki'
import { buildQueues } from '@/lib/anki/queue'
import { deckLabel, SPEC_PREFIX } from '@/lib/anki/collection'
import { maturityOf } from '@/lib/anki/scheduler'
import { Button, Card } from '@/components/ui/primitives'
import { useNoteEditor } from '@/components/anki/common'
import { DeckOptions } from '@/components/anki/DeckOptions'
import { CustomStudy, deckQuery } from '@/components/anki/CustomStudy'
import { useHotkeys } from '@/hooks/useHotkeys'

export default function Overview() {
  const { deckId = 'todas' } = useParams()
  const key = decodeURIComponent(deckId)
  const navigate = useNavigate()
  const col = useCollection()
  const factory = useQueueInputFactory(col)
  const states = useAnki((s) => s.states)
  const deleteDeck = useAnki((s) => s.deleteDeck)
  const openEditor = useNoteEditor((s) => s.open)
  const [options, setOptions] = useState(false)
  const [custom, setCustom] = useState(false)

  const deck = col.deckById.get(key)
  const name = deckLabel(col, key)
  const input = factory(key)
  const q = buildQueues(input)
  // En un mazo filtrado todas sus tarjetas cuentan como pendientes (como en Anki).
  const c = deck?.filtered
    ? { ...q.counts, new: input.cards.filter((x) => !states[x.id] || states[x.id].type === 'new').length, learn: 0, review: input.cards.filter((x) => states[x.id] && states[x.id].type !== 'new').length, nextLearnAt: null }
    : q.counts
  const nothing = c.new + c.learn + c.review === 0
  const study = () => navigate(`/flashcards/${encodeURIComponent(key)}/estudiar`)

  const dist = { new: 0, learning: 0, young: 0, mature: 0, suspended: 0 }
  for (const card of input.cards) {
    const s = states[card.id]
    if (s?.suspended) dist.suspended++
    else dist[maturityOf(s)]++
  }
  const totalCards = input.cards.length || 1

  useHotkeys((e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !nothing) {
      e.preventDefault()
      study()
    } else if (e.key.toLowerCase() === 'o') setOptions(true)
    else if (e.key.toLowerCase() === 'c') setCustom(true)
  }, !options && !custom)

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/flashcards" className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)]">
        <ArrowLeft className="size-4" /> Mazos
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="p-6 text-center sm:p-10">
            <div className="text-xs font-semibold tracking-wider text-muted uppercase">{deck?.filtered ? 'Mazo filtrado' : key.startsWith(SPEC_PREFIX) ? 'Especialidad' : 'Mazo'}</div>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{name}</h1>
            {deck?.description && <p className="mx-auto mt-2 max-w-lg text-sm text-muted">{deck.description}</p>}

            {nothing ? (
              <div className="mt-8">
                <motion.div initial={{ scale: 0.6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="mx-auto grid size-20 place-items-center rounded-3xl bg-brand-gradient text-white shadow-glow">
                  <PartyPopper className="size-9" />
                </motion.div>
                <h2 className="mt-5 text-xl font-bold">¡Terminaste este mazo por hoy!</h2>
                {c.nextLearnAt ? (
                  <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted">
                    <Clock className="size-4" /> Una tarjeta en aprendizaje vuelve a las {new Date(c.nextLearnAt).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted">Vuelve mañana o usa el estudio personalizado para seguir.</p>
                )}
                <Button variant="outline" className="mt-5" onClick={() => setCustom(true)}>
                  <Sparkles className="size-4" /> Estudio personalizado
                </Button>
              </div>
            ) : (
              <>
                <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
                  {[
                    { n: c.new, l: 'Nuevas', cls: 'text-sky-500 bg-sky-500/10' },
                    { n: c.learn, l: 'Aprendiendo', cls: 'text-rose-500 bg-rose-500/10' },
                    { n: c.review, l: 'Pendientes', cls: 'text-emerald-500 bg-emerald-500/10' },
                  ].map((x, i) => (
                    <motion.div key={x.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }} className={`rounded-2xl p-4 ${x.cls}`}>
                      <div className="font-display text-3xl font-extrabold">{x.n}</div>
                      <div className="text-xs font-semibold opacity-80">{x.l}</div>
                    </motion.div>
                  ))}
                </div>
                <Button size="lg" className="mt-8 w-full max-w-xs" onClick={study}>
                  <Play className="size-5 fill-current" /> Estudiar ahora
                </Button>
                <p className="mt-2 text-xs text-muted">
                  <span className="kbd">Espacio</span> para empezar
                </p>
              </>
            )}
          </div>

          <div className="border-t border-soft p-5 sm:p-6">
            <div className="mb-2 flex justify-between text-xs text-muted">
              <span>{input.cards.length} tarjetas</span>
              <span>
                {c.totalNew} nuevas sin ver · {c.totalReviewDue} repasos vencidos
              </span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full surface-2">
              {[
                ['new', '#0ea5e9'],
                ['learning', '#f43f5e'],
                ['young', '#86efac'],
                ['mature', '#16a34a'],
                ['suspended', '#facc15'],
              ].map(([k, color]) => (
                <motion.div key={k} initial={{ width: 0 }} animate={{ width: `${(dist[k as keyof typeof dist] / totalCards) * 100}%` }} transition={{ duration: 0.8 }} style={{ backgroundColor: color }} title={k} />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              {(
                [
                  ['Nuevas', dist.new, '#0ea5e9'],
                  ['Aprendiendo', dist.learning, '#f43f5e'],
                  ['Jóvenes', dist.young, '#86efac'],
                  ['Maduras', dist.mature, '#16a34a'],
                  ['Suspendidas', dist.suspended, '#facc15'],
                ] as const
              ).map(([l, n, c]) => (
                <span key={l} className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: c }} /> {l} {n}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOptions(true)} title="O">
          <Settings2 className="size-4" /> Opciones
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setCustom(true)} title="C">
          <Sparkles className="size-4" /> Estudio personalizado
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate(`/flashcards/navegador?q=${encodeURIComponent(deck?.filtered ? deck.filtered.query : deckQuery(key, name))}`)}>
          <Search className="size-4" /> Explorar
        </Button>
        {deck && !deck.filtered && (
          <Button variant="ghost" size="sm" onClick={() => openEditor({ prefill: { deckId: deck.id } })}>
            <Plus className="size-4" /> Agregar aquí
          </Button>
        )}
        {deck?.filtered && (
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-500"
            onClick={() => {
              deleteDeck(deck.id)
              navigate('/flashcards')
            }}
          >
            <Trash2 className="size-4" /> Vaciar mazo filtrado
          </Button>
        )}
      </div>

      {options && <DeckOptions open deckKey={key} deckName={name} onClose={() => setOptions(false)} />}
      {custom && <CustomStudy open deckKey={key} deckName={name} onClose={() => setCustom(false)} />}
    </div>
  )
}
