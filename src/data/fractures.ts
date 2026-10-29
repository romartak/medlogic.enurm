import type { GuideSection, QuizItem } from '@/types'
import type { FractureLine, SalterType } from '@/components/FractureArt'

/** Tipos de trauma y fracturas. Resumen educativo propio; verifica el manejo con las guías de ortopedia vigentes. */

export const FRACTURE_LINES: { id: FractureLine; name: string; how: string; clue: string }[] = [
  { id: 'transversa', name: 'Transversa', how: 'Trazo perpendicular al eje del hueso.', clue: 'Golpe directo o flexión pura. Suele ser estable una vez reducida.' },
  { id: 'oblicua', name: 'Oblicua', how: 'Trazo en diagonal al eje.', clue: 'Fuerza angular con compresión. Tiende a acortarse y deslizarse.' },
  { id: 'espiral', name: 'Espiral', how: 'El trazo rodea el hueso como un tirabuzón.', clue: 'Mecanismo de torsión (pie fijo y cuerpo que gira). En un niño que aún no camina, piensa en maltrato.' },
  { id: 'conminuta', name: 'Conminuta', how: 'Tres o más fragmentos.', clue: 'Alta energía (accidentes de tránsito, armas de fuego) o hueso osteoporótico.' },
  { id: 'segmentaria', name: 'Segmentaria', how: 'Dos trazos que dejan un segmento libre de diáfisis.', clue: 'Alta energía; el segmento intermedio puede quedar sin irrigación.' },
  { id: 'tallo-verde', name: 'En tallo verde', how: 'Se rompe una cortical y la del otro lado solo se dobla.', clue: 'Exclusiva de niños: su hueso es más elástico y el periostio más grueso.' },
  { id: 'rodete', name: 'En rodete (torus)', how: 'La cortical se abomba por compresión, sin trazo completo.', clue: 'Niños, en la metáfisis del radio distal tras caer sobre la mano. Muy estable.' },
  { id: 'avulsion', name: 'Por avulsión', how: 'Un tendón o ligamento arranca un fragmento de hueso.', clue: 'Ejemplos: base del 5.º metatarsiano (peroneo corto) y espinas ilíacas en adolescentes deportistas.' },
  { id: 'impactada', name: 'Impactada', how: 'Un fragmento se incrusta en el otro.', clue: 'Compresión axial; típica del cuello del húmero y del cuello femoral en ancianos.' },
  { id: 'patologica', name: 'Patológica', how: 'Se rompe un hueso ya debilitado, con un trauma mínimo.', clue: 'Metástasis (mama, próstata, pulmón, riñón, tiroides), mieloma, quistes óseos, osteoporosis.' },
  { id: 'estres', name: 'Por estrés (fatiga)', how: 'Fisura fina por cargas repetidas, con reacción del periostio.', clue: 'Corredores y reclutas: 2.º metatarsiano («fractura del soldado»), tibia. La radiografía inicial suele ser normal.' },
]

export const SALTER_HARRIS: { type: SalterType; roman: string; name: string; what: string; prognosis: string }[] = [
  { type: 1, roman: 'I', name: 'A través de la fisis', what: 'El trazo recorre solo el cartílago de crecimiento. La radiografía puede verse normal.', prognosis: 'Bueno' },
  { type: 2, roman: 'II', name: 'Fisis y metáfisis', what: 'El trazo sigue la fisis y sale por la metáfisis, que se lleva un fragmento (de Thurston-Holland). Es la más frecuente.', prognosis: 'Bueno' },
  { type: 3, roman: 'III', name: 'Fisis y epífisis', what: 'Sigue la fisis y cruza la epífisis hasta la articulación: es intraarticular.', prognosis: 'Reservado: suele requerir reducción anatómica' },
  { type: 4, roman: 'IV', name: 'Metáfisis, fisis y epífisis', what: 'Un trazo cruza las tres zonas y entra en la articulación.', prognosis: 'Reservado: riesgo de detener el crecimiento' },
  { type: 5, roman: 'V', name: 'Compresión de la fisis', what: 'Aplastamiento del cartílago de crecimiento por carga axial; la radiografía inicial suele ser normal.', prognosis: 'El peor: deja dismetrías o deformidades' },
]

export const FRACTURE_SECTIONS: GuideSection[] = [
  {
    heading: 'Mecanismos de trauma',
    table: {
      head: ['Mecanismo', 'Qué esperar'],
      rows: [
        ['Cerrado (contuso)', 'Accidentes de tránsito, caídas, golpes. Lesiones por compresión, desaceleración y cizallamiento: bazo, hígado, aorta, pelvis.'],
        ['Penetrante por arma blanca', 'Baja energía: el daño se limita al trayecto. El hígado es el órgano abdominal más afectado.'],
        ['Penetrante por arma de fuego', 'Alta energía con cavitación: daña tejidos lejos del trayecto. El intestino delgado es el más afectado.'],
        ['Explosión', 'Primaria (onda expansiva: oído, pulmón, intestino), secundaria (proyectiles), terciaria (el cuerpo sale despedido) y cuaternaria (quemaduras, tóxicos, aplastamiento).'],
        ['Desaceleración brusca', 'Choques frontales y caídas de altura: rotura de la aorta torácica, lesiones de pedículos (riñón, bazo).'],
        ['Aplastamiento', 'Rabdomiólisis, hiperpotasemia, insuficiencia renal y síndrome compartimental.'],
      ],
    },
    bullets: [
      'Mecanismos de alta energía: eyección del vehículo, muerte de otro ocupante, vuelco, caída de más de 6 m en adultos, atropello a gran velocidad, motociclista despedido.',
      'Niño atropellado (tríada de Waddell): fractura de fémur, lesión de tórax o abdomen y TCE del lado contrario.',
      'Caída de altura sobre los pies: fractura de calcáneo con fractura por compresión lumbar asociada; búscala siempre.',
    ],
  },
  {
    heading: 'Cómo describir una fractura',
    bullets: [
      'Hueso y lado, y zona: epífisis, metáfisis, diáfisis (tercio proximal, medio o distal).',
      '¿Abierta (expuesta) o cerrada? Cualquier herida cerca de una fractura se considera comunicada hasta demostrar lo contrario.',
      'Trazo: transversa, oblicua, espiral, conminuta, etc.',
      'Desplazamiento del fragmento distal respecto al proximal: traslación, angulación, acortamiento y rotación.',
      '¿Entra en la articulación (intraarticular)? ¿Afecta la fisis en un niño?',
      'Estado neurovascular distal, antes y después de cualquier maniobra.',
    ],
    pearl: 'Regla de los dos: dos proyecciones radiográficas, que incluyan las dos articulaciones vecinas, y en niños a veces el lado sano para comparar.',
  },
  {
    heading: 'Fracturas expuestas (Gustilo-Anderson)',
    table: {
      head: ['Tipo', 'Herida y tejidos blandos'],
      rows: [
        ['I', 'Herida < 1 cm, limpia, poca lesión de tejidos blandos'],
        ['II', 'Herida de 1–10 cm, sin daño extenso de tejidos blandos'],
        ['IIIA', 'Herida > 10 cm o alta energía, pero el hueso puede cubrirse con tejido'],
        ['IIIB', 'Pérdida de tejido con hueso expuesto: necesita colgajo'],
        ['IIIC', 'Lesión arterial que requiere reparación'],
      ],
    },
    bullets: [
      'Antibiótico IV lo antes posible (idealmente en la primera hora): cefazolina; en las de tipo III se añade cobertura para gramnegativos.',
      'Profilaxis antitetánica, foto de la herida, apósito estéril e inmovilización.',
      'Lavado y desbridamiento quirúrgico, y estabilización (a menudo fijación externa al inicio).',
    ],
    warning: 'Las heridas por arma de fuego de alta velocidad, en granjas o muy contaminadas se clasifican como tipo III aunque la herida sea pequeña.',
  },
  {
    heading: 'Fracturas con nombre propio',
    table: {
      head: ['Fractura', 'Qué es', 'Lo que preguntan'],
      rows: [
        ['Colles', 'Radio distal, extraarticular, con desplazamiento dorsal', 'Caída sobre la mano extendida; deformidad «en dorso de tenedor»; mujeres con osteoporosis'],
        ['Smith', 'Radio distal con desplazamiento volar', '«Colles invertida»: caída sobre la muñeca en flexión'],
        ['Barton', 'Fractura-luxación del borde dorsal o volar del radio distal', 'Es intraarticular e inestable'],
        ['Escafoides', 'Hueso del carpo más fracturado', 'Dolor en la tabaquera anatómica. Si la radiografía es normal, se inmoviliza y se repite o se pide RM: riesgo de necrosis avascular del polo proximal'],
        ['Del boxeador', 'Cuello del 5.º metacarpiano', 'Golpe con el puño cerrado'],
        ['Bennett', 'Base del 1.er metacarpiano, intraarticular, con subluxación', 'Inestable; la conminuta de la base es la de Rolando'],
        ['Monteggia', 'Diáfisis del cúbito + luxación de la cabeza del radio', 'Regla: Monteggia = cúbito roto; Galeazzi = radio roto'],
        ['Galeazzi', 'Diáfisis distal del radio + luxación radiocubital distal', 'Requiere cirugía en el adulto'],
        ['Diáfisis del húmero', 'Tercio medio-distal', 'Nervio radial: mano caída (no puede extender la muñeca)'],
        ['Cuello quirúrgico del húmero', 'Bajo la cabeza humeral', 'Nervio axilar: deltoides débil y anestesia en la cara lateral del hombro'],
        ['Supracondílea del húmero', 'La fractura de codo más común en niños', 'Arteria braquial y nervio mediano (interóseo anterior); riesgo de contractura isquémica de Volkmann'],
        ['Cuello femoral', 'Fractura de cadera intracapsular', 'Anciana con pierna acortada y en rotación externa; riesgo de necrosis avascular de la cabeza (arterias circunflejas)'],
        ['Jones', 'Base del 5.º metatarsiano, en la unión metáfisis-diáfisis', 'Zona de poca irrigación: riesgo de no consolidar. Distinta de la avulsión de la estiloides (peroneo corto)'],
        ['Maisonneuve', 'Tercio proximal del peroné + lesión del tobillo (sindesmosis y lado medial)', 'Ante un esguince «grave» de tobillo, palpa todo el peroné'],
        ['Chance', 'Flexión-distracción de una vértebra lumbar', 'Cinturón de seguridad abdominal; asociada a lesión de víscera hueca'],
        ['Jefferson', 'Estallido del atlas (C1)', 'Carga axial: clavado en aguas poco profundas'],
        ['Del ahorcado', 'Pedículos del axis (C2)', 'Hiperextensión'],
        ['Le Fort', 'Fracturas del maxilar: I horizontal, II piramidal, III disyunción craneofacial', 'Comprometen la vía aérea; en la III puede haber fístula de LCR'],
        ['Por estallido de la órbita', 'Piso de la órbita', 'Atrapamiento del recto inferior (diplopía al mirar arriba) y anestesia infraorbitaria'],
      ],
    },
  },
  {
    heading: 'Complicaciones',
    table: {
      head: ['Momento', 'Complicación', 'Claves'],
      rows: [
        ['Inmediatas', 'Shock hemorrágico', 'Pelvis y fémur pueden sangrar más de 1–2 L'],
        ['Inmediatas', 'Lesión vascular o nerviosa', 'Explora pulsos, llenado y sensibilidad antes y después de reducir'],
        ['Tempranas', 'Síndrome compartimental', 'Dolor desproporcionado y al estiramiento pasivo; fasciotomía'],
        ['Tempranas', 'Embolia grasa', '24–72 h tras fractura de huesos largos o pelvis: hipoxemia, confusión y petequias en axilas y conjuntivas'],
        ['Tempranas', 'Trombosis venosa y embolia pulmonar', 'Profilaxis en fracturas de cadera y pelvis'],
        ['Tardías', 'Necrosis avascular', 'Cuello femoral, escafoides y cuello del astrágalo'],
        ['Tardías', 'Pseudoartrosis y consolidación viciosa', 'La primera es la falta de unión; la segunda, unión en mala posición'],
        ['Tardías', 'Síndrome de dolor regional complejo (Sudeck)', 'Dolor quemante, cambios de color, sudor y osteoporosis local'],
      ],
    },
  },
]

export const FRACTURE_REFERENCES = [
  'Gustilo RB, Anderson JT. Prevention of infection in the treatment of one thousand and twenty-five open fractures of long bones. J Bone Joint Surg Am. 1976;58:453–458. Gustilo RB, et al. J Trauma. 1984;24:742–746.',
  'Salter RB, Harris WR. Injuries involving the epiphyseal plate. J Bone Joint Surg Am. 1963;45:587–622.',
  'Rockwood and Green\'s Fractures in Adults, 10.ª ed. Wolters Kluwer; 2024.',
  'American College of Surgeons. Advanced Trauma Life Support (ATLS), 10.ª ed. 2018: trauma musculoesquelético.',
]

export const FRACTURE_QUIZ: QuizItem[] = [
  { q: 'Anciana que cae sobre la mano extendida; la muñeca queda «en dorso de tenedor». ¿Qué fractura es?', options: ['Smith', 'Colles', 'Barton', 'Escafoides'], answer: 1, why: 'Colles: radio distal con desplazamiento dorsal. La de Smith es la contraria (desplazamiento volar).' },
  { q: 'Dolor en la tabaquera anatómica con radiografía normal. ¿Qué haces?', options: ['Alta sin inmovilizar', 'Inmovilizar y repetir la radiografía o pedir RM', 'Infiltrar corticoide', 'Cirugía inmediata'], answer: 1, why: 'Sospecha de fractura de escafoides: hasta el 20 % no se ve al inicio, y sin tratar puede acabar en necrosis avascular.' },
  { q: 'Fractura de la diáfisis del húmero con imposibilidad de extender la muñeca. ¿Qué nervio se lesionó?', options: ['Mediano', 'Cubital', 'Radial', 'Axilar'], answer: 2, why: 'El nervio radial corre por el canal de torsión del húmero: su lesión da mano caída.' },
  { q: 'Fractura de la diáfisis del cúbito con luxación de la cabeza del radio:', options: ['Galeazzi', 'Monteggia', 'Colles', 'Bennett'], answer: 1, why: 'Monteggia = cúbito fracturado + cabeza radial luxada. Galeazzi = radio fracturado + luxación radiocubital distal.' },
  { q: '¿Cuál es la clasificación de Salter-Harris más frecuente?', options: ['Tipo I', 'Tipo II', 'Tipo III', 'Tipo V'], answer: 1, why: 'El tipo II (fisis y metáfisis) representa cerca de tres cuartas partes de las lesiones fisarias.' },
  { q: '¿Qué tipo de Salter-Harris tiene el peor pronóstico?', options: ['Tipo I', 'Tipo II', 'Tipo IV', 'Tipo V'], answer: 3, why: 'El tipo V es un aplastamiento de la fisis: a menudo no se ve en la radiografía inicial y detiene el crecimiento.' },
  { q: 'Fractura expuesta de tibia con herida de 3 cm y sin gran daño de tejidos blandos. Gustilo:', options: ['I', 'II', 'IIIA', 'IIIC'], answer: 1, why: 'Tipo II: herida de 1 a 10 cm sin daño extenso de tejidos blandos.' },
  { q: '¿Qué es lo primero en una fractura expuesta, además de inmovilizar?', options: ['Cierre primario de la herida en urgencias', 'Antibiótico IV temprano y profilaxis antitetánica', 'Esperar el cultivo', 'Yeso cerrado'], answer: 1, why: 'El antibiótico precoz (cefazolina ± cobertura para gramnegativos) es lo que más reduce la infección, junto al desbridamiento.' },
  { q: 'Anciana con dolor de cadera tras caída, pierna acortada y en rotación externa. ¿Qué complicación preocupa en la fractura del cuello femoral?', options: ['Síndrome compartimental', 'Necrosis avascular de la cabeza femoral', 'Lesión del nervio radial', 'Embolia gaseosa'], answer: 1, why: 'Al ser intracapsular, la fractura interrumpe las arterias circunflejas que irrigan la cabeza femoral.' },
  { q: 'Fiebre baja, hipoxemia, confusión y petequias en axilas 48 h después de una fractura de fémur:', options: ['Neumonía', 'Embolia grasa', 'Sepsis por la herida', 'Reacción transfusional'], answer: 1, why: 'Síndrome de embolia grasa: 24–72 h tras fracturas de huesos largos o pelvis.' },
  { q: 'Niño de 7 años con una fractura en la que una cortical se rompe y la otra solo se dobla:', options: ['Rodete', 'Tallo verde', 'Avulsión', 'Conminuta'], answer: 1, why: 'Tallo verde: por la elasticidad del hueso infantil. En la de rodete la cortical solo se abomba por compresión.' },
  { q: 'Fractura en espiral del fémur en un lactante que aún no camina. ¿Qué debes sospechar?', options: ['Osteogénesis imperfecta siempre', 'Maltrato infantil', 'Raquitismo', 'Fractura por estrés'], answer: 1, why: 'La espiral necesita torsión; en un niño que no camina obliga a descartar maltrato (sin olvidar enfermedades óseas).' },
  { q: 'Motociclista con fractura conminuta de pelvis: ¿cuál es el riesgo inmediato principal?', options: ['Pseudoartrosis', 'Shock hemorrágico', 'Necrosis avascular', 'Síndrome de Sudeck'], answer: 1, why: 'La pelvis puede sangrar varios litros (plexo venoso presacro, arterias ilíacas). Faja pélvica y control del sangrado.' },
  { q: 'Caída de 5 m sobre los talones con fractura de calcáneo. ¿Qué otra fractura buscas?', options: ['Clavícula', 'Lumbar por compresión', 'Escafoides', 'Radio distal'], answer: 1, why: 'La carga axial se transmite a la columna: las fracturas de calcáneo se asocian a fracturas por compresión lumbares.' },
]
