# MedLogic ENURM

**Siempre gratis y de código abierto.** Mi regalo para todos los médicos en formación.

Plataforma web para preparar el **ENURM** (Examen Nacional Único de Residencias Médicas) con varios métodos de estudio en un solo lugar.

## Funciones

| | |
| --- | --- |
| 🎯 **Práctica (modo tutor)** | Filtra por especialidad, año o estado (no vistas, falladas, marcadas). Explicación inmediata, atajos de teclado, rachas. |
| 🎓 **Simulacros** | Completo (100 preguntas / 2 h), medio, rápido o personalizado. Reparto proporcional por especialidad, cronómetro, navegación, preguntas marcadas, examen completo por año, resultados por especialidad y revisión. |
| 🧠 **Flashcards** | Repetición espaciada (SM-2) con 4 botones, 7 mazos incluidos, mazo automático con tus errores y tarjetas propias. |
| 📚 **Guías** | Resúmenes de alto rendimiento con tablas, perlas y alertas (dengue, preeclampsia, SCA, sepsis, asma…). |
| 📰 **Actualizaciones** | Cambios recientes en guías clínicas (ESC, GINA, GOLD, KDIGO, ADA, SSC…). |
| 🎮 **Juegos** | Contrarreloj, supervivencia, verdadero/falso, parejas clínicas y diagnóstico en 5 pistas. |
| 📈 **Estadísticas** | Precisión por especialidad, calendario de actividad, radar, evolución de simulacros y puntaje estimado. |
| 🗓️ **Plan de estudio** | Cuenta regresiva al examen, meta diaria, plan semanal según tus puntos débiles y pomodoro. |
| 🏆 **Gamificación** | XP, niveles y 15 logros. |
| 🔎 **Búsqueda global** | `Ctrl + K` para buscar preguntas, guías, flashcards y páginas. |
| 📥 **Importador** | Carga el banco de preguntas desde CSV o JSON con validación y vista previa. |

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

## Cargar el banco de preguntas

Mientras no haya un banco cargado, la plataforma usa ~60 **preguntas de muestra** (no oficiales). Para usar las preguntas reales de todos los años:

1. Prepara un CSV o JSON (ver [docs/FORMATO_PREGUNTAS.md](docs/FORMATO_PREGUNTAS.md)).
2. Ejecuta `npm run import:questions -- tu-archivo.csv`.
3. Revisa el resumen (errores por fila, preguntas por año y especialidad) y haz commit de `public/data/questions.json`.

Cualquier usuario también puede importar su propio archivo desde la página **Importar preguntas**.

## Publicar

La app es estática (Vite + React) y usa rutas con `#`, así que funciona en cualquier hosting sin configuración extra.

- **GitHub Pages:** el flujo `.github/workflows/deploy.yml` publica automáticamente al hacer push a `main`. Actívalo en *Settings → Pages → Source: GitHub Actions*.
- **Netlify / Vercel / Cloudflare Pages:** comando `npm run build`, carpeta `dist`.
- **App móvil (futuro):** al ser una web estática con base relativa, puede empaquetarse con Capacitor sin cambios en las rutas.

## Estructura

```
src/
  data/          contenido: especialidades, preguntas de muestra, flashcards, guías, actualizaciones, juegos, logros
  lib/           lógica: importador, repetición espaciada, estadísticas, selección de preguntas
  store/         estado: banco de preguntas (IndexedDB) y progreso del usuario (localStorage)
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
