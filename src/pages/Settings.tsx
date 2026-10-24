import { useRef, useState } from 'react'
import { Download, Monitor, Moon, Settings as SettingsIcon, Sparkles, Sun, Trash2, Upload, Cloud } from 'lucide-react'
import { describeProfile } from '@/lib/plan'
import { useProgress } from '@/store/progress'
import { useAnki } from '@/store/anki'
import { useLingo } from '@/store/lingo'
import { MAX_SNAPSHOT_BYTES, restoreSnapshot, takeSnapshot } from '@/lib/backup'
import { useAuth } from '@/store/auth'
import { Button, Card, LinkButton, PageHeader, Segmented, Toggle } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { cn, dayKey, downloadFile } from '@/lib/utils'
import { formatEnurmDate, upcomingEnurm } from '@/data/enurm'
import { toast } from '@/store/toasts'
import { REPO_URL } from '@/components/layout/AppLayout'
import { GithubIcon } from '@/components/ui/Logo'
import type { Theme } from '@/types'
import { ReminderCard } from '@/components/ReminderCard'

export default function Settings() {
  const settings = useProgress((s) => s.settings)
  const authStatus = useAuth((s) => s.status)
  const profile = useProgress((s) => s.profile)
  const update = useProgress((s) => s.updateSettings)
  const updateProfile = useProgress((s) => s.updateProfile)
  const reset = useProgress((s) => s.resetProgress)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportBackup = () => {
    downloadFile(`medlogic-respaldo-${dayKey()}.json`, JSON.stringify(takeSnapshot(), null, 2))
    toast({ kind: 'success', title: 'Respaldo descargado' })
  }

  const restore = async (f: File | undefined) => {
    if (!f) return
    if (f.size > MAX_SNAPSHOT_BYTES) return toast({ kind: 'error', title: 'Archivo demasiado grande', body: 'Un respaldo de MedLogic pesa como mucho 8 MB.' })
    try {
      restoreSnapshot(JSON.parse(await f.text()))
      toast({ kind: 'success', title: 'Progreso restaurado' })
    } catch {
      toast({ kind: 'error', title: 'Archivo de respaldo no válido' })
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader icon={<SettingsIcon className="size-6" />} title="Ajustes" />

      <div className="space-y-6">
        <Card className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
            <Cloud className="size-5" />
          </span>
          <div className="min-w-[12rem] flex-1">
            <h2 className="font-semibold">Cuenta y sincronización</h2>
            <p className="text-sm text-muted">{authStatus === 'signed-in' ? 'Tu progreso se guarda en la nube y en este dispositivo.' : authStatus === 'disabled' ? 'Las cuentas se activan en la versión publicada. Por ahora todo queda en este navegador.' : 'Crea una cuenta gratis para estudiar desde cualquier dispositivo.'}</p>
          </div>
          <LinkButton to="/cuenta" variant={authStatus === 'signed-in' ? 'outline' : 'primary'}>
            {authStatus === 'signed-in' ? 'Ver mi cuenta' : authStatus === 'disabled' ? 'Más información' : 'Iniciar sesión'}
          </LinkButton>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-semibold">Perfil</h2>
          <div className="mt-4">
            <span className="text-sm text-muted">¿Cómo quieres que te llamemos?</span>
            <Segmented
              value={settings.honorific ?? 'none'}
              onChange={(h) => update({ honorific: h })}
              className="mt-1.5 grid w-full grid-cols-3"
              options={[
                { value: 'dr', label: 'Doctor' },
                { value: 'dra', label: 'Doctora' },
                { value: 'none', label: 'No decirlo' },
              ]}
            />
          </div>
          <label className="mt-4 block">
            <span className="text-sm text-muted">Nombre o apellido (opcional)</span>
            <input value={settings.name} onChange={(e) => update({ name: e.target.value })} placeholder="Ej.: Pichardo" className="mt-1.5 h-11 w-full rounded-xl border border-soft surface-2 px-3 text-sm outline-none focus:border-brand-500" />
          </label>
          <div className="mt-4">
            <span className="text-sm text-muted">Convocatoria del ENURM</span>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
              {upcomingEnurm(3).map((e) => (
                <button
                  key={e.year}
                  onClick={() => {
                    updateProfile({ examYear: e.year, examMonth: 3 })
                    update({ examDate: e.iso })
                  }}
                  aria-pressed={profile.examYear === e.year}
                  className={cn('rounded-xl border px-3 py-2.5 text-left transition-colors', profile.examYear === e.year ? 'border-brand-500 bg-brand-500/10' : 'border-soft hover:border-brand-500/40')}
                >
                  <div className="font-semibold">ENURM {e.year}</div>
                  <div className="text-xs text-muted">
                    {formatEnurmDate(e)} · {e.confirmed ? 'oficial' : 'proyectada'}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">El ENURM se aplica el primer domingo de marzo; la fecha la fija la convocatoria oficial, no tú.</p>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Perfil de estudio</h2>
              <p className="mt-1 text-sm text-muted">Tus respuestas al cuestionario definen tu plan diario.</p>
            </div>
            <LinkButton to="/bienvenida" variant="outline" size="sm">
              <Sparkles className="size-4" /> {profile.completed ? 'Editar cuestionario' : 'Responder cuestionario'}
            </LinkButton>
          </div>
          {profile.completed && (
            <ul className="mt-4 space-y-1.5 text-sm">
              {describeProfile(profile).map((l) => (
                <li key={l} className="text-muted">
                  • {l}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 font-semibold">Apariencia</h2>
          <Segmented<Theme>
            value={settings.theme}
            onChange={(theme) => update({ theme })}
            options={[
              { value: 'light', label: <span className="flex items-center gap-1.5"><Sun className="size-4" /> Claro</span> },
              { value: 'dark', label: <span className="flex items-center gap-1.5"><Moon className="size-4" /> Oscuro</span> },
              { value: 'system', label: <span className="flex items-center gap-1.5"><Monitor className="size-4" /> Sistema</span> },
            ]}
          />
          <div className="mt-4 divide-y divide-[var(--border)]">
            <Toggle checked={settings.reduceMotion} onChange={(v) => update({ reduceMotion: v })} label="Reducir animaciones" description="Desactiva transiciones y confeti." />
            <Toggle checked={settings.sound} onChange={(v) => update({ sound: v })} label="Sonidos" description="Efectos al acertar, fallar y completar." />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="mb-2 font-semibold">Estudio</h2>
          <div className="divide-y divide-[var(--border)]">
            <Toggle checked={settings.shuffleOptions} onChange={(v) => update({ shuffleOptions: v })} label="Mezclar el orden de las opciones" description="Evita memorizar la posición de la respuesta. No se mezclan opciones como «todas las anteriores»." />
          </div>
          <label className="mt-4 block">
            <span className="flex justify-between text-sm">
              <span className="text-muted">Meta diaria de preguntas</span>
              <b>{settings.dailyGoal}</b>
            </span>
            <input type="range" min={10} max={200} step={5} value={settings.dailyGoal} onChange={(e) => update({ dailyGoal: +e.target.value })} className="mt-3 w-full accent-[var(--color-brand-500)]" />
          </label>
        </Card>

        <ReminderCard />

        <Card className="p-5 sm:p-6">
          <h2 className="font-semibold">Tus datos</h2>
          <p className="mt-1 text-sm text-muted">Tu progreso se guarda solo en este dispositivo. Descarga un respaldo para moverlo a otro navegador o teléfono.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportBackup}>
              <Download className="size-4" /> Exportar respaldo
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> Restaurar respaldo
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={(e) => restore(e.target.files?.[0])} />
            <Button variant="ghost" className="text-rose-500" onClick={() => setConfirmReset(true)}>
              <Trash2 className="size-4" /> Borrar progreso
            </Button>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 sm:p-6">
          <GithubIcon className="size-8 shrink-0" />
          <div className="flex-1 text-sm">
            <div className="font-semibold">MedLogic ENURM es gratis y de código abierto</div>
            <div className="text-muted">Contribuye con preguntas, correcciones o nuevas funciones.</div>
          </div>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            GitHub
          </a>
        </Card>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="¿Borrar todo tu progreso?">
        <p className="text-sm text-muted">Se eliminarán respuestas, simulacros, el progreso de las flashcards (tus notas se conservan), XP y logros. Tus ajustes se mantienen. Esta acción no se puede deshacer.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              reset()
              useAnki.getState().resetAll()
              useLingo.getState().reset()
              setConfirmReset(false)
              toast({ kind: 'info', title: 'Progreso borrado' })
            }}
          >
            Borrar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
