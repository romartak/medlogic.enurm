/**
 * Contenido de «Terminología»: aprender el vocabulario médico por partes, al estilo Duolingo.
 * Cada término compuesto lleva sus partes (raíz, prefijo, sufijo) para poder construirlo pieza a pieza;
 * al unir el texto de las partes se obtiene exactamente el término.
 */
export type LingoKind = 'prefijo' | 'sufijo' | 'raíz' | 'término' | 'sigla'

export interface LingoPart {
  text: string
  meaning: string
}

export interface LingoItem {
  id: string
  kind: LingoKind
  /** Forma que se muestra: «hiper-», «-itis», «hepatomegalia». */
  term: string
  meaning: string
  /** Para prefijos, sufijos y raíces: una palabra que lo usa. */
  example?: string
  /** Para términos compuestos: sus partes en orden. */
  parts?: LingoPart[]
  /** Id del término con el significado contrario (hiper ↔ hipo, proximal ↔ distal). */
  opposite?: string
  /** Frase clínica con «___» donde va el término, para practicarlo en contexto. */
  context?: string
}

export interface LingoLesson {
  id: string
  title: string
  items: string[]
}

export interface LingoUnit {
  id: string
  title: string
  description: string
  color: string
  icon: string
  lessons: LingoLesson[]
}

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const ITEMS: LingoItem[] = []

/** Prefijo, sufijo o raíz. */
function m(kind: Exclude<LingoKind, 'término' | 'sigla'>, term: string, meaning: string, example: string): string {
  const id = `${kind === 'raíz' ? 'raiz' : kind}-${slug(term)}`
  ITEMS.push({ id, kind, term, meaning, example })
  return id
}

/** Término; `parts` en pares [texto, significado] que concatenados forman el término. */
function t(term: string, meaning: string, parts?: [string, string][]): string {
  const id = `t-${slug(term)}`
  ITEMS.push({ id, kind: 'término', term, meaning, parts: parts?.map(([text, meaning]) => ({ text, meaning })) })
  return id
}

/** Sigla o abreviatura de la historia clínica. */
function G(term: string, meaning: string): string {
  const id = `sigla-${slug(term)}`
  ITEMS.push({ id, kind: 'sigla', term, meaning })
  return id
}

const P = (term: string, meaning: string, example: string) => m('prefijo', term, meaning, example)
const S = (term: string, meaning: string, example: string) => m('sufijo', term, meaning, example)
const R = (term: string, meaning: string, example: string) => m('raíz', term, meaning, example)

export const LINGO_UNITS: LingoUnit[] = [
  {
    id: 'prefijos',
    title: 'Prefijos esenciales',
    description: 'Lo que va al principio y cambia todo el sentido de la palabra.',
    color: '#16a34a',
    icon: 'arrow-left-to-line',
    lessons: [
      {
        id: 'prefijos-cantidad',
        title: 'Cantidad',
        items: [
          P('a-, an-', 'sin, ausencia de', 'anemia, afasia'),
          P('poli-', 'mucho, muchos', 'poliuria'),
          P('oligo-', 'poco, escaso', 'oliguria'),
          P('hemi-', 'mitad', 'hemiplejía'),
          P('pan-', 'todo', 'pancitopenia'),
          P('mono-', 'uno, único', 'mononeuropatía'),
        ],
      },
      {
        id: 'prefijos-mas-menos',
        title: 'Más y menos',
        items: [
          P('hiper-', 'exceso, por encima de lo normal', 'hipertensión'),
          P('hipo-', 'deficiencia, por debajo de lo normal', 'hipoglucemia'),
          P('macro-', 'grande', 'macrocitosis'),
          P('micro-', 'pequeño', 'microcefalia'),
          P('normo-', 'normal', 'normocítico'),
          P('eu-', 'bueno, normal', 'eutiroideo'),
        ],
      },
      {
        id: 'prefijos-ritmo',
        title: 'Ritmo y estado',
        items: [
          P('taqui-', 'rápido', 'taquicardia'),
          P('bradi-', 'lento', 'bradicardia'),
          P('dis-', 'dificultad, alteración', 'disnea'),
          P('neo-', 'nuevo', 'neoplasia'),
          P('orto-', 'recto, correcto', 'ortopnea'),
          P('pseudo-', 'falso', 'pseudoquiste'),
        ],
      },
      {
        id: 'prefijos-posicion',
        title: 'Posición',
        items: [
          P('peri-', 'alrededor de', 'pericarditis'),
          P('endo-', 'dentro', 'endoscopia'),
          P('epi-', 'sobre, encima de', 'epigastrio'),
          P('sub-', 'debajo de', 'subcutáneo'),
          P('intra-', 'en el interior de', 'intramuscular'),
          P('trans-', 'a través de', 'transfusión'),
          P('para-', 'junto a, al lado de', 'paracentesis'),
        ],
      },
      {
        id: 'prefijos-tiempo',
        title: 'Antes, después y de nuevo',
        items: [
          P('pre-', 'antes de', 'prenatal'),
          P('post-, pos-', 'después de', 'posparto'),
          P('ante-', 'delante de, antes', 'anteflexión'),
          P('re-', 'de nuevo, otra vez', 'reinfección'),
          P('retro-', 'detrás, hacia atrás', 'retroperitoneal'),
          P('pro-', 'hacia adelante, a favor de', 'prolapso'),
        ],
      },
      {
        id: 'prefijos-dentro-fuera',
        title: 'Dentro, fuera y entre',
        items: [
          P('exo-, ecto-', 'fuera, externo', 'exoftalmos'),
          P('extra-', 'fuera de, además de', 'extrasístole'),
          P('inter-', 'entre', 'intercostal'),
          P('supra-', 'por encima de', 'supraclavicular'),
          P('infra-', 'por debajo de', 'infraumbilical'),
          P('contra-', 'opuesto', 'contralateral'),
          P('ipsi-', 'el mismo (lado)', 'ipsilateral'),
        ],
      },
      {
        id: 'prefijos-numeros',
        title: 'Números',
        items: [
          P('bi-, di-', 'dos, doble', 'bilateral, diplopía'),
          P('tri-', 'tres', 'tricúspide'),
          P('cuadri-, tetra-', 'cuatro', 'cuadriplejía'),
          P('semi-', 'medio, a medias', 'semiconsciente'),
          P('multi-', 'varios, numerosos', 'multípara'),
          P('primi-', 'primero', 'primigesta'),
          P('nuli-', 'ninguno', 'nulípara'),
        ],
      },
      {
        id: 'prefijos-relacion',
        title: 'Igual, distinto y contra',
        items: [
          P('homo-, iso-', 'igual', 'homocigoto, isotónico'),
          P('hetero-', 'distinto', 'heterocigoto'),
          P('anti-', 'en contra de', 'antibiótico'),
          P('sin-, sim-', 'con, unión', 'sindactilia'),
          P('auto-', 'propio, de uno mismo', 'autoinmune'),
          P('meta-', 'más allá, cambio', 'metástasis'),
          P('ana-', 'hacia arriba, de nuevo', 'anafilaxia'),
        ],
      },
    ],
  },
  {
    id: 'sufijos',
    title: 'Sufijos clave',
    description: 'El final de la palabra te dice qué le pasa al órgano.',
    color: '#0284c7',
    icon: 'arrow-right-to-line',
    lessons: [
      {
        id: 'sufijos-enfermedad',
        title: 'Enfermedad',
        items: [
          S('-itis', 'inflamación', 'hepatitis'),
          S('-osis', 'proceso o estado anormal', 'cianosis'),
          S('-patía', 'enfermedad', 'nefropatía'),
          S('-oma', 'tumor', 'mioma'),
          S('-megalia', 'agrandamiento', 'hepatomegalia'),
          S('-penia', 'disminución, déficit', 'leucopenia'),
        ],
      },
      {
        id: 'sufijos-sintomas',
        title: 'Síntomas',
        items: [
          S('-algia', 'dolor', 'artralgia'),
          S('-emia', 'en la sangre', 'hiperglucemia'),
          S('-uria', 'en la orina', 'hematuria'),
          S('-rragia', 'sangrado abundante', 'menorragia'),
          S('-rrea', 'flujo, secreción', 'diarrea'),
          S('-plejía', 'parálisis', 'hemiplejía'),
        ],
      },
      {
        id: 'sufijos-procedimientos',
        title: 'Procedimientos',
        items: [
          S('-ectomía', 'extirpación quirúrgica', 'apendicectomía'),
          S('-tomía', 'incisión, corte', 'laparotomía'),
          S('-ostomía', 'abertura artificial al exterior', 'colostomía'),
          S('-scopia', 'examen visual con un instrumento', 'endoscopia'),
          S('-grafía', 'registro o imagen', 'angiografía'),
          S('-centesis', 'punción para extraer líquido', 'paracentesis'),
          S('-plastia', 'reparación quirúrgica', 'rinoplastia'),
        ],
      },
      {
        id: 'sufijos-funciones',
        title: 'Funciones del cuerpo',
        items: [
          S('-pnea', 'respiración', 'taquipnea'),
          S('-fagia', 'comer, tragar', 'disfagia'),
          S('-estesia', 'sensibilidad', 'anestesia'),
          S('-cinesia', 'movimiento', 'bradicinesia'),
          S('-emesis', 'vómito', 'hematemesis'),
          S('-fasia', 'habla, lenguaje', 'afasia'),
          S('-opía', 'visión', 'diplopía'),
        ],
      },
      {
        id: 'sufijos-cambios',
        title: 'Cambios del tejido',
        items: [
          S('-lisis', 'destrucción, disolución', 'hemólisis'),
          S('-stasis', 'detención, equilibrio', 'homeostasis'),
          S('-ptosis', 'caída, descenso', 'blefaroptosis'),
          S('-malacia', 'reblandecimiento', 'osteomalacia'),
          S('-esclerosis', 'endurecimiento', 'aterosclerosis'),
          S('-trofia', 'nutrición, desarrollo', 'atrofia'),
          S('-plasia', 'formación de tejido', 'displasia'),
        ],
      },
      {
        id: 'sufijos-mas',
        title: 'Más sufijos clínicos',
        items: [
          S('-cele', 'hernia, protrusión', 'hidrocele'),
          S('-lito', 'piedra, cálculo', 'nefrolito'),
          S('-iasis', 'presencia o formación de', 'colelitiasis'),
          S('-poyesis', 'producción', 'hematopoyesis'),
          S('-filia', 'afinidad, aumento', 'eosinofilia'),
          S('-ismo', 'estado, condición', 'hipotiroidismo'),
          S('-oide', 'parecido a', 'adenoide'),
        ],
      },
      {
        id: 'sufijos-procedimientos-2',
        title: 'Suturar, fijar y medir',
        items: [
          S('-rrafia', 'sutura', 'herniorrafia'),
          S('-pexia', 'fijación quirúrgica', 'orquidopexia'),
          S('-tripsia', 'triturar, fragmentar', 'litotripsia'),
          S('-scopio', 'instrumento para observar', 'otoscopio'),
          S('-grama', 'trazado, resultado de un registro', 'electrocardiograma'),
          S('-metría', 'medición', 'espirometría'),
          S('-logía', 'estudio, ciencia', 'cardiología'),
        ],
      },
    ],
  },
  {
    id: 'raices',
    title: 'Raíces del cuerpo',
    description: 'Los órganos tienen nombre griego o latino: apréndelos una vez y entiende cientos de palabras.',
    color: '#dc2626',
    icon: 'heart-pulse',
    lessons: [
      {
        id: 'raices-vitales',
        title: 'Órganos vitales',
        items: [
          R('cardio-', 'corazón', 'cardiología'),
          R('neumo-, pulmo-', 'pulmón', 'neumonía'),
          R('hepato-', 'hígado', 'hepatitis'),
          R('nefro-, reno-', 'riñón', 'nefrología'),
          R('encefalo-', 'encéfalo', 'encefalitis'),
          R('gastro-', 'estómago', 'gastritis'),
        ],
      },
      {
        id: 'raices-digestivo',
        title: 'Aparato digestivo',
        items: [
          R('entero-', 'intestino (delgado)', 'enteritis'),
          R('colo-', 'colon', 'colonoscopia'),
          R('colecisto-', 'vesícula biliar', 'colecistitis'),
          R('espleno-', 'bazo', 'esplenomegalia'),
          R('pancreato-', 'páncreas', 'pancreatitis'),
          R('procto-', 'recto y ano', 'proctología'),
        ],
      },
      {
        id: 'raices-sosten',
        title: 'Sostén y piel',
        items: [
          R('osteo-', 'hueso', 'osteoporosis'),
          R('artro-', 'articulación', 'artritis'),
          R('mio-', 'músculo', 'mialgia'),
          R('dermato-', 'piel', 'dermatitis'),
          R('condro-', 'cartílago', 'condromalacia'),
          R('mielo-', 'médula (ósea o espinal)', 'mielograma'),
        ],
      },
      {
        id: 'raices-cabeza',
        title: 'Cabeza y sentidos',
        items: [
          R('cefalo-', 'cabeza', 'cefalea'),
          R('oftalmo-', 'ojo', 'oftalmología'),
          R('oto-', 'oído', 'otitis'),
          R('rino-', 'nariz', 'rinitis'),
          R('laringo-', 'laringe', 'laringitis'),
          R('odonto-', 'diente', 'odontología'),
        ],
      },
      {
        id: 'raices-sangre',
        title: 'Sangre y vasos',
        items: [
          R('hemato-, hemo-', 'sangre', 'hematuria'),
          R('angio-', 'vaso sanguíneo', 'angiografía'),
          R('flebo-', 'vena', 'flebitis'),
          R('leuco-', 'blanco', 'leucocito'),
          R('eritro-', 'rojo', 'eritrocito'),
          R('trombo-', 'coágulo', 'trombosis'),
          R('cito-', 'célula', 'citología'),
        ],
      },
      {
        id: 'raices-respiratorio',
        title: 'Vías respiratorias',
        items: [
          R('bronco-', 'bronquio', 'bronquitis'),
          R('traqueo-', 'tráquea', 'traqueostomía'),
          R('pleuro-', 'pleura', 'pleuritis'),
          R('toraco-', 'tórax', 'toracotomía'),
          R('faringo-', 'faringe', 'faringitis'),
          R('espiro-', 'respirar', 'espirometría'),
          R('oxi-, ox-', 'oxígeno', 'hipoxemia'),
        ],
      },
      {
        id: 'raices-urinario',
        title: 'Vías urinarias y hombre',
        items: [
          R('cisto-', 'vejiga (también quiste)', 'cistitis'),
          R('uretero-', 'uréter', 'ureteroscopia'),
          R('uretro-', 'uretra', 'uretritis'),
          R('pielo-', 'pelvis renal', 'pielonefritis'),
          R('orqui-, orquido-', 'testículo', 'orquitis'),
          R('prostato-', 'próstata', 'prostatitis'),
          R('andro-', 'hombre, masculino', 'andrología'),
        ],
      },
      {
        id: 'raices-mujer',
        title: 'Mujer y embarazo',
        items: [
          R('gineco-', 'mujer', 'ginecología'),
          R('histero-, metro-', 'útero', 'histerectomía'),
          R('ooforo-', 'ovario', 'ooforectomía'),
          R('salpingo-', 'trompa uterina', 'salpingitis'),
          R('masto-, mamo-', 'mama', 'mastitis'),
          R('colpo-', 'vagina', 'colposcopia'),
          R('amnio-', 'amnios (bolsa amniótica)', 'amniocentesis'),
        ],
      },
      {
        id: 'raices-nervios',
        title: 'Nervios y mente',
        items: [
          R('neuro-', 'nervio', 'neuralgia'),
          R('psico-', 'mente', 'psicosis'),
          R('meningo-', 'meninges', 'meningitis'),
          R('radiculo-', 'raíz nerviosa', 'radiculopatía'),
          R('hipno-, somno-', 'sueño', 'insomnio'),
          R('fono-', 'voz, sonido', 'disfonía'),
        ],
      },
      {
        id: 'raices-metabolismo',
        title: 'Glándulas y metabolismo',
        items: [
          R('adeno-', 'glándula', 'adenoma'),
          R('tiro-', 'tiroides', 'tiroiditis'),
          R('adreno-', 'suprarrenal', 'adrenalina'),
          R('gluco-, glic-', 'azúcar, glucosa', 'glucosuria'),
          R('lipo-', 'grasa', 'lipoma'),
          R('uro-', 'orina', 'urología'),
          R('lito-', 'piedra', 'litotripsia'),
        ],
      },
      {
        id: 'raices-descriptores',
        title: 'Colores y estados',
        items: [
          R('ciano-', 'azul', 'cianosis'),
          R('melano-', 'negro, oscuro', 'melanoma'),
          R('xanto-', 'amarillo', 'xantoma'),
          R('necro-', 'muerte', 'necrosis'),
          R('onco-', 'tumor, masa', 'oncología'),
          R('pio-', 'pus', 'piuria'),
          R('hidro-', 'agua, líquido', 'hidrocefalia'),
        ],
      },
      {
        id: 'raices-partes',
        title: 'Más partes del cuerpo',
        items: [
          R('onico-', 'uña', 'onicomicosis'),
          R('acro-', 'extremidades, punta', 'acromegalia'),
          R('blefaro-', 'párpado', 'blefaritis'),
          R('queilo-', 'labio', 'queilitis'),
          R('gloso-', 'lengua', 'glositis'),
          R('quiro-', 'mano', 'quiropráctico'),
          R('podo-', 'pie', 'podología'),
        ],
      },
    ],
  },
  {
    id: 'sintomas',
    title: 'Signos y síntomas',
    description: 'Lo que el paciente cuenta y lo que tú encuentras, con su nombre exacto.',
    color: '#d97706',
    icon: 'stethoscope',
    lessons: [
      {
        id: 'sintomas-cardio',
        title: 'Respiración y corazón',
        items: [
          t('disnea', 'dificultad para respirar', [['dis', 'dificultad'], ['nea', 'respiración']]),
          t('ortopnea', 'disnea al acostarse que mejora al incorporarse', [['orto', 'recto, erguido'], ['pnea', 'respiración']]),
          t('taquicardia', 'frecuencia cardiaca rápida (> 100 lpm en el adulto)', [['taqui', 'rápido'], ['cardia', 'corazón']]),
          t('bradicardia', 'frecuencia cardiaca lenta (< 60 lpm en el adulto)', [['bradi', 'lento'], ['cardia', 'corazón']]),
          t('cianosis', 'coloración azulada de piel y mucosas', [['cian', 'azul'], ['osis', 'estado anormal']]),
          t('hemoptisis', 'expulsión de sangre con la tos desde las vías respiratorias', [['hemo', 'sangre'], ['ptisis', 'escupir']]),
        ],
      },
      {
        id: 'sintomas-digestivo',
        title: 'Aparato digestivo',
        items: [
          t('disfagia', 'dificultad para tragar', [['dis', 'dificultad'], ['fagia', 'comer, tragar']]),
          t('odinofagia', 'dolor al tragar', [['odino', 'dolor'], ['fagia', 'comer, tragar']]),
          t('hematemesis', 'vómito con sangre', [['hemat', 'sangre'], ['emesis', 'vómito']]),
          t('melena', 'heces negras y pegajosas por sangre digerida (sangrado digestivo alto)'),
          t('hematoquecia', 'salida de sangre roja por el recto', [['hemato', 'sangre'], ['quecia', 'defecar']]),
          t('tenesmo', 'deseo constante de evacuar con sensación de vaciado incompleto'),
        ],
      },
      {
        id: 'sintomas-orina',
        title: 'Riñón y orina',
        items: [
          t('poliuria', 'orinar en exceso (más de 3 L al día en el adulto)', [['poli', 'mucho'], ['uria', 'orina']]),
          t('oliguria', 'orinar poco (menos de 400 mL al día en el adulto)', [['olig', 'poco'], ['uria', 'orina']]),
          t('anuria', 'ausencia casi total de orina (menos de 100 mL al día)', [['an', 'sin'], ['uria', 'orina']]),
          t('disuria', 'dolor o ardor al orinar', [['dis', 'dificultad, alteración'], ['uria', 'orina']]),
          t('hematuria', 'sangre en la orina', [['hemat', 'sangre'], ['uria', 'orina']]),
          t('polaquiuria', 'orinar con mucha frecuencia y poco volumen', [['polaqui', 'frecuente'], ['uria', 'orina']]),
          t('nicturia', 'despertarse por la noche para orinar', [['nict', 'noche'], ['uria', 'orina']]),
        ],
      },
      {
        id: 'sintomas-neuro',
        title: 'Neurológicos',
        items: [
          t('cefalea', 'dolor de cabeza'),
          t('parestesia', 'sensación anormal (hormigueo, adormecimiento) sin estímulo', [['par', 'anormal'], ['estesia', 'sensibilidad']]),
          t('afasia', 'pérdida o alteración del lenguaje por lesión cerebral', [['a', 'sin'], ['fasia', 'habla']]),
          t('disartria', 'dificultad para articular las palabras', [['dis', 'dificultad'], ['artria', 'articulación']]),
          t('diplopía', 'visión doble', [['dipl', 'doble'], ['opía', 'visión']]),
          t('fotofobia', 'molestia o intolerancia a la luz', [['foto', 'luz'], ['fobia', 'aversión']]),
        ],
      },
      {
        id: 'sintomas-generales',
        title: 'Generales',
        items: [
          t('polidipsia', 'sed excesiva', [['poli', 'mucho'], ['dipsia', 'sed']]),
          t('polifagia', 'hambre excesiva', [['poli', 'mucho'], ['fagia', 'comer']]),
          t('astenia', 'cansancio o debilidad generalizada', [['a', 'sin'], ['stenia', 'fuerza']]),
          t('diaforesis', 'sudoración profusa'),
          t('ictericia', 'coloración amarilla de piel y mucosas por aumento de bilirrubina'),
          t('epistaxis', 'sangrado por la nariz', [['epi', 'sobre'], ['staxis', 'goteo']]),
          t('prurito', 'picazón'),
        ],
      },
      {
        id: 'sintomas-respiracion',
        title: 'Respiración',
        items: [
          t('taquipnea', 'respiración rápida (más de 20 por minuto en el adulto)', [['taqui', 'rápido'], ['pnea', 'respiración']]),
          t('bradipnea', 'respiración lenta (menos de 12 por minuto en el adulto)', [['bradi', 'lento'], ['pnea', 'respiración']]),
          t('apnea', 'pausa en la respiración (10 segundos o más)', [['a', 'sin'], ['pnea', 'respiración']]),
          t('hipoxemia', 'oxígeno bajo en la sangre arterial (PaO2 < 80 mmHg)', [['hip', 'deficiencia'], ['ox', 'oxígeno'], ['emia', 'en la sangre']]),
          t('hipercapnia', 'CO2 alto en la sangre (PaCO2 > 45 mmHg)', [['hiper', 'exceso'], ['capnia', 'dióxido de carbono']]),
          t('estridor', 'ruido agudo al inspirar por obstrucción de la vía aérea alta'),
          t('sibilancias', 'silbidos al espirar por estrechez de los bronquios'),
        ],
      },
      {
        id: 'sintomas-movimiento',
        title: 'Movimiento y sensibilidad',
        items: [
          t('hemiparesia', 'debilidad de una mitad del cuerpo', [['hemi', 'mitad'], ['paresia', 'debilidad']]),
          t('paraplejía', 'parálisis de ambas piernas', [['para', 'a ambos lados'], ['plejía', 'parálisis']]),
          t('cuadriplejía', 'parálisis de brazos y piernas (también tetraplejía)', [['cuadri', 'cuatro'], ['plejía', 'parálisis']]),
          t('ataxia', 'falta de coordinación de los movimientos', [['a', 'sin'], ['taxia', 'orden, coordinación']]),
          t('hipoestesia', 'disminución de la sensibilidad', [['hipo', 'deficiencia'], ['estesia', 'sensibilidad']]),
          t('anosmia', 'pérdida del olfato', [['an', 'sin'], ['osmia', 'olfato']]),
          t('bradicinesia', 'lentitud de los movimientos (típica del Parkinson)', [['bradi', 'lento'], ['cinesia', 'movimiento']]),
        ],
      },
      {
        id: 'sintomas-menstruacion',
        title: 'Menstruación y ginecología',
        items: [
          t('amenorrea', 'ausencia de menstruación', [['a', 'sin'], ['meno', 'menstruación'], ['rrea', 'flujo']]),
          t('dismenorrea', 'menstruación dolorosa', [['dis', 'alteración'], ['meno', 'menstruación'], ['rrea', 'flujo']]),
          t('menorragia', 'menstruación muy abundante o prolongada', [['meno', 'menstruación'], ['rragia', 'sangrado abundante']]),
          t('metrorragia', 'sangrado uterino fuera de la menstruación', [['metro', 'útero'], ['rragia', 'sangrado abundante']]),
          t('oligomenorrea', 'menstruaciones muy espaciadas (ciclos de más de 35 días)', [['oligo', 'poco'], ['meno', 'menstruación'], ['rrea', 'flujo']]),
          t('dispareunia', 'dolor durante las relaciones sexuales', [['dis', 'alteración'], ['pareunia', 'unión sexual']]),
          t('leucorrea', 'flujo vaginal blanquecino', [['leuco', 'blanco'], ['rrea', 'flujo']]),
        ],
      },
      {
        id: 'sintomas-piel-ojos',
        title: 'Piel y ojos',
        items: [
          t('eritema', 'enrojecimiento de la piel que palidece al presionar'),
          t('alopecia', 'caída o ausencia del pelo'),
          t('petequias', 'puntos rojos diminutos de sangre en la piel que no palidecen al presionar'),
          t('equimosis', 'moretón: mancha morada por sangre bajo la piel'),
          t('midriasis', 'pupila dilatada'),
          t('miosis', 'pupila contraída, pequeña'),
          t('exoftalmos', 'ojos desplazados hacia afuera, «saltones»', [['ex', 'fuera'], ['oftalmos', 'ojo']]),
        ],
      },
      {
        id: 'sintomas-digestivo-2',
        title: 'Más digestivo',
        items: [
          t('dispepsia', 'malestar o llenura en la boca del estómago al comer', [['dis', 'alteración'], ['pepsia', 'digestión']]),
          t('pirosis', 'ardor detrás del esternón (acidez)', [['pir', 'fuego'], ['osis', 'estado']]),
          t('anorexia', 'pérdida del apetito', [['an', 'sin'], ['orexia', 'apetito']]),
          t('esteatorrea', 'heces grasosas, brillantes y malolientes', [['esteato', 'grasa'], ['rrea', 'flujo']]),
          t('ascitis', 'líquido libre en la cavidad abdominal'),
          t('hepatoesplenomegalia', 'hígado y bazo agrandados', [['hepato', 'hígado'], ['espleno', 'bazo'], ['megalia', 'agrandamiento']]),
        ],
      },
    ],
  },
  {
    id: 'diagnosticos',
    title: 'Diagnósticos',
    description: 'Une raíces y sufijos para nombrar la enfermedad.',
    color: '#7c3aed',
    icon: 'microscope',
    lessons: [
      {
        id: 'diagnosticos-itis',
        title: 'Inflamaciones',
        items: [
          t('hepatitis', 'inflamación del hígado', [['hepat', 'hígado'], ['itis', 'inflamación']]),
          t('nefritis', 'inflamación del riñón', [['nefr', 'riñón'], ['itis', 'inflamación']]),
          t('artritis', 'inflamación de una articulación', [['artr', 'articulación'], ['itis', 'inflamación']]),
          t('gastritis', 'inflamación de la mucosa del estómago', [['gastr', 'estómago'], ['itis', 'inflamación']]),
          t('colecistitis', 'inflamación de la vesícula biliar', [['colecist', 'vesícula biliar'], ['itis', 'inflamación']]),
          t('meningitis', 'inflamación de las meninges', [['mening', 'meninges'], ['itis', 'inflamación']]),
          t('miocarditis', 'inflamación del músculo cardiaco', [['mio', 'músculo'], ['card', 'corazón'], ['itis', 'inflamación']]),
        ],
      },
      {
        id: 'diagnosticos-dolor-tamano',
        title: 'Dolor y tamaño',
        items: [
          t('artralgia', 'dolor articular', [['artr', 'articulación'], ['algia', 'dolor']]),
          t('mialgia', 'dolor muscular', [['mi', 'músculo'], ['algia', 'dolor']]),
          t('otalgia', 'dolor de oído', [['ot', 'oído'], ['algia', 'dolor']]),
          t('hepatomegalia', 'hígado agrandado', [['hepato', 'hígado'], ['megalia', 'agrandamiento']]),
          t('esplenomegalia', 'bazo agrandado', [['espleno', 'bazo'], ['megalia', 'agrandamiento']]),
          t('cardiomegalia', 'corazón agrandado', [['cardio', 'corazón'], ['megalia', 'agrandamiento']]),
        ],
      },
      {
        id: 'diagnosticos-patias',
        title: 'Enfermedades',
        items: [
          t('nefropatía', 'enfermedad del riñón', [['nefro', 'riñón'], ['patía', 'enfermedad']]),
          t('neuropatía', 'enfermedad de los nervios', [['neuro', 'nervio'], ['patía', 'enfermedad']]),
          t('cardiopatía', 'enfermedad del corazón', [['cardio', 'corazón'], ['patía', 'enfermedad']]),
          t('miopatía', 'enfermedad del músculo', [['mio', 'músculo'], ['patía', 'enfermedad']]),
          t('osteoporosis', 'pérdida de masa ósea que hace al hueso poroso y frágil', [['osteo', 'hueso'], ['por', 'poro'], ['osis', 'estado anormal']]),
          t('dermatitis', 'inflamación de la piel', [['dermat', 'piel'], ['itis', 'inflamación']]),
        ],
      },
      {
        id: 'diagnosticos-tumores',
        title: 'Tumores',
        items: [
          t('lipoma', 'tumor benigno de grasa', [['lip', 'grasa'], ['oma', 'tumor']]),
          t('adenoma', 'tumor benigno de una glándula', [['aden', 'glándula'], ['oma', 'tumor']]),
          t('mioma', 'tumor benigno de músculo (en el útero, leiomioma)', [['mi', 'músculo'], ['oma', 'tumor']]),
          t('melanoma', 'tumor maligno de las células del pigmento de la piel', [['melan', 'negro'], ['oma', 'tumor']]),
          t('osteosarcoma', 'tumor maligno del hueso', [['osteo', 'hueso'], ['sarc', 'carne, tejido conectivo'], ['oma', 'tumor']]),
          t('hemangioma', 'tumor benigno de vasos sanguíneos', [['hem', 'sangre'], ['angi', 'vaso'], ['oma', 'tumor']]),
          t('carcinoma', 'tumor maligno de origen epitelial', [['carcin', 'cáncer'], ['oma', 'tumor']]),
        ],
      },
      {
        id: 'diagnosticos-osis',
        title: 'Piedras, placas y coágulos',
        items: [
          t('colelitiasis', 'cálculos en la vesícula biliar', [['cole', 'bilis'], ['lit', 'piedra'], ['iasis', 'formación de']]),
          t('nefrolitiasis', 'cálculos en el riñón', [['nefro', 'riñón'], ['lit', 'piedra'], ['iasis', 'formación de']]),
          t('aterosclerosis', 'placas de grasa que endurecen y estrechan las arterias', [['atero', 'placa, papilla'], ['sclerosis', 'endurecimiento']]),
          t('trombosis', 'formación de un coágulo dentro de un vaso', [['tromb', 'coágulo'], ['osis', 'proceso']]),
          t('necrosis', 'muerte de un tejido', [['necr', 'muerte'], ['osis', 'proceso']]),
          t('fibrosis', 'cicatrización excesiva que endurece un tejido', [['fibr', 'fibra'], ['osis', 'proceso']]),
          t('cirrosis', 'fibrosis avanzada del hígado con nódulos', [['cirr', 'amarillo anaranjado'], ['osis', 'proceso']]),
        ],
      },
      {
        id: 'diagnosticos-glandulas',
        title: 'Glándulas',
        items: [
          t('hipotiroidismo', 'función de la tiroides disminuida', [['hipo', 'deficiencia'], ['tiroid', 'tiroides'], ['ismo', 'estado']]),
          t('hipertiroidismo', 'función de la tiroides aumentada', [['hiper', 'exceso'], ['tiroid', 'tiroides'], ['ismo', 'estado']]),
          t('hiperparatiroidismo', 'exceso de hormona paratiroidea', [['hiper', 'exceso'], ['paratiroid', 'paratiroides'], ['ismo', 'estado']]),
          t('acromegalia', 'crecimiento de manos, pies y cara por exceso de hormona de crecimiento en el adulto', [['acro', 'extremidades'], ['megalia', 'agrandamiento']]),
          t('ginecomastia', 'crecimiento de las mamas en el hombre', [['gineco', 'mujer'], ['mastia', 'mama']]),
          t('hirsutismo', 'vello de patrón masculino en la mujer'),
        ],
      },
      {
        id: 'diagnosticos-hernias',
        title: 'Líquido, caídas y blanduras',
        items: [
          t('hidrocele', 'líquido acumulado alrededor del testículo', [['hidro', 'agua, líquido'], ['cele', 'hernia, protrusión']]),
          t('varicocele', 'dilatación de las venas del cordón espermático', [['varico', 'várice'], ['cele', 'hernia, protrusión']]),
          t('blefaroptosis', 'caída del párpado superior', [['blefaro', 'párpado'], ['ptosis', 'caída']]),
          t('osteomalacia', 'reblandecimiento del hueso por falta de mineralización', [['osteo', 'hueso'], ['malacia', 'reblandecimiento']]),
          t('hidronefrosis', 'dilatación del riñón porque la orina no drena', [['hidro', 'agua, líquido'], ['nefr', 'riñón'], ['osis', 'proceso']]),
          t('hidrocefalia', 'exceso de líquido cefalorraquídeo dentro del cráneo', [['hidro', 'agua, líquido'], ['cefalia', 'cabeza']]),
        ],
      },
      {
        id: 'diagnosticos-infecciones',
        title: 'Infecciones',
        items: [
          t('neumonía', 'infección del tejido pulmonar', [['neumon', 'pulmón'], ['ía', 'enfermedad']]),
          t('pielonefritis', 'infección de la pelvis y el tejido del riñón', [['pielo', 'pelvis renal'], ['nefr', 'riñón'], ['itis', 'inflamación']]),
          t('cistitis', 'inflamación de la vejiga', [['cist', 'vejiga'], ['itis', 'inflamación']]),
          t('conjuntivitis', 'inflamación de la conjuntiva del ojo', [['conjuntiv', 'conjuntiva'], ['itis', 'inflamación']]),
          t('onicomicosis', 'infección de las uñas por hongos', [['onico', 'uña'], ['mic', 'hongo'], ['osis', 'proceso']]),
          t('endocarditis', 'inflamación del revestimiento interno del corazón y sus válvulas', [['endo', 'dentro'], ['card', 'corazón'], ['itis', 'inflamación']]),
          t('osteomielitis', 'infección del hueso y su médula', [['osteo', 'hueso'], ['miel', 'médula'], ['itis', 'inflamación']]),
        ],
      },
    ],
  },
  {
    id: 'laboratorio',
    title: 'Laboratorio',
    description: 'Lee un hemograma o un ionograma sin traducir en la cabeza.',
    color: '#db2777',
    icon: 'flask-conical',
    lessons: [
      {
        id: 'laboratorio-sangre',
        title: 'Células de la sangre',
        items: [
          t('anemia', 'disminución de la hemoglobina o de los glóbulos rojos', [['an', 'sin'], ['emia', 'sangre']]),
          t('policitemia', 'aumento de los glóbulos rojos', [['poli', 'muchos'], ['cit', 'célula'], ['emia', 'en la sangre']]),
          t('leucocitosis', 'aumento de los glóbulos blancos', [['leuco', 'blanco'], ['cit', 'célula'], ['osis', 'estado anormal']]),
          t('leucopenia', 'disminución de los glóbulos blancos', [['leuco', 'blanco'], ['penia', 'disminución']]),
          t('neutropenia', 'disminución de los neutrófilos', [['neutro', 'neutrófilo'], ['penia', 'disminución']]),
          t('trombocitopenia', 'disminución de las plaquetas', [['trombo', 'coágulo'], ['cito', 'célula'], ['penia', 'disminución']]),
        ],
      },
      {
        id: 'laboratorio-quimica',
        title: 'Glucosa y electrolitos',
        items: [
          t('hiperglucemia', 'glucosa alta en la sangre', [['hiper', 'exceso'], ['gluc', 'glucosa'], ['emia', 'en la sangre']]),
          t('hipoglucemia', 'glucosa baja en la sangre', [['hipo', 'deficiencia'], ['gluc', 'glucosa'], ['emia', 'en la sangre']]),
          t('hiponatremia', 'sodio bajo en la sangre', [['hipo', 'deficiencia'], ['natr', 'sodio'], ['emia', 'en la sangre']]),
          t('hiperpotasemia', 'potasio alto en la sangre (también hiperkalemia)', [['hiper', 'exceso'], ['potas', 'potasio'], ['emia', 'en la sangre']]),
          t('hipocalcemia', 'calcio bajo en la sangre', [['hipo', 'deficiencia'], ['calc', 'calcio'], ['emia', 'en la sangre']]),
          t('azoemia', 'aumento de urea y creatinina en la sangre', [['azo', 'nitrógeno'], ['emia', 'en la sangre']]),
        ],
      },
      {
        id: 'laboratorio-orina',
        title: 'Orina e infección',
        items: [
          t('proteinuria', 'proteínas en la orina', [['protein', 'proteína'], ['uria', 'en la orina']]),
          t('glucosuria', 'glucosa en la orina', [['glucos', 'glucosa'], ['uria', 'en la orina']]),
          t('piuria', 'pus (leucocitos) en la orina', [['pi', 'pus'], ['uria', 'en la orina']]),
          t('bacteriemia', 'bacterias en la sangre', [['bacteri', 'bacteria'], ['emia', 'en la sangre']]),
          t('hiperbilirrubinemia', 'bilirrubina alta en la sangre', [['hiper', 'exceso'], ['bilirrubin', 'bilirrubina'], ['emia', 'en la sangre']]),
        ],
      },
      {
        id: 'laboratorio-electrolitos',
        title: 'Más electrolitos y lípidos',
        items: [
          t('hipernatremia', 'sodio alto en la sangre', [['hiper', 'exceso'], ['natr', 'sodio'], ['emia', 'en la sangre']]),
          t('hipopotasemia', 'potasio bajo en la sangre (también hipokalemia)', [['hipo', 'deficiencia'], ['potas', 'potasio'], ['emia', 'en la sangre']]),
          t('hipercalcemia', 'calcio alto en la sangre', [['hiper', 'exceso'], ['calc', 'calcio'], ['emia', 'en la sangre']]),
          t('hipomagnesemia', 'magnesio bajo en la sangre', [['hipo', 'deficiencia'], ['magnes', 'magnesio'], ['emia', 'en la sangre']]),
          t('hiperuricemia', 'ácido úrico alto en la sangre', [['hiper', 'exceso'], ['uric', 'ácido úrico'], ['emia', 'en la sangre']]),
          t('dislipidemia', 'colesterol o triglicéridos alterados en la sangre', [['dis', 'alteración'], ['lipid', 'lípido, grasa'], ['emia', 'en la sangre']]),
          t('hipoalbuminemia', 'albúmina baja en la sangre', [['hipo', 'deficiencia'], ['albumin', 'albúmina'], ['emia', 'en la sangre']]),
        ],
      },
      {
        id: 'laboratorio-hemograma',
        title: 'Leer el hemograma',
        items: [
          t('linfocitosis', 'aumento de los linfocitos', [['linfo', 'linfa'], ['cit', 'célula'], ['osis', 'aumento']]),
          t('eosinofilia', 'aumento de los eosinófilos (alergias, parásitos)', [['eosino', 'eosinófilo'], ['filia', 'aumento']]),
          t('pancitopenia', 'disminución de glóbulos rojos, glóbulos blancos y plaquetas a la vez', [['pan', 'todo'], ['cito', 'célula'], ['penia', 'disminución']]),
          t('microcitosis', 'glóbulos rojos pequeños (VCM < 80 fL)', [['micro', 'pequeño'], ['cit', 'célula'], ['osis', 'estado']]),
          t('macrocitosis', 'glóbulos rojos grandes (VCM > 100 fL)', [['macro', 'grande'], ['cit', 'célula'], ['osis', 'estado']]),
          t('anisocitosis', 'glóbulos rojos de tamaños distintos (RDW alto)', [['aniso', 'desigual'], ['cit', 'célula'], ['osis', 'estado']]),
        ],
      },
      {
        id: 'laboratorio-acido-base',
        title: 'Ácido-base y orina',
        items: [
          t('acidemia', 'pH de la sangre bajo (< 7,35)', [['acid', 'ácido'], ['emia', 'en la sangre']]),
          t('alcalemia', 'pH de la sangre alto (> 7,45)', [['alcal', 'alcalino'], ['emia', 'en la sangre']]),
          t('cetonuria', 'cuerpos cetónicos en la orina', [['ceton', 'cetona'], ['uria', 'en la orina']]),
          t('bacteriuria', 'bacterias en la orina', [['bacteri', 'bacteria'], ['uria', 'en la orina']]),
          t('hemoglobinuria', 'hemoglobina libre en la orina (por hemólisis)', [['hemoglobin', 'hemoglobina'], ['uria', 'en la orina']]),
          t('mioglobinuria', 'mioglobina en la orina (por destrucción muscular)', [['mio', 'músculo'], ['globin', 'globina'], ['uria', 'en la orina']]),
        ],
      },
    ],
  },
  {
    id: 'procedimientos',
    title: 'Procedimientos',
    description: 'Cirugías, punciones y estudios: qué se hace y dónde.',
    color: '#0d9488',
    icon: 'scissors',
    lessons: [
      {
        id: 'procedimientos-ectomias',
        title: 'Extirpar',
        items: [
          t('apendicectomía', 'extirpación del apéndice', [['apendic', 'apéndice'], ['ectomía', 'extirpación']]),
          t('colecistectomía', 'extirpación de la vesícula biliar', [['colecist', 'vesícula biliar'], ['ectomía', 'extirpación']]),
          t('histerectomía', 'extirpación del útero', [['hister', 'útero'], ['ectomía', 'extirpación']]),
          t('mastectomía', 'extirpación de la mama', [['mast', 'mama'], ['ectomía', 'extirpación']]),
          t('nefrectomía', 'extirpación del riñón', [['nefr', 'riñón'], ['ectomía', 'extirpación']]),
          t('tiroidectomía', 'extirpación de la tiroides', [['tiroid', 'tiroides'], ['ectomía', 'extirpación']]),
        ],
      },
      {
        id: 'procedimientos-abrir',
        title: 'Abrir y reparar',
        items: [
          t('laparotomía', 'incisión de la pared abdominal', [['laparo', 'abdomen'], ['tomía', 'incisión']]),
          t('toracotomía', 'incisión de la pared del tórax', [['toraco', 'tórax'], ['tomía', 'incisión']]),
          t('traqueostomía', 'abertura de la tráquea al exterior', [['traque', 'tráquea'], ['ostomía', 'abertura al exterior']]),
          t('gastrostomía', 'abertura del estómago al exterior (p. ej., para alimentar)', [['gastr', 'estómago'], ['ostomía', 'abertura al exterior']]),
          t('colostomía', 'abertura del colon a la pared abdominal', [['col', 'colon'], ['ostomía', 'abertura al exterior']]),
          t('rinoplastia', 'reparación quirúrgica de la nariz', [['rino', 'nariz'], ['plastia', 'reparación']]),
        ],
      },
      {
        id: 'procedimientos-estudios',
        title: 'Mirar y registrar',
        items: [
          t('endoscopia', 'examen del interior de un órgano con un instrumento', [['endo', 'dentro'], ['scopia', 'examen visual']]),
          t('colonoscopia', 'examen visual del colon', [['colono', 'colon'], ['scopia', 'examen visual']]),
          t('broncoscopia', 'examen visual de los bronquios', [['bronco', 'bronquio'], ['scopia', 'examen visual']]),
          t('angiografía', 'imagen de los vasos sanguíneos con contraste', [['angio', 'vaso'], ['grafía', 'imagen']]),
          t('electrocardiograma', 'registro de la actividad eléctrica del corazón', [['electro', 'eléctrico'], ['cardio', 'corazón'], ['grama', 'registro']]),
          t('ecocardiograma', 'imagen del corazón con ultrasonido', [['eco', 'ultrasonido'], ['cardio', 'corazón'], ['grama', 'registro']]),
        ],
      },
      {
        id: 'procedimientos-punciones',
        title: 'Punciones',
        items: [
          t('toracocentesis', 'punción del tórax para extraer líquido pleural', [['toraco', 'tórax'], ['centesis', 'punción']]),
          t('paracentesis', 'punción del abdomen para extraer líquido ascítico', [['para', 'junto a'], ['centesis', 'punción']]),
          t('artrocentesis', 'punción de una articulación para extraer líquido', [['artro', 'articulación'], ['centesis', 'punción']]),
          t('amniocentesis', 'punción del saco amniótico para extraer líquido', [['amnio', 'amnios'], ['centesis', 'punción']]),
          t('biopsia', 'toma de una muestra de tejido para estudiarla'),
        ],
      },
      {
        id: 'procedimientos-reparar',
        title: 'Suturar, fijar y fragmentar',
        items: [
          t('herniorrafia', 'reparación de una hernia con sutura', [['hernio', 'hernia'], ['rrafia', 'sutura']]),
          t('orquidopexia', 'fijación del testículo en el escroto', [['orquido', 'testículo'], ['pexia', 'fijación']]),
          t('litotripsia', 'fragmentación de cálculos', [['lito', 'piedra'], ['tripsia', 'triturar']]),
          t('angioplastia', 'apertura de un vaso estrecho con balón o stent', [['angio', 'vaso'], ['plastia', 'reparación']]),
          t('artroscopia', 'examen del interior de una articulación con una cámara', [['artro', 'articulación'], ['scopia', 'examen visual']]),
          t('cistoscopia', 'examen del interior de la vejiga con una cámara', [['cisto', 'vejiga'], ['scopia', 'examen visual']]),
          t('laringoscopia', 'examen visual de la laringe', [['laringo', 'laringe'], ['scopia', 'examen visual']]),
        ],
      },
      {
        id: 'procedimientos-gineco',
        title: 'Ginecología y obstetricia',
        items: [
          t('histerosalpingografía', 'imagen con contraste del útero y las trompas', [['histero', 'útero'], ['salpingo', 'trompa uterina'], ['grafía', 'imagen']]),
          t('colposcopia', 'examen del cuello uterino y la vagina con lente de aumento', [['colpo', 'vagina'], ['scopia', 'examen visual']]),
          t('ooforectomía', 'extirpación de un ovario', [['oofor', 'ovario'], ['ectomía', 'extirpación']]),
          t('salpingectomía', 'extirpación de una trompa uterina', [['salping', 'trompa uterina'], ['ectomía', 'extirpación']]),
          t('mamografía', 'radiografía de la mama', [['mamo', 'mama'], ['grafía', 'imagen']]),
          t('episiotomía', 'corte del periné para ampliar el canal del parto', [['episio', 'pubis, vulva'], ['tomía', 'incisión']]),
          t('cesárea', 'nacimiento por una incisión en el abdomen y el útero'),
        ],
      },
      {
        id: 'procedimientos-estudios-2',
        title: 'Más estudios',
        items: [
          t('espirometría', 'medición del aire que entra y sale de los pulmones', [['espiro', 'respirar'], ['metría', 'medición']]),
          t('electroencefalograma', 'registro de la actividad eléctrica del cerebro', [['electro', 'eléctrico'], ['encefalo', 'encéfalo'], ['grama', 'registro']]),
          t('electromiografía', 'registro de la actividad eléctrica de los músculos', [['electro', 'eléctrico'], ['mio', 'músculo'], ['grafía', 'registro']]),
          t('ecografía', 'imagen con ultrasonido', [['eco', 'ultrasonido'], ['grafía', 'imagen']]),
          t('gastroscopia', 'examen visual del estómago con un endoscopio', [['gastro', 'estómago'], ['scopia', 'examen visual']]),
          t('toracoscopia', 'examen de la cavidad pleural con una cámara', [['toraco', 'tórax'], ['scopia', 'examen visual']]),
        ],
      },
    ],
  },
  {
    id: 'anatomia',
    title: 'Posición y movimiento',
    description: 'El idioma de la exploración física y de la radiografía: dónde está cada cosa y hacia dónde se mueve.',
    color: '#4f46e5',
    icon: 'move',
    lessons: [
      {
        id: 'anatomia-planos',
        title: 'Delante, detrás y lados',
        items: [
          t('anterior', 'hacia delante del cuerpo'),
          t('posterior', 'hacia atrás, del lado de la espalda'),
          t('medial', 'más cerca de la línea media del cuerpo'),
          t('lateral', 'más lejos de la línea media, hacia los lados'),
          t('ventral', 'del lado del vientre'),
          t('dorsal', 'del lado del dorso'),
        ],
      },
      {
        id: 'anatomia-distancias',
        title: 'Cerca y lejos',
        items: [
          t('proximal', 'más cerca del tronco o del origen de una estructura'),
          t('distal', 'más lejos del tronco o del origen de una estructura'),
          t('superficial', 'más cerca de la superficie del cuerpo'),
          t('profundo', 'más lejos de la superficie del cuerpo'),
          t('craneal', 'hacia la cabeza'),
          t('caudal', 'hacia los pies (hacia la «cola»)'),
        ],
      },
      {
        id: 'anatomia-lados',
        title: 'Lados y posturas',
        items: [
          t('ipsilateral', 'del mismo lado', [['ipsi', 'el mismo'], ['lateral', 'lado']]),
          t('contralateral', 'del lado opuesto', [['contra', 'opuesto'], ['lateral', 'lado']]),
          t('bilateral', 'de ambos lados', [['bi', 'dos'], ['lateral', 'lado']]),
          t('unilateral', 'de un solo lado', [['uni', 'uno'], ['lateral', 'lado']]),
          t('decúbito supino', 'acostado boca arriba'),
          t('decúbito prono', 'acostado boca abajo'),
        ],
      },
      {
        id: 'anatomia-movimientos',
        title: 'Movimientos',
        items: [
          t('flexión', 'doblar una articulación: el ángulo se cierra'),
          t('extensión', 'estirar una articulación: el ángulo se abre'),
          t('abducción', 'alejar un miembro de la línea media', [['ab', 'lejos de'], ['ducción', 'llevar']]),
          t('aducción', 'acercar un miembro a la línea media', [['a', 'hacia (de ad-)'], ['ducción', 'llevar']]),
          t('pronación', 'girar el antebrazo con la palma hacia abajo'),
          t('supinación', 'girar el antebrazo con la palma hacia arriba'),
        ],
      },
    ],
  },
  {
    id: 'siglas',
    title: 'Siglas que vas a leer',
    description: 'Las abreviaturas de los casos clínicos y de la historia clínica, para no trabarte en el examen.',
    color: '#475569',
    icon: 'clipboard-list',
    lessons: [
      {
        id: 'siglas-cardio',
        title: 'Corazón y vasos',
        items: [
          G('IAM', 'infarto agudo de miocardio'),
          G('HTA', 'hipertensión arterial'),
          G('ICC', 'insuficiencia cardiaca congestiva'),
          G('FA', 'fibrilación auricular'),
          G('TVP', 'trombosis venosa profunda'),
          G('TEP', 'tromboembolismo pulmonar'),
        ],
      },
      {
        id: 'siglas-pulmon-rinon',
        title: 'Pulmón y riñón',
        items: [
          G('EPOC', 'enfermedad pulmonar obstructiva crónica'),
          G('SDRA', 'síndrome de dificultad respiratoria aguda'),
          G('ERC', 'enfermedad renal crónica'),
          G('LRA', 'lesión renal aguda (antes, insuficiencia renal aguda)'),
          G('ITU', 'infección del tracto urinario'),
          G('TFG', 'tasa de filtración glomerular'),
        ],
      },
      {
        id: 'siglas-neuro-digestivo',
        title: 'Neuro, digestivo y metabolismo',
        items: [
          G('ACV', 'accidente cerebrovascular (ictus)'),
          G('HSA', 'hemorragia subaracnoidea'),
          G('HDA', 'hemorragia digestiva alta'),
          G('ERGE', 'enfermedad por reflujo gastroesofágico'),
          G('DM2', 'diabetes mellitus tipo 2'),
          G('CAD', 'cetoacidosis diabética'),
        ],
      },
      {
        id: 'siglas-historia',
        title: 'En la historia clínica',
        items: [
          G('APP', 'antecedentes personales patológicos'),
          G('TA', 'tensión arterial'),
          G('FC', 'frecuencia cardiaca'),
          G('FR', 'frecuencia respiratoria'),
          G('SpO2', 'saturación de oxígeno medida con pulsioxímetro'),
          G('IMC', 'índice de masa corporal'),
          G('VO', 'vía oral'),
        ],
      },
    ],
  },
]

/** Pares de significado contrario. */
const OPPOSITES: [string, string][] = [
  ['prefijo-hiper', 'prefijo-hipo'],
  ['prefijo-taqui', 'prefijo-bradi'],
  ['prefijo-poli', 'prefijo-oligo'],
  ['prefijo-macro', 'prefijo-micro'],
  ['prefijo-endo', 'prefijo-exo-ecto'],
  ['prefijo-pre', 'prefijo-post-pos'],
  ['prefijo-supra', 'prefijo-infra'],
  ['prefijo-homo-iso', 'prefijo-hetero'],
  ['t-hiperglucemia', 't-hipoglucemia'],
  ['t-hipernatremia', 't-hiponatremia'],
  ['t-hiperpotasemia', 't-hipopotasemia'],
  ['t-hipercalcemia', 't-hipocalcemia'],
  ['t-hipertiroidismo', 't-hipotiroidismo'],
  ['t-taquicardia', 't-bradicardia'],
  ['t-taquipnea', 't-bradipnea'],
  ['t-leucocitosis', 't-leucopenia'],
  ['t-poliuria', 't-oliguria'],
  ['t-midriasis', 't-miosis'],
  ['t-macrocitosis', 't-microcitosis'],
  ['t-acidemia', 't-alcalemia'],
  ['t-anterior', 't-posterior'],
  ['t-medial', 't-lateral'],
  ['t-ventral', 't-dorsal'],
  ['t-proximal', 't-distal'],
  ['t-superficial', 't-profundo'],
  ['t-craneal', 't-caudal'],
  ['t-ipsilateral', 't-contralateral'],
  ['t-flexion', 't-extension'],
  ['t-abduccion', 't-aduccion'],
  ['t-pronacion', 't-supinacion'],
  ['t-decubito-supino', 't-decubito-prono'],
]

/**
 * Palabras que en algún caso se pueden usar una por otra (anterior y ventral, ACV y HSA):
 * nunca se ofrecen como distractor la una de la otra.
 */
const CONFUSABLE: string[][] = [
  ['t-anterior', 't-ventral'],
  ['t-posterior', 't-dorsal'],
  ['t-craneal', 't-anterior', 't-ventral'],
  ['sigla-acv', 'sigla-hsa'],
  ['sigla-erc', 'sigla-tfg'],
  ['sigla-icc', 'sigla-fa'],
  ['t-anemia', 't-pancitopenia', 't-microcitosis', 't-macrocitosis', 't-anisocitosis'],
  ['t-leucopenia', 't-neutropenia', 't-pancitopenia'],
  ['t-trombocitopenia', 't-pancitopenia'],
  ['t-leucocitosis', 't-linfocitosis', 't-eosinofilia'],
  ['t-colecistitis', 't-colelitiasis'],
  ['t-hepatitis', 't-cirrosis', 't-hepatomegalia', 't-hepatoesplenomegalia'],
  ['t-esplenomegalia', 't-hepatoesplenomegalia'],
  ['t-petequias', 't-equimosis', 't-eritema'],
  ['t-disnea', 't-ortopnea', 't-taquipnea', 't-hipoxemia', 't-apnea'],
  ['t-nefrolitiasis', 't-hidronefrosis'],
  ['t-aterosclerosis', 't-trombosis'],
  ['t-anorexia', 't-dispepsia'],
  ['t-disuria', 't-polaquiuria'],
  ['t-hemiparesia', 't-astenia'],
  ['t-laparotomia', 't-cesarea'],
  ['t-endoscopia', 't-gastroscopia', 't-colonoscopia', 't-broncoscopia'],
  ['t-ecografia', 't-ecocardiograma'],
]

/** Casos cortos para usar cada término donde se usa de verdad: en la clínica. */
const CONTEXTS: Record<string, string> = {
  // Signos y síntomas
  't-disnea': 'Paciente que dice «me falta el aire» al subir una escalera: presenta ___.',
  't-ortopnea': 'Paciente con insuficiencia cardiaca que duerme con tres almohadas porque acostado se ahoga: tiene ___.',
  't-taquicardia': 'Adulto con 128 latidos por minuto en reposo: tiene ___.',
  't-bradicardia': 'Adulto no atleta con 42 latidos por minuto: tiene ___.',
  't-cianosis': 'Niño con cardiopatía congénita y labios azulados: presenta ___.',
  't-hemoptisis': 'Paciente con tuberculosis que tose y expulsa sangre roja espumosa: presenta ___.',
  't-disfagia': 'Paciente que siente que la comida se le atasca al tragar: tiene ___.',
  't-odinofagia': 'Paciente con amigdalitis al que le duele tragar: tiene ___.',
  't-hematemesis': 'Paciente con várices esofágicas que vomita sangre roja: presenta ___.',
  't-melena': 'Paciente con úlcera duodenal que evacúa heces negras, pegajosas y fétidas: presenta ___.',
  't-hematoquecia': 'Paciente con hemorroides que expulsa sangre roja brillante por el recto: presenta ___.',
  't-poliuria': 'Paciente con diabetes descompensada que orina 5 litros al día: tiene ___.',
  't-oliguria': 'Paciente en choque que orina 250 mL en 24 horas: tiene ___.',
  't-anuria': 'Paciente con obstrucción urinaria completa que orina 50 mL en 24 horas: tiene ___.',
  't-disuria': 'Mujer con infección urinaria que siente ardor al orinar: tiene ___.',
  't-hematuria': 'Paciente con un cálculo renal y glóbulos rojos en el examen de orina: tiene ___.',
  't-polaquiuria': 'Paciente que va al baño cada 30 minutos y orina poco cada vez: tiene ___.',
  't-nicturia': 'Hombre con próstata agrandada que se levanta cuatro veces cada noche a orinar: tiene ___.',
  't-cefalea': 'Paciente con dolor de cabeza opresivo al final del día: refiere ___.',
  't-parestesia': 'Paciente diabético con hormigueo en ambos pies: refiere ___.',
  't-afasia': 'Paciente con un ACV del hemisferio izquierdo que no logra encontrar ni formar las palabras: tiene ___.',
  't-disartria': 'Paciente con lesión del cerebelo que sabe qué decir pero articula las palabras con torpeza: tiene ___.',
  't-diplopia': 'Paciente con parálisis del VI par craneal que ve doble: tiene ___.',
  't-fotofobia': 'Paciente con meningitis que no tolera la luz de la habitación: tiene ___.',
  't-polidipsia': 'Paciente diabético que toma agua constantemente porque siempre tiene sed: tiene ___.',
  't-polifagia': 'Paciente diabético que come mucho más de lo habitual porque siempre tiene hambre: tiene ___.',
  't-astenia': 'Paciente con anemia que se siente cansado y sin fuerzas todo el día: refiere ___.',
  't-diaforesis': 'Paciente con infarto, pálido y empapado en sudor frío: presenta ___.',
  't-ictericia': 'Paciente con hepatitis A con la piel y las escleras amarillas: presenta ___.',
  't-epistaxis': 'Niño que sangra por la nariz después de hurgarse: presenta ___.',
  't-prurito': 'Paciente con sarna que se rasca toda la noche: refiere ___.',
  't-taquipnea': 'Adulto con neumonía y 32 respiraciones por minuto: tiene ___.',
  't-bradipnea': 'Paciente intoxicado con opioides que respira 7 veces por minuto: tiene ___.',
  't-apnea': 'Recién nacido prematuro que deja de respirar durante 25 segundos: presenta ___.',
  't-hipoxemia': 'Gasometría con PaO2 de 55 mmHg respirando aire ambiente: hay ___.',
  't-hipercapnia': 'Paciente con EPOC y PaCO2 de 68 mmHg en la gasometría: tiene ___.',
  't-estridor': 'Niño con crup que hace un ruido agudo al inspirar: presenta ___.',
  't-sibilancias': 'Paciente asmático con silbidos en ambos pulmones al espirar: presenta ___.',
  't-hemiparesia': 'Paciente con ACV que mueve con dificultad el brazo y la pierna derechos: tiene ___.',
  't-paraplejia': 'Paciente con lesión de la médula dorsal que no puede mover las dos piernas: tiene ___.',
  't-cuadriplejia': 'Paciente con lesión de la médula cervical alta que no mueve brazos ni piernas: tiene ___.',
  't-ataxia': 'Paciente alcohólico con daño del cerebelo que camina tambaleándose con las piernas abiertas: tiene ___.',
  't-hipoestesia': 'Paciente con neuropatía que siente menos el pinchazo de la aguja en los pies: tiene ___.',
  't-anosmia': 'Paciente con COVID-19 que perdió por completo el olfato: tiene ___.',
  't-bradicinesia': 'Paciente con Parkinson que tarda mucho en abotonarse la camisa por lentitud de movimientos: tiene ___.',
  't-amenorrea': 'Mujer de 25 años sin menstruar desde hace 4 meses, con prueba de embarazo negativa: tiene ___.',
  't-dismenorrea': 'Adolescente con dolor pélvico intenso durante cada menstruación: tiene ___.',
  't-menorragia': 'Mujer con miomas cuyas reglas duran 9 días y traen coágulos: tiene ___.',
  't-metrorragia': 'Mujer que sangra por la vagina a mitad del ciclo, fuera de su regla: tiene ___.',
  't-oligomenorrea': 'Mujer con síndrome de ovario poliquístico que menstrúa cada 2 o 3 meses: tiene ___.',
  't-dispareunia': 'Mujer con endometriosis que siente dolor durante las relaciones sexuales: tiene ___.',
  't-eritema': 'Pierna caliente y roja que palidece al presionarla: hay ___.',
  't-alopecia': 'Paciente en quimioterapia que perdió el cabello: tiene ___.',
  't-petequias': 'Paciente con dengue y 15 000 plaquetas con puntitos rojos que no palidecen al presionar: tiene ___.',
  't-equimosis': 'Anciano con una mancha morada en el brazo después de un golpe: tiene una ___.',
  't-midriasis': 'Paciente intoxicado con atropina con las pupilas muy dilatadas: tiene ___.',
  't-miosis': 'Paciente intoxicado con organofosforados con pupilas puntiformes: tiene ___.',
  't-exoftalmos': 'Mujer con enfermedad de Graves con los ojos saltones: tiene ___.',
  't-dispepsia': 'Paciente con malestar y llenura en la boca del estómago después de comer: tiene ___.',
  't-pirosis': 'Paciente con reflujo que siente ardor detrás del esternón después de las comidas: tiene ___.',
  't-anorexia': 'Paciente con cáncer gástrico que perdió las ganas de comer: tiene ___.',
  't-esteatorrea': 'Paciente con pancreatitis crónica y heces grasosas que flotan: tiene ___.',
  't-ascitis': 'Paciente cirrótico con el abdomen distendido y matidez cambiante: tiene ___.',
  't-hepatoesplenomegalia': 'Niño con malaria al que se le palpan el hígado y el bazo agrandados: tiene ___.',
  // Diagnósticos
  't-hepatitis': 'Paciente con transaminasas de 1 500 U/L por el virus de la hepatitis A: tiene ___.',
  't-artritis': 'Rodilla caliente, roja e hinchada que duele al moverla: hay ___.',
  't-gastritis': 'Endoscopia que muestra la mucosa del estómago inflamada por H. pylori: hay ___.',
  't-colecistitis': 'Paciente con fiebre, dolor en el hipocondrio derecho y signo de Murphy positivo: tiene ___.',
  't-meningitis': 'Paciente con fiebre, rigidez de nuca y signo de Kernig positivo: tiene ___.',
  't-artralgia': 'Paciente con chikungunya y dolor en las articulaciones sin hinchazón: tiene ___.',
  't-mialgia': 'Paciente con dengue que refiere dolor en todos los músculos: tiene ___.',
  't-otalgia': 'Niño con otitis media que se queja de dolor de oído: tiene ___.',
  't-hepatomegalia': 'Borde del hígado palpable 6 cm por debajo del reborde costal: hay ___.',
  't-esplenomegalia': 'Paciente con mononucleosis y el bazo palpable: tiene ___.',
  't-cardiomegalia': 'Radiografía de tórax con índice cardiotorácico de 0,6: hay ___.',
  't-nefropatia': 'Diabético de larga evolución con proteínas en la orina y creatinina en aumento: tiene ___ diabética.',
  't-neuropatia': 'Diabético con pérdida de sensibilidad «en guante y calcetín»: tiene ___ diabética.',
  't-osteoporosis': 'Mujer posmenopáusica con densitometría de T-score -2,8: tiene ___.',
  't-lipoma': 'Masa blanda, móvil e indolora de grasa bajo la piel de la espalda: es un ___.',
  't-mioma': 'Mujer con el útero agrandado por un tumor benigno de músculo liso: tiene un ___.',
  't-melanoma': 'Lunar asimétrico, de bordes irregulares y varios colores que creció en poco tiempo: sospechas un ___.',
  't-osteosarcoma': 'Adolescente con un tumor maligno en el extremo distal del fémur: sospechas un ___.',
  't-hemangioma': 'Lactante con una mancha roja elevada «en fresa» en la cara, hecha de vasos sanguíneos: tiene un ___.',
  't-colelitiasis': 'Ecografía con cálculos dentro de la vesícula biliar: hay ___.',
  't-nefrolitiasis': 'Paciente con cólico renal y un cálculo de 6 mm en el riñón: tiene ___.',
  't-aterosclerosis': 'Placas de colesterol que estrechan las arterias coronarias: es la ___.',
  't-trombosis': 'Coágulo que tapa la vena femoral: hay ___.',
  't-necrosis': 'Dedo del pie negro y sin vida en un paciente diabético: hay ___.',
  't-cirrosis': 'Alcohólico con el hígado pequeño, nodular y endurecido en la ecografía: tiene ___.',
  't-hipotiroidismo': 'Mujer con frío, aumento de peso, estreñimiento y TSH elevada: tiene ___.',
  't-hipertiroidismo': 'Mujer con pérdida de peso, temblor, taquicardia y TSH suprimida: tiene ___.',
  't-acromegalia': 'Adulto al que ya no le sirven los anillos ni los zapatos por un adenoma de hipófisis que produce hormona de crecimiento: tiene ___.',
  't-ginecomastia': 'Hombre tratado con espironolactona al que le crecieron las mamas: tiene ___.',
  't-hirsutismo': 'Mujer con ovario poliquístico y vello en el mentón y el abdomen: tiene ___.',
  't-hidrocele': 'Escroto agrandado que transilumina por líquido alrededor del testículo: es un ___.',
  't-varicocele': 'Adolescente con las venas del escroto dilatadas como una «bolsa de gusanos»: tiene un ___.',
  't-blefaroptosis': 'Paciente con miastenia gravis con el párpado superior caído: tiene ___.',
  't-osteomalacia': 'Adulto con déficit de vitamina D y huesos blandos y dolorosos: tiene ___.',
  't-hidronefrosis': 'Ecografía con el riñón dilatado por un cálculo que tapa el uréter: hay ___.',
  't-hidrocefalia': 'Lactante cuyo perímetro cefálico crece muy rápido y con la fontanela abombada: tiene ___.',
  't-neumonia': 'Paciente con fiebre, tos productiva y una consolidación en la radiografía de tórax: tiene ___.',
  't-pielonefritis': 'Mujer con fiebre, escalofríos, puñopercusión positiva y leucocitos en la orina: tiene ___.',
  't-cistitis': 'Mujer sin fiebre con ardor al orinar, polaquiuria y dolor suprapúbico: tiene ___.',
  't-conjuntivitis': 'Niño con el ojo rojo y secreción purulenta, sin dolor ni pérdida de visión: tiene ___.',
  't-onicomicosis': 'Uñas de los pies engrosadas, amarillas y quebradizas por hongos: hay ___.',
  't-endocarditis': 'Usuario de drogas intravenosas con fiebre, soplo nuevo y vegetaciones en la válvula tricúspide: tiene ___.',
  't-osteomielitis': 'Niño con fiebre y dolor en la tibia, con el hueso infectado en la resonancia: tiene ___.',
  // Laboratorio
  't-anemia': 'Mujer con hemoglobina de 8 g/dL: tiene ___.',
  't-policitemia': 'Paciente con hematocrito de 62 %: tiene ___.',
  't-leucocitosis': 'Hemograma con 22 000 glóbulos blancos por µL: hay ___.',
  't-leucopenia': 'Hemograma con 2 500 glóbulos blancos por µL: hay ___.',
  't-neutropenia': 'Paciente en quimioterapia con 400 neutrófilos por µL: tiene ___.',
  't-trombocitopenia': 'Paciente con dengue y 40 000 plaquetas por µL: tiene ___.',
  't-hiperglucemia': 'Glucosa en ayunas de 250 mg/dL: hay ___.',
  't-hipoglucemia': 'Diabético con insulina, sudoroso y confuso, con glucosa capilar de 45 mg/dL: tiene ___.',
  't-hiponatremia': 'Sodio en sangre de 122 mEq/L: hay ___.',
  't-hiperpotasemia': 'Paciente con enfermedad renal crónica y potasio de 6,8 mEq/L: tiene ___.',
  't-hipocalcemia': 'Paciente operado de tiroides con signo de Chvostek positivo y calcio bajo: tiene ___.',
  't-azoemia': 'Paciente deshidratado con la urea y la creatinina elevadas: hay ___.',
  't-proteinuria': 'Embarazada hipertensa con 2 g de proteínas en la orina de 24 horas: tiene ___.',
  't-glucosuria': 'Tira de orina positiva para glucosa en un diabético descompensado: hay ___.',
  't-piuria': 'Examen de orina con abundantes leucocitos: hay ___.',
  't-bacteriemia': 'Hemocultivo positivo para Staphylococcus aureus: hay ___.',
  't-hiperbilirrubinemia': 'Recién nacido con bilirrubina total de 18 mg/dL: tiene ___.',
  't-hipernatremia': 'Anciano deshidratado con sodio de 158 mEq/L: tiene ___.',
  't-hipopotasemia': 'Paciente con diarrea profusa y potasio de 2,6 mEq/L: tiene ___.',
  't-hipercalcemia': 'Paciente con cáncer y calcio de 13 mg/dL: tiene ___.',
  't-hipomagnesemia': 'Alcohólico con magnesio de 1,1 mg/dL: tiene ___.',
  't-hiperuricemia': 'Paciente con gota y ácido úrico de 10 mg/dL: tiene ___.',
  't-dislipidemia': 'LDL de 190 mg/dL y triglicéridos de 300 mg/dL: hay ___.',
  't-hipoalbuminemia': 'Paciente con síndrome nefrótico y albúmina de 2,1 g/dL: tiene ___.',
  't-linfocitosis': 'Paciente con mononucleosis y los linfocitos muy aumentados en el hemograma: tiene ___.',
  't-eosinofilia': 'Niño con parásitos intestinales y 15 % de eosinófilos: tiene ___.',
  't-pancitopenia': 'Paciente con aplasia medular y descenso de glóbulos rojos, glóbulos blancos y plaquetas: tiene ___.',
  't-microcitosis': 'Anemia por falta de hierro con VCM de 68 fL: hay ___.',
  't-macrocitosis': 'Déficit de vitamina B12 con VCM de 112 fL: hay ___.',
  't-anisocitosis': 'Frotis con glóbulos rojos de tamaños muy distintos y RDW alto: hay ___.',
  't-acidemia': 'Gasometría con pH de 7,18: hay ___.',
  't-alcalemia': 'Gasometría con pH de 7,55: hay ___.',
  't-cetonuria': 'Diabético tipo 1 con cuerpos cetónicos en la orina: tiene ___.',
  't-mioglobinuria': 'Paciente con rabdomiólisis por aplastamiento y orina color té: tiene ___.',
  // Procedimientos
  't-apendicectomia': 'Paciente con apendicitis aguda: el tratamiento es la ___.',
  't-colecistectomia': 'Paciente con colecistitis por cálculos: se le extirpa la vesícula con una ___.',
  't-histerectomia': 'Mujer con miomas que sangran mucho y que no desea más hijos: se le hace una ___.',
  't-mastectomia': 'Paciente con cáncer de mama extenso al que se le extirpa la mama: se le hace una ___.',
  't-tiroidectomia': 'Paciente con carcinoma papilar de tiroides: se le hace una ___.',
  't-laparotomia': 'Paciente con abdomen agudo por perforación: se abre la pared abdominal con una ___.',
  't-traqueostomia': 'Paciente con intubación prolongada: se abre la tráquea al exterior con una ___.',
  't-colostomia': 'Paciente con cáncer de recto: se saca el colon a la pared abdominal con una ___.',
  't-colonoscopia': 'Adulto de 50 años para tamizaje de cáncer colorrectal: se le indica una ___.',
  't-broncoscopia': 'Niño con un cuerpo extraño en el bronquio: se extrae mediante ___.',
  't-electrocardiograma': 'Paciente con dolor torácico: en los primeros 10 minutos se hace un ___.',
  't-ecocardiograma': 'Paciente con un soplo nuevo: para ver las válvulas con ultrasonido se pide un ___.',
  't-toracocentesis': 'Paciente con derrame pleural: se punciona el tórax para sacar el líquido con una ___.',
  't-paracentesis': 'Paciente cirrótico con ascitis a tensión: se drena el líquido abdominal con una ___.',
  't-artrocentesis': 'Rodilla con sospecha de artritis séptica: se extrae líquido de la articulación con una ___.',
  't-amniocentesis': 'Embarazada de 16 semanas para estudiar el cariotipo fetal: se hace una ___.',
  't-biopsia': 'Nódulo de mama sospechoso: para el diagnóstico definitivo se toma una ___.',
  't-herniorrafia': 'Hernia inguinal reparada suturando la pared: se hizo una ___.',
  't-orquidopexia': 'Niño con un testículo no descendido: se fija en el escroto con una ___.',
  't-litotripsia': 'Cálculo renal de 8 mm que se rompe con ondas de choque: es una ___.',
  't-angioplastia': 'Paciente con infarto al que se le abre la coronaria con balón y stent: se le hace una ___.',
  't-colposcopia': 'Mujer con un Papanicolaou anormal: el siguiente paso es la ___.',
  't-mamografia': 'Mujer de 45 años para tamizaje de cáncer de mama: se le indica una ___.',
  't-episiotomia': 'Parto con el periné muy tenso: se hace un corte controlado del periné, una ___.',
  't-cesarea': 'Embarazada con placenta previa total: el parto debe ser por ___.',
  't-espirometria': 'Fumador en estudio por EPOC: se mide el flujo de aire con una ___.',
  't-electroencefalograma': 'Niño con convulsiones: para registrar la actividad eléctrica del cerebro se pide un ___.',
  't-ecografia': 'Embarazada en el primer trimestre: para ver el embrión con ultrasonido se hace una ___.',
  // Posición y movimiento
  't-anterior': 'El esternón está en la cara ___ del tórax.',
  't-posterior': 'Las vértebras dorsales están en la cara ___ del tórax.',
  't-medial': 'El dedo gordo está en el borde ___ del pie.',
  't-lateral': 'El maléolo del peroné está en el lado ___ del tobillo.',
  't-proximal': 'Fractura del húmero cerca del hombro: es del extremo ___.',
  't-distal': 'Fractura del radio cerca de la muñeca (de Colles): es del extremo ___.',
  't-ipsilateral': 'La parálisis del III par craneal derecho hace caer el párpado del ojo derecho: el hallazgo es ___.',
  't-contralateral': 'Un ACV del hemisferio izquierdo debilita el lado derecho del cuerpo: la debilidad es ___.',
  't-bilateral': 'Neumonía que afecta a los dos pulmones: es ___.',
  't-decubito-supino': 'Para la reanimación cardiopulmonar el paciente se coloca boca arriba, en ___.',
  't-decubito-prono': 'Paciente con SDRA grave al que se ventila boca abajo: está en ___.',
  't-abduccion': 'Separar el brazo del cuerpo hacia el lado es una ___.',
  't-aduccion': 'Acercar el brazo al costado del cuerpo es una ___.',
  't-flexion': 'Doblar el codo para llevar la mano al hombro es una ___.',
  't-extension': 'Estirar por completo la rodilla es una ___.',
  't-pronacion': 'Girar el antebrazo hasta que la palma mire hacia abajo es una ___.',
  't-supinacion': 'Girar el antebrazo hasta que la palma mire hacia arriba, como para sostener un plato de sopa, es una ___.',
  // Siglas
  'sigla-iam': 'Dolor torácico opresivo con elevación del ST y troponina positiva: es un ___.',
  'sigla-hta': 'Adulto con 160/100 mmHg en varias tomas distintas: tiene ___.',
  'sigla-icc': 'Paciente con disnea, edema de piernas, ingurgitación yugular y fracción de eyección baja: tiene ___.',
  'sigla-fa': 'ECG con ritmo irregularmente irregular y sin ondas P: hay ___.',
  'sigla-tvp': 'Pierna izquierda hinchada, caliente y dolorosa después de un viaje largo: sospechas una ___.',
  'sigla-tep': 'Paciente operado de cadera con disnea súbita, taquicardia y dímero D alto: sospechas un ___.',
  'sigla-epoc': 'Fumador de 40 paquetes-año con tos crónica y VEF1/CVF menor de 0,7: tiene ___.',
  'sigla-sdra': 'Paciente con sepsis, hipoxemia grave e infiltrados en ambos pulmones sin falla cardiaca: tiene ___.',
  'sigla-erc': 'Diabético con filtrado de 35 mL/min durante más de 3 meses: tiene ___.',
  'sigla-lra': 'Paciente deshidratado cuya creatinina sube de 0,9 a 2,1 mg/dL en 48 horas: tiene ___.',
  'sigla-itu': 'Mujer con ardor al orinar y urocultivo positivo para E. coli: tiene una ___.',
  'sigla-tfg': 'La creatinina sirve para estimar la ___, que mide cuánto filtran los riñones.',
  'sigla-acv': 'Paciente con la boca desviada y debilidad de un lado del cuerpo de inicio súbito: tiene un ___.',
  'sigla-hsa': 'Paciente con «el peor dolor de cabeza de su vida» de inicio súbito y sangre alrededor del cerebro: tiene una ___.',
  'sigla-hda': 'Paciente con hematemesis y melena: tiene una ___.',
  'sigla-erge': 'Paciente con ardor retroesternal y regurgitación ácida dos veces por semana: tiene ___.',
  'sigla-dm2': 'Adulto obeso con HbA1c de 8 %: tiene ___.',
  'sigla-cad': 'Diabético tipo 1 con glucosa de 450 mg/dL, pH de 7,1 y cetonas positivas: tiene ___.',
  'sigla-app': 'En la historia clínica, las enfermedades que el paciente ya tenía se anotan en los ___.',
  'sigla-ta': 'La medición de 120/80 mmHg es la ___.',
  'sigla-fc': 'Los latidos por minuto que cuentas en el pulso radial son la ___.',
  'sigla-fr': 'Las veces que respira el paciente en un minuto son la ___.',
  'sigla-spo2': 'El sensor que se pone en el dedo mide la ___.',
  'sigla-imc': 'El peso en kilos dividido entre la talla en metros al cuadrado es el ___.',
  'sigla-vo': 'La amoxicilina en cápsulas se toma por ___.',
}

for (const [a, b] of OPPOSITES) {
  const x = ITEMS.find((i) => i.id === a)
  const y = ITEMS.find((i) => i.id === b)
  if (x && y) {
    x.opposite = b
    y.opposite = a
  }
}
for (const i of ITEMS) if (CONTEXTS[i.id]) i.context = CONTEXTS[i.id]

const CONFUSES = new Map<string, Set<string>>()
for (const group of CONFUSABLE)
  for (const id of group) {
    const set = CONFUSES.get(id) ?? new Set<string>()
    for (const other of group) if (other !== id) set.add(other)
    CONFUSES.set(id, set)
  }
/** ¿Se pueden confundir de verdad (una sería también correcta en lugar de la otra)? */
export const confusable = (a: string, b: string) => CONFUSES.get(a)?.has(b) ?? false

/** Para las pruebas: pares y casos que apuntan a términos que no existen. */
export const LINGO_REFS = { opposites: OPPOSITES, contexts: Object.keys(CONTEXTS), confusable: CONFUSABLE.flat() }

export const LINGO_ITEMS: LingoItem[] = ITEMS
export const LINGO_BY_ID = new Map(ITEMS.map((i) => [i.id, i]))
export const LINGO_LESSONS = LINGO_UNITS.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u })))
export const lessonById = (id: string) => LINGO_LESSONS.find((l) => l.id === id)

export const KIND_LABEL: Record<LingoKind, string> = { prefijo: 'Prefijo', sufijo: 'Sufijo', raíz: 'Raíz', término: 'Término', sigla: 'Sigla' }
