import { describe, expect, it } from 'vitest'
import { AVATARS, avatarDef, isAvatarId } from './Avatar'

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
    expect(isAvatarId('constructor')).toBe(false)
  })

  it('hay 36 diseños y los de la versión anterior siguen mostrando uno', () => {
    expect(AVATARS.length).toBe(36)
    for (const old of ['aurora', 'ondas', 'montes', 'orbita', 'mosaico', 'sol', 'hojas', 'diamantes', 'burbujas', 'rayas', 'pulso', 'cruz']) expect(avatarDef(old)).toBeDefined()
  })
})
