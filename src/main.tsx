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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
