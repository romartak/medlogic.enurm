<div align="center">

<img src="public/icon-192.png" alt="MedLogic ENURM" width="96" height="96" />

# MedLogic ENURM

**La plataforma gratuita para preparar el ENURM, hecha por y para médicos en formación.**

Banco de preguntas con explicación, simulacros con reloj, flashcards estilo Anki, plan de estudio diario y rachas.
Sin anuncios, sin pagos y sin obligación de crear cuenta.

[**Probar ahora → medlogicenurm.vercel.app**](https://medlogicenurm.vercel.app)

[![CI](https://github.com/romartak/medlogic.enurm/actions/workflows/ci.yml/badge.svg)](https://github.com/romartak/medlogic.enurm/actions/workflows/ci.yml)
![React 19](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
![Gratis](https://img.shields.io/badge/precio-gratis%20para%20siempre-0f766e)

</div>

---

## Qué es

El **ENURM** (Examen Nacional Único de Residencias Médicas, República Dominicana) se prepara durante meses y con muchas herramientas sueltas. MedLogic junta todo en un solo lugar y te dice **qué estudiar hoy**, según los días que faltan para el examen, tu tiempo disponible y tus puntos débiles.

- **Entra y prueba ya.** No hace falta cuenta: tu progreso se guarda en tu dispositivo.
- **Cuenta opcional.** Con ella sincronizas el progreso entre el celular y la computadora.
- **Cero presión.** Rachas y cuenta atrás para motivarte, nunca para culparte.

## Funciones

| Área | Qué incluye |
| --- | --- |
| **Práctica** | 1 082 preguntas revisadas. Filtra por especialidad, año o estado (no vistas, falladas, marcadas). Explicación inmediata de por qué la correcta lo es y por qué las demás no. |
| **Simulacros** | Completo (100 preguntas, 2 h), medio, rápido o personalizado. Cronómetro, preguntas marcadas, nota final y resultado por especialidad. |
| **Simulacro nacional** | El mismo examen para todos cada mes; cuenta el primer intento y muestra tu percentil. |
| **Plan diario** | Tareas concretas según la fase de preparación, tu tiempo, tu residencia deseada y tu precisión real. |
| **Flashcards estilo Anki** | Notas básicas, invertidas y cloze, mazos y submazos, repaso espaciado, explorador con búsqueda, estadísticas e importar/exportar. |
| **Terminología médica** | Lecciones cortas de prefijos, sufijos, raíces y siglas, como un juego de idiomas. |
| **Especialidades** | Una página por cada una de las 23 áreas: temas de alto rendimiento, perlas, preguntas, flashcards y guías. |
| **Casos clínicos y ECG** | 18 casos para razonar paso a paso, filtrables por especialidad, un lector de electrocardiogramas y un monitor de ECG en vivo. |
| **Habilidades clínicas** | ATLS (xABCDE, shock, tórax, TCE, quemaduras), trauma y fracturas, semiología por sistemas, espirometría y hemograma, con intérpretes y práctica. |
| **Juegos y duelos** | Contrarreloj, supervivencia, verdadero/falso, parejas clínicas, diagnóstico en 5 pistas, cuadrantes y órganos del abdomen y duelo contra amigos. |
| **Guías y actualizaciones** | Resúmenes de alto rendimiento y cambios recientes en guías clínicas. |
| **Herramientas clínicas** | 12 calculadoras (TFG CKD-EPI 2021, Glasgow, CURB-65, CHA₂DS₂-VASc, Parkland…). |
| **Prompts e IA** | Biblioteca de prompts para estudiar con asistentes de IA y una guía de uso seguro. |
| **Motivación** | XP, niveles, 18 logros, rachas, ranking por universidad y cuenta atrás al examen. |

Además: tema claro y oscuro, diseño pensado primero para el celular, búsqueda global con `Ctrl + K` y respaldo de tu progreso en un archivo.

## Empezar a desarrollar

Requiere **Node.js 22**.

```bash
git clone https://github.com/romartak/medlogic.enurm.git
cd medlogic.enurm
npm install
npm run dev          # http://localhost:5173
```

| Comando | Para qué sirve |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run typecheck` | Revisa los tipos de TypeScript |
| `npm test` | Pruebas (Vitest) |
| `npm run build` | Compila a `dist/` |
| `npm run preview` | Sirve la versión compilada |
| `npm run import:questions -- banco.csv` | Genera `public/data/questions.json` desde un CSV o JSON |

Antes de subir cambios corre `npm run typecheck`, `npm test` y `npm run build`: es lo mismo que revisa la integración continua.

Las cuentas son opcionales y necesitan Supabase. Sin ellas la app funciona completa en local. Para activarlas, copia `.env.example` a `.env.local` (guía en [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md)).

## Estructura del repositorio

```text
.
├── src/
│   ├── pages/         una página por sección (juegos, flashcards y terminología en subcarpetas)
│   ├── components/    interfaz: layout, tarjeta de pregunta, landing, flashcards, componentes base
│   ├── data/          contenido: especialidades, guías, flashcards, casos, logros, prompts
│   ├── lib/           lógica: plan diario, repetición espaciada, estadísticas, sincronización, ranking
│   ├── store/         estado (Zustand): progreso del usuario, banco de preguntas, sesión
│   └── hooks/         hooks reutilizables
├── public/            banco publicado (data/), videos de la landing (demo/), iconos y páginas legales
├── data/banco/        banco original y revisión de respuestas (fuente de public/data/questions.json)
├── scripts/           importador de preguntas, armado del banco y migraciones de despliegue
├── supabase/          migraciones SQL: cuentas, seguridad por filas, ranking y simulacro nacional
├── docs/              despliegue, formato de preguntas, hoja de ruta y revisión de respuestas
└── .github/           integración continua y plantillas de issues y pull requests
```

## Documentación

| Documento | Contenido |
| --- | --- |
| [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md) | Publicar en Vercel y conectar Supabase paso a paso |
| [docs/FORMATO_PREGUNTAS.md](docs/FORMATO_PREGUNTAS.md) | Formato del banco de preguntas y cómo cargarlo |
| [docs/REVISION-RESPUESTAS.md](docs/REVISION-RESPUESTAS.md) | Qué respuestas se corrigieron o retiraron y por qué |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Hacia dónde va el proyecto |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Cómo contribuir |
| [SECURITY.md](SECURITY.md) | Cómo reportar un problema de seguridad |

## Cómo funciona el plan diario

1. **Fase** según los días que faltan: Fundamentos (más de 6 meses), Consolidación (2 a 6 meses), Repaso intensivo (15 a 60 días) y Recta final (14 días o menos). Cada fase reparte distinto el tiempo entre preguntas, errores, flashcards y guías.
2. **Prioridad** de cada especialidad = peso en el examen × debilidad × refuerzo por la residencia elegida. La debilidad sale de tu autoevaluación al inicio y de tu precisión real a partir de 5 respuestas.
3. **Rotación ponderada:** cada día combina una especialidad prioritaria con otra complementaria, sin dejar fuera al resto.
4. El plan del día se **congela** al generarse y el avance de cada tarea se registra solo.

La lógica vive en `src/lib/plan.ts` y está probada en `src/lib/plan.test.ts`.

## Privacidad y seguridad

- Sin cuenta, nada sale de tu navegador. Con cuenta, solo se guarda tu correo, tu nombre y tu progreso.
- Cada cuenta puede leer y modificar únicamente sus propios datos (seguridad a nivel de fila en Supabase).
- Puedes exportar tu progreso y **eliminar tu cuenta** desde Configuración.
- Cabeceras de seguridad estrictas (CSP, HSTS, sin iframes) configuradas en `vercel.json`.
- Consulta la [política de privacidad](https://medlogicenurm.vercel.app/privacidad/) y los [términos](https://medlogicenurm.vercel.app/terminos/).

## Tecnologías

React 19 · TypeScript · Vite · Tailwind CSS 4 · Motion · Recharts · Zustand · Fuse.js · PapaParse · Supabase · Vercel

## Aviso

Contenido con fines educativos. No sustituye el juicio clínico, las guías oficiales vigentes ni los protocolos del Ministerio de Salud Pública. MedLogic no está afiliado a la institución que organiza el ENURM.

## Contribuir

Las contribuciones son bienvenidas: preguntas con explicación, correcciones de contenido, guías nuevas o funciones. Lee [CONTRIBUTING.md](CONTRIBUTING.md) y abre un *issue* o un *pull request*.
