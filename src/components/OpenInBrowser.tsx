import { useState } from 'react'
import { ChevronUp, Compass, Copy, Check, ExternalLink } from 'lucide-react'
import { copyText } from '@/lib/clipboard'
import { androidChromeIntent, isInAppBrowser, mobileOs } from '@/lib/inApp'
import { LogoMark } from '@/components/ui/Logo'

const SKIP_KEY = 'medlogic-inapp-skip'

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-gradient text-sm font-extrabold text-white">{n}</span>
      <span className="text-[15px] leading-snug text-[var(--muted)]">{children}</span>
    </li>
  )
}

/**
 * Pantalla completa para quien entra desde el navegador integrado de Instagram, Facebook, TikTok...:
 * le explica cómo abrir la plataforma en Safari/Chrome. En Android además puede abrir Chrome con un toque.
 */
export function OpenInBrowser() {
  const [skipped, setSkipped] = useState(() => {
    try {
      return sessionStorage.getItem(SKIP_KEY) === '1'
    } catch {
      return false
    }
  })
  const [copied, setCopied] = useState(false)
  if (skipped || !isInAppBrowser()) return null

  const os = mobileOs()
  const browser = os === 'ios' ? 'Safari' : 'Chrome'
  const href = window.location.href

  const copy = async () => {
    if (await copyText(href)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }
  const skip = () => {
    try {
      sessionStorage.setItem(SKIP_KEY, '1')
    } catch {
      /* sin almacenamiento: se cierra solo en esta visita */
    }
    setSkipped(true)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ábrelo en ${browser} para seguir`}
      className="fixed inset-0 z-[80] overflow-y-auto bg-[var(--bg)] px-6 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))] text-[var(--text)]"
    >
      {/* El menú «⋯» de Instagram y Facebook está arriba a la derecha. */}
      <div className="pointer-events-none absolute right-5 top-[max(1.25rem,env(safe-area-inset-top))] flex flex-col items-center gap-0.5 text-brand-600 motion-safe:animate-bounce" aria-hidden>
        <ChevronUp className="size-8" strokeWidth={2.5} />
        <span className="text-xs font-bold tracking-widest">•••</span>
      </div>

      <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center pt-16 text-center">
        <LogoMark className="size-[72px]" />
        <h1 className="mt-6 text-balance text-[28px] font-extrabold leading-tight tracking-tight">Ábrelo en {browser} para seguir</h1>
        <p className="mt-3 text-balance text-base text-[var(--muted)]">
          Desde esta ventana no se puede guardar tu progreso ni instalar MedLogic como app en tu celular. Toma 5 segundos.
        </p>

        {os === 'android' && (
          <a
            href={androidChromeIntent(href)}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient text-base font-semibold text-white shadow-glow"
          >
            <ExternalLink className="size-5" /> Abrir en Chrome
          </a>
        )}

        <ol className="mt-6 w-full space-y-5 rounded-3xl bg-[var(--surface)] p-6 text-left shadow-lg ring-1 ring-black/5 dark:ring-white/10">
          <Step n={1}>
            Toca los <b className="text-[var(--text)]">•••</b> arriba a la derecha
          </Step>
          <Step n={2}>
            Toca <b className="text-[var(--text)]">«Abrir en navegador externo»</b>
          </Step>
          <Step n={3}>
            Si te pregunta, elige <b className="text-[var(--text)]">{browser}</b> <Compass className="inline size-4 align-[-2px]" />
          </Step>
        </ol>

        <p className="mt-7 text-sm text-[var(--muted)]">¿No te sale? Copia el link y pégalo en {browser}:</p>
        <button
          type="button"
          onClick={copy}
          className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--surface-2)] text-base font-bold active:scale-[0.98]"
        >
          {copied ? <Check className="size-5 text-emerald-600" /> : <Copy className="size-5" />}
          {copied ? 'Link copiado' : 'Copiar el link'}
        </button>

        <button type="button" onClick={skip} className="mt-6 text-sm text-[var(--muted)] underline underline-offset-4">
          Continuar aquí de todos modos
        </button>
      </div>
    </div>
  )
}
