import { useEffect } from 'react'
import { useProgress } from '@/store/progress'

/**
 * Suma minutos de estudio mientras la pestaña está visible y hubo actividad en los últimos 2 minutos.
 */
export function useStudyTimer() {
  useEffect(() => {
    let lastInput = Date.now()
    const mark = () => (lastInput = Date.now())
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }))
    const id = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastInput < 120_000) useProgress.getState().addMinutes(1)
    }, 60_000)
    return () => {
      clearInterval(id)
      events.forEach((e) => window.removeEventListener(e, mark))
    }
  }, [])
}
