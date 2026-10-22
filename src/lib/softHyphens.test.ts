import { describe, expect, it } from 'vitest'
import { softHyphens } from './utils'

const show = (s: string) => softHyphens(s).replace(/­/g, '-')

describe('softHyphens', () => {
  it('corta por sílabas las palabras largas', () => {
    expect(show('Organofosforados')).toBe('Or-ga-no-fos-fo-ra-dos')
    expect(show('Benzodiacepinas')).toBe('Ben-zo-dia-ce-pi-nas')
    expect(show('Betabloqueadores')).toBe('Be-ta-blo-quea-do-res')
    expect(show('N-acetilcisteína')).toBe('N-ace-til-cis-teína')
  })
  it('deja intactas las palabras cortas', () => {
    expect(show('Naloxona y VSR')).toBe('Naloxona y VSR')
  })
})
