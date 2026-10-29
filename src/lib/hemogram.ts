/**
 * Lectura didáctica de un hemograma de adulto. Los rangos varían un poco entre laboratorios; aquí se usan
 * valores de referencia habituales y los cortes de anemia de la OMS (Hb < 13 g/dL en hombres, < 12 en mujeres
 * y < 11 en el embarazo).
 */

export type Sex = 'hombre' | 'mujer' | 'embarazada'

export interface HemogramInput {
  sex: Sex
  /** g/dL */
  hb: number
  /** fL */
  mcv?: number
  /** pg */
  mch?: number
  /** % */
  rdw?: number
  /** Glóbulos rojos, millones/µL. */
  rbc?: number
  /** Reticulocitos, %. */
  retic?: number
  /** Leucocitos totales, /µL. */
  wbc?: number
  /** Fórmula en %. */
  neutPct?: number
  lymphPct?: number
  eosPct?: number
  /** Plaquetas, /µL. */
  plt?: number
}

export type Flag = 'bajo' | 'normal' | 'alto'

export interface Finding {
  key: string
  label: string
  value: string
  flag: Flag
  note?: string
}

export interface HemogramReading {
  findings: Finding[]
  /** Conclusiones en orden de importancia. */
  summary: string[]
  anemia: boolean
  /** Clasificación morfológica si hay anemia. */
  anemiaType?: 'microcítica' | 'normocítica' | 'macrocítica'
}

export const RANGES = {
  hb: { hombre: [13.5, 17.5], mujer: [12, 15.5], embarazada: [11, 14] },
  anemiaCut: { hombre: 13, mujer: 12, embarazada: 11 },
  mcv: [80, 100],
  mch: [27, 33],
  rdw: [11.5, 14.5],
  rbc: { hombre: [4.5, 5.9], mujer: [4, 5.2], embarazada: [3.5, 5] },
  retic: [0.5, 2.5],
  wbc: [4000, 11000],
  neut: [1500, 7500],
  lymph: [1000, 4000],
  eos: [0, 500],
  plt: [150000, 450000],
} as const

const flagOf = (v: number, [lo, hi]: readonly [number, number] | readonly number[]): Flag => (v < lo ? 'bajo' : v > hi ? 'alto' : 'normal')
/** Miles con espacio desde 10 000 y coma decimal, como en las referencias (norma de la RAE). */
const fmt = (n: number) => (Math.abs(n) >= 10000 ? String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') : String(n))
const dec = (n: number) => String(n).replace('.', ',')

/** Índice de Mentzer: VCM ÷ glóbulos rojos (millones). < 13 sugiere talasemia; > 13, ferropenia. */
export const mentzer = (mcv: number, rbc: number) => Math.round((mcv / rbc) * 10) / 10

/** Neutrófilos u otra célula en valor absoluto a partir del porcentaje. */
export const absolute = (wbc: number, pct: number) => Math.round((wbc * pct) / 100)

export function neutropeniaGrade(anc: number): 'leve' | 'moderada' | 'grave' | null {
  if (anc >= 1500) return null
  if (anc >= 1000) return 'leve'
  if (anc >= 500) return 'moderada'
  return 'grave'
}

export function readHemogram(x: HemogramInput): HemogramReading {
  const findings: Finding[] = []
  const summary: string[] = []
  const anemia = x.hb < RANGES.anemiaCut[x.sex]
  // La marca baja usa el mismo corte que el diagnóstico de anemia, para que no se contradigan.
  findings.push({ key: 'hb', label: 'Hemoglobina', value: `${dec(x.hb)} g/dL`, flag: anemia ? 'bajo' : x.hb > RANGES.hb[x.sex][1] ? 'alto' : 'normal' })

  let anemiaType: HemogramReading['anemiaType']
  if (x.mcv !== undefined) {
    findings.push({ key: 'mcv', label: 'VCM', value: `${dec(x.mcv)} fL`, flag: flagOf(x.mcv, RANGES.mcv) })
    if (anemia) anemiaType = x.mcv < 80 ? 'microcítica' : x.mcv > 100 ? 'macrocítica' : 'normocítica'
  }
  if (x.mch !== undefined) findings.push({ key: 'mch', label: 'HCM', value: `${dec(x.mch)} pg`, flag: flagOf(x.mch, RANGES.mch), note: x.mch < 27 ? 'Hipocromía' : undefined })
  if (x.rdw !== undefined) findings.push({ key: 'rdw', label: 'RDW', value: `${dec(x.rdw)} %`, flag: flagOf(x.rdw, RANGES.rdw), note: x.rdw > 14.5 ? 'Anisocitosis: glóbulos de tamaños distintos' : undefined })
  if (x.rbc !== undefined) findings.push({ key: 'rbc', label: 'Glóbulos rojos', value: `${dec(x.rbc)} millones/µL`, flag: flagOf(x.rbc, RANGES.rbc[x.sex]) })
  if (x.retic !== undefined) findings.push({ key: 'retic', label: 'Reticulocitos', value: `${dec(x.retic)} %`, flag: flagOf(x.retic, RANGES.retic) })

  if (anemia) {
    const severity = x.hb < 8 ? 'grave' : x.hb < 10 ? 'moderada' : 'leve'
    if (anemiaType === 'microcítica') {
      const m = x.rbc && x.mcv ? mentzer(x.mcv, x.rbc) : null
      if (m !== null && m < 13 && (x.rdw === undefined || x.rdw <= 14.5)) summary.push(`Anemia ${severity} microcítica con índice de Mentzer de ${dec(m)} (< 13) y RDW normal: sugiere rasgo talasémico. Pide electroforesis de hemoglobina.`)
      else summary.push(`Anemia ${severity} microcítica${x.rdw !== undefined && x.rdw > 14.5 ? ' con RDW alto' : ''}: la causa más frecuente es la ferropenia. Pide ferritina (baja la confirma); piensa también en enfermedad crónica y talasemia.`)
    } else if (anemiaType === 'macrocítica') {
      summary.push(`Anemia ${severity} macrocítica: piensa en déficit de B12 o folato (sobre todo si el VCM > 115 fL), alcohol, hepatopatía, hipotiroidismo, fármacos o reticulocitosis. Pide B12, folato y frotis.`)
    } else if (anemiaType === 'normocítica') {
      if (x.retic !== undefined && x.retic > 2.5) summary.push(`Anemia ${severity} normocítica con reticulocitos altos: la médula responde. Piensa en hemólisis (LDH, bilirrubina indirecta, haptoglobina) o sangrado agudo.`)
      else summary.push(`Anemia ${severity} normocítica${x.retic !== undefined ? ' con reticulocitos bajos' : ''}: enfermedad crónica, enfermedad renal crónica, sangrado agudo o falla medular. Los reticulocitos separan las regenerativas de las que no lo son.`)
    } else summary.push(`Anemia ${severity}. Mira el VCM para clasificarla.`)
  }

  if (x.wbc !== undefined) {
    findings.push({ key: 'wbc', label: 'Leucocitos', value: `${fmt(x.wbc)} /µL`, flag: flagOf(x.wbc, RANGES.wbc) })
    if (x.neutPct !== undefined) {
      const anc = absolute(x.wbc, x.neutPct)
      const grade = neutropeniaGrade(anc)
      findings.push({ key: 'neut', label: 'Neutrófilos (absolutos)', value: `${fmt(anc)} /µL`, flag: flagOf(anc, RANGES.neut), note: grade ? `Neutropenia ${grade}` : undefined })
      if (grade === 'grave') summary.push(`Neutropenia grave (${fmt(anc)}/µL): alto riesgo de infección. Si hay fiebre, es una neutropenia febril: hemocultivos y antibiótico de amplio espectro en la primera hora.`)
      else if (grade) summary.push(`Neutropenia ${grade} (${fmt(anc)}/µL): revisa fármacos, infecciones virales y la médula ósea.`)
      else if (anc > 7500) summary.push(`Neutrofilia (${fmt(anc)}/µL): infección bacteriana, inflamación, estrés o corticoides.`)
    }
    if (x.lymphPct !== undefined) {
      const abs = absolute(x.wbc, x.lymphPct)
      findings.push({ key: 'lymph', label: 'Linfocitos (absolutos)', value: `${fmt(abs)} /µL`, flag: flagOf(abs, RANGES.lymph) })
      if (abs > 4000) summary.push(`Linfocitosis (${fmt(abs)}/µL): infecciones virales (mononucleosis, con linfocitos atípicos), tos ferina o, en adultos mayores, leucemia linfocítica crónica.`)
      else if (abs < 1000) summary.push(`Linfopenia (${fmt(abs)}/µL): VIH, corticoides, infecciones graves o quimioterapia.`)
    }
    if (x.eosPct !== undefined) {
      const abs = absolute(x.wbc, x.eosPct)
      findings.push({ key: 'eos', label: 'Eosinófilos (absolutos)', value: `${fmt(abs)} /µL`, flag: flagOf(abs, RANGES.eos) })
      if (abs > 500) summary.push(`Eosinofilia (${fmt(abs)}/µL): parásitos, alergias, asma o fármacos.`)
    }
  }

  if (x.plt !== undefined) {
    findings.push({ key: 'plt', label: 'Plaquetas', value: `${fmt(x.plt)} /µL`, flag: flagOf(x.plt, RANGES.plt) })
    if (x.plt < 150000) summary.push(`Trombocitopenia (${fmt(x.plt)}/µL)${x.plt < 20000 ? ': riesgo de sangrado espontáneo' : ''}. Descarta seudotrombocitopenia por EDTA con un frotis o un tubo con citrato.`)
    else if (x.plt > 450000) summary.push(`Trombocitosis (${fmt(x.plt)}/µL): casi siempre reactiva (ferropenia, inflamación, infección); si es persistente y marcada, piensa en un síndrome mieloproliferativo.`)
  }

  const low = (k: string) => findings.find((f) => f.key === k)?.flag === 'bajo'
  if (anemia && low('wbc') && low('plt')) summary.unshift('Pancitopenia (las tres series bajas): aplasia medular, infiltración de la médula, déficit de B12, hiperesplenismo o fármacos. Suele requerir aspirado y biopsia de médula ósea.')
  if (!summary.length) summary.push('Sin alteraciones en los valores ingresados.')

  return { findings, summary, anemia, anemiaType }
}
