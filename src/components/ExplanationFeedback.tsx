import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, MessageSquareWarning, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { Question } from '@/types'
import { fetchExplanationVotes, hasReported, MAX_DETAIL, myVote, REPORT_REASONS, sendReport, voteExplanation, votesLabel, type ExplanationVotes, type ReportReason, type ReportResult } from '@/lib/feedback'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/store/auth'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

const MESSAGES: Record<Exclude<ReportResult, 'sin-sesion'>, { text: string; good: boolean }> = {
  ok: { text: 'Gracias. Revisamos cada reporte, y si varias personas reportan la misma pregunta aparece marcada «en revisión».', good: true },
  ya_reportada: { text: 'Ya habías reportado esta pregunta. Gracias por insistir.', good: true },
  limite: { text: 'Llegaste al límite de reportes de hoy. Vuelve mañana.', good: false },
  error: { text: 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.', good: false },
}

/** Ventana para reportar un error en una pregunta (requiere cuenta; sin ella ofrece crear una o escribir en GitHub). */
function ReportDialog({ q, open, onClose, issueUrl }: { q: Question; open: boolean; onClose: () => void; issueUrl: string }) {
  const signedIn = useAuth((s) => s.status === 'signed-in')
  const [reason, setReason] = useState<ReportReason>('respuesta')
  const [detail, setDetail] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<Exclude<ReportResult, 'sin-sesion'> | null>(null)

  const send = async () => {
    setSending(true)
    const r = await sendReport(q.id, reason, detail)
    setSending(false)
    setResult(r === 'sin-sesion' ? 'error' : r)
  }
  const done = result && MESSAGES[result].good

  return (
    <Modal open={open} onClose={onClose} title="Reportar un error en esta pregunta">
      {!signedIn ? (
        <div className="space-y-4 text-sm">
          <p className="text-muted">
            {isSupabaseConfigured ? 'Para reportar necesitas una cuenta gratis: así evitamos reportes falsos y podemos avisarte cuando se corrija.' : 'Los reportes dentro de la app necesitan cuentas, que todavía no están activas aquí.'}
          </p>
          <div className="flex flex-wrap gap-2">
            {isSupabaseConfigured && (
              <Link to="/cuenta" onClick={onClose} className="inline-flex h-11 items-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">
                Crear cuenta o entrar
              </Link>
            )}
            <a href={issueUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-xl surface-2 px-5 text-sm font-semibold">
              Reportarlo en GitHub
            </a>
          </div>
        </div>
      ) : done ? (
        <div className="space-y-4">
          <p className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden /> {MESSAGES[result].text}
          </p>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
        >
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-semibold">¿Qué falla?</legend>
            {REPORT_REASONS.map((r) => (
              <label key={r.value} className={cn('flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 text-sm transition-colors', reason === r.value ? 'border-brand-500 bg-brand-500/[0.06]' : 'border-soft hover:border-brand-500/40')}>
                <input type="radio" name="motivo" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} className="mt-1 size-4 accent-[var(--color-brand-500)]" />
                <span>
                  <span className="block font-semibold">{r.label}</span>
                  <span className="text-xs text-muted">{r.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <label className="block text-sm">
            <span className="font-semibold">Detalles (opcional)</span>
            <textarea value={detail} onChange={(e) => setDetail(e.target.value.slice(0, MAX_DETAIL))} rows={3} placeholder="Por ejemplo: la guía de la OMS 2023 dice otra cosa…" className="mt-1.5 w-full resize-none rounded-xl border border-soft surface-2 p-3 text-sm outline-none focus:border-brand-500" />
            <span className="mt-0.5 block text-right text-xs text-muted tabular-nums">
              {detail.length}/{MAX_DETAIL}
            </span>
          </label>
          {result && (
            <p role="alert" className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              {MESSAGES[result].text}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? 'Enviando…' : 'Enviar reporte'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

/** «¿Te sirvió esta explicación?» con sus totales, y el acceso para reportar un error. */
export function ExplanationFeedback({ q, issueUrl }: { q: Question; issueUrl: string }) {
  const [vote, setVote] = useState<boolean | null>(() => myVote(q.id))
  const [votes, setVotes] = useState<ExplanationVotes | null>(null)
  const [open, setOpen] = useState(false)
  const [reported, setReported] = useState(() => hasReported(q.id))

  useEffect(() => {
    setVote(myVote(q.id))
    setReported(hasReported(q.id))
    let alive = true
    void fetchExplanationVotes(q.id).then((v) => alive && setVotes(v))
    return () => {
      alive = false
    }
  }, [q.id])

  const cast = (useful: boolean) => {
    setVote(useful)
    void voteExplanation(q.id, useful).then(() => fetchExplanationVotes(q.id).then(setVotes))
  }
  const label = votesLabel(votes)
  const btn = (on: boolean) => cn('relative inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors after:absolute after:-inset-y-1 after:inset-x-0', on ? 'bg-brand-500/15 text-brand-800 dark:text-brand-200' : 'text-muted hover:bg-slate-900/5 hover:text-[var(--text)] dark:hover:bg-white/5')

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-soft pt-3">
      <span id={`fb-${q.id}`} className="mr-1 text-xs font-semibold text-muted">
        ¿Te sirvió esta explicación?
      </span>
      <div role="group" aria-labelledby={`fb-${q.id}`} className="flex gap-1">
        <button type="button" aria-pressed={vote === true} onClick={() => cast(true)} data-track="explicacion-util" className={btn(vote === true)}>
          <ThumbsUp className="size-3.5" aria-hidden /> Sí
        </button>
        <button type="button" aria-pressed={vote === false} onClick={() => cast(false)} data-track="explicacion-no-util" className={btn(vote === false)}>
          <ThumbsDown className="size-3.5" aria-hidden /> No
        </button>
      </div>
      <button type="button" onClick={() => setOpen(true)} data-track="reportar-pregunta" className={cn(btn(false), 'sm:ml-auto')}>
        <MessageSquareWarning className="size-3.5" aria-hidden /> {reported ? 'Reporte enviado' : 'Reportar un error'}
      </button>
      {vote === false && !reported && (
        <p className="basis-full text-xs text-muted">
          ¿Qué falló? <button type="button" onClick={() => setOpen(true)} className="font-semibold text-brand-700 underline dark:text-brand-300">Cuéntanoslo</button> y lo revisamos.
        </p>
      )}
      {label && <p className="basis-full text-xs text-muted">{label}</p>}
      <ReportDialog
        q={q}
        open={open}
        onClose={() => {
          setOpen(false)
          setReported(hasReported(q.id))
        }}
        issueUrl={issueUrl}
      />
    </div>
  )
}
