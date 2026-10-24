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
]

export const caseById = (id: string) => CASES.find((c) => c.id === id)
