import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, Copy, Flame, MessageCircle, RefreshCw, Share2, Users } from 'lucide-react'
import { fetchBuddies, formatCode, getMyCode, inviteLink, inviteText, joinWithCode, leaveBuddy, nudgeText, parseInviteCode, rememberPendingCode, studyStatus, takePendingCode, type BuddyRow, type JoinResult } from '@/lib/buddy'
import { publishStats } from '@/lib/ranking'
import { copyText } from '@/lib/clipboard'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/store/auth'
import { useProgress } from '@/store/progress'
import { Button, Card, PageHeader } from '@/components/ui/primitives'
import { toast } from '@/store/toasts'
import { cn, dayKey } from '@/lib/utils'

const JOIN_MESSAGES: Record<JoinResult, { text: string; good: boolean }> = {
  ok: { text: '¡Listo! Ya son compañeros de estudio.', good: true },
  ya_son: { text: 'Ya eran compañeros de estudio.', good: true },
  codigo_invalido: { text: 'Ese código no existe o ya venció (duran 48 horas). Pídele uno nuevo.', good: false },
  es_tuyo: { text: 'Ese es tu propio código: compártelo con tu compañero.', good: false },
  lleno: { text: 'Uno de los dos ya tiene 3 compañeros, que es el máximo.', good: false },
  'sin-sesion': { text: 'Inicia sesión para unirte.', good: false },
  error: { text: 'No se pudo completar. Revisa tu conexión e inténtalo de nuevo.', good: false },
}

const waLink = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`

export default function Buddy() {
  const status = useAuth((s) => s.status)
  const activity = useProgress((s) => s.activity)
  const [params, setParams] = useSearchParams()
  const [code, setCode] = useState<string | null>(null)
  const [buddies, setBuddies] = useState<BuddyRow[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [input, setInput] = useState('')
  const [joining, setJoining] = useState(false)
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState<string | null>(null)
  const autoJoined = useRef(false)

  const today = dayKey()
  const studiedToday = !!activity[today] && activity[today].answered + activity[today].cards + activity[today].minutes > 0
  const header = <PageHeader icon={<Users className="size-6" />} eyebrow="Explorar" title="Compañero de estudio" subtitle="Estudien en pareja: cada uno ve si el otro ya estudió hoy y su racha. Nada más, sin respuestas ni resultados." />

  const load = useCallback(async () => {
    setState('loading')
    try {
      await publishStats(true) // para que tu compañero te vea al día
      const [c, b] = await Promise.all([getMyCode(), fetchBuddies()])
      setCode(c)
      setBuddies(b)
      setState('ready')
    } catch {
      setState('error')
    }
  }, [])

  const join = useCallback(
    async (raw: string) => {
      const parsed = parseInviteCode(raw)
      if (!parsed) {
        setMessage({ text: 'El código tiene 8 letras y números (por ejemplo ABCD-2345). Revísalo.', good: false })
        return
      }
      setJoining(true)
      const r = await joinWithCode(parsed)
      setJoining(false)
      setMessage(JOIN_MESSAGES[r])
      if (r === 'ok' || r === 'ya_son') {
        setInput('')
        try {
          setBuddies(await fetchBuddies())
        } catch {
          /* se verá al recargar */
        }
      }
    },
    [],
  )

  // Una invitación abierta sin cuenta se recuerda para usarla al entrar.
  const invited = parseInviteCode(params.get('codigo'))
  useEffect(() => {
    if (status === 'signed-out' && invited) rememberPendingCode(invited)
  }, [status, invited])

  useEffect(() => {
    if (status === 'signed-in') void load()
  }, [status, load])

  useEffect(() => {
    if (status !== 'signed-in' || state !== 'ready' || autoJoined.current) return
    const pending = invited ?? takePendingCode()
    if (!pending) return
    autoJoined.current = true
    if (invited) setParams({}, { replace: true })
    void join(pending)
  }, [status, state, invited, join, setParams])

  if (!isSupabaseConfigured || status === 'disabled')
    return (
      <div>
        {header}
        <Card className="p-6 text-sm text-muted">Los compañeros de estudio necesitan cuentas, que todavía no están activas en esta versión.</Card>
      </div>
    )
  if (status !== 'signed-in')
    return (
      <div className="space-y-4">
        {header}
        <Card className="space-y-3 p-6">
          <h2 className="font-display text-lg font-bold">{invited ? 'Te invitaron a estudiar en pareja' : 'Necesitas una cuenta gratis'}</h2>
          <p className="text-sm text-muted">{invited ? 'Crea tu cuenta (o entra) y te unimos con ese código automáticamente.' : 'Con una cuenta puedes invitar a un compañero y ver si ya estudió hoy.'}</p>
          <Link to="/cuenta" className="inline-flex h-11 items-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">
            Crear cuenta o entrar
          </Link>
        </Card>
      </div>
    )

  const copy = async () => {
    if (!code) return
    if (await copyText(inviteText(code))) {
      setCopied(true)
      toast({ kind: 'success', title: 'Invitación copiada', body: 'Pégala en WhatsApp o donde quieras.' })
      setTimeout(() => setCopied(false), 2500)
    }
  }
  const share = async () => {
    if (!code) return
    try {
      await navigator.share({ title: 'Estudiemos juntos', text: inviteText(code), url: inviteLink(code) })
    } catch {
      /* cancelado */
    }
  }

  return (
    <div className="space-y-6">
      {header}

      {message && (
        <p role="status" className={cn('rounded-xl px-4 py-3 text-sm font-medium', message.good ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200' : 'bg-amber-500/10 text-amber-900 dark:text-amber-200')}>
          {message.text}
        </p>
      )}

      {state === 'error' && (
        <Card className="flex items-center justify-between gap-3 p-5 text-sm">
          <span>No se pudo cargar.</span>
          <button onClick={() => void load()} className="inline-flex items-center gap-1.5 font-semibold text-brand-700 dark:text-brand-300">
            <RefreshCw className="size-4" aria-hidden /> Reintentar
          </button>
        </Card>
      )}

      <section aria-labelledby="mis-companeros">
        <h2 id="mis-companeros" className="mb-2 font-display text-lg font-bold">
          Tus compañeros
        </h2>
        {state === 'loading' ? (
          <div className="skeleton h-24 rounded-2xl" aria-hidden />
        ) : buddies.length ? (
          <ul className="space-y-3">
            {buddies.map((b) => {
              const wa = waLink(nudgeText(b.nombre))
              return (
                <li key={b.pareja} className="card p-4">
                  <div className="flex items-center gap-3">
                    <span className={cn('grid size-11 shrink-0 place-items-center rounded-full font-display text-lg font-bold text-white', b.estudio_hoy ? 'bg-emerald-600' : 'bg-slate-500')} aria-hidden>
                      {b.nombre.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display font-bold">{b.nombre}</div>
                      <div className={cn('flex items-center gap-1 text-sm font-semibold', b.estudio_hoy ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted')}>
                        {b.estudio_hoy && <Check className="size-4" aria-hidden />} {studyStatus(b, today)}
                      </div>
                    </div>
                    <div className="text-right text-sm tabular-nums">
                      <div className="flex items-center justify-end gap-1 font-bold">
                        <Flame className={cn('size-4', b.racha > 0 ? 'text-orange-500' : 'text-muted')} aria-hidden /> {b.racha}
                      </div>
                      <div className="text-xs text-muted">{b.racha === 1 ? 'día de racha' : 'días de racha'}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-soft pt-3 text-sm">
                    {b.estudio_hoy && !studiedToday ? (
                      <Link to="/practica?auto=1" className="inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700">
                        {b.nombre !== 'Compañero' ? `${b.nombre} ya estudió: te toca` : 'Ya estudió: te toca'}
                      </Link>
                    ) : !b.estudio_hoy && studiedToday ? (
                      <a href={wa} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-700 px-4 font-semibold text-white hover:bg-emerald-800">
                        <MessageCircle className="size-4" aria-hidden /> Animarlo por WhatsApp
                      </a>
                    ) : (
                      <span className="text-muted">{b.estudio_hoy ? 'Los dos estudiaron hoy. ¡Así se hace!' : 'Ninguno ha estudiado hoy todavía.'}</span>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirmLeave !== b.pareja) return setConfirmLeave(b.pareja)
                        setConfirmLeave(null)
                        if (await leaveBuddy(b.pareja)) setBuddies((cur) => cur.filter((x) => x.pareja !== b.pareja))
                      }}
                      className="relative ml-auto text-xs font-semibold text-muted underline-offset-2 after:absolute after:-inset-3 hover:underline"
                    >
                      {confirmLeave === b.pareja ? 'Sí, dejar de ser compañeros' : 'Dejar'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <Card className="p-5 text-sm text-muted">Todavía no tienes compañeros. Invita a alguien con tu código, o pon el suyo abajo.</Card>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display font-bold">Tu código para invitar</h2>
          <p className="mt-1 text-sm text-muted">Dáselo a quien quieras como compañero. Vale 48 horas y puedes tener hasta 3 compañeros.</p>
          <div className="mt-4 rounded-2xl surface-2 px-4 py-4 text-center font-mono text-3xl font-bold tracking-[0.2em] tabular-nums" aria-label={code ? `Tu código es ${code.split('').join(' ')}` : 'Cargando tu código'}>
            {code ? formatCode(code) : '········'}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={copy} disabled={!code} variant="secondary">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? 'Copiado' : 'Copiar invitación'}
            </Button>
            {code && (
              <a href={waLink(inviteText(code))} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
                <MessageCircle className="size-4" aria-hidden /> WhatsApp
              </a>
            )}
            {typeof navigator !== 'undefined' && 'share' in navigator && code && (
              <Button variant="ghost" onClick={share}>
                <Share2 className="size-4" /> Compartir
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-bold">Unirte con un código</h2>
          <p className="mt-1 text-sm text-muted">Pon el código que te dio tu compañero.</p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              void join(input)
            }}
          >
            <label className="flex-1">
              <span className="sr-only">Código de tu compañero</span>
              <input value={input} onChange={(e) => setInput(e.target.value.toUpperCase().slice(0, 9))} placeholder="ABCD-2345" inputMode="text" autoCapitalize="characters" autoComplete="off" spellCheck={false} className="h-11 w-full rounded-xl border border-soft surface-2 px-3 font-mono text-lg tracking-widest uppercase outline-none focus:border-brand-500" />
            </label>
            <Button type="submit" disabled={joining || !input.trim()}>
              {joining ? 'Uniendo…' : 'Unirme'}
            </Button>
          </form>
        </Card>
      </div>

      <p className="text-xs text-muted">Tu compañero ve tu primer nombre e inicial (o «Compañero» si prefieres no mostrar tu nombre en Ajustes), si estudiaste hoy y tu racha. Puedes dejar de ser compañeros cuando quieras.</p>
    </div>
  )
}
