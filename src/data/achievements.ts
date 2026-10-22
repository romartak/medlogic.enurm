import type { Achievement } from '@/types'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-answer', title: 'Primer paso', description: 'Responde tu primera pregunta.', icon: 'footprints', xp: 20 },
  { id: 'answers-100', title: 'Centenario', description: 'Responde 100 preguntas.', icon: 'target', xp: 100 },
  { id: 'answers-500', title: 'Maratonista', description: 'Responde 500 preguntas.', icon: 'rocket', xp: 300 },
  { id: 'answers-1000', title: 'Mil batallas', description: 'Responde 1 000 preguntas.', icon: 'crown', xp: 600 },
  { id: 'streak-3', title: 'Constancia', description: 'Estudia 3 días seguidos.', icon: 'flame', xp: 50 },
  { id: 'streak-7', title: 'Semana perfecta', description: 'Estudia 7 días seguidos.', icon: 'flame', xp: 150 },
  { id: 'streak-30', title: 'Disciplina de residente', description: 'Estudia 30 días seguidos.', icon: 'medal', xp: 500 },
  { id: 'first-exam', title: 'Bautismo de fuego', description: 'Completa tu primer simulacro.', icon: 'graduation-cap', xp: 80 },
  { id: 'exam-80', title: 'Sobresaliente', description: 'Obtén 80% o más en un simulacro de al menos 20 preguntas.', icon: 'award', xp: 200 },
  { id: 'cards-50', title: 'Memoria de elefante', description: 'Repasa 50 flashcards.', icon: 'layers', xp: 60 },
  { id: 'cards-300', title: 'Repetición espaciada', description: 'Repasa 300 flashcards.', icon: 'brain', xp: 200 },
  { id: 'game-master', title: 'Jugador clínico', description: 'Juega a los 4 juegos.', icon: 'gamepad-2', xp: 80 },
  { id: 'all-specialties', title: 'Médico integral', description: 'Responde preguntas de 10 especialidades distintas.', icon: 'stethoscope', xp: 120 },
  { id: 'guide-reader', title: 'Lector voraz', description: 'Completa 5 guías de estudio.', icon: 'book-open', xp: 100 },
  { id: 'plan-1', title: 'Día cumplido', description: 'Completa todas las tareas de tu plan diario.', icon: 'target', xp: 50 },
  { id: 'plan-7', title: 'Semana de plan', description: 'Completa tu plan diario 7 veces.', icon: 'medal', xp: 150 },
  { id: 'plan-30', title: 'Método de residente', description: 'Completa tu plan diario 30 veces.', icon: 'crown', xp: 500 },
  { id: 'perfect-10', title: 'Racha perfecta', description: 'Acierta 10 preguntas seguidas.', icon: 'zap', xp: 80 },
]
