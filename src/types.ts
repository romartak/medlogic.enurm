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
  explanation?: string
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

export interface Settings {
  name: string
  theme: Theme
  dailyGoal: number
  examDate: string | null
  sound: boolean
  shuffleOptions: boolean
  reduceMotion: boolean
}
