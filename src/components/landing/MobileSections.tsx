import type { MouseEvent } from 'react'
import { ArrowRight, BookOpen, CalendarDays, Compass, LayoutGrid } from 'lucide-react'

export type SectionLink = readonly [href: string, label: string]
type Go = (href: string) => (e: MouseEvent) => void

/**
 * Tres formas de enseñar las secciones en el teléfono sin esconderlas tras tres rayas.
 * Se elige con `?nav=chips|grid|bar` mientras se comparan; el valor por defecto es el elegido.
 */
export type NavVariant = 'franja' | 'grid' | 'bar'

export function navVariant(): NavVariant {
  if (typeof window === 'undefined') return 'franja'
  const raw = new URLSearchParams(window.location.search).get('nav')
  return raw === 'grid' || raw === 'bar' ? raw : 'franja'
}

/** Etiquetas cortas para que quepan enteras en el teléfono; el nombre completo queda en aria-label. */
const SHORT: Record<string, string> = { 'Preguntas frecuentes': 'Preguntas' }
const STRIP: Record<string, string> = { 'El examen': 'Examen', 'Cómo funciona': 'Método', 'Preguntas frecuentes': 'Preguntas' }

/** A. Franja de texto bajo la cabecera: las cuatro secciones, sin botones ni desplazamiento. */
export function SectionStrip({ sections, onGo }: { sections: readonly SectionLink[]; onGo: Go }) {
  return (
    <nav aria-label="Secciones" className="border-b border-soft/70 md:hidden">
      <ul className="mx-auto flex max-w-7xl items-center justify-between gap-1 px-4 py-1">
        {sections.map(([href, label]) => (
          <li key={href}>
            <a
              href={href}
              onClick={onGo(href)}
              aria-label={label}
              className="flex min-h-11 items-center px-1 text-[12.5px] font-semibold text-muted"
            >
              {STRIP[label] ?? label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** B. Índice 2×2: las cuatro secciones con nombre completo, sin desplazamiento lateral. */
export function SectionGrid({ sections, onGo }: { sections: readonly SectionLink[]; onGo: Go }) {
  return (
    <nav aria-label="Secciones" className="md:hidden">
      <div className="mx-auto max-w-7xl px-4 pb-4">
        <ul className="grid grid-cols-2 gap-2">
          {sections.map(([href, label]) => (
            <li key={href}>
              <a
                href={href}
                onClick={onGo(href)}
                aria-label={label}
                className="flex h-full items-center justify-between gap-2 rounded-xl border border-soft bg-[var(--surface)] px-3 py-2.5 text-[13px] font-semibold text-[var(--text)]"
              >
                {SHORT[label] ?? label}
                <ArrowRight className="size-3.5 shrink-0 text-muted" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

const BAR_ICONS = [CalendarDays, LayoutGrid, Compass, BookOpen]
const BAR_LABELS: Record<string, string> = {
  'El examen': 'El examen',
  Funciones: 'Funciones',
  'Cómo funciona': 'El método',
  'Preguntas frecuentes': 'Preguntas',
}

/** C. Barra fija abajo, como en una app: las secciones acompañan todo el scroll. */
export function SectionBar({ sections, onGo }: { sections: readonly SectionLink[]; onGo: Go }) {
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-soft bg-[color-mix(in_oklab,var(--surface)_97%,transparent)] shadow-[0_-8px_24px_-16px_rgb(15_23_42_/_0.45)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {sections.map(([href, label], i) => {
          const I = BAR_ICONS[i] ?? CalendarDays
          return (
            <li key={href} className="flex-1">
              <a
                href={href}
                onClick={onGo(href)}
                className="flex flex-col items-center gap-1 px-1 py-2.5 text-[10.5px] leading-none font-semibold text-muted"
              >
                <I className="size-5" />
                {BAR_LABELS[label] ?? label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
