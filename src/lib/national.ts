import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ExamResult, Question } from '@/types'
import { getSupabase } from './supabase'
import { seededPick } from './selection'
import { useAuth } from '@/store/auth'
import { useProgress } from '@/store/progress'

/**
 * Simulacro nacional: cada mes, el mismo examen para todos (100 preguntas, 2 horas).
 * Las preguntas salen del banco con una semilla fija por edición, así todos reciben las mismas
 * sin tener que guardarlas en un servidor. Con cuenta, el resultado entra al percentil del país.
 */
export const NATIONAL_SIZE = 100
export const NATIONAL_MINUTES = 120
const TZ = 'America/Santo_Domingo'

/** Edición del mes en hora de República Dominicana: «2026-11». */
export function currentEdition(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit' }).formatToParts(now)
  const y = parts.find((p) => p.type === 'year')!.value
  const m = parts.find((p) => p.type === 'month')!.value
  return `${y}-${m}`
}

export function editionLabel(edition: string): string {
  const [y, m] = edition.split('-').map(Number)
  const name = new Date(y, m - 1, 15).toLocaleDateString('es-DO', { month: 'long' })
  return `${name[0].toUpperCase()}${name.slice(1)} ${y}`
}

/** Días que quedan para que cierre la edición actual (último día del mes, hora de RD). */
export function daysLeftInEdition(now = new Date()): number {
  const [y, m] = currentEdition(now).split('-').map(Number)
  const end = Date.UTC(y, m, 1, 4) // 00:00 del día 1 del mes siguiente en RD (UTC−4)
  return Math.max(0, Math.ceil((end - now.getTime()) / 86_400_000))
}

export function nationalQuestions(bank: Question[], edition: string): Question[] {
  return seededPick(bank, NATIONAL_SIZE, `medlogic-nacional-${edition}`)
}

export interface NationalAttempt {
  examId: string
  correct: number
  total: number
  seconds: number
  date: number
  /** Ya quedó guardado en el servidor (o el servidor ya tenía uno de esta cuenta). */
  sent: boolean
}

interface NationalState {
  attempts: Record<string, NationalAttempt>
  record: (edition: string, r: ExamResult) => void
  markSent: (edition: string) => void
}

export const useNational = create<NationalState>()(
  persist(
    (set, get) => ({
      attempts: {},
      record: (edition, r) => {
        if (get().attempts[edition]) return
        set({ attempts: { ...get().attempts, [edition]: { examId: r.id, correct: r.correct, total: r.total, seconds: r.durationSec, date: r.date, sent: false } } })
      },
      markSent: (edition) => {
        const a = get().attempts[edition]
        if (a) set({ attempts: { ...get().attempts, [edition]: { ...a, sent: true } } })
      },
    }),
    { name: 'medlogic-nacional', version: 1 },
  ),
)

/** Entrega el resultado al servidor si hay sesión. Devuelve si quedó guardado. */
export async function sendNational(edition: string): Promise<boolean> {
  const a = useNational.getState().attempts[edition]
  const user = useAuth.getState().user
  if (!a || a.sent || !user) return !!a?.sent
  const supabase = await getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from('simulacro_nacional').insert({
    user_id: user.id,
    edicion: edition,
    correctas: a.correct,
    total: a.total,
    segundos: a.seconds,
    universidad: useProgress.getState().profile.university,
  })
  // 23505: esta cuenta ya lo había entregado (por ejemplo, desde otro teléfono). Cuenta el primero.
  if (!error || error.code === '23505') {
    useNational.getState().markSent(edition)
    return true
  }
  return false
}

export interface NationalResults {
  participantes: number
  promedio: number
  mejor: number
  mis_correctas: number
  total: number
  percentil: number | null
  posicion: number
  promedio_universidad: number | null
  participantes_universidad: number
}

export async function fetchNationalResults(edition: string): Promise<NationalResults | null> {
  const supabase = await getSupabase()
  if (!supabase || !useAuth.getState().user) return null
  const { data, error } = await supabase.rpc('simulacro_resultados', { p_edicion: edition })
  if (error) throw error
  const r = (data ?? [])[0]
  if (!r) return null
  return {
    participantes: Number(r.participantes),
    promedio: Number(r.promedio),
    mejor: Number(r.mejor),
    mis_correctas: Number(r.mis_correctas),
    total: Number(r.total),
    percentil: r.percentil === null ? null : Number(r.percentil),
    posicion: Number(r.posicion),
    promedio_universidad: r.promedio_universidad === null ? null : Number(r.promedio_universidad),
    participantes_universidad: Number(r.participantes_universidad),
  }
}
