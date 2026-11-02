import type { QuizItem } from '@/types'

/**
 * Fisiopatologías más preguntadas en el ENURM, como esquemas de causa → mecanismo → clínica.
 * Cada nodo vive en una rejilla de 3 columnas (col 0–2, puede ser decimal para centrar) y filas;
 * `step` dice en qué paso de la animación aparece. `\n` parte la etiqueta en dos líneas.
 */

export type NodeKind = 'causa' | 'mecanismo' | 'compensacion' | 'clinica' | 'desenlace'

export interface SchemeNode {
  id: string
  label: string
  detail: string
  kind: NodeKind
  col: number
  row: number
  step: number
}

export interface SchemeEdge {
  from: string
  to: string
  /** Rodea el esquema por un costado: círculos viciosos o flechas que saltan nodos. */
  route?: 'left' | 'right'
  /** Punteada: retroalimentación o círculo vicioso. */
  loop?: boolean
}

export interface SchemeDrug {
  name: string
  /** Nodo donde actúa. */
  target: string
  how: string
}

export interface Scheme {
  id: string
  title: string
  short: string
  area: string
  color: string
  summary: string
  /** Texto de cada paso de la animación (el paso 1 es steps[0]). */
  steps: string[]
  nodes: SchemeNode[]
  edges: SchemeEdge[]
  drugs: SchemeDrug[]
  pearl: string
}

export const KIND_INFO: Record<NodeKind, { label: string; color: string }> = {
  causa: { label: 'Causa', color: '#e11d48' },
  mecanismo: { label: 'Mecanismo', color: '#0ba595' },
  compensacion: { label: 'Compensación', color: '#d97706' },
  clinica: { label: 'Clínica', color: '#7c3aed' },
  desenlace: { label: 'Complicación', color: '#be123c' },
}

export const SCHEMES: Scheme[] = [
  {
    id: 'insuficiencia-cardiaca',
    title: 'Insuficiencia cardíaca con FEVI reducida',
    short: 'Insuficiencia cardíaca',
    area: 'Cardiología',
    color: '#e11d48',
    summary: 'El corazón dañado bombea menos; el cuerpo lo interpreta como pérdida de volumen y activa sistemas que, a la larga, empeoran al propio corazón.',
    steps: [
      'Todo empieza con un daño del miocardio: infarto (la causa más común), hipertensión mantenida, miocardiopatía dilatada, valvulopatías o tóxicos como el alcohol.',
      'El ventrículo se contrae peor (FEVI ≤ 40 %) y cae el gasto cardíaco. El riñón y los barorreceptores «sienten» menos flujo y presión.',
      'Se encienden tres sistemas de compensación: el simpático (taquicardia y contractilidad), el renina-angiotensina-aldosterona (SRAA) y la hormona antidiurética.',
      'A corto plazo sostienen la presión, pero vasoconstriñen (más poscarga), retienen sodio y agua y remodelan el ventrículo con fibrosis e hipertrofia.',
      'La retención aumenta la precarga. El corazón insuficiente está en la parte plana de la curva de Frank-Starling: más volumen ya no da más gasto, solo más congestión. La poscarga alta y el remodelado vuelven a bajar el gasto: círculo vicioso.',
      'La congestión da la clínica: izquierda (disnea, ortopnea, disnea paroxística nocturna, crepitantes) y derecha (ingurgitación yugular, hepatomegalia, edemas).',
    ],
    nodes: [
      { id: 'dano', label: 'Daño miocárdico\n(IAM, HTA, MCD)', detail: 'Infarto, hipertensión crónica, miocardiopatía dilatada, valvulopatías, alcohol o quimioterapia (antraciclinas). La cardiopatía isquémica es la primera causa.', kind: 'causa', col: 1, row: 0, step: 1 },
      { id: 'gc', label: '↓ Contractilidad\n↓ Gasto cardíaco', detail: 'FEVI ≤ 40 % define la IC con fracción de eyección reducida. Cae el volumen sistólico y con él la perfusión renal.', kind: 'mecanismo', col: 1, row: 1, step: 2 },
      { id: 'simp', label: 'Activación\nsimpática', detail: 'Noradrenalina: taquicardia, más contractilidad y vasoconstricción. A largo plazo es tóxica para el miocito (apoptosis, arritmias).', kind: 'compensacion', col: 0, row: 2, step: 3 },
      { id: 'sraa', label: 'SRAA activado\n(↓ flujo renal)', detail: 'La hipoperfusión renal libera renina → angiotensina II (vasoconstrictor potente) → aldosterona (retiene Na⁺ y agua, elimina K⁺).', kind: 'compensacion', col: 1, row: 2, step: 3 },
      { id: 'adh', label: '↑ ADH\n(vasopresina)', detail: 'Retiene agua libre en el colector. Por eso la IC avanzada cursa con hiponatremia dilucional, marcador de mal pronóstico.', kind: 'compensacion', col: 2, row: 2, step: 3 },
      { id: 'vaso', label: 'Vasoconstricción\n↑ Poscarga', detail: 'El ventrículo debilitado tiene que vencer más resistencia: el volumen sistólico cae todavía más.', kind: 'mecanismo', col: 0, row: 3, step: 4 },
      { id: 'reten', label: 'Retención de\nNa⁺ y agua', detail: 'Expande el volumen extracelular. Es la base de los edemas y de la congestión pulmonar.', kind: 'mecanismo', col: 1, row: 3, step: 4 },
      { id: 'remod', label: 'Remodelado\n(fibrosis, dilatación)', detail: 'La angiotensina II, la aldosterona y las catecolaminas producen fibrosis, hipertrofia y dilatación: el ventrículo se vuelve esférico y menos eficiente.', kind: 'mecanismo', col: 2, row: 3, step: 4 },
      { id: 'precarga', label: '↑ Precarga y\npresión de llenado', detail: 'En la parte plana de la curva de Frank-Starling, más llenado ya no mejora el gasto: solo aumenta la presión en aurícula izquierda y capilar pulmonar.', kind: 'mecanismo', col: 1, row: 4, step: 5 },
      { id: 'izq', label: 'Edema pulmonar\ndisnea, ortopnea', detail: 'Presión capilar pulmonar > 18–25 mmHg: líquido al intersticio y alvéolo. Crepitantes, disnea paroxística nocturna, edema agudo de pulmón.', kind: 'clinica', col: 0, row: 5, step: 6 },
      { id: 'der', label: 'Congestión venosa\nIY, edemas', detail: 'Ingurgitación yugular, reflujo hepatoyugular, hepatomegalia dolorosa, ascitis y edemas con fóvea en miembros inferiores.', kind: 'clinica', col: 2, row: 5, step: 6 },
    ],
    edges: [
      { from: 'dano', to: 'gc' },
      { from: 'gc', to: 'simp' },
      { from: 'gc', to: 'sraa' },
      { from: 'gc', to: 'adh' },
      { from: 'simp', to: 'vaso' },
      { from: 'sraa', to: 'reten' },
      { from: 'adh', to: 'reten' },
      { from: 'sraa', to: 'remod' },
      { from: 'reten', to: 'precarga' },
      { from: 'precarga', to: 'izq' },
      { from: 'precarga', to: 'der' },
      { from: 'vaso', to: 'gc', route: 'left', loop: true },
      { from: 'remod', to: 'gc', route: 'right', loop: true },
    ],
    drugs: [
      { name: 'Betabloqueantes (carvedilol, bisoprolol, metoprolol succinato)', target: 'simp', how: 'Bloquean el efecto crónico de las catecolaminas. Bajan la mortalidad y revierten parte del remodelado. Se inician a dosis bajas, con el paciente euvolémico.' },
      { name: 'Sacubitrilo-valsartán, IECA o ARA-II', target: 'sraa', how: 'Bloquean la angiotensina II. El sacubitrilo además impide degradar los péptidos natriuréticos (más natriuresis). El ARNI es de primera elección.' },
      { name: 'Antagonistas de la aldosterona (espironolactona, eplerenona)', target: 'remod', how: 'Reducen fibrosis y retención de sodio; bajan la mortalidad. Vigila el potasio y la función renal.' },
      { name: 'iSGLT2 (dapagliflozina, empagliflozina)', target: 'reten', how: 'Natriuresis y glucosuria; reducen hospitalizaciones y mortalidad con o sin diabetes.' },
      { name: 'Diuréticos de asa (furosemida)', target: 'precarga', how: 'Quitan la congestión y alivian los síntomas, pero no reducen la mortalidad.' },
    ],
    pearl: 'Los cuatro pilares que reducen la mortalidad en la IC con FEVI reducida: ARNI (o IECA/ARA-II), betabloqueante, antagonista de la aldosterona e iSGLT2. Los diuréticos solo alivian síntomas.',
  },
  {
    id: 'sepsis',
    title: 'Sepsis y shock séptico',
    short: 'Sepsis',
    area: 'Medicina interna',
    color: '#ea580c',
    summary: 'La sepsis no es la infección: es la respuesta desregulada del huésped que daña sus propios órganos.',
    steps: [
      'Una infección (neumonía, urinaria, abdominal, piel) libera productos del microorganismo, como el lipopolisacárido (LPS) de los gramnegativos.',
      'Los macrófagos los reconocen con receptores tipo Toll y liberan una tormenta de citocinas (TNF-α, IL-1, IL-6). La respuesta deja de ser local y se vuelve sistémica.',
      'Tres efectos simultáneos: óxido nítrico que dilata los vasos, daño del endotelio que se vuelve permeable y activación de la coagulación.',
      'Cae la resistencia vascular sistémica, se fuga plasma al intersticio y se forman microtrombos. Al inicio el gasto cardíaco sube (shock «caliente»).',
      'Aunque haya gasto alto, el oxígeno no llega bien a los tejidos: hipoperfusión.',
      'Los tejidos pasan a metabolismo anaerobio (lactato > 2 mmol/L) y fallan los órganos. Sepsis = infección + aumento del SOFA ≥ 2. Shock séptico = necesita vasopresor para PAM ≥ 65 mmHg y lactato > 2 pese a líquidos.',
    ],
    nodes: [
      { id: 'infec', label: 'Infección\n(LPS, toxinas)', detail: 'Focos más comunes: pulmón, vía urinaria, abdomen, piel y catéteres. El LPS de los gramnegativos es el prototipo de PAMP.', kind: 'causa', col: 1, row: 0, step: 1 },
      { id: 'inmune', label: 'Citocinas: TNF-α,\nIL-1, IL-6', detail: 'Receptores tipo Toll (TLR-4 para LPS) en macrófagos → NF-κB → citocinas proinflamatorias. Coexiste una fase de inmunoparálisis.', kind: 'mecanismo', col: 1, row: 1, step: 2 },
      { id: 'no', label: '↑ Óxido nítrico\nvasodilatación', detail: 'La óxido nítrico sintasa inducible relaja el músculo liso vascular de forma masiva y poco sensible a catecolaminas.', kind: 'mecanismo', col: 0, row: 2, step: 3 },
      { id: 'endot', label: 'Daño endotelial\n↑ Permeabilidad', detail: 'Se pierde el glucocáliz y se abren las uniones entre células endoteliales: el plasma se fuga al intersticio.', kind: 'mecanismo', col: 1, row: 2, step: 3 },
      { id: 'coag', label: 'Activación de la\ncoagulación (CID)', detail: 'El factor tisular activa la coagulación y se consumen antitrombina y proteína C. Puede llegar a coagulación intravascular diseminada: trombosis y sangrado a la vez.', kind: 'mecanismo', col: 2, row: 2, step: 3 },
      { id: 'rvs', label: '↓ RVS\nhipotensión', detail: 'Resistencia vascular sistémica baja, piel caliente y pulso saltón al inicio. El gasto cardíaco sube para compensar.', kind: 'mecanismo', col: 0, row: 3, step: 4 },
      { id: 'fuga', label: 'Fuga capilar\n↓ Volumen efectivo', detail: 'Hipovolemia relativa: la precarga cae aunque el agua corporal total aumente (edemas).', kind: 'mecanismo', col: 1, row: 3, step: 4 },
      { id: 'micro', label: 'Microtrombosis\n↓ Microcirculación', detail: 'Capilares ocluidos y cortocircuitos: el oxígeno no llega a la célula. Además falla la mitocondria (hipoxia citopática).', kind: 'mecanismo', col: 2, row: 3, step: 4 },
      { id: 'hipop', label: 'Hipoperfusión\ntisular', detail: 'Llenado capilar > 3 s, piel moteada, oliguria (< 0,5 mL/kg/h), alteración del estado mental.', kind: 'mecanismo', col: 1, row: 4, step: 5 },
      { id: 'lactato', label: 'Metabolismo\nanaerobio: ↑ lactato', detail: 'Lactato > 2 mmol/L. Su descenso con el tratamiento es una buena señal de reanimación.', kind: 'clinica', col: 0, row: 5, step: 6 },
      { id: 'fmo', label: 'Disfunción\nmultiorgánica', detail: 'SDRA, lesión renal aguda, encefalopatía, colestasis, plaquetopenia. Se mide con la escala SOFA (o qSOFA como tamizaje: FR ≥ 22, PAS ≤ 100, alteración mental).', kind: 'desenlace', col: 2, row: 5, step: 6 },
    ],
    edges: [
      { from: 'infec', to: 'inmune' },
      { from: 'inmune', to: 'no' },
      { from: 'inmune', to: 'endot' },
      { from: 'inmune', to: 'coag' },
      { from: 'no', to: 'rvs' },
      { from: 'endot', to: 'fuga' },
      { from: 'coag', to: 'micro' },
      { from: 'rvs', to: 'hipop' },
      { from: 'fuga', to: 'hipop' },
      { from: 'micro', to: 'hipop' },
      { from: 'hipop', to: 'lactato' },
      { from: 'hipop', to: 'fmo' },
    ],
    drugs: [
      { name: 'Antibiótico de amplio espectro y control del foco', target: 'infec', how: 'En la primera hora si hay shock o sepsis probable. Hemocultivos antes, sin retrasar el antibiótico. Drenar abscesos, retirar catéteres infectados.' },
      { name: 'Cristaloides 30 mL/kg (Ringer lactato o SSN)', target: 'fuga', how: 'En las primeras 3 horas si hay hipotensión o lactato ≥ 4. Reponen el volumen que se fuga; reevalúa la respuesta a líquidos.' },
      { name: 'Norepinefrina', target: 'rvs', how: 'Vasopresor de primera línea para PAM ≥ 65 mmHg. Si no basta, se agrega vasopresina.' },
      { name: 'Hidrocortisona 200 mg/día', target: 'inmune', how: 'Cuando el shock necesita vasopresor de forma persistente (norepinefrina ≥ 0,25 µg/kg/min por ≥ 4 h).' },
    ],
    pearl: 'Sepsis: infección + SOFA ≥ 2. Shock séptico: vasopresor para PAM ≥ 65 y lactato > 2 mmol/L a pesar de líquidos adecuados. Es el shock distributivo típico: RVS baja y gasto alto.',
  },
  {
    id: 'cetoacidosis',
    title: 'Cetoacidosis diabética',
    short: 'Cetoacidosis',
    area: 'Endocrinología',
    color: '#0284c7',
    summary: 'Sin insulina, la célula «cree» que está en ayuno: fabrica glucosa que no puede usar y quema grasa que produce ácidos.',
    steps: [
      'Falta insulina (debut de diabetes tipo 1, omisión de dosis) y suben las hormonas contrarreguladoras: glucagón, cortisol, catecolaminas. Los gatillos clásicos son las infecciones y la omisión de insulina.',
      'Dos caminos: el hígado fabrica glucosa (gluconeogénesis) que los tejidos no captan, y el tejido adiposo libera ácidos grasos (lipólisis).',
      'La glucosa supera el umbral renal y arrastra agua (diuresis osmótica). Los ácidos grasos llegan al hígado y se convierten en cuerpos cetónicos (β-hidroxibutirato y acetoacetato).',
      'Resultado: deshidratación con pérdida de electrolitos y acidosis metabólica con anión GAP elevado.',
      'La clínica: poliuria, polidipsia, hipovolemia; respiración de Kussmaul y aliento a manzana; dolor abdominal y vómitos. El potasio sale de la célula: el sérico puede ser normal o alto aunque el total esté muy bajo. La hipovolemia baja el filtrado y empeora la hiperglucemia.',
    ],
    nodes: [
      { id: 'insulina', label: 'Déficit de insulina\n+ ↑ Glucagón', detail: 'Gatillos: infección, omisión de insulina, debut de DM1, infarto, pancreatitis, fármacos (corticoides; iSGLT2 → cetoacidosis euglucémica).', kind: 'causa', col: 1, row: 0, step: 1 },
      { id: 'hiperglu', label: 'Hiperglucemia\n(> 250 mg/dL)', detail: 'Más gluconeogénesis y glucogenólisis, menos captación periférica (GLUT-4 depende de insulina).', kind: 'mecanismo', col: 0, row: 1, step: 2 },
      { id: 'lipolisis', label: 'Lipólisis\n↑ Ácidos grasos', detail: 'Sin insulina se activa la lipasa sensible a hormonas del adipocito.', kind: 'mecanismo', col: 2, row: 1, step: 2 },
      { id: 'diuresis', label: 'Diuresis osmótica\n(glucosuria)', detail: 'Con glucosa > 180 mg/dL se supera la reabsorción tubular; la glucosa en la orina arrastra agua, sodio y potasio.', kind: 'mecanismo', col: 0, row: 2, step: 3 },
      { id: 'cetonas', label: 'Cetogénesis\n(β-hidroxibutirato)', detail: 'El glucagón desvía los ácidos grasos a la mitocondria hepática (CPT-1). El β-hidroxibutirato es el principal; la tira de orina solo mide acetoacetato.', kind: 'mecanismo', col: 2, row: 2, step: 3 },
      { id: 'deshidr', label: 'Deshidratación\npérdida de Na⁺ y K⁺', detail: 'Déficit de agua de 5–7 L en promedio. La hiperglucemia diluye el sodio (seudohiponatremia): corrige 1,6 mEq/L por cada 100 mg/dL de glucosa sobre 100.', kind: 'mecanismo', col: 0, row: 3, step: 4 },
      { id: 'acidosis', label: 'Acidosis metabólica\nanión GAP alto', detail: 'pH < 7,30 y HCO₃⁻ < 18 mEq/L, anión GAP > 12. Los cetoácidos consumen el bicarbonato.', kind: 'mecanismo', col: 2, row: 3, step: 4 },
      { id: 'hipovol', label: 'Hipovolemia\npoliuria, polidipsia', detail: 'Taquicardia, mucosas secas, hipotensión. La hipovolemia baja el filtrado glomerular y el riñón elimina menos glucosa.', kind: 'clinica', col: 0, row: 4, step: 5 },
      { id: 'potasio', label: 'K⁺ sérico normal o ↑\npero K⁺ total ↓', detail: 'La acidosis y la falta de insulina sacan el K⁺ de la célula. Al dar insulina vuelve a entrar y puede caer bruscamente: arritmias.', kind: 'clinica', col: 1, row: 4, step: 5 },
      { id: 'kuss', label: 'Kussmaul, aliento\nafrutado, vómitos', detail: 'Respiración profunda y rápida para eliminar CO₂ (compensación respiratoria). Dolor abdominal que puede simular abdomen agudo.', kind: 'clinica', col: 2, row: 4, step: 5 },
    ],
    edges: [
      { from: 'insulina', to: 'hiperglu' },
      { from: 'insulina', to: 'lipolisis' },
      { from: 'hiperglu', to: 'diuresis' },
      { from: 'lipolisis', to: 'cetonas' },
      { from: 'diuresis', to: 'deshidr' },
      { from: 'cetonas', to: 'acidosis' },
      { from: 'deshidr', to: 'hipovol' },
      { from: 'deshidr', to: 'potasio' },
      { from: 'acidosis', to: 'potasio' },
      { from: 'acidosis', to: 'kuss' },
      { from: 'hipovol', to: 'hiperglu', route: 'left', loop: true },
    ],
    drugs: [
      { name: 'Líquidos: SSN 0,9 % (15–20 mL/kg la primera hora)', target: 'deshidr', how: 'Es lo primero. Corrige la hipovolemia, mejora el filtrado y por sí sola baja la glucosa. Al llegar a 200–250 mg/dL se agrega dextrosa.' },
      { name: 'Insulina regular IV (0,1 U/kg/h)', target: 'insulina', how: 'Frena la lipólisis y la cetogénesis. Se mantiene hasta cerrar el anión GAP, aunque la glucosa ya esté normal.' },
      { name: 'Potasio', target: 'potasio', how: 'Si el K⁺ está bajo (< 3,3–3,5 mEq/L), primero se repone y se retrasa la insulina. Entre 3,5 y 5 se agrega a los líquidos.' },
      { name: 'Bicarbonato (casi nunca)', target: 'acidosis', how: 'Solo con acidosis extrema (pH < 7,0; antes se decía < 6,9). La acidosis se corrige sola al frenar la cetogénesis.' },
    ],
    pearl: 'Orden del tratamiento: líquidos → potasio → insulina. Nunca empieces la insulina con K⁺ bajo: la insulina mete el potasio a la célula y puede provocar una arritmia mortal.',
  },
  {
    id: 'cirrosis',
    title: 'Cirrosis e hipertensión portal',
    short: 'Cirrosis',
    area: 'Gastroenterología',
    color: '#ca8a04',
    summary: 'La cirrosis hace dos cosas: frena la sangre que entra al hígado (hipertensión portal) y deja al hígado sin función. De ahí salen todas sus complicaciones.',
    steps: [
      'Una agresión crónica (alcohol, hepatitis B o C, hígado graso metabólico) activa las células estrelladas: fibrosis y nódulos de regeneración.',
      'La fibrosis aumenta la resistencia al flujo portal (hipertensión portal) y se pierde masa de hepatocitos funcionales.',
      'El intestino responde con vasodilatación esplácnica (óxido nítrico) y la sangre busca atajos: colaterales portosistémicas. El hígado fabrica menos albúmina y factores de coagulación.',
      'La vasodilatación baja el volumen arterial efectivo. Las colaterales forman várices esofágicas. El amonio intestinal pasa directo a la circulación sin ser depurado.',
      'El riñón percibe hipovolemia y activa SRAA, simpático y ADH. Las várices pueden romperse. El amonio llega al cerebro.',
      'Retención de sodio y agua → ascitis e hiponatremia. La vasoconstricción renal extrema produce el síndrome hepatorrenal.',
    ],
    nodes: [
      { id: 'fibrosis', label: 'Cirrosis: fibrosis\ny nódulos', detail: 'Causas: alcohol, VHB, VHC, enfermedad hepática metabólica (MASLD), autoinmune, hemocromatosis, Wilson. Las células estrelladas producen colágeno.', kind: 'causa', col: 1, row: 0, step: 1 },
      { id: 'htp', label: '↑ Resistencia:\nhipertensión portal', detail: 'Gradiente de presión venosa hepática (GPVH) > 5 mmHg; ≥ 10 mmHg es clínicamente significativa (riesgo de várices y ascitis).', kind: 'mecanismo', col: 0, row: 1, step: 2 },
      { id: 'insuf', label: '↓ Función del\nhepatocito', detail: 'Se mide con Child-Pugh (bilirrubina, albúmina, INR, ascitis, encefalopatía) y MELD (bilirrubina, INR, creatinina, sodio).', kind: 'mecanismo', col: 2, row: 1, step: 2 },
      { id: 'vasod', label: 'Vasodilatación\nesplácnica (NO)', detail: 'El óxido nítrico dilata las arterias del intestino: más sangre llega a la porta y la presión portal sube aún más.', kind: 'mecanismo', col: 0, row: 2, step: 3 },
      { id: 'colat', label: 'Colaterales\nportosistémicas', detail: 'Esofágicas y gástricas (várices), umbilicales (cabeza de medusa) y rectales.', kind: 'compensacion', col: 1, row: 2, step: 3 },
      { id: 'albumina', label: '↓ Albúmina\n↓ Factores (↑ INR)', detail: 'La hipoalbuminemia baja la presión oncótica y favorece la ascitis. Los factores II, VII, IX y X caen: INR alto que no corrige con vitamina K.', kind: 'mecanismo', col: 2, row: 2, step: 3 },
      { id: 'vol', label: '↓ Volumen arterial\nefectivo', detail: 'La sangre se «estanca» en el lecho esplácnico dilatado: el resto del cuerpo se comporta como si hubiera hipovolemia.', kind: 'mecanismo', col: 0, row: 3, step: 4 },
      { id: 'varices', label: 'Várices\nesofágicas', detail: 'Aparecen con GPVH ≥ 10 mmHg y sangran con GPVH ≥ 12 mmHg. Se buscan con endoscopia en todo cirrótico.', kind: 'clinica', col: 1, row: 3, step: 4 },
      { id: 'encef', label: 'Encefalopatía\nhepática (↑ NH₃)', detail: 'El amonio pasa por los cortocircuitos y el hígado no lo depura. Asterixis, confusión, inversión del sueño. Gatillos: sangrado digestivo, infección, estreñimiento, hipopotasemia, sedantes.', kind: 'clinica', col: 2, row: 3, step: 4 },
      { id: 'sraa', label: 'SRAA, simpático\ny ADH activados', detail: 'Compensación frente a la hipovolemia efectiva: retienen sodio (aldosterona) y agua libre (ADH).', kind: 'compensacion', col: 0, row: 4, step: 5 },
      { id: 'hda', label: 'Hemorragia\nvaricosa', detail: 'Hematemesis y melena masivas. Mortalidad cercana al 15–20 % a las 6 semanas.', kind: 'desenlace', col: 1, row: 4, step: 5 },
      { id: 'ascitis', label: 'Ascitis\nhiponatremia', detail: 'GASA (albúmina sérica − albúmina del líquido) ≥ 1,1 g/dL indica hipertensión portal. Complicación: peritonitis bacteriana espontánea (PMN ≥ 250/mm³).', kind: 'clinica', col: 0, row: 5, step: 6 },
      { id: 'hrs', label: 'Síndrome\nhepatorrenal', detail: 'Lesión renal funcional por vasoconstricción renal extrema, con riñón estructuralmente sano. Sodio urinario muy bajo, sin respuesta a albúmina.', kind: 'desenlace', col: 1, row: 5, step: 6 },
    ],
    edges: [
      { from: 'fibrosis', to: 'htp' },
      { from: 'fibrosis', to: 'insuf' },
      { from: 'htp', to: 'vasod' },
      { from: 'htp', to: 'colat' },
      { from: 'insuf', to: 'albumina' },
      { from: 'vasod', to: 'vol' },
      { from: 'colat', to: 'varices' },
      { from: 'colat', to: 'encef' },
      { from: 'insuf', to: 'encef', route: 'right' },
      { from: 'vol', to: 'sraa' },
      { from: 'varices', to: 'hda' },
      { from: 'sraa', to: 'ascitis' },
      { from: 'sraa', to: 'hrs' },
    ],
    drugs: [
      { name: 'Betabloqueante no selectivo (propranolol, carvedilol)', target: 'htp', how: 'Bajan el gasto cardíaco (β1) y vasoconstriñen el lecho esplácnico (bloqueo β2): menos presión portal. Profilaxis del sangrado.' },
      { name: 'Ligadura endoscópica con bandas', target: 'varices', how: 'Alternativa al betabloqueante en la profilaxis y tratamiento de elección en el sangrado agudo.' },
      { name: 'Octreótido o terlipresina + ceftriaxona + endoscopia en < 12 h', target: 'hda', how: 'Vasoconstrictor esplácnico, antibiótico profiláctico (reduce infecciones y mortalidad) y transfusión restrictiva (Hb objetivo 7–8 g/dL).' },
      { name: 'Espironolactona + furosemida (100:40) y dieta baja en sodio', target: 'sraa', how: 'La espironolactona bloquea el hiperaldosteronismo secundario, causa central de la ascitis. Paracentesis evacuadora con albúmina si la ascitis es a tensión.' },
      { name: 'Lactulosa (± rifaximina)', target: 'encef', how: 'Acidifica el colon: el amonio (NH₃) pasa a amonio iónico (NH₄⁺), que no se absorbe. Además es laxante.' },
      { name: 'Terlipresina + albúmina', target: 'hrs', how: 'Vasoconstricción esplácnica y expansión de volumen. El tratamiento definitivo es el trasplante hepático.' },
    ],
    pearl: 'La ascitis del cirrótico no se debe solo a la albúmina baja: el motor principal es la vasodilatación esplácnica que activa el SRAA. Por eso el diurético de elección es la espironolactona.',
  },
  {
    id: 'asma',
    title: 'Asma: reacción inmediata y tardía',
    short: 'Asma',
    area: 'Neumología',
    color: '#0891b2',
    summary: 'Inflamación crónica de la vía aérea con hiperreactividad: obstrucción variable y reversible, con una fase inmediata (minutos) y otra tardía (horas).',
    steps: [
      'Un alérgeno (ácaros, polen, epitelio de animales) entra a una vía aérea sensibilizada. Otros gatillos: infecciones virales, ejercicio, frío, AINE.',
      'El alérgeno une la IgE pegada a los mastocitos. La sensibilización previa está dirigida por linfocitos Th2.',
      'Fase inmediata (minutos): el mastocito libera histamina, leucotrienos y prostaglandinas. Fase tardía (4–8 h): llegan eosinófilos y linfocitos Th2 con IL-4, IL-5 e IL-13.',
      'Broncoconstricción, edema de la mucosa con tapones de moco, e inflamación crónica con hiperreactividad bronquial.',
      'La suma produce una obstrucción al flujo aéreo que es variable y reversible (aumenta el FEV1 ≥ 12 % y ≥ 200 mL tras el broncodilatador).',
      'Clínica: sibilancias, disnea, opresión torácica y tos de predominio nocturno. En la crisis grave, una PaCO₂ normal o alta es una alarma de fatiga. Sin control, la vía aérea se remodela.',
    ],
    nodes: [
      { id: 'alergeno', label: 'Alérgeno en vía\naérea sensibilizada', detail: 'Ácaros del polvo (el más común en el Caribe), cucarachas, polen, epitelio de animales. Gatillos no alérgicos: virus, ejercicio, aire frío, humo, AINE.', kind: 'causa', col: 1, row: 0, step: 1 },
      { id: 'ige', label: 'IgE en mastocitos\n(respuesta Th2)', detail: 'En la sensibilización, los Th2 (IL-4) hacen que el linfocito B cambie a IgE. La IgE se une al receptor FcεRI del mastocito.', kind: 'mecanismo', col: 1, row: 1, step: 2 },
      { id: 'mediad', label: 'Histamina,\nleucotrienos, PG', detail: 'Fase inmediata (15–30 min). Los leucotrienos C4, D4 y E4 son broncoconstrictores mucho más potentes que la histamina.', kind: 'mecanismo', col: 0, row: 2, step: 3 },
      { id: 'eos', label: 'Eosinófilos y Th2\n(IL-4, IL-5, IL-13)', detail: 'Fase tardía (4–8 h). La IL-5 recluta y activa eosinófilos; la IL-13 aumenta el moco y la hiperreactividad. Proteína básica mayor: daña el epitelio.', kind: 'mecanismo', col: 2, row: 2, step: 3 },
      { id: 'bronco', label: 'Broncoconstricción\n(músculo liso)', detail: 'Es lo que revierte el salbutamol en minutos.', kind: 'mecanismo', col: 0, row: 3, step: 4 },
      { id: 'moco', label: 'Edema y tapones\nde moco', detail: 'Espirales de Curschmann y cristales de Charcot-Leyden en el esputo.', kind: 'mecanismo', col: 1, row: 3, step: 4 },
      { id: 'inflam', label: 'Inflamación crónica\nhiperreactividad', detail: 'La vía aérea se cierra ante estímulos que no afectan a una persona sana. Es la diana de los corticoides inhalados.', kind: 'mecanismo', col: 2, row: 3, step: 4 },
      { id: 'obst', label: 'Obstrucción\nvariable y reversible', detail: 'FEV1/FVC < 0,70 con respuesta al broncodilatador, o variabilidad del flujo pico > 10 %. Entre crisis la espirometría puede ser normal.', kind: 'mecanismo', col: 1, row: 4, step: 5 },
      { id: 'clin', label: 'Sibilancias, disnea\ntos nocturna', detail: 'Síntomas variables en el tiempo y en intensidad, peores de noche y de madrugada, desencadenados por los gatillos.', kind: 'clinica', col: 0, row: 5, step: 6 },
      { id: 'grave', label: 'Crisis grave:\nPaCO₂ normal o ↑', detail: 'En la crisis el paciente hiperventila y la PaCO₂ baja. Si sube a lo normal o más, se está agotando: tórax silente, habla entrecortada, confusión → considerar intubación.', kind: 'desenlace', col: 1, row: 5, step: 6 },
      { id: 'remod', label: 'Remodelado\n(fibrosis)', detail: 'Hipertrofia del músculo liso, fibrosis bajo la membrana basal e hiperplasia de glándulas: obstrucción que deja de ser reversible.', kind: 'desenlace', col: 2, row: 5, step: 6 },
    ],
    edges: [
      { from: 'alergeno', to: 'ige' },
      { from: 'ige', to: 'mediad' },
      { from: 'ige', to: 'eos' },
      { from: 'mediad', to: 'bronco' },
      { from: 'mediad', to: 'moco' },
      { from: 'eos', to: 'moco' },
      { from: 'eos', to: 'inflam' },
      { from: 'bronco', to: 'obst' },
      { from: 'moco', to: 'obst' },
      { from: 'inflam', to: 'obst' },
      { from: 'obst', to: 'clin' },
      { from: 'obst', to: 'grave' },
      { from: 'inflam', to: 'remod' },
    ],
    drugs: [
      { name: 'Corticoide inhalado (budesonida-formoterol)', target: 'inflam', how: 'La base del tratamiento. GINA prefiere budesonida-formoterol a demanda como rescate en todos los escalones: nunca un SABA solo.' },
      { name: 'Salbutamol (β2 de acción corta) e ipratropio', target: 'bronco', how: 'Relajan el músculo liso en minutos. En la crisis se dan juntos, nebulizados o con inhalador y espaciador.' },
      { name: 'Montelukast (antileucotrieno)', target: 'mediad', how: 'Bloquea el receptor de leucotrienos. Útil en asma inducida por ejercicio, por AINE y con rinitis alérgica.' },
      { name: 'Omalizumab (anti-IgE)', target: 'ige', how: 'Asma alérgica grave con IgE elevada que no se controla con dosis altas de corticoide inhalado.' },
      { name: 'Mepolizumab (anti-IL-5)', target: 'eos', how: 'Asma eosinofílica grave (eosinófilos en sangre ≥ 150–300/µL).' },
    ],
    pearl: 'En una crisis asmática esperas una PaCO₂ baja por la hiperventilación. Una PaCO₂ «normal» (40 mmHg) en una crisis es mala noticia: el paciente se está cansando.',
  },
  {
    id: 'sindrome-nefrotico',
    title: 'Síndrome nefrótico',
    short: 'Nefrótico',
    area: 'Nefrología',
    color: '#7c3aed',
    summary: 'Una barrera de filtración rota deja escapar proteínas. Casi todo lo demás es consecuencia de lo que se pierde por la orina.',
    steps: [
      'Se daña el podocito: enfermedad de cambios mínimos (la más común en niños), glomeruloesclerosis focal y segmentaria, nefropatía membranosa (la más común en adultos no diabéticos) o nefropatía diabética.',
      'La barrera pierde su selectividad: proteinuria > 3,5 g/24 h en adultos (> 40 mg/m²/h en niños).',
      'Se pierde albúmina (hipoalbuminemia < 3 g/dL) y también proteínas pequeñas como la antitrombina III y las inmunoglobulinas.',
      'Baja la presión oncótica. El hígado intenta compensar fabricando más proteínas, incluidas las lipoproteínas. La pérdida de antitrombina da hipercoagulabilidad.',
      'Edema blando y con fóvea (anasarca), hiperlipidemia con lipiduria (cilindros grasos, «cruces de Malta»), trombosis (vena renal) e infecciones.',
    ],
    nodes: [
      { id: 'podo', label: 'Daño del\npodocito', detail: 'Niños: cambios mínimos (podocitos con borramiento de pedicelos en microscopía electrónica). Adultos: membranosa (anti-PLA2R), GEFS, diabetes, amiloidosis.', kind: 'causa', col: 1, row: 0, step: 1 },
      { id: 'prot', label: 'Proteinuria\n> 3,5 g/24 h', detail: 'Orina espumosa. Cociente proteína/creatinina en orina > 3,5 g/g. En cambios mínimos es selectiva (sobre todo albúmina).', kind: 'mecanismo', col: 1, row: 1, step: 2 },
      { id: 'hipoalb', label: 'Hipoalbuminemia\n(< 3 g/dL)', detail: 'La síntesis hepática no alcanza a reponer lo que se pierde.', kind: 'mecanismo', col: 0, row: 2, step: 3 },
      { id: 'perdidas', label: 'Pérdida de\nantitrombina e IgG', detail: 'También se pierden la proteína transportadora de vitamina D, la de hormonas tiroideas y la transferrina.', kind: 'mecanismo', col: 2, row: 2, step: 3 },
      { id: 'oncot', label: '↓ Presión oncótica\nplasmática', detail: 'El líquido sale al intersticio (teoría de «infrallenado»). También hay retención primaria de sodio en el túbulo («sobrellenado»).', kind: 'mecanismo', col: 0, row: 3, step: 4 },
      { id: 'higado', label: '↑ Síntesis hepática\nde lipoproteínas', detail: 'Al bajar la presión oncótica, el hígado aumenta toda su síntesis proteica, incluida la de apolipoproteína B (LDL y VLDL). También se elimina peor la lipoproteína.', kind: 'compensacion', col: 1, row: 3, step: 4 },
      { id: 'trombo', label: 'Trombosis\ne infecciones', detail: 'Trombosis de la vena renal (dolor lumbar, hematuria), TVP, TEP. Infecciones por neumococo (peritonitis bacteriana espontánea en niños). Riesgo de trombosis alto con albúmina < 2–2,5 g/dL.', kind: 'desenlace', col: 2, row: 3, step: 4 },
      { id: 'edema', label: 'Edema con fóvea\n(anasarca)', detail: 'Empieza en párpados por la mañana (sobre todo en niños) y progresa a miembros inferiores, ascitis y derrame pleural.', kind: 'clinica', col: 0, row: 4, step: 5 },
      { id: 'lipid', label: 'Hiperlipidemia\ny lipiduria', detail: 'Colesterol LDL alto. En el sedimento: cilindros grasos y cuerpos ovales grasos con imagen en «cruz de Malta» bajo luz polarizada.', kind: 'clinica', col: 1, row: 4, step: 5 },
    ],
    edges: [
      { from: 'podo', to: 'prot' },
      { from: 'prot', to: 'hipoalb' },
      { from: 'prot', to: 'perdidas' },
      { from: 'hipoalb', to: 'oncot' },
      { from: 'hipoalb', to: 'higado' },
      { from: 'perdidas', to: 'trombo' },
      { from: 'oncot', to: 'edema' },
      { from: 'higado', to: 'lipid' },
    ],
    drugs: [
      { name: 'Corticoides (prednisona)', target: 'podo', how: 'Tratamiento de la enfermedad de cambios mínimos: más del 90 % de los niños responde. En otras causas se usan inmunosupresores según la biopsia.' },
      { name: 'IECA o ARA-II', target: 'prot', how: 'Dilatan la arteriola eferente y bajan la presión intraglomerular: reducen la proteinuria y protegen el riñón.' },
      { name: 'Furosemida y restricción de sodio', target: 'edema', how: 'Controlan el edema. En hipoalbuminemia grave a veces se combinan con albúmina.' },
      { name: 'Estatinas', target: 'lipid', how: 'Para la dislipidemia persistente, sobre todo si hay otros factores de riesgo cardiovascular.' },
      { name: 'Anticoagulación', target: 'trombo', how: 'Si hay trombosis, y como profilaxis en nefropatía membranosa con albúmina muy baja (< 2–2,5 g/dL).' },
    ],
    pearl: 'Nefrótico = proteinuria > 3,5 g/día, hipoalbuminemia, edema e hiperlipidemia (sin hematuria importante ni HTA). Nefrítico = hematuria con cilindros hemáticos, HTA, oliguria y proteinuria < 3,5 g.',
  },
  {
    id: 'preeclampsia',
    title: 'Preeclampsia',
    short: 'Preeclampsia',
    area: 'Ginecología y obstetricia',
    color: '#db2777',
    summary: 'Una placenta mal implantada libera factores que dañan el endotelio de la madre. Por eso se cura al extraer la placenta.',
    steps: [
      'En el primer trimestre el trofoblasto no invade bien la pared uterina y las arterias espirales no se transforman en vasos anchos de baja resistencia.',
      'La placenta queda mal perfundida: isquemia placentaria.',
      'La placenta isquémica libera factores antiangiogénicos (sFlt-1 y endoglina soluble) que secuestran al VEGF y al PlGF. Al feto le llega menos sangre: restricción del crecimiento.',
      'Esos factores producen disfunción endotelial generalizada en la madre. Es una enfermedad sistémica.',
      'Tres efectos: vasoconstricción (predomina el tromboxano sobre la prostaciclina), aumento de la permeabilidad capilar y activación plaquetaria.',
      'Hipertensión ≥ 140/90 después de la semana 20, proteinuria y edema. Los signos de gravedad: cefalea, escotomas, epigastralgia y HELLP (hemólisis, enzimas hepáticas elevadas, plaquetas bajas).',
      'La complicación neurológica más temida es la eclampsia: convulsiones tónico-clónicas que no se explican por otra causa.',
    ],
    nodes: [
      { id: 'placenta', label: 'Invasión\ntrofoblástica pobre', detail: 'Las arterias espirales conservan su capa muscular y siguen siendo estrechas. Factores de riesgo: primigesta, preeclampsia previa, HTA crónica, DM, enfermedad renal, embarazo múltiple, obesidad, lupus o SAF.', kind: 'causa', col: 1, row: 0, step: 1 },
      { id: 'isquemia', label: 'Isquemia\nplacentaria', detail: 'Hipoxia y estrés oxidativo del trofoblasto.', kind: 'mecanismo', col: 1, row: 1, step: 2 },
      { id: 'factores', label: '↑ sFlt-1, endoglina\n↓ PlGF', detail: 'El cociente sFlt-1/PlGF alto ayuda a predecir la preeclampsia. Sin VEGF ni PlGF, el endotelio pierde su protección.', kind: 'mecanismo', col: 1, row: 2, step: 3 },
      { id: 'rciu', label: 'RCIU y\noligohidramnios', detail: 'Restricción del crecimiento intrauterino por la mala perfusión placentaria; Doppler umbilical alterado.', kind: 'clinica', col: 2, row: 2, step: 3 },
      { id: 'endot', label: 'Disfunción\nendotelial materna', detail: 'Riñón (endoteliosis glomerular, la lesión típica), hígado, cerebro y coagulación.', kind: 'mecanismo', col: 1, row: 3, step: 4 },
      { id: 'vasoc', label: 'Vasoconstricción\n(↑ TxA₂, ↓ PGI₂)', detail: 'Más sensibilidad a la angiotensina II y desequilibrio tromboxano/prostaciclina.', kind: 'mecanismo', col: 0, row: 4, step: 5 },
      { id: 'perm', label: '↑ Permeabilidad\ncapilar', detail: 'Edema que puede llegar a edema pulmonar, aunque el volumen intravascular esté bajo.', kind: 'mecanismo', col: 1, row: 4, step: 5 },
      { id: 'plaq', label: 'Activación\nplaquetaria', detail: 'Consumo de plaquetas y microangiopatía con hemólisis.', kind: 'mecanismo', col: 2, row: 4, step: 5 },
      { id: 'hta', label: 'HTA ≥ 140/90\ncefalea, escotomas', detail: 'Grave si ≥ 160/110 o hay síntomas: cefalea intensa, alteraciones visuales, epigastralgia, oliguria, edema pulmonar, creatinina > 1,1 mg/dL.', kind: 'clinica', col: 0, row: 5, step: 6 },
      { id: 'proteinuria', label: 'Proteinuria\ny edema', detail: 'Proteinuria ≥ 300 mg/24 h o cociente proteína/creatinina ≥ 0,3. No es obligatoria si hay signos de daño de órgano.', kind: 'clinica', col: 1, row: 5, step: 6 },
      { id: 'hellp', label: 'Síndrome HELLP\n(↓ plaquetas)', detail: 'Plaquetas < 100 000/µL, AST/ALT al doble de lo normal, LDH elevada y esquistocitos. Riesgo de hematoma subcapsular hepático.', kind: 'desenlace', col: 2, row: 5, step: 6 },
      { id: 'eclampsia', label: 'Eclampsia\n(convulsiones)', detail: 'Convulsiones tónico-clónicas en una gestante con preeclampsia. Puede ocurrir hasta el puerperio.', kind: 'desenlace', col: 0, row: 6, step: 7 },
    ],
    edges: [
      { from: 'placenta', to: 'isquemia' },
      { from: 'isquemia', to: 'factores' },
      { from: 'isquemia', to: 'rciu' },
      { from: 'factores', to: 'endot' },
      { from: 'endot', to: 'vasoc' },
      { from: 'endot', to: 'perm' },
      { from: 'endot', to: 'plaq' },
      { from: 'vasoc', to: 'hta' },
      { from: 'perm', to: 'proteinuria' },
      { from: 'plaq', to: 'hellp' },
      { from: 'hta', to: 'eclampsia' },
    ],
    drugs: [
      { name: 'Aspirina 81–150 mg por la noche', target: 'placenta', how: 'Prevención en gestantes de alto riesgo: iniciar entre la semana 12 y la 16 (antes de la 16) y mantener hasta la 36.' },
      { name: 'Labetalol, nifedipino o hidralazina', target: 'hta', how: 'Si la PA es ≥ 160/110, en los primeros 30–60 min, para evitar el ACV. Contraindicados: IECA, ARA-II y nitroprusiato.' },
      { name: 'Sulfato de magnesio', target: 'eclampsia', how: 'Previene y trata las convulsiones (4–6 g IV de impregnación y 1–2 g/h). Toxicidad: se pierde el reflejo rotuliano primero; antídoto, gluconato de calcio.' },
      { name: 'Interrupción del embarazo', target: 'isquemia', how: 'Único tratamiento definitivo. En la preeclampsia con signos de gravedad se interrumpe a las 34 semanas o antes si la madre o el feto empeoran (corticoides para maduración pulmonar si < 34 sem).' },
    ],
    pearl: 'Preeclampsia: HTA después de la semana 20 + proteinuria o daño de órgano. Si una gestante con sulfato de magnesio pierde el reflejo rotuliano, suspende el sulfato y piensa en gluconato de calcio.',
  },
  {
    id: 'aterosclerosis',
    title: 'Aterosclerosis y síndrome coronario agudo',
    short: 'Aterosclerosis y SCA',
    area: 'Cardiología',
    color: '#b91c1c',
    summary: 'La placa crece en silencio durante años; el infarto no ocurre cuando la placa tapa la arteria, sino cuando se rompe y se forma un trombo encima.',
    steps: [
      'El endotelio se daña por hipertensión, tabaco, diabetes, dislipidemia o flujo turbulento en bifurcaciones.',
      'Las LDL entran a la íntima y se oxidan. El endotelio expresa moléculas de adhesión y atrae monocitos.',
      'Los monocitos se vuelven macrófagos que comen LDL oxidada: células espumosas (la estría grasa, primera lesión). Las células musculares lisas migran desde la media.',
      'Se forma la placa: un núcleo lipídico necrótico cubierto por una capa fibrosa.',
      'Si la placa es estable y estrecha la luz > 70 %, da angina cuando aumenta la demanda. Si su capa fibrosa es delgada (placa vulnerable), puede romperse.',
      'El contenido de la placa expuesto activa las plaquetas y la coagulación: trombo.',
      'Trombo que ocluye parcialmente: angina inestable o IAM sin elevación del ST. Oclusión total: IAM con elevación del ST.',
    ],
    nodes: [
      { id: 'endot', label: 'Daño endotelial\n(HTA, tabaco, DM)', detail: 'Factores de riesgo: edad, sexo masculino, antecedente familiar, HTA, diabetes, tabaquismo, LDL alto, HDL bajo, obesidad, sedentarismo.', kind: 'causa', col: 1, row: 0, step: 1 },
      { id: 'ldl', label: 'LDL entra a la\níntima y se oxida', detail: 'La LDL oxidada es quimiotáctica para monocitos y tóxica para el endotelio.', kind: 'mecanismo', col: 1, row: 1, step: 2 },
      { id: 'espuma', label: 'Macrófagos →\ncélulas espumosas', detail: 'Captan LDL oxidada por receptores scavenger, sin freno. Forman la estría grasa, presente incluso en adolescentes.', kind: 'mecanismo', col: 1, row: 2, step: 3 },
      { id: 'musc', label: 'Músculo liso\nmigra y prolifera', detail: 'Estimulado por el factor de crecimiento derivado de plaquetas (PDGF). Produce el colágeno de la capa fibrosa.', kind: 'mecanismo', col: 2, row: 2, step: 3 },
      { id: 'placa', label: 'Placa: lípidos +\ncapa fibrosa', detail: 'Las metaloproteinasas de los macrófagos adelgazan la capa fibrosa: placa vulnerable.', kind: 'mecanismo', col: 1, row: 3, step: 4 },
      { id: 'estable', label: 'Placa estable:\nangina de esfuerzo', detail: 'Estenosis > 70 %: la oferta de O₂ no alcanza cuando sube la demanda. Dolor con el esfuerzo que cede con reposo o nitroglicerina.', kind: 'clinica', col: 0, row: 4, step: 5 },
      { id: 'rotura', label: 'Rotura o erosión\nde la placa', detail: 'Las placas que se rompen suelen ser poco estenóticas pero con mucho lípido y capa fina. Por eso un infarto puede ocurrir sin angina previa.', kind: 'mecanismo', col: 2, row: 4, step: 5 },
      { id: 'trombo', label: 'Trombo:\nplaquetas + fibrina', detail: 'El colágeno y el factor tisular activan plaquetas (adhesión, activación, agregación por GP IIb/IIIa) y la cascada de coagulación.', kind: 'mecanismo', col: 2, row: 5, step: 6 },
      { id: 'iamsest', label: 'Oclusión parcial:\nAI o IAMSEST', detail: 'Angina inestable (troponina normal) o IAM sin elevación del ST (troponina elevada). ECG: descenso del ST o inversión de la T.', kind: 'desenlace', col: 1, row: 6, step: 7 },
      { id: 'iamcest', label: 'Oclusión total:\nIAMCEST', detail: 'Necrosis transmural. Elevación del ST en derivaciones contiguas. Cada minuto cuenta: «el tiempo es músculo».', kind: 'desenlace', col: 2, row: 6, step: 7 },
    ],
    edges: [
      { from: 'endot', to: 'ldl' },
      { from: 'ldl', to: 'espuma' },
      { from: 'ldl', to: 'musc' },
      { from: 'espuma', to: 'placa' },
      { from: 'musc', to: 'placa' },
      { from: 'placa', to: 'estable' },
      { from: 'placa', to: 'rotura' },
      { from: 'rotura', to: 'trombo' },
      { from: 'trombo', to: 'iamsest' },
      { from: 'trombo', to: 'iamcest' },
    ],
    drugs: [
      { name: 'Control de factores de riesgo', target: 'endot', how: 'Dejar de fumar, controlar la PA y la glucosa, ejercicio y dieta. Es la prevención primaria.' },
      { name: 'Estatinas de alta intensidad (atorvastatina 40–80 mg)', target: 'ldl', how: 'Bajan el LDL y estabilizan la placa (engrosan la capa fibrosa). Indicadas en todo SCA, sin importar el colesterol basal.' },
      { name: 'Nitratos y betabloqueantes', target: 'estable', how: 'Reducen la demanda de oxígeno del miocardio: alivian la angina. Nitratos contraindicados con sildenafil o infarto del ventrículo derecho.' },
      { name: 'Aspirina + inhibidor P2Y12 y heparina', target: 'trombo', how: 'Doble antiagregación (clopidogrel, ticagrelor o prasugrel) y anticoagulación en todo SCA.' },
      { name: 'Reperfusión: ICP primaria o fibrinólisis', target: 'iamcest', how: 'ICP en < 120 min desde el diagnóstico; si no es posible, fibrinólisis en < 30 min (ventana de 12 h desde el inicio de los síntomas).' },
    ],
    pearl: 'La mayoría de los infartos nacen de placas que estrechaban menos del 70 % de la luz pero tenían una capa fibrosa delgada. Lo que importa es la vulnerabilidad de la placa, no solo su tamaño.',
  },
]

export type ShockId = 'hipovolemico' | 'cardiogenico' | 'distributivo' | 'obstructivo' | 'neurogenico'
/** −1 baja, 0 normal, 1 sube. `note` aclara cuando depende de la causa. */
export interface ShockValue {
  v: -1 | 0 | 1
  note?: string
}

export interface ShockType {
  id: ShockId
  name: string
  color: string
  causes: string
  /** Precarga (PVC), presión capilar pulmonar, gasto cardíaco, resistencia vascular sistémica, SvO₂, frecuencia cardíaca. */
  pvc: ShockValue
  pcp: ShockValue
  gc: ShockValue
  rvs: ShockValue
  svo2: ShockValue
  fc: ShockValue
  skin: 'fria' | 'caliente'
  mechanism: string
  clue: string
  treatment: string
}

export const SHOCK_PARAMS: { key: 'pvc' | 'pcp' | 'gc' | 'rvs' | 'svo2' | 'fc'; label: string; hint: string }[] = [
  { key: 'pvc', label: 'PVC', hint: 'Presión venosa central (precarga derecha)' },
  { key: 'pcp', label: 'PCP', hint: 'Presión capilar pulmonar (precarga izquierda)' },
  { key: 'gc', label: 'Gasto cardíaco', hint: 'Litros por minuto que bombea el corazón' },
  { key: 'rvs', label: 'RVS', hint: 'Resistencia vascular sistémica (poscarga)' },
  { key: 'svo2', label: 'SvO₂', hint: 'Saturación venosa mixta: cuánto O₂ queda al volver' },
  { key: 'fc', label: 'Frecuencia', hint: 'Frecuencia cardíaca' },
]

export const SHOCKS: ShockType[] = [
  {
    id: 'hipovolemico',
    name: 'Hipovolémico',
    color: '#dc2626',
    causes: 'Hemorragia (trauma, sangrado digestivo), diarrea, vómitos, quemaduras, tercer espacio.',
    pvc: { v: -1 },
    pcp: { v: -1 },
    gc: { v: -1 },
    rvs: { v: 1 },
    svo2: { v: -1 },
    fc: { v: 1 },
    skin: 'fria',
    mechanism: 'Falta volumen: el corazón se llena poco (precarga baja) y bombea poco. El simpático contrae los vasos para sostener la presión.',
    clue: 'Yugulares planas, piel fría y pálida, llenado capilar lento. En el trauma, la hipotensión aparece cuando ya se perdió > 30 % de la volemia (clase III).',
    treatment: 'Reponer lo que se perdió: cristaloides tibios y, si es sangre, hemoderivados (1:1:1) y controlar el sangrado.',
  },
  {
    id: 'cardiogenico',
    name: 'Cardiogénico',
    color: '#be185d',
    causes: 'Infarto extenso (la más común), miocarditis, arritmias, rotura valvular o del tabique.',
    pvc: { v: 1 },
    pcp: { v: 1 },
    gc: { v: -1 },
    rvs: { v: 1 },
    svo2: { v: -1 },
    fc: { v: 1 },
    skin: 'fria',
    mechanism: 'Falla la bomba: la sangre se acumula detrás del corazón (presiones de llenado altas) y adelante no llega flujo.',
    clue: 'Piel fría con congestión: crepitantes pulmonares, ingurgitación yugular, tercer ruido. Índice cardíaco < 2,2 L/min/m² con PCP > 15 mmHg.',
    treatment: 'Revascularización urgente si es un infarto. Norepinefrina si hay hipotensión e inotrópico (dobutamina) para el gasto. Cuidado con los líquidos.',
  },
  {
    id: 'distributivo',
    name: 'Distributivo (séptico)',
    color: '#ea580c',
    causes: 'Sepsis (el más común), anafilaxia, insuficiencia suprarrenal.',
    pvc: { v: -1, note: 'Baja o normal' },
    pcp: { v: -1, note: 'Baja o normal' },
    gc: { v: 1, note: 'Alto al inicio' },
    rvs: { v: -1 },
    svo2: { v: 1 },
    fc: { v: 1 },
    skin: 'caliente',
    mechanism: 'Los vasos se dilatan de forma masiva: el continente crece y el contenido no alcanza. El corazón compensa bombeando más.',
    clue: 'Piel caliente y enrojecida al inicio, pulso saltón, presión diferencial amplia. SvO₂ alta porque los tejidos no extraen el oxígeno.',
    treatment: 'Sepsis: cristaloides 30 mL/kg, antibiótico en la primera hora y norepinefrina. Anafilaxia: adrenalina 0,5 mg IM en el muslo.',
  },
  {
    id: 'obstructivo',
    name: 'Obstructivo',
    color: '#7c3aed',
    causes: 'Taponamiento cardíaco, neumotórax a tensión, tromboembolismo pulmonar masivo.',
    pvc: { v: 1 },
    pcp: { v: 0, note: '↑ en taponamiento, ↓ en TEP' },
    gc: { v: -1 },
    rvs: { v: 1 },
    svo2: { v: -1 },
    fc: { v: 1 },
    skin: 'fria',
    mechanism: 'Algo impide que la sangre entre o salga del corazón: el corazón está sano pero no puede llenarse o vaciarse.',
    clue: 'Ingurgitación yugular con pulmones limpios. Taponamiento: tríada de Beck y pulso paradójico. Neumotórax: murmullo abolido, timpanismo, tráquea desviada.',
    treatment: 'Quitar la obstrucción: pericardiocentesis, descompresión con aguja y tubo de tórax, o trombólisis en el TEP masivo.',
  },
  {
    id: 'neurogenico',
    name: 'Neurogénico',
    color: '#0891b2',
    causes: 'Lesión medular por encima de T6, anestesia raquídea alta.',
    pvc: { v: -1 },
    pcp: { v: -1 },
    gc: { v: -1, note: 'Bajo o normal' },
    rvs: { v: -1 },
    svo2: { v: 0, note: 'Variable' },
    fc: { v: -1 },
    skin: 'caliente',
    mechanism: 'Se corta la vía simpática: los vasos se dilatan y el corazón queda dominado por el vago.',
    clue: 'Hipotensión con bradicardia y piel caliente y seca en un paciente con trauma raquimedular. Es el único shock sin taquicardia.',
    treatment: 'Descartar primero la hemorragia. Líquidos, vasopresor (norepinefrina) y atropina si la bradicardia es sintomática.',
  },
]

export const PHYSIO_QUIZ: QuizItem[] = [
  { q: 'En la insuficiencia cardíaca, ¿qué sistema explica principalmente la retención de sodio y agua?', options: ['El parasimpático', 'El renina-angiotensina-aldosterona', 'Los péptidos natriuréticos', 'La hormona tiroidea'], answer: 1, why: 'La hipoperfusión renal libera renina; la angiotensina II y la aldosterona retienen sodio y agua. Los péptidos natriuréticos hacen lo contrario.' },
  { q: '¿Cuál de estos fármacos NO reduce la mortalidad en la insuficiencia cardíaca con FEVI reducida?', options: ['Bisoprolol', 'Dapagliflozina', 'Furosemida', 'Espironolactona'], answer: 2, why: 'La furosemida alivia la congestión pero no cambia la mortalidad. Betabloqueante, iSGLT2, antagonista de la aldosterona y ARNI son los cuatro pilares.' },
  { q: 'Shock con PVC baja, gasto cardíaco alto, RVS baja y piel caliente. ¿Qué tipo es?', options: ['Hipovolémico', 'Cardiogénico', 'Distributivo', 'Obstructivo'], answer: 2, why: 'La vasodilatación baja la RVS y el corazón compensa con gasto alto: shock distributivo, típicamente séptico.' },
  { q: 'Hipotensión con bradicardia y piel caliente tras una caída con lesión cervical. ¿Qué shock es?', options: ['Hipovolémico', 'Neurogénico', 'Séptico', 'Cardiogénico'], answer: 1, why: 'La lesión medular alta corta el simpático: vasodilatación sin taquicardia compensatoria. Primero descarta hemorragia.' },
  { q: 'Paciente con cetoacidosis y K⁺ de 3,0 mEq/L. ¿Qué haces primero?', options: ['Insulina en bolo', 'Reponer potasio y retrasar la insulina', 'Bicarbonato', 'Solo observar'], answer: 1, why: 'La insulina mete el potasio en la célula; con K⁺ bajo puede provocar una arritmia. Se repone primero (y se dan líquidos).' },
  { q: '¿Por qué el potasio sérico puede estar alto en la cetoacidosis aunque el total esté bajo?', options: ['Por exceso de insulina', 'Porque la acidosis y el déficit de insulina sacan el K⁺ de la célula', 'Por insuficiencia suprarrenal', 'Por error de laboratorio'], answer: 1, why: 'El K⁺ pasa del intracelular al plasma, mientras la diuresis osmótica lo elimina por la orina: el total corporal cae.' },
  { q: '¿Qué tipo de acidosis da la cetoacidosis diabética?', options: ['Metabólica con anión GAP normal', 'Metabólica con anión GAP elevado', 'Respiratoria', 'Alcalosis metabólica'], answer: 1, why: 'Los cetoácidos (β-hidroxibutirato y acetoacetato) son aniones no medidos que consumen bicarbonato: anión GAP alto.' },
  { q: 'En la cirrosis, ¿cuál es el mecanismo central de la ascitis?', options: ['Solo la hipoalbuminemia', 'Hipertensión portal con vasodilatación esplácnica que activa el SRAA', 'Obstrucción linfática', 'Insuficiencia cardíaca derecha'], answer: 1, why: 'La vasodilatación esplácnica baja el volumen efectivo, se activan SRAA y ADH y se retiene sodio y agua. La albúmina baja contribuye, pero no es el motor.' },
  { q: '¿Cómo actúa la lactulosa en la encefalopatía hepática?', options: ['Aumenta la síntesis de urea', 'Acidifica el colon y atrapa el amonio como NH₄⁺', 'Mata bacterias productoras de amonio', 'Aumenta la albúmina'], answer: 1, why: 'El pH ácido convierte el NH₃ en NH₄⁺, que no se absorbe y se elimina con las heces. La rifaximina es la que reduce las bacterias.' },
  { q: 'Crisis asmática con PaCO₂ de 44 mmHg. ¿Qué significa?', options: ['Que la crisis es leve', 'Que el paciente se está fatigando: crisis grave', 'Que tiene alcalosis respiratoria', 'Que no es asma'], answer: 1, why: 'En la crisis se espera hiperventilación con PaCO₂ baja. Una PaCO₂ normal o alta indica agotamiento e insuficiencia respiratoria inminente.' },
  { q: '¿Qué célula domina la fase tardía de la reacción asmática?', options: ['Neutrófilo', 'Eosinófilo', 'Plaqueta', 'Linfocito B'], answer: 1, why: 'A las 4–8 horas llegan eosinófilos y Th2 (IL-5 recluta eosinófilos). Por eso el mepolizumab (anti-IL-5) sirve en el asma eosinofílica.' },
  { q: 'En el síndrome nefrótico, ¿por qué hay hipercoagulabilidad?', options: ['Por pérdida urinaria de antitrombina III', 'Por exceso de vitamina K', 'Por plaquetopenia', 'Por hipertensión'], answer: 0, why: 'La antitrombina III es pequeña y se pierde por la orina; además el hígado fabrica más fibrinógeno. Típica: trombosis de la vena renal.' },
  { q: '¿Cuál es la causa más frecuente de síndrome nefrótico en niños?', options: ['Nefropatía membranosa', 'Enfermedad de cambios mínimos', 'Nefropatía por IgA', 'Glomerulonefritis postestreptocócica'], answer: 1, why: 'Cambios mínimos: podocitos con borramiento de pedicelos en microscopía electrónica y excelente respuesta a corticoides.' },
  { q: '¿Qué alteración placentaria inicia la preeclampsia?', options: ['Exceso de invasión trofoblástica', 'Remodelación deficiente de las arterias espirales', 'Infección placentaria', 'Desprendimiento de placenta'], answer: 1, why: 'Las arterias espirales siguen estrechas: isquemia placentaria → factores antiangiogénicos (sFlt-1) → disfunción endotelial materna.' },
  { q: 'Gestante con sulfato de magnesio que pierde el reflejo rotuliano. ¿Qué haces?', options: ['Aumentar la dosis', 'Suspender el sulfato y valorar gluconato de calcio', 'Dar diazepam', 'Nada, es esperable'], answer: 1, why: 'La pérdida del reflejo rotuliano es el primer signo de toxicidad (antes de la depresión respiratoria). El antídoto es el gluconato de calcio.' },
  { q: '¿Qué hace que una placa aterosclerótica cause un infarto?', options: ['Que estreche más del 90 % de la luz lentamente', 'Que se rompa su capa fibrosa y se forme un trombo', 'Que se calcifique', 'Que tenga mucho músculo liso'], answer: 1, why: 'La placa vulnerable (núcleo lipídico grande, capa fibrosa fina) se rompe y expone material trombogénico. Muchas eran poco estenóticas.' },
  { q: '¿Qué célula forma la estría grasa, primera lesión de la aterosclerosis?', options: ['Neutrófilo', 'Célula espumosa (macrófago con LDL oxidada)', 'Fibroblasto', 'Eosinófilo'], answer: 1, why: 'Los monocitos entran a la íntima, se vuelven macrófagos y captan LDL oxidada por receptores scavenger sin regulación.' },
  { q: 'Sepsis: ¿qué mediador explica sobre todo la vasodilatación?', options: ['Histamina', 'Óxido nítrico', 'Angiotensina II', 'Endotelina'], answer: 1, why: 'Las citocinas inducen la óxido nítrico sintasa inducible; el NO relaja el músculo liso vascular de forma masiva.' },
]

export const PHYSIO_REFERENCES = [
  'Hall JE, Hall ME. Guyton y Hall. Tratado de fisiología médica. 14.ª ed. Elsevier; 2021.',
  'Kumar V, Abbas AK, Aster JC. Robbins y Cotran. Patología estructural y funcional. 10.ª ed. Elsevier; 2021.',
  'McDonagh TA, et al. 2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure (y actualización 2023). Eur Heart J. 2021;42:3599–3726.',
  'Evans L, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Crit Care Med. 2021;49:e1063–e1143.',
  'Umpierrez GE, et al. Hyperglycemic Crises in Adults With Diabetes: A Consensus Report. Diabetes Care. 2024;47:1257–1275.',
  'European Association for the Study of the Liver. EASL Clinical Practice Guidelines on the management of patients with decompensated cirrhosis. J Hepatol. 2018;69:406–460. de Franchis R, et al. Baveno VII. J Hepatol. 2022;76:959–974.',
  'Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention, 2024.',
  'KDIGO 2021 Clinical Practice Guideline for the Management of Glomerular Diseases. Kidney Int. 2021;100:S1–S276.',
  'ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia. Obstet Gynecol. 2020;135:e237–e260.',
  'Byrne RA, et al. 2023 ESC Guidelines for the management of acute coronary syndromes. Eur Heart J. 2023;44:3720–3826.',
]
