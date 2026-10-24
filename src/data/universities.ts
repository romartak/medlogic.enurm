/**
 * Instituciones de educación superior de la República Dominicana, para que cada estudiante
 * indique de dónde viene (y, con cuenta, ver su posición dentro de su universidad).
 * Fuente: lista de universidades de la República Dominicana (Wikipedia) y el sistema del MESCyT.
 */
export interface University {
  id: string
  name: string
  short: string
  city: string
  /** Las que más eligen quienes se preparan para el ENURM: se muestran primero. */
  common?: boolean
}

export const UNIVERSITIES: University[] = [
  // Más comunes entre quienes se presentan al ENURM
  { id: 'uasd', name: 'Universidad Autónoma de Santo Domingo', short: 'UASD', city: 'Santo Domingo', common: true },
  { id: 'pucmm', name: 'Pontificia Universidad Católica Madre y Maestra', short: 'PUCMM', city: 'Santiago', common: true },
  { id: 'intec', name: 'Instituto Tecnológico de Santo Domingo', short: 'INTEC', city: 'Santo Domingo', common: true },
  { id: 'unibe', name: 'Universidad Iberoamericana', short: 'UNIBE', city: 'Santo Domingo', common: true },
  { id: 'unphu', name: 'Universidad Nacional Pedro Henríquez Ureña', short: 'UNPHU', city: 'Santo Domingo', common: true },
  { id: 'uce', name: 'Universidad Central del Este', short: 'UCE', city: 'San Pedro de Macorís', common: true },
  { id: 'utesa', name: 'Universidad Tecnológica de Santiago', short: 'UTESA', city: 'Santiago', common: true },
  { id: 'ucsd', name: 'Universidad Católica Santo Domingo', short: 'UCSD', city: 'Santo Domingo', common: true },
  { id: 'ucne', name: 'Universidad Católica Nordestana', short: 'UCNE', city: 'San Francisco de Macorís', common: true },
  { id: 'ucateci', name: 'Universidad Católica del Cibao', short: 'UCATECI', city: 'La Vega', common: true },
  { id: 'ufhec', name: 'Universidad Federico Henríquez y Carvajal', short: 'UFHEC', city: 'Santo Domingo', common: true },
  { id: 'unev', name: 'Universidad Nacional Evangélica', short: 'UNEV', city: 'Santiago', common: true },
  // Resto de instituciones de educación superior, en orden alfabético
  { id: 'asca', name: 'Academia Superior de Ciencias Aeronáuticas', short: 'ASCA', city: 'Santo Domingo' },
  { id: 'adsd', name: 'Academia de Diseño de Santo Domingo', short: 'ADSD', city: 'Santo Domingo' },
  { id: 'barna', name: 'Barna Escuela de Negocios', short: 'BARNA', city: 'Santo Domingo' },
  { id: 'flacso', name: 'Facultad Latinoamericana de Ciencias Sociales', short: 'FLACSO', city: 'Santo Domingo' },
  { id: 'ices', name: 'Instituto Cristiano de Estudios Superiores Especializados', short: 'ICES', city: 'Santiago' },
  { id: 'ispe', name: 'Instituto de Servicios Psicosociales y Educativos', short: 'ISPE', city: 'Santo Domingo' },
  { id: 'ieespon', name: 'Instituto Especializado de Estudios Superiores de la Policía Nacional', short: 'IEESPON', city: 'Santo Domingo' },
  { id: 'ieesl', name: 'Instituto Especializado de Estudios Superiores Loyola', short: 'IEESL', city: 'San Cristóbal' },
  { id: 'iglobal', name: 'Instituto Global de Altos Estudios en Ciencias Sociales', short: 'IGLOBAL', city: 'Santo Domingo' },
  { id: 'siti', name: 'Instituto Stevens de Tecnología Internacional', short: 'SITI', city: 'Santo Domingo' },
  { id: 'ise-lhb', name: 'Instituto Superior de Estudios Especializados Luis Heredia Bonetti', short: 'ISE-LHB', city: 'Santo Domingo' },
  { id: 'isfodosu', name: 'Instituto Superior de Formación Docente Salomé Ureña', short: 'ISFODOSU', city: 'Santo Domingo' },
  { id: 'insutec', name: 'Instituto Superior de Tecnología Universal', short: 'INSUTEC', city: 'Santo Domingo' },
  { id: 'insude', name: 'Instituto Superior para la Defensa', short: 'INSUDE', city: 'Santo Domingo' },
  { id: 'itsov', name: 'Instituto Técnico Superior Oscus San Valero', short: 'ITSOV', city: 'Santo Domingo' },
  { id: 'itla', name: 'Instituto Tecnológico de las Américas', short: 'ITLA', city: 'Santo Domingo' },
  { id: 'iteco', name: 'Instituto Tecnológico del Cibao Oriental', short: 'ITECO', city: 'Cotuí' },
  { id: 'itesumj', name: 'Instituto Tecnológico Mercy Jácquez', short: 'ITESUMJ', city: 'Santo Domingo' },
  { id: 'cbiu', name: 'Puerto Plata Business School', short: 'CBIU', city: 'Puerto Plata' },
  { id: 'uapa', name: 'Universidad Abierta para Adultos', short: 'UAPA', city: 'Santiago' },
  { id: 'unapec', name: 'Universidad APEC', short: 'UNAPEC', city: 'Santo Domingo' },
  { id: 'unad', name: 'Universidad Adventista Dominicana', short: 'UNAD', city: 'Bonao' },
  { id: 'uafam', name: 'Universidad Agroforestal Fernando Arturo de Meriño', short: 'UAFAM', city: 'Jarabacoa' },
  { id: 'ucade', name: 'Universidad Católica del Este', short: 'UCADE', city: 'Higüey' },
  { id: 'ucateba', name: 'Universidad Católica Tecnológica de Barahona', short: 'UCATEBA', city: 'Barahona' },
  { id: 'ucdep', name: 'Universidad Central Dominicana de Estudios Profesionales', short: 'UCDEP', city: 'Santo Domingo' },
  { id: 'unicda', name: 'Universidad Cultural Dominico Americana', short: 'UNICDA', city: 'Santo Domingo' },
  { id: 'ute', name: 'Universidad de la Tercera Edad', short: 'UTE', city: 'Santo Domingo' },
  { id: 'unicaribe', name: 'Universidad del Caribe', short: 'UNICARIBE', city: 'Santo Domingo' },
  { id: 'oym', name: 'Universidad Dominicana Organización y Método', short: 'O&M', city: 'Santo Domingo' },
  { id: 'uniremhos', name: 'Universidad Eugenio María de Hostos', short: 'UNIREMHOS', city: 'Santo Domingo' },
  { id: 'unefa', name: 'Universidad Experimental Félix Adam', short: 'UNEFA', city: 'Santo Domingo' },
  { id: 'ince', name: 'Universidad INCE', short: 'INCE', city: 'Santo Domingo' },
  { id: 'unica', name: 'Universidad Interamericana', short: 'UNICA', city: 'Santo Domingo' },
  { id: 'unisa', name: 'Universidad ISA', short: 'UNISA', city: 'Santiago' },
  { id: 'unnatec', name: 'Universidad Nacional Tecnológica', short: 'UNNATEC', city: 'Santo Domingo' },
  { id: 'uod', name: 'Universidad Odontológica Dominicana', short: 'UOD', city: 'Santo Domingo' },
  { id: 'upid', name: 'Universidad Psicología Industrial Dominicana', short: 'UPID', city: 'Santo Domingo' },
  { id: 'utesur', name: 'Universidad Tecnológica del Sur', short: 'UTESUR', city: 'Azua' },
]

/** Opciones que no son una universidad dominicana concreta. */
export const UNIVERSITY_OTHER = [
  { id: 'extranjera', name: 'Universidad extranjera', short: 'Extranjera' },
  { id: 'otra', name: 'Otra (escríbela)', short: 'Otra' },
  { id: 'sin-decir', name: 'Prefiero no decirlo', short: '—' },
] as const

/** Las que piden escribir el nombre. */
export const UNIVERSITY_NEEDS_NAME = new Set(['extranjera', 'otra'])

export function universityLabel(id: string | null | undefined, other?: string): string {
  if (!id) return 'Sin universidad'
  const u = UNIVERSITIES.find((x) => x.id === id)
  if (u) return u.short
  if (UNIVERSITY_NEEDS_NAME.has(id) && other?.trim()) return other.trim()
  return UNIVERSITY_OTHER.find((x) => x.id === id)?.short ?? id
}
