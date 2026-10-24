# Publicar MedLogic ENURM en Vercel (con cuentas)

La página funciona sin servidor: sin cuentas, todo se guarda en el navegador de cada persona. Con Supabase se activan las cuentas (Google, o correo y contraseña; quien olvide su contraseña escribe a medlogic.care@gmail.com) y el progreso se sincroniza entre dispositivos.

## Camino corto (recomendado, unos 10 minutos)

### 1. Publica la página
1. En [vercel.com](https://vercel.com) → **Add New → Project** → importa `romartak/medlogic.enurm`.
2. No cambies nada: `vercel.json` ya indica cómo compilar, las cabeceras de seguridad y la caché.
3. **Deploy**. La página ya funciona (todavía sin cuentas).

### 2. Conecta Supabase desde Vercel (sin copiar claves)
1. En tu proyecto de Vercel → pestaña **Storage** → **Create Database** → **Supabase** (o desde [vercel.com/marketplace/supabase](https://vercel.com/marketplace/supabase)). Elige el plan gratis y conéctalo al proyecto.
2. Vercel crea solas las variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `POSTGRES_URL_NON_POOLING`…). La app lee las públicas; las secretas nunca llegan al navegador.
3. **Deployments → ⋯ → Redeploy**. En el registro de la compilación verás `[migraciones] Aplicada 0001…`, `0002…` y `0003…`: las tablas, la seguridad por filas, los límites, el ranking y el simulacro nacional se crean solos. Solo ocurre en producción; las vistas previas no tocan la base de datos.

### 3. Dos ajustes en Supabase
Abre Supabase desde Vercel (**Storage → tu base → Open in Supabase**):

1. **Authentication → URL Configuration**
   - **Site URL**: tu dirección final, por ejemplo `https://medlogic-enurm.vercel.app`.
   - **Redirect URLs**: añade `https://medlogic-enurm.vercel.app/**` y, para desarrollo, `http://localhost:5173/**`.
2. **Authentication → Sign In / Providers → Google** (lo más cómodo para tus usuarios): crea un cliente OAuth en Google Cloud Console (tipo «Aplicación web») con la URI de redirección `https://TU-PROYECTO.supabase.co/auth/v1/callback` y pega el *Client ID* y el *Client Secret*.
3. **Google Cloud → Google Auth Platform**: en *Información de la marca* pon la página principal, la política de privacidad (`/privacidad/`) y los términos (`/terminos/`) de tu dominio, y en *Público* pulsa **Publicar aplicación** para salir del modo de prueba (solo se piden correo y perfil, sin revisión larga).

Las páginas legales son archivos estáticos en `public/privacidad/` y `public/terminos/`. Revísalas y ajusta el correo de contacto si cambia.

### 4. Correos: importante
El remitente de correo que trae Supabase **solo envía a los miembros de tu equipo y unas 2 veces por hora**. Para que cualquiera pueda registrarse con correo elige una opción:

- **A. Remitente propio (recomendado)**: crea una cuenta gratis en [Resend](https://resend.com) (3 000 correos al mes), verifica tu dominio y ponlo en **Authentication → Emails → SMTP Settings**. Así funcionan la confirmación de correo, el enlace de acceso y «¿Olvidaste tu contraseña?».
- **B. Sin correos**: en **Authentication → Sign In / Providers → Email**, desactiva **Confirm email**. El registro con correo y contraseña funciona al instante, pero no habrá recuperación de contraseña ni enlace de acceso. Activa el anti-bots del paso 5.

Con Google no hace falta nada de esto.

### 5. Anti-bots en el registro (recomendado)
Así nadie puede llenar tu base de cuentas falsas con un programa.

1. En Cloudflare (gratis) → **Turnstile → Add widget**, con tu dominio. Te da una *site key* (pública) y una *secret key*.
2. En Vercel → **Settings → Environment Variables**: `VITE_TURNSTILE_SITE_KEY` = la site key → **Redeploy**.
3. **Después**, en Supabase → **Authentication → Attack Protection** (o *Bot and Abuse Protection*) → activa CAPTCHA, elige **Turnstile** y pega la *secret key*.

Hazlo en ese orden: si Supabase exige la verificación antes de que la página la envíe, nadie podrá entrar.

## Seguridad: qué está hecho y qué activar si te atacan

Ya incluido en el código:
- **Cabeceras de seguridad** (`vercel.json`): política de contenido (CSP) que solo permite scripts propios (y Turnstile), prohíbe meter la página en iframes, HTTPS obligatorio (HSTS), `nosniff` y permisos del navegador apagados (cámara, micrófono, ubicación…).
- **Base de datos cerrada**: seguridad por filas (cada cuenta solo ve y cambia lo suyo), sin acceso para visitantes sin sesión, copias de máximo 8 MB, nombres de máximo 80 caracteres y como mucho una escritura por segundo por usuario.
- **Contenido importado limpio**: las flashcards importadas (Anki, CSV) pasan por un filtro que quita scripts y atributos peligrosos, y los respaldos o copias de la nube solo aceptan los campos y tipos esperados.
- **Sin servidor propio que tumbar**: la página son archivos estáticos servidos desde la red de Vercel, que trae protección contra ataques DDoS incluida.

Si algún día te atacan:
- **Vercel → Firewall → Attack Challenge Mode**: pide una verificación a cada visitante mientras dure el ataque (gratis).
- **Vercel → Firewall → reglas**: bloquea países o IP concretas.
- **Supabase → Authentication → Rate Limits**: baja los límites de registros e inicios de sesión por hora.
- En el plan gratis (Hobby), si se agota el uso del mes Vercel pausa la página en vez de cobrarte.

## Analíticas (opcional)
En Vercel → **Analytics** y **Speed Insights** → **Enable**. La app ya trae el código: visitas por página y velocidad real, sin cookies. Solo se carga en las compilaciones de Vercel.

## Camino manual (sin la integración)
1. Crea un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor** → pega y ejecuta, en orden, `supabase/migrations/0001_cuentas_y_progreso.sql`, `0002_limites_y_seguridad.sql` y `0003_ranking_y_simulacro_nacional.sql`. También puedes definir `POSTGRES_URL_NON_POOLING` en Vercel y se aplican solas al desplegar.
3. **Project Settings → API**: copia la URL y la clave pública (*anon* o *publishable*) en Vercel como `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Sigue los pasos 3, 4 y 5 de arriba.

> Nunca pongas la clave `service_role` o `secret` en una variable `VITE_` o `NEXT_PUBLIC_`: esas llegan al navegador.

## Desarrollo local

```bash
cp .env.example .env.local   # y rellena las variables
npm install
npm run dev
```

## Cómo funciona la sincronización
- Al iniciar sesión, la app compara la copia de la nube con la del dispositivo:
  - si la cuenta es nueva, sube el progreso del dispositivo;
  - si el dispositivo está vacío, descarga el de la cuenta;
  - si ambos tienen progreso distinto, pregunta cuál conservar.
- Después, cada cambio se sube solo a los pocos segundos, y al volver a la pestaña se descargan los cambios hechos en otro dispositivo.
- Todo vive en una fila por usuario (`user_state.snapshot`, el mismo formato que el respaldo JSON de Ajustes).
