/**
 * Genera docs/dudas-para-responder.md: las preguntas nuevas de la recopilación ENURM 2002-2024 que están publicadas con
 * el aviso «Respuesta por confirmar», porque la respuesta publicada difiere de la del documento o hay una duda (`rv`).
 * Se revisan una por una con el médico; al confirmarla se quita `rv` de su entrada en data/banco/revision/ (o se
 * corrige `a`) y se vuelve a ejecutar build-bank.mjs.
 *
 * También lista los borradores que siguen sin publicar en data/banco/borradores/, si los hay.
 *
 *   node scripts/build-dudas.mjs
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const L = 'ABCDEF'
const nuevas = new Map(JSON.parse(readFileSync(join(ROOT, 'data/enurm-2002-2024/nuevas-para-medlogic.json'), 'utf8')).map((q) => [q.id, q]))
const apariciones = JSON.parse(readFileSync(join(ROOT, 'data/banco/apariciones.json'), 'utf8'))
const read = (sub) => {
  const dir = join(ROOT, 'data/banco', sub)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')).map((r) => ({ ...r, _file: `${sub}/${f}` })))
}

const flagged = read('revision').filter((r) => nuevas.has(r.id) && !r.drop && (r.rv || L.indexOf(nuevas.get(r.id).answer) !== r.a))
const drafts = read('borradores')

const md = [
  '# Dudas para responder',
  '',
  'Preguntas nuevas de la recopilación ENURM 2002-2024 que **están publicadas con el aviso «Respuesta por confirmar»**: la respuesta publicada difiere de la del documento o hay una duda sobre el enunciado o la respuesta. Las demás coinciden con el documento y con la bibliografía.',
  '',
  `Hay **${flagged.length}** por confirmar${drafts.length ? ` y **${drafts.length}** borradores sin publicar` : ''}. Para cada una dime qué hacer (*confirmar la publicada*, *usar la del documento*, *reescribir* o *retirar*).`,
  '',
  'Al confirmarla: quita `rv` de su entrada (y corrige `a` si hace falta) en el archivo indicado y ejecuta `node scripts/build-bank.mjs && node scripts/build-dudas.mjs`.',
  '',
]

const entry = (d, i, title) => {
  const q = nuevas.get(d.id)
  const doc = L.indexOf(q.answer)
  const ex = apariciones[`bq-${d.id.slice(6)}`]?.examenes ?? []
  const why = [doc !== d.a ? `Difiere del documento. ${d.rev ?? ''}` : '', d.rv ?? d._nota ?? ''].filter(Boolean).join(' ')
  md.push(`## ${i + 1}. ${title(d, doc)} · \`${d.id}\`${ex.length ? ` · salió en ${ex.join(', ')}` : ''}`, '', `**${d.fix?.stem ?? q.stem}**`, '')
  ;(d.fix?.options ?? q.options).forEach((o, k) => {
    const tags = [k === doc ? 'documento' : '', k === d.a ? (k === doc ? 'publicada (igual)' : 'publicada') : ''].filter(Boolean)
    md.push(`- ${L[k]}) ${o}${tags.length ? `  ← *${tags.join(' y ')}*` : ''}`)
  })
  md.push('', `**Especialidad:** ${d.sp} · **Tema:** ${d.t} · **Archivo:** \`${d._file}\``, '', `> **Por qué se marca:** ${why}`, '', `**Explicación publicada:** ${d.ex}`, '', '**Tu respuesta:** _pendiente_', '')
}

flagged.forEach((d, i) => entry(d, i, (r, doc) => (doc !== r.a ? '❌ Difiere del documento' : '⚠️ Duda')))
if (drafts.length) {
  md.push('# Borradores sin publicar', '')
  drafts.forEach((d, i) => entry(d, i, () => '📝 Borrador'))
}

writeFileSync(join(ROOT, 'docs/dudas-para-responder.md'), md.join('\n'))
console.log(`✓ docs/dudas-para-responder.md con ${flagged.length} por confirmar y ${drafts.length} borradores`)
