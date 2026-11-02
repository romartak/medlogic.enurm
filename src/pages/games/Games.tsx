import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Gamepad2, Grid3x3, Heart, Puzzle, Search, Timer, ToggleLeft, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/ui/primitives'
import { useProgress, type GameId } from '@/store/progress'

export const GAMES: { id: GameId; title: string; description: string; icon: typeof Timer; gradient: string; unit: string }[] = [
  { id: 'contrarreloj', title: 'Contrarreloj', description: '60 segundos. Cada acierto suma tiempo; cada error, resta. ¿Cuántas logras?', icon: Timer, gradient: 'bg-sky-700', unit: 'pts' },
  { id: 'supervivencia', title: 'Supervivencia', description: 'Tres vidas. Responde hasta que se acaben. La dificultad sube con tu racha.', icon: Heart, gradient: 'bg-rose-700', unit: 'aciertos' },
  { id: 'verdadero-falso', title: 'Verdadero o falso', description: 'Afirmaciones rápidas sobre conceptos clave. Decide en un segundo.', icon: ToggleLeft, gradient: 'bg-emerald-700', unit: 'pts' },
  { id: 'parejas', title: 'Parejas clínicas', description: 'Memoria: une cada tóxico con su antídoto, cada signo con su enfermedad.', icon: Puzzle, gradient: 'bg-slate-700', unit: 'pts' },
  { id: 'pistas', title: 'Diagnóstico en 5 pistas', description: 'Las pistas se revelan una a una. Cuanto antes diagnostiques, más puntos.', icon: Search, gradient: 'bg-amber-700', unit: 'pts' },
  { id: 'cuadrantes', title: 'Cuadrantes y órganos', description: '¿Dónde está el bazo? ¿Dónde duele la colecistitis? Toca la región correcta del abdomen.', icon: Grid3x3, gradient: 'bg-orange-700', unit: 'pts' },
]

export default function Games() {
  const highscores = useProgress((s) => s.highscores)
  return (
    <div>
      <PageHeader icon={<Gamepad2 className="size-6" />} title="Juegos" subtitle="Aprender también puede ser divertido. Practica bajo presión y gana XP extra." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => (
          <motion.div key={g.id} initial={{ opacity: 0, y: 16, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 160, damping: 18 }}>
            <Link to={`/juegos/${g.id}`} className="group card card-hover relative flex h-full flex-col overflow-hidden">
              <div className={`relative h-36 overflow-hidden ${g.gradient}`}>
                <motion.div className="absolute -right-6 -bottom-6 text-white/25" whileHover={{ rotate: 12, scale: 1.1 }}>
                  <g.icon className="size-40" strokeWidth={1.5} />
                </motion.div>
                <span className="absolute top-4 left-4 grid size-12 place-items-center rounded-2xl bg-white/20 text-white transition-transform duration-300 group-hover:scale-110">
                  <g.icon className="size-6" />
                </span>
                {highscores[g.id] !== undefined && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-xs font-bold text-white">
                    <Trophy className="size-3.5" /> {highscores[g.id]} {g.unit}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-display text-lg font-bold">{g.title}</h2>
                <p className="mt-1 flex-1 text-sm text-muted">{g.description}</p>
                <span className="mt-4 text-sm font-semibold text-brand-600 transition-transform group-hover:translate-x-1 dark:text-brand-400">Jugar →</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
