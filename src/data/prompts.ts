/**
 * Biblioteca de prompts para usar MedLogic con cualquier IA (ChatGPT, Claude, Gemini, Copilot…).
 * Las variables se escriben {{clave}} y se rellenan desde la página /prompts.
 */
import { formatEnurmDate, upcomingEnurm } from './enurm'

const NEXT_ENURM = ((e) => `ENURM ${e.year}, ${formatEnurmDate(e, { weekday: true })}`)(upcomingEnurm(1)[0])

export interface PromptVariable {
  key: string
  label: string
  placeholder: string
  default?: string
  /** Campo de texto largo. */
  long?: boolean
}

export interface PromptCategory {
  id: string
  name: string
  icon: string
  color: string
}

export interface PromptItem {
  id: string
  title: string
  category: string
  icon: string
  description: string
  featured?: boolean
  /** Requiere adjuntar un archivo en el chat de la IA. */
  attachment?: string
  variables: PromptVariable[]
  template: string
  steps: string[]
  /** Qué entrega la IA. */
  output: string
  tips?: string[]
  /** Enlace interno relacionado (p. ej. importar flashcards). */
  related?: { label: string; to: string }
}

export const PROMPT_CATEGORIES: PromptCategory[] = [
  { id: 'presentaciones', name: 'Presentaciones', icon: 'presentation', color: '#f59e0b' },
  { id: 'flashcards', name: 'Flashcards', icon: 'layers', color: '#8b5cf6' },
  { id: 'estudio', name: 'Estudiar y entender', icon: 'lightbulb', color: '#06c4b0' },
  { id: 'preguntas', name: 'Preguntas y casos', icon: 'list-checks', color: '#0ea5e9' },
  { id: 'evidencia', name: 'Artículos y guías', icon: 'book-open-check', color: '#22c55e' },
  { id: 'personal', name: 'Personaliza tu IA', icon: 'user-round', color: '#ec4899' },
  { id: 'productividad', name: 'Plan y productividad', icon: 'calendar-range', color: '#6366f1' },
]

const SAFE = 'Si un dato no está en el material ni en guías reconocidas, dilo explícitamente en lugar de inventarlo.'

export const PROMPTS: PromptItem[] = [
  {
    id: 'diapositivas-disruptivas',
    title: 'Transforma tu presentación',
    category: 'presentaciones',
    icon: 'presentation',
    featured: true,
    description: 'Sube tus diapositivas y la IA las rediseña por completo: narrativa, contenido actualizado, una idea por diapositiva, diseño visual y notas del orador.',
    attachment: 'Adjunta tu presentación (.pptx o .pdf) en el chat de la IA.',
    variables: [
      { key: 'tema', label: 'Tema de la presentación', placeholder: 'Manejo de la preeclampsia' },
      { key: 'especialidad', label: 'Especialidad', placeholder: 'Ginecología y Obstetricia' },
      { key: 'audiencia', label: 'Audiencia', placeholder: 'estudiantes de medicina e internos', default: 'internos y médicos generales que se preparan para el ENURM' },
      { key: 'duracion', label: 'Duración (minutos)', placeholder: '15', default: '15' },
    ],
    template: `Actúa como un equipo de tres expertos que trabajan juntos:
1) un especialista en {{especialidad}} y educador clínico,
2) un diseñador de información que crea presentaciones al nivel de las mejores charlas TED,
3) un editor científico que verifica cada dato contra la evidencia actual.

Te adjunto mi presentación sobre «{{tema}}». Audiencia: {{audiencia}}. Duración: {{duracion}} minutos.

Tu misión es transformarla de forma radical para que sea memorable, precisa y visualmente impecable. No la resumas: mejórala. Trabaja en este orden:

1. DIAGNÓSTICO
Enumera los 5 problemas principales de la versión actual (estructura, densidad de texto, claridad, diseño y datos desactualizados o incorrectos).

2. NUEVA ARQUITECTURA NARRATIVA
- Gancho inicial: un caso clínico breve, una pregunta provocadora o un dato impactante.
- De 3 a 5 bloques, cada uno con un único mensaje clave.
- Cierre: "Lo que no puedes olvidar" (3 puntos) y una pregunta tipo examen.

3. DIAPOSITIVA POR DIAPOSITIVA
Para cada diapositiva entrega una tabla con:
- Título-afirmación: una frase que diga la conclusión, no solo el tema (p. ej. "El sulfato de magnesio reduce a la mitad el riesgo de eclampsia").
- Contenido: máximo 3 viñetas de 8 palabras, o un solo elemento visual.
- Visual: tipo (algoritmo, diagrama de flujo, tabla comparativa, línea de tiempo, esquema fisiopatológico, imagen clínica o icono) y descripción exacta de cómo construirlo.
- Notas del orador: lo que debo decir, en 60–90 palabras.
- Fuente: guía o artículo que respalda el dato, con autor y año.

4. ACTUALIZACIÓN CIENTÍFICA
Señala cada dato que contradiga las guías vigentes, indica la guía correcta (nombre y año) y propón la corrección. ${SAFE}

5. SISTEMA DE DISEÑO
- Paleta de 3 colores con códigos HEX (un color de acento para lo importante).
- 2 tipografías (títulos y texto) y tamaños mínimos.
- Reglas: una idea por diapositiva, mucho espacio en blanco, contraste alto, cero párrafos, iconos de un mismo estilo.
- Una plantilla de diseño para: portada, diapositiva de concepto, diapositiva de algoritmo, diapositiva de caso y cierre.

6. EXTRAS PARA FIJAR EL APRENDIZAJE
- 3 preguntas de opción múltiple tipo ENURM con respuesta y explicación.
- 5 flashcards con los datos más importantes.

Usa encabezados y tablas en Markdown.`,
    steps: ['Completa los campos y copia el prompt.', 'Abre ChatGPT, Claude o Gemini y adjunta tu .pptx o .pdf.', 'Pega el prompt y envíalo.', 'Pide ajustes: "Hazla más visual", "Reduce a 10 diapositivas" o "Genera el archivo .pptx con este diseño" (si la IA puede crear archivos).'],
    output: 'Diagnóstico, nueva estructura, contenido diapositiva por diapositiva con visuales y notas del orador, datos actualizados con fuentes, sistema de diseño y preguntas de repaso.',
    tips: ['Si tu IA puede generar archivos, al final pídele: "Crea el archivo .pptx aplicando este diseño".', 'Para una charla más corta, cambia la duración: el número de diapositivas se ajusta.', 'Pídele una versión "para imprimir" en una sola página como material de apoyo.'],
  },
  {
    id: 'flashcards-anki',
    title: 'Flashcards de alto rendimiento',
    category: 'flashcards',
    icon: 'layers',
    featured: true,
    description: 'Convierte cualquier PDF, apunte, guía o tema en flashcards listas para importar en MedLogic o en Anki, incluyendo tarjetas cloze.',
    attachment: 'Opcional: adjunta tu PDF, apuntes o diapositivas.',
    variables: [
      { key: 'tema', label: 'Tema (si no adjuntas material)', placeholder: 'Trastornos hipertensivos del embarazo' },
      { key: 'especialidad', label: 'Especialidad', placeholder: 'Ginecología y Obstetricia' },
      { key: 'cantidad', label: 'Número de tarjetas', placeholder: '30', default: '30' },
      { key: 'etiquetas', label: 'Etiquetas', placeholder: 'ginobs preeclampsia', default: 'enurm' },
    ],
    template: `Actúa como experto en aprendizaje basado en evidencia (práctica de recuperación y repetición espaciada) y en {{especialidad}}.

A partir del material que te adjunto (o, si no adjunto nada, del tema «{{tema}}»), crea {{cantidad}} flashcards de alto rendimiento para el ENURM.

Reglas para cada tarjeta:
- Una sola idea por tarjeta (principio de información mínima).
- Pregunta concreta que obligue a recordar; nunca preguntas de sí o no.
- Respuesta breve (máximo 15 palabras).
- Prioriza lo que más se pregunta: fármaco o conducta de elección, criterios diagnósticos, puntos de corte, signos característicos, complicaciones y "lo más frecuente".
- Para listas, criterios y valores numéricos usa tarjetas cloze con el formato {{c1::texto}} (y {{c2::…}} para un segundo hueco).
- ${SAFE}

FORMATO DE SALIDA OBLIGATORIO
Un único bloque de código en texto plano, una tarjeta por línea, con los campos separados por TABULADOR:
frente<TAB>reverso<TAB>etiquetas

- Etiquetas: {{etiquetas}} (separadas por espacios).
- En las tarjetas cloze, el reverso puede quedar vacío o llevar un dato extra.
- No numeres las líneas ni agregues texto dentro del bloque.

Después del bloque, en una sola línea, dime cuántas tarjetas hiciste y qué temas cubren.`,
    steps: ['Completa los campos y copia el prompt.', 'Ábrelo en tu IA (adjunta tu material si quieres).', 'Copia el bloque de código que te devuelve.', 'En MedLogic: Flashcards → Importar / exportar (Anki) → pega el texto → Importar.'],
    output: 'Un bloque de texto con una tarjeta por línea, listo para importar.',
    tips: ['Pide "otras 30 sobre lo que no cubriste" para completar el tema.', 'Si una tarjeta te cuesta mucho, pide a la IA que la divida en dos más simples.'],
    related: { label: 'Ir a importar flashcards', to: '/flashcards' },
  },
  {
    id: 'conoceme',
    title: 'Conóceme: tu IA personalizada',
    category: 'personal',
    icon: 'user-round',
    featured: true,
    description: 'La IA te entrevista pregunta a pregunta y crea tu perfil de estudiante, un plan y unas "instrucciones personalizadas" para que siempre te responda a tu medida.',
    variables: [{ key: 'nombre', label: 'Tu nombre (opcional)', placeholder: 'Ana' }],
    template: `Quiero que me conozcas para ayudarme a preparar el ENURM (Examen Nacional Único de Residencias Médicas de la República Dominicana). Mi nombre es {{nombre}}.

Entrevístame como lo haría un mentor experto en educación médica. Reglas:
- Hazme UNA sola pregunta a la vez y espera mi respuesta.
- Haz entre 10 y 12 preguntas en total, adaptando cada una a lo que respondí antes.
- Explora: mi etapa (estudiante, interno, médico general), fecha del examen, residencia que quiero, horas reales de estudio, especialidades fuertes y débiles, cómo aprendo mejor, qué me distrae, cómo manejo el estrés y qué recursos uso.

Al terminar, entrégame:
1. Mi PERFIL DE ESTUDIANTE en 5 líneas.
2. Mis 3 fortalezas y 3 riesgos principales.
3. Un PLAN SEMANAL realista (tabla por días) con técnicas basadas en evidencia: práctica de preguntas, repetición espaciada, intercalado y simulacros.
4. Un texto de INSTRUCCIONES PERSONALIZADAS (máximo 1 200 caracteres) que pueda pegar en la configuración de la IA (instrucciones personalizadas, memoria o proyecto) para que siempre me respondas teniendo en cuenta mi perfil, mi nivel y mi forma de aprender.

Empieza ahora con la primera pregunta.`,
    steps: ['Copia el prompt y ábrelo en tu IA favorita.', 'Responde con sinceridad cada pregunta.', 'Copia las "instrucciones personalizadas" que te entrega y pégalas en la configuración de tu IA.'],
    output: 'Perfil de estudiante, fortalezas y riesgos, plan semanal e instrucciones personalizadas reutilizables.',
    tips: ['Repite la entrevista cada 2 meses: tu perfil cambia a medida que avanzas.', 'Combínalo con "Mi plan" de MedLogic: usa las mismas horas y días.'],
  },
  {
    id: 'tutor-socratico',
    title: 'Tutor socrático',
    category: 'estudio',
    icon: 'message-circle-question',
    description: 'La IA no te da la respuesta: te guía con preguntas hasta que entiendes el tema de verdad.',
    variables: [
      { key: 'tema', label: 'Tema', placeholder: 'Síndrome nefrótico vs. nefrítico' },
      { key: 'nivel', label: 'Tu nivel', placeholder: 'básico', default: 'intermedio' },
    ],
    template: `Actúa como un profesor de medicina que usa el método socrático. Quiero dominar: «{{tema}}». Mi nivel actual es {{nivel}}.

Reglas:
- No me expliques todo de golpe. Hazme una pregunta a la vez, de lo simple a lo complejo.
- Si respondo bien, profundiza (mecanismo fisiopatológico → clínica → diagnóstico → tratamiento).
- Si respondo mal, no me des la respuesta enseguida: dame una pista y vuelve a preguntar.
- Cada 5 preguntas, resume en 3 viñetas lo que ya domino y lo que me falta.
- Al final, ponme un caso clínico corto tipo ENURM que integre todo.
- ${SAFE}

Empieza con la primera pregunta.`,
    steps: ['Elige un tema que te cueste.', 'Responde sin buscar en tus apuntes: el esfuerzo es lo que fija el aprendizaje.'],
    output: 'Una conversación guiada que termina con un caso clínico integrador.',
  },
  {
    id: 'explica-mi-error',
    title: 'Explícame mi error',
    category: 'estudio',
    icon: 'lightbulb',
    description: 'Pega una pregunta que fallaste: la IA explica por qué tu opción es incorrecta, la fisiopatología y cómo no volver a caer.',
    variables: [
      { key: 'pregunta', label: 'Pregunta completa con sus opciones', placeholder: 'Pega aquí el enunciado y las opciones…', long: true },
      { key: 'mi_respuesta', label: 'Lo que respondiste', placeholder: 'A) Diazepam' },
      { key: 'correcta', label: 'Respuesta correcta', placeholder: 'C) Sulfato de magnesio' },
    ],
    template: `Fallé esta pregunta tipo ENURM y quiero entender mi error a fondo.

PREGUNTA:
{{pregunta}}

Mi respuesta: {{mi_respuesta}}
Respuesta correcta: {{correcta}}

Explícame, en este orden:
1. Por qué mi respuesta es incorrecta (qué la hace atractiva y por qué falla).
2. Por qué la correcta es correcta.
3. La fisiopatología o el mecanismo que explica la respuesta, paso a paso.
4. Por qué cada una de las demás opciones es incorrecta (una línea por opción).
5. La "trampa" de la pregunta y cómo reconocerla en el futuro.
6. Una mnemotecnia o regla corta para recordarlo.
7. Dos referencias (guía o artículo, con año) que respalden la explicación.
8. Una pregunta parecida para comprobar que lo entendí (sin darme la respuesta hasta que conteste).

${SAFE}`,
    steps: ['Desde una pregunta fallada en MedLogic usa el botón "Explícalo con IA": el prompt se llena solo.', 'O pega aquí cualquier pregunta que hayas fallado.'],
    output: 'Análisis completo del error, con fisiopatología, trampa, mnemotecnia, referencias y una pregunta de control.',
  },
  {
    id: 'preguntas-enurm',
    title: 'Genera preguntas tipo ENURM',
    category: 'preguntas',
    icon: 'list-checks',
    description: 'Preguntas de opción múltiple con caso clínico, análisis de cada opción y bibliografía, sobre el tema que quieras.',
    variables: [
      { key: 'tema', label: 'Tema', placeholder: 'Dengue' },
      { key: 'cantidad', label: 'Cantidad', placeholder: '10', default: '10' },
      { key: 'dificultad', label: 'Dificultad', placeholder: 'media', default: 'mixta (fácil, media y difícil)' },
    ],
    template: `Actúa como redactor experto de exámenes de residencia médica (ENURM, República Dominicana).

Crea {{cantidad}} preguntas de opción múltiple sobre «{{tema}}», con dificultad {{dificultad}}.

Requisitos:
- Viñeta clínica realista (edad, sexo, cuadro, signos vitales y datos relevantes) cuando aplique.
- 4 opciones (A–D) plausibles y homogéneas; una sola correcta.
- Evita "todas las anteriores" y "ninguna de las anteriores".
- Basadas en guías vigentes (OMS/OPS, ACOG, ESC, AHA, GINA, KDIGO, ADA u otras según el tema).

Primero muéstrame SOLO las preguntas, numeradas, sin respuestas. Cuando te escriba mis respuestas (por ejemplo "1B 2C 3A…"), corrígelas y para cada pregunta explica:
- Por qué la correcta es correcta y por qué cada distractor es incorrecto.
- La fisiopatología clave.
- Una referencia (guía o artículo con año).
Al final, dame mi puntuación y los subtemas que debo repasar.

${SAFE}`,
    steps: ['Elige el tema y la cantidad.', 'Responde todas antes de pedir la corrección.'],
    output: 'Un mini simulacro corregido con explicaciones y temas a repasar.',
  },
  {
    id: 'caso-interactivo',
    title: 'Paciente virtual (caso interactivo)',
    category: 'preguntas',
    icon: 'stethoscope',
    description: 'La IA simula un paciente en emergencias: tú interrogas, examinas, pides estudios y decides. Al final te evalúa.',
    variables: [
      { key: 'escenario', label: 'Escenario', placeholder: 'emergencias de adultos', default: 'emergencias' },
      { key: 'especialidad', label: 'Especialidad o tema (opcional)', placeholder: 'cardiología' },
    ],
    template: `Simula un caso clínico interactivo de {{escenario}} sobre {{especialidad}} para practicar como en una guardia. Tú eres el paciente y el sistema del hospital; yo soy el médico.

Reglas:
- Empieza solo con el motivo de consulta y los signos vitales de llegada.
- Responde únicamente a lo que te pregunte o pida (interrogatorio, examen físico, laboratorios, imágenes, tratamientos). No reveles información que no pedí.
- Cada estudio que pida tarda un tiempo realista; el paciente puede mejorar o empeorar según mis decisiones.
- Si hago algo peligroso, el paciente debe reflejarlo (de forma educativa).
- Cuando escriba "DIAGNÓSTICO: …", termina el caso y evalúame del 1 al 10 en: interrogatorio, examen, estudios, diagnóstico, tratamiento y seguridad del paciente. Explica qué habría hecho un experto y cita las guías aplicables con año.

Empieza el caso.`,
    steps: ['Actúa como en una guardia real: prioriza el ABC.', 'Escribe "DIAGNÓSTICO: …" cuando quieras terminar y recibir la evaluación.'],
    output: 'Un caso que evoluciona según tus decisiones y una evaluación detallada al final.',
  },
  {
    id: 'resumen-guia',
    title: 'Resumen de alto rendimiento de una guía',
    category: 'evidencia',
    icon: 'file-text',
    description: 'Adjunta una guía clínica o un capítulo y obtén una página con lo esencial, tablas, cambios respecto a la versión anterior y perlas de examen.',
    attachment: 'Adjunta la guía o el capítulo en PDF.',
    variables: [{ key: 'enfoque', label: 'Enfoque', placeholder: 'diagnóstico y tratamiento', default: 'lo más preguntado en exámenes de residencia' }],
    template: `Te adjunto una guía clínica (o capítulo). Conviértela en un resumen de alto rendimiento para el ENURM, con enfoque en {{enfoque}}.

Entrega:
1. Ficha: nombre de la guía, organización, año y población a la que aplica.
2. Los 10 mensajes clave (una línea cada uno).
3. Tablas: criterios diagnósticos, clasificación de gravedad y tratamiento de primera línea (con dosis cuando la guía las da).
4. Algoritmo de manejo en pasos numerados.
5. Qué cambió respecto a la versión anterior (si el documento lo indica).
6. 5 "perlas de examen" y 3 errores frecuentes.
7. 5 preguntas tipo ENURM con respuesta al final.

Usa solo el contenido del documento. Si algo no aparece, escribe "no especificado en la guía". Cita la página o sección de cada dato importante.`,
    steps: ['Adjunta el PDF de la guía.', 'Pide luego "Hazme flashcards de este resumen" y usa el prompt de flashcards.'],
    output: 'Resumen de una página con tablas, algoritmo, perlas y preguntas.',
  },
  {
    id: 'lectura-critica',
    title: 'Lectura crítica de un artículo',
    category: 'evidencia',
    icon: 'book-open-check',
    description: 'Evalúa un ensayo clínico o estudio: diseño, sesgos, resultados (RR, RAR, NNT) y si cambia la práctica.',
    attachment: 'Adjunta el artículo en PDF.',
    variables: [],
    template: `Te adjunto un artículo científico. Haz una lectura crítica estructurada como lo haría un experto en medicina basada en evidencia:

1. Pregunta de investigación en formato PICO.
2. Diseño del estudio y nivel de evidencia.
3. Validez interna: aleatorización, ocultamiento, cegamiento, pérdidas de seguimiento, análisis por intención de tratar y posibles sesgos.
4. Resultados principales: calcula o extrae RR, RAR, RRR, NNT (o NNH) e intervalos de confianza. Explica qué significan con un ejemplo concreto.
5. Validez externa: ¿se aplica a pacientes de la República Dominicana? ¿Qué limitaciones tiene?
6. Conflictos de interés y financiamiento.
7. Conclusión en 3 líneas: ¿cambia la práctica clínica?
8. 3 preguntas de bioestadística tipo ENURM basadas en este artículo.

Usa solo los datos del artículo; si falta algún dato para un cálculo, indícalo.`,
    steps: ['Adjunta el PDF del artículo.', 'Úsalo también para practicar las preguntas de bioestadística.'],
    output: 'Análisis PICO, sesgos, cálculos de impacto y conclusión práctica.',
  },
  {
    id: 'mnemotecnias',
    title: 'Mnemotecnias que sí se recuerdan',
    category: 'estudio',
    icon: 'sparkles',
    description: 'Crea mnemotecnias en español, con una historia visual, para listas difíciles de memorizar.',
    variables: [{ key: 'lista', label: '¿Qué quieres memorizar?', placeholder: 'Causas de acidosis metabólica con anion gap elevado', long: true }],
    template: `Necesito memorizar: {{lista}}

Crea 3 mnemotecnias distintas en español:
1. Una sigla o acrónimo fácil de pronunciar.
2. Una frase absurda y graciosa (cuanto más visual, mejor).
3. Una pequeña historia o imagen mental que conecte cada elemento.

Para cada una, muestra qué letra o parte corresponde a cada elemento. Luego indica cuál recomiendas y por qué. Al final, verifica que la lista esté completa y correcta según fuentes reconocidas.`,
    steps: ['Pega la lista o el concepto.', 'Elige la mnemotecnia que te haga reír: es la que mejor recordarás.'],
    output: 'Tres mnemotecnias explicadas y verificadas.',
  },
  {
    id: 'tabla-diferencial',
    title: 'Tabla de diagnóstico diferencial',
    category: 'estudio',
    icon: 'table',
    description: 'Compara enfermedades que se confunden: clínica, laboratorio, imagen, tratamiento y la "pista clave" para distinguirlas.',
    variables: [{ key: 'entidades', label: 'Entidades a comparar', placeholder: 'placenta previa, desprendimiento de placenta, rotura uterina y vasa previa' }],
    template: `Haz una tabla comparativa de diagnóstico diferencial entre: {{entidades}}.

Columnas: epidemiología y factores de riesgo, presentación clínica, hallazgos de examen, laboratorio, imagen, tratamiento de primera línea y la "pista clave" que las diferencia en una pregunta de examen.

Después:
- 3 viñetas clínicas cortas para que yo identifique cuál es cuál (respuestas al final).
- Las 3 confusiones más frecuentes y cómo evitarlas.
${SAFE}`,
    steps: ['Escribe 2 a 5 entidades que confundas.'],
    output: 'Tabla comparativa, mini casos y confusiones frecuentes.',
  },
  {
    id: 'mapa-conceptual',
    title: 'Mapa conceptual visual',
    category: 'estudio',
    icon: 'network',
    description: 'La IA crea un diagrama (código Mermaid) del tema, que puedes visualizar y exportar como imagen.',
    variables: [{ key: 'tema', label: 'Tema', placeholder: 'Fisiopatología de la insuficiencia cardíaca' }],
    template: `Crea un mapa conceptual de «{{tema}}» que vaya de la causa al mecanismo fisiopatológico, a las manifestaciones clínicas, al diagnóstico y al tratamiento.

Entrégalo como código Mermaid (flowchart TD), con nodos cortos (máximo 6 palabras) y subgrafos por bloque. Después del código, explica el diagrama en 5 viñetas.`,
    steps: ['Copia el código Mermaid que te devuelva.', 'Pégalo en mermaid.live para verlo y descargarlo como imagen.'],
    output: 'Código de diagrama listo para visualizar y una explicación breve.',
  },
  {
    id: 'apuntes-a-guia',
    title: 'De apuntes desordenados a guía clara',
    category: 'estudio',
    icon: 'pen-line',
    description: 'Pega o adjunta tus apuntes de clase o rotación y obtén una guía ordenada con tablas y perlas.',
    attachment: 'Adjunta fotos, PDF o pega el texto de tus apuntes.',
    variables: [{ key: 'tema', label: 'Tema', placeholder: 'Diabetes gestacional' }],
    template: `Te comparto mis apuntes sobre «{{tema}}». Están desordenados.

Conviértelos en una guía de estudio clara:
- Estructura: definición, epidemiología, fisiopatología, clínica, diagnóstico, tratamiento, complicaciones y prevención.
- Corrige errores o datos desactualizados y marca cada corrección con [CORREGIDO] indicando la fuente (guía y año).
- Completa lo que falte y sea importante para el ENURM, marcándolo con [AÑADIDO].
- Al final: 5 perlas, 3 errores frecuentes y 10 flashcards en formato frente<TAB>reverso.
${SAFE}`,
    steps: ['Adjunta o pega tus apuntes.', 'Importa las flashcards finales en MedLogic.'],
    output: 'Guía estructurada con correcciones marcadas, perlas y flashcards.',
  },
  {
    id: 'ingles-medico',
    title: 'Artículos en inglés sin barreras',
    category: 'evidencia',
    icon: 'languages',
    description: 'Traduce y explica un abstract o artículo en inglés, con un glosario de términos médicos.',
    variables: [{ key: 'texto', label: 'Texto o abstract en inglés', placeholder: 'Pega aquí el abstract…', long: true }],
    template: `Te comparto un texto médico en inglés:

{{texto}}

1. Tradúcelo al español médico de forma natural (no literal).
2. Explica en 5 viñetas qué encontró el estudio y por qué importa.
3. Glosario: los 10 términos técnicos más importantes en inglés con su traducción y una definición corta.
4. Dos frases útiles para leer otros artículos similares.`,
    steps: ['Pega el abstract o un fragmento del artículo.'],
    output: 'Traducción, resumen y glosario bilingüe.',
  },
  {
    id: 'plan-semanal',
    title: 'Plan de estudio semanal',
    category: 'productividad',
    icon: 'calendar-range',
    description: 'Un plan semana a semana hasta tu examen, con técnicas basadas en evidencia y repasos programados.',
    variables: [
      { key: 'fecha', label: 'Fecha del examen', placeholder: NEXT_ENURM, default: NEXT_ENURM },
      { key: 'horas', label: 'Horas por día', placeholder: '2', default: '2' },
      { key: 'debiles', label: 'Áreas débiles', placeholder: 'pediatría y salud pública' },
    ],
    template: `Diseña un plan de estudio para el ENURM. Examen: {{fecha}}. Disponibilidad: {{horas}} horas por día. Áreas débiles: {{debiles}}.

Incluye:
- Fases (fundamentos, consolidación, repaso intensivo y recta final) con fechas.
- Distribución de especialidades según su peso en el examen y mis debilidades.
- Una semana tipo en tabla (días × bloques) que combine preguntas, repetición espaciada, intercalado de temas y un simulacro semanal.
- Repasos programados de lo aprendido (1 día, 1 semana, 1 mes).
- Un día de descanso por semana y señales de agotamiento a vigilar.
- Indicadores para saber si voy bien (precisión por especialidad, simulacros).`,
    steps: ['Completa tus datos.', 'Compáralo con "Mi plan" en MedLogic, que se ajusta automáticamente a tus resultados.'],
    output: 'Plan por fases con semana tipo, repasos e indicadores.',
    related: { label: 'Ver Mi plan', to: '/plan' },
  },
  {
    id: 'examen-oral',
    title: 'Pase de visita / examen oral',
    category: 'preguntas',
    icon: 'graduation-cap',
    description: 'La IA actúa como médico de planta que te pregunta en el pase de visita, sube la dificultad y te da retroalimentación.',
    variables: [{ key: 'tema', label: 'Tema', placeholder: 'Sepsis y shock séptico' }],
    template: `Actúa como un médico de planta exigente pero justo durante el pase de visita. Tema: «{{tema}}».

- Hazme preguntas orales de una en una, como en un hospital docente.
- Empieza fácil y sube la dificultad si respondo bien.
- Después de cada respuesta dame retroalimentación breve: correcto, incompleto o incorrecto, y qué faltó.
- Tras 10 preguntas, dame una calificación, mis puntos débiles y 3 lecturas recomendadas (guías con año).
${SAFE}`,
    steps: ['Responde como lo harías en voz alta frente a tu equipo.', 'Con el modo de voz de la IA es aún más realista.'],
    output: 'Simulación de pase de visita con calificación final.',
  },
  {
    id: 'podcast',
    title: 'Repaso en audio (guion de pódcast)',
    category: 'productividad',
    icon: 'mic',
    description: 'Convierte un tema en un diálogo de pódcast para escuchar en la guagua o el carro.',
    variables: [
      { key: 'tema', label: 'Tema', placeholder: 'Anemias' },
      { key: 'minutos', label: 'Duración (minutos)', placeholder: '10', default: '10' },
    ],
    template: `Escribe el guion de un pódcast de {{minutos}} minutos sobre «{{tema}}» para preparar el ENURM, en forma de diálogo entre una residente experta y un interno curioso.

- Tono cercano y claro, con ejemplos clínicos.
- Repite los 5 datos clave de forma natural a lo largo del episodio.
- Incluye 3 preguntas rápidas al oyente con una pausa antes de la respuesta.
- Termina con un resumen de 30 segundos.
${SAFE}`,
    steps: ['Pide el guion.', 'Escúchalo con la función de lectura en voz alta de tu teléfono o con el modo de voz de la IA.'],
    output: 'Guion de audio listo para escuchar.',
  },
  {
    id: 'bienestar',
    title: 'Ansiedad antes del examen',
    category: 'personal',
    icon: 'heart-handshake',
    description: 'Estrategias prácticas para manejar el estrés del ENURM y un plan para el día del examen.',
    variables: [{ key: 'situacion', label: '¿Cómo te sientes?', placeholder: 'Me bloqueo en los simulacros y duermo mal', long: true }],
    template: `Me estoy preparando para el ENURM y me siento así: {{situacion}}

Actúa como un coach de rendimiento académico con base en psicología. Dame:
1. Técnicas breves con evidencia (respiración, reestructuración de pensamientos, exposición gradual con simulacros, higiene del sueño).
2. Un plan para la semana previa y para el día del examen.
3. Frases útiles para cuando me bloquee en una pregunta.
4. Señales de alerta de que debo buscar ayuda profesional.

No sustituyes a un profesional de salud mental: si detectas señales de riesgo, recomiéndame buscar ayuda.`,
    steps: ['Describe con sinceridad cómo te sientes.', 'Si el malestar es intenso o persistente, busca apoyo profesional.'],
    output: 'Técnicas, plan del día del examen y señales de alerta.',
  },
]

export const PROMPT_TOOLS = [
  { id: 'chatgpt', name: 'ChatGPT', url: (q: string) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`, prefill: true },
  { id: 'claude', name: 'Claude', url: (q: string) => `https://claude.ai/new?q=${encodeURIComponent(q)}`, prefill: true },
  { id: 'gemini', name: 'Gemini', url: () => 'https://gemini.google.com/app', prefill: false },
  { id: 'copilot', name: 'Copilot', url: () => 'https://copilot.microsoft.com/', prefill: false },
] as const

/** Rellena {{clave}} con los valores; los vacíos quedan como [clave] para que se noten. */
export function fillPrompt(p: Pick<PromptItem, 'template' | 'variables'>, values: Record<string, string>): string {
  let out = p.template
  for (const v of p.variables) {
    const val = (values[v.key] ?? '').trim() || v.default || `[${v.label.toLowerCase()}]`
    out = out.split(`{{${v.key}}}`).join(val)
  }
  return out
}
