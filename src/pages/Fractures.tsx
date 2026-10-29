import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Bone, Check, RotateCcw, Siren, Trophy, X } from 'lucide-react'
import { FRACTURE_LINES, FRACTURE_QUIZ, FRACTURE_REFERENCES, FRACTURE_SECTIONS, SALTER_HARRIS } from '@/data/fractures'
import { FractureArt, SalterArt } from '@/components/FractureArt'
import { Button, Card, PageHeader, Segmented } from '@/components/ui/primitives'
import { PracticeQuiz } from '@/components/PracticeQuiz'
import { References, SectionIndex, StudySections } from '@/components/StudySections'
import { useProgress } from '@/store/progress'
import { playSound } from '@/lib/fx'
import { cn, shuffle } from '@/lib/utils'

const COLOR = '#b45309'
const ROUND = 8

/** «¿Qué trazo es?»: el dibujo y cuatro nombres. */
function LineGame() {
  const addXp = useProgress((s) => s.addXp)
  const [run, setRun] = useState(0)
  const round = useMemo(
    () =>
      shuffle(FRACTURE_LINES)
        .slice(0, ROUND)
        .map((f) => ({ f, options: shuffle([f, ...shuffle(FRACTURE_LINES.filter((x) => x.id !== f.id)).slice(0, 3)]) })),
    // `run` baraja una ronda nueva al repetir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  )
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const item = round[i]

  const choose = (id: string) => {
    if (picked) return
    setPicked(id)
    const ok = id === item.f.id
    playSound(ok ? 'correct' : 'wrong')
    if (ok) setScore((s) => s + 1)
  }
  const next = () => {
    if (i + 1 >= ROUND) {
      setDone(true)
      addXp(score * 2)
      return
    }
    setI(i + 1)
    setPicked(null)
  }
  const restart = () => {
    setRun((r) => r + 1)
    setI(0)
    setPicked(null)
    setScore(0)
    setDone(false)
  }

  if (done)
    return (
      <Card className="p-6 text-center">
        <Trophy className="mx-auto size-10 text-amber-500" />
        <h3 className="mt-2 font-display text-2xl font-extrabold">
          {score}/{ROUND}
        </h3>
        <p className="mt-1 text-sm text-muted">{score === ROUND ? '¡Ojo de traumatólogo!' : 'Repasa la galería y vuelve a intentarlo.'}</p>
        <Button className="mt-5" onClick={restart}>
          <RotateCcw className="size-4" /> Otra ronda
        </Button>
      </Card>
    )

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <h3 className="font-display font-bold">¿Qué trazo es?</h3>
        <span className="ml-auto text-sm font-bold tabular-nums">
          {i + 1}/{ROUND}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`${run}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          <div className="mt-4 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/40">
            <FractureArt line={item.f.id} title="Fractura para identificar" className="mx-auto block h-auto w-full max-w-md" />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {item.options.map((o) => {
              const right = picked && o.id === item.f.id
              const wrong = picked === o.id && o.id !== item.f.id
              return (
                <button
                  key={o.id}
                  onClick={() => choose(o.id)}
                  disabled={!!picked}
                  className={cn('flex min-h-12 items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium transition-colors', right ? 'border-emerald-500 bg-emerald-500/10' : wrong ? 'border-rose-500 bg-rose-500/10' : 'border-soft hover:border-brand-500/40', picked && !right && !wrong && 'opacity-60')}
                >
                  {right && <Check className="size-4 shrink-0 text-emerald-600" />}
                  {wrong && <X className="size-4 shrink-0 text-rose-600" />}
                  {o.name}
                </button>
              )
            })}
          </div>
          {picked && (
            <div className={cn('mt-4 rounded-xl p-4 text-sm', picked === item.f.id ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
              <div className="font-semibold">{picked === item.f.id ? '¡Correcto!' : `Es: ${item.f.name}`}</div>
              <p className="mt-1">
                {item.f.how} {item.f.clue}
              </p>
            </div>
          )}
          {picked && (
            <Button className="mt-4 w-full" onClick={next}>
              {i + 1 >= ROUND ? 'Ver resultado' : 'Siguiente'} <ArrowRight className="size-4" />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  )
}

function Gallery() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-xl font-bold">Tipos de trazo</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FRACTURE_LINES.map((f) => (
            <Card key={f.id} className="p-4">
              <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-900/40">
                <FractureArt line={f.id} title={`Fractura ${f.name.toLowerCase()}`} className="block h-auto w-full" />
              </div>
              <h3 className="mt-3 font-display font-bold">{f.name}</h3>
              <p className="mt-1 text-sm">{f.how}</p>
              <p className="mt-1 text-sm text-muted">{f.clue}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold">Fracturas de la fisis en niños (Salter-Harris)</h2>
        <p className="mt-1 text-sm text-muted">En azul, la fisis (cartílago de crecimiento); arriba la epífisis y abajo la metáfisis. Cuanto más alto el número, peor el pronóstico.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SALTER_HARRIS.map((s) => (
            <Card key={s.type} className="p-4">
              <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-900/40">
                <SalterArt type={s.type} className="mx-auto block h-28 w-auto" />
              </div>
              <h3 className="mt-3 font-display font-bold">Tipo {s.roman}</h3>
              <div className="text-xs font-semibold text-muted">{s.name}</div>
              <p className="mt-1 text-sm">{s.what}</p>
              <p className="mt-1 text-xs text-muted">Pronóstico: {s.prognosis}</p>
            </Card>
          ))}
        </div>
      </section>

      <LineGame />
    </div>
  )
}

export default function Fractures() {
  const [tab, setTab] = useState<'trazos' | 'temas' | 'practica'>('trazos')
  return (
    <div>
      <PageHeader icon={<Bone className="size-6" />} eyebrow="Trauma" title="Tipos de trauma y fracturas" subtitle="Mecanismos de lesión, cómo describir una fractura, trazos, Salter-Harris, expuestas y las fracturas con nombre propio." />
      <Segmented
        value={tab}
        onChange={setTab}
        className="mb-6"
        options={[
          { value: 'trazos', label: 'Trazos' },
          { value: 'temas', label: 'Temas' },
          { value: 'practica', label: 'Práctica' },
        ]}
      />
      {tab === 'trazos' && <Gallery />}
      {tab === 'temas' && (
        <div className="space-y-6">
          <SectionIndex sections={FRACTURE_SECTIONS} />
          <StudySections sections={FRACTURE_SECTIONS} color={COLOR} />
          <References items={FRACTURE_REFERENCES} />
        </div>
      )}
      {tab === 'practica' && (
        <div className="space-y-4">
          <PracticeQuiz items={FRACTURE_QUIZ} title="Preguntas de fracturas" />
          <Link to="/atls" className="card card-hover flex items-center gap-3 p-4 text-sm font-semibold">
            <Siren className="size-5 text-red-600" /> Sigue con ATLS: el paciente politraumatizado
          </Link>
        </div>
      )}
    </div>
  )
}
