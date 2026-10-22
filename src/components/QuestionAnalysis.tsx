import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Activity, BookMarked, Check, ChevronDown, CircleAlert, ExternalLink, Layers, Lightbulb, ListChecks, MessageSquareWarning, X } from 'lucide-react'
import type { Question } from '@/types'
import { useNoteEditor } from '@/components/anki/common'
import { cn, LETTERS } from '@/lib/utils'
import { REPO_URL } from '@/components/layout/AppLayout'

function Section({ icon, title, tone, children, collapsible = false, defaultOpen = true }: { icon: React.ReactNode; title: string; tone: string; children: React.ReactNode; collapsible?: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={cn('rounded-xl border p-4', tone)}>
      <button type="button" disabled={!collapsible} onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-left text-sm font-semibold disabled:cursor-default">
        {icon}
        <span className="flex-1">{title}</span>
        {collapsible && <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-2 text-sm leading-relaxed text-[var(--text)]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Análisis completo tras responder: por qué la opción elegida es incorrecta, la correcta,
 * fisiopatología, análisis de cada opción, puntos clave y bibliografía.
 */
export function QuestionAnalysis({ q, selected, order }: { q: Question; selected: number | null; order?: number[] }) {
  const openEditor = useNoteEditor((s) => s.open)
  const wrong = selected !== null && selected !== q.answer
  const ex = q.optionExplanations
  const positions = order ?? q.options.map((_, i) => i)
  const letterOf = (orig: number) => LETTERS[positions.indexOf(orig)] ?? LETTERS[orig]
  const hasAnything = q.explanation || ex?.some(Boolean) || q.pathophysiology || q.keyPoints?.length || q.references?.length || q.reference

  if (!hasAnything) return null

  const issueUrl = `${REPO_URL}/issues/new?title=${encodeURIComponent(`Revisión de pregunta ${q.id}`)}&body=${encodeURIComponent(`Pregunta: ${q.stem.slice(0, 200)}\n\nQué está mal o qué falta:\n`)}`

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }} className="overflow-hidden">
      <div className="mt-5 space-y-3">
        {wrong && (
          <Section icon={<X className="size-4 text-rose-500" />} title={`Por qué ${letterOf(selected!)}) «${q.options[selected!]}» es incorrecta`} tone="border-rose-500/25 bg-rose-500/[0.06]">
            {ex?.[selected!] ? <p className="whitespace-pre-line">{ex[selected!]}</p> : <p className="text-muted">Compara tu opción con la respuesta correcta y la explicación de abajo.</p>}
          </Section>
        )}

        <Section icon={<Check className="size-4 text-emerald-500" />} title={`Respuesta correcta: ${letterOf(q.answer)}) ${q.options[q.answer]}`} tone="border-emerald-500/25 bg-emerald-500/[0.06]">
          {ex?.[q.answer] && <p className="whitespace-pre-line">{ex[q.answer]}</p>}
          {q.explanation && <p className={cn('whitespace-pre-line', ex?.[q.answer] && 'mt-2')}>{q.explanation}</p>}
        </Section>

        {q.pathophysiology && (
          <Section icon={<Activity className="size-4 text-violet-500" />} title="Fisiopatología: qué está pasando" tone="border-violet-500/25 bg-violet-500/[0.06]" collapsible>
            <p className="whitespace-pre-line">{q.pathophysiology}</p>
          </Section>
        )}

        {ex && ex.some(Boolean) && (
          <Section icon={<ListChecks className="size-4 text-sky-500" />} title="Análisis de cada opción" tone="border-sky-500/20 bg-sky-500/[0.05]" collapsible defaultOpen={!wrong}>
            <ul className="space-y-2.5">
              {positions.map((orig) => {
                const ok = orig === q.answer
                return (
                  <li key={orig} className="flex gap-3">
                    <span className={cn('mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-bold text-white', ok ? 'bg-emerald-500' : 'bg-rose-400')}>{letterOf(orig)}</span>
                    <div>
                      <div className={cn('font-medium', ok && 'text-emerald-700 dark:text-emerald-400')}>{q.options[orig]}</div>
                      {ex[orig] && <div className="text-muted">{ex[orig]}</div>}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Section>
        )}

        {q.keyPoints && q.keyPoints.length > 0 && (
          <Section icon={<Lightbulb className="size-4 text-amber-500" />} title="Puntos clave" tone="border-amber-500/25 bg-amber-500/[0.06]">
            <ul className="space-y-1.5">
              {q.keyPoints.map((k) => (
                <li key={k} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                  {k}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {(q.references?.length || q.reference) && (
          <Section icon={<BookMarked className="size-4 text-muted" />} title="Bibliografía" tone="border-soft" collapsible defaultOpen={false}>
            <ol className="list-decimal space-y-1.5 pl-5 text-xs">
              {q.references?.map((r) => {
                const href = r.doi ? `https://doi.org/${r.doi}` : r.url
                return (
                  <li key={r.citation}>
                    {r.citation}
                    {href && (
                      <a href={href} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center gap-0.5 font-semibold text-brand-600 hover:underline dark:text-brand-400">
                        {r.doi ? `doi:${r.doi}` : 'enlace'} <ExternalLink className="size-3" />
                      </a>
                    )}
                  </li>
                )
              })}
              {q.reference && !q.references?.length && <li>{q.reference}</li>}
            </ol>
          </Section>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() =>
              openEditor({
                prefill: {
                  front: q.stem,
                  back: `<b>${q.options[q.answer]}</b>${q.explanation ? `<br><br>${q.explanation.replace(/</g, '&lt;')}` : ''}`,
                  tags: ['pregunta', q.specialty, ...(q.year ? [String(q.year)] : [])],
                  specialty: q.specialty,
                },
              })
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-violet-500/10 px-3 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-500/20 dark:text-violet-300"
          >
            <Layers className="size-3.5" /> Crear flashcard
          </button>
          <a href={issueUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-muted hover:bg-slate-900/5 hover:text-[var(--text)] dark:hover:bg-white/5">
            <MessageSquareWarning className="size-3.5" /> Reportar un error
          </a>
          {!ex?.some(Boolean) && !q.pathophysiology && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <CircleAlert className="size-3" /> Análisis detallado en preparación
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
