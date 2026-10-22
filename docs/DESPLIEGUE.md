# Publicar MedLogic ENURM (Supabase + Vercel)

La app funciona sin servidor: si no configuras Supabase, todo se guarda en el navegador. Con Supabase se activan las cuentas (correo y contraseña, enlace por correo y Google) y el progreso se sincroniza entre dispositivos.

## 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor** → pega el contenido de [`supabase/migrations/0001_cuentas_y_progreso.sql`](../supabase/migrations/0001_cuentas_y_progreso.sql) → **Run**. Crea las tablas `profiles` y `user_state` con seguridad por filas (RLS): cada usuario solo puede leer y escribir lo suyo.
3. **Authentication → URL Configuration**
   - **Site URL**: la dirección final, por ejemplo `https://medlogic-enurm.vercel.app`.
   - **Redirect URLs**: añade
     - `https://medlogic-enurm.vercel.app/**`
     - `https://*-TU-USUARIO-DE-VERCEL.vercel.app/**` (vistas previas de Vercel)
     - `http://localhost:5173/**` (desarrollo)
4. **Authentication → Providers**
   - **Email**: activado. «Confirm email» puede quedar **desactivado** para que cualquiera se registre y entre al instante, sin códigos (la app lo soporta). Los correos de «olvidé mi contraseña» y de enlace de acceso siguen funcionando, pero el servidor de correo gratuito de Supabase permite pocos envíos por hora; para mucho tráfico conecta un SMTP propio (Resend, Brevo) en Authentication → SMTP.
   - **Google** (opcional): crea un cliente OAuth en Google Cloud Console (tipo «Aplicación web») con la URI de redirección autorizada `https://TU-PROYECTO.supabase.co/auth/v1/callback`, y pega el *Client ID* y el *Client Secret* en Supabase.
5. **Google Cloud → Google Auth Platform**: en *Información de la marca* pon la página principal, la política de privacidad (`/privacidad/`) y los términos (`/terminos/`) de tu dominio, y en *Público* pulsa **Publicar aplicación** para salir del modo de prueba (solo se piden datos básicos: correo y perfil, sin revisión larga).
6. **Project Settings → API**: copia la **Project URL** y la clave **anon public**.

> Nunca pongas la clave `service_role` en la app ni en Vercel: la app solo usa la clave pública `anon`, y la protección real son las políticas RLS.

## 2. Vercel

1. **Add New → Project** → importa el repositorio `romartak/medlogic.enurm`.
2. Vercel detecta Vite: *Build Command* `npm run build`, *Output Directory* `dist`.
3. **Environment Variables** (Production y Preview):
   - `VITE_SUPABASE_URL` = la Project URL
   - `VITE_SUPABASE_ANON_KEY` = la clave anon public
4. **Deploy**. Si cambias una variable, vuelve a desplegar para que se aplique.

Las páginas legales son archivos estáticos en `public/privacidad/` y `public/terminos/` (se sirven en `/privacidad/` y `/terminos/`). Revísalas y ajusta el correo de contacto si cambia.

La app usa rutas con `#` (por ejemplo `/#/inicio`), así que no hace falta configurar reescrituras.

## 3. Desarrollo local

```bash
cp .env.example .env.local   # y rellena las dos variables
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
