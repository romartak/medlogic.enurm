import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { cn, solidBg, tintText } from '@/lib/utils'
import { getSpecialty } from '@/data/specialties'
import { Icon } from './Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-gradient text-white shadow-glow hover:brightness-110 active:brightness-95',
  secondary: 'surface-2 text-[var(--text)] hover:bg-slate-200/70 dark:hover:bg-slate-700/40',
  ghost: 'text-[var(--text)] hover:bg-slate-900/5 dark:hover:bg-white/5',
  outline: 'border border-soft text-[var(--text)] hover:border-brand-500/50 hover:bg-brand-500/5',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
}
const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex select-none items-center justify-center font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,filter,opacity,scale] duration-[var(--t-state)] ease-out active:duration-[var(--t-press)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant, size, className, type = 'button', ...rest }, ref) {
  return <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...rest} />
})

export function LinkButton({ to, variant, size, className, children }: { to: string; variant?: Variant; size?: Size; className?: string; children: ReactNode }) {
  return (
    <Link to={to} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  )
}

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card', className)} {...rest} />
}

export function Badge({ children, color, className }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', !color && 'surface-2 text-muted', className)}
      style={color ? { backgroundColor: `${color}1f`, ...tintText(color) } : undefined}
    >
      {children}
    </span>
  )
}

export function SpecialtyBadge({ id, className }: { id: string; className?: string }) {
  const s = getSpecialty(id)
  return (
    <Badge color={s.color} className={className}>
      <Icon name={s.icon} className="size-3" />
      {s.name}
    </Badge>
  )
}

export function SpecialtyIcon({ id, size = 'md' }: { id: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = getSpecialty(id)
  const box = size === 'sm' ? 'size-8 rounded-lg' : size === 'lg' ? 'size-14 rounded-2xl' : 'size-10 rounded-xl'
  const ic = size === 'sm' ? 'size-4' : size === 'lg' ? 'size-7' : 'size-5'
  return (
    <span className={cn('grid shrink-0 place-items-center', box)} style={{ backgroundColor: `${s.color}1a`, color: s.color }}>
      <Icon name={s.icon} className={ic} />
    </span>
  )
}

export function ProgressBar({ value, className, color, height = 'h-2' }: { value: number; className?: string; color?: string; height?: string }) {
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className={cn('w-full overflow-hidden rounded-full surface-2', height, className)}>
      <motion.div
        className={cn('h-full w-full origin-left rounded-full', !color && 'bg-brand-gradient')}
        style={color ? { backgroundColor: color } : undefined}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: v }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </div>
  )
}

/** Anillo de progreso circular animado. */
export function Ring({ value, size = 120, stroke = 10, color = 'url(#ring-grad)', track = 'var(--surface-2)', children }: { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#12b8a6" />
            <stop offset="100%" stopColor="#066a60" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

export function PageHeader({ title, subtitle, icon, actions, eyebrow }: { title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {icon && <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">{icon}</div>}
        <div>
          {eyebrow && <div className="mb-1 text-xs font-semibold tracking-wider text-brand-600 uppercase dark:text-brand-400">{eyebrow}</div>}
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </motion.header>
  )
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-2xl surface-2 text-brand-500">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {body && <p className="mt-1 max-w-md text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function StatCard({ icon, label, value, hint, color = '#06c4b0', delay = 0 }: { icon: ReactNode; label: string; value: ReactNode; hint?: ReactNode; color?: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card p-3.5 sm:p-5">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl sm:size-10" style={{ backgroundColor: `${color}1a`, color }}>
          {icon}
        </span>
        <span className="min-w-0 text-xs leading-tight font-medium text-muted sm:text-sm">{label}</span>
      </div>
      <div className="mt-2.5 font-display text-xl font-bold tabular-nums sm:mt-3 sm:text-3xl">{value}</div>
      {hint && <div className="mt-0.5 text-xs leading-snug text-muted sm:mt-1">{hint}</div>}
    </motion.div>
  )
}

export function Segmented<T extends string | number>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; className?: string }) {
  return (
    <div className={cn('inline-flex rounded-xl surface-2 p-1', className)} role="radiogroup">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn('relative rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm', active ? 'text-[var(--text)]' : 'text-muted hover:text-[var(--text)]')}
          >
            {active && <motion.span layoutId={`seg-${options.map((x) => x.value).join('')}`} className="absolute inset-0 rounded-lg bg-[var(--surface)] shadow-sm" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700')}
      >
        <motion.span layout className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow', checked ? 'right-0.5' : 'left-0.5')} transition={{ type: 'spring', stiffness: 600, damping: 35 }} />
      </button>
    </label>
  )
}

export function Chip({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: ReactNode; color?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-all after:absolute after:inset-x-0 after:-inset-y-[5px]',
        active ? 'border-transparent text-white shadow-sm' : 'border-soft text-muted hover:border-brand-500/40 hover:text-[var(--text)]',
      )}
      style={active ? solidBg(color ?? 'var(--color-brand-500)') : undefined}
    >
      {children}
    </button>
  )
}
