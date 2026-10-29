import { Bone, Droplet, Flag, Hand, HeartPulse, Languages, Medal, MonitorDot, Siren, Stethoscope, Swords, UserRound, BookOpen, Calculator, Rocket, Sparkles, WandSparkles, Wind, CalendarCheck, ChartColumn, Compass, Gamepad2, GraduationCap, House, Layers, LayoutGrid, Library, Newspaper, RotateCcw, Settings, Target, Trophy, type LucideIcon } from 'lucide-react'

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
      { to: '/simulacro-nacional', label: 'Simulacro nacional', icon: Flag, description: 'El mismo examen para todo el país cada mes, con percentil' },
      { to: '/casos', label: 'Casos clínicos', icon: Stethoscope, description: 'Decide paso a paso como en la guardia' },
      { to: '/flashcards', label: 'Flashcards', icon: Layers, description: 'Repetición espaciada' },
      { to: '/terminologia', label: 'Terminología', icon: Languages, description: 'Aprende términos médicos por partes, como en Duolingo' },
      { to: '/guias', label: 'Guías', icon: BookOpen, description: 'Resúmenes de alto rendimiento' },
    ],
  },
  {
    title: 'Habilidades clínicas',
    items: [
      { to: '/atls', label: 'ATLS', icon: Siren, description: 'El politraumatizado: xABCDE, shock, tórax, TCE y quemaduras' },
      { to: '/fracturas', label: 'Trauma y fracturas', icon: Bone, description: 'Mecanismos, trazos, Salter-Harris y fracturas con nombre propio' },
      { to: '/semiologia', label: 'Semiología', icon: Hand, description: 'Cómo explorar cada sistema y qué significa cada signo' },
      { to: '/espirometria', label: 'Espirometría', icon: Wind, description: 'Interpreta patrones, gravedad y curvas flujo-volumen' },
      { to: '/hemograma', label: 'Hemograma', icon: Droplet, description: 'Aprende a leer las tres series con casos reales' },
      { to: '/ecg/monitor', label: 'Monitor de ECG', icon: MonitorDot, description: 'Ritmos en vivo como en la emergencia' },
    ],
  },
  {
    title: 'Explorar',
    items: [
      { to: '/banco', label: 'Banco de preguntas', icon: Library, description: 'Busca y filtra todas las preguntas' },
      { to: '/repaso', label: 'Repaso', icon: RotateCcw, description: 'Errores, marcadas y notas' },
      { to: '/juegos', label: 'Juegos', icon: Gamepad2, description: 'Aprende jugando' },
      { to: '/duelo', label: 'Duelo', icon: Swords, description: 'Reta a un amigo con las mismas 10 preguntas' },
      { to: '/ecg', label: 'Lee el ECG', icon: HeartPulse, description: 'Reconoce arritmias, bloqueos y lesión aguda' },
      { to: '/herramientas', label: 'Herramientas', icon: Calculator, description: 'Calculadoras y escalas clínicas' },
      { to: '/actualizaciones', label: 'Actualizaciones', icon: Newspaper, description: 'Cambios recientes en guías' },
      { to: '/como-prepararte', label: 'Cómo prepararte', icon: Compass, description: 'Estrategia, fases y consejos' },
    ],
  },
  {
    title: 'Inteligencia artificial',
    items: [
      { to: '/prompts', label: 'Prompts', icon: WandSparkles, description: 'Prompts listos para ChatGPT, Claude o Gemini' },
      { to: '/ia', label: 'IA para médicos', icon: Sparkles, description: 'Qué puede hacer la IA, cómo funciona y cómo usarla con seguridad' },
    ],
  },
  {
    title: 'Progreso',
    items: [
      { to: '/estadisticas', label: 'Estadísticas', icon: ChartColumn, description: 'Tu rendimiento en detalle' },
      { to: '/ranking', label: 'Ranking', icon: Medal, description: 'Tu posición en el país y en tu universidad' },
      { to: '/logros', label: 'Logros', icon: Trophy, description: 'Niveles y medallas' },
      { to: '/roadmap', label: 'Lo que viene', icon: Rocket, description: 'Hoja de ruta y próximas funciones' },
      { to: '/cuenta', label: 'Mi cuenta', icon: UserRound, description: 'Iniciar sesión y sincronizar tu progreso' },
      { to: '/ajustes', label: 'Configuración', icon: Settings, description: 'Perfil, foto, cuenta, tema y respaldo' },
    ],
  },
]

export const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items)

/** La entrada del menú que corresponde a una ruta: la coincidencia más larga (/ecg/monitor antes que /ecg). */
export const navFor = (pathname: string) =>
  ALL_NAV.filter((n) => pathname === n.to || pathname.startsWith(`${n.to}/`)).sort((a, b) => b.to.length - a.to.length)[0]

/** ¿Hay otra entrada del menú dentro de esta ruta? Entonces su enlace solo se marca en la ruta exacta. */
export const hasNestedNav = (to: string) => ALL_NAV.some((o) => o.to !== to && o.to.startsWith(`${to}/`))

/** Pestañas de la barra inferior en móvil. */
export const MOBILE_TABS = ['/inicio', '/plan', '/practica', '/flashcards'].map((to) => ALL_NAV.find((n) => n.to === to)!)
