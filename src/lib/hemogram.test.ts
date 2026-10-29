import { describe, expect, it } from 'vitest'
import { absolute, mentzer, neutropeniaGrade, readHemogram } from './hemogram'

describe('hemograma', () => {
  it('anemia según el sexo (cortes de la OMS)', () => {
    expect(readHemogram({ sex: 'hombre', hb: 12.8 }).anemia).toBe(true)
    expect(readHemogram({ sex: 'mujer', hb: 12.8 }).anemia).toBe(false)
    expect(readHemogram({ sex: 'embarazada', hb: 11.2 }).anemia).toBe(false)
    expect(readHemogram({ sex: 'embarazada', hb: 10.8 }).anemia).toBe(true)
    // Sin anemia no puede salir marcada como baja.
    expect(readHemogram({ sex: 'hombre', hb: 13.2 }).findings[0].flag).toBe('normal')
  })

  it('clasifica la anemia por el VCM', () => {
    expect(readHemogram({ sex: 'mujer', hb: 9, mcv: 68 }).anemiaType).toBe('microcítica')
    expect(readHemogram({ sex: 'mujer', hb: 9, mcv: 90 }).anemiaType).toBe('normocítica')
    expect(readHemogram({ sex: 'mujer', hb: 9, mcv: 112 }).anemiaType).toBe('macrocítica')
    expect(readHemogram({ sex: 'mujer', hb: 13, mcv: 70 }).anemiaType).toBeUndefined()
  })

  it('ferropenia frente a rasgo talasémico', () => {
    const fe = readHemogram({ sex: 'mujer', hb: 9.1, mcv: 68, rdw: 18.5, rbc: 4.1 })
    expect(fe.summary[0]).toMatch(/ferropenia/)
    const tal = readHemogram({ sex: 'hombre', hb: 11.8, mcv: 64, rdw: 13.5, rbc: 5.9 })
    expect(mentzer(64, 5.9)).toBe(10.8)
    expect(tal.summary[0]).toMatch(/talasémico/)
  })

  it('reticulocitos altos en anemia normocítica apuntan a hemólisis o sangrado', () => {
    expect(readHemogram({ sex: 'hombre', hb: 8.9, mcv: 92, retic: 9 }).summary[0]).toMatch(/hemólisis/)
  })

  it('usa valores absolutos para la fórmula', () => {
    expect(absolute(2000, 20)).toBe(400)
    const r = readHemogram({ sex: 'hombre', hb: 14, wbc: 2000, neutPct: 20 })
    expect(r.findings.find((f) => f.key === 'neut')?.note).toBe('Neutropenia grave')
    expect(r.summary[0]).toMatch(/neutropenia febril/)
  })

  it('grados de neutropenia en sus límites', () => {
    expect([1500, 1499, 1000, 999, 500, 499].map(neutropeniaGrade)).toEqual([null, 'leve', 'leve', 'moderada', 'moderada', 'grave'])
  })

  it('detecta pancitopenia y la pone primero', () => {
    const r = readHemogram({ sex: 'hombre', hb: 7.2, mcv: 96, wbc: 1800, plt: 40000 })
    expect(r.summary[0]).toMatch(/Pancitopenia/)
  })

  it('plaquetas', () => {
    expect(readHemogram({ sex: 'mujer', hb: 13, plt: 18000 }).summary[0]).toMatch(/sangrado espontáneo/)
    expect(readHemogram({ sex: 'mujer', hb: 13, plt: 600000 }).summary[0]).toMatch(/reactiva/)
  })

  it('normal si nada se sale', () => {
    expect(readHemogram({ sex: 'hombre', hb: 15, mcv: 90, wbc: 7000, neutPct: 60, lymphPct: 30, plt: 250000 }).summary).toEqual(['Sin alteraciones en los valores ingresados.'])
  })
})
