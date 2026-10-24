import type { DailyPlan, DayActivity, PlanPhase, PlanTask, StudyMethod, StudyProfile } from '@/types'
import { SPECIALTIES, getSpecialty } from '@/data/specialties'
import { AREAS, RESIDENCIES, areaOf } from '@/data/areas'
import { GUIDES } from '@/data/guides'
import type { SpecialtyStat } from './stats'
import { dayKey, daysBetween, formatMinutes } from './utils'
import { enurmDate, formatEnurmDate, type EnurmDate } from '@/data/enurm'

export const DEFAULT_PROFILE: StudyProfile = {
  completed: false,
  skipped: false,
  role: null,
  examYear: null,
  examMonth: null,
  residency: null,
  university: null,
  universityOther: '',
  studyDays: [1, 2, 3, 4, 5, 6],
  minutesPerDay: 90,
  confidence: {},
  methods: ['preguntas', 'flashcards', 'guias', 'simulacros'],
  updatedAt: 0,
}

export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

/**
 * Fecha objetivo: el día del ENURM de la convocatoria elegida (primer domingo de marzo).
 * `estimated` indica que la fecha aún no está confirmada oficialmente.
 */
export function resolveExamDate(profile: StudyProfile): { date: Date | null; estimated: boolean; enurm: EnurmDate | null } {
  if (!profile.examYear) return { date: null, estimated: true, enurm: null }
  const enurm = enurmDate(profile.examYear)
  return { date: enurm.date, estimated: !enurm.confirmed, enurm }
}

export interface PhaseInfo {
  id: PlanPhase
  name: string
  description: string
  color: string
  /** Reparto del tiempo diario. */
  alloc: { questions: number; review: number; flashcards: number; guides: number }
  /** Tamaño del simulacro semanal. */
  examSize: number
}

export const PHASES: Record<PlanPhase, PhaseInfo> = {
  fundamentos: { id: 'fundamentos', name: 'Fundamentos', description: 'Más de 6 meses: construye la base tema por tema con guías y preguntas.', color: '#22c55e', alloc: { questions: 0.45, review: 0.1, flashcards: 0.2, guides: 0.25 }, examSize: 50 },
  consolidacion: { id: 'consolidacion', name: 'Consolidación', description: 'De 2 a 6 meses: más preguntas, repaso de errores y un simulacro completo cada semana.', color: '#0ea5e9', alloc: { questions: 0.5, review: 0.15, flashcards: 0.2, guides: 0.15 }, examSize: 100 },
  intensivo: { id: 'intensivo', name: 'Repaso intensivo', description: 'Últimos 2 meses: simulacros frecuentes y foco en tus puntos débiles.', color: '#f59e0b', alloc: { questions: 0.55, review: 0.2, flashcards: 0.2, guides: 0.05 }, examSize: 100 },
  final: { id: 'final', name: 'Recta final', description: 'Últimas 2 semanas: repaso de errores, perlas y simulacros completos. Cuida el sueño.', color: '#ef4444', alloc: { questions: 0.45, review: 0.3, flashcards: 0.25, guides: 0 }, examSize: 100 },
  'sin-fecha': { id: 'sin-fecha', name: 'Sin fecha definida', description: 'Plan equilibrado. Elige tu convocatoria del ENURM para ajustarlo a tu calendario.', color: '#6366f1', alloc: { questions: 0.5, review: 0.15, flashcards: 0.2, guides: 0.15 }, examSize: 100 },
  examen: { id: 'examen', name: 'Día del examen', description: '¡Hoy es el día! Confía en tu preparación.', color: '#ec4899', alloc: { questions: 0, review: 0, flashcards: 0, guides: 0 }, examSize: 0 },
  pasado: { id: 'pasado', name: 'Examen realizado', description: 'Si vas a presentarlo de nuevo, elige la próxima convocatoria.', color: '#64748b', alloc: { questions: 0.5, review: 0.2, flashcards: 0.2, guides: 0.1 }, examSize: 100 },
}

export const PHASE_ORDER: PlanPhase[] = ['fundamentos', 'consolidacion', 'intensivo', 'final']

export function phaseFor(daysLeft: number | null): PlanPhase {
  if (daysLeft === null) return 'sin-fecha'
  if (daysLeft < 0) return 'pasado'
  if (daysLeft === 0) return 'examen'
  if (daysLeft <= 14) return 'final'
  if (daysLeft <= 60) return 'intensivo'
  if (daysLeft <= 180) return 'consolidacion'
  return 'fundamentos'
}

const CONFIDENCE_WEAKNESS = { 1: 0.75, 2: 0.5, 3: 0.3 } as const

export interface Priority {
  id: string
  score: number
  reason: string
}

/**
 * Prioridad de cada especialidad = peso en el examen × (0,4 + debilidad) × refuerzo por residencia.
 * La debilidad sale de la precisión real si hay ≥ 5 respuestas; si no, de la autoevaluación.
 */
export function specialtyPriorities(profile: StudyProfile, stats: SpecialtyStat[], bankCounts: Record<string, number>): Priority[] {
  const bankTotal = Object.values(bankCounts).reduce((a, b) => a + b, 0)
  const useBank = bankTotal >= 300
  const weightTotal = SPECIALTIES.reduce((a, s) => a + s.weight, 0)
  const boost = new Set(RESIDENCIES.find((r) => r.id === profile.residency)?.boost ?? [])
  const ids = useBank ? Object.keys(bankCounts) : SPECIALTIES.map((s) => s.id)

  return ids
    .map((id) => {
      const share = useBank ? (bankCounts[id] ?? 0) / bankTotal : getSpecialty(id).weight / weightTotal
      const st = stats.find((s) => s.specialty === id)
      const area = areaOf(id)
      const conf = area ? profile.confidence[area.id] : undefined
      let weakness: number
      let reason: string
      if (st && st.answered >= 5) {
        weakness = 1 - st.accuracy
        reason = `${Math.round(st.accuracy * 100)}% de precisión`
      } else {
        weakness = conf ? CONFIDENCE_WEAKNESS[conf] : 0.5
        reason = conf === 1 ? 'te sientes poco seguro' : conf === 3 ? 'te sientes seguro' : 'aún sin datos'
      }
      const b = boost.has(id) ? 1.25 : 1
      if (b > 1) reason += ' · tu residencia'
      return { id, score: share * (0.4 + weakness) * b, reason }
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
}

/** Rotación ponderada suave: las especialidades prioritarias aparecen más días, intercaladas con el resto. */
export function rotation(priorities: Priority[], length = 28): string[] {
  if (!priorities.length) return []
  const total = priorities.reduce((a, p) => a + p.score, 0)
  const credit = new Map(priorities.map((p) => [p.id, 0]))
  const out: string[] = []
  for (let i = 0; i < length; i++) {
    let best = priorities[0].id
    for (const p of priorities) {
      credit.set(p.id, credit.get(p.id)! + p.score)
      if (credit.get(p.id)! > credit.get(best)!) best = p.id
    }
    credit.set(best, credit.get(best)! - total)
    out.push(best)
  }
  return out
}

function epochDay(d: Date): number {
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86_400_000)
}

function adjustAlloc(alloc: PhaseInfo['alloc'], methods: StudyMethod[]) {
  const a = { ...alloc }
  // Si el estudiante no usa un método, su tiempo pasa a preguntas (siempre presentes).
  if (!methods.includes('flashcards')) {
    a.questions += a.flashcards * 0.6
    a.flashcards *= 0.4
  }
  if (!methods.includes('guias')) {
    a.questions += a.guides
    a.guides = 0
  }
  return a
}

/** Día de la semana del simulacro: el último día de estudio de la semana (domingo cuenta como el último). */
function examWeekday(studyDays: number[]): number {
  const days = studyDays.length ? studyDays : [6]
  return days.reduce((best, d) => ((d === 0 ? 7 : d) > (best === 0 ? 7 : best) ? d : best), days[0])
}

export interface PlanInput {
  date: Date
  profile: StudyProfile
  priorities: Priority[]
  dueCards: number
  newCards: number
  failedCount: number
  guidesRead: string[]
}

const MESSAGES: Record<PlanPhase, string[]> = {
  fundamentos: ['Hoy construyes la base: entiende antes de memorizar.', 'Constancia > intensidad. Un poco cada día suma mucho.', 'Lee la guía, luego pon a prueba lo aprendido con preguntas.'],
  consolidacion: ['Tus errores son tu mejor material de estudio.', 'Intercala especialidades: así se fija mejor la información.', 'Cada simulacro te acerca al ritmo real del examen.'],
  intensivo: ['Prioriza lo que más pesa y lo que más fallas.', 'Simula condiciones reales: tiempo, silencio y concentración.', 'Repasa perlas y errores; ya tienes la base.'],
  final: ['Consolida, no empieces temas nuevos.', 'Duerme bien: la memoria se fija mientras descansas.', 'Repasa tus errores y confía en tu preparación.'],
  'sin-fecha': ['Elige en qué convocatoria del ENURM vas a presentarte para afinar tu plan.', 'Un plan constante vale más que maratones esporádicas.', 'Practica, repasa tus errores y vuelve a practicar.'],
  examen: ['¡Hoy es el día! Desayuna bien, llega temprano y lee cada pregunta con calma.'],
  pasado: ['¿Vas a presentarlo de nuevo? Elige la próxima convocatoria en «Editar cuestionario».'],
}

export function buildDailyPlan(input: PlanInput): DailyPlan {
  const { date, profile, priorities } = input
  const { date: target } = resolveExamDate(profile)
  const daysLeft = target ? daysBetween(date, target) : null
  const phase = phaseFor(daysLeft)
  const info = PHASES[phase]
  const day = epochDay(date)
  const messages = MESSAGES[phase]
  const message = messages[day % messages.length]
  const studyDays = profile.studyDays.length ? profile.studyDays : DEFAULT_PROFILE.studyDays
  const restDay = !studyDays.includes(date.getDay())
  const base = { date: dayKey(date), phase, message }

  if (phase === 'examen') {
    return { ...base, restDay: true, focus: [], minutes: 0, tasks: [] }
  }
  if (daysLeft === 1) {
    const tasks: PlanTask[] = input.dueCards ? [{ id: 'cards-light', kind: 'flashcards', title: 'Repaso ligero de flashcards', detail: 'Solo las pendientes, sin presión.', minutes: 15, target: Math.min(input.dueCards, 30), link: '/flashcards/todas/estudiar', optional: true }] : []
    return { ...base, restDay: true, focus: [], minutes: 15, message: 'Mañana es el examen: descansa, prepara tus documentos y duerme temprano.', tasks }
  }

  const cycle = rotation(priorities)
  const primary = cycle[day % cycle.length] ?? 'medicina-interna'
  let secondary = cycle[(day + Math.floor(cycle.length / 2) + 1) % cycle.length] ?? primary
  if (secondary === primary) secondary = priorities.find((p) => p.id !== primary)?.id ?? primary
  const focus = secondary === primary ? [primary] : [primary, secondary]

  if (restDay) {
    const tasks: PlanTask[] = []
    if (input.dueCards) tasks.push({ id: 'cards-rest', kind: 'flashcards', title: 'Flashcards pendientes', detail: 'Opcional: mantén viva la repetición espaciada.', minutes: 10, target: Math.min(input.dueCards, 25), link: '/flashcards/todas/estudiar', optional: true })
    if (profile.methods.includes('juegos')) tasks.push({ id: 'game-rest', kind: 'game', title: 'Una partida de Verdadero o falso', detail: 'Aprender jugando también cuenta.', minutes: 5, target: 1, link: '/juegos/verdadero-falso', optional: true })
    return { ...base, restDay: true, focus, minutes: tasks.reduce((a, t) => a + t.minutes, 0), message: 'Día de descanso: recargar energía también es parte del plan.', tasks }
  }

  const minutes = Math.max(20, profile.minutesPerDay || DEFAULT_PROFILE.minutesPerDay)
  const alloc = adjustAlloc(info.alloc, profile.methods)
  const tasks: PlanTask[] = []

  // Simulacro: el último día de estudio de la semana; en repaso intensivo también a mitad de semana.
  const examDay = examWeekday(studyDays)
  const midWeek = studyDays.filter((d) => d !== examDay)[Math.floor((studyDays.length - 1) / 2)]
  const isExamDay = info.examSize > 0 && (date.getDay() === examDay || (phase === 'intensivo' && date.getDay() === midWeek)) && (daysLeft === null || daysLeft > 2)
  let examMinutes = 0
  if (isExamDay) {
    // El simulacro semanal no se recorta al tiempo diario: es el día de practicar el examen real (100 preguntas, 2 h).
    // Solo con menos de 1 h al día se propone medio examen.
    const size = phase === 'intensivo' && date.getDay() === midWeek ? 50 : info.examSize
    const sized = minutes < 60 ? Math.min(size, 50) : size
    examMinutes = Math.round(sized * 1.2)
    tasks.push({ id: 'exam', kind: 'exam', title: `Simulacro de ${sized} preguntas`, detail: `${examMinutes} minutos en condiciones de examen. Revisa los resultados al terminar.`, minutes: examMinutes, target: 1, link: `/simulacro?count=${sized}&start=1` })
  }

  const remaining = Math.max(0, minutes - examMinutes)
  const support: PlanTask[] = []

  if (input.failedCount > 0 && alloc.review > 0) {
    const n = Math.min(input.failedCount, Math.max(5, Math.round((remaining * alloc.review) / 1.5)))
    support.push({ id: 'review', kind: 'review', title: `Repasar ${n} ${n === 1 ? 'error' : 'errores'}`, detail: 'Vuelve a responder preguntas que fallaste.', minutes: Math.round(n * 1.5), target: n, link: `/practica?status=failed&count=${n}&auto=1` })
  }

  const cardsAvailable = input.dueCards + Math.min(input.newCards, 20)
  if (cardsAvailable > 0 && alloc.flashcards > 0) {
    const n = Math.min(cardsAvailable, Math.max(10, Math.round(remaining * alloc.flashcards * 3)))
    support.push({ id: 'cards', kind: 'flashcards', title: `${n} flashcards`, detail: input.dueCards ? `${input.dueCards} pendientes de repaso` : 'Tarjetas nuevas', minutes: Math.max(5, Math.round(n / 3)), target: n, link: '/flashcards/todas/estudiar' })
  }

  if (alloc.guides > 0 && !isExamDay) {
    const unread = GUIDES.filter((g) => !input.guidesRead.includes(g.id))
    const guide = unread.find((g) => g.specialty === primary) ?? unread.find((g) => g.specialty === secondary) ?? unread.find((g) => priorities.slice(0, 6).some((p) => p.id === g.specialty)) ?? unread[0]
    if (guide) {
      support.push({ id: `guide-${guide.id}`, kind: 'guide', title: `Leer: ${guide.title}`, detail: getSpecialty(guide.specialty).name, minutes: guide.minutes, target: 1, guideId: guide.id, specialty: guide.specialty, link: `/guias/${guide.id}` })
    } else {
      support.push({ id: `pearls-${primary}`, kind: 'guide', title: `Repasar perlas de ${getSpecialty(primary).name}`, detail: 'Temas de alto rendimiento y perlas del espacio de la especialidad.', minutes: 10, target: 1, specialty: primary, link: `/especialidades/${primary}` })
    }
  }

  // Las preguntas ocupan el tiempo que dejan libre las demás tareas (al menos su cuota de la fase).
  const supportMinutes = support.reduce((a, t) => a + t.minutes, 0)
  const qMinutes = Math.max(remaining * alloc.questions, remaining - supportMinutes)
  const totalQ = Math.max(isExamDay ? 0 : 10, Math.floor(qMinutes / 1.5 / 5) * 5)
  if (totalQ > 0) {
    const nPrimary = focus.length > 1 ? Math.max(5, Math.round((totalQ * 0.6) / 5) * 5) : totalQ
    const nSecondary = totalQ - nPrimary
    const sp = getSpecialty(primary)
    tasks.push({ id: `q-${primary}`, kind: 'questions', title: `${nPrimary} preguntas de ${sp.name}`, detail: 'Especialidad prioritaria de hoy. Lee cada explicación.', minutes: Math.round(nPrimary * 1.5), target: nPrimary, specialty: primary, link: `/practica?specialty=${primary}&count=${nPrimary}&auto=1` })
    if (nSecondary > 0) {
      const ss = getSpecialty(secondary)
      tasks.push({ id: `q-${secondary}`, kind: 'questions', title: `${nSecondary} preguntas de ${ss.name}`, detail: 'Especialidad complementaria para intercalar.', minutes: Math.round(nSecondary * 1.5), target: nSecondary, specialty: secondary, link: `/practica?specialty=${secondary}&count=${nSecondary}&auto=1` })
    }
  }
  tasks.push(...support)

  if (profile.methods.includes('juegos')) {
    tasks.push({ id: 'game', kind: 'game', title: 'Contrarreloj de 60 segundos', detail: 'Bonus para cerrar el día con energía.', minutes: 2, target: 1, link: '/juegos/contrarreloj', optional: true })
  }

  return { ...base, restDay: false, focus, minutes: tasks.filter((t) => !t.optional).reduce((a, t) => a + t.minutes, 0), tasks }
}

/** Minutos por pregunta en modo tutor: 72 s como en el ENURM más la lectura de la explicación. */
export const MINUTES_PER_QUESTION = 1.5

/**
 * Rango orientativo de preguntas diarias por fase. No sale de un único estudio: combina la evidencia
 * (practicar con preguntas y espaciar es lo que más funciona; más preguntas únicas se asocian a mejor
 * puntaje, pero el porcentaje de aciertos y revisar los errores pesan más) con el tiempo realista de cada fase.
 */
export const DAILY_QUESTION_RANGE: Record<PlanPhase, [number, number]> = {
  fundamentos: [20, 40],
  consolidacion: [40, 60],
  intensivo: [60, 90],
  final: [40, 60],
  'sin-fecha': [30, 50],
  examen: [0, 0],
  pasado: [30, 50],
}

export interface QuestionAdvice {
  perDay: number
  range: [number, number]
  /** Preguntas acumuladas hasta el examen al ritmo del plan (null sin fecha). */
  untilExam: number | null
  /** Minutos diarios que harían falta para llegar al mínimo del rango (null si ya alcanza). */
  minutesForMin: number | null
}

/** Recomendación de preguntas diarias explicada: lo que cabe en tu tiempo frente al rango de tu fase. */
export function questionAdvice(profile: StudyProfile, priorities: Priority[], now = new Date()): QuestionAdvice {
  const perDay = typicalQuestionsPerDay(profile, priorities)
  const target = resolveExamDate(profile).date
  const daysLeft = target ? daysBetween(now, target) : null
  const range = DAILY_QUESTION_RANGE[phaseFor(daysLeft)]
  const studyDays = profile.studyDays.length || DEFAULT_PROFILE.studyDays.length
  const untilExam = daysLeft && daysLeft > 0 ? Math.round(((perDay * daysLeft * studyDays) / 7) / 100) * 100 : null
  // Si no alcanza el mínimo, cuánto tiempo extra haría falta (las preguntas son ~la mitad del tiempo diario).
  const minutesForMin = perDay < range[0] ? Math.ceil(((range[0] - perDay) * MINUTES_PER_QUESTION * 2 + profile.minutesPerDay) / 15) * 15 : null
  return { perDay, range, untilExam, minutesForMin }
}

/** Preguntas que tendría un día de estudio típico con este perfil (para resúmenes y la meta diaria). */
export function typicalQuestionsPerDay(profile: StudyProfile, priorities: Priority[]): number {
  const studyDays = profile.studyDays.length ? profile.studyDays : DEFAULT_PROFILE.studyDays
  const examDay = examWeekday(studyDays)
  const day = studyDays.find((d) => d !== examDay) ?? studyDays[0]
  const date = new Date()
  date.setDate(date.getDate() + ((day - date.getDay() + 7) % 7 || 7))
  const plan = buildDailyPlan({ date, profile: { ...profile, studyDays }, priorities, dueCards: 20, newCards: 20, failedCount: 10, guidesRead: [] })
  return plan.tasks.filter((t) => t.kind === 'questions' || t.kind === 'review').reduce((a, t) => a + t.target, 0)
}

export interface TaskContext {
  today: DayActivity | undefined
  guidesRead: string[]
  examsToday: number
  checks: string[]
}

/** Progreso de una tarea a partir de la actividad registrada hoy (o de la marca manual). */
export function taskProgress(task: PlanTask, ctx: TaskContext): { done: number; complete: boolean } {
  const t = ctx.today
  let done = 0
  switch (task.kind) {
    case 'questions':
      done = task.specialty ? (t?.bySpec?.[task.specialty] ?? 0) : (t?.answered ?? 0)
      break
    case 'review':
      done = t?.reviewed ?? 0
      break
    case 'flashcards':
      done = t?.cards ?? 0
      break
    case 'guide':
      done = task.guideId && ctx.guidesRead.includes(task.guideId) ? 1 : 0
      break
    case 'exam':
      done = ctx.examsToday
      break
    case 'game':
      done = t?.games ?? 0
      break
  }
  const manual = ctx.checks.includes(task.id)
  const complete = manual || done >= task.target
  return { done: manual ? task.target : Math.min(done, task.target), complete }
}

/** Resumen legible del perfil. */
export function describeProfile(p: StudyProfile): string[] {
  const out: string[] = []
  if (p.examYear) out.push(`ENURM ${p.examYear}: ${formatEnurmDate(enurmDate(p.examYear))}`)
  if (p.residency) out.push(`Residencia: ${RESIDENCIES.find((r) => r.id === p.residency)?.name ?? p.residency}`)
  out.push(`${p.studyDays.length} días/semana · ${formatMinutes(p.minutesPerDay)} al día`)
  const weak = AREAS.filter((a) => p.confidence[a.id] === 1).map((a) => a.name)
  if (weak.length) out.push(`A reforzar: ${weak.join(', ')}`)
  return out
}
