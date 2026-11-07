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
      { title: 'Simulacros, juegos y herramientas', body: 'Examen cronometrado, 6 juegos y 12 calculadoras clínicas.', icon: 'gamepad' },
      { title: 'Habilidades clínicas', body: 'ATLS, trauma y fracturas, semiología por sistemas, esquemas interactivos de fisiopatología, espirometría, hemograma, monitor de ECG en vivo y 18 casos clínicos por especialidad.', icon: 'heart-pulse' },
      { title: 'Temas calientes del ENURM', body: 'Mapa de calor tema × año con los exámenes 2002-2024: qué se repite y qué practicar primero.', icon: 'flame' },
      { title: 'Modo examen real', body: 'Pantalla completa, hoja de respuestas tipo burbuja y cronómetro, sin ayudas hasta entregar.', icon: 'graduation' },
      { title: 'Calibración y diagnóstico de errores', body: 'Indica qué tan seguro estás: verás tus aciertos por suerte, tus puntos ciegos y si fallas por ir rápido, dudar o no saber.', icon: 'gauge' },
      { title: 'Estudiar sin conexión', body: 'Guarda la plataforma y el banco de preguntas en tu dispositivo para estudiar sin internet.', icon: 'phone' },
      { title: 'Sugerencias según tu actividad', body: 'La plataforma aprende dónde pasas el tiempo, a qué hora estudias y dónde fallas, y te propone qué hacer. Todo se calcula en tu dispositivo.', icon: 'sparkles' },
      { title: 'Cuentas y sincronización', body: 'Entra con Google o correo y estudia en el teléfono y la computadora sin perder nada. Es opcional.', icon: 'cloud' },
      { title: 'Ranking, liga semanal y reto entre universidades', body: 'Tu posición en el país y en tu universidad, ligas de Bronce a Diamante que se reinician cada lunes y un reto semanal entre universidades. Más el simulacro nacional mensual con percentil.', icon: 'trophy' },
      { title: 'Retos de 7 días', body: 'Elige un tema caliente y practica 5 preguntas al día en 5 de los próximos 7 días para ganar XP.', icon: 'target' },
      { title: 'Compañero de estudio', body: 'Únete con un código a otra persona y vean si el otro ya estudió hoy y su racha, sin compartir respuestas.', icon: 'users' },
      { title: 'Congeladores de racha y tarjeta semanal', body: 'Un congelador salva tu racha si un día faltas, y puedes compartir el resumen de tu semana por WhatsApp.', icon: 'flame' },
      { title: 'Calidad del banco con tu ayuda', body: 'Reporta un error en cualquier pregunta y vota si una explicación te sirvió. Las preguntas con varios reportes se marcan «en revisión».', icon: 'message' },
      { title: 'Páginas públicas de temas calientes', body: 'Lo que más se repite en el ENURM, por especialidad, en páginas que Google puede mostrar.', icon: 'grid' },
    ],
  },
  {
    id: 'proximo',
    name: 'Próximo',
    when: '1–3 meses',
    color: '#0ea5e9',
    items: [
      { title: 'Banco de 12,000 preguntas', body: 'Hoy hay más de 2.400 preguntas explicadas; la meta es llegar a 12.000, todas con análisis por opción, fisiopatología y referencias actualizadas.', icon: 'database' },
      { title: 'FSRS: el algoritmo moderno de Anki', body: 'Programación optimizada con tu propio historial de repasos, con el porcentaje de retención que elijas.', icon: 'sparkles' },
      { title: 'Importar mazos .apkg de Anki', body: 'Trae tus mazos de Anki con su progreso.', icon: 'download' },
      { title: 'Avisos de tu repaso de hoy', body: 'La app ya funciona sin conexión; falta avisarte con una notificación cuando tengas tarjetas pendientes.', icon: 'phone' },
    ],
  },
  {
    id: 'despues',
    name: 'Después',
    when: '3–6 meses',
    color: '#8b5cf6',
    items: [
      { title: 'Torneos y duelos en vivo', body: 'Los duelos 1 contra 1 con código ya existen; faltan los torneos entre universidades y los duelos en vivo.', icon: 'swords' },
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
