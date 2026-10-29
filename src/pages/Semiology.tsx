import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Search, Stethoscope } from 'lucide-react'
import { allSigns, SEMIO_REFERENCES, SYSTEMS, type BodySystem, type Sign } from '@/data/semiology'
import { normalizeText } from '@/data/specialties'
import { Card, PageHeader, Segmented } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'
import { PracticeQuiz } from '@/components/PracticeQuiz'
import { References } from '@/components/StudySections'
import { SectionBody } from '@/components/SectionBody'
import type { QuizItem } from '@/types'
import { cn, shuffle, tintText } from '@/lib/utils'

function SignCard({ sign, system, showSystem }: { sign: Sign; system: BodySystem; showSystem?: boolean }) {
  return (
    <Card className="p-4">
      {showSystem && (
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold" style={tintText(system.color)}>
          <Icon name={system.icon} className="size-3.5" /> {system.name}
        </div>
      )}
      <h3 className="font-semibold">{sign.name}</h3>
      <p className="mt-1 text-sm text-muted">{sign.how}</p>
      <p className="mt-2 inline-flex rounded-lg px-2.5 py-1 text-sm font-medium" style={{ backgroundColor: `${system.color}14` }}>
        → {sign.means}
      </p>
    </Card>
  )
}

function BySystem() {
  const [id, setId] = useState(SYSTEMS[0].id)
  const sys = SYSTEMS.find((s) => s.id === id)!
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {SYSTEMS.map((s) => (
          <button
            key={s.id}
            onClick={() => setId(s.id)}
            aria-pressed={s.id === id}
            className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors', s.id === id ? 'border-transparent text-white' : 'border-soft text-muted hover:text-[var(--text)]')}
            style={s.id === id ? { backgroundColor: s.color } : undefined}
          >
            <Icon name={s.icon} className="size-4" /> {s.name}
          </button>
        ))}
      </div>
      <motion.div key={sys.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
        <Card className="p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid size-9 place-items-center rounded-xl text-white" style={{ backgroundColor: sys.color }}>
              <Icon name={sys.icon} className="size-5" />
            </span>
            Cómo explorar bien
          </h2>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {sys.tips.map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: sys.color }} />
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </Card>
        <div>
          <h2 className="font-display text-lg font-bold">Signos clave ({sys.signs.length})</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {sys.signs.map((s) => (
              <SignCard key={s.name} sign={s} system={sys} />
            ))}
          </div>
        </div>
        {sys.sections?.map((sec) => (
          <Card key={sec.heading} className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">{sec.heading}</h2>
            <SectionBody sec={sec} color={sys.color} />
          </Card>
        ))}
      </motion.div>
    </div>
  )
}

function SignSearch() {
  const [q, setQ] = useState('')
  const signs = useMemo(allSigns, [])
  const found = useMemo(() => {
    const t = normalizeText(q)
    if (!t) return signs
    return signs.filter((s) => normalizeText(`${s.name} ${s.how} ${s.means} ${s.system.name}`).includes(t))
  }, [q, signs])
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 rounded-2xl border border-soft bg-[var(--surface)] px-4 focus-within:border-brand-500">
        <Search className="size-4 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca un signo o una enfermedad: Murphy, meningitis, hipocalcemia…" className="h-12 w-full bg-transparent text-sm outline-none" aria-label="Buscar signo" />
      </label>
      <p className="text-sm text-muted">
        {found.length} {found.length === 1 ? 'signo' : 'signos'}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {found.map((s) => (
          <SignCard key={`${s.system.id}-${s.name}`} sign={s} system={s.system} showSystem />
        ))}
      </div>
    </div>
  )
}

/** Preguntas armadas con los propios signos: el significado correcto y tres de otros signos. */
function buildQuiz(): QuizItem[] {
  const signs = allSigns()
  const meanings = [...new Set(signs.map((s) => s.means))]
  return signs.map((s) => {
    const options = [s.means, ...shuffle(meanings.filter((m) => m !== s.means)).slice(0, 3)]
    return { q: `${s.name}: ${s.how.replace(/\.$/, '')}. ¿Qué sugiere?`, options, answer: 0, why: `${s.name} → ${s.means}. (${s.system.name})` }
  })
}

export default function Semiology() {
  const [tab, setTab] = useState<'sistemas' | 'buscar' | 'practica'>('sistemas')
  const quiz = useMemo(buildQuiz, [])
  return (
    <div>
      <PageHeader icon={<Stethoscope className="size-6" />} eyebrow="Examen físico" title="Semiología por sistemas" subtitle="Cómo explorar cada sistema y qué significa cada signo: los epónimos y hallazgos que más se preguntan." />
      <Segmented
        value={tab}
        onChange={setTab}
        className="mb-6"
        options={[
          { value: 'sistemas', label: 'Por sistema' },
          { value: 'buscar', label: 'Buscar signo' },
          { value: 'practica', label: 'Práctica' },
        ]}
      />
      {tab === 'sistemas' && <BySystem />}
      {tab === 'buscar' && <SignSearch />}
      {tab === 'practica' && <PracticeQuiz items={quiz} title="¿Qué sugiere este signo?" size={10} />}
      <div className="mt-8">
        <References items={SEMIO_REFERENCES} />
      </div>
    </div>
  )
}
