import { useState } from 'react'
import { BellRing, CalendarPlus } from 'lucide-react'
import { Button, Card } from '@/components/ui/primitives'
import { downloadFile } from '@/lib/utils'
import { toast } from '@/store/toasts'

/**
 * Recordatorio diario para estudiar, guardado en el calendario del teléfono.
 * Funciona en iPhone y Android sin servidor ni permisos: el calendario avisa a la hora elegida
 * aunque la página esté cerrada.
 */
const KEY = 'medlogic-recordatorio'
const SITE = 'https://medlogicenurm.vercel.app/'
const TITLE = 'Hora de estudiar para el ENURM'
const DETAILS = `Tu plan del día te espera en MedLogic: preguntas, flashcards y el repaso de terminología. ${SITE}`

const pad = (n: number) => String(n).padStart(2, '0')

/** Próxima ocurrencia de la hora elegida (hoy o mañana), en hora local «flotante». */
function nextStart(time: string): Date {
  const [h, m] = time.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1)
  return d
}

const stamp = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`

/** Archivo .ics con un evento diario de 30 minutos y aviso a la hora de inicio. */
export function reminderIcs(time: string): string {
  const start = nextStart(time)
  const end = new Date(start.getTime() + 30 * 60_000)
  const now = new Date()
  const utc = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MedLogic ENURM//Recordatorio//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:recordatorio-${start.getTime()}@medlogic-enurm`,
    `DTSTAMP:${utc}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${TITLE}`,
    `DESCRIPTION:${DETAILS}`,
    `URL:${SITE}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${TITLE}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

export function googleCalendarUrl(time: string): string {
  const start = nextStart(time)
  const end = new Date(start.getTime() + 30 * 60_000)
  const p = new URLSearchParams({ action: 'TEMPLATE', text: TITLE, details: DETAILS, dates: `${stamp(start)}/${stamp(end)}`, recur: 'RRULE:FREQ=DAILY' })
  return `https://calendar.google.com/calendar/render?${p}`
}

/** Ya eligió una hora alguna vez (para no insistir en el Inicio). */
export function hasReminder(): boolean {
  try {
    return !!localStorage.getItem(KEY)
  } catch {
    return false
  }
}

function savedTime(): string {
  try {
    return localStorage.getItem(KEY) || '19:00'
  } catch {
    return '19:00'
  }
}

export function ReminderCard({ compact = false }: { compact?: boolean }) {
  const [time, setTime] = useState(savedTime)
  const remember = () => {
    try {
      localStorage.setItem(KEY, time)
    } catch {
      /* sin almacenamiento */
    }
  }
  const addIcs = () => {
    remember()
    downloadFile('recordatorio-medlogic.ics', reminderIcs(time), 'text/calendar')
    toast({ kind: 'success', title: 'Recordatorio listo', body: 'Ábrelo y toca «Añadir» para guardarlo en tu calendario.' })
  }
  return (
    <Card className={compact ? 'p-5' : 'p-5 sm:p-6'}>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-700 dark:text-violet-300">
          <BellRing className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Recordatorio diario</h2>
          <p className="mt-0.5 text-sm text-muted">Tu teléfono te avisa cada día a la hora que elijas para que no se rompa tu racha.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-muted">Hora</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value || '19:00')} className="mt-1 block h-11 rounded-xl border border-soft bg-[var(--surface)] px-3 font-semibold outline-none focus:border-brand-500" />
        </label>
        <Button onClick={addIcs}>
          <CalendarPlus className="size-4" /> Añadir a mi calendario
        </Button>
        <a href={googleCalendarUrl(time)} onClick={remember} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-brand-700 hover:bg-brand-500/10 dark:text-brand-400">
          Usar Google Calendar
        </a>
      </div>
      <p className="mt-3 text-xs text-muted">En iPhone abre el archivo y toca «Añadir todo». En Android puedes usar el archivo o Google Calendar. Para quitarlo, borra el evento del calendario.</p>
    </Card>
  )
}
