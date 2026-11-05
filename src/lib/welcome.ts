import type { StudyProfile } from '@/types'

export type WelcomeStep = 'intro' | 'name' | 'exam' | 'university'

/** Pasos del cuestionario de bienvenida: solo se pregunta lo que aún falta (el nombre siempre se confirma). */
export function welcomeSteps(profile: Pick<StudyProfile, 'examYear' | 'university'>): WelcomeStep[] {
  const steps: WelcomeStep[] = ['intro', 'name']
  if (profile.examYear == null) steps.push('exam')
  if (!profile.university) steps.push('university')
  return steps
}
