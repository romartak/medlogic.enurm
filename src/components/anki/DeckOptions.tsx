import { useEffect, useState, type ReactNode } from 'react'
import { Copy, Info, RotateCcw, Save, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button, Toggle } from '@/components/ui/primitives'
import { useAnki, configFor } from '@/store/anki'
import { DEFAULT_CONFIG } from '@/lib/anki/scheduler'
import type { DeckConfig } from '@/lib/anki/types'
import { toast } from '@/store/toasts'

function Field({ label, help, children }: { label: string; help: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 py-3 sm:grid-cols-[1fr_180px] sm:items-center">
      <div>
        <div className="flex items-center gap-1.5 text-sm font-medium">{label}</div>
        <div className="text-xs text-muted">{help}</div>
      </div>
      {children}
    </div>
  )
}

const input = 'h-10 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500'

function Num({ value, onChange, step = 1, min = 0, suffix }: { value: number; onChange: (n: number) => void; step?: number; min?: number; suffix?: string }) {
  return (
    <span className="flex items-center gap-2">
      <input type="number" value={value} step={step} min={min} onChange={(e) => onChange(Number(e.target.value))} className={input} />
      {suffix && <span className="shrink-0 text-xs text-muted">{suffix}</span>}
    </span>
  )
}

function Steps({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  const [text, setText] = useState(value.map(fmtStep).join(' '))
  useEffect(() => setText(value.map(fmtStep).join(' ')), [value])
  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onChange(parseSteps(text))}
      className={input}
      placeholder="1m 10m"
    />
  )
}

function fmtStep(m: number): string {
  if (m >= 1440 && m % 1440 === 0) return `${m / 1440}d`
  if (m >= 60 && m % 60 === 0) return `${m / 60}h`
  return `${m}m`
}

/** "1m 10m 1h 1d" → minutos. */
export function parseSteps(s: string): number[] {
  return s
    .split(/[\s,]+/)
    .map((t) => {
      const m = /^(\d+(?:[.,]\d+)?)\s*([smhd]?)$/i.exec(t.trim())
      if (!m) return NaN
      const n = Number(m[1].replace(',', '.'))
      const u = m[2].toLowerCase()
      return u === 's' ? n / 60 : u === 'h' ? n * 60 : u === 'd' ? n * 1440 : n
    })
    .filter((n) => Number.isFinite(n) && n > 0)
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-soft px-4">
      <h3 className="pt-4 text-xs font-bold tracking-wider text-brand-600 uppercase dark:text-brand-400">{title}</h3>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </section>
  )
}

export function DeckOptions({ deckKey, deckName, open, onClose }: { deckKey: string; deckName: string; open: boolean; onClose: () => void }) {
  const configs = useAnki((s) => s.configs)
  const deckConfig = useAnki((s) => s.deckConfig)
  const saveConfig = useAnki((s) => s.saveConfig)
  const addConfig = useAnki((s) => s.addConfig)
  const deleteConfig = useAnki((s) => s.deleteConfig)
  const setDeckConfig = useAnki((s) => s.setDeckConfig)
  const current = configFor({ configs, deckConfig }, deckKey)
  const [c, setC] = useState<DeckConfig>(current)
  useEffect(() => {
    if (open) setC(current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, current.id])

  const users = Object.entries(deckConfig).filter(([, v]) => v === c.id).length + (c.id === 'default' ? 1 : 0)
  const set = (patch: Partial<DeckConfig>) => setC({ ...c, ...patch })

  return (
    <Modal open={open} onClose={onClose} title={`Opciones: ${deckName}`} className="sm:max-w-2xl">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-2 rounded-2xl surface-2 p-3">
          <label className="min-w-48 flex-1">
            <span className="text-xs font-semibold text-muted">Preset (compartido entre mazos)</span>
            <select
              value={c.id}
              onChange={(e) => {
                setDeckConfig(deckKey, e.target.value)
                const next = configs.find((x) => x.id === e.target.value)
                if (next) setC(next)
              }}
              className={`${input} mt-1`}
            >
              {configs.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const name = window.prompt('Nombre del nuevo preset', `${c.name} (copia)`)
              if (!name) return
              const id = addConfig(c, name)
              setDeckConfig(deckKey, id)
              setC({ ...c, id, name })
            }}
          >
            <Copy className="size-4" /> Clonar
          </Button>
          {c.id !== 'default' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-500"
              onClick={() => {
                deleteConfig(c.id)
                setC(configs.find((x) => x.id === 'default') ?? DEFAULT_CONFIG)
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
        <p className="flex items-start gap-2 text-xs text-muted">
          <Info className="mt-0.5 size-3.5 shrink-0" /> Este preset lo usan {users} {users === 1 ? 'mazo' : 'mazos'}. Los cambios afectan a todos ellos, como en Anki.
        </p>

        <label className="block">
          <span className="text-sm font-medium">Nombre del preset</span>
          <input value={c.name} onChange={(e) => set({ name: e.target.value })} className={`${input} mt-1`} />
        </label>

        <Section title="Límites diarios">
          <Field label="Nuevas tarjetas por día" help="Cuántas tarjetas nuevas se introducen cada día.">
            <Num value={c.newPerDay} onChange={(n) => set({ newPerDay: n })} />
          </Field>
          <Field label="Repasos máximos por día" help="Tope de repasos; si lo superas a menudo, baja las nuevas por día.">
            <Num value={c.reviewsPerDay} onChange={(n) => set({ reviewsPerDay: n })} />
          </Field>
        </Section>

        <Section title="Tarjetas nuevas">
          <Field label="Pasos de aprendizaje" help='Esperas antes de volver a mostrarla: "1m 10m" (m, h, d).'>
            <Steps value={c.learningSteps} onChange={(v) => set({ learningSteps: v })} />
          </Field>
          <Field label="Intervalo de graduación" help='Días hasta el primer repaso al pulsar "Bien" en el último paso.'>
            <Num value={c.graduatingInterval} onChange={(n) => set({ graduatingInterval: Math.max(1, n) })} min={1} suffix="días" />
          </Field>
          <Field label="Intervalo fácil" help='Días hasta el primer repaso al pulsar "Fácil" en una nueva.'>
            <Num value={c.easyInterval} onChange={(n) => set({ easyInterval: Math.max(1, n) })} min={1} suffix="días" />
          </Field>
          <Field label="Orden de las nuevas" help="Secuencial (orden en que se agregaron) o aleatorio.">
            <select value={c.newOrder} onChange={(e) => set({ newOrder: e.target.value as DeckConfig['newOrder'] })} className={input}>
              <option value="sequential">Secuencial</option>
              <option value="random">Aleatorio</option>
            </select>
          </Field>
          <Field label="Mezcla con repasos" help="Cuándo mostrar las nuevas respecto a los repasos.">
            <select value={c.newReviewMix} onChange={(e) => set({ newReviewMix: e.target.value as DeckConfig['newReviewMix'] })} className={input}>
              <option value="mix">Intercaladas</option>
              <option value="after">Después de los repasos</option>
              <option value="before">Antes de los repasos</option>
            </select>
          </Field>
        </Section>

        <Section title="Lapsos (olvidos)">
          <Field label="Pasos de reaprendizaje" help='Al fallar un repaso ("Otra vez"). Vacío = vuelve directo a repaso.'>
            <Steps value={c.relearningSteps} onChange={(v) => set({ relearningSteps: v })} />
          </Field>
          <Field label="Intervalo mínimo" help="Días mínimos tras reaprender una tarjeta olvidada.">
            <Num value={c.minimumInterval} onChange={(n) => set({ minimumInterval: Math.max(1, n) })} min={1} suffix="días" />
          </Field>
          <Field label="Nuevo intervalo" help="Porcentaje del intervalo anterior que se conserva tras olvidar (0 % = empieza de nuevo).">
            <Num value={Math.round(c.lapseNewInterval * 100)} onChange={(n) => set({ lapseNewInterval: Math.min(100, Math.max(0, n)) / 100 })} suffix="%" />
          </Field>
          <Field label="Umbral de sanguijuela" help="Tras cuántos olvidos se marca como sanguijuela (leech): una tarjeta que te cuesta demasiado.">
            <Num value={c.leechThreshold} onChange={(n) => set({ leechThreshold: n })} suffix="olvidos" />
          </Field>
          <Field label="Acción con sanguijuelas" help="Suspenderla para reescribirla, o solo etiquetarla.">
            <select value={c.leechAction} onChange={(e) => set({ leechAction: e.target.value as DeckConfig['leechAction'] })} className={input}>
              <option value="tag">Solo etiquetar</option>
              <option value="suspend">Suspender tarjeta</option>
            </select>
          </Field>
        </Section>

        <Section title="Enterrar">
          <Toggle checked={c.buryNewSiblings} onChange={(v) => set({ buryNewSiblings: v })} label="Enterrar hermanas nuevas" description="Al estudiar una tarjeta, las demás de la misma nota esperan a mañana (evita pistas cruzadas)." />
          <Toggle checked={c.buryReviewSiblings} onChange={(v) => set({ buryReviewSiblings: v })} label="Enterrar hermanas en repaso" description="Igual, para tarjetas en repaso." />
        </Section>

        <Section title="Avanzado">
          <Field label="Intervalo máximo" help="Ninguna tarjeta se programará más allá de este número de días. Útil para acercarte al examen.">
            <Num value={c.maximumInterval} onChange={(n) => set({ maximumInterval: Math.max(1, n) })} min={1} suffix="días" />
          </Field>
          <Field label="Facilidad inicial" help="Factor con el que se multiplica el intervalo al pulsar Bien (250 % por defecto).">
            <Num value={Math.round(c.startingEase * 100)} onChange={(n) => set({ startingEase: Math.max(130, n) / 100 })} step={10} suffix="%" />
          </Field>
          <Field label="Bonificación fácil" help='Multiplicador extra al pulsar "Fácil".'>
            <Num value={Math.round(c.easyBonus * 100)} onChange={(n) => set({ easyBonus: Math.max(100, n) / 100 })} step={5} suffix="%" />
          </Field>
          <Field label="Modificador de intervalo" help="Multiplica todos los intervalos. Bájalo (p. ej. 80 %) si olvidas demasiado.">
            <Num value={Math.round(c.intervalModifier * 100)} onChange={(n) => set({ intervalModifier: Math.max(10, n) / 100 })} step={5} suffix="%" />
          </Field>
          <Field label="Intervalo difícil" help='Multiplicador al pulsar "Difícil" en un repaso.'>
            <Num value={Math.round(c.hardInterval * 100)} onChange={(n) => set({ hardInterval: Math.max(100, n) / 100 })} step={5} suffix="%" />
          </Field>
          <Field label="Orden de repasos" help="Por fecha de vencimiento o aleatorio.">
            <select value={c.reviewOrder} onChange={(e) => set({ reviewOrder: e.target.value as DeckConfig['reviewOrder'] })} className={input}>
              <option value="due">Por vencimiento</option>
              <option value="random">Aleatorio</option>
            </select>
          </Field>
        </Section>

        <div className="flex flex-wrap justify-between gap-2 pt-2">
          <Button variant="ghost" onClick={() => setC({ ...DEFAULT_CONFIG, id: c.id, name: c.name })}>
            <RotateCcw className="size-4" /> Restaurar valores
          </Button>
          <Button
            onClick={() => {
              saveConfig(c)
              toast({ kind: 'success', title: 'Opciones guardadas' })
              onClose()
            }}
          >
            <Save className="size-4" /> Guardar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
