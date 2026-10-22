import { useMemo, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import Papa from 'papaparse'
import { Modal } from '@/components/ui/Modal'
import { Button, Segmented } from '@/components/ui/primitives'
import { useAnki, CUSTOM_DECK_ID } from '@/store/anki'
import { useCollection } from '@/hooks/useCollection'
import { cardsInDeck } from '@/lib/anki/collection'
import { clozeNumbers } from '@/lib/anki/render'
import type { Note } from '@/lib/anki/types'
import { downloadFile, uid } from '@/lib/utils'
import { toast } from '@/store/toasts'

/**
 * Formato "Notas en texto plano" de Anki: campos separados por tabulador (o ; ,),
 * líneas de cabecera que empiezan con # (#separator:tab, #html:true, #tags column:3).
 */
export function parseAnkiText(text: string): { front: string; back: string; tags: string[] }[] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/)
  let sep = '\t'
  let tagCol = 3
  const body: string[] = []
  for (const l of lines) {
    const h = /^#separator:(\w+)/i.exec(l)
    if (h) {
      const v = h[1].toLowerCase()
      sep = v === 'tab' ? '\t' : v === 'semicolon' ? ';' : v === 'comma' ? ',' : v === 'pipe' ? '|' : sep
      continue
    }
    const t = /^#tags column:(\d+)/i.exec(l)
    if (t) {
      tagCol = Number(t[1])
      continue
    }
    if (l.startsWith('#')) continue
    if (l.trim()) body.push(l)
  }
  if (!body.length) return []
  if (!body.some((l) => l.includes(sep))) sep = [';', ',', '|'].find((s) => body.every((l) => l.includes(s))) ?? sep
  const parsed = Papa.parse<string[]>(body.join('\n'), { delimiter: sep, quoteChar: '"' })
  return parsed.data
    .filter((r) => r.length && r[0]?.trim())
    .map((r) => ({ front: r[0].trim(), back: (r[1] ?? '').trim(), tags: (r[tagCol - 1] ?? '').split(/\s+/).filter(Boolean) }))
}

export function ImportExport({ open, onClose }: { open: boolean; onClose: () => void }) {
  const col = useCollection()
  const importNotes = useAnki((s) => s.importNotes)
  const addDeck = useAnki((s) => s.addDeck)
  const [tab, setTab] = useState<'import' | 'export'>('import')
  const [text, setText] = useState('')
  const [deckId, setDeckId] = useState(CUSTOM_DECK_ID)
  const [reversed, setReversed] = useState(false)
  const [exportDeck, setExportDeck] = useState('todas')

  const rows = useMemo(() => (text.trim() ? parseAnkiText(text) : []), [text])
  const decks = col.decks.filter((d) => !d.filtered && d.id !== 'mis-errores')

  const doImport = () => {
    const now = Date.now()
    const notes: Note[] = rows.map((r, i) => {
      const cloze = clozeNumbers(r.front).length > 0
      return { id: uid('imp'), deckId, type: cloze ? 'cloze' : reversed ? 'reversed' : 'basic', front: r.front, back: r.back, tags: r.tags, createdAt: now + i, modifiedAt: now, source: 'user' }
    })
    importNotes(notes)
    toast({ kind: 'success', title: `${notes.length} notas importadas` })
    setText('')
    onClose()
  }

  const doExport = () => {
    const cards = exportDeck === 'todas' ? col.cards : cardsInDeck(col, exportDeck)
    const notes = [...new Map(cards.map((c) => [c.noteId, c.note])).values()]
    const clean = (s: string) => s.replace(/\t/g, ' ').replace(/\r?\n/g, '<br>')
    const body = notes.map((n) => [clean(n.front), clean(n.back + (n.extra ? `<hr>${n.extra}` : '')), n.tags.join(' ')].join('\t')).join('\n')
    const name = exportDeck === 'todas' ? 'medlogic' : (col.deckById.get(exportDeck)?.name ?? 'mazo').replace(/::/g, '-')
    downloadFile(`${name}.txt`, `#separator:tab\n#html:true\n#tags column:3\n${body}`, 'text/plain;charset=utf-8')
    toast({ kind: 'success', title: `${notes.length} notas exportadas`, body: 'En Anki: Archivo → Importar.' })
  }

  const select = 'mt-1.5 h-10 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500'

  return (
    <Modal open={open} onClose={onClose} title="Importar / exportar tarjetas" className="sm:max-w-2xl">
      <Segmented value={tab} onChange={setTab} options={[{ value: 'import', label: 'Importar' }, { value: 'export', label: 'Exportar a Anki' }]} className="mb-4" />
      {tab === 'import' ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Pega o sube tarjetas en el formato de texto de Anki: <b>frente⇥reverso⇥etiquetas</b> por línea (tabulador, punto y coma o coma). Las notas con <code>{'{{c1::…}}'}</code> se importan como cloze. ¿No tienes tarjetas? Usa el prompt «Flashcards de alto rendimiento» en la sección Prompts y pega aquí el resultado.
          </p>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-soft px-3 py-2 text-sm font-semibold hover:border-brand-500/40">
            <Upload className="size-4" /> Elegir archivo .txt / .csv
            <input type="file" accept=".txt,.csv,.tsv" className="hidden" onChange={async (e) => setText((await e.target.files?.[0]?.text()) ?? '')} />
          </label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder={'Antídoto de la heparina\tProtamina\tfarmaco antidotos\nEl agente de la bronquiolitis es el {{c1::VSR}}\t\tpediatria'} className="w-full rounded-xl border border-soft surface-2 p-3 font-mono text-xs outline-none focus:border-brand-500" />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Mazo de destino</span>
              <select
                value={deckId}
                onChange={(e) => {
                  if (e.target.value === '__new') {
                    const name = window.prompt('Nombre del mazo nuevo')
                    if (name?.trim()) setDeckId(addDeck(name))
                  } else setDeckId(e.target.value)
                }}
                className={select}
              >
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
                <option value="__new">+ Nuevo mazo…</option>
              </select>
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input type="checkbox" checked={reversed} onChange={(e) => setReversed(e.target.checked)} className="size-4 accent-[var(--color-brand-500)]" />
              Crear también la tarjeta invertida
            </label>
          </div>
          {rows.length > 0 && (
            <div className="rounded-xl surface-2 p-3 text-xs">
              <b>{rows.length} notas detectadas.</b> Primera: «{rows[0].front.slice(0, 80)}» → «{rows[0].back.slice(0, 80)}»
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={doImport} disabled={!rows.length}>
              <Upload className="size-4" /> Importar {rows.length || ''}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">Descarga un archivo de texto que Anki importa directamente (Archivo → Importar), con formato y etiquetas.</p>
          <label className="block">
            <span className="text-sm font-medium">Mazo</span>
            <select value={exportDeck} onChange={(e) => setExportDeck(e.target.value)} className={select}>
              <option value="todas">Todas las tarjetas</option>
              {col.decks.filter((d) => !d.filtered).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end">
            <Button onClick={doExport}>
              <Download className="size-4" /> Exportar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
