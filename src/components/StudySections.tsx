import { motion } from 'motion/react'
import { BookOpen } from 'lucide-react'
import type { GuideSection } from '@/types'
import { slugify } from '@/data/specialties'
import { Card } from '@/components/ui/primitives'
import { SectionBody } from './SectionBody'

/** Índice de secciones como chips que llevan a cada una (útil en el celular, donde no hay barra lateral). */
export function SectionIndex({ sections }: { sections: GuideSection[] }) {
  return (
    <nav aria-label="Secciones" className="flex flex-wrap gap-2">
      {sections.map((sec) => (
        <a
          key={sec.heading}
          href={`#${slugify(sec.heading)}`}
          onClick={(e) => {
            // Con HashRouter un #ancla normal cambiaría la ruta.
            e.preventDefault()
            document.getElementById(slugify(sec.heading))?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="rounded-full border border-soft bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-brand-500/40 hover:text-[var(--text)]"
        >
          {sec.heading}
        </a>
      ))}
    </nav>
  )
}

/** Secciones numeradas de un tema de estudio, con el mismo estilo que las guías. */
export function StudySections({ sections, color }: { sections: GuideSection[]; color: string }) {
  return (
    <div className="space-y-5">
      {sections.map((sec, i) => (
        <motion.section key={sec.heading} id={slugify(sec.heading)} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} className="card scroll-mt-24 p-5 sm:p-7">
          <h2 className="flex items-center gap-3 text-xl font-bold">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: color }}>
              {i + 1}
            </span>
            {sec.heading}
          </h2>
          <SectionBody sec={sec} color={color} />
        </motion.section>
      ))}
    </div>
  )
}

export function References({ items }: { items: string[] }) {
  return (
    <Card className="p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <BookOpen className="size-4" /> Referencias
      </h3>
      <ul className="mt-2 space-y-1 text-sm text-muted">
        {items.map((r) => (
          <li key={r}>• {r}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Resumen educativo. Verifica siempre la guía original vigente, las dosis y los protocolos de tu institución.</p>
    </Card>
  )
}
