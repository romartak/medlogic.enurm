export interface Reference {
  citation: string
  doi?: string
  url?: string
  kind?: 'guia' | 'articulo' | 'libro' | 'revision'
}

/** Una pregunta del banco. Este es el formato al que se normaliza cualquier base de datos importada. */
export interface Question {
  /** Identificador único y estable (p. ej. "2019-045"). */
  id: string
  /** Año del ENURM en que salió la pregunta. */
  year?: number
  /** Id de especialidad (ver src/data/specialties.ts). Las desconocidas se aceptan tal cual. */
  specialty: string
  /** Tema dentro de la especialidad (p. ej. "Insuficiencia cardíaca"). */
  topic?: string
  /** Enunciado. */
  stem: string
  /** Opciones de respuesta (2 a 6). */
  options: string[]
  /** Índice (0-based) de la opción correcta. */
  answer: number
  /** Explicación general de la respuesta correcta. */
  explanation?: string
  /** Por qué cada opción es correcta o incorrecta (mismo orden que `options`). */
  optionExplanations?: string[]
  /** Procesos fisiológicos / fisiopatológicos involucrados. */
  pathophysiology?: string
  keyPoints?: string[]
  /** Bibliografía (guías, artículos, libros) con DOI o URL cuando existe. */
  references?: Reference[]
  /** Referencia breve heredada (texto libre). */
  reference?: string
  /** 1 = fácil, 2 = media, 3 = difícil. */
  difficulty?: 1 | 2 | 3
  tags?: string[]
  /** URL de imagen opcional (ECG, radiografía…). */
  image?: string
  /** true si es una pregunta de ejemplo incluida con la plataforma. */
  sample?: boolean
}

export interface Specialty {
  id: string
  name: string
  short: string
  /** Color de acento en formato hex. */
  color: string
  icon: string
  /** Peso relativo aproximado en el examen; se usa para el plan de estudio. */
  weight: number
  aliases: string[]
}

export interface QuestionAttempt {
  seen: number
  correct: number
  lastCorrect: boolean
  lastAt: number
  lastChoice: number
}

export interface DayActivity {
  answered: number
  correct: number
  cards: number
  minutes: number
  /** Preguntas respondidas por especialidad ese día (para el plan diario). */
  bySpec?: Record<string, number>
  /** Preguntas previamente falladas que se volvieron a responder. */
  reviewed?: number
  /** Partidas jugadas. */
  games?: number
}

export type StudyMethod = 'preguntas' | 'flashcards' | 'guias' | 'simulacros' | 'juegos'
export type StudentRole = 'estudiante' | 'interno' | 'medico-general' | 'egresado'

/** Respuestas del cuestionario inicial. */
export interface StudyProfile {
  completed: boolean
  skipped: boolean
  role: StudentRole | null
  examYear: number | null
  /** 1–12, o null si aún no lo sabe. */
  examMonth: number | null
  residency: string | null
  /** Universidad (id de data/universities.ts) y nombre escrito si es «otra» o extranjera. */
  university: string | null
  universityOther: string
  /** Días de la semana en que estudia (0 = domingo). */
  studyDays: number[]
  minutesPerDay: number
  /** Confianza autoevaluada por gran área: 1 = baja, 2 = media, 3 = alta. */
  confidence: Record<string, 1 | 2 | 3>
  methods: StudyMethod[]
  updatedAt: number
}

export type PlanTaskKind = 'questions' | 'flashcards' | 'guide' | 'review' | 'exam' | 'game' | 'rest'

export interface PlanTask {
  id: string
  kind: PlanTaskKind
  title: string
  detail: string
  minutes: number
  /** Meta numérica (preguntas, tarjetas…) cuando aplica. */
  target: number
  specialty?: string
  guideId?: string
  link: string
  optional?: boolean
}

export type PlanPhase = 'fundamentos' | 'consolidacion' | 'intensivo' | 'final' | 'sin-fecha' | 'examen' | 'pasado'

export interface DailyPlan {
  date: string
  phase: PlanPhase
  restDay: boolean
  focus: string[]
  minutes: number
  message: string
  tasks: PlanTask[]
}

export interface ExamResult {
  id: string
  title: string
  date: number
  durationSec: number
  total: number
  correct: number
  bySpecialty: Record<string, { total: number; correct: number }>
  questionIds: string[]
  answers: (number | null)[]
}

export interface Flashcard {
  id: string
  deck: string
  front: string
  back: string
  specialty?: string
  /** true para tarjetas creadas por el usuario. */
  custom?: boolean
}

export interface FlashDeck {
  id: string
  name: string
  description: string
  specialty?: string
  color: string
  icon: string
}

/** Estado SM-2 de una tarjeta. */
export interface SrsState {
  ease: number
  interval: number
  reps: number
  due: number
  lapses: number
  lastReview: number
}

export type SrsGrade = 0 | 1 | 2 | 3 // otra vez, difícil, bien, fácil

export interface GuideSection {
  heading: string
  body?: string
  bullets?: string[]
  table?: { head: string[]; rows: string[][] }
  pearl?: string
  warning?: string
}

/** Pregunta corta de práctica de las páginas de habilidades clínicas (ATLS, espirometría…). */
export interface QuizItem {
  q: string
  options: string[]
  /** Índice de la correcta en `options`. */
  answer: number
  why: string
}

export interface Guide {
  id: string
  title: string
  specialty: string
  summary: string
  minutes: number
  level: 'Básico' | 'Intermedio' | 'Avanzado'
  sections: GuideSection[]
  references: string[]
}

export interface MedicalUpdate {
  id: string
  title: string
  source: string
  date: string
  specialty: string
  summary: string
  keyPoints: string[]
  impact: 'Alto' | 'Medio'
  url?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xp: number
}

export type Theme = 'light' | 'dark' | 'system'

export type Honorific = 'dr' | 'dra' | 'lic' | 'est' | 'none'

export interface Settings {
  /** Nombre o apellido opcional. */
  name: string
  /** Cómo quiere que le llamemos; null si aún no lo eligió. */
  honorific: Honorific | null
  theme: Theme
  dailyGoal: number
  examDate: string | null
  sound: boolean
  shuffleOptions: boolean
  reduceMotion: boolean
  /** En el ranking: salir con primer nombre e inicial (true) o como «Estudiante». */
  rankingShowName: boolean
  /** Foto de perfil elegida (id de AVATARS); null = la inicial. Funciona también sin cuenta. */
  avatar: string | null
}
