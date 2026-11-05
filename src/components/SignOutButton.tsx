import { useState } from 'react'
import { LogOut, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { flushPending } from '@/lib/sync'
import { logout } from '@/lib/account'

/** Botón «Cerrar sesión»: sube lo pendiente y, si no se pudo guardar, avisa antes de limpiar este dispositivo. */
export function SignOutButton({ variant = 'outline', className }: { variant?: 'outline' | 'secondary' | 'ghost'; className?: string }) {
  const [leaving, setLeaving] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)

  const leave = async () => {
    setLeaving(true)
    if (!(await flushPending())) {
      setLeaving(false)
      setConfirmLeave(true)
      return
    }
    await logout()
  }
  const leaveAnyway = async () => {
    setConfirmLeave(false)
    setLeaving(true)
    await logout()
  }

  return (
    <>
      <Button variant={variant} className={className} onClick={() => void leave()} disabled={leaving}>
        {leaving ? <RefreshCw className="size-4 animate-spin" /> : <LogOut className="size-4" />} Cerrar sesión
      </Button>
      <Modal open={confirmLeave} onClose={() => setConfirmLeave(false)} title="No se pudo guardar tu último progreso">
        <div className="space-y-4 text-sm">
          <p className="text-muted">Tu progreso más reciente todavía no está guardado en la nube (¿sin conexión?). Si cierras sesión ahora, ese progreso se perderá de este dispositivo.</p>
          <p className="text-muted">Lo mejor es esperar a tener conexión, pulsar «Sincronizar ahora» y cerrar sesión después.</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="danger" onClick={() => void leaveAnyway()}>
              Cerrar sesión y perderlo
            </Button>
            <Button onClick={() => setConfirmLeave(false)}>Me quedo</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
