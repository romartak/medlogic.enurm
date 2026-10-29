import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Fotos de perfil abstractas y cálidas: 12 motivos planos en 6 paletas suaves (36 en total), en vectores
 * sin imágenes que descargar. Se guardan por su id en los ajustes (y, con cuenta, en user_metadata.avatar).
 * Sin foto elegida se muestra la inicial.
 */
interface Palette {
  id: string
  name: string
  bg: string
  fg: string
}

const PALETTES: Palette[] = [
  { id: 'terracota', name: 'terracota', bg: '#F6E3D8', fg: '#C8603F' },
  { id: 'salvia', name: 'salvia', bg: '#E2EADB', fg: '#5B7B53' },
  { id: 'ocre', name: 'ocre', bg: '#F6EACF', fg: '#B5832A' },
  { id: 'azul', name: 'azul', bg: '#DEE6F0', fg: '#46699A' },
  { id: 'ciruela', name: 'ciruela', bg: '#EFDFE8', fg: '#8B4D71' },
  { id: 'carbon', name: 'carbón', bg: '#EDE8DF', fg: '#3E3A34' },
]

type Art = (fg: string) => ReactNode

/** Rayos alrededor del centro: largos alternos, puntas redondeadas. */
function rays(n: number, inner: number, outer: (i: number) => number, width: number, fg: string) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const o = outer(i)
    return <line key={i} x1={32 + Math.cos(a) * inner} y1={32 + Math.sin(a) * inner} x2={32 + Math.cos(a) * o} y2={32 + Math.sin(a) * o} stroke={fg} strokeWidth={width} strokeLinecap="round" />
  })
}

interface Motif {
  id: string
  name: string
  family: AvatarFamily
  art: Art
}

export type AvatarFamily = 'cielo' | 'naturaleza' | 'formas'
export const AVATAR_FAMILIES: { id: AvatarFamily; label: string }[] = [
  { id: 'cielo', label: 'Cielo' },
  { id: 'naturaleza', label: 'Naturaleza' },
  { id: 'formas', label: 'Formas' },
]

const MOTIFS: Motif[] = [
  {
    id: 'sol',
    name: 'Sol',
    family: 'cielo',
    art: (fg) => (
      <>
        <circle cx="32" cy="32" r="10" fill={fg} />
        {rays(10, 15, () => 20, 3.4, fg)}
      </>
    ),
  },
  {
    id: 'luna',
    name: 'Luna',
    family: 'cielo',
    art: (fg) => (
      <>
        <path d="M40 12a20 20 0 1 0 12 30A17 17 0 0 1 40 12Z" fill={fg} />
        <circle cx="47" cy="20" r="2.4" fill={fg} fillOpacity="0.5" />
      </>
    ),
  },
  {
    id: 'nube',
    name: 'Nube',
    family: 'cielo',
    art: (fg) => (
      <>
        <circle cx="44" cy="22" r="7" fill={fg} fillOpacity="0.45" />
        <path d="M20 46a9 9 0 0 1-1-17.9A12 12 0 0 1 42 27a9.5 9.5 0 0 1 3 19Z" fill={fg} />
      </>
    ),
  },
  {
    id: 'montes',
    name: 'Montes',
    family: 'cielo',
    art: (fg) => (
      <>
        <circle cx="44" cy="20" r="5" fill={fg} fillOpacity="0.5" />
        <path d="M10 48 26 26l9 12 6-7 13 17Z" fill={fg} />
      </>
    ),
  },
  {
    id: 'flor',
    name: 'Flor',
    family: 'naturaleza',
    art: (fg) => (
      <>
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx="32" cy="20" rx="6.5" ry="11" fill={fg} fillOpacity="0.85" transform={`rotate(${i * 60} 32 32)`} />
        ))}
        <circle cx="32" cy="32" r="6" fill="#FFF8EE" />
      </>
    ),
  },
  {
    id: 'hoja',
    name: 'Hoja',
    family: 'naturaleza',
    art: (fg) => (
      <>
        <path d="M16 48C14 28 28 14 50 14c0 22-14 36-34 34Z" fill={fg} />
        <path d="M18 46 40 24" stroke="#FFF8EE" strokeOpacity="0.7" strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'brote',
    name: 'Brote',
    family: 'naturaleza',
    art: (fg) => (
      <>
        <path d="M32 52V30" stroke={fg} strokeWidth="3.6" strokeLinecap="round" />
        <path d="M32 32c-12 1-17-5-17-14 10 0 16 4 17 14Z" fill={fg} />
        <path d="M32 38c10 .5 15-4.5 15-12-8.5 0-14 3.6-15 12Z" fill={fg} fillOpacity="0.6" />
      </>
    ),
  },
  {
    id: 'gota',
    name: 'Gota',
    family: 'naturaleza',
    art: (fg) => (
      <>
        <path d="M32 11c8 11 15 19 15 28a15 15 0 0 1-30 0c0-9 7-17 15-28Z" fill={fg} />
        <path d="M25 40a7 7 0 0 0 6 7" stroke="#FFF8EE" strokeOpacity="0.7" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'arcos',
    name: 'Arcos',
    family: 'formas',
    art: (fg) => (
      <>
        <path d="M12 46a20 20 0 0 1 40 0" stroke={fg} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M21 46a11 11 0 0 1 22 0" stroke={fg} strokeOpacity="0.6" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="46" r="3" fill={fg} />
      </>
    ),
  },
  {
    id: 'ondas',
    name: 'Ondas',
    family: 'formas',
    art: (fg) =>
      [22, 32, 42].map((y, i) => (
        <path key={y} d={`M13 ${y}c4.75-5 9.5-5 14.25 0s9.5 5 14.25 0 9.5-5 14.25 0`} stroke={fg} strokeOpacity={1 - i * 0.25} strokeWidth="4" fill="none" strokeLinecap="round" />
      )),
  },
  {
    id: 'guijarro',
    name: 'Guijarro',
    family: 'formas',
    art: (fg) => (
      <>
        <path d="M18 34c-2-11 8-20 19-18s14 11 11 20-13 13-21 11-8-6-9-13Z" fill={fg} />
        <circle cx="47" cy="47" r="5" fill={fg} fillOpacity="0.5" />
      </>
    ),
  },
  {
    id: 'orbita',
    name: 'Órbita',
    family: 'formas',
    art: (fg) => (
      <>
        <circle cx="32" cy="32" r="17" stroke={fg} strokeOpacity="0.55" strokeWidth="3" fill="none" />
        <circle cx="32" cy="32" r="7.5" fill={fg} />
        <circle cx="46.7" cy="23.5" r="4" fill={fg} />
      </>
    ),
  },
]

export interface AvatarDef {
  id: string
  label: string
  family: AvatarFamily
  bg: string
  fg: string
  art: Art
}

/** Cada motivo sale en 3 paletas distintas, repartidas para que las 6 aparezcan por igual. */
export const AVATARS: AvatarDef[] = MOTIFS.flatMap((m, i) =>
  [0, 2, 4].map((k) => {
    const p = PALETTES[(i + k) % PALETTES.length]
    return { id: `${m.id}-${p.id}`, label: `${m.name} ${p.name}`, family: m.family, bg: p.bg, fg: p.fg, art: m.art }
  }),
)

/** Diseños de la versión anterior: quien ya eligió uno ve el motivo más parecido de los nuevos (motivo, n.º de paleta). */
const LEGACY_MOTIF: Record<string, [string, number]> = {
  aurora: ['guijarro', 0],
  ondas: ['ondas', 0],
  montes: ['montes', 0],
  orbita: ['orbita', 0],
  mosaico: ['flor', 1],
  sol: ['sol', 0],
  hojas: ['hoja', 0],
  diamantes: ['arcos', 1],
  burbujas: ['guijarro', 1],
  rayas: ['ondas', 1],
  pulso: ['gota', 0],
  cruz: ['flor', 0],
}

const BY_ID = new Map(AVATARS.map((a) => [a.id, a]))

export function avatarDef(id: unknown): AvatarDef | undefined {
  if (typeof id !== 'string') return undefined
  const direct = BY_ID.get(id)
  if (direct) return direct
  const legacy = Object.hasOwn(LEGACY_MOTIF, id) ? LEGACY_MOTIF[id] : undefined
  return legacy ? AVATARS.filter((a) => a.id.startsWith(`${legacy[0]}-`))[legacy[1]] : undefined
}

export function isAvatarId(id: unknown): id is string {
  return avatarDef(id) !== undefined
}

/** Foto de perfil: el diseño elegido o, si no hay, la inicial sobre el degradado de la marca. */
export function Avatar({ avatar, initial, className, children }: { avatar?: string | null; initial?: string; className?: string; children?: ReactNode }) {
  const def = avatarDef(avatar)
  if (!def) {
    return (
      <span className={cn('grid place-items-center overflow-hidden rounded-full bg-brand-gradient font-display font-bold text-white', className)}>
        {initial || children}
      </span>
    )
  }
  return (
    <svg viewBox="0 0 64 64" className={cn('overflow-hidden rounded-full', className)} role="img" aria-label={`Foto de perfil: ${def.label}`}>
      <rect width="64" height="64" fill={def.bg} />
      {def.art(def.fg)}
    </svg>
  )
}
