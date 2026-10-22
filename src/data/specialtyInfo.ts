/**
 * Contenido de cada espacio de especialidad: descripción, temas de alto rendimiento y perlas.
 * Resumen educativo; verificar con las guías vigentes.
 */
export interface SpecialtyInfo {
  description: string
  topics: string[]
  pearls: string[]
}

export const SPECIALTY_INFO: Record<string, SpecialtyInfo> = {
  'medicina-interna': {
    description: 'La base del examen: integra la clínica del adulto y conecta todas las subespecialidades. Domina los cuadros crónicos más prevalentes y sus descompensaciones.',
    topics: ['Hipertensión arterial', 'Diabetes mellitus', 'Insuficiencia cardíaca', 'Enfermedad renal crónica', 'EPOC y asma', 'Anemias', 'Trastornos electrolíticos', 'Sepsis'],
    pearls: [
      'La causa endocrina más frecuente de hipertensión secundaria es el hiperaldosteronismo primario.',
      'Hiponatremia crónica: no corregir más de 8–10 mEq/L en 24 h (desmielinización osmótica).',
      'En la anemia ferropénica la ferritina baja es el dato de laboratorio más específico.',
      'En diabetes tipo 2 con enfermedad cardiovascular, IC o ERC se prefieren iSGLT2 o agonistas GLP-1 con beneficio demostrado.',
    ],
  },
  cardiologia: {
    description: 'Una de las subespecialidades más preguntadas: síndrome coronario, insuficiencia cardíaca, arritmias y valvulopatías con lectura de ECG.',
    topics: ['Síndrome coronario agudo', 'Insuficiencia cardíaca', 'Fibrilación auricular', 'Valvulopatías', 'Pericarditis y taponamiento', 'Endocarditis', 'Bradiarritmias y bloqueos', 'Dislipidemia'],
    pearls: [
      'Infarto inferior (DII, DIII, aVF) → coronaria derecha; busca infarto de VD con V3R–V4R y evita nitratos.',
      'Pericarditis aguda: elevación difusa del ST con descenso del PR.',
      'Estenosis aórtica: angina, síncope y disnea; soplo mesosistólico irradiado a carótidas.',
      'Taponamiento: tríada de Beck + pulso paradójico; tratamiento con pericardiocentesis.',
    ],
  },
  neumologia: {
    description: 'Asma, EPOC, neumonía, tromboembolismo y tuberculosis concentran la mayoría de las preguntas.',
    topics: ['Asma', 'EPOC', 'Neumonía adquirida en la comunidad', 'Tromboembolismo pulmonar', 'Tuberculosis', 'Derrame pleural', 'Neumotórax', 'Cáncer de pulmón'],
    pearls: [
      'EPOC se confirma con FEV₁/FVC < 0,70 post-broncodilatador.',
      'Streptococcus pneumoniae es el agente más frecuente de neumonía adquirida en la comunidad.',
      'CURB-65 ≥ 2: considerar hospitalización; ≥ 3: neumonía grave.',
      'El neumotórax a tensión es un diagnóstico clínico: descompresión inmediata, sin esperar radiografía.',
    ],
  },
  gastroenterologia: {
    description: 'Hemorragia digestiva, hepatopatías, páncreas y vía biliar, y enfermedad inflamatoria intestinal.',
    topics: ['ERGE', 'Úlcera péptica y H. pylori', 'Hemorragia digestiva', 'Pancreatitis aguda', 'Hepatitis virales', 'Cirrosis y complicaciones', 'Enfermedad inflamatoria intestinal', 'Cáncer colorrectal'],
    pearls: [
      'La úlcera péptica es la causa más frecuente de hemorragia digestiva alta.',
      'Peritonitis bacteriana espontánea: ≥ 250 PMN/mm³ en líquido ascítico.',
      'Várices sangrantes: vasoactivo (octreótido), ligadura endoscópica y profilaxis antibiótica.',
      'Crohn: transmural y salteado de boca a ano. Colitis ulcerosa: mucosa y continua desde el recto.',
    ],
  },
  nefrologia: {
    description: 'Función renal, glomerulopatías y, sobre todo, trastornos hidroelectrolíticos y ácido-base.',
    topics: ['Lesión renal aguda', 'Enfermedad renal crónica', 'Síndrome nefrótico', 'Síndrome nefrítico', 'Sodio y potasio', 'Gasometría y ácido-base', 'Litiasis renal', 'Infección urinaria'],
    pearls: [
      'ERC: TFG < 60 mL/min/1,73 m² o marcadores de daño renal durante más de 3 meses.',
      'Glomerulonefritis postestreptocócica: hematuria, edema e HTA con C3 bajo tras una faringitis o piodermitis.',
      'Hiperkalemia con cambios en el ECG: gluconato de calcio primero.',
      'El cálculo renal más frecuente es el de oxalato de calcio.',
    ],
  },
  endocrinologia: {
    description: 'Diabetes y sus emergencias, tiroides, suprarrenales y metabolismo del calcio.',
    topics: ['Diabetes mellitus', 'Cetoacidosis y estado hiperosmolar', 'Hipotiroidismo', 'Hipertiroidismo', 'Nódulo tiroideo', 'Síndrome de Cushing', 'Insuficiencia suprarrenal', 'Calcio y paratiroides'],
    pearls: [
      'Crisis suprarrenal: hidrocortisona IV inmediata, sin esperar los resultados.',
      'Graves: hipertiroidismo, bocio difuso y oftalmopatía; anticuerpos contra el receptor de TSH.',
      'Tríada de Whipple: síntomas de hipoglucemia, glucosa baja y mejoría al corregirla.',
      'Cetoacidosis: líquidos primero; si K < 3,3 mEq/L, reponer potasio antes de la insulina.',
    ],
  },
  infectologia: {
    description: 'Muy relevante en el Caribe: arbovirosis, leptospirosis, VIH, tuberculosis e infecciones de transmisión sexual.',
    topics: ['Dengue', 'Chikungunya y zika', 'Leptospirosis', 'VIH', 'Tuberculosis', 'Malaria', 'Infecciones de transmisión sexual', 'Meningitis'],
    pearls: [
      'Dengue: el mayor riesgo está en la defervescencia; evitar AINE y aspirina.',
      'Leptospirosis: exposición a agua contaminada, mialgias en pantorrillas y sufusión conjuntival.',
      'VIH con CD4 < 200: profilaxis con TMP-SMX contra Pneumocystis.',
      'Meningitis bacteriana: no retrasar el antibiótico por esperar la punción lumbar o la TC.',
    ],
  },
  hematologia: {
    description: 'Anemias, hemoglobinopatías, coagulación y neoplasias hematológicas.',
    topics: ['Anemias', 'Drepanocitosis', 'Trastornos de la coagulación', 'Trombocitopenia inmune', 'Leucemias', 'Linfomas', 'Transfusión', 'Anticoagulación'],
    pearls: [
      'Hemofilia A: déficit de factor VIII, TTPa prolongado con TP normal.',
      'La leucemia más frecuente en niños es la linfoblástica aguda.',
      'Linfoma de Hodgkin: células de Reed-Sternberg.',
      'Drepanocitosis: la hidroxiurea reduce las crisis vasooclusivas.',
    ],
  },
  neurologia: {
    description: 'ACV, convulsiones, cefaleas y enfermedades neuromusculares con alto peso clínico.',
    topics: ['ACV isquémico y hemorrágico', 'Epilepsia y estado epiléptico', 'Cefaleas', 'Meningitis y encefalitis', 'Guillain-Barré', 'Miastenia gravis', 'Parkinson', 'Demencias'],
    pearls: [
      'Trombólisis IV en ACV isquémico hasta 4,5 h tras descartar hemorragia con TC.',
      'Guillain-Barré: parálisis flácida ascendente, arreflexia y disociación albuminocitológica.',
      'Miastenia: debilidad fluctuante que empeora con el esfuerzo; ptosis y diplopía.',
      'Estado epiléptico: benzodiacepina como primera línea.',
    ],
  },
  reumatologia: {
    description: 'Artritis, colagenopatías y vasculitis: el diagnóstico se apoya en clínica y autoanticuerpos.',
    topics: ['Artritis reumatoide', 'Lupus eritematoso sistémico', 'Gota', 'Artrosis', 'Espondiloartritis', 'Vasculitis', 'Fiebre reumática', 'Artritis séptica'],
    pearls: [
      'Anti-CCP es más específico de artritis reumatoide que el factor reumatoide.',
      'Gota: cristales en aguja con birrefringencia negativa. Pseudogota: romboidales, positiva.',
      'Anti-Sm y anti-ADNdc son los anticuerpos más específicos del lupus.',
      'Artritis séptica: artrocentesis urgente; S. aureus es el agente más frecuente.',
    ],
  },
  pediatria: {
    description: 'Una de las áreas con más peso. Neonatología, crecimiento y desarrollo, vacunas y patología infecciosa infantil.',
    topics: ['Neonatología', 'Crecimiento y desarrollo', 'Esquema de vacunación', 'Infecciones respiratorias', 'Diarrea y deshidratación', 'Enfermedades exantemáticas', 'Cardiopatías congénitas', 'Nutrición y lactancia'],
    pearls: [
      'Cardiopatía congénita más frecuente: CIV. Cianótica más frecuente: tetralogía de Fallot.',
      'Ictericia en las primeras 24 horas de vida: siempre patológica.',
      'Lactancia materna exclusiva hasta los 6 meses.',
      'Plan B de deshidratación: SRO 75 mL/kg en 4 horas.',
    ],
  },
  'ginecologia-obstetricia': {
    description: 'Otra de las áreas de mayor peso. Control prenatal, emergencias obstétricas y ginecología oncológica.',
    topics: ['Control prenatal', 'Trastornos hipertensivos del embarazo', 'Hemorragias del embarazo', 'Parto y puerperio', 'Diabetes gestacional', 'Anticoncepción', 'Cáncer de cérvix y de mama', 'Enfermedad inflamatoria pélvica'],
    pearls: [
      'Preeclampsia con criterios de severidad: sulfato de magnesio; antídoto, gluconato de calcio.',
      'Hemorragia posparto: las 4 T; la atonía uterina es la causa más frecuente.',
      'Placenta previa: sangrado indoloro; no hacer tacto vaginal.',
      'Cribado de diabetes gestacional: PTOG 75 g entre las 24 y 28 semanas.',
    ],
  },
  cirugia: {
    description: 'Abdomen agudo, vía biliar, hernias, trauma y quemaduras: conducta y momento quirúrgico.',
    topics: ['Abdomen agudo', 'Apendicitis', 'Colecistitis y vía biliar', 'Hernias', 'Obstrucción intestinal', 'Trauma (ATLS)', 'Quemaduras', 'Hemorragia digestiva quirúrgica'],
    pearls: [
      'ATLS: controlar la hemorragia exanguinante y luego ABCDE.',
      'Parkland: 4 mL × kg × %SCQ en 24 h; la mitad en las primeras 8 h.',
      'Obstrucción de delgado: adherencias. Obstrucción de colon: cáncer.',
      'Aire libre subdiafragmático = perforación de víscera hueca → cirugía.',
    ],
  },
  ortopedia: {
    description: 'Fracturas frecuentes, urgencias ortopédicas y patología pediátrica de cadera.',
    topics: ['Fracturas frecuentes', 'Luxaciones', 'Síndrome compartimental', 'Lesiones nerviosas periféricas', 'Displasia de cadera', 'Osteomielitis', 'Lumbalgia'],
    pearls: [
      'Síndrome compartimental: dolor desproporcionado y con el estiramiento pasivo → fasciotomía.',
      'Fractura de escafoides: dolor en la tabaquera anatómica; riesgo de necrosis avascular.',
      'Fractura de diáfisis humeral: lesión del nervio radial (mano en gota).',
      'Displasia de cadera: maniobras de Ortolani y Barlow en el recién nacido.',
    ],
  },
  urologia: {
    description: 'Urgencias urológicas, litiasis y patología prostática.',
    topics: ['Litiasis renal', 'Hiperplasia prostática benigna', 'Cáncer de próstata', 'Torsión testicular', 'Infección urinaria', 'Hematuria'],
    pearls: [
      'Torsión testicular: exploración quirúrgica urgente; reflejo cremastérico ausente.',
      'Hematuria macroscópica indolora en fumador: descartar cáncer de vejiga.',
      'HPB: alfabloqueadores alivian rápido; inhibidores de 5-α-reductasa reducen el tamaño.',
      'Los cálculos de menos de 5 mm suelen expulsarse espontáneamente.',
    ],
  },
  'salud-publica': {
    description: 'Puntos casi seguros si dominas las fórmulas: epidemiología, bioestadística y prevención.',
    topics: ['Medidas de frecuencia', 'Pruebas diagnósticas', 'Diseño de estudios', 'Medidas de asociación', 'Niveles de prevención', 'Vigilancia epidemiológica', 'Indicadores de salud', 'Sistema de salud'],
    pearls: [
      'Sensibilidad y especificidad no dependen de la prevalencia; los valores predictivos sí.',
      'Casos y controles → odds ratio. Cohortes → riesgo relativo.',
      'NNT = 1 / reducción absoluta del riesgo.',
      'El tamizaje es prevención secundaria; la vacunación, primaria.',
    ],
  },
  psiquiatria: {
    description: 'Trastornos del ánimo, psicosis, urgencias psiquiátricas y efectos adversos de psicofármacos.',
    topics: ['Depresión', 'Trastorno bipolar', 'Esquizofrenia', 'Trastornos de ansiedad', 'Consumo de sustancias', 'Riesgo suicida', 'Delirium vs. demencia', 'Psicofármacos'],
    pearls: [
      'Síndrome neuroléptico maligno: fiebre, rigidez, alteración mental y CPK elevada.',
      'Síndrome serotoninérgico: clonus, hiperreflexia e hipertermia.',
      'Delirium: inicio agudo, curso fluctuante e inatención.',
      'Litio: vigilar niveles, función renal y tiroidea.',
    ],
  },
  dermatologia: {
    description: 'Lesiones elementales, infecciones cutáneas y cáncer de piel.',
    topics: ['Lesiones elementales', 'Infecciones cutáneas', 'Acné', 'Psoriasis', 'Dermatitis', 'Melanoma y cáncer de piel', 'Farmacodermias', 'Escabiosis'],
    pearls: [
      'El carcinoma basocelular es el cáncer de piel más frecuente.',
      'Melanoma: el espesor de Breslow es el principal factor pronóstico.',
      'Escabiosis: prurito nocturno; tratar a todos los contactos (permetrina 5%).',
      'Stevens-Johnson / NET: suspender de inmediato el fármaco causal.',
    ],
  },
  farmacologia: {
    description: 'Mecanismos, efectos adversos, antídotos y seguridad en el embarazo.',
    topics: ['Antibióticos', 'Antídotos', 'Farmacocinética', 'Fármacos en el embarazo', 'Interacciones', 'Analgésicos', 'Antihipertensivos', 'Anticoagulantes'],
    pearls: [
      'Teratógenos clásicos: IECA/ARA-II, warfarina, isotretinoína, valproato y metotrexato.',
      'Aminoglucósidos: nefrotoxicidad y ototoxicidad.',
      'Warfarina se controla con INR (antídoto: vitamina K); heparina no fraccionada con TTPa (antídoto: protamina).',
      'Paracetamol: N-acetilcisteína. Opioides: naloxona.',
    ],
  },
  emergencias: {
    description: 'Reanimación, shock, intoxicaciones y estabilización inicial del paciente crítico.',
    topics: ['RCP básica y avanzada', 'Shock', 'Anafilaxia', 'Intoxicaciones', 'Politraumatismo', 'Crisis hipertensiva', 'Estado epiléptico', 'Quemaduras'],
    pearls: [
      'RCP de calidad: 100–120 compresiones/min, 5–6 cm de profundidad, relación 30:2 sin vía aérea avanzada.',
      'Ritmos desfibrilables: fibrilación ventricular y TV sin pulso.',
      'Anafilaxia: adrenalina IM 0,01 mg/kg (máx. 0,5 mg en adultos).',
      'Shock séptico: noradrenalina de primera línea, meta de PAM ≥ 65 mmHg.',
    ],
  },
  'ciencias-basicas': {
    description: 'Anatomía, fisiología, microbiología, inmunología y genética aplicadas a la clínica.',
    topics: ['Anatomía clínica', 'Fisiología', 'Bioquímica', 'Microbiología', 'Inmunología', 'Patología general', 'Genética', 'Embriología'],
    pearls: [
      'Hipersensibilidad tipo I: mediada por IgE. Tipo IV: mediada por linfocitos T.',
      'Staphylococcus es catalasa positivo; Streptococcus, catalasa negativo.',
      'Herencia recesiva ligada al X: hemofilia, distrofia de Duchenne, daltonismo.',
      'La lesión del nervio radial produce mano en gota.',
    ],
  },
  'oftalmologia-orl': {
    description: 'Ojo rojo, urgencias oftalmológicas e infecciones otorrinolaringológicas.',
    topics: ['Ojo rojo', 'Glaucoma', 'Conjuntivitis', 'Retinopatía diabética e hipertensiva', 'Otitis media', 'Sinusitis', 'Faringoamigdalitis', 'Epistaxis'],
    pearls: [
      'Glaucoma agudo de ángulo cerrado: ojo rojo doloroso, midriasis media arreactiva, halos. Urgencia.',
      'Otitis media aguda: amoxicilina es el antibiótico de primera línea.',
      'La epistaxis más frecuente es anterior (plexo de Kiesselbach).',
      'Faringoamigdalitis: los criterios de Centor orientan hacia etiología estreptocócica.',
    ],
  },
  etica: {
    description: 'Bioética, deberes del médico y aspectos legales de la práctica.',
    topics: ['Principios bioéticos', 'Consentimiento informado', 'Secreto profesional', 'Relación médico-paciente', 'Responsabilidad profesional', 'Certificado de defunción', 'Ética en investigación'],
    pearls: [
      'Los cuatro principios: autonomía, beneficencia, no maleficencia y justicia.',
      'El consentimiento informado debe ser libre, informado y otorgado por una persona capaz.',
      'El secreto profesional tiene excepciones legales, como las enfermedades de notificación obligatoria.',
      'La Declaración de Helsinki guía la investigación en seres humanos.',
    ],
  },
}
