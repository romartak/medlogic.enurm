import { describe, expect, it } from 'vitest'
import { countVisit, MIN_VISITS, platformOf, readDismissed, shouldOfferInstall, SNOOZE_DAYS, writeDismissed } from './install'

const mem = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }
}

describe('install', () => {
  it('reconoce la plataforma', () => {
    expect(platformOf('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('ios')
    expect(platformOf('Mozilla/5.0 (Macintosh; Intel Mac OS X)', 5)).toBe('ios')
    expect(platformOf('Mozilla/5.0 (Macintosh; Intel Mac OS X)', 0)).toBe('other')
    expect(platformOf('Mozilla/5.0 (Linux; Android 14)')).toBe('android')
  })

  it('cuenta una visita por sesión, no por recarga', () => {
    const local = mem()
    const s1 = mem()
    expect(countVisit(local, s1)).toBe(1)
    expect(countVisit(local, s1)).toBe(1)
    expect(countVisit(local, mem())).toBe(2)
  })

  it('espera a las visitas mínimas y no insiste tras un «ahora no»', () => {
    const base = { standalone: false, dismissedAt: null }
    expect(shouldOfferInstall({ ...base, visits: MIN_VISITS - 1 })).toBe(false)
    expect(shouldOfferInstall({ ...base, visits: MIN_VISITS })).toBe(true)
    expect(shouldOfferInstall({ ...base, visits: 9, standalone: true })).toBe(false)
    const t = 1_000_000_000_000
    expect(shouldOfferInstall({ visits: 9, standalone: false, dismissedAt: t, now: t + 86_400_000 })).toBe(false)
    expect(shouldOfferInstall({ visits: 9, standalone: false, dismissedAt: t, now: t + (SNOOZE_DAYS + 1) * 86_400_000 })).toBe(true)
  })

  it('guarda y lee el descarte', () => {
    const s = mem()
    expect(readDismissed(s)).toBeNull()
    writeDismissed(s, 123)
    expect(readDismissed(s)).toBe(123)
  })
})
