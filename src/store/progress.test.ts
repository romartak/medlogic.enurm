import { beforeEach, describe, expect, it } from 'vitest'
import { useProgress } from './progress'
import { useToasts } from './toasts'
import { addDays, dayKey } from '@/lib/utils'
import type { Question } from '@/types'

const q: Question = { id: 'q1', specialty: 'cardiologia', stem: '¿?', options: ['a', 'b'], answer: 0 }
const day = { answered: 40, correct: 30, cards: 0, minutes: 60 }

describe('avisos de logros', () => {
  beforeEach(() => {
    useProgress.getState().resetProgress()
    useToasts.setState({ toasts: [] })
  })

  it('un logro nuevo da un aviso con su nombre', () => {
    useProgress.getState().recordAnswer(q, 0)
    const toasts = useToasts.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0]).toMatchObject({ kind: 'achievement', title: 'Primer paso' })
    expect(toasts[0].count).toBeUndefined()
  })

  it('varios logros a la vez se juntan en un solo aviso', () => {
    // Progreso importado sin logros: 3 días seguidos y más de 100 respuestas.
    const today = new Date()
    useProgress.setState({ activity: { [dayKey(addDays(today, -1))]: day, [dayKey(addDays(today, -2))]: day, [dayKey(addDays(today, -3))]: day } })
    useProgress.getState().recordAnswer(q, 0)
    const toasts = useToasts.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].count).toBe(3)
    expect(toasts[0].title).toBe('Primer paso, Centenario y Constancia')
    expect(toasts[0].body).toBe('+170 XP')
    expect(Object.keys(useProgress.getState().achievements).sort()).toEqual(['answers-100', 'first-answer', 'streak-3'])
  })
})
