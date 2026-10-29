import type { GuideSection, QuizItem } from '@/types'
import type { LoopShape, SpiroInput } from '@/lib/spirometry'

export const SPIRO_EXAMPLES: { id: string; label: string; input: SpiroInput }[] = [
  { id: 'normal', label: 'Normal', input: { fev1: 3.6, fvc: 4.5, fev1Pred: 95, fvcPred: 98 } },
  { id: 'asma', label: 'Asma', input: { fev1: 2.3, fvc: 3.9, fev1Pred: 68, fvcPred: 92, post: { fev1: 3, fvc: 4.1 } } },
  { id: 'epoc', label: 'EPOC', input: { fev1: 1.3, fvc: 2.9, fev1Pred: 45, fvcPred: 80, post: { fev1: 1.38, fvc: 3 } } },
  { id: 'fibrosis', label: 'Fibrosis pulmonar', input: { fev1: 1.9, fvc: 2.2, fev1Pred: 62, fvcPred: 58 } },
  { id: 'mixto', label: 'Mixto', input: { fev1: 1.1, fvc: 2.1, fev1Pred: 38, fvcPred: 60 } },
]

export const LOOPS: { shape: LoopShape; name: string; what: string; causes: string }[] = [
  { shape: 'normal', name: 'Normal', what: 'Subida rápida a un flujo pico alto y descenso casi recto; rama inspiratoria en semicírculo.', causes: 'Pulmón sano.' },
  { shape: 'obstructivo', name: 'Obstructiva', what: 'Flujo pico más bajo y rama espiratoria «excavada» (cóncava): el aire sale lento al final.', causes: 'Asma, EPOC, bronquiectasias, bronquiolitis obliterante.' },
  { shape: 'restrictivo', name: 'Restrictiva', what: 'Curva estrecha (volumen pequeño) con forma conservada: «sombrero de bruja».', causes: 'Fibrosis pulmonar, enfermedad neuromuscular, obesidad, cifoescoliosis, derrame pleural.' },
  { shape: 'fija', name: 'Obstrucción fija de vía aérea alta', what: 'Ambas ramas aplanadas: meseta arriba y abajo.', causes: 'Estenosis traqueal tras intubación o traqueostomía, bocio que comprime la tráquea.' },
  { shape: 'extratoracica', name: 'Obstrucción variable extratorácica', what: 'Solo la rama inspiratoria se aplana: al inspirar, la vía aérea fuera del tórax se colapsa.', causes: 'Parálisis de cuerdas vocales, tumores de laringe.' },
  { shape: 'intratoracica', name: 'Obstrucción variable intratorácica', what: 'Solo la rama espiratoria se aplana: al espirar, la presión del tórax comprime la vía aérea.', causes: 'Tumores traqueales bajos, traqueomalacia.' },
]

export const SPIRO_SECTIONS: GuideSection[] = [
  {
    heading: 'Qué mide',
    table: {
      head: ['Parámetro', 'Qué es', 'Normal'],
      rows: [
        ['FVC', 'Capacidad vital forzada: todo el aire que se expulsa con fuerza tras una inspiración máxima', '≥ 80 % del predicho'],
        ['FEV1', 'Volumen espirado en el primer segundo', '≥ 80 % del predicho'],
        ['FEV1/FVC', 'Proporción de la FVC que sale en el primer segundo', '≥ 0,70 (o por encima del LIN)'],
        ['FEF25–75', 'Flujo en la parte media de la espiración; sensible a la vía aérea pequeña', 'Variable, poco específico'],
        ['PEF', 'Flujo espiratorio pico', 'Útil para el seguimiento del asma'],
      ],
    },
    pearl: 'El valor predicho depende de la edad, la talla, el sexo y el origen étnico. Un 80 % del predicho es el corte clásico; la ATS/ERS 2022 prefiere el límite inferior de la normalidad (LIN, z-score < −1,645).',
  },
  {
    heading: 'Cómo interpretarla paso a paso',
    bullets: [
      '1. ¿Es de buena calidad? Al menos 3 maniobras aceptables, espiración de ≥ 6 s (o meseta) y las dos mejores FVC y FEV1 a menos de 150 mL entre sí.',
      '2. Mira el cociente FEV1/FVC. Si es < 0,70 (o < LIN) hay obstrucción.',
      '3. Mira la FVC. Si está baja con un cociente normal, sospecha restricción; si está baja con un cociente bajo, el patrón es mixto (o una obstrucción con atrapamiento de aire).',
      '4. Gradúa la gravedad por el FEV1 % del predicho.',
      '5. Mira la respuesta al broncodilatador.',
    ],
    warning: 'La espirometría solo sugiere restricción: para confirmarla hace falta medir la capacidad pulmonar total (TLC < 80 % del predicho) por pletismografía.',
  },
  {
    heading: 'Patrones',
    table: {
      head: ['Patrón', 'FEV1/FVC', 'FVC', 'FEV1', 'Ejemplos'],
      rows: [
        ['Obstructivo', 'Bajo (< 0,70)', 'Normal o baja', 'Bajo', 'Asma, EPOC, bronquiectasias'],
        ['Restrictivo', 'Normal o alto', 'Baja', 'Bajo (proporcional)', 'Fibrosis, neuromusculares, obesidad, cifoescoliosis'],
        ['Mixto', 'Bajo', 'Baja', 'Bajo', 'EPOC con fibrosis, sarcoidosis, fibrosis quística'],
      ],
    },
  },
  {
    heading: 'Gravedad de la obstrucción (GOLD)',
    table: {
      head: ['Grado', 'FEV1 % del predicho'],
      rows: [
        ['GOLD 1 · leve', '≥ 80 %'],
        ['GOLD 2 · moderada', '50–79 %'],
        ['GOLD 3 · grave', '30–49 %'],
        ['GOLD 4 · muy grave', '< 30 %'],
      ],
    },
    pearl: 'Para diagnosticar EPOC se necesita un FEV1/FVC < 0,70 después del broncodilatador, en una persona con síntomas o exposición (tabaco, humo de leña).',
  },
  {
    heading: 'Prueba con broncodilatador',
    bullets: [
      'Se repite la espirometría 10–15 minutos después de 400 µg de salbutamol.',
      'Respuesta positiva (criterio clásico ATS/ERS 2005): aumento del FEV1 o de la FVC de ≥ 12 % y ≥ 200 mL respecto al basal. La ATS/ERS 2022 usa un cambio > 10 % del valor predicho.',
      'Asma: obstrucción reversible (a menudo se normaliza). EPOC: la obstrucción persiste, aunque puede haber algo de respuesta.',
      'Una espirometría normal no descarta asma: si la sospecha es alta, se hace una prueba de provocación con metacolina.',
    ],
  },
  {
    heading: 'Más allá de la espirometría',
    table: {
      head: ['Prueba', 'Útil para'],
      rows: [
        ['Volúmenes pulmonares (pletismografía)', 'Confirmar restricción (TLC baja) y ver atrapamiento de aire (volumen residual alto)'],
        ['DLCO (difusión de CO)', 'Baja en enfisema, fibrosis, hipertensión pulmonar y anemia; normal en asma y bronquitis crónica; alta en hemorragia alveolar y policitemia'],
        ['Metacolina', 'Hiperreactividad bronquial cuando la espirometría es normal'],
      ],
    },
    pearl: 'Obstrucción con DLCO baja apunta a enfisema; obstrucción con DLCO normal, a asma o bronquitis crónica.',
  },
  {
    heading: 'Contraindicaciones',
    bullets: [
      'Infarto o síndrome coronario agudo en la última semana, hipertensión no controlada o arritmia inestable.',
      'Neumotórax reciente, hemoptisis activa, aneurisma aórtico grande.',
      'Cirugía reciente de ojo, tórax, abdomen o cerebro; infección respiratoria transmisible activa.',
    ],
  },
]

export const SPIRO_REFERENCES = [
  'Stanojevic S, et al. ERS/ATS technical standard on interpretive strategies for routine lung function tests. Eur Respir J. 2022;60:2101499.',
  'Graham BL, et al. Standardization of Spirometry 2019 Update. An Official ATS/ERS Technical Statement. Am J Respir Crit Care Med. 2019;200:e70–e88.',
  'Pellegrino R, et al. Interpretative strategies for lung function tests (ATS/ERS 2005). Eur Respir J. 2005;26:948–968.',
  'Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global Strategy for Prevention, Diagnosis and Management of COPD: 2025 Report.',
  'Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention, 2024.',
]

export const SPIRO_QUIZ: QuizItem[] = [
  { q: 'FEV1/FVC 0,58, FEV1 62 % y FVC 90 % del predicho. ¿Qué patrón es?', options: ['Normal', 'Obstructivo', 'Restrictivo', 'Mixto'], answer: 1, why: 'Cociente < 0,70 con FVC normal: obstrucción. Con FEV1 de 62 % sería GOLD 2 (moderada).' },
  { q: 'FEV1/FVC 0,86, FVC 61 % del predicho. ¿Qué sugiere?', options: ['Obstrucción', 'Restricción', 'Espirometría normal', 'Obstrucción de vía aérea alta'], answer: 1, why: 'Cociente normal o alto con FVC baja sugiere restricción; se confirma con la capacidad pulmonar total.' },
  { q: 'Tras salbutamol el FEV1 pasa de 1,8 a 2,2 L. ¿Cómo es la respuesta?', options: ['Positiva', 'Negativa', 'No se puede saber', 'Indica restricción'], answer: 0, why: '+400 mL y +22 %: supera ambos umbrales (≥ 200 mL y ≥ 12 %). Sugiere asma.' },
  { q: '¿Qué se necesita para diagnosticar EPOC?', options: ['FEV1 < 80 %', 'FEV1/FVC < 0,70 posbroncodilatador', 'DLCO baja', 'Radiografía con hiperinsuflación'], answer: 1, why: 'GOLD: obstrucción persistente (FEV1/FVC < 0,70 tras broncodilatador) en una persona con síntomas o exposición de riesgo.' },
  { q: 'EPOC con FEV1 del 35 % del predicho. ¿Qué grado GOLD es?', options: ['GOLD 1', 'GOLD 2', 'GOLD 3', 'GOLD 4'], answer: 2, why: 'GOLD 3 (grave): FEV1 30–49 %.' },
  { q: 'Curva flujo-volumen con ambas ramas aplanadas en meseta, en un paciente con traqueostomía previa:', options: ['Asma', 'Obstrucción fija de la vía aérea alta', 'Fibrosis', 'Parálisis de cuerdas vocales'], answer: 1, why: 'La estenosis traqueal fija limita el flujo igual al inspirar y al espirar: meseta en ambas ramas.' },
  { q: 'Solo la rama inspiratoria está aplanada. ¿Dónde está la obstrucción?', options: ['Intratorácica variable', 'Extratorácica variable', 'Vía aérea pequeña', 'No hay obstrucción'], answer: 1, why: 'Al inspirar, la vía aérea extratorácica se colapsa por la presión negativa: parálisis de cuerdas vocales, tumores laríngeos.' },
  { q: 'Obstrucción con DLCO baja. ¿Qué es lo más probable?', options: ['Asma', 'Enfisema', 'Bronquitis crónica', 'Obesidad'], answer: 1, why: 'El enfisema destruye la membrana alveolocapilar y baja la DLCO; en asma y bronquitis crónica suele ser normal.' },
  { q: 'Paciente con sospecha de asma y espirometría normal. ¿Qué estudio pides?', options: ['Ninguno, se descarta asma', 'Prueba de metacolina', 'TC de tórax', 'Gasometría'], answer: 1, why: 'La espirometría puede ser normal entre crisis; la provocación con metacolina demuestra la hiperreactividad.' },
  { q: '¿Qué criterio de calidad es correcto?', options: ['Una sola maniobra basta', 'Espiración de al menos 6 s o meseta, y 3 maniobras aceptables', 'Se acepta si el paciente tose', 'Diferencia de 500 mL entre maniobras'], answer: 1, why: 'Se necesitan 3 maniobras aceptables y repetibles (FVC y FEV1 a menos de 150 mL) con espiración de ≥ 6 s o meseta.' },
  { q: 'Mujer con obesidad mórbida: FEV1/FVC 0,84 y FVC 72 %. ¿Patrón?', options: ['Obstructivo', 'Restrictivo (extraparenquimatoso)', 'Mixto', 'Normal'], answer: 1, why: 'La obesidad limita la expansión de la pared torácica: restricción con cociente normal y DLCO normal.' },
]
