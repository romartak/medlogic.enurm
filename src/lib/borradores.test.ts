import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { SPECIALTIES } from '@/data/specialties'

// Los borradores esperan la confirmación del médico: no son preguntas publicadas y deben estar completos
// para que, al aprobarlos, basten un `mv` a data/banco/revision y `node scripts/build-bank.mjs`.
const dir = 'data/banco/borradores'
const nuevas = new Map((JSON.parse(readFileSync('data/enurm-2002-2024/nuevas-para-medlogic.json', 'utf8')) as { id: string; answer: string; options: string[] }[]).map((q) => [q.id, q]))
const specs = new Set(SPECIALTIES.map((s) => s.id))
const published = new Set((JSON.parse(readFileSync('public/data/questions.json', 'utf8')) as { id: string }[]).map((q) => q.id))

describe('borradores de preguntas nuevas', () => {
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  const drafts = files.flatMap((f) => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as Record<string, unknown>[])

  it('hay al menos un lote', () => {
    expect(drafts.length).toBeGreaterThan(0)
  })
  it('cada borrador apunta a una pregunta nueva real, sin repetir', () => {
    const ids = drafts.map((d) => d.id as string)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(nuevas.has(id), id).toBe(true)
  })
  it('están completos: respuesta válida, especialidad conocida, explicación y un análisis por opción', () => {
    for (const d of drafts) {
      const q = nuevas.get(d.id as string)!
      expect(d.a as number, d.id as string).toBeGreaterThanOrEqual(0)
      expect(d.a as number, d.id as string).toBeLessThan(q.options.length)
      expect(specs.has(d.sp as string), `${d.id}: ${d.sp}`).toBe(true)
      expect((d.ex as string).length, d.id as string).toBeGreaterThan(40)
      expect((d.oe as string[]).length, d.id as string).toBe(q.options.length)
      expect((d.oe as string[])[d.a as number].startsWith('Correcta'), d.id as string).toBe(true)
      expect(['confirma', 'dudosa', 'discrepa']).toContain(d._veredicto)
    }
  })
  it('si la respuesta cambia respecto del documento, dice por qué', () => {
    for (const d of drafts) {
      const q = nuevas.get(d.id as string)!
      if ('ABCDEF'.indexOf(q.answer) !== d.a) expect((d.rev as string)?.length, d.id as string).toBeGreaterThan(20)
    }
  })
  it('no están publicados: se publican solo al pasar a data/banco/revision', () => {
    for (const d of drafts) expect(published.has(`bq-${(d.id as string).slice(6)}`), d.id as string).toBe(false)
  })
})
