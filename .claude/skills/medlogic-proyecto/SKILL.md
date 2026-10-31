---
name: medlogic-proyecto
description: "Reglas de trabajo de MedLogic ENURM: comprobaciones antes de subir, autoría de los commits, flujo de ramas, cómo medir accesibilidad y velocidad de la portada. Úsala al cambiar código, preparar un commit o una rama, o publicar en este repositorio."
---

# MedLogic ENURM: cómo trabajar en este repositorio

Plataforma gratuita en español para preparar el ENURM (República Dominicana). React 19 + Vite + Tailwind v4 + TypeScript, desplegada en Vercel, cuentas con Supabase. Lo que manda es `CLAUDE.md`; esta skill añade el cómo.

## Antes de subir (las tres, en este orden)

1. `npx tsc -b`
2. `npm test`
3. `npm run build`

Si una falla, se corrige antes de hacer commit. Nunca se salta ni se desactiva una prueba para que pase.

## Commits y autoría

- Todos los commits van a nombre del dueño: `git -c user.name=romartak -c user.email=dr.robinsonsantos113@gmail.com commit ...`
- Sin `Co-Authored-By`, sin enlaces de sesión, sin nombres de modelos, sin «Generated with Claude Code». Aplica también a pull requests, comentarios y nombres de rama.
- Antes de subir: `git log --format='%an <%ae> | %cn%n%B' origin/main..HEAD` no debe mostrar «Claude», «Anthropic» ni «Co-Authored-By».

## Ramas y pull requests

- Rama de trabajo habitual: `plataforma-enurm`. Si ya se fusionó, parte de `origin/main` con otro nombre (no se fuerza el push).
- El pull request lo abre el dueño, salvo que pida explícitamente que se cree y se fusione.
- Antes de fusionar, esperar a que pasen las comprobaciones (`build` y Vercel).
- Producción sale de `main`: tras fusionar, comprobar que el despliegue llegue a READY.

## Medir en vez de suponer

- **Accesibilidad:** correr axe-core (reglas `wcag2a`, `wcag2aa`, `best-practice`) con Playwright a 390 px, en claro y oscuro, sobre `/`, `/#/inicio`, `/#/practica`, `/#/cuenta`. El objetivo es cero problemas.
- **Áreas táctiles:** mínimo 44 px. El proyecto las extiende con `after:absolute` en el botón (sin cambiar el diseño visible), así que medir la caja no basta: comprobar con `document.elementFromPoint`.
- **Velocidad de la portada:** red de 1,6 Mbps, 150 ms de latencia y CPU 4x más lenta; medir tiempo hasta ver el título, bloqueo del hilo principal y KB transferidos. Comparar siempre contra la versión anterior servida con el mismo servidor (los servidores sin compresión falsean la comparación).
- **Videos de la portada** (`public/demo`): 432 px de ancho, 24 cuadros por segundo, H.264 `crf 28`. Menos que eso se ve borroso; no usar GIF (pesa varias veces más). No poner filtros ni tramas encima: se probaron y se descartaron.

## Código que conviene recordar

- El cliente de Supabase se carga aparte con `getSupabase()` (`src/lib/supabase.ts`); no importarlo de forma estática. En la portada se inicia tras pintar o al primer toque.
- Los colores de texto de Tailwind en modo claro se oscurecen con las reglas `html:not(.dark) .text-*` de `src/index.css`. Un problema de contraste se arregla ahí, no clase por clase.
- La app usa rutas con `#` (HashRouter); solo la portada y las páginas legales se indexan.
