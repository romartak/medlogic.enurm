/**
 * Casos clínicos paso a paso: el paciente llega y tú decides en cada etapa.
 * Cada opción explica por qué es correcta o no; al acertar se revela la información nueva.
 * Basados en las guías vigentes (OPS/OMS, ADA, ACOG, AHA/ASA, ESC, IDSA/ATS, AIEPI).
 */
export type CaseStage = 'Clasificación' | 'Historia' | 'Examen físico' | 'Laboratorio' | 'Imagen' | 'Diagnóstico' | 'Tratamiento' | 'Seguimiento'

export interface CaseOption {
  text: string
  correct?: boolean
  why: string
}

export interface CaseStep {
  stage: CaseStage
  prompt: string
  options: CaseOption[]
  /** Lo que se descubre al acertar (resultado de un estudio, evolución…). */
  reveal?: string
}

export interface ClinicalCase {
  id: string
  title: string
  specialty: string
  minutes: number
  /** Presentación inicial del paciente. */
  intro: string
  vitals?: string
  steps: CaseStep[]
  keyPoints: string[]
  reference: string
}

export const CASES: ClinicalCase[] = [
  {
    id: 'dengue-signos-alarma',
    title: 'Fiebre que cede… y el paciente empeora',
    specialty: 'infectologia',
    minutes: 6,
    intro:
      'Hombre de 19 años de Santo Domingo con 4 días de fiebre de 39 °C, dolor retroocular y mialgias. Hoy la fiebre cedió, pero tiene dolor abdominal intenso y continuo y ha vomitado 3 veces en la mañana. Al examen: hígado palpable 2 cm por debajo del reborde, doloroso.',
    vitals: 'TA 110/70 mmHg · FC 104 lpm · FR 20 · T 36,8 °C',
    steps: [
      {
        stage: 'Clasificación',
        prompt: '¿Cómo clasificas este cuadro?',
        options: [
          { text: 'Dengue sin signos de alarma', why: 'No: el dolor abdominal intenso, los vómitos persistentes y la hepatomegalia dolorosa son signos de alarma.' },
          { text: 'Dengue con signos de alarma', correct: true, why: 'Correcto. Al bajar la fiebre empieza la fase crítica (días 3–7). Dolor abdominal intenso, vómitos persistentes y hepatomegalia > 2 cm son signos de alarma: anuncian fuga de plasma.' },
          { text: 'Dengue grave', why: 'Aún no: dengue grave es choque o acumulación de líquido con dificultad respiratoria, sangrado grave o daño grave de órganos. Este paciente está compensado.' },
          { text: 'Chikungunya', why: 'El chikungunya da artralgias intensas que predominan; no produce esta fase crítica con fuga de plasma al ceder la fiebre.' },
        ],
      },
      {
        stage: 'Laboratorio',
        prompt: '¿Qué examen es el más útil para vigilar su evolución en esta fase?',
        options: [
          { text: 'Hematocrito seriado junto con plaquetas', correct: true, why: 'Correcto. El hematocrito que sube mientras bajan las plaquetas indica fuga de plasma; se repite para guiar los líquidos.' },
          { text: 'IgM de dengue cada día', why: 'La serología confirma el diagnóstico, pero no sirve para seguir la evolución ni para decidir los líquidos.' },
          { text: 'PCR para dengue', why: 'Confirma el virus en los primeros días, pero no dice si el paciente está perdiendo plasma.' },
          { text: 'Hemocultivo', why: 'No hay sospecha de bacteriemia; no cambia el manejo.' },
        ],
        reveal: 'Hematocrito 48 % (el basal era 40 %). Plaquetas 45 000/µL.',
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué haces ahora?',
        options: [
          { text: 'Alta con paracetamol y abundantes líquidos orales', why: 'Peligroso: con signos de alarma el paciente debe ingresar; puede caer en choque en horas.' },
          { text: 'Ingreso y cristaloides IV: 10 mL/kg en la primera hora y reevaluar', correct: true, why: 'Correcto (OPS). Lactato de Ringer o solución salina; si mejora, se reduce la velocidad de forma escalonada vigilando diuresis y hematocrito.' },
          { text: 'Transfundir plaquetas por tener menos de 50 000', why: 'No: las plaquetas no se transfunden de forma profiláctica en el dengue; no previenen el sangrado ni el choque.' },
          { text: 'Ibuprofeno para el dolor abdominal y observar', why: 'Los AINE están contraindicados en el dengue por el riesgo de sangrado.' },
        ],
        reveal: 'Tras 2 horas: diuresis de 1 mL/kg/h, dolor menor y hematocrito de 45 %.',
      },
      {
        stage: 'Tratamiento',
        prompt: 'La familia pregunta qué puede tomar para el malestar. ¿Cuál está contraindicado?',
        options: [
          { text: 'Paracetamol', why: 'Es el analgésico y antipirético de elección (sin pasar de la dosis máxima).' },
          { text: 'Ibuprofeno o ácido acetilsalicílico', correct: true, why: 'Correcto. Los AINE y la aspirina aumentan el riesgo de sangrado y de daño gástrico: están contraindicados.' },
          { text: 'Sales de rehidratación oral', why: 'Son útiles cuando ya tolera la vía oral.' },
          { text: 'Omeprazol', why: 'Puede usarse para proteger la mucosa gástrica; no está contraindicado.' },
        ],
      },
      {
        stage: 'Seguimiento',
        prompt: '¿Cuál de estos hallazgos te diría que pasó a dengue grave?',
        options: [
          { text: 'Plaquetas de 80 000 sin sangrado', why: 'Es una trombocitopenia esperable en la fase crítica; por sí sola no define dengue grave.' },
          { text: 'Pulso débil, presión diferencial ≤ 20 mmHg y llenado capilar > 2 s', correct: true, why: 'Correcto: son signos de choque por fuga de plasma (choque compensado), criterio de dengue grave. Requiere bolos de cristaloides y vigilancia estricta.' },
          { text: 'Exantema con prurito palmo-plantar', why: 'Es típico de la fase de recuperación, no de gravedad.' },
          { text: 'Bradicardia relativa al mejorar', why: 'Es frecuente en la convalecencia y no indica gravedad.' },
        ],
      },
    ],
    keyPoints: [
      'La fase crítica empieza cuando cede la fiebre (días 3–7): es cuando el paciente se puede complicar.',
      'Signos de alarma: dolor abdominal intenso, vómitos persistentes, acumulación de líquidos, sangrado de mucosas, letargia, hepatomegalia > 2 cm y hematocrito en aumento con plaquetas en descenso.',
      'Con signos de alarma: ingreso y cristaloides IV guiados por diuresis y hematocrito.',
      'Nada de AINE, aspirina ni inyecciones IM. No se transfunden plaquetas de forma profiláctica.',
    ],
    reference: 'OPS. Dengue: guías para la atención de enfermos en la Región de las Américas, 2.ª ed., 2016.',
  },
  {
    id: 'iam-inferior',
    title: 'Dolor de pecho a las 3 de la mañana',
    specialty: 'cardiologia',
    minutes: 6,
    intro: 'Hombre de 58 años, hipertenso, diabético y fumador. Llega con dolor retroesternal opresivo de 40 minutos, irradiado al brazo izquierdo, con sudoración fría.',
    vitals: 'TA 150/90 mmHg · FC 96 lpm · FR 20 · SatO2 95 %',
    steps: [
      {
        stage: 'Imagen',
        prompt: '¿Qué estudio haces primero?',
        options: [
          { text: 'Electrocardiograma de 12 derivaciones en menos de 10 minutos', correct: true, why: 'Correcto. Ante dolor torácico, el ECG en los primeros 10 minutos decide si hay que reperfundir de inmediato.' },
          { text: 'Troponina y esperar el resultado antes de cualquier otra cosa', why: 'La troponina es importante, pero un IAM con elevación del ST se diagnostica con el ECG; esperar la troponina retrasa la reperfusión.' },
          { text: 'Radiografía de tórax', why: 'Puede ayudar después, pero no es lo primero ante sospecha de síndrome coronario agudo.' },
          { text: 'Ecocardiograma', why: 'Útil, pero no reemplaza al ECG inicial.' },
        ],
        reveal: 'ECG: elevación del ST de 3 mm en DII, DIII y aVF, con descenso especular en DI y aVL.',
      },
      {
        stage: 'Diagnóstico',
        prompt: '¿Qué cara del corazón está afectada y qué arteria es la más probable?',
        options: [
          { text: 'Inferior, por la coronaria derecha', correct: true, why: 'Correcto. DII, DIII y aVF miran la cara inferior; en la mayoría de las personas la irriga la coronaria derecha.' },
          { text: 'Anterior, por la descendente anterior', why: 'La cara anterior se ve en V1–V4.' },
          { text: 'Lateral, por la circunfleja', why: 'La cara lateral se ve en DI, aVL, V5 y V6 (aquí tienen descenso especular).' },
          { text: 'Posterior aislada', why: 'El infarto posterior da descenso del ST en V1–V3 con R altas; no es este patrón.' },
        ],
      },
      {
        stage: 'Examen físico',
        prompt: 'Antes de darle nitroglicerina, ¿qué debes descartar en este infarto inferior?',
        options: [
          { text: 'Infarto del ventrículo derecho (ECG con V4R)', correct: true, why: 'Correcto. El infarto de VD depende de la precarga: los nitratos pueden causar hipotensión grave. También se evitan si tomó un inhibidor de la fosfodiesterasa-5 (sildenafil).' },
          { text: 'Hiperpotasemia', why: 'No contraindica los nitratos.' },
          { text: 'Pericarditis', why: 'El patrón con cambios especulares y en un territorio coronario es de infarto, no de pericarditis.' },
          { text: 'Neumonía', why: 'No tiene relación con el uso de nitratos.' },
        ],
        reveal: 'V4R sin elevación del ST. TA estable.',
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué tratamiento inicias de inmediato?',
        options: [
          { text: 'Aspirina 162–325 mg masticada, un segundo antiagregante, anticoagulación y reperfusión', correct: true, why: 'Correcto. Doble antiagregación (aspirina más clopidogrel, ticagrelor o prasugrel), heparina y reperfusión urgente.' },
          { text: 'Oxígeno a todos los pacientes y morfina', why: 'El oxígeno solo se da si la saturación es < 90 %; la morfina no mejora la evolución.' },
          { text: 'Betabloqueante IV y esperar la troponina', why: 'No se debe retrasar la reperfusión; el betabloqueante IV no es la prioridad.' },
          { text: 'Trombólisis solo si la troponina sale positiva', why: 'La decisión de reperfundir se toma con el ECG, no con la troponina.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: 'Tu hospital no tiene hemodinamia y el traslado para angioplastia tardaría 3 horas. Los síntomas empezaron hace 1 hora. ¿Qué haces?',
        options: [
          { text: 'Fibrinólisis lo antes posible si no hay contraindicaciones, y después traslado', correct: true, why: 'Correcto. Si la angioplastia primaria no se puede hacer en 120 minutos desde el diagnóstico, se da fibrinolítico (meta: en los primeros 10 minutos del diagnóstico según la ESC; puerta-aguja ≤ 30 minutos según la AHA) y luego se traslada.' },
          { text: 'Esperar el traslado para la angioplastia', why: 'Esperar 3 horas pierde miocardio; la fibrinólisis temprana es mejor cuando la angioplastia se retrasa tanto.' },
          { text: 'Solo heparina y observar', why: 'La heparina sola no reperfunde la arteria.' },
          { text: 'Cirugía de bypass urgente', why: 'No es la reperfusión de primera línea en el IAM con elevación del ST.' },
        ],
      },
    ],
    keyPoints: [
      'ECG en menos de 10 minutos ante todo dolor torácico.',
      'DII, DIII y aVF = cara inferior = coronaria derecha. Busca siempre el infarto de VD (V4R) antes de dar nitratos.',
      'Reperfusión: angioplastia primaria si se puede en ≤ 120 minutos; si no, fibrinólisis temprana.',
      'Oxígeno solo si la saturación es < 90 %.',
    ],
    reference: 'ESC 2023, síndromes coronarios agudos; AHA/ACC, IAM con elevación del ST.',
  },
  {
    id: 'cetoacidosis',
    title: 'Vómitos, sed y respiración profunda',
    specialty: 'endocrinologia',
    minutes: 6,
    intro: 'Mujer de 22 años con diabetes tipo 1 que dejó la insulina hace 3 días. Tiene poliuria, sed intensa, vómitos y dolor abdominal. Respira profundo y rápido; el aliento huele a fruta.',
    vitals: 'TA 95/60 mmHg · FC 120 lpm · FR 30 · T 37 °C',
    steps: [
      {
        stage: 'Laboratorio',
        prompt: 'Glucosa 480 mg/dL, pH 7,12, bicarbonato 12 mEq/L, cetonas positivas, Na 132, Cl 98. ¿Cuál es el diagnóstico?',
        options: [
          { text: 'Cetoacidosis diabética moderada', correct: true, why: 'Correcto: hiperglucemia, cetosis y acidosis metabólica con anión gap elevado (132 − 98 − 12 = 22). Con pH 7,00–7,24 y bicarbonato 10–15 es moderada.' },
          { text: 'Estado hiperosmolar hiperglucémico', why: 'En el estado hiperosmolar la glucosa suele pasar de 600, la osmolaridad de 320 y casi no hay acidosis ni cetosis.' },
          { text: 'Acidosis láctica', why: 'Las cetonas positivas con hiperglucemia en una diabética tipo 1 sin insulina apuntan a cetoacidosis.' },
          { text: 'Gastroenteritis aguda', why: 'Los vómitos y el dolor abdominal son parte de la cetoacidosis; no explican la acidosis con cetosis.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué es lo primero en el tratamiento?',
        options: [
          { text: 'Solución salina 0,9 %: 15–20 mL/kg (1 a 1,5 L) en la primera hora', correct: true, why: 'Correcto. La deshidratación es la prioridad; los líquidos ya bajan la glucosa y mejoran la perfusión.' },
          { text: 'Bolo de insulina antes de los líquidos', why: 'La insulina sin volumen puede empeorar la hipotensión, y antes hay que conocer el potasio.' },
          { text: 'Bicarbonato IV', why: 'Solo se considera con pH < 6,9; no es el primer paso.' },
          { text: 'Potasio IV a dosis altas en todos', why: 'El potasio se ajusta según el valor medido.' },
        ],
      },
      {
        stage: 'Laboratorio',
        prompt: '¿Qué valor necesitas antes de iniciar la insulina?',
        options: [
          { text: 'Potasio: si es < 3,3 mEq/L se repone antes de la insulina', correct: true, why: 'Correcto. La insulina mete el potasio a las células y puede causar hipopotasemia grave y arritmias.' },
          { text: 'Calcio', why: 'No condiciona el inicio de la insulina.' },
          { text: 'Amilasa', why: 'Puede estar elevada en la cetoacidosis sin pancreatitis; no cambia el inicio de la insulina.' },
          { text: 'Hemoglobina glucosilada', why: 'Sirve para el control a largo plazo, no para la urgencia.' },
        ],
        reveal: 'Potasio 5,4 mEq/L. Se inicia infusión de insulina regular a 0,1 U/kg/h.',
      },
      {
        stage: 'Seguimiento',
        prompt: 'La glucosa baja a 230 mg/dL, pero el pH sigue en 7,22. ¿Qué haces?',
        options: [
          { text: 'Agregar dextrosa al 5 % y seguir con la insulina hasta corregir la acidosis', correct: true, why: 'Correcto. La insulina se necesita para frenar la cetogénesis; la dextrosa evita la hipoglucemia mientras se cierra el anión gap.' },
          { text: 'Suspender la insulina porque la glucosa ya bajó', why: 'La cetoacidosis no se resuelve con la glucosa sino con la acidosis; suspender la insulina reactiva la cetogénesis.' },
          { text: 'Dar bicarbonato', why: 'Con pH 7,22 no está indicado.' },
          { text: 'Pasar ya a insulina subcutánea', why: 'Todavía no se ha resuelto la acidosis.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Cuándo pasas a insulina subcutánea?',
        options: [
          { text: 'Al resolverse la cetoacidosis y tolerar la vía oral, dando la subcutánea 1–2 horas antes de suspender la infusión', correct: true, why: 'Correcto. Resolución: glucosa < 200 mg/dL y dos de bicarbonato ≥ 15, pH venoso > 7,30 o anión gap ≤ 12. El solapamiento evita el rebote.' },
          { text: 'En cuanto la glucosa baje de 250 mg/dL', why: 'La glucosa baja antes que la acidosis; sería demasiado pronto.' },
          { text: 'Suspender la infusión y luego esperar 2 horas para la subcutánea', why: 'Sin solapamiento la cetoacidosis puede reaparecer.' },
          { text: 'Nunca: queda con infusión hasta el alta', why: 'La infusión es solo para la fase aguda.' },
        ],
      },
    ],
    keyPoints: [
      'Cetoacidosis = hiperglucemia + cetosis + acidosis metabólica con anión gap elevado.',
      'Orden: líquidos → potasio (si < 3,3 primero potasio) → insulina en infusión.',
      'Con glucosa < 200–250 se agrega dextrosa y se mantiene la insulina hasta cerrar el anión gap.',
      'Bicarbonato solo con pH < 6,9.',
    ],
    reference: 'ADA. Hyperglycemic crises in adults with diabetes: consensus report, 2024.',
  },
  {
    id: 'preeclampsia-grave',
    title: 'Embarazada con dolor de cabeza y luces',
    specialty: 'ginecologia-obstetricia',
    minutes: 6,
    intro: 'Primigesta de 24 años con embarazo de 34 semanas. Consulta por dolor de cabeza intenso y ver lucecitas (fosfenos). Tiene edema de manos y cara.',
    vitals: 'TA 168/112 mmHg (repetida a los 15 min: 165/110) · FC 90 lpm',
    steps: [
      {
        stage: 'Diagnóstico',
        prompt: 'Tira de orina con proteínas 2+. ¿Cuál es el diagnóstico?',
        options: [
          { text: 'Preeclampsia con criterios de severidad', correct: true, why: 'Correcto. Hipertensión después de las 20 semanas con proteinuria, TA ≥ 160/110 y síntomas neurológicos (cefalea, fosfenos) son criterios de severidad.' },
          { text: 'Hipertensión gestacional', why: 'La hipertensión gestacional no tiene proteinuria ni daño de órganos.' },
          { text: 'Hipertensión crónica', why: 'La crónica existe antes de las 20 semanas.' },
          { text: 'Eclampsia', why: 'La eclampsia requiere convulsiones; esta paciente aún no ha convulsionado.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué das para prevenir las convulsiones?',
        options: [
          { text: 'Sulfato de magnesio: 4–6 g IV en 15–20 min y luego 1–2 g/h', correct: true, why: 'Correcto. Es el fármaco de elección para prevenir y tratar la eclampsia.' },
          { text: 'Diazepam', why: 'Es inferior al sulfato de magnesio para prevenir convulsiones eclámpticas.' },
          { text: 'Fenitoína', why: 'Es inferior al sulfato de magnesio.' },
          { text: 'Nada, porque no ha convulsionado', why: 'Con criterios de severidad la profilaxis con sulfato está indicada.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Y para la presión de 168/112?',
        options: [
          { text: 'Labetalol IV, hidralazina IV o nifedipino oral de acción inmediata, con meta de 140–150/90–100', correct: true, why: 'Correcto. Una TA ≥ 160/110 sostenida se trata en 30–60 minutos para prevenir el ACV materno.' },
          { text: 'Enalapril', why: 'Los IECA están contraindicados en el embarazo.' },
          { text: 'Furosemida', why: 'La preeclampsia cursa con volumen intravascular reducido; los diuréticos no son el tratamiento.' },
          { text: 'Bajarla rápido a 110/70', why: 'Una caída brusca reduce la perfusión de la placenta.' },
        ],
      },
      {
        stage: 'Seguimiento',
        prompt: 'Con el sulfato de magnesio: frecuencia respiratoria de 10 y reflejos patelares abolidos. ¿Qué haces?',
        options: [
          { text: 'Suspender el sulfato y dar gluconato de calcio 1 g IV', correct: true, why: 'Correcto: son signos de intoxicación por magnesio. El calcio es el antídoto.' },
          { text: 'Aumentar la dosis de sulfato', why: 'Agravaría la intoxicación y podría causar paro respiratorio.' },
          { text: 'Naloxona', why: 'Es el antídoto de los opioides.' },
          { text: 'Flumazenil', why: 'Es el antídoto de las benzodiacepinas.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: 'Ya está estable, con 34 semanas. ¿Cuál es la conducta obstétrica?',
        options: [
          { text: 'Terminar el embarazo una vez estabilizada la madre', correct: true, why: 'Correcto. Con criterios de severidad y ≥ 34 semanas se indica el parto tras estabilizar. La vía (parto o cesárea) depende de las condiciones obstétricas.' },
          { text: 'Manejo expectante hasta las 37 semanas', why: 'Ese manejo se reserva para la preeclampsia sin criterios de severidad.' },
          { text: 'Cesárea inmediata sin estabilizar', why: 'Primero se estabiliza a la madre; la preeclampsia no obliga a cesárea.' },
          { text: 'Alta con antihipertensivo oral', why: 'Es una urgencia obstétrica: no puede irse a casa.' },
        ],
      },
    ],
    keyPoints: [
      'Criterios de severidad: TA ≥ 160/110, síntomas neurológicos o visuales, plaquetas < 100 000, transaminasas al doble, creatinina > 1,1, edema pulmonar o dolor en hipocondrio derecho.',
      'Sulfato de magnesio para prevenir la eclampsia; vigila reflejos, respiración y diuresis. Antídoto: gluconato de calcio.',
      'Antihipertensivos: labetalol, hidralazina o nifedipino. Nunca IECA ni ARA II en el embarazo.',
      'Con severidad y ≥ 34 semanas: terminar el embarazo tras estabilizar.',
    ],
    reference: 'ACOG Practice Bulletin 222: Gestational hypertension and preeclampsia, 2020.',
  },
  {
    id: 'apendicitis',
    title: 'Dolor que bajó al lado derecho',
    specialty: 'cirugia',
    minutes: 5,
    intro: 'Hombre de 21 años con dolor alrededor del ombligo desde hace 18 horas que se fue a la fosa ilíaca derecha. No tiene hambre y tiene náuseas. McBurney y Blumberg positivos.',
    vitals: 'T 38,0 °C · FC 98 lpm · TA 120/75 mmHg',
    steps: [
      {
        stage: 'Clasificación',
        prompt: 'Leucocitos 14 500 con 85 % de neutrófilos. ¿Qué escala usas para estimar la probabilidad de apendicitis?',
        options: [
          { text: 'Alvarado', correct: true, why: 'Correcto. Migración del dolor, anorexia, náuseas, dolor en fosa ilíaca derecha, rebote, fiebre, leucocitosis y desviación a la izquierda. Este paciente suma 10 de 10.' },
          { text: 'Ranson', why: 'Es para la pancreatitis aguda.' },
          { text: 'Glasgow-Blatchford', why: 'Es para la hemorragia digestiva alta.' },
          { text: 'Wells', why: 'Es para la trombosis venosa profunda y la embolia pulmonar.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: 'Con Alvarado de 10, ¿cuál es el siguiente paso?',
        options: [
          { text: 'Cirugía: apendicectomía con antibiótico profiláctico', correct: true, why: 'Correcto. Con 7 o más la probabilidad es alta; la apendicectomía (laparoscópica o abierta) es el tratamiento.' },
          { text: 'Tomografía obligatoria antes de operar', why: 'La imagen ayuda en los casos dudosos; con un cuadro tan típico no debe retrasar la cirugía.' },
          { text: 'Alta con antibiótico oral', why: 'El tratamiento solo con antibióticos se usa en casos seleccionados no complicados y bajo vigilancia, no como alta.' },
          { text: 'Colonoscopia', why: 'Está contraindicada ante sospecha de apendicitis.' },
        ],
      },
      {
        stage: 'Laboratorio',
        prompt: 'Si fuera una mujer en edad fértil con el mismo cuadro, ¿qué estudio no puede faltar?',
        options: [
          { text: 'Prueba de embarazo (β-hCG)', correct: true, why: 'Correcto. Hay que descartar un embarazo ectópico y saber si está embarazada antes de imágenes y cirugía.' },
          { text: 'CA-125', why: 'No es útil en el abdomen agudo.' },
          { text: 'Colonoscopia', why: 'No está indicada.' },
          { text: 'Endoscopia alta', why: 'No está indicada.' },
        ],
      },
      {
        stage: 'Imagen',
        prompt: 'Si fuera una embarazada en el segundo trimestre, ¿qué imagen pides primero?',
        options: [
          { text: 'Ecografía; si no es concluyente, resonancia sin contraste', correct: true, why: 'Correcto: evitan la radiación al feto.' },
          { text: 'Tomografía con contraste', why: 'Se evita en el embarazo si hay alternativas sin radiación.' },
          { text: 'Radiografía simple de abdomen', why: 'No es útil para la apendicitis.' },
          { text: 'Operar sin ninguna imagen', why: 'En la embarazada el diagnóstico clínico es más difícil; la imagen ayuda a evitar cirugías innecesarias.' },
        ],
      },
      {
        stage: 'Seguimiento',
        prompt: 'Al operar encuentras el apéndice perforado con un absceso localizado. ¿Antibióticos?',
        options: [
          { text: 'Continuar antibiótico terapéutico después de la cirugía (gramnegativos y anaerobios)', correct: true, why: 'Correcto. En la apendicitis complicada se continúa el antibiótico tras el control del foco (alrededor de 4 días si la evolución es buena).' },
          { text: 'Solo la dosis profiláctica', why: 'Eso basta en la apendicitis no complicada, no en la perforada.' },
          { text: 'Ningún antibiótico', why: 'Aumenta el riesgo de absceso residual e infección.' },
          { text: 'Vancomicina sola', why: 'No cubre gramnegativos ni anaerobios.' },
        ],
      },
    ],
    keyPoints: [
      'Escala de Alvarado: 7 o más, probabilidad alta.',
      'En mujeres en edad fértil, prueba de embarazo siempre.',
      'Embarazada: ecografía y, si no aclara, resonancia.',
      'No complicada: profilaxis. Complicada: antibiótico terapéutico tras el control del foco.',
    ],
    reference: 'WSES Jerusalem guidelines on acute appendicitis, 2020 update.',
  },
  {
    id: 'neumonia-curb65',
    title: 'Abuela con fiebre y confusión',
    specialty: 'neumologia',
    minutes: 5,
    intro: 'Mujer de 72 años con 3 días de fiebre, tos con flema color óxido y dolor de costado al respirar. Hoy está confundida. Crepitantes en la base derecha.',
    vitals: 'TA 85/55 mmHg · FC 112 lpm · FR 32 · T 39 °C · SatO2 89 %',
    steps: [
      {
        stage: 'Imagen',
        prompt: '¿Qué estudio confirma el diagnóstico?',
        options: [
          { text: 'Radiografía de tórax', correct: true, why: 'Correcto. Un infiltrado nuevo con el cuadro clínico confirma la neumonía.' },
          { text: 'Tomografía de tórax', why: 'Se reserva para casos dudosos o complicaciones.' },
          { text: 'Broncoscopia', why: 'No es el estudio inicial.' },
          { text: 'Solo hemocultivos', why: 'Ayudan a buscar el germen, pero no confirman la neumonía.' },
        ],
        reveal: 'Consolidación del lóbulo inferior derecho con broncograma aéreo. BUN 30 mg/dL.',
      },
      {
        stage: 'Clasificación',
        prompt: '¿Cuánto suma en el CURB-65?',
        options: [
          { text: '3', why: 'Faltan puntos: revisa cada criterio.' },
          { text: '4', why: 'Falta uno: revisa cada criterio.' },
          { text: '5', correct: true, why: 'Correcto: Confusión, Urea alta (BUN > 19 mg/dL), FR ≥ 30, TA sistólica < 90 o diastólica ≤ 60, y 65 años o más.' },
          { text: '2', why: 'Cumple más criterios.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Dónde la manejas?',
        options: [
          { text: 'Hospitalización en cuidados intensivos o intermedios', correct: true, why: 'Correcto. Con CURB-65 de 3 a 5 la mortalidad es alta; además tiene hipotensión, que es criterio de gravedad.' },
          { text: 'Ambulatorio con antibiótico oral', why: 'Solo con CURB-65 de 0 a 1 y sin otros problemas.' },
          { text: 'Sala general con antibiótico oral', why: 'Por su gravedad necesita tratamiento IV y vigilancia estrecha.' },
          { text: 'Casa con control en 48 horas', why: 'Está en riesgo de choque séptico.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué antibiótico empírico inicias?',
        options: [
          { text: 'Betalactámico IV (ceftriaxona) más macrólido (azitromicina)', correct: true, why: 'Correcto para neumonía grave sin factores de riesgo de Pseudomonas ni SARM (alternativa: betalactámico más fluoroquinolona respiratoria).' },
          { text: 'Amoxicilina oral sola', why: 'Es para pacientes ambulatorios sanos.' },
          { text: 'Vancomicina y meropenem a todos', why: 'Solo con factores de riesgo de SARM o Pseudomonas.' },
          { text: 'Doxiciclina oral', why: 'Es una opción ambulatoria, no para neumonía grave.' },
        ],
      },
      {
        stage: 'Diagnóstico',
        prompt: '¿Cuál es el germen más probable?',
        options: [
          { text: 'Streptococcus pneumoniae', correct: true, why: 'Correcto: es la causa más frecuente de neumonía comunitaria, y la flema herrumbrosa con consolidación lobar es típica.' },
          { text: 'Klebsiella pneumoniae', why: 'Típica en alcohólicos, con esputo en «jalea de grosella».' },
          { text: 'Mycoplasma pneumoniae', why: 'Da neumonía atípica en jóvenes, con poca consolidación.' },
          { text: 'Pseudomonas aeruginosa', why: 'En pacientes con bronquiectasias, hospitalizaciones o antibióticos recientes.' },
        ],
      },
    ],
    keyPoints: [
      'CURB-65: Confusión, Urea alta, FR ≥ 30, TA baja, 65 años o más. 0–1 ambulatorio, 2 hospital, 3–5 hospital o UCI.',
      'Neumonía grave hospitalizada: betalactámico más macrólido o fluoroquinolona respiratoria.',
      'S. pneumoniae es el germen más frecuente.',
    ],
    reference: 'ATS/IDSA. Diagnosis and treatment of adults with community-acquired pneumonia, 2019.',
  },
  {
    id: 'diarrea-deshidratacion',
    title: 'Niño con diarrea que no para',
    specialty: 'pediatria',
    minutes: 5,
    intro: 'Niño de 18 meses y 10 kg con diarrea líquida 8 veces al día desde hace 2 días y algunos vómitos. Está irritable, con los ojos hundidos, bebe con mucha sed y el pliegue cutáneo regresa lentamente.',
    vitals: 'FC 140 lpm · T 37,8 °C',
    steps: [
      {
        stage: 'Clasificación',
        prompt: '¿Cómo clasificas la deshidratación (AIEPI/OMS)?',
        options: [
          { text: 'Algún grado de deshidratación', correct: true, why: 'Correcto: dos o más de inquieto o irritable, ojos hundidos, bebe ávidamente y pliegue que regresa lentamente.' },
          { text: 'Sin deshidratación', why: 'Tiene varios signos de deshidratación.' },
          { text: 'Deshidratación grave', why: 'La grave tiene letargia o inconsciencia, no puede beber o bebe mal, y pliegue muy lento (más de 2 segundos).' },
          { text: 'Choque', why: 'No tiene datos de choque.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué plan de tratamiento indicas?',
        options: [
          { text: 'Plan B: sales de rehidratación oral 75 mL/kg en 4 horas en el centro de salud', correct: true, why: 'Correcto: 750 mL en 4 horas para este niño, y luego reevaluar.' },
          { text: 'Plan C: lactato de Ringer IV 100 mL/kg', why: 'Es para la deshidratación grave.' },
          { text: 'Plan A en casa', why: 'Es para el niño sin deshidratación.' },
          { text: 'Loperamida', why: 'Los antidiarreicos están contraindicados en niños.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: 'Además de las sales, ¿qué suplemento indicas?',
        options: [
          { text: 'Zinc 20 mg al día por 10 a 14 días', correct: true, why: 'Correcto (10 mg en menores de 6 meses): acorta la diarrea y reduce los episodios siguientes.' },
          { text: 'Un antibiótico', why: 'La mayoría de las diarreas son virales; no está indicado.' },
          { text: 'Vitamina C', why: 'No tiene efecto demostrado.' },
          { text: 'Hierro', why: 'No forma parte del manejo de la diarrea aguda.' },
        ],
      },
      {
        stage: 'Seguimiento',
        prompt: 'A las 2 horas está letárgico, no puede beber y el pliegue regresa muy lento. ¿Qué haces?',
        options: [
          { text: 'Plan C: lactato de Ringer IV 100 mL/kg (30 mL/kg en 30 min y 70 mL/kg en 2½ horas)', correct: true, why: 'Correcto. Ahora tiene deshidratación grave. En mayores de 12 meses así se reparte; en menores de 12 meses, en 1 hora y 5 horas.' },
          { text: 'Seguir con las sales por boca', why: 'Ya no puede beber: necesita líquidos IV.' },
          { text: 'Loperamida y observar', why: 'Contraindicada y no corrige la deshidratación.' },
          { text: 'Esperar a que pase el vómito', why: 'La deshidratación grave es una urgencia.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Cuándo indicas antibiótico en una diarrea aguda en niños?',
        options: [
          { text: 'Con disentería (sangre en las heces) o sospecha de cólera grave', correct: true, why: 'Correcto. Fuera de esos casos, la diarrea aguda no se trata con antibióticos.' },
          { text: 'Siempre que haya fiebre', why: 'La fiebre sola no indica antibiótico.' },
          { text: 'Si dura más de 2 días', why: 'No es un criterio para antibióticos.' },
          { text: 'Nunca', why: 'La disentería y el cólera grave sí se tratan.' },
        ],
      },
    ],
    keyPoints: [
      'Plan A: sin deshidratación (en casa). Plan B: algún grado (75 mL/kg de sales en 4 h). Plan C: grave (Ringer 100 mL/kg IV).',
      'Zinc por 10–14 días a todo niño con diarrea.',
      'Nada de antidiarreicos en niños. Antibiótico solo en disentería o cólera grave.',
    ],
    reference: 'OMS/UNICEF. Tratamiento de la diarrea; AIEPI.',
  },
  {
    id: 'acv-isquemico',
    title: 'No puede hablar y no mueve el brazo',
    specialty: 'neurologia',
    minutes: 5,
    intro: 'Mujer de 66 años con fibrilación auricular que no toma anticoagulantes. A las 9:00, frente a su familia, perdió la fuerza del lado derecho y no pudo hablar. Llega a las 10:15.',
    vitals: 'TA 175/95 mmHg · FC 110 irregular · glucosa capilar 128 mg/dL',
    steps: [
      {
        stage: 'Imagen',
        prompt: '¿Cuál es el primer estudio de imagen?',
        options: [
          { text: 'Tomografía de cráneo sin contraste de inmediato', correct: true, why: 'Correcto. Descarta la hemorragia, que contraindica la trombólisis, y es rápida.' },
          { text: 'Resonancia con gadolinio', why: 'Es más lenta; no debe retrasar la decisión.' },
          { text: 'Punción lumbar', why: 'No está indicada.' },
          { text: 'Angiografía cerebral', why: 'Se usa para decidir la trombectomía, pero después de descartar la hemorragia.' },
        ],
        reveal: 'Tomografía sin sangrado ni infarto extenso.',
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Puede recibir trombólisis IV?',
        options: [
          { text: 'Sí: está dentro de 4,5 horas, sin contraindicaciones y con TA < 185/110', correct: true, why: 'Correcto. Lleva 1 hora y 15 minutos desde el inicio; su TA permite la trombólisis.' },
          { text: 'No, porque la TA está en 175/95', why: 'El límite para trombolizar es 185/110.' },
          { text: 'No, porque pasó más de 1 hora', why: 'La ventana es de 4,5 horas.' },
          { text: 'Solo si una resonancia lo confirma', why: 'Con la tomografía sin sangrado basta.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué fármaco y qué dosis?',
        options: [
          { text: 'Alteplasa 0,9 mg/kg (máximo 90 mg): 10 % en bolo y el resto en 60 minutos', correct: true, why: 'Correcto. La tenecteplasa 0,25 mg/kg en bolo es una alternativa aceptada.' },
          { text: 'Heparina a dosis plena', why: 'No se anticoagula en la fase aguda del ACV.' },
          { text: 'Aspirina 300 mg y esperar', why: 'Si es candidata, la trombólisis es superior; la aspirina se da 24 horas después.' },
          { text: 'Estreptoquinasa', why: 'Aumenta la hemorragia en el ACV y no se usa.' },
        ],
      },
      {
        stage: 'Seguimiento',
        prompt: 'Después de la trombólisis, ¿cuál es la meta de TA en las primeras 24 horas?',
        options: [
          { text: 'Menos de 180/105 mmHg', correct: true, why: 'Correcto: reduce el riesgo de hemorragia tras la trombólisis.' },
          { text: 'Menos de 120/80', why: 'Una caída fuerte reduce la perfusión del cerebro en riesgo.' },
          { text: 'Menos de 220/120', why: 'Ese límite es para quien no recibió trombólisis.' },
          { text: 'No importa', why: 'La TA alta después de la trombólisis aumenta la hemorragia.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Cómo previenes otro ACV por su fibrilación auricular?',
        options: [
          { text: 'Anticoagulación oral (ACOD o warfarina), iniciada días después según el tamaño del infarto', correct: true, why: 'Correcto. Con FA el riesgo embólico es alto (CHA₂DS₂-VASc elevado); se anticoagula cuando el riesgo de transformación hemorrágica lo permite.' },
          { text: 'Solo aspirina', why: 'Es claramente inferior a la anticoagulación en la FA.' },
          { text: 'Nada', why: 'Tiene alto riesgo de otro ACV.' },
          { text: 'Aspirina y clopidogrel de por vida', why: 'Es inferior a la anticoagulación y sangra más que la aspirina sola.' },
        ],
      },
    ],
    keyPoints: [
      'Tomografía sin contraste de inmediato para descartar hemorragia.',
      'Trombólisis IV hasta 4,5 horas del inicio, con TA < 185/110 antes y < 180/105 después.',
      'Fibrilación auricular: anticoagulación oral como prevención secundaria.',
    ],
    reference: 'AHA/ASA. Guidelines for the early management of acute ischemic stroke, 2019.',
  },
  {
    id: 'neumotorax-tension',
    title: 'Motociclista que no puede respirar',
    specialty: 'emergencias',
    minutes: 5,
    intro: 'Hombre de 24 años, motociclista que chocó contra un carro. Llega con dificultad respiratoria, ansioso, hablando con frases cortas. No hay sangrado externo.',
    vitals: 'TA 78/50 mmHg · FC 132 lpm · FR 34 · SpO₂ 82 % · Glasgow 14',
    steps: [
      {
        stage: 'Examen físico',
        prompt: 'Tráquea desviada a la izquierda, murmullo ausente e hiperresonancia en el hemitórax derecho, yugulares ingurgitadas. ¿Qué tiene?',
        options: [
          { text: 'Neumotórax a tensión derecho', correct: true, why: 'Correcto. Shock con murmullo ausente, hiperresonancia, yugulares ingurgitadas y tráquea desviada al lado sano: el aire a presión colapsa el pulmón y comprime el retorno venoso.' },
          { text: 'Hemotórax masivo derecho', why: 'El hemotórax es mate a la percusión y, por la hipovolemia, las yugulares suelen estar planas.' },
          { text: 'Taponamiento cardíaco', why: 'Da hipotensión e ingurgitación yugular, pero el murmullo vesicular se conserva y la percusión es normal.' },
          { text: 'Contusión pulmonar', why: 'Produce hipoxemia, pero no hiperresonancia, desviación traqueal ni shock obstructivo.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué haces ahora?',
        options: [
          { text: 'Radiografía de tórax para confirmar', why: 'No: el neumotórax a tensión es un diagnóstico clínico. Esperar la radiografía puede costarle la vida.' },
          { text: 'Descompresión inmediata con aguja en el 4.º–5.º espacio intercostal, línea axilar media', correct: true, why: 'Correcto. Descomprimir ya. En el adulto el sitio recomendado es el 4.º–5.º espacio, línea axilar media (la pared es más delgada que en el 2.º espacio).' },
          { text: 'Intubar primero', why: 'La ventilación con presión positiva aumenta la presión del neumotórax y puede precipitar un paro. Primero se descomprime.' },
          { text: 'Pericardiocentesis', why: 'El problema está en la pleura, no en el pericardio.' },
        ],
        reveal: 'Sale aire a presión. TA 104/68 mmHg, FC 108 lpm, SpO₂ 94 %.',
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Cuál es el tratamiento definitivo?',
        options: [
          { text: 'Retirar la aguja y observar', why: 'El neumotórax volverá: la aguja es solo un puente.' },
          { text: 'Tubo de tórax en el 5.º espacio intercostal, por delante de la línea axilar media', correct: true, why: 'Correcto. La toracostomía con tubo resuelve el neumotórax y permite medir si sangra.' },
          { text: 'Toracotomía de urgencia', why: 'No está indicada si el paciente respondió y no hay sangrado masivo.' },
          { text: 'Oxígeno y alta en 24 h', why: 'Un neumotórax traumático a tensión necesita tubo de tórax y vigilancia.' },
        ],
        reveal: 'Al colocar el tubo drenan 300 mL de sangre y luego 40 mL por hora.',
      },
      {
        stage: 'Seguimiento',
        prompt: '¿Cuándo estaría indicada una toracotomía?',
        options: [
          { text: 'Drenaje inicial ≥ 1500 mL o > 200 mL por hora durante 2–4 horas', correct: true, why: 'Correcto. Ese es el criterio de hemotórax masivo o sangrado persistente que requiere quirófano.' },
          { text: 'Cualquier cantidad de sangre en el tubo', why: 'Pequeños hemotórax se manejan con el tubo.' },
          { text: 'Si el paciente tiene dolor', why: 'El dolor se trata con analgesia; no es criterio quirúrgico.' },
          { text: 'Nunca en trauma cerrado', why: 'El hemotórax masivo puede necesitar toracotomía también en trauma cerrado.' },
        ],
      },
    ],
    keyPoints: [
      'El neumotórax a tensión se diagnostica por la clínica y se descomprime sin esperar imágenes.',
      'Adulto: 4.º–5.º espacio intercostal, línea axilar media; niño: 2.º espacio, línea medioclavicular.',
      'La aguja es un puente: después va un tubo de tórax.',
      'Toracotomía si drena ≥ 1500 mL de inmediato o > 200 mL/h durante 2–4 h.',
    ],
    reference: 'American College of Surgeons. ATLS, 10.ª ed. (2018) y 11.ª ed. (2025): trauma torácico.',
  },
  {
    id: 'trauma-abdominal',
    title: 'Choque frontal con dolor en el hombro izquierdo',
    specialty: 'emergencias',
    minutes: 5,
    intro: 'Mujer de 35 años, conductora con cinturón, en un choque frontal a alta velocidad. Dolor en el abdomen izquierdo y en el hombro izquierdo. Tiene una equimosis en banda sobre el abdomen. Piel fría y sudorosa.',
    vitals: 'TA 86/54 mmHg · FC 128 lpm · FR 26 · Glasgow 15',
    steps: [
      {
        stage: 'Clasificación',
        prompt: 'Taquicardia de 128, hipotensión y ansiedad. ¿Qué clase de shock hemorrágico estimas?',
        options: [
          { text: 'Clase I', why: 'En la clase I (< 15 %) los signos vitales son normales.' },
          { text: 'Clase II', why: 'En la clase II la presión todavía se mantiene.' },
          { text: 'Clase III', correct: true, why: 'Correcto. FC 120–140 con presión que empieza a caer: pérdida del 31–40 % de la volemia. Necesita sangre.' },
          { text: 'Clase IV', why: 'La clase IV tiene FC > 140, hipotensión marcada y letargo.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Cómo inicias la reanimación?',
        options: [
          { text: 'Dos vías de gran calibre, 1 L de cristaloide tibio, sangre temprana y ácido tranexámico', correct: true, why: 'Correcto. Reanimación equilibrada (sangre pronto, poco cristaloide) y ácido tranexámico dentro de las 3 primeras horas.' },
          { text: '4 L de solución salina rápida', why: 'El exceso de cristaloide diluye los factores de coagulación y empeora la acidosis y la hipotermia.' },
          { text: 'Noradrenalina para subir la presión', why: 'En el shock hemorrágico se repone volumen y se controla el sangrado; los vasopresores no son el tratamiento.' },
          { text: 'Esperar la tomografía antes de tratar', why: 'Nunca se lleva a un paciente inestable a la tomografía.' },
        ],
        reveal: 'Tras 1 L de cristaloide: TA 80/50 mmHg, FC 134 lpm. No responde.',
      },
      {
        stage: 'Imagen',
        prompt: '¿Qué estudio haces en la sala de reanimación?',
        options: [
          { text: 'Tomografía de abdomen con contraste', why: 'Solo para pacientes estables: este se descompensaría en el tomógrafo.' },
          { text: 'eFAST', correct: true, why: 'Correcto. La ecografía en la cama busca líquido libre en minutos, sin mover al paciente.' },
          { text: 'Radiografía simple de abdomen', why: 'No detecta sangrado intraabdominal.' },
          { text: 'Ninguno: ir directo a angiografía', why: 'La angioembolización es para pacientes que responden a la reanimación.' },
        ],
        reveal: 'eFAST: líquido libre en el espacio esplenorrenal y en la pelvis.',
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué sigue?',
        options: [
          { text: 'Laparotomía exploradora urgente', correct: true, why: 'Correcto. Inestable, sin respuesta y con eFAST positivo: quirófano para controlar el sangrado (probable rotura esplénica).' },
          { text: 'Observación con hematocritos seriados', why: 'Eso es para pacientes estables.' },
          { text: 'Tomografía ahora que hay un hallazgo', why: 'Sigue inestable: no va a la tomografía.' },
          { text: 'Esplenectomía laparoscópica programada', why: 'Es una emergencia, no una cirugía programada.' },
        ],
      },
    ],
    keyPoints: [
      'Dolor en el hombro izquierdo (signo de Kehr) tras un trauma abdominal sugiere rotura del bazo.',
      'Inestable + eFAST positivo → laparotomía. Estable → tomografía con contraste.',
      'Signo del cinturón de seguridad: busca lesión de víscera hueca y fractura de Chance.',
      'Ácido tranexámico dentro de las primeras 3 horas.',
    ],
    reference: 'American College of Surgeons. ATLS, 10.ª ed. (2018): trauma abdominal y shock. Rossaint R, et al. Crit Care. 2023;27:80.',
  },
  {
    id: 'hemorragia-varices',
    title: 'Vómito con sangre en un paciente con cirrosis',
    specialty: 'gastroenterologia',
    minutes: 5,
    intro: 'Hombre de 55 años con cirrosis por alcohol. Vomitó sangre roja abundante dos veces en la última hora. Tiene ascitis, ictericia y arañas vasculares.',
    vitals: 'TA 90/60 mmHg · FC 118 lpm · FR 22 · Hb 7,4 g/dL',
    steps: [
      {
        stage: 'Tratamiento',
        prompt: '¿Cómo transfundes a este paciente?',
        options: [
          { text: 'De forma restrictiva: transfundir si la Hb < 7 g/dL, con meta de 7–8 g/dL', correct: true, why: 'Correcto. Subir de más la hemoglobina aumenta la presión portal y el resangrado; la estrategia restrictiva reduce la mortalidad.' },
          { text: 'Hasta llegar a Hb > 10 g/dL', why: 'Aumenta la presión portal, el resangrado y la mortalidad.' },
          { text: 'No transfundir nunca', why: 'Con Hb de 7,4 y sangrado activo puede necesitarla; el objetivo es 7–8.' },
          { text: 'Solo plasma', why: 'El plasma no corrige la anemia ni ha demostrado beneficio de rutina.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué fármacos inicias antes de la endoscopia?',
        options: [
          { text: 'Un vasoactivo (octreótido o terlipresina) y ceftriaxona profiláctica', correct: true, why: 'Correcto. El vasoactivo baja la presión portal; el antibiótico profiláctico reduce las infecciones, el resangrado y la mortalidad en el cirrótico que sangra.' },
          { text: 'Solo omeprazol', why: 'Puede darse mientras se aclara la causa, pero no trata la hipertensión portal.' },
          { text: 'Propranolol IV', why: 'Los betabloqueadores no se usan en la fase aguda (empeoran la hipotensión); se usan después como profilaxis.' },
          { text: 'Vitamina K sola', why: 'No controla el sangrado variceal.' },
        ],
      },
      {
        stage: 'Diagnóstico',
        prompt: '¿Cuál es el procedimiento clave?',
        options: [
          { text: 'Endoscopia en las primeras 12 horas con ligadura con bandas', correct: true, why: 'Correcto. Confirma las várices y las trata. La ligadura es mejor que la escleroterapia.' },
          { text: 'Tomografía de abdomen', why: 'No trata el sangrado.' },
          { text: 'Balón de Sengstaken como primera opción', why: 'Es un puente temporal cuando la endoscopia falla, no la primera opción.' },
          { text: 'Esperar 72 horas', why: 'El retraso aumenta la mortalidad.' },
        ],
        reveal: 'Endoscopia: várices esofágicas grandes con estigmas de sangrado. Se colocan 4 bandas y el sangrado cede.',
      },
      {
        stage: 'Seguimiento',
        prompt: '¿Cómo previenes el resangrado?',
        options: [
          { text: 'Betabloqueador no selectivo (propranolol o carvedilol) y ligaduras seriadas', correct: true, why: 'Correcto. La combinación es la profilaxis secundaria estándar.' },
          { text: 'Solo omeprazol de por vida', why: 'No baja la presión portal.' },
          { text: 'Metoprolol', why: 'Debe ser no selectivo para reducir el flujo esplácnico.' },
          { text: 'Nada si el sangrado paró', why: 'Sin profilaxis, más de la mitad vuelve a sangrar en un año.' },
        ],
      },
    ],
    keyPoints: [
      'Transfusión restrictiva (meta 7–8 g/dL) en la hemorragia variceal.',
      'Vasoactivo + antibiótico profiláctico desde la llegada.',
      'Endoscopia en < 12 h con ligadura con bandas.',
      'Profilaxis secundaria: betabloqueador no selectivo + ligaduras.',
    ],
    reference: 'de Franchis R, et al. Baveno VII – Renewing consensus in portal hypertension. J Hepatol. 2022;76:959–974.',
  },
  {
    id: 'hiperpotasemia',
    title: 'Debilidad en un paciente renal',
    specialty: 'nefrologia',
    minutes: 4,
    intro: 'Hombre de 68 años con enfermedad renal crónica e insuficiencia cardíaca, que toma enalapril y espironolactona. Consulta por debilidad generalizada. Potasio: 7,1 mEq/L.',
    vitals: 'TA 138/84 mmHg · FC 54 lpm · ECG: ondas T picudas y QRS ensanchado',
    steps: [
      {
        stage: 'Tratamiento',
        prompt: 'Hay cambios en el ECG. ¿Qué das primero?',
        options: [
          { text: 'Gluconato de calcio IV', correct: true, why: 'Correcto. Estabiliza la membrana del miocardio en minutos. No baja el potasio, pero protege el corazón mientras lo bajas.' },
          { text: 'Resina de intercambio (poliestireno)', why: 'Tarda horas; no protege del paro.' },
          { text: 'Furosemida', why: 'Ayuda a eliminar potasio, pero es lenta y no protege el corazón.' },
          { text: 'Bicarbonato como única medida', why: 'Su efecto es modesto y sobre todo útil si hay acidosis.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Cómo metes el potasio dentro de las células?',
        options: [
          { text: 'Insulina regular 10 U IV con dextrosa, y salbutamol nebulizado', correct: true, why: 'Correcto. La insulina y los agonistas beta-2 activan la bomba Na⁺/K⁺; la dextrosa evita la hipoglucemia.' },
          { text: 'Más calcio', why: 'El calcio protege la membrana pero no mueve el potasio.' },
          { text: 'Solución salina 0,9 %', why: 'No mueve el potasio a la célula.' },
          { text: 'Espironolactona', why: 'La empeoraría: retiene potasio.' },
        ],
      },
      {
        stage: 'Seguimiento',
        prompt: 'Después de la insulina, ¿qué complicación vigilas?',
        options: [
          { text: 'Hipoglucemia', correct: true, why: 'Correcto. Es frecuente en las horas siguientes, sobre todo en pacientes renales: glucemia cada hora.' },
          { text: 'Hipercalcemia', why: 'Una dosis de gluconato de calcio no suele causarla.' },
          { text: 'Hipernatremia', why: 'No es un efecto de este tratamiento.' },
          { text: 'Hiperpotasemia de rebote inmediata', why: 'El efecto dura unas horas; por eso hay que eliminar el potasio, no solo moverlo.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Cómo eliminas el exceso de potasio?',
        options: [
          { text: 'Suspender enalapril y espironolactona; diurético de asa si orina, quelantes de potasio y hemodiálisis si no responde', correct: true, why: 'Correcto. Quitar la causa y sacar el potasio del cuerpo; la diálisis es la medida más eficaz si fallan las demás.' },
          { text: 'Repetir solo insulina cada 4 horas', why: 'Mueve el potasio pero no lo elimina.' },
          { text: 'Seguir igual con los fármacos', why: 'La combinación IECA + antagonista de aldosterona en un renal es la causa del problema.' },
          { text: 'Dieta rica en plátano', why: 'Al contrario: hay que restringir el potasio.' },
        ],
      },
    ],
    keyPoints: [
      'Hiperpotasemia con cambios en el ECG: gluconato de calcio primero.',
      'Desplazar: insulina con glucosa y salbutamol. Eliminar: diuréticos, quelantes o diálisis.',
      'Vigila la hipoglucemia tras la insulina.',
      'Ojo con IECA/ARA-II + espironolactona en la enfermedad renal crónica.',
    ],
    reference: 'Palmer BF, Clegg DJ. Diagnosis and treatment of hyperkalemia. Cleve Clin J Med. 2017;84:934–942. KDIGO Controversies Conference on potassium. Kidney Int. 2020;97:42–61.',
  },
  {
    id: 'torsion-testicular',
    title: 'Dolor testicular de golpe',
    specialty: 'urologia',
    minutes: 4,
    intro: 'Adolescente de 15 años con dolor súbito e intenso en el testículo izquierdo desde hace 3 horas, con náuseas y un vómito. Empezó mientras dormía.',
    vitals: 'TA 124/78 mmHg · FC 104 lpm · T 36,9 °C',
    steps: [
      {
        stage: 'Examen físico',
        prompt: 'El testículo izquierdo está elevado, horizontal, muy doloroso, y el reflejo cremastérico está ausente. ¿Qué sospechas?',
        options: [
          { text: 'Torsión testicular', correct: true, why: 'Correcto. Dolor súbito con náuseas, testículo alto y horizontal y reflejo cremastérico ausente: torsión hasta demostrar lo contrario.' },
          { text: 'Epididimitis', why: 'Suele ser gradual, con fiebre o síntomas urinarios, y el dolor alivia al elevar el testículo (Prehn positivo).' },
          { text: 'Torsión del apéndice testicular', why: 'Da dolor localizado en el polo superior con el «punto azul»; el reflejo cremastérico se conserva.' },
          { text: 'Hidrocele', why: 'No duele de forma aguda y transilumina.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué haces ahora?',
        options: [
          { text: 'Exploración quirúrgica inmediata, sin retrasarla por estudios', correct: true, why: 'Correcto. Con alta sospecha clínica se va al quirófano: cada hora cuenta. La ecografía Doppler solo si hay dudas y no retrasa la cirugía.' },
          { text: 'Antibióticos y control en 48 horas', why: 'Es el manejo de la epididimitis; aquí se perdería el testículo.' },
          { text: 'Analgesia y alta', why: 'La torsión no se resuelve sola.' },
          { text: 'Tomografía de pelvis', why: 'No sirve y retrasa la cirugía.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: 'En el quirófano el testículo recupera el color al destorcerlo. ¿Qué se hace?',
        options: [
          { text: 'Orquidopexia bilateral', correct: true, why: 'Correcto. Se fija el testículo afectado y también el contralateral, porque la anomalía anatómica (en badajo de campana) suele ser bilateral.' },
          { text: 'Solo destorcer y cerrar', why: 'Puede volver a torcerse.' },
          { text: 'Orquiectomía', why: 'Solo si el testículo no es viable.' },
          { text: 'Fijar solo el lado afectado', why: 'El otro lado tiene el mismo riesgo.' },
        ],
      },
      {
        stage: 'Seguimiento',
        prompt: 'Otro paciente llega con 30 horas de evolución y el testículo está negro y no recupera el color al destorcerlo. ¿Qué haces?',
        options: [
          { text: 'Orquiectomía del lado afectado y orquidopexia del contralateral', correct: true, why: 'Correcto. Un testículo necrótico se extirpa (si se deja puede infectarse y afectar la fertilidad), y el otro se fija para que no le pase lo mismo.' },
          { text: 'Dejarlo y dar antibióticos', why: 'Un testículo necrótico no se recupera; dejarlo expone a infección y atrofia.' },
          { text: 'Solo orquiectomía, sin tocar el otro', why: 'El testículo que queda tiene la misma anomalía anatómica: hay que fijarlo.' },
          { text: 'Esperar a ver si mejora en una semana', why: 'La necrosis es irreversible: esperar no cambia nada y añade riesgos.' },
        ],
      },
    ],
    keyPoints: [
      'Dolor testicular súbito en un adolescente = torsión hasta demostrar lo contrario.',
      'Reflejo cremastérico ausente y testículo alto y horizontal.',
      'Antes de 6 horas casi todos los testículos se salvan; después la viabilidad cae rápido.',
      'Cirugía sin retraso y orquidopexia bilateral.',
    ],
    reference: 'European Association of Urology. Guidelines on Paediatric Urology, 2024: torsión testicular.',
  },
  {
    id: 'sindrome-compartimental',
    title: 'Dolor que no cede bajo el yeso',
    specialty: 'ortopedia',
    minutes: 4,
    intro: 'Hombre de 28 años con fractura cerrada de la diáfisis tibial, inmovilizada con un yeso circular hace 10 horas. Tiene dolor creciente en la pierna que no mejora con morfina.',
    vitals: 'TA 132/80 mmHg · FC 108 lpm · Pulso pedio presente',
    steps: [
      {
        stage: 'Examen físico',
        prompt: 'Al extender pasivamente los dedos del pie el dolor se vuelve insoportable. ¿Qué sospechas?',
        options: [
          { text: 'Síndrome compartimental', correct: true, why: 'Correcto. Dolor desproporcionado que no cede con opioides y dolor al estiramiento pasivo son los signos tempranos. El pulso presente no lo descarta.' },
          { text: 'Dolor esperable de la fractura', why: 'El dolor de la fractura mejora con la inmovilización y la analgesia; este empeora.' },
          { text: 'Trombosis venosa profunda', why: 'No explica el dolor intenso al estirar los músculos.' },
          { text: 'Lesión del nervio peroneo aislada', why: 'Daría debilidad y anestesia en el dorso del pie, no este dolor.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué haces primero?',
        options: [
          { text: 'Abrir el yeso y los vendajes hasta la piel y dejar la pierna a la altura del corazón', correct: true, why: 'Correcto. Quitar toda compresión externa. No se eleva la pierna por encima del corazón porque reduce la perfusión.' },
          { text: 'Elevar la pierna lo más alto posible', why: 'La elevación excesiva baja la presión de perfusión del compartimento.' },
          { text: 'Más morfina y esperar', why: 'El tiempo es músculo: después de 6 horas de isquemia el daño es irreversible.' },
          { text: 'Aplicar hielo y apretar el vendaje', why: 'Apretar empeora la presión del compartimento.' },
        ],
        reveal: 'Una hora después persiste el dolor. Presión del compartimento anterior: 45 mmHg; diastólica: 70 mmHg.',
      },
      {
        stage: 'Diagnóstico',
        prompt: '¿Cómo interpretas la medición?',
        options: [
          { text: 'Diferencia (diastólica − compartimento) de 25 mmHg: < 30, indica fasciotomía', correct: true, why: 'Correcto. Una diferencia < 30 mmHg confirma un flujo insuficiente. Con la clínica tan clara, la medición solo apoya la decisión.' },
          { text: 'Normal, porque hay pulso', why: 'El pulso se pierde muy tarde; la presión que importa es la del compartimento.' },
          { text: 'Solo se opera si supera 80 mmHg', why: 'Ese umbral es demasiado tardío.' },
          { text: 'No significa nada sin una resonancia', why: 'La resonancia no está indicada y retrasa el tratamiento.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Cuál es el tratamiento?',
        options: [
          { text: 'Fasciotomía urgente de los cuatro compartimentos de la pierna', correct: true, why: 'Correcto. Libera los cuatro compartimentos (anterior, lateral, posterior superficial y profundo) por dos incisiones.' },
          { text: 'Manitol y observar', why: 'No sustituye la descompresión quirúrgica.' },
          { text: 'Fasciotomía solo del compartimento anterior', why: 'Deben liberarse los cuatro.' },
          { text: 'Amputación', why: 'Solo si el miembro ya no es viable.' },
        ],
      },
    ],
    keyPoints: [
      'Signos tempranos: dolor desproporcionado y dolor al estiramiento pasivo. La falta de pulso es tardía.',
      'Primero: retirar yesos y vendajes; pierna a la altura del corazón.',
      'Diferencia (diastólica − compartimento) < 30 mmHg → fasciotomía.',
      'Complicaciones: rabdomiólisis, insuficiencia renal y contractura de Volkmann.',
    ],
    reference: 'British Orthopaedic Association. BOAST: Diagnosis and Management of Compartment Syndrome of the Limbs, 2016. ATLS, 10.ª ed.: trauma musculoesquelético.',
  },
  {
    id: 'glaucoma-agudo',
    title: 'Ojo rojo y dolor después del cine',
    specialty: 'oftalmologia-orl',
    minutes: 4,
    intro: 'Mujer de 62 años, hipermétrope, con dolor intenso en el ojo derecho que empezó al salir del cine, visión borrosa con halos alrededor de las luces, cefalea y vómitos.',
    vitals: 'Ojo derecho rojo, córnea turbia, pupila en midriasis media que no reacciona; al palpar, el ojo está duro',
    steps: [
      {
        stage: 'Diagnóstico',
        prompt: '¿Qué tiene?',
        options: [
          { text: 'Glaucoma agudo de ángulo cerrado', correct: true, why: 'Correcto. La oscuridad dilata la pupila y cierra el ángulo en un ojo hipermétrope: dolor, halos, córnea edematosa, pupila fija en midriasis media y ojo duro.' },
          { text: 'Conjuntivitis', why: 'No da dolor intenso, visión borrosa ni pupila fija.' },
          { text: 'Uveítis anterior', why: 'Da ojo rojo y dolor, pero la pupila suele estar miótica.' },
          { text: 'Migraña', why: 'Los vómitos y la cefalea confunden, pero el ojo rojo, duro y con pupila fija apunta al glaucoma.' },
        ],
      },
      {
        stage: 'Examen físico',
        prompt: '¿Qué examen confirma que el ángulo iridocorneal está cerrado?',
        options: [
          { text: 'Gonioscopia', correct: true, why: 'Correcto. Con una lente especial se mira directamente el ángulo entre el iris y la córnea; también se mide la presión intraocular con tonometría.' },
          { text: 'Tomografía de órbitas', why: 'No muestra el ángulo y retrasa el tratamiento.' },
          { text: 'Campimetría', why: 'Mide el daño del campo visual en el glaucoma crónico, no el cierre agudo del ángulo.' },
          { text: 'Tinción con fluoresceína', why: 'Sirve para úlceras y erosiones de la córnea.' },
        ],
        reveal: 'Presión intraocular: 58 mmHg en el ojo derecho (normal 10–21). Ángulo cerrado en la gonioscopia.',
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué tratamiento inicias?',
        options: [
          { text: 'Bajar la presión: timolol y un alfa-agonista tópicos, acetazolamida, y manitol si no baja; después pilocarpina', correct: true, why: 'Correcto. Se combinan fármacos que reducen la producción de humor acuoso; la pilocarpina se añade cuando baja la presión y el iris vuelve a responder.' },
          { text: 'Gotas de atropina', why: 'Dilatan la pupila y cierran más el ángulo: empeoran el cuadro.' },
          { text: 'Antibiótico tópico', why: 'No es una infección.' },
          { text: 'Analgesia y cita en una semana', why: 'Sin tratamiento urgente puede perder la visión en horas.' },
        ],
      },
      {
        stage: 'Seguimiento',
        prompt: 'Una vez controlada la crisis, ¿qué tratamiento definitivo indicas?',
        options: [
          { text: 'Iridotomía periférica con láser en ambos ojos', correct: true, why: 'Correcto. Crea un paso para el humor acuoso y evita nuevas crisis; se hace también en el otro ojo, que tiene el mismo ángulo estrecho.' },
          { text: 'Solo gotas de por vida', why: 'No corrige el mecanismo de cierre.' },
          { text: 'Iridotomía solo del ojo afectado', why: 'El ojo contralateral tiene alto riesgo de una crisis.' },
          { text: 'Trasplante de córnea', why: 'No está indicado.' },
        ],
      },
    ],
    keyPoints: [
      'Ojo rojo doloroso + halos + pupila en midriasis media fija + ojo duro = glaucoma agudo de ángulo cerrado.',
      'Factores: hipermetropía, edad, mujer, oscuridad o fármacos que dilatan la pupila.',
      'Evita midriáticos y anticolinérgicos.',
      'Tratamiento definitivo: iridotomía con láser en ambos ojos.',
    ],
    reference: 'American Academy of Ophthalmology. Primary Angle-Closure Disease Preferred Practice Pattern, 2020.',
  },
  {
    id: 'sindrome-toracico-agudo',
    title: 'Dolor torácico en un joven con drepanocitosis',
    specialty: 'hematologia',
    minutes: 5,
    intro: 'Adolescente de 16 años con anemia falciforme (HbSS), ingresado hace dos días por una crisis de dolor. Hoy tiene dolor torácico, tos y fiebre.',
    vitals: 'T 38,5 °C · FC 116 lpm · FR 28 · SpO₂ 89 % al aire · Hb 7,2 g/dL',
    steps: [
      {
        stage: 'Imagen',
        prompt: 'La radiografía muestra un infiltrado nuevo en la base izquierda. ¿Qué diagnóstico haces?',
        options: [
          { text: 'Síndrome torácico agudo', correct: true, why: 'Correcto. Infiltrado pulmonar nuevo con fiebre o síntomas respiratorios en un paciente con drepanocitosis. Es la principal causa de muerte en estos pacientes.' },
          { text: 'Crisis de dolor sin complicaciones', why: 'El infiltrado nuevo y la hipoxemia cambian el diagnóstico.' },
          { text: 'Ansiedad', why: 'La hipoxemia y el infiltrado son objetivos.' },
          { text: 'Pericarditis', why: 'No explica el infiltrado.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué tratamiento indicas?',
        options: [
          { text: 'Oxígeno, analgesia, espirometría incentivada, cefalosporina + macrólido y transfusión', correct: true, why: 'Correcto. Se cubren neumococo y atípicos; la transfusión (simple o de intercambio si es grave) mejora la oxigenación.' },
          { text: 'Solo analgesia', why: 'No trata la causa ni la hipoxemia.' },
          { text: 'Líquidos IV en grandes volúmenes', why: 'La sobrecarga de líquidos puede empeorar el edema pulmonar; se hidrata con cuidado.' },
          { text: 'Esperar a que baje la fiebre', why: 'Puede progresar a insuficiencia respiratoria en horas.' },
        ],
      },
      {
        stage: 'Laboratorio',
        prompt: 'A las 12 horas empeora: SpO₂ 85 % con oxígeno, infiltrados en ambos pulmones y Hb 9 g/dL. ¿Qué transfusión indicas?',
        options: [
          { text: 'Exanguinotransfusión (transfusión de intercambio)', correct: true, why: 'Correcto. En el síndrome torácico grave o progresivo se recambia la sangre para bajar la HbS (meta < 30 %) sin subir la viscosidad.' },
          { text: 'Transfusión simple hasta Hb 13 g/dL', why: 'Subir tanto la hemoglobina aumenta la viscosidad y puede empeorar la vasooclusión.' },
          { text: 'No transfundir', why: 'Con hipoxemia progresiva la transfusión es parte esencial del tratamiento.' },
          { text: 'Solo plasma', why: 'El plasma no reduce la proporción de hemoglobina S.' },
        ],
      },
      {
        stage: 'Seguimiento',
        prompt: '¿Qué fármaco reduce las crisis y el síndrome torácico a largo plazo?',
        options: [
          { text: 'Hidroxiurea', correct: true, why: 'Correcto. Aumenta la hemoglobina fetal y reduce las crisis de dolor, el síndrome torácico, las transfusiones y la mortalidad.' },
          { text: 'Hierro oral', why: 'No están ferropénicos y suelen tener sobrecarga de hierro por las transfusiones.' },
          { text: 'Aspirina', why: 'No previene las crisis vasooclusivas.' },
          { text: 'Corticoides crónicos', why: 'No están indicados.' },
        ],
      },
    ],
    keyPoints: [
      'Síndrome torácico agudo: infiltrado nuevo + fiebre o síntomas respiratorios en la drepanocitosis.',
      'Oxígeno, analgesia, espirometría incentivada, antibióticos (cefalosporina + macrólido) y transfusión.',
      'Hidroxiurea como prevención; penicilina profiláctica y vacunas en los niños.',
    ],
    reference: 'National Heart, Lung, and Blood Institute. Evidence-Based Management of Sickle Cell Disease: Expert Panel Report, 2014.',
  },
  {
    id: 'organofosforados',
    title: 'El agricultor que no deja de babear',
    specialty: 'farmacologia',
    minutes: 4,
    intro: 'Agricultor de 40 años traído desde el campo después de fumigar sin protección. Tiene sialorrea, lagrimeo, sudoración, vómitos, diarrea y dificultad para respirar.',
    vitals: 'TA 96/60 mmHg · FC 46 lpm · FR 28 · SpO₂ 88 % · pupilas puntiformes · fasciculaciones',
    steps: [
      {
        stage: 'Diagnóstico',
        prompt: '¿Qué síndrome tóxico presenta?',
        options: [
          { text: 'Colinérgico, por un inhibidor de la acetilcolinesterasa (organofosforado)', correct: true, why: 'Correcto. Secreciones por todas partes, miosis, bradicardia, broncorrea y fasciculaciones: exceso de acetilcolina.' },
          { text: 'Anticolinérgico', why: 'Es lo contrario: piel seca, midriasis, taquicardia y retención urinaria.' },
          { text: 'Opioide', why: 'Da miosis y depresión respiratoria, pero no secreciones abundantes ni fasciculaciones.' },
          { text: 'Simpaticomimético', why: 'Da midriasis, taquicardia e hipertensión.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Qué haces primero?',
        options: [
          { text: 'Protegerte, quitarle la ropa, lavar la piel y asegurar vía aérea y oxígeno', correct: true, why: 'Correcto. Descontaminar evita que siga absorbiendo el tóxico (y que se intoxique el personal) mientras se atiende el ABC.' },
          { text: 'Lavado gástrico de rutina', why: 'La exposición fue por la piel y la vía respiratoria; además el lavado no es de rutina.' },
          { text: 'Esperar el nivel de colinesterasa', why: 'El tratamiento no puede esperar el laboratorio.' },
          { text: 'Dar fisostigmina', why: 'Es otro inhibidor de la colinesterasa: empeoraría el cuadro.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Cuál es el antídoto principal y cuál es su meta?',
        options: [
          { text: 'Atropina IV, duplicando la dosis cada 5 minutos hasta secar las secreciones bronquiales', correct: true, why: 'Correcto. La meta es pulmones sin secreciones, FC > 80 y PAS > 80 mmHg. No se guía por la pupila.' },
          { text: 'Atropina hasta que la pupila se dilate', why: 'La pupila puede tardar o no responder; la meta son las secreciones bronquiales.' },
          { text: 'Naloxona', why: 'Es el antídoto de los opioides.' },
          { text: 'Flumazenil', why: 'Es el antagonista de las benzodiacepinas.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: 'Persisten las fasciculaciones y la debilidad. ¿Qué añades?',
        options: [
          { text: 'Pralidoxima (oxima)', correct: true, why: 'Correcto. Reactiva la acetilcolinesterasa antes de que la unión se vuelva irreversible («envejecimiento»). La atropina no actúa sobre los receptores nicotínicos.' },
          { text: 'Más atropina para las fasciculaciones', why: 'La atropina bloquea receptores muscarínicos; los nicotínicos (músculo) no responden a ella.' },
          { text: 'Succinilcolina para intubar', why: 'Se evita: la colinesterasa inhibida prolonga mucho su efecto.' },
          { text: 'Nada más', why: 'La debilidad puede progresar a insuficiencia respiratoria.' },
        ],
      },
    ],
    keyPoints: [
      'Síndrome colinérgico: secreciones (sialorrea, lagrimeo, broncorrea, diarrea), miosis, bradicardia y fasciculaciones.',
      'Descontamina y protégete.',
      'Atropina en dosis crecientes hasta secar los bronquios; pralidoxima para los efectos nicotínicos.',
      'Evita la succinilcolina.',
    ],
    reference: 'Eddleston M, et al. Management of acute organophosphorus pesticide poisoning. Lancet. 2008;371:597–607.',
  },
  {
    id: 'artritis-septica',
    title: 'Rodilla caliente y fiebre',
    specialty: 'reumatologia',
    minutes: 4,
    intro: 'Hombre de 58 años con diabetes. Desde hace 2 días tiene la rodilla derecha roja, caliente, hinchada y muy dolorosa; no puede apoyarla. No recuerda trauma.',
    vitals: 'T 38,4 °C · FC 104 lpm · TA 128/78 mmHg',
    steps: [
      {
        stage: 'Laboratorio',
        prompt: 'Monoartritis aguda con fiebre. ¿Cuál es el estudio clave?',
        options: [
          { text: 'Artrocentesis con citoquímico, Gram, cultivo y búsqueda de cristales, antes del antibiótico', correct: true, why: 'Correcto. Toda monoartritis aguda se punciona: distingue infección de cristales. Se toma antes del antibiótico para no negativizar el cultivo.' },
          { text: 'Ácido úrico en sangre', why: 'Puede estar normal en un ataque de gota y alto sin gota: no decide.' },
          { text: 'Radiografía y esperar', why: 'En la fase aguda suele ser normal y retrasa el diagnóstico.' },
          { text: 'Iniciar antibiótico y no puncionar', why: 'Sin el líquido no se confirma la infección ni el germen.' },
        ],
        reveal: 'Líquido turbio: 85 000 leucocitos/µL, 92 % neutrófilos, sin cristales. Gram: cocos grampositivos en racimos.',
      },
      {
        stage: 'Diagnóstico',
        prompt: '¿Qué tiene?',
        options: [
          { text: 'Artritis séptica por Staphylococcus aureus', correct: true, why: 'Correcto. Líquido purulento (> 50 000 leucocitos, > 90 % neutrófilos) con cocos en racimos: S. aureus, el germen más frecuente en adultos.' },
          { text: 'Gota', why: 'No hay cristales de urato; y la gota no muestra bacterias en el Gram.' },
          { text: 'Pseudogota', why: 'Tendría cristales de pirofosfato cálcico.' },
          { text: 'Artrosis', why: 'El líquido de la artrosis tiene < 2000 leucocitos.' },
        ],
      },
      {
        stage: 'Tratamiento',
        prompt: '¿Cómo la tratas?',
        options: [
          { text: 'Antibiótico IV empírico (con vancomicina si hay riesgo de SARM) y drenaje de la articulación', correct: true, why: 'Correcto. Además del antibiótico hay que vaciar el pus: artrocentesis repetidas o lavado artroscópico.' },
          { text: 'Colchicina y AINE', why: 'Es el tratamiento de la gota.' },
          { text: 'Infiltración de corticoide', why: 'Está contraindicada en una articulación infectada.' },
          { text: 'Antibiótico oral y control en una semana', why: 'La artritis séptica destruye el cartílago en días: necesita antibiótico IV y drenaje.' },
        ],
      },
      {
        stage: 'Seguimiento',
        prompt: 'Otra paciente, de 22 años y sexualmente activa, tiene dolor que salta de una articulación a otra, tenosinovitis en la muñeca y pústulas en la piel. ¿Qué germen sospechas?',
        options: [
          { text: 'Neisseria gonorrhoeae', correct: true, why: 'Correcto. La tríada de infección gonocócica diseminada: poliartralgias migratorias, tenosinovitis y dermatitis pustulosa. Se trata con ceftriaxona y se estudian otras ITS.' },
          { text: 'Staphylococcus aureus', why: 'Suele dar una monoartritis purulenta, sin tenosinovitis ni pústulas.' },
          { text: 'Borrelia burgdorferi', why: 'La enfermedad de Lyme da artritis de rodilla tras eritema migratorio, no pústulas.' },
          { text: 'Streptococcus pyogenes', why: 'No produce este cuadro de tenosinovitis con pústulas.' },
        ],
      },
    ],
    keyPoints: [
      'Monoartritis aguda = artrocentesis siempre, antes del antibiótico.',
      'Líquido séptico: > 50 000 leucocitos/µL con > 90 % neutrófilos.',
      'S. aureus es el germen más frecuente; en jóvenes sexualmente activos piensa en gonococo.',
      'Antibiótico IV + drenaje articular.',
    ],
    reference: 'Ross JJ. Septic arthritis of native joints. Infect Dis Clin North Am. 2017;31:203–218. Margaretten ME, et al. JAMA. 2007;297:1478–1488.',
  },
]

export const caseById = (id: string) => CASES.find((c) => c.id === id)
