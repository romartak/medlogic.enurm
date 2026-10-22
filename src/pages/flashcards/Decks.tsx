import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeftRight, Brain, ChartColumn, ChevronRight, FolderPlus, Layers, Pencil, Plus, Search, Settings2, Sparkles, Trash2, WandSparkles, Zap } from 'lucide-react'
import { useCollection, useQueueInputFactory } from '@/hooks/useCollection'
import { useAnki } from '@/store/anki'
import { buildQueues } from '@/lib/anki/queue'
import { ALL_DECK, deckTree, type DeckNode } from '@/lib/anki/collection'
import { dayNumber } from '@/lib/anki/scheduler'
import { Button, Card, PageHeader } from '@/components/ui/primitives'
import { CountTriplet, useNoteEditor } from '@/components/anki/common'
import { DeckOptions } from '@/components/anki/DeckOptions'
import { CustomStudy } from '@/components/anki/CustomStudy'
import { ImportExport } from '@/components/anki/ImportExport'
import { useHotkeys } from '@/hooks/useHotkeys'
import { cn } from '@/lib/utils'

export default function Decks() {
  const navigate = useNavigate()
  const col = useCollection()
  const factory = useQueueInputFactory(col)
  const collapsed = useAnki((s) => s.collapsed)
  const toggleCollapsed = useAnki((s) => s.toggleCollapsed)
  const revlog = useAnki((s) => s.revlog)
  const rollover = useAnki((s) => s.settings.rolloverHour)
  const addDeck = useAnki((s) => s.addDeck)
  const renameDeck = useAnki((s) => s.renameDeck)
  const deleteDeck = useAnki((s) => s.deleteDeck)
  const openEditor = useNoteEditor((s) => s.open)
  const [options, setOptions] = useState<{ key: string; name: string } | null>(null)
  const [custom, setCustom] = useState<{ key: string; name: string } | null>(null)
  const [io, setIo] = useState(false)
  const [menu, setMenu] = useState<string | null>(null)

  const tree = useMemo(() => deckTree(col.decks.filter((d) => !d.filtered)), [col.decks])
  const filtered = col.decks.filter((d) => d.filtered)
  const counts = (key: string) => buildQueues(factory(key)).counts
  const total = counts(ALL_DECK)

  const today = dayNumber(Date.now(), rollover)
  const todayLog = revlog.filter((r) => dayNumber(r.ts, rollover) === today)
  const minutes = Math.round(todayLog.reduce((a, r) => a + r.time, 0) / 60000)
  const again = todayLog.filter((r) => r.grade === 1).length

  useHotkeys((e) => {
    if (e.key.toLowerCase() === 'a') openEditor()
    else if (e.key.toLowerCase() === 'b') navigate('/flashcards/navegador')
    else if (e.key.toLowerCase() === 't') navigate('/flashcards/estadisticas')
    else if (e.key.toLowerCase() === 'i') setIo(true)
  }, !options && !custom && !io)

  const createDeck = () => {
    const name = window.prompt('Nombre del mazo. Usa "::" para submazos (p. ej. "Mis tarjetas::Cardio::Arritmias").')
    if (name?.trim()) addDeck(name)
  }

  const Row = ({ node }: { node: DeckNode }) => {
    const c = counts(node.key)
    const open = !collapsed.includes(node.key)
    const deck = node.deck
    const userDeck = deck && !deck.builtin
    return (
      <>
        <div className="group flex items-center gap-2 border-t border-soft px-3 py-2.5 transition-colors hover:bg-slate-900/[0.02] sm:px-5 dark:hover:bg-white/[0.02]" style={{ paddingLeft: `${12 + node.depth * 20}px` }}>
          {node.children.length ? (
            <button onClick={() => toggleCollapsed(node.key)} className="grid size-6 place-items-center rounded-md text-muted hover:bg-slate-900/5 dark:hover:bg-white/5" aria-label={open ? 'Contraer' : 'Expandir'}>
              <ChevronRight className={cn('size-4 transition-transform', open && 'rotate-90')} />
            </button>
          ) : (
            <span className="size-6" />
          )}
          <Link to={`/flashcards/${encodeURIComponent(node.key)}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400">
            {node.name}
          </Link>
          <CountTriplet n={c.new} l={c.learn} r={c.review} />
          <div className="relative">
            <button onClick={() => setMenu(menu === node.key ? null : node.key)} className="grid size-8 place-items-center rounded-lg text-muted opacity-70 hover:bg-slate-900/5 hover:opacity-100 dark:hover:bg-white/5" aria-label="Opciones del mazo">
              <Settings2 className="size-4" />
            </button>
            {menu === node.key && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="card absolute top-9 right-0 z-20 w-52 overflow-hidden p-1 shadow-lift">
                  {[
                    { label: 'Opciones', icon: Settings2, run: () => setOptions({ key: node.key, name: node.fullName }) },
                    { label: 'Estudio personalizado', icon: Sparkles, run: () => setCustom({ key: node.key, name: node.fullName }) },
                    { label: 'Explorar tarjetas', icon: Search, run: () => navigate(`/flashcards/navegador?q=${encodeURIComponent(`deck:"${node.fullName}"`)}`) },
                    ...(userDeck
                      ? [
                          { label: 'Renombrar', icon: Pencil, run: () => { const n = window.prompt('Nuevo nombre', deck.name); if (n?.trim()) renameDeck(deck.id, n.trim()) } },
                          { label: 'Eliminar mazo', icon: Trash2, run: () => { if (window.confirm(`¿Eliminar "${deck.name}"? Sus notas pasan a "Mis tarjetas".`)) deleteDeck(deck.id) } },
                        ]
                      : []),
                  ].map((it) => (
                    <button
                      key={it.label}
                      onClick={() => {
                        setMenu(null)
                        it.run()
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-900/5 dark:hover:bg-white/5"
                    >
                      <it.icon className="size-4 text-muted" /> {it.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </div>
        {open && node.children.map((ch) => <Row key={ch.key} node={ch} />)}
      </>
    )
  }

  return (
    <div>
      <PageHeader
        icon={<Layers className="size-6" />}
        eyebrow="Repetición espaciada estilo Anki"
        title="Flashcards"
        subtitle="Mazos, notas cloze, opciones por preset, explorador y estadísticas: la arquitectura de Anki dentro de MedLogic."
        actions={
          <>
            <Button variant="outline" onClick={() => openEditor()} title="Agregar (A)">
              <Plus className="size-4" /> Agregar
            </Button>
            <Button variant="outline" onClick={() => navigate('/flashcards/navegador')} title="Explorar (B)">
              <Search className="size-4" /> Explorar
            </Button>
            <Button variant="outline" onClick={() => navigate('/flashcards/estadisticas')} title="Estadísticas (T)">
              <ChartColumn className="size-4" /> Estadísticas
            </Button>
            <Button onClick={() => navigate(`/flashcards/${ALL_DECK}/estudiar`)}>
              <Brain className="size-4" /> Estudiar todo
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Card className="flex items-center justify-between p-4 sm:col-span-2">
          <div>
            <div className="text-xs font-semibold text-muted uppercase">Hoy</div>
            <div className="mt-1 text-sm">
              Estudiaste <b>{todayLog.length}</b> tarjetas en <b>{minutes}</b> min
              {todayLog.length > 0 && (
                <>
                  {' '}
                  · <b>{Math.round(((todayLog.length - again) / todayLog.length) * 100)}%</b> correctas
                </>
              )}
            </div>
          </div>
          <Zap className="size-6 text-amber-500" />
        </Card>
        <Card className="flex items-center justify-between p-4 sm:col-span-2">
          <div>
            <div className="text-xs font-semibold text-muted uppercase">Pendientes ahora</div>
            <div className="mt-1">
              <CountTriplet n={total.new} l={total.learn} r={total.review} size="lg" />
            </div>
          </div>
          <div className="text-right text-[11px] text-muted">
            <div>
              <span className="text-sky-500">●</span> nuevas
            </div>
            <div>
              <span className="text-rose-500">●</span> aprendiendo
            </div>
            <div>
              <span className="text-emerald-500">●</span> repasos
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-3 py-3 text-xs font-semibold tracking-wider text-muted uppercase sm:px-5">
          <span className="pl-8">Mazo</span>
          <span className="mr-10 flex gap-3">
            <span className="text-sky-500">Nuevas</span>
            <span className="text-rose-500">Aprend.</span>
            <span className="text-emerald-500">Pend.</span>
          </span>
        </div>
        {tree.map((n) => (
          <Row key={n.key} node={n} />
        ))}
        {filtered.length > 0 && (
          <>
            <div className="border-t border-soft px-5 pt-4 pb-1 text-[10px] font-bold tracking-wider text-muted uppercase">Mazos filtrados</div>
            {filtered.map((d) => (
              <Row key={d.id} node={{ key: d.id, name: d.name, fullName: d.name, depth: 0, deck: d, children: [] }} />
            ))}
          </>
        )}
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={createDeck}>
          <FolderPlus className="size-4" /> Crear mazo
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setIo(true)}>
          <ArrowLeftRight className="size-4" /> Importar / exportar (Anki)
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('/prompts/flashcards-anki')}>
          <WandSparkles className="size-4" /> Crear flashcards con IA
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setCustom({ key: ALL_DECK, name: 'Todas las tarjetas' })}>
          <Sparkles className="size-4" /> Estudio personalizado
        </Button>
      </div>

      <Card className="mt-8 grid gap-4 p-5 text-sm sm:grid-cols-3 sm:p-6">
        <div>
          <div className="font-semibold">Cómo funciona</div>
          <p className="mt-1 text-muted">Cada tarjeta nueva pasa por pasos de aprendizaje (1 min, 10 min) y luego se programa en días. Cada vez que la recuerdas, el intervalo crece según su facilidad.</p>
        </div>
        <div>
          <div className="font-semibold">Botones</div>
          <p className="mt-1 text-muted">
            <b className="text-rose-500">Otra vez</b> la olvidaste · <b className="text-amber-500">Difícil</b> con esfuerzo · <b className="text-emerald-500">Bien</b> la recordaste · <b className="text-sky-500">Fácil</b> demasiado fácil.
          </p>
        </div>
        <div>
          <div className="font-semibold">Atajos</div>
          <p className="mt-1 text-muted">
            <span className="kbd">A</span> agregar · <span className="kbd">B</span> explorar · <span className="kbd">T</span> estadísticas · en repaso: <span className="kbd">Espacio</span>, <span className="kbd">1</span>–<span className="kbd">4</span>, <span className="kbd">E</span> editar, <span className="kbd">Z</span> deshacer.
          </p>
        </div>
      </Card>

      {options && <DeckOptions open deckKey={options.key} deckName={options.name} onClose={() => setOptions(null)} />}
      {custom && <CustomStudy open deckKey={custom.key} deckName={custom.name} onClose={() => setCustom(null)} />}
      <ImportExport open={io} onClose={() => setIo(false)} />
    </div>
  )
}
