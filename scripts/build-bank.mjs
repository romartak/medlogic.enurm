/**
 * Construye el banco publicado (public/data/questions.json) a partir de:
 *   - data/banco/original.json: las preguntas tal como salieron del documento.
 *   - data/banco/revision/*.json: la revisión de cada pregunta (respuesta verificada,
 *     especialidad, explicaciones por opción, fisiopatología, puntos clave y bibliografía).
 *
 *   node scripts/build-bank.mjs
 *
 * Solo se publican las preguntas revisadas. También escribe docs/REVISION-RESPUESTAS.md con
 * las preguntas en las que la respuesta del documento se corrigió, para revisarlas.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/** Bibliografía: clave → cita completa. En la revisión se escribe "clave" o "clave|capítulo o tema". */
const BOOKS = {
  harrison: ['Loscalzo J, Fauci A, Kasper D, et al. Harrison. Principios de Medicina Interna, 21.ª ed. McGraw Hill; 2022', 'libro'],
  cecil: ['Goldman L, Cooney KA. Goldman-Cecil Medicine, 27th ed. Elsevier; 2024', 'libro'],
  braunwald: ['Libby P, Bonow RO, Mann DL, et al. Braunwald. Tratado de Cardiología, 12.ª ed. Elsevier; 2022', 'libro'],
  mandell: ['Bennett JE, Dolin R, Blaser MJ. Mandell, Douglas y Bennett. Enfermedades Infecciosas, 9.ª ed. Elsevier; 2020', 'libro'],
  sleisenger: ['Feldman M, Friedman LS, Brandt LJ. Sleisenger y Fordtran. Enfermedades Digestivas y Hepáticas, 11.ª ed. Elsevier; 2021', 'libro'],
  brenner: ['Yu ASL, Chertow GM, Luyckx VA, et al. Brenner y Rector. El Riñón, 11.ª ed. Elsevier; 2020', 'libro'],
  williamsendo: ['Melmed S, Auchus RJ, Goldfine AB, et al. Williams. Tratado de Endocrinología, 14.ª ed. Elsevier; 2020', 'libro'],
  adams: ['Ropper AH, Samuels MA, Klein JP, Prasad S. Adams y Victor. Principios de Neurología, 12.ª ed. McGraw Hill; 2023', 'libro'],
  guyton: ['Hall JE, Hall ME. Guyton y Hall. Tratado de Fisiología Médica, 14.ª ed. Elsevier; 2021', 'libro'],
  robbins: ['Kumar V, Abbas AK, Aster JC. Robbins y Cotran. Patología Estructural y Funcional, 10.ª ed. Elsevier; 2021', 'libro'],
  goodman: ['Brunton LL, Knollmann BC. Goodman y Gilman. Las Bases Farmacológicas de la Terapéutica, 14.ª ed. McGraw Hill; 2023', 'libro'],
  katzung: ['Vanderah TW. Katzung. Farmacología Básica y Clínica, 16.ª ed. McGraw Hill; 2024', 'libro'],
  moore: ['Moore KL, Dalley AF, Agur AMR. Moore. Anatomía con Orientación Clínica, 8.ª ed. Wolters Kluwer; 2018', 'libro'],
  langman: ['Sadler TW. Langman. Embriología Médica, 14.ª ed. Wolters Kluwer; 2019', 'libro'],
  ross: ['Ross MH, Pawlina W. Histología. Texto y Atlas, 8.ª ed. Wolters Kluwer; 2020', 'libro'],
  harper: ['Kennelly PJ, Botham KM, McGuinness OP, et al. Harper. Bioquímica Ilustrada, 32.ª ed. McGraw Hill; 2023', 'libro'],
  lehninger: ['Nelson DL, Cox MM. Lehninger. Principios de Bioquímica, 8.ª ed. Omega/W. H. Freeman; 2021', 'libro'],
  murray: ['Murray PR, Rosenthal KS, Pfaller MA. Microbiología Médica, 9.ª ed. Elsevier; 2021', 'libro'],
  nelson: ['Kliegman RM, St. Geme JW, Blum NJ, et al. Nelson. Tratado de Pediatría, 22.ª ed. Elsevier; 2024', 'libro'],
  redbook: ['American Academy of Pediatrics. Red Book 2024–2027: Report of the Committee on Infectious Diseases, 33rd ed. AAP; 2024', 'guia'],
  williamsobs: ['Cunningham FG, Leveno KJ, Dashe JS, et al. Williams. Obstetricia, 26.ª ed. McGraw Hill; 2022', 'libro'],
  williamsgin: ['Hoffman BL, Schorge JO, Halvorson LM, et al. Williams. Ginecología, 4.ª ed. McGraw Hill; 2020', 'libro'],
  berek: ['Berek JS. Berek y Novak. Ginecología, 16.ª ed. Wolters Kluwer; 2020', 'libro'],
  schwartz: ['Brunicardi FC, Andersen DK, Billiar TR, et al. Schwartz. Principios de Cirugía, 11.ª ed. McGraw Hill; 2019', 'libro'],
  sabiston: ['Townsend CM, Beauchamp RD, Evers BM, Mattox KL. Sabiston. Tratado de Cirugía, 21.ª ed. Elsevier; 2022', 'libro'],
  atls: ['American College of Surgeons. ATLS: Advanced Trauma Life Support, Student Course Manual, 10th ed. ACS; 2018', 'guia'],
  tintinalli: ['Tintinalli JE, Ma OJ, Yealy DM, et al. Tintinalli. Medicina de Urgencias, 9.ª ed. McGraw Hill; 2020', 'libro'],
  campbellorto: ['Azar FM, Beaty JH. Campbell. Cirugía Ortopédica, 14.ª ed. Elsevier; 2021', 'libro'],
  campbelluro: ['Partin AW, Dmochowski RR, Kavoussi LR, Peters CA. Campbell-Walsh-Wein. Urología, 12.ª ed. Elsevier; 2021', 'libro'],
  fitzpatrick: ['Kang S, Amagai M, Bruckner AL, et al. Fitzpatrick. Dermatología en Medicina General, 9.ª ed. McGraw Hill; 2019', 'libro'],
  kanski: ['Bowling B. Kanski. Oftalmología Clínica, 9.ª ed. Elsevier; 2021', 'libro'],
  cummings: ['Flint PW, Francis HW, Haughey BH, et al. Cummings Otolaryngology: Head and Neck Surgery, 7th ed. Elsevier; 2021', 'libro'],
  kaplan: ['Boland RJ, Verduin ML. Kaplan y Sadock. Sinopsis de Psiquiatría, 12.ª ed. Wolters Kluwer; 2022', 'libro'],
  dsm: ['American Psychiatric Association. DSM-5-TR. Manual Diagnóstico y Estadístico de los Trastornos Mentales, texto revisado. APA; 2022', 'guia'],
  gordis: ['Celentano DD, Szklo M. Gordis. Epidemiología, 6.ª ed. Elsevier; 2019', 'libro'],
  beauchamp: ['Beauchamp TL, Childress JF. Principles of Biomedical Ethics, 8th ed. Oxford University Press; 2019', 'libro'],
  ada: ['American Diabetes Association. Standards of Care in Diabetes—2025. Diabetes Care. 2025;48(Suppl 1)', 'guia'],
  gina: ['Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention, 2024', 'guia'],
  gold: ['Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global Strategy for the Diagnosis, Management and Prevention of COPD, 2025', 'guia'],
  dengue: ['Organización Panamericana de la Salud. Directrices para el diagnóstico clínico y el tratamiento del dengue, el chikunguña y el zika. OPS; 2022', 'guia'],
  aiepi: ['Organización Panamericana de la Salud. Atención Integrada a las Enfermedades Prevalentes de la Infancia (AIEPI). OPS/OMS', 'guia'],
  oms: ['Organización Mundial de la Salud. Notas descriptivas y guías técnicas (who.int)', 'guia'],
}

const SPECIALTIES = new Set([
  'medicina-interna', 'cardiologia', 'neumologia', 'gastroenterologia', 'nefrologia', 'endocrinologia', 'infectologia',
  'hematologia', 'neurologia', 'reumatologia', 'pediatria', 'ginecologia-obstetricia', 'cirugia', 'ortopedia', 'urologia',
  'salud-publica', 'psiquiatria', 'dermatologia', 'farmacologia', 'emergencias', 'ciencias-basicas', 'oftalmologia-orl', 'etica',
])

function ref(entry) {
  const [key, topic] = entry.split('|')
  const book = BOOKS[key.trim()]
  if (!book) throw new Error(`Referencia desconocida: ${key}`)
  return { citation: topic ? `${book[0]}. ${topic.trim()}` : book[0], kind: book[1] }
}

/** Limpia el texto del documento: espacios, el punto final que marcaba la respuesta y la mayúscula inicial. */
function clean(text, { keepDot = false } = {}) {
  let t = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (!keepDot) t = t.replace(/\s*\.+$/, '')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

const original = JSON.parse(readFileSync(join(ROOT, 'data/banco/original.json'), 'utf8'))
// Preguntas nuevas de la recopilación ENURM 2002-2024 (ids «ENURM-2010-023»): se publican solo si tienen revisión en data/banco/revision.
const nuevas = JSON.parse(readFileSync(join(ROOT, 'data/enurm-2002-2024/nuevas-para-medlogic.json'), 'utf8'))
const byId = new Map([
  ...original.map((q) => [q.id, q]),
  ...nuevas.map((q) => [q.id, { id: q.id, question: q.stem, options: Object.fromEntries(q.options.map((o, i) => [LETTERS[i], o])), correct_answer: q.answer }]),
])
/** Id publicado: «Q3_7» → «bq-3_7»; «ENURM-2010-023» → «bq-2010-023». */
const publishedId = (id) => (id.startsWith('ENURM-') ? `bq-${id.slice(6)}` : `bq-${id.slice(1)}`)

const dir = join(ROOT, 'data/banco/revision')
const reviews = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')).map((r) => ({ ...r, _file: f })))

// En qué exámenes salió cada pregunta (data/banco/apariciones.json, lo genera scripts/build-apariciones.mjs).
const apariciones = JSON.parse(readFileSync(join(ROOT, 'data/banco/apariciones.json'), 'utf8'))

/** `year` = el examen más reciente donde salió; `years` = todos; `appearances` solo si salió 2 o más veces (alto rendimiento). */
function appearanceOf(id) {
  const a = apariciones[id]
  if (!a) return {}
  const years = [...new Set(a.examenes.map((e) => parseInt(e, 10)))].sort((x, y) => x - y)
  const appearances = a.examenes.length + (a.sinUbicar ?? 0)
  return { year: years.at(-1), years: years.length ? years : undefined, appearances: appearances > 1 ? appearances : undefined }
}

const out = []
const changed = []
const dropped = []
const problems = []
const seen = new Set()

for (const r of reviews) {
  const src = byId.get(r.id)
  if (!src) {
    problems.push(`${r._file}: ${r.id} no existe en el original`)
    continue
  }
  if (seen.has(r.id)) problems.push(`${r._file}: ${r.id} repetida`)
  seen.add(r.id)
  if (r.drop) {
    dropped.push({ id: r.id, stem: clean(src.question, { keepDot: true }), reason: r.drop })
    continue
  }

  const stem = clean(r.fix?.stem ?? src.question, { keepDot: true })
  const options = (r.fix?.options ?? Object.values(src.options)).map((o) => clean(o))
  const fileAnswer = src.correct_answer ? LETTERS.indexOf(src.correct_answer) : -1
  const err = (m) => problems.push(`${r._file}: ${r.id} ${m}`)

  if (!Number.isInteger(r.a) || r.a < 0 || r.a >= options.length) err(`respuesta fuera de rango (${r.a})`)
  if (!SPECIALTIES.has(r.sp)) err(`especialidad desconocida (${r.sp})`)
  if (!Array.isArray(r.oe) || r.oe.length !== options.length) err(`explicaciones por opción: ${r.oe?.length} para ${options.length} opciones`)
  if (!r.ex) err('sin explicación')

  let references = []
  try {
    references = (r.ref ?? []).map(ref)
  } catch (e) {
    err(e.message)
  }

  const q = {
    id: publishedId(r.id),
    specialty: r.sp,
    topic: r.t,
    stem,
    options,
    answer: r.a,
    explanation: r.ex,
    optionExplanations: r.oe,
    pathophysiology: r.pf,
    keyPoints: r.kp,
    references,
    difficulty: r.d,
    tags: ['banco-recopilado'],
    ...appearanceOf(publishedId(r.id)),
  }
  out.push(Object.fromEntries(Object.entries(q).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length))))

  if (fileAnswer !== r.a) {
    changed.push({ id: r.id, stem, options, from: fileAnswer, to: r.a, why: r.rev ?? '' })
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} problemas:\n  ${problems.join('\n  ')}`)
  process.exit(1)
}

writeFileSync(join(ROOT, 'public/data/questions.json'), JSON.stringify(out))

const newRevised = reviews.filter((r) => r.id.startsWith('ENURM-')).length
const oldRevised = reviews.length - newRevised
const letter = (i) => (i >= 0 ? LETTERS[i] : '—')
const md = [
  '# Revisión de respuestas del banco recopilado',
  '',
  `Preguntas revisadas: **${reviews.length}** (${oldRevised} de ${original.length} del documento original · ${newRevised} de ${nuevas.length} de la recopilación 2002-2024) · publicadas: **${out.length}** · respuesta corregida: **${changed.length}** · retiradas: **${dropped.length}**.`,
  '',
  'En estas preguntas la respuesta marcada en el documento no coincidía con la bibliografía y se publicó la corregida.',
  'Si no estás de acuerdo con alguna, cambia `a` (0 = A, 1 = B…) en su archivo de `data/banco/revision/` y vuelve a ejecutar `node scripts/build-bank.mjs`.',
  '',
  '## Respuestas corregidas',
  '',
  ...changed.map(
    (c) =>
      `- **${c.id}** — ${c.stem}\n  - Documento: ${letter(c.from)}${c.from >= 0 ? ` (${c.options[c.from]})` : ''} → publicada: **${letter(c.to)} (${c.options[c.to]})**${c.why ? `\n  - ${c.why}` : ''}`,
  ),
  '',
  '## Retiradas',
  '',
  ...(dropped.length ? dropped.map((d) => `- **${d.id}** — ${d.stem}\n  - ${d.reason}`) : ['Ninguna.']),
  '',
].join('\n')
writeFileSync(join(ROOT, 'docs/REVISION-RESPUESTAS.md'), md)

const bySpec = {}
for (const q of out) bySpec[q.specialty] = (bySpec[q.specialty] ?? 0) + 1
console.log(`✓ ${out.length} preguntas publicadas · ${changed.length} respuestas corregidas · ${dropped.length} retiradas · ${original.length - oldRevised} del original y ${nuevas.length - newRevised} de la recopilación sin revisar`)
console.table(bySpec)
