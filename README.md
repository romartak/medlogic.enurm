# MedLogic ENURM

**Siempre gratis y de código abierto.** Mi regalo para todos los médicos en formación.

Plataforma web para preparar el **ENURM** (Examen Nacional Único de Residencias Médicas) con varios métodos de estudio en un solo lugar.

## Funciones

| | |
| --- | --- |
| 🧭 **Cuestionario inicial** | Año y mes del examen (o fecha exacta), residencia deseada, días y horas disponibles, autoevaluación por área y métodos preferidos. |
| 🗓️ **Plan diario personalizado** | Tareas concretas cada día (preguntas de dos especialidades intercaladas, repaso de errores, flashcards, una guía, simulacro semanal) según la fase de preparación, tu tiempo, tus puntos débiles y tu residencia. Se recalcula con tu precisión real. |
| 🩺 **Espacios por especialidad** | Una página para cada una de las 23 áreas: temas de alto rendimiento, perlas, temas del banco con tu precisión, flashcards, guías, actualizaciones y tus errores. |
| 🎯 **Práctica (modo tutor)** | Filtra por especialidad, año o estado (no vistas, falladas, marcadas). Explicación inmediata, atajos de teclado, rachas. |
| 🎓 **Simulacros** | Completo (100 preguntas / 2 h), medio, rápido o personalizado. Reparto proporcional por especialidad, cronómetro, navegación, preguntas marcadas, examen completo por año, resultados por especialidad y revisión. |
| 🧠 **Flashcards** | Repetición espaciada (SM-2) con 4 botones, 7 mazos incluidos, mazo automático con tus errores y tarjetas propias. |
| 📚 **Guías** | Resúmenes de alto rendimiento con tablas, perlas y alertas (dengue, preeclampsia, SCA, sepsis, asma…). |
| 📰 **Actualizaciones** | Cambios recientes en guías clínicas (ESC, GINA, GOLD, KDIGO, ADA, SSC…). |
| 🎮 **Juegos** | Contrarreloj, supervivencia, verdadero/falso, parejas clínicas y diagnóstico en 5 pistas. |
| 📈 **Estadísticas** | Precisión por especialidad, calendario de actividad, radar, evolución de simulacros y puntaje estimado. |
| ⏱️ **Mi plan** | Cuenta regresiva, fases de preparación, vista de los próximos 7 días, prioridades y pomodoro. |
| 🧮 **Herramientas clínicas** | IMC, TFG CKD-EPI 2021, anion gap y Winter, osmolaridad, calcio corregido, Glasgow, Parkland, Alvarado, CHA₂DS₂-VASc, CURB-65, edad gestacional/FPP y Holliday-Segar. |
| 🧭 **Cómo prepararte** | Fases, métodos de estudio con evidencia, semana tipo, día del examen y preguntas frecuentes. |
| 🏆 **Gamificación** | XP, niveles y 18 logros (incluidos los de cumplir el plan diario). |
| 🔎 **Búsqueda global** | `Ctrl + K` para buscar preguntas, guías, flashcards y páginas. |

Además: tema claro/oscuro, diseño adaptable a móvil, animaciones, sonidos, respaldo/restauración del progreso y funcionamiento sin cuentas (el progreso se guarda en el dispositivo).

## Empezar

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev        # http://localhost:5173
```

Otros comandos:

```bash
npm run build      # compila a dist/
npm run preview    # sirve la versión compilada
npm test           # pruebas
npm run import:questions -- banco.csv   # genera public/data/questions.json
```

## Banco de preguntas

Mientras no haya un banco cargado, la plataforma usa ~60 **preguntas de muestra** (no oficiales). El banco real de todos los años lo carga el mantenedor del proyecto:

1. Prepara un CSV o JSON (ver [docs/FORMATO_PREGUNTAS.md](docs/FORMATO_PREGUNTAS.md)).
2. Ejecuta `npm run import:questions -- tu-archivo.csv`.
3. Revisa el resumen (errores por fila, preguntas por año y especialidad) y haz commit de `public/data/questions.json`.

Los usuarios no suben preguntas: todos usan el mismo banco publicado con la web.

## Cómo funciona el plan diario

1. **Fase** según los días que faltan: Fundamentos (> 6 meses), Consolidación (2–6 meses), Repaso intensivo (15–60 días) y Recta final (≤ 14 días). Cada fase reparte el tiempo de forma distinta entre preguntas, errores, flashcards y guías, y define el tamaño del simulacro semanal.
2. **Prioridad** de cada especialidad = peso en el examen × debilidad × refuerzo por la residencia elegida. La debilidad sale de la autoevaluación al principio y de la precisión real cuando hay al menos 5 respuestas.
3. **Rotación ponderada**: cada día combina una especialidad prioritaria y otra complementaria; las prioritarias aparecen más días sin dejar fuera al resto.
4. El plan del día se **congela** al generarse, y el avance de cada tarea se registra solo (o se marca a mano).

La lógica está en `src/lib/plan.ts` y tiene pruebas en `src/lib/plan.test.ts`.

## Publicar

La app es estática (Vite + React) y usa rutas con `#`, así que funciona en cualquier hosting sin configuración extra.

- **GitHub Pages:** el flujo `.github/workflows/deploy.yml` publica automáticamente al hacer push a `main`. Actívalo en *Settings → Pages → Source: GitHub Actions*.
- **Netlify / Vercel / Cloudflare Pages:** comando `npm run build`, carpeta `dist`.
- **App móvil (futuro):** al ser una web estática con base relativa, puede empaquetarse con Capacitor sin cambios en las rutas.

## Estructura

```
src/
  data/          contenido: especialidades y áreas, espacios por especialidad, preguntas de muestra,
                 flashcards, guías, actualizaciones, juegos, logros
  lib/           lógica: plan diario, importador, repetición espaciada, estadísticas, selección de preguntas
  store/         estado: banco de preguntas y progreso/perfil del usuario (localStorage)
  components/    layout, tarjeta de pregunta y componentes de interfaz
  pages/         una página por sección (juegos en pages/games)
scripts/         importador de línea de comandos
docs/            formato del banco de preguntas
```

## Tecnologías

React 19, TypeScript, Vite, Tailwind CSS 4, Motion (animaciones), Recharts, Zustand, Fuse.js, PapaParse.

## Aviso

Contenido con fines educativos. No sustituye el juicio clínico, las guías oficiales vigentes ni los protocolos del Ministerio de Salud Pública. Las preguntas de muestra no son preguntas oficiales del ENURM.

## Contribuir

Las contribuciones son bienvenidas: preguntas con explicación, correcciones de contenido, nuevas guías o funciones. Abre un *issue* o un *pull request*.
