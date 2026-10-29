import type { GuideSection, QuizItem } from '@/types'

/**
 * Atención inicial del politraumatizado (enfoque ATLS). Resumen educativo propio: los protocolos completos
 * están en el manual ATLS del American College of Surgeons; verifica dosis y flujos con tu institución.
 */

export interface AbcdeStep {
  letter: string
  name: string
  assess: string[]
  act: string[]
  /** Lo que no puede pasar desapercibido en este paso. */
  killers?: string
}

/** Revisión primaria: se evalúa y se trata en el mismo paso, en este orden. */
export const XABCDE: AbcdeStep[] = [
  {
    letter: 'X',
    name: 'Hemorragia externa exanguinante',
    assess: ['Sangrado arterial a chorro o que empapa rápido los apósitos, sobre todo en extremidades, cuello, axila o ingle.'],
    act: ['Presión directa firme.', 'Torniquete proximal en la extremidad si la presión no basta (anota la hora).', 'Empaquetamiento con gasa hemostática en heridas de unión (ingle, axila, cuello).'],
    killers: 'Desde la 11.ª edición del ATLS (2025) el control de la hemorragia externa masiva va antes de la vía aérea: un paciente puede desangrarse en minutos.',
  },
  {
    letter: 'A',
    name: 'Vía aérea con restricción del movimiento de la columna cervical',
    assess: ['¿Habla con voz normal? Si responde con claridad, la vía aérea está permeable por ahora.', 'Busca estridor, ronquera, sangre, vómito, dientes o cuerpos extraños, fracturas faciales o del cuello y quemaduras de la vía aérea.'],
    act: [
      'Elevación del mentón o tracción mandibular, sin hiperextender el cuello; aspiración.',
      'Cánula orofaríngea solo si no tiene reflejo nauseoso; nasofaríngea si lo tiene y no hay sospecha de fractura de base de cráneo.',
      'Vía aérea definitiva (tubo con balón en la tráquea) si hay GCS ≤ 8, apnea, imposibilidad de mantener la vía aérea, riesgo de aspiración, quemadura de la vía aérea o hipoxia que no mejora.',
      'Si no se puede intubar ni oxigenar: cricotiroidotomía quirúrgica (en menores de unos 12 años, con aguja).',
      'Mantén la alineación manual de la columna mientras se manipula la vía aérea.',
    ],
  },
  {
    letter: 'B',
    name: 'Respiración y ventilación',
    assess: ['Expón el tórax: frecuencia, simetría, heridas, movimiento paradójico.', 'Ausculta, percute y palpa la tráquea; mira las yugulares. Oximetría y capnografía.'],
    act: ['Oxígeno a alto flujo.', 'Descompresión inmediata si hay neumotórax a tensión; apósito en tres lados si el neumotórax es abierto; tubo de tórax para hemotórax y neumotórax.'],
    killers: 'Neumotórax a tensión, neumotórax abierto, hemotórax masivo y tórax inestable con contusión pulmonar se reconocen y tratan aquí, sin esperar la radiografía.',
  },
  {
    letter: 'C',
    name: 'Circulación con control de la hemorragia',
    assess: [
      'Estado de conciencia, color y temperatura de la piel, pulso (frecuencia y calidad), llenado capilar y presión arterial.',
      'Busca la fuente: «en el suelo y cuatro más»: externa, tórax, abdomen, pelvis y huesos largos.',
    ],
    act: [
      'Dos vías periféricas cortas y de gran calibre (14–16 G); si no se logran, vía intraósea.',
      'Muestras: tipo y cruce, hemograma, gases con lactato y déficit de bases, β-hCG en mujeres en edad fértil.',
      'Bolo inicial de 1 L de cristaloide tibio en el adulto (20 mL/kg en el niño) y pasa pronto a sangre: reanimación equilibrada 1:1:1 (plasma, plaquetas, glóbulos rojos) si hay hemorragia mayor.',
      'Ácido tranexámico en las primeras 3 horas: 1 g IV en 10 min y 1 g en las 8 h siguientes.',
      'Faja o sábana pélvica a la altura de los trocánteres mayores si se sospecha fractura de pelvis.',
      'Control definitivo del sangrado: quirófano, angioembolización o empaquetamiento.',
    ],
    killers: 'En trauma, la hipotensión es hemorrágica hasta demostrar lo contrario. La taquicardia es el signo temprano; la hipotensión es tardía.',
  },
  {
    letter: 'D',
    name: 'Déficit neurológico',
    assess: ['Escala de Glasgow (con su mejor respuesta motora), tamaño y reacción de las pupilas, signos de lateralización y nivel de lesión medular.', 'Glucemia capilar: la hipoglucemia y las drogas también alteran la conciencia.'],
    act: ['Evita la lesión secundaria: corrige la hipoxia y la hipotensión.', 'Consulta temprana a neurocirugía si hay GCS bajo o lateralización.'],
  },
  {
    letter: 'E',
    name: 'Exposición y control del ambiente',
    assess: ['Desviste por completo y revisa todo el cuerpo, incluida la espalda, con giro en bloque («log roll»).'],
    act: ['Previene la hipotermia: mantas térmicas, sala caliente y líquidos tibios.', 'La hipotermia, la acidosis y la coagulopatía forman la «tríada letal» del trauma.'],
  },
]

/** Clases de shock hemorrágico (adulto de 70 kg). */
export const SHOCK_CLASSES = {
  head: ['Parámetro', 'Clase I', 'Clase II', 'Clase III', 'Clase IV'],
  rows: [
    ['Sangre perdida', '< 15 % (< 750 mL)', '15–30 % (750–1500 mL)', '31–40 % (1500–2000 mL)', '> 40 % (> 2000 mL)'],
    ['Frecuencia cardíaca (cifras clásicas)', '< 100', '100–120', '120–140', '> 140'],
    ['Presión arterial', 'Normal', 'Normal', 'Normal o baja', 'Baja'],
    ['Presión de pulso', 'Normal', 'Disminuida', 'Disminuida', 'Disminuida'],
    ['Frecuencia respiratoria', 'Normal', 'Normal', 'Normal o aumentada', 'Aumentada'],
    ['Diuresis', 'Normal', 'Normal', 'Disminuida', 'Muy disminuida'],
    ['Estado mental', 'Normal o algo ansioso', 'Ansioso', 'Ansioso o confuso', 'Confuso o letárgico'],
    ['Déficit de bases', '0 a −2', '−2 a −6', '−6 a −10', '−10 o menos'],
    ['¿Sangre?', 'Vigilar', 'Posible', 'Sí', 'Protocolo de transfusión masiva'],
  ],
}

export const ATLS_SECTIONS: GuideSection[] = [
  {
    heading: 'Principios',
    bullets: [
      'Trata primero lo que mata primero: la obstrucción de la vía aérea mata antes que la falta de ventilación, y esta antes que la hemorragia… salvo la hemorragia externa masiva, que se controla de entrada.',
      'No necesitas un diagnóstico definitivo para empezar a tratar, ni una historia detallada para evaluar.',
      'Revisión primaria (xABCDE) con reanimación simultánea → adjuntos (monitor, sonda urinaria y gástrica, gases, radiografías de tórax y pelvis, eFAST) → revisión secundaria → traslado o tratamiento definitivo.',
      'Reevalúa siempre: ante cualquier deterioro, vuelve a empezar por X y A.',
    ],
  },
  {
    heading: 'Triaje con múltiples víctimas (START)',
    table: {
      head: ['Hallazgo', 'Color', 'Prioridad'],
      rows: [
        ['Camina', 'Verde', 'Puede esperar'],
        ['No respira aunque se abra la vía aérea', 'Negro', 'Fallecido o expectante'],
        ['Respira tras abrir la vía aérea, o FR > 30, o llenado capilar > 2 s / sin pulso radial, o no obedece órdenes', 'Rojo', 'Inmediata'],
        ['Ninguno de los anteriores', 'Amarillo', 'Diferida'],
      ],
    },
    pearl: 'En el triaje solo se hacen dos intervenciones: abrir la vía aérea y controlar una hemorragia externa.',
  },
  {
    heading: 'Adjuntos de la revisión primaria',
    bullets: [
      'Monitor cardíaco, oximetría, capnografía y presión arterial.',
      'Sonda urinaria para medir la diuresis (meta en el adulto ≥ 0,5 mL/kg/h; en el niño ≥ 1 mL/kg/h).',
      'Sonda gástrica para descomprimir el estómago; por la boca si se sospecha fractura de la base del cráneo.',
      'Radiografías de tórax y pelvis anteroposteriores en la sala de reanimación.',
      'eFAST: busca líquido libre en pericardio, espacio hepatorrenal (Morison), esplenorrenal y pelvis, y neumotórax en ambos hemitórax.',
    ],
    warning: 'No pases la sonda urinaria si hay sangre en el meato, hematoma perineal o próstata alta al tacto: sospecha rotura de uretra y pide primero una uretrografía retrógrada.',
  },
  {
    heading: 'Revisión secundaria',
    bullets: [
      'Empieza solo cuando terminó la primaria y el paciente responde a la reanimación.',
      'Historia AMPLE: Alergias, Medicamentos, Patologías previas (y embarazo), Libaciones y última comida, Eventos y ambiente del trauma.',
      'Examen completo de la cabeza a los pies, incluidos tacto rectal y vaginal cuando estén indicados.',
      'Revisión terciaria a las 24 h: es cuando se encuentran muchas lesiones que pasaron inadvertidas.',
    ],
  },
  {
    heading: 'Shock hemorrágico',
    body: 'La clasificación orienta, pero no esperes la hipotensión para actuar: el organismo compensa hasta perder cerca del 30 % de la volemia.',
    table: SHOCK_CLASSES,
    bullets: [
      'Respuesta al bolo inicial: rápida (estable, probablemente dejó de sangrar), transitoria (sigue sangrando: sangre y control quirúrgico) o mínima/nula (sangrado activo grave o shock no hemorrágico: quirófano ya).',
      'Hipotensión permisiva hasta controlar el sangrado: presión sistólica de 80–90 mmHg si no hay TCE; con TCE grave, presión arterial media ≥ 80 mmHg.',
      'Evita grandes volúmenes de cristaloide: diluyen los factores de coagulación y empeoran la acidosis y la hipotermia.',
      'Shock no hemorrágico en trauma: neumotórax a tensión, taponamiento cardíaco, shock neurogénico y contusión miocárdica.',
    ],
    pearl: 'Índice de shock = FC ÷ PAS. Un valor > 1 sugiere hemorragia importante aunque la presión todavía sea «normal».',
  },
  {
    heading: 'Tórax: las lesiones que matan en minutos',
    table: {
      head: ['Lesión', 'Cómo se reconoce', 'Qué haces'],
      rows: [
        ['Neumotórax a tensión', 'Dificultad respiratoria, hipotensión, ausencia de murmullo, hiperresonancia, yugulares ingurgitadas y desviación traqueal (tardía)', 'Descompresión inmediata, sin radiografía: aguja en el 4.º–5.º espacio intercostal, línea axilar media (adulto) y luego tubo de tórax'],
        ['Neumotórax abierto', 'Herida que «sopla» al respirar', 'Apósito oclusivo pegado en tres lados y tubo de tórax lejos de la herida'],
        ['Hemotórax masivo', 'Shock, murmullo ausente y matidez; ≥ 1500 mL al colocar el tubo', 'Volumen y sangre; toracotomía si drena ≥ 1500 mL de inmediato o > 200 mL/h por 2–4 h'],
        ['Tórax inestable', '≥ 2 costillas contiguas fracturadas en ≥ 2 sitios; movimiento paradójico', 'Oxígeno, analgesia potente y ventilación si hace falta: lo grave es la contusión pulmonar debajo'],
        ['Taponamiento cardíaco', 'Tríada de Beck (hipotensión, ingurgitación yugular, ruidos apagados); eFAST con líquido pericárdico', 'Toracotomía o ventana pericárdica; pericardiocentesis solo como puente'],
      ],
    },
    bullets: [
      'Lesiones potencialmente letales de la revisión secundaria: contusión pulmonar, contusión miocárdica, rotura traumática de la aorta (mediastino ensanchado), rotura diafragmática (más a menudo izquierda) y lesión esofágica.',
      'En niños la descompresión con aguja se hace en el 2.º espacio intercostal, línea medioclavicular.',
    ],
  },
  {
    heading: 'Abdomen y pelvis',
    bullets: [
      'Trauma cerrado: el bazo es el órgano que más se lesiona, seguido del hígado.',
      'Herida por arma blanca: el hígado es el más afectado; por arma de fuego, el intestino delgado.',
      'Inestable con eFAST positivo → laparotomía. Estable → tomografía con contraste.',
      'Peritonitis, evisceración o herida por arma de fuego que penetra el peritoneo → laparotomía.',
      'Signo del cinturón de seguridad: piensa en lesión de víscera hueca y en fractura de Chance (lumbar).',
      'Fractura de pelvis en libro abierto: faja pélvica; si sigue inestable, angioembolización, empaquetamiento preperitoneal o fijación externa.',
    ],
  },
  {
    heading: 'Traumatismo craneoencefálico',
    table: {
      head: ['Gravedad', 'Glasgow'],
      rows: [
        ['Leve', '13–15'],
        ['Moderado', '9–12'],
        ['Grave', '3–8 (vía aérea definitiva)'],
      ],
    },
    bullets: [
      'El objetivo es evitar la lesión secundaria: un solo episodio de hipoxia (SpO₂ < 90 %) o de hipotensión aumenta la mortalidad.',
      'Hematoma epidural: arteria meníngea media, lente biconvexa en la TC e intervalo lúcido clásico.',
      'Hematoma subdural: venas puente, forma de media luna; ancianos, alcohólicos y anticoagulados.',
      'Herniación: pupila dilatada (del mismo lado de la lesión) y hemiparesia contralateral. Tríada de Cushing: hipertensión, bradicardia y respiración irregular.',
      'Hipertensión intracraneal: cabecera a 30°, normocapnia (PaCO₂ 35–45 mmHg), sedación y manitol o salino hipertónico; hiperventilación breve solo como puente ante una herniación.',
      'Signos de fractura de la base del cráneo: ojos de mapache, signo de Battle (equimosis mastoidea), otorraquia o rinorraquia y hemotímpano.',
    ],
    pearl: 'Los corticoides no se usan en el TCE: aumentaron la mortalidad en el ensayo CRASH.',
  },
  {
    heading: 'Columna y médula espinal',
    bullets: [
      'Restricción del movimiento de la columna (no necesariamente tabla rígida) hasta descartar lesión.',
      'Criterios NEXUS: no necesita imagen cervical si no hay dolor en la línea media, ni déficit focal, ni alteración de la conciencia, ni intoxicación, ni lesión dolorosa que distraiga.',
      'Shock neurogénico: hipotensión con bradicardia y piel caliente, por lesión por encima de T6 (pérdida del tono simpático). Shock medular: flacidez y arreflexia transitorias, no es un estado hemodinámico.',
      'Síndrome centromedular: hiperextensión en ancianos; afecta más los brazos que las piernas.',
      'Síndrome medular anterior: pérdida motora y de dolor y temperatura; se conserva la propiocepción.',
      'Brown-Séquard: pérdida motora y de propiocepción del mismo lado, y de dolor y temperatura del lado contrario.',
    ],
    warning: 'Antes de atribuir la hipotensión a un shock neurogénico, descarta la hemorragia.',
  },
  {
    heading: 'Extremidades',
    bullets: [
      'Fractura expuesta: antibiótico IV lo antes posible (cefazolina; se añade cobertura para gramnegativos en las heridas extensas o contaminadas), profilaxis antitetánica, inmovilización, lavado y desbridamiento quirúrgico.',
      'Síndrome compartimental: dolor desproporcionado y dolor al estirar pasivamente los músculos son los signos tempranos; la falta de pulso es tardía. Tratamiento: fasciotomía.',
      'Luxación de rodilla: evalúa siempre la arteria poplítea (índice tobillo-brazo < 0,9 → estudio vascular).',
      'Aplastamiento: rabdomiólisis, hiperpotasemia e insuficiencia renal; hidratación generosa.',
    ],
  },
  {
    heading: 'Quemaduras',
    bullets: [
      'Sospecha lesión de la vía aérea si hay quemaduras faciales, vibrisas chamuscadas, esputo carbonáceo, ronquera o estridor, o si estuvo en un espacio cerrado: intubación temprana.',
      'Intoxicación por monóxido de carbono: la oximetría de pulso puede salir normal. Oxígeno al 100 % y carboxihemoglobina.',
      'Regla de los 9 en el adulto: cabeza 9 %, cada brazo 9 %, tórax y abdomen 18 %, espalda 18 %, cada pierna 18 %, periné 1 %. La palma del paciente equivale a cerca del 1 %.',
      'Fórmula de Parkland: 4 mL × kg × % de superficie quemada (solo segundo y tercer grado) de lactato de Ringer en 24 h; la mitad en las primeras 8 h desde la quemadura. El ATLS actual empieza con 2 mL × kg × % en el adulto y ajusta con la diuresis (≥ 0,5 mL/kg/h).',
      'Quemadura eléctrica: más volumen (diuresis de 1–1,5 mL/kg/h) por la rabdomiólisis; ECG.',
      'Quemaduras circunferenciales de tórax o extremidades: escarotomía si comprometen la ventilación o la circulación.',
    ],
    pearl: 'Las quemaduras de primer grado (solo eritema) no cuentan para la superficie quemada.',
  },
  {
    heading: 'Poblaciones especiales',
    bullets: [
      'Embarazo: reanima a la madre para salvar al feto. Desde las 20 semanas desplaza el útero a la izquierda (o inclina la tabla 15–30°). La hipervolemia del embarazo oculta el shock hasta pérdidas del 30–35 %. Madre Rh negativa: inmunoglobulina anti-D.',
      'Niños: presión sistólica mínima esperada = 70 + 2 × edad en años. Bolo de 20 mL/kg y luego sangre (10–20 mL/kg). Vía intraósea si no hay acceso. Se enfrían rápido. Piensa en maltrato si la historia no cuadra.',
      'Adultos mayores: los betabloqueadores ocultan la taquicardia, los anticoagulantes agravan el sangrado y un TCE con mecanismo leve puede ser grave. Una presión «normal» puede ser hipotensión para ellos.',
    ],
  },
  {
    heading: 'Paro cardíaco traumático',
    bullets: [
      'Trata las causas reversibles: hipoxia, hipovolemia, neumotórax a tensión y taponamiento.',
      'Descompresión bilateral del tórax, volumen y sangre, y control de la hemorragia tienen prioridad sobre las compresiones.',
      'La toracotomía de reanimación ofrece más beneficio en heridas penetrantes del tórax con signos de vida recientes.',
    ],
  },
]

export const ATLS_REFERENCES = [
  'American College of Surgeons. Advanced Trauma Life Support (ATLS), Student Course Manual, 10.ª ed. (2018) y 11.ª ed. (2025).',
  'Rossaint R, et al. The European guideline on management of major bleeding and coagulopathy following trauma, 6.ª ed. Crit Care. 2023;27:80.',
  'CRASH-2 Collaborators. Effects of tranexamic acid on death, vascular occlusive events, and blood transfusion in trauma patients. Lancet. 2010;376:23–32.',
  'Carney N, et al. Guidelines for the Management of Severe Traumatic Brain Injury, 4.ª ed. Brain Trauma Foundation. Neurosurgery. 2017;80:6–15.',
  'Hoffman JR, et al. Validity of a set of clinical criteria to rule out injury to the cervical spine (NEXUS). N Engl J Med. 2000;343:94–99.',
]

export const ATLS_QUIZ: QuizItem[] = [
  { q: 'Según el ATLS de 2025, ¿qué se atiende antes que la vía aérea?', options: ['La hemorragia externa exanguinante', 'La escala de Glasgow', 'La radiografía de columna cervical', 'La glucemia capilar'], answer: 0, why: 'El xABCDE pone primero el control de la hemorragia externa masiva (presión directa, torniquete): mata en minutos.' },
  { q: 'Paciente con disnea, hipotensión, ausencia de murmullo e hiperresonancia en el hemitórax derecho. ¿Qué haces?', options: ['Radiografía de tórax urgente', 'Descompresión inmediata con aguja', 'Tomografía de tórax', 'Intubar y esperar'], answer: 1, why: 'El neumotórax a tensión es un diagnóstico clínico: se descomprime sin esperar imágenes y luego se coloca un tubo de tórax.' },
  { q: 'Pérdida estimada de 1500–2000 mL, FC 130, presión que empieza a bajar y paciente confuso. ¿Qué clase de shock es?', options: ['Clase I', 'Clase II', 'Clase III', 'Clase IV'], answer: 2, why: 'Clase III: 31–40 % de la volemia, FC 120–140, la presión puede bajar y hay alteración mental. Necesita sangre.' },
  { q: '¿Cuál es el primer signo de shock hemorrágico que suele aparecer?', options: ['Hipotensión', 'Taquicardia', 'Anuria', 'Coma'], answer: 1, why: 'La taquicardia (y la presión de pulso estrecha) aparece primero; la hipotensión es tardía, cuando ya se perdió cerca del 30 %.' },
  { q: '¿Cuándo debe darse el ácido tranexámico en el trauma con sangrado?', options: ['Dentro de las primeras 3 horas', 'Solo después de 6 horas', 'Únicamente en el quirófano', 'Nunca en trauma'], answer: 0, why: 'CRASH-2: 1 g IV en 10 minutos y 1 g en 8 horas, dentro de las 3 primeras horas. Después de ese plazo no beneficia.' },
  { q: 'Tríada de Beck:', options: ['Hipertensión, bradicardia y respiración irregular', 'Hipotensión, ingurgitación yugular y ruidos cardíacos apagados', 'Fiebre, ictericia y dolor abdominal', 'Hipoxia, petequias y confusión'], answer: 1, why: 'Es la del taponamiento cardíaco. La otra (hipertensión, bradicardia, respiración irregular) es la tríada de Cushing.' },
  { q: 'Hombre con sangre en el meato uretral tras fractura de pelvis. ¿Qué debes hacer antes de la sonda urinaria?', options: ['Nada, pasar la sonda con cuidado', 'Uretrografía retrógrada', 'Cistoscopia', 'Sonda de mayor calibre'], answer: 1, why: 'La sangre en el meato sugiere rotura de uretra: la sonda puede completar la lesión. Primero uretrografía retrógrada.' },
  { q: 'Lucidez breve tras un golpe temporal y luego deterioro rápido; la TC muestra una lesión biconvexa. ¿Qué vaso se lesionó?', options: ['Venas puente', 'Arteria meníngea media', 'Arteria cerebral media', 'Seno sagital'], answer: 1, why: 'Hematoma epidural: arteria meníngea media, lente biconvexa e intervalo lúcido.' },
  { q: 'Hipotensión con bradicardia y piel caliente tras una lesión cervical. ¿Qué tipo de shock es?', options: ['Hemorrágico', 'Neurogénico', 'Séptico', 'Cardiogénico'], answer: 1, why: 'La pérdida del tono simpático (lesión por encima de T6) da vasodilatación con bradicardia. Aun así, descarta primero la hemorragia.' },
  { q: 'Adulto de 70 kg con 40 % de superficie quemada de segundo y tercer grado. Según Parkland, ¿cuánto pasas en las primeras 8 h?', options: ['2800 mL', '5600 mL', '11 200 mL', '1400 mL'], answer: 1, why: '4 × 70 × 40 = 11 200 mL en 24 h; la mitad (5600 mL) en las primeras 8 h desde la quemadura.' },
  { q: 'Glasgow de 7 tras un TCE. ¿Qué necesita?', options: ['Observación', 'Vía aérea definitiva', 'Alta con indicaciones', 'Solo oxígeno por cánula nasal'], answer: 1, why: 'GCS ≤ 8 es TCE grave e indicación de intubación para proteger la vía aérea y evitar hipoxia.' },
  { q: 'Embarazada de 32 semanas en la tabla espinal, hipotensa. ¿Qué maniobra ayuda de inmediato?', options: ['Trendelenburg', 'Desplazar el útero a la izquierda', 'Elevar las piernas a 90°', 'Sentarla'], answer: 1, why: 'El útero comprime la cava en decúbito supino. Desde las 20 semanas se desplaza manualmente a la izquierda o se inclina la tabla 15–30°.' },
  { q: 'Dolor desproporcionado en la pierna fracturada, que aumenta al estirar los dedos pasivamente. ¿Qué sospechas?', options: ['Trombosis venosa', 'Síndrome compartimental', 'Embolia grasa', 'Lesión nerviosa aislada'], answer: 1, why: 'El dolor al estiramiento pasivo es el signo temprano del síndrome compartimental. La falta de pulso es tardía. Tratamiento: fasciotomía.' },
  { q: '¿Qué presión sistólica mínima esperas en un niño de 6 años?', options: ['70 mmHg', '82 mmHg', '90 mmHg', '100 mmHg'], answer: 1, why: '70 + 2 × edad = 70 + 12 = 82 mmHg. Por debajo, el niño está hipotenso.' },
]
