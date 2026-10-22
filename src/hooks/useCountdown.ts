import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Temporizador regresivo en segundos basado en una hora límite (no se desfasa si la pestaña se duerme).
 * `adjust(delta)` suma o resta segundos; onEnd se llama una sola vez al llegar a 0.
 */
export function useCountdown(seconds: number, running: boolean, onEnd?: () => void) {
  const [left, setLeft] = useState(seconds)
  const remainingRef = useRef(seconds)
  const deadlineRef = useRef<number | null>(null)
  const endRef = useRef(onEnd)
  endRef.current = onEnd
  const firedRef = useRef(false)

  useEffect(() => {
    remainingRef.current = seconds
    firedRef.current = false
    setLeft(seconds)
    if (deadlineRef.current !== null) deadlineRef.current = Date.now() + seconds * 1000
  }, [seconds])

  useEffect(() => {
    if (!running) {
      if (deadlineRef.current !== null) remainingRef.current = Math.max(0, (deadlineRef.current - Date.now()) / 1000)
      deadlineRef.current = null
      return
    }
    deadlineRef.current = Date.now() + remainingRef.current * 1000
    const tick = () => {
      if (deadlineRef.current === null) return
      const next = Math.max(0, (deadlineRef.current - Date.now()) / 1000)
      remainingRef.current = next
      setLeft(next)
      if (next <= 0 && !firedRef.current) {
        firedRef.current = true
        endRef.current?.()
      }
    }
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [running])

  const adjust = useCallback((delta: number) => {
    if (firedRef.current) return
    if (deadlineRef.current !== null) deadlineRef.current += delta * 1000
    remainingRef.current = Math.max(0, remainingRef.current + delta)
    setLeft(remainingRef.current)
  }, [])

  return [left, adjust] as const
}
