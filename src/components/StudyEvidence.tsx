import { BookOpenCheck, ExternalLink } from 'lucide-react'
import type { QuestionAdvice } from '@/lib/plan'
import { formatMinutes } from '@/lib/utils'

/** Fuentes verificables de las recomendaciones del plan. */
export const STUDY_EVIDENCE = [
  {
    claim: 'Practicar con preguntas y espaciar el estudio en varios días son las dos técnicas con mayor evidencia. Releer y subrayar son de las menos útiles.',
    source: 'Dunlosky y cols., Psychological Science in the Public Interest, 2013',
    url: 'https://doi.org/10.1177/1529100612453266',
  },
  {
    claim: 'Responder preguntas fija la información mejor que volver a leerla, sobre todo a largo plazo.',
    source: 'Roediger y Karpicke, Psychological Science, 2006',
    url: 'https://doi.org/10.1111/j.1467-9280.2006.01693.x',
  },
  {
    claim: 'Repartir los repasos en días distintos rinde más que estudiar todo junto.',
    source: 'Cepeda y cols., Psychological Bulletin, 2006',
    url: 'https://doi.org/10.1037/0033-2909.132.3.354',
  },
  {
    claim: 'En estudiantes de medicina, hacer más preguntas de banco se asoció a mejores puntajes en el examen de licencia; ver videos, no.',
    source: 'Estudio de dos cohortes sobre USMLE Step 1 (PMC10211266)',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10211266/',
  },
]

/** Recomendación de preguntas diarias con su porqué y sus fuentes. */
export function StudyEvidence({ advice, minutesPerDay }: { advice: QuestionAdvice; minutesPerDay: number }) {
  const [min, max] = advice.range
  return (
    <div className="rounded-2xl border border-soft bg-[var(--surface)] p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
          <BookOpenCheck className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="font-semibold">
            Recomendado para tu fase: <span className="whitespace-nowrap">{min}–{max} preguntas</span> al día
          </div>
          <p className="mt-1 text-sm text-muted">
            Con {formatMinutes(minutesPerDay)} al día te tocan <b className="text-[var(--text)]">≈ {advice.perDay}</b>: cada pregunta lleva ~1,5 min (72 s como en el ENURM más leer la explicación) y el resto del tiempo va a errores, flashcards y guías.
            {advice.untilExam ? (
              <>
                {' '}
                Al ritmo del plan harás <b className="text-[var(--text)]">≈ {advice.untilExam.toLocaleString('es-DO')} preguntas</b> antes del examen.
              </>
            ) : null}
          </p>
          {advice.minutesForMin && <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">Para llegar a {min} al día necesitarías unas {formatMinutes(advice.minutesForMin)} diarias. Si no puedes, no pasa nada: la calidad (leer cada explicación y repetir tus errores) pesa más que la cantidad.</p>}
        </div>
      </div>
      <details className="group mt-4 border-t border-soft pt-3">
        <summary className="cursor-pointer list-none text-sm font-semibold text-brand-700 dark:text-brand-400 [&::-webkit-details-marker]:hidden">
          ¿Por qué estas cantidades? <span className="text-muted group-open:hidden">Ver la evidencia</span>
        </summary>
        <ul className="mt-3 space-y-3">
          {STUDY_EVIDENCE.map((e) => (
            <li key={e.url} className="text-sm">
              <p>{e.claim}</p>
              <a href={e.url} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted hover:text-[var(--text)]">
                {e.source} <ExternalLink className="size-3" />
              </a>
            </li>
          ))}
          <li className="text-xs text-muted">Ningún estudio fija un número exacto de preguntas por día: el rango combina esta evidencia con el tiempo realista de cada fase. Lo que más predice el resultado es acertar cada vez más y revisar bien los errores.</li>
        </ul>
      </details>
    </div>
  )
}
