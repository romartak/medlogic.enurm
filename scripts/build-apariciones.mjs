/**
 * Calcula en qué exámenes salió cada pregunta del banco publicado y lo guarda en data/banco/apariciones.json.
 *
 *   node scripts/build-apariciones.mjs && node scripts/build-bank.mjs
 *
 * Usa dos fuentes que se suman:
 *   1. data/enurm-2002-2024/enurm-2002-2024-por-anio.json: la recopilación de los 28 exámenes (2002-2024), con las
 *      preguntas agrupadas por parecido de texto. Cada pregunta de MedLogic lleva su `id_medlogic`; sus exámenes son
 *      los de todas las entradas de su grupo.
 *   2. Las repeticiones «de concepto» que la revisión retiró (`drop: "Repetida: es la misma pregunta que Q10_4…"` en
 *      data/banco/revision): cada una cuenta como una aparición más de la que se conservó. Su examen se ubica con
 *      `retirada_en_medlogic` del mismo archivo; si no está, se cuenta igual pero sin año.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const doc = JSON.parse(readFileSync(join(ROOT, 'data/enurm-2002-2024/enurm-2002-2024-por-anio.json'), 'utf8'))

// Entradas del documento con el examen al que pertenecen ("2008", "2021-A"…).
const entries = Object.entries(doc.examenes).flatMap(([examen, list]) => list.map((e) => ({ ...e, examen })))
const examsOfGroup = new Map()
for (const e of entries) {
  if (!examsOfGroup.has(e.grupo)) examsOfGroup.set(e.grupo, new Set())
  examsOfGroup.get(e.grupo).add(e.examen)
}

// Preguntas del banco publicado → exámenes de su grupo.
const out = new Map() // id publicado (bq-3_7) → { exams:Set, unplaced:number }
const slot = (id) => {
  if (!out.has(id)) out.set(id, { exams: new Set(), unplaced: 0 })
  return out.get(id)
}
for (const e of entries) {
  if (!e.id_medlogic) continue
  for (const x of examsOfGroup.get(e.grupo)) slot(e.id_medlogic).exams.add(x)
}

// Preguntas nuevas de la recopilación (todavía sin publicar): se calculan igual para que, al revisarse, ya traigan sus años.
const nuevas = JSON.parse(readFileSync(join(ROOT, 'data/enurm-2002-2024/nuevas-para-medlogic.json'), 'utf8'))
for (const q of nuevas) for (const x of examsOfGroup.get(q.grupo) ?? []) slot(`bq-${q.id.slice(6)}`).exams.add(x)

// Repeticiones de concepto que se retiraron en la revisión.
const dir = join(ROOT, 'data/banco/revision')
const reviews = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
const repeatOf = new Map()
for (const r of reviews) {
  if (!r.drop || !/^Repetida/i.test(r.drop)) continue
  const target = (r.drop.match(/\bQ\d+_\d+\b/g) ?? []).find((id) => id !== r.id)
  if (target) repeatOf.set(r.id, target)
}
const rootOf = (id, trail = new Set()) => {
  const next = repeatOf.get(id)
  return !next || trail.has(next) ? id : rootOf(next, trail.add(id))
}
const placed = new Map() // id original retirado (Q112_3) → examen donde salió
for (const e of entries) if (e.retirada_en_medlogic) placed.set(e.retirada_en_medlogic, e.examen)
for (const id of repeatOf.keys()) {
  const kept = `bq-${rootOf(id).slice(1)}`
  const s = slot(kept)
  const examen = placed.get(id)
  if (examen) s.exams.add(examen)
  else s.unplaced++
}

const examOrder = (a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b)
const json = Object.fromEntries(
  [...out.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true }))
    .map(([id, s]) => [id, { examenes: [...s.exams].sort(examOrder), ...(s.unplaced ? { sinUbicar: s.unplaced } : {}) }]),
)
writeFileSync(join(ROOT, 'data/banco/apariciones.json'), JSON.stringify(json, null, 0) + '\n')
const dist = {}
for (const v of Object.values(json)) {
  const n = v.examenes.length + (v.sinUbicar ?? 0)
  dist[n] = (dist[n] ?? 0) + 1
}
console.log(`✓ ${Object.keys(json).length} preguntas con exámenes conocidos · apariciones por pregunta:`, dist)
console.log(`  exámenes en el documento: ${Object.keys(doc.examenes).length} · repeticiones retiradas ubicadas: ${[...repeatOf.keys()].filter((i) => placed.has(i)).length} de ${repeatOf.size}`)
