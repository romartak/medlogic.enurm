import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'

/** Los mismos colores y tipografías de la app (src/index.css del proyecto principal). */
export const C = {
  brand300: '#53f5dd',
  brand400: '#1fe0c9',
  brand500: '#0ba595',
  brand600: '#067c71',
  brand700: '#075f58',
  brand900: '#0e524e',
  brand950: '#003231',
  ink: '#04201f',
  mint: '#a7f3d0',
  accent400: '#818cf8',
  accent500: '#6366f1',
  amber: '#fbbf24',
  rose: '#fb7185',
  white: '#ffffff',
  paper: '#f4fbfa',
}

export const FONT = {
  display: "'Plus Jakarta Sans Variable', 'Inter Variable', sans-serif",
  body: "'Inter Variable', sans-serif",
}

export const SITE = 'medlogicenurm.vercel.app'
export const HANDLE = '@medlogic.ai'

/** El ENURM 2027 cae el primer domingo de marzo: 7 de marzo de 2027. */
export const EXAM = new Date('2027-03-07T08:00:00-04:00')
/** Días que faltan contados desde la fecha de publicación prevista (se cambia al volver a renderizar). */
export const PUBLISH_DATE = new Date('2026-11-01T08:00:00-04:00')
export const DAYS_LEFT = Math.round((EXAM.getTime() - PUBLISH_DATE.getTime()) / 86_400_000)

export const SIZE = {
  post: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
}
