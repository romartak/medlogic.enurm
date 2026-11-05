import { describe, expect, it } from 'vitest'
import { googleIdentity, isNewAccount, parseOAuthMark } from './oauth'

const now = 1_800_000_000_000

describe('parseOAuthMark', () => {
  it('acepta una ruta interna reciente', () => {
    expect(parseOAuthMark(JSON.stringify({ to: '/practica', t: now - 5000 }), now)).toEqual({ to: '/practica' })
  })
  it('rechaza lo vacío, lo roto y lo viejo', () => {
    expect(parseOAuthMark(null, now)).toBeNull()
    expect(parseOAuthMark('no-json', now)).toBeNull()
    expect(parseOAuthMark(JSON.stringify({ to: '/inicio', t: now - 11 * 60 * 1000 }), now)).toBeNull()
  })
  it('nunca acepta direcciones externas', () => {
    expect(parseOAuthMark(JSON.stringify({ to: 'https://malo.com', t: now }), now)).toBeNull()
    expect(parseOAuthMark(JSON.stringify({ to: '//malo.com', t: now }), now)).toBeNull()
  })
})

describe('isNewAccount', () => {
  it('detecta cuentas recién creadas', () => {
    expect(isNewAccount(new Date(now - 60_000).toISOString(), now)).toBe(true)
    expect(isNewAccount(new Date(now - 2 * 60 * 60 * 1000).toISOString(), now)).toBe(false)
    expect(isNewAccount(undefined, now)).toBe(false)
  })
})

describe('googleIdentity', () => {
  it('toma nombre y correo de Google', () => {
    expect(googleIdentity({ email: 'a@b.com', user_metadata: { full_name: 'Ana María Pérez' } })).toEqual({ full: 'Ana María Pérez', first: 'Ana', email: 'a@b.com' })
  })
  it('prefiere given_name y tolera la falta de datos', () => {
    expect(googleIdentity({ user_metadata: { name: 'Juan Carlos Gil', given_name: 'Juan Carlos' } }).first).toBe('Juan Carlos')
    expect(googleIdentity(null)).toEqual({ full: '', first: '', email: '' })
  })
})
