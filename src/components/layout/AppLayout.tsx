import { LocalProgressLine } from '@/components/AccountNote'
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Flame, LogIn, Moon, Search, Sun, Monitor, UserRound, Zap } from 'lucide-react'
import { NAV_GROUPS, ALL_NAV, MOBILE_TABS } from './nav'
import { Logo, GithubIcon } from '@/components/ui/Logo'
import { CommandPalette } from './CommandPalette'
import { FunctionsSheet, FunctionsTab } from './MobileMenu'
import { useProgress, levelFromXp } from '@/store/progress'
import { useAuth } from '@/store/auth'
import { Avatar } from '@/components/ui/Avatar'
import { useMyAvatar } from '@/components/AvatarPicker'
import { computeStreak } from '@/lib/stats'
import { cn, daysBetween } from '@/lib/utils'
import { enurmDate, formatEnurmDate, upcomingEnurm } from '@/data/enurm'
import type { Theme } from '@/types'

export const REPO_URL = 'https://github.com/romartak/medlogic.enurm'

/** Cuenta regresiva compacta al ENURM de la convocatoria elegida (o al próximo). */
function ExamChip() {
  const profile = useProgress((s) => s.profile)
  const exam = profile.examYear ? enurmDate(profile.examYear) : upcomingEnurm(1)[0]
  const days = daysBetween(new Date(), exam.date)
  if (days < 0) return null
  return (
    <NavLink to="/plan" className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.04]">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-gradient font-display text-sm font-extrabold text-white tabular-nums">{days > 999 ? '99+' : days}</span>
      <span className="min-w-0 text-xs leading-tight">
        <span className="block font-semibold">{days === 0 ? '¡Hoy es el ENURM!' : `días para el ENURM ${exam.year}`}</span>
        <span className="block truncate text-muted first-letter:uppercase">{formatEnurmDate(exam, { weekday: true })}</span>
      </span>
    </NavLink>
  )
}

function SidebarNav() {
  return (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((g) => (
        <div key={g.title}>
          <div className="mb-1.5 px-3 text-xs font-bold tracking-[0.18em] text-muted uppercase">{g.title}</div>
          <ul className="flex flex-col gap-0.5">
            {g.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-[7px] text-sm font-medium transition-colors',
                      isActive ? 'text-brand-700 dark:text-brand-300' : 'text-muted hover:bg-slate-900/[0.04] hover:text-[var(--text)] dark:hover:bg-white/[0.04]',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-brand-500/10 ring-1 ring-brand-500/20" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
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

/** Acceso a la cuenta: inicial del usuario si hay sesión, «Entrar» si no. Oculto si Supabase no está configurado. */
function AccountButton() {
  const status = useAuth((s) => s.status)
  const sync = useAuth((s) => s.sync)
  const { avatar, initial } = useMyAvatar()
  if (status === 'disabled' || status === 'loading') return null
  if (status === 'signed-out')
    return (
      <NavLink to="/cuenta" state={{ mode: 'signin' }} className="ml-1 inline-flex h-11 items-center gap-1.5 rounded-xl bg-brand-gradient px-3 text-xs font-semibold text-white shadow-glow">
        <LogIn className="size-4" /> <span className="max-sm:hidden">Iniciar sesión</span>
      </NavLink>
    )
  return (
    <NavLink to="/ajustes" className="relative ml-1 block size-9 shrink-0 before:absolute before:-inset-1" aria-label="Configuración y cuenta">
      <Avatar avatar={avatar} initial={initial} className="size-9 text-sm">
        <UserRound className="size-4" />
      </Avatar>
      {(sync === 'error' || sync === 'offline' || sync === 'conflict') && <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-[var(--surface)] bg-amber-500" aria-label="Sincronización pendiente" />}
    </NavLink>
  )
}

const STUDY_SECTIONS = ['/plan', '/especialidades', '/practica', '/simulacro', '/casos', '/flashcards', '/terminologia', '/guias', '/banco', '/repaso', '/juegos', '/ecg', '/herramientas']

export function AppLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [functionsOpen, setFunctionsOpen] = useState(false)
  const location = useLocation()
  const outlet = useOutlet()
  const current = ALL_NAV.find((n) => location.pathname.startsWith(n.to))
  const recovering = useAuth((s) => s.recovering)
  const authStatus = useAuth((s) => s.status)
  const syncState = useAuth((s) => s.sync)
  const navigate = useNavigate()

  // Tras abrir el enlace de «olvidé mi contraseña», pedir la nueva.
  useEffect(() => {
    if (recovering && location.pathname !== '/cuenta') navigate('/cuenta')
  }, [recovering, location.pathname, navigate])

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

  // Se recuerda la última sección de estudio usada; viaja con el progreso a la nube. No se anota
  // hasta que la cuenta esté sincronizada, para no pisar lo que ya hay guardado en la nube.
  const setLastSection = useProgress((s) => s.setLastSection)
  useEffect(() => {
    if (authStatus !== 'signed-in' || syncState !== 'synced') return
    const section = '/' + location.pathname.split('/')[1]
    if (STUDY_SECTIONS.includes(section)) setLastSection(section)
  }, [location.pathname, authStatus, syncState, setLastSection])

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
        <div className="flex-1 overflow-y-auto px-3 pt-1 pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-28px),transparent)]">
          <SidebarNav />
        </div>
        <div className="border-t border-soft p-3">
          <ExamChip />
          <LocalProgressLine className="mt-2 px-1" />
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Barra superior */}
        <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
            <div className='min-w-0 flex-1 lg:hidden'>
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
              <AccountButton />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileTabBar onOpenFunctions={() => setFunctionsOpen(true)} functionsOpen={functionsOpen} />
      <FunctionsSheet
        open={functionsOpen}
        onClose={() => setFunctionsOpen(false)}
        footer={
          <div className="space-y-1">
            <ExamChip />
            <LocalProgressLine className="px-2" />
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-2 py-2 text-xs text-muted hover:text-[var(--text)]">
              <GithubIcon className="size-4" /> Gratis y de código abierto
            </a>
          </div>
        }
      />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

/** Píldora flotante: solo íconos y la pestaña activa muestra su nombre. Sube con el borde seguro del iPhone en vez de dejar un hueco dentro. */
function MobileTabBar({ onOpenFunctions, functionsOpen }: { onOpenFunctions: () => void; functionsOpen: boolean }) {
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex justify-center px-3 lg:hidden">
      <ul className="glass flex items-center gap-0.5 rounded-full p-1.5 shadow-lift">
        {MOBILE_TABS.map((t) => (
          <li key={t.to}>
            <NavLink to={t.to} aria-label={t.label} className={({ isActive }) => cn('relative flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors', isActive && !functionsOpen ? 'text-brand-600 dark:text-brand-400' : 'text-muted')}>
              {({ isActive }) => {
                const on = isActive && !functionsOpen
                return (
                  <>
                    {on && <motion.span layoutId="tab-active" transition={{ type: 'spring', stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full bg-brand-500/15" />}
                    <t.icon className="relative size-5 shrink-0" />
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} className="relative overflow-hidden whitespace-nowrap">
                          {t.label === 'Flashcards' ? 'Tarjetas' : t.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )
              }}
            </NavLink>
          </li>
        ))}
        <li>
          <FunctionsTab active={functionsOpen} onClick={onOpenFunctions} />
        </li>
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
