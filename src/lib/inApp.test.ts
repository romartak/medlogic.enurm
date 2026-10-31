import { describe, expect, it } from 'vitest'
import { androidChromeIntent, isInAppBrowser, mobileOs } from './inApp'

const IG_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22A3354 Instagram 350.0.0.0.0 (iPhone16,1)'
const FB_ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0]'
const SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const CHROME = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36'

describe('navegador integrado', () => {
  it('detecta Instagram y Facebook', () => {
    expect(isInAppBrowser(IG_IOS)).toBe(true)
    expect(isInAppBrowser(FB_ANDROID)).toBe(true)
  })
  it('no marca Safari ni Chrome', () => {
    expect(isInAppBrowser(SAFARI)).toBe(false)
    expect(isInAppBrowser(CHROME)).toBe(false)
  })
  it('reconoce el sistema', () => {
    expect(mobileOs(IG_IOS)).toBe('ios')
    expect(mobileOs(FB_ANDROID)).toBe('android')
    expect(mobileOs('Mozilla/5.0 (X11; Linux x86_64)')).toBe('other')
  })
  it('arma el enlace para abrir Chrome en Android', () => {
    const link = androidChromeIntent('https://medlogicenurm.vercel.app/#/inicio')
    expect(link).toContain('intent://medlogicenurm.vercel.app/#Intent;scheme=https;package=com.android.chrome')
    expect(link).toContain('S.browser_fallback_url=https%3A%2F%2Fmedlogicenurm.vercel.app%2F%23%2Finicio')
  })
})
