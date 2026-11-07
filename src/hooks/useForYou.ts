import { useMemo } from 'react'
import { ALL_NAV, type NavItem } from '@/components/layout/nav'
import { topInterests } from '@/lib/interest'
import { useInterest } from '@/store/interest'

/** Mínimo de minutos de uso para empezar a personalizar el menú. */
const MIN_MINUTES = 3

/** Las secciones que más usa la persona, como accesos directos del menú. Vacío mientras se conoce poco. */
export function useForYou(max = 4): NavItem[] {
  const usage = useInterest((s) => s.usage)
  return useMemo(() => {
    const top = topInterests(usage, max)
    if (top.reduce((a, t) => a + t.minutes, 0) < MIN_MINUTES) return []
    return top.map((t) => ALL_NAV.find((n) => n.to === t.to)).filter((n): n is NavItem => !!n)
  }, [usage, max])
}
