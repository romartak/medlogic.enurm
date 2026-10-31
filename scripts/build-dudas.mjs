/**
 * Genera docs/dudas-para-responder.md: las preguntas nuevas que NO se publicaron porque la respuesta del documento es
 * dudosa o el enunciado es ambiguo. Se revisan una por una con el médico; las que se resuelven pasan a
 * data/banco/revision/ (sin los campos que empiezan con «_») y se quitan de data/banco/borradores/.
 *
 *   node scripts/build-dudas.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const L = 'ABCDEF'
const nuevas = new Map(JSON.parse(readFileSync(join(ROOT, 'data/enurm-2002-2024/nuevas-para-medlogic.json'), 'utf8')).map((q) => [q.id, q]))
const apariciones = JSON.parse(readFileSync(join(ROOT, 'data/banco/apariciones.json'), 'utf8'))
const dir = join(ROOT, 'data/banco/borradores')
const drafts = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))

const kind = { dudosa: '⚠️ Ambigua o dudosa', discrepa: '❌ Discrepo del documento' }
const md = [
  '# Dudas para responder',
  '',
  'Preguntas nuevas de la recopilación ENURM 2002-2024 que **no se publicaron** porque tengo dudas sobre la respuesta o el enunciado. Las demás, con respuesta verificada, ya están en el banco.',
  '',
  `Hay **${drafts.length}** pendientes. Las vemos una por una: dime el número y qué hacer (*usar mi propuesta*, *mantener la del documento*, *reescribir* o *retirar*) y la publico o la retiro.`,
  '',
  'Cada una trae mi propuesta de explicación, que es un borrador y puede tener errores.',
  '',
]
drafts.forEach((d, i) => {
  const q = nuevas.get(d.id)
  const doc = L.indexOf(q.answer)
  const ex = apariciones[`bq-${d.id.slice(6)}`]?.examenes ?? []
  md.push(`## ${i + 1}. ${kind[d._veredicto] ?? '⚠️'} · \`${d.id}\` · salió en ${ex.join(', ')}`, '', `**${q.stem}**`, '')
  q.options.forEach((o, k) => {
    const tags = [k === doc ? 'documento' : '', k === d.a ? (k === doc ? 'mi propuesta (igual)' : 'mi propuesta') : ''].filter(Boolean)
    md.push(`- ${L[k]}) ${o}${tags.length ? `  ← *${tags.join(' y ')}*` : ''}`)
  })
  md.push('', `**Especialidad:** ${d.sp} · **Tema:** ${d.t}`, '', `> **Por qué dudo:** ${d._nota}`, '', `**Explicación propuesta:** ${d.ex}`, '', '**Tu respuesta:** _pendiente_', '')
})
writeFileSync(join(ROOT, 'docs/dudas-para-responder.md'), md.join('\n'))
console.log(`✓ docs/dudas-para-responder.md con ${drafts.length} dudas`)
