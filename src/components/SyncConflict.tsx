import { useState } from 'react'
import { Cloud, Smartphone } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { resolveConflict } from '@/lib/sync'
import { useAuth } from '@/store/auth'
import { formatDate } from '@/lib/utils'

/** Aparece cuando la cuenta ya tiene progreso en la nube y este dispositivo también tiene el suyo. */
export function SyncConflict() {
  const conflict = useAuth((s) => s.conflict)
  const [busy, setBusy] = useState(false)
  if (!conflict) return null
  const choose = async (keep: 'cloud' | 'device') => {
    setBusy(true)
    await resolveConflict(keep)
    setBusy(false)
  }
  const options = [
    { keep: 'cloud' as const, icon: Cloud, title: 'Usar el progreso de mi cuenta', body: `Copia guardada el ${formatDate(new Date(conflict.updatedAt).getTime(), { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}. Reemplaza lo de este dispositivo.` },
    { keep: 'device' as const, icon: Smartphone, title: 'Usar el progreso de este dispositivo', body: 'Lo sube a tu cuenta y reemplaza la copia de la nube.' },
  ]
  return (
    <Modal open onClose={() => {}} title="¿Qué progreso quieres conservar?">
      <p className="text-sm text-muted">Tu cuenta ya tiene progreso guardado y este dispositivo también tiene el suyo. Elige uno; el otro se reemplaza.</p>
      <div className="mt-5 space-y-3">
        {options.map((o) => (
          <button key={o.keep} disabled={busy} onClick={() => void choose(o.keep)} className="flex w-full items-start gap-3 rounded-2xl border border-soft p-4 text-left transition-colors hover:border-brand-500/50 hover:bg-brand-500/[0.04] disabled:opacity-50">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
              <o.icon className="size-5" />
            </span>
            <span>
              <span className="block font-semibold">{o.title}</span>
              <span className="block text-sm text-muted">{o.body}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">Consejo: si no estás seguro, descarga antes un respaldo desde Configuración.</p>
    </Modal>
  )
}
