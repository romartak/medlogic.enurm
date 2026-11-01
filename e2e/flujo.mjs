// Prueba de extremo a extremo con un navegador real: portada → simulacro → entrega → resultado → compartir.
// Uso: npm run e2e   (construye la app, la sirve en el puerto 4199 y recorre los flujos principales).
import { spawn, execSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const PORT = 4199
const BASE = `http://localhost:${PORT}/`

const fails = []
const check = (ok, what) => {
  console.log(`${ok ? '✓' : '✗'} ${what}`)
  if (!ok) fails.push(what)
}

if (!process.env.E2E_SKIP_BUILD) execSync('npm run build', { stdio: 'ignore' })
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
const stop = () => server.kill()
process.on('exit', stop)

for (let i = 0; i < 40; i++) {
  try {
    if ((await fetch(BASE)).ok) break
  } catch {
    /* aún arrancando */
  }
  await new Promise((r) => setTimeout(r, 500))
}

const browser = await chromium.launch()
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))

  // 1. Portada
  await page.goto(BASE)
  await page.getByRole('heading', { level: 1 }).first().waitFor({ timeout: 15000 })
  check(true, 'la portada carga')

  // 2. Inicio (cuenta nueva, sin registrarse)
  await page.goto(`${BASE}#/inicio`)
  await page.getByText('Práctica rápida').first().waitFor({ timeout: 20000 })
  check(true, 'el inicio muestra «Práctica rápida»')

  // 3. Práctica: responder una pregunta
  await page.goto(`${BASE}#/practica?auto=1`)
  await page.waitForSelector('main button', { timeout: 20000 })
  check((await page.locator('main button').count()) > 3, 'la práctica muestra una pregunta con opciones')

  // 4. Simulacro: iniciar, entregar y ver el resultado
  await page.goto(`${BASE}#/simulacro`)
  await page.getByRole('button', { name: /Iniciar simulacro/ }).click({ timeout: 20000 })
  await page.getByRole('button', { name: 'Ver todas las preguntas' }).click({ timeout: 15000 })
  check(true, 'el simulacro arranca y muestra la lista de preguntas')
  await page.getByRole('button', { name: 'Entregar examen' }).click()
  await page.getByRole('dialog').getByRole('button', { name: /^Entregar$/ }).click()
  await page.getByText('puntos de 100').waitFor({ timeout: 15000 })
  check(true, 'al entregar se ve el resultado')
  check(await page.getByRole('button', { name: /Compartir mi resultado/ }).isVisible(), 'el resultado ofrece «Compartir mi resultado»')

  // 5. Compartir: genera la imagen (en escritorio se descarga)
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.getByRole('button', { name: /Compartir mi resultado/ }).click()])
  check(download.suggestedFilename() === 'mi-simulacro-medlogic.png', 'compartir genera la imagen del simulacro')

  // 6. Banco: búsqueda sin resultados ofrece quitar filtros
  await page.goto(`${BASE}#/banco?q=zzzzqqqq`)
  await page.getByRole('button', { name: 'Quitar filtros' }).waitFor({ timeout: 20000 })
  check(true, 'el banco sin resultados ofrece «Quitar filtros»')

  check(errors.length === 0, `sin errores de JavaScript${errors.length ? ': ' + errors[0] : ''}`)
} catch (e) {
  fails.push(String(e.message ?? e))
  console.log('✗', e.message ?? e)
} finally {
  await browser.close()
  stop()
}

if (fails.length) {
  console.log(`\n${fails.length} comprobación(es) fallaron`)
  process.exit(1)
}
console.log('\nTodo bien')
