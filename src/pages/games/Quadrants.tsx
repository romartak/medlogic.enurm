import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { QUADRANTS, REGIONS, TOPO_ITEMS, type Quadrant, type Region, type TopoItem } from '@/data/quadrants'
import { Button, Segmented } from '@/components/ui/primitives'
import { playSound } from '@/lib/fx'
import { cn, shuffle } from '@/lib/utils'
import { GameShell, type EndGame } from './GameShell'

const ROUNDS = 12
type Mode = 'regiones' | 'cuadrantes'
type Zone = Region | Quadrant

const SHORT: Record<Zone, string> = {
  hd: 'Hipocondrio der.',
  epi: 'Epigastrio',
  hi: 'Hipocondrio izq.',
  fd: 'Flanco der.',
  meso: 'Mesogastrio',
  fi: 'Flanco izq.',
  fid: 'Fosa ilíaca der.',
  hipo: 'Hipogastrio',
  fii: 'Fosa ilíaca izq.',
  csd: 'Superior derecho',
  csi: 'Superior izquierdo',
  cid: 'Inferior derecho',
  cii: 'Inferior izquierdo',
}

/** Tronco visto de frente: la derecha del paciente queda a la izquierda de la pantalla. */
function Torso() {
  return (
    <svg viewBox="0 0 300 360" className="absolute inset-0 h-full w-full" aria-hidden>
      <path d="M70 0 C72 30 40 40 34 70 C26 110 40 150 44 190 C48 240 36 290 40 360 H260 C264 290 252 240 256 190 C260 150 274 110 266 70 C260 40 228 30 230 0 Z" fill="#f3dfc8" stroke="#c9a27f" strokeWidth="2" />
      {/* Rebordes costales y apéndice xifoides */}
      <path d="M62 112 Q105 150 150 104 Q195 150 238 112" fill="none" stroke="#c9a27f" strokeWidth="2" />
      {/* Ombligo */}
      <ellipse cx="150" cy="222" rx="5" ry="6" fill="#c9a27f" />
      {/* Ligamentos inguinales y pubis */}
      <path d="M58 300 Q100 322 140 346 M242 300 Q200 322 160 346" fill="none" stroke="#c9a27f" strokeWidth="2" />
    </svg>
  )
}

function Board({ mode, state, onPick, disabled }: { mode: Mode; state: Partial<Record<Zone, 'ok' | 'bad' | 'answer'>>; onPick: (z: Zone) => void; disabled: boolean }) {
  const zones: Zone[] = mode === 'regiones' ? REGIONS.map((r) => r.id) : QUADRANTS.map((q) => q.id)
  const fullName = (z: Zone) => [...REGIONS, ...QUADRANTS].find((x) => x.id === z)!.name
  return (
    <div>
      <div className="mb-1 flex justify-between px-2 text-xs font-bold tracking-wide text-muted uppercase">
        <span>← Derecha del paciente</span>
        <span>Izquierda →</span>
      </div>
      <div className="relative mx-auto aspect-[300/360] w-full max-w-sm">
        <Torso />
        <div className={cn('absolute inset-x-[15%] top-[29%] bottom-[7%] grid gap-0.5', mode === 'regiones' ? 'grid-cols-3 grid-rows-3' : 'grid-cols-2 grid-rows-2')}>
          {zones.map((z) => {
            const s = state[z]
            return (
              <button
                key={z}
                onClick={() => onPick(z)}
                disabled={disabled || !!s}
                aria-label={fullName(z)}
                className={cn(
                  'grid place-items-center rounded-lg border-2 border-dashed p-1 text-center text-[11px] leading-tight font-semibold transition-colors sm:text-xs',
                  s === 'ok' || s === 'answer' ? 'border-emerald-600 bg-emerald-500/35 text-emerald-950' : s === 'bad' ? 'border-rose-600 bg-rose-500/30 text-rose-950' : 'border-[#b08a66]/60 bg-white/10 text-[#6b4f36] hover:bg-white/45',
                )}
              >
                {SHORT[z]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Round({ mode, end }: { mode: Mode; end: EndGame }) {
  const items = useMemo(() => shuffle(TOPO_ITEMS.filter((t) => mode === 'regiones' || t.quadrants)).slice(0, ROUNDS), [mode])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [state, setState] = useState<Partial<Record<Zone, 'ok' | 'bad' | 'answer'>>>({})
  const [resolved, setResolved] = useState(false)
  const item: TopoItem = items[i]
  const valid: Zone[] = mode === 'regiones' ? item.regions : item.quadrants!

  const pick = (z: Zone) => {
    if (resolved) return
    const misses = Object.values(state).filter((v) => v === 'bad').length
    if (valid.includes(z)) {
      playSound('correct')
      setState({ ...state, [z]: 'ok' })
      setResolved(true)
      setScore((s) => s + (misses === 0 ? 10 : 5))
      if (misses === 0) setHits((h) => h + 1)
    } else {
      playSound('wrong')
      const next = { ...state, [z]: 'bad' as const }
      if (misses >= 1) {
        // Segundo error: se muestra la respuesta.
        for (const v of valid) next[v] = 'answer'
        setResolved(true)
      }
      setState(next)
    }
  }

  const next = () => {
    if (i + 1 >= items.length) {
      end(score, <span className="text-muted">{hits} de {items.length} al primer intento</span>)
      return
    }
    setI(i + 1)
    setState({})
    setResolved(false)
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-muted">
          {i + 1} / {items.length}
        </span>
        <span className="font-display text-xl font-bold">{score} pts</span>
      </div>
      <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-center">
        <div className="text-xs font-bold tracking-wider text-muted uppercase">{item.kind === 'órgano' ? '¿Dónde está?' : '¿Dónde duele?'}</div>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-balance">{item.prompt}</h2>
      </motion.div>
      <div className="mt-4">
        <Board mode={mode} state={state} onPick={pick} disabled={resolved} />
      </div>
      {resolved && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-emerald-500/10 p-4 text-sm">
          <div className="font-semibold">{valid.map((v) => [...REGIONS, ...QUADRANTS].find((x) => x.id === v)!.name).join(' o ')}</div>
          <p className="mt-1">{item.why}</p>
        </motion.div>
      )}
      {resolved && (
        <Button className="mt-4 w-full" onClick={next}>
          {i + 1 >= items.length ? 'Ver resultado' : 'Siguiente'} <ArrowRight className="size-4" />
        </Button>
      )}
    </div>
  )
}

function Play({ end }: { end: EndGame }) {
  const [mode, setMode] = useState<Mode>('regiones')
  return (
    <div>
      <Segmented
        value={mode}
        onChange={setMode}
        className="mb-4"
        options={[
          { value: 'regiones', label: '9 regiones' },
          { value: 'cuadrantes', label: '4 cuadrantes' },
        ]}
      />
      <Round key={mode} mode={mode} end={end} />
    </div>
  )
}

export default function Quadrants() {
  return (
    <GameShell
      id="cuadrantes"
      rules={[
        `${ROUNDS} órganos o dolores: toca la región del abdomen donde están.`,
        'El abdomen se ve de frente: la derecha del paciente está a tu izquierda.',
        'Acierto al primer intento: 10 puntos; al segundo: 5. Al segundo error se muestra la respuesta.',
        'Elige entre las 9 regiones o los 4 cuadrantes.',
      ]}
    >
      {(end) => <Play end={end} />}
    </GameShell>
  )
}
