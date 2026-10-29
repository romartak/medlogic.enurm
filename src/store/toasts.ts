import { create } from 'zustand'

export interface Toast {
  id: number
  kind: 'achievement' | 'success' | 'info' | 'error'
  title: string
  body?: string
  icon?: string
  /** Logros desbloqueados juntos en este aviso. */
  count?: number
}

interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = nextId++
    set({ toasts: [...get().toasts, { ...t, id }].slice(-4) })
    setTimeout(() => get().dismiss(id), t.kind === 'achievement' ? 5000 : 3500)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))

export const toast = (t: Omit<Toast, 'id'>) => useToasts.getState().push(t)
