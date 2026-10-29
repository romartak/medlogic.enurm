import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowRight, ArrowUp, Check, Droplet, FlaskConical, RotateCcw, X } from 'lucide-react'
import { HEMO_CASES, HEMO_REFERENCES, HEMO_SECTIONS } from '@/data/hemogram'
import { readHemogram, type Finding, type HemogramInput, type Sex } from '@/lib/hemogram'
import { Button, Card, PageHeader, Segmented } from '@/components/ui/primitives'
import { NumField } from '@/components/ui/NumField'
import { References, SectionIndex, StudySections } from '@/components/StudySections'
import { useProgress } from '@/store/progress'
import { playSound } from '@/lib/fx'
import { cn, shuffle } from '@/lib/utils'

const COLOR = '#be123c'

const REF: Record<string, (sex: Sex) => string> = {
  hb: (s) => (s === 'hombre' ? '13,5–17,5' : s === 'mujer' ? '12–15,5' : '11–14'),
  mcv: () => '80–100',
  mch: () => '27–33',
  rdw: () => '11,5–14,5',
  rbc: (s) => (s === 'hombre' ? '4,5–5,9' : s === 'mujer' ? '4–5,2' : '3,5–5'),
  retic: () => '0,5–2,5',
  wbc: () => '4000–11 000',
  neut: () => '1500–7500',
  lymph: () => '1000–4000',
  eos: () => '< 500',
  plt: () => '150 000–450 000',
}

/** Informe con aspecto de laboratorio: valor, referencia y flecha si está fuera de rango. */
function LabReport({ findings, sex, extra }: { findings: Finding[]; sex: Sex; extra?: string[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-soft">
      <div className="flex items-center justify-between surface-2 px-4 py-2 text-xs font-bold tracking-wider text-muted uppercase">
        <span>Hemograma</span>
        <span>Referencia</span>
      </div>
      <dl className="divide-y divide-[var(--border)] text-sm">
        {findings.map((f) => (
          <div key={f.key} className="grid grid-cols-[1fr_auto] items-center gap-x-3 px-4 py-2">
            <dt className="min-w-0">
              {f.label}
              {f.note && <span className="block text-xs text-muted">{f.note}</span>}
            </dt>
            <dd className="flex items-center justify-end gap-3 text-right">
              <span className={cn('inline-flex items-center gap-1 font-mono font-semibold tabular-nums', f.flag === 'alto' && 'text-rose-700 dark:text-rose-300', f.flag === 'bajo' && 'text-sky-700 dark:text-sky-300')}>
                {f.flag === 'alto' && <ArrowUp className="size-3.5" aria-label="alto" />}
                {f.flag === 'bajo' && <ArrowDown className="size-3.5" aria-label="bajo" />}
                {f.value}
              </span>
              <span className="w-32 text-xs text-muted max-sm:hidden">{REF[f.key]?.(sex)}</span>
            </dd>
          </div>
        ))}
      </dl>
      {extra && (
        <div className="border-t border-soft px-4 py-3 text-sm">
          <div className="text-xs font-bold tracking-wider text-muted uppercase">Otros estudios</div>
          <ul className="mt-1 space-y-0.5">
            {extra.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

type Fields = Record<'hb' | 'mcv' | 'mch' | 'rdw' | 'rbc' | 'retic' | 'wbc' | 'neutPct' | 'lymphPct' | 'eosPct' | 'plt', string>
const EMPTY: Fields = { hb: '', mcv: '', mch: '', rdw: '', rbc: '', retic: '', wbc: '', neutPct: '', lymphPct: '', eosPct: '', plt: '' }

function Interpreter() {
  const [sex, setSex] = useState<Sex>('mujer')
  const [f, setF] = useState<Fields>({ ...EMPTY, hb: '9.1', mcv: '68', rdw: '18.5', rbc: '4.2', wbc: '6800', neutPct: '58', lymphPct: '32', plt: '468000' })
  const set = (k: keyof Fields) => (v: string) => setF({ ...f, [k]: v })
  const reading = useMemo(() => {
    const num = (s: string) => (s.trim() === '' || !Number.isFinite(Number(s)) ? undefined : Number(s))
    const hb = num(f.hb)
    if (hb === undefined || hb <= 0) return null
    const input: HemogramInput = { sex, hb }
    for (const k of Object.keys(EMPTY) as (keyof Fields)[]) {
      if (k === 'hb') continue
      const v = num(f[k])
      if (v !== undefined && v >= 0) (input as unknown as Record<string, number>)[k] = v
    }
    return readHemogram(input)
  }, [f, sex])

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card className="p-5 sm:p-6">
        <Segmented
          value={sex}
          onChange={setSex}
          options={[
            { value: 'mujer', label: 'Mujer' },
            { value: 'hombre', label: 'Hombre' },
            { value: 'embarazada', label: 'Embarazada' },
          ]}
        />
        <div className="mt-5 text-xs font-bold tracking-wider text-muted uppercase">Serie roja</div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <NumField label="Hemoglobina" unit="g/dL" value={f.hb} onChange={set('hb')} />
          <NumField label="VCM" unit="fL" value={f.mcv} onChange={set('mcv')} />
          <NumField label="HCM" unit="pg" value={f.mch} onChange={set('mch')} />
          <NumField label="RDW" unit="%" value={f.rdw} onChange={set('rdw')} />
          <NumField label="Glóbulos rojos" unit="mill/µL" value={f.rbc} onChange={set('rbc')} />
          <NumField label="Reticulocitos" unit="%" value={f.retic} onChange={set('retic')} />
        </div>
        <div className="mt-5 text-xs font-bold tracking-wider text-muted uppercase">Serie blanca y plaquetas</div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <NumField label="Leucocitos" unit="/µL" value={f.wbc} onChange={set('wbc')} />
          <NumField label="Neutrófilos" unit="%" value={f.neutPct} onChange={set('neutPct')} />
          <NumField label="Linfocitos" unit="%" value={f.lymphPct} onChange={set('lymphPct')} />
          <NumField label="Eosinófilos" unit="%" value={f.eosPct} onChange={set('eosPct')} />
          <NumField label="Plaquetas" unit="/µL" value={f.plt} onChange={set('plt')} />
        </div>
        <button onClick={() => setF(EMPTY)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-[var(--text)]">
          <RotateCcw className="size-4" /> Limpiar
        </button>
      </Card>
      <div className="space-y-4">
        {reading ? (
          <>
            <Card className="p-5">
              <h3 className="font-semibold">Lectura</h3>
              <ul className="mt-3 space-y-2.5 text-[15px]">
                {reading.summary.map((s) => (
                  <li key={s} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: COLOR }} />
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <LabReport findings={reading.findings} sex={sex} />
          </>
        ) : (
          <Card className="p-5 text-sm text-muted">Escribe al menos la hemoglobina.</Card>
        )}
        <p className="text-xs text-muted">Lectura didáctica con rangos habituales de adulto. No reemplaza el criterio clínico ni el frotis; los rangos varían entre laboratorios.</p>
      </div>
    </div>
  )
}

function Cases() {
  const addXp = useProgress((s) => s.addXp)
  const [order, setOrder] = useState(() => shuffle(HEMO_CASES))
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const c = order[i]
  const reading = useMemo(() => readHemogram(c.input), [c])
  const done = i >= order.length

  const choose = (k: number) => {
    if (picked !== null) return
    setPicked(k)
    const ok = k === c.answer
    playSound(ok ? 'correct' : 'wrong')
    if (ok) {
      setScore((s) => s + 1)
      addXp(3)
    }
  }

  if (done)
    return (
      <Card className="p-6 text-center">
        <FlaskConical className="mx-auto size-10 text-rose-600" />
        <h3 className="mt-2 font-display text-2xl font-extrabold">
          {score}/{order.length}
        </h3>
        <p className="mt-1 text-sm text-muted">{score === order.length ? '¡Lees hemogramas como hematólogo!' : 'Repasa los temas y vuelve a intentarlo.'}</p>
        <Button
          className="mt-5"
          onClick={() => {
            setOrder(shuffle(HEMO_CASES))
            setI(0)
            setPicked(null)
            setScore(0)
          }}
        >
          <RotateCcw className="size-4" /> Otra vez
        </Button>
      </Card>
    )

  return (
    <AnimatePresence mode="wait">
      <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between text-xs font-bold tracking-wider text-muted uppercase">
              <span>
                Caso {i + 1} de {order.length}
              </span>
              <span>{c.input.sex === 'hombre' ? 'Hombre' : c.input.sex === 'mujer' ? 'Mujer' : 'Embarazada'}</span>
            </div>
            <h2 className="mt-2 font-display text-lg font-bold">{c.title}</h2>
            <p className="mt-1 text-[15px] leading-relaxed">{c.vignette}</p>
          </Card>
          <LabReport findings={reading.findings} sex={c.input.sex} extra={c.extra} />
        </div>
        <Card className="h-fit p-5">
          <h3 className="font-semibold">{c.q}</h3>
          <div className="mt-4 space-y-2">
            {c.options.map((o, k) => {
              const right = picked !== null && k === c.answer
              const wrong = picked === k && k !== c.answer
              return (
                <button key={k} onClick={() => choose(k)} disabled={picked !== null} className={cn('flex w-full items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left text-sm transition-colors', right ? 'border-emerald-500 bg-emerald-500/10' : wrong ? 'border-rose-500 bg-rose-500/10' : 'border-soft hover:border-brand-500/40', picked !== null && !right && !wrong && 'opacity-60')}>
                  <span className={cn('grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold', right ? 'bg-emerald-500 text-white' : wrong ? 'bg-rose-500 text-white' : 'surface-2 text-muted')}>{right ? <Check className="size-3.5" /> : wrong ? <X className="size-3.5" /> : String.fromCharCode(65 + k)}</span>
                  <span className="pt-0.5">{o}</span>
                </button>
              )
            })}
          </div>
          {picked !== null && (
            <div className={cn('mt-4 rounded-xl p-4 text-sm leading-relaxed', picked === c.answer ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
              <div className="font-semibold">{picked === c.answer ? '¡Correcto!' : `Respuesta: ${c.options[c.answer]}`}</div>
              <p className="mt-1">{c.why}</p>
            </div>
          )}
          {picked !== null && (
            <Button
              className="mt-4 w-full"
              onClick={() => {
                setI(i + 1)
                setPicked(null)
              }}
            >
              {i + 1 >= order.length ? 'Ver resultado' : 'Siguiente caso'} <ArrowRight className="size-4" />
            </Button>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export default function Hemogram() {
  const [tab, setTab] = useState<'aprende' | 'interpretar' | 'casos'>('aprende')
  return (
    <div>
      <PageHeader icon={<Droplet className="size-6" />} eyebrow="Hematología" title="Aprende a leer un hemograma" subtitle="Las tres series paso a paso, anemias por VCM, glóbulos blancos en valores absolutos y plaquetas. Practica con hemogramas reales de casos típicos." />
      <Segmented
        value={tab}
        onChange={setTab}
        className="mb-6"
        options={[
          { value: 'aprende', label: 'Aprende' },
          { value: 'interpretar', label: 'Interpretar' },
          { value: 'casos', label: 'Casos' },
        ]}
      />
      {tab === 'aprende' && (
        <div className="space-y-6">
          <SectionIndex sections={HEMO_SECTIONS} />
          <StudySections sections={HEMO_SECTIONS} color={COLOR} />
          <References items={HEMO_REFERENCES} />
        </div>
      )}
      {tab === 'interpretar' && <Interpreter />}
      {tab === 'casos' && <Cases />}
    </div>
  )
}
