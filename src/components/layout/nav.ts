import { BookOpen, CalendarDays, ChartColumn, Gamepad2, GraduationCap, House, Layers, Library, Newspaper, RotateCcw, Settings, Target, Trophy, Upload, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  description: string
}

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Estudiar',
    items: [
      { to: '/inicio', label: 'Inicio', icon: House, description: 'Tu resumen del día' },
      { to: '/practica', label: 'Práctica', icon: Target, description: 'Preguntas con retroalimentación inmediata' },
      { to: '/simulacro', label: 'Simulacro', icon: GraduationCap, description: 'Examen cronometrado tipo ENURM' },
      { to: '/flashcards', label: 'Flashcards', icon: Layers, description: 'Repetición espaciada' },
      { to: '/guias', label: 'Guías', icon: BookOpen, description: 'Resúmenes de alto rendimiento' },
    ],
  },
  {
    title: 'Explorar',
    items: [
      { to: '/banco', label: 'Banco de preguntas', icon: Library, description: 'Busca y filtra todas las preguntas' },
      { to: '/repaso', label: 'Repaso', icon: RotateCcw, description: 'Errores, marcadas y notas' },
      { to: '/juegos', label: 'Juegos', icon: Gamepad2, description: 'Aprende jugando' },
      { to: '/actualizaciones', label: 'Actualizaciones', icon: Newspaper, description: 'Cambios recientes en guías' },
    ],
  },
  {
    title: 'Progreso',
    items: [
      { to: '/estadisticas', label: 'Estadísticas', icon: ChartColumn, description: 'Tu rendimiento en detalle' },
      { to: '/plan', label: 'Plan de estudio', icon: CalendarDays, description: 'Cuenta regresiva y pomodoro' },
      { to: '/logros', label: 'Logros', icon: Trophy, description: 'Niveles y medallas' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { to: '/importar', label: 'Importar preguntas', icon: Upload, description: 'Carga tu base de datos' },
      { to: '/ajustes', label: 'Ajustes', icon: Settings, description: 'Tema, metas y respaldo' },
    ],
  },
]

export const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items)
