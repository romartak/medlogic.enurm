import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BedDouble, Brain, CalendarDays, Check, ChevronDown, Compass, GraduationCap, Layers, ListChecks, RefreshCcw, Shuffle, Sparkles, Target, Timer, TriangleAlert } from 'lucide-react'
import { Card, LinkButton, PageHeader } from '@/components/ui/primitives'
import { PHASES, PHASE_ORDER } from '@/lib/plan'
import { cn, solidBg } from '@/lib/utils'

const PHASE_TODO: Record<string, string[]> = {
  fundamentos: ['Lee una guía y luego responde preguntas del mismo tema.', 'Recorre todas las especialidades al menos una vez.', 'Empieza tus flashcards desde el primer día.', 'Un simulacro corto por semana para medir tu punto de partida.'],
  consolidacion: ['Más preguntas que lectura: aprende de las explicaciones.', 'Repasa tus errores cada semana.', 'Intercala especialidades dentro del mismo día.', 'Simulacro semanal de 50 preguntas.'],
  intensivo: ['Prioriza las áreas de mayor peso y menor precisión.', 'Simulacros completos con tiempo real.', 'Repaso diario de errores y perlas.', 'Reduce la lectura nueva al mínimo.'],
  final: ['No empieces temas nuevos.', 'Repasa errores, perlas y flashcards.', 'Uno o dos simulacros completos y luego baja la carga.', 'Duerme 7–8 horas: la memoria se consolida durmiendo.'],
}

const METHODS = [
  { icon: Target, title: 'Práctica de recuperación', body: 'Intentar recordar (responder preguntas) fija más que releer. Es la base de la práctica y los simulacros.', color: '#06c4b0' },
  { icon: RefreshCcw, title: 'Repetición espaciada', body: 'Repasar justo antes de olvidar multiplica la retención a largo plazo. Por eso las flashcards programan cada tarjeta.', color: '#8b5cf6' },
  { icon: Shuffle, title: 'Práctica intercalada', body: 'Mezclar especialidades obliga a identificar el tipo de problema, como en el examen real. Tu plan diario combina dos áreas.', color: '#f59e0b' },
  { icon: ListChecks, title: 'Aprender del error', body: 'Cada pregunta fallada indica exactamente qué te falta. Lee la explicación y vuelve a ella en unos días.', color: '#ef4444' },
  { icon: Timer, title: 'Bloques de concentración', body: 'Sesiones de 25–50 minutos sin distracciones, con pausas cortas, rinden más que horas dispersas.', color: '#0ea5e9' },
  { icon: BedDouble, title: 'Sueño y descanso', body: 'Dormir consolida lo aprendido. Un día de descanso a la semana protege contra el agotamiento.', color: '#22c55e' },
]

const WEEK = [
  { d: 'Lunes', t: 'Preguntas de la especialidad prioritaria + guía corta + flashcards' },
  { d: 'Martes', t: 'Segunda especialidad + repaso de errores del lunes' },
  { d: 'Miércoles', t: 'Preguntas mezcladas + flashcards' },
  { d: 'Jueves', t: 'Especialidad débil + perlas de su espacio' },
  { d: 'Viernes', t: 'Preguntas mezcladas + repaso de errores de la semana' },
  { d: 'Sábado', t: 'Simulacro con tiempo + revisión completa de resultados' },
  { d: 'Domingo', t: 'Descanso (repaso ligero de flashcards opcional)' },
]

const EXAM_DAY = [
  'Revisa con anticipación lugar, hora y documentos que pide la convocatoria.',
  'Duerme bien la noche anterior; no estudies hasta tarde.',
  'Desayuna algo ligero y llega con tiempo.',
  'Lee el enunciado completo y todas las opciones antes de responder.',
  'Si una pregunta te traba, márcala y sigue: vuelve al final.',
  'Controla el ritmo: revisa el reloj cada cierto número de preguntas.',
  'Responde todas las preguntas si no hay penalización por error (verifícalo en las bases).',
]

const FAQ = [
  { q: '¿Cuántas horas debo estudiar al día?', a: 'Depende del tiempo que falte y de tus responsabilidades. Es mejor un plan sostenible (por ejemplo, 1–2 horas diarias durante meses) que jornadas largas e irregulares. El cuestionario ajusta tu plan a lo que puedes dedicar.' },
  { q: '¿Empiezo por la teoría o por las preguntas?', a: 'Combina ambas. Al inicio, una guía corta seguida de preguntas del mismo tema. Con el tiempo, las preguntas deben ocupar la mayor parte, porque te enseñan qué y cómo se pregunta.' },
  { q: '¿Qué hago con las preguntas que fallo?', a: 'Lee la explicación, anota lo que no sabías y vuelve a responderlas en unos días desde «Repaso». Fallar durante la preparación es la mejor forma de no fallar en el examen.' },
  { q: '¿Cada cuánto hacer simulacros?', a: 'Uno semanal en las primeras fases y con mayor frecuencia en los últimos dos meses. Lo más importante es revisar los resultados por especialidad y las preguntas falladas después de cada uno.' },
  { q: '¿Dónde se guarda mi progreso?', a: 'En tu propio dispositivo, sin necesidad de cuenta. Desde Configuración puedes descargar un respaldo y restaurarlo en otro navegador o teléfono.' },
  { q: '¿El formato del simulacro es igual al del examen real?', a: 'Los simulacros reproducen la dinámica: tiempo limitado, sin retroalimentación y preguntas repartidas por especialidad. El número de preguntas y la duración oficiales los define cada convocatoria; puedes ajustar el simulacro personalizado a esos valores.' },
]

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="space-y-2">
      {FAQ.map((f, i) => (
        <Card key={f.q} className="overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-4 text-left font-semibold sm:p-5" aria-expanded={open === i}>
            {f.q}
            <ChevronDown className={cn('size-5 shrink-0 text-muted transition-transform', open === i && 'rotate-180')} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="px-4 pb-5 text-sm leading-relaxed text-muted sm:px-5">{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  )
}

export default function PrepGuide() {
  return (
    <div className="space-y-12">
      <PageHeader icon={<Compass className="size-6" />} eyebrow="Estrategia" title="Cómo prepararte para el ENURM" subtitle="Un método claro, de principio a fin, basado en técnicas de estudio con evidencia." />

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-500/15 text-amber-600">
          <TriangleAlert className="size-6" />
        </span>
        <p className="flex-1 text-sm text-muted">
          El <b className="text-[var(--text)]">ENURM</b> es el examen de selección para acceder a las plazas de residencia médica en la República Dominicana. Las fechas, requisitos, número de preguntas y reglas de puntuación se publican en cada convocatoria oficial: consúltalas siempre antes del examen.
        </p>
      </Card>

      <section>
        <h2 className="mb-1 font-display text-2xl font-bold">Las 4 fases de tu preparación</h2>
        <p className="mb-6 text-sm text-muted">Tu plan diario cambia automáticamente de fase según los días que faltan.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PHASE_ORDER.map((ph, i) => {
            const info = PHASES[ph]
            return (
              <motion.div key={ph} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card relative overflow-hidden p-5">
                <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: info.color }} />
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full font-display text-sm font-bold text-white" style={solidBg(info.color)}>
                    {i + 1}
                  </span>
                  <h3 className="font-display font-bold">{info.name}</h3>
                </div>
                <p className="mt-2 text-xs text-muted">{info.description}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {PHASE_TODO[ph].map((t) => (
                    <li key={t} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0" style={{ color: info.color }} /> {t}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-display text-2xl font-bold">Métodos que funcionan</h2>
        <p className="mb-6 text-sm text-muted">Cada sección de MedLogic aplica uno o varios de estos principios.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METHODS.map((m, i) => (
            <motion.div key={m.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }} className="card card-hover p-5">
              <span className="grid size-11 place-items-center rounded-xl" style={{ backgroundColor: `${m.color}1a`, color: m.color }}>
                <m.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{m.title}</h3>
              <p className="mt-1 text-sm text-muted">{m.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
            <CalendarDays className="size-5 text-brand-500" /> Una semana tipo
          </h2>
          <Card className="divide-y divide-[var(--border)]">
            {WEEK.map((w) => (
              <div key={w.d} className="flex gap-4 p-4">
                <span className="w-20 shrink-0 text-sm font-semibold">{w.d}</span>
                <span className="text-sm text-muted">{w.t}</span>
              </div>
            ))}
          </Card>
        </section>
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
            <GraduationCap className="size-5 text-brand-500" /> El día del examen
          </h2>
          <Card className="p-5">
            <ul className="space-y-3">
              {EXAM_DAY.map((t, i) => (
                <motion.li key={t} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex gap-3 text-sm">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-500/15 text-xs font-bold text-brand-600">{i + 1}</span>
                  {t}
                </motion.li>
              ))}
            </ul>
          </Card>
        </section>
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
          <Brain className="size-5 text-brand-500" /> Preguntas frecuentes
        </h2>
        <Faq />
      </section>

      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold">Pon esto en práctica hoy</h2>
            <p className="text-sm text-muted">Responde el cuestionario y obtén un plan diario con estas técnicas, ajustado a tu fecha y tu tiempo.</p>
          </div>
          <div className="flex gap-2">
            <LinkButton to="/bienvenida">
              <Sparkles className="size-4" /> Crear mi plan
            </LinkButton>
            <LinkButton to="/flashcards" variant="outline">
              <Layers className="size-4" /> Flashcards
            </LinkButton>
          </div>
        </div>
      </Card>
    </div>
  )
}
