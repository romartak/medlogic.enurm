import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

// public/theme-init.js decide si se muestra «Ábrelo en Safari». Se ejecuta aquí tal cual, con un navegador de mentira.
const SCRIPT = readFileSync('public/theme-init.js', 'utf8')
const GATE = readFileSync('public/inapp-gate.js', 'utf8')

const IG_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22A3354 Instagram 350.0.0.0.0 (iPhone16,1)'
const FB_ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0]'
const TIKTOK = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_36.1.0 BytedanceWebview/d8a21c6'
const SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const CHROME = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36'

function run(userAgent: string, skipped = false) {
  const classes = new Set<string>()
  const win: Record<string, unknown> = {}
  runInNewContext(SCRIPT, {
    window: win,
    navigator: { userAgent },
    localStorage: { getItem: () => null },
    sessionStorage: { getItem: () => (skipped ? '1' : null) },
    matchMedia: () => ({ matches: false }),
    document: {
      documentElement: { classList: { add: (c: string) => classes.add(c) } },
    },
  })
  return { gate: win.__inappGate === true, classes }
}

describe('pantalla «Ábrelo en Safari»', () => {
  it('se activa en Instagram, Facebook y TikTok', () => {
    for (const ua of [IG_IOS, FB_ANDROID, TIKTOK]) {
      const r = run(ua)
      expect(r.gate).toBe(true)
      expect(r.classes.has('inapp')).toBe(true)
    }
  })
  it('no se activa en Safari ni en Chrome', () => {
    for (const ua of [SAFARI, CHROME]) {
      const r = run(ua)
      expect(r.gate).toBe(false)
      expect(r.classes.has('inapp')).toBe(false)
    }
  })
  it('no vuelve a salir si la persona ya eligió continuar', () => {
    expect(run(IG_IOS, true).gate).toBe(false)
  })
  it('el script de la pantalla no hace nada si no se activó el detector', () => {
    const doc = { documentElement: { appendChild: () => { throw new Error('no debe tocar la página') } }, createElement: () => { throw new Error('no debe tocar la página') } }
    expect(() => runInNewContext(GATE, { window: {}, navigator: { userAgent: SAFARI }, document: doc })).not.toThrow()
  })
  it('la pantalla ofrece Chrome en Android y Safari en iPhone', () => {
    expect(GATE).toContain("var browser = ios ? 'Safari' : 'Chrome'")
    expect(GATE).toContain('package=com.android.chrome')
  })
})
