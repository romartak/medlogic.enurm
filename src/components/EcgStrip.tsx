import { useId, useMemo } from 'react'
import { GAIN, PAPER_SPEED, SAMPLE_RATE } from '@/lib/ecg'

/** Tira de ECG sobre papel milimetrado (cuadro pequeño 1 mm = 0,04 s / 0,1 mV; grande 5 mm). */
export function EcgStrip({ samples, seconds, label = 'DII', className }: { samples: number[]; seconds: number; label?: string; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const width = seconds * PAPER_SPEED
  const height = 40
  const base = 26
  const path = useMemo(() => {
    const step = Math.max(1, Math.round(SAMPLE_RATE / 125))
    let d = ''
    for (let i = 0; i < samples.length; i += step) {
      const x = (i / SAMPLE_RATE) * PAPER_SPEED
      const y = Math.min(height - 0.5, Math.max(0.5, base - samples[i] * GAIN))
      d += `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`
    }
    return d
  }, [samples])

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full rounded-xl" role="img" aria-label={`Tira de electrocardiograma de ${seconds} segundos, derivación ${label}`}>
        <defs>
          <pattern id={`s${id}`} width="1" height="1" patternUnits="userSpaceOnUse">
            <path d="M1 0H0V1" fill="none" stroke="#f4b4b4" strokeWidth="0.06" />
          </pattern>
          <pattern id={`b${id}`} width="5" height="5" patternUnits="userSpaceOnUse">
            <rect width="5" height="5" fill={`url(#s${id})`} />
            <path d="M5 0H0V5" fill="none" stroke="#e57373" strokeWidth="0.16" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="#fff7f5" />
        <rect width={width} height={height} fill={`url(#b${id})`} />
        <text x="1.5" y="4.2" fontSize="3" fontWeight="700" fill="#7f1d1d" fontFamily="system-ui, sans-serif">
          {label}
        </text>
        <path d={path} fill="none" stroke="#111827" strokeWidth="0.32" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>25 mm/s · 10 mm/mV</span>
        <span>1 cuadro grande = 0,20 s</span>
      </div>
    </div>
  )
}
