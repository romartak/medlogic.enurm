import { useEffect } from 'react'
import { useProgress } from '@/store/progress'

/** Sincroniza la clase .dark del <html> con el ajuste de tema. */
export function useThemeSync() {
  const theme = useProgress((s) => s.settings.theme)
  const reduceMotion = useProgress((s) => s.settings.reduceMotion)

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#070b14' : '#0d9488')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion)
  }, [reduceMotion])
}

export function useIsDark() {
  const theme = useProgress((s) => s.settings.theme)
  if (theme === 'system') return typeof window !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
  return theme === 'dark'
}
