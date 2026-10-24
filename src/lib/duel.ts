import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question } from '@/types'
import { seededPick } from './selection'
import { hashString } from './utils'
import { SPECIALTIES } from '@/data/specialties'

/**
 * Duelo con un amigo, sin servidor: todo viaja en el enlace.
 * El enlace lleva las preguntas (por id), el nombre y el resultado de quien reta; quien acepta
 * responde las mismas y devuelve otro enlace con los dos resultados.
 */
/** Cuántas preguntas puede tener un duelo (quien reta elige). */
export const DUEL_SIZES = [5, 10, 15, 20, 30, 50] as const
export const DUEL_SIZE = 10
export const MAX_DUEL_SIZE = 50

export interface DuelScore {
  name: string
  correct: number
  /** Segundos pensando (sin contar el tiempo leyendo explicaciones). */
  seconds: number
}

export interface DuelPayload {
  v: 1 | 2
  /** Identificador del duelo (también semilla de las preguntas). */
  id: string
  /** Número de preguntas. */
  n: number
  /** Ids de las preguntas: solo en enlaces antiguos (v1); los nuevos las sacan de la semilla. */
  q?: string[]
  /** Quien retó. */
  a: DuelScore
  /** Quien aceptó (solo en el enlace de vuelta). */
  b?: DuelScore
  /** Temas elegidos (ids de especialidad); vacío o ausente = mezcla de todo. */
  s?: string[]
}

const SALT = 'medlogic-duelo-v1'

function fromBase64Url(code: string): string {
  const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

/** Firma corta: no es seguridad real, solo evita que cambiar un número a mano sea trivial. */
function sign(body: string, len: number): string {
  return hashString(`${SALT}|${body}`).padStart(len, '0').slice(0, len)
}

const SPEC_IDS = SPECIALTIES.map((x) => x.id)
/** Nombre limpio: sin «_» (separa los campos) y con largo máximo. */
const cleanName = (name: string) => name.replace(/_/g, '-').replace(/\s+/g, ' ').trim().slice(0, 30)
const encName = (name: string) => encodeURIComponent(cleanName(name)).replace(/%20/g, '+')
/** El navegador a veces entrega el enlace ya decodificado («María») y a veces no («Mar%C3%ADa»). */
function decName(raw: string): string {
  const spaced = raw.replace(/\+/g, ' ')
  try {
    return cleanName(decodeURIComponent(spaced))
  } catch {
    return cleanName(spaced)
  }
}

/** La firma se calcula sobre los nombres ya decodificados, así da igual cómo llegue el enlace. */
const canonical = (fields: (string | number)[], names: number[]) => fields.map((f, i) => (names.includes(i) ? cleanName(String(f)) : String(f))).join('_')

/**
 * Enlace corto: «id_n_temas_aciertos_segundos_nombre[_aciertos_segundos_nombre]_firma».
 * Las preguntas no viajan: cada teléfono las saca del banco con la semilla del duelo.
 * Ej.: k7f2m9_20_1a_18_102_Dra.+Genao_x8k2
 */
export function encodeDuel(p: DuelPayload): string {
  const specs = (p.s ?? []).map((id) => SPEC_IDS.indexOf(id)).filter((i) => i >= 0).map((i) => i.toString(36)).join('')
  const fields: (string | number)[] = [p.id, p.n, specs, p.a.correct, Math.round(p.a.seconds), p.a.name]
  if (p.b) fields.push(p.b.correct, Math.round(p.b.seconds), p.b.name)
  const names = p.b ? [5, 8] : [5]
  const body = fields.map((f, i) => (names.includes(i) ? encName(String(f)) : String(f))).join('_')
  return `${body}_${sign(canonical(fields, names), 4)}`
}

/** Enlaces antiguos (v1): JSON en base64 con la lista de preguntas. */
function decodeLegacy(code: string): DuelPayload | null {
  const [data, sig] = code.split('.')
  const body = fromBase64Url(data)
  // Misma firma que tenían esos enlaces (sin relleno).
  if (hashString(`${SALT}|${body}`).slice(0, 6) !== sig) return null
  const p = JSON.parse(body) as DuelPayload
  if (p.v !== 1 || !Array.isArray(p.q) || !p.q.length || p.q.length > MAX_DUEL_SIZE || !p.a) return null
  return { ...p, n: p.q.length }
}

export function decodeDuel(code: string): DuelPayload | null {
  try {
    let p: DuelPayload | null
    if (code.includes('.') && !code.includes('_')) p = decodeLegacy(code)
    else {
      const parts = code.split('_')
      if (parts.length !== 7 && parts.length !== 10) return null
      const sig = parts.pop()!
      const names = parts.length > 7 ? [5, 8] : [5]
      for (const i of names) parts[i] = decName(parts[i])
      if (sign(canonical(parts, names), 4) !== sig) return null
      const [id, n, specs, ac, as, an, bc, bs, bn] = parts
      const s = [...specs].map((ch) => SPEC_IDS[parseInt(ch, 36)]).filter(Boolean)
      p = {
        v: 2,
        id,
        n: Number(n),
        a: { name: an, correct: Number(ac), seconds: Number(as) },
        ...(bn !== undefined ? { b: { name: bn, correct: Number(bc), seconds: Number(bs) } } : {}),
        ...(s.length ? { s } : {}),
      }
      if (!/^[a-z0-9]{3,12}$/.test(id)) return null
    }
    if (!p || !Number.isInteger(p.n) || p.n < 1 || p.n > MAX_DUEL_SIZE) return null
    if (p.s && (!Array.isArray(p.s) || p.s.length > 30 || p.s.some((x) => typeof x !== 'string'))) return null
    const ok = (sc: DuelScore | undefined) => !sc || (Number.isFinite(sc.correct) && sc.correct >= 0 && sc.correct <= p!.n && Number.isFinite(sc.seconds) && sc.seconds >= 0 && typeof sc.name === 'string')
    if (!ok(p.a) || !ok(p.b)) return null
    return { ...p, a: { ...p.a, name: p.a.name.slice(0, 30) }, b: p.b && { ...p.b, name: p.b.name.slice(0, 30) } }
  } catch {
    return null
  }
}

/** Las preguntas de un duelo: las del enlace antiguo o las que da la semilla con el banco actual. */
export function duelQuestions(p: DuelPayload, bank: Question[], byId: Map<string, Question>): Question[] {
  if (p.q) return p.q.map((id) => byId.get(id)).filter((q): q is Question => !!q)
  return seededPick(duelPool(bank, p.s ?? []), p.n, `duelo-${p.id}`)
}

export function duelUrl(p: DuelPayload): string {
  return `${window.location.origin}${window.location.pathname}#/d/${encodeDuel(p)}`
}

/** Preguntas del banco para los temas elegidos (todas si no se elige ninguno). */
export function duelPool(bank: Question[], specialties: string[]): Question[] {
  return specialties.length ? bank.filter((q) => specialties.includes(q.specialty)) : bank
}

export function newDuelQuestions(bank: Question[], specialties: string[], count: number): { id: string; questions: Question[] } {
  const id = Math.random().toString(36).slice(2, 8).padEnd(6, '0')
  const n = Math.max(1, Math.min(MAX_DUEL_SIZE, Math.round(count)))
  return { id, questions: seededPick(duelPool(bank, specialties), n, `duelo-${id}`) }
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
  /** Número de preguntas del duelo (los duelos antiguos eran de 10). */
  total?: number
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
