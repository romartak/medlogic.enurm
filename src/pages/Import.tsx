import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CircleCheck, Database, FileJson, FileSpreadsheet, Info, Trash2, TriangleAlert, Upload } from 'lucide-react'
import { parseQuestionFile, CSV_TEMPLATE, JSON_TEMPLATE, type ImportResult } from '@/lib/importer'
import { useBank } from '@/store/bank'
import { Badge, Button, Card, PageHeader, Segmented, SpecialtyBadge } from '@/components/ui/primitives'
import { QuestionCard } from '@/components/QuestionCard'
import { Modal } from '@/components/ui/Modal'
import { cn, downloadFile } from '@/lib/utils'
import { toast } from '@/store/toasts'
import { celebrate } from '@/lib/fx'

export default function Import() {
  const { source, bundledCount, importedCount, questions, saveImported, clearImported } = useBank()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<{ name: string; text: string } | null>(null)
  const [base, setBase] = useState<'auto' | 0 | 1>('auto')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'merge' | 'replace'>('merge')
  const [saving, setSaving] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const parse = (f: { name: string; text: string }, b = base) => {
    try {
      setError(null)
      setResult(parseQuestionFile(f.text, f.name, { answerBase: b }))
    } catch (e) {
      setResult(null)
      setError(e instanceof Error ? e.message : 'No se pudo leer el archivo.')
    }
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    const text = await f.text()
    const data = { name: f.name, text }
    setFile(data)
    parse(data)
  }

  const save = async () => {
    if (!result?.questions.length) return
    setSaving(true)
    try {
      await saveImported(result.questions, mode)
      celebrate('big')
      toast({ kind: 'success', title: `${result.questions.length.toLocaleString('es-DO')} preguntas importadas`, body: 'Ya están disponibles en toda la plataforma.' })
      setFile(null)
      setResult(null)
    } catch {
      toast({ kind: 'error', title: 'No se pudo guardar', body: 'Revisa el espacio disponible del navegador.' })
    } finally {
      setSaving(false)
    }
  }

  const bySpec: Record<string, number> = {}
  const byYear: Record<string, number> = {}
  for (const q of result?.questions ?? []) {
    bySpec[q.specialty] = (bySpec[q.specialty] ?? 0) + 1
    byYear[q.year ?? 'Sin año'] = (byYear[q.year ?? 'Sin año'] ?? 0) + 1
  }

  return (
    <div>
      <PageHeader icon={<Upload className="size-6" />} title="Importar preguntas" subtitle="Carga tu base de datos (JSON o CSV). Se valida, se normaliza y queda disponible en práctica, simulacros, juegos y estadísticas." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              onFile(e.dataTransfer.files[0])
            }}
            onClick={() => inputRef.current?.click()}
            animate={{ scale: dragging ? 1.01 : 1 }}
            className={cn('card flex cursor-pointer flex-col items-center border-2 border-dashed px-6 py-14 text-center transition-colors', dragging ? 'border-brand-500 bg-brand-500/5' : 'hover:border-brand-500/50')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          >
            <motion.div animate={dragging ? { y: -6 } : { y: 0 }} className="grid size-16 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
              <Upload className="size-7" />
            </motion.div>
            <h2 className="mt-4 text-lg font-semibold">{file ? file.name : 'Arrastra tu archivo aquí'}</h2>
            <p className="mt-1 text-sm text-muted">o haz clic para seleccionarlo · .json o .csv</p>
            <input ref={inputRef} type="file" accept=".json,.csv,application/json,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          </motion.div>

          {error && (
            <Card className="flex gap-3 border-rose-500/40 bg-rose-500/5 p-4 text-sm">
              <TriangleAlert className="size-5 shrink-0 text-rose-500" />
              {error}
            </Card>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <Card className="p-5 sm:p-6">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-emerald-500/10 p-4">
                      <div className="font-display text-3xl font-bold text-emerald-600">{result.questions.length.toLocaleString('es-DO')}</div>
                      <div className="text-xs text-muted">válidas</div>
                    </div>
                    <div className="rounded-xl bg-rose-500/10 p-4">
                      <div className="font-display text-3xl font-bold text-rose-600">{result.errors.length}</div>
                      <div className="text-xs text-muted">con errores</div>
                    </div>
                    <div className="rounded-xl bg-amber-500/10 p-4">
                      <div className="font-display text-3xl font-bold text-amber-600">{result.warnings.length}</div>
                      <div className="text-xs text-muted">advertencias</div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-medium">Respuestas numéricas:</span>
                    <Segmented
                      value={base}
                      onChange={(b) => {
                        setBase(b)
                        if (file) parse(file, b)
                      }}
                      options={[{ value: 'auto', label: `Auto (${result.oneBased ? 'desde 1' : 'desde 0'})` }, { value: 1, label: '1 = A' }, { value: 0, label: '0 = A' }]}
                    />
                  </div>

                  {(result.errors.length > 0 || result.warnings.length > 0) && (
                    <details className="mt-5 rounded-xl surface-2 p-3 text-sm">
                      <summary className="cursor-pointer font-medium">Ver detalles por fila</summary>
                      <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto text-xs">
                        {result.errors.slice(0, 200).map((e, i) => (
                          <li key={`e${i}`} className="text-rose-600 dark:text-rose-400">
                            Fila {e.row}: {e.message}
                          </li>
                        ))}
                        {result.warnings.slice(0, 200).map((w, i) => (
                          <li key={`w${i}`} className="text-amber-600 dark:text-amber-400">
                            Fila {w.row}: {w.message}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="mb-2 text-xs font-semibold text-muted uppercase">Por especialidad</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(bySpec)
                          .sort((a, b) => b[1] - a[1])
                          .map(([s, n]) => (
                            <span key={s} className="flex items-center gap-1">
                              <SpecialtyBadge id={s} />
                              <span className="text-xs text-muted">{n}</span>
                            </span>
                          ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-semibold text-muted uppercase">Por año</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(byYear)
                          .sort((a, b) => b[0].localeCompare(a[0]))
                          .map(([y, n]) => (
                            <Badge key={y}>
                              {y} · {n}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {result.questions[0] && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-muted">Vista previa de la primera pregunta</h3>
                    <QuestionCard question={result.questions[0]} mode="review" selected={null} compact />
                  </div>
                )}

                <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <Segmented value={mode} onChange={setMode} options={[{ value: 'merge', label: 'Combinar con las importadas' }, { value: 'replace', label: 'Reemplazar importadas' }]} />
                  <Button size="lg" onClick={save} disabled={!result.questions.length || saving}>
                    <CircleCheck className="size-5" /> {saving ? 'Guardando…' : `Importar ${result.questions.length.toLocaleString('es-DO')}`}
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Database className="size-5 text-brand-500" /> Banco actual
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Total en uso</dt>
                <dd className="font-semibold">{questions.length.toLocaleString('es-DO')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Publicadas con la web</dt>
                <dd className="font-semibold">{bundledCount.toLocaleString('es-DO')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Importadas en este dispositivo</dt>
                <dd className="font-semibold">{importedCount.toLocaleString('es-DO')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Origen</dt>
                <dd>
                  <Badge color={source === 'sample' ? '#f59e0b' : '#10b981'}>{{ sample: 'Muestra', bundled: 'Oficial', imported: 'Importado', mixed: 'Oficial + importado' }[source]}</Badge>
                </dd>
              </div>
            </dl>
            {importedCount > 0 && (
              <Button variant="ghost" size="sm" className="mt-4 w-full text-rose-500" onClick={() => setConfirmClear(true)}>
                <Trash2 className="size-4" /> Eliminar preguntas importadas
              </Button>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-semibold">Plantillas</h2>
            <p className="mt-1 text-sm text-muted">Descarga un ejemplo con el formato esperado.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => downloadFile('plantilla-preguntas.csv', '﻿' + CSV_TEMPLATE, 'text/csv;charset=utf-8')}>
                <FileSpreadsheet className="size-4" /> CSV
              </Button>
              <Button variant="outline" onClick={() => downloadFile('plantilla-preguntas.json', JSON_TEMPLATE)}>
                <FileJson className="size-4" /> JSON
              </Button>
            </div>
          </Card>

          <Card className="p-5 text-sm sm:p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Info className="size-4 text-sky-500" /> Formato flexible
            </h2>
            <ul className="mt-3 space-y-2 text-muted">
              <li>• Encabezados en español o inglés: <code>pregunta</code>/<code>stem</code>, <code>opcion_a</code>…, <code>respuesta</code>, <code>especialidad</code>, <code>año</code>, <code>explicacion</code>.</li>
              <li>• La respuesta puede ser una letra (A–F), un número o el texto de la opción.</li>
              <li>• Las especialidades se reconocen aunque estén escritas distinto («Gineco», «GO», «Obstetricia»).</li>
              <li>• Para publicarlas para todos, guarda el archivo en <code>public/data/questions.json</code> con <code>npm run import:questions</code>.</li>
            </ul>
          </Card>
        </div>
      </div>

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="¿Eliminar las preguntas importadas?">
        <p className="text-sm text-muted">Se eliminarán {importedCount.toLocaleString('es-DO')} preguntas de este dispositivo. Tu progreso (respuestas, marcadas) no se borra.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmClear(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              await clearImported()
              setConfirmClear(false)
              toast({ kind: 'info', title: 'Preguntas importadas eliminadas' })
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
