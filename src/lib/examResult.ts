import type { ExamResult, Question } from '@/types'
import { uid } from '@/lib/utils'

/** Califica un simulacro: aciertos totales y por especialidad, con la duración real (sin pasar del tiempo límite). */
export function gradeExam(args: { title: string; questions: Question[]; answers: (number | null)[]; startedAt: number; totalSec: number; now?: number }): ExamResult {
  const { title, questions, answers, startedAt, totalSec } = args
  const now = args.now ?? Date.now()
  const bySpecialty: ExamResult['bySpecialty'] = {}
  let correct = 0
  questions.forEach((q, i) => {
    const b = (bySpecialty[q.specialty] ??= { total: 0, correct: 0 })
    b.total++
    if (answers[i] === q.answer) {
      b.correct++
      correct++
    }
  })
  return {
    id: uid('ex'),
    title,
    date: now,
    durationSec: Math.min(totalSec, Math.round((now - startedAt) / 1000)),
    total: questions.length,
    correct,
    bySpecialty,
    questionIds: questions.map((q) => q.id),
    answers,
  }
}
