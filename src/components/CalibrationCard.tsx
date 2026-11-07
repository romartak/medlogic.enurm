import { useMemo } from 'react'
import { Gauge } from 'lucide-react'
import { CONFIDENCE_LABEL, ERROR_LABEL, summarize, type ErrorKind } from '@/lib/metacog'
import { useMetacog } from '@/store/metacog'
import { Card, ProgressBar } from '@/components/ui/primitives'
import { pct } from '@/lib/utils'

const BAR: Record<string, string> = { seguro: '#10b981', dudo: '#f59e0b', adivino: '#ef4444' }

/** «Tu calibración»: ¿acierta más cuando dice estar seguro? ¿Por qué falla? */
export function CalibrationCard() {
  const records = useMetacog((s) => s.records)
  const ask = useMetacog((s) => s.askConfidence)
  const setAsk = useMetacog((s) => s.setAskConfidence)
  const clear = useMetacog((s) => s.clear)
  const sum = useMemo(() => summarize(records), [records])
  if (!sum.total && ask) return null

  const errorRows = (Object.keys(sum.errors) as ErrorKind[]).filter((k) => sum.errors[k] > 0)
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <Gauge className="size-5 text-brand-600 dark:text-brand-300" aria-hidden /> Tu calibración
        </h2>
        <div className="flex items-center gap-3 text-xs">
          <button type="button" onClick={() => setAsk(!ask)} className="relative text-muted underline-offset-2 after:absolute after:-inset-3 hover:underline">
            {ask ? 'Dejar de preguntar' : 'Volver a preguntar'}
          </button>
          {sum.total > 0 && (
            <button type="button" onClick={clear} className="relative text-muted underline-offset-2 after:absolute after:-inset-3 hover:underline">
              Borrar
            </button>
          )}
        </div>
      </div>

      {sum.rated < 5 ? (
        <p className="mt-3 text-sm text-muted">En Práctica, indica qué tan seguro estás antes de responder. Con unas 20 respuestas verás si tu seguridad coincide con tus aciertos.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">Si dices «seguro», deberías acertar casi siempre. Si no es así, la barra te lo muestra.</p>
          <ul className="mt-4 space-y-3">
            {sum.calibration.map((r) => (
              <li key={r.conf}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold">{CONFIDENCE_LABEL[r.conf]}</span>
                  <span className="text-xs text-muted tabular-nums">{r.n ? `${pct(r.correct, r.n)} % de aciertos · ${r.n} respuestas` : 'sin respuestas'}</span>
                </div>
                <ProgressBar value={r.accuracy} color={BAR[r.conf]} height="h-2" />
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl surface-2 p-3 text-sm">
              <div className="font-display text-2xl font-extrabold tabular-nums">{sum.overconfidentWrong}</div>
              <div className="text-xs text-muted">fallos estando seguro (puntos ciegos)</div>
            </div>
            <div className="rounded-xl surface-2 p-3 text-sm">
              <div className="font-display text-2xl font-extrabold tabular-nums">{sum.luckyRight}</div>
              <div className="text-xs text-muted">aciertos «adivinando» (suerte)</div>
            </div>
          </div>
        </>
      )}

      {sum.wrong >= 5 && (
        <div className="mt-5 border-t border-soft pt-4">
          <h3 className="text-sm font-semibold">¿Por qué fallas?</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {errorRows.map((k) => (
              <li key={k} className="flex justify-between gap-3">
                <span>{ERROR_LABEL[k]}</span>
                <span className="text-muted tabular-nums">{pct(sum.errors[k], sum.wrong)} %</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Se deduce de cuánto tardas y de tu seguridad; es una guía, no un diagnóstico.</p>
        </div>
      )}
    </Card>
  )
}
