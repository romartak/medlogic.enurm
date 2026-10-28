import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  Activity, Bot, BrainCircuit, Check, ChevronDown, Dna, Eye, FileText, FlaskConical, GraduationCap, HeartPulse, Hospital, Languages, Layers, Lightbulb, ListChecks, Lock, Microscope, Newspaper, Presentation, Scale,
  ScanEye, ShieldCheck, Sparkles, Stethoscope, TriangleAlert, UserRound, Users, WandSparkles, X,
} from 'lucide-react'
import { Card, LinkButton, PageHeader } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

const CAN_DO = [
  { icon: Bot, title: 'Tutor 24/7', body: 'Te explica cualquier tema a tu nivel y te pregunta para comprobar que lo entendiste.', to: '/prompts/tutor-socratico' },
  { icon: Presentation, title: 'Mejora tus presentaciones', body: 'Reestructura tus diapositivas, actualiza datos y propone un diseño profesional.', to: '/prompts/diapositivas-disruptivas' },
  { icon: Layers, title: 'Crea flashcards', body: 'Convierte un PDF o tus apuntes en tarjetas listas para importar en MedLogic.', to: '/prompts/flashcards-anki' },
  { icon: ListChecks, title: 'Genera preguntas', body: 'Simulacros tipo ENURM con análisis de cada opción.', to: '/prompts/preguntas-enurm' },
  { icon: Stethoscope, title: 'Simula pacientes', body: 'Casos interactivos donde tú decides y la IA te evalúa.', to: '/prompts/caso-interactivo' },
  { icon: FileText, title: 'Resume guías', body: 'Extrae lo esencial de una guía clínica en una página.', to: '/prompts/resumen-guia' },
  { icon: Newspaper, title: 'Lee artículos contigo', body: 'Lectura crítica: sesgos, NNT y si cambia la práctica.', to: '/prompts/lectura-critica' },
  { icon: Languages, title: 'Rompe la barrera del inglés', body: 'Traduce y explica artículos con un glosario médico.', to: '/prompts/ingles-medico' },
  { icon: UserRound, title: 'Se adapta a ti', body: 'Con el prompt "Conóceme" la IA aprende tu perfil y te responde a tu medida.', to: '/prompts/conoceme' },
  { icon: Lightbulb, title: 'Explica tus errores', body: 'Por qué fallaste, la fisiopatología y la trampa de la pregunta.', to: '/prompts/explica-mi-error' },
]

const GLOSSARY = [
  ['Modelo de lenguaje (LLM)', 'Programa entrenado con enormes cantidades de texto para predecir la siguiente palabra. De ahí surge su capacidad de conversar, resumir o razonar, pero no "consulta" una base de datos verificada.'],
  ['Prompt', 'La instrucción que le das a la IA. Cuanto más claro sea (rol, contexto, tarea, formato y reglas), mejor será la respuesta.'],
  ['Token', 'Fragmento de texto (una palabra o parte de ella) con el que trabaja el modelo. Los límites de longitud se miden en tokens.'],
  ['Ventana de contexto', 'Cantidad de texto que el modelo puede tener en cuenta a la vez (tu conversación más los documentos adjuntos).'],
  ['Alucinación', 'Respuesta falsa dicha con total seguridad: un dato, una dosis o una referencia inventada. Es el principal riesgo en medicina.'],
  ['Multimodal', 'Modelo que entiende además imágenes, audio o documentos (por ejemplo, una diapositiva o una foto de tus apuntes).'],
  ['RAG (búsqueda aumentada)', 'Técnica en la que la IA primero busca en documentos o en internet y luego responde citando esas fuentes. Reduce las alucinaciones.'],
  ['Agente', 'IA que no solo responde, sino que ejecuta pasos: buscar, leer, calcular o crear archivos para completar una tarea.'],
  ['Sesgo', 'Errores sistemáticos que reflejan los datos de entrenamiento (por ejemplo, poblaciones poco representadas).'],
  ['Temperatura', 'Ajuste de "creatividad": baja para respuestas precisas y reproducibles, alta para ideas variadas.'],
]

const MEDICINE = [
  { icon: ScanEye, title: 'Imagen médica', body: 'Algoritmos que detectan hallazgos en radiografías, tomografías y mamografías, y priorizan los estudios urgentes.', limit: 'Funcionan como apoyo: el radiólogo valida el resultado.' },
  { icon: Eye, title: 'Oftalmología', body: 'Sistemas que detectan retinopatía diabética en fotografías de fondo de ojo; algunos están autorizados para cribado en atención primaria.', limit: 'Requieren imágenes de buena calidad y derivar los casos positivos.' },
  { icon: HeartPulse, title: 'Cardiología', body: 'Análisis de ECG con IA para detectar arritmias o patrones de disfunción ventricular que el ojo humano no ve.', limit: 'Su rendimiento varía según la población en la que se validó.' },
  { icon: Microscope, title: 'Patología digital y dermatología', body: 'Clasificación de láminas histológicas y de lesiones de piel a partir de imágenes.', limit: 'Pueden fallar más en pieles y poblaciones poco representadas en los datos.' },
  { icon: FileText, title: 'Documentación clínica', body: '"Escribas" que transcriben la consulta y redactan la nota clínica para liberar tiempo del médico.', limit: 'La nota debe revisarse siempre; la privacidad del paciente es clave.' },
  { icon: Activity, title: 'Apoyo a decisiones', body: 'Alertas de sepsis o deterioro clínico, interacciones farmacológicas y recomendaciones basadas en guías.', limit: 'El exceso de alertas genera fatiga y se ignoran.' },
  { icon: Dna, title: 'Investigación y fármacos', body: 'Predicción de la estructura de proteínas, búsqueda de moléculas candidatas y análisis de datos genómicos.', limit: 'Acelera hipótesis, pero los ensayos clínicos siguen siendo indispensables.' },
  { icon: Users, title: 'Salud pública', body: 'Detección temprana de brotes, modelos de propagación (por ejemplo, de dengue) y planificación de recursos.', limit: 'Depende de la calidad de los datos de vigilancia.' },
  { icon: GraduationCap, title: 'Educación médica', body: 'Tutores personalizados, pacientes simulados y retroalimentación inmediata, como en MedLogic.', limit: 'No sustituye la práctica clínica supervisada.' },
]

const RISKS = [
  { icon: TriangleAlert, title: 'Alucinaciones', body: 'Puede inventar dosis, criterios o referencias con total seguridad. Verifica siempre en la fuente original.' },
  { icon: Lock, title: 'Privacidad', body: 'Nunca pegues nombres, cédulas, fotos o datos que identifiquen a un paciente en una IA pública.' },
  { icon: Scale, title: 'Sesgos', body: 'Puede funcionar peor en grupos poco representados en sus datos de entrenamiento.' },
  { icon: BrainCircuit, title: 'Sesgo de automatización', body: 'La tendencia a confiar en la máquina por encima de nuestro juicio. Tú eres responsable de la decisión.' },
  { icon: Newspaper, title: 'Información desactualizada', body: 'Su conocimiento tiene una fecha de corte: las guías pueden haber cambiado.' },
  { icon: Hospital, title: 'Responsabilidad', body: 'Una recomendación de IA no es un acto médico. Las decisiones clínicas son del profesional.' },
]

const RULES = [
  'Úsala para aprender y pensar, no para que piense por ti.',
  'Pide siempre las fuentes (guía y año) y verifícalas.',
  'Si un dato cambia una decisión clínica, confírmalo en la guía oficial.',
  'Nunca compartas datos que identifiquen a un paciente.',
  'Pídele que diga "no estoy seguro" en lugar de inventar.',
  'Desconfía de las referencias sin DOI o enlace verificable.',
  'Contrasta las respuestas importantes con una segunda fuente o una segunda IA.',
]

const QUIZ = [
  { s: 'Pegar la historia clínica completa de un paciente, con su nombre y cédula, para que la IA sugiera un diagnóstico.', safe: false, why: 'Expone datos sensibles. Si necesitas ayuda, anonimiza por completo el caso (sin nombre, cédula, fechas exactas ni fotos identificables).' },
  { s: 'Pedirle a la IA que convierta tus apuntes en flashcards y luego revisarlas antes de estudiarlas.', safe: true, why: 'Es un uso ideal: ahorra tiempo y tú verificas el contenido.' },
  { s: 'Usar la dosis que sugirió la IA sin consultar ninguna otra fuente.', safe: false, why: 'Las dosis son un punto típico de alucinación. Confírmalas siempre en una guía o formulario oficial.' },
  { s: 'Pedirle que te explique un artículo en inglés y te dé el DOI para leer el original.', safe: true, why: 'Bien: usas la IA como puente hacia la fuente original.' },
  { s: 'Citar en tu tesis una referencia que te dio la IA sin comprobar que existe.', safe: false, why: 'Las IA pueden inventar referencias muy convincentes. Busca cada una antes de citarla.' },
  { s: 'Practicar un caso clínico simulado con la IA antes de una guardia.', safe: true, why: 'Es entrenamiento sin riesgo para pacientes reales.' },
]

const TOOLS = [
  { name: 'ChatGPT', use: 'Conversación general, análisis de archivos, voz e imágenes.' },
  { name: 'Claude', use: 'Textos largos, documentos y razonamiento detallado.' },
  { name: 'Gemini', use: 'Integración con los servicios de Google y análisis de archivos.' },
  { name: 'Microsoft Copilot', use: 'Integración con Word, PowerPoint y el ecosistema de Microsoft.' },
  { name: 'Perplexity', use: 'Respuestas con búsqueda en internet y enlaces a las fuentes.' },
  { name: 'NotebookLM', use: 'Trabaja solo sobre tus documentos (guías, apuntes) y cita de dónde sale cada dato.' },
  { name: 'Buscadores científicos con IA', use: 'Herramientas como Consensus o Elicit buscan y resumen artículos científicos.' },
]

/* ---------- demo: predicción de la siguiente palabra ---------- */

const CANDIDATES = [
  { w: 'sulfato de magnesio', p: 0.82 },
  { w: 'labetalol', p: 0.07 },
  { w: 'diazepam', p: 0.05 },
  { w: 'nifedipino', p: 0.04 },
  { w: 'otro', p: 0.02 },
]

function NextWordDemo() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 2200)
    return () => clearInterval(id)
  }, [])
  return (
    <Card className="overflow-hidden p-5 sm:p-6">
      <div className="text-xs font-semibold tracking-wider text-muted uppercase">Así "piensa" un modelo de lenguaje (ejemplo ilustrativo)</div>
      <p className="mt-3 font-display text-lg font-semibold sm:text-xl">
        «Para prevenir convulsiones en la preeclampsia grave se usa…{' '}
        <AnimatePresence mode="wait">
          {step >= 2 ? (
            <motion.span key="w" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded bg-brand-500/15 px-1 text-brand-700 dark:text-brand-300">
              sulfato de magnesio
            </motion.span>
          ) : (
            <motion.span key="c" animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              ▍
            </motion.span>
          )}
        </AnimatePresence>
        »
      </p>
      <div className="mt-5 space-y-2">
        {CANDIDATES.map((c, i) => (
          <div key={c.w} className="flex items-center gap-3 text-sm">
            <span className={cn('w-36 shrink-0 truncate', i === 0 && step >= 1 && 'font-semibold')}>{c.w}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full surface-2">
              <motion.div className={cn('h-full w-full origin-left rounded-full', i === 0 ? 'bg-brand-gradient' : 'bg-slate-400/60')} initial={{ scaleX: 0 }} animate={{ scaleX: step >= 1 ? c.p : 0 }} transition={{ duration: 0.8, delay: i * 0.05 }} />
            </div>
            <span className="w-10 text-right text-xs text-muted tabular-nums">{step >= 1 ? `${Math.round(c.p * 100)}%` : ''}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        El modelo calcula qué palabra es más probable según los patrones de su entrenamiento. Por eso suele acertar en lo frecuente… y por eso puede <b className="text-[var(--text)]">inventar con seguridad</b> cuando el dato es raro o no lo aprendió.
      </p>
    </Card>
  )
}

function Glossary() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {GLOSSARY.map(([t, d], i) => (
        <Card key={t} className="overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-3 p-4 text-left text-sm font-semibold" aria-expanded={open === i}>
            {t}
            <ChevronDown className={cn('size-4 shrink-0 text-muted transition-transform', open === i && 'rotate-180')} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-4 pb-4 text-sm text-muted">
                {d}
              </motion.p>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  )
}

function SafetyQuiz() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const score = QUIZ.filter((q, i) => answers[i] === q.safe).length
  const done = Object.keys(answers).length === QUIZ.length
  return (
    <div className="space-y-3">
      {QUIZ.map((q, i) => {
        const a = answers[i]
        const answered = a !== undefined
        const right = answered && a === q.safe
        return (
          <Card key={i} className={cn('p-4 transition-colors', answered && (right ? 'border-emerald-500/40' : 'border-rose-500/40'))}>
            <p className="text-sm font-medium">{q.s}</p>
            {!answered ? (
              <div className="mt-3 flex gap-2">
                <button onClick={() => setAnswers({ ...answers, [i]: true })} className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400">
                  <ShieldCheck className="size-3.5" /> Uso seguro
                </button>
                <button onClick={() => setAnswers({ ...answers, [i]: false })} className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-500/20 dark:text-rose-400">
                  <TriangleAlert className="size-3.5" /> Riesgoso
                </button>
              </div>
            ) : (
              <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex gap-2 text-sm">
                {right ? <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" /> : <X className="mt-0.5 size-4 shrink-0 text-rose-500" />}
                <span>
                  <b>{q.safe ? 'Uso seguro.' : 'Riesgoso.'}</b> <span className="text-muted">{q.why}</span>
                </span>
              </motion.p>
            )}
          </Card>
        )
      })}
      {done && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl bg-brand-gradient p-5 text-center text-white">
          <div className="font-display text-3xl font-extrabold">
            {score}/{QUIZ.length}
          </div>
          <div className="text-sm text-white/85">{score === QUIZ.length ? '¡Perfecto! Usas la IA como un profesional.' : 'Repasa las reglas de oro y vuelve a intentarlo.'}</div>
          <button onClick={() => setAnswers({})} className="mt-3 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold">
            Repetir
          </button>
        </motion.div>
      )}
    </div>
  )
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <div className="text-xs font-semibold tracking-wider text-brand-600 uppercase dark:text-brand-400">{eyebrow}</div>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</p>}
    </div>
  )
}

export default function AiGuide() {
  return (
    <div className="space-y-14">
      <PageHeader icon={<Sparkles className="size-6" />} eyebrow="Inteligencia artificial" title="IA para médicos" subtitle="Qué puede hacer la IA por ti, cómo funciona, cómo pedirle las cosas y cómo usarla con seguridad en medicina." actions={<LinkButton to="/prompts"><WandSparkles className="size-4" /> Ver prompts</LinkButton>} />

      <section>
        <SectionTitle eyebrow="Para ti" title="Todo lo que la IA puede hacer por tu estudio" subtitle="Cada tarjeta te lleva a un prompt listo para usar." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CAN_DO.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 5) * 0.05 }}>
              <Link to={c.to} className="card card-hover group flex h-full flex-col p-4">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600 transition-transform group-hover:scale-110 dark:text-brand-400">
                  <c.icon className="size-5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{c.title}</h3>
                <p className="mt-1 text-xs text-muted">{c.body}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Conoce la IA" title="¿Cómo funciona por dentro?" subtitle="No necesitas ser ingeniero: con entender estas ideas usarás la IA mucho mejor." />
        <div className="grid gap-6 lg:grid-cols-2">
          <NextWordDemo />
          <Glossary />
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="El método" title="Las 5 partes de un buen prompt" subtitle="La diferencia entre una respuesta genérica y una excelente está en cómo pides las cosas." />
        <div className="grid gap-3 sm:grid-cols-5">
          {[
            ['Rol', 'Quién debe ser la IA', 'Actúa como un profesor de obstetricia…'],
            ['Contexto', 'Quién eres y para qué', 'Me preparo para el ENURM en 3 meses…'],
            ['Tarea', 'Qué debe hacer', 'Explícame la preeclampsia…'],
            ['Formato', 'Cómo lo quieres', 'En una tabla y 5 viñetas…'],
            ['Reglas', 'Límites y verificación', 'Cita guías con año; no inventes.'],
          ].map(([t, d, e], i) => (
            <motion.div key={t} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="card relative p-4">
              <span className="font-display text-3xl font-black text-brand-500/25">{i + 1}</span>
              <div className="font-semibold">{t}</div>
              <div className="text-xs text-muted">{d}</div>
              <div className="mt-2 rounded-lg surface-2 p-2 text-xs italic">{e}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className="border-rose-500/30 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
              <X className="size-4" /> Prompt débil
            </div>
            <p className="mt-2 rounded-lg surface-2 p-3 font-mono text-sm">Explícame la preeclampsia.</p>
            <p className="mt-2 text-xs text-muted">Respuesta genérica, sin nivel, sin formato y sin fuentes.</p>
          </Card>
          <Card className="border-emerald-500/30 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <Check className="size-4" /> Prompt potente
            </div>
            <p className="mt-2 rounded-lg surface-2 p-3 font-mono text-sm">Actúa como profesor de obstetricia. Me preparo para el ENURM en 3 meses. Explícame la preeclampsia: definición, criterios de severidad y manejo. Usa una tabla y termina con 3 preguntas tipo examen. Cita la guía y el año; si no estás seguro de un dato, dilo.</p>
            <p className="mt-2 text-xs text-muted">Respuesta enfocada, verificable y lista para estudiar.</p>
          </Card>
        </div>
        <div className="mt-4 text-center">
          <LinkButton to="/prompts" variant="outline" className="h-auto min-h-11 max-w-full py-2 whitespace-normal">
            <WandSparkles className="size-4" /> Practica en el constructor de prompts
          </LinkButton>
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="IA en la medicina" title="Cómo se está aplicando la IA en la práctica médica" subtitle="Panorama general: cada aplicación tiene beneficios reales y límites que todo médico debe conocer." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MEDICINE.map((m, i) => (
            <motion.div key={m.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.06 }} className="card card-hover flex flex-col p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400">
                <m.icon className="size-5" />
              </span>
              <h3 className="mt-3 font-semibold">{m.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{m.body}</p>
              <p className="mt-3 flex gap-1.5 rounded-lg bg-amber-500/[0.07] p-2 text-xs">
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-500" /> {m.limit}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle eyebrow="Ética y seguridad" title="Riesgos que debes conocer" />
          <div className="grid gap-3 sm:grid-cols-2">
            {RISKS.map((r) => (
              <Card key={r.title} className="p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <r.icon className="size-4 text-rose-500" /> {r.title}
                </div>
                <p className="mt-1 text-xs text-muted">{r.body}</p>
              </Card>
            ))}
          </div>
          <Card className="mt-4 p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-5 text-emerald-500" /> Reglas de oro
            </h3>
            <ul className="space-y-2 text-sm">
              {RULES.map((r) => (
                <li key={r} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" /> {r}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div>
          <SectionTitle eyebrow="Ponte a prueba" title="¿Uso seguro o riesgoso?" />
          <SafetyQuiz />
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Herramientas" title="¿Cuál IA usar?" subtitle="Todas sirven con los prompts de MedLogic. Revisa las condiciones y la privacidad de cada servicio antes de usarlo." />
        <Card className="divide-y divide-[var(--border)]">
          {TOOLS.map((t) => (
            <div key={t.name} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-6">
              <span className="w-56 shrink-0 font-semibold">{t.name}</span>
              <span className="text-sm text-muted">{t.use}</span>
            </div>
          ))}
        </Card>
      </section>

      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <FlaskConical className="size-7" />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold">Reto de hoy</h2>
            <p className="text-sm text-muted">Toma tu presentación más reciente y pásala por el prompt «Transforma tu presentación». Luego crea 20 flashcards de ese tema e impórtalas en MedLogic.</p>
          </div>
          <LinkButton to="/prompts/diapositivas-disruptivas">
            Empezar el reto
          </LinkButton>
        </div>
      </Card>
    </div>
  )
}
