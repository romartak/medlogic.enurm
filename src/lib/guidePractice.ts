import type { Guide } from '@/types'
import type { Note } from '@/lib/anki/types'
import { shuffle } from './utils'

/**
 * Práctica generada a partir de la propia guía, para que cualquier guía nueva tenga su repaso:
 * - de cada tabla: «¿qué corresponde a X en la columna Y?» con las demás filas como distractores;
 * - de las listas: «¿en qué apartado va esto?» con los títulos de la guía como opciones;
 * - de las perlas y alertas: tarjetas para recordar sin mirar.
 */
export type GuideQuestion =
  | { kind: 'choice'; prompt: string; context: string; options: string[]; answer: number }
  | { kind: 'recall'; prompt: string; context: string; answer: string }

const MAX_OPTION = 160
const EMPTY = /^\s*[—–-]?\s*$/

export function guideQuestions(guide: Guide, max = 10): GuideQuestion[] {
  const choice: GuideQuestion[] = []
  const recall: GuideQuestion[] = []

  for (const sec of guide.sections) {
    const t = sec.table
    if (t && t.rows.length >= 3) {
      for (const row of t.rows) {
        for (let c = 1; c < t.head.length; c++) {
          const correct = row[c]
          if (!correct || EMPTY.test(correct) || correct.length > MAX_OPTION) continue
          const others = [...new Set(t.rows.filter((r) => r !== row).map((r) => r[c]).filter((v) => v && !EMPTY.test(v) && v !== correct))]
          if (others.length < 2) continue
          const options = shuffle([correct, ...shuffle(others).slice(0, 3)])
          choice.push({ kind: 'choice', context: sec.heading, prompt: `En la fila de «${row[0]}», ¿qué va en «${t.head[c]}»?`, options, answer: options.indexOf(correct) })
        }
      }
    }
  }

  // Apartados con lista: ¿a cuál pertenece cada viñeta?
  const listed = guide.sections.filter((s) => s.bullets?.length)
  if (listed.length >= 2) {
    for (const sec of listed) {
      for (const b of shuffle(sec.bullets!).slice(0, 2)) {
        if (b.length > MAX_OPTION) continue
        const options = shuffle(listed.map((s) => s.heading)).slice(0, 4)
        if (!options.includes(sec.heading)) options[0] = sec.heading
        const opts = shuffle(options)
        choice.push({ kind: 'choice', context: 'Ubica el dato', prompt: `«${b}» ¿En qué apartado de la guía va?`, options: opts, answer: opts.indexOf(sec.heading) })
      }
    }
  }

  for (const sec of guide.sections) {
    if (sec.pearl) recall.push({ kind: 'recall', context: sec.heading, prompt: `Perla ENURM de «${sec.heading}»: ¿la recuerdas?`, answer: sec.pearl })
    if (sec.warning) recall.push({ kind: 'recall', context: sec.heading, prompt: `¿Qué alerta da la guía en «${sec.heading}»?`, answer: sec.warning })
  }

  const picked = shuffle(choice).slice(0, Math.max(max - Math.min(3, recall.length), 0))
  return [...picked, ...shuffle(recall).slice(0, max - picked.length)]
}

/** Notas de flashcards (formato Anki) para estudiar la guía con repetición espaciada. */
export function guideNotes(guide: Guide, deckId: string, specialty: string, now = Date.now()): Note[] {
  const notes: Note[] = []
  const tag = `guia::${guide.id}`
  const add = (key: string, front: string, back: string) =>
    notes.push({ id: `guia-${guide.id}-${key}`, deckId, type: 'basic', front, back, tags: [tag], specialty, createdAt: now + notes.length, modifiedAt: now, source: 'user' })
  guide.sections.forEach((sec, si) => {
    const t = sec.table
    if (t) t.rows.forEach((row, ri) => add(`t${si}-${ri}`, `<b>${sec.heading}</b><br>${t.head[0]}: ${row[0]}`, t.head.slice(1).map((h, c) => `<b>${h}:</b> ${row[c + 1]}`).join('<br>')))
    if (sec.bullets && sec.bullets.length <= 8) add(`b${si}`, `${guide.title}<br><b>${sec.heading}</b>: ¿cuáles son?`, `<ul>${sec.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`)
    if (sec.pearl) add(`p${si}`, `Perla ENURM: <b>${sec.heading}</b>`, sec.pearl)
    if (sec.warning) add(`w${si}`, `Alerta: <b>${sec.heading}</b>`, sec.warning)
  })
  return notes
}
