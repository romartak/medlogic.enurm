/**
 * Páginas estáticas para buscadores. La app usa rutas con # (HashRouter) y Google no indexa
 * esas direcciones, así que el contenido que debe aparecer en búsquedas se publica además como
 * HTML plano en public/: una guía del ENURM, el banco por especialidad con preguntas resueltas
 * y el simulacro. Se generan con `npm run build` (scripts/build-seo.ts) a partir del banco real,
 * así que los conteos y los años se actualizan solos cuando entran preguntas nuevas.
 */
import type { Question } from '@/types'
import { enurmDate, formatEnurmDate, type EnurmDate } from '@/data/enurm'

/** Dirección pública. Al comprar un dominio, cambia esto y el canonical de index.html. */
export const SITE = 'https://medlogicenurm.vercel.app'

export interface SeoSpecialty {
  id: string
  name: string
}

export interface SeoPage {
  /** Ruta con barra final, por ejemplo `enurm/`. La portada no se genera aquí. */
  path: string
  title: string
  html: string
  priority: number
  changefreq: 'weekly' | 'monthly'
}

export interface SeoInput {
  questions: Question[]
  specialties: SeoSpecialty[]
  next: EnurmDate
  nextLabel: string
  facts: { questions: number; minutes: number; minScore: number; validYears: number; official: string; organizer: string }
  /** Cuántas preguntas resueltas se muestran en cada página de especialidad. */
  perSpecialty?: number
  /** Especialidades con menos preguntas no tienen página propia. */
  minPerSpecialty?: number
}

export const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const fmt = (n: number) => n.toLocaleString('es-DO').replace(/,/g, '.')
const LETTERS = 'ABCDEFGH'

export const yearsOfQ = (q: Question): number[] => (q.years?.length ? q.years : q.year ? [q.year] : [])

/** Primer y último año del banco (solo años del examen real). */
export function yearRange(qs: Question[]): [number, number] | null {
  const ys = qs.flatMap(yearsOfQ).filter((y) => y >= 1990)
  return ys.length ? [Math.min(...ys), Math.max(...ys)] : null
}

/** Preguntas que se muestran resueltas: completas, sin «Respuesta por confirmar», de las más recientes a las más antiguas. */
export function showcase(qs: Question[], n: number): Question[] {
  const seen = new Set<string>()
  return qs
    .filter((q) => !q.review && q.explanation && q.optionExplanations?.length === q.options.length && q.optionExplanations.every(Boolean) && new Set(q.options).size === q.options.length)
    .sort((a, b) => Math.max(0, ...yearsOfQ(b)) - Math.max(0, ...yearsOfQ(a)) || a.id.localeCompare(b.id))
    .filter((q) => {
      const k = q.stem.trim().toLowerCase()
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, n)
}

const MARK = `<svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true"><rect width="64" height="64" rx="18" fill="#078377"/><path d="M9 40H15L22 18 32 44 42 18 49 40H52" fill="none" stroke="#fff" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="56" cy="40" r="3.2" fill="#a7f3d0"/></svg>`

const CSS = `:root{--bg:#f6f8fb;--surface:#fff;--text:#0f172a;--muted:#51606f;--brand:#075f58;--accent:#0ba595;--border:#e2e8f0;--soft:#eef6f4}
@media (prefers-color-scheme:dark){:root{--bg:#070b14;--surface:#0e1524;--text:#e2e8f0;--muted:#9fb0c6;--brand:#2dd4bf;--accent:#2dd4bf;--border:#1e293b;--soft:#0f2a2a}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--brand)}a:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:2px;border-radius:6px}
.wrap{max-width:820px;margin:0 auto;padding:0 20px}
header{background:var(--surface);border-bottom:1px solid var(--border)}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:64px;flex-wrap:wrap;padding-top:8px;padding-bottom:8px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:18px;color:var(--text);text-decoration:none}
.brand small{display:block;font-size:10px;letter-spacing:.3em;color:var(--brand)}
nav.top{display:flex;gap:16px;flex-wrap:wrap;font-size:15px}nav.top a{text-decoration:none;font-weight:600;padding:10px 0}
.cta{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 20px;border-radius:12px;background:#075f58;color:#fff!important;font-weight:700;text-decoration:none}
.cta.alt{background:transparent;color:var(--brand)!important;box-shadow:inset 0 0 0 2px var(--border)}
main{padding:28px 0 56px}
.crumbs{font-size:14px;color:var(--muted)}.crumbs a{color:var(--muted)}
h1{font-size:clamp(1.9rem,5vw,2.6rem);line-height:1.15;letter-spacing:-.02em;margin:.4em 0 .3em}
h2{font-size:1.4rem;line-height:1.25;margin:2em 0 .5em}h3{font-size:1.1rem;margin:1.4em 0 .4em}
.lead{font-size:1.15rem;color:var(--muted)}
.card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px 20px;margin:14px 0}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:18px 0}
.fact{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:14px 16px}
.fact b{display:block;font-size:1.8rem;line-height:1.1;color:var(--brand)}.fact span{font-size:14px;color:var(--muted)}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.chip{font-size:13px;font-weight:600;padding:4px 10px;border-radius:999px;background:var(--soft);color:var(--brand)}
table{width:100%;border-collapse:collapse;font-size:15px}th,td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--border)}th{font-size:13px;color:var(--muted)}
td.n{text-align:right;font-variant-numeric:tabular-nums}
ol.opts{list-style:none;padding:0;margin:10px 0}ol.opts li{padding:8px 12px;border:1px solid var(--border);border-radius:10px;margin:6px 0}
ol.opts li b{margin-right:6px}
details{margin-top:10px}summary{cursor:pointer;font-weight:700;color:var(--brand);min-height:44px;display:flex;align-items:center}
.ok{background:var(--soft);border-radius:12px;padding:12px 14px;margin:8px 0}
.why li{margin:6px 0}.muted{color:var(--muted);font-size:14px}
.row{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}
footer{border-top:1px solid var(--border);padding:24px 0 40px;font-size:14px;color:var(--muted)}footer a{color:var(--muted)}
footer .links{display:flex;flex-wrap:wrap;gap:6px 16px;margin-bottom:10px}`

function layout(o: { path: string; title: string; description: string; h1: string; crumbs: [string, string][]; body: string; jsonld?: object[] }) {
  const url = `${SITE}/${o.path}`
  const crumbs: [string, string][] = [['Inicio', ''], ...o.crumbs]
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}/${p}` })),
  }
  const graph = { '@context': 'https://schema.org', '@graph': [breadcrumb, ...(o.jsonld ?? [])] }
  return `<!doctype html>
<html lang="es-DO">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}" />
<link rel="canonical" href="${url}" />
<link rel="alternate" hreflang="es-DO" href="${url}" />
<link rel="alternate" hreflang="x-default" href="${url}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta name="theme-color" content="#075f58" />
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="MedLogic ENURM" />
<meta property="og:locale" content="es_DO" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${esc(o.title)}" />
<meta property="og:description" content="${esc(o.description)}" />
<meta property="og:image" content="${SITE}/og-image.jpg" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>
<style>${CSS}</style>
</head>
<body>
<header><div class="wrap">
<a class="brand" href="/">${MARK}<span>MedLogic<small>ENURM</small></span></a>
<nav class="top" aria-label="Secciones"><a href="/enurm/">Guía del ENURM</a><a href="/preguntas-enurm/">Preguntas</a><a href="/simulacro-enurm/">Simulacro</a></nav>
</div></header>
<main class="wrap">
<nav class="crumbs" aria-label="Ruta">${crumbs.map(([n, p], i) => (i < crumbs.length - 1 ? `<a href="/${p}">${esc(n)}</a> › ` : esc(n))).join('')}</nav>
<h1>${o.h1}</h1>
${o.body}
</main>
<footer><div class="wrap">
<div class="links"><a href="/">MedLogic ENURM</a><a href="/enurm/">Guía del ENURM</a><a href="/preguntas-enurm/">Preguntas por especialidad</a><a href="/simulacro-enurm/">Simulacro</a><a href="/fecha-del-enurm/">Fecha del ENURM</a><a href="/como-prepararse-para-el-enurm/">Cómo prepararse</a><a href="/privacidad/">Privacidad</a><a href="/terminos/">Términos</a><a href="https://www.instagram.com/medlogic.ai/" rel="me">Instagram</a></div>
<p>MedLogic ENURM es un proyecto gratuito y de código abierto de MedLogic AI. Contenido educativo: verifica siempre la convocatoria oficial y la bibliografía.</p>
</div></footer>
</body>
</html>
`
}

function questionHtml(q: Question, i: number) {
  const ex = q.optionExplanations ?? []
  const refs = (q.references ?? []).map((r) => r.citation).filter(Boolean)
  return `<article class="card" id="${esc(q.id)}">
<div class="chips">${yearsOfQ(q).length ? `<span class="chip">ENURM ${yearsOfQ(q).join(', ')}</span>` : ''}${q.topic ? `<span class="chip">${esc(q.topic)}</span>` : ''}</div>
<h3>${i + 1}. ${esc(q.stem)}</h3>
<ol class="opts">${q.options.map((o, k) => `<li><b>${LETTERS[k]})</b>${esc(o)}</li>`).join('')}</ol>
<details><summary>Ver la respuesta y la explicación</summary>
<p class="ok"><b>Respuesta correcta: ${LETTERS[q.answer]}) ${esc(q.options[q.answer])}.</b> ${esc(q.explanation)}</p>
${ex.length ? `<ul class="why">${ex.map((e, k) => `<li><b>${LETTERS[k]})</b> ${esc(e)}</li>`).join('')}</ul>` : ''}
${q.keyPoints?.length ? `<p><b>Puntos clave:</b></p><ul>${q.keyPoints.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>` : ''}
${refs.length ? `<p class="muted">Bibliografía: ${refs.map(esc).join(' · ')}</p>` : ''}
</details>
</article>`
}

export function buildSeoPages(input: SeoInput): SeoPage[] {
  const { questions, specialties, next, nextLabel, facts } = input
  const per = input.perSpecialty ?? 12
  const minPer = input.minPerSpecialty ?? 8
  // Preguntas de exámenes reales: las que tienen año y las de la recopilación cuyo año no se identificó (159 hoy).
  const real = questions.filter((q) => yearsOfQ(q).length || q.tags?.includes('banco-recopilado'))
  const range = yearRange(real)
  const since = range ? range[0] : 2002
  const until = range ? range[1] : since
  const total = real.length
  const totalLabel = `más de ${fmt(Math.floor(total / 100) * 100)}`
  const counts = specialties
    .map((s) => ({ ...s, n: real.filter((q) => q.specialty === s.id).length }))
    .filter((s) => s.n > 0)
    .sort((a, b) => b.n - a.n)
  const withPage = counts.filter((s) => s.n >= minPer)
  const pages: SeoPage[] = []
  const appCta = (href: string, label: string) => `<div class="row"><a class="cta" href="${href}">${label}</a><a class="cta alt" href="/">Conoce MedLogic ENURM</a></div>`

  /* Guía del ENURM */
  const faqs: [string, string][] = [
    [`¿Cuándo es el ENURM ${next.year}?`, next.confirmed ? `El ENURM ${next.year} es el ${nextLabel}.` : `Se espera para el ${nextLabel}: el examen se aplica el primer domingo de marzo. La fecha se confirma en la convocatoria oficial.`],
    ['¿Cuántas preguntas tiene el ENURM?', `${facts.questions} preguntas de selección múltiple en unas 2 horas (${facts.minutes} minutos): alrededor de ${Math.round((facts.minutes * 60) / facts.questions)} segundos por pregunta.`],
    ['¿Qué puntaje necesito para concursar?', `${facts.minScore} puntos o más de 100 para concursar por una plaza de especialidad. La calificación vale ${facts.validYears} años.`],
    ['¿Quién aplica el ENURM?', `Lo aplica la ${facts.organizer}. El concurso de residencias lo convoca el Ministerio de Salud Pública.`],
    ['¿Cómo me preparo gratis para el ENURM?', `En MedLogic ENURM tienes ${totalLabel} preguntas de exámenes desde ${since} explicadas opción por opción, simulacros con el formato real, flashcards y un plan de estudio diario. Es gratis y sin anuncios.`],
  ]
  pages.push({
    path: 'enurm/',
    title: `ENURM ${next.year}: fecha, formato, puntaje y cómo prepararte | MedLogic`,
    priority: 0.9,
    changefreq: 'monthly',
    html: layout({
      path: 'enurm/',
      title: `ENURM ${next.year}: fecha, formato, puntaje y cómo prepararte | MedLogic`,
      description: `Todo sobre el ENURM ${next.year}: ${next.confirmed ? 'fecha' : 'fecha esperada'}, ${facts.questions} preguntas en ${facts.minutes} minutos, puntaje mínimo de ${facts.minScore}, qué especialidades entran más y cómo prepararte gratis.`,
      h1: `ENURM ${next.year}: lo que necesitas saber`,
      crumbs: [['Guía del ENURM', 'enurm/']],
      body: `<p class="lead">El Examen Nacional Único de Residencias Médicas (ENURM) es el examen que abre el concurso de residencias médicas en República Dominicana. Aquí tienes la fecha, el formato, el puntaje y qué temas aparecen más, con datos del banco de MedLogic ENURM.</p>
<div class="facts">
<div class="fact"><b>${esc(nextLabel.replace(/ de \d{4}$/, ''))}</b><span>${next.confirmed ? `fecha del ENURM ${next.year}` : `fecha esperada del ENURM ${next.year}`}</span></div>
<div class="fact"><b>${facts.questions}</b><span>preguntas de selección múltiple</span></div>
<div class="fact"><b>${facts.minutes} min</b><span>≈ ${Math.round((facts.minutes * 60) / facts.questions)} s por pregunta</span></div>
<div class="fact"><b>${facts.minScore}</b><span>puntos para concursar</span></div>
<div class="fact"><b>${facts.validYears} años</b><span>vale la calificación</span></div>
</div>
<h2>¿Cuándo es el ENURM ${next.year}?</h2>
<p>${next.confirmed ? `El ENURM ${next.year} es el <b>${esc(nextLabel)}</b>, según la convocatoria oficial.` : `El ENURM se aplica el <b>primer domingo de marzo</b>. Para ${next.year} eso es el <b>${esc(nextLabel)}</b>: es la fecha esperada hasta que se publique la convocatoria oficial.`} Consulta siempre la convocatoria en <a href="${facts.official}" rel="noopener">${esc(facts.official.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>.</p>
<h2>¿Cómo es el examen?</h2>
<p>Son <b>${facts.questions} preguntas de selección múltiple</b> de todas las áreas de la medicina, en unas 2 horas. Eso deja alrededor de ${Math.round((facts.minutes * 60) / facts.questions)} segundos por pregunta, así que el manejo del tiempo cuenta tanto como lo que sabes. Lo aplica la ${esc(facts.organizer)}.</p>
<h2>¿Qué puntaje necesitas?</h2>
<p>Necesitas <b>${facts.minScore} puntos o más</b> de 100 para concursar por una plaza de especialidad, y la calificación vale <b>${facts.validYears} años</b>.</p>
<h2>¿Qué especialidades aparecen más?</h2>
<p>Así se reparten las ${fmt(total)} preguntas de exámenes ENURM de ${since} a ${until} que reúne MedLogic ENURM. Es una buena guía para repartir tu tiempo de estudio:</p>
<table><thead><tr><th>Especialidad</th><th class="n">Preguntas</th><th class="n">% del banco</th></tr></thead><tbody>
${counts.slice(0, 12).map((s) => `<tr><td>${withPage.includes(s) ? `<a href="/preguntas-enurm/${s.id}/">${esc(s.name)}</a>` : esc(s.name)}</td><td class="n">${fmt(s.n)}</td><td class="n">${((s.n / total) * 100).toFixed(1).replace('.', ',')} %</td></tr>`).join('')}
</tbody></table>
<h2>Cómo prepararte gratis</h2>
<ul>
<li><b>Practica con preguntas reales explicadas.</b> En <a href="/preguntas-enurm/">el banco</a> cada pregunta trae por qué cada opción es correcta o incorrecta, la fisiopatología y la bibliografía.</li>
<li><b>Entrena el tiempo con simulacros.</b> Un <a href="/simulacro-enurm/">simulacro</a> de ${facts.questions} preguntas en ${facts.minutes} minutos te acostumbra al ritmo del examen.</li>
<li><b>Repasa con repetición espaciada.</b> Las flashcards te muestran cada tarjeta justo antes de olvidarla.</li>
<li><b>Sigue un plan diario.</b> MedLogic ENURM arma qué estudiar cada día según la fecha del examen y tus resultados.</li>
</ul>
${appCta('/#/plan', 'Haz tu plan de estudio gratis')}
<h2>Preguntas frecuentes</h2>
${faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}`,
      jsonld: [
        {
          '@type': 'FAQPage',
          mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
        },
      ],
    }),
  })

  /* Banco: índice por especialidad */
  pages.push({
    path: 'preguntas-enurm/',
    title: `Preguntas del ENURM con respuestas explicadas, por especialidad | MedLogic`,
    priority: 0.9,
    changefreq: 'weekly',
    html: layout({
      path: 'preguntas-enurm/',
      title: `Preguntas del ENURM con respuestas explicadas, por especialidad | MedLogic`,
      description: `${fmt(total)} preguntas de exámenes ENURM de ${since} a ${until}, con la explicación de cada opción, fisiopatología y bibliografía. Gratis y por especialidad.`,
      h1: 'Preguntas del ENURM con respuestas explicadas',
      crumbs: [['Preguntas del ENURM', 'preguntas-enurm/']],
      body: `<p class="lead">MedLogic ENURM reúne <b>${fmt(total)} preguntas de exámenes ENURM de ${since} a ${until}</b>, y cada año se suman las del examen nuevo. Cada pregunta trae la explicación de todas sus opciones, la fisiopatología, los puntos clave y la bibliografía.</p>
<div class="facts">
<div class="fact"><b>${fmt(total)}</b><span>preguntas del ENURM</span></div>
<div class="fact"><b>${since}–${until}</b><span>años de examen</span></div>
<div class="fact"><b>${counts.length}</b><span>especialidades</span></div>
<div class="fact"><b>12.000</b><span>nuestra meta</span></div>
</div>
<h2>Elige una especialidad</h2>
<table><thead><tr><th>Especialidad</th><th class="n">Preguntas</th></tr></thead><tbody>
${counts.map((s) => `<tr><td>${withPage.includes(s) ? `<a href="/preguntas-enurm/${s.id}/">Preguntas del ENURM de ${esc(s.name)}</a>` : esc(s.name)}</td><td class="n">${fmt(s.n)}</td></tr>`).join('')}
</tbody></table>
<h2>Prueba con estas preguntas</h2>
${showcase(real, 3).map(questionHtml).join('\n')}
${appCta('/#/practica', 'Practicar todas las preguntas gratis')}`,
      jsonld: [{ '@type': 'CollectionPage', name: 'Preguntas del ENURM por especialidad', url: `${SITE}/preguntas-enurm/`, inLanguage: 'es-DO', isPartOf: { '@id': `${SITE}/#website` } }],
    }),
  })

  /* Una página por especialidad */
  for (const s of withPage) {
    const qs = real.filter((q) => q.specialty === s.id)
    const r = yearRange(qs)
    const shown = showcase(qs, per)
    const path = `preguntas-enurm/${s.id}/`
    const title = `Preguntas del ENURM de ${s.name} con respuestas | MedLogic`
    pages.push({
      path,
      title,
      priority: 0.8,
      changefreq: 'weekly',
      html: layout({
        path,
        title,
        description: `${fmt(qs.length)} preguntas del ENURM de ${s.name}${r ? ` (${r[0]}–${r[1]})` : ''} con la respuesta correcta y la explicación de cada opción. Practícalas gratis.`,
        h1: `Preguntas del ENURM de ${esc(s.name)}`,
        crumbs: [['Preguntas del ENURM', 'preguntas-enurm/'], [s.name, path]],
        body: `<p class="lead">${fmt(qs.length)} preguntas de ${esc(s.name)} de exámenes ENURM${r ? ` de ${r[0]} a ${r[1]}` : ''}. Aquí tienes ${shown.length} resueltas; toca «Ver la respuesta» en cada una. Las ${fmt(qs.length)} están en la app, con práctica, simulacros y repaso de errores.</p>
${appCta(`/#/practica?specialty=${s.id}&auto=1`, `Practicar las ${fmt(qs.length)} preguntas de ${esc(s.name)}`)}
<h2>${shown.length} preguntas resueltas de ${esc(s.name)}</h2>
${shown.map(questionHtml).join('\n')}
${appCta(`/#/practica?specialty=${s.id}&auto=1`, `Practicar las ${fmt(qs.length)} preguntas de ${esc(s.name)}`)}
<h2>Otras especialidades</h2>
<p>${withPage.filter((o) => o.id !== s.id).map((o) => `<a href="/preguntas-enurm/${o.id}/">${esc(o.name)}</a>`).join(' · ')}</p>`,
        jsonld: [{ '@type': 'CollectionPage', name: `Preguntas del ENURM de ${s.name}`, url: `${SITE}/${path}`, inLanguage: 'es-DO', about: s.name, isPartOf: { '@id': `${SITE}/#website` } }],
      }),
    })
  }

  /* Simulacro */
  const secs = Math.round((facts.minutes * 60) / facts.questions)
  pages.push({
    path: 'simulacro-enurm/',
    title: `Simulacro del ENURM gratis: ${facts.questions} preguntas en ${facts.minutes} minutos | MedLogic`,
    priority: 0.8,
    changefreq: 'monthly',
    html: layout({
      path: 'simulacro-enurm/',
      title: `Simulacro del ENURM gratis: ${facts.questions} preguntas en ${facts.minutes} minutos | MedLogic`,
      description: `Haz un simulacro del ENURM gratis con el formato real: ${facts.questions} preguntas en ${facts.minutes} minutos, resultados por especialidad y un simulacro nacional cada mes con tu percentil.`,
      h1: 'Simulacro del ENURM gratis',
      crumbs: [['Simulacro del ENURM', 'simulacro-enurm/']],
      body: `<p class="lead">El ENURM no solo mide lo que sabes: también cuánto tardas. Con unos ${secs} segundos por pregunta, entrenar con el formato real marca la diferencia.</p>
<div class="facts">
<div class="fact"><b>${facts.questions}</b><span>preguntas, como el examen</span></div>
<div class="fact"><b>${facts.minutes} min</b><span>con reloj</span></div>
<div class="fact"><b>${secs} s</b><span>por pregunta</span></div>
</div>
<h2>Elige tu modo</h2>
<table><thead><tr><th>Modo</th><th>Preguntas</th><th>Tiempo</th></tr></thead><tbody>
<tr><td>Completo</td><td>${facts.questions}</td><td>${facts.minutes} minutos, igual que el ENURM</td></tr>
<tr><td>Medio</td><td>50</td><td>60 minutos</td></tr>
<tr><td>Rápido</td><td>20</td><td>24 minutos</td></tr>
<tr><td>Personalizado</td><td>Tú decides</td><td>Tú decides</td></tr>
</tbody></table>
<h2>Cómo funciona</h2>
<ul>
<li>Las preguntas salen de exámenes ENURM de ${since} a ${until}, repartidas por especialidad como en el examen.</li>
<li>No ves las respuestas hasta el final, igual que el día del examen.</li>
<li>Al entregar ves tu puntaje sobre 100, tu resultado por especialidad y la explicación de cada pregunta.</li>
</ul>
<h2>Simulacro nacional</h2>
<p>Una vez al mes, todos los estudiantes del país hacen el mismo examen. Al terminar ves en qué percentil quedaste: lo más parecido al ENURM real antes del ENURM.</p>
<h2>Consejos para el día del examen</h2>
<ul>
<li>Si una pregunta te toma más de un minuto y medio, márcala y sigue: vuelve al final.</li>
<li>Lee primero la última línea del enunciado: te dice qué te preguntan.</li>
<li>Haz al menos un simulacro completo a la semana en el último mes.</li>
</ul>
${appCta('/#/simulacro', 'Empezar un simulacro gratis')}`,
      jsonld: [{ '@type': 'WebPage', name: 'Simulacro del ENURM gratis', url: `${SITE}/simulacro-enurm/`, inLanguage: 'es-DO', isPartOf: { '@id': `${SITE}/#website` } }],
    }),
  })

  /* Fecha del ENURM */
  const confirmed = [2018, 2019, 2024, 2025, 2026].map((y) => enurmDate(y))
  const fechaFaqs: [string, string][] = [
    [`¿Cuándo es el ENURM ${next.year}?`, next.confirmed ? `El ENURM ${next.year} es el ${nextLabel}.` : `Se espera para el ${nextLabel}: el examen se aplica el primer domingo de marzo. La fecha se confirma en la convocatoria oficial.`],
    ['¿Qué día de la semana se aplica el ENURM?', 'Siempre un domingo: el primer domingo de marzo. Así fue en 2024 (3 de marzo), 2025 (2 de marzo) y 2026 (1 de marzo).'],
    ['¿Dónde veo la convocatoria oficial?', `El Ministerio de Salud Pública publica el aviso del concurso, con requisitos y calendario, en ${facts.official.replace('https://', '')}. Ese aviso manda sobre cualquier fecha proyectada.`],
  ]
  pages.push({
    path: 'fecha-del-enurm/',
    title: `Fecha del ENURM ${next.year}: cuándo es el examen | MedLogic`,
    priority: 0.9,
    changefreq: 'monthly',
    html: layout({
      path: 'fecha-del-enurm/',
      title: `Fecha del ENURM ${next.year}: cuándo es el examen | MedLogic`,
      description: `El ENURM ${next.year} ${next.confirmed ? 'es' : 'se espera'} el ${nextLabel}. Fechas de años anteriores, la regla del primer domingo de marzo y dónde ver la convocatoria oficial.`,
      h1: `Fecha del ENURM ${next.year}`,
      crumbs: [['Fecha del ENURM', 'fecha-del-enurm/']],
      body: `<p class="lead">El ENURM ${next.year} ${next.confirmed ? 'es' : 'se espera'} el <b>${esc(nextLabel)}</b>. ${next.confirmed ? 'La fecha ya está en la convocatoria oficial.' : 'Es una fecha proyectada: el examen se aplica el primer domingo de marzo y se confirma con la convocatoria oficial.'}</p>
<h2>Cuándo se aplica</h2>
<p>Lo aplica la ${esc(facts.organizer)} una vez al año, el <b>primer domingo de marzo</b>. Con esa regla, el ENURM ${next.year} cae el ${esc(nextLabel)}.</p>
<h2>Fechas de convocatorias anteriores</h2>
<table><thead><tr><th>Año</th><th>Fecha</th><th>Fuente</th></tr></thead><tbody>
${confirmed.map((d) => `<tr><td>${d.year}</td><td>${esc(formatEnurmDate(d, { weekday: true }))}</td><td>${d.source ? `<a href="${esc(d.source)}" rel="noopener">${esc(new URL(d.source).hostname.replace('www.', ''))}</a>` : ''}</td></tr>`).join('')}
</tbody></table>
<h2>Convocatoria oficial</h2>
<p>El Ministerio de Salud Pública publica el aviso del concurso en <a href="${esc(facts.official)}" rel="noopener">${esc(facts.official.replace('https://', ''))}</a>. Revísalo siempre: los requisitos y las fechas cambian con cada convocatoria.</p>
<p>Para repartir el tiempo hasta el examen, mira la <a href="/enurm/">guía del ENURM</a> o <a href="/como-prepararse-para-el-enurm/">cómo prepararte</a>.</p>
${appCta('/#/plan', 'Ver la cuenta atrás y armar mi plan')}
<h2>Preguntas frecuentes</h2>
${fechaFaqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}`,
      jsonld: [{ '@type': 'FAQPage', mainEntity: fechaFaqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }],
    }),
  })

  /* Cómo prepararse */
  const prepFaqs: [string, string][] = [
    ['¿Cuántas horas debo estudiar al día?', 'Depende del tiempo que falte y de tus responsabilidades. Es mejor un plan sostenible (por ejemplo, 1–2 horas diarias durante meses) que jornadas largas e irregulares.'],
    ['¿Empiezo por la teoría o por las preguntas?', 'Combina ambas. Al inicio, una guía corta seguida de preguntas del mismo tema. Con el tiempo, las preguntas deben ocupar la mayor parte, porque te enseñan qué y cómo se pregunta.'],
    ['¿Qué hago con las preguntas que fallo?', 'Lee la explicación, anota lo que no sabías y vuelve a responderlas en unos días. Fallar durante la preparación es la mejor forma de no fallar en el examen.'],
  ]
  pages.push({
    path: 'como-prepararse-para-el-enurm/',
    title: 'Cómo prepararse para el ENURM: método y plan semanal | MedLogic',
    priority: 0.8,
    changefreq: 'monthly',
    html: layout({
      path: 'como-prepararse-para-el-enurm/',
      title: 'Cómo prepararse para el ENURM: método y plan semanal | MedLogic',
      description: 'Cómo estudiar para el ENURM con técnicas que funcionan: práctica de recuperación, repetición espaciada, un plan semanal, simulacros y qué hacer el día del examen.',
      h1: 'Cómo prepararse para el ENURM',
      crumbs: [['Cómo prepararse', 'como-prepararse-para-el-enurm/']],
      body: `<p class="lead">Un método claro, de principio a fin, basado en técnicas de estudio con evidencia: practicar recordando, repasar a tiempo y aprender de cada error.</p>
<h2>Seis técnicas que funcionan</h2>
<ul>
<li><b>Práctica de recuperación.</b> Intentar recordar (responder preguntas) fija más que releer.</li>
<li><b>Repetición espaciada.</b> Repasar justo antes de olvidar multiplica la retención a largo plazo. Por eso las flashcards programan cada tarjeta.</li>
<li><b>Práctica intercalada.</b> Mezclar especialidades obliga a identificar el tipo de problema, como en el examen real.</li>
<li><b>Aprender del error.</b> Cada pregunta fallada indica exactamente qué te falta. Lee la explicación y vuelve a ella en unos días.</li>
<li><b>Bloques de concentración.</b> Sesiones de 25–50 minutos sin distracciones, con pausas cortas, rinden más que horas dispersas.</li>
<li><b>Sueño y descanso.</b> Dormir consolida lo aprendido. Un día de descanso a la semana protege contra el agotamiento.</li>
</ul>
<h2>Una semana de ejemplo</h2>
<table><tbody>
<tr><th>Lunes</th><td>Preguntas de la especialidad prioritaria + guía corta + flashcards</td></tr>
<tr><th>Martes</th><td>Segunda especialidad + repaso de errores del lunes</td></tr>
<tr><th>Miércoles</th><td>Preguntas mezcladas + flashcards</td></tr>
<tr><th>Jueves</th><td>Especialidad débil + perlas de su espacio</td></tr>
<tr><th>Viernes</th><td>Preguntas mezcladas + repaso de errores de la semana</td></tr>
<tr><th>Sábado</th><td>Simulacro con tiempo + revisión completa de resultados</td></tr>
<tr><th>Domingo</th><td>Descanso (repaso ligero de flashcards opcional)</td></tr>
</tbody></table>
<h2>El día del examen</h2>
<ul>
<li>Revisa con anticipación lugar, hora y documentos que pide la convocatoria.</li>
<li>Duerme bien la noche anterior; no estudies hasta tarde.</li>
<li>Lee el enunciado completo y todas las opciones antes de responder.</li>
<li>Si una pregunta te traba, márcala y sigue: vuelve al final.</li>
<li>Controla el ritmo: revisa el reloj cada cierto número de preguntas.</li>
</ul>
<p>Practica con el <a href="/preguntas-enurm/">banco de preguntas</a>, mide tu nivel con un <a href="/simulacro-enurm/">simulacro</a> y consulta la <a href="/fecha-del-enurm/">fecha del ENURM ${next.year}</a> para repartir el tiempo.</p>
${appCta('/#/como-prepararte', 'Ver la guía completa y armar mi plan')}
<h2>Preguntas frecuentes</h2>
${prepFaqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}`,
      jsonld: [{ '@type': 'FAQPage', mainEntity: prepFaqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }],
    }),
  })

  return pages
}

/** Sitemap con la portada, las páginas legales y las páginas generadas. */
export function buildSitemap(pages: SeoPage[], lastmod: (path: string) => string) {
  const fixed: [string, string, number][] = [
    ['', 'weekly', 1.0],
    ['privacidad/', 'yearly', 0.3],
    ['terminos/', 'yearly', 0.3],
  ]
  const rows = [...fixed.map(([p, f, pr]) => ({ path: p, changefreq: f, priority: pr })), ...pages]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.map((r) => `  <url>\n    <loc>${SITE}/${r.path}</loc>\n    <lastmod>${lastmod(r.path)}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`).join('\n')}
</urlset>
`
}
