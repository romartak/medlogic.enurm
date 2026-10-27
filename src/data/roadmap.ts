/** Hoja de ruta pública del proyecto (se muestra en /roadmap y en docs/ROADMAP.md). */
export interface RoadmapItem {
  title: string
  body: string
  icon: string
}

export interface RoadmapStage {
  id: string
  name: string
  when: string
  color: string
  items: RoadmapItem[]
}

export const ROADMAP: RoadmapStage[] = [
  {
    id: 'hecho',
    name: 'Ya disponible',
    when: 'Hoy',
    color: '#10b981',
    items: [
      { title: 'Plan diario personalizado', body: 'Cuestionario inicial y un plan que cambia de fase según los días que faltan y tus puntos débiles.', icon: 'calendar' },
      { title: 'Flashcards con la arquitectura de Anki', body: 'Mazos y submazos, cloze, presets, pasos de aprendizaje, sanguijuelas, explorador, estudio personalizado y estadísticas.', icon: 'layers' },
      { title: 'Espacio por especialidad', body: '23 áreas con temas de alto rendimiento, perlas, preguntas, flashcards y guías.', icon: 'grid' },
      { title: 'Análisis por opción', body: 'Por qué cada opción es correcta o incorrecta, fisiopatología y bibliografía con DOI.', icon: 'microscope' },
      { title: 'Prompts e IA para médicos', body: 'Biblioteca de prompts (diapositivas, flashcards, casos, tutor) y una guía para usar la IA con seguridad.', icon: 'bot' },
      { title: 'Simulacros, juegos y herramientas', body: 'Examen cronometrado, 5 juegos y 12 calculadoras clínicas.', icon: 'gamepad' },
    ],
  },
  {
    id: 'proximo',
    name: 'Próximo',
    when: '1–3 meses',
    color: '#0ea5e9',
    items: [
      { title: 'Banco de 12,000 preguntas', body: 'Hoy hay más de 1.000 preguntas explicadas; la meta es llegar a 12.000, todas con análisis por opción, fisiopatología y referencias actualizadas.', icon: 'database' },
      { title: 'Temas calientes del ENURM', body: 'Mapa de calor tema × año para ver qué se repite y qué temas podrían salir en el próximo examen.', icon: 'flame' },
      { title: 'Modo examen real', body: 'Pantalla completa, hoja de respuestas tipo burbuja y cronómetro oficial, sin distracciones.', icon: 'graduation' },
      { title: 'Calibración de confianza', body: 'Indica qué tan seguro estás antes de responder: verás tu curva metacognitiva y los aciertos "por suerte".', icon: 'gauge' },
      { title: 'Diagnóstico de tus errores', body: 'Clasifica cada fallo (no lo sabía, leí mal, dudé entre dos, cambié la respuesta) usando tus tiempos de respuesta.', icon: 'brain' },
      { title: 'FSRS: el algoritmo moderno de Anki', body: 'Programación optimizada con tu propio historial de repasos, con el porcentaje de retención que elijas.', icon: 'sparkles' },
      { title: 'Importar mazos .apkg de Anki', body: 'Trae tus mazos de Anki con su progreso.', icon: 'download' },
      { title: 'App instalable y sin conexión', body: 'PWA con notificaciones de "tu repaso de hoy" y funcionamiento completo sin internet.', icon: 'phone' },
    ],
  },
  {
    id: 'despues',
    name: 'Después',
    when: '3–6 meses',
    color: '#8b5cf6',
    items: [
      { title: 'Cuenta y sincronización', body: 'Inicio de sesión opcional para estudiar en el teléfono y la computadora sin perder nada.', icon: 'cloud' },
      { title: 'Ranking nacional y percentil', body: 'Compárate de forma anónima con otros aspirantes y conoce tu percentil estimado.', icon: 'trophy' },
      { title: 'Duelos, ligas y torneos', body: 'Duelos 1 vs 1 en vivo, ligas semanales (Bronce → Diamante) y torneos entre universidades.', icon: 'swords' },
      { title: 'Salas de estudio en vivo', body: 'Estudia con otros, con pomodoro compartido y chat de dudas.', icon: 'users' },
      { title: 'Mazos de la comunidad', body: 'Mazos y preguntas aportados por la comunidad, con revisión médica por pares y votos.', icon: 'heart' },
      { title: 'Bot de WhatsApp y Telegram', body: 'Pregunta del día, recordatorios de repaso y tu racha, directamente en tu chat.', icon: 'message' },
      { title: 'App móvil con widgets', body: 'Android/iOS con widget de racha y tarjetas pendientes; flashcards en el reloj inteligente.', icon: 'phone' },
      { title: 'Panel para universidades', body: 'Profesores crean simulacros y siguen el progreso de su grupo.', icon: 'school' },
    ],
  },
  {
    id: 'locuras',
    name: 'Locuras (moonshots)',
    when: 'El futuro',
    color: '#ec4899',
    items: [
      { title: 'Dr. Logic, tu tutor con IA', body: 'Un "residente" virtual que te explica de forma socrática a partir de tus errores y genera preguntas nuevas tipo ENURM desde cualquier guía.', icon: 'bot' },
      { title: 'Pacientes virtuales', body: 'Casos que evolucionan en tiempo real: monitor con signos vitales, pides laboratorios (que cuestan tiempo) y el paciente mejora o empeora según tus decisiones.', icon: 'heart-pulse' },
      { title: 'Modo guardia nocturna', body: 'A una hora inesperada llega un "paciente" a emergencias y tienes 10 minutos para estabilizarlo.', icon: 'siren' },
      { title: 'Mapa de calor del cuerpo humano', body: 'Un avatar 3D que se colorea según tu dominio de cada sistema: ves literalmente dónde estás débil.', icon: 'body' },
      { title: 'Árbol de habilidades RPG', body: '"De interno a residente": desbloquea temas como habilidades y vence a los jefes finales (simulacros) de cada especialidad.', icon: 'crown' },
      { title: 'Probabilidad de plaza', body: 'Estima tu probabilidad de entrar en la residencia que quieres según tu puntaje proyectado y los cortes históricos.', icon: 'target' },
      { title: 'Gemelo de estudio', body: 'Una IA que aprende de tu historial, predice qué vas a olvidar mañana y te lo recuerda hoy.', icon: 'brain' },
      { title: 'Estudio manos libres', body: 'Flashcards por voz para la guagua o el carro, y guías narradas como pódcast.', icon: 'headphones' },
      { title: 'Feed de perlas en video', body: 'Videos verticales de 30 segundos con perlas de alto rendimiento, para cuando solo tienes el teléfono a mano.', icon: 'video' },
      { title: 'Atlas interactivo', body: 'ECG, radiografías y dermatología con zonas que puedes tocar y casos asociados.', icon: 'scan' },
      { title: 'Anatomía en realidad aumentada', body: 'Modelos 3D sobre tu mesa con la cámara del teléfono.', icon: 'glasses' },
      { title: 'Examen fantasma', body: 'Compite contra tu "yo" de hace un mes en el mismo simulacro y mira tu progreso en vivo.', icon: 'ghost' },
      { title: 'Detector de agotamiento', body: 'Check-in de ánimo y sueño que reduce la carga del plan cuando lo necesitas.', icon: 'moon' },
      { title: 'Mnemotecnias con IA', body: 'Mnemotecnias e ilustraciones personalizadas para lo que más te cuesta recordar.', icon: 'wand' },
    ],
  },
]
