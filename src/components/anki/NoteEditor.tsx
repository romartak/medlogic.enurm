import { useEffect, useMemo, useRef, useState } from 'react'
import { Bold, Brackets, Eye, Highlighter, Italic, Plus, Save, Underline } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button, Segmented } from '@/components/ui/primitives'
import { useAnki, CUSTOM_DECK_ID } from '@/store/anki'
import { useCollection } from '@/hooks/useCollection'
import { cardOrds, clozeNumbers, renderCard } from '@/lib/anki/render'
import type { Note, NoteType } from '@/lib/anki/types'
import { SPECIALTIES } from '@/data/specialties'
import { toast } from '@/store/toasts'
import { CardHtml, useNoteEditor } from './common'

const TYPES: { value: NoteType; label: string }[] = [
  { value: 'basic', label: 'Básica' },
  { value: 'reversed', label: 'Básica + invertida' },
  { value: 'cloze', label: 'Cloze (huecos)' },
]

function wrapSelection(el: HTMLTextAreaElement, before: string, after: string, set: (v: string) => void) {
  const { selectionStart: a, selectionEnd: b, value } = el
  const next = value.slice(0, a) + before + value.slice(a, b) + after + value.slice(b)
  set(next)
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(a + before.length, b + before.length)
  })
}

export function NoteEditor() {
  const request = useNoteEditor((s) => s.request)
  const close = useNoteEditor((s) => s.close)
  const col = useCollection()
  const addNote = useAnki((s) => s.addNote)
  const updateNote = useAnki((s) => s.updateNote)
  const addDeck = useAnki((s) => s.addDeck)
  const editing: Note | undefined = request?.noteId ? col.notes.find((n) => n.id === request.noteId) : undefined

  const [type, setType] = useState<NoteType>('basic')
  const [deckId, setDeckId] = useState(CUSTOM_DECK_ID)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [extra, setExtra] = useState('')
  const [tags, setTags] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [preview, setPreview] = useState(false)
  const frontRef = useRef<HTMLTextAreaElement>(null)
  const backRef = useRef<HTMLTextAreaElement>(null)
  const lastFocused = useRef<HTMLTextAreaElement | null>(null)

  // El editor vive fuera del router: se cierra si el usuario navega a otra página.
  useEffect(() => {
    if (!request) return
    const onNav = () => close()
    window.addEventListener('hashchange', onNav)
    return () => window.removeEventListener('hashchange', onNav)
  }, [request, close])

  useEffect(() => {
    if (!request) return
    const src = editing ?? request.prefill ?? {}
    setType((src as Partial<Note>).type ?? 'basic')
    setDeckId((src as Partial<Note>).deckId ?? CUSTOM_DECK_ID)
    setFront(src.front ?? '')
    setBack(src.back ?? '')
    setExtra(src.extra ?? '')
    setTags((src.tags ?? []).join(' '))
    setSpecialty(src.specialty ?? '')
    setPreview(false)
    setTimeout(() => frontRef.current?.focus(), 50)
  }, [request, editing])

  const decks = useMemo(() => col.decks.filter((d) => !d.filtered && d.id !== 'mis-errores').sort((a, b) => a.name.localeCompare(b.name, 'es')), [col.decks])
  const draft: Note = { id: 'preview', deckId, type, front, back, extra, tags: [], createdAt: 0, modifiedAt: 0, source: 'user' }
  const ords = cardOrds(draft)
  const firstCard = renderCard({ ord: ords[0], note: draft })
  const valid = type === 'cloze' ? clozeNumbers(front).length > 0 : front.trim() !== '' && back.trim() !== ''

  const nextCloze = (same: boolean) => {
    const nums = clozeNumbers(front)
    const n = nums.length ? (same ? nums[nums.length - 1] : nums[nums.length - 1] + 1) : 1
    if (frontRef.current) wrapSelection(frontRef.current, `{{c${n}::`, '}}', setFront)
  }

  const fmt = (before: string, after: string) => {
    const el = lastFocused.current ?? frontRef.current
    if (!el) return
    wrapSelection(el, before, after, el === backRef.current ? setBack : el === frontRef.current ? setFront : setExtra)
  }

  const save = () => {
    if (!valid) return
    const tagList = tags.split(/\s+/).map((t) => t.trim()).filter(Boolean)
    const patch = { type, deckId, front: front.trim(), back: back.trim(), extra: extra.trim() || undefined, tags: tagList, specialty: specialty || undefined }
    if (editing) {
      updateNote(editing, editing.source === 'user' ? patch : { front: patch.front, back: patch.back, extra: patch.extra, tags: patch.tags, deckId: patch.deckId })
      toast({ kind: 'success', title: 'Nota guardada' })
      close()
    } else {
      addNote(patch)
      toast({ kind: 'success', title: ords.length > 1 ? `Nota agregada (${ords.length} tarjetas)` : 'Tarjeta agregada' })
      // Como en Anki: se conservan mazo, tipo y etiquetas para seguir agregando.
      setFront('')
      setBack('')
      setExtra('')
      frontRef.current?.focus()
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      save()
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
      e.preventDefault()
      nextCloze(e.altKey)
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      fmt('<b>', '</b>')
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault()
      fmt('<i>', '</i>')
    }
  }

  const area = 'mt-1.5 w-full resize-y rounded-xl border border-soft surface-2 p-3 text-sm outline-none focus:border-brand-500'
  const isBuiltin = editing && editing.source !== 'user'

  return (
    <Modal open={!!request} onClose={close} title={editing ? 'Editar nota' : 'Agregar'} className="sm:max-w-2xl">
      <div className="space-y-4" onKeyDown={onKey}>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented value={type} onChange={(t) => !isBuiltin && setType(t)} options={TYPES} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Mazo</span>
            <select
              value={deckId}
              onChange={(e) => {
                if (e.target.value === '__new') {
                  const name = window.prompt('Nombre del nuevo mazo (usa "::" para submazos, p. ej. "Mis tarjetas::Cardio")')
                  if (name?.trim()) setDeckId(addDeck(name))
                } else setDeckId(e.target.value)
              }}
              className="mt-1.5 h-10 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500"
            >
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
              <option value="__new">+ Nuevo mazo…</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Especialidad</span>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} disabled={!!isBuiltin} className="mt-1.5 h-10 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500">
              <option value="">Sin especialidad</option>
              {SPECIALTIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-1">
          {[
            { icon: Bold, title: 'Negrita (Ctrl+B)', run: () => fmt('<b>', '</b>') },
            { icon: Italic, title: 'Cursiva (Ctrl+I)', run: () => fmt('<i>', '</i>') },
            { icon: Underline, title: 'Subrayado', run: () => fmt('<u>', '</u>') },
            { icon: Highlighter, title: 'Resaltar', run: () => fmt('<mark>', '</mark>') },
          ].map((b) => (
            <button key={b.title} type="button" title={b.title} onClick={b.run} className="grid size-8 place-items-center rounded-lg surface-2 text-muted hover:text-[var(--text)]">
              <b.icon className="size-4" />
            </button>
          ))}
          {type === 'cloze' && (
            <button type="button" onClick={() => nextCloze(false)} title="Hueco nuevo (Ctrl+Shift+C) · mismo número: Ctrl+Alt+Shift+C" className="flex h-8 items-center gap-1.5 rounded-lg bg-accent-500/15 px-2.5 text-xs font-semibold text-accent-600 dark:text-accent-400">
              <Brackets className="size-4" /> [...] Hueco
            </button>
          )}
          <button type="button" onClick={() => setPreview(!preview)} className="ml-auto flex h-8 items-center gap-1.5 rounded-lg surface-2 px-2.5 text-xs font-semibold text-muted hover:text-[var(--text)]">
            <Eye className="size-4" /> {preview ? 'Editar' : 'Vista previa'}
          </button>
        </div>

        {preview ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-soft p-4 text-center">
              <div className="mb-2 text-[10px] font-bold tracking-wider text-muted uppercase">Frente</div>
              <CardHtml html={firstCard.front} />
            </div>
            <div className="rounded-xl border border-brand-500/30 p-4 text-center">
              <div className="mb-2 text-[10px] font-bold tracking-wider text-muted uppercase">Reverso</div>
              <CardHtml html={firstCard.back} />
            </div>
          </div>
        ) : (
          <>
            <label className="block">
              <span className="text-sm font-medium">{type === 'cloze' ? 'Texto' : 'Frente'}</span>
              <textarea
                ref={frontRef}
                value={front}
                onFocus={(e) => (lastFocused.current = e.currentTarget)}
                onChange={(e) => setFront(e.target.value)}
                rows={type === 'cloze' ? 4 : 3}
                className={area}
                placeholder={type === 'cloze' ? 'El antídoto de la heparina es la {{c1::protamina}}.' : 'Antídoto de la heparina'}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{type === 'cloze' ? 'Información adicional (opcional)' : 'Reverso'}</span>
              <textarea ref={backRef} value={back} onFocus={(e) => (lastFocused.current = e.currentTarget)} onChange={(e) => setBack(e.target.value)} rows={3} className={area} placeholder={type === 'cloze' ? 'Se muestra al voltear' : 'Sulfato de protamina'} />
            </label>
            {type !== 'cloze' && (
              <label className="block">
                <span className="text-sm font-medium">Extra (opcional, solo en el reverso)</span>
                <textarea value={extra} onFocus={(e) => (lastFocused.current = e.currentTarget)} onChange={(e) => setExtra(e.target.value)} rows={2} className={area} />
              </label>
            )}
          </>
        )}

        <label className="block">
          <span className="text-sm font-medium">Etiquetas</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="cardio sca alto-rendimiento" className="mt-1.5 h-10 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500" />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-xs text-muted">
            {valid ? `Generará ${ords.length} ${ords.length === 1 ? 'tarjeta' : 'tarjetas'}` : type === 'cloze' ? 'Agrega al menos un hueco {{c1::…}}' : 'Completa frente y reverso'} · <span className="kbd">Ctrl</span>+<span className="kbd">↵</span>
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={close}>
              Cerrar
            </Button>
            <Button onClick={save} disabled={!valid}>
              {editing ? <Save className="size-4" /> : <Plus className="size-4" />} {editing ? 'Guardar' : 'Agregar'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
