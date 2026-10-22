import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowLeft, ChartColumn } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { useAnki } from '@/store/anki'
import { cardsInDeck, ALL_DECK } from '@/lib/anki/collection'
import { dayNumber, maturityOf } from '@/lib/anki/scheduler'
import { Card, PageHeader, StatCard } from '@/components/ui/primitives'

const tooltipStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, color: 'var(--text)' }
const axis = { fontSize: 11, fill: 'var(--muted)' }

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {subtitle && <p className="mb-3 text-xs text-muted">{subtitle}</p>}
      <div className="h-60">{children}</div>
    </Card>
  )
}

export default function CardStats() {
  const col = useCollection()
  const states = useAnki((s) => s.states)
  const revlog = useAnki((s) => s.revlog)
  const rollover = useAnki((s) => s.settings.rolloverHour)
  const [deck, setDeck] = useState(ALL_DECK)

  const data = useMemo(() => {
    const cards = cardsInDeck(col, deck)
    const ids = new Set(cards.map((c) => c.id))
    const logs = revlog.filter((r) => ids.has(r.cid))
    const today = dayNumber(Date.now(), rollover)

    const counts = { Nuevas: 0, Aprendiendo: 0, Jóvenes: 0, Maduras: 0, Suspendidas: 0 }
    const ivlBuckets = [
      ['1 d', 1, 1],
      ['2–3', 2, 3],
      ['4–7', 4, 7],
      ['1–2 sem', 8, 14],
      ['2 sem–1 mes', 15, 30],
      ['1–3 meses', 31, 90],
      ['3–6 meses', 91, 180],
      ['> 6 meses', 181, Infinity],
    ] as const
    const ivl = ivlBuckets.map(([l]) => ({ l, n: 0 }))
    const easeB = new Map<number, number>()
    const forecast = Array.from({ length: 31 }, (_, i) => ({ d: i === 0 ? 'Hoy' : `+${i}`, Jóvenes: 0, Maduras: 0 }))

    for (const c of cards) {
      const s = states[c.id]
      if (s?.suspended) {
        counts.Suspendidas++
        continue
      }
      const m = maturityOf(s)
      counts[m === 'new' ? 'Nuevas' : m === 'learning' ? 'Aprendiendo' : m === 'young' ? 'Jóvenes' : 'Maduras']++
      if (s && s.type === 'review') {
        const b = ivlBuckets.findIndex(([, lo, hi]) => s.interval >= lo && s.interval <= hi)
        if (b >= 0) ivl[b].n++
        const e = Math.round(s.ease * 10) * 10
        easeB.set(e, (easeB.get(e) ?? 0) + 1)
        const days = Math.max(0, dayNumber(s.due, rollover) - today)
        if (days <= 30) forecast[days][s.interval >= 21 ? 'Maduras' : 'Jóvenes']++
      }
    }

    const history = Array.from({ length: 30 }, (_, i) => {
      const day = today - 29 + i
      const d = new Date(Date.now() - (29 - i) * 86_400_000)
      return { day, d: d.toLocaleDateString('es-DO', { day: 'numeric', month: 'short' }), Aprendizaje: 0, Jóvenes: 0, Maduras: 0, Reaprendizaje: 0, Intensivo: 0 }
    })
    const ret = { young: [0, 0], mature: [0, 0] }
    const buttons = { 1: 0, 2: 0, 3: 0, 4: 0 }
    let timeToday = 0
    let countToday = 0
    for (const r of logs) {
      const day = dayNumber(r.ts, rollover)
      const h = history[day - (today - 29)]
      if (h) {
        if (r.kind === 'new' || r.kind === 'learn') h.Aprendizaje++
        else if (r.kind === 'relearn') h.Reaprendizaje++
        else if (r.kind === 'cram') h.Intensivo++
        else h[r.lastIvl >= 21 ? 'Maduras' : 'Jóvenes']++
      }
      if (r.kind === 'review' && day > today - 30) {
        const b = r.lastIvl >= 21 ? ret.mature : ret.young
        b[1]++
        if (r.grade > 1) b[0]++
      }
      buttons[r.grade]++
      if (day === today) {
        timeToday += r.time
        countToday++
      }
    }
    const pct = (b: number[]) => (b[1] ? Math.round((b[0] / b[1]) * 100) : null)
    return {
      cards: cards.length,
      counts: Object.entries(counts).map(([name, value]) => ({ name, value })),
      ivl,
      ease: [...easeB.entries()].sort((a, b) => a[0] - b[0]).map(([e, n]) => ({ e: `${e} %`, n })),
      forecast,
      history,
      retention: { young: pct(ret.young), mature: pct(ret.mature) },
      buttons: [
        { b: 'Otra vez', n: buttons[1], c: '#ef4444' },
        { b: 'Difícil', n: buttons[2], c: '#f59e0b' },
        { b: 'Bien', n: buttons[3], c: '#10b981' },
        { b: 'Fácil', n: buttons[4], c: '#0ea5e9' },
      ],
      timeToday,
      countToday,
      due7: forecast.slice(0, 8).reduce((a, f) => a + f.Jóvenes + f.Maduras, 0),
    }
  }, [col, deck, states, revlog, rollover])

  const PIE = ['#0ea5e9', '#f43f5e', '#86efac', '#16a34a', '#facc15']

  return (
    <div className="space-y-6">
      <Link to="/flashcards" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)]">
        <ArrowLeft className="size-4" /> Mazos
      </Link>
      <PageHeader
        icon={<ChartColumn className="size-6" />}
        title="Estadísticas de flashcards"
        subtitle="Pronóstico, retención real, intervalos y facilidad, como en Anki."
        actions={
          <select value={deck} onChange={(e) => setDeck(e.target.value)} className="h-10 w-full max-w-full min-w-0 rounded-xl border border-soft bg-[var(--surface)] px-3 text-sm sm:w-auto" aria-label="Mazo">
            <option value={ALL_DECK}>Toda la colección</option>
            {col.decks
              .filter((d) => !d.filtered)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={<ChartColumn className="size-5" />} label="Hoy" value={data.countToday} hint={`${Math.round(data.timeToday / 60000)} min · ${data.countToday ? Math.round(data.timeToday / data.countToday / 1000) : 0} s/tarjeta`} color="#06c4b0" />
        <StatCard icon={<ChartColumn className="size-5" />} label="Retención jóvenes" value={data.retention.young === null ? '—' : `${data.retention.young}%`} hint="Repasos aprobados, 30 días" color="#86efac" delay={0.05} />
        <StatCard icon={<ChartColumn className="size-5" />} label="Retención maduras" value={data.retention.mature === null ? '—' : `${data.retention.mature}%`} hint="Intervalo ≥ 21 días" color="#16a34a" delay={0.1} />
        <StatCard icon={<ChartColumn className="size-5" />} label="Vencen en 7 días" value={data.due7} hint={`${data.cards} tarjetas en total`} color="#6366f1" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Pronóstico" subtitle="Repasos que vencen cada día (próximos 30 días).">
          <ResponsiveContainer>
            <BarChart data={data.forecast} margin={{ left: -20, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="d" tick={axis} interval={4} axisLine={false} tickLine={false} />
              <YAxis tick={axis} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Jóvenes" stackId="a" fill="#86efac" />
              <Bar dataKey="Maduras" stackId="a" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Repasos" subtitle="Tarjetas estudiadas cada día (últimos 30 días).">
          <ResponsiveContainer>
            <BarChart data={data.history} margin={{ left: -20, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="d" tick={axis} interval={5} axisLine={false} tickLine={false} />
              <YAxis tick={axis} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Aprendizaje" stackId="a" fill="#0ea5e9" />
              <Bar dataKey="Reaprendizaje" stackId="a" fill="#f43f5e" />
              <Bar dataKey="Jóvenes" stackId="a" fill="#86efac" />
              <Bar dataKey="Maduras" stackId="a" fill="#16a34a" />
              <Bar dataKey="Intensivo" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Recuento de tarjetas">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data.counts} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                {data.counts.map((_, i) => (
                  <Cell key={i} fill={PIE[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => <span style={{ color: 'var(--text)' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Intervalos" subtitle="Cuánto tiempo pasa entre repasos.">
          <ResponsiveContainer>
            <BarChart data={data.ivl} margin={{ left: -20, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="l" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Tarjetas']} />
              <Bar dataKey="n" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Facilidad" subtitle="Factor de facilidad de las tarjetas en repaso.">
          <ResponsiveContainer>
            <BarChart data={data.ease} margin={{ left: -20, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="e" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Tarjetas']} />
              <Bar dataKey="n" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Botones de respuesta" subtitle="Cuántas veces usaste cada botón.">
          <ResponsiveContainer>
            <BarChart data={data.buttons} margin={{ left: -20, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="b" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Respuestas']} />
              <Bar dataKey="n" radius={[4, 4, 0, 0]}>
                {data.buttons.map((b) => (
                  <Cell key={b.b} fill={b.c} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  )
}
