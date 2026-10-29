import { useState, type ReactNode } from 'react'
import { Check, UserRound } from 'lucide-react'
import { Avatar, AVATAR_FAMILIES, AVATARS, avatarDef } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { setAvatar } from '@/lib/account'
import { authErrorMessage } from '@/lib/supabase'
import { displayName, useAuth } from '@/store/auth'
import { useProgress } from '@/store/progress'
import { toast } from '@/store/toasts'
import { cn } from '@/lib/utils'

/**
 * Foto de perfil e inicial de quien usa la app. La elección vive en los ajustes (sirve sin cuenta);
 * con cuenta, si aún no eligió aquí, se usa la que tenga guardada en la cuenta.
 */
export function useMyAvatar() {
  const user = useAuth((s) => s.user)
  const status = useAuth((s) => s.status)
  const settings = useProgress((s) => s.settings)
  const meta = user?.user_metadata as { call_name?: string; avatar?: string } | undefined
  const chosen = settings.avatar ?? (status === 'signed-in' ? meta?.avatar : null)
  const avatar = avatarDef(chosen) ? (chosen as string) : null
  const base = settings.name || meta?.call_name || (status === 'signed-in' ? displayName(user) : '')
  return { avatar, initial: base.charAt(0).toUpperCase() }
}

/** Cuadrícula con las 36 fotos agrupadas por familia, en una ventana. */
export function AvatarPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { avatar, initial } = useMyAvatar()
  const status = useAuth((s) => s.status)
  const update = useProgress((s) => s.updateSettings)
  const [saving, setSaving] = useState(false)

  const pick = async (id: string | null) => {
    if (saving) return
    update({ avatar: id })
    // Con cuenta, también se guarda en ella (se ve igual en todos tus dispositivos).
    if (status === 'signed-in') {
      setSaving(true)
      try {
        await setAvatar(id)
      } catch (err) {
        toast({ kind: 'error', title: 'Se cambió solo en este dispositivo', body: authErrorMessage(err) })
      } finally {
        setSaving(false)
      }
    }
  }

  const option = (id: string | null, label: string, node: ReactNode) => {
    const active = avatar === id
    return (
      <button
        key={id ?? 'inicial'}
        type="button"
        role="radio"
        aria-checked={active}
        aria-label={label}
        title={label}
        onClick={() => void pick(id)}
        className={cn('relative aspect-square rounded-full transition-transform duration-150 active:scale-95', active ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-[var(--surface)]' : 'hover:scale-105')}
      >
        {node}
        {active && (
          <span className="absolute -right-0.5 -bottom-0.5 grid size-5 place-items-center rounded-full bg-brand-600 text-white ring-2 ring-[var(--surface)]">
            <Check className="size-3" />
          </span>
        )}
      </button>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Elige tu foto de perfil" className="sm:max-w-lg">
      <div role="radiogroup" aria-label="Foto de perfil" className="-mx-1 max-h-[60dvh] space-y-5 overflow-y-auto px-1 pt-1 pb-2">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {option(
            null,
            'Usar mi inicial',
            <Avatar initial={initial} className="size-full text-xl">
              <UserRound className="size-6" />
            </Avatar>,
          )}
        </div>
        {AVATAR_FAMILIES.map((f) => (
          <section key={f.id}>
            <h3 className="mb-2.5 text-xs font-semibold tracking-wide text-muted uppercase">{f.label}</h3>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">{AVATARS.filter((a) => a.family === f.id).map((a) => option(a.id, a.label, <Avatar avatar={a.id} className="size-full" />))}</div>
          </section>
        ))}
      </div>
      <Button className="mt-4 w-full" onClick={onClose}>
        Listo
      </Button>
    </Modal>
  )
}
