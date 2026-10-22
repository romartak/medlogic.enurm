/**
 * Contenido de «Terminología»: aprender el vocabulario médico por partes, al estilo Duolingo.
 * Cada término compuesto lleva sus partes (raíz, prefijo, sufijo) para poder construirlo pieza a pieza;
 * al unir el texto de las partes se obtiene exactamente el término.
 */
export type LingoKind = 'prefijo' | 'sufijo' | 'raíz' | 'término'

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
function m(kind: Exclude<LingoKind, 'término'>, term: string, meaning: string, example: string): string {
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
    ],
  },
]

export const LINGO_ITEMS: LingoItem[] = ITEMS
export const LINGO_BY_ID = new Map(ITEMS.map((i) => [i.id, i]))
export const LINGO_LESSONS = LINGO_UNITS.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u })))
export const lessonById = (id: string) => LINGO_LESSONS.find((l) => l.id === id)

export const KIND_LABEL: Record<LingoKind, string> = { prefijo: 'Prefijo', sufijo: 'Sufijo', raíz: 'Raíz', término: 'Término' }
