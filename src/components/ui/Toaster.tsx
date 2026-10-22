import { AnimatePresence, motion } from 'motion/react'
import { CircleCheck, Info, TriangleAlert, Trophy } from 'lucide-react'
import { useToasts } from '@/store/toasts'
import { Icon } from './Icon'

export function Toaster() {
  const { toasts, dismiss } = useToasts()
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-3 sm:top-auto sm:right-5 sm:bottom-5 sm:left-auto sm:items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            onClick={() => dismiss(t.id)}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl p-3 pr-4 text-left shadow-lift"
          >
            {t.kind === 'achievement' ? (
              <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                {t.icon ? <Icon name={t.icon} className="size-5" /> : <Trophy className="size-5" />}
              </span>
            ) : (
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${t.kind === 'error' ? 'bg-rose-500/15 text-rose-500' : t.kind === 'success' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-sky-500/15 text-sky-500'}`}>
                {t.kind === 'error' ? <TriangleAlert className="size-4" /> : t.kind === 'success' ? <CircleCheck className="size-4" /> : <Info className="size-4" />}
              </span>
            )}
            <span className="min-w-0">
              {t.kind === 'achievement' && <span className="block text-[10px] font-bold tracking-wider text-amber-500 uppercase">Logro desbloqueado</span>}
              <span className="block text-sm font-semibold">{t.title}</span>
              {t.body && <span className="block text-xs text-muted">{t.body}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
