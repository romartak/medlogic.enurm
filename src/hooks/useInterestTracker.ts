import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { sectionOf } from '@/lib/interest'
import { useInterest } from '@/store/interest'

const TICK_MS = 5_000
/** Sin tocar, mover ni teclear durante este tiempo se considera que la persona no está mirando. */
const IDLE_MS = 60_000

/**
 * Mide cuánto tiempo usa la persona cada sección y cuántas veces entra. Solo cuenta mientras la
 * pestaña está visible y hay actividad reciente; no se guarda nada fuera de este dispositivo.
 * Debe usarse dentro del router.
 */
export function useInterestTracker() {
  const { pathname } = useLocation()
  const section = sectionOf(pathname)

  // Una visita por cada entrada a una sección (no por cada subpágina de la misma).
  useEffect(() => {
    if (section) useInterest.getState().addVisit(section)
  }, [section])

  // Tiempo activo en la sección actual.
  useEffect(() => {
    if (!section) return
    let lastInput = Date.now()
    const mark = () => (lastInput = Date.now())
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }))
    const id = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastInput < IDLE_MS) useInterest.getState().addTime(section, TICK_MS)
    }, TICK_MS)
    return () => {
      clearInterval(id)
      events.forEach((e) => window.removeEventListener(e, mark))
    }
  }, [section])
}
