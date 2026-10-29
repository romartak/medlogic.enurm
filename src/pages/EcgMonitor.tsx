import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotionConfig } from 'motion/react'
import { ArrowRight, Check, HeartPulse, Pause, Play, RefreshCw, Volume2, VolumeX, X } from 'lucide-react'
import { ECG_PATTERNS, ecgById, GAIN, loopSegment, SAMPLE_RATE } from '@/lib/ecg'
import { Button, Card, PageHeader, Segmented } from '@/components/ui/primitives'
import { useProgress } from '@/store/progress'
import { playSound } from '@/lib/fx'
import { cn, shuffle } from '@/lib/utils'

const TRACE = '#4ade80'

/**
 * Pantalla de monitor: el trazo se escribe de izquierda a derecha y una franja negra borra lo viejo por
 * delante, como en un monitor de cabecera. El dibujo sigue al reloj real (no a los cuadros), así la
 * velocidad es la misma en cualquier equipo.
 */
function MonitorScreen({ samples, beats, playing, onBeat }: { samples: number[]; beats: number[]; playing: boolean; onBeat: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const onBeatRef = useRef(onBeat)
  onBeatRef.current = onBeat

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const span = samples.length / SAMPLE_RATE
    let w = 0
    let h = 0
    let windowSec = 6
    const size = () => {
      const dpr = Math.min(2, devicePixelRatio || 1)
      w = c.clientWidth
      h = c.clientHeight
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      windowSec = w < 520 ? 4 : 6
      ctx.clearRect(0, 0, w, h)
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(c)

    const y = (mv: number) => h * 0.58 - mv * (h * 0.26)
    let tau = 0 // segundos dibujados desde que empezó
    let last = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      if (playing && w > 0) {
        const from = tau
        const to = tau + dt
        const xOf = (t: number) => ((t % windowSec) / windowSec) * w
        // Borra por delante del cursor.
        const x1 = xOf(to)
        ctx.clearRect(x1, 0, 14, h)
        if (x1 + 14 > w) ctx.clearRect(0, 0, x1 + 14 - w, h)
        ctx.strokeStyle = TRACE
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.beginPath()
        let prevX = xOf(from)
        ctx.moveTo(prevX, y(samples[Math.floor(from * SAMPLE_RATE) % samples.length]))
        for (let i = Math.floor(from * SAMPLE_RATE) + 1; i <= Math.floor(to * SAMPLE_RATE); i++) {
          const t = i / SAMPLE_RATE
          const x = xOf(t)
          const v = y(samples[i % samples.length])
          if (x < prevX) ctx.moveTo(x, v)
          else ctx.lineTo(x, v)
          prevX = x
        }
        ctx.stroke()
        // ¿Pasó un QRS en este intervalo?
        const a = from % span
        const b = to % span
        if (beats.some((r) => (a <= b ? r > a && r <= b : r > a || r <= b))) onBeatRef.current()
        tau = to
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [samples, beats, playing])

  return <canvas ref={canvas} className="block h-40 w-full sm:h-56" aria-hidden />
}

/** Trazo quieto (para «reducir movimiento» o en pausa antes de empezar). */
function StillTrace({ samples }: { samples: number[] }) {
  const n = Math.min(samples.length, SAMPLE_RATE * 6)
  let d = ''
  for (let i = 0; i < n; i += 2) d += `${i ? 'L' : 'M'}${((i / SAMPLE_RATE) * 25).toFixed(2)} ${(26 - samples[i] * GAIN * 0.8).toFixed(2)}`
  return (
    <svg viewBox="0 0 150 44" preserveAspectRatio="none" className="block h-40 w-full sm:h-56" aria-hidden>
      <path d={d} fill="none" stroke={TRACE} strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Monitor({ patternId, seed, hideName, children }: { patternId: string; seed: string; hideName?: boolean; children?: React.ReactNode }) {
  const reduce = useReducedMotionConfig()
  const soundOn = useProgress((s) => s.settings.sound)
  const [playing, setPlaying] = useState(!reduce)
  const [beep, setBeep] = useState(false)
  const [pulse, setPulse] = useState(0)
  const seg = useMemo(() => loopSegment(patternId, seed), [patternId, seed])
  const pattern = ecgById(patternId)

  const onBeat = () => {
    setPulse((p) => p + 1)
    if (beep && soundOn) playSound('tick')
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-[#06110c] text-white shadow-lift ring-1 ring-black/40">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
        <span>DII · 25 mm/s</span>
        <span>{hideName ? 'Ritmo: ?' : pattern.name}</span>
      </div>
      <div className="grid sm:grid-cols-[1fr_auto]">
        <div className="relative bg-[linear-gradient(rgb(34_197_94/0.08)_1px,transparent_1px),linear-gradient(90deg,rgb(34_197_94/0.08)_1px,transparent_1px)] bg-[size:20px_20px]">
          {playing ? <MonitorScreen samples={seg.samples} beats={seg.beats} playing={playing} onBeat={onBeat} /> : <StillTrace samples={seg.samples} />}
        </div>
        <div className="flex items-center gap-6 border-white/10 px-5 py-2 max-sm:border-t sm:w-40 sm:flex-col sm:items-start sm:justify-center sm:border-l">
          <div>
            <div className="text-xs font-semibold text-white/60">FC</div>
            <div className="flex items-center gap-2 font-mono text-4xl font-bold text-green-400 tabular-nums sm:text-5xl">
              {seg.rate ?? '---'}
              {/* Late con cada QRS del trazo: es un dato, no un adorno. */}
              <HeartPulse key={pulse} className={cn('size-6 text-green-400', pulse > 0 && 'animate-beat')} />
            </div>
            <div className="text-xs text-white/50">lpm</div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-3 py-2">
        <button onClick={() => setPlaying(!playing)} className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-white/85 hover:bg-white/10">
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />} {playing ? 'Pausar' : 'Reproducir'}
        </button>
        <button onClick={() => setBeep(!beep)} disabled={!soundOn} aria-pressed={beep} className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-white/85 hover:bg-white/10 disabled:opacity-40" title={soundOn ? undefined : 'El sonido está apagado en Configuración'}>
          {beep ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />} Pitido
        </button>
        {children}
      </div>
    </div>
  )
}

function Explore() {
  const [id, setId] = useState('sinusal')
  const [seed, setSeed] = useState('a')
  const p = ecgById(id)
  return (
    <div className="space-y-4">
      <Monitor patternId={id} seed={seed}>
        <button onClick={() => setSeed(Math.random().toString(36).slice(2, 7))} className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-white/85 hover:bg-white/10">
          <RefreshCw className="size-4" /> Otro paciente
        </button>
      </Monitor>
      <div className="flex flex-wrap gap-2">
        {ECG_PATTERNS.map((x) => (
          <button key={x.id} onClick={() => setId(x.id)} aria-pressed={x.id === id} className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors', x.id === id ? 'border-brand-500 bg-brand-500/10 text-brand-800 dark:text-brand-200' : 'border-soft text-muted hover:border-brand-500/40 hover:text-[var(--text)]')}>
            {x.name}
          </button>
        ))}
      </div>
      <Card className="p-5">
        <h2 className="font-display text-lg font-bold">{p.name}</h2>
        <p className="mt-2 text-sm">
          <b>Cómo reconocerlo:</b> {p.clues}
        </p>
        <p className="mt-1 text-sm text-muted">
          <b className="text-[var(--text)]">Qué hacer:</b> {p.management}
        </p>
      </Card>
    </div>
  )
}

function Challenge() {
  const addXp = useProgress((s) => s.addXp)
  const newItem = () => {
    const id = shuffle(ECG_PATTERNS)[0].id
    return { id, seed: Math.random().toString(36).slice(2, 7), options: shuffle([id, ...shuffle(ECG_PATTERNS.filter((p) => p.id !== id)).slice(0, 3).map((p) => p.id)]) }
  }
  const [item, setItem] = useState(newItem)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState({ ok: 0, total: 0 })
  const p = ecgById(item.id)

  const choose = (id: string) => {
    if (picked) return
    setPicked(id)
    const ok = id === item.id
    playSound(ok ? 'correct' : 'wrong')
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }))
    if (ok) addXp(2)
  }

  return (
    <div className="space-y-4">
      <Monitor key={`${item.id}-${item.seed}`} patternId={item.id} seed={item.seed} hideName={!picked} />
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">¿Qué ritmo tiene el paciente?</h2>
          <span className="text-sm font-semibold text-muted tabular-nums">
            {score.ok}/{score.total}
          </span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {item.options.map((id) => {
            const right = picked && id === item.id
            const wrong = picked === id && id !== item.id
            return (
              <button key={id} onClick={() => choose(id)} disabled={!!picked} className={cn('flex min-h-12 items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium transition-colors', right ? 'border-emerald-500 bg-emerald-500/10' : wrong ? 'border-rose-500 bg-rose-500/10' : 'border-soft hover:border-brand-500/40', picked && !right && !wrong && 'opacity-60')}>
                {right && <Check className="size-4 shrink-0 text-emerald-600" />}
                {wrong && <X className="size-4 shrink-0 text-rose-600" />}
                {ecgById(id).name}
              </button>
            )
          })}
        </div>
        {picked && (
          <div className={cn('mt-4 rounded-xl p-4 text-sm', picked === item.id ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
            <div className="font-semibold">{picked === item.id ? '¡Correcto!' : `Es: ${p.name}`}</div>
            <p className="mt-1">
              <b>Cómo reconocerlo:</b> {p.clues}
            </p>
            <p className="mt-1">
              <b>Qué hacer:</b> {p.management}
            </p>
          </div>
        )}
        {picked && (
          <Button
            className="mt-4 w-full"
            onClick={() => {
              setItem(newItem())
              setPicked(null)
            }}
          >
            Siguiente paciente <ArrowRight className="size-4" />
          </Button>
        )}
      </Card>
    </div>
  )
}

export default function EcgMonitor() {
  const [mode, setMode] = useState<'explorar' | 'reto'>('explorar')
  return (
    <div>
      <PageHeader icon={<HeartPulse className="size-6" />} eyebrow="ECG" title="Monitor en vivo" subtitle="Mira cada ritmo correr como en el monitor de la emergencia, con su frecuencia. En el reto, el paciente llega y tú dices qué tiene." />
      <Segmented
        value={mode}
        onChange={setMode}
        className="mb-6"
        options={[
          { value: 'explorar', label: 'Explorar ritmos' },
          { value: 'reto', label: 'Reto' },
        ]}
      />
      {mode === 'explorar' ? <Explore /> : <Challenge />}
      <p className="mt-6 text-xs text-muted">
        Trazos simulados de una derivación (DII) con fines didácticos. Para diagnosticar usa siempre el ECG de 12 derivaciones. ¿Prefieres tiras en papel? Juega a{' '}
        <Link to="/ecg" className="font-semibold underline">
          Lee el ECG
        </Link>
        .
      </p>
    </div>
  )
}
