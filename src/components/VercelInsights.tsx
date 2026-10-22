import { lazy, Suspense } from 'react'

/**
 * Vercel Web Analytics y Speed Insights (visitas y velocidad real, sin cookies).
 * Solo se incluyen en las compilaciones hechas en Vercel; en local y en otros hostings no se cargan.
 * Las rutas con # (/#/practica) se envían como /practica para que cada página cuente por separado.
 * Se activan en el panel de Vercel: proyecto → Analytics y Speed Insights → Enable.
 */
const Insights = __VERCEL__
  ? lazy(() =>
      Promise.all([import('@vercel/analytics/react'), import('@vercel/speed-insights/react')]).then(([a, s]) => ({
        default: () => (
          <>
            <a.Analytics beforeSend={(e) => ({ ...e, url: e.url.replace('/#/', '/') })} />
            <s.SpeedInsights />
          </>
        ),
      })),
    )
  : null

export function VercelInsights() {
  if (!Insights) return null
  return (
    <Suspense fallback={null}>
      <Insights />
    </Suspense>
  )
}
