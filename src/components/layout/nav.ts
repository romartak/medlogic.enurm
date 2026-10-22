import { BookOpen, Calculator, CalendarCheck, ChartColumn, Compass, Gamepad2, GraduationCap, House, Layers, LayoutGrid, Library, Newspaper, RotateCcw, Settings, Target, Trophy, type LucideIcon } from 'lucide-react'

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
      { to: '/plan', label: 'Mi plan', icon: CalendarCheck, description: 'Plan diario personalizado' },
      { to: '/especialidades', label: 'Especialidades', icon: LayoutGrid, description: 'Un espacio por cada área del examen' },
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
      { to: '/herramientas', label: 'Herramientas', icon: Calculator, description: 'Calculadoras y escalas clínicas' },
      { to: '/actualizaciones', label: 'Actualizaciones', icon: Newspaper, description: 'Cambios recientes en guías' },
      { to: '/como-prepararte', label: 'Cómo prepararte', icon: Compass, description: 'Estrategia, fases y consejos' },
    ],
  },
  {
    title: 'Progreso',
    items: [
      { to: '/estadisticas', label: 'Estadísticas', icon: ChartColumn, description: 'Tu rendimiento en detalle' },
      { to: '/logros', label: 'Logros', icon: Trophy, description: 'Niveles y medallas' },
      { to: '/ajustes', label: 'Ajustes', icon: Settings, description: 'Perfil, tema y respaldo' },
    ],
  },
]

export const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items)

/** Pestañas de la barra inferior en móvil. */
export const MOBILE_TABS = ['/inicio', '/plan', '/especialidades', '/practica', '/flashcards'].map((to) => ALL_NAV.find((n) => n.to === to)!)
