import { useId, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Wind } from 'lucide-react'
import { LOOPS, SPIRO_EXAMPLES, SPIRO_QUIZ, SPIRO_REFERENCES, SPIRO_SECTIONS } from '@/data/spirometry'
import { interpretSpirometry, loopPoints, type LoopShape, type SpiroInput, type SpiroPattern } from '@/lib/spirometry'
import { Card, PageHeader, Segmented, Toggle } from '@/components/ui/primitives'
import { NumField } from '@/components/ui/NumField'
import { PracticeQuiz } from '@/components/PracticeQuiz'
import { References, SectionIndex, StudySections } from '@/components/StudySections'
import { cn } from '@/lib/utils'

const COLOR = '#0284c7'

/** Curva flujo-volumen esquemática, con la normal punteada detrás para comparar. */
export function FlowVolumeLoop({ shape, className }: { shape: LoopShape; className?: string }) {
  const id = useId()
  const W = 300
  const H = 220
  const x = (v: number) => 36 + (v / 6) * 250
  const y = (f: number) => 120 - f * 10
  const path = (s: LoopShape) =>
    loopPoints(s)
      .map((p, i) => `${i ? 'L' : 'M'}${x(p.v).toFixed(1)} ${y(p.f).toFixed(1)}`)
      .join(' ') + ' Z'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-labelledby={id}>
      <title id={id}>{`Curva flujo-volumen: ${LOOPS.find((l) => l.shape === shape)?.name ?? shape}`}</title>
      <g stroke="currentColor" strokeOpacity="0.35" strokeWidth="1">
        <path d={`M36 18 V212 M36 ${y(0)} H292`} fill="none" />
      </g>
      <g fill="currentColor" fillOpacity="0.6" fontSize="9" fontFamily="system-ui, sans-serif">
        <text x="40" y="14">Flujo (L/s)</text>
        <text x="292" y="208" textAnchor="end">
          Volumen (L) →
        </text>
        <text x="30" y={y(0) - 4} textAnchor="end">
          0
        </text>
        <text x="40" y="26" fontSize="8">
          Espiración ↑
        </text>
        <text x="40" y="208" fontSize="8">
          Inspiración ↓
        </text>
      </g>
      {shape !== 'normal' && <path d={path('normal')} fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 3" />}
      <path d={path(shape)} fill={COLOR} fillOpacity="0.12" stroke={COLOR} strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  )
}

const PATTERN: Record<SpiroPattern, { label: string; tone: string; text: string; loop: LoopShape }> = {
  normal: { label: 'Espirometría normal', tone: 'from-emerald-500 to-teal-600', text: 'Cociente ≥ 0,70 y FVC ≥ 80 %. Si los síntomas sugieren asma, una espirometría normal no la descarta: considera la prueba de metacolina.', loop: 'normal' },
  obstructivo: { label: 'Patrón obstructivo', tone: 'from-sky-500 to-indigo-600', text: 'Cociente < 0,70: hay limitación al flujo aéreo. La respuesta al broncodilatador orienta entre asma (reversible) y EPOC (persistente).', loop: 'obstructivo' },
  restrictivo: { label: 'Sugiere restricción', tone: 'from-amber-500 to-orange-600', text: 'Cociente normal o alto con FVC baja. Confírmalo midiendo la capacidad pulmonar total (TLC < 80 %); la DLCO ayuda a separar causas del parénquima (baja) de las de pared o músculo (normal).', loop: 'restrictivo' },
  mixto: { label: 'Patrón mixto', tone: 'from-rose-500 to-fuchsia-600', text: 'Cociente bajo y FVC baja. Puede ser una restricción con obstrucción o una obstrucción con atrapamiento de aire que reduce la FVC: los volúmenes pulmonares lo aclaran.', loop: 'obstructivo' },
}

/** Lectura de la prueba broncodilatadora según la respuesta y el cociente que queda después. */
function bdText(positive: boolean, postRatio?: number) {
  const persists = postRatio !== undefined && postRatio < 0.7
  if (positive && !persists) return 'Aumento ≥ 12 % y ≥ 200 mL y el cociente se normaliza: obstrucción reversible, típica del asma.'
  if (positive) return 'Respuesta positiva, pero el cociente sigue < 0,70: la obstrucción no se revierte del todo. Puede ser asma mal controlada o EPOC con respuesta al broncodilatador; decide con la clínica y la exposición.'
  if (persists) return 'No alcanza ≥ 12 % y ≥ 200 mL y el cociente sigue < 0,70: obstrucción persistente, compatible con EPOC si hay síntomas o exposición (tabaco, humo de leña).'
  return 'No alcanza ≥ 12 % y ≥ 200 mL.'
}

type Fields = Record<'fev1' | 'fvc' | 'fev1Pred' | 'fvcPred' | 'postFev1' | 'postFvc', string>

const fromInput = (i: SpiroInput): Fields => ({
  fev1: String(i.fev1),
  fvc: String(i.fvc),
  fev1Pred: String(i.fev1Pred),
  fvcPred: String(i.fvcPred),
  postFev1: i.post ? String(i.post.fev1) : '',
  postFvc: i.post ? String(i.post.fvc) : '',
})

function Interpreter() {
  const [f, setF] = useState<Fields>(() => fromInput(SPIRO_EXAMPLES[1].input))
  const [withPost, setWithPost] = useState(true)
  const set = (k: keyof Fields) => (v: string) => setF({ ...f, [k]: v })
  const num = (s: string) => (s.trim() === '' ? NaN : Number(s))

  const { result, error } = useMemo(() => {
    const [fev1, fvc, fev1Pred, fvcPred] = [num(f.fev1), num(f.fvc), num(f.fev1Pred), num(f.fvcPred)]
    if (![fev1, fvc, fev1Pred, fvcPred].every((n) => Number.isFinite(n) && n > 0)) return { result: null, error: 'Completa los cuatro valores basales.' }
    if (fev1 > fvc) return { result: null, error: 'El FEV1 no puede ser mayor que la FVC: revisa los valores.' }
    const post = withPost ? { fev1: num(f.postFev1), fvc: num(f.postFvc) } : undefined
    const postOk = post && Number.isFinite(post.fev1) && Number.isFinite(post.fvc) && post.fev1 > 0 && post.fvc > 0 && post.fev1 <= post.fvc
    return { result: interpretSpirometry({ fev1, fvc, fev1Pred, fvcPred, post: postOk ? post : undefined }), error: null }
  }, [f, withPost])

  const p = result ? PATTERN[result.pattern] : null
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card className="p-5 sm:p-6">
        <div className="text-sm font-semibold">Cargar un ejemplo</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {SPIRO_EXAMPLES.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                setF(fromInput(e.input))
                setWithPost(!!e.input.post)
              }}
              className="rounded-full border border-soft px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-brand-500/40 hover:text-[var(--text)]"
            >
              {e.label}
            </button>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <NumField label="FEV1" unit="L" value={f.fev1} onChange={set('fev1')} />
          <NumField label="FVC" unit="L" value={f.fvc} onChange={set('fvc')} />
          <NumField label="FEV1 del predicho" unit="%" value={f.fev1Pred} onChange={set('fev1Pred')} />
          <NumField label="FVC del predicho" unit="%" value={f.fvcPred} onChange={set('fvcPred')} />
        </div>
        <div className="mt-5">
          <Toggle checked={withPost} onChange={setWithPost} label="Prueba con broncodilatador" description="Valores 10–15 min después de 400 µg de salbutamol" />
        </div>
        {withPost && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <NumField label="FEV1 posbroncodilatador" unit="L" value={f.postFev1} onChange={set('postFev1')} />
            <NumField label="FVC posbroncodilatador" unit="L" value={f.postFvc} onChange={set('postFvc')} />
          </div>
        )}
      </Card>

      <div className="space-y-4">
        {error && <Card className="p-5 text-sm text-muted">{error}</Card>}
        {result && p && (
          <motion.div key={result.pattern} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('rounded-2xl bg-gradient-to-br p-5 text-white shadow-lift', p.tone)}>
            <div className="text-xs font-semibold tracking-wider text-white/80 uppercase">Interpretación</div>
            <div className="mt-1 font-display text-3xl font-extrabold">{p.label}</div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-white/20 px-3 py-1 font-semibold">FEV1/FVC {result.ratio.toFixed(2).replace('.', ',')}</span>
              {result.gold && <span className="rounded-full bg-white/20 px-3 py-1 font-semibold">GOLD {result.gold}</span>}
              {result.severity && <span className="rounded-full bg-white/20 px-3 py-1 font-semibold">Gravedad {result.severity}</span>}
            </div>
            <p className="mt-3 text-sm text-white/95">{p.text}</p>
          </motion.div>
        )}
        {result?.bd && (
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">Respuesta al broncodilatador</h3>
              <span className={cn('rounded-full px-3 py-1 text-xs font-bold', result.bd.positive ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300' : 'surface-2 text-muted')}>{result.bd.positive ? 'Positiva' : 'Negativa'}</span>
            </div>
            <p className="mt-2 text-sm">
              FEV1 {result.bd.fev1.ml >= 0 ? '+' : ''}
              {result.bd.fev1.ml} mL ({result.bd.fev1.pct.toString().replace('.', ',')} %) · FVC {result.bd.fvc.ml >= 0 ? '+' : ''}
              {result.bd.fvc.ml} mL ({result.bd.fvc.pct.toString().replace('.', ',')} %)
            </p>
            <p className="mt-2 text-sm text-muted">{bdText(result.bd.positive, result.postRatio)}</p>
          </Card>
        )}
        {p && (
          <Card className="p-4 text-slate-700 dark:text-slate-200">
            <FlowVolumeLoop shape={p.loop} className="block h-auto w-full" />
            <p className="mt-1 text-center text-xs text-muted">Curva típica de este patrón; la punteada es la normal.</p>
          </Card>
        )}
        <p className="text-xs text-muted">Interpretación didáctica con cortes fijos (0,70 y 80 %). En la práctica, usa el límite inferior de la normalidad que da el espirómetro.</p>
      </div>
    </div>
  )
}

function Loops() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {LOOPS.map((l) => (
        <Card key={l.shape} className="p-4">
          <div className="text-slate-700 dark:text-slate-200">
            <FlowVolumeLoop shape={l.shape} className="block h-auto w-full" />
          </div>
          <h3 className="mt-2 font-display font-bold">{l.name}</h3>
          <p className="mt-1 text-sm">{l.what}</p>
          <p className="mt-1 text-sm text-muted">{l.causes}</p>
        </Card>
      ))}
    </div>
  )
}

export default function Spirometry() {
  const [tab, setTab] = useState<'interpretar' | 'curvas' | 'temas' | 'practica'>('interpretar')
  return (
    <div>
      <PageHeader icon={<Wind className="size-6" />} eyebrow="Neumología" title="Espirometría" subtitle="Escribe los valores y mira el patrón, la gravedad y la respuesta al broncodilatador. Aprende a leer las curvas flujo-volumen." />
      <Segmented
        value={tab}
        onChange={setTab}
        className="mb-6"
        options={[
          { value: 'interpretar', label: 'Interpretar' },
          { value: 'curvas', label: 'Curvas' },
          { value: 'temas', label: 'Temas' },
          { value: 'practica', label: 'Práctica' },
        ]}
      />
      {tab === 'interpretar' && <Interpreter />}
      {tab === 'curvas' && <Loops />}
      {tab === 'temas' && (
        <div className="space-y-6">
          <SectionIndex sections={SPIRO_SECTIONS} />
          <StudySections sections={SPIRO_SECTIONS} color={COLOR} />
          <References items={SPIRO_REFERENCES} />
        </div>
      )}
      {tab === 'practica' && <PracticeQuiz items={SPIRO_QUIZ} title="Preguntas de espirometría" />}
    </div>
  )
}
