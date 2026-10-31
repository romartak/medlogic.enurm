import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Las rutas de la app viven después del «#». Si alguien llega por una dirección limpia que no existe
// (un enlace viejo, por ejemplo), Vercel sirve la app: se pasa esa ruta al hash para que se vea la
// página de «no existe» y no la portada con una dirección equivocada en la barra.
const base = import.meta.env.BASE_URL
const path = window.location.pathname
if (!window.location.hash && path !== base && path !== `${base}index.html`) {
  window.history.replaceState(null, '', `${base}#${path}`)
}

function mount() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// En el navegador integrado de Instagram y otras redes, public/inapp-gate.js muestra «Ábrelo en Safari»:
// la app solo se monta si la persona decide continuar ahí (el paquete ya está descargado, así que es inmediato).
if (window.__inappGate) window.addEventListener('medlogic:continue', mount, { once: true })
else mount()
