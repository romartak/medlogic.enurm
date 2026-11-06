import { describe, expect, it } from 'vitest'
import { buildInsights, formatHour, formatMinutes, hourProfile, interestScore, sectionOf, topicLabel, topicOf, topInterests, type UsageMap } from './interest'

const NOW = Date.UTC(2026, 10, 6)
const min = (m: number) => m * 60_000
const u = (m: number, visits: number, last = NOW) => ({ ms: min(m), visits, last })

describe('sectionOf', () => {
  it('une las subpáginas con su sección', () => {
    expect(sectionOf('/casos/infarto')).toBe('/casos')
    expect(sectionOf('/ecg/monitor')).toBe('/ecg/monitor')
    expect(sectionOf('/flashcards/mazo1/estudiar')).toBe('/flashcards')
  })
  it('ignora inicio, ajustes y rutas desconocidas', () => {
    expect(sectionOf('/inicio')).toBeNull()
    expect(sectionOf('/ajustes')).toBeNull()
    expect(sectionOf('/no-existe')).toBeNull()
  })
})

describe('interestScore', () => {
  it('pierde la mitad a las dos semanas', () => {
    const fresh = interestScore(u(10, 0), NOW)
    const old = interestScore(u(10, 0, NOW - 14 * 86_400_000), NOW)
    expect(old).toBeCloseTo(fresh / 2, 5)
  })
})

describe('topInterests', () => {
  it('ordena por interés y reparte el porcentaje', () => {
    const usage: UsageMap = { '/casos': u(30, 4), '/guias': u(10, 2), '/practica': u(5, 1) }
    const top = topInterests(usage, 3, NOW)
    expect(top.map((t) => t.to)).toEqual(['/casos', '/guias', '/practica'])
    expect(top.reduce((a, t) => a + t.share, 0)).toBeCloseTo(1, 5)
    expect(top[0].minutes).toBe(30)
  })
})

describe('buildInsights', () => {
  it('no concluye nada con muy poco uso', () => {
    expect(buildInsights({ '/casos': u(2, 1) }, NOW)).toEqual([])
  })
  it('destaca la sección donde más tiempo pasa y la compara con la siguiente', () => {
    const r = buildInsights({ '/casos': u(40, 3), '/guias': u(10, 2) }, NOW)
    expect(r[0]).toMatchObject({ id: 'top', to: '/casos' })
    expect(r[0].text).toContain('Casos clínicos')
    expect(r[0].text).toContain('Guías')
  })
  it('propone medirse si solo lee y repasa', () => {
    const r = buildInsights({ '/guias': u(30, 5), '/practica': u(2, 1) }, NOW)
    expect(r.some((i) => i.id === 'test-yourself' && i.to === '/practica')).toBe(true)
  })
  it('no lo propone si ya practica lo suficiente', () => {
    const r = buildInsights({ '/guias': u(12, 5), '/practica': u(10, 3) }, NOW)
    expect(r.some((i) => i.id === 'test-yourself')).toBe(false)
  })
  it('sugiere la primera sección central sin abrir', () => {
    const r = buildInsights({ '/practica': u(10, 3), '/simulacro': u(5, 1) }, NOW)
    expect(r.find((i) => i.id.startsWith('try-'))?.to).toBe('/casos')
  })
  it('devuelve como máximo tres sugerencias', () => {
    expect(buildInsights({ '/guias': u(40, 6) }, NOW).length).toBeLessThanOrEqual(3)
  })
})

describe('formatMinutes', () => {
  it('formatea minutos y horas', () => {
    expect(formatMinutes(45)).toBe('45 min')
    expect(formatMinutes(130)).toBe('2 h 10 min')
    expect(formatMinutes(120)).toBe('2 h')
  })
})

const hoursAt = (h: number, minutes: number) => Object.assign(new Array<number>(24).fill(0), { [h]: min(minutes) })
const stat = (specialty: string, answered: number, accuracy: number) => ({ specialty, answered, correct: Math.round(answered * accuracy), seen: answered, total: 100, accuracy })

describe('topicOf / topicLabel', () => {
  it('reconoce especialidades y guías', () => {
    expect(topicOf('/especialidades/cardiologia')).toBe('esp:cardiologia')
    expect(topicOf('/guias/dengue')).toBe('guia:dengue')
    expect(topicOf('/especialidades')).toBeNull()
    expect(topicOf('/casos/x')).toBeNull()
  })
  it('da nombres legibles', () => {
    expect(topicLabel('esp:cardiologia')).toBe('Cardiología')
    expect(topicLabel('guia:dengue')).toBe('Dengue: clasificación y manejo')
  })
})

describe('hourProfile / formatHour', () => {
  it('no concluye con pocos datos', () => {
    expect(hourProfile(hoursAt(20, 5))).toBeNull()
  })
  it('encuentra la ventana de dos horas con más estudio', () => {
    const h = hoursAt(20, 20)
    h[21] = min(10)
    const p = hourProfile(h)!
    expect(p.start).toBe(20)
    expect(p.period).toBe('noche')
    expect(p.share).toBe(1)
  })
  it('da formato de 12 horas', () => {
    expect([0, 8, 12, 20, 24].map(formatHour)).toEqual(['12 a. m.', '8 a. m.', '12 p. m.', '8 p. m.', '12 a. m.'])
  })
})

describe('buildInsights con contexto', () => {
  const base: UsageMap = { '/practica': u(10, 3), '/casos': u(5, 2), '/guias': u(4, 2), '/simulacro': u(2, 1), '/flashcards': u(2, 1), '/terminologia': u(1, 1), '/repaso': u(1, 1) }
  it('marca el punto débil y lo contrasta con su tema favorito', () => {
    const r = buildInsights(base, NOW, { stats: [stat('cardiologia', 40, 0.45), stat('pediatria', 40, 0.9)], topics: { 'esp:pediatria': u(10, 2) } })
    expect(r[0]).toMatchObject({ id: 'weak', to: '/practica?specialty=cardiologia' })
    expect(r[0].text).toContain('45 %')
    expect(r[0].text).toContain('Pediatría')
  })
  it('ignora especialidades con pocas respuestas', () => {
    expect(buildInsights(base, NOW, { stats: [stat('cardiologia', 4, 0.1)] }).some((i) => i.id === 'weak')).toBe(false)
  })
  it('avisa si marca preguntas pero no entra a Repaso', () => {
    const usage = { ...base, '/repaso': u(0, 0) }
    expect(buildInsights(usage, NOW, { events: { marcar: { n: 8, last: NOW } } }).some((i) => i.id === 'marked')).toBe(true)
    expect(buildInsights(base, NOW, { events: { marcar: { n: 8, last: NOW } } }).some((i) => i.id === 'marked')).toBe(false)
  })
  it('destaca el tema favorito', () => {
    const r = buildInsights(base, NOW, { topics: { 'guia:dengue': u(6, 2) } })
    expect(r.find((i) => i.id === 'topic')).toMatchObject({ to: '/guias/dengue' })
  })
  it('propone recordatorio solo si estudia a una hora fija y no tiene uno', () => {
    const hours = hoursAt(20, 30)
    expect(buildInsights(base, NOW, { hours, hasReminder: false }).some((i) => i.id === 'hour')).toBe(true)
    expect(buildInsights(base, NOW, { hours, hasReminder: true }).some((i) => i.id === 'hour')).toBe(false)
  })
  it('sugiere flashcards si las sesiones son muy cortas', () => {
    const r = buildInsights(base, NOW, { sessions: { count: 10, ms: min(20) } })
    expect(r.find((i) => i.id === 'short')?.text).toContain('2 min')
  })
  it('nunca pasa de cuatro sugerencias', () => {
    const r = buildInsights({ '/guias': u(40, 6) }, NOW, { hours: hoursAt(20, 30), hasReminder: false, sessions: { count: 9, ms: min(9) }, events: { marcar: { n: 9, last: NOW } }, topics: { 'guia:dengue': u(9, 3) }, stats: [stat('cardiologia', 30, 0.3)] })
    expect(r.length).toBe(4)
  })
})
