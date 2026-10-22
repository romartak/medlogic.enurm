import { LINGO_ITEMS, LINGO_UNITS, type LingoItem, type LingoPart } from '@/data/lingo'
import type { WordState } from '@/store/lingo'
import { shuffle } from './utils'

/** Ejercicios de una lección de terminología. */
export type LingoExercise =
  | { kind: 'meaning'; item: LingoItem; options: string[]; answer: number; intro: boolean }
  | { kind: 'term'; item: LingoItem; options: string[]; answer: number }
  | { kind: 'part'; item: LingoItem; part: LingoPart; options: string[]; answer: number }
  | { kind: 'build'; item: LingoItem; tiles: string[] }
  | { kind: 'match'; items: LingoItem[] }

const pick = <T,>(arr: readonly T[], n: number) => shuffle(arr).slice(0, n)

/** Opciones de respuesta: la correcta y tres distractores del mismo tipo de palabra, sin repetir textos. */
function choices(correct: string, pool: string[]): { options: string[]; answer: number } {
  const distractors = pick([...new Set(pool.filter((p) => p !== correct))], 3)
  const options = shuffle([correct, ...distractors])
  return { options, answer: options.indexOf(correct) }
}

const sameKind = (item: LingoItem) => LINGO_ITEMS.filter((i) => i.kind === item.kind && i.id !== item.id)
const ALL_PARTS = [...new Map(LINGO_ITEMS.flatMap((i) => i.parts ?? []).map((p) => [p.text, p])).values()]

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
  return { kind: 'part', item, part, ...choices(part.meaning, ALL_PARTS.filter((p) => p.text !== part.text).map((p) => p.meaning)) }
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

/** Comprueba una palabra construida con fichas. */
export function isBuildCorrect(item: LingoItem, chosen: string[]): boolean {
  return chosen.join('') === item.term
}

/**
 * Una lección: primero se presentan los términos (qué significa), luego un ejercicio de parejas
 * y al final ejercicios de producción (construir la palabra, decir el término, el significado de cada parte).
 */
export function buildLesson(items: LingoItem[]): LingoExercise[] {
  const intro = items.map((i) => meaningExercise(i, true))
  const match: LingoExercise[] = items.length >= 4 ? [{ kind: 'match', items: pick(items, 4) }] : []
  const production = shuffle(items).map((i) => buildExercise(i) ?? termExercise(i))
  const parts = pick(items.filter((i) => i.parts?.length), 2)
    .map(partExercise)
    .filter((e): e is LingoExercise => e !== null)
  return [...intro, ...match, ...shuffle([...production, ...parts])].slice(0, 14)
}

/** Términos que toca repasar: vencidos primero y, si faltan, los menos dominados. */
export function dueItems(words: Record<string, WordState>, max = 8, now = Date.now()): LingoItem[] {
  const seen = LINGO_ITEMS.filter((i) => words[i.id])
  const due = seen.filter((i) => words[i.id].due <= now).sort((a, b) => words[a.id].strength - words[b.id].strength)
  return due.slice(0, max)
}

export function reviewSession(items: LingoItem[]): LingoExercise[] {
  return shuffle(items).map((i) => {
    const r = Math.random()
    return (r < 0.4 ? buildExercise(i) : null) ?? (r < 0.7 ? termExercise(i) : meaningExercise(i))
  })
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
  }
}

export const TOTAL_LESSONS = LINGO_UNITS.reduce((a, u) => a + u.lessons.length, 0)

/* ---------- Pronunciación ---------- */

let voicesCache: SpeechSynthesisVoice[] = []

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  const all = window.speechSynthesis.getVoices()
  if (all.length) voicesCache = all
  return voicesCache
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices()
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices)
}

/** Puntúa una voz: primero las naturales/mejoradas y las de español latino (más cercano al dominicano). */
function voiceScore(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase()
  const lang = v.lang.toLowerCase().replace('_', '-')
  let score = 0
  if (/natural|neural|premium|enhanced|mejorad|online/.test(name)) score += 40
  if (/google/.test(name)) score += 25
  if (/paulina|mónica|monica|marisol|jorge|juan|diego|francisca|helena|dalia|elvira|sabina|siri/.test(name)) score += 15
  if (/^es-(mx|us|419|do|co|ar|cl|pe|ve)/.test(lang)) score += 12
  else if (lang.startsWith('es-es')) score += 8
  if (/compact|eloquence|novelty|grandma|grandpa|bubbles|bad news|whisper/.test(name)) score -= 50
  return score
}

/** Voces en español disponibles en este dispositivo, de mejor a peor. */
export function spanishVoices(): SpeechSynthesisVoice[] {
  return loadVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('es'))
    .sort((a, b) => voiceScore(b) - voiceScore(a))
}

/** Texto que se pronuncia: sin guiones de prefijo/sufijo («-itis» → «itis», «a-, an-» → «a, an»). */
export function spokenText(term: string): string {
  return term
    .replace(/(^|\s|,)-/g, '$1')
    .replace(/-(,|\s|$)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Pronuncia un término con la mejor voz en español del dispositivo (o la elegida). */
export function speak(text: string, voiceURI?: string | null) {
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(spokenText(text))
    const voices = spanishVoices()
    const voice = (voiceURI && voices.find((v) => v.voiceURI === voiceURI)) || voices[0]
    if (voice) {
      u.voice = voice
      u.lang = voice.lang
    } else u.lang = 'es-MX'
    u.rate = 0.92
    u.pitch = 1
    synth.speak(u)
  } catch {
    /* sin voz disponible */
  }
}

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window
