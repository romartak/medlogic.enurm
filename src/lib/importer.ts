import Papa from 'papaparse'
import type { Question } from '@/types'
import { normalizeText, resolveSpecialtyId } from '@/data/specialties'
import { hashString, LETTERS } from './utils'

/**
 * Convierte cualquier base de datos de preguntas (JSON o CSV, con encabezados en español o inglés)
 * al formato interno `Question`. Ver docs/FORMATO_PREGUNTAS.md.
 */

export interface ImportIssue {
  row: number
  message: string
}

export interface ImportResult {
  questions: Question[]
  errors: ImportIssue[]
  warnings: ImportIssue[]
  /** true si se detectó que las respuestas numéricas empiezan en 1. */
  oneBased: boolean
}

export interface ImportOptions {
  /** Fuerza la interpretación de respuestas numéricas: 0 = índice desde 0, 1 = desde 1. */
  answerBase?: 0 | 1 | 'auto'
}

type Row = Record<string, unknown>

/** "Opción A" → "opciona", "Año" → "ano". */
function compactKey(k: string): string {
  return normalizeText(k).replace(/[^a-z0-9]/g, '')
}

const FIELD_KEYS = {
  id: ['id', 'codigo', 'code', 'numero', 'nro', 'num', 'uid'],
  year: ['year', 'ano', 'anio', 'periodo', 'convocatoria', 'examen'],
  specialty: ['specialty', 'especialidad', 'area', 'materia', 'categoria', 'category', 'asignatura', 'subject'],
  topic: ['topic', 'tema', 'subtema', 'subtopic', 'capitulo'],
  stem: ['stem', 'pregunta', 'enunciado', 'question', 'texto', 'caso', 'planteamiento'],
  options: ['options', 'opciones', 'choices', 'alternativas', 'respuestas'],
  answer: ['answer', 'respuesta', 'correcta', 'correct', 'respuestacorrecta', 'correctanswer', 'clave', 'solucion'],
  explanation: ['explanation', 'explicacion', 'justificacion', 'comentario', 'feedback', 'retroalimentacion', 'razonamiento'],
  reference: ['reference', 'referencia', 'bibliografia', 'fuente', 'source'],
  difficulty: ['difficulty', 'dificultad', 'nivel'],
  tags: ['tags', 'etiquetas', 'palabrasclave', 'keywords'],
  image: ['image', 'imagen', 'img', 'imageurl'],
} as const

type Field = keyof typeof FIELD_KEYS

function buildKeyMap(row: Row): Map<string, string> {
  const map = new Map<string, string>()
  for (const key of Object.keys(row)) map.set(compactKey(key), key)
  return map
}

function pick(row: Row, keyMap: Map<string, string>, field: Field): unknown {
  for (const k of FIELD_KEYS[field]) {
    const real = keyMap.get(k)
    if (real !== undefined && row[real] !== undefined && row[real] !== null && String(row[real]).trim() !== '') return row[real]
  }
  return undefined
}

/** Busca columnas tipo option_a, opcionB, "Opción C", a, b, c… */
function collectOptionColumns(row: Row, keyMap: Map<string, string>): string[] {
  const out: string[] = []
  for (let i = 0; i < 6; i++) {
    const L = LETTERS[i].toLowerCase()
    const n = String(i + 1)
    const candidates = [`option${L}`, `opcion${L}`, `opt${L}`, `alternativa${L}`, `inciso${L}`, `respuesta${L}`, `choice${L}`, L, `option${n}`, `opcion${n}`, `alternativa${n}`]
    let val: unknown
    for (const c of candidates) {
      const real = keyMap.get(c)
      if (real !== undefined) {
        val = row[real]
        break
      }
    }
    if (val === undefined || val === null || String(val).trim() === '') {
      if (out.length > 0) break
      continue
    }
    out.push(String(val).trim())
  }
  return out
}

/** Quita prefijos como "a) ", "B. ", "(c) " de una opción. */
function stripLetterPrefix(s: string): string {
  return s.replace(/^\s*\(?[a-fA-F][).:-]\s+/, '').trim()
}

const OPTION_TEXT_KEYS = ['text', 'texto', 'option', 'opcion', 'label', 'value', 'contenido']
const OPTION_CORRECT_KEYS = ['correct', 'correcta', 'iscorrect', 'escorrecta', 'right']

function optionText(o: unknown): string {
  if (o && typeof o === 'object') {
    const km = buildKeyMap(o as Row)
    for (const k of OPTION_TEXT_KEYS) {
      const real = km.get(k)
      if (real !== undefined) return String((o as Row)[real])
    }
  }
  return String(o)
}

/** Opciones con forma [{ text, correct: true }]: devuelve el índice marcado como correcto. */
function correctFromOptionObjects(raw: unknown): number | undefined {
  if (!Array.isArray(raw)) return undefined
  const idx = raw.findIndex((o) => {
    if (!o || typeof o !== 'object') return false
    const km = buildKeyMap(o as Row)
    return OPTION_CORRECT_KEYS.some((k) => {
      const real = km.get(k)
      const v = real === undefined ? undefined : (o as Row)[real]
      return v === true || v === 'true' || v === 1 || v === '1' || v === 'si' || v === 'sí'
    })
  })
  return idx >= 0 ? idx : undefined
}

function parseOptions(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((o) => stripLetterPrefix(optionText(o))).filter(Boolean)
  if (raw && typeof raw === 'object') return Object.values(raw as Record<string, unknown>).map((o) => stripLetterPrefix(String(o))).filter(Boolean)
  if (typeof raw === 'string') {
    const s = raw.trim()
    if (s.startsWith('[')) {
      try {
        return parseOptions(JSON.parse(s))
      } catch {
        /* sigue con otros formatos */
      }
    }
    const parts = s.includes('|') ? s.split('|') : s.split(/\n|;(?=\s*[a-fA-F][).])/)
    return parts.map(stripLetterPrefix).filter(Boolean)
  }
  return []
}

interface RawAnswer {
  kind: 'letter' | 'number' | 'text'
  value: string | number
}

function parseAnswerRaw(raw: unknown): RawAnswer | undefined {
  if (raw === undefined || raw === null) return undefined
  if (typeof raw === 'number') return { kind: 'number', value: raw }
  const s = String(raw).trim()
  if (/^\(?[a-fA-F][).]?$/.test(s)) return { kind: 'letter', value: s.replace(/[^a-fA-F]/g, '').toUpperCase() }
  if (/^\d+$/.test(s)) return { kind: 'number', value: Number(s) }
  return { kind: 'text', value: s }
}

function resolveAnswer(a: RawAnswer, options: string[], oneBased: boolean): number {
  if (a.kind === 'letter') return LETTERS.indexOf(String(a.value))
  if (a.kind === 'number') return Number(a.value) - (oneBased ? 1 : 0)
  const target = normalizeText(stripLetterPrefix(String(a.value)))
  return options.findIndex((o) => normalizeText(o) === target)
}

function parseYear(raw: unknown): number | undefined {
  if (raw === undefined) return undefined
  const m = String(raw).match(/(19|20)\d{2}/)
  return m ? Number(m[0]) : undefined
}

function parseDifficulty(raw: unknown): 1 | 2 | 3 | undefined {
  if (raw === undefined) return undefined
  const s = normalizeText(String(raw))
  if (['1', 'facil', 'baja', 'easy', 'low'].includes(s)) return 1
  if (['2', 'media', 'medio', 'intermedia', 'medium', 'moderada'].includes(s)) return 2
  if (['3', 'dificil', 'alta', 'hard', 'high'].includes(s)) return 3
  return undefined
}

function parseTags(raw: unknown): string[] | undefined {
  if (raw === undefined) return undefined
  const list = Array.isArray(raw) ? raw.map(String) : String(raw).split(/[,;|]/)
  const tags = list.map((t) => t.trim()).filter(Boolean)
  return tags.length ? tags : undefined
}

/** Extrae el arreglo de filas de un JSON con formas habituales. */
function rowsFromJson(data: unknown): Row[] {
  if (Array.isArray(data)) return data as Row[]
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    for (const k of ['questions', 'preguntas', 'items', 'data', 'banco']) {
      if (Array.isArray(obj[k])) return obj[k] as Row[]
    }
    // { "2019": [...], "2020": [...] } → añade el año a cada fila.
    const rows: Row[] = []
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v)) for (const r of v) rows.push({ year: k, ...(r as Row) })
    }
    if (rows.length) return rows
  }
  throw new Error('El JSON debe ser un arreglo de preguntas o un objeto con la clave "questions".')
}

export function rowsFromCsv(text: string): Row[] {
  const res = Papa.parse<Row>(text.replace(/^﻿/, ''), { header: true, skipEmptyLines: 'greedy', dynamicTyping: false })
  if (res.errors.length && !res.data.length) throw new Error(`CSV inválido: ${res.errors[0].message}`)
  return res.data
}

export function normalizeRows(rows: Row[], opts: ImportOptions = {}): ImportResult {
  const errors: ImportIssue[] = []
  const warnings: ImportIssue[] = []

  const prepared = rows.map((row, i) => {
    const keyMap = buildKeyMap(row)
    const rawOptions = pick(row, keyMap, 'options')
    let options = parseOptions(rawOptions)
    if (options.length === 0) options = collectOptionColumns(row, keyMap)
    let answer = parseAnswerRaw(pick(row, keyMap, 'answer'))
    const flagged = correctFromOptionObjects(rawOptions)
    if (!answer && flagged !== undefined) answer = { kind: 'letter', value: LETTERS[flagged] }
    return { row, i, keyMap, options, answer }
  })

  // Detecta si las respuestas numéricas empiezan en 1 (lo habitual en hojas de cálculo).
  let oneBased: boolean
  if (opts.answerBase === 0 || opts.answerBase === 1) {
    oneBased = opts.answerBase === 1
  } else {
    const nums = prepared.filter((p) => p.answer?.kind === 'number')
    const anyZero = nums.some((p) => p.answer!.value === 0)
    const anyAtLength = nums.some((p) => p.answer!.value === p.options.length)
    oneBased = nums.length > 0 && !anyZero && (anyAtLength || nums.length >= 20)
  }

  const seen = new Set<string>()
  const questions: Question[] = []

  for (const { row, i, keyMap, options, answer } of prepared) {
    const rowNum = i + 1
    const stemRaw = pick(row, keyMap, 'stem')
    const stem = stemRaw === undefined ? '' : String(stemRaw).trim()
    if (!stem) {
      errors.push({ row: rowNum, message: 'Falta el enunciado de la pregunta.' })
      continue
    }
    if (options.length < 2) {
      errors.push({ row: rowNum, message: 'La pregunta necesita al menos 2 opciones.' })
      continue
    }
    if (!answer) {
      errors.push({ row: rowNum, message: 'Falta la respuesta correcta.' })
      continue
    }
    const idx = resolveAnswer(answer, options, oneBased)
    if (idx < 0 || idx >= options.length) {
      errors.push({ row: rowNum, message: `Respuesta "${answer.value}" no coincide con ninguna opción.` })
      continue
    }

    const year = parseYear(pick(row, keyMap, 'year'))
    const specialtyRaw = pick(row, keyMap, 'specialty')
    if (specialtyRaw === undefined) warnings.push({ row: rowNum, message: 'Sin especialidad: se asignó Medicina Interna.' })

    let id = pick(row, keyMap, 'id') !== undefined ? String(pick(row, keyMap, 'id')).trim() : `${year ?? 'q'}-${hashString(stem)}`
    if (seen.has(id)) {
      warnings.push({ row: rowNum, message: `Id duplicado "${id}": se renombró.` })
      let n = 2
      while (seen.has(`${id}-${n}`)) n++
      id = `${id}-${n}`
    }
    seen.add(id)

    const str = (f: Field) => {
      const v = pick(row, keyMap, f)
      return v === undefined ? undefined : String(v).trim()
    }

    questions.push({
      id,
      year,
      specialty: resolveSpecialtyId(specialtyRaw === undefined ? undefined : String(specialtyRaw)),
      topic: str('topic'),
      stem,
      options,
      answer: idx,
      explanation: str('explanation'),
      reference: str('reference'),
      difficulty: parseDifficulty(pick(row, keyMap, 'difficulty')),
      tags: parseTags(pick(row, keyMap, 'tags')),
      image: str('image'),
    })
  }

  return { questions, errors, warnings, oneBased }
}

/** Punto de entrada: detecta JSON o CSV por el nombre o el contenido. */
export function parseQuestionFile(text: string, fileName = '', opts: ImportOptions = {}): ImportResult {
  const trimmed = text.trim()
  const looksJson = fileName.toLowerCase().endsWith('.json') || trimmed.startsWith('[') || trimmed.startsWith('{')
  const rows = looksJson ? rowsFromJson(JSON.parse(trimmed)) : rowsFromCsv(text)
  return normalizeRows(rows, opts)
}

export const CSV_TEMPLATE = [
  'id,year,specialty,topic,stem,option_a,option_b,option_c,option_d,answer,explanation,reference,difficulty,tags',
  '2019-001,2019,Pediatría,Bronquiolitis,"¿Cuál es el agente más frecuente de la bronquiolitis?",Adenovirus,Virus sincitial respiratorio,Rinovirus,Mycoplasma,B,"El VSR causa la mayoría de los casos.",Nelson 21.ª ed.,1,respiratorio;lactantes',
].join('\n')

export const JSON_TEMPLATE = JSON.stringify(
  [
    {
      id: '2019-001',
      year: 2019,
      specialty: 'Pediatría',
      topic: 'Bronquiolitis',
      stem: '¿Cuál es el agente más frecuente de la bronquiolitis?',
      options: ['Adenovirus', 'Virus sincitial respiratorio', 'Rinovirus', 'Mycoplasma'],
      answer: 'B',
      explanation: 'El VSR causa la mayoría de los casos.',
      reference: 'Nelson 21.ª ed.',
      difficulty: 1,
      tags: ['respiratorio', 'lactantes'],
    },
  ],
  null,
  2,
)
