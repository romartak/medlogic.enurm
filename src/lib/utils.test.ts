import { describe, expect, it } from 'vitest'
import { addressName, cleanName } from './utils'

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

describe('nombres sin repetir ni minúsculas', () => {
  it('no repite el título que ya viene escrito en el nombre', () => {
    expect(addressName({ name: 'Dr. Sanchez', honorific: 'dr' })).toBe('Dr. Sanchez')
    expect(addressName({ name: 'dr dr. sanchez', honorific: 'dr' })).toBe('Dr. Sanchez')
    expect(addressName({ name: 'Doctora Ana', honorific: 'dra' })).toBe('Dra. Ana')
    expect(addressName({ name: 'Lic. Lic. Pérez', honorific: 'lic' })).toBe('Lic. Pérez')
  })

  it('si escribió el título y no eligió trato, se usa el escrito', () => {
    expect(addressName({ name: 'dra. genao', honorific: null })).toBe('Dra. Genao')
    expect(addressName({ name: 'dr. sanchez', honorific: 'none' })).toBe('Dr. Sanchez')
  })

  it('pone mayúscula inicial en cada palabra y respeta «de», «del»', () => {
    expect(cleanName('  pichardo   de la cruz ')).toBe('Pichardo de la Cruz')
    expect(cleanName('PÉREZ')).toBe('Pérez')
    expect(cleanName('mcDonald')).toBe('McDonald')
    expect(cleanName('ana-maría')).toBe('Ana-maría')
    expect(addressName({ name: 'sanchez', honorific: 'dr' })).toBe('Dr. Sanchez')
  })

  it('un nombre que empieza como un título pero no lo es se conserva', () => {
    expect(cleanName('Estrada')).toBe('Estrada')
    expect(cleanName('Drake')).toBe('Drake')
  })
})
