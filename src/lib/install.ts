/**
 * Lógica de «Instalar MedLogic»: cuándo mostrar el aviso y cómo se instala en cada sistema.
 * Va aparte del componente para poder probarla sin navegador.
 */
const VISITS = 'medlogic-visitas'
const DISMISSED = 'medlogic-instalar-descartado'
/** Visitas (sesiones distintas) que hacen falta antes de proponer instalar. */
export const MIN_VISITS = 3
/** Días que se respeta un «Ahora no». */
export const SNOOZE_DAYS = 30

export type InstallPlatform = 'ios' | 'android' | 'other'

export function platformOf(ua: string, maxTouchPoints = 0): InstallPlatform {
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && maxTouchPoints > 1)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'other'
}

/** Cuenta una visita por sesión del navegador (no por recarga). */
export function countVisit(storage: Pick<Storage, 'getItem' | 'setItem'>, session: Pick<Storage, 'getItem' | 'setItem'>): number {
  try {
    const n = Number(storage.getItem(VISITS) ?? 0) || 0
    if (session.getItem(VISITS)) return n
    session.setItem(VISITS, '1')
    storage.setItem(VISITS, String(n + 1))
    return n + 1
  } catch {
    return 0
  }
}

export function shouldOfferInstall(opts: { visits: number; standalone: boolean; dismissedAt: number | null; now?: number }): boolean {
  if (opts.standalone || opts.visits < MIN_VISITS) return false
  if (opts.dismissedAt !== null && (opts.now ?? Date.now()) - opts.dismissedAt < SNOOZE_DAYS * 86_400_000) return false
  return true
}

export function readDismissed(storage: Pick<Storage, 'getItem'>): number | null {
  try {
    const v = Number(storage.getItem(DISMISSED))
    return v > 0 ? v : null
  } catch {
    return null
  }
}

export function writeDismissed(storage: Pick<Storage, 'setItem'>, now = Date.now()) {
  try {
    storage.setItem(DISMISSED, String(now))
  } catch {
    /* sin almacenamiento */
  }
}
