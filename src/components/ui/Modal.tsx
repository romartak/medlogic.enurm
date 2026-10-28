import { useEffect, useId, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Ventana modal accesible: se anuncia con su título, lleva el foco dentro al abrirse, lo devuelve al
 * cerrarse y no deja que el tabulador se escape al contenido de detrás.
 */
export function Modal({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; className?: string }) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const items = () =>
      panelRef.current
        ? [...panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null || el === document.activeElement)
        : []
    // El foco entra en el primer control (no en el marco): así se anuncia el diálogo sin dibujar un
    // anillo alrededor de toda la ventana.
    const start = items()[0]
    if (start) start.focus()
    else panelRef.current?.focus()
    const onTab = (e: KeyboardEvent) => {
      const panel = panelRef.current
      if (e.key !== 'Tab' || !panel) return
      const list = items()
      if (list.length === 0) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onTab)
    return () => {
      document.removeEventListener('keydown', onTab)
      const target = restoreRef.current
      if (target?.isConnected) target.focus()
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div className="absolute inset-0 bg-slate-950/55" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className={cn('card relative max-h-[90dvh] w-full overflow-y-auto rounded-b-none p-5 outline-none sm:max-w-lg sm:rounded-b-[var(--radius-2xl)] sm:p-6', className)}
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40, transition: { duration: 0.2, ease: [0.77, 0, 0.175, 1] } }}
            transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              {title && (
                <h2 id={titleId} className="text-lg font-bold">
                  {title}
                </h2>
              )}
              <button onClick={onClose} className="-m-1 ml-auto rounded-lg p-1 text-muted hover:bg-slate-900/5 dark:hover:bg-white/5" aria-label="Cerrar">
                <X className="size-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
