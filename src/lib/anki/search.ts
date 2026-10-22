import type { Card, CardState, RevlogEntry } from './types'
import { dayNumber, isDueNow } from './scheduler'
import { plainText } from './render'
import { normalizeText } from '@/data/specialties'

export interface SearchContext {
  now: number
  rolloverHour: number
  deckName: (deckId: string) => string
  state: (cardId: string) => CardState | undefined
  /** Repasos por tarjeta (para rated:). */
  revlog?: Map<string, RevlogEntry[]>
}

type Pred = (c: Card) => boolean

const DAY = 86_400_000

function tokenize(q: string): string[] {
  const out: string[] = []
  const re = /-?"[^"]*"|-?[^\s"]+(?:"[^"]*")?/g
  for (const m of q.matchAll(re)) out.push(m[0])
  return out
}

function wildcard(pattern: string): RegExp {
  const esc = normalizeText(pattern).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
  return new RegExp(`^${esc}$`)
}

function compare(a: number, op: string, b: number): boolean {
  switch (op) {
    case '>':
      return a > b
    case '>=':
      return a >= b
    case '<':
      return a < b
    case '<=':
      return a <= b
    case '!=':
      return a !== b
    default:
      return a === b
  }
}

function termPredicate(raw: string, ctx: SearchContext): Pred {
  const neg = raw.startsWith('-')
  let t = neg ? raw.slice(1) : raw
  t = t.replace(/"/g, '')
  const lower = t.toLowerCase()
  let p: Pred

  const today = dayNumber(ctx.now, ctx.rolloverHour)
  const colon = lower.indexOf(':')
  const key = colon > 0 ? lower.slice(0, colon) : ''
  const val = colon > 0 ? t.slice(colon + 1) : ''

  if (key === 'deck') {
    const re = wildcard(val)
    p = (c) => {
      const name = normalizeText(ctx.deckName(c.deckId))
      // Incluye submazos: "deck:ENURM" coincide con "ENURM::Pediatría".
      return re.test(name) || name.split('::').some((_, i, parts) => re.test(parts.slice(0, i + 1).join('::')))
    }
  } else if (key === 'tag') {
    const re = wildcard(val)
    p = (c) => c.note.tags.some((tag) => re.test(normalizeText(tag)) || normalizeText(tag).startsWith(normalizeText(val) + '::'))
  } else if (key === 'spec' || key === 'especialidad') {
    p = (c) => c.note.specialty === val
  } else if (key === 'is' || key === 'es') {
    p = (c) => {
      const s = ctx.state(c.id)
      switch (val.toLowerCase()) {
        case 'new':
        case 'nueva':
          return !s || s.type === 'new'
        case 'learn':
        case 'aprendiendo':
          return !!s && (s.type === 'learning' || s.type === 'relearning')
        case 'review':
        case 'repaso':
          return !!s && (s.type === 'review' || s.type === 'relearning')
        case 'due':
        case 'pendiente':
          return !!s && isDueNow(s, ctx.now, ctx.rolloverHour)
        case 'suspended':
        case 'suspendida':
          return !!s?.suspended
        case 'buried':
        case 'enterrada':
          return !!s?.buriedUntil && s.buriedUntil >= today
        case 'leech':
          return !!s?.leech
        default:
          return false
      }
    }
  } else if (key === 'flag' || key === 'bandera') {
    const n = Number(val)
    p = (c) => (ctx.state(c.id)?.flag ?? 0) === n
  } else if (key === 'prop') {
    const m = /^(ivl|due|reps|lapses|ease)(>=|<=|!=|>|<|=)(-?[\d.]+)$/i.exec(val)
    p = (c) => {
      if (!m) return false
      const s = ctx.state(c.id)
      if (!s) return false
      const field = m[1].toLowerCase()
      const n = Number(m[3])
      const v = field === 'ivl' ? s.interval : field === 'reps' ? s.reps : field === 'lapses' ? s.lapses : field === 'ease' ? s.ease : dayNumber(s.due, ctx.rolloverHour) - today
      return compare(v, m[2], n)
    }
  } else if (key === 'added' || key === 'agregada') {
    const n = Number(val) || 1
    p = (c) => c.note.createdAt > 0 && ctx.now - c.note.createdAt < n * DAY
  } else if (key === 'rated' || key === 'calificada') {
    const [days, grade] = val.split(':').map(Number)
    p = (c) => (ctx.revlog?.get(c.id) ?? []).some((r) => dayNumber(r.ts, ctx.rolloverHour) > today - (days || 1) && (!grade || r.grade === grade))
  } else if (key === 'type' || key === 'tipo') {
    p = (c) => c.note.type === val
  } else if (key === 'front' || key === 'frente') {
    const n = normalizeText(val)
    p = (c) => normalizeText(plainText(c.note.front)).includes(n)
  } else if (key === 'back' || key === 'reverso') {
    const n = normalizeText(val)
    p = (c) => normalizeText(plainText(c.note.back)).includes(n)
  } else {
    const n = normalizeText(t).replace(/\*/g, '')
    p = (c) => normalizeText(plainText(`${c.note.front} ${c.note.back} ${c.note.extra ?? ''}`)).includes(n)
  }
  return neg ? (c) => !p(c) : p
}

/**
 * Búsqueda estilo Anki: palabras, "frases", deck:, tag:, is:new|learn|review|due|suspended|buried|leech,
 * flag:N, prop:ivl>=10, added:7, rated:3:1, spec:pediatria, negación con "-" y "or".
 */
export function compileSearch(query: string, ctx: SearchContext): Pred {
  const tokens = tokenize(query.trim())
  if (!tokens.length) return () => true
  const groups: Pred[][] = [[]]
  for (const tok of tokens) {
    if (tok.toLowerCase() === 'or' || tok.toLowerCase() === 'o') groups.push([])
    else if (tok.toLowerCase() !== 'and' && tok.toLowerCase() !== 'y') groups[groups.length - 1].push(termPredicate(tok, ctx))
  }
  const valid = groups.filter((g) => g.length)
  return (c) => valid.some((g) => g.every((p) => p(c)))
}

export const SEARCH_HELP: [string, string][] = [
  ['dengue', 'Texto en cualquier campo (sin tildes)'],
  ['"sulfato de magnesio"', 'Frase exacta'],
  ['deck:ENURM*', 'Mazo y sus submazos (* comodín)'],
  ['tag:cardio', 'Etiqueta'],
  ['is:due', 'Pendientes hoy (también new, learn, review, suspended, buried, leech)'],
  ['flag:1', 'Bandera roja (1–7)'],
  ['prop:ivl>=21', 'Intervalo ≥ 21 días (también reps, lapses, ease, due)'],
  ['rated:7:1', 'Respondidas "Otra vez" en los últimos 7 días'],
  ['added:3', 'Agregadas en los últimos 3 días'],
  ['-is:suspended', 'Negación'],
  ['tag:a or tag:b', 'Cualquiera de las dos'],
]
