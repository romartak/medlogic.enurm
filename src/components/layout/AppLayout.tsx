import { useEffect, useState } from 'react'
import { Navigate, NavLink, useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Flame, Menu, Moon, Search, Sun, Monitor, X, Zap } from 'lucide-react'
import { NAV_GROUPS, ALL_NAV, MOBILE_TABS } from './nav'
import { Logo, GithubIcon } from '@/components/ui/Logo'
import { CommandPalette } from './CommandPalette'
import { useProgress, levelFromXp } from '@/store/progress'
import { computeStreak } from '@/lib/stats'
import { cn } from '@/lib/utils'
import type { Theme } from '@/types'

export const REPO_URL = 'https://github.com/romartak/medlogic.enurm'

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-6">
      {NAV_GROUPS.map((g) => (
        <div key={g.title}>
          <div className="mb-2 px-3 text-[10px] font-bold tracking-[0.18em] text-muted uppercase">{g.title}</div>
          <ul className="flex flex-col gap-0.5">
            {g.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                      isActive ? 'text-brand-700 dark:text-brand-300' : 'text-muted hover:bg-slate-900/[0.04] hover:text-[var(--text)] dark:hover:bg-white/[0.04]',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <motion.span layoutId={onNavigate ? 'nav-active-m' : 'nav-active'} className="absolute inset-0 rounded-xl bg-brand-500/10 ring-1 ring-brand-500/20" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                      <item.icon className="relative size-[18px]" />
                      <span className="relative">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function ThemeButton() {
  const theme = useProgress((s) => s.settings.theme)
  const update = useProgress((s) => s.updateSettings)
  const next: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' }
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  const label = theme === 'light' ? 'Tema claro' : theme === 'dark' ? 'Tema oscuro' : 'Tema del sistema'
  return (
    <button onClick={() => update({ theme: next[theme] })} className="grid size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-slate-900/5 hover:text-[var(--text)] dark:hover:bg-white/5" aria-label={label} title={label}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
          <Icon className="size-[18px]" />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function UserChip() {
  const xp = useProgress((s) => s.xp)
  const activity = useProgress((s) => s.activity)
  const streak = computeStreak(activity)
  const { level, progress } = levelFromXp(xp)
  return (
    <NavLink to="/logros" className="flex items-center gap-2 rounded-xl py-1 pr-1 pl-2 transition-colors hover:bg-slate-900/5 dark:hover:bg-white/5">
      <span className={cn('flex items-center gap-1 text-sm font-bold', streak > 0 ? 'text-orange-500' : 'text-muted')} title="Racha de días">
        <Flame className={cn('size-4', streak > 0 && 'fill-orange-500/30')} />
        {streak}
      </span>
      <span className="relative grid size-9 place-items-center">
        <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
          <circle cx="18" cy="18" r="16" fill="none" stroke="var(--surface-2)" strokeWidth="3" />
          <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-brand-500)" strokeWidth="3" strokeLinecap="round" strokeDasharray={100.5} strokeDashoffset={100.5 * (1 - progress)} />
        </svg>
        <span className="text-xs font-bold">{level}</span>
      </span>
    </NavLink>
  )
}

export function AppLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const outlet = useOutlet()
  const profile = useProgress((s) => s.profile)
  const current = ALL_NAV.find((n) => location.pathname.startsWith(n.to))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  // Primera visita: cuestionario para personalizar el plan.
  if (!profile.completed && !profile.skipped) return <Navigate to="/bienvenida" replace />

  return (
    <div className="min-h-dvh">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-mesh" />

      {/* Barra lateral (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-soft bg-[var(--surface)]/70 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center px-5">
          <NavLink to="/">
            <Logo />
          </NavLink>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pt-2 pb-6">
          <SidebarNav />
        </div>
        <div className="border-t border-soft p-4">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-muted hover:text-[var(--text)]">
            <GithubIcon className="size-4" />
            Gratis y de código abierto
          </a>
        </div>
      </aside>

      {/* Menú lateral (móvil) */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[var(--surface)] shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            >
              <div className="flex h-16 items-center justify-between px-5">
                <Logo />
                <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 text-muted" aria-label="Cerrar menú">
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-8">
                <SidebarNav onNavigate={() => setDrawerOpen(false)} />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        {/* Barra superior */}
        <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setDrawerOpen(true)} className="-ml-2 grid size-10 place-items-center rounded-xl text-muted lg:hidden" aria-label="Abrir menú">
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1 lg:hidden">
              <span className="truncate font-display font-bold">{current?.label ?? 'MedLogic'}</span>
            </div>
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden h-10 w-full max-w-md items-center gap-3 rounded-xl border border-soft surface-2 px-3 text-sm text-muted transition-colors hover:border-brand-500/40 lg:flex"
            >
              <Search className="size-4" />
              <span className="flex-1 text-left">Buscar preguntas, guías, páginas…</span>
              <span className="kbd">Ctrl</span>
              <span className="kbd -ml-2">K</span>
            </button>
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => setPaletteOpen(true)} className="grid size-10 place-items-center rounded-xl text-muted lg:hidden" aria-label="Buscar">
                <Search className="size-[18px]" />
              </button>
              <ThemeButton />
              <UserChip />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileTabBar />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

function MobileTabBar() {
  const tabs = MOBILE_TABS
  return (
    <nav className="glass fixed inset-x-3 bottom-3 z-30 rounded-2xl shadow-lift lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="grid grid-cols-5">
        {tabs.map((t) => (
          <li key={t.to}>
            <NavLink to={t.to} className={({ isActive }) => cn('relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors', isActive ? 'text-brand-600 dark:text-brand-400' : 'text-muted')}>
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="tab-active" className="absolute inset-x-3 inset-y-1 rounded-xl bg-brand-500/10" />}
                  <t.icon className="relative size-5" />
                  <span className="relative">{t.label === 'Especialidades' ? 'Áreas' : t.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function XpPill({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
      <Zap className="size-3 fill-current" />+{amount} XP
    </span>
  )
}
