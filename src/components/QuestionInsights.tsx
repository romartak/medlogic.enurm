import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Check, Flame, Users } from 'lucide-react'
import type { Question } from '@/types'
import { fetchCommunity, MIN_VOTES, recordVote, sharePercents, type CommunityVotes } from '@/lib/community'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/store/auth'
import { cn, LETTERS } from '@/lib/utils'

/** Exámenes de la recopilación: 28 entre 2002 y 2024 (2021 y 2022 tuvieron varias versiones). Algunos vienen incompletos. */
export const EXAMS_COVERED = { from: 2002, to: 2024, count: 28 }

/** Qué tan repetida es la pregunta en los exámenes recopilados, para saber si es «alto rendimiento». */
export function HighYieldNote({ q }: { q: Question }) {
  const n = q.appearances ?? 1
  if (n < 2) return null
  const years = q.years ?? []
  return (
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-orange-500/30 bg-orange-500/[0.07] p-3.5 text-sm">
      <Flame className="mt-0.5 size-5 shrink-0 text-orange-500" aria-hidden />
      <div>
        <div className="font-bold text-orange-700 dark:text-orange-300">Pregunta de alto rendimiento</div>
        <p className="mt-0.5 text-muted">
          {`Apareció en ${n} de los ${EXAMS_COVERED.count} exámenes recopilados (${Math.round((n / EXAMS_COVERED.count) * 100)} %)${years.length ? `: ${years.join(', ')}` : ''}. Si salió tantas veces, vale la pena dominarla.`}
        </p>
      </div>
    </div>
  )
}

interface Props {
  q: Question
  /** Opción original que eligió esta persona. */
  selected: number | null
  /** Orden en que se muestran las opciones: order[pos] = índice original. */
  order?: number[]
  /** true en modo práctica: la respuesta cuenta para las estadísticas (en revisar solo se consultan). */
  record: boolean
}

/**
 * Lo que eligió el resto de la gente en esta pregunta: porcentaje por opción, y una frase que ayuda a ver que
 * fallar no es raro («el 38 % también eligió esta»). Sin suficientes respuestas no inventa nada.
 */
export function CommunityStats({ q, selected, order, record }: Props) {
  const user = useAuth((s) => s.user)
  const [votes, setVotes] = useState<CommunityVotes | null | 'loading'>('loading')

  useEffect(() => {
    let alive = true
    setVotes('loading')
    ;(async () => {
      if (record && selected !== null) await recordVote(q.id, selected)
      const v = await fetchCommunity(q.id, q.options.length)
      if (alive) setVotes(v)
    })()
    return () => {
      alive = false
    }
    // Se vuelve a pedir si cambia la pregunta, lo elegido o la cuenta (al iniciar sesión se suma la respuesta).
  }, [q.id, q.options.length, selected, record, user?.id])

  if (!isSupabaseConfigured || votes === null) return null
  if (votes === 'loading') return <div className="skeleton mt-5 h-28 rounded-xl" aria-hidden />

  const positions = order ?? q.options.map((_, i) => i)

  if (votes.total < MIN_VOTES) {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-soft p-3.5 text-sm text-muted">
        <Users className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p>
          Aún hay pocas respuestas a esta pregunta ({votes.total} de {MIN_VOTES} necesarias). Cuando haya más, verás qué eligió la gente.
          {!user && (
            <>
              {' '}
              <Link to="/cuenta" className="font-semibold text-brand-700 underline dark:text-brand-400">
                Inicia sesión
              </Link>{' '}
              para sumar la tuya.
            </>
          )}
        </p>
      </div>
    )
  }

  const pct = sharePercents(votes.counts)
  const mine = selected !== null ? pct[selected] : null
  const right = pct[q.answer]
  const message =
    selected === null
      ? `Solo el ${right} % de las personas acierta esta pregunta.`
      : selected === q.answer
        ? `Acertaste: solo el ${right} % de las personas acierta esta pregunta.`
        : `No fuiste la única persona: el ${mine} % también eligió tu opción. Solo el ${right} % acierta esta pregunta.`

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} aria-label="Lo que eligió la comunidad" className="mt-5 rounded-xl border border-soft p-3.5 sm:p-4">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Users className="size-4 shrink-0 text-brand-600" aria-hidden /> Lo que eligió la comunidad
        <span className="ml-auto shrink-0 text-xs font-medium whitespace-nowrap text-muted">{votes.total} respuestas</span>
      </div>
      <ul className="mt-3 space-y-2">
        {positions.map((orig, pos) => {
          const isRight = orig === q.answer
          const isMine = orig === selected
          return (
            <li key={orig} className="flex items-center gap-2.5 text-sm">
              <span className={cn('grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold', isRight ? 'bg-emerald-500 text-white' : isMine ? 'bg-rose-500 text-white' : 'surface-2 text-muted')}>
                {isRight ? <Check className="size-3.5" /> : LETTERS[pos]}
              </span>
              <div className="relative h-6 flex-1 overflow-hidden rounded-md surface-2" role="img" aria-label={`Opción ${LETTERS[pos]}: ${pct[orig]} %${isMine ? ' (la tuya)' : ''}${isRight ? ' (correcta)' : ''}`}>
                <motion.div
                  className={cn('absolute inset-y-0 left-0 rounded-md', isRight ? 'bg-emerald-500/60' : isMine ? 'bg-rose-500/55' : 'bg-slate-400/40')}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct[orig]}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: pos * 0.05 }}
                />
                {isMine && <span className="absolute inset-y-0 left-2 flex items-center text-[11px] font-bold tracking-wide uppercase">Tú</span>}
              </div>
              <span className="w-10 shrink-0 text-right font-semibold tabular-nums">{pct[orig]} %</span>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-sm text-muted">{message}</p>
    </motion.section>
  )
}
