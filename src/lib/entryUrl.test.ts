import { describe, expect, it } from 'vitest'
import { entryRedirect } from './entryUrl'

describe('entryRedirect', () => {
  it('no toca la raíz, ni con ?code= de Google', () => {
    expect(entryRedirect({ pathname: '/', search: '?code=abc', hash: '' }, './')).toBeNull()
    expect(entryRedirect({ pathname: '/', search: '', hash: '' }, './')).toBeNull()
    expect(entryRedirect({ pathname: '/index.html', search: '?code=abc', hash: '' }, './')).toBeNull()
    expect(entryRedirect({ pathname: '/', search: '?code=abc', hash: '' }, '/')).toBeNull()
  })
  it('no toca direcciones que ya traen ruta con #', () => {
    expect(entryRedirect({ pathname: '/', search: '', hash: '#/inicio' }, './')).toBeNull()
  })
  it('pasa una ruta inexistente al hash sin perder el «?»', () => {
    expect(entryRedirect({ pathname: '/viejo', search: '', hash: '' }, './')).toBe('./#/viejo')
    expect(entryRedirect({ pathname: '/viejo', search: '?a=1', hash: '' }, './')).toBe('./?a=1#/viejo')
  })
})
