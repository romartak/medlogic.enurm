import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Activity, Baby, Brain, Calculator, Droplets, Flame, FlaskConical, HeartPulse, Scale, Stethoscope, Wind, type LucideIcon } from 'lucide-react'
import { Card, PageHeader, Segmented } from '@/components/ui/primitives'
import { addDays, cn, daysBetween } from '@/lib/utils'

/* ---------- piezas de formulario ---------- */

function Num({ label, value, onChange, unit, step = 'any' }: { label: string; value: string; onChange: (v: string) => void; unit?: string; step?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <span className="mt-1.5 flex items-center rounded-xl border border-soft surface-2 focus-within:border-brand-500">
        <input type="number" inputMode="decimal" step={step} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full bg-transparent px-3 text-sm outline-none" />
        {unit && <span className="pr-3 text-xs text-muted">{unit}</span>}
      </span>
    </label>
  )
}

function Check({ label, checked, onChange, points }: { label: string; checked: boolean; onChange: (v: boolean) => void; points: number }) {
  return (
    <button onClick={() => onChange(!checked)} className={cn('flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all', checked ? 'border-brand-500 bg-brand-500/[0.07]' : 'border-soft hover:border-brand-500/40')}>
      <span className="flex items-center gap-2.5">
        <span className={cn('grid size-5 place-items-center rounded-md border-2 text-[10px] font-bold', checked ? 'border-brand-500 bg-brand-500 text-white' : 'border-soft')}>{checked ? '✓' : ''}</span>
        {label}
      </span>
      <span className="text-xs font-semibold text-muted">+{points}</span>
    </button>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: number; onChange: (v: number) => void; options: { v: number; l: string }[] }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(+e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500">
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.v} · {o.l}
          </option>
        ))}
      </select>
    </label>
  )
}

function Result({ value, label, tone = 'brand', children }: { value: ReactNode; label: string; tone?: 'brand' | 'ok' | 'warn' | 'bad'; children?: ReactNode }) {
  const colors = { brand: 'from-brand-500 to-brand-700', ok: 'from-emerald-500 to-teal-500', warn: 'from-amber-500 to-orange-500', bad: 'from-rose-500 to-rose-700' }
  return (
    <motion.div key={String(value)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('mt-6 rounded-2xl bg-gradient-to-br p-5 text-white shadow-lift', colors[tone])}>
      <div className="text-xs font-semibold tracking-wider text-white/80 uppercase">{label}</div>
      <div className="mt-1 font-display text-4xl font-extrabold">{value}</div>
      {children && <div className="mt-2 text-sm text-white/90">{children}</div>}
    </motion.div>
  )
}

const n = (s: string) => (s.trim() === '' ? NaN : Number(s))
const ok = (...xs: number[]) => xs.every((x) => Number.isFinite(x) && x > 0)

/* ---------- calculadoras ---------- */

function Bmi() {
  const [w, setW] = useState('70')
  const [h, setH] = useState('170')
  const bmi = n(w) / (n(h) / 100) ** 2
  const cat = bmi < 18.5 ? ['Bajo peso', 'warn'] : bmi < 25 ? ['Normal', 'ok'] : bmi < 30 ? ['Sobrepeso', 'warn'] : bmi < 35 ? ['Obesidad grado I', 'bad'] : bmi < 40 ? ['Obesidad grado II', 'bad'] : ['Obesidad grado III', 'bad']
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Num label="Peso" unit="kg" value={w} onChange={setW} />
        <Num label="Talla" unit="cm" value={h} onChange={setH} />
      </div>
      {ok(n(w), n(h)) && (
        <Result value={bmi.toFixed(1)} label="kg/m²" tone={cat[1] as 'ok'}>
          {cat[0]} (clasificación OMS)
        </Result>
      )}
    </>
  )
}

function Egfr() {
  const [cr, setCr] = useState('1.0')
  const [age, setAge] = useState('50')
  const [sex, setSex] = useState<'m' | 'f'>('m')
  // CKD-EPI 2021, sin coeficiente racial.
  const k = sex === 'f' ? 0.7 : 0.9
  const a = sex === 'f' ? -0.241 : -0.302
  const scr = n(cr)
  const egfr = 142 * Math.min(scr / k, 1) ** a * Math.max(scr / k, 1) ** -1.2 * 0.9938 ** n(age) * (sex === 'f' ? 1.012 : 1)
  const stage = egfr >= 90 ? 'G1' : egfr >= 60 ? 'G2' : egfr >= 45 ? 'G3a' : egfr >= 30 ? 'G3b' : egfr >= 15 ? 'G4' : 'G5'
  return (
    <>
      <Segmented value={sex} onChange={setSex} options={[{ value: 'm', label: 'Hombre' }, { value: 'f', label: 'Mujer' }]} className="mb-4" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Num label="Creatinina sérica" unit="mg/dL" value={cr} onChange={setCr} />
        <Num label="Edad" unit="años" value={age} onChange={setAge} />
      </div>
      {ok(scr, n(age)) && (
        <Result value={Math.round(egfr)} label="TFG estimada · mL/min/1,73 m²" tone={egfr >= 60 ? 'ok' : egfr >= 30 ? 'warn' : 'bad'}>
          Categoría KDIGO {stage}
        </Result>
      )}
    </>
  )
}

function AnionGap() {
  const [na, setNa] = useState('140')
  const [cl, setCl] = useState('104')
  const [hco3, setHco3] = useState('24')
  const [alb, setAlb] = useState('4')
  const ag = n(na) - (n(cl) + n(hco3))
  const corrected = ag + 2.5 * (4 - n(alb))
  const winter = 1.5 * n(hco3) + 8
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Num label="Sodio" unit="mEq/L" value={na} onChange={setNa} />
        <Num label="Cloro" unit="mEq/L" value={cl} onChange={setCl} />
        <Num label="Bicarbonato" unit="mEq/L" value={hco3} onChange={setHco3} />
        <Num label="Albúmina" unit="g/dL" value={alb} onChange={setAlb} />
      </div>
      {ok(n(na), n(cl), n(hco3)) && (
        <Result value={ag.toFixed(0)} label="Anion gap · mEq/L" tone={ag > 12 ? 'bad' : 'ok'}>
          {ag > 12 ? 'Elevado' : 'Normal (≈ 8–12)'}
          {ok(n(alb)) && ` · Corregido por albúmina: ${corrected.toFixed(0)}`}
          <br />
          PaCO₂ esperada si hay acidosis metabólica (Winter): {(winter - 2).toFixed(0)}–{(winter + 2).toFixed(0)} mmHg
        </Result>
      )}
    </>
  )
}

function Calcium() {
  const [ca, setCa] = useState('8.0')
  const [alb, setAlb] = useState('2.5')
  const c = n(ca) + 0.8 * (4 - n(alb))
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Num label="Calcio sérico" unit="mg/dL" value={ca} onChange={setCa} />
        <Num label="Albúmina" unit="g/dL" value={alb} onChange={setAlb} />
      </div>
      {ok(n(ca), n(alb)) && (
        <Result value={c.toFixed(1)} label="Calcio corregido · mg/dL" tone={c < 8.5 ? 'warn' : c > 10.5 ? 'bad' : 'ok'}>
          {c < 8.5 ? 'Hipocalcemia' : c > 10.5 ? 'Hipercalcemia' : 'Normal (8,5–10,5)'}
        </Result>
      )}
    </>
  )
}

function Parkland() {
  const [w, setW] = useState('70')
  const [tbsa, setTbsa] = useState('30')
  const total = 4 * n(w) * n(tbsa)
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Num label="Peso" unit="kg" value={w} onChange={setW} />
        <Num label="Superficie quemada (2.º y 3.er grado)" unit="%" value={tbsa} onChange={setTbsa} />
      </div>
      {ok(n(w), n(tbsa)) && (
        <Result value={`${Math.round(total).toLocaleString('es-DO')} mL`} label="Ringer lactato en 24 h">
          Primeras 8 h: {Math.round(total / 2).toLocaleString('es-DO')} mL ({Math.round(total / 2 / 8)} mL/h) · Siguientes 16 h: {Math.round(total / 2).toLocaleString('es-DO')} mL ({Math.round(total / 2 / 16)} mL/h). Ajustar a diuresis ≥ 0,5 mL/kg/h.
        </Result>
      )}
    </>
  )
}

function Holliday() {
  const [w, setW] = useState('15')
  const kg = n(w)
  const day = kg <= 10 ? kg * 100 : kg <= 20 ? 1000 + (kg - 10) * 50 : 1500 + (kg - 20) * 20
  return (
    <>
      <Num label="Peso del niño" unit="kg" value={w} onChange={setW} />
      {ok(kg) && (
        <Result value={`${Math.round(day).toLocaleString('es-DO')} mL/día`} label="Líquidos de mantenimiento (Holliday-Segar)">
          ≈ {Math.round(day / 24)} mL/h. 100 mL/kg los primeros 10 kg, 50 mL/kg de 11 a 20 kg y 20 mL/kg por cada kg adicional.
        </Result>
      )}
    </>
  )
}

function Pregnancy() {
  const [fum, setFum] = useState(() => new Date(Date.now() - 120 * 86_400_000).toISOString().slice(0, 10))
  const d = new Date(fum + 'T00:00:00')
  const valid = !Number.isNaN(d.getTime())
  const fpp = valid ? addDays(d, 280) : null
  const days = valid ? daysBetween(d, new Date()) : 0
  return (
    <>
      <label className="block">
        <span className="text-sm font-medium">Fecha de última menstruación (FUM)</span>
        <input type="date" value={fum} onChange={(e) => setFum(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500" />
      </label>
      {valid && fpp && days >= 0 && (
        <Result value={`${Math.floor(days / 7)} sem ${days % 7} d`} label="Edad gestacional hoy">
          Fecha probable de parto (Naegele): <b>{fpp.toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}</b>
        </Result>
      )}
    </>
  )
}

function Glasgow() {
  const [e, setE] = useState(4)
  const [v, setV] = useState(5)
  const [m, setM] = useState(6)
  const total = e + v + m
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Apertura ocular" value={e} onChange={setE} options={[{ v: 4, l: 'Espontánea' }, { v: 3, l: 'A la voz' }, { v: 2, l: 'Al dolor' }, { v: 1, l: 'Ninguna' }]} />
        <Select label="Respuesta verbal" value={v} onChange={setV} options={[{ v: 5, l: 'Orientado' }, { v: 4, l: 'Confuso' }, { v: 3, l: 'Palabras inapropiadas' }, { v: 2, l: 'Sonidos incomprensibles' }, { v: 1, l: 'Ninguna' }]} />
        <Select label="Respuesta motora" value={m} onChange={setM} options={[{ v: 6, l: 'Obedece órdenes' }, { v: 5, l: 'Localiza el dolor' }, { v: 4, l: 'Retira al dolor' }, { v: 3, l: 'Flexión anormal' }, { v: 2, l: 'Extensión' }, { v: 1, l: 'Ninguna' }]} />
      </div>
      <Result value={`${total} / 15`} label="Escala de coma de Glasgow" tone={total >= 13 ? 'ok' : total >= 9 ? 'warn' : 'bad'}>
        TCE {total >= 13 ? 'leve (13–15)' : total >= 9 ? 'moderado (9–12)' : 'grave (≤ 8): proteger la vía aérea'} · O{e} V{v} M{m}
      </Result>
    </>
  )
}

function Chads() {
  const items = [
    ['Insuficiencia cardíaca', 1],
    ['Hipertensión arterial', 1],
    ['Edad ≥ 75 años', 2],
    ['Diabetes mellitus', 1],
    ['ACV / AIT / tromboembolismo previo', 2],
    ['Enfermedad vascular (IAM, arteriopatía periférica, placa aórtica)', 1],
    ['Edad 65–74 años', 1],
    ['Sexo femenino', 1],
  ] as const
  const [on, setOn] = useState<boolean[]>(items.map(() => false))
  const score = items.reduce((a, [, p], i) => a + (on[i] ? p : 0), 0)
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(([l, p], i) => (
          <Check key={l} label={l} points={p} checked={on[i]} onChange={(v) => setOn(on.map((x, j) => (j === i ? v : x)))} />
        ))}
      </div>
      <Result value={score} label="CHA₂DS₂-VASc" tone={score >= 2 ? 'bad' : score === 1 ? 'warn' : 'ok'}>
        Riesgo de ACV en fibrilación auricular. A mayor puntaje, mayor beneficio de anticoagular; consulta los umbrales de la guía vigente (la ESC 2024 usa CHA₂DS₂-VA, sin el sexo).
      </Result>
    </>
  )
}

function Curb65() {
  const items = ['Confusión', 'Urea > 7 mmol/L (BUN > 19 mg/dL)', 'Frecuencia respiratoria ≥ 30', 'PAS < 90 o PAD ≤ 60 mmHg', 'Edad ≥ 65 años']
  const [on, setOn] = useState<boolean[]>(items.map(() => false))
  const score = on.filter(Boolean).length
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((l, i) => (
          <Check key={l} label={l} points={1} checked={on[i]} onChange={(v) => setOn(on.map((x, j) => (j === i ? v : x)))} />
        ))}
      </div>
      <Result value={score} label="CURB-65" tone={score <= 1 ? 'ok' : score === 2 ? 'warn' : 'bad'}>
        {score <= 1 ? 'Bajo riesgo: considerar manejo ambulatorio.' : score === 2 ? 'Riesgo intermedio: considerar hospitalización.' : 'Neumonía grave: hospitalizar, valorar UCI si 4–5.'}
      </Result>
    </>
  )
}

function Alvarado() {
  const items = [
    ['Migración del dolor a FID', 1],
    ['Anorexia', 1],
    ['Náuseas o vómitos', 1],
    ['Dolor a la palpación en FID', 2],
    ['Rebote (Blumberg)', 1],
    ['Temperatura > 37,3 °C', 1],
    ['Leucocitosis > 10 000', 2],
    ['Desviación a la izquierda', 1],
  ] as const
  const [on, setOn] = useState<boolean[]>(items.map(() => false))
  const score = items.reduce((a, [, p], i) => a + (on[i] ? p : 0), 0)
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(([l, p], i) => (
          <Check key={l} label={l} points={p} checked={on[i]} onChange={(v) => setOn(on.map((x, j) => (j === i ? v : x)))} />
        ))}
      </div>
      <Result value={`${score} / 10`} label="Escala de Alvarado" tone={score >= 7 ? 'bad' : score >= 5 ? 'warn' : 'ok'}>
        {score >= 7 ? 'Alta probabilidad de apendicitis.' : score >= 5 ? 'Probabilidad intermedia: estudios de imagen.' : 'Baja probabilidad.'}
      </Result>
    </>
  )
}

function Osmolarity() {
  const [na, setNa] = useState('140')
  const [glu, setGlu] = useState('100')
  const [bun, setBun] = useState('14')
  const osm = 2 * n(na) + n(glu) / 18 + n(bun) / 2.8
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Num label="Sodio" unit="mEq/L" value={na} onChange={setNa} />
        <Num label="Glucosa" unit="mg/dL" value={glu} onChange={setGlu} />
        <Num label="BUN" unit="mg/dL" value={bun} onChange={setBun} />
      </div>
      {ok(n(na), n(glu), n(bun)) && (
        <Result value={osm.toFixed(0)} label="Osmolaridad calculada · mOsm/kg" tone={osm > 295 ? 'warn' : osm < 275 ? 'warn' : 'ok'}>
          Normal ≈ 285–295. Sodio corregido por glucosa: {(n(na) + (1.6 * Math.max(0, n(glu) - 100)) / 100).toFixed(1)} mEq/L
        </Result>
      )}
    </>
  )
}

const TOOLS: { id: string; name: string; area: string; icon: LucideIcon; description: string; C: () => ReactNode }[] = [
  { id: 'imc', name: 'Índice de masa corporal', area: 'General', icon: Scale, description: 'Clasificación OMS del peso.', C: Bmi },
  { id: 'tfg', name: 'TFG (CKD-EPI 2021)', area: 'Nefrología', icon: Droplets, description: 'Filtrado glomerular estimado y categoría KDIGO.', C: Egfr },
  { id: 'ag', name: 'Anion gap y Winter', area: 'Nefrología', icon: FlaskConical, description: 'Brecha aniónica, corrección por albúmina y compensación respiratoria.', C: AnionGap },
  { id: 'osm', name: 'Osmolaridad y Na corregido', area: 'Nefrología', icon: FlaskConical, description: 'Osmolaridad sérica y sodio corregido por glucosa.', C: Osmolarity },
  { id: 'calcio', name: 'Calcio corregido', area: 'Endocrinología', icon: Activity, description: 'Corrección del calcio por albúmina.', C: Calcium },
  { id: 'glasgow', name: 'Escala de Glasgow', area: 'Emergencias', icon: Brain, description: 'Nivel de conciencia y gravedad del TCE.', C: Glasgow },
  { id: 'parkland', name: 'Fórmula de Parkland', area: 'Cirugía', icon: Flame, description: 'Reposición de líquidos en quemados.', C: Parkland },
  { id: 'alvarado', name: 'Escala de Alvarado', area: 'Cirugía', icon: Stethoscope, description: 'Probabilidad de apendicitis aguda.', C: Alvarado },
  { id: 'chads', name: 'CHA₂DS₂-VASc', area: 'Cardiología', icon: HeartPulse, description: 'Riesgo embólico en fibrilación auricular.', C: Chads },
  { id: 'curb', name: 'CURB-65', area: 'Neumología', icon: Wind, description: 'Gravedad de la neumonía adquirida en la comunidad.', C: Curb65 },
  { id: 'fpp', name: 'Edad gestacional y FPP', area: 'Obstetricia', icon: Baby, description: 'Semanas de gestación y regla de Naegele.', C: Pregnancy },
  { id: 'holliday', name: 'Líquidos pediátricos', area: 'Pediatría', icon: Baby, description: 'Mantenimiento por Holliday-Segar.', C: Holliday },
]

export default function Tools() {
  const [active, setActive] = useState(TOOLS[0].id)
  const tool = TOOLS.find((t) => t.id === active)!
  return (
    <div>
      <PageHeader icon={<Calculator className="size-6" />} title="Herramientas clínicas" subtitle="Calculadoras y escalas que aparecen en el examen. Úsalas para entender la fórmula, no solo el resultado." />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn('relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors lg:w-full', active === t.id ? 'text-brand-700 dark:text-brand-300' : 'text-muted hover:bg-slate-900/[0.04] hover:text-[var(--text)] dark:hover:bg-white/[0.04]')}
            >
              {active === t.id && <motion.span layoutId="tool-active" className="absolute inset-0 rounded-xl bg-brand-500/10 ring-1 ring-brand-500/25" />}
              <t.icon className="relative size-4 shrink-0" />
              <span className="relative">
                <span className="block text-sm font-semibold whitespace-nowrap">{t.name}</span>
                <span className="hidden text-[11px] text-muted lg:block">{t.area}</span>
              </span>
            </button>
          ))}
        </nav>
        <AnimatePresence mode="wait">
          <motion.div key={tool.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <Card className="p-5 sm:p-7">
              <div className="mb-6 flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                  <tool.icon className="size-6" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold">{tool.name}</h2>
                  <p className="text-sm text-muted">{tool.description}</p>
                </div>
              </div>
              <tool.C />
              <p className="mt-6 text-xs text-muted">Herramienta educativa. No sustituye el juicio clínico.</p>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
