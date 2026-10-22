import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Bot, Brain, Calendar, Cloud, Crown, Database, Download, Flame, Gamepad2, Gauge, Ghost, Glasses, GraduationCap, Headphones, Heart, HeartPulse, Layers, LayoutGrid, Lightbulb, MessageCircle, Microscope, Moon, PersonStanding,
  Rocket, Scan, School, Siren, Smartphone, Sparkles, Swords, Target, Trophy, Users, Video, WandSparkles, type LucideIcon,
} from 'lucide-react'
import { ROADMAP } from '@/data/roadmap'
import { Card, PageHeader } from '@/components/ui/primitives'
import { GithubIcon } from '@/components/ui/Logo'
import { REPO_URL } from '@/components/layout/AppLayout'
import { cn } from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = {
  calendar: Calendar, layers: Layers, grid: LayoutGrid, microscope: Microscope, gamepad: Gamepad2, database: Database, flame: Flame, graduation: GraduationCap, gauge: Gauge, brain: Brain, sparkles: Sparkles, download: Download,
  phone: Smartphone, cloud: Cloud, trophy: Trophy, swords: Swords, users: Users, heart: Heart, message: MessageCircle, school: School, bot: Bot, 'heart-pulse': HeartPulse, siren: Siren, body: PersonStanding, crown: Crown,
  target: Target, headphones: Headphones, video: Video, scan: Scan, glasses: Glasses, ghost: Ghost, moon: Moon, wand: WandSparkles,
}

const LIKES_KEY = 'medlogic-roadmap-likes'

function loadLikes(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIKES_KEY) ?? '[]')
  } catch {
    return []
  }
}

export default function Roadmap() {
  const [likes, setLikes] = useState<string[]>(loadLikes)
  const toggle = (t: string) => {
    const next = likes.includes(t) ? likes.filter((x) => x !== t) : [...likes, t]
    setLikes(next)
    try {
      localStorage.setItem(LIKES_KEY, JSON.stringify(next))
    } catch {
      /* almacenamiento no disponible */
    }
  }

  return (
    <div>
      <PageHeader icon={<Rocket className="size-6" />} eyebrow="Hoja de ruta" title="Lo que viene" subtitle="Hacia dónde va MedLogic ENURM. Marca con ♥ lo que más te interesa y propón ideas en GitHub." />

      <div className="relative space-y-12">
        {ROADMAP.map((stage, si) => (
          <section key={stage.id}>
            <div className="mb-5 flex items-center gap-3">
              <span className="relative grid size-11 place-items-center rounded-2xl font-display text-lg font-extrabold text-white shadow-lg" style={{ backgroundColor: stage.color }}>
                {si + 1}
                {stage.id === 'hecho' && <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-white text-[10px] text-emerald-600 shadow">✓</span>}
              </span>
              <div>
                <h2 className="font-display text-xl font-bold">{stage.name}</h2>
                <div className="text-xs font-semibold" style={{ color: stage.color }}>
                  {stage.when}
                </div>
              </div>
            </div>
            <div className={cn('grid gap-3 sm:grid-cols-2', stage.id === 'locuras' ? 'lg:grid-cols-3' : 'lg:grid-cols-4')}>
              {stage.items.map((it, i) => {
                const Icon = ICONS[it.icon] ?? Lightbulb
                const liked = likes.includes(it.title)
                return (
                  <motion.div
                    key={it.title}
                    initial={{ opacity: 0, y: 16, rotate: stage.id === 'locuras' ? (i % 2 ? 1 : -1) : 0 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: (i % 4) * 0.06, type: 'spring', stiffness: 160, damping: 20 }}
                    className={cn('card card-hover group relative flex flex-col overflow-hidden p-5', stage.id === 'locuras' && 'bg-gradient-to-br from-[var(--surface)] to-pink-500/[0.04]')}
                  >
                    <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-30" style={{ backgroundColor: stage.color }} />
                    <div className="flex items-start justify-between">
                      <span className="grid size-10 place-items-center rounded-xl transition-transform group-hover:scale-110 group-hover:-rotate-6" style={{ backgroundColor: `${stage.color}1a`, color: stage.color }}>
                        <Icon className="size-5" />
                      </span>
                      {stage.id !== 'hecho' && (
                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggle(it.title)} className={cn('rounded-full px-2 py-1 text-xs font-semibold transition-colors', liked ? 'bg-pink-500/15 text-pink-600' : 'text-muted hover:text-pink-500')} aria-pressed={liked} aria-label="Me interesa">
                          {liked ? '♥' : '♡'}
                        </motion.button>
                      )}
                    </div>
                    <h3 className="mt-3 font-semibold">{it.title}</h3>
                    <p className="mt-1 text-sm text-muted">{it.body}</p>
                  </motion.div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <Card className="mt-12 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <GithubIcon className="size-10 shrink-0" />
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold">¿Tienes una idea?</h2>
          <p className="text-sm text-muted">MedLogic es gratis y de código abierto. Propón funciones, reporta errores o contribuye con contenido.</p>
        </div>
        <a href={`${REPO_URL}/issues/new?title=${encodeURIComponent('Idea: ')}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-white">
          Proponer una idea
        </a>
      </Card>
    </div>
  )
}
