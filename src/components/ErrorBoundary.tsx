import { Component, type ErrorInfo, type ReactNode } from 'react'

const RELOAD_KEY = 'medlogic-recarga'

/** Error de «no se pudo bajar un archivo de la app»: pasa cuando se publica una versión nueva con la pestaña abierta. */
export function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err ?? '')
  return /dynamically imported module|Importing a module script failed|Failed to fetch dynamically|error loading dynamically|ChunkLoadError|Unable to preload CSS/i.test(msg)
}

/**
 * Recarga la página una sola vez por minuto como máximo (evita un bucle si el fallo no es de versión).
 * Devuelve true si recargó.
 */
export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0)
    if (Date.now() - last < 60_000) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    /* sin sessionStorage: se recarga igual, una vez por fallo */
  }
  window.location.reload()
  return true
}

interface State {
  error: unknown
}

/**
 * Evita la pantalla en blanco: si una página falla al dibujarse o al descargarse, se muestra un aviso con
 * botón para recargar. Si el fallo es de versión nueva (archivo que ya no existe), recarga sola.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: unknown): State {
    return { error }
  }

  componentDidCatch(error: unknown, _info: ErrorInfo) {
    if (isChunkLoadError(error)) reloadOnce()
  }

  render() {
    if (this.state.error == null) return this.props.children
    return (
      <div role="alert" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 text-center">
        <h1 className="text-2xl font-extrabold">Algo salió mal</h1>
        <p className="mt-3 text-pretty text-muted">
          {isChunkLoadError(this.state.error)
            ? 'Hay una versión nueva de MedLogic. Recarga la página para continuar; tu progreso está a salvo.'
            : 'Esta pantalla no pudo cargarse. Recarga la página; tu progreso está a salvo.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mx-auto mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-6 font-semibold text-white"
        >
          Recargar la página
        </button>
      </div>
    )
  }
}
