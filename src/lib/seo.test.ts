import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildSeoPages, buildSitemap, esc, showcase, SITE } from './seo'
import { SPECIALTIES } from '@/data/specialties'
import { ENURM_FACTS, enurmDate, formatEnurmDate } from '@/data/enurm'
import type { Question } from '@/types'

const questions = JSON.parse(readFileSync('public/data/questions.json', 'utf8')) as Question[]
const next = enurmDate(2027)
const pages = buildSeoPages({
  questions,
  specialties: SPECIALTIES.map((s) => ({ id: s.id, name: s.name })),
  next,
  nextLabel: formatEnurmDate(next),
  facts: ENURM_FACTS,
})

describe('páginas para buscadores', () => {
  it('rutas únicas con guía, banco, especialidades y simulacro', () => {
    const paths = pages.map((p) => p.path)
    expect(new Set(paths).size).toBe(paths.length)
    for (const p of ['enurm/', 'preguntas-enurm/', 'simulacro-enurm/', 'preguntas-enurm/pediatria/']) expect(paths).toContain(p)
  })

  it('cada página tiene título, descripción, canonical propio y datos estructurados válidos', () => {
    for (const p of pages) {
      expect(p.html, p.path).toContain(`<title>${esc(p.title)}</title>`)
      expect(p.title.length, p.path).toBeLessThanOrEqual(80)
      expect(p.html, p.path).toMatch(/<meta name="description" content="[^"]{60,}"/)
      expect(p.html, p.path).toContain(`<link rel="canonical" href="${SITE}/${p.path}" />`)
      expect(p.html.match(/<h1>/g)?.length, p.path).toBe(1)
      const ld = p.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1]
      expect(() => JSON.parse(ld!), p.path).not.toThrow()
    }
  })

  it('solo muestra preguntas completas y sin «Respuesta por confirmar»', () => {
    const shown = showcase(questions, 500)
    expect(shown.length).toBeGreaterThan(0)
    for (const q of shown) {
      expect(q.review, q.id).toBeFalsy()
      expect(q.optionExplanations?.length, q.id).toBe(q.options.length)
    }
    const flagged = questions.filter((q) => q.review)
    const all = pages.map((p) => p.html).join('')
    for (const q of flagged.slice(0, 50)) expect(all.includes(`id="${q.id}"`), q.id).toBe(false)
  })

  it('escapa el HTML del contenido', () => {
    expect(esc('<b>"x" & y</b>')).toBe('&lt;b&gt;&quot;x&quot; &amp; y&lt;/b&gt;')
  })

  it('el sitemap incluye la portada y todas las páginas', () => {
    const xml = buildSitemap(pages, () => '2026-11-02')
    expect(xml).toContain(`<loc>${SITE}/</loc>`)
    for (const p of pages) expect(xml).toContain(`<loc>${SITE}/${p.path}</loc>`)
  })
})
