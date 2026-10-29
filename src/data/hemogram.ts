import type { GuideSection } from '@/types'
import type { HemogramInput } from '@/lib/hemogram'

export interface HemogramCase {
  id: string
  title: string
  vignette: string
  input: HemogramInput
  /** Otros estudios del caso (no son parte del hemograma). */
  extra?: string[]
  q: string
  options: string[]
  answer: number
  why: string
}

export const HEMO_SECTIONS: GuideSection[] = [
  {
    heading: 'Cómo leerlo en cinco pasos',
    bullets: [
      '1. Mira las tres series: roja (hemoglobina), blanca (leucocitos) y plaquetas. ¿Está alterada una sola o varias? Si bajan las tres, es pancitopenia.',
      '2. Serie roja: ¿hay anemia? Clasifícala por el VCM (micro, normo o macrocítica) y mira el RDW y los reticulocitos.',
      '3. Serie blanca: mira el total y luego cada tipo en valor absoluto (leucocitos × porcentaje). Los porcentajes solos engañan.',
      '4. Plaquetas: ¿bajas, normales o altas? Una cifra muy baja sin sangrado puede ser un artefacto del tubo.',
      '5. Si algo no cuadra, pide el frotis de sangre periférica: ahí se ven esquistocitos, blastos, neutrófilos hipersegmentados o linfocitos atípicos.',
    ],
    pearl: 'Neutrófilos absolutos = leucocitos × % de neutrófilos ÷ 100. Un 80 % de neutrófilos con 2000 leucocitos son solo 1600/µL.',
  },
  {
    heading: 'Valores de referencia (adulto)',
    table: {
      head: ['Parámetro', 'Referencia', 'Qué indica'],
      rows: [
        ['Hemoglobina', 'Hombre 13,5–17,5 g/dL · Mujer 12–15,5 g/dL', 'Anemia (OMS): < 13 en hombres, < 12 en mujeres, < 11 en el embarazo'],
        ['Hematocrito', 'Hombre 41–53 % · Mujer 36–46 %', 'Aproximadamente 3 × la hemoglobina'],
        ['VCM', '80–100 fL', 'Tamaño del glóbulo rojo: clasifica la anemia'],
        ['HCM', '27–33 pg', 'Hemoglobina por glóbulo: baja = hipocromía'],
        ['CHCM', '32–36 g/dL', 'Alta en la esferocitosis'],
        ['RDW', '11,5–14,5 %', 'Variación del tamaño (anisocitosis): alto en ferropenia'],
        ['Reticulocitos', '0,5–2,5 %', 'Respuesta de la médula: altos en hemólisis y sangrado'],
        ['Leucocitos', '4000–11 000 /µL', ''],
        ['Neutrófilos', '1500–7500 /µL', 'Bacterias, inflamación; bajos con quimioterapia'],
        ['Linfocitos', '1000–4000 /µL', 'Virus; bajos en VIH y con corticoides'],
        ['Eosinófilos', '< 500 /µL', 'Parásitos, alergias, fármacos'],
        ['Plaquetas', '150 000–450 000 /µL', 'Sangrado espontáneo con < 20 000'],
      ],
    },
    warning: 'Los rangos cambian según el laboratorio, la altitud, la edad y el embarazo. En niños son distintos: usa las tablas pediátricas.',
  },
  {
    heading: 'Anemias según el VCM',
    table: {
      head: ['Tipo', 'Causas', 'Qué pedir'],
      rows: [
        ['Microcítica (< 80 fL)', 'Ferropenia (la más frecuente), talasemia, enfermedad crónica, sideroblástica', 'Ferritina; electroforesis de hemoglobina si la ferritina es normal'],
        ['Normocítica (80–100 fL)', 'Sangrado agudo, hemólisis, enfermedad renal crónica, enfermedad crónica, falla medular', 'Reticulocitos; LDH, bilirrubina y haptoglobina si sospechas hemólisis; creatinina'],
        ['Macrocítica (> 100 fL)', 'Déficit de B12 o folato, alcohol, hepatopatía, hipotiroidismo, fármacos (metotrexato, hidroxiurea), reticulocitosis, mielodisplasia', 'B12, folato, frotis (neutrófilos hipersegmentados), TSH, pruebas hepáticas'],
      ],
    },
    bullets: [
      'Ferropenia frente a talasemia: la ferropenia tiene RDW alto y ferritina baja; el rasgo talasémico tiene muchos glóbulos rojos, VCM muy bajo para la poca anemia, RDW normal e índice de Mentzer (VCM ÷ GR) < 13.',
      'La ferritina es reactante de fase aguda: con inflamación puede salir normal aunque falte hierro.',
      'El déficit de B12 da además síntomas neurológicos (parestesias, ataxia, degeneración combinada subaguda); el de folato, no.',
      'Hemólisis: reticulocitos altos, LDH alta, bilirrubina indirecta alta y haptoglobina baja. Los esquistocitos en el frotis indican hemólisis microangiopática (PTT, SHU, CID).',
    ],
  },
  {
    heading: 'Glóbulos blancos',
    table: {
      head: ['Hallazgo', 'Piensa en'],
      rows: [
        ['Neutrofilia', 'Infección bacteriana, inflamación, estrés, corticoides; con desviación a la izquierda (cayados) en infecciones'],
        ['Neutropenia', 'Quimioterapia, fármacos (metamizol, antitiroideos, clozapina), virus, déficit de B12, infiltración medular'],
        ['Linfocitosis', 'Virus (mononucleosis con linfocitos atípicos), tos ferina, leucemia linfocítica crónica'],
        ['Linfopenia', 'VIH, corticoides, sepsis, quimioterapia'],
        ['Eosinofilia', 'Parásitos (helmintos), asma y alergias, fármacos (DRESS), insuficiencia suprarrenal'],
        ['Blastos en sangre', 'Leucemia aguda: urgencia hematológica'],
      ],
    },
    warning: 'Neutropenia grave (< 500/µL) con fiebre es una neutropenia febril: hemocultivos y antibiótico de amplio espectro con cobertura para Pseudomonas en la primera hora.',
  },
  {
    heading: 'Plaquetas',
    bullets: [
      'Trombocitopenia aislada en un adulto sano con petequias: piensa en púrpura trombocitopénica inmune (PTI) después de descartar fármacos, VIH, hepatitis C y seudotrombocitopenia.',
      'Seudotrombocitopenia: las plaquetas se agrupan con el anticoagulante EDTA. El frotis muestra grumos; repítelas en un tubo con citrato.',
      'Trombocitopenia con anemia hemolítica, esquistocitos, fiebre, alteración neurológica o renal: púrpura trombótica trombocitopénica. No transfundas plaquetas: plasmaféresis urgente.',
      'Trombocitosis: casi siempre reactiva (ferropenia, inflamación, posesplenectomía). Si es persistente > 450 000 sin causa, estudia un síndrome mieloproliferativo (trombocitemia esencial).',
    ],
  },
]

export const HEMO_REFERENCES = [
  'Organización Mundial de la Salud. Guideline on haemoglobin cutoffs to define anaemia in individuals and populations. Ginebra: OMS; 2024.',
  'Hoffbrand AV, Moss PAH. Hoffbrand. Fundamentos de hematología, 8.ª ed. Panamericana; 2022.',
  'Loscalzo J, et al. Harrison. Principios de Medicina Interna, 21.ª ed. McGraw Hill; 2022: anemias y trastornos de los leucocitos.',
  'Freifeld AG, et al. Clinical practice guideline for the use of antimicrobial agents in neutropenic patients with cancer: 2010 update by the IDSA. Clin Infect Dis. 2011;52:e56–e93.',
]

export const HEMO_CASES: HemogramCase[] = [
  {
    id: 'ferropenia',
    title: 'Cansancio y reglas abundantes',
    vignette: 'Mujer de 28 años con cansancio de varios meses y menstruaciones abundantes. Uñas frágiles.',
    input: { sex: 'mujer', hb: 9.1, mcv: 68, mch: 21, rdw: 18.5, rbc: 4.2, wbc: 6800, neutPct: 58, lymphPct: 32, plt: 468000 },
    q: '¿Qué estudio confirma la causa más probable?',
    options: ['Ferritina', 'Electroforesis de hemoglobina', 'Vitamina B12', 'Aspirado de médula ósea'],
    answer: 0,
    why: 'Anemia microcítica hipocrómica con RDW alto y trombocitosis reactiva: ferropenia por pérdidas menstruales. Una ferritina baja la confirma.',
  },
  {
    id: 'talasemia',
    title: 'Anemia leve en un chequeo',
    vignette: 'Hombre de 24 años, asintomático, en un chequeo de empleo. Su madre «siempre tuvo la sangre baja». Ferritina normal.',
    input: { sex: 'hombre', hb: 11.8, mcv: 64, mch: 20, rdw: 13.5, rbc: 5.9, wbc: 7100, plt: 260000 },
    q: '¿Qué es lo más probable?',
    options: ['Ferropenia', 'Rasgo talasémico (talasemia menor)', 'Anemia de la enfermedad crónica', 'Anemia megaloblástica'],
    answer: 1,
    why: 'Microcitosis marcada con anemia leve, muchos glóbulos rojos, RDW normal, ferritina normal e índice de Mentzer de 10,8 (< 13). La electroforesis mostrará la HbA2 aumentada en la beta-talasemia menor. No necesita hierro.',
  },
  {
    id: 'b12',
    title: 'Hormigueo en los pies',
    vignette: 'Hombre de 62 años con gastrectomía hace 8 años. Cansancio, hormigueo en los pies y marcha inestable. El frotis muestra neutrófilos hipersegmentados.',
    input: { sex: 'hombre', hb: 8.7, mcv: 118, rdw: 16, wbc: 3600, neutPct: 55, plt: 128000 },
    q: '¿Cuál es el déficit más probable?',
    options: ['Hierro', 'Vitamina B12', 'Ácido fólico', 'Eritropoyetina'],
    answer: 1,
    why: 'Anemia macrocítica (VCM 118) con neutrófilos hipersegmentados y síntomas neurológicos tras gastrectomía (sin factor intrínseco): déficit de B12. El déficit de folato no da clínica neurológica. Se trata con B12 parenteral.',
  },
  {
    id: 'hemolisis',
    title: 'Ictericia después de comer habas',
    vignette: 'Hombre de 19 años con ictericia y orina oscura dos días después de comer habas.',
    input: { sex: 'hombre', hb: 8.9, mcv: 92, retic: 9, wbc: 9800, plt: 240000 },
    extra: ['LDH 820 U/L (alta)', 'Bilirrubina indirecta 3,6 mg/dL', 'Haptoglobina baja', 'Frotis: células «mordidas» y cuerpos de Heinz'],
    q: '¿Qué diagnóstico es más probable?',
    options: ['Déficit de glucosa-6-fosfato deshidrogenasa', 'Esferocitosis hereditaria', 'Anemia aplásica', 'Ferropenia'],
    answer: 0,
    why: 'Hemólisis aguda (reticulocitos, LDH y bilirrubina indirecta altos, haptoglobina baja) desencadenada por habas, con cuerpos de Heinz: déficit de G6PD. La enzima puede salir falsamente normal durante la crisis.',
  },
  {
    id: 'neutropenia-febril',
    title: 'Fiebre durante la quimioterapia',
    vignette: 'Mujer de 45 años en quimioterapia por cáncer de mama, con fiebre de 38,6 °C desde hace 2 horas. Hemodinámicamente estable.',
    input: { sex: 'mujer', hb: 10.4, mcv: 90, wbc: 900, neutPct: 30, plt: 98000 },
    q: '¿Qué haces ahora?',
    options: ['Esperar el cultivo para elegir el antibiótico', 'Hemocultivos y antibiótico de amplio espectro antipseudomonas en la primera hora', 'Paracetamol y control en 48 horas', 'Transfundir plaquetas'],
    answer: 1,
    why: 'Neutrófilos absolutos de 270/µL con fiebre: neutropenia febril. Es una urgencia: hemocultivos y un betalactámico antipseudomonas (cefepime o piperacilina-tazobactam) sin esperar resultados.',
  },
  {
    id: 'pti',
    title: 'Petequias en las piernas',
    vignette: 'Mujer de 30 años con petequias en las piernas y sangrado de encías tras un resfriado. Sin fiebre, sin esplenomegalia. El frotis confirma plaquetas escasas, sin grumos ni esquistocitos.',
    input: { sex: 'mujer', hb: 13.2, mcv: 88, wbc: 7200, neutPct: 60, plt: 18000 },
    q: '¿Cuál es el diagnóstico más probable?',
    options: ['Púrpura trombocitopénica inmune', 'Púrpura trombótica trombocitopénica', 'Leucemia aguda', 'Coagulación intravascular diseminada'],
    answer: 0,
    why: 'Trombocitopenia aislada, con las otras series normales, frotis sin esquistocitos y sin otra causa: PTI. Con < 20 000 y sangrado de mucosas se tratan con corticoides (± inmunoglobulina IV).',
  },
  {
    id: 'mononucleosis',
    title: 'Fiebre y dolor de garganta',
    vignette: 'Estudiante de 17 años con fiebre, faringitis exudativa, adenopatías cervicales posteriores y cansancio intenso. El frotis muestra linfocitos atípicos.',
    input: { sex: 'hombre', hb: 14.6, mcv: 89, wbc: 13500, neutPct: 28, lymphPct: 62, plt: 165000 },
    q: '¿Qué prueba confirma la sospecha?',
    options: ['Cultivo faríngeo', 'Anticuerpos heterófilos (Paul-Bunnell) o serología de Epstein-Barr', 'Aspirado de médula ósea', 'Hemocultivos'],
    answer: 1,
    why: 'Linfocitosis absoluta (8370/µL) con linfocitos atípicos en un adolescente con faringitis y adenopatías posteriores: mononucleosis infecciosa por virus de Epstein-Barr. Evita la amoxicilina (exantema) y los deportes de contacto (rotura esplénica).',
  },
  {
    id: 'pancitopenia',
    title: 'Palidez, infecciones y moretones',
    vignette: 'Hombre de 35 años con cansancio, infecciones repetidas y moretones fáciles. Sin esplenomegalia.',
    input: { sex: 'hombre', hb: 7.2, mcv: 96, retic: 0.2, wbc: 1800, neutPct: 35, plt: 40000 },
    q: '¿Cuál es el siguiente paso?',
    options: ['Hierro oral y control', 'Aspirado y biopsia de médula ósea', 'Esplenectomía', 'Solo vitaminas'],
    answer: 1,
    why: 'Pancitopenia con reticulocitos bajos: la médula no produce. Hay que ver la médula (aplasia, leucemia, mielodisplasia, infiltración); la biopsia la distingue.',
  },
]
