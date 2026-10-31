import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, FONT, HANDLE, SITE } from '../theme'

type Tone = 'dark' | 'light' | 'indigo'

const BACKGROUNDS: Record<Tone, string> = {
  dark: `radial-gradient(120% 80% at 15% 0%, ${C.brand700} 0%, ${C.brand950} 55%, ${C.ink} 100%)`,
  indigo: `radial-gradient(120% 80% at 85% 0%, #4338ca 0%, #1e1b4b 55%, #0b0a24 100%)`,
  light: `radial-gradient(120% 80% at 15% 0%, #ffffff 0%, ${C.paper} 50%, #dff7f2 100%)`,
}

/** Fondo de marca: degradado, cuadrícula suave y dos halos que se mueven despacio. */
export function Background({ tone = 'dark', children }: { tone?: Tone; children?: ReactNode }) {
  const frame = useCurrentFrame()
  const drift = Math.sin(frame / 50) * 40
  const glowA = tone === 'indigo' ? C.accent400 : C.brand400
  const glowB = tone === 'indigo' ? C.brand400 : C.accent500
  const grid = tone === 'light' ? 'rgba(6,124,113,0.07)' : 'rgba(255,255,255,0.05)'
  return (
    <AbsoluteFill style={{ background: BACKGROUNDS[tone], overflow: 'hidden', fontFamily: FONT.body }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${grid} 2px, transparent 2px), linear-gradient(90deg, ${grid} 2px, transparent 2px)`,
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />
      <div style={glow(glowA, -180 + drift, -160, 620, tone === 'light' ? 0.25 : 0.35)} />
      <div style={glow(glowB, 640 - drift, 1100, 680, tone === 'light' ? 0.18 : 0.28)} />
      {children}
    </AbsoluteFill>
  )
}

function glow(color: string, x: number, y: number, size: number, opacity: number): CSSProperties {
  return {
    position: 'absolute',
    left: x,
    top: y,
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    opacity,
    filter: 'blur(140px)',
  }
}

/** El logo de la app (public/favicon.svg) dibujado en SVG para que salga nítido a cualquier tamaño. */
export function Logo({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14bfac" />
          <stop offset=".55" stopColor="#078377" />
          <stop offset="1" stopColor="#055b53" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#lg)" />
      <rect x=".5" y=".5" width="63" height="63" rx="17.5" fill="none" stroke="#fff" strokeOpacity=".18" />
      <path d="M9 40H15L22 18 32 44 42 18 49 40H52" fill="none" stroke="#fff" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="56" cy="40" r="3.2" fill={C.mint} />
    </svg>
  )
}

/** Cabecera con el logo y el nombre. */
export function BrandBar({ light = false, top = 64 }: { light?: boolean; top?: number }) {
  const color = light ? C.brand950 : C.white
  return (
    <div style={{ position: 'absolute', top, left: 72, right: 72, display: 'flex', alignItems: 'center', gap: 20 }}>
      <Logo size={64} />
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color, letterSpacing: -0.5 }}>
        MedLogic <span style={{ color: light ? C.brand600 : C.brand300 }}>ENURM</span>
      </div>
      <div style={{ marginLeft: 'auto', fontSize: 26, fontWeight: 600, color, opacity: 0.7 }}>{HANDLE}</div>
    </div>
  )
}

/** Pie con la dirección de la web. */
export function Footer({ light = false, bottom = 60, text }: { light?: boolean; bottom?: number; text?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 600,
        color: light ? C.brand700 : C.mint,
        letterSpacing: 0.3,
      }}
    >
      {text ?? `Gratis en ${SITE}`}
    </div>
  )
}

export function Pill({ children, color = C.brand300, bg = 'rgba(31,224,201,0.14)', size = 26 }: { children: ReactNode; color?: string; bg?: string; size?: number }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        width: 'fit-content',
        alignItems: 'center',
        gap: 12,
        padding: `${size * 0.45}px ${size * 0.95}px`,
        borderRadius: 999,
        background: bg,
        border: `2px solid ${color}55`,
        color,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  )
}

export function Title({ children, size = 96, color = C.white, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return (
    <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: size, lineHeight: 1.05, letterSpacing: -size * 0.02, color, ...style }}>
      {children}
    </div>
  )
}

/** Resalta palabras con el degradado de la marca. */
export function Grad({ children, from = C.brand300, to = C.mint }: { children: ReactNode; from?: string; to?: string }) {
  return (
    <span style={{ background: `linear-gradient(90deg, ${from}, ${to})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
      {children}
    </span>
  )
}

export const LETTERS = ['A', 'B', 'C', 'D']

/** Opción de respuesta. `state` pinta la correcta en verde y las demás atenuadas. */
export function Option({ letter, text, state = 'idle', size = 40 }: { letter: string; text: string; state?: 'idle' | 'right' | 'dim'; size?: number }) {
  const right = state === 'right'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.6,
        padding: `${size * 0.6}px ${size * 0.7}px`,
        borderRadius: 28,
        background: right ? 'rgba(16,185,129,0.22)' : 'rgba(255,255,255,0.07)',
        border: `3px solid ${right ? '#34d399' : 'rgba(255,255,255,0.14)'}`,
        opacity: state === 'dim' ? 0.4 : 1,
        boxShadow: right ? '0 0 60px rgba(52,211,153,0.35)' : 'none',
      }}
    >
      <div
        style={{
          width: size * 1.6,
          height: size * 1.6,
          flexShrink: 0,
          borderRadius: 18,
          display: 'grid',
          placeItems: 'center',
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: size * 0.85,
          background: right ? '#10b981' : 'rgba(255,255,255,0.12)',
          color: C.white,
        }}
      >
        {right ? '✓' : letter}
      </div>
      <div style={{ fontSize: size, fontWeight: 600, color: C.white, lineHeight: 1.2 }}>{text}</div>
    </div>
  )
}

/** Hueco punteado donde va un sticker nativo de Instagram (encuesta, quiz, enlace…). */
export function StickerSlot({ label, height = 300, light = false }: { label: string; height?: number; light?: boolean }) {
  const frame = useCurrentFrame()
  const pulse = 0.55 + Math.sin(frame / 8) * 0.15
  const color = light ? C.brand600 : C.white
  return (
    <div
      style={{
        height,
        borderRadius: 36,
        border: `4px dashed ${color}`,
        opacity: pulse,
        display: 'grid',
        placeItems: 'center',
        color,
        fontSize: 30,
        fontWeight: 600,
        textAlign: 'center',
        padding: 24,
      }}
    >
      {label}
    </div>
  )
}

/** Entrada con muelle: desliza desde abajo y aparece. */
export function useEnter(delay = 0, distance = 60) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } })
  return { opacity: p, transform: `translateY(${interpolate(p, [0, 1], [distance, 0])}px)` } satisfies CSSProperties
}

export function Enter({ delay = 0, distance = 60, children, style }: { delay?: number; distance?: number; children: ReactNode; style?: CSSProperties }) {
  const s = useEnter(delay, distance)
  return <div style={{ ...s, ...style }}>{children}</div>
}

/** Pop con rebote para emojis y números. */
export function usePop(delay = 0) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: frame - delay, fps, config: { damping: 9, stiffness: 140 } })
}
