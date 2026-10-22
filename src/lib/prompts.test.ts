import { describe, expect, it } from 'vitest'
import { fillPrompt, PROMPT_CATEGORIES, PROMPTS } from '@/data/prompts'

describe('biblioteca de prompts', () => {
  it('cada prompt tiene categoría válida e id único', () => {
    expect(new Set(PROMPTS.map((p) => p.id)).size).toBe(PROMPTS.length)
    for (const p of PROMPTS) expect(PROMPT_CATEGORIES.some((c) => c.id === p.category), p.id).toBe(true)
  })

  it('todas las variables usadas en la plantilla están declaradas y se rellenan', () => {
    for (const p of PROMPTS) {
      const used = [...p.template.matchAll(/\{\{([a-z_]+)\}\}/g)].map((m) => m[1])
      for (const k of used) expect(p.variables.some((v) => v.key === k), `${p.id}: {{${k}}}`).toBe(true)
      const filled = fillPrompt(p, Object.fromEntries(p.variables.map((v) => [v.key, 'X'])))
      expect(/\{\{[a-z_]+\}\}/.test(filled), p.id).toBe(false)
    }
  })

  it('conserva la sintaxis cloze en el prompt de flashcards y marca los campos vacíos', () => {
    const p = PROMPTS.find((x) => x.id === 'flashcards-anki')!
    const out = fillPrompt(p, { tema: 'Dengue' })
    expect(out).toContain('{{c1::texto}}')
    expect(out).toContain('«Dengue»')
    expect(out).toContain('[especialidad]')
    expect(out).toContain('30 flashcards')
  })
})
