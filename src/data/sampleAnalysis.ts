import type { Question } from '@/types'

/**
 * Análisis profundo de ejemplo (modelo de lo que tendrá cada pregunta del banco real):
 * explicación por opción, fisiopatología, puntos clave y bibliografía verificable.
 */
export const SAMPLE_ANALYSIS: Record<string, Pick<Question, 'optionExplanations' | 'pathophysiology' | 'keyPoints' | 'references'>> = {
  // Insuficiencia cardíaca: espironolactona
  'muestra-002': {
    optionExplanations: [
      'Incorrecta. La digoxina inhibe la Na⁺/K⁺-ATPasa, aumenta el calcio intracelular y la contractilidad, y tiene efecto vagotónico. En el ensayo DIG redujo las hospitalizaciones por insuficiencia cardíaca, pero no la mortalidad total.',
      'Incorrecta. La furosemida bloquea el cotransportador Na⁺-K⁺-2Cl⁻ del asa de Henle: reduce la precarga y alivia la congestión (síntomas), pero ningún ensayo ha demostrado que disminuya la mortalidad; además activa el sistema renina-angiotensina-aldosterona.',
      'Correcta. Al bloquear el receptor mineralocorticoide reduce la fibrosis miocárdica, el remodelado y la pérdida de potasio. En RALES (FEVI ≤ 35 %, NYHA III–IV) redujo la mortalidad en ~30 %. Forma parte de los "4 pilares" del tratamiento de la IC con FEVI reducida.',
      'Incorrecta. El amlodipino (calcioantagonista dihidropiridínico) es neutro en mortalidad en la IC con FEVI reducida (ensayo PRAISE): puede usarse para tratar la hipertensión o la angina, pero no mejora el pronóstico. Los no dihidropiridínicos (verapamilo, diltiazem) están contraindicados.',
    ],
    pathophysiology:
      'En la insuficiencia cardíaca, la caída del gasto cardíaco activa el sistema renina-angiotensina-aldosterona y el simpático como compensación. A largo plazo, la aldosterona produce retención de sodio y agua (más congestión), pérdida renal de potasio y magnesio (arritmias), y fibrosis miocárdica y vascular que alimenta el remodelado ventricular. Los IECA/ARA-II no la suprimen por completo ("escape de aldosterona"), por lo que bloquear su receptor añade beneficio pronóstico. Los fármacos que solo mejoran la hemodinámica a corto plazo (diuréticos, inotrópicos) alivian síntomas sin frenar este remodelado.',
    keyPoints: [
      'Reducen mortalidad en IC con FEVI reducida: IECA/ARA-II/ARNI, betabloqueador, antagonista mineralocorticoide e iSGLT2.',
      'Diuréticos y digoxina mejoran síntomas y hospitalizaciones, pero no la mortalidad.',
      'Con espironolactona vigila potasio y función renal; la ginecomastia es su efecto adverso típico (eplerenona como alternativa).',
    ],
    references: [
      { citation: 'Pitt B, Zannad F, Remme WJ, et al. The effect of spironolactone on morbidity and mortality in patients with severe heart failure (RALES). N Engl J Med. 1999;341(10):709-717.', doi: '10.1056/NEJM199909023411001', kind: 'articulo' },
      { citation: 'The Digitalis Investigation Group. The effect of digoxin on mortality and morbidity in patients with heart failure. N Engl J Med. 1997;336(8):525-533.', doi: '10.1056/NEJM199702203360801', kind: 'articulo' },
      { citation: 'Heidenreich PA, Bozkurt B, Aguilar D, et al. 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. Circulation. 2022;145(18):e895-e1032.', doi: '10.1161/CIR.0000000000001063', kind: 'guia' },
      { citation: 'McDonagh TA, Metra M, Adamo M, et al. 2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure. Eur Heart J. 2021;42(36):3599-3726.', doi: '10.1093/eurheartj/ehab368', kind: 'guia' },
    ],
  },

  // Hiperkalemia con cambios en el ECG
  'muestra-013': {
    optionExplanations: [
      'Correcta. El calcio no baja el potasio: estabiliza la membrana miocárdica en 1–3 minutos y su efecto dura 30–60 minutos. Es lo primero ante cambios en el ECG porque el riesgo inmediato es una arritmia mortal.',
      'Incorrecta como primer paso. La insulina activa la Na⁺/K⁺-ATPasa y desplaza el potasio al interior de la célula (baja ~0,6–1 mEq/L en 15–30 min). Es el segundo paso, siempre con glucosa para evitar hipoglucemia.',
      'Incorrecta como primer paso. La furosemida elimina potasio por la orina, pero su efecto es lento y depende de que la función renal esté conservada.',
      'Incorrecta como primer paso. Las resinas de intercambio (poliestireno sulfonato, patiromer) eliminan potasio por vía intestinal en horas: sirven para el manejo posterior, no para la urgencia.',
    ],
    pathophysiology:
      'El potencial de reposo de la célula miocárdica depende del gradiente de potasio entre el interior y el exterior. En la hiperkalemia ese gradiente disminuye y la membrana se despolariza parcialmente. Esto inactiva parte de los canales de sodio rápidos: la conducción se hace más lenta (PR largo, onda P aplanada, QRS ancho) y la repolarización se acelera (ondas T picudas), hasta llegar a la onda sinusoidal, la fibrilación ventricular o la asistolia. El calcio eleva el potencial umbral y restablece la diferencia entre el potencial de reposo y el umbral, de modo que la célula recupera su excitabilidad normal aunque el potasio siga alto.',
    keyPoints: [
      'Orden: 1) estabilizar (gluconato o cloruro de calcio), 2) redistribuir (insulina + glucosa, salbutamol), 3) eliminar (diuréticos, resinas, diálisis).',
      'Secuencia ECG: T picudas → PR largo y P aplanada → QRS ancho → onda sinusoidal.',
      'Si los cambios en el ECG persisten, se puede repetir la dosis de calcio.',
    ],
    references: [
      { citation: 'Loscalzo J, Fauci A, Kasper D, et al. Harrison. Principios de Medicina Interna, 21.ª ed. McGraw-Hill; 2022. Capítulo: Alteraciones de los líquidos y los electrólitos.', kind: 'libro' },
      { citation: 'UK Kidney Association (Renal Association). Clinical Practice Guidelines: Treatment of Acute Hyperkalaemia in Adults. 2020.', url: 'https://ukkidney.org/health-professionals/guidelines/treatment-acute-hyperkalaemia-adults', kind: 'guia' },
    ],
  },

  // Dengue: signos de alarma
  'muestra-018': {
    optionExplanations: [
      'Sí es signo de alarma. El dolor abdominal intenso y continuo se relaciona con la extravasación de plasma y con el engrosamiento de la pared de la vesícula por edema.',
      'Sí es signo de alarma. Los vómitos persistentes impiden la hidratación oral y suelen preceder al choque.',
      'Correcta (NO es signo de alarma). La fiebre alta es propia de la fase febril. El riesgo aumenta precisamente cuando la fiebre baja (defervescencia), que es cuando comienza la fase crítica.',
      'Sí es signo de alarma. El sangrado de mucosas indica trombocitopenia y disfunción endotelial y obliga a manejo en el grupo B2.',
    ],
    pathophysiology:
      'El virus del dengue infecta células dendríticas, monocitos y macrófagos. La proteína NS1 y la tormenta de citoquinas alteran el glucocáliz endotelial y aumentan la permeabilidad capilar. Esta fuga de plasma alcanza su máximo entre los días 3 y 7, coincidiendo con la defervescencia (fase crítica): el plasma pasa al tercer espacio (ascitis, derrames) y aparecen hemoconcentración (hematocrito alto) e hipovolemia, que pueden llevar al choque. En la fase de recuperación ese líquido se reabsorbe, con riesgo de sobrecarga si se siguen administrando líquidos de forma excesiva.',
    keyPoints: [
      'El peligro empieza cuando la fiebre cede: es el momento de buscar signos de alarma.',
      'Un hematocrito en ascenso con plaquetas en descenso rápido indica fuga plasmática.',
      'Paracetamol para la fiebre; evitar AINE, aspirina e inyecciones intramusculares.',
    ],
    references: [
      { citation: 'Organización Panamericana de la Salud. Directrices para el diagnóstico clínico y el tratamiento del dengue, el chikunguña y el zika. Washington, D.C.: OPS; 2022.', url: 'https://iris.paho.org/handle/10665.2/55125', kind: 'guia' },
      { citation: 'Wilder-Smith A, Ooi EE, Horstick O, Wills B. Dengue. Lancet. 2019;393(10169):350-363.', doi: '10.1016/S0140-6736(18)32560-1', kind: 'revision' },
      { citation: 'World Health Organization. Dengue: guidelines for diagnosis, treatment, prevention and control. Ginebra: OMS; 2009.', kind: 'guia' },
    ],
  },

  // Kawasaki
  'muestra-032': {
    optionExplanations: [
      'Incorrecta. No es una infección bacteriana: los cultivos son negativos y los antibióticos no previenen las complicaciones coronarias.',
      'Correcta. La inmunoglobulina IV (2 g/kg en dosis única) dentro de los primeros 10 días reduce la incidencia de aneurismas coronarios de ~25 % a menos de 5 %. Se acompaña de aspirina.',
      'Incorrecta como tratamiento inicial único. Los corticoides se reservan como complemento en pacientes de alto riesgo o en casos resistentes a la IgIV.',
      'Incorrecta. Los antihistamínicos no actúan sobre la vasculitis ni previenen el daño coronario.',
    ],
    pathophysiology:
      'La enfermedad de Kawasaki es una vasculitis aguda de vasos de mediano calibre, probablemente desencadenada por un agente infeccioso en niños con predisposición genética. Una respuesta inmune intensa (innata y adaptativa) infiltra la pared arterial con neutrófilos y luego con linfocitos y células plasmáticas productoras de IgA. Esto produce una arteritis necrosante que destruye la lámina elástica de las coronarias y lleva a dilatación y aneurismas, con riesgo de trombosis, infarto y muerte súbita. La IgIV modula la respuesta inmune y reduce rápidamente la inflamación sistémica.',
    keyPoints: [
      'Diagnóstico: fiebre ≥ 5 días + 4 de 5 criterios (conjuntivitis no purulenta, cambios orales, exantema, cambios en extremidades, adenopatía cervical ≥ 1,5 cm).',
      'Ecocardiograma al diagnóstico y en el seguimiento (2 y 6 semanas).',
      'Es la principal causa de cardiopatía adquirida en niños en países desarrollados.',
    ],
    references: [
      { citation: 'McCrindle BW, Rowley AH, Newburger JW, et al. Diagnosis, Treatment, and Long-Term Management of Kawasaki Disease: A Scientific Statement for Health Professionals From the American Heart Association. Circulation. 2017;135(17):e927-e999.', doi: '10.1161/CIR.0000000000000484', kind: 'guia' },
      { citation: 'Kliegman RM, St. Geme JW, et al. Nelson. Tratado de Pediatría, 21.ª ed. Elsevier; 2020. Capítulo: Enfermedad de Kawasaki.', kind: 'libro' },
    ],
  },

  // Preeclampsia: sulfato de magnesio
  'muestra-034': {
    optionExplanations: [
      'Incorrecta. En el ensayo colaborativo de eclampsia (1995), el diazepam fue inferior al sulfato de magnesio para prevenir convulsiones recurrentes y se asoció a más complicaciones maternas y depresión neonatal.',
      'Incorrecta. La fenitoína también fue inferior al magnesio en el mismo ensayo; no se recomienda para prevenir ni tratar la eclampsia.',
      'Correcta. El ensayo Magpie demostró que el sulfato de magnesio reduce el riesgo de eclampsia en más de la mitad en mujeres con preeclampsia. Dosis: 4–6 g IV de impregnación y 1–2 g/h de mantenimiento, vigilando reflejos, respiración y diuresis.',
      'Incorrecta para prevenir convulsiones. El labetalol controla la presión arterial grave (≥ 160/110), que también es indispensable, pero no previene la eclampsia.',
    ],
    pathophysiology:
      'En la preeclampsia, el trofoblasto no remodela por completo las arterias espirales maternas, que permanecen estrechas y de alta resistencia. La placenta isquémica libera factores antiangiogénicos (sFlt-1 y endoglina soluble) que neutralizan al VEGF y al PlGF y provocan disfunción endotelial sistémica: vasoconstricción, hipertensión, proteinuria y daño de órganos. En el cerebro se pierde la autorregulación del flujo, aparece edema vasogénico (síndrome de encefalopatía posterior reversible) y pueden producirse convulsiones. El magnesio actúa como antagonista de los receptores NMDA y de los canales de calcio, produce vasodilatación cerebral y protege la barrera hematoencefálica.',
    keyPoints: [
      'Sulfato de magnesio para prevenir y tratar la eclampsia; antídoto: gluconato de calcio.',
      'Toxicidad: primero desaparecen los reflejos osteotendinosos, luego llega la depresión respiratoria.',
      'Con criterios de severidad, se finaliza el embarazo a partir de las 34 semanas, tras estabilizar a la madre.',
    ],
    references: [
      { citation: 'The Magpie Trial Collaborative Group. Do women with pre-eclampsia, and their babies, benefit from magnesium sulphate? The Magpie Trial: a randomised placebo-controlled trial. Lancet. 2002;359(9321):1877-1890.', doi: '10.1016/S0140-6736(02)08778-0', kind: 'articulo' },
      { citation: 'The Eclampsia Trial Collaborative Group. Which anticonvulsant for women with eclampsia? Evidence from the Collaborative Eclampsia Trial. Lancet. 1995;345(8963):1455-1463.', kind: 'articulo' },
      { citation: "American College of Obstetricians and Gynecologists. Gestational Hypertension and Preeclampsia: ACOG Practice Bulletin No. 222. Obstet Gynecol. 2020;135(6):e237-e260.", doi: '10.1097/AOG.0000000000003891', kind: 'guia' },
    ],
  },
}
