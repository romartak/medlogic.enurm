import { INSTAGRAM_USER } from '@/components/Instagram'

export interface ShareStats {
  /** Puntaje estimado (0–100) o null si todavía hay pocas respuestas. */
  predicted: number | null
  streak: number
  accuracy: number
  answered: number
  level: number
  levelTitle: string
  daysLeft: number | null
}

const W = 1080
const H = 1350
const PULSE = 'M10 34h10l5-12 8 22 6-16 4 6h11'
export const DISPLAY = '"Plus Jakarta Sans Variable", "Inter Variable", system-ui, sans-serif'
export const BODY = '"Inter Variable", system-ui, sans-serif'
export const SITE = 'medlogicenurm.vercel.app'

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

export function logo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const g = ctx.createLinearGradient(x, y, x + size, y + size)
  g.addColorStop(0, '#12b8a6')
  g.addColorStop(1, '#066a60')
  ctx.fillStyle = g
  roundRect(ctx, x, y, size, size, size * 0.25)
  ctx.fill()
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 64, size / 64)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 4.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke(new Path2D(PULSE))
  ctx.restore()
}

/** Imagen vertical (1080×1350) con el progreso, para publicar en Instagram o enviar por WhatsApp. */
export async function makeShareImage(s: ShareStats): Promise<Blob> {
  try {
    await Promise.all([document.fonts.load(`800 64px ${DISPLAY}`), document.fonts.load(`500 28px ${BODY}`)])
  } catch {
    /* si no cargan, se usa la fuente del sistema */
  }
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Fondo
  ctx.fillStyle = '#070b14'
  ctx.fillRect(0, 0, W, H)
  for (const [cx, cy, r, c] of [
    [W * 0.9, 140, 640, 'rgba(20,184,166,0.30)'],
    [W * 0.05, H * 0.95, 620, 'rgba(99,102,241,0.30)'],
  ] as const) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, c)
    g.addColorStop(1, 'rgba(7,11,20,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }

  // Marca
  logo(ctx, 72, 72, 96)
  ctx.fillStyle = '#e8edf5'
  ctx.font = `800 46px ${DISPLAY}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('MedLogic', 192, 120)
  ctx.fillStyle = '#1fe0c9'
  ctx.font = `700 20px ${DISPLAY}`
  ctx.letterSpacing = '7px'
  ctx.fillText('ENURM', 194, 154)
  ctx.letterSpacing = '0px'

  // Título
  ctx.fillStyle = '#94a3b8'
  ctx.font = `600 30px ${BODY}`
  ctx.fillText('Así voy preparándome para el ENURM', 72, 300)

  // Cifra principal
  const main = s.predicted !== null ? `${s.predicted}%` : s.answered.toLocaleString('es-DO')
  const caption = s.predicted !== null ? 'puntaje estimado' : s.answered === 1 ? 'pregunta respondida' : 'preguntas respondidas'
  const g = ctx.createLinearGradient(72, 380, 700, 560)
  g.addColorStop(0, '#2dd4bf')
  g.addColorStop(1, '#818cf8')
  ctx.fillStyle = g
  ctx.font = `800 230px ${DISPLAY}`
  ctx.fillText(main, 64, 560)
  ctx.fillStyle = '#e8edf5'
  ctx.font = `700 44px ${DISPLAY}`
  ctx.fillText(caption, 72, 630)

  // Cuadrícula de datos
  const cells: [string, string][] = [
    [`${s.streak}`, s.streak === 1 ? 'día de racha' : 'días de racha'],
    [`${Math.round(s.accuracy * 100)}%`, 'de precisión'],
  ]
  if (s.daysLeft !== null && s.daysLeft >= 0) cells.push([`${s.daysLeft}`, 'días para el examen'])
  if (s.predicted !== null) cells.push([s.answered.toLocaleString('es-DO'), 'preguntas respondidas'])
  cells.push([`${s.level}`, `nivel · ${s.levelTitle}`])
  cells.splice(4)
  const cw = (W - 72 * 2 - 24) / 2
  cells.forEach(([value, label], i) => {
    const x = 72 + (i % 2) * (cw + 24)
    const y = 720 + Math.floor(i / 2) * 212
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    roundRect(ctx, x, y, cw, 188, 32)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.font = `800 80px ${DISPLAY}`
    ctx.fillText(value, x + 36, y + 104)
    ctx.fillStyle = '#94a3b8'
    ctx.font = `600 28px ${BODY}`
    ctx.fillText(label, x + 36, y + 150)
  })

  // Pie
  ctx.fillStyle = '#e8edf5'
  ctx.font = `800 40px ${DISPLAY}`
  ctx.fillText('Estudia gratis conmigo', 72, 1218)
  ctx.fillStyle = '#2dd4bf'
  ctx.font = `700 34px ${BODY}`
  ctx.fillText(SITE, 72, 1272)
  ctx.fillStyle = '#94a3b8'
  ctx.font = `600 30px ${BODY}`
  const handle = `@${INSTAGRAM_USER}`
  ctx.fillText(handle, W - 72 - ctx.measureText(handle).width, 1272)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('sin imagen'))), 'image/png'))
}

/** Comparte la imagen con el menú del teléfono; si no se puede, la descarga. Devuelve cómo salió. */
export async function shareProgress(s: ShareStats): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob = await makeShareImage(s)
  const file = new File([blob], 'mi-progreso-medlogic.png', { type: 'image/png' })
  const text = `Así voy preparándome para el ENURM con MedLogic, gratis: https://${SITE}`
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text })
      return 'shared'
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded'
}
