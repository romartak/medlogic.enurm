import { describe, expect, it } from 'vitest'
import { welcomeSteps } from './welcome'

describe('welcomeSteps', () => {
  it('pregunta todo lo que falta', () => {
    expect(welcomeSteps({ examYear: null, university: null })).toEqual(['intro', 'name', 'exam', 'university'])
  })
  it('omite lo que ya se sabe', () => {
    expect(welcomeSteps({ examYear: 2027, university: null })).toEqual(['intro', 'name', 'university'])
    expect(welcomeSteps({ examYear: null, university: 'uasd' })).toEqual(['intro', 'name', 'exam'])
    expect(welcomeSteps({ examYear: 2027, university: 'uasd' })).toEqual(['intro', 'name'])
  })
})
