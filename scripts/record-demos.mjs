/**
 * Graba los cuatro videos de la portada (public/demo/*.mp4 y su póster .webp) con la app real.
 *
 * Uso:
 *   npm run build && npx vite preview --port 4173 &
 *   node scripts/record-demos.mjs            # los cuatro
 *   node scripts/record-demos.mjs pregunta   # solo uno
 *
 * Necesita Playwright con Chromium (no es dependencia del proyecto: `npm i -g playwright`) y ffmpeg.
 * Cada video parte de datos sembrados (scripts/demo-seed.mjs), así que no aparecen avisos de logros
 * ni pantallas de carga, y termina fundiéndose con su primer cuadro para que el bucle no salte.
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { demoStorage } from './demo-seed.mjs'

const require = createRequire(import.meta.url)
function loadPlaywright() {
  try {
    return require('playwright')
  } catch {
    // Instalación global (npm i -g playwright).
    const root = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()
    return require(join(root, 'playwright'))
  }
}
const { chromium } = loadPlaywright()

const BASE = process.env.DEMO_URL ?? 'http://localhost:4173/'
const OUT = new URL('../public/demo/', import.meta.url).pathname
const raw = JSON.parse(readFileSync(new URL('../public/data/questions.json', import.meta.url), 'utf8'))

/** Preguntas de muestra (src/data/sampleQuestions.ts): un arreglo literal; sus ids son muestra-001, muestra-002… */
function sampleQuestions() {
  const src = readFileSync(new URL('../src/data/sampleQuestions.ts', import.meta.url), 'utf8')
  const head = 'const RAW: Q[] = '
  const from = src.indexOf(head) + head.length
  const rows = new Function(`return ${src.slice(from, src.indexOf('\n]\n', from) + 2)}`)()
  return rows.map(([specialty, topic, stem, options, answer], i) => ({ id: `muestra-${String(i + 1).padStart(3, '0')}`, specialty, topic, stem, options, answer }))
}
const BANK = [...(Array.isArray(raw) ? raw : raw.questions), ...sampleQuestions()]

/** Toques visibles (un círculo que se expande y se apaga) y sin confeti tapando la pantalla. */
function pageHelpers() {
  window.__tap = (x, y) => {
    const d = document.createElement('div')
    d.style.cssText = `position:fixed;left:${x - 22}px;top:${y - 22}px;width:44px;height:44px;border-radius:50%;background:rgb(15 23 42/.16);border:2px solid rgb(255 255 255/.85);box-shadow:0 2px 10px rgb(15 23 42/.18);pointer-events:none;z-index:2147483647`
    document.documentElement.appendChild(d)
    d.animate(
      [
        { transform: 'scale(.55)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1, offset: 0.35 },
        { transform: 'scale(1.2)', opacity: 0 },
      ],
      { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' },
    ).onfinish = () => d.remove()
  }
  addEventListener('DOMContentLoaded', () => {
    const s = document.createElement('style')
    s.textContent = 'body > canvas { display: none !important }'
    document.head.appendChild(s)
  })
}

/** Math.random con semilla: el mismo simulacro en cada grabación. */
function seededRandom(seed) {
  let a = seed >>> 0
  Math.random = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const wait = (page, ms) => page.waitForTimeout(ms)

/** ¿El centro del elemento está a la vista y sin nada encima (la barra inferior, por ejemplo)? */
const reachable = (locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return !!hit && (hit === el || el.contains(hit))
  })

async function tap(page, locator, after = 0) {
  await locator.waitFor()
  if (!(await reachable(locator))) {
    // Se desplaza a la vista como lo haría una persona, sin saltos.
    const y = await locator.evaluate((el) => {
      const r = el.getBoundingClientRect()
      return scrollY + r.top + r.height / 2 - innerHeight * 0.45
    })
    await scrollTo(page, y, 450)
    await wait(page, 120)
  }
  const box = await locator.boundingBox()
  if (!box) throw new Error('Elemento sin caja: ' + locator)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.evaluate(([x, y]) => window.__tap(x, y), [x, y])
  await wait(page, 140)
  await page.mouse.click(x, y)
  if (after) await wait(page, after)
}

/** Desplazamiento suave con su propia curva (el de la página puede estar desactivado). */
async function scrollTo(page, target, ms = 900) {
  await page.evaluate(
    ([target, ms]) =>
      new Promise((done) => {
        const y =
          typeof target === 'number'
            ? target
            : (() => {
                // El elemento más pequeño que contiene el texto (no el contenedor que lo envuelve todo).
                const el = [...document.querySelectorAll(target.sel)]
                  .filter((e) => !target.text || e.textContent.includes(target.text))
                  .sort((a, b) => a.textContent.length - b.textContent.length)[0]
                return el ? el.getBoundingClientRect().top + scrollY - target.offset : scrollY
              })()
        const from = scrollY
        const to = Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight))
        const t0 = performance.now()
        const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
        const step = (now) => {
          const p = Math.min(1, (now - t0) / ms)
          window.scrollTo({ top: from + (to - from) * ease(p), behavior: 'instant' })
          if (p < 1) requestAnimationFrame(step)
          else done()
        }
        requestAnimationFrame(step)
      }),
    [target, ms],
  )
}

/** Opción correcta (o una incorrecta) de la pregunta que está en pantalla, buscada por su enunciado. */
async function optionFor(page, { wrong = false } = {}) {
  // Mientras una pregunta sale y entra la siguiente hay dos tarjetas: se espera a que quede una.
  await page.waitForFunction(() => document.querySelectorAll('[role=radiogroup]').length === 1)
  const group = page.getByRole('radiogroup')
  const norm = (s) => s.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()
  const stem = norm(await group.locator('xpath=preceding-sibling::p[1]').innerText())
  const q = BANK.find((q) => norm(q.stem) === stem) ?? BANK.find((q) => stem.startsWith(norm(q.stem).slice(0, 50)))
  if (!q) throw new Error('No encontré la pregunta en pantalla: ' + stem)
  // Las opciones no se barajan (ajuste por defecto), así que su posición es su índice en el banco.
  return group.getByRole('radio').nth(wrong ? (q.answer + 1) % q.options.length : q.answer)
}

/**
 * Graba la pantalla mientras corre `script`. `mark.speed(n)` acelera lo que sigue (n = 1 vuelve a normal).
 * Devuelve la lista de cuadros con la duración que tendrá cada uno en el video.
 */
async function capture(page, script) {
  const cdp = await page.context().newCDPSession(page)
  const frames = []
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    frames.push({ t: metadata.timestamp, data })
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  })
  const speeds = [{ t: 0, f: 1 }]
  const now = () => Date.now() / 1000
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1 })
  // Un repintado mínimo para tener el primer cuadro aunque la pantalla esté quieta.
  await page.evaluate(() => document.documentElement.style.setProperty('--rec', String(Math.random())))
  await wait(page, 200)
  const start = now()
  await script({ speed: (f) => speeds.push({ t: now(), f }) })
  const end = now()
  await cdp.send('Page.stopScreencast')

  const kept = frames.filter((fr, i) => fr.t >= start || frames[i + 1]?.t > start)
  if (kept.length) kept[0].t = Math.max(kept[0].t, start)
  const factor = (t) => speeds.filter((s) => s.t <= t).at(-1).f
  return kept.map((fr, i) => ({ data: fr.data, dur: ((kept[i + 1]?.t ?? end) - fr.t) / factor(fr.t) }))
}

function encode(id, frames) {
  const dir = mkdtempSync(join(tmpdir(), `demo-${id}-`))
  const list = []
  frames.forEach((fr, i) => {
    if (fr.dur <= 0) return
    const f = join(dir, `${String(i).padStart(5, '0')}.jpg`)
    writeFileSync(f, Buffer.from(fr.data, 'base64'))
    list.push(`file '${f}'`, `duration ${fr.dur.toFixed(4)}`)
  })
  list.push(list.at(-2)) // el concat ignora la duración del último cuadro si no se repite
  writeFileSync(join(dir, 'list.txt'), list.join('\n'))
  const total = frames.reduce((s, f) => s + Math.max(0, f.dur), 0)
  const first = join(dir, '00000.jpg')
  const fade = 0.45
  const size = 'scale=540:-2:flags=bicubic+accurate_rnd+full_chroma_int'
  execFileSync('ffmpeg', [
    '-v', 'error', '-y',
    '-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'),
    '-loop', '1', '-t', String(fade + 0.1), '-i', first,
    '-filter_complex',
    `[0]fps=30,${size},setsar=1,format=yuv420p[a];[1]fps=30,${size},setsar=1,format=yuv420p[b];[a][b]xfade=transition=fade:duration=${fade}:offset=${(total - fade).toFixed(3)}`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-an',
    join(OUT, `${id}.mp4`),
  ])
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', first, '-vf', size, '-quality', '80', join(OUT, `${id}.webp`)])
  if (process.env.KEEP_FRAMES) console.log('cuadros en', dir)
  else rmSync(dir, { recursive: true, force: true })
  return total
}

const DEMOS = {
  /** Una pregunta de Cardiología: se responde y se recorre la explicación. */
  async pregunta(page) {
    const target = BANK.find((q) => q.id === 'bq-211_79')
    await page.goto(`${BASE}#/practica?specialty=${target.specialty}&count=20&auto=1`)
    await page.getByText(target.stem).waitFor()
    await wait(page, 600)
    return capture(page, async () => {
      await wait(page, 1100)
      await tap(page, page.locator('main button').filter({ hasText: target.options[target.answer] }), 1500)
      await scrollTo(page, { sel: 'main *', text: 'Fisiopatología', offset: 300 }, 1100)
      await wait(page, 1700)
      await scrollTo(page, { sel: 'main *', text: 'Análisis de cada opción', offset: 90 }, 1100)
      await wait(page, 2200)
    })
  },

  /** Simulacro de 20: dos preguntas a ritmo normal, el resto acelerado y la nota final (16 de 20). */
  async simulacro(page) {
    await page.goto(`${BASE}#/simulacro?count=20&start=1`)
    await page.getByText('Simulacro personalizado').first().waitFor()
    await wait(page, 600)
    const wrongAt = new Set([4, 9, 13, 17])
    return capture(page, async ({ speed }) => {
      for (let i = 0; i < 20; i++) {
        const normal = i < 2
        speed(normal ? 1 : 8)
        await wait(page, normal ? 900 : 300)
        await tap(page, await optionFor(page, { wrong: wrongAt.has(i) }), normal ? 650 : 250)
        if (i < 19) await tap(page, page.locator('main button:has(svg.lucide-arrow-right)').last(), normal ? 350 : 250)
      }
      speed(1)
      await tap(page, page.getByRole('button', { name: 'Entregar' }).first(), 900)
      await tap(page, page.getByRole('dialog').getByRole('button', { name: 'Entregar', exact: true }), 2600)
      await scrollTo(page, { sel: 'h2, h3', text: 'Resultado por especialidad', offset: 80 }, 1100)
      await wait(page, 1900)
    })
  },

  /** El inicio: se baja al plan del día, se marcan tres tareas y se vuelve arriba. */
  async plan(page) {
    await page.goto(`${BASE}#/inicio`)
    await page.getByText('Tu plan de hoy').waitFor()
    await wait(page, 1500)
    return capture(page, async () => {
      await wait(page, 1200)
      await scrollTo(page, { sel: 'h2, h3, div', text: 'Tu plan de hoy', offset: 84 }, 1000)
      await wait(page, 500)
      const checks = page.getByRole('button', { name: 'Marcar como hecha' })
      for (let i = 0; i < 3; i++) await tap(page, checks.first(), 850)
      await wait(page, 900)
      await scrollTo(page, 0, 1000)
      await wait(page, 700)
    })
  },

  /** Flashcards: tres tarjetas, mostrando la respuesta y calificándola. */
  async flashcards(page) {
    await page.goto(`${BASE}#/flashcards/todas/estudiar`)
    await page.getByRole('button', { name: /Mostrar respuesta/ }).waitFor()
    await wait(page, 600)
    return capture(page, async () => {
      for (const grade of ['Bien', 'Fácil', 'Bien']) {
        await wait(page, 900)
        await tap(page, page.getByRole('button', { name: /Mostrar respuesta/ }), 1300)
        await tap(page, page.locator('main button').filter({ hasText: grade }).first(), 500)
      }
      await wait(page, 700)
    })
  },
}

/** Datos sembrados por video: en la práctica, la pregunta elegida es la única nueva de su especialidad. */
function storageFor(id) {
  const st = demoStorage()
  if (id !== 'pregunta') return st
  const data = JSON.parse(st['medlogic-progress'])
  const seen = (id, answer) => (data.state.attempts[id] ??= { seen: 1, correct: 1, lastCorrect: true, lastAt: Date.now() - 172_800_000, lastChoice: answer })
  delete data.state.attempts['bq-211_79']
  for (const q of BANK) if (q.specialty === 'cardiologia' && q.id !== 'bq-211_79') seen(q.id, q.answer)
  return { 'medlogic-progress': JSON.stringify(data) }
}

const only = process.argv.slice(2)
// Sin esta opción la captura de pantalla de Chrome sin ventana sale a 1×, aunque la página se pinte a 2×.
const browser = await chromium.launch({ args: ['--force-device-scale-factor=2'] })
for (const id of Object.keys(DEMOS)) {
  if (only.length && !only.includes(id)) continue
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-DO', colorScheme: 'light', reducedMotion: 'no-preference' })
  await ctx.addInitScript((st) => {
    if (sessionStorage.getItem('demo-seeded')) return
    localStorage.clear()
    for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v)
    sessionStorage.setItem('demo-seeded', '1')
  }, storageFor(id))
  // Con esta semilla las dos primeras preguntas del simulacro (Meckel y tétanos) están bien redactadas.
  await ctx.addInitScript(seededRandom, 11)
  await ctx.addInitScript(pageHelpers)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error(`[${id}]`, e.message))
  const frames = await DEMOS[id](page).catch(async (e) => {
    await page.screenshot({ path: join(tmpdir(), `demo-${id}-error.png`) })
    throw e
  })
  const secs = encode(id, frames)
  console.log(`${id}: ${frames.length} cuadros, ${secs.toFixed(1)} s`)
  await ctx.close()
}
await browser.close()
