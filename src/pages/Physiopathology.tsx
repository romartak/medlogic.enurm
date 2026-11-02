import { useEffect, useId, useMemo, useState, type KeyboardEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Eye, Minus, Pause, Pill, Play, Waypoints, Lightbulb, X } from 'lucide-react'
import { KIND_INFO, PHYSIO_QUIZ, PHYSIO_REFERENCES, SCHEMES, SHOCK_PARAMS, SHOCKS, type Scheme, type SchemeEdge, type SchemeNode, type ShockType, type ShockValue } from '@/data/physiopathology'
import { Card, PageHeader, Segmented, Toggle } from '@/components/ui/primitives'
import { PracticeQuiz } from '@/components/PracticeQuiz'
import { References } from '@/components/StudySections'
import { cn, solidBg, tintText } from '@/lib/utils'

/* Rejilla del esquema (unidades del viewBox). */
const W = 404
const X0 = 14
const COL_W = 118
const GAP = 13
const BOX_H = 44
const ROW = 68
const Y0 = 10
const LANE_L = 5
const LANE_R = W - 5

export const boxOf = (n: Pick<SchemeNode, 'col' | 'row'>) => ({ x: X0 + n.col * (COL_W + GAP), y: Y0 + n.row * ROW, w: COL_W, h: BOX_H })
export const schemeHeight = (s: Scheme) => Y0 + Math.max(...s.nodes.map((n) => n.row)) * ROW + BOX_H + 12
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Ruta ortogonal de una flecha: recta, en codo, o rodeando el esquema por un costado. */
function edgePath(e: SchemeEdge, a: SchemeNode, b: SchemeNode) {
  const A = boxOf(a)
  const B = boxOf(b)
  if (e.route) {
    const left = e.route === 'left'
    const sx = left ? A.x : A.x + A.w
    const tx = left ? B.x : B.x + B.w
    const lane = left ? LANE_L : LANE_R
    const sy = A.y + A.h / 2
    const ty = B.y + B.h / 2
    return `M${sx} ${sy} H${lane} V${ty} H${tx + (left ? -3 : 3)}`
  }
  const tcx = B.x + B.w / 2
  const sx = clamp(tcx, A.x + 14, A.x + A.w - 14)
  const sy = A.y + A.h
  const ty = B.y - 3
  if (Math.abs(sx - tcx) < 1) return `M${sx} ${sy} V${ty}`
  const mid = (sy + B.y) / 2 + (tcx > sx ? 4 : -4)
  return `M${sx} ${sy} V${mid} H${tcx} V${ty}`
}

const lines = (label: string) => label.split('\n')

function SchemeDiagram({ scheme, step, selected, onSelect, showDrugs }: { scheme: Scheme; step: number; selected: string | null; onSelect: (id: string) => void; showDrugs: boolean }) {
  const uid = useId().replace(/:/g, '')
  const byId = useMemo(() => new Map(scheme.nodes.map((n) => [n.id, n])), [scheme])
  const drugIndex = useMemo(() => {
    const m = new Map<string, number[]>()
    scheme.drugs.forEach((d, i) => m.set(d.target, [...(m.get(d.target) ?? []), i + 1]))
    return m
  }, [scheme])
  const H = schemeHeight(scheme)
  const key = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" role="group" aria-label={`Esquema: ${scheme.title}`}>
      <defs>
        <marker id={`arr-${uid}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
        </marker>
      </defs>
      {scheme.edges.map((e) => {
        const a = byId.get(e.from)!
        const b = byId.get(e.to)!
        const shown = Math.max(a.step, b.step) <= step
        const fresh = shown && Math.max(a.step, b.step) === step
        const d = edgePath(e, a, b)
        return (
          <g key={`${e.from}-${e.to}`} className={cn('transition-opacity duration-300', e.loop ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500')} opacity={shown ? 1 : 0.13}>
            <motion.path
              key={fresh ? `f${step}` : 's'}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth={e.loop ? 1.8 : 1.6}
              strokeDasharray={e.loop ? '5 4' : undefined}
              strokeLinejoin="round"
              markerEnd={`url(#arr-${uid})`}
              initial={fresh ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            />
          </g>
        )
      })}
      {scheme.nodes.map((n) => {
        const b = boxOf(n)
        const color = KIND_INFO[n.kind].color
        const shown = n.step <= step
        const current = n.step === step
        const isSel = selected === n.id
        const ls = lines(n.label)
        const drugs = showDrugs ? (drugIndex.get(n.id) ?? []) : []
        return (
          <g
            key={n.id}
            role="button"
            tabIndex={0}
            aria-label={`${ls.join(' ')}${shown ? '' : ' (aún no aparece)'}`}
            aria-pressed={isSel}
            onClick={() => onSelect(n.id)}
            onKeyDown={(e) => key(e, n.id)}
            className="cursor-pointer outline-none [&:focus-visible>rect.ring]:stroke-[3]"
            opacity={shown ? 1 : 0.22}
            style={{ transition: 'opacity 300ms' }}
          >
            {(isSel || current) && shown && (
              <rect x={b.x - 4} y={b.y - 4} width={b.w + 8} height={b.h + 8} rx={13} fill={color} fillOpacity={isSel ? 0.22 : 0.12} className={current && !isSel ? 'fp-glow' : undefined} />
            )}
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={10} fill="var(--surface)" />
            <rect className="ring" x={b.x} y={b.y} width={b.w} height={b.h} rx={10} fill={color} fillOpacity={0.13} stroke={color} strokeWidth={isSel ? 2.6 : 1.4} strokeDasharray={shown ? undefined : '4 3'} />
            <rect x={b.x} y={b.y + 9} width={3.5} height={b.h - 18} rx={1.75} fill={color} />
            <text x={b.x + b.w / 2 + 1.5} y={b.y + b.h / 2 + (ls.length > 1 ? -2.5 : 3.6)} textAnchor="middle" fontSize="10.4" fontWeight={600} fill="var(--text)" fontFamily="inherit">
              {ls.map((l, i) => (
                <tspan key={i} x={b.x + b.w / 2 + 1.5} dy={i ? 12.5 : 0}>
                  {l}
                </tspan>
              ))}
            </text>
            {drugs.map((num, i) => (
              <g key={num} transform={`translate(${b.x + b.w - 6 - i * 17} ${b.y - 1})`}>
                <circle r={8} fill="#047857" stroke="var(--surface)" strokeWidth={2} />
                <text y={3.4} textAnchor="middle" fontSize="9.5" fontWeight={700} fill="#fff">
                  {num}
                </text>
              </g>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
      {Object.values(KIND_INFO).map((k) => (
        <span key={k.label} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: k.color }} /> {k.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <svg width="18" height="6" aria-hidden className="text-rose-500">
          <path d="M1 3H17" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4 3" />
        </svg>
        Círculo vicioso
      </span>
    </div>
  )
}

function SchemeViewer({ scheme }: { scheme: Scheme }) {
  const total = scheme.steps.length
  const [step, setStep] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [showDrugs, setShowDrugs] = useState(false)

  useEffect(() => {
    if (!playing) return
    if (step >= total) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setStep((s) => s + 1), 2800)
    return () => clearTimeout(t)
  }, [playing, step, total])

  const go = (s: number) => {
    setStep(clamp(s, 1, total))
    setSelected(null)
  }
  const node = selected ? scheme.nodes.find((n) => n.id === selected) : undefined
  const nodeDrugs = node ? scheme.drugs.map((d, i) => ({ ...d, num: i + 1 })).filter((d) => d.target === node.id) : []

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <Card className="self-start p-3 sm:p-5 lg:sticky lg:top-20">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="text-sm font-semibold">
            Paso {step} <span className="font-normal text-muted">de {total}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IconBtn label="Paso anterior" onClick={() => go(step - 1)} disabled={step <= 1}>
              <ChevronLeft className="size-4" />
            </IconBtn>
            <button
              type="button"
              onClick={() => {
                if (step >= total) go(1)
                setPlaying((p) => !p)
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
              style={solidBg(scheme.color)}
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {playing ? 'Pausa' : step >= total ? 'Repetir' : 'Reproducir'}
            </button>
            <IconBtn label="Paso siguiente" onClick={() => go(step + 1)} disabled={step >= total}>
              <ChevronRight className="size-4" />
            </IconBtn>
            <IconBtn label="Ver el esquema completo" onClick={() => go(total)} disabled={step >= total}>
              <Eye className="size-4" />
            </IconBtn>
          </div>
        </div>
        <div className="mb-3 flex gap-1 px-1" aria-hidden>
          {scheme.steps.map((_, i) => (
            <span key={i} className="h-1 flex-1 rounded-full transition-colors duration-300" style={{ backgroundColor: i < step ? scheme.color : 'var(--surface-2)' }} />
          ))}
        </div>
        <div className="mx-auto max-w-[560px]">
          <SchemeDiagram scheme={scheme} step={step} selected={selected} onSelect={(id) => setSelected((s) => (s === id ? null : id))} showDrugs={showDrugs} />
        </div>
        <div className="mt-3 px-1">
          <Legend />
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5" aria-live="polite">
          {node ? (
            <motion.div key={node.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: `${KIND_INFO[node.kind].color}1f`, ...tintText(KIND_INFO[node.kind].color) }}>
                  {KIND_INFO[node.kind].label}
                </span>
                <button type="button" onClick={() => setSelected(null)} className="relative -m-1 rounded-lg p-1 text-muted after:absolute after:-inset-2 hover:text-[var(--text)]" aria-label="Volver al paso">
                  <X className="size-4" />
                </button>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold">{lines(node.label).join(' ')}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed">{node.detail}</p>
              {nodeDrugs.map((d) => (
                <div key={d.num} className="mt-3 flex gap-2.5 rounded-xl bg-emerald-500/10 p-3 text-sm">
                  <Pill className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                  <span>
                    <span className="font-semibold">{d.name}.</span> {d.how}
                  </span>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div className="text-xs font-semibold tracking-wider uppercase" style={tintText(scheme.color)}>
                Paso {step}
              </div>
              <p className="mt-1.5 text-[15px] leading-relaxed">{scheme.steps[step - 1]}</p>
              <p className="mt-3 text-xs text-muted">Toca cualquier recuadro del esquema para ver qué pasa en ese punto.</p>
            </motion.div>
          )}
        </Card>

        <Card className="px-5 py-1">
          <Toggle checked={showDrugs} onChange={setShowDrugs} label="Dónde actúa el tratamiento" description="Marca en el esquema el punto que bloquea cada fármaco" />
          {showDrugs && (
            <ol className="space-y-2.5 pb-4">
              {scheme.drugs.map((d, i) => (
                <li key={d.name}>
                  <button
                    type="button"
                    onClick={() => {
                      const target = scheme.nodes.find((n) => n.id === d.target)!
                      if (target.step > step) setStep(target.step)
                      setSelected(d.target)
                    }}
                    className="flex w-full gap-2.5 rounded-xl p-2 text-left text-sm transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-700 text-xs font-bold text-white">{i + 1}</span>
                    <span>
                      <span className="font-semibold">{d.name}</span>
                      <span className="mt-0.5 block text-muted">{d.how}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <div className="flex gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-4 text-sm">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p>
            <span className="font-semibold">Perla ENURM: </span>
            {scheme.pearl}
          </p>
        </div>
      </div>
    </div>
  )
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="grid size-10 place-items-center rounded-xl border border-soft text-muted transition-colors hover:text-[var(--text)] disabled:opacity-40">
      {children}
    </button>
  )
}

function Schemes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const scheme = SCHEMES.find((s) => s.id === id) ?? SCHEMES[0]
  return (
    <div className="space-y-5">
      <nav className="flex flex-wrap gap-2" aria-label="Fisiopatologías">
        {SCHEMES.map((s) => {
          const active = s.id === scheme.id
          return (
            <button
              key={s.id}
              type="button"
              aria-current={active ? 'true' : undefined}
              onClick={() => navigate(`/fisiopatologia/${s.id}`, { replace: true })}
              className={cn('relative rounded-full border px-3 py-2 text-xs font-semibold transition-colors after:absolute after:inset-x-0 after:-inset-y-[5px] sm:text-sm', active ? 'border-transparent text-white shadow-sm' : 'border-soft text-muted hover:text-[var(--text)]')}
              style={active ? solidBg(s.color) : undefined}
            >
              {s.short}
            </button>
          )
        })}
      </nav>
      <motion.div key={scheme.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase" style={tintText(scheme.color)}>
            {scheme.area}
          </div>
          <h2 className="mt-0.5 font-display text-xl font-bold sm:text-2xl">{scheme.title}</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted sm:text-base">{scheme.summary}</p>
        </div>
        <SchemeViewer key={scheme.id} scheme={scheme} />
      </motion.div>
    </div>
  )
}

/* ---------- Shock: circuito animado ---------- */

const ART = 'M92 86 C100 50 120 40 150 40 L250 40 C272 40 286 56 286 80'
const VEN = 'M286 130 C286 154 272 170 250 170 L150 170 C120 170 100 160 92 124'
const HEART = 'M70 130 C38 110 30 90 44 78 C55 69 66 73 70 82 C74 73 85 69 96 78 C110 90 102 110 70 130 Z'

const arrow = (v: ShockValue['v']) => (v > 0 ? '↑' : v < 0 ? '↓' : '=')

function ShockCircuit({ shock }: { shock: ShockType }) {
  const artW = shock.rvs.v > 0 ? 5 : shock.rvs.v < 0 ? 15 : 9
  const venW = shock.pvc.v > 0 ? 15 : shock.pvc.v < 0 ? 5 : 9
  const flow = shock.gc.v > 0 ? 1.1 : shock.gc.v < 0 ? 3.4 : 2
  const beat = shock.fc.v > 0 ? 0.5 : shock.fc.v < 0 ? 1.5 : 0.85
  const weak = shock.id === 'cardiogenico'
  const blocked = shock.id === 'obstructivo'
  const warm = shock.skin === 'caliente'
  return (
    <svg viewBox="0 0 360 210" className="block h-auto w-full" role="img" aria-label={`Circulación en el shock ${shock.name.toLowerCase()}: RVS ${arrow(shock.rvs.v)}, precarga ${arrow(shock.pvc.v)}, gasto ${arrow(shock.gc.v)}`}>
      {/* Vasos */}
      <path d={ART} fill="none" stroke="#ef4444" strokeOpacity={0.85} strokeWidth={artW} strokeLinecap="round" style={{ transition: 'stroke-width 500ms var(--ease-out)' }} />
      <path d={VEN} fill="none" stroke="#6366f1" strokeOpacity={0.8} strokeWidth={venW} strokeLinecap="round" style={{ transition: 'stroke-width 500ms var(--ease-out)' }} />
      {/* Flujo */}
      {[ART, VEN].map((d) => (
        <path key={d} d={d} fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={2.4} strokeLinecap="round" strokeDasharray="2 14" className="fp-flow" style={{ animationDuration: `${flow}s` }} />
      ))}
      {/* Tejidos */}
      <rect x={286} y={68} width={56} height={74} rx={12} fill={warm ? '#f97316' : '#38bdf8'} fillOpacity={0.16} stroke={warm ? '#f97316' : '#0ea5e9'} strokeWidth={1.4} />
      {[84, 100, 116, 132].map((y) => (
        <path key={y} d={`M294 ${y} q6 -6 12 0 t12 0 t12 0 t12 0`} fill="none" stroke={warm ? '#ea580c' : '#0284c7'} strokeOpacity={0.55} strokeWidth={1.4} />
      ))}
      <text x={314} y={160} textAnchor="middle" fontSize="10" fontWeight={600} fill="var(--muted)">
        Tejidos
      </text>
      <text x={314} y={60} textAnchor="middle" fontSize="9.5" fontWeight={700} fill={warm ? '#c2410c' : '#0369a1'}>
        {warm ? 'piel caliente' : 'piel fría'}
      </text>
      {/* Corazón */}
      <g className="fp-beat" style={{ animationDuration: `${beat}s` }}>
        <path d={HEART} fill="#e11d48" fillOpacity={weak ? 0.35 : 0.9} stroke="#be123c" strokeWidth={1.5} strokeDasharray={weak ? '4 3' : undefined} />
      </g>
      {blocked && <circle cx={70} cy={102} r={40} fill="none" stroke="#7c3aed" strokeWidth={5} strokeOpacity={0.75} strokeDasharray="10 6" />}
      <text x={70} y={160} textAnchor="middle" fontSize="10" fontWeight={600} fill="var(--muted)">
        {weak ? 'Bomba débil' : blocked ? 'Corazón comprimido' : 'Corazón'}
      </text>
      <text x={200} y={24} textAnchor="middle" fontSize="10" fontWeight={600} fill="var(--text)">
        Arterias · RVS {arrow(shock.rvs.v)}
      </text>
      <text x={200} y={196} textAnchor="middle" fontSize="10" fontWeight={600} fill="var(--text)">
        Venas · precarga {arrow(shock.pvc.v)}
      </text>
    </svg>
  )
}

function ValueTile({ label, hint, value }: { label: string; hint: string; value: ShockValue }) {
  const Icon = value.v > 0 ? ArrowUp : value.v < 0 ? ArrowDown : Minus
  const tone = value.v > 0 ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10' : value.v < 0 ? 'text-sky-700 dark:text-sky-400 bg-sky-500/10' : 'text-muted surface-2'
  return (
    <div className="rounded-xl border border-soft p-3" title={hint}>
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className={cn('grid size-8 place-items-center rounded-lg', tone)}>
          <Icon className="size-4.5" strokeWidth={2.6} />
        </span>
        <span className="text-xs leading-tight text-muted">{value.note ?? (value.v > 0 ? 'Alta' : value.v < 0 ? 'Baja' : 'Normal')}</span>
      </div>
    </div>
  )
}

function ShockLab() {
  const [id, setId] = useState(SHOCKS[0].id)
  const shock = SHOCKS.find((s) => s.id === id)!
  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-sm text-muted sm:text-base">
        Elige un tipo de shock y mira cómo cambian el grosor de los vasos (resistencia y precarga), la velocidad del flujo (gasto cardíaco) y el latido (frecuencia).
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de shock">
        {SHOCKS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={s.id === id}
            onClick={() => setId(s.id)}
            className={cn('relative rounded-full border px-3 py-2 text-xs font-semibold transition-colors after:absolute after:inset-x-0 after:-inset-y-[5px] sm:text-sm', s.id === id ? 'border-transparent text-white shadow-sm' : 'border-soft text-muted hover:text-[var(--text)]')}
            style={s.id === id ? solidBg(s.color) : undefined}
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card className="p-4 sm:p-5">
          <ShockCircuit shock={shock} />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SHOCK_PARAMS.map((p) => (
              <ValueTile key={p.key} label={p.label} hint={p.hint} value={shock[p.key]} />
            ))}
          </div>
        </Card>
        <motion.div key={shock.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
          <Card className="p-5">
            <div className="text-xs font-semibold tracking-wider uppercase" style={tintText(shock.color)}>
              Shock {shock.name.toLowerCase()}
            </div>
            <p className="mt-1.5 text-[15px] leading-relaxed">{shock.mechanism}</p>
            <p className="mt-3 text-sm text-muted">
              <span className="font-semibold text-[var(--text)]">Causas: </span>
              {shock.causes}
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-semibold">Pista clínica</h2>
            <p className="mt-1 text-sm">{shock.clue}</p>
            <h2 className="mt-4 text-sm font-semibold">Manejo inicial</h2>
            <p className="mt-1 text-sm">{shock.treatment}</p>
          </Card>
        </motion.div>
      </div>
      <Card className="overflow-x-auto p-0" tabIndex={0} role="region" aria-label="Resumen de los tipos de shock">
        <table className="w-full min-w-[560px] text-left text-sm">
          <caption className="px-5 pt-4 pb-2 text-left text-sm font-semibold">Resumen para memorizar</caption>
          <thead className="text-xs text-muted">
            <tr className="border-b border-soft">
              <th className="px-5 py-2 font-semibold">Tipo</th>
              {SHOCK_PARAMS.map((p) => (
                <th key={p.key} className="px-2 py-2 text-center font-semibold" title={p.hint}>
                  {p.label === 'Gasto cardíaco' ? 'GC' : p.label === 'Frecuencia' ? 'FC' : p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHOCKS.map((s) => (
              <tr key={s.id} className={cn('border-b border-soft last:border-0', s.id === id && 'bg-[var(--surface-2)]')}>
                <th scope="row" className="px-5 py-2 font-semibold">
                  {s.name}
                </th>
                {SHOCK_PARAMS.map((p) => (
                  <td key={p.key} className="px-2 py-2 text-center font-bold tabular-nums">
                    {arrow(s[p.key].v)}
                    {s[p.key].note && <span className="ml-0.5 text-muted">*</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-5 pb-4 text-xs text-muted">* Depende de la causa o de la fase: mira el detalle de cada tipo.</p>
      </Card>
    </div>
  )
}

export default function Physiopathology() {
  const { id } = useParams()
  const [tab, setTab] = useState<'esquemas' | 'shock' | 'practica'>('esquemas')
  useEffect(() => {
    if (id) setTab('esquemas')
  }, [id])
  return (
    <div>
      <PageHeader
        icon={<Waypoints className="size-6" />}
        eyebrow="Mecanismos de enfermedad"
        title="Fisiopatología"
        subtitle="Las fisiopatologías más preguntadas, paso a paso: de la causa al síntoma y al punto donde actúa cada tratamiento."
      />
      <Segmented
        value={tab}
        onChange={setTab}
        className="mb-6"
        options={[
          { value: 'esquemas', label: 'Esquemas' },
          { value: 'shock', label: 'Shock' },
          { value: 'practica', label: 'Práctica' },
        ]}
      />
      {tab === 'esquemas' && <Schemes />}
      {tab === 'shock' && <ShockLab />}
      {tab === 'practica' && (
        <>
          <h2 className="sr-only">Práctica</h2>
          <PracticeQuiz items={PHYSIO_QUIZ} title="Preguntas de fisiopatología" size={10} />
        </>
      )}
      <div className="mt-8">
        <References items={PHYSIO_REFERENCES} />
      </div>
    </div>
  )
}
