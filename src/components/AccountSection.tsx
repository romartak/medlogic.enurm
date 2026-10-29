import { useState } from 'react'
import { CloudOff, Cloud, LogOut, RefreshCw, Trash2 } from 'lucide-react'
import { syncNow, flushPending } from '@/lib/sync'
import { useAuth } from '@/store/auth'
import { Button, Card } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { deleteMyAccount, logout } from '@/lib/account'
import { cn, formatDate } from '@/lib/utils'

export const CONTACT_EMAIL = 'medlogic.care@gmail.com'

const SYNC_LABEL = {
  idle: 'Preparando…',
  syncing: 'Sincronizando…',
  synced: 'Al día',
  offline: 'Sin conexión: se subirá al volver',
  error: 'No se pudo sincronizar',
  conflict: 'Elige qué progreso conservar',
} as const

const field = 'mt-1.5 h-12 w-full rounded-xl border border-soft surface-2 px-4 outline-none transition-colors focus:border-brand-500'

/** Sección «Cuenta» de Configuración con la sesión iniciada: sincronizar, cerrar sesión y eliminar la cuenta. */
export function AccountSection() {
  const { user, sync, lastSyncedAt } = useAuth()
  const provider = (user?.app_metadata as { provider?: string } | undefined)?.provider
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [leaving, setLeaving] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const CONFIRM_WORD = 'ELIMINAR'

  /** Sube lo pendiente y cierra la sesión. Si no se pudo subir, avisa antes de borrar este dispositivo. */
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

  const closeDelete = () => {
    if (deleting) return
    setConfirmDelete(false)
    setTyped('')
    setDeleteError('')
  }

  const doDelete = async () => {
    if (typed.trim().toUpperCase() !== CONFIRM_WORD) return
    setDeleting(true)
    setDeleteError('')
    try {
      // Si sale bien, la página se recarga en la pantalla de entrar.
      await deleteMyAccount()
    } catch {
      setDeleteError('No pudimos eliminar la cuenta. Revisa tu conexión e inténtalo de nuevo; si sigue fallando, escríbenos a ' + CONTACT_EMAIL + '.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="divide-y divide-[var(--border)] p-0">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', sync === 'error' || sync === 'offline' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300')}>
            {sync === 'offline' ? <CloudOff className="size-5" /> : <Cloud className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">Sincronización: {SYNC_LABEL[sync]}</div>
            <div className="text-sm text-muted">{lastSyncedAt ? `Última copia: ${formatDate(new Date(lastSyncedAt).getTime(), { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}` : 'Tu progreso se guarda en la nube automáticamente.'}</div>
          </div>
        </div>
        <Button variant="secondary" className="w-full sm:w-auto" onClick={() => void syncNow()} disabled={sync === 'syncing'}>
          <RefreshCw className={cn('size-4', sync === 'syncing' && 'animate-spin')} /> Sincronizar ahora
        </Button>
      </div>

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{user?.email}</div>
          <div className="text-sm text-muted">Acceso con {provider === 'google' ? 'Google' : 'correo'}</div>
        </div>
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => void leave()} disabled={leaving}>
          {leaving ? <RefreshCw className="size-4 animate-spin" /> : <LogOut className="size-4" />} Cerrar sesión
        </Button>
      </div>

      <div className="p-5 sm:p-6">
        <div className="font-semibold text-rose-600 dark:text-rose-400">Eliminar mi cuenta</div>
        <p className="mt-1 text-sm text-muted">Borra tu cuenta y todo lo que está en la nube: tu perfil, tu progreso, tu lugar en el ranking y tus simulacros. No se puede deshacer.</p>
        <Button variant="danger" className="mt-4" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="size-4" /> Eliminar mi cuenta
        </Button>
      </div>

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

      <Modal open={confirmDelete} onClose={closeDelete} title="¿Eliminar tu cuenta para siempre?">
        <div className="space-y-4 text-sm">
          <ul className="list-disc space-y-1 pl-5 text-muted">
            <li>Se borra tu cuenta y tu correo de nuestros servidores.</li>
            <li>Se borra tu progreso en la nube, tu ranking y tus simulacros.</li>
            <li>Se borra el progreso guardado en este dispositivo.</li>
            <li>Para volver a estudiar tendrás que crear una cuenta nueva.</li>
          </ul>
          <label className="block font-medium" htmlFor="del-confirm">
            Para confirmar, escribe <b className="text-rose-600 dark:text-rose-400">{CONFIRM_WORD}</b>
            <input id="del-confirm" name="confirmar" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} className={field} />
          </label>
          {deleteError && (
            <p role="alert" className="rounded-xl bg-rose-500/10 px-3 py-2.5 text-rose-700 dark:text-rose-300">
              {deleteError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeDelete} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void doDelete()} disabled={deleting || typed.trim().toUpperCase() !== CONFIRM_WORD}>
              {deleting && <RefreshCw className="size-4 animate-spin" />} Eliminar para siempre
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  )
}
