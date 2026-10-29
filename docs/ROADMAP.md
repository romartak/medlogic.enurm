# Hoja de ruta de MedLogic ENURM

Hacia dónde va el proyecto. También se ve dentro de la app en **Lo que viene** (`/roadmap`). ¿Tienes una idea? Abre un *issue*.

## Ya disponible — Hoy

- **Plan diario personalizado.** Cuestionario inicial y un plan que cambia de fase según los días que faltan y tus puntos débiles.
- **Flashcards con la arquitectura de Anki.** Mazos y submazos, cloze, presets, pasos de aprendizaje, sanguijuelas, explorador, estudio personalizado y estadísticas.
- **Espacio por especialidad.** 23 áreas con temas de alto rendimiento, perlas, preguntas, flashcards y guías.
- **Análisis por opción.** Por qué cada opción es correcta o incorrecta, fisiopatología y bibliografía con DOI.
- **Prompts e IA para médicos.** Biblioteca de prompts (diapositivas, flashcards, casos, tutor) y una guía para usar la IA con seguridad.
- **Simulacros, juegos y herramientas.** Examen cronometrado, 6 juegos y 12 calculadoras clínicas.
- **Habilidades clínicas.** ATLS, trauma y fracturas, semiología por sistemas, espirometría, hemograma, monitor de ECG en vivo y 18 casos clínicos por especialidad.

## Próximo — 1–3 meses

- **Banco completo de todos los años.** Todas las preguntas del ENURM con análisis por opción, fisiopatología y referencias actualizadas.
- **Temas calientes del ENURM.** Mapa de calor tema × año para ver qué se repite y qué temas podrían salir en el próximo examen.
- **Modo examen real.** Pantalla completa, hoja de respuestas tipo burbuja y cronómetro oficial, sin distracciones.
- **Calibración de confianza.** Indica qué tan seguro estás antes de responder: verás tu curva metacognitiva y los aciertos "por suerte".
- **Diagnóstico de tus errores.** Clasifica cada fallo (no lo sabía, leí mal, dudé entre dos, cambié la respuesta) usando tus tiempos de respuesta.
- **FSRS: el algoritmo moderno de Anki.** Programación optimizada con tu propio historial de repasos, con el porcentaje de retención que elijas.
- **Importar mazos .apkg de Anki.** Trae tus mazos de Anki con su progreso.
- **App instalable y sin conexión.** PWA con notificaciones de "tu repaso de hoy" y funcionamiento completo sin internet.

## Después — 3–6 meses

- **Cuenta y sincronización.** Inicio de sesión opcional para estudiar en el teléfono y la computadora sin perder nada.
- **Ranking nacional y percentil.** Compárate de forma anónima con otros aspirantes y conoce tu percentil estimado.
- **Duelos, ligas y torneos.** Duelos 1 vs 1 en vivo, ligas semanales (Bronce → Diamante) y torneos entre universidades.
- **Salas de estudio en vivo.** Estudia con otros, con pomodoro compartido y chat de dudas.
- **Mazos de la comunidad.** Mazos y preguntas aportados por la comunidad, con revisión médica por pares y votos.
- **Bot de WhatsApp y Telegram.** Pregunta del día, recordatorios de repaso y tu racha, directamente en tu chat.
- **App móvil con widgets.** Android/iOS con widget de racha y tarjetas pendientes; flashcards en el reloj inteligente.
- **Panel para universidades.** Profesores crean simulacros y siguen el progreso de su grupo.

## Locuras (moonshots) — El futuro

- **Dr. Logic, tu tutor con IA.** Un "residente" virtual que te explica de forma socrática a partir de tus errores y genera preguntas nuevas tipo ENURM desde cualquier guía.
- **Pacientes virtuales.** Casos que evolucionan en tiempo real: monitor con signos vitales, pides laboratorios (que cuestan tiempo) y el paciente mejora o empeora según tus decisiones.
- **Modo guardia nocturna.** A una hora inesperada llega un "paciente" a emergencias y tienes 10 minutos para estabilizarlo.
- **Mapa de calor del cuerpo humano.** Un avatar 3D que se colorea según tu dominio de cada sistema: ves literalmente dónde estás débil.
- **Árbol de habilidades RPG.** "De interno a residente": desbloquea temas como habilidades y vence a los jefes finales (simulacros) de cada especialidad.
- **Probabilidad de plaza.** Estima tu probabilidad de entrar en la residencia que quieres según tu puntaje proyectado y los cortes históricos.
- **Gemelo de estudio.** Una IA que aprende de tu historial, predice qué vas a olvidar mañana y te lo recuerda hoy.
- **Estudio manos libres.** Flashcards por voz para la guagua o el carro, y guías narradas como pódcast.
- **Feed de perlas en video.** Videos verticales de 30 segundos con perlas de alto rendimiento, para cuando solo tienes el teléfono a mano.
- **Atlas interactivo.** ECG, radiografías y dermatología con zonas que puedes tocar y casos asociados.
- **Anatomía en realidad aumentada.** Modelos 3D sobre tu mesa con la cámara del teléfono.
- **Examen fantasma.** Compite contra tu "yo" de hace un mes en el mismo simulacro y mira tu progreso en vivo.
- **Detector de agotamiento.** Check-in de ánimo y sueño que reduce la carga del plan cuando lo necesitas.
- **Mnemotecnias con IA.** Mnemotecnias e ilustraciones personalizadas para lo que más te cuesta recordar.

## Proceso para el banco de preguntas

1. Lectura completa del PDF y extracción de cada pregunta (enunciado, opciones, respuesta, año, especialidad, tema).
2. Verificación de la respuesta correcta.
3. Análisis de cada opción: por qué es correcta o incorrecta.
4. Fisiopatología: los procesos fisiológicos que explican la respuesta.
5. Puntos clave y bibliografía (guías vigentes, artículos y libros de referencia, con DOI cuando existe).
6. Validación automática (`npm run import:questions`) y publicación en `public/data/questions.json`.
7. Revisión médica continua: cualquier usuario puede reportar un error desde cada pregunta.
