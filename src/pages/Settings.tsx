import { useEffect, useRef, useState } from 'react'
import { Cloud, Download, LogIn, Monitor, Moon, Pencil, Settings as SettingsIcon, Sparkles, Sun, Trash2, Upload, UserRound } from 'lucide-react'
import { describeProfile } from '@/lib/plan'
import { useProgress } from '@/store/progress'
import { useAnki } from '@/store/anki'
import { useLingo } from '@/store/lingo'
import { MAX_SNAPSHOT_BYTES, restoreSnapshot, takeSnapshot } from '@/lib/backup'
import { useAuth } from '@/store/auth'
import { Button, buttonClass, Card, LinkButton, PageHeader, Segmented, Toggle } from '@/components/ui/primitives'
import { Link } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { addressName, cn, dayKey, downloadFile } from '@/lib/utils'
import { formatEnurmDate, upcomingEnurm } from '@/data/enurm'
import { toast } from '@/store/toasts'
import { REPO_URL } from '@/components/layout/AppLayout'
import { GithubIcon } from '@/components/ui/Logo'
import type { Honorific, Theme } from '@/types'
import { ReminderCard } from '@/components/ReminderCard'
import { UniversityPicker } from '@/components/UniversityPicker'
import { UNIVERSITY_NEEDS_NAME, universityLabel } from '@/data/universities'
import { saveProfile, type ProfileEdit } from '@/lib/account'
import { Avatar } from '@/components/ui/Avatar'
import { AvatarPicker, useMyAvatar } from '@/components/AvatarPicker'
import { AccountSection } from '@/components/AccountSection'

const SECTIONS = [
  ['perfil', 'Perfil'],
  ['apariencia', 'Apariencia'],
  ['estudio', 'Estudio'],
  ['datos', 'Datos'],
  ['cuenta', 'Cuenta'],
] as const

/** Título pequeño de cada bloque de Configuración (y ancla del índice). */
function SectionTitle({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="scroll-mt-24 px-1 pt-2 text-xs font-semibold tracking-wider text-muted uppercase">
      {children}
    </h2>
  )
}

/** Cabecera: tu foto (tócala para cambiarla), cómo te llamamos y si tu progreso está en la nube o solo aquí. */
function ProfileHero() {
  const settings = useProgress((s) => s.settings)
  const status = useAuth((s) => s.status)
  const email = useAuth((s) => s.user?.email)
  const { avatar, initial } = useMyAvatar()
  const [picking, setPicking] = useState(false)
  const who = addressName(settings)
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button type="button" onClick={() => setPicking(true)} className="group relative shrink-0 rounded-full" aria-label="Cambiar foto de perfil">
          <Avatar avatar={avatar} initial={initial} className="size-16 text-2xl transition-transform duration-150 group-active:scale-95">
            <UserRound className="size-7" />
          </Avatar>
          <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border border-soft bg-[var(--surface)] text-brand-700 shadow-sm dark:text-brand-300">
            <Pencil className="size-3.5" />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-xl font-bold">{who ? who.charAt(0).toUpperCase() + who.slice(1) : 'Tu perfil'}</div>
          <div className={cn('text-sm text-pretty text-muted', status === 'signed-in' && 'truncate')}>{status === 'signed-in' ? email : 'Sin cuenta: tu progreso se guarda solo en este navegador.'}</div>
          <button type="button" onClick={() => setPicking(true)} className="mt-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">
            Cambiar foto
          </button>
        </div>
      </div>
      {status === 'signed-out' && (
        <Link to="/cuenta" state={{ mode: 'signup' }} className={buttonClass('primary', 'md', 'w-full sm:w-auto')}>
          <Cloud className="size-4" /> Guardar en la nube
        </Link>
      )}
      <AvatarPicker open={picking} onClose={() => setPicking(false)} />
    </Card>
  )
}

/** Índice: salta a cada sección (la página es larga en el celular). */
function SectionIndex() {
  return (
    <nav aria-label="Secciones" className="sticky top-16 z-10 -mx-4 overflow-x-auto bg-[color-mix(in_oklab,var(--bg)_96%,transparent)] px-4 py-2 backdrop-blur-xl [scrollbar-width:none] sm:mx-0 sm:rounded-2xl sm:px-2">
      <ul className="flex gap-1.5">
        {SECTIONS.map(([id, label]) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="h-9 rounded-full border border-soft bg-[var(--surface)] px-3.5 text-sm font-medium whitespace-nowrap transition-colors hover:border-brand-500/40"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function Settings() {
  const settings = useProgress((s) => s.settings)
  const authStatus = useAuth((s) => s.status)
  const profile = useProgress((s) => s.profile)
  const update = useProgress((s) => s.updateSettings)
  const updateProfile = useProgress((s) => s.updateProfile)
  const reset = useProgress((s) => s.resetProgress)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Los cambios del perfil se editan en un borrador y se aplican de golpe con «Guardar cambios».
  const fromStore = (): ProfileEdit => ({ name: settings.name, honorific: settings.honorific ?? 'none', university: profile.university, universityOther: profile.universityOther })
  const [draft, setDraft] = useState<ProfileEdit>(fromStore)
  const [picking, setPicking] = useState(false)
  const [saving, setSaving] = useState(false)
  // Si lo guardado cambia por otro lado (p. ej. se baja el progreso de la nube), el borrador lo sigue.
  useEffect(() => setDraft({ name: settings.name, honorific: settings.honorific ?? 'none', university: profile.university, universityOther: profile.universityOther }), [settings.name, settings.honorific, profile.university, profile.universityOther])
  const dirty = draft.name !== settings.name || draft.honorific !== (settings.honorific ?? 'none') || draft.university !== profile.university || draft.universityOther !== profile.universityOther
  const canSave = !draft.university || !UNIVERSITY_NEEDS_NAME.has(draft.university) || draft.universityOther.trim().length > 1

  const save = async () => {
    if (!dirty || !canSave || saving) return
    setSaving(true)
    try {
      const ok = await saveProfile(draft)
      if (ok) toast({ kind: 'success', title: 'Cambios guardados', body: authStatus === 'signed-in' ? 'Ya se actualizaron en tu cuenta y en el ranking.' : 'Se aplicaron en toda la página.' })
      else toast({ kind: 'error', title: 'Guardado en este dispositivo', body: 'No pudimos actualizar la nube ahora mismo. Vuelve a tocar «Guardar cambios» cuando tengas conexión.' })
    } finally {
      setSaving(false)
    }
  }

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
      <PageHeader icon={<SettingsIcon className="size-6" />} title="Configuración" subtitle="Tu perfil, tu cuenta y cómo funciona la app, todo en un solo lugar." />

      <div className="space-y-4">
        <ProfileHero />
        <SectionIndex />

        <SectionTitle id="perfil">Perfil</SectionTitle>
        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold">Cómo te llamamos</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void save()
            }}
          >
            <div className="mt-4">
              <span className="text-sm text-muted">¿Cómo quieres que te llamemos?</span>
              <Segmented<Honorific>
                value={draft.honorific ?? 'none'}
                onChange={(honorific) => setDraft({ ...draft, honorific })}
                className="mt-1.5 grid w-full grid-cols-5"
                options={[
                  { value: 'dr', label: 'Dr.' },
                  { value: 'dra', label: 'Dra.' },
                  { value: 'lic', label: 'Lic.' },
                  { value: 'est', label: 'Est.' },
                  { value: 'none', label: 'N/A' },
                ]}
              />
            </div>
            <label className="mt-4 block">
              <span className="text-sm text-muted">Nombre o apellido (opcional)</span>
              <input
                value={draft.name}
                maxLength={60}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Ej.: Pichardo"
                autoComplete="off"
                className="mt-1.5 h-11 w-full rounded-xl border border-soft surface-2 px-3 text-sm capitalize outline-none focus:border-brand-500"
              />
            </label>
            <div className="mt-4">
              <span className="text-sm text-muted">Universidad</span>
              <button type="button" onClick={() => setPicking(true)} className="mt-1.5 flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-soft surface-2 px-3 text-left text-sm hover:border-brand-500/40">
                <span className="truncate font-medium">{draft.university ? universityLabel(draft.university, draft.universityOther) : 'Sin elegir'}</span>
                <span className="shrink-0 font-semibold text-brand-700 dark:text-brand-400">Cambiar</span>
              </button>
              <p className="mt-1.5 text-xs text-muted">Define en qué ranking de universidad apareces.</p>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={!dirty || !canSave || saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
              {dirty && !saving && (
                <button type="button" onClick={() => setDraft(fromStore())} className="text-sm font-semibold text-muted hover:text-[var(--text)]">
                  Descartar
                </button>
              )}
              {!dirty && <span className="text-xs text-muted">{authStatus === 'signed-in' ? 'Se aplica en toda la página, tu cuenta y el ranking.' : 'Se aplica en toda la página.'}</span>}
            </div>
          </form>
          <Modal open={picking} onClose={() => setPicking(false)} title="Tu universidad" className="sm:max-w-xl">
            <UniversityPicker value={draft.university} other={draft.universityOther} onChange={(university, universityOther) => setDraft({ ...draft, university, universityOther })} />
            <Button className="mt-4 w-full" disabled={!canSave} onClick={() => setPicking(false)}>
              Listo
            </Button>
          </Modal>
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
              <h3 className="font-semibold">Perfil de estudio</h3>
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

        <SectionTitle id="apariencia">Apariencia</SectionTitle>
        <Card className="p-5 sm:p-6">
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

        <SectionTitle id="estudio">Estudio</SectionTitle>
        <Card className="p-5 sm:p-6">
          <div className="-mt-2 divide-y divide-[var(--border)]">
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

        <SectionTitle id="datos">Datos</SectionTitle>
        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold">Tus datos</h3>
          <p className="mt-1 text-sm text-muted">{authStatus === 'signed-in' ? 'Tu progreso se guarda en este dispositivo y en tu cuenta.' : 'Tu progreso se guarda en este navegador.'} Puedes descargar un respaldo cuando quieras.</p>
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

        <SectionTitle id="cuenta">Cuenta</SectionTitle>
        {authStatus === 'signed-in' ? (
          <AccountSection />
        ) : (
          <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
              <Cloud className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">Cuenta gratis (opcional)</div>
              <p className="text-sm text-muted">{authStatus === 'disabled' ? 'Las cuentas se activan en la versión publicada. Por ahora todo queda en este navegador.' : 'Sin cuenta, tu progreso solo se guarda en este navegador. Con una cuenta gratis lo tienes en todos tus dispositivos.'}</p>
            </div>
            {authStatus !== 'disabled' && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link to="/cuenta" state={{ mode: 'signin' }} className={buttonClass('outline', 'md')}>
                  <LogIn className="size-4" /> Iniciar sesión
                </Link>
                <Link to="/cuenta" state={{ mode: 'signup' }} className={buttonClass('primary', 'md')}>
                  Crear cuenta
                </Link>
              </div>
            )}
          </Card>
        )}

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
