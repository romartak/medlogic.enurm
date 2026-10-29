import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Calculator, ShieldPlus, Siren, Stethoscope, TriangleAlert } from 'lucide-react'
import { ATLS_QUIZ, ATLS_REFERENCES, ATLS_SECTIONS, XABCDE } from '@/data/atls'
import { Button, Card, PageHeader, Segmented } from '@/components/ui/primitives'
import { PracticeQuiz } from '@/components/PracticeQuiz'
import { References, SectionIndex, StudySections } from '@/components/StudySections'
import { cn } from '@/lib/utils'

const COLOR = '#dc2626'

/** Revisión primaria paso a paso: cada letra con lo que se evalúa y lo que se hace. */
function PrimarySurvey() {
  const [i, setI] = useState(0)
  const step = XABCDE[i]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-2" role="tablist" aria-label="Revisión primaria">
        {XABCDE.map((s, k) => (
          <button
            key={s.letter}
            role="tab"
            aria-selected={k === i}
            aria-label={`${s.letter}: ${s.name}`}
            onClick={() => setI(k)}
            className={cn('grid h-14 place-items-center rounded-2xl border-2 font-display text-2xl font-extrabold transition-colors sm:h-16', k === i ? 'border-red-600 bg-red-600 text-white' : k < i ? 'border-red-600/30 bg-red-600/10 text-red-700 dark:text-red-300' : 'border-soft bg-[var(--surface)] text-muted hover:border-red-600/40')}
          >
            {s.letter}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step.letter} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          <Card className="p-5 sm:p-7" role="tabpanel">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red-600 font-display text-2xl font-extrabold text-white">{step.letter}</span>
              <h2 className="font-display text-xl font-bold">{step.name}</h2>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-bold tracking-wider text-muted uppercase">Evalúa</h3>
                <ul className="mt-2 space-y-2 text-[15px]">
                  {step.assess.map((a) => (
                    <li key={a} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400" />
                      <span className="leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-wider text-red-700 uppercase dark:text-red-300">Actúa</h3>
                <ul className="mt-2 space-y-2 text-[15px]">
                  {step.act.map((a) => (
                    <li key={a} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-600" />
                      <span className="leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {step.killers && (
              <div className="mt-5 flex gap-3 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] p-4 text-sm">
                <TriangleAlert className="size-5 shrink-0 text-rose-500" />
                <p>{step.killers}</p>
              </div>
            )}
            <div className="mt-6 flex justify-between gap-2">
              <Button variant="outline" onClick={() => setI(i - 1)} disabled={i === 0}>
                <ArrowLeft className="size-4" /> Anterior
              </Button>
              {i + 1 < XABCDE.length ? (
                <Button onClick={() => setI(i + 1)}>
                  Siguiente: {XABCDE[i + 1].letter} <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setI(0)}>
                  Reevaluar desde X
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
      <p className="text-sm text-muted">Se evalúa y se trata en el mismo paso: no avances a la siguiente letra con un problema sin resolver. Ante cualquier deterioro, vuelve a empezar.</p>
    </div>
  )
}

export default function Atls() {
  const [tab, setTab] = useState<'abcde' | 'temas' | 'practica'>('abcde')
  return (
    <div>
      <PageHeader icon={<Siren className="size-6" />} eyebrow="Trauma" title="ATLS: el paciente politraumatizado" subtitle="Revisión primaria xABCDE, shock hemorrágico, tórax, TCE, columna, quemaduras y poblaciones especiales." />
      <Segmented
        value={tab}
        onChange={setTab}
        className="mb-6"
        options={[
          { value: 'abcde', label: 'xABCDE' },
          { value: 'temas', label: 'Temas' },
          { value: 'practica', label: 'Práctica' },
        ]}
      />

      {tab === 'abcde' && <PrimarySurvey />}

      {tab === 'temas' && (
        <div className="space-y-6">
          <SectionIndex sections={ATLS_SECTIONS} />
          <StudySections sections={ATLS_SECTIONS} color={COLOR} />
          <References items={ATLS_REFERENCES} />
        </div>
      )}

      {tab === 'practica' && (
        <div className="space-y-4">
          <PracticeQuiz items={ATLS_QUIZ} title="Preguntas de trauma" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Link to="/casos?especialidad=emergencias" className="card card-hover flex items-center gap-3 p-4 text-sm font-semibold">
              <Stethoscope className="size-5 text-red-600" /> Casos de trauma paso a paso
            </Link>
            <Link to="/herramientas" className="card card-hover flex items-center gap-3 p-4 text-sm font-semibold">
              <Calculator className="size-5 text-red-600" /> Glasgow y Parkland
            </Link>
            <Link to="/fracturas" className="card card-hover flex items-center gap-3 p-4 text-sm font-semibold">
              <ShieldPlus className="size-5 text-red-600" /> Tipos de trauma y fracturas
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
