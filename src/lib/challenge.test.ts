import { describe, expect, it } from 'vitest'
import { CHALLENGE, newChallenge, progressOf, windowDays, withAnswer } from './challenge'
import { addDays } from './utils'

const START = new Date(2026, 10, 2, 9)
const at = (offset: number) => addDays(START, offset)
const fill = (ch: ReturnType<typeof newChallenge>, offset: number, n: number) => {
  let c = ch
  for (let i = 0; i < n; i++) c = withAnswer(c, i % 2 === 0, at(offset))
  return c
}

describe('reto de 7 días', () => {
  it('empieza activo en el día 1', () => {
    const p = progressOf(newChallenge('cirugia', 'Apendicitis aguda', START), START)
    expect(p).toMatchObject({ state: 'activo', windowDay: 1, daysDone: 0, daysLeft: 7, spare: 2 })
  })
  it('un día cuenta solo con 5 preguntas', () => {
    let ch = fill(newChallenge('cirugia', 'x', START), 0, 4)
    expect(progressOf(ch, at(0))).toMatchObject({ daysDone: 0, todayN: 4 })
    ch = withAnswer(ch, true, at(0))
    expect(progressOf(ch, at(0))).toMatchObject({ daysDone: 1, todayN: 5 })
    ch = fill(ch, 0, 3) // más de 5 el mismo día no suman otro día
    expect(progressOf(ch, at(0)).daysDone).toBe(1)
  })
  it('se completa con 5 días cumplidos, aunque sea antes de la semana', () => {
    let ch = newChallenge('cirugia', 'x', START)
    for (const o of [0, 1, 2, 3, 4]) ch = fill(ch, o, CHALLENGE.perDay)
    expect(progressOf(ch, at(4)).state).toBe('completado')
  })
  it('se puede saltar hasta 2 días y aun así completarlo', () => {
    let ch = newChallenge('cirugia', 'x', START)
    for (const o of [0, 2, 3, 5, 6]) ch = fill(ch, o, 5)
    expect(progressOf(ch, at(6)).state).toBe('completado')
  })
  it('vence cuando ya no alcanzan los días, sin esperar al final', () => {
    let ch = fill(newChallenge('cirugia', 'x', START), 0, 5)
    // día 4 sin haber hecho nada más: 1 hecho + 4 días restantes (4,5,6,7) = 5 → aún posible
    expect(progressOf(ch, at(3)).state).toBe('activo')
    // día 5: 1 + 3 = 4 < 5 → ya no se puede
    expect(progressOf(ch, at(4)).state).toBe('vencido')
    ch = newChallenge('cirugia', 'x', START)
    expect(progressOf(ch, at(7)).state).toBe('vencido')
  })
  it('windowDays marca hoy, los días hechos y el futuro', () => {
    let ch = newChallenge('cirugia', 'x', START)
    ch = fill(ch, 0, 5)
    const w = windowDays(ch, at(1))
    expect(w).toHaveLength(7)
    expect(w[0]).toMatchObject({ done: true, isToday: false, future: false })
    expect(w[1]).toMatchObject({ isToday: true, n: 0 })
    expect(w[2].future).toBe(true)
  })
})
