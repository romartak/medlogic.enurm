import { useEffect, useState } from 'react'
import { CloudDownload, WifiOff } from 'lucide-react'
import { downloadForOffline, fetchPrecacheInfo, formatMB, readSaved, useOnline, type OfflineSaved } from '@/lib/offline'
import { Button, Card, ProgressBar } from '@/components/ui/primitives'
import { formatDate } from '@/lib/utils'

/** «Estudiar sin conexión»: guarda la app y el banco de preguntas en el dispositivo. */
export function OfflineCard() {
  const online = useOnline()
  const [info, setInfo] = useState<{ bytes: number; files: number } | null>(null)
  const [saved, setSaved] = useState<OfflineSaved | null>(() => readSaved())
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchPrecacheInfo().then(setInfo)
  }, [])

  const start = async () => {
    if (!info) return
    setError(null)
    setProgress({ done: 0, total: info.files })
    try {
      const { failed } = await downloadForOffline(info, (done, total) => setProgress({ done, total }))
      setSaved(readSaved())
      if (failed) setError(`No se pudieron guardar ${failed} archivos. Revisa tu conexión e inténtalo otra vez.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.')
    } finally {
      setProgress(null)
    }
  }

  const busy = progress !== null
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-semibold">
        <WifiOff className="size-5 text-brand-600 dark:text-brand-300" aria-hidden /> Estudiar sin conexión
      </h2>
      <p className="mt-1 text-sm text-muted">Guarda la plataforma y todo el banco de preguntas en este dispositivo para estudiar en la guagua, sin datos o sin señal. Tu progreso se guarda en el teléfono y se sincroniza al volver la conexión.</p>

      {saved && !busy && (
        <p className="mt-3 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          Guardado el {formatDate(saved.at)} · {formatMB(saved.bytes)}. Si publicamos una versión nueva, vuelve a guardar para actualizar.
        </p>
      )}
      {busy && progress && (
        <div className="mt-4" role="status" aria-live="polite">
          <ProgressBar value={progress.total ? progress.done / progress.total : 0} />
          <p className="mt-1 text-xs text-muted tabular-nums">
            Guardando {progress.done} de {progress.total} archivos…
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={start} disabled={!info || busy || !online}>
          <CloudDownload className="size-4" /> {saved ? 'Actualizar' : 'Guardar'} {info ? `(${formatMB(info.bytes)})` : ''}
        </Button>
        {!online && <span className="text-xs text-muted">Necesitas conexión para guardar.</span>}
        {!info && online && <span className="text-xs text-muted">Disponible en la versión publicada.</span>}
      </div>
    </Card>
  )
}

/** Franja que aparece solo cuando no hay conexión. */
export function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-200">
      <WifiOff className="size-4 shrink-0" aria-hidden />
      Sin conexión. Puedes seguir estudiando lo que ya está guardado; tu progreso se sincroniza al volver.
    </div>
  )
}
