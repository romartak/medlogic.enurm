// Renderiza todo a out/: posts en PNG y historias y reels en MP4.
// Uso: npm run render            (todo)
//      npm run render -- reel-2  (solo lo que contenga ese texto en el id)
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { getCompositions, renderMedia, renderStill } from '@remotion/renderer'

const filter = process.argv[2] ?? ''
const out = path.resolve('out')
// En la nube ya hay un Chromium instalado; en tu equipo Remotion descarga el suyo.
const local = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'
const browserExecutable = process.env.REMOTION_BROWSER ?? (existsSync(local) ? local : null)

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') })
const comps = (await getCompositions(serveUrl, { browserExecutable })).filter((c) => c.id.includes(filter))

for (const c of comps) {
  const isStill = c.durationInFrames === 1
  const dir = path.join(out, { post: 'posts', story: 'historias', reel: 'reels' }[c.id.split('-')[0]])
  mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${c.id}.${isStill ? 'png' : 'mp4'}`)
  const t = Date.now()
  if (isStill) {
    await renderStill({ composition: c, serveUrl, output: file, browserExecutable })
  } else {
    await renderMedia({ composition: c, serveUrl, codec: 'h264', crf: 20, pixelFormat: 'yuv420p', outputLocation: file, browserExecutable, concurrency: 4 })
  }
  console.log(`✓ ${path.relative(process.cwd(), file)} (${((Date.now() - t) / 1000).toFixed(1)} s)`)
}
