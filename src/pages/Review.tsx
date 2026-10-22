import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, NotebookPen, Play, RotateCcw, XCircle } from 'lucide-react'
import { useBank } from '@/store/bank'
import { useProgress } from '@/store/progress'
import { Button, EmptyState, PageHeader, Segmented } from '@/components/ui/primitives'
import { QuestionCard } from '@/components/QuestionCard'
import type { Question } from '@/types'

type Tab = 'failed' | 'bookmarked' | 'notes'
const PAGE = 15

export default function Review() {
  const navigate = useNavigate()
  const byId = useBank((s) => s.byId)
  const { attempts, bookmarks, notes } = useProgress()
  const [tab, setTab] = useState<Tab>('failed')
  const [limit, setLimit] = useState(PAGE)

  const lists = useMemo(() => {
    const get = (ids: string[]) => ids.map((id) => byId.get(id)).filter((q): q is Question => !!q)
    const failed = Object.entries(attempts)
      .filter(([, a]) => !a.lastCorrect)
      .sort((a, b) => b[1].lastAt - a[1].lastAt)
      .map(([id]) => id)
    return { failed: get(failed), bookmarked: get(bookmarks), notes: get(Object.keys(notes)) }
  }, [attempts, bookmarks, notes, byId])

  const current = lists[tab]

  return (
    <div>
      <PageHeader
        icon={<RotateCcw className="size-6" />}
        title="Repaso"
        subtitle="Vuelve sobre tus errores: es la forma más eficiente de subir tu puntaje."
        actions={
          tab !== 'notes' &&
          current.length > 0 && (
            <Button onClick={() => navigate(`/practica?status=${tab}&auto=1`)}>
              <Play className="size-4 fill-current" /> Practicar estas ({current.length})
            </Button>
          )
        }
      />
      <Segmented
        value={tab}
        onChange={(t) => {
          setTab(t)
          setLimit(PAGE)
        }}
        className="mb-6"
        options={[
          { value: 'failed', label: <span className="flex items-center gap-1.5"><XCircle className="size-4" /> Falladas · {lists.failed.length}</span> },
          { value: 'bookmarked', label: <span className="flex items-center gap-1.5"><Bookmark className="size-4" /> Marcadas · {lists.bookmarked.length}</span> },
          { value: 'notes', label: <span className="flex items-center gap-1.5"><NotebookPen className="size-4" /> Notas · {lists.notes.length}</span> },
        ]}
      />

      {current.length === 0 ? (
        <EmptyState
          icon={tab === 'failed' ? <XCircle className="size-7" /> : tab === 'bookmarked' ? <Bookmark className="size-7" /> : <NotebookPen className="size-7" />}
          title={tab === 'failed' ? 'Sin errores pendientes' : tab === 'bookmarked' ? 'No has marcado preguntas' : 'Aún no tienes notas'}
          body={tab === 'failed' ? 'Cuando falles una pregunta aparecerá aquí hasta que la respondas bien.' : tab === 'bookmarked' ? 'Usa el ícono de marcador en cualquier pregunta para guardarla.' : 'Agrega notas personales desde el ícono de libreta en cada pregunta.'}
          action={
            <Button variant="outline" onClick={() => navigate('/practica')}>
              Ir a practicar
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {current.slice(0, limit).map((q) => (
            <div key={q.id}>
              <QuestionCard question={q} mode="review" selected={attempts[q.id]?.lastChoice ?? null} compact />
              {tab === 'notes' && notes[q.id] && <div className="-mt-2 rounded-b-2xl border border-t-0 border-soft bg-accent-500/5 px-5 pt-4 pb-3 text-sm whitespace-pre-line">{notes[q.id]}</div>}
            </div>
          ))}
          {current.length > limit && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setLimit(limit + PAGE)}>
                Mostrar más ({current.length - limit})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
