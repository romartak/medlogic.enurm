import { describe, expect, it } from 'vitest'
import { addressName } from './utils'

describe('addressName', () => {
  it('antepone el tratamiento elegido al nombre', () => {
    expect(addressName({ name: 'Pichardo', honorific: 'dr' })).toBe('Dr. Pichardo')
    expect(addressName({ name: 'Pichardo', honorific: 'dra' })).toBe('Dra. Pichardo')
    expect(addressName({ name: 'Pichardo', honorific: 'lic' })).toBe('Lic. Pichardo')
    expect(addressName({ name: 'Pichardo', honorific: 'est' })).toBe('Est. Pichardo')
  })

  it('con N/A o sin tratamiento deja solo el nombre', () => {
    expect(addressName({ name: ' Ana ', honorific: 'none' })).toBe('Ana')
    expect(addressName({ name: 'Ana', honorific: null })).toBe('Ana')
  })

  it('sin nombre: «doctor/doctora» para esos tratos y nada para los demás', () => {
    expect(addressName({ name: '', honorific: 'dr' })).toBe('doctor')
    expect(addressName({ name: '', honorific: 'dra' })).toBe('doctora')
    expect(addressName({ name: '', honorific: 'lic' })).toBe('')
    expect(addressName({ name: '  ', honorific: 'est' })).toBe('')
    expect(addressName({ name: '', honorific: 'none' })).toBe('')
  })
})
