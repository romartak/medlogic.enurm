import { describe, expect, it } from 'vitest'
import { AVATARS, isAvatarId } from './Avatar'

describe('fotos de perfil', () => {
  it('hay al menos 10 diseños, con ids y nombres únicos', () => {
    expect(AVATARS.length).toBeGreaterThanOrEqual(10)
    expect(new Set(AVATARS.map((a) => a.id)).size).toBe(AVATARS.length)
    expect(new Set(AVATARS.map((a) => a.label)).size).toBe(AVATARS.length)
  })

  it('solo se aceptan ids conocidos (lo guardado en la cuenta no es de fiar)', () => {
    expect(isAvatarId(AVATARS[0].id)).toBe(true)
    expect(isAvatarId('<script>')).toBe(false)
    expect(isAvatarId(undefined)).toBe(false)
    expect(isAvatarId(42)).toBe(false)
  })
})
