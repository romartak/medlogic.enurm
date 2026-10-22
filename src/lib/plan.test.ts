import { describe, expect, it } from 'vitest'
import { buildDailyPlan, DEFAULT_PROFILE, phaseFor, resolveExamDate, rotation, specialtyPriorities, taskProgress, type PlanInput } from './plan'
import { addDays, dayKey } from './utils'
import type { StudyProfile } from '@/types'
import { SPECIALTY_INFO } from '@/data/specialtyInfo'
import { SPECIALTIES } from '@/data/specialties'
import { AREAS } from '@/data/areas'

const profile: StudyProfile = { ...DEFAULT_PROFILE, completed: true, examYear: 2027, examMonth: 3, studyDays: [1, 2, 3, 4, 5, 6], minutesPerDay: 120, confidence: { pediatria: 1 }, residency: 'pediatria', updatedAt: 1 }

function input(date: Date, p: StudyProfile = profile, extra: Partial<PlanInput> = {}): PlanInput {
  return { date, profile: p, priorities: specialtyPriorities(p, [], {}), dueCards: 30, newCards: 50, failedCount: 12, guidesRead: [], ...extra }
}

describe('fases', () => {
  it('asigna la fase según los días restantes', () => {
    expect(phaseFor(null)).toBe('sin-fecha')
    expect(phaseFor(300)).toBe('fundamentos')
    expect(phaseFor(120)).toBe('consolidacion')
    expect(phaseFor(30)).toBe('intensivo')
    expect(phaseFor(7)).toBe('final')
    expect(phaseFor(0)).toBe('examen')
    expect(phaseFor(-3)).toBe('pasado')
  })

  it('toma el día del ENURM de la convocatoria elegida', () => {
    const proj = resolveExamDate(profile)
    expect(proj.estimated).toBe(true)
    expect(dayKey(proj.date!)).toBe('2027-03-07')
    const official = resolveExamDate({ ...profile, examYear: 2026 })
    expect(official.estimated).toBe(false)
    expect(dayKey(official.date!)).toBe('2026-03-01')
    expect(resolveExamDate({ ...profile, examYear: null }).date).toBeNull()
  })
})

describe('prioridades', () => {
  it('refuerza la residencia y las áreas con poca confianza', () => {
    const pr = specialtyPriorities(profile, [], {})
    expect(pr[0].id).toBe('pediatria')
    expect(pr[0].reason).toContain('residencia')
  })

  it('usa la precisión real cuando hay suficientes respuestas', () => {
    const stats = [{ specialty: 'pediatria', answered: 50, correct: 50, seen: 50, total: 60, accuracy: 1 }]
    const pr = specialtyPriorities({ ...profile, residency: null }, stats, {})
    expect(pr[0].id).not.toBe('pediatria')
  })

  it('la rotación reparte más días a las prioritarias sin dejar fuera al resto', () => {
    const r = rotation(specialtyPriorities(profile, [], {}), 28)
    const count = (id: string) => r.filter((x) => x === id).length
    expect(count('pediatria')).toBeGreaterThan(count('etica'))
    expect(new Set(r).size).toBeGreaterThan(8)
  })
})

describe('plan diario', () => {
  const monday = new Date(2026, 9, 26) // lunes, ~5 meses antes del examen

  it('genera tareas de preguntas, errores, flashcards y guía en un día de estudio', () => {
    const plan = buildDailyPlan(input(monday))
    expect(plan.phase).toBe('consolidacion')
    expect(plan.restDay).toBe(false)
    const kinds = plan.tasks.map((t) => t.kind)
    expect(kinds).toContain('questions')
    expect(kinds).toContain('review')
    expect(kinds).toContain('flashcards')
    expect(kinds).toContain('guide')
    expect(plan.focus.length).toBe(2)
    // El tiempo total se ajusta a lo disponible (120 min).
    expect(plan.minutes).toBeGreaterThanOrEqual(110)
    expect(plan.minutes).toBeLessThanOrEqual(130)
  })

  it('las preguntas llenan el tiempo libre cuando no hay errores ni tarjetas', () => {
    const plan = buildDailyPlan(input(monday, profile, { dueCards: 0, newCards: 0, failedCount: 0 }))
    expect(plan.minutes).toBeGreaterThanOrEqual(110)
    expect(plan.tasks.filter((t) => t.kind === 'questions').reduce((a, t) => a + t.target, 0)).toBeGreaterThanOrEqual(70)
  })

  it('el domingo (no elegido) es día de descanso', () => {
    const plan = buildDailyPlan(input(addDays(monday, 6)))
    expect(plan.restDay).toBe(true)
    expect(plan.tasks.every((t) => t.optional)).toBe(true)
  })

  it('programa el simulacro el último día de estudio de la semana', () => {
    const saturday = addDays(monday, 5)
    expect(buildDailyPlan(input(saturday)).tasks.some((t) => t.kind === 'exam')).toBe(true)
    expect(buildDailyPlan(input(monday)).tasks.some((t) => t.kind === 'exam')).toBe(false)
  })

  it('omite guías si el estudiante no las eligió', () => {
    const plan = buildDailyPlan(input(monday, { ...profile, methods: ['preguntas', 'flashcards'] }))
    expect(plan.tasks.some((t) => t.kind === 'guide')).toBe(false)
  })

  it('el día antes del examen recomienda descansar', () => {
    const plan = buildDailyPlan(input(new Date(2027, 2, 6), profile))
    expect(plan.restDay).toBe(true)
    expect(plan.message).toContain('descansa')
  })

  it('es estable para el mismo día', () => {
    expect(buildDailyPlan(input(monday)).focus).toEqual(buildDailyPlan(input(monday)).focus)
  })
})

describe('progreso de tareas', () => {
  it('cuenta las preguntas respondidas de la especialidad del día', () => {
    const plan = buildDailyPlan(input(new Date(2026, 9, 26)))
    const q = plan.tasks.find((t) => t.kind === 'questions')!
    const ctx = { today: { answered: 99, correct: 50, cards: 0, minutes: 0, bySpec: { [q.specialty!]: q.target } }, guidesRead: [], examsToday: 0, checks: [] }
    expect(taskProgress(q, ctx).complete).toBe(true)
    expect(taskProgress(q, { ...ctx, today: { ...ctx.today, bySpec: {} } }).complete).toBe(false)
    expect(taskProgress(q, { ...ctx, today: undefined, checks: [q.id] }).complete).toBe(true)
  })
})

describe('contenido de especialidades', () => {
  it('cada especialidad del catálogo tiene su espacio y pertenece a un área', () => {
    for (const s of SPECIALTIES) {
      expect(SPECIALTY_INFO[s.id], s.id).toBeDefined()
      expect(SPECIALTY_INFO[s.id].pearls.length).toBeGreaterThanOrEqual(4)
      expect(AREAS.some((a) => a.specialties.includes(s.id)), s.id).toBe(true)
    }
  })
})
