import type { Guide } from '@/types'

/**
 * Guías de alto rendimiento. Contenido educativo resumido: siempre contrastar con la guía original
 * vigente y con los protocolos del Ministerio de Salud Pública de la República Dominicana.
 */
export const GUIDES: Guide[] = [
  {
    id: 'dengue',
    title: 'Dengue: clasificación y manejo',
    specialty: 'infectologia',
    summary: 'Fases de la enfermedad, signos de alarma y manejo por grupos A, B y C según OPS/OMS.',
    minutes: 8,
    level: 'Intermedio',
    sections: [
      {
        heading: 'Clasificación (OMS 2009)',
        bullets: [
          'Dengue sin signos de alarma.',
          'Dengue con signos de alarma.',
          'Dengue grave: extravasación grave de plasma (choque o acumulación de líquidos con dificultad respiratoria), hemorragia grave o compromiso grave de órganos.',
        ],
      },
      {
        heading: 'Fases de la enfermedad',
        table: {
          head: ['Fase', 'Duración', 'Qué vigilar'],
          rows: [
            ['Febril', 'Días 1–3 (hasta 7)', 'Deshidratación, fiebre alta, prueba del torniquete'],
            ['Crítica', 'Defervescencia (días 3–7), 24–48 h', 'Fuga capilar: choque, hemoconcentración, caída de plaquetas'],
            ['Recuperación', 'Tras 48–72 h de la fase crítica', 'Reabsorción de líquidos: sobrecarga, edema pulmonar'],
          ],
        },
        pearl: 'El momento de mayor riesgo es cuando cede la fiebre: no confundir la defervescencia con mejoría.',
      },
      {
        heading: 'Signos de alarma',
        bullets: [
          'Dolor abdominal intenso y continuo, o a la palpación.',
          'Vómitos persistentes.',
          'Acumulación de líquidos (ascitis, derrame pleural o pericárdico).',
          'Sangrado de mucosas.',
          'Letargia o irritabilidad.',
          'Hepatomegalia > 2 cm.',
          'Aumento progresivo del hematocrito con descenso rápido de plaquetas.',
        ],
      },
      {
        heading: 'Manejo por grupos (OPS)',
        table: {
          head: ['Grupo', 'Paciente', 'Conducta'],
          rows: [
            ['A', 'Sin signos de alarma, tolera vía oral, sin comorbilidad ni riesgo social', 'Ambulatorio: líquidos orales abundantes, paracetamol, reposo, educar sobre signos de alarma. Evitar AINE y aspirina.'],
            ['B1', 'Sin signos de alarma pero con comorbilidad, embarazo, extremos de edad o riesgo social', 'Observación/hospitalización; hidratación oral o IV de mantenimiento.'],
            ['B2', 'Con signos de alarma', 'Cristaloides (Ringer lactato o SSN) 10 mL/kg en la 1.ª hora; si mejora, reducir progresivamente (5–7 → 3–5 → 2–4 mL/kg/h) con control de hematocrito.'],
            ['C', 'Dengue grave / choque', 'Bolo de cristaloides 20 mL/kg en 15–30 min, reevaluar; UCI. Considerar coloides o transfusión según evolución.'],
          ],
        },
        warning: 'No usar AINE, aspirina ni inyecciones intramusculares. La transfusión de plaquetas profiláctica no está indicada.',
      },
    ],
    references: ['OPS. Directrices para el diagnóstico clínico y el tratamiento del dengue, chikunguña y zika, 2022.', 'OMS. Dengue: guías para el diagnóstico, tratamiento, prevención y control, 2009.'],
  },
  {
    id: 'hipertension-embarazo',
    title: 'Trastornos hipertensivos del embarazo',
    specialty: 'ginecologia-obstetricia',
    summary: 'Preeclampsia, eclampsia y HELLP: diagnóstico, criterios de severidad, sulfato de magnesio y momento del parto.',
    minutes: 9,
    level: 'Intermedio',
    sections: [
      {
        heading: 'Clasificación',
        bullets: [
          'Hipertensión crónica: antes del embarazo o antes de las 20 semanas.',
          'Hipertensión gestacional: ≥ 140/90 después de las 20 semanas sin proteinuria ni daño de órgano.',
          'Preeclampsia: hipertensión después de las 20 semanas + proteinuria (≥ 300 mg/24 h o índice proteína/creatinina ≥ 0,3) o disfunción de órgano blanco.',
          'Eclampsia: convulsiones tónico-clónicas en una paciente con preeclampsia, sin otra causa.',
          'Preeclampsia sobreagregada a hipertensión crónica.',
        ],
      },
      {
        heading: 'Criterios de severidad',
        bullets: [
          'TA ≥ 160/110 mmHg en dos tomas.',
          'Plaquetas < 100 000/µL.',
          'Transaminasas al doble de lo normal o dolor en epigastrio/HCD persistente.',
          'Creatinina > 1,1 mg/dL o el doble de la basal.',
          'Edema pulmonar.',
          'Cefalea nueva que no cede o alteraciones visuales.',
        ],
        pearl: 'La proteinuria masiva ya no es criterio de severidad, y la proteinuria no es imprescindible para el diagnóstico si hay daño de órgano.',
      },
      {
        heading: 'Sulfato de magnesio',
        body: 'Indicado en preeclampsia con criterios de severidad y eclampsia para prevenir/tratar convulsiones.',
        bullets: [
          'Dosis de impregnación: 4–6 g IV en 15–20 min.',
          'Mantenimiento: 1–2 g/h IV, hasta 24 h posparto.',
          'Vigilar: reflejos osteotendinosos, frecuencia respiratoria (> 12) y diuresis (> 25–30 mL/h).',
          'Antídoto: gluconato de calcio 1 g IV.',
        ],
      },
      {
        heading: 'Antihipertensivos y finalización',
        table: {
          head: ['Situación', 'Conducta'],
          rows: [
            ['Crisis (≥ 160/110)', 'Labetalol IV, hidralazina IV o nifedipino oral de liberación inmediata, en 30–60 min.'],
            ['Contraindicados', 'IECA, ARA-II y antagonistas de renina (teratogénicos).'],
            ['Sin criterios de severidad', 'Finalizar a las 37 semanas.'],
            ['Con criterios de severidad', 'Finalizar a partir de las 34 semanas (antes si hay inestabilidad materna o fetal), tras estabilizar y maduración pulmonar si < 34 sem.'],
          ],
        },
      },
      {
        heading: 'Prevención',
        body: 'Aspirina a dosis baja (81–150 mg/noche) desde las 12–16 semanas hasta las 36 en mujeres con alto riesgo: preeclampsia previa, embarazo múltiple, hipertensión crónica, diabetes, enfermedad renal o autoinmune.',
      },
    ],
    references: ['ACOG Practice Bulletin 222: Gestational Hypertension and Preeclampsia, 2020.', 'ISSHP classification, 2021.'],
  },
  {
    id: 'sindrome-coronario',
    title: 'Síndrome coronario agudo',
    specialty: 'cardiologia',
    summary: 'IAMCEST, IAMSEST y angina inestable: diagnóstico, localización en ECG y tratamiento inicial.',
    minutes: 10,
    level: 'Avanzado',
    sections: [
      {
        heading: 'Clasificación',
        table: {
          head: ['Tipo', 'ECG', 'Troponina'],
          rows: [
            ['Angina inestable', 'Normal, descenso del ST o T invertida', 'Normal'],
            ['IAMSEST', 'Normal, descenso del ST o T invertida', 'Elevada'],
            ['IAMCEST', 'Elevación persistente del ST o BRI nuevo', 'Elevada (no esperar resultado para reperfundir)'],
          ],
        },
      },
      {
        heading: 'Localización en el ECG',
        table: {
          head: ['Cara', 'Derivaciones', 'Arteria'],
          rows: [
            ['Anterior / anteroseptal', 'V1–V4', 'Descendente anterior'],
            ['Lateral', 'DI, aVL, V5–V6', 'Circunfleja'],
            ['Inferior', 'DII, DIII, aVF', 'Coronaria derecha (~80%)'],
            ['Ventrículo derecho', 'V3R–V4R', 'Coronaria derecha proximal'],
            ['Posterior', 'Descenso del ST en V1–V3 (ST ↑ en V7–V9)', 'Circunfleja / CD'],
          ],
        },
        warning: 'En el infarto de ventrículo derecho evitar nitratos y diuréticos: dependen de la precarga. Tratar la hipotensión con volumen.',
      },
      {
        heading: 'Tratamiento inicial',
        bullets: [
          'Aspirina dosis de carga (150–300 mg masticada) + inhibidor P2Y12.',
          'Anticoagulación parenteral (heparina).',
          'Oxígeno solo si SatO₂ < 90%.',
          'Nitratos para el dolor si no hay hipotensión, infarto de VD ni uso reciente de inhibidores de la PDE-5.',
          'Estatina de alta intensidad lo antes posible.',
          'Betabloqueador oral si no hay signos de insuficiencia cardíaca, bajo gasto ni bloqueo AV.',
        ],
      },
      {
        heading: 'Reperfusión en IAMCEST',
        bullets: [
          'ICP primaria si puede realizarse en ≤ 120 min desde el diagnóstico (preferida).',
          'Si no: fibrinólisis dentro de los primeros 10 min tras el diagnóstico, en pacientes con < 12 h de síntomas, y traslado a centro con hemodinamia.',
          'Contraindicaciones absolutas de fibrinólisis: hemorragia intracraneal previa, ACV isquémico < 6 meses, neoplasia del SNC, sangrado activo, disección aórtica.',
        ],
        pearl: 'Clasificación de Killip-Kimball: I sin IC, II estertores/S3, III edema agudo de pulmón, IV shock cardiogénico.',
      },
    ],
    references: ['ESC Guidelines for the management of acute coronary syndromes, 2023.', 'ACC/AHA Guideline for the management of STEMI.'],
  },
  {
    id: 'diarrea-pediatrica',
    title: 'Diarrea aguda y deshidratación en pediatría',
    specialty: 'pediatria',
    summary: 'Evaluación del grado de deshidratación y planes A, B y C de la OMS, zinc y uso racional de antibióticos.',
    minutes: 7,
    level: 'Básico',
    sections: [
      {
        heading: 'Evaluación de la deshidratación (OMS)',
        table: {
          head: ['Signo', 'Sin deshidratación', 'Algún grado', 'Grave'],
          rows: [
            ['Estado general', 'Alerta', 'Inquieto, irritable', 'Letárgico o inconsciente'],
            ['Ojos', 'Normales', 'Hundidos', 'Hundidos'],
            ['Sed', 'Bebe normal', 'Bebe ávidamente', 'Bebe poco o no puede'],
            ['Pliegue cutáneo', 'Desaparece rápido', 'Lento (< 2 s)', 'Muy lento (≥ 2 s)'],
          ],
        },
        body: 'Dos o más signos de una columna clasifican al paciente en ese grupo.',
      },
      {
        heading: 'Planes de tratamiento',
        bullets: [
          'Plan A (sin deshidratación): manejo en casa, más líquidos, SRO después de cada evacuación (< 2 años: 50–100 mL; ≥ 2 años: 100–200 mL), continuar alimentación y lactancia, zinc.',
          'Plan B (algún grado): SRO 75 mL/kg en 4 horas en el establecimiento y reevaluar.',
          'Plan C (grave): Ringer lactato 100 mL/kg IV. < 12 meses: 30 mL/kg en 1 h y 70 mL/kg en 5 h. ≥ 12 meses: 30 mL/kg en 30 min y 70 mL/kg en 2½ h.',
        ],
        pearl: 'Zinc por 10–14 días: 10 mg/día en < 6 meses y 20 mg/día en ≥ 6 meses. Reduce duración y recurrencias.',
      },
      {
        heading: 'Antibióticos: solo en casos seleccionados',
        bullets: [
          'Disentería (sangre en heces): azitromicina o ciprofloxacino según epidemiología local.',
          'Sospecha de cólera con deshidratación grave.',
          'No usar antidiarreicos ni antieméticos de rutina en niños pequeños (el ondansetrón puede usarse para facilitar la rehidratación oral).',
        ],
        warning: 'El rotavirus es la causa más frecuente de diarrea grave en lactantes: la vacunación es la principal medida preventiva.',
      },
    ],
    references: ['OMS/UNICEF. Tratamiento de la diarrea: manual clínico, 2005 (vigente).', 'AIEPI – OPS.'],
  },
  {
    id: 'diabetes-tipo-2',
    title: 'Diabetes mellitus tipo 2',
    specialty: 'endocrinologia',
    summary: 'Diagnóstico, metas, elección del tratamiento según comorbilidad y cribado de complicaciones.',
    minutes: 8,
    level: 'Intermedio',
    sections: [
      {
        heading: 'Diagnóstico',
        table: {
          head: ['Prueba', 'Prediabetes', 'Diabetes'],
          rows: [
            ['Glucosa en ayunas', '100–125 mg/dL', '≥ 126 mg/dL'],
            ['PTOG 75 g (2 h)', '140–199 mg/dL', '≥ 200 mg/dL'],
            ['HbA1c', '5,7–6,4%', '≥ 6,5%'],
            ['Glucosa al azar + síntomas', '—', '≥ 200 mg/dL'],
          ],
        },
        body: 'Sin hiperglucemia inequívoca, se necesita confirmación con una segunda prueba.',
      },
      {
        heading: 'Metas generales',
        bullets: ['HbA1c < 7% en la mayoría de adultos (individualizar).', 'Glucosa preprandial 80–130 mg/dL; posprandial < 180 mg/dL.', 'TA < 130/80 mmHg si es seguro.', 'LDL según riesgo cardiovascular (estatina en la mayoría de 40–75 años).'],
      },
      {
        heading: 'Tratamiento farmacológico',
        bullets: [
          'Cambios de estilo de vida en todos.',
          'Metformina sigue siendo la base en la mayoría por eficacia, seguridad y costo.',
          'Con enfermedad cardiovascular aterosclerótica, insuficiencia cardíaca o enfermedad renal crónica: iSGLT2 y/o agonista GLP-1 con beneficio demostrado, independientemente de la HbA1c.',
          'Insulina si HbA1c > 10%, glucosa ≥ 300 mg/dL o síntomas catabólicos (pérdida de peso, cetosis).',
        ],
        pearl: 'Metformina: contraindicada con TFG < 30; no iniciar con TFG 30–45. Puede causar déficit de B12.',
      },
      {
        heading: 'Cribado de complicaciones',
        bullets: ['Retinopatía: fondo de ojo al diagnóstico y luego cada 1–2 años.', 'Nefropatía: albuminuria (índice albúmina/creatinina) y TFG anual.', 'Neuropatía y pie diabético: examen con monofilamento anual e inspección en cada visita.'],
      },
    ],
    references: ['American Diabetes Association. Standards of Care in Diabetes (edición anual).'],
  },
  {
    id: 'apendicitis',
    title: 'Apendicitis aguda',
    specialty: 'cirugia',
    summary: 'Clínica, escala de Alvarado, imagen según el paciente y tratamiento.',
    minutes: 6,
    level: 'Básico',
    sections: [
      {
        heading: 'Clínica típica',
        body: 'Dolor periumbilical o epigástrico que migra a fosa ilíaca derecha (punto de McBurney), anorexia, náuseas/vómitos y fiebre baja. Es la causa más frecuente de abdomen agudo quirúrgico.',
        bullets: ['Signo de Blumberg: dolor a la descompresión.', 'Signo de Rovsing: dolor en FID al presionar FII.', 'Signo del psoas: apéndice retrocecal.', 'Signo del obturador: apéndice pélvico.'],
      },
      {
        heading: 'Escala de Alvarado (MANTRELS)',
        table: {
          head: ['Criterio', 'Puntos'],
          rows: [
            ['Migración del dolor a FID', '1'],
            ['Anorexia', '1'],
            ['Náuseas / vómitos', '1'],
            ['Dolor a la palpación en FID', '2'],
            ['Rebote (Blumberg)', '1'],
            ['Temperatura > 37,3 °C', '1'],
            ['Leucocitosis > 10 000', '2'],
            ['Desviación a la izquierda', '1'],
          ],
        },
        pearl: '≤ 4: baja probabilidad · 5–6: estudios de imagen · ≥ 7: alta probabilidad.',
      },
      {
        heading: 'Imagen',
        bullets: ['Niños y embarazadas: ecografía primero (RM en embarazada si la eco no es concluyente).', 'Adultos: TC de abdomen con contraste (más sensible y específica).'],
      },
      {
        heading: 'Tratamiento',
        bullets: ['Apendicectomía (laparoscópica de preferencia) + profilaxis antibiótica.', 'Plastrón o absceso: antibióticos ± drenaje percutáneo y apendicectomía diferida.'],
      },
    ],
    references: ['WSES Jerusalem guidelines for diagnosis and treatment of acute appendicitis, 2020.'],
  },
  {
    id: 'bioestadistica',
    title: 'Bioestadística esencial',
    specialty: 'salud-publica',
    summary: 'Tabla 2×2, pruebas diagnósticas, medidas de asociación y diseños de estudio.',
    minutes: 10,
    level: 'Intermedio',
    sections: [
      {
        heading: 'La tabla 2×2',
        table: {
          head: ['', 'Enfermo', 'Sano'],
          rows: [
            ['Prueba +', 'a (VP)', 'b (FP)'],
            ['Prueba −', 'c (FN)', 'd (VN)'],
          ],
        },
        bullets: ['Sensibilidad = a / (a + c)', 'Especificidad = d / (b + d)', 'VPP = a / (a + b)', 'VPN = d / (c + d)'],
        pearl: 'SnNout: una prueba muy Sensible, si es Negativa, descarta. SpPin: una prueba muy esPecífica, si es Positiva, confirma.',
      },
      {
        heading: 'Medidas de asociación e impacto',
        bullets: [
          'Riesgo relativo (cohortes, ensayos) = Ie / Ine.',
          'Odds ratio (casos y controles) = (a × d) / (b × c).',
          'Reducción absoluta del riesgo (RAR) = riesgo control − riesgo tratamiento.',
          'NNT = 1 / RAR.',
          'Reducción relativa del riesgo = RAR / riesgo control.',
        ],
      },
      {
        heading: 'Diseños de estudio',
        table: {
          head: ['Diseño', 'Característica', 'Medida'],
          rows: [
            ['Transversal', 'Exposición y efecto al mismo tiempo', 'Prevalencia, razón de prevalencias'],
            ['Casos y controles', 'Parte del efecto, busca la exposición (retrospectivo)', 'Odds ratio'],
            ['Cohortes', 'Parte de la exposición, sigue en el tiempo', 'Incidencia, riesgo relativo'],
            ['Ensayo clínico', 'El investigador asigna la intervención (aleatoriza)', 'RR, RAR, NNT'],
          ],
        },
        pearl: 'Pirámide de evidencia: metaanálisis de ensayos > ensayo clínico aleatorizado > cohortes > casos y controles > series de casos > opinión de expertos.',
      },
      {
        heading: 'Errores',
        bullets: ['Error tipo I (α): falso positivo; rechazar H₀ verdadera. Habitualmente 0,05.', 'Error tipo II (β): falso negativo; no rechazar H₀ falsa. Potencia = 1 − β (habitualmente 80%).', 'Sesgo de selección, de información (memoria) y confusión: el aleatorizar controla los confusores conocidos y desconocidos.'],
      },
    ],
    references: ['Gordis. Epidemiología.', 'Argimon Pallàs. Métodos de investigación clínica y epidemiológica.'],
  },
  {
    id: 'electrolitos',
    title: 'Ácido-base y electrolitos',
    specialty: 'nefrologia',
    summary: 'Interpretación sistemática de gasometría, anion gap, hiponatremia e hiperkalemia.',
    minutes: 10,
    level: 'Avanzado',
    sections: [
      {
        heading: 'Gasometría en 5 pasos',
        bullets: [
          '1. pH: < 7,35 acidemia; > 7,45 alcalemia.',
          '2. Trastorno primario: ¿lo explica el HCO₃ (metabólico) o la PaCO₂ (respiratorio)?',
          '3. Compensación: acidosis metabólica → Winter: PaCO₂ esperada = 1,5 × HCO₃ + 8 ± 2.',
          '4. Anion gap = Na − (Cl + HCO₃); normal ≈ 8–12.',
          '5. Si AG elevado: delta-delta para buscar trastornos mixtos.',
        ],
      },
      {
        heading: 'Acidosis metabólica',
        table: {
          head: ['AG elevado (MUDPILES)', 'AG normal (hiperclorémica)'],
          rows: [
            ['Metanol, uremia, cetoacidosis', 'Diarrea'],
            ['Paraldehído / propilenglicol, isoniazida, hierro', 'Acidosis tubular renal'],
            ['Láctica, etilenglicol, salicilatos', 'Exceso de SSN, acetazolamida'],
          ],
        },
      },
      {
        heading: 'Hiponatremia',
        bullets: [
          'Primero confirmar hipoosmolaridad (descartar hiperglucemia: el Na baja ~1,6 mEq/L por cada 100 mg/dL de glucosa sobre 100).',
          'Clasificar por volemia: hipovolémica, euvolémica (SIADH, hipotiroidismo, insuficiencia suprarrenal) e hipervolémica (IC, cirrosis, síndrome nefrótico).',
          'Sintomática grave: bolo de SSH 3% 100–150 mL, repetible.',
        ],
        warning: 'No corregir más de 8–10 mEq/L en 24 h: riesgo de síndrome de desmielinización osmótica.',
      },
      {
        heading: 'Hiperkalemia',
        bullets: [
          '1. Estabilizar la membrana: gluconato de calcio IV si hay cambios en ECG.',
          '2. Redistribuir: insulina regular + glucosa, salbutamol nebulizado, bicarbonato si hay acidosis.',
          '3. Eliminar: diuréticos de asa, resinas/patiromer, hemodiálisis.',
        ],
        pearl: 'ECG: T picudas → PR largo y P aplanada → QRS ancho → onda sinusoidal → FV/asistolia.',
      },
    ],
    references: ['Harrison. Principios de Medicina Interna, 21.ª ed.', 'European clinical practice guideline on hyponatraemia, 2014.'],
  },
  {
    id: 'sepsis',
    title: 'Sepsis y shock séptico',
    specialty: 'emergencias',
    summary: 'Definiciones Sepsis-3 y paquete de la primera hora según Surviving Sepsis Campaign 2021.',
    minutes: 7,
    level: 'Intermedio',
    sections: [
      {
        heading: 'Definiciones (Sepsis-3)',
        bullets: [
          'Sepsis: disfunción orgánica potencialmente mortal causada por una respuesta desregulada a la infección (aumento de SOFA ≥ 2).',
          'Shock séptico: necesidad de vasopresores para PAM ≥ 65 mmHg y lactato > 2 mmol/L pese a reanimación adecuada con volumen.',
          'qSOFA (FR ≥ 22, alteración mental, PAS ≤ 100): predice mal pronóstico, pero no se recomienda como única herramienta de cribado.',
        ],
      },
      {
        heading: 'Primera hora',
        bullets: [
          'Medir lactato (y repetir si > 2).',
          'Hemocultivos antes de los antibióticos, sin retrasarlos.',
          'Antibióticos de amplio espectro: idealmente en la primera hora si hay shock o sepsis probable.',
          'Cristaloides 30 mL/kg en las primeras 3 horas si hay hipotensión o lactato ≥ 4 (preferir soluciones balanceadas).',
          'Vasopresores si la hipotensión persiste: noradrenalina de primera línea, meta PAM ≥ 65 mmHg.',
        ],
        pearl: 'Si se necesita noradrenalina a dosis moderadas-altas, añadir vasopresina. Hidrocortisona 200 mg/día si persiste la necesidad de vasopresores.',
      },
    ],
    references: ['Surviving Sepsis Campaign: International Guidelines 2021.', 'Singer M, et al. Sepsis-3. JAMA 2016.'],
  },
  {
    id: 'asma',
    title: 'Asma: control y crisis',
    specialty: 'neumologia',
    summary: 'Escalones de tratamiento GINA y manejo de la exacerbación en urgencias.',
    minutes: 8,
    level: 'Intermedio',
    sections: [
      {
        heading: 'Principio clave de GINA',
        body: 'En adolescentes y adultos no se recomienda el tratamiento con SABA solo. Todos deben recibir corticoide inhalado (CI), ya sea diario o a demanda junto con formoterol.',
        bullets: [
          'Vía 1 (preferida): CI-formoterol a dosis baja como rescate (pasos 1–2) y como mantenimiento y rescate (MART, pasos 3–5).',
          'Vía 2: SABA de rescate + CI de mantenimiento según el escalón.',
          'Paso 5: derivar para fenotipo, considerar LAMA y biológicos (anti-IgE, anti-IL5, anti-IL4R, anti-TSLP).',
        ],
      },
      {
        heading: 'Crisis asmática: gravedad',
        table: {
          head: ['Leve-moderada', 'Grave', 'Amenaza la vida'],
          rows: [
            ['Habla en frases', 'Habla en palabras, agitado', 'Somnolencia, confusión'],
            ['FR aumentada, FC 100–120', 'FR > 30, FC > 120', 'Tórax silente'],
            ['SatO₂ 90–95%', 'SatO₂ < 90%', 'Cianosis, bradicardia'],
            ['PEF > 50%', 'PEF ≤ 50%', '—'],
          ],
        },
      },
      {
        heading: 'Tratamiento de la crisis',
        bullets: [
          'Salbutamol inhalado con espaciador (4–10 puff c/20 min la 1.ª hora) o nebulizado.',
          'Oxígeno para SatO₂ 93–95% (adultos) / 94–98% (niños).',
          'Corticoide sistémico precoz: prednisona/prednisolona 40–50 mg/día por 5–7 días en adultos.',
          'Bromuro de ipratropio en crisis moderadas-graves.',
          'Sulfato de magnesio IV (2 g en 20 min) si no hay respuesta en crisis grave.',
        ],
        warning: 'Una PaCO₂ normal o alta en plena crisis es signo de agotamiento: valorar UCI.',
      },
    ],
    references: ['Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention, 2024–2025.'],
  },
]
