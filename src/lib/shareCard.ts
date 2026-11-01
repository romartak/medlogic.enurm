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
const PULSE = 'M9 40H15L22 18 32 44 42 18 49 40H52'
export const DISPLAY = '"Plus Jakarta Sans Variable", "Inter Variable", system-ui, sans-serif'
export const BODY = '"Inter Variable", system-ui, sans-serif'
export const SITE = 'medlogicenurm.vercel.app'

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

export function logo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const g = ctx.createLinearGradient(x, y, x + size, y + size)
  g.addColorStop(0, '#14bfac')
  g.addColorStop(0.55, '#078377')
  g.addColorStop(1, '#055b53')
  ctx.fillStyle = g
  roundRect(ctx, x, y, size, size, size * 0.28)
  ctx.fill()
  const h = ctx.createRadialGradient(x + size * 0.28, y + size * 0.18, 0, x + size * 0.28, y + size * 0.18, size * 0.78)
  h.addColorStop(0, 'rgba(255,255,255,0.30)')
  h.addColorStop(0.65, 'rgba(255,255,255,0)')
  ctx.fillStyle = h
  roundRect(ctx, x, y, size, size, size * 0.28)
  ctx.fill()
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 64, size / 64)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 4.6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke(new Path2D(PULSE))
  ctx.fillStyle = '#a7f3d0'
  ctx.beginPath()
  ctx.arc(56, 40, 3.2, 0, Math.PI * 2)
  ctx.fill()
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

export interface ExamShare {
  title: string
  /** Nota sobre 100. */
  score: number
  correct: number
  total: number
  durationSec: number
  /** Las mejores especialidades del simulacro (nombre y porcentaje). */
  top: { name: string; pct: number }[]
}

/** Imagen vertical con el resultado de un simulacro, lista para Stories o WhatsApp. */
export async function makeExamImage(s: ExamShare): Promise<Blob> {
  try {
    await Promise.all([document.fonts.load(`800 64px ${DISPLAY}`), document.fonts.load(`500 28px ${BODY}`)])
  } catch {
    /* se usa la fuente del sistema */
  }
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
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

  ctx.fillStyle = '#94a3b8'
  ctx.font = `600 30px ${BODY}`
  const title = s.title.length > 40 ? s.title.slice(0, 39) + '…' : s.title
  ctx.fillText(`Terminé un simulacro · ${title}`, 72, 300)

  const g = ctx.createLinearGradient(72, 380, 700, 560)
  g.addColorStop(0, '#2dd4bf')
  g.addColorStop(1, '#818cf8')
  ctx.fillStyle = g
  ctx.font = `800 260px ${DISPLAY}`
  ctx.fillText(String(s.score), 64, 580)
  const w = ctx.measureText(String(s.score)).width
  ctx.fillStyle = '#94a3b8'
  ctx.font = `700 70px ${DISPLAY}`
  ctx.fillText('/100', 64 + w + 12, 580)
  ctx.fillStyle = '#e8edf5'
  ctx.font = `700 44px ${DISPLAY}`
  const mins = Math.max(1, Math.round(s.durationSec / 60))
  ctx.fillText(`${s.correct} de ${s.total} correctas · ${mins} min`, 72, 650)

  s.top.slice(0, 3).forEach((t, i) => {
    const y = 730 + i * 130
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    roundRect(ctx, 72, y, W - 144, 104, 28)
    ctx.fill()
    ctx.fillStyle = '#e8edf5'
    ctx.font = `700 34px ${BODY}`
    const name = t.name.length > 26 ? t.name.slice(0, 25) + '…' : t.name
    ctx.fillText(name, 108, y + 64)
    ctx.fillStyle = '#2dd4bf'
    ctx.font = `800 44px ${DISPLAY}`
    const p = `${t.pct}%`
    ctx.fillText(p, W - 108 - ctx.measureText(p).width, y + 66)
  })

  ctx.fillStyle = '#e8edf5'
  ctx.font = `800 40px ${DISPLAY}`
  ctx.fillText('Practica gratis conmigo', 72, 1218)
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
export async function shareBlob(blob: Blob, filename: string, text: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], filename, { type: 'image/png' })
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

export async function shareProgress(s: ShareStats) {
  return shareBlob(await makeShareImage(s), 'mi-progreso-medlogic.png', `Así voy preparándome para el ENURM con MedLogic, gratis: https://${SITE}`)
}

export async function shareExam(s: ExamShare) {
  return shareBlob(await makeExamImage(s), 'mi-simulacro-medlogic.png', `Saqué ${s.score}/100 en un simulacro del ENURM con MedLogic, gratis: https://${SITE}`)
}
