import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft, BookOpenCheck, CalendarRange, Check, ClipboardCopy, ExternalLink, FileText, GraduationCap, Hammer, HeartHandshake, Languages, Layers, Lightbulb, ListChecks, MessageCircleQuestion, Mic, Network, Paperclip, PenLine,
  Presentation, Search, Sparkles, Star, Stethoscope, Table, UserRound, WandSparkles, type LucideIcon,
} from 'lucide-react'
import { fillPrompt, PROMPT_CATEGORIES, PROMPT_TOOLS, PROMPTS, type PromptItem } from '@/data/prompts'
import { Button, Card, Chip, EmptyState, LinkButton, PageHeader, Segmented } from '@/components/ui/primitives'
import { copyText, openInAi } from '@/lib/clipboard'
import { normalizeText } from '@/data/specialties'
import { toast } from '@/store/toasts'
import { cn, tintText } from '@/lib/utils'

export const PROMPT_ICONS: Record<string, LucideIcon> = {
  presentation: Presentation, layers: Layers, 'user-round': UserRound, 'message-circle-question': MessageCircleQuestion, lightbulb: Lightbulb, 'list-checks': ListChecks, stethoscope: Stethoscope, 'file-text': FileText,
  'book-open-check': BookOpenCheck, sparkles: Sparkles, table: Table, network: Network, 'pen-line': PenLine, languages: Languages, 'calendar-range': CalendarRange, 'graduation-cap': GraduationCap, mic: Mic, 'heart-handshake': HeartHandshake,
}

const FAV_KEY = 'medlogic-prompt-favs'
function useFavorites() {
  const [favs, setFavs] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]')
    } catch {
      return []
    }
  })
  const toggle = (id: string) => {
    const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id]
    setFavs(next)
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(next))
    } catch {
      /* almacenamiento no disponible */
    }
  }
  return { favs, toggle }
}

function PromptCard({ p, fav, onFav, i }: { p: PromptItem; fav: boolean; onFav: () => void; i: number }) {
  const cat = PROMPT_CATEGORIES.find((c) => c.id === p.category)!
  const Icon = PROMPT_ICONS[p.icon] ?? Sparkles
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }} className="relative h-full">
      <Link to={`/prompts/${p.id}`} className="card card-hover group flex h-full flex-col p-5">
        <span className="grid size-11 place-items-center rounded-xl transition-transform group-hover:scale-110 group-hover:-rotate-6" style={{ backgroundColor: `${cat.color}1a`, color: cat.color }}>
          <Icon className="size-5" />
        </span>
        <h3 className="mt-4 pr-6 font-display font-bold">{p.title}</h3>
        <p className="mt-1 flex-1 text-sm text-muted">{p.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2 text-xs font-semibold">
          <span style={tintText(cat.color)}>{cat.name}</span>
          {p.attachment && (
            <span className="flex items-center gap-1 rounded-full surface-2 px-2 py-0.5 text-[10px] text-muted" title={p.attachment}>
              <Paperclip className="size-3" /> Adjunta archivo
            </span>
          )}
        </div>
      </Link>
      <button onClick={onFav} className={cn('absolute top-4 right-4 rounded-full p-1.5', fav ? 'text-amber-500' : 'text-muted opacity-60 hover:opacity-100')} aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
        <Star className={cn('size-4', fav && 'fill-amber-400')} />
      </button>
    </motion.div>
  )
}

/* ---------- constructor de prompts ---------- */

const BUILDER_FIELDS = [
  { key: 'rol', label: 'Rol', help: '¿Quién debe ser la IA?', chips: ['un profesor de medicina con 20 años de experiencia', 'un residente de último año que prepara a internos', 'un editor científico riguroso', 'un experto en educación médica'] },
  { key: 'contexto', label: 'Contexto', help: '¿Quién eres y para qué lo necesitas?', chips: ['Me preparo para el ENURM en 4 meses.', 'Soy interno y tengo poco tiempo.', 'Debo exponer en el pase de visita mañana.'] },
  { key: 'tarea', label: 'Tarea', help: '¿Qué debe hacer exactamente?', chips: ['Explícame', 'Resume', 'Crea 20 preguntas sobre', 'Compara', 'Corrige'] },
  { key: 'formato', label: 'Formato', help: '¿Cómo quieres la respuesta?', chips: ['Tabla en Markdown', 'Viñetas cortas', 'Paso a paso numerado', 'Flashcards frente<TAB>reverso', 'Máximo 300 palabras'] },
  { key: 'restricciones', label: 'Reglas', help: 'Límites, tono y verificación', chips: ['Cita guías con año.', 'Si no estás seguro, dilo; no inventes.', 'Lenguaje claro, sin relleno.', 'Hazme una pregunta a la vez.'] },
] as const

function Builder() {
  const [v, setV] = useState<Record<string, string>>({})
  const filled = BUILDER_FIELDS.filter((f) => (v[f.key] ?? '').trim()).length
  const score = Math.round((filled / BUILDER_FIELDS.length) * 100)
  const prompt = [
    v.rol && `Actúa como ${v.rol.trim()}.`,
    v.contexto && `Contexto: ${v.contexto.trim()}`,
    v.tarea && `Tarea: ${v.tarea.trim()}`,
    v.formato && `Formato de la respuesta: ${v.formato.trim()}`,
    v.restricciones && `Reglas: ${v.restricciones.trim()}`,
  ]
    .filter(Boolean)
    .join('\n\n')
  const add = (key: string, text: string) => setV({ ...v, [key]: (v[key] ? `${v[key].trim()} ` : '') + text })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-5 p-5 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-bold">Construye tu propio prompt</h2>
          <p className="text-sm text-muted">Un buen prompt tiene 5 partes: rol, contexto, tarea, formato y reglas. Toca una sugerencia para agregarla.</p>
        </div>
        {BUILDER_FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="flex items-baseline justify-between">
              <span className="text-sm font-semibold">{f.label}</span>
              <span className="text-xs text-muted">{f.help}</span>
            </span>
            <textarea value={v[f.key] ?? ''} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} rows={2} className="mt-1.5 w-full resize-y rounded-xl border border-soft surface-2 p-3 text-sm outline-none focus:border-brand-500" />
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              {f.chips.map((c) => (
                <button key={c} type="button" onClick={() => add(f.key, c)} className="rounded-full border border-soft px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-brand-500/50 hover:text-[var(--text)]">
                  + {c}
                </button>
              ))}
            </span>
          </label>
        ))}
      </Card>
      <div className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">Calidad del prompt</span>
            <span className={cn('font-bold', score >= 80 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-rose-500')}>{score}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full surface-2">
            <motion.div className={cn('h-full rounded-full', score >= 80 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500')} animate={{ width: `${score}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">{score === 100 ? '¡Excelente! Tu prompt tiene todas las partes.' : `Te ${BUILDER_FIELDS.length - filled === 1 ? 'falta 1 parte' : `faltan ${BUILDER_FIELDS.length - filled} partes`}: ${BUILDER_FIELDS.filter((f) => !(v[f.key] ?? '').trim()).map((f) => f.label.toLowerCase()).join(', ')}.`}</p>
        </Card>
        <Card className="p-5">
          <div className="mb-3 text-xs font-semibold text-muted uppercase">Vista previa</div>
          <pre className="max-h-80 overflow-y-auto rounded-xl surface-2 p-4 text-sm whitespace-pre-wrap [overflow-wrap:anywhere]">{prompt || 'Tu prompt aparecerá aquí…'}</pre>
          <PromptActions prompt={prompt} disabled={!prompt} />
        </Card>
      </div>
    </div>
  )
}

function PromptActions({ prompt, attachment, disabled }: { prompt: string; attachment?: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="mt-4 space-y-2">
      <Button
        className="w-full"
        disabled={disabled}
        onClick={async () => {
          if (await copyText(prompt)) {
            setCopied(true)
            toast({ kind: 'success', title: 'Prompt copiado', body: attachment ?? 'Pégalo en tu IA favorita.' })
            setTimeout(() => setCopied(false), 1800)
          }
        }}
      >
        {copied ? <Check className="size-4" /> : <ClipboardCopy className="size-4" />} {copied ? '¡Copiado!' : 'Copiar prompt'}
      </Button>
      <div className="grid grid-cols-2 gap-2">
        {PROMPT_TOOLS.map((t) => (
          <Button key={t.id} variant="outline" size="sm" disabled={disabled} onClick={() => openInAi(t.id, prompt, attachment)}>
            <ExternalLink className="size-3.5" /> {t.name}
          </Button>
        ))}
      </div>
      <p className="text-center text-[11px] text-muted">Funciona con cualquier IA: el prompt se copia y se abre la herramienta.</p>
    </div>
  )
}

/* ---------- detalle ---------- */

function PromptDetail({ p }: { p: PromptItem }) {
  const navigate = useNavigate()
  const { favs, toggle } = useFavorites()
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(p.variables.map((v) => [v.key, v.default ?? ''])))
  const prompt = fillPrompt(p, values)
  const cat = PROMPT_CATEGORIES.find((c) => c.id === p.category)!
  const Icon = PROMPT_ICONS[p.icon] ?? Sparkles
  const more = PROMPTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3)

  // Resalta en la vista previa lo que escribió el usuario.
  const highlighted = useMemo(() => {
    const parts: { text: string; mark: boolean }[] = [{ text: p.template, mark: false }]
    for (const v of p.variables) {
      const val = (values[v.key] ?? '').trim() || v.default || `[${v.label.toLowerCase()}]`
      const token = `{{${v.key}}}`
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (part.mark || !part.text.includes(token)) continue
        const pieces = part.text.split(token)
        const repl = pieces.flatMap((t, j) => (j < pieces.length - 1 ? [{ text: t, mark: false }, { text: val, mark: true }] : [{ text: t, mark: false }]))
        parts.splice(i, 1, ...repl)
        i += repl.length - 1
      }
    }
    return parts
  }, [p, values])

  return (
    <div>
      <button onClick={() => navigate('/prompts')} className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)]">
        <ArrowLeft className="size-4" /> Prompts
      </button>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}aa)` }}>
          <Icon className="size-7" />
        </span>
        <div className="flex-1">
          <div className="text-xs font-semibold tracking-wider uppercase" style={tintText(cat.color)}>
            {cat.name}
          </div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{p.title}</h1>
          <p className="mt-1 max-w-2xl text-muted">{p.description}</p>
        </div>
        <Button variant={favs.includes(p.id) ? 'secondary' : 'outline'} onClick={() => toggle(p.id)}>
          <Star className={cn('size-4', favs.includes(p.id) && 'fill-amber-400 text-amber-500')} /> {favs.includes(p.id) ? 'En favoritos' : 'Favorito'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          {p.attachment && (
            <Card className="flex items-center gap-3 border-amber-500/30 bg-amber-500/[0.06] p-4 text-sm">
              <Paperclip className="size-5 shrink-0 text-amber-500" /> {p.attachment}
            </Card>
          )}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-soft px-5 py-3 text-xs font-semibold text-muted uppercase">
              <span>Prompt</span>
              <span>{prompt.length.toLocaleString('es-DO')} caracteres</span>
            </div>
            <pre className="max-h-[560px] overflow-y-auto p-5 font-sans text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
              {highlighted.map((part, i) =>
                part.mark ? (
                  <mark key={i} className="rounded bg-brand-500/20 px-0.5 text-brand-800 dark:text-brand-200">
                    {part.text}
                  </mark>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </pre>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold">Cómo usarlo</h2>
              <ol className="space-y-2 text-sm">
                {p.steps.map((s, i) => (
                  <li key={s} className="flex gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-500/15 text-[11px] font-bold text-brand-600">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </Card>
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-semibold">Qué vas a obtener</h2>
              <p className="text-sm text-muted">{p.output}</p>
              {p.tips && (
                <>
                  <h2 className="mt-4 mb-2 text-sm font-semibold">Trucos</h2>
                  <ul className="space-y-1.5 text-sm text-muted">
                    {p.tips.map((t) => (
                      <li key={t} className="flex gap-2">
                        <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-500" /> {t}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">{p.variables.length ? 'Personaliza' : 'Listo para usar'}</h2>
            <div className="space-y-3">
              {p.variables.map((v) => (
                <label key={v.key} className="block">
                  <span className="text-xs font-medium text-muted">{v.label}</span>
                  {v.long ? (
                    <textarea value={values[v.key] ?? ''} onChange={(e) => setValues({ ...values, [v.key]: e.target.value })} rows={4} placeholder={v.placeholder} className="mt-1 w-full resize-y rounded-xl border border-soft surface-2 p-3 text-sm outline-none focus:border-brand-500" />
                  ) : (
                    <input value={values[v.key] ?? ''} onChange={(e) => setValues({ ...values, [v.key]: e.target.value })} placeholder={v.placeholder} className="mt-1 h-10 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500" />
                  )}
                </label>
              ))}
            </div>
            <PromptActions prompt={prompt} attachment={p.attachment} />
            {p.related && (
              <LinkButton to={p.related.to} variant="ghost" size="sm" className="mt-2 w-full">
                {p.related.label} →
              </LinkButton>
            )}
          </Card>
          {more.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold">Más de {cat.name}</h2>
              <ul className="space-y-2">
                {more.map((m) => (
                  <li key={m.id}>
                    <Link to={`/prompts/${m.id}`} className="block rounded-lg p-2 -mx-2 text-sm hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]">
                      <span className="font-medium">{m.title}</span>
                      <span className="block truncate text-xs text-muted">{m.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- página ---------- */

export default function Prompts() {
  const { id } = useParams()
  const { favs, toggle } = useFavorites()
  const [tab, setTab] = useState<'library' | 'builder'>('library')
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<string | null>(null)
  const [onlyFavs, setOnlyFavs] = useState(false)

  const list = useMemo(() => {
    const q = normalizeText(query)
    return PROMPTS.filter((p) => (!cat || p.category === cat) && (!onlyFavs || favs.includes(p.id)) && (!q || normalizeText(`${p.title} ${p.description}`).includes(q)))
  }, [query, cat, onlyFavs, favs])

  if (id) {
    const p = PROMPTS.find((x) => x.id === id)
    return p ? <PromptDetail key={p.id} p={p} /> : <EmptyState icon={<Search className="size-7" />} title="Prompt no encontrado" action={<LinkButton to="/prompts">Ver prompts</LinkButton>} />
  }

  const featured = PROMPTS.filter((p) => p.featured)

  return (
    <div>
      <PageHeader
        icon={<WandSparkles className="size-6" />}
        eyebrow="Inteligencia artificial"
        title="Prompts"
        subtitle="Instrucciones listas para ChatGPT, Claude, Gemini o cualquier IA. Elige uno, personalízalo y ábrelo con un clic."
        actions={<Segmented value={tab} onChange={setTab} options={[{ value: 'library', label: 'Biblioteca' }, { value: 'builder', label: <span className="flex items-center gap-1.5"><Hammer className="size-3.5" /> Crea el tuyo</span> }]} />}
      />

      <AnimatePresence mode="wait">
        {tab === 'builder' ? (
          <motion.div key="builder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Builder />
          </motion.div>
        ) : (
          <motion.div key="library" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              {featured.map((p, i) => {
                const c = PROMPT_CATEGORIES.find((x) => x.id === p.category)!
                const Icon = PROMPT_ICONS[p.icon] ?? Sparkles
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Link to={`/prompts/${p.id}`} className="group relative block h-full overflow-hidden rounded-3xl p-6 text-white shadow-lift transition-transform hover:-translate-y-1" style={{ background: `linear-gradient(135deg, ${c.color}, #4f46e5)` }}>
                      <Icon className="absolute -right-6 -bottom-6 size-36 text-white/15 transition-transform group-hover:scale-110 group-hover:-rotate-6" strokeWidth={1.5} />
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur">
                        <Sparkles className="size-3" /> Destacado
                      </span>
                      <h3 className="relative mt-4 font-display text-xl font-extrabold">{p.title}</h3>
                      <p className="relative mt-2 text-sm text-white/85">{p.description}</p>
                      <span className="relative mt-5 inline-block text-sm font-semibold">Usar este prompt →</span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            <div className="mb-6 flex flex-col gap-3">
              <label className="relative max-w-md">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar prompt…" className="h-11 w-full rounded-xl border border-soft bg-[var(--surface)] pr-3 pl-10 text-sm outline-none focus:border-brand-500" />
              </label>
              <div className="flex flex-wrap gap-2">
                <Chip active={!cat && !onlyFavs} onClick={() => { setCat(null); setOnlyFavs(false) }}>
                  Todos
                </Chip>
                <Chip active={onlyFavs} onClick={() => setOnlyFavs(!onlyFavs)} color="#f59e0b">
                  <Star className="size-3.5" /> Favoritos {favs.length ? favs.length : ''}
                </Chip>
                {PROMPT_CATEGORIES.map((c) => (
                  <Chip key={c.id} active={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)} color={c.color}>
                    {c.name}
                  </Chip>
                ))}
              </div>
            </div>

            {list.length === 0 ? (
              <EmptyState icon={<Star className="size-7" />} title={onlyFavs ? 'Aún no tienes favoritos' : 'Sin resultados'} body={onlyFavs ? 'Marca con la estrella los prompts que más uses.' : undefined} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p, i) => (
                  <PromptCard key={p.id} p={p} i={i} fav={favs.includes(p.id)} onFav={() => toggle(p.id)} />
                ))}
              </div>
            )}

            <Card className="mt-10 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <Lightbulb className="size-6" />
              </span>
              <div className="flex-1">
                <h2 className="font-display font-bold">Regla de oro</h2>
                <p className="text-sm text-muted">La IA puede equivocarse con total seguridad. Verifica los datos clínicos en guías oficiales y nunca compartas información que identifique a un paciente.</p>
              </div>
              <LinkButton to="/ia" variant="outline">
                Aprende a usar la IA
              </LinkButton>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
