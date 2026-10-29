/**
 * Dibujos esquemáticos de fracturas: un hueso largo visto de frente con el trazo encima, y el extremo de un
 * hueso infantil con su fisis para Salter-Harris. Son diagramas didácticos, no radiografías.
 */
export type FractureLine = 'transversa' | 'oblicua' | 'espiral' | 'conminuta' | 'segmentaria' | 'tallo-verde' | 'rodete' | 'avulsion' | 'impactada' | 'patologica' | 'estres'

const BONE = { fill: '#f6efe0', stroke: '#9c8458' }
const CRACK = '#b91c1c'

/** Diáfisis entre dos epífisis redondeadas, en un lienzo de 240 × 80. */
function LongBone() {
  return (
    <g fill={BONE.fill} stroke={BONE.stroke} strokeWidth="1.6">
      <path d="M34 22 C18 16 8 26 12 36 C6 44 14 58 30 54 L210 54 C226 58 234 44 228 36 C232 26 222 16 206 22 Z" />
      <path d="M40 30 H200 M40 46 H200" stroke={BONE.stroke} strokeOpacity="0.25" fill="none" />
    </g>
  )
}

/** El mismo hueso arqueado hacia arriba: en el tallo verde se rompe solo la cortical convexa (la que se estira). */
function BentBone() {
  return (
    <path
      d="M34 22 C18 16 8 26 12 36 C6 44 14 58 30 54 Q120 40 210 54 C226 58 234 44 228 36 C232 26 222 16 206 22 Q120 6 34 22 Z"
      fill={BONE.fill}
      stroke={BONE.stroke}
      strokeWidth="1.6"
    />
  )
}

const LINES: Record<FractureLine, React.ReactNode> = {
  transversa: <path d="M120 21 V55" stroke={CRACK} strokeWidth="2.6" strokeLinecap="round" />,
  oblicua: <path d="M104 21 L136 55" stroke={CRACK} strokeWidth="2.6" strokeLinecap="round" />,
  espiral: (
    <g fill="none" stroke={CRACK} strokeWidth="2.6" strokeLinecap="round">
      <path d="M96 21 C112 26 112 40 128 46 C136 49 140 52 144 55" />
      <path d="M96 21 C88 30 120 42 144 55" strokeDasharray="3 3" strokeOpacity="0.55" />
    </g>
  ),
  conminuta: (
    <g fill="none" stroke={CRACK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M104 21 L118 38 L106 55" />
      <path d="M138 21 L124 37 L136 55" />
      <path d="M118 38 L124 37" />
      <path d="M112 30 L130 31 M111 47 L129 46" />
    </g>
  ),
  segmentaria: (
    <g stroke={CRACK} strokeWidth="2.6" strokeLinecap="round">
      <path d="M88 21 V55" />
      <path d="M152 21 L148 55" />
    </g>
  ),
  'tallo-verde': <path d="M120 14 L124 23 L119 31" fill="none" stroke={CRACK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />,
  rodete: (
    <g fill={BONE.fill} stroke={BONE.stroke} strokeWidth="1.6">
      <path d="M52 22 Q58 15 64 22" />
      <path d="M52 54 Q58 61 64 54" />
      <path d="M58 21 V26 M58 50 V55" stroke={CRACK} strokeWidth="2" />
    </g>
  ),
  avulsion: (
    <g>
      <path d="M200 20 L214 17 L216 25 L203 27 Z" fill={BONE.fill} stroke={CRACK} strokeWidth="2" transform="translate(6 -8)" />
      <path d="M216 9 C226 2 236 2 240 0" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <path d="M201 22 L214 19" stroke={CRACK} strokeWidth="2" strokeDasharray="2 2" />
    </g>
  ),
  impactada: (
    <g stroke={CRACK} strokeLinecap="round">
      <path d="M116 21 V55" strokeWidth="2.4" />
      <path d="M124 21 V55" strokeWidth="2.4" />
      <rect x="116" y="21" width="8" height="34" fill={CRACK} fillOpacity="0.25" stroke="none" />
    </g>
  ),
  patologica: (
    <g>
      <ellipse cx="120" cy="38" rx="14" ry="10" fill="#fde68a" fillOpacity="0.8" stroke="#b45309" strokeWidth="1.6" strokeDasharray="3 2" />
      <path d="M118 21 L122 55" stroke={CRACK} strokeWidth="2.6" strokeLinecap="round" />
    </g>
  ),
  estres: (
    <g>
      <path d="M120 21 L121 31" stroke={CRACK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M108 21 Q120 13 132 21" fill={BONE.fill} stroke={BONE.stroke} strokeWidth="1.6" />
    </g>
  ),
}

export function FractureArt({ line, className, title }: { line: FractureLine; className?: string; title: string }) {
  return (
    <svg viewBox="0 0 240 80" className={className} role="img" aria-label={title}>
      {line === 'tallo-verde' ? <BentBone /> : <LongBone />}
      {LINES[line]}
    </svg>
  )
}

export type SalterType = 1 | 2 | 3 | 4 | 5

/** Extremo distal de un hueso infantil: epífisis arriba, fisis (cartílago de crecimiento) y metáfisis abajo. */
export function SalterArt({ type, className }: { type: SalterType; className?: string }) {
  const lines: Record<SalterType, React.ReactNode> = {
    1: <path d="M22 58 H118" stroke={CRACK} strokeWidth="3.2" strokeLinecap="round" />,
    2: <path d="M22 58 H80 L104 96" stroke={CRACK} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    3: <path d="M70 18 L72 58 H118" stroke={CRACK} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    4: <path d="M66 18 L76 58 L92 100" stroke={CRACK} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    5: (
      <g>
        <path d="M22 58 L32 54 L42 60 L52 54 L62 60 L72 54 L82 60 L92 54 L102 60 L112 54 L118 58" stroke={CRACK} strokeWidth="3" fill="none" strokeLinejoin="round" />
        <path d="M70 2 V14 M64 8 L70 14 L76 8" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    ),
  }
  return (
    <svg viewBox="0 0 140 130" className={className} role="img" aria-label={`Fractura de Salter-Harris tipo ${'I II III IV V'.split(' ')[type - 1]}`}>
      {/* Epífisis */}
      <path d="M20 54 C18 30 40 16 70 16 C100 16 122 30 120 54 Z" fill={BONE.fill} stroke={BONE.stroke} strokeWidth="1.6" />
      {/* Fisis */}
      <rect x="20" y="54" width="100" height="8" rx="2" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1" />
      {/* Metáfisis que se estrecha hacia la diáfisis */}
      <path d="M20 62 H120 C116 84 98 92 96 128 H44 C42 92 24 84 20 62 Z" fill={BONE.fill} stroke={BONE.stroke} strokeWidth="1.6" />
      {lines[type]}
    </svg>
  )
}
