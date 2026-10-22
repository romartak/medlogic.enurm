/** Contenido para los juegos que no dependen del banco de preguntas. */

export interface TrueFalseItem {
  statement: string
  answer: boolean
  explanation: string
}

export const TRUE_FALSE: TrueFalseItem[] = [
  { statement: 'La ictericia que aparece en las primeras 24 horas de vida es fisiológica.', answer: false, explanation: 'En las primeras 24 h siempre es patológica.' },
  { statement: 'El sulfato de magnesio es el fármaco de elección para prevenir convulsiones en preeclampsia grave.', answer: true, explanation: 'Su antídoto es el gluconato de calcio.' },
  { statement: 'En el dengue se recomienda ibuprofeno para la fiebre.', answer: false, explanation: 'Se usa paracetamol; los AINE aumentan el riesgo de sangrado.' },
  { statement: 'La causa más frecuente de pancreatitis aguda es la litiasis biliar.', answer: true, explanation: 'Seguida del alcohol.' },
  { statement: 'La sensibilidad de una prueba depende de la prevalencia de la enfermedad.', answer: false, explanation: 'Los valores predictivos dependen de la prevalencia; la sensibilidad no.' },
  { statement: 'El nervio radial se lesiona típicamente en fracturas de la diáfisis humeral.', answer: true, explanation: 'Produce "mano en gota".' },
  { statement: 'La adrenalina en la anafilaxia se administra preferentemente por vía subcutánea.', answer: false, explanation: 'Por vía intramuscular, en la cara anterolateral del muslo.' },
  { statement: 'El VSR es la causa más frecuente de bronquiolitis.', answer: true, explanation: 'Con pico en menores de 6 meses.' },
  { statement: 'En el infarto de ventrículo derecho los nitratos son de primera línea para el dolor.', answer: false, explanation: 'Están contraindicados: el VD depende de la precarga.' },
  { statement: 'La enfermedad de cambios mínimos es la causa más frecuente de síndrome nefrótico en niños.', answer: true, explanation: 'Responde muy bien a corticoides.' },
  { statement: 'Los IECA son seguros durante el embarazo.', answer: false, explanation: 'Son teratogénicos (fetopatía renal).' },
  { statement: 'La torsión testicular es una emergencia quirúrgica.', answer: true, explanation: 'Idealmente resolver en menos de 6 horas.' },
  { statement: 'El déficit de ácido fólico produce degeneración combinada subaguda de la médula.', answer: false, explanation: 'Eso es propio del déficit de vitamina B12.' },
  { statement: 'La odds ratio es la medida de asociación de los estudios de casos y controles.', answer: true, explanation: 'En cohortes se usa el riesgo relativo.' },
  { statement: 'La hipokalemia se asocia a ondas T picudas en el ECG.', answer: false, explanation: 'Las T picudas son de hiperkalemia; la hipokalemia da ondas U.' },
  { statement: 'En la cetoacidosis diabética, si el potasio es < 3,3 mEq/L se repone antes de iniciar insulina.', answer: true, explanation: 'La insulina mete potasio a la célula y puede causar arritmias.' },
  { statement: 'La tríada de Beck incluye hipertensión, bradicardia y respiración irregular.', answer: false, explanation: 'Esa es la tríada de Cushing. Beck: hipotensión, ingurgitación yugular y ruidos apagados.' },
  { statement: 'La hernia inguinal indirecta es la más frecuente en ambos sexos.', answer: true, explanation: 'Sale por el anillo inguinal profundo, lateral a los vasos epigástricos.' },
  { statement: 'La vacuna BCG se aplica al nacer.', answer: true, explanation: 'Junto con la primera dosis de hepatitis B.' },
  { statement: 'La corrección rápida de la hiponatremia crónica es segura.', answer: false, explanation: 'Riesgo de desmielinización osmótica: máximo 8–10 mEq/L en 24 h.' },
]

export interface MatchPair {
  a: string
  b: string
}

export const MATCH_SETS: { id: string; name: string; pairs: MatchPair[] }[] = [
  {
    id: 'antidotos',
    name: 'Tóxico ↔ Antídoto',
    pairs: [
      { a: 'Paracetamol', b: 'N-acetilcisteína' },
      { a: 'Opioides', b: 'Naloxona' },
      { a: 'Benzodiacepinas', b: 'Flumazenil' },
      { a: 'Organofosforados', b: 'Atropina' },
      { a: 'Heparina', b: 'Protamina' },
      { a: 'Warfarina', b: 'Vitamina K' },
      { a: 'Betabloqueadores', b: 'Glucagón' },
      { a: 'Hierro', b: 'Deferoxamina' },
    ],
  },
  {
    id: 'signos',
    name: 'Signo ↔ Enfermedad',
    pairs: [
      { a: 'Murphy', b: 'Colecistitis' },
      { a: 'Rovsing', b: 'Apendicitis' },
      { a: 'Koplik', b: 'Sarampión' },
      { a: 'Tríada de Beck', b: 'Taponamiento' },
      { a: 'Chvostek', b: 'Hipocalcemia' },
      { a: 'Courvoisier', b: 'Cáncer de páncreas' },
      { a: 'Kernig', b: 'Meningitis' },
      { a: 'Nikolsky', b: 'Pénfigo vulgar' },
    ],
  },
  {
    id: 'agentes',
    name: 'Enfermedad ↔ Agente',
    pairs: [
      { a: 'Bronquiolitis', b: 'VSR' },
      { a: 'Crup', b: 'Parainfluenza' },
      { a: 'Cáncer de cérvix', b: 'VPH 16/18' },
      { a: 'Sífilis', b: 'Treponema pallidum' },
      { a: 'Enfermedad de Weil', b: 'Leptospira' },
      { a: 'Úlcera péptica', b: 'H. pylori' },
      { a: 'Neumonía en VIH (CD4 < 200)', b: 'Pneumocystis' },
      { a: 'Eritema infeccioso', b: 'Parvovirus B19' },
    ],
  },
]

export interface ClueCase {
  diagnosis: string
  clues: string[]
  options: string[]
  explanation: string
}

/** "Diagnóstico en 5 pistas": las pistas van de la más vaga a la más específica. */
export const CLUE_CASES: ClueCase[] = [
  {
    diagnosis: 'Leptospirosis',
    clues: ['Hombre de 35 años con fiebre alta de inicio súbito.', 'Trabaja en arrozales y hubo inundaciones hace 10 días.', 'Mialgias intensas, sobre todo en pantorrillas.', 'Sufusión conjuntival bilateral.', 'Ictericia, oliguria y creatinina elevada.'],
    options: ['Dengue', 'Leptospirosis', 'Hepatitis A', 'Malaria'],
    explanation: 'La exposición a agua contaminada con orina de roedores, la mialgia en pantorrillas y la sufusión conjuntival son clásicas. Con ictericia y falla renal: enfermedad de Weil.',
  },
  {
    diagnosis: 'Embarazo ectópico roto',
    clues: ['Mujer de 27 años con dolor abdominal.', 'Retraso menstrual de 7 semanas.', 'Sangrado vaginal escaso.', 'Dolor en el hombro derecho y mareo.', 'β-hCG positiva con útero vacío y líquido libre en fondo de saco.'],
    options: ['Apendicitis', 'Embarazo ectópico roto', 'Aborto incompleto', 'Quiste ovárico torcido'],
    explanation: 'Amenorrea + dolor + sangrado es la tríada clásica. El dolor referido al hombro (signo de Kehr) indica hemoperitoneo.',
  },
  {
    diagnosis: 'Estenosis hipertrófica del píloro',
    clues: ['Lactante varón de 4 semanas.', 'Vómitos que empeoran cada día.', 'Los vómitos son en proyectil y no biliosos.', 'Queda con hambre tras vomitar.', 'Se palpa una "oliva" en epigastrio; alcalosis hipoclorémica.'],
    options: ['Reflujo gastroesofágico', 'Estenosis hipertrófica del píloro', 'Malrotación intestinal', 'Invaginación intestinal'],
    explanation: 'Típica de varones primogénitos entre las 3 y 6 semanas. El diagnóstico se confirma por ecografía; tratamiento: piloromiotomía tras corregir electrolitos.',
  },
  {
    diagnosis: 'Taponamiento cardíaco',
    clues: ['Paciente de 60 años con disnea progresiva.', 'Antecedente de cáncer de pulmón.', 'Taquicardia e hipotensión.', 'Ingurgitación yugular y ruidos cardíacos apagados.', 'Pulso paradójico y alternancia eléctrica en el ECG.'],
    options: ['Taponamiento cardíaco', 'Neumotórax a tensión', 'Tromboembolismo pulmonar', 'Infarto de VD'],
    explanation: 'Tríada de Beck + pulso paradójico + alternancia eléctrica. Tratamiento: pericardiocentesis.',
  },
  {
    diagnosis: 'Enfermedad de Kawasaki',
    clues: ['Niño de 2 años con fiebre.', 'La fiebre lleva 6 días y no cede con antipiréticos.', 'Conjuntivitis bilateral sin secreción.', 'Labios fisurados y lengua en fresa.', 'Edema de manos y pies con descamación periungueal posterior.'],
    options: ['Escarlatina', 'Sarampión', 'Enfermedad de Kawasaki', 'Síndrome de Stevens-Johnson'],
    explanation: 'Fiebre ≥ 5 días + 4 de 5 criterios. Riesgo principal: aneurismas coronarios. Tratamiento: IgIV + aspirina.',
  },
  {
    diagnosis: 'Cetoacidosis diabética',
    clues: ['Joven de 19 años traído por somnolencia.', 'Desde hace una semana tiene mucha sed y orina mucho.', 'Dolor abdominal y vómitos.', 'Respiración profunda y rápida con aliento afrutado.', 'Glucosa de 480 mg/dL, pH 7,10 y cetonas positivas.'],
    options: ['Estado hiperosmolar hiperglucémico', 'Cetoacidosis diabética', 'Pancreatitis aguda', 'Intoxicación por salicilatos'],
    explanation: 'Hiperglucemia + acidosis metabólica con anion gap elevado + cetonemia. La respiración de Kussmaul es compensación respiratoria.',
  },
  {
    diagnosis: 'Hemorragia subaracnoidea',
    clues: ['Mujer de 48 años con cefalea.', 'La cefalea comenzó de forma súbita durante el ejercicio.', 'La describe como "la peor de su vida".', 'Vómitos y rigidez de nuca.', 'TC sin contraste: sangre en cisternas basales.'],
    options: ['Migraña', 'Meningitis bacteriana', 'Hemorragia subaracnoidea', 'Hematoma subdural'],
    explanation: 'Cefalea en "trueno". La causa no traumática más frecuente es la rotura de un aneurisma sacular.',
  },
  {
    diagnosis: 'Intoxicación por organofosforados',
    clues: ['Hombre de 40 años traído a emergencias.', 'Es agricultor y estaba fumigando.', 'Sudoración profusa, salivación y lagrimeo.', 'Miosis puntiforme y bradicardia.', 'Broncorrea y fasciculaciones musculares.'],
    options: ['Intoxicación por opioides', 'Intoxicación por organofosforados', 'Golpe de calor', 'Intoxicación anticolinérgica'],
    explanation: 'Síndrome colinérgico (muscarínico + nicotínico). Tratamiento: atropina titulada y pralidoxima.',
  },
]
