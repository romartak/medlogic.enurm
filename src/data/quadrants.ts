/**
 * Topografía abdominal: las 9 regiones y los 4 cuadrantes, con los órganos y los dolores típicos de cada una.
 * Las regiones se nombran desde el paciente: su derecha queda a la izquierda de quien lo mira de frente.
 */

export type Region = 'hd' | 'epi' | 'hi' | 'fd' | 'meso' | 'fi' | 'fid' | 'hipo' | 'fii'
export type Quadrant = 'csd' | 'csi' | 'cid' | 'cii'

/** En el orden en que se ven de frente: fila superior, media e inferior; la derecha del paciente primero. */
export const REGIONS: { id: Region; name: string; organs: string }[] = [
  { id: 'hd', name: 'Hipocondrio derecho', organs: 'Hígado, vesícula biliar, ángulo hepático del colon, polo superior del riñón derecho' },
  { id: 'epi', name: 'Epigastrio', organs: 'Estómago, lóbulo izquierdo del hígado, páncreas, duodeno, aorta' },
  { id: 'hi', name: 'Hipocondrio izquierdo', organs: 'Bazo, fondo gástrico, cola del páncreas, ángulo esplénico del colon' },
  { id: 'fd', name: 'Flanco derecho', organs: 'Colon ascendente, riñón y uréter derechos' },
  { id: 'meso', name: 'Mesogastrio (umbilical)', organs: 'Intestino delgado, colon transverso, aorta y su bifurcación' },
  { id: 'fi', name: 'Flanco izquierdo', organs: 'Colon descendente, riñón y uréter izquierdos' },
  { id: 'fid', name: 'Fosa ilíaca derecha', organs: 'Ciego, apéndice, ovario y trompa derechos' },
  { id: 'hipo', name: 'Hipogastrio', organs: 'Vejiga, útero, recto' },
  { id: 'fii', name: 'Fosa ilíaca izquierda', organs: 'Colon sigmoides, ovario y trompa izquierdos' },
]

export const QUADRANTS: { id: Quadrant; name: string; organs: string }[] = [
  { id: 'csd', name: 'Cuadrante superior derecho', organs: 'Hígado, vesícula, duodeno, cabeza del páncreas, riñón derecho' },
  { id: 'csi', name: 'Cuadrante superior izquierdo', organs: 'Estómago, bazo, cuerpo y cola del páncreas, riñón izquierdo' },
  { id: 'cid', name: 'Cuadrante inferior derecho', organs: 'Ciego, apéndice, ovario derecho, uréter derecho' },
  { id: 'cii', name: 'Cuadrante inferior izquierdo', organs: 'Colon sigmoides y descendente, ovario izquierdo, uréter izquierdo' },
]

export interface TopoItem {
  prompt: string
  kind: 'órgano' | 'dolor'
  /** Regiones que se aceptan como correctas (la primera es la típica). */
  regions: Region[]
  /** Cuadrantes aceptados; si falta, la pregunta no se usa en el modo de 4 cuadrantes (estructuras de la línea media). */
  quadrants?: Quadrant[]
  why: string
}

export const TOPO_ITEMS: TopoItem[] = [
  { kind: 'órgano', prompt: 'Bazo', regions: ['hi'], quadrants: ['csi'], why: 'El bazo está en el hipocondrio izquierdo, protegido por las costillas 9.ª a 11.ª.' },
  { kind: 'órgano', prompt: 'Vesícula biliar', regions: ['hd'], quadrants: ['csd'], why: 'Bajo el hígado, donde el borde costal derecho cruza la línea medioclavicular (punto de Murphy).' },
  { kind: 'órgano', prompt: 'Hígado (la mayor parte)', regions: ['hd', 'epi'], quadrants: ['csd'], why: 'Ocupa el hipocondrio derecho y su lóbulo izquierdo llega al epigastrio.' },
  { kind: 'órgano', prompt: 'Estómago', regions: ['epi', 'hi'], quadrants: ['csi'], why: 'Epigastrio e hipocondrio izquierdo (el fondo gástrico).' },
  { kind: 'órgano', prompt: 'Apéndice', regions: ['fid'], quadrants: ['cid'], why: 'En la fosa ilíaca derecha, en el ciego; su base corresponde al punto de McBurney.' },
  { kind: 'órgano', prompt: 'Colon sigmoides', regions: ['fii'], quadrants: ['cii'], why: 'En la fosa ilíaca izquierda, antes del recto.' },
  { kind: 'órgano', prompt: 'Colon ascendente', regions: ['fd'], quadrants: ['csd', 'cid'], why: 'Sube por el flanco derecho desde el ciego hasta el ángulo hepático.' },
  { kind: 'órgano', prompt: 'Colon descendente', regions: ['fi'], quadrants: ['csi', 'cii'], why: 'Baja por el flanco izquierdo desde el ángulo esplénico.' },
  { kind: 'órgano', prompt: 'Riñón izquierdo', regions: ['fi', 'hi'], quadrants: ['csi'], why: 'Es retroperitoneal y está algo más alto que el derecho; se proyecta en el flanco e hipocondrio izquierdos.' },
  { kind: 'órgano', prompt: 'Riñón derecho', regions: ['fd', 'hd'], quadrants: ['csd'], why: 'Retroperitoneal, un poco más bajo que el izquierdo por el hígado.' },
  { kind: 'órgano', prompt: 'Vejiga llena', regions: ['hipo'], why: 'Al llenarse sube por encima del pubis, en el hipogastrio (línea media).' },
  { kind: 'órgano', prompt: 'Intestino delgado (yeyuno e íleon)', regions: ['meso'], why: 'Las asas ocupan sobre todo la región umbilical.' },
  { kind: 'órgano', prompt: 'Cola del páncreas', regions: ['hi', 'epi'], quadrants: ['csi'], why: 'La cabeza está a la derecha de la línea media y la cola llega al hilio del bazo, en el hipocondrio izquierdo.' },
  { kind: 'órgano', prompt: 'Ovario derecho', regions: ['fid'], quadrants: ['cid'], why: 'En la fosa ilíaca derecha: por eso la patología anexial derecha se confunde con apendicitis.' },
  { kind: 'dolor', prompt: 'Colecistitis aguda (signo de Murphy)', regions: ['hd'], quadrants: ['csd'], why: 'Dolor en el hipocondrio derecho que puede irradiarse a la escápula derecha.' },
  { kind: 'dolor', prompt: 'Apendicitis ya establecida', regions: ['fid'], quadrants: ['cid'], why: 'Cuando se inflama el peritoneo parietal, el dolor se localiza en la fosa ilíaca derecha (McBurney).' },
  { kind: 'dolor', prompt: 'Apendicitis en sus primeras horas', regions: ['meso', 'epi'], why: 'El dolor visceral inicial es periumbilical o epigástrico y luego migra a la fosa ilíaca derecha.' },
  { kind: 'dolor', prompt: 'Diverticulitis (la más frecuente en occidentales)', regions: ['fii'], quadrants: ['cii'], why: 'Afecta casi siempre al sigmoides: «apendicitis del lado izquierdo».' },
  { kind: 'dolor', prompt: 'Pancreatitis aguda', regions: ['epi'], why: 'Dolor epigástrico intenso irradiado a la espalda «en cinturón».' },
  { kind: 'dolor', prompt: 'Úlcera péptica', regions: ['epi'], why: 'Dolor epigástrico urente; la duodenal mejora al comer y la gástrica empeora.' },
  { kind: 'dolor', prompt: 'Retención aguda de orina', regions: ['hipo'], why: 'Globo vesical doloroso y mate a la percusión sobre el pubis.' },
  { kind: 'dolor', prompt: 'Cólico renal izquierdo', regions: ['fi'], quadrants: ['csi', 'cii'], why: 'Dolor lumbar y del flanco que se irradia hacia la ingle y los genitales; Giordano positivo.' },
  { kind: 'dolor', prompt: 'Rotura esplénica (con dolor en el hombro izquierdo)', regions: ['hi'], quadrants: ['csi'], why: 'Hipocondrio izquierdo; la sangre irrita el diafragma y da dolor en el hombro (signo de Kehr).' },
  { kind: 'dolor', prompt: 'Absceso hepático', regions: ['hd'], quadrants: ['csd'], why: 'Fiebre con dolor y hepatomegalia dolorosa en el hipocondrio derecho.' },
  { kind: 'dolor', prompt: 'Embarazo ectópico roto en la trompa derecha', regions: ['fid', 'hipo'], quadrants: ['cid'], why: 'Dolor en la fosa ilíaca derecha y el hipogastrio con signos de sangrado: β-hCG en toda mujer en edad fértil.' },
]
