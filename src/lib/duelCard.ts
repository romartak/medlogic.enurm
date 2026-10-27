import { INSTAGRAM_USER } from '@/components/Instagram'
import { BODY, DISPLAY, logo, roundRect, SITE } from './shareCard'
import { duelWinner, type DuelPayload, type DuelScore } from './duel'

/**
 * Imagen del duelo para compartir (1080×1350): el reto con tu resultado o el resultado final
 * de los dos. Se genera en el teléfono, sin servidor.
 */
const W = 1080
const H = 1350

const clock = (s: number) => {
  const t = Math.round(s)
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}

function fit(ctx: CanvasRenderingContext2D, text: string, weight: number, max: number, start: number, family = DISPLAY): number {
  let size = start
  do {
    ctx.font = `${weight} ${size}px ${family}`
    if (ctx.measureText(text).width <= max) break
    size -= 4
  } while (size > 24)
  return size
}

function centered(ctx: CanvasRenderingContext2D, text: string, y: number) {
  ctx.fillText(text, (W - ctx.measureText(text).width) / 2, y)
}

function base(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#070b14'
  ctx.fillRect(0, 0, W, H)
  for (const [cx, cy, r, c] of [
    [W * 0.95, 80, 700, 'rgba(249,115,22,0.22)'],
    [W * 0.05, H, 700, 'rgba(99,102,241,0.32)'],
    [W * 0.5, H * 0.45, 520, 'rgba(20,184,166,0.12)'],
  ] as const) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, c)
    g.addColorStop(1, 'rgba(7,11,20,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }
  logo(ctx, 72, 72, 88)
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#e8edf5'
  ctx.font = `800 42px ${DISPLAY}`
  ctx.fillText('MedLogic', 182, 116)
  ctx.fillStyle = '#1fe0c9'
  ctx.font = `700 18px ${DISPLAY}`
  ctx.letterSpacing = '7px'
  ctx.fillText('ENURM', 184, 148)
  ctx.letterSpacing = '0px'
  // Etiqueta «DUELO»
  ctx.fillStyle = '#f97316'
  roundRect(ctx, W - 72 - 190, 84, 190, 60, 30)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = `800 26px ${DISPLAY}`
  ctx.letterSpacing = '4px'
  ctx.fillText('DUELO', W - 72 - 190 + 42, 124)
  ctx.letterSpacing = '0px'
}

function footer(ctx: CanvasRenderingContext2D, cta: string) {
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  roundRect(ctx, 72, H - 210, W - 144, 120, 36)
  ctx.fill()
  ctx.fillStyle = '#e8edf5'
  ctx.font = `800 34px ${DISPLAY}`
  ctx.fillText(cta, 112, H - 158)
  ctx.fillStyle = '#2dd4bf'
  ctx.font = `700 30px ${BODY}`
  ctx.fillText(SITE, 112, H - 114)
  ctx.fillStyle = '#94a3b8'
  ctx.font = `600 28px ${BODY}`
  const ig = `@${INSTAGRAM_USER}`
  ctx.fillText(ig, W - 112 - ctx.measureText(ig).width, H - 114)
}

function topicsChip(ctx: CanvasRenderingContext2D, text: string, y: number) {
  ctx.font = `700 30px ${BODY}`
  const w = Math.min(W - 144, ctx.measureText(text).width + 64)
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  roundRect(ctx, (W - w) / 2, y - 44, w, 64, 32)
  ctx.fill()
  ctx.fillStyle = '#cbd5e1'
  centered(ctx, text, y)
}

function scoreBox(ctx: CanvasRenderingContext2D, s: DuelScore, n: number, x: number, y: number, w: number, label: string, win: boolean) {
  ctx.fillStyle = win ? 'rgba(251,191,36,0.14)' : 'rgba(255,255,255,0.07)'
  roundRect(ctx, x, y, w, 420, 40)
  ctx.fill()
  ctx.lineWidth = 4
  ctx.strokeStyle = win ? '#fbbf24' : 'rgba(255,255,255,0.14)'
  ctx.stroke()
  const cx = x + w / 2
  const mid = (t: string, yy: number) => ctx.fillText(t, cx - ctx.measureText(t).width / 2, yy)
  if (win) {
    ctx.fillStyle = '#fbbf24'
    ctx.font = `800 30px ${DISPLAY}`
    mid('GANADOR', y - 18)
  }
  ctx.fillStyle = '#94a3b8'
  ctx.font = `700 26px ${BODY}`
  mid(label, y + 64)
  ctx.fillStyle = '#fff'
  fit(ctx, s.name, 800, w - 48, 46)
  mid(s.name, y + 128)
  ctx.fillStyle = win ? '#fbbf24' : '#e8edf5'
  ctx.font = `800 130px ${DISPLAY}`
  const big = `${s.correct}`
  const bw = ctx.measureText(big).width
  ctx.font = `800 52px ${DISPLAY}`
  const small = `/${n}`
  const sw = ctx.measureText(small).width
  const left = cx - (bw + sw) / 2
  ctx.font = `800 130px ${DISPLAY}`
  ctx.fillText(big, left, y + 290)
  ctx.font = `800 52px ${DISPLAY}`
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(small, left + bw + 4, y + 290)
  ctx.font = `600 30px ${BODY}`
  mid(`en ${clock(s.seconds)}`, y + 360)
}

export async function makeDuelImage(p: DuelPayload, topics: string): Promise<Blob> {
  try {
    await Promise.all([document.fonts.load(`800 64px ${DISPLAY}`), document.fonts.load(`600 28px ${BODY}`)])
  } catch {
    /* fuente del sistema */
  }
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  base(ctx)

  if (!p.b) {
    // El reto: «Dra. Genao te reta · 18/20 en 1:42».
    ctx.fillStyle = '#fdba74'
    ctx.font = `800 34px ${DISPLAY}`
    ctx.letterSpacing = '6px'
    centered(ctx, 'TE RETO', 290)
    ctx.letterSpacing = '0px'
    ctx.fillStyle = '#fff'
    fit(ctx, p.a.name, 800, W - 160, 96)
    centered(ctx, p.a.name, 400)
    const g = ctx.createLinearGradient(260, 470, 820, 700)
    g.addColorStop(0, '#fb923c')
    g.addColorStop(1, '#f472b6')
    ctx.fillStyle = g
    ctx.font = `800 260px ${DISPLAY}`
    const big = `${p.a.correct}`
    const bw = ctx.measureText(big).width
    ctx.font = `800 110px ${DISPLAY}`
    const small = `/${p.n}`
    const sw = ctx.measureText(small).width
    const left = (W - bw - sw) / 2
    ctx.font = `800 260px ${DISPLAY}`
    ctx.fillText(big, left, 680)
    ctx.fillStyle = '#94a3b8'
    ctx.font = `800 110px ${DISPLAY}`
    ctx.fillText(small, left + bw + 8, 680)
    ctx.fillStyle = '#e8edf5'
    ctx.font = `600 40px ${BODY}`
    centered(ctx, `aciertos en ${clock(p.a.seconds)}`, 760)
    topicsChip(ctx, `${p.n} preguntas · ${topics}`, 880)
    ctx.fillStyle = '#fff'
    ctx.font = `800 72px ${DISPLAY}`
    centered(ctx, '¿Me ganas?', 1040)
    footer(ctx, 'Acepta el reto con el enlace')
  } else {
    // Resultado final de los dos.
    const w = duelWinner(p.a, p.b)
    const headline = w === 'tie' ? '¡Empate!' : `Ganó ${w === 'a' ? p.a.name : p.b.name}`
    ctx.fillStyle = '#fff'
    fit(ctx, headline, 800, W - 160, 84)
    centered(ctx, headline, 300)
    topicsChip(ctx, `${p.n} preguntas · ${topics}`, 390)
    const bw = (W - 144 - 32) / 2
    scoreBox(ctx, p.a, p.n, 72, 500, bw, 'RETÓ', w === 'a')
    scoreBox(ctx, p.b, p.n, 72 + bw + 32, 500, bw, 'ACEPTÓ', w === 'b')
    ctx.fillStyle = '#e8edf5'
    ctx.font = `800 52px ${DISPLAY}`
    centered(ctx, w === 'tie' ? '¿Desempatamos?' : '¿Quién sigue?', 1060)
    footer(ctx, 'Reta a tus amigos en MedLogic')
  }

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('sin imagen'))), 'image/png'))
}
