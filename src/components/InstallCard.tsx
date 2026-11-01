import { useEffect, useState } from 'react'
import { Download, Share, SquarePlus, X } from 'lucide-react'
import { Button, Card } from '@/components/ui/primitives'
import { countVisit, platformOf, readDismissed, shouldOfferInstall, writeDismissed, type InstallPlatform } from '@/lib/install'

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Invita a instalar MedLogic como app, después de unas visitas. En Android y Chrome usa el aviso nativo;
 * en iPhone no existe, así que explica los dos toques de Safari. No sale dentro de la app ya instalada.
 */
export function InstallCard() {
  const [platform] = useState<InstallPlatform>(() => platformOf(navigator.userAgent, navigator.maxTouchPoints))
  const [event, setEvent] = useState<InstallEvent | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
    const visits = countVisit(localStorage, sessionStorage)
    setShow(shouldOfferInstall({ visits, standalone, dismissedAt: readDismissed(localStorage) }))
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e as InstallEvent)
    }
    const onInstalled = () => setShow(false)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  // En escritorio y navegadores sin aviso nativo no hay nada útil que ofrecer.
  if (!show || (platform !== 'ios' && !event)) return null

  const dismiss = () => {
    writeDismissed(localStorage)
    setShow(false)
  }
  const install = async () => {
    if (!event) return
    await event.prompt()
    const { outcome } = await event.userChoice
    if (outcome === 'dismissed') writeDismissed(localStorage)
    setShow(false)
  }

  return (
    <Card className="relative p-5">
      <button onClick={dismiss} aria-label="Ahora no" className="absolute top-3 right-3 grid size-9 place-items-center rounded-full text-muted hover:bg-[var(--surface-2)]">
        <X className="size-4" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" width={44} height={44} className="size-11 shrink-0 rounded-xl" />
        <div>
          <h2 className="font-semibold">Ten MedLogic en tu pantalla de inicio</h2>
          <p className="mt-0.5 text-sm text-muted">Se abre como una app, sin barra del navegador y más rápido.</p>
        </div>
      </div>
      {platform === 'ios' ? (
        <ol className="mt-4 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Share className="size-4 shrink-0 text-brand-600" /> Toca <b>Compartir</b> en la barra de Safari
          </li>
          <li className="flex items-center gap-2">
            <SquarePlus className="size-4 shrink-0 text-brand-600" /> Elige <b>«Agregar a inicio»</b>
          </li>
        </ol>
      ) : (
        <Button onClick={install} className="mt-4">
          <Download className="size-4" /> Instalar la app
        </Button>
      )}
    </Card>
  )
}
