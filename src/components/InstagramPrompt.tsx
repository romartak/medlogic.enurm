import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { LogoMark } from '@/components/ui/Logo'
import { buttonClass } from '@/components/ui/primitives'

export const INSTAGRAM_USER = 'medlogic.ai'
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USER}/`

const SEEN_KEY = 'medlogic-instagram-asked'
/** Espera tras abrir la página, para no tapar la portada nada más entrar. */
const DELAY_MS = 2500

function alreadyAsked() {
  try {
    return localStorage.getItem(SEEN_KEY) !== null
  } catch {
    return true
  }
}

function remember(answer: 'si' | 'no' | 'cerrado') {
  try {
    localStorage.setItem(SEEN_KEY, answer)
  } catch {
    /* sin almacenamiento: se vuelve a preguntar la próxima vez */
  }
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Pregunta una sola vez por navegador si la persona sigue la cuenta de Instagram. */
export function InstagramPrompt() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (alreadyAsked()) return
    const t = setTimeout(() => setOpen(true), DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  const close = (answer: 'si' | 'no' | 'cerrado') => {
    remember(answer)
    setOpen(false)
  }

  return (
    <Modal open={open} onClose={() => close('cerrado')} className="sm:max-w-sm">
      <div className="-mt-6 text-center">
        <div className="relative mx-auto w-fit">
          <LogoMark className="size-16" />
          <span className="absolute -right-2 -bottom-2 grid size-8 place-items-center rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-violet-600 text-white ring-4 ring-[var(--surface)]">
            <InstagramIcon className="size-4" />
          </span>
        </div>
        <h2 className="mt-5 font-display text-xl font-extrabold tracking-tight">¿Me sigues en Instagram?</h2>
        <p className="mt-2 text-sm text-muted">
          Ahí comparto tips para el ENURM y las novedades de MedLogic. Seguirme es la mejor forma de apoyar que la plataforma siga siendo gratis.
        </p>
        <div className="mt-2 text-sm font-semibold text-brand-600 dark:text-brand-400">@{INSTAGRAM_USER}</div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => close('si')} className={buttonClass('secondary', 'md', 'w-full')}>
            Sí, ya te sigo
          </button>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => close('no')}
            className={buttonClass('primary', 'md', 'w-full')}
          >
            <InstagramIcon className="size-4" /> Aún no
          </a>
        </div>
        <p className="mt-3 text-xs text-muted">«Aún no» te lleva a mi perfil para que me sigas.</p>
      </div>
    </Modal>
  )
}
