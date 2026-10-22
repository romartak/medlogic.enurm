/**
 * Convierte una base de datos de preguntas (CSV o JSON) al banco oficial que se publica con la web:
 *   npm run import:questions -- ruta/al/archivo.csv [--base 0|1] [--merge]
 *
 * Escribe public/data/questions.json. Con --merge combina con el contenido existente (por id).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { normalizeRows, parseQuestionFile } from '../src/lib/importer'
import { getSpecialty } from '../src/data/specialties'
import type { Question } from '../src/types'

const args = process.argv.slice(2)
const files = args.filter((a) => !a.startsWith('--') && !/^[01]$/.test(a))
const baseIdx = args.indexOf('--base')
const answerBase = baseIdx >= 0 ? (Number(args[baseIdx + 1]) as 0 | 1) : 'auto'
const merge = args.includes('--merge')
const OUT = resolve(import.meta.dirname ?? '.', '../public/data/questions.json')

if (!files.length) {
  console.error('Uso: npm run import:questions -- archivo.csv|archivo.json [más archivos] [--base 0|1] [--merge]')
  process.exit(1)
}

let all: Question[] = []
if (merge && existsSync(OUT)) all = normalizeRows(JSON.parse(readFileSync(OUT, 'utf8'))).questions

let totalErrors = 0
for (const f of files) {
  const text = readFileSync(f, 'utf8')
  const r = parseQuestionFile(text, f, { answerBase })
  totalErrors += r.errors.length
  console.log(`\n${f}: ${r.questions.length} válidas · ${r.errors.length} con errores · ${r.warnings.length} advertencias${r.oneBased ? ' · respuestas numéricas desde 1' : ''}`)
  for (const e of r.errors.slice(0, 30)) console.log(`  ✗ fila ${e.row}: ${e.message}`)
  if (r.errors.length > 30) console.log(`  … y ${r.errors.length - 30} errores más`)
  for (const w of r.warnings.slice(0, 10)) console.log(`  ! fila ${w.row}: ${w.message}`)
  all = all.concat(r.questions)
}

// Deduplica por id (la última versión gana).
const byId = new Map(all.map((q) => [q.id, q]))
const questions = [...byId.values()].sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.id.localeCompare(b.id, 'es', { numeric: true }))

// Quita campos vacíos para que el archivo sea más liviano.
const clean = questions.map((q) => Object.fromEntries(Object.entries(q).filter(([, v]) => v !== undefined && v !== '')))
writeFileSync(OUT, JSON.stringify(clean))

const bySpec: Record<string, number> = {}
const byYear: Record<string, number> = {}
for (const q of questions) {
  bySpec[getSpecialty(q.specialty).name] = (bySpec[getSpecialty(q.specialty).name] ?? 0) + 1
  byYear[q.year ?? 'sin año'] = (byYear[q.year ?? 'sin año'] ?? 0) + 1
}
console.log(`\n✓ ${questions.length} preguntas guardadas en public/data/questions.json`)
console.table(byYear)
console.table(bySpec)
if (totalErrors) console.log(`\nAtención: ${totalErrors} filas no se importaron (ver arriba).`)
