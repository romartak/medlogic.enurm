import type { GuideSection } from '@/types'

/**
 * Semiología por sistemas: cómo explorar bien y qué significa cada signo. Resumen educativo propio basado en
 * textos clásicos de semiología (Bates, Surós, Argente-Álvarez) y en la evidencia de McGee.
 */

export interface Sign {
  name: string
  /** Cómo se busca o en qué consiste. */
  how: string
  /** Lo que sugiere, en pocas palabras (se usa también como opción en la práctica). */
  means: string
}

export interface BodySystem {
  id: string
  name: string
  icon: string
  color: string
  tips: string[]
  signs: Sign[]
  /** Tablas y apartados extra del sistema. */
  sections?: GuideSection[]
}

export const SYSTEMS: BodySystem[] = [
  {
    id: 'general',
    name: 'General y signos vitales',
    icon: 'activity',
    color: '#0d9488',
    tips: [
      'Empieza por la inspección general desde la puerta: ¿se ve enfermo, tiene dificultad para respirar, está pálido, ictérico, sudoroso?',
      'Presión arterial: 5 minutos de reposo, brazo apoyado a la altura del corazón y un brazalete cuya vejiga rodee al menos el 80 % del brazo. Un brazalete pequeño da cifras falsamente altas.',
      'Mide la presión en ambos brazos la primera vez: una diferencia > 15–20 mmHg sugiere enfermedad arterial (o disección aórtica si hay dolor torácico).',
      'Cuenta la frecuencia respiratoria sin que el paciente lo note (mientras parece que tomas el pulso): es el signo vital que más se omite y uno de los que más predice deterioro.',
    ],
    signs: [
      { name: 'Hipotensión ortostática', how: 'Caída de ≥ 20 mmHg de la sistólica o ≥ 10 mmHg de la diastólica a los 3 minutos de ponerse de pie.', means: 'Hipovolemia o disfunción autonómica' },
      { name: 'Signo del pliegue', how: 'La piel pellizcada tarda en volver a su lugar.', means: 'Deshidratación (poco fiable en ancianos)' },
      { name: 'Llenado capilar lento', how: 'Tras presionar el lecho ungueal, el color tarda más de 2 segundos en volver.', means: 'Mala perfusión periférica (shock, deshidratación)' },
      { name: 'Acropaquia', how: 'Dedos en palillo de tambor: se pierde el ángulo entre la uña y el dedo.', means: 'Cáncer de pulmón, bronquiectasias, fibrosis o cardiopatía cianótica' },
      { name: 'Ictericia', how: 'Coloración amarilla que aparece primero en las escleras.', means: 'Bilirrubina > 2–3 mg/dL' },
    ],
    sections: [
      {
        heading: 'Signos vitales normales en el adulto',
        table: {
          head: ['Signo', 'Normal'],
          rows: [
            ['Frecuencia cardíaca', '60–100 lpm'],
            ['Frecuencia respiratoria', '12–20 rpm'],
            ['Presión arterial', '< 120/80 mmHg (óptima)'],
            ['Temperatura', '36,5–37,5 °C'],
            ['Saturación de oxígeno', '≥ 94 % (88–92 % en EPOC con retención de CO₂)'],
          ],
        },
      },
    ],
  },
  {
    id: 'cabeza-cuello',
    name: 'Cabeza, cuello, ojos y oídos',
    icon: 'eye',
    color: '#7c3aed',
    tips: [
      'Palpa la tiroides desde atrás con el cuello algo flexionado y pide al paciente que trague: la tiroides sube con la deglución.',
      'Describe toda adenopatía por tamaño, consistencia, dolor, movilidad y región. Las duras, fijas, indoloras y mayores de 1–1,5 cm son sospechosas, y la supraclavicular siempre lo es.',
      'Explora la mirada en H para los pares III, IV y VI, y las pupilas con luz directa y consensual.',
    ],
    signs: [
      { name: 'Ganglio de Virchow (signo de Troisier)', how: 'Adenopatía supraclavicular izquierda.', means: 'Cáncer abdominal, sobre todo gástrico' },
      { name: 'Weber lateralizado al oído enfermo', how: 'Diapasón en el vértice del cráneo: se oye más en el oído afectado.', means: 'Hipoacusia de conducción' },
      { name: 'Rinne negativo', how: 'El diapasón se oye mejor apoyado en la mastoides (vía ósea) que frente al oído (vía aérea).', means: 'Hipoacusia de conducción' },
      { name: 'Pupila de Argyll Robertson', how: 'Pupila pequeña que acomoda a la visión cercana pero no reacciona a la luz.', means: 'Neurosífilis' },
      { name: 'Defecto pupilar aferente (Marcus Gunn)', how: 'Al pasar la luz de un ojo al otro, la pupila del ojo enfermo se dilata.', means: 'Lesión del nervio óptico (neuritis óptica)' },
      { name: 'Síndrome de Horner', how: 'Ptosis leve, miosis y anhidrosis del mismo lado.', means: 'Lesión simpática: tumor de Pancoast, disección carotídea' },
      { name: 'Ojo «abajo y afuera» con midriasis', how: 'Ptosis, ojo desviado hacia abajo y afuera y pupila dilatada.', means: 'Parálisis del III par (aneurisma de la comunicante posterior)' },
      { name: 'Papiledema', how: 'Borde del disco óptico borrado y elevado en el fondo de ojo.', means: 'Hipertensión intracraneal' },
      { name: 'Signo de Chvostek', how: 'Golpear el nervio facial delante de la oreja contrae los músculos de la cara.', means: 'Hipocalcemia (poco específico)' },
      { name: 'Signo de Trousseau', how: 'Inflar el brazalete por encima de la sistólica 3 minutos produce espasmo carpal.', means: 'Hipocalcemia (más específico que Chvostek)' },
    ],
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    icon: 'heart-pulse',
    color: '#e11d48',
    tips: [
      'Mira la yugular con el paciente a 45°: la presión venosa es la altura de la columna sobre el ángulo esternal + 5 cm. Más de 3 cm sobre el ángulo es anormal.',
      'Palpa el choque de la punta: normal en el 5.º espacio intercostal, línea medioclavicular, del tamaño de una moneda.',
      'Ausculta los cuatro focos con el diafragma (sonidos agudos) y con la campana (graves: S3, S4 y el retumbo mitral). Pon al paciente en decúbito lateral izquierdo para la mitral y sentado inclinado hacia delante para la insuficiencia aórtica.',
      'Describe el soplo: momento (sístole o diástole), foco, irradiación, intensidad (I–VI) y cómo cambia con las maniobras.',
    ],
    signs: [
      { name: 'Ingurgitación yugular', how: 'Columna venosa > 3 cm sobre el ángulo esternal con el paciente a 45°.', means: 'Presión venosa alta: insuficiencia cardíaca derecha, sobrecarga, taponamiento' },
      { name: 'Reflujo hepatoyugular', how: 'Presionar el abdomen 10 s eleva la yugular y se mantiene.', means: 'Insuficiencia cardíaca' },
      { name: 'Signo de Kussmaul', how: 'La presión yugular sube en la inspiración (debería bajar).', means: 'Pericarditis constrictiva o fallo ventricular derecho grave' },
      { name: 'Pulso paradójico', how: 'La sistólica cae más de 10 mmHg en la inspiración.', means: 'Taponamiento cardíaco o asma grave' },
      { name: 'Pulso parvus et tardus', how: 'Pulso carotídeo débil y que tarda en llegar.', means: 'Estenosis aórtica grave' },
      { name: 'Pulso en martillo de agua (Corrigan)', how: 'Pulso amplio que sube y cae bruscamente; presión diferencial amplia.', means: 'Insuficiencia aórtica' },
      { name: 'Pulso alternante', how: 'Un latido fuerte y uno débil, con ritmo regular.', means: 'Disfunción grave del ventrículo izquierdo' },
      { name: 'Choque de punta desplazado', how: 'Latido apical lateral e inferior a la línea medioclavicular, y amplio.', means: 'Cardiomegalia (ventrículo izquierdo dilatado)' },
      { name: 'Tercer ruido (S3)', how: 'Galope protodiastólico grave, mejor con la campana en la punta.', means: 'Insuficiencia cardíaca con sobrecarga (normal en jóvenes y embarazadas)' },
      { name: 'Cuarto ruido (S4)', how: 'Ruido grave justo antes del S1.', means: 'Ventrículo rígido: hipertensión, estenosis aórtica, isquemia' },
      { name: 'Soplo sistólico aórtico irradiado al cuello', how: 'Soplo en diamante en el 2.º espacio derecho que se oye en las carótidas.', means: 'Estenosis aórtica' },
      { name: 'Soplo holosistólico apical a la axila', how: 'Soplo de intensidad constante en la punta que se irradia a la axila.', means: 'Insuficiencia mitral' },
      { name: 'Retumbo diastólico apical', how: 'Soplo grave en diástole, tras un chasquido de apertura, en decúbito lateral izquierdo.', means: 'Estenosis mitral' },
      { name: 'Soplo diastólico aspirativo', how: 'Soplo agudo y decreciente en el borde esternal izquierdo, sentado e inclinado hacia delante.', means: 'Insuficiencia aórtica' },
      { name: 'Soplo que aumenta con Valsalva o al ponerse de pie', how: 'La maniobra reduce el retorno venoso y el soplo sistólico crece.', means: 'Miocardiopatía hipertrófica obstructiva' },
      { name: 'Signo de Rivero-Carvallo', how: 'El soplo aumenta con la inspiración profunda.', means: 'Soplo de origen derecho (insuficiencia tricuspídea)' },
      { name: 'Frote pericárdico', how: 'Ruido rasposo, mejor sentado e inclinado hacia delante.', means: 'Pericarditis' },
      { name: 'Índice tobillo-brazo < 0,9', how: 'Sistólica del tobillo dividida entre la del brazo.', means: 'Enfermedad arterial periférica' },
      { name: 'Signo de Homans', how: 'Dolor en la pantorrilla al hacer dorsiflexión del pie.', means: 'Clásico de trombosis venosa, pero poco útil: usa Wells, dímero D y ecografía' },
    ],
  },
  {
    id: 'respiratorio',
    name: 'Respiratorio',
    icon: 'wind',
    color: '#0284c7',
    tips: [
      'Sigue el orden: inspección, palpación (expansión y vibraciones vocales), percusión y auscultación, comparando siempre un lado con el otro.',
      'Ausculta el murmullo vesicular en espalda, axilas y cara anterior, con el paciente respirando por la boca algo más profundo de lo normal.',
      'Cuenta la frecuencia respiratoria y mira el uso de músculos accesorios, el tiraje y si puede hablar en frases completas.',
    ],
    signs: [
      { name: 'Crepitantes finos «en velcro»', how: 'Chasquidos finos al final de la inspiración, en las bases.', means: 'Fibrosis pulmonar' },
      { name: 'Crepitantes húmedos bibasales', how: 'Chasquidos en ambas bases que no se aclaran al toser.', means: 'Edema pulmonar o neumonía' },
      { name: 'Sibilancias', how: 'Silbidos continuos, sobre todo espiratorios.', means: 'Obstrucción de la vía aérea pequeña: asma, EPOC' },
      { name: 'Estridor', how: 'Sonido agudo y fuerte en la inspiración, audible sin estetoscopio.', means: 'Obstrucción de la vía aérea alta: es una urgencia' },
      { name: 'Soplo tubárico', how: 'Respiración bronquial donde debería oírse murmullo vesicular.', means: 'Consolidación (neumonía)' },
      { name: 'Egofonía', how: 'Al decir «i» se oye «e» nasal sobre la zona afectada.', means: 'Consolidación o límite superior de un derrame' },
      { name: 'Respiración de Kussmaul', how: 'Respiración profunda y rápida, regular.', means: 'Acidosis metabólica (cetoacidosis diabética)' },
      { name: 'Respiración de Cheyne-Stokes', how: 'Ciclos que crecen y decrecen en amplitud, con pausas de apnea.', means: 'Insuficiencia cardíaca, ictus, altura' },
      { name: 'Respiración de Biot', how: 'Respiraciones irregulares con pausas de apnea impredecibles.', means: 'Lesión del tronco encefálico' },
      { name: 'Desviación traqueal hacia el lado sano', how: 'La tráquea se aleja del hemitórax afectado.', means: 'Neumotórax a tensión o derrame masivo' },
      { name: 'Desviación traqueal hacia el lado enfermo', how: 'La tráquea se acerca al hemitórax afectado.', means: 'Atelectasia' },
    ],
    sections: [
      {
        heading: 'Los cuatro síndromes que hay que saber',
        table: {
          head: ['Síndrome', 'Vibraciones vocales', 'Percusión', 'Auscultación'],
          rows: [
            ['Consolidación (neumonía)', 'Aumentadas', 'Mate', 'Soplo tubárico, crepitantes, egofonía'],
            ['Derrame pleural', 'Abolidas', 'Mate (curva de Damoiseau)', 'Murmullo abolido; soplo pleurítico en el borde superior'],
            ['Neumotórax', 'Abolidas', 'Hipertimpanismo', 'Murmullo abolido'],
            ['Atelectasia', 'Disminuidas o abolidas', 'Mate', 'Murmullo disminuido; tráquea hacia el lado afectado'],
            ['Enfisema (EPOC)', 'Disminuidas', 'Hiperresonante', 'Murmullo disminuido, espiración prolongada, sibilancias'],
          ],
        },
        pearl: 'Las vibraciones vocales separan la consolidación (aumentadas) del derrame (abolidas): ambos son mates a la percusión.',
      },
    ],
  },
  {
    id: 'abdomen',
    name: 'Abdomen',
    icon: 'target',
    color: '#ea580c',
    tips: [
      'En el abdomen el orden cambia: inspección, auscultación, percusión y palpación. Palpar antes de auscultar altera los ruidos.',
      'Empieza a palpar lejos de la zona del dolor, con las rodillas flexionadas y las manos tibias, primero superficial y luego profundo.',
      'Mide el hígado por percusión en la línea medioclavicular (normal 6–12 cm) en vez de fiarte solo del borde palpable.',
      'Todo dolor abdominal agudo merece examen de hernias, genitales y, si está indicado, tacto rectal.',
    ],
    signs: [
      { name: 'Signo de Murphy', how: 'Al palpar el hipocondrio derecho, el paciente detiene la inspiración por dolor.', means: 'Colecistitis aguda' },
      { name: 'Punto de McBurney', how: 'Dolor en la unión del tercio externo con los dos tercios internos de la línea ombligo–espina ilíaca anterosuperior derecha.', means: 'Apendicitis aguda' },
      { name: 'Signo de Blumberg', how: 'Dolor al soltar bruscamente la presión (rebote).', means: 'Irritación peritoneal' },
      { name: 'Signo de Rovsing', how: 'Dolor en la fosa ilíaca derecha al comprimir la izquierda.', means: 'Apendicitis aguda' },
      { name: 'Signo del psoas', how: 'Dolor al extender la cadera derecha (o al flexionarla contra resistencia).', means: 'Apendicitis retrocecal' },
      { name: 'Signo del obturador', how: 'Dolor al rotar internamente la cadera derecha flexionada.', means: 'Apendicitis pélvica' },
      { name: 'Signo de Cullen', how: 'Equimosis alrededor del ombligo.', means: 'Hemorragia retroperitoneal: pancreatitis grave, embarazo ectópico roto' },
      { name: 'Signo de Grey Turner', how: 'Equimosis en los flancos.', means: 'Hemorragia retroperitoneal: pancreatitis necrohemorrágica' },
      { name: 'Signo de Courvoisier-Terrier', how: 'Vesícula palpable y no dolorosa en un paciente con ictericia.', means: 'Cáncer de la cabeza del páncreas o periampular' },
      { name: 'Signo de Kehr', how: 'Dolor referido al hombro izquierdo.', means: 'Irritación del diafragma: rotura del bazo' },
      { name: 'Matidez cambiante', how: 'La matidez de los flancos se desplaza al cambiar de decúbito.', means: 'Ascitis (se detecta con unos 1500 mL)' },
      { name: 'Ruidos de lucha (metálicos)', how: 'Ruidos intestinales agudos, frecuentes y en ráfagas.', means: 'Obstrucción intestinal mecánica' },
      { name: 'Silencio abdominal', how: 'Sin ruidos intestinales tras auscultar 2–3 minutos.', means: 'Íleo paralítico o peritonitis' },
      { name: 'Signo de Giordano (puñopercusión)', how: 'Dolor al percutir la fosa renal con el puño.', means: 'Pielonefritis o cólico renal' },
    ],
  },
  {
    id: 'neurologico',
    name: 'Neurológico',
    icon: 'brain',
    color: '#4f46e5',
    tips: [
      'Sigue un orden fijo: estado mental, pares craneales, motor (tono, fuerza 0–5, reflejos), sensibilidad, coordinación y marcha, y signos meníngeos.',
      'Compara siempre derecha con izquierda: la asimetría es más importante que el valor absoluto de un reflejo.',
      'Decide primero si el problema es de primera o de segunda motoneurona, y luego busca el nivel de la lesión.',
    ],
    signs: [
      { name: 'Signo de Babinski', how: 'Al estimular la planta, el primer dedo se extiende y los demás se abren en abanico.', means: 'Lesión de primera motoneurona (normal hasta 1–2 años)' },
      { name: 'Signo de Hoffmann', how: 'Al flexionar bruscamente la falange distal del tercer dedo, se flexiona el pulgar.', means: 'Lesión de primera motoneurona' },
      { name: 'Clonus', how: 'Contracciones rítmicas al estirar bruscamente un músculo (tobillo).', means: 'Lesión de primera motoneurona' },
      { name: 'Fasciculaciones con atrofia', how: 'Contracciones finas visibles de fibras musculares con músculo adelgazado.', means: 'Lesión de segunda motoneurona (ELA si se suma a signos de primera)' },
      { name: 'Rigidez de nuca', how: 'Resistencia a flexionar el cuello.', means: 'Irritación meníngea: meningitis, hemorragia subaracnoidea' },
      { name: 'Signo de Kernig', how: 'Con la cadera a 90°, extender la rodilla produce dolor y resistencia.', means: 'Irritación meníngea (poco sensible: no la descarta)' },
      { name: 'Signo de Brudzinski', how: 'Al flexionar el cuello se flexionan las caderas y rodillas.', means: 'Irritación meníngea' },
      { name: 'Romberg positivo', how: 'Se mantiene de pie con los ojos abiertos pero cae al cerrarlos.', means: 'Ataxia sensitiva: cordones posteriores (déficit de B12, tabes)' },
      { name: 'Dismetría y disdiadococinesia', how: 'Falla en la prueba dedo-nariz y en los movimientos alternos rápidos.', means: 'Lesión cerebelosa del mismo lado' },
      { name: 'Signo de Lasègue', how: 'Dolor que baja por la pierna al elevarla extendida entre 30° y 70°.', means: 'Radiculopatía por hernia discal lumbar (L5–S1)' },
      { name: 'Asterixis', how: 'Aleteo de las manos al extender las muñecas.', means: 'Encefalopatía metabólica (hepática, urémica, hipercapnia)' },
    ],
    sections: [
      {
        heading: 'Primera vs. segunda motoneurona',
        table: {
          head: ['Hallazgo', 'Primera (superior)', 'Segunda (inferior)'],
          rows: [
            ['Tono', 'Espasticidad', 'Flacidez'],
            ['Reflejos', 'Aumentados', 'Disminuidos o abolidos'],
            ['Babinski', 'Presente', 'Ausente'],
            ['Atrofia', 'Leve y tardía', 'Marcada'],
            ['Fasciculaciones', 'No', 'Sí'],
          ],
        },
      },
      {
        heading: 'Escala de fuerza muscular (MRC)',
        table: {
          head: ['Grado', 'Qué hace'],
          rows: [
            ['0', 'Sin contracción'],
            ['1', 'Contracción visible sin movimiento'],
            ['2', 'Mueve sin vencer la gravedad'],
            ['3', 'Vence la gravedad, no la resistencia'],
            ['4', 'Vence algo de resistencia'],
            ['5', 'Fuerza normal'],
          ],
        },
      },
    ],
  },
  {
    id: 'osteomuscular',
    name: 'Osteomuscular',
    icon: 'bone',
    color: '#b45309',
    tips: [
      'Explora cada articulación con inspección, palpación, movilidad activa y pasiva, pruebas especiales y examen neurovascular distal.',
      'Compara siempre con el lado sano y explora la articulación de arriba y la de abajo.',
      'Si el dolor limita el movimiento activo pero no el pasivo, piensa en un problema muscular o tendinoso; si ambos están limitados, en la articulación.',
    ],
    signs: [
      { name: 'Prueba de Lachman', how: 'Con la rodilla a 20–30°, la tibia se desplaza hacia delante sin tope firme.', means: 'Rotura del ligamento cruzado anterior (la prueba más sensible)' },
      { name: 'Cajón anterior', how: 'Con la rodilla a 90°, la tibia se desliza hacia delante.', means: 'Rotura del ligamento cruzado anterior' },
      { name: 'Prueba de McMurray', how: 'Chasquido doloroso al rotar la tibia mientras se extiende la rodilla.', means: 'Lesión de menisco' },
      { name: 'Peloteo rotuliano', how: 'La rótula «rebota» al empujarla contra el fémur.', means: 'Derrame en la rodilla' },
      { name: 'Signos de Phalen y Tinel', how: 'Hormigueo en los dedos al flexionar la muñeca 60 s o al percutir el túnel carpiano.', means: 'Síndrome del túnel carpiano (nervio mediano)' },
      { name: 'Prueba de Finkelstein', how: 'Dolor en el lado radial de la muñeca al desviarla hacia el cúbito con el pulgar dentro del puño.', means: 'Tenosinovitis de De Quervain' },
      { name: 'Prueba de Jobe (lata vacía)', how: 'Debilidad o dolor al resistir la elevación del brazo en rotación interna.', means: 'Lesión del supraespinoso' },
      { name: 'Signos de Neer y Hawkins', how: 'Dolor al elevar el brazo en rotación interna o al rotarlo internamente a 90°.', means: 'Pinzamiento subacromial' },
      { name: 'Maniobras de Ortolani y Barlow', how: 'En el recién nacido: un «clunk» al reducir (Ortolani) o luxar (Barlow) la cadera.', means: 'Displasia del desarrollo de la cadera' },
      { name: 'Prueba de Schober', how: 'Se marcan 10 cm sobre la columna lumbar y aumentan < 5 cm al flexionar.', means: 'Movilidad lumbar reducida: espondilitis anquilosante' },
      { name: 'Signo de Trendelenburg', how: 'Al apoyarse en una pierna, la pelvis cae hacia el lado contrario.', means: 'Debilidad del glúteo medio del lado de apoyo' },
    ],
  },
  {
    id: 'piel',
    name: 'Piel',
    icon: 'hand',
    color: '#db2777',
    tips: [
      'Describe cada lesión: tipo (primaria o secundaria), tamaño, color, forma, bordes, distribución y disposición.',
      'Explora con buena luz natural, incluidas uñas, pelo, mucosas, palmas, plantas y entre los dedos.',
      'Presiona con un vidrio (vitropresión): el eritema palidece y la púrpura no.',
    ],
    signs: [
      { name: 'Signo de Nikolsky', how: 'La piel sana se desprende al frotarla.', means: 'Pénfigo vulgar, necrólisis epidérmica tóxica o piel escaldada estafilocócica' },
      { name: 'Signo de Auspitz', how: 'Sangrado puntiforme al raspar la escama.', means: 'Psoriasis' },
      { name: 'Fenómeno de Koebner', how: 'Aparecen lesiones nuevas en zonas de trauma o rascado.', means: 'Psoriasis, liquen plano, vitíligo' },
      { name: 'Signo de Darier', how: 'Una lesión se vuelve habón al frotarla.', means: 'Mastocitosis' },
      { name: 'Púrpura palpable', how: 'Manchas violáceas elevadas que no palidecen a la vitropresión.', means: 'Vasculitis de pequeño vaso' },
      { name: 'Petequias que no palidecen con fiebre', how: 'Puntos rojos que no desaparecen al presionar, en un paciente febril.', means: 'Urgencia: meningococemia hasta demostrar lo contrario' },
      { name: 'ABCDE positivo en un lunar', how: 'Asimetría, Bordes irregulares, Color variado, Diámetro > 6 mm o Evolución.', means: 'Sospecha de melanoma' },
    ],
    sections: [
      {
        heading: 'Lesiones primarias',
        table: {
          head: ['Lesión', 'Qué es'],
          rows: [
            ['Mácula / parche', 'Cambio de color plano, < 1 cm / > 1 cm'],
            ['Pápula / placa', 'Elevación sólida, < 1 cm / > 1 cm'],
            ['Nódulo', 'Lesión sólida y profunda, palpable'],
            ['Vesícula / ampolla', 'Contiene líquido claro, < 1 cm / > 1 cm'],
            ['Pústula', 'Contiene pus'],
            ['Habón', 'Edema dérmico transitorio (urticaria)'],
          ],
        },
      },
    ],
  },
]

export const SEMIO_REFERENCES = [
  'Bickley LS. Bates. Guía de exploración física e historia clínica, 13.ª ed. Wolters Kluwer; 2021.',
  'Argente HA, Álvarez ME. Semiología médica, 3.ª ed. Panamericana; 2021.',
  'McGee S. Evidence-Based Physical Diagnosis, 5.ª ed. Elsevier; 2021.',
  'Surós J, Surós A. Semiología médica y técnica exploratoria, 8.ª ed. Elsevier Masson; 2001.',
]

export const allSigns = () => SYSTEMS.flatMap((s) => s.signs.map((sign) => ({ ...sign, system: s })))
