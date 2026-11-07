import { describe, expect, it } from 'vitest'
import { formatCode, inviteLink, inviteText, nudgeText, parseInviteCode, studyStatus } from './buddy'

describe('códigos de compañero', () => {
  it('acepta el código con guion, espacios y minúsculas', () => {
    expect(parseInviteCode('abcd-2345')).toBe('ABCD2345')
    expect(parseInviteCode(' ABCD 2345 ')).toBe('ABCD2345')
    expect(parseInviteCode('ABCD2345')).toBe('ABCD2345')
  })
  it('rechaza lo que no es un código: largo, letras confusas o vacío', () => {
    expect(parseInviteCode('ABC')).toBeNull()
    expect(parseInviteCode('ABCD23456')).toBeNull()
    expect(parseInviteCode('ABCD0OI1')).toBeNull() // 0, O, I y 1 no existen en el alfabeto
    expect(parseInviteCode('')).toBeNull()
    expect(parseInviteCode(null)).toBeNull()
    expect(parseInviteCode('<script>x')).toBeNull()
  })
  it('da formato legible y arma el enlace de invitación', () => {
    expect(formatCode('ABCD2345')).toBe('ABCD-2345')
    expect(inviteLink('ABCD2345', 'https://x.app')).toBe('https://x.app/#/companero?codigo=ABCD2345')
    const t = inviteText('ABCD2345', 'https://x.app')
    expect(t).toContain('ABCD-2345')
    expect(t).toContain('https://x.app/#/companero?codigo=ABCD2345')
  })
  it('el mensaje de ánimo usa el nombre si lo hay', () => {
    expect(nudgeText('Ana')).toContain('Ana')
    expect(nudgeText('Compañero')).not.toContain('Compañero')
  })
})

describe('estado de estudio del compañero', () => {
  const today = '2026-11-07'
  it('dice si estudió hoy, ayer o hace cuántos días', () => {
    expect(studyStatus({ estudio_hoy: true, ultimo_estudio: today }, today)).toBe('Ya estudió hoy')
    expect(studyStatus({ estudio_hoy: false, ultimo_estudio: '2026-11-06' }, today)).toBe('Estudió ayer')
    expect(studyStatus({ estudio_hoy: false, ultimo_estudio: '2026-11-03' }, today)).toBe('Hace 4 días sin estudiar')
    expect(studyStatus({ estudio_hoy: false, ultimo_estudio: null }, today)).toBe('Aún no ha estudiado')
  })
})
