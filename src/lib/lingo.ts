import { confusable, LINGO_BY_ID, LINGO_ITEMS, LINGO_UNITS, type LingoItem, type LingoPart } from '@/data/lingo'
import type { WordState } from '@/store/lingo'
import { shuffle } from './utils'

/** Ejercicios de una lección de terminología. */
export type LingoExercise =
  | { kind: 'meaning'; item: LingoItem; options: string[]; answer: number; intro: boolean }
  | { kind: 'term'; item: LingoItem; options: string[]; answer: number }
  | { kind: 'part'; item: LingoItem; part: LingoPart; options: string[]; answer: number }
  | { kind: 'build'; item: LingoItem; tiles: string[] }
  | { kind: 'match'; items: LingoItem[] }
  /** ¿Verdadero o falso? «hepatomegalia» significa «…». */
  | { kind: 'truefalse'; item: LingoItem; statement: string; options: string[]; answer: number }
  /** Completar un caso clínico con el término. */
  | { kind: 'context'; item: LingoItem; options: string[]; answer: number }
  /** Lo contrario: hiperglucemia ↔ hipoglucemia. */
  | { kind: 'opposite'; item: LingoItem; options: string[]; answer: number }
  /** Qué palabra contiene la parte que significa «riñón». */
  | { kind: 'find'; item: LingoItem; part: LingoPart; options: string[]; answer: number }

const pick = <T,>(arr: readonly T[], n: number) => shuffle(arr).slice(0, n)

const STOP = new Set(['del', 'las', 'los', 'con', 'por', 'una', 'que', 'para', 'muy', 'más', 'mas', 'tras'])
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
/** Palabras con contenido de un significado, para no ofrecer como distractor algo que también sería correcto. */
const keywords = (s: string) => new Set(norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !STOP.has(w)))
const overlaps = (a: string, b: string) => {
  const kb = keywords(b)
  return [...keywords(a)].some((w) => kb.has(w))
}
/** En prefijos, sufijos y raíces los significados son cortos y se pisan (sub- y infra- = debajo): se comparan por palabras. */
const tooClose = (item: LingoItem, other: LingoItem) =>
  other.id === item.id ||
  other.term === item.term ||
  other.meaning === item.meaning ||
  confusable(item.id, other.id) ||
  (item.kind !== 'término' && item.kind !== 'sigla' && overlaps(item.meaning, other.meaning))

/** Opciones de respuesta: la correcta y tres distractores sin repetir textos. */
function choices(correct: string, pool: string[]): { options: string[]; answer: number } {
  const distractors = pick([...new Set(pool.filter((p) => p !== correct))], 3)
  const options = shuffle([correct, ...distractors])
  return { options, answer: options.indexOf(correct) }
}

const sameKind = (item: LingoItem) => LINGO_ITEMS.filter((i) => i.kind === item.kind && !tooClose(item, i))
const ALL_PARTS = [...new Map(LINGO_ITEMS.flatMap((i) => i.parts ?? []).map((p) => [p.text, p])).values()]
const UNIT_OF = new Map(LINGO_UNITS.flatMap((u) => u.lessons.flatMap((l) => l.items.map((id) => [id, u.id] as const))))

export function meaningExercise(item: LingoItem, intro = false): LingoExercise {
  return { kind: 'meaning', item, intro, ...choices(item.meaning, sameKind(item).map((i) => i.meaning)) }
}

export function termExercise(item: LingoItem): LingoExercise {
  return { kind: 'term', item, ...choices(item.term, sameKind(item).map((i) => i.term)) }
}

export function partExercise(item: LingoItem): LingoExercise | null {
  const parts = item.parts?.filter((p) => p.meaning) ?? []
  if (!parts.length) return null
  const part = parts[Math.floor(Math.random() * parts.length)]
  const pool = ALL_PARTS.filter((p) => p.text !== part.text && !overlaps(p.meaning, part.meaning)).map((p) => p.meaning)
  return { kind: 'part', item, part, ...choices(part.meaning, pool) }
}

export function buildExercise(item: LingoItem): LingoExercise | null {
  if (!item.parts || item.parts.length < 2) return null
  const own = item.parts.map((p) => p.text)
  const extra = pick(
    ALL_PARTS.map((p) => p.text).filter((t) => !own.includes(t)),
    own.length >= 3 ? 2 : 3,
  )
  return { kind: 'build', item, tiles: shuffle([...own, ...extra]) }
}

/** La mitad de las veces la frase es cierta; si no, lleva el significado de otra palabra del mismo tipo. */
export function trueFalseExercise(item: LingoItem): LingoExercise {
  const options = ['Verdadero', 'Falso']
  const others = sameKind(item)
  const wrong = others.length ? others[Math.floor(Math.random() * others.length)] : null
  if (!wrong || Math.random() < 0.5) return { kind: 'truefalse', item, statement: item.meaning, options, answer: 0 }
  return { kind: 'truefalse', item, statement: wrong.meaning, options, answer: 1 }
}

/** Distractores de un caso clínico: de la misma unidad cuando se puede, sin piezas ni significados en común con la respuesta. */
export function contextExercise(item: LingoItem): LingoExercise | null {
  if (!item.context) return null
  const own = item.parts ?? []
  const clash = (o: LingoItem) =>
    tooClose(item, o) ||
    o.id === item.opposite ||
    (o.parts ?? []).some((p) => own.some((q) => q.text === p.text || overlaps(q.meaning, p.meaning)))
  const candidates = LINGO_ITEMS.filter((o) => o.kind === item.kind && !clash(o))
  const sameUnit = candidates.filter((o) => UNIT_OF.get(o.id) === UNIT_OF.get(item.id))
  const pool = (sameUnit.length >= 3 ? sameUnit : candidates).map((o) => o.term)
  return { kind: 'context', item, ...choices(item.term, pool) }
}

export function oppositeExercise(item: LingoItem): LingoExercise | null {
  const opposite = item.opposite && LINGO_BY_ID.get(item.opposite)
  if (!opposite) return null
  const pool = sameKind(item).filter((o) => o.id !== opposite.id && !tooClose(opposite, o)).map((o) => o.term)
  return { kind: 'opposite', item, ...choices(opposite.term, pool) }
}

/** «¿Cuál de estas palabras habla del riñón?»: la respuesta tiene esa pieza; los distractores, ninguna parecida. */
export function findExercise(item: LingoItem): LingoExercise | null {
  const parts = item.parts?.filter((p) => p.meaning) ?? []
  if (!parts.length) return null
  const part = parts[Math.floor(Math.random() * parts.length)]
  const pool = LINGO_ITEMS.filter(
    (o) => o.kind === 'término' && o.parts?.length && o.id !== item.id && !o.parts.some((p) => p.text === part.text || overlaps(p.meaning, part.meaning)),
  ).map((o) => o.term)
  return { kind: 'find', item, part, ...choices(item.term, pool) }
}

/** Comprueba una palabra construida con fichas. */
export function isBuildCorrect(item: LingoItem, chosen: string[]): boolean {
  return chosen.join('') === item.term
}

/** Un ejercicio de producción para practicar una palabra, variando la forma. */
function practice(item: LingoItem): LingoExercise {
  const options = [buildExercise(item), buildExercise(item), contextExercise(item), contextExercise(item), oppositeExercise(item), trueFalseExercise(item), termExercise(item)].filter(
    (e): e is LingoExercise => e !== null,
  )
  return options[Math.floor(Math.random() * options.length)]
}

/**
 * Una lección: primero se presentan los términos (qué significa), luego un ejercicio de parejas
 * y al final ejercicios variados: construir la palabra, completar un caso clínico, lo contrario,
 * verdadero o falso, decir el término y el significado de cada parte.
 */
export function buildLesson(items: LingoItem[]): LingoExercise[] {
  const intro = items.map((i) => meaningExercise(i, true))
  const match: LingoExercise[] = items.length >= 4 ? [{ kind: 'match', items: pick(items, 4) }] : []
  const production = shuffle(items).map(practice)
  const withParts = pick(items.filter((i) => i.parts?.length), 2)
  const parts = withParts.map((i, n) => (n === 0 ? partExercise(i) : findExercise(i))).filter((e): e is LingoExercise => e !== null)
  return [...intro, ...match, ...shuffle([...production, ...parts])].slice(0, 16)
}

/** Términos que toca repasar: vencidos primero y, si faltan, los menos dominados. */
export function dueItems(words: Record<string, WordState>, max = 8, now = Date.now()): LingoItem[] {
  const seen = LINGO_ITEMS.filter((i) => words[i.id])
  const due = seen.filter((i) => words[i.id].due <= now).sort((a, b) => words[a.id].strength - words[b.id].strength)
  return due.slice(0, max)
}

export function reviewSession(items: LingoItem[]): LingoExercise[] {
  return shuffle(items).map((i) => (Math.random() < 0.25 ? meaningExercise(i) : practice(i)))
}

/* ---------- Reto relámpago ---------- */

/** Palabras para el reto: las de las lecciones ya hechas; si aún son pocas, las de las primeras lecciones. */
export function blitzPool(done: Record<string, unknown>): LingoItem[] {
  const ids = new Set(LINGO_UNITS.flatMap((u) => u.lessons.filter((l) => done[l.id]).flatMap((l) => l.items)))
  if (ids.size < 12) for (const l of LINGO_UNITS.flatMap((u) => u.lessons).slice(0, 3)) for (const id of l.items) ids.add(id)
  return [...ids].map((id) => LINGO_BY_ID.get(id)!).filter(Boolean)
}

/** Preguntas rápidas de una sola respuesta (sin construir ni emparejar). */
export function blitzQuestion(pool: LingoItem[]): LingoExercise {
  const item = pool[Math.floor(Math.random() * pool.length)]
  const r = Math.random()
  if (r < 0.3) return trueFalseExercise(item)
  if (r < 0.5) return contextExercise(item) ?? termExercise(item)
  if (r < 0.75) return meaningExercise(item)
  return termExercise(item)
}

/** Texto de la respuesta correcta, para la hoja de retroalimentación. */
export function correctAnswerText(ex: LingoExercise): string {
  switch (ex.kind) {
    case 'meaning':
      return ex.item.meaning
    case 'term':
      return ex.item.term
    case 'part':
      return ex.part.meaning
    case 'build':
      return ex.item.term
    case 'match':
      return ''
    default:
      return ex.options[ex.answer]
  }
}

export const TOTAL_LESSONS = LINGO_UNITS.reduce((a, u) => a + u.lessons.length, 0)
