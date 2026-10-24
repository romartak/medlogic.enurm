import { describe, expect, it } from 'vitest'
import type { Question } from '@/types'
import { decodeDuel, duelQuestions, duelWinner, encodeDuel, newDuelQuestions, type DuelPayload } from './duel'
import { hashString } from './utils'
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
  const p: DuelPayload = { v: 2, id: 'abc123', n: 20, a: { name: 'Dra. Genao', correct: 18, seconds: 102 }, s: [SPECIALTIES[1].id, SPECIALTIES[10].id] }

  it('el enlace es corto y se lee de vuelta, con tildes y espacios', () => {
    const code = encodeDuel(p)
    expect(code.length).toBeLessThan(45)
    expect(decodeDuel(code)).toEqual(p)
    const reply: DuelPayload = { ...p, b: { name: 'María José', correct: 15, seconds: 88 } }
    const code2 = encodeDuel(reply)
    expect(decodeDuel(code2)).toEqual(reply)
    // Igual si el navegador entrega el enlace ya decodificado («María» en vez de «Mar%C3%ADa»).
    expect(decodeDuel(decodeURIComponent(code2))).toEqual(reply)
    // El «_» de un nombre no rompe los campos.
    expect(decodeDuel(encodeDuel({ ...p, a: { ...p.a, name: 'Ana_Luz' } }))!.a.name).toBe('Ana-Luz')
  })

  it('rechaza un enlace alterado a mano', () => {
    const code = encodeDuel(p)
    expect(decodeDuel(code.replace('_18_', '_20_'))).toBeNull()
    expect(decodeDuel('basura')).toBeNull()
  })

  it('los enlaces antiguos (con la lista de preguntas) siguen funcionando', () => {
    // Formato v1: JSON en base64 + firma de 6 caracteres.
    const legacy = { v: 1, id: 'old', q: ['q-1', 'q-2', 'q-3'], a: { name: 'Ana', correct: 2, seconds: 41.5 } }
    const body = JSON.stringify(legacy)
    const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(body))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const sig = hashString(`medlogic-duelo-v1|${body}`).slice(0, 6)
    const d = decodeDuel(`${b64}.${sig}`)!
    expect(d.n).toBe(3)
    expect(d.q).toEqual(['q-1', 'q-2', 'q-3'])
  })

  it('las dos personas reciben las mismas preguntas a partir del código', () => {
    const created = newDuelQuestions(bank, [SPECIALTIES[0].id], 15)
    const payload: DuelPayload = { v: 2, id: created.id, n: created.questions.length, a: { name: 'A', correct: 1, seconds: 1 }, s: [SPECIALTIES[0].id] }
    const decoded = decodeDuel(encodeDuel(payload))!
    const byId = new Map(bank.map((q) => [q.id, q]))
    expect(duelQuestions(decoded, [...bank].reverse(), byId).map((q) => q.id)).toEqual(created.questions.map((q) => q.id))
  })

  it('acepta duelos de hasta 50 preguntas con temas elegidos', () => {
    const { questions } = newDuelQuestions(bank, [SPECIALTIES[0].id, SPECIALTIES[1].id], 50)
    expect(questions).toHaveLength(50)
    expect(questions.every((q) => q.specialty === SPECIALTIES[0].id || q.specialty === SPECIALTIES[1].id)).toBe(true)
    const big: DuelPayload = { v: 2, id: 'big123', n: 50, a: { name: 'Dra. Genao', correct: 41, seconds: 300 } }
    expect(decodeDuel(encodeDuel(big))).toEqual(big)
    expect(decodeDuel(encodeDuel({ ...big, n: 51 }))).toBeNull()
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
    expect(shortName('robinson santos pérez')).toBe('Robinson S.')
    expect(shortName('Ana')).toBe('Ana')
    expect(shortName('Dra. Genao')).toBe('Dra. Genao')
    expect(shortName('Dr. Pérez Gómez')).toBe('Dr. Pérez')
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
