/**
 * Genera las páginas estáticas para buscadores (guía del ENURM, banco por especialidad y simulacro)
 * y el sitemap, a partir del banco publicado. Corre en cada `npm run build`.
 *   npx vite-node scripts/build-seo.ts
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildSeoPages, buildSitemap, SITE } from '../src/lib/seo'
import { SPECIALTIES } from '../src/data/specialties'
import { ENURM_FACTS, formatEnurmDate, upcomingEnurm } from '../src/data/enurm'
import type { Question } from '../src/types'

const PUBLIC = resolve(import.meta.dirname ?? __dirname, '../public')
const questions = JSON.parse(readFileSync(resolve(PUBLIC, 'data/questions.json'), 'utf8')) as Question[]
const [next] = upcomingEnurm(1)
const pages = buildSeoPages({
  questions,
  specialties: SPECIALTIES.map((s) => ({ id: s.id, name: s.name })),
  next,
  nextLabel: formatEnurmDate(next),
  facts: ENURM_FACTS,
})

// lastmod honesto: una página conserva su fecha anterior si su contenido no cambió.
const today = new Date().toISOString().slice(0, 10)
const sitemapFile = resolve(PUBLIC, 'sitemap.xml')
const oldDates = new Map<string, string>()
if (existsSync(sitemapFile)) {
  for (const m of readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) oldDates.set(m[1], m[2])
}
const old = new Map(pages.map((p) => [p.path, existsSync(resolve(PUBLIC, p.path, 'index.html')) ? readFileSync(resolve(PUBLIC, p.path, 'index.html'), 'utf8') : null]))
const dates = new Map<string, string>()
for (const p of pages) dates.set(p.path, old.get(p.path) === p.html ? (oldDates.get(`${SITE}/${p.path}`) ?? today) : today)

// Borra las páginas por especialidad anteriores (por si una especialidad deja de tener página).
rmSync(resolve(PUBLIC, 'preguntas-enurm'), { recursive: true, force: true })
rmSync(resolve(PUBLIC, 'temas-calientes-enurm'), { recursive: true, force: true })
for (const p of pages) {
  const file = resolve(PUBLIC, p.path, 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, p.html)
}
writeFileSync(sitemapFile, buildSitemap(pages, (path) => dates.get(path) ?? oldDates.get(`${SITE}/${path}`) ?? today))
console.log(`SEO: ${pages.length} páginas y sitemap.xml`)
