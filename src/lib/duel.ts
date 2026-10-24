import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question } from '@/types'
import { seededPick } from './selection'
import { hashString } from './utils'

/**
 * Duelo con un amigo, sin servidor: todo viaja en el enlace.
 * El enlace lleva las preguntas (por id), el nombre y el resultado de quien reta; quien acepta
 * responde las mismas y devuelve otro enlace con los dos resultados.
 */
export const DUEL_SIZE = 10

export interface DuelScore {
  name: string
  correct: number
  /** Segundos pensando (sin contar el tiempo leyendo explicaciones). */
  seconds: number
}

export interface DuelPayload {
  v: 1
  /** Identificador del duelo (también semilla de las preguntas). */
  id: string
  q: string[]
  /** Quien retó. */
  a: DuelScore
  /** Quien aceptó (solo en el enlace de vuelta). */
  b?: DuelScore
}

const SALT = 'medlogic-duelo-v1'

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(code: string): string {
  const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

/** Firma corta: no es seguridad real, solo evita que cambiar un número a mano sea trivial. */
function sign(body: string): string {
  return hashString(`${SALT}|${body}`).slice(0, 6)
}

export function encodeDuel(p: DuelPayload): string {
  const body = JSON.stringify(p)
  return `${toBase64Url(body)}.${sign(body)}`
}

export function decodeDuel(code: string): DuelPayload | null {
  try {
    const [data, sig] = code.split('.')
    const body = fromBase64Url(data)
    if (sign(body) !== sig) return null
    const p = JSON.parse(body) as DuelPayload
    if (p.v !== 1 || !Array.isArray(p.q) || !p.q.length || p.q.length > 20 || !p.a) return null
    const ok = (s: DuelScore | undefined) => !s || (typeof s.correct === 'number' && s.correct >= 0 && s.correct <= p.q.length && s.seconds >= 0 && typeof s.name === 'string')
    if (!ok(p.a) || !ok(p.b)) return null
    return { ...p, a: { ...p.a, name: p.a.name.slice(0, 30) }, b: p.b && { ...p.b, name: p.b.name.slice(0, 30) } }
  } catch {
    return null
  }
}

export function duelUrl(p: DuelPayload): string {
  return `${window.location.origin}${window.location.pathname}#/duelo/${encodeDuel(p)}`
}

export function newDuelQuestions(bank: Question[], specialty: string | null): { id: string; questions: Question[] } {
  const id = Math.random().toString(36).slice(2, 10)
  const pool = specialty ? bank.filter((q) => q.specialty === specialty) : bank
  return { id, questions: seededPick(pool, DUEL_SIZE, `duelo-${id}`) }
}

/** Gana quien acierta más; si empatan, quien tardó menos. */
export function duelWinner(a: DuelScore, b: DuelScore): 'a' | 'b' | 'tie' {
  if (a.correct !== b.correct) return a.correct > b.correct ? 'a' : 'b'
  if (Math.abs(a.seconds - b.seconds) < 1) return 'tie'
  return a.seconds < b.seconds ? 'a' : 'b'
}

export interface DuelRecord {
  id: string
  rival: string
  me: DuelScore
  rivalScore: DuelScore | null
  /** Yo reté (true) o acepté (false). */
  challenger: boolean
  date: number
}

interface DuelState {
  duels: Record<string, DuelRecord>
  save: (r: DuelRecord) => void
}

export const useDuels = create<DuelState>()(
  persist(
    (set, get) => ({
      duels: {},
      save: (r) => {
        const all = { ...get().duels, [r.id]: r }
        // Guarda los 50 más recientes.
        const keep = Object.values(all)
          .sort((x, y) => y.date - x.date)
          .slice(0, 50)
        set({ duels: Object.fromEntries(keep.map((d) => [d.id, d])) })
      },
    }),
    { name: 'medlogic-duelos', version: 1 },
  ),
)

export function duelRecordResult(d: DuelRecord): 'win' | 'loss' | 'tie' | 'pending' {
  if (!d.rivalScore) return 'pending'
  const w = duelWinner(d.me, d.rivalScore)
  return w === 'tie' ? 'tie' : w === 'a' ? 'win' : 'loss'
}

export function duelTally(duels: Record<string, DuelRecord>) {
  const list = Object.values(duels)
  return {
    wins: list.filter((d) => duelRecordResult(d) === 'win').length,
    losses: list.filter((d) => duelRecordResult(d) === 'loss').length,
    ties: list.filter((d) => duelRecordResult(d) === 'tie').length,
    pending: list.filter((d) => duelRecordResult(d) === 'pending').length,
    total: list.length,
  }
}
