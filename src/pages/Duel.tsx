import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Copy, Crown, Handshake, MessageCircle, Share2, Swords, Timer } from 'lucide-react'
import type { Question } from '@/types'
import { useBank } from '@/store/bank'
import { useProgress } from '@/store/progress'
import { QuestionCard } from '@/components/QuestionCard'
import { Button, Card, PageHeader } from '@/components/ui/primitives'
import { decodeDuel, DUEL_SIZE, DUEL_SIZES, duelPool, duelRecordResult, duelTally, duelUrl, duelWinner, newDuelQuestions, useDuels, type DuelPayload, type DuelScore } from '@/lib/duel'
import { SpecialtyPicker } from '@/components/Filters'
import { getSpecialty } from '@/data/specialties'
import { shortName } from '@/lib/ranking'
import { copyText } from '@/lib/clipboard'
import { celebrate, playSound } from '@/lib/fx'
import { cn, formatClock } from '@/lib/utils'
import { toast } from '@/store/toasts'

const time = (s: number) => formatClock(Math.round(s))

/** Comparte por el menú del teléfono; si no se puede, copia el enlace. */
async function shareLink(text: string, url: string) {
  if (navigator.share) {
    try {
      await navigator.share({ text, url })
      return
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
    }
  }
  await copyText(`${text} ${url}`)
  toast({ kind: 'success', title: 'Enlace copiado', body: 'Pégalo en WhatsApp o donde quieras.' })
}

function ShareButtons({ text, url }: { text: string; url: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <a href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 font-semibold text-white">
        <MessageCircle className="size-5" /> WhatsApp
      </a>
      <Button size="lg" variant="secondary" onClick={() => void shareLink(text, url)}>
        <Share2 className="size-5" /> Compartir
      </Button>
      <Button size="lg" variant="outline" onClick={() => copyText(url).then(() => toast({ kind: 'success', title: 'Enlace copiado' }))}>
        <Copy className="size-5" /> Copiar
      </Button>
    </div>
  )
}

function ScoreCard({ s, label, win, total }: { s: DuelScore; label: string; win?: boolean; total: number }) {
  return (
    <div className={cn('relative rounded-2xl border-2 p-4 text-center', win ? 'border-amber-400 bg-amber-400/10' : 'border-soft')}>
      {win && <Crown className="absolute -top-3 left-1/2 size-6 -translate-x-1/2 fill-amber-400 text-amber-500" />}
      <div className="truncate text-xs font-semibold text-muted">{label}</div>
      <div className="truncate font-display text-lg font-bold">{s.name}</div>
      <div className="mt-1 font-display text-4xl font-extrabold">
        {s.correct}
        <span className="text-lg text-muted">/{total}</span>
      </div>
      <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted">
        <Timer className="size-3.5" /> {time(s.seconds)}
      </div>
    </div>
  )
}

/** Las preguntas del duelo, una a una, con la respuesta y explicación al momento. */
function DuelPlay({ questions, onDone }: { questions: Question[]; onDone: (correct: number, seconds: number, answers: number[]) => void }) {
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const [i, setI] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const thinking = useRef(0)
  const shownAt = useRef(Date.now())
  const q = questions[i]

  const choose = (c: number) => {
    if (choice !== null) return
    thinking.current += (Date.now() - shownAt.current) / 1000
    setChoice(c)
    const ok = recordAnswer(q, c)
    playSound(ok ? 'correct' : 'wrong')
    setAnswers((a) => [...a, c])
  }
  const next = () => {
    if (i + 1 >= questions.length) {
      const all = answers
      onDone(all.filter((c, k) => c === questions[k].answer).length, thinking.current, all)
      return
    }
    setI(i + 1)
    setChoice(null)
    shownAt.current = Date.now()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Swords className="size-5 text-brand-600 dark:text-brand-400" />
        <div className="h-2 flex-1 overflow-hidden rounded-full surface-2">
          <motion.div className="h-full rounded-full bg-brand-500" animate={{ width: `${((i + (choice !== null ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm font-bold tabular-nums">
          {i + 1}/{questions.length}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          <QuestionCard question={q} mode="tutor" selected={choice} revealed={choice !== null} onSelect={choose} />
        </motion.div>
      </AnimatePresence>
      {choice !== null && (
        <Button size="lg" className="w-full" onClick={next}>
          {i + 1 >= questions.length ? 'Ver resultado' : 'Siguiente'} <ArrowRight className="size-5" />
        </Button>
      )}
      <p className="text-center text-xs text-muted">El reloj solo corre mientras piensas; leer la explicación no cuenta.</p>
    </div>
  )
}

function NameField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">Tu nombre en el duelo</span>
      <input value={value} onChange={(e) => onChange(e.target.value.slice(0, 30))} placeholder="Ej.: Robinson" className="mt-1.5 h-12 w-full rounded-xl border border-soft bg-[var(--surface)] px-4 outline-none focus:border-brand-500" />
    </label>
  )
}

export default function Duel() {
  const { code } = useParams()
  const navigate = useNavigate()
  const bank = useBank((s) => s.questions)
  const byId = useBank((s) => s.byId)
  const settingsName = useProgress((s) => s.settings.name)
  const duels = useDuels((s) => s.duels)
  const save = useDuels((s) => s.save)
  const [name, setName] = useState(() => shortName(settingsName))
  const [specialties, setSpecialties] = useState<string[]>([])
  const [count, setCount] = useState<number>(DUEL_SIZE)
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [created, setCreated] = useState<{ id: string; questions: Question[] } | null>(null)
  const [result, setResult] = useState<DuelPayload | null>(null)

  const incoming = useMemo(() => (code ? decodeDuel(code) : null), [code])
  const incomingQuestions = useMemo(() => (incoming ? incoming.q.map((id) => byId.get(id)).filter((q): q is Question => !!q) : []), [incoming, byId])
  const mine = incoming ? duels[incoming.id] : undefined
  const tally = duelTally(duels)
  const myName = name.trim() || 'Anónimo'

  // Enlace de vuelta: si yo reté, registro el resultado del rival.
  const isReplyForMe = !!(incoming?.b && mine?.challenger)
  useEffect(() => {
    if (isReplyForMe && incoming?.b && mine && !mine.rivalScore) save({ ...mine, rival: incoming.b.name, rivalScore: incoming.b })
  }, [isReplyForMe, incoming, mine, save])

  const header = <PageHeader icon={<Swords className="size-6" />} eyebrow="Reta a un amigo" title="Duelo" subtitle="Las mismas preguntas para los dos: tú eliges cuántas y de qué temas. Gana quien acierte más; si empatan, quien piense más rápido." />
  const topics = (ids?: string[]) => (ids?.length ? ids.map((id) => getSpecialty(id).short).join(', ') : 'Todo el examen')

  if (code && !incoming)
    return (
      <div>
        {header}
        <Card className="p-6">
          <p className="font-semibold">Este enlace de duelo no es válido o está incompleto.</p>
          <p className="mt-1 text-sm text-muted">Pídele a tu amigo que te lo vuelva a enviar, o crea un duelo nuevo.</p>
          <Button className="mt-4" onClick={() => navigate('/duelo')}>
            Crear un duelo
          </Button>
        </Card>
      </div>
    )

  /* ---------- Resultado final (enlace de vuelta o después de aceptar) ---------- */
  const finalPayload = result ?? (incoming?.b ? incoming : null)
  if (finalPayload?.b && (result || isReplyForMe || !mine)) {
    const w = duelWinner(finalPayload.a, finalPayload.b)
    // Quién mira: quien retó, quien aceptó o alguien a quien le reenviaron el enlace.
    const viewer = isReplyForMe ? 'a' : result || (mine && !mine.challenger) ? 'b' : null
    const winnerName = w === 'a' ? finalPayload.a.name : finalPayload.b.name
    const headline = w === 'tie' ? '¡Empate perfecto!' : viewer === w ? '¡Ganaste el duelo!' : viewer ? `Ganó ${winnerName}. ¡Pide la revancha!` : `Ganó ${winnerName}`
    const replyUrl = duelUrl(finalPayload)
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {header}
        <Card className="p-6 text-center">
          <Handshake className="mx-auto size-10 text-brand-600 dark:text-brand-400" />
          <h2 className="mt-2 font-display text-2xl font-extrabold">{headline}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <ScoreCard s={finalPayload.a} label="Retó" win={w === 'a'} total={finalPayload.q.length} />
            <ScoreCard s={finalPayload.b} label="Aceptó" win={w === 'b'} total={finalPayload.q.length} />
          </div>
        </Card>
        {result && (
          <Card className="space-y-3 p-6">
            <div className="font-semibold">Mándale tu resultado a {finalPayload.a.name}</div>
            <ShareButtons text={`Acepté tu duelo en MedLogic: saqué ${finalPayload.b.correct}/${finalPayload.q.length}. Mira quién ganó:`} url={replyUrl} />
          </Card>
        )}
        <Button size="lg" variant="outline" className="w-full" onClick={() => navigate('/duelo')}>
          <Swords className="size-5" /> Revancha con preguntas nuevas
        </Button>
      </div>
    )
  }

  /* ---------- Jugando ---------- */
  if (phase === 'play') {
    const questions = incoming ? incomingQuestions : created!.questions
    return (
      <DuelPlay
        questions={questions}
        onDone={(correct, seconds) => {
          const me: DuelScore = { name: myName, correct, seconds: Math.round(seconds * 10) / 10 }
          if (correct >= questions.length * 0.7) celebrate('small')
          if (incoming) {
            const payload: DuelPayload = { ...incoming, b: me }
            save({ id: incoming.id, rival: incoming.a.name, me, rivalScore: incoming.a, challenger: false, date: Date.now(), total: incoming.q.length })
            setResult(payload)
          } else {
            const payload: DuelPayload = { v: 1, id: created!.id, q: created!.questions.map((q) => q.id), a: me, ...(specialties.length ? { s: specialties } : {}) }
            save({ id: created!.id, rival: 'Pendiente', me, rivalScore: null, challenger: true, date: Date.now(), total: created!.questions.length })
            setResult(payload)
            setPhase('done')
          }
        }}
      />
    )
  }

  /* ---------- Reto creado: compartir ---------- */
  if (phase === 'done' && result && !result.b) {
    const url = duelUrl(result)
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {header}
        <Card className="p-6 text-center">
          <div className="text-sm text-muted">Tu resultado</div>
          <div className="font-display text-5xl font-extrabold">
            {result.a.correct}
            <span className="text-2xl text-muted">/{result.q.length}</span>
          </div>
          <div className="mt-1 text-sm text-muted">en {time(result.a.seconds)} pensando</div>
        </Card>
        <Card className="space-y-3 p-6">
          <div className="font-semibold">Ahora reta a un amigo</div>
          <p className="text-sm text-muted">Le llegan las mismas {result.q.length} preguntas ({topics(result.s).toLowerCase()}). Cuando termine, te devolverá un enlace con quién ganó.</p>
          <ShareButtons text={`Te reto en MedLogic ENURM: saqué ${result.a.correct}/${result.q.length}. ¿Me ganas?`} url={url} />
        </Card>
      </div>
    )
  }

  /* ---------- Invitación recibida ---------- */
  if (incoming) {
    if (mine && !incoming.b)
      return (
        <div className="mx-auto max-w-2xl space-y-6">
          {header}
          <Card className="p-6">
            <p className="font-semibold">{mine.challenger ? 'Este es tu propio reto.' : 'Ya jugaste este duelo.'}</p>
            <p className="mt-1 text-sm text-muted">{mine.challenger ? 'Compártelo con un amigo para que lo acepte.' : 'Crea uno nuevo para seguir jugando.'}</p>
            {mine.challenger && (
              <div className="mt-4">
                <ShareButtons text={`Te reto en MedLogic ENURM: saqué ${mine.me.correct}/${incoming.q.length}. ¿Me ganas?`} url={duelUrl(incoming)} />
              </div>
            )}
          </Card>
        </div>
      )
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {header}
        <Card className="relative overflow-hidden p-6 text-center">
          <div className="pointer-events-none absolute -top-16 left-1/2 size-56 -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl" />
          <Swords className="relative mx-auto size-10 text-brand-600 dark:text-brand-400" />
          <h2 className="relative mt-2 font-display text-2xl font-extrabold">{incoming.a.name} te reta</h2>
          <p className="relative mt-1 text-muted">
            Sacó <b className="text-[var(--text)]">{incoming.a.correct}/{incoming.q.length}</b> en {time(incoming.a.seconds)}. ¿Puedes ganarle?
          </p>
          <p className="relative mt-3 inline-flex rounded-full surface-2 px-3 py-1 text-xs font-semibold">
            {incoming.q.length} preguntas · {topics(incoming.s)}
          </p>
        </Card>
        {incomingQuestions.length < Math.min(5, incoming.q.length) ? (
          <Card className="p-6 text-sm">Algunas preguntas de este duelo ya no están en el banco. Crea un duelo nuevo.</Card>
        ) : (
          <Card className="space-y-4 p-6">
            <NameField value={name} onChange={setName} />
            <Button size="lg" className="w-full" disabled={!name.trim()} onClick={() => setPhase('play')}>
              <Swords className="size-5" /> Aceptar el reto
            </Button>
          </Card>
        )}
      </div>
    )
  }

  /* ---------- Crear un duelo ---------- */
  const pool = duelPool(bank, specialties)
  const recent = Object.values(duels)
    .sort((a, b) => b.date - a.date)
    .slice(0, 6)
  return (
    <div className="space-y-6">
      {header}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 p-6 lg:col-span-2">
          <NameField value={name} onChange={setName} />
          <div>
            <div className="text-sm font-semibold">¿Cuántas preguntas?</div>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {DUEL_SIZES.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={count === n}
                  disabled={n > pool.length}
                  onClick={() => setCount(n)}
                  className={cn('h-12 rounded-xl border-2 font-display text-lg font-bold transition-colors disabled:opacity-40', count === n ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-soft hover:border-brand-500/40')}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold">Temas</div>
            <p className="mb-2 text-xs text-muted">Elige uno o varios. Si no eliges ninguno, sale una mezcla de todo el examen.</p>
            <SpecialtyPicker value={specialties} onChange={setSpecialties} />
            <p className="mt-2 text-xs text-muted">
              {pool.length.toLocaleString('es-DO')} preguntas disponibles{specialties.length ? ` en ${topics(specialties)}` : ''}.
            </p>
          </div>
          <ol className="space-y-1.5 text-sm text-muted">
            <li>1. Respondes {Math.min(count, pool.length)} preguntas.</li>
            <li>2. Mandas el enlace por WhatsApp.</li>
            <li>3. Tu amigo responde las mismas y te devuelve quién ganó.</li>
          </ol>
          <Button
            size="lg"
            className="w-full"
            disabled={!name.trim() || pool.length === 0}
            onClick={() => {
              setCreated(newDuelQuestions(bank, specialties, Math.min(count, pool.length)))
              setPhase('play')
            }}
          >
            <Swords className="size-5" /> Empezar el duelo
          </Button>
        </Card>
        <Card className="p-6">
          <div className="font-semibold">Tus duelos</div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              [tally.wins, 'ganados', 'text-emerald-600'],
              [tally.losses, 'perdidos', 'text-rose-600'],
              [tally.pending, 'esperando', 'text-muted'],
            ].map(([n, k, c]) => (
              <div key={k as string} className="rounded-xl surface-2 p-2">
                <div className={cn('font-display text-xl font-bold', c as string)}>{n}</div>
                <div className="text-[11px] text-muted">{k}</div>
              </div>
            ))}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {recent.length === 0 && <li className="text-muted">Aún no has jugado ningún duelo.</li>}
            {recent.map((d) => {
              const r = duelRecordResult(d)
              return (
                <li key={d.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{d.rivalScore ? `vs ${d.rival}` : 'Esperando rival'}</span>
                  <span className={cn('text-xs font-bold', r === 'win' ? 'text-emerald-600' : r === 'loss' ? 'text-rose-600' : 'text-muted')}>
                    {r === 'win' ? 'Ganaste' : r === 'loss' ? 'Perdiste' : r === 'tie' ? 'Empate' : `${d.me.correct}/${d.total ?? DUEL_SIZE}`}
                  </span>
                </li>
              )
            })}
          </ul>
          <Link to="/ranking" className="mt-4 block text-xs font-semibold text-brand-700 dark:text-brand-400">
            Ver el ranking del país →
          </Link>
        </Card>
      </div>
    </div>
  )
}
