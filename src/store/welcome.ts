import { create } from 'zustand'

/**
 * Pantalla de bienvenida a pantalla completa: «new» tras crear una cuenta (con un cuestionario corto para
 * completar el perfil) y «back» al volver a entrar (saludo breve con la animación de la marca).
 */
interface WelcomeState {
  kind: 'new' | 'back' | null
  start: (kind: 'new' | 'back') => void
  close: () => void
}

export const useWelcome = create<WelcomeState>()((set, get) => ({
  kind: null,
  // Una cuenta nueva no se pisa con el saludo de «de vuelta».
  start: (kind) => set({ kind: get().kind === 'new' ? 'new' : kind }),
  close: () => set({ kind: null }),
}))
