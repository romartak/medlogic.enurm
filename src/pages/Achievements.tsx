import { motion } from 'motion/react'
import { Lock, Trophy, Zap } from 'lucide-react'
import { ACHIEVEMENTS } from '@/data/achievements'
import { useProgress, levelFromXp, levelTitle } from '@/store/progress'
import { Card, PageHeader, ProgressBar, Ring } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'
import { cn, formatDate } from '@/lib/utils'

export default function Achievements() {
  const xp = useProgress((s) => s.xp)
  const unlocked = useProgress((s) => s.achievements)
  const lvl = levelFromXp(xp)
  const count = Object.keys(unlocked).length

  return (
    <div>
      <PageHeader icon={<Trophy className="size-6" />} title="Logros" subtitle="Cada pregunta suma experiencia. Sube de nivel y desbloquea medallas." />

      <Card className="mb-8 flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
        <Ring value={lvl.progress} size={150} stroke={12}>
          <div>
            <div className="text-xs font-semibold text-muted uppercase">Nivel</div>
            <div className="font-display text-5xl font-extrabold">{lvl.level}</div>
          </div>
        </Ring>
        <div className="flex-1 text-center sm:text-left">
          <div className="text-sm font-semibold text-brand-600 dark:text-brand-400">{levelTitle(lvl.level)}</div>
          <div className="mt-1 flex items-center justify-center gap-2 font-display text-3xl font-bold sm:justify-start">
            <Zap className="size-7 fill-amber-400 text-amber-400" /> {xp.toLocaleString('es-DO')} XP
          </div>
          <p className="mt-1 text-sm text-muted">
            Te faltan {lvl.needed - lvl.current} XP para el nivel {lvl.level + 1} ({levelTitle(lvl.level + 1)}).
          </p>
          <ProgressBar value={lvl.progress} className="mt-4" />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-muted">
            <div className="rounded-xl surface-2 p-2">
              <b className="block text-base text-[var(--text)]">+10</b> por acierto
            </div>
            <div className="rounded-xl surface-2 p-2">
              <b className="block text-base text-[var(--text)]">+3</b> por flashcard
            </div>
            <div className="rounded-xl surface-2 p-2">
              <b className="block text-base text-[var(--text)]">+30</b> por simulacro
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Medallas</h2>
        <span className="text-sm text-muted">
          {count} / {ACHIEVEMENTS.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ACHIEVEMENTS.map((a, i) => {
          const at = unlocked[a.id]
          return (
            <motion.div key={a.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} whileHover={at ? { y: -4, rotate: -1 } : {}} className={cn('card relative flex flex-col items-center p-5 text-center', !at && 'opacity-70')}>
              <div className={cn('relative grid size-16 place-items-center rounded-2xl', at ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 text-white shadow-lg' : 'surface-2 text-muted')}>
                <Icon name={a.icon} className="size-7" />
                {!at && (
                  <span className="absolute -right-1.5 -bottom-1.5 grid size-6 place-items-center rounded-full bg-[var(--surface)] shadow">
                    <Lock className="size-3.5" />
                  </span>
                )}
              </div>
              <div className="mt-3 text-sm font-bold">{a.title}</div>
              <div className="mt-1 text-xs text-muted">{a.description}</div>
              <div className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">{at ? formatDate(at) : `+${a.xp} XP`}</div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
