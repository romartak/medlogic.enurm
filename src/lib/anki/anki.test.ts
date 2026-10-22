import { describe, expect, it } from 'vitest'
import { answerCard, dayNumber, DEFAULT_CONFIG, formatInterval, newCardState, previewIntervals } from './scheduler'
import { cardOrds, clozeNumbers, renderCard, sanitizeHtml } from './render'
import { compileSearch } from './search'
import { buildQueues, nextCard } from './queue'
import { parseAnkiText } from '@/components/anki/ImportExport'
import type { Card, CardState, Note } from './types'

const NOW = new Date(2026, 9, 22, 10, 0).getTime()
const MIN = 60_000
const DAY = 86_400_000
const opts = { now: NOW, rng: () => 0.5 }
const conf = DEFAULT_CONFIG

describe('programador estilo Anki (SM-2)', () => {
  it('una nueva con "Bien" pasa al segundo paso (10 min) y luego se gradúa a 1 día', () => {
    const a = answerCard(newCardState(), 3, conf, opts)
    expect(a.kind).toBe('new')
    expect(a.state.type).toBe('learning')
    expect(a.state.due).toBe(NOW + 10 * MIN)
    const b = answerCard(a.state, 3, conf, { ...opts, now: NOW + 10 * MIN })
    expect(b.state.type).toBe('review')
    expect(b.state.interval).toBe(1)
    expect(b.state.ease).toBe(2.5)
  })

  it('"Otra vez" vuelve al primer paso; "Difícil" en el primer paso usa el promedio de los dos primeros', () => {
    expect(answerCard(newCardState(), 1, conf, opts).state.due).toBe(NOW + 1 * MIN)
    expect(answerCard(newCardState(), 2, conf, opts).state.due).toBe(NOW + 5.5 * MIN)
  })

  it('"Fácil" en una nueva la gradúa directo al intervalo fácil', () => {
    const r = answerCard(newCardState(), 4, conf, opts)
    expect(r.state.type).toBe('review')
    expect(r.state.interval).toBe(4)
  })

  const review = (interval: number, ease = 2.5): CardState => ({ type: 'review', interval, ease, due: NOW, reps: 5, lapses: 0, step: 0, lastReview: NOW - interval * DAY })

  it('en repaso: Difícil < Bien < Fácil y Bien ≈ intervalo × facilidad', () => {
    const iv = (g: 2 | 3 | 4) => answerCard(review(10), g, conf, opts).state.interval
    expect(iv(2)).toBeLessThan(iv(3))
    expect(iv(3)).toBeLessThan(iv(4))
    expect(iv(3)).toBe(25)
    expect(answerCard(review(10), 2, conf, opts).state.ease).toBeCloseTo(2.35)
    expect(answerCard(review(10), 4, conf, opts).state.ease).toBeCloseTo(2.65)
  })

  it('un lapso pasa a reaprendizaje, suma olvidos y baja la facilidad', () => {
    const r = answerCard(review(30), 1, conf, opts)
    expect(r.state.type).toBe('relearning')
    expect(r.state.lapses).toBe(1)
    expect(r.state.ease).toBeCloseTo(2.3)
    expect(r.state.due).toBe(NOW + 10 * MIN)
    const back = answerCard(r.state, 3, conf, { ...opts, now: NOW + 10 * MIN })
    expect(back.state.type).toBe('review')
    expect(back.state.interval).toBe(1)
  })

  it('respeta el intervalo máximo y marca sanguijuelas', () => {
    expect(answerCard(review(400), 3, { ...conf, maximumInterval: 180 }, opts).state.interval).toBe(180)
    const leech = answerCard({ ...review(5), lapses: 7 }, 1, { ...conf, leechAction: 'suspend' }, opts)
    expect(leech.leech).toBe(true)
    expect(leech.state.suspended).toBe(true)
  })

  it('aplica fuzz dentro del rango permitido', () => {
    const lo = answerCard(review(20), 3, conf, { now: NOW, rng: () => 0 }).state.interval
    const hi = answerCard(review(20), 3, conf, { now: NOW, rng: () => 0.999 }).state.interval
    expect(lo).toBeLessThan(hi)
    expect(hi - lo).toBeLessThanOrEqual(16)
  })

  it('el día cambia a las 4:00 y los intervalos se muestran como en Anki', () => {
    const d = new Date(2026, 9, 22)
    expect(dayNumber(new Date(2026, 9, 22, 3, 59).getTime())).toBe(dayNumber(new Date(2026, 9, 21, 12).getTime()))
    expect(dayNumber(new Date(2026, 9, 22, 4, 1).getTime())).toBe(dayNumber(d.getTime() + 12 * 3600_000))
    expect(formatInterval(30_000)).toBe('<1m')
    expect(formatInterval(10 * MIN)).toBe('10m')
    expect(formatInterval(4 * DAY)).toBe('4d')
    const p = previewIntervals(newCardState(), conf, NOW)
    expect(p).toEqual({ 1: '1m', 2: '6m', 3: '10m', 4: '4d' })
  })
})

const note = (over: Partial<Note>): Note => ({ id: 'n1', deckId: 'd1', type: 'basic', front: 'F', back: 'B', tags: [], createdAt: 1, modifiedAt: 1, source: 'user', ...over })

describe('notas y huecos (cloze)', () => {
  it('genera una tarjeta por hueco y dos para invertidas', () => {
    expect(clozeNumbers('{{c1::a}} y {{c2::b}} y {{c1::c}}')).toEqual([1, 2])
    expect(cardOrds(note({ type: 'cloze', front: '{{c1::a}} {{c3::b}}' }))).toEqual([0, 2])
    expect(cardOrds(note({ type: 'reversed' }))).toEqual([0, 1])
  })

  it('oculta solo el hueco activo y muestra la pista', () => {
    const n = note({ type: 'cloze', front: 'El antídoto de {{c1::heparina}} es {{c2::protamina::fármaco}}.' })
    const c2 = renderCard({ ord: 1, note: n })
    expect(c2.front).toContain('heparina')
    expect(c2.front).toContain('[fármaco]')
    expect(c2.front).not.toContain('protamina')
    expect(c2.back).toContain('<span class="cloze">protamina</span>')
  })

  it('la invertida muestra el reverso como pregunta', () => {
    expect(renderCard({ ord: 1, note: note({ type: 'reversed', front: 'Q', back: 'A' }) }).front).toBe('A')
  })

  it('sanitiza HTML y escapa texto plano', () => {
    expect(sanitizeHtml('<b onclick="x()">hola</b><script>alert(1)</script>')).toBe('<b>hola</b>')
    expect(sanitizeHtml('<img src="javascript:alert(1)"><i>ok</i>')).toBe('<i>ok</i>')
    expect(sanitizeHtml('CD4 < 200')).toBe('CD4 &lt; 200')
  })

  it('no deja pasar etiquetas a medio cerrar ni trucos de anidado', () => {
    // Sin «>»: antes se unía con el «<hr>» del reverso y colaba onerror.
    const { back } = renderCard({ ord: 0, note: note({ front: 'Q', back: '<b>x</b><img src=x onerror=alert(1) ', extra: 'nota' }) })
    expect(back).toBe('<b>x</b>&lt;img src=x onerror=alert(1) <hr>nota')
    expect(sanitizeHtml('<b>a</b><<b>script>alert(1)<</b>/script>')).not.toMatch(/<script/i)
    expect(sanitizeHtml('<b>a</b><svg><b onload=alert(1)>x</b></svg>')).toBe('<b>a</b>')
    expect(sanitizeHtml('<b>a</b><img src="https://x.org/a.png" onerror="alert(1)">')).toBe('<b>a</b><img src="https://x.org/a.png" alt="" loading="lazy" referrerpolicy="no-referrer">')
    expect(sanitizeHtml('<i>ok</i><img src="data:image/svg+xml,<svg onload=alert(1)>">')).not.toMatch(/<img|<svg/)
  })
})

const card = (id: string, over: Partial<Note> = {}): Card => {
  const n = note({ id, ...over })
  return { id, noteId: id, ord: 0, deckId: n.deckId, note: n }
}

describe('búsqueda estilo Anki', () => {
  const cards = [card('a', { deckId: 'd1', tags: ['cardio'], front: 'Infarto inferior' }), card('b', { deckId: 'd2', tags: ['pedia'], front: 'Bronquiolitis' }), card('c', { deckId: 'd1', tags: ['cardio::arritmias'], front: 'Fibrilación' })]
  const states: Record<string, CardState> = { b: { type: 'review', interval: 30, ease: 2.5, due: NOW, reps: 3, lapses: 2, step: 0, lastReview: NOW }, c: { ...newCardState(), suspended: true } }
  const ctx = { now: NOW, rolloverHour: 4, deckName: (id: string) => (id === 'd1' ? 'ENURM::Cardio' : 'ENURM::Pedia'), state: (id: string) => states[id] }
  const find = (q: string) => cards.filter(compileSearch(q, ctx)).map((c) => c.id)

  it('filtra por mazo (con submazos y comodín), etiqueta y texto sin tildes', () => {
    expect(find('deck:ENURM')).toEqual(['a', 'b', 'c'])
    expect(find('deck:"ENURM::Card*"')).toEqual(['a', 'c'])
    expect(find('tag:cardio')).toEqual(['a', 'c'])
    expect(find('fibrilacion')).toEqual(['c'])
  })

  it('entiende estados, propiedades, negación y "or"', () => {
    expect(find('is:new')).toEqual(['a', 'c'])
    expect(find('is:suspended')).toEqual(['c'])
    expect(find('prop:ivl>=21')).toEqual(['b'])
    expect(find('prop:lapses>1')).toEqual(['b'])
    expect(find('-tag:cardio')).toEqual(['b'])
    expect(find('tag:pedia or fibrilacion')).toEqual(['b', 'c'])
  })
})

describe('cola de estudio', () => {
  const many = Array.from({ length: 30 }, (_, i) => card(`n${i}`, { createdAt: i }))
  const base = { conf, now: NOW, rolloverHour: 4, learnAheadMinutes: 20, newDoneToday: 0, reviewsDoneToday: 0 }

  it('limita las nuevas por día y excluye suspendidas y enterradas', () => {
    const states: Record<string, CardState> = { n0: { ...newCardState(), suspended: true }, n1: { ...newCardState(), buriedUntil: dayNumber(NOW) } }
    const q = buildQueues({ ...base, cards: many, states })
    expect(q.counts.new).toBe(20)
    expect(q.news[0].id).toBe('n2')
    expect(buildQueues({ ...base, cards: many, states, newDoneToday: 15 }).counts.new).toBe(5)
  })

  it('las tarjetas en aprendizaje que vencen tienen prioridad', () => {
    const states: Record<string, CardState> = { n5: { type: 'learning', due: NOW - 1000, interval: 0, ease: 2.5, reps: 1, lapses: 0, step: 1, lastReview: NOW - 600_000 } }
    expect(nextCard({ ...base, cards: many, states }, 0)?.id).toBe('n5')
  })
})

describe('importación de texto de Anki', () => {
  it('lee cabeceras, separador y etiquetas', () => {
    const rows = parseAnkiText('#separator:tab\n#html:true\n#tags column:3\nFrente 1\tReverso 1\tcardio sca\nFrente 2\tReverso 2\t')
    expect(rows).toEqual([
      { front: 'Frente 1', back: 'Reverso 1', tags: ['cardio', 'sca'] },
      { front: 'Frente 2', back: 'Reverso 2', tags: [] },
    ])
    expect(parseAnkiText('a;b\nc;d')).toHaveLength(2)
  })
})
