/**
 * Después de `vite build`: lista en dist/precache.json los archivos que «Guardar para estudiar sin conexión»
 * descarga (la app completa y el banco de preguntas), con su peso total para mostrarlo antes de descargar.
 * Los videos de la portada y las páginas de SEO se quedan fuera: no hacen falta para estudiar.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const DIST = resolve(import.meta.dirname, '..', 'dist')
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)).map((f) => `${n}/${f}`) : [n]))

const files = ['./', ...walk(join(DIST, 'assets')).map((f) => `assets/${f}`), 'data/questions.json', 'theme-init.js', 'inapp-gate.js', 'manifest.webmanifest', 'favicon.svg']
const bytes = files.reduce((sum, f) => {
  const path = f === './' ? 'index.html' : f
  try {
    return sum + statSync(join(DIST, path)).size
  } catch {
    return sum
  }
}, 0)

// Una huella del contenido: cambia cuando se publica una versión nueva.
const stamp = readFileSync(join(DIST, 'index.html'), 'utf8').length
writeFileSync(join(DIST, 'precache.json'), JSON.stringify({ version: String(stamp), bytes, files }))
console.log(`precache.json: ${files.length} archivos, ${(bytes / 1048576).toFixed(1)} MB`)
