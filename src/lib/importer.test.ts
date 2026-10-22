import { describe, expect, it } from 'vitest'
import { normalizeRows, parseQuestionFile } from './importer'

describe('importador de preguntas', () => {
  it('lee CSV con encabezados en español y respuesta en letra', () => {
    const csv = 'Año,Especialidad,Pregunta,Opción A,Opción B,Opción C,Respuesta,Explicación\n2019,Gineco-Obstetricia,¿Pregunta?,Uno,Dos,Tres,B,Porque sí'
    const r = parseQuestionFile(csv, 'banco.csv')
    expect(r.errors).toEqual([])
    expect(r.questions).toHaveLength(1)
    const q = r.questions[0]
    expect(q).toMatchObject({ year: 2019, specialty: 'ginecologia-obstetricia', stem: '¿Pregunta?', options: ['Uno', 'Dos', 'Tres'], answer: 1, explanation: 'Porque sí' })
  })

  it('acepta JSON con opciones en arreglo y respuesta como texto', () => {
    const r = parseQuestionFile(JSON.stringify([{ pregunta: 'X', opciones: ['a) Alfa', 'b) Beta'], respuesta: 'Beta', especialidad: 'PEDIATRÍA' }]))
    expect(r.questions[0]).toMatchObject({ options: ['Alfa', 'Beta'], answer: 1, specialty: 'pediatria' })
  })

  it('acepta opciones como objetos con bandera de correcta', () => {
    const r = normalizeRows([{ stem: 'X', options: [{ text: 'A1' }, { text: 'B1', correct: true }] }])
    expect(r.questions[0].answer).toBe(1)
  })

  it('detecta respuestas numéricas que empiezan en 1', () => {
    const rows = [
      { stem: 'a', options: ['1', '2', '3', '4'], answer: 4 },
      { stem: 'b', options: ['1', '2', '3', '4'], answer: 1 },
    ]
    const r = normalizeRows(rows)
    expect(r.oneBased).toBe(true)
    expect(r.questions.map((q) => q.answer)).toEqual([3, 0])
    // Forzando base 0, la respuesta 4 queda fuera de rango y se reporta como error.
    const r0 = normalizeRows(rows, { answerBase: 0 })
    expect(r0.questions.map((q) => q.answer)).toEqual([1])
    expect(r0.errors).toHaveLength(1)
  })

  it('agrupa por año cuando el JSON es un objeto { año: [...] }', () => {
    const r = parseQuestionFile(JSON.stringify({ 2018: [{ stem: 'a', options: ['x', 'y'], answer: 'A' }] }))
    expect(r.questions[0].year).toBe(2018)
  })

  it('reporta errores y renombra ids duplicados', () => {
    const r = normalizeRows([
      { id: '1', stem: 'ok', options: ['x', 'y'], answer: 'A' },
      { id: '1', stem: 'dup', options: ['x', 'y'], answer: 'B' },
      { id: '2', stem: '', options: ['x', 'y'], answer: 'A' },
      { id: '3', stem: 'sin opciones', options: ['x'], answer: 'A' },
      { id: '4', stem: 'fuera de rango', options: ['x', 'y'], answer: 'D' },
    ])
    expect(r.questions.map((q) => q.id)).toEqual(['1', '1-2'])
    expect(r.errors.map((e) => e.row)).toEqual([3, 4, 5])
  })

  it('genera ids estables a partir del enunciado', () => {
    const a = normalizeRows([{ stem: 'Misma pregunta', options: ['x', 'y'], answer: 'A', year: 2020 }])
    const b = normalizeRows([{ stem: 'Misma pregunta', options: ['x', 'y'], answer: 'A', year: 2020 }])
    expect(a.questions[0].id).toBe(b.questions[0].id)
    expect(a.questions[0].id.startsWith('2020-')).toBe(true)
  })
})
