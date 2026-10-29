# Seguridad

## Reportar un problema

Si encuentras una vulnerabilidad, **no abras un issue público**. Escribe a **medlogic.care@gmail.com** con:

- qué encontraste y dónde,
- los pasos para reproducirlo,
- el impacto que crees que tiene.

Respondemos lo antes posible y te avisamos cuando esté corregido.

## Qué cubre

- La aplicación web en [medlogicenurm.vercel.app](https://medlogicenurm.vercel.app).
- Las políticas y funciones de base de datos en `supabase/migrations/`.

## Cómo está protegido

- Seguridad a nivel de fila: cada cuenta solo accede a sus propias filas.
- Cabeceras de seguridad (CSP, HSTS, `X-Frame-Options`) en `vercel.json`.
- Solo claves públicas en el navegador; las secretas viven en Vercel y Supabase.
- Límites en la base de datos contra escrituras abusivas.
