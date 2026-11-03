/**
 * Páginas para buscadores (SEO). Se ejecuta después de `vite build` y escribe en dist/:
 *   - /que-es-el-enurm/, /fecha-del-enurm/, /banco-de-preguntas-enurm/, /simulacro-enurm/,
 *     /como-prepararse-para-el-enurm/ y una página por especialidad en /preguntas-enurm/<id>/
 *   - sitemap.xml con todas las direcciones
 *
 * Por qué existe: la app usa rutas con «#» (HashRouter), así que para Google solo hay una dirección.
 * Estas páginas son HTML real, con su título, descripción, datos estructurados y texto, y cada una
 * lleva a la app. Los números (preguntas, especialidades, años) salen del banco publicado y las
 * fechas y reglas del examen salen de src/data/enurm.ts, así que no se desactualizan solas.
 *
 *   npx vite-node scripts/build-seo.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { ENURM_FACTS, enurmDate, formatEnurmDate, upcomingEnurm } from '../src/data/enurm'
import { SPECIALTIES } from '../src/data/specialties'

const ROOT = resolve(import.meta.dirname, '..')
const DIST = join(ROOT, 'dist')
const SITE = 'https://medlogicenurm.vercel.app'
const NAME = 'MedLogic ENURM'
const TODAY = new Date().toISOString().slice(0, 10)

interface Q {
  specialty: string
  topic: string
  year?: number
  years?: number[]
}
const bank: Q[] = JSON.parse(readFileSync(join(ROOT, 'public/data/questions.json'), 'utf8'))
const total = bank.length
const nf = (n: number) => n.toLocaleString('es-DO').replace(/,/g, '.')
const allYears = [...new Set(bank.flatMap((q) => q.years ?? (q.year ? [q.year] : [])))].sort((a, b) => a - b)
const firstYear = allYears[0]
const lastYear = allYears[allYears.length - 1]
/** «Más de 2.400»: se redondea hacia abajo a la centena para que siga siendo cierto. */
const floor100 = (n: number) => Math.floor(n / 100) * 100

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const next = upcomingEnurm(1)[0]
const nextDate = formatEnurmDate(next)
const nextDay = formatEnurmDate(next, { weekday: true })

interface Faq {
  q: string
  a: string
}

interface Page {
  path: string // «que-es-el-enurm/»
  title: string
  description: string
  h1: string
  lead: string
  body: string // HTML ya escapado
  faq?: Faq[]
  cta: { href: string; text: string }
  crumbs: { name: string; path: string }[]
  priority: string
  changefreq: string
}

const url = (path: string) => `${SITE}/${path}`

const HUB_LINKS: [string, string][] = [
  ['que-es-el-enurm/', '¿Qué es el ENURM?'],
  ['fecha-del-enurm/', `Fecha del ENURM ${next.year}`],
  ['banco-de-preguntas-enurm/', 'Banco de preguntas del ENURM'],
  ['simulacro-enurm/', 'Simulacro del ENURM'],
  ['como-prepararse-para-el-enurm/', 'Cómo prepararse para el ENURM'],
]

const FAQ_ENURM: Faq[] = [
  {
    q: '¿Cuándo es el ENURM?',
    a: `Se aplica una vez al año, el ${ENURM_FACTS.rule.toLowerCase()}, en la UASD. Así fue en 2024 (3 de marzo), 2025 (2 de marzo) y 2026 (1 de marzo). Para los próximos años se muestra la fecha proyectada hasta que sale la convocatoria oficial.`,
  },
  {
    q: '¿Qué puntaje necesito para concursar?',
    a: `Según el aviso del Ministerio de Salud Pública, se necesitan ${ENURM_FACTS.minScore} puntos o más (de 100) para concursar por una especialidad. La calificación vale por ${ENURM_FACTS.validYears} años y, si se toma de nuevo, solo cuenta el examen más reciente. En el concurso también suman el índice académico, los honores, la pasantía y una entrevista (1–5 puntos).`,
  },
  {
    q: '¿Cómo es el examen?',
    a: `Las guías de preparación coinciden en ${ENURM_FACTS.questions} preguntas de selección múltiple en unas 2 horas: alrededor de 72 segundos por pregunta. Los simulacros de ${NAME} usan ese mismo formato. Confirma siempre los detalles en la convocatoria oficial.`,
  },
  {
    q: '¿Quién aplica el ENURM?',
    a: `${ENURM_FACTS.organizer}. La convocatoria y los requisitos del concurso los publica el Ministerio de Salud Pública (${ENURM_FACTS.official.replace('https://', '')}).`,
  },
]

const FAQ_PLATFORM: Faq[] = [
  {
    q: `¿${NAME} es gratis?`,
    a: 'Sí, ahora y siempre. Es un proyecto de código abierto y sin anuncios. Puedes estudiar sin registrarte: la cuenta es opcional y sirve para guardar tu progreso en la nube.',
  },
  {
    q: '¿De dónde salen las preguntas?',
    a: `De exámenes de años anteriores recopilados (de ${firstYear} a ${lastYear}). Cada pregunta trae la explicación de todas las opciones, la fisiopatología, puntos clave y la referencia del libro. Las respuestas se revisaron con la bibliografía, y se quitaron las repetidas y las incompletas.`,
  },
]

// ---------------------------------------------------------------------------------------------
// Contenido
// ---------------------------------------------------------------------------------------------

/** Una especialidad con muy pocas preguntas no merece página propia (contenido escaso). */
const MIN_QUESTIONS_PAGE = 15
const bySpecialty = new Map<string, Q[]>()
for (const q of bank) bySpecialty.set(q.specialty, [...(bySpecialty.get(q.specialty) ?? []), q])
const specialtiesWithQuestions = SPECIALTIES.filter((s) => (bySpecialty.get(s.id)?.length ?? 0) > 0).sort(
  (a, b) => (bySpecialty.get(b.id)?.length ?? 0) - (bySpecialty.get(a.id)?.length ?? 0),
)

const CONFIRMED_YEARS = [2018, 2019, 2024, 2025, 2026].map((y) => enurmDate(y))

const pages: Page[] = []

pages.push({
  path: 'que-es-el-enurm/',
  title: '¿Qué es el ENURM? Examen de Residencias Médicas',
  description: `Qué es el ENURM, quién lo aplica, cuántas preguntas tiene, qué puntaje necesitas y cuánto vale la calificación. Guía clara para médicos de República Dominicana.`,
  h1: '¿Qué es el ENURM?',
  lead: 'El ENURM (Examen Nacional Único de Residencias Médicas) es la prueba que presentan en República Dominicana los médicos que quieren concursar por una plaza de residencia.',
  body: `
<h2>Datos clave del ENURM</h2>
<ul>
<li><strong>Quién lo aplica:</strong> ${esc(ENURM_FACTS.organizer)}.</li>
<li><strong>Cuándo:</strong> una vez al año, el ${esc(ENURM_FACTS.rule.toLowerCase())}. La próxima fecha es ${esc(nextDay)}${next.confirmed ? '' : ' (proyectada, hasta que salga la convocatoria oficial)'}.</li>
<li><strong>Formato:</strong> ${ENURM_FACTS.questions} preguntas de selección múltiple en unas 2 horas, alrededor de 72 segundos por pregunta.</li>
<li><strong>Puntaje mínimo:</strong> ${ENURM_FACTS.minScore} puntos o más (de 100) para concursar por una especialidad.</li>
<li><strong>Vigencia:</strong> la calificación vale por ${ENURM_FACTS.validYears} años; si repites el examen, cuenta el más reciente.</li>
<li><strong>Convocatoria oficial:</strong> <a href="${esc(ENURM_FACTS.official)}" rel="noopener" target="_blank">${esc(ENURM_FACTS.official.replace('https://', ''))}</a>.</li>
</ul>
<h2>Qué suma además del examen</h2>
<p>En el concurso por una plaza también cuentan el índice académico, los honores, la pasantía y una entrevista (de 1 a 5 puntos). El examen es solo una parte, pero es la que abre la puerta: sin ${ENURM_FACTS.minScore} puntos no se concursa.</p>
<h2>Cómo prepararte con ${esc(NAME)}</h2>
<p>${esc(NAME)} es una plataforma gratuita y de código abierto. Reúne un <a href="/banco-de-preguntas-enurm/">banco de ${nf(total)} preguntas</a> con explicación de cada opción, <a href="/simulacro-enurm/">simulacros cronometrados</a>, flashcards, guías y un plan de estudio diario que se ajusta a los días que faltan. Empieza con la <a href="/como-prepararse-para-el-enurm/">guía para prepararte</a> y consulta la <a href="/fecha-del-enurm/">fecha del ENURM ${next.year}</a>.</p>
<p class="note">Los requisitos, fechas y puntajes cambian con cada convocatoria. Confirma siempre en el aviso oficial del Ministerio de Salud Pública.</p>`,
  faq: FAQ_ENURM,
  cta: { href: '/', text: 'Empieza a prepararte gratis' },
  crumbs: [{ name: 'Qué es el ENURM', path: 'que-es-el-enurm/' }],
  priority: '0.9',
  changefreq: 'monthly',
})

pages.push({
  path: 'fecha-del-enurm/',
  title: `Fecha del ENURM ${next.year}: cuándo es el examen`,
  description: `El ENURM ${next.year} ${next.confirmed ? 'es' : 'se proyecta para'} el ${nextDay}. Fechas de años anteriores, regla del primer domingo de marzo y dónde ver la convocatoria oficial.`,
  h1: `Fecha del ENURM ${next.year}`,
  lead: `El ENURM ${next.year} ${next.confirmed ? 'es' : 'se proyecta para'} el <strong>${esc(nextDay)}</strong>. ${next.confirmed ? 'La fecha ya está publicada en la convocatoria oficial.' : 'Es una fecha proyectada: el examen se aplica el primer domingo de marzo y se confirma con la convocatoria oficial.'}`,
  body: `
<h2>Cuándo se aplica el ENURM</h2>
<p>El examen lo aplica la ${esc(ENURM_FACTS.organizer)} una vez al año, el <strong>${esc(ENURM_FACTS.rule.toLowerCase())}</strong>. Con esa regla, el ENURM ${next.year} caería el ${esc(nextDay)}.</p>
<h2>Fechas de convocatorias anteriores</h2>
<table>
<thead><tr><th>Año</th><th>Fecha</th><th>Fuente</th></tr></thead>
<tbody>
${CONFIRMED_YEARS.map((d) => `<tr><td>${d.year}</td><td>${esc(formatEnurmDate(d, { weekday: true }))}</td><td>${d.source ? `<a href="${esc(d.source)}" rel="noopener" target="_blank">${esc(new URL(d.source).hostname.replace('www.', ''))}</a>` : ''}</td></tr>`).join('\n')}
</tbody>
</table>
<h2>Dónde ver la convocatoria oficial</h2>
<p>El Ministerio de Salud Pública publica el aviso del concurso, con requisitos y calendario, en <a href="${esc(ENURM_FACTS.official)}" rel="noopener" target="_blank">${esc(ENURM_FACTS.official.replace('https://', ''))}</a>. Ese aviso manda sobre cualquier fecha proyectada.</p>
<h2>Cuánto tiempo te queda</h2>
<p>${esc(NAME)} calcula tu plan diario con los días que faltan hasta el examen y el tiempo que tienes cada día. Mira <a href="/como-prepararse-para-el-enurm/">cómo prepararte</a> o entra a practicar con el <a href="/banco-de-preguntas-enurm/">banco de preguntas</a>.</p>`,
  faq: FAQ_ENURM.slice(0, 3),
  cta: { href: '/', text: 'Ver cuenta atrás y plan de estudio' },
  crumbs: [{ name: `Fecha del ENURM ${next.year}`, path: 'fecha-del-enurm/' }],
  priority: '0.9',
  changefreq: 'monthly',
})

pages.push({
  path: 'banco-de-preguntas-enurm/',
  title: `Banco de preguntas del ENURM: ${nf(floor100(total))}+ con explicación`,
  description: `${nf(total)} preguntas tipo ENURM de ${firstYear} a ${lastYear}, en ${specialtiesWithQuestions.length} especialidades, con la explicación de cada opción, fisiopatología y referencia. Gratis.`,
  h1: 'Banco de preguntas del ENURM',
  lead: `${nf(total)} preguntas de exámenes de años anteriores (${firstYear}–${lastYear}), repartidas en ${specialtiesWithQuestions.length} especialidades. Cada una explica por qué la correcta lo es y por qué las demás no. Gratis y sin anuncios.`,
  body: `
<h2>Qué trae cada pregunta</h2>
<ul>
<li>La respuesta correcta, verificada con la bibliografía.</li>
<li>La explicación de <strong>todas</strong> las opciones, no solo de la correcta.</li>
<li>La fisiopatología y los puntos clave del tema.</li>
<li>La referencia del libro de donde sale.</li>
<li>Los años en que apareció la pregunta en el ENURM.</li>
</ul>
<p>Puedes filtrar por especialidad, por año o por estado (no vistas, falladas, marcadas) y repasar solo tus errores.</p>
<h2>Preguntas del ENURM por especialidad</h2>
<ul class="grid">
${specialtiesWithQuestions.map((s) => { const n = bySpecialty.get(s.id)!.length; return `<li>${n >= MIN_QUESTIONS_PAGE ? `<a href="/preguntas-enurm/${s.id}/">${esc(s.name)}</a>` : esc(s.name)} <span class="muted">${nf(n)} ${n === 1 ? 'pregunta' : 'preguntas'}</span></li>` }).join('\n')}
</ul>
<h2>Antes de ir al examen</h2>
<p>Después de practicar por tema, mide tu nivel con un <a href="/simulacro-enurm/">simulacro del ENURM</a> con reloj. Si todavía no sabes cómo organizarte, empieza por <a href="/como-prepararse-para-el-enurm/">la guía para prepararte</a>.</p>`,
  faq: FAQ_PLATFORM,
  cta: { href: '/#/practica', text: 'Practicar con el banco de preguntas' },
  crumbs: [{ name: 'Banco de preguntas', path: 'banco-de-preguntas-enurm/' }],
  priority: '0.9',
  changefreq: 'weekly',
})

pages.push({
  path: 'simulacro-enurm/',
  title: 'Simulacro del ENURM gratis: 100 preguntas con reloj',
  description: `Haz un simulacro del ENURM gratis: formato completo de ${ENURM_FACTS.questions} preguntas en 2 horas, con cronómetro, preguntas marcadas, nota final y resultado por especialidad.`,
  h1: 'Simulacro del ENURM',
  lead: `Practica el examen con las condiciones del real: ${ENURM_FACTS.questions} preguntas de selección múltiple y unas 2 horas de reloj. Gratis, sin registrarte.`,
  body: `
<h2>Tipos de simulacro</h2>
<ul>
<li><strong>Completo:</strong> ${ENURM_FACTS.questions} preguntas y 2 horas, igual que el formato del examen.</li>
<li><strong>Medio y rápido:</strong> para practicar entre semana cuando no tienes dos horas.</li>
<li><strong>Personalizado:</strong> eliges cuántas preguntas, qué especialidades y cuánto tiempo.</li>
</ul>
<h2>Qué obtienes al terminar</h2>
<ul>
<li>Tu nota final, para compararla con el mínimo de ${ENURM_FACTS.minScore} puntos que se pide para concursar.</li>
<li>El resultado por especialidad, para saber dónde reforzar.</li>
<li>La revisión de cada pregunta, con la explicación de todas las opciones.</li>
<li>Las preguntas falladas, listas para repasarlas después.</li>
</ul>
<h2>Cada cuánto hacer simulacros</h2>
<p>Uno por semana en las primeras fases y con más frecuencia en los últimos dos meses. Lo más útil no es la nota, sino revisar las preguntas falladas y los resultados por especialidad. Alimenta ese repaso con el <a href="/banco-de-preguntas-enurm/">banco de preguntas</a> y organiza el tiempo con la <a href="/como-prepararse-para-el-enurm/">guía de preparación</a>.</p>`,
  faq: [
    FAQ_ENURM[2],
    {
      q: '¿Cada cuánto debo hacer simulacros?',
      a: 'Uno semanal en las primeras fases y con mayor frecuencia en los últimos dos meses. Después de cada uno, revisa los resultados por especialidad y las preguntas falladas.',
    },
  ],
  cta: { href: '/#/simulacro', text: 'Hacer un simulacro ahora' },
  crumbs: [{ name: 'Simulacro del ENURM', path: 'simulacro-enurm/' }],
  priority: '0.8',
  changefreq: 'monthly',
})

pages.push({
  path: 'como-prepararse-para-el-enurm/',
  title: 'Cómo prepararse para el ENURM: método y plan semanal',
  description: 'Cómo estudiar para el ENURM con técnicas que funcionan: práctica de recuperación, repetición espaciada, plan semanal, simulacros y qué hacer el día del examen.',
  h1: 'Cómo prepararse para el ENURM',
  lead: 'Un método claro de principio a fin, basado en técnicas de estudio con evidencia: practicar recordando, repasar a tiempo y aprender de cada error.',
  body: `
<h2>Seis técnicas que funcionan</h2>
<ul>
<li><strong>Práctica de recuperación:</strong> intentar recordar (responder preguntas) fija más que releer.</li>
<li><strong>Repetición espaciada:</strong> repasar justo antes de olvidar multiplica la retención a largo plazo. Por eso las flashcards programan cada tarjeta.</li>
<li><strong>Práctica intercalada:</strong> mezclar especialidades obliga a identificar el tipo de problema, como en el examen real.</li>
<li><strong>Aprender del error:</strong> cada pregunta fallada indica exactamente qué te falta. Lee la explicación y vuelve a ella en unos días.</li>
<li><strong>Bloques de concentración:</strong> sesiones de 25–50 minutos sin distracciones, con pausas cortas, rinden más que horas dispersas.</li>
<li><strong>Sueño y descanso:</strong> dormir consolida lo aprendido. Un día de descanso a la semana protege contra el agotamiento.</li>
</ul>
<h2>Una semana de ejemplo</h2>
<table>
<tbody>
<tr><th>Lunes</th><td>Preguntas de la especialidad prioritaria + guía corta + flashcards</td></tr>
<tr><th>Martes</th><td>Segunda especialidad + repaso de errores del lunes</td></tr>
<tr><th>Miércoles</th><td>Preguntas mezcladas + flashcards</td></tr>
<tr><th>Jueves</th><td>Especialidad débil + perlas de su espacio</td></tr>
<tr><th>Viernes</th><td>Preguntas mezcladas + repaso de errores de la semana</td></tr>
<tr><th>Sábado</th><td>Simulacro con tiempo + revisión completa de resultados</td></tr>
<tr><th>Domingo</th><td>Descanso (repaso ligero de flashcards opcional)</td></tr>
</tbody>
</table>
<h2>El día del examen</h2>
<ul>
<li>Revisa con anticipación lugar, hora y documentos que pide la convocatoria.</li>
<li>Duerme bien la noche anterior; no estudies hasta tarde.</li>
<li>Lee el enunciado completo y todas las opciones antes de responder.</li>
<li>Si una pregunta te traba, márcala y sigue: vuelve al final.</li>
<li>Controla el ritmo: revisa el reloj cada cierto número de preguntas.</li>
</ul>
<h2>Herramientas para aplicarlo</h2>
<p>Practica con el <a href="/banco-de-preguntas-enurm/">banco de preguntas</a>, mide tu nivel con un <a href="/simulacro-enurm/">simulacro</a> y consulta la <a href="/fecha-del-enurm/">fecha del ENURM ${next.year}</a> para repartir el tiempo. Si primero quieres entender el examen, lee <a href="/que-es-el-enurm/">qué es el ENURM</a>.</p>`,
  faq: [
    {
      q: '¿Cuántas horas debo estudiar al día?',
      a: 'Depende del tiempo que falte y de tus responsabilidades. Es mejor un plan sostenible (por ejemplo, 1–2 horas diarias durante meses) que jornadas largas e irregulares.',
    },
    {
      q: '¿Empiezo por la teoría o por las preguntas?',
      a: 'Combina ambas. Al inicio, una guía corta seguida de preguntas del mismo tema. Con el tiempo, las preguntas deben ocupar la mayor parte, porque te enseñan qué y cómo se pregunta.',
    },
    {
      q: '¿Qué hago con las preguntas que fallo?',
      a: 'Lee la explicación, anota lo que no sabías y vuelve a responderlas en unos días. Fallar durante la preparación es la mejor forma de no fallar en el examen.',
    },
  ],
  cta: { href: '/#/como-prepararte', text: 'Ver la guía completa y armar mi plan' },
  crumbs: [{ name: 'Cómo prepararse', path: 'como-prepararse-para-el-enurm/' }],
  priority: '0.8',
  changefreq: 'monthly',
})

for (const s of specialtiesWithQuestions.filter((x) => bySpecialty.get(x.id)!.length >= MIN_QUESTIONS_PAGE)) {
  const qs = bySpecialty.get(s.id)!
  const topics = new Map<string, number>()
  for (const q of qs) topics.set(q.topic, (topics.get(q.topic) ?? 0) + 1)
  const topTopics = [...topics.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es')).slice(0, 24)
  const years = [...new Set(qs.flatMap((q) => q.years ?? (q.year ? [q.year] : [])))].sort((a, b) => a - b)
  const others = specialtiesWithQuestions.filter((o) => o.id !== s.id && bySpecialty.get(o.id)!.length >= MIN_QUESTIONS_PAGE).slice(0, 8)
  pages.push({
    path: `preguntas-enurm/${s.id}/`,
    title: `Preguntas de ${s.name} del ENURM con explicación`,
    description: `${nf(qs.length)} preguntas de ${s.name} tipo ENURM (${years[0]}–${years[years.length - 1]}) con la explicación de cada opción, fisiopatología y referencia. Practica gratis.`,
    h1: `Preguntas de ${s.name} del ENURM`,
    lead: `${nf(qs.length)} preguntas de ${s.name} de exámenes de años anteriores del ENURM, con la explicación de todas las opciones.`,
    body: `
<h2>Temas de ${esc(s.name)} en el banco</h2>
<p>Los temas con más preguntas en ${esc(s.name)}, de mayor a menor:</p>
<ul class="grid">
${topTopics.map(([t, n]) => `<li>${esc(t)} <span class="muted">${n} ${n === 1 ? 'pregunta' : 'preguntas'}</span></li>`).join('\n')}
</ul>
<h2>Cómo estudiar ${esc(s.name)} para el ENURM</h2>
<p>Responde las preguntas por tema y lee la explicación de cada opción, también de las incorrectas: así aprendes por qué se descartan. Repasa las falladas a los pocos días y mézclalas con otras especialidades. Ya hay ${nf(qs.length)} preguntas de ${esc(s.name)} en el <a href="/banco-de-preguntas-enurm/">banco de preguntas del ENURM</a>.</p>
<h2>Otras especialidades</h2>
<ul class="grid">
${others.map((o) => `<li><a href="/preguntas-enurm/${o.id}/">${esc(o.name)}</a></li>`).join('\n')}
</ul>`,
    cta: { href: `/#/especialidades/${s.id}`, text: `Practicar ${s.name}` },
    crumbs: [
      { name: 'Banco de preguntas', path: 'banco-de-preguntas-enurm/' },
      { name: s.name, path: `preguntas-enurm/${s.id}/` },
    ],
    priority: '0.6',
    changefreq: 'monthly',
  })
}

// ---------------------------------------------------------------------------------------------
// Plantilla
// ---------------------------------------------------------------------------------------------

const CSS = `:root{--bg:#fff;--text:#0f172a;--muted:#475569;--brand:#0f766e;--brand-d:#0b5d57;--border:#e2e8f0;--surface:#f8fafc}
@media (prefers-color-scheme:dark){:root{--bg:#0b1220;--text:#e2e8f0;--muted:#94a3b8;--brand:#2dd4bf;--brand-d:#14b8a6;--border:#1e293b;--surface:#111a2e}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.7 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:24px 20px 64px}
a{color:var(--brand)}
h1{font-size:2rem;line-height:1.2;margin:.5em 0 .3em}
h2{font-size:1.3rem;margin:1.8em 0 .4em}
.lead{font-size:1.1rem;color:var(--muted)}
.muted{color:var(--muted);font-size:.9rem}
.top{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.95rem;align-items:center}
.brand{font-weight:800;text-decoration:none;color:var(--text)}
.crumbs{font-size:.85rem;color:var(--muted);margin-top:18px}
.crumbs a{color:var(--muted)}
.cta{display:inline-block;margin:20px 0 8px;padding:12px 22px;border-radius:12px;background:var(--brand);color:#fff;font-weight:700;text-decoration:none}
@media (prefers-color-scheme:dark){.cta{color:#042f2e}}
.cta:hover{background:var(--brand-d)}
.note{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 16px}
table{border-collapse:collapse;width:100%;font-size:.95rem}
th,td{border-bottom:1px solid var(--border);padding:8px 10px;text-align:left;vertical-align:top}
ul.grid{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px 16px}
details{border:1px solid var(--border);border-radius:12px;padding:10px 16px;margin:8px 0;background:var(--surface)}
summary{cursor:pointer;font-weight:600}
footer{margin-top:3em;padding-top:1em;border-top:1px solid var(--border);font-size:.9rem}
footer nav{display:flex;flex-wrap:wrap;gap:6px 16px}`

function render(p: Page): string {
  const canonical = url(p.path)
  const ld: unknown[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: NAME, item: `${SITE}/` },
        ...p.crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 2, name: c.name, item: url(c.path) })),
      ],
    },
    {
      '@type': 'WebPage',
      '@id': `${canonical}#pagina`,
      url: canonical,
      name: p.title,
      description: p.description,
      inLanguage: 'es-DO',
      dateModified: TODAY,
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@type': 'Thing', name: 'ENURM (Examen Nacional Único de Residencias Médicas)' },
      publisher: { '@id': `${SITE}/#organizacion` },
    },
  ]
  if (p.faq?.length) {
    ld.push({
      '@type': 'FAQPage',
      mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    })
  }
  const faqHtml = p.faq?.length
    ? `<h2>Preguntas frecuentes</h2>\n${p.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n')}`
    : ''
  const crumbHtml = [`<a href="/">${NAME}</a>`, ...p.crumbs.map((c, i) => (i === p.crumbs.length - 1 ? esc(c.name) : `<a href="/${c.path}">${esc(c.name)}</a>`))].join(' › ')
  return `<!doctype html>
<html lang="es-DO">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(p.title)} | MedLogic</title>
<meta name="description" content="${esc(p.description)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta name="theme-color" content="#0d9488" />
<link rel="canonical" href="${canonical}" />
<link rel="alternate" hreflang="es-DO" href="${canonical}" />
<link rel="alternate" hreflang="x-default" href="${canonical}" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="${NAME}" />
<meta property="og:locale" content="es_DO" />
<meta property="og:url" content="${canonical}" />
<meta property="og:title" content="${esc(p.title)}" />
<meta property="og:description" content="${esc(p.description)}" />
<meta property="og:image" content="${SITE}/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(p.title)}" />
<meta name="twitter:description" content="${esc(p.description)}" />
<meta name="twitter:image" content="${SITE}/og-image.jpg" />
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': ld })}</script>
<style>${CSS}</style>
</head>
<body>
<main>
<div class="top"><a class="brand" href="/">${NAME}</a><span class="muted">Gratis · código abierto · sin anuncios</span></div>
<p class="crumbs">${crumbHtml}</p>
<h1>${esc(p.h1)}</h1>
<p class="lead">${p.lead}</p>
<a class="cta" href="${esc(p.cta.href)}">${esc(p.cta.text)}</a>
${p.body}
${faqHtml}
<a class="cta" href="${esc(p.cta.href)}">${esc(p.cta.text)}</a>
<footer>
<nav aria-label="Guías del ENURM">
${HUB_LINKS.map(([h, t]) => `<a href="/${h}">${esc(t)}</a>`).join('\n')}
</nav>
<p class="muted">Actualizado el ${TODAY}. ${NAME} no es un sitio oficial del Ministerio de Salud Pública ni de la UASD: confirma fechas y requisitos en la convocatoria oficial. <a href="/privacidad/">Privacidad</a> · <a href="/terminos/">Términos</a></p>
</footer>
</main>
</body>
</html>
`
}

// ---------------------------------------------------------------------------------------------
// Escritura
// ---------------------------------------------------------------------------------------------

for (const p of pages) {
  const dir = join(DIST, p.path)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), render(p))
}

const entries = [
  { loc: `${SITE}/`, changefreq: 'weekly', priority: '1.0' },
  ...pages.map((p) => ({ loc: url(p.path), changefreq: p.changefreq, priority: p.priority })),
  { loc: `${SITE}/privacidad/`, changefreq: 'yearly', priority: '0.3' },
  { loc: `${SITE}/terminos/`, changefreq: 'yearly', priority: '0.3' },
]
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`).join('\n')}
</urlset>
`,
)

console.log(`SEO: ${pages.length} páginas y sitemap con ${entries.length} direcciones en dist/`)
