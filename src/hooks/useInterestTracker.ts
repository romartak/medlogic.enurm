import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { sectionOf, topicOf } from '@/lib/interest'
import { useInterest } from '@/store/interest'

const TICK_MS = 5_000
/** Sin tocar, mover ni teclear durante este tiempo se considera que la persona no está mirando. */
const IDLE_MS = 60_000

/**
 * Mide cuánto tiempo usa la persona cada sección y tema, a qué hora estudia y qué botones pulsa.
 * Solo cuenta mientras la pestaña está visible y hay actividad reciente; no se guarda nada fuera
 * de este dispositivo. Debe usarse dentro del router.
 */
export function useInterestTracker() {
  const { pathname } = useLocation()
  const section = sectionOf(pathname)
  const topic = topicOf(pathname)

  // Una sesión por apertura de la app.
  useEffect(() => {
    useInterest.getState().startSession()
  }, [])

  // Botones marcados con data-track="nombre".
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-track]')
      const name = el?.getAttribute('data-track')
      if (name) useInterest.getState().track(name)
    }
    document.addEventListener('click', onClick, { capture: true, passive: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  // Una visita por cada entrada a una sección, y otra por cada tema (no por cada subpágina).
  useEffect(() => {
    if (section) useInterest.getState().addVisit(section, null)
  }, [section])
  useEffect(() => {
    if (topic) useInterest.getState().addVisit(null, topic)
  }, [topic])

  // Tiempo activo en la sección y el tema actuales.
  useEffect(() => {
    if (!section) return
    let lastInput = Date.now()
    const mark = () => (lastInput = Date.now())
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }))
    const id = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastInput < IDLE_MS) useInterest.getState().addTime(section, topic, TICK_MS)
    }, TICK_MS)
    return () => {
      clearInterval(id)
      events.forEach((e) => window.removeEventListener(e, mark))
    }
  }, [section, topic])
}
