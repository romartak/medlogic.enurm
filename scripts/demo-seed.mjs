/**
 * Progreso de mentira para grabar los videos de la portada: una estudiante con 6 días de racha,
 * 243 preguntas respondidas (72 % de aciertos) y los logros que eso ya le habría dado.
 * Sin esos logros guardados, la primera respuesta del video los desbloqueaba todos de golpe.
 */
import { readFileSync } from 'node:fs'

const DAY = 86_400_000

function dayKey(t) {
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Devuelve las claves de localStorage (`medlogic-progress`) listas para inyectar antes de cargar la app. */
export function demoStorage({ now = Date.now(), examYear } = {}) {
  const raw = JSON.parse(readFileSync(new URL('../public/data/questions.json', import.meta.url), 'utf8'))
  const bank = Array.isArray(raw) ? raw : raw.questions

  // 243 respondidas, 174 correctas, repartidas en los 6 días anteriores a hoy (hoy aún no estudia).
  const answered = [44, 38, 41, 36, 42, 42]
  const correct = [31, 27, 30, 26, 30, 30]
  const activity = {}
  answered.forEach((n, i) => {
    activity[dayKey(now - (6 - i) * DAY)] = { answered: n, correct: correct[i], cards: 20, minutes: 70 + i * 4 }
  })

  // Las preguntas ya vistas salen del final del banco para que la práctica del video empiece con preguntas nuevas.
  const seen = bank.slice(-243)
  const attempts = {}
  seen.forEach((q, i) => {
    const ok = i < 174
    attempts[q.id] = { seen: 1, correct: ok ? 1 : 0, lastCorrect: ok, lastAt: now - 2 * DAY, lastChoice: ok ? q.answer : (q.answer + 1) % q.options.length }
  })

  // Todo logro que el video pueda desbloquear ya está ganado: así no aparecen avisos encima de la pantalla.
  const unlocked = ['first-answer', 'answers-100', 'streak-3', 'streak-7', 'first-exam', 'exam-80', 'perfect-10', 'all-specialties', 'plan-1', 'cards-50']
  const achievements = Object.fromEntries(unlocked.map((id) => [id, now - 3 * DAY]))

  const state = {
    attempts,
    activity,
    achievements,
    xp: 240 + 50 * 5 * 4, // nivel 5 con 240 de 500 XP
    correctRun: 0,
    bestRun: 12,
    totalCardsReviewed: 120,
    settings: { name: 'Pichardo', honorific: 'dra', theme: 'light', dailyGoal: 40, examDate: null, sound: false, shuffleOptions: false, reduceMotion: false, rankingShowName: true, avatar: null },
    profile: {
      completed: true,
      skipped: false,
      role: 'interno',
      examYear: examYear ?? new Date(now).getFullYear() + 1,
      examMonth: 3,
      residency: null,
      university: null,
      universityOther: '',
      studyDays: [0, 1, 2, 3, 4, 5, 6],
      minutesPerDay: 90,
      confidence: {},
      methods: ['preguntas', 'flashcards', 'guias', 'simulacros'],
      updatedAt: now - 7 * DAY,
    },
  }
  return { 'medlogic-progress': JSON.stringify({ state, version: 1 }) }
}
