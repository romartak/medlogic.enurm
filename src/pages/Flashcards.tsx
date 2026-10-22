import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Brain, Layers, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useProgress } from '@/store/progress'
import { useBank } from '@/store/bank'
import { ALL_DECK_ID, allDecks, cardsForDeck, CUSTOM_DECK, errorCards } from '@/lib/decks'
import { isDue, maturity } from '@/lib/srs'
import { Button, Card, LinkButton, PageHeader, ProgressBar, StatCard } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { SPECIALTIES } from '@/data/specialties'
import { uid } from '@/lib/utils'
import { toast } from '@/store/toasts'

export default function Flashcards() {
  const { srs, customCards, attempts, addCustomCard, deleteCustomCard } = useProgress()
  const byId = useBank((s) => s.byId)
  const errors = useMemo(() => errorCards(attempts, byId), [attempts, byId])
  const [creating, setCreating] = useState(false)
  const [manage, setManage] = useState(false)
  const [form, setForm] = useState({ front: '', back: '', specialty: '' })

  const all = cardsForDeck(ALL_DECK_ID, customCards, errors)
  const due = all.filter((c) => srs[c.id] && isDue(srs[c.id])).length
  const fresh = all.filter((c) => !srs[c.id]).length
  const mature = all.filter((c) => maturity(srs[c.id]) === 3).length
  const learning = all.length - fresh - mature

  const save = () => {
    if (!form.front.trim() || !form.back.trim()) return
    addCustomCard({ id: uid('mine'), deck: CUSTOM_DECK.id, front: form.front.trim(), back: form.back.trim(), specialty: form.specialty || undefined, custom: true })
    setForm({ front: '', back: '', specialty: form.specialty })
    toast({ kind: 'success', title: 'Tarjeta creada' })
  }

  return (
    <div>
      <PageHeader
        icon={<Layers className="size-6" />}
        eyebrow="Repetición espaciada"
        title="Flashcards"
        subtitle="El algoritmo te muestra cada tarjeta justo antes de que la olvides. 15 minutos al día hacen la diferencia."
        actions={
          <>
            <Button variant="outline" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Crear tarjeta
            </Button>
            <LinkButton to={`/flashcards/${ALL_DECK_ID}`}>
              <Brain className="size-4" /> Repasar todo ({due + Math.min(fresh, 20)})
            </LinkButton>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={<Brain className="size-5" />} label="Pendientes hoy" value={due} color="#8b5cf6" />
        <StatCard icon={<Sparkles className="size-5" />} label="Nuevas" value={fresh} color="#06c4b0" delay={0.05} />
        <StatCard icon={<Layers className="size-5" />} label="Aprendiendo" value={learning} color="#f59e0b" delay={0.1} />
        <StatCard icon={<ArrowRight className="size-5" />} label="Dominadas" value={mature} hint="Intervalo ≥ 21 días" color="#22c55e" delay={0.15} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allDecks().map((d, i) => {
          const cards = cardsForDeck(d.id, customCards, errors)
          const dDue = cards.filter((c) => srs[c.id] && isDue(srs[c.id])).length
          const dNew = cards.filter((c) => !srs[c.id]).length
          const mastered = cards.length ? cards.filter((c) => maturity(srs[c.id]) >= 2).length / cards.length : 0
          const empty = cards.length === 0
          return (
            <motion.div key={d.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={empty ? '#' : `/flashcards/${d.id}`} onClick={(e) => empty && (e.preventDefault(), d.id === CUSTOM_DECK.id && setCreating(true))} className="group relative block h-full perspective">
                {/* Efecto de pila de tarjetas */}
                <div className="absolute inset-x-4 -bottom-2 h-full rounded-2xl border border-soft bg-[var(--surface)] opacity-60 transition-transform duration-300 group-hover:translate-y-1" />
                <div className="card card-hover relative flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:-rotate-6" style={{ background: `linear-gradient(135deg, ${d.color}, ${d.color}aa)` }}>
                      <Icon name={d.icon} className="size-6" />
                    </span>
                    {dDue > 0 && <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-bold text-violet-600 dark:text-violet-400">{dDue} pendientes</span>}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold">{d.name}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted">{d.description}</p>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-muted">
                      <span>
                        {cards.length} tarjetas · {dNew} nuevas
                      </span>
                      <span>{Math.round(mastered * 100)}%</span>
                    </div>
                    <ProgressBar value={mastered} color={d.color} height="h-1.5" />
                  </div>
                  {empty && <p className="mt-3 text-xs text-muted italic">{d.id === CUSTOM_DECK.id ? 'Toca para crear tu primera tarjeta.' : 'Se llenará cuando falles preguntas.'}</p>}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {customCards.length > 0 && (
        <div className="mt-8">
          <button onClick={() => setManage(!manage)} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            {manage ? 'Ocultar mis tarjetas' : `Administrar mis tarjetas (${customCards.length})`}
          </button>
          {manage && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {customCards.map((c) => (
                <Card key={c.id} className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{c.front}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-muted">{c.back}</div>
                  </div>
                  <button onClick={() => deleteCustomCard(c.id)} className="rounded-lg p-2 text-muted hover:bg-rose-500/10 hover:text-rose-500" aria-label="Eliminar tarjeta">
                    <Trash2 className="size-4" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Nueva flashcard">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Frente (pregunta)</span>
            <textarea value={form.front} onChange={(e) => setForm({ ...form, front: e.target.value })} className="mt-1.5 h-20 w-full resize-none rounded-xl border border-soft surface-2 p-3 text-sm outline-none focus:border-brand-500" placeholder="Ej.: Antídoto de la heparina" autoFocus />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Reverso (respuesta)</span>
            <textarea value={form.back} onChange={(e) => setForm({ ...form, back: e.target.value })} className="mt-1.5 h-24 w-full resize-none rounded-xl border border-soft surface-2 p-3 text-sm outline-none focus:border-brand-500" placeholder="Ej.: Sulfato de protamina" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Especialidad (opcional)</span>
            <select value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500">
              <option value="">Sin especialidad</option>
              {SPECIALTIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cerrar
            </Button>
            <Button onClick={save} disabled={!form.front.trim() || !form.back.trim()}>
              <Plus className="size-4" /> Guardar y crear otra
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
