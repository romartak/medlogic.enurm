import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Fotos de perfil abstractas (vectores, sin imágenes que descargar). Cada una se guarda por su id
 * en los datos de la cuenta (user_metadata.avatar). Sin foto elegida se muestra la inicial.
 */
interface AvatarDef {
  id: string
  label: string
  from: string
  to: string
  art: () => ReactNode
}

const W = 'rgb(255 255 255 / 0.9)'
const S = 'rgb(255 255 255 / 0.35)'
const D = 'rgb(15 23 42 / 0.22)'

export const AVATARS: AvatarDef[] = [
  {
    id: 'aurora',
    label: 'Aurora',
    from: '#14b8a6',
    to: '#6366f1',
    art: () => (
      <>
        <circle cx="24" cy="30" r="17" fill={S} />
        <circle cx="42" cy="36" r="15" fill={W} fillOpacity="0.55" />
        <circle cx="33" cy="22" r="8" fill={W} />
      </>
    ),
  },
  {
    id: 'ondas',
    label: 'Ondas',
    from: '#0ea5e9',
    to: '#14b8a6',
    art: () => (
      <>
        <path d="M-2 28c10-10 18 10 28 0s18 10 28 0 18 10 28 0v40H-2z" fill={S} />
        <path d="M-2 40c10-10 18 10 28 0s18 10 28 0 18 10 28 0v28H-2z" fill={W} fillOpacity="0.55" />
        <path d="M-2 52c10-10 18 10 28 0s18 10 28 0 18 10 28 0v16H-2z" fill={W} />
      </>
    ),
  },
  {
    id: 'montes',
    label: 'Montes',
    from: '#f59e0b',
    to: '#ec4899',
    art: () => (
      <>
        <path d="M-2 56 22 20l22 36z" fill={S} />
        <path d="M18 56 42 14l24 42z" fill={W} fillOpacity="0.6" />
        <path d="M38 56 52 32l14 24z" fill={W} />
      </>
    ),
  },
  {
    id: 'orbita',
    label: 'Órbita',
    from: '#6366f1',
    to: '#8b5cf6',
    art: () => (
      <>
        <circle cx="32" cy="32" r="22" fill="none" stroke={S} strokeWidth="3" />
        <circle cx="32" cy="32" r="14" fill="none" stroke={W} strokeOpacity="0.6" strokeWidth="3" />
        <circle cx="32" cy="32" r="6" fill={W} />
        <circle cx="50" cy="20" r="4" fill={W} />
      </>
    ),
  },
  {
    id: 'mosaico',
    label: 'Mosaico',
    from: '#ec4899',
    to: '#f97316',
    art: () => (
      <>
        <rect x="10" y="10" width="20" height="20" rx="5" fill={W} />
        <rect x="34" y="10" width="20" height="20" rx="5" fill={S} />
        <rect x="10" y="34" width="20" height="20" rx="5" fill={S} />
        <rect x="34" y="34" width="20" height="20" rx="5" fill={W} fillOpacity="0.7" />
      </>
    ),
  },
  {
    id: 'sol',
    label: 'Sol',
    from: '#f97316',
    to: '#facc15',
    art: () => (
      <>
        <circle cx="32" cy="38" r="15" fill={W} />
        <path d="M32 8v8M12 18l6 6M52 18l-6 6M6 38h8M50 38h8" stroke={W} strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
        <rect x="-2" y="46" width="68" height="20" fill={D} />
      </>
    ),
  },
  {
    id: 'hojas',
    label: 'Hojas',
    from: '#10b981',
    to: '#0ea5e9',
    art: () => (
      <>
        <ellipse cx="24" cy="32" rx="9" ry="20" transform="rotate(-35 24 32)" fill={S} />
        <ellipse cx="40" cy="32" rx="9" ry="20" transform="rotate(35 40 32)" fill={W} fillOpacity="0.6" />
        <ellipse cx="32" cy="30" rx="8" ry="19" fill={W} />
      </>
    ),
  },
  {
    id: 'diamantes',
    label: 'Diamantes',
    from: '#8b5cf6',
    to: '#ec4899',
    art: () => (
      <>
        <rect x="12" y="12" width="22" height="22" rx="4" transform="rotate(45 23 23)" fill={S} />
        <rect x="30" y="30" width="22" height="22" rx="4" transform="rotate(45 41 41)" fill={W} />
        <rect x="30" y="8" width="14" height="14" rx="3" transform="rotate(45 37 15)" fill={W} fillOpacity="0.55" />
      </>
    ),
  },
  {
    id: 'burbujas',
    label: 'Burbujas',
    from: '#06b6d4',
    to: '#6366f1',
    art: () => (
      <>
        <circle cx="20" cy="40" r="12" fill={S} />
        <circle cx="44" cy="22" r="9" fill={W} fillOpacity="0.7" />
        <circle cx="42" cy="46" r="6" fill={W} />
        <circle cx="16" cy="16" r="4" fill={W} />
      </>
    ),
  },
  {
    id: 'rayas',
    label: 'Rayas',
    from: '#14b8a6',
    to: '#22c55e',
    art: () => (
      <>
        <path d="M-4 52 36-8h14L10 52z" fill={S} />
        <path d="M12 68 52 8h14L26 68z" fill={W} fillOpacity="0.7" />
        <path d="M30 70 64 20v18L42 70z" fill={W} />
      </>
    ),
  },
  {
    id: 'pulso',
    label: 'Pulso',
    from: '#0d9488',
    to: '#4f46e5',
    art: () => <path d="M6 34h12l6-14 9 26 7-18 5 6h13" fill="none" stroke={W} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    id: 'cruz',
    label: 'Cruz',
    from: '#f43f5e',
    to: '#f97316',
    art: () => (
      <>
        <rect x="24" y="10" width="16" height="44" rx="6" fill={W} />
        <rect x="10" y="24" width="44" height="16" rx="6" fill={W} fillOpacity="0.65" />
        <circle cx="32" cy="32" r="5" fill="#f43f5e" fillOpacity="0.55" />
      </>
    ),
  },
]

export function isAvatarId(id: unknown): id is string {
  return typeof id === 'string' && AVATARS.some((a) => a.id === id)
}

/** Foto de perfil: el diseño elegido o, si no hay, la inicial sobre el degradado de la marca. */
export function Avatar({ avatar, initial, className, children }: { avatar?: string | null; initial?: string; className?: string; children?: ReactNode }) {
  const gid = `av${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const def = isAvatarId(avatar) ? AVATARS.find((a) => a.id === avatar) : undefined
  if (!def) {
    return (
      <span className={cn('grid place-items-center overflow-hidden rounded-full bg-brand-gradient font-display font-bold text-white', className)}>
        {initial || children}
      </span>
    )
  }
  return (
    <svg viewBox="0 0 64 64" className={cn('overflow-hidden rounded-full', className)} role="img" aria-label={`Foto de perfil: ${def.label}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={def.from} />
          <stop offset="1" stopColor={def.to} />
        </linearGradient>
        <clipPath id={`${gid}c`}>
          <rect width="64" height="64" />
        </clipPath>
      </defs>
      <rect width="64" height="64" fill={`url(#${gid})`} />
      <g clipPath={`url(#${gid}c)`}>{def.art()}</g>
    </svg>
  )
}
