import { useEffect } from 'react'

let locks = 0
let savedY = 0

/**
 * Congela la página de fondo mientras hay un panel o una ventana abierta. En iPhone `overflow: hidden`
 * no basta (el dedo sigue moviendo la página de abajo), así que el body se fija en su posición y se
 * devuelve al mismo punto al cerrar. Admite varios paneles a la vez (cuenta cuántos lo piden).
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    if (locks++ === 0) {
      savedY = window.scrollY
      const b = document.body.style
      b.position = 'fixed'
      b.top = `-${savedY}px`
      b.left = '0'
      b.right = '0'
      b.overflow = 'hidden'
    }
    return () => {
      if (--locks > 0) return
      const b = document.body.style
      b.position = b.top = b.left = b.right = b.overflow = ''
      window.scrollTo({ top: savedY, behavior: 'instant' })
    }
  }, [active])
}
