/**
 * Navegadores integrados de redes sociales (Instagram, Facebook, TikTok...). Ahí no se puede instalar la
 * plataforma como app, el inicio de sesión y las cookies fallan con más frecuencia y se pierde el progreso
 * guardado. Se detectan por el user agent para pedir que se abra en el navegador del teléfono.
 */
const IN_APP = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|musical_ly|Bytedance|TikTok|Snapchat|LinkedInApp|Pinterest|Line\/|Twitter|MicroMessenger/i

export function isInAppBrowser(ua: string = typeof navigator === 'undefined' ? '' : navigator.userAgent): boolean {
  return IN_APP.test(ua)
}

export type MobileOs = 'ios' | 'android' | 'other'

export function mobileOs(ua: string = typeof navigator === 'undefined' ? '' : navigator.userAgent): MobileOs {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'other'
}

/**
 * Enlace que en Android abre Chrome directamente (intent). En iPhone no existe un equivalente:
 * Instagram solo deja salir desde su menú «⋯».
 */
export function androidChromeIntent(href: string): string {
  const u = new URL(href)
  return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.replace(':', '')};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(href)};end`
}
