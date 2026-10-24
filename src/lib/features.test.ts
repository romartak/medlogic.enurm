import { describe, expect, it } from 'vitest'
import type { Question } from '@/types'
import { decodeDuel, duelWinner, encodeDuel, type DuelPayload } from './duel'
import { seededPick } from './selection'
import { currentEdition, nationalQuestions } from './national'
import { ECG_PATTERNS, makeStrip } from './ecg'
import { shortName } from './ranking'
import { CASES } from '@/data/cases'
import { SPECIALTIES } from '@/data/specialties'
import { UNIVERSITIES, universityLabel } from '@/data/universities'
import { reminderIcs, googleCalendarUrl } from '@/components/ReminderCard'

const bank: Question[] = Array.from({ length: 300 }, (_, i) => ({
  id: `q-${i}`,
  specialty: SPECIALTIES[i % 6].id,
  stem: `Pregunta ${i}`,
  options: ['A', 'B', 'C', 'D'],
  answer: i % 4,
}))

describe('duelo', () => {
  const p: DuelPayload = { v: 1, id: 'abc123', q: ['q-1', 'q-2', 'q-3'], a: { name: 'Ana Pérez', correct: 2, seconds: 41.5 } }

  it('el enlace se puede leer de vuelta, con tildes', () => {
    expect(decodeDuel(encodeDuel(p))).toEqual(p)
  })

  it('rechaza un enlace alterado a mano', () => {
    const code = encodeDuel(p)
    const tampered = encodeDuel({ ...p, a: { ...p.a, correct: 3 } }).split('.')[0] + '.' + code.split('.')[1]
    expect(decodeDuel(tampered)).toBeNull()
    expect(decodeDuel('basura')).toBeNull()
  })

  it('gana quien acierta más; si empatan, quien tarda menos', () => {
    expect(duelWinner({ name: 'a', correct: 8, seconds: 90 }, { name: 'b', correct: 7, seconds: 30 })).toBe('a')
    expect(duelWinner({ name: 'a', correct: 8, seconds: 90 }, { name: 'b', correct: 8, seconds: 60 })).toBe('b')
    expect(duelWinner({ name: 'a', correct: 8, seconds: 60 }, { name: 'b', correct: 8, seconds: 60.4 })).toBe('tie')
  })
})

describe('selección con semilla (simulacro nacional y duelos)', () => {
  it('la misma semilla da las mismas preguntas aunque el banco venga en otro orden', () => {
    const a = seededPick(bank, 20, 'x').map((q) => q.id)
    const b = seededPick([...bank].reverse(), 20, 'x').map((q) => q.id)
    expect(a).toEqual(b)
    expect(new Set(a).size).toBe(20)
    expect(seededPick(bank, 20, 'y').map((q) => q.id)).not.toEqual(a)
  })

  it('el simulacro nacional tiene 100 preguntas y cambia cada mes', () => {
    const nov = nationalQuestions(bank, '2026-11')
    expect(nov).toHaveLength(100)
    expect(nationalQuestions(bank, '2026-11').map((q) => q.id)).toEqual(nov.map((q) => q.id))
    expect(nationalQuestions(bank, '2026-12').map((q) => q.id)).not.toEqual(nov.map((q) => q.id))
  })

  it('la edición usa la hora de República Dominicana', () => {
    // 1 de diciembre a las 02:00 UTC todavía es 30 de noviembre en RD (UTC−4).
    expect(currentEdition(new Date('2026-12-01T02:00:00Z'))).toBe('2026-11')
    expect(currentEdition(new Date('2026-12-01T05:00:00Z'))).toBe('2026-12')
  })
})

describe('casos clínicos', () => {
  it('cada paso tiene exactamente una respuesta correcta y todas las opciones explicadas', () => {
    const ids = new Set(SPECIALTIES.map((s) => s.id))
    expect(new Set(CASES.map((c) => c.id)).size).toBe(CASES.length)
    for (const c of CASES) {
      expect(ids.has(c.specialty), c.id).toBe(true)
      expect(c.steps.length, c.id).toBeGreaterThanOrEqual(4)
      for (const s of c.steps) {
        expect(s.options.filter((o) => o.correct).length, `${c.id}: ${s.prompt}`).toBe(1)
        for (const o of s.options) expect(o.why.length, o.text).toBeGreaterThan(10)
      }
    }
  })
})

describe('ECG', () => {
  it('cada ritmo genera una tira válida', () => {
    for (const p of ECG_PATTERNS) {
      const { samples } = makeStrip(p.id, 'test')
      expect(samples.length).toBe(6 * 250)
      expect(samples.every(Number.isFinite), p.id).toBe(true)
    }
  })

  it('la fibrilación auricular es irregular y el ritmo sinusal regular', () => {
    const rr = (id: string) => {
      const { strip } = makeStrip(id, 'rr')
      return strip.beats.slice(1).map((b, i) => b.r - strip.beats[i].r)
    }
    const spread = (xs: number[]) => Math.max(...xs) - Math.min(...xs)
    expect(spread(rr('sinusal'))).toBeLessThan(0.01)
    expect(spread(rr('fibrilacion-auricular'))).toBeGreaterThan(0.1)
  })
})

describe('ranking y universidades', () => {
  it('solo muestra primer nombre e inicial', () => {
    expect(shortName('robinson santos pérez')).toBe('robinson S.')
    expect(shortName('Ana')).toBe('Ana')
    expect(shortName('  ')).toBe('')
  })

  it('universidades con id y siglas únicos', () => {
    expect(new Set(UNIVERSITIES.map((u) => u.id)).size).toBe(UNIVERSITIES.length)
    expect(UNIVERSITIES.length).toBeGreaterThan(45)
    expect(universityLabel('uasd')).toBe('UASD')
    expect(universityLabel('otra', 'Mi Uni')).toBe('Mi Uni')
  })
})

describe('recordatorio', () => {
  it('crea un evento diario con aviso', () => {
    const ics = reminderIcs('19:30')
    expect(ics).toContain('RRULE:FREQ=DAILY')
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics).toMatch(/DTSTART:\d{8}T193000/)
    expect(googleCalendarUrl('07:00')).toContain('recur=RRULE%3AFREQ%3DDAILY')
  })
})
