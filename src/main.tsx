import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ErrorBoundary, reloadOnce } from './components/ErrorBoundary'
import { entryRedirect } from './lib/entryUrl'

// Si se publica una versión nueva con la pestaña abierta, los archivos viejos ya no existen y la descarga de una
// página falla. Vite avisa con este evento: se recarga una vez para traer la versión nueva.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadOnce()) event.preventDefault()
})

// Las rutas de la app viven después del «#». Si alguien llega por una dirección limpia que no existe
// (un enlace viejo, por ejemplo), Vercel sirve la app: se pasa esa ruta al hash para que se vea la
// página de «no existe» y no la portada con una dirección equivocada en la barra.
const redirect = entryRedirect(window.location, import.meta.env.BASE_URL)
if (redirect) window.history.replaceState(null, '', redirect)

function mount() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}

// En el navegador integrado de Instagram y otras redes, public/inapp-gate.js muestra «Ábrelo en Safari»:
// la app solo se monta si la persona decide continuar ahí (el paquete ya está descargado, así que es inmediato).
if (window.__inappGate) window.addEventListener('medlogic:continue', mount, { once: true })
else mount()
