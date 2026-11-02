# Dudas para responder

Preguntas nuevas de la recopilación ENURM 2002-2024 que **están publicadas con el aviso «Respuesta por confirmar»**: la respuesta publicada difiere de la del documento o hay una duda sobre el enunciado o la respuesta. Las demás coinciden con el documento y con la bibliografía.

Hay **145** por confirmar. Para cada una dime qué hacer (*confirmar la publicada*, *usar la del documento*, *reescribir* o *retirar*).

Al confirmarla: quita `rv` de su entrada (y corrige `a` si hace falta) en el archivo indicado y ejecuta `node scripts/build-bank.mjs && node scripts/build-dudas.mjs`.

## 1. ❌ Difiere del documento · `ENURM-2007-014` · salió en 2007

**Coco Gram+ ordenados en paquetes irregulares que causan abscesos, infecciones piógenas (endocarditis osteomielitis) síndrome de choque toxico:**

- A) Clostridum botulinum
- B) Staphylococcus epidermidis
- C) Staphylococcus aureaus  ← *publicada*
- D) Streptococcus pyogenes  ← *documento*

**Especialidad:** infectologia · **Tema:** Staphylococcus aureus · **Archivo:** `revision/lote-n001.json`

> **Por qué se marca:** Difiere del documento. El documento marca Streptococcus pyogenes; el enunciado describe cocos grampositivos en racimos con abscesos, endocarditis, osteomielitis y síndrome de choque tóxico, que corresponden a Staphylococcus aureus.

**Explicación publicada:** Staphylococcus aureus es un coco grampositivo que se agrupa en racimos («paquetes irregulares»), coagulasa positivo. Causa abscesos, infecciones piógenas, endocarditis, osteomielitis y síndrome de choque tóxico. Streptococcus pyogenes forma cadenas.

**Tu respuesta:** _pendiente_

## 2. ❌ Difiere del documento · `ENURM-2013-010` · salió en 2013

**Durante el ensayo clínico de un nuevo fármaco, se incluye una muestra grande de pacientes, distribuidos al azar, con un diseño doble ciego y se busca evaluar su seguridad y eficacia. Esta fase corresponde a:**

- A) Fase aguda preclinica
- B) fase clínica 2  ← *documento*
- C) Fase clinica 1
- D) fase clínica 3  ← *publicada*

**Especialidad:** farmacologia · **Tema:** Ensayos clínicos: fases · **Archivo:** `revision/lote-n001.json`

> **Por qué se marca:** Difiere del documento. El documento marca fase 2; el enunciado describe una muestra grande, aleatorizada y doble ciego para evaluar seguridad y eficacia, que es la fase 3.

**Explicación publicada:** Fase I: pocos voluntarios sanos, seguridad y farmacocinética. Fase II: grupo reducido de pacientes, eficacia preliminar y dosis. Fase III: muestra grande, aleatorizada, controlada y doble ciego, para confirmar la eficacia y la seguridad. Fase IV: vigilancia tras la comercialización.

**Tu respuesta:** _pendiente_

## 3. ❌ Difiere del documento · `ENURM-2011-002` · salió en 2011

**Unicelular, mononuclear, axostilo que sobrepasa el extreme posterior del cuerpo. Define:**

- A) La Giardia Lamblia  ← *documento*
- B) La entamoeba histolytica
- C) El Criptosporidium parvum
- D) La trichomona vaginalis  ← *publicada*

**Especialidad:** infectologia · **Tema:** Trichomonas vaginalis · **Archivo:** `revision/lote-n002.json`

> **Por qué se marca:** Difiere del documento. El documento marca Giardia lamblia, pero Giardia tiene dos núcleos; el protozoario mononuclear con axostilo que sobresale por el extremo posterior es Trichomonas vaginalis.

**Explicación publicada:** Trichomonas vaginalis es un protozoario flagelado unicelular con un solo núcleo y un axostilo que sobresale por el extremo posterior. No forma quistes y se transmite sexualmente. Giardia, en cambio, tiene dos núcleos.

**Tu respuesta:** _pendiente_

## 4. ❌ Difiere del documento · `ENURM-2011-055` · salió en 2011

**La prevención primaria más efectiva del cáncer cervico-uterino es:**

- A) La vacuna contra el HPV  ← *publicada*
- B) El estudio de HPV en adolescentes
- C) El Papanicolaou a temprana edad  ← *documento*
- D) La biopsia de cérvix

**Especialidad:** ginecologia-obstetricia · **Tema:** Cáncer de cuello uterino: prevención primaria · **Archivo:** `revision/lote-n002.json`

> **Por qué se marca:** Difiere del documento. El documento marca Papanicolaou, que es prevención secundaria (detección); la prevención primaria más efectiva es la vacuna contra el VPH.

**Explicación publicada:** La prevención primaria del cáncer de cuello uterino evita la infección por el virus del papiloma humano: la vacuna contra el VPH, aplicada antes del inicio de la vida sexual, es la medida más eficaz. El Papanicolaou es prevención secundaria.

**Tu respuesta:** _pendiente_

## 5. ❌ Difiere del documento · `ENURM-2009-046` · salió en 2009

**Cual de los siguientes medicamentos ayuda a la maduración pulmonar del feto?**

- A) Ácido fólico
- B) Glucocorticoide  ← *publicada*
- C) Surfactante pulmonares  ← *documento*
- D) Betamimeticos

**Especialidad:** ginecologia-obstetricia · **Tema:** Maduración pulmonar fetal · **Archivo:** `revision/lote-n002.json`

> **Por qué se marca:** Difiere del documento. El documento marca surfactante, pero este se administra al recién nacido; el medicamento que madura el pulmón fetal antes del parto son los glucocorticoides.

**Explicación publicada:** Antes del parto prematuro se administran glucocorticoides (betametasona o dexametasona) a la madre para acelerar la maduración pulmonar del feto. El surfactante se da al recién nacido después del parto.

**Tu respuesta:** _pendiente_

## 6. ⚠️ Duda · `ENURM-2010-024` · salió en 2010

**Las propiedades anti-infecciosas de la leche maternal se basan en su contenido de:**

- A) Factores del complemento
- B) Abundante IgA  ← *documento y publicada (igual)*
- C) Linfocitos B y T
- D) Todas las anteriores

**Especialidad:** pediatria · **Tema:** Lactancia materna: protección inmunológica · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Pregunta ambigua: la leche materna contiene IgA, linfocitos y complemento, así que «todas las anteriores» también es defendible. Recomiendo reescribirla («La inmunoglobulina más abundante de la leche materna es:») o retirarla. En el documento sale dos veces en 2010 (n.º 24 y 34).

**Explicación publicada:** La leche materna protege al lactante con varios componentes: IgA secretora (la inmunoglobulina predominante), lactoferrina, lisozima, oligosacáridos, leucocitos (macrófagos y linfocitos) y pequeñas cantidades de complemento.

**Tu respuesta:** _pendiente_

## 7. ❌ Difiere del documento · `ENURM-2010-025` · salió en 2010

**El dolor de la madre al amamantar por lo común se debe a:**

- A) Alteración de la piel del pezón o mala posición del niño al mamar.  ← *publicada*
- B) Mala posición de la madre o del niño al mamar
- C) Tamaño excesivamente grande del niño
- D) Todas las anteriores  ← *documento*

**Especialidad:** pediatria · **Tema:** Lactancia materna: dolor al amamantar · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Difiere del documento. Propuesta: la clave del documento (D) incluye una opción que no es causa habitual de dolor. El documento marca D («todas las anteriores»), pero C («tamaño excesivamente grande del niño») no es una causa habitual de dolor y las opciones A y B se superponen. Propongo A (lesión del pezón o mala posición del niño). Confirma, reescribe o retira. Sale dos veces en 2010 (n.º 25 y 35).

**Explicación publicada:** El dolor de la madre al amamantar se debe sobre todo a un mal agarre o mala posición del niño y a lesiones del pezón (grietas, irritación). Corregir la posición y el agarre suele resolverlo.

**Tu respuesta:** _pendiente_

## 8. ❌ Difiere del documento · `ENURM-2010-028` · salió en 2010

**La sepsis temprana del recién nacido se produce debida a una infección por:**

- A) via trasplacentaria o por via ascendente  ← *publicada*
- B) parto traumático
- C) Ruptura prematura de membranas
- D) Ay B son correctas  ← *documento*

**Especialidad:** pediatria · **Tema:** Sepsis neonatal temprana · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Difiere del documento. Propuesta: la clave del documento (D) incluye la opción B, que no es correcta. La clave del documento es D («A y B»), pero B («parto traumático») no es causa de sepsis temprana, y la ruptura prematura de membranas (C) es su principal factor de riesgo. Propongo A. Confirma, reescribe o retira. Sale dos veces en 2010 (n.º 28 y 38).

**Explicación publicada:** La sepsis neonatal temprana (primeras 72 horas) se adquiere por transmisión vertical: por vía ascendente desde el canal vaginal (sobre todo con ruptura prematura de membranas o corioamnionitis), por vía transplacentaria o al pasar por el canal del parto.

**Tu respuesta:** _pendiente_

## 9. ⚠️ Duda · `ENURM-2024-026` · salió en 2023, 2024

**Muchos de los fallecimientos ocurridos en los pacientes con fiebre hemorrágica por dengue se deben a:**

- A) Diagnóstico tardío
- B) Sobrehidratación  ← *documento y publicada (igual)*
- C) Anemia
- D) Retraso en el tratamiento

**Especialidad:** infectologia · **Tema:** Dengue grave: causas de muerte · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Pregunta ambigua: A («diagnóstico tardío») y D («retraso en el tratamiento») son casi iguales y también son causas de muerte. Mantengo B (clave del documento, salió en 2023 y 2024). Recomiendo reescribirla («...se deben a un manejo inadecuado de los líquidos») o retirarla.

**Explicación publicada:** En el dengue grave la mayoría de las muertes ocurren por choque no reconocido a tiempo y por un manejo inadecuado de líquidos: la reposición insuficiente deja al paciente en choque y la sobrehidratación produce edema pulmonar, derrame pleural y dificultad respiratoria.

**Tu respuesta:** _pendiente_

## 10. ⚠️ Duda · `ENURM-2007-011` · salió en 2007

**Debido a las características de absorción de hierro, una forma correcta de administrarlo es:**

- A) En forma de sales férricas vía oral
- B) Por vía oral o intravenosa, pero nunca intramuscular
- C) En una sola dosis por vía intravenosa
- D) En forma de sales ferrosas por vía oral durante dos semanas  ← *documento y publicada (igual)*

**Especialidad:** hematologia · **Tema:** Tratamiento con hierro · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Mantengo D por ser la menos mala, pero «durante dos semanas» es demasiado corto: el tratamiento dura meses. Sugiero reescribir D («...durante varios meses») o confirmar con la fuente original.

**Explicación publicada:** El hierro se absorbe mejor en forma ferrosa (Fe2+) en el duodeno y el yeyuno proximal, por eso se administra como sales ferrosas (sulfato, fumarato, gluconato) por vía oral. El tratamiento debe mantenerse varios meses, hasta unos 3 meses después de normalizar la hemoglobina, para reponer los depósitos.

**Tu respuesta:** _pendiente_

## 11. ❌ Difiere del documento · `ENURM-2009-014` · salió en 2009

**El siguiente ácido graso no esencial regula el metabolismo del colesterol:**

- A) Oleico  ← *publicada*
- B) Palmitico  ← *documento*
- C) Araquidonico
- D) Omega 3

**Especialidad:** ciencias-basicas · **Tema:** Lípidos: ácidos grasos y colesterol · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Difiere del documento. El documento marca ácido palmítico, que es saturado y eleva el colesterol; el ácido graso no esencial que regula el colesterol es el oleico (monoinsaturado). El documento marca B (palmítico), pero el ácido palmítico es saturado y eleva el colesterol. El ácido graso no esencial que ayuda a regular el colesterol es el oleico (A). Corrijo a A. Confianza media: revisa la fuente original.

**Explicación publicada:** El ácido oleico es un ácido graso monoinsaturado (omega-9) que el organismo puede sintetizar, por lo que no es esencial; sustituir grasas saturadas por oleico reduce el LDL-colesterol. El palmítico es saturado y eleva el colesterol, y el omega-3 y el araquidónico se consideran esenciales.

**Tu respuesta:** _pendiente_

## 12. ❌ Difiere del documento · `ENURM-2014-014` · salió en 2014

**Después de ejercitarse por una hora, ¿Cuál de los siguientes órganos experimenta los menores descensos en la presión sanguínea?**

- A) Intestinos
- B) Riñones  ← *documento*
- C) Cerebro  ← *publicada*
- D) Páncreas

**Especialidad:** ciencias-basicas · **Tema:** Fisiología del ejercicio: flujo sanguíneo · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Difiere del documento. El documento marca riñones, que es de los territorios cuyo flujo más disminuye durante el ejercicio; el cerebro es el que mejor conserva su flujo. El enunciado dice «presión sanguínea» pero el concepto es el flujo sanguíneo. El documento marca riñones (B), que es de los territorios que más disminuyen; el cerebro conserva su flujo (C). Corrijo a C con confianza media: revisa la fuente original.

**Explicación publicada:** Durante el ejercicio el flujo sanguíneo se redistribuye hacia el músculo esquelético y la piel y disminuye en los territorios esplácnicos (intestinos, hígado, páncreas) y en el riñón. El cerebro conserva su flujo por autorregulación, así que es el que menos disminuye.

**Tu respuesta:** _pendiente_

## 13. ⚠️ Duda · `ENURM-2014-021` · salió en 2014

**En relación con las convulsiones en un lactante hiponatrémico, estas ocurren por lo general:**

- A) Antes del tratamiento  ← *documento y publicada (igual)*
- B) Posterior al tratamiento
- C) Durante el tratamiento
- D) Solo ocurren como secuela

**Especialidad:** pediatria · **Tema:** Hiponatremia en el lactante · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** No pude confirmar esta clave con una fuente. La literatura describe convulsiones tanto al presentarse la hiponatremia como durante una corrección brusca. Pide la fuente original o retírala.

**Explicación publicada:** Las convulsiones por hiponatremia se deben al edema cerebral cuando el sodio cae, sobre todo por debajo de 120 a 125 mEq/L y de forma rápida, y por lo general son la forma de presentación (antes del tratamiento). También pueden aparecer si se hidrata con soluciones hipotónicas o si el sodio cambia bruscamente.

**Tu respuesta:** _pendiente_

## 14. ⚠️ Duda · `ENURM-2011-009` · salió en 2011

**Las células gástricas que producen ácido clorhídrico son las:**

- A) Parietales  ← *documento y publicada (igual)*
- B) Antrales
- C) Oxinticas
- D) Pilóricas

**Especialidad:** gastroenterologia · **Tema:** Células gástricas · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Ambigua: «oxínticas» es sinónimo de «parietales» en muchos textos, así que la C también es defendible. Propongo mantener A y reescribir C («Mucosas») o retirarla.

**Explicación publicada:** Las células parietales (oxínticas) del fondo y el cuerpo gástrico producen ácido clorhídrico y factor intrínseco.

**Tu respuesta:** _pendiente_

## 15. ⚠️ Duda · `ENURM-2011-015` · salió en 2011

**El musculo responsable de la flexión del antebrazo sobre el brazo es el:**

- A) Deltoides
- B) Tríceps
- C) Bíceps  ← *documento y publicada (igual)*
- D) Braquial

**Especialidad:** ciencias-basicas · **Tema:** Flexión del codo · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Ambigua: el bíceps y el braquial flexionan el antebrazo; el braquial es el flexor principal. Propongo reescribir el enunciado («...flexor principal del antebrazo») o retirarla.

**Explicación publicada:** El bíceps braquial flexiona el antebrazo sobre el brazo, sobre todo con el antebrazo en supinación; el braquial es el flexor principal en cualquier posición.

**Tu respuesta:** _pendiente_

## 16. ⚠️ Duda · `ENURM-2011-019` · salió en 2011

**Una paciente embarazada a término, multípara, cuyo embarazo ha transcurrido normalmente, debe ser atendida en el siguiente nivel de atención del Sistema Dominicano de Seguridad Social:**

- A) Nivel de atención primaria
- B) Nivel de atención secundaria  ← *documento y publicada (igual)*
- C) Nivel de atención terciaria
- D) Nivel de atención cuaternaria

**Especialidad:** salud-publica · **Tema:** Niveles de atención · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** No pude confirmar con la norma dominicana si el parto de bajo riesgo corresponde al primer o al segundo nivel. Necesito la fuente o tu criterio.

**Explicación publicada:** En el Sistema Dominicano de Salud, los niveles de atención se organizan por complejidad; el parto de bajo riesgo se atiende en un establecimiento con capacidad obstétrica básica.

**Tu respuesta:** _pendiente_

## 17. ❌ Difiere del documento · `ENURM-2011-020` · salió en 2011

**La vigilancia epidemiológica establecida en la actual epidemia de cólera es una función de:**

- A) Atención en salud
- B) Investigación en salud  ← *documento*
- C) Seguridad social
- D) Rectoría en salud  ← *publicada*

**Especialidad:** salud-publica · **Tema:** Funciones del sistema de salud · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Difiere del documento. Propuesta: la vigilancia epidemiológica es una función de rectoría, no de investigación (pendiente de confirmar). El documento marca B (investigación en salud). Propongo D (rectoría), pero no pude confirmarlo con la norma dominicana. Confirma o corrige.

**Explicación publicada:** La vigilancia epidemiológica es una función esencial de la salud pública y, en el sistema dominicano, corresponde al Ministerio de Salud en su papel de rectoría.

**Tu respuesta:** _pendiente_

## 18. ⚠️ Duda · `ENURM-2011-030` · salió en 2011

**El hallazgo más grave en un paciente con desnutrición tipo kwashiorkor es la:**

- A) Inmunodeficiencia “Edematosa”  ← *documento y publicada (igual)*
- B) Apatía e indiferencia
- C) Atrofia y flacidez muscular
- D) Distensión abdominal

**Especialidad:** pediatria · **Tema:** Kwashiorkor · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** La opción A tiene un texto extraño («Inmunodeficiencia “Edematosa”») y «el hallazgo más grave» es subjetivo. Propongo reescribirla o retirarla.

**Explicación publicada:** En el kwashiorkor predominan el edema, la hipoalbuminemia y la inmunodeficiencia; la complicación más grave suele ser la infección por la depresión inmune.

**Tu respuesta:** _pendiente_

## 19. ❌ Difiere del documento · `ENURM-2011-031` · salió en 2011

**El siguiente hallazgo forma parte del cuadro clínico de la deshidratación severa:**

- A) Enoftalmos, poca turgencia en piel  ← *publicada*
- B) Fontanela anterior abombada
- C) Sed y cambios en el comportamiento  ← *documento*
- D) Fiebre muy elevada

**Especialidad:** pediatria · **Tema:** Deshidratación grave · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Difiere del documento. Propuesta: enoftalmos y poca turgencia cutánea son signos clásicos de deshidratación severa; sed y cambios de comportamiento aparecen en grados menores. El documento marca C (sed y cambios de comportamiento), pero A (enoftalmos, poca turgencia) describe mejor la deshidratación severa. Propongo A. Confirma.

**Explicación publicada:** En la deshidratación grave hay ojos hundidos (enoftalmos), pliegue cutáneo que tarda en recuperarse, letargo y dificultad para beber.

**Tu respuesta:** _pendiente_

## 20. ⚠️ Duda · `ENURM-2011-041` · salió en 2011

**Segun las normas nacionales de atención al embarazo, parto o puerperio, el número mínimo de consultas prenatales que debe recibir la embarazada es de:**

- A) 8
- B) 4
- C) 6  ← *documento y publicada (igual)*
- D) 10

**Especialidad:** ginecologia-obstetricia · **Tema:** Control prenatal: número de consultas · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** No pude confirmar cuál es el mínimo exacto de las normas nacionales dominicanas de ese año (6 según el documento). Necesito la norma.

**Explicación publicada:** La norma varía según el país y la época: la OMS recomendaba un mínimo de 4 consultas y las guías actuales, 8 contactos.

**Tu respuesta:** _pendiente_

## 21. ❌ Difiere del documento · `ENURM-2011-047` · salió en 2011

**En la sífilis del embarazo el Treponema pallidum atraviesa la barrera placentaria después de:**

- A) Las 8 semanas
- B) Las 20 semanas  ← *publicada*
- C) Las 12 semanas
- D) Las 28 semanas  ← *documento*

**Especialidad:** ginecologia-obstetricia · **Tema:** Sífilis en el embarazo · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Difiere del documento. Propuesta: la enseñanza clásica es después de las 16 a 18 semanas; 28 semanas es demasiado tarde. El documento marca D (28 semanas), que es demasiado tarde según la enseñanza clásica (16 a 18 semanas) y la evidencia actual (puede cruzar antes). Propongo B (20 semanas) como la más cercana. Confirma o retírala.

**Explicación publicada:** Clásicamente se enseña que el Treponema pallidum cruza la placenta a partir de las 16 a 18 semanas, aunque puede hacerlo antes; la sífilis congénita se previene con tratamiento temprano.

**Tu respuesta:** _pendiente_

## 22. ⚠️ Duda · `ENURM-2011-049` · salió en 2011

**El medicamento de elección para bajar la tensión arterial en la pre eclampsia es:**

- A) Hidralazina
- B) Aldomet  ← *documento y publicada (igual)*
- C) Nifedipina
- D) Labetalol

**Especialidad:** ginecologia-obstetricia · **Tema:** Hipertensión en el embarazo · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** «De elección para bajar la tensión en la preeclampsia» es ambiguo: depende de si es leve o grave. Hoy se prefieren labetalol o nifedipina. Propongo reescribir el enunciado o retirarla.

**Explicación publicada:** En la preeclampsia el antihipertensivo oral de primera línea para la hipertensión leve o crónica es la metildopa (Aldomet); en crisis hipertensiva grave se prefieren labetalol, hidralazina o nifedipina.

**Tu respuesta:** _pendiente_

## 23. ❌ Difiere del documento · `ENURM-2011-066` · salió en 2011

**Paciente masculino de 45 años, con dolor retroesternal de más de 60 minutos, opresión irradiado a la mandíbula, hipotenso, con nauseas, salivación excesiva y broncoespasmo. Hipertenso e hipercolesterolemic Con el cuadro anterior, su evidente infarto es de cara:**

- A) Anterior
- B) Lateral alta
- C) Inferior  ← *publicada*
- D) Todas las caras  ← *documento*

**Especialidad:** cardiologia · **Tema:** Infarto agudo de miocardio: cara afectada · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Difiere del documento. Propuesta: el cuadro vagal (náuseas, salivación e hipotensión) corresponde a un infarto de cara inferior. El documento marca D («todas las caras»), pero náuseas, salivación excesiva e hipotensión orientan a un infarto de cara inferior (C). El «broncoespasmo» del enunciado no encaja con ninguna cara. Propongo C. Confirma o retírala.

**Explicación publicada:** Un infarto de cara inferior suele acompañarse de náuseas, vómito, sialorrea e hipotensión por aumento del tono vagal; las demás caras no producen ese cuadro vagal.

**Tu respuesta:** _pendiente_

## 24. ⚠️ Duda · `ENURM-2011-077` · salió en 2011

**La causa principal de la insuficiencia cardiaca es la:**

- A) Cardiopatía isquémica  ← *documento y publicada (igual)*
- B) Miocarditis bacteriana
- C) Miocardiopatia dilatada
- D) HTA

**Especialidad:** cardiologia · **Tema:** Causas de insuficiencia cardíaca · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Dos opciones son defendibles: cardiopatía isquémica (A) o hipertensión (D), según la población y la fuente. Propongo mantener A, reescribir el enunciado («en países desarrollados») o retirarla.

**Explicación publicada:** En los países desarrollados la cardiopatía isquémica es la causa más frecuente de insuficiencia cardíaca, seguida de la hipertensión arterial; en muchas poblaciones la hipertensión es el principal factor de riesgo.

**Tu respuesta:** _pendiente_

## 25. ⚠️ Duda · `ENURM-2011-085` · salió en 2011

**La naturaleza más frecuente de los tumores de mediastino posterior es:**

- A) Tiroidea
- B) Linfatica  ← *documento y publicada (igual)*
- C) Timica
- D) Permeabilizacion de vias aéreas

**Especialidad:** cirugia · **Tema:** Tumores del mediastino · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** La pregunta pide la naturaleza más frecuente en el mediastino posterior, que es neurogénica; ninguna opción lo dice, y la D está rota («permeabilización de vías aéreas»). Propongo retirarla o reescribirla.

**Explicación publicada:** En el mediastino posterior predominan los tumores neurogénicos (neurofibromas, schwannomas); los linfomas y los timomas son más frecuentes en el mediastino anterior.

**Tu respuesta:** _pendiente_

## 26. ⚠️ Duda · `ENURM-2011-099` · salió en 2011

**Una quemadura eléctrica en una mano y un pie se considera de una extensión de un:**

- A) 25%  ← *documento y publicada (igual)*
- B) 50%
- C) 75%
- D) 100%

**Especialidad:** emergencias · **Tema:** Quemadura eléctrica · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Una mano y un pie por la regla de los nueve suman unos 3 a 5 % de la superficie corporal, no 25 %. El enunciado parece incompleto. Propongo retirarla.

**Explicación publicada:** En una quemadura eléctrica la lesión cutánea no refleja el daño interno, por eso la extensión de la superficie corporal no sirve como guía; se valoran el trayecto de la corriente, el ECG y la rabdomiólisis.

**Tu respuesta:** _pendiente_

## 27. ⚠️ Duda · `ENURM-2009-007` · salió en 2009

**Los siguientes vasos son afluentes del sistema porta excepto:**

- A) La vena esplénica
- B) La vena mesentérica superior
- C) La vena gástrica izquierda  ← *documento y publicada (igual)*
- D) La vena mesentérica inferior

**Especialidad:** ciencias-basicas · **Tema:** Sistema porta · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Las cuatro venas son afluentes del sistema porta (la gástrica izquierda desemboca en la porta o en la esplénica; la mesentérica inferior, en la esplénica). Ninguna es claramente «la excepción». Propongo retirarla.

**Explicación publicada:** La vena porta se forma por la unión de la vena esplénica y la mesentérica superior; la mesentérica inferior suele drenar en la esplénica y la gástrica izquierda desemboca en la porta o en la esplénica.

**Tu respuesta:** _pendiente_

## 28. ⚠️ Duda · `ENURM-2009-011` · salió en 2009

**La siguiente sustancia contribuye a disminuir los depósitos vasculares de colesterol:**

- A) Succinilcoa
- B) Acetilcolina
- C) Fosfatidil colina (Lecitina)  ← *documento y publicada (igual)*
- D) Acido Vinil Mendelico

**Especialidad:** ciencias-basicas · **Tema:** Lípidos y colesterol · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** La clave del documento (lecitina) es la única opción verosímil, pero la afirmación «disminuye los depósitos vasculares de colesterol» no tiene respaldo sólido en la bibliografía actual. Propongo retirarla o reescribirla.

**Explicación publicada:** Los fosfolípidos, como la lecitina, intervienen en el transporte de lípidos en las lipoproteínas y en la solubilización del colesterol en la bilis; su efecto sobre los depósitos vasculares de colesterol es discutido.

**Tu respuesta:** _pendiente_

## 29. ⚠️ Duda · `ENURM-2009-027` · salió en 2009

**La ictericia se considera fisiológica cuando:**

- A) La cifra de bilirrubina no excede los 11 mg/100dl en el RN a termino
- B) Aparece después de las 24 horas de vida
- C) Desaparece a los 7 a 10 días
- D) Todas son ciertas  ← *documento y publicada (igual)*

**Especialidad:** pediatria · **Tema:** Ictericia fisiológica del recién nacido · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** La clave es «todas son ciertas», pero el valor de la opción A (11 mg/dL) no coincide con los 12 a 13 mg/dL que citan la mayoría de los textos. Propongo corregir la A («12 mg/dL») o retirarla.

**Explicación publicada:** La ictericia fisiológica aparece después de las 24 horas, tiene un pico a los 3 a 5 días y desaparece a los 7 a 10 días en el recién nacido a término; la bilirrubina total no suele superar 12 a 13 mg/dL.

**Tu respuesta:** _pendiente_

## 30. ⚠️ Duda · `ENURM-2009-038` · salió en 2009

**La rabia afecta principalmente:**

- A) Población rural  ← *documento y publicada (igual)*
- B) Sexo masculino y niño
- C) Personas con falta de aseo
- D) A y B son correctas

**Especialidad:** salud-publica · **Tema:** Rabia: epidemiología · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Las opciones A y B son ciertas a la vez, y D («A y B son correctas») también es defendible. Propongo reescribirla o retirarla.

**Explicación publicada:** La rabia afecta sobre todo a la población rural, con más casos en niños y varones, por una mayor exposición a perros sin vacunar.

**Tu respuesta:** _pendiente_

## 31. ⚠️ Duda · `ENURM-2009-048` · salió en 2009

**Paciente con embarazo de 36 semanas, con sonografía que reporta oligohidramnios de leve a moderado no labor de parto, cuello cerrado, no ha expulsado líquido amniótico. Cuál sería el manejo aconsejable?**

- A) Repetir sonografía en una semana  ← *documento y publicada (igual)*
- B) Inducir labor de parto
- C) Citar en dos semanas
- D) Programar operación por cesárea

**Especialidad:** ginecologia-obstetricia · **Tema:** Oligohidramnios a las 36 semanas · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** El manejo depende de la guía que se siga: vigilar con ecografía (clave) o inducir entre las 36 y las 37 semanas. Necesito tu criterio.

**Explicación publicada:** El manejo del oligohidramnios aislado a las 36 semanas depende de la causa y del bienestar fetal: se vigila con ecografía y pruebas de bienestar fetal, y se valora terminar el embarazo entre las 36 y las 37 semanas.

**Tu respuesta:** _pendiente_

## 32. ❌ Difiere del documento · `ENURM-2009-049` · salió en 2009

**Embarazada con 37 semanas de gestación, con diagnóstico de placenta previa, feto en buen estado sin contracciones uterinas, su manejo seria:**

- A) Citar en dos semanas  ← *documento*
- B) Acelerar labor con oxitocina
- C) Programar cesárea para dentro de dos semanas  ← *publicada*
- D) Planificar cesárea de inmediato

**Especialidad:** ginecologia-obstetricia · **Tema:** Placenta previa asintomática a las 37 semanas · **Archivo:** `revision/lote-n003.json`

> **Por qué se marca:** Difiere del documento. Propuesta: programar la cesárea; citar en dos semanas dejaría llegar a las 39 semanas. El documento marca A («citar en dos semanas»), que no encaja con el manejo habitual. Lo habitual es programar la cesárea a las 36 a 37 semanas (C o D según la fuente). Necesito tu criterio.

**Explicación publicada:** En la placenta previa asintomática, la cesárea electiva se programa entre las 36 y las 37 semanas; se evita el trabajo de parto.

**Tu respuesta:** _pendiente_

## 33. ⚠️ Duda · `ENURM-2002-025` · salió en 2002

**Cuál de las siguientes es una causa materna de retraso del crecimiento intrauterino:**

- A) preeclamsia
- B) drogadicción  ← *documento y publicada (igual)*
- C) nefropatías
- D) cardiopatías de la madre

**Especialidad:** ginecologia-obstetricia · **Tema:** Restricción del crecimiento intrauterino: causas maternas · **Archivo:** `revision/lote-n004.json`

> **Por qué se marca:** Las cuatro opciones son causas maternas de RCIU según Williams; la pregunta tiene varias respuestas defendibles. Considerar reescribirla o retirarla.

**Explicación publicada:** Entre las causas maternas de restricción del crecimiento intrauterino están los trastornos hipertensivos (preeclampsia), las nefropatías, las cardiopatías cianógenas, la desnutrición y el consumo de tabaco, alcohol y drogas. La clave del documento marca la drogadicción.

**Tu respuesta:** _pendiente_

## 34. ❌ Difiere del documento · `ENURM-2002-031` · salió en 2002

**El siguiente concepto es falso en relación a la teofilina que se usa en el tratamiento del asma bronquial :**

- A) IV
- B) oral
- C) vía rectal  ← *documento*
- D) IM  ← *publicada*

**Especialidad:** farmacologia · **Tema:** Teofilina: vías de administración · **Archivo:** `revision/lote-n004.json`

> **Por qué se marca:** Difiere del documento. El documento marca la vía rectal, pero hay supositorios de aminofilina; la vía que no se usa para la teofilina es la intramuscular.

**Explicación publicada:** La teofilina se administra por vía oral y, como aminofilina, por vía intravenosa; también existieron supositorios rectales, de absorción errática. No se usa por vía intramuscular porque es muy dolorosa y se absorbe mal.

**Tu respuesta:** _pendiente_

## 35. ⚠️ Duda · `ENURM-2002-087` · salió en 2002

**El tumor maligno más frecuente de la cavidad oral es:**

- A) Los labios  ← *documento y publicada (igual)*
- B) la encia
- C) en el cielo de la boca
- D) en la lengua

**Especialidad:** oftalmologia-orl · **Tema:** Cáncer de la cavidad oral: localización · **Archivo:** `revision/lote-n004.json`

> **Por qué se marca:** Las fuentes difieren: el labio es la localización más frecuente en los textos clásicos, pero varias guías actuales dan la lengua (excluyendo el labio). Confirmar la clave.

**Explicación publicada:** El carcinoma epidermoide es el tumor maligno más frecuente de la boca. En los textos clásicos el labio (sobre todo el inferior, por exposición solar) es la localización más frecuente, seguida de la lengua; cuando se excluye el labio, la lengua es la más frecuente.

**Tu respuesta:** _pendiente_

## 36. ⚠️ Duda · `ENURM-2003-003` · salió en 2003

**La espermatogénesis tiene una duración aproximada de:**

- A) 64 días  ← *documento y publicada (igual)*
- B) 64 años
- C) 64 semanas
- D) 64 horas.

**Especialidad:** ciencias-basicas · **Tema:** Espermatogénesis: duración · **Archivo:** `revision/lote-n004.json`

> **Por qué se marca:** El documento pregunta por la ovogénesis, pero 64 días es la duración de la espermatogénesis; se corrigió el enunciado. Confirmar la corrección.

**Explicación publicada:** La espermatogénesis, desde la espermatogonia hasta el espermatozoide, dura unos 64 días (64 a 74 días según la fuente). La ovogénesis, en cambio, empieza en la vida fetal y se completa en la ovulación, de 12 a unos 50 años después.

**Tu respuesta:** _pendiente_

## 37. ❌ Difiere del documento · `ENURM-2003-023` · salió en 2003

**Las siguientes son todas características de dengue clásico, excepto:**

- A) es más frecuente en lactantes y niños mayores  ← *publicada*
- B) es la variante clínica más frencuente
- C) puede o no acompañarse de trombocitopenia
- D) ausencia de hemoconcentracion  ← *documento*

**Especialidad:** infectologia · **Tema:** Dengue clásico · **Archivo:** `revision/lote-n004.json`

> **Por qué se marca:** Difiere del documento. El documento marca la ausencia de hemoconcentración, pero esa sí es característica del dengue clásico; la afirmación falsa es que sea más frecuente en lactantes.

**Explicación publicada:** El dengue clásico (sin signos de alarma) es la forma clínica más frecuente, puede cursar con o sin trombocitopenia y no presenta hemoconcentración, que es signo de fuga plasmática (dengue grave). Predomina en niños mayores y adultos; en los lactantes suele manifestarse como fiebre indiferenciada.

**Tu respuesta:** _pendiente_

## 38. ⚠️ Duda · `ENURM-2005-001` · salió en 2005

**Es considerado el material genético básico:**

- A) genoma
- B) genes  ← *documento y publicada (igual)*
- C) ADN
- D) todos

**Especialidad:** ciencias-basicas · **Tema:** Material genético · **Archivo:** `revision/lote-n004.json`

> **Por qué se marca:** Pregunta ambigua: el ADN también es «el material genético». La clave (genes) se sostiene si se lee como «unidad básica de la herencia».

**Explicación publicada:** El gen es la unidad básica de la herencia: un segmento de ADN que codifica un producto funcional. El genoma es el conjunto total de genes y el ADN es la molécula que los contiene.

**Tu respuesta:** _pendiente_

## 39. ❌ Difiere del documento · `ENURM-2006-069` · salió en 2006

**Cuál de las caras del corazón humano reflejan la derivación D3 de EINTHOVEEN y la de FRANK WILSON aVF:**

- A) La anterior
- B) La septal  ← *documento*
- C) La lateral.
- D) La posterior  ← *publicada*

**Especialidad:** cardiologia · **Tema:** ECG: derivaciones inferiores · **Archivo:** `revision/lote-n004.json`

> **Por qué se marca:** Difiere del documento. El documento marca la cara septal, pero DIII y aVF exploran la cara inferior (diafragmática), que la nomenclatura clásica llama posterior.

**Explicación publicada:** DII, DIII y aVF exploran la cara inferior o diafragmática del corazón, que en la terminología clásica se llamaba cara posterior o posteroinferior. Las precordiales V1-V2 exploran el tabique y DI, aVL, V5-V6 la cara lateral.

**Tu respuesta:** _pendiente_

## 40. ❌ Difiere del documento · `ENURM-2007-019` · salió en 2007

**La renina producida en el aparato yuxtaglomerular, se considera que es:**

- A) Una hormona  ← *documento*
- B) Una enzima  ← *publicada*
- C) Un péptido
- D) un Acido

**Especialidad:** ciencias-basicas · **Tema:** Renina · **Archivo:** `revision/lote-n004.json`

> **Por qué se marca:** Difiere del documento. El documento marca «una hormona», pero la renina es una enzima: convierte el angiotensinógeno en angiotensina I y no tiene acción hormonal propia (Guyton).

**Explicación publicada:** La renina es una enzima proteolítica que liberan las células yuxtaglomerulares: convierte el angiotensinógeno en angiotensina I. No tiene efecto vasoactivo propio; Guyton la describe como enzima, aunque algunos textos la clasifican como hormona.

**Tu respuesta:** _pendiente_

## 41. ⚠️ Duda · `ENURM-2007-025` · salió en 2007

**Cada qué tiempo deben tomarse los signos vitales en un paciente con dengue hemorrágico?**

- A) Cada 4-6 horas
- B) Cada 2 horas  ← *documento y publicada (igual)*
- C) Cada 30 minutos
- D) Cada 8 horas

**Especialidad:** infectologia · **Tema:** Dengue hemorrágico: vigilancia · **Archivo:** `revision/lote-n004.json`

> **Por qué se marca:** La OPS 2022 indica vigilar cada hora con signos de alarma y cada 15-30 minutos en el choque; la clave «cada 2 horas» viene de protocolos antiguos. Confirmar.

**Explicación publicada:** En el dengue con fuga plasmática se vigilan estrechamente los signos vitales y la diuresis. La clave del documento da cada 2 horas; las guías de la OPS indican cada hora en el dengue con signos de alarma y cada 15 a 30 minutos en el choque.

**Tu respuesta:** _pendiente_

## 42. ❌ Difiere del documento · `ENURM-2007-039` · salió en 2007

**Cual de las siguientes enfermedades exantemáticas tiene el periodo de incubación más largo?**

- A) Rubeola  ← *publicada*
- B) Sarampión
- C) Eritema infeccioso  ← *documento*
- D) Escarlatina

**Especialidad:** pediatria · **Tema:** Exantemas: período de incubación · **Archivo:** `revision/lote-n005.json`

> **Por qué se marca:** Difiere del documento. El documento marca el eritema infeccioso, pero el parvovirus B19 incuba 4 a 14 días; la rubéola (14 a 21 días) tiene la incubación más larga de las opciones (Nelson, Red Book).

**Explicación publicada:** La rubéola tiene el período de incubación más largo de las opciones: 14 a 21 días. El sarampión incuba 8 a 12 días, el eritema infeccioso 4 a 14 días (el exantema aparece hacia el día 17-18) y la escarlatina 2 a 5 días.

**Tu respuesta:** _pendiente_

## 43. ❌ Difiere del documento · `ENURM-2007-055` · salió en 2007

**El diagnostico de diabetes gestacional se hace por:**

- A) Curva de tolerancia a la glucosa  ← *publicada*
- B) Glicemia en ayunas
- C) Glucosa post pandrial
- D) A y C son correctas  ← *documento*

**Especialidad:** ginecologia-obstetricia · **Tema:** Diabetes gestacional: diagnóstico · **Archivo:** `revision/lote-n005.json`

> **Por qué se marca:** Difiere del documento. El documento marca «A y C» (curva y glucosa posprandial), pero la glucosa posprandial no es criterio diagnóstico; el diagnóstico se hace con la curva de tolerancia (ADA).

**Explicación publicada:** La diabetes gestacional se diagnostica con la curva de tolerancia oral a la glucosa entre las semanas 24 y 28: 75 g en un paso (IADPSG/ADA) o 50 g seguido de 100 g en dos pasos. La glucosa posprandial no es un criterio diagnóstico.

**Tu respuesta:** _pendiente_

## 44. ⚠️ Duda · `ENURM-2007-056` · salió en 2007

**El medicamento de elección para disminuir la tensión arterial en la enfermedad hipertensiva gestacional es:**

- A) Nifedipina
- B) Diazoxido
- C) Sulfato de magnesio
- D) Hidralazina  ← *documento y publicada (igual)*

**Especialidad:** ginecologia-obstetricia · **Tema:** Crisis hipertensiva en el embarazo · **Archivo:** `revision/lote-n005.json`

> **Por qué se marca:** Las guías actuales (ACOG) ponen nifedipino, labetalol e hidralazina al mismo nivel; el nifedipino (opción A) también es defendible.

**Explicación publicada:** La hidralazina intravenosa es el antihipertensivo clásico en la hipertensión grave del embarazo. Las guías actuales (ACOG) consideran de primera línea por igual el labetalol IV, la hidralazina IV y el nifedipino oral.

**Tu respuesta:** _pendiente_

## 45. ❌ Difiere del documento · `ENURM-2007-060` · salió en 2007

**Cual de los siguientes se considera muerte fetal temprana?**

- A) Antes de las 12 semanas de gestación
- B) Antes de las 15 semanas de gestación
- C) Antes de las 20 semanas de gestación  ← *publicada*
- D) Antes de las 30 semanas de gestación  ← *documento*

**Especialidad:** ginecologia-obstetricia · **Tema:** Muerte fetal: clasificación · **Archivo:** `revision/lote-n005.json`

> **Por qué se marca:** Difiere del documento. El documento marca «antes de las 30 semanas», pero la muerte fetal temprana es la que ocurre antes de las 20 semanas; de 20 a 27 es intermedia y desde las 28, tardía.

**Explicación publicada:** La muerte fetal se clasifica como temprana antes de las 20 semanas, intermedia de 20 a 27 semanas y tardía a partir de las 28 semanas.

**Tu respuesta:** _pendiente_

## 46. ⚠️ Duda · `ENURM-2007-069` · salió en 2007

**Las enfermedades restrictivas del pulmón afectan mayormente:**

- A) La distensibilidad  ← *documento y publicada (igual)*
- B) La Resistencia
- C) La obstrucción del flujo aéreo
- D) La capacidad pulmonar total

**Especialidad:** neumologia · **Tema:** Enfermedad pulmonar restrictiva · **Archivo:** `revision/lote-n005.json`

> **Por qué se marca:** La disminución de la capacidad pulmonar total (opción D) es lo que define el patrón restrictivo; también es defendible. Considerar reescribirla.

**Explicación publicada:** En las enfermedades restrictivas del parénquima (fibrosis) disminuye la distensibilidad (compliance) del pulmón y, como consecuencia, la capacidad pulmonar total. La resistencia de la vía aérea y el flujo aéreo se afectan en las obstructivas.

**Tu respuesta:** _pendiente_

## 47. ❌ Difiere del documento · `ENURM-2007-079` · salió en 2007

**Una expectoración mucopurulenta fétida y de mal sabor en un paciente con neumonía nos hace pensar en**

- A) Presencia de gérmenes anaeróbicos  ← *publicada*
- B) Gérmenes Gram negativos
- C) Gérmenes Gram positivos  ← *documento*
- D) Ningunos

**Especialidad:** neumologia · **Tema:** Neumonía por anaerobios · **Archivo:** `revision/lote-n005.json`

> **Por qué se marca:** Difiere del documento. El documento marca gérmenes grampositivos, pero la expectoración fétida y de mal sabor es característica de los anaerobios (neumonía por aspiración, absceso pulmonar).

**Explicación publicada:** La expectoración fétida y de mal sabor es típica de la infección por anaerobios, como en la neumonía por aspiración y el absceso pulmonar, sobre todo en pacientes con mala dentición o alteración de la conciencia.

**Tu respuesta:** _pendiente_

## 48. ⚠️ Duda · `ENURM-2007-092` · salió en 2007

**El tumor benigno más frecuente del pulmón es:**

- A) Adenoma mucoepidermoide
- B) Adenoma quístico
- C) Tumor carcinoide  ← *documento y publicada (igual)*
- D) Papiloma

**Especialidad:** neumologia · **Tema:** Tumores pulmonares «benignos» · **Archivo:** `revision/lote-n006.json`

> **Por qué se marca:** El tumor benigno más frecuente del pulmón es el hamartoma, que no está entre las opciones; el carcinoide hoy se considera maligno de bajo grado. Considerar reescribir las opciones.

**Explicación publicada:** El tumor benigno más frecuente del pulmón es el hamartoma, que no está entre las opciones. En los textos antiguos el tumor carcinoide se agrupaba como «adenoma bronquial» benigno; hoy se considera una neoplasia neuroendocrina maligna de bajo grado.

**Tu respuesta:** _pendiente_

## 49. ❌ Difiere del documento · `ENURM-2007-099` · salió en 2007

**La hernia más frecuente en mujeres es la : (ojo)**

- A) Inguinal directa
- B) Inguinal indirecta  ← *publicada*
- C) Femoral  ← *documento*
- D) Incisional

**Especialidad:** cirugia · **Tema:** Hernias en la mujer · **Archivo:** `revision/lote-n006.json`

> **Por qué se marca:** Difiere del documento. El documento marca la femoral, pero la hernia más frecuente en la mujer es la inguinal indirecta; la femoral solo es más frecuente en mujeres que en hombres (Schwartz, Sabiston).

**Explicación publicada:** La hernia inguinal indirecta es la más frecuente tanto en hombres como en mujeres. La hernia femoral es más frecuente en mujeres que en hombres, pero aun en ellas es menos frecuente que la inguinal indirecta.

**Tu respuesta:** _pendiente_

## 50. ⚠️ Duda · `ENURM-2008-005` · salió en 2008

**Cual virus utiliza como receptor el factor de crecimiento de fibroblastos?**

- A) Influenza A
- B) Herpes simple 1
- C) Epstein-Barr
- D) Ninguna de las anteriores  ← *documento y publicada (igual)*

**Especialidad:** infectologia · **Tema:** Receptores virales · **Archivo:** `revision/lote-n006.json`

> **Por qué se marca:** Algunos bancos dan herpes simple 1 como respuesta (estudio de Kaner, 1990), que después no se confirmó. Confirmar la clave.

**Explicación publicada:** Cada virus usa receptores celulares concretos: el de la influenza A es el ácido siálico, el del Epstein-Barr es CD21 (CR2) y el del herpes simple, el heparán sulfato y la nectina-1 (HVEM). Un estudio de 1990 propuso el receptor del factor de crecimiento de fibroblastos para el herpes simple 1, pero no se confirmó.

**Tu respuesta:** _pendiente_

## 51. ⚠️ Duda · `ENURM-2008-041` · salió en 2008

**Primigesta de 20 años de edad, embarazo de 37 semanas, con 2 cm de dilatación, cuello borrado, producto en cefálico, encajado, contracciones moderadas cada 15 minutos, membranas integras, la conduct a tomar es:**

- A) Inhibir labor de parto
- B) Administrar oxitócica
- C) Enviar a la casa hasta que aumente labor de parto
- D) Ingresar y dejar evolucionar  ← *documento y publicada (igual)*

**Especialidad:** ginecologia-obstetricia · **Tema:** Fase latente del trabajo de parto · **Archivo:** `revision/lote-n006.json`

> **Por qué se marca:** Con contracciones cada 15 minutos y 2 cm, las guías actuales (ACOG, OMS 2018) permiten esperar en casa la fase latente; las opciones C y D son defendibles.

**Explicación publicada:** Una primigesta a término con 2 cm, cuello borrado y contracciones cada 15 minutos está en fase latente. La clave del documento indica ingresar y dejar evolucionar; las guías actuales permiten también el manejo expectante en casa en la fase latente si la madre y el feto están bien.

**Tu respuesta:** _pendiente_

## 52. ❌ Difiere del documento · `ENURM-2008-043` · salió en 2008

**Paciente con embarazo de 36 semanas, sonografia reporta oligoamnios severo, no labor de parto, cuello cerrado, no ha expulsado líquido amniótico. Cuál es el manejo aconsejable?**

- A) Repetir sonografia en una semana
- B) Inducir labor de parto  ← *publicada*
- C) Esperar inicio de labor de parto
- D) Programar operación cesárea inmediata  ← *documento*

**Especialidad:** ginecologia-obstetricia · **Tema:** Oligohidramnios a las 36 semanas · **Archivo:** `revision/lote-n006.json`

> **Por qué se marca:** Difiere del documento. El documento marca cesárea inmediata, pero el oligohidramnios aislado no es indicación de cesárea: a las 36 semanas se indica terminar el embarazo por inducción, con cesárea solo por indicación obstétrica (Williams, ACOG).

**Explicación publicada:** El oligohidramnios grave sin rotura de membranas a partir de las 36 semanas es indicación de terminar el embarazo. El oligohidramnios por sí solo no indica cesárea: se induce el trabajo de parto (con maduración cervical si el cuello está cerrado) y se hace cesárea por las indicaciones obstétricas habituales.

**Tu respuesta:** _pendiente_

## 53. ⚠️ Duda · `ENURM-2008-045` · salió en 2008

**Paciente masculino quien considera luego de haber tenido una relación sexual, que la pareja era dudosa; fue donde su médico de cabecera al Segundo día y este le recomendó hacerse una prueba de VIH. A partir de cuantos días posteriores al coito debemos mandar hacer la prueba para la detención de los anti VIH?**

- A) A los 3 días
- B) A los 15 días  ← *documento y publicada (igual)*
- C) A los 10 días
- D) a los 4 días

**Especialidad:** infectologia · **Tema:** VIH: período de ventana · **Archivo:** `revision/lote-n007.json`

> **Por qué se marca:** Ninguna opción coincide con las guías: los anticuerpos tardan 3 a 12 semanas y las pruebas de cuarta generación unas 2 a 6 semanas. Considerar reescribir las opciones.

**Explicación publicada:** Tras una exposición, las pruebas de cuarta generación (antígeno p24 y anticuerpos) detectan la mayoría de las infecciones entre las 2 y 6 semanas; los anticuerpos solos pueden tardar de 3 a 12 semanas. De las opciones, 15 días es la más cercana al inicio del período detectable, pero un resultado negativo debe repetirse a las 6 semanas y a los 3 meses.

**Tu respuesta:** _pendiente_

## 54. ⚠️ Duda · `ENURM-2008-055` · salió en 2008

**En relación con el síndrome metabólico, las siguientes alteraciones son ciertas, excepto:**

- A) Nivel de triglicéridos >149mg/dl
- B) Nivel de HDL-colesterol < 40mg/dl en masculinos
- C) Tensión arterial de 120/80 mmhg o superior
- D) Nivel de insulina normal  ← *documento y publicada (igual)*

**Especialidad:** endocrinologia · **Tema:** Síndrome metabólico · **Archivo:** `revision/lote-n007.json`

> **Por qué se marca:** La opción C también es falsa: el criterio de presión arterial es ≥130/85 mmHg, no 120/80. La pregunta tiene dos opciones incorrectas.

**Explicación publicada:** Los criterios del síndrome metabólico (ATP III) incluyen triglicéridos ≥150 mg/dL, HDL <40 mg/dL en hombres o <50 en mujeres, presión ≥130/85 mmHg, glucosa en ayunas ≥100 mg/dL y cintura aumentada. Su base es la resistencia a la insulina, con hiperinsulinemia, no con insulina normal.

**Tu respuesta:** _pendiente_

## 55. ❌ Difiere del documento · `ENURM-2008-059` · salió en 2008

**Un paciente con enfriamiento y palidez de una pierna, parestesia y ausencia de pulsos femorales, su diagnóstico seria:**

- A) Tromboflebitis profunda de la vena femoral
- B) Obstrucción aguda de la arteria femoral  ← *publicada*
- C) Ambas son correctas
- D) Ambas son falsas  ← *documento*

**Especialidad:** cirugia · **Tema:** Isquemia arterial aguda · **Archivo:** `revision/lote-n007.json`

> **Por qué se marca:** Difiere del documento. El documento marca «ambas son falsas», pero la pierna fría y pálida, con parestesias y sin pulsos, es una oclusión arterial aguda (Sabiston).

**Explicación publicada:** La pierna fría y pálida con parestesias y ausencia de pulsos es una isquemia arterial aguda por oclusión de la arteria femoral (las 6 P: dolor, palidez, ausencia de pulso, parestesias, parálisis y poiquilotermia). La trombosis venosa profunda produce pierna caliente, roja y edematosa con pulsos presentes.

**Tu respuesta:** _pendiente_

## 56. ❌ Difiere del documento · `ENURM-2008-079` · salió en 2008

**A los niños con meningitis les favorece un balance de líquido:**

- A) positivo
- B) Neutro  ← *publicada*
- C) Negativo  ← *documento*
- D) Mixto

**Especialidad:** pediatria · **Tema:** Meningitis: manejo de líquidos · **Archivo:** `revision/lote-n007.json`

> **Por qué se marca:** Difiere del documento. El documento marca balance negativo (restricción), práctica antigua; Nelson y la revisión Cochrane recomiendan líquidos de mantenimiento (balance neutro) y restringir solo si hay SIADH.

**Explicación publicada:** La restricción hídrica sistemática en la meningitis bacteriana (balance negativo) ya no se recomienda: la revisión Cochrane y Nelson indican líquidos de mantenimiento para mantener la normovolemia y una buena perfusión cerebral, y restringir solo si hay SIADH sin deshidratación.

**Tu respuesta:** _pendiente_

## 57. ❌ Difiere del documento · `ENURM-2008-083` · salió en 2008

**Con relación a la complicación de la diarrea, cual es la respuesta correcta:**

- A) Deshidratación  ← *publicada*
- B) Evacuaciones liquidas
- C) Desequilibrio hidroelectrolítico
- D) A y B son correctas  ← *documento*

**Especialidad:** pediatria · **Tema:** Diarrea: complicaciones · **Archivo:** `revision/lote-n007.json`

> **Por qué se marca:** Difiere del documento. El documento marca «A y B», pero las evacuaciones líquidas son la diarrea misma, no una complicación; la complicación principal es la deshidratación. Las opciones A y C son complicaciones reales y no hay una opción «A y C»; se publicó A. Considerar reescribir las opciones.

**Explicación publicada:** La complicación principal de la diarrea aguda es la deshidratación, acompañada a menudo de desequilibrio hidroelectrolítico y ácido-base. Las evacuaciones líquidas son la manifestación de la diarrea, no su complicación.

**Tu respuesta:** _pendiente_

## 58. ⚠️ Duda · `ENURM-2009-079` · salió en 2009

**La primera causa a sospechar en un paciente con alteración brusca de la conciencia es:**

- A) Hipoglicemia
- B) Hemorragia cerebral  ← *documento y publicada (igual)*
- C) Trombosis cerebral
- D) Tumor cerebral

**Especialidad:** neurologia · **Tema:** Alteración brusca de la conciencia · **Archivo:** `revision/lote-n008.json`

> **Por qué se marca:** La hipoglucemia (opción A) es la primera causa que se descarta ante cualquier alteración brusca de la conciencia; la pregunta admite dos respuestas.

**Explicación publicada:** Una alteración brusca de la conciencia sugiere una causa vascular aguda, sobre todo hemorragia cerebral. En la práctica, la hipoglucemia debe descartarse siempre de inmediato con una glucemia capilar, porque es fácil de corregir y simula un ictus.

**Tu respuesta:** _pendiente_

## 59. ❌ Difiere del documento · `ENURM-2009-082` · salió en 2009

**La obstrucción del siguiente segmento del tubo digestivo se denomina en asa cerrada:**

- A) Colon  ← *publicada*
- B) Yeyuno
- C) Ileon  ← *documento*
- D) Duodeno

**Especialidad:** cirugia · **Tema:** Obstrucción en asa cerrada · **Archivo:** `revision/lote-n008.json`

> **Por qué se marca:** Difiere del documento. El documento marca el íleon, pero la obstrucción en asa cerrada clásica es la del colon con válvula ileocecal competente (Schwartz).

**Explicación publicada:** La obstrucción en asa cerrada clásica es la del colon con válvula ileocecal competente: el gas no puede volver al íleon y el ciego se distiende con riesgo de perforación. También ocurre en el vólvulo y en las hernias estranguladas.

**Tu respuesta:** _pendiente_

## 60. ❌ Difiere del documento · `ENURM-2009-093` · salió en 2009

**La complicación mas frecuente del divertículo de Meckel en un adulto es:**

- A) Sangrado  ← *documento*
- B) Estenosis
- C) Perforación
- D) Obstrucción intestinal  ← *publicada*

**Especialidad:** cirugia · **Tema:** Divertículo de Meckel en el adulto · **Archivo:** `revision/lote-n008.json`

> **Por qué se marca:** Difiere del documento. El documento marca el sangrado, que es la complicación más frecuente en niños; en el adulto predomina la obstrucción intestinal (Sabiston).

**Explicación publicada:** La complicación más frecuente del divertículo de Meckel en el adulto es la obstrucción intestinal (por invaginación, vólvulo o bandas). En los niños predomina la hemorragia por úlcera de mucosa gástrica ectópica.

**Tu respuesta:** _pendiente_

## 61. ⚠️ Duda · `ENURM-2010-003` · salió en 2010

**La siguiente vena es afluente del sistema porta:**

- A) Mesenterica inferior  ← *documento y publicada (igual)*
- B) Gástrica izquierda
- C) Cava superior
- D) Cava inferior

**Especialidad:** ciencias-basicas · **Tema:** Sistema porta · **Archivo:** `revision/lote-n008.json`

> **Por qué se marca:** La vena gástrica izquierda (opción B) también es afluente del sistema porta; la pregunta tiene dos respuestas correctas.

**Explicación publicada:** La vena porta se forma por la unión de la vena mesentérica superior y la esplénica, que recibe a la mesentérica inferior. Las venas gástricas izquierda y derecha también drenan en la porta. Las cavas son sistémicas.

**Tu respuesta:** _pendiente_

## 62. ⚠️ Duda · `ENURM-2010-009` · salió en 2010

**Las células gástricas que producen las enzimas digestivas son las:**

- A) Parietales
- B) Antrales
- C) Oxinticas  ← *documento y publicada (igual)*
- D) Piloricas

**Especialidad:** ciencias-basicas · **Tema:** Glándulas gástricas: células principales · **Archivo:** `revision/lote-n008.json`

> **Por qué se marca:** La respuesta precisa es «células principales», que no está entre las opciones; «oxínticas» suele designar a las células parietales. Considerar reescribir las opciones.

**Explicación publicada:** Las enzimas digestivas gástricas (pepsinógeno) las producen las células principales (zimógenas) de las glándulas oxínticas del cuerpo y el fondo. El término «oxíntico» se aplica también a las células parietales, que producen ácido.

**Tu respuesta:** _pendiente_

## 63. ⚠️ Duda · `ENURM-2010-015` · salió en 2010

**El musculo responsable de la extensión del muslo:**

- A) Gemelo
- B) Cuádriceps crural  ← *documento y publicada (igual)*
- C) Psoas-iliaco
- D) Obturatiz

**Especialidad:** ciencias-basicas · **Tema:** Cuádriceps · **Archivo:** `revision/lote-n008.json`

> **Por qué se marca:** En sentido anatómico estricto, la extensión del muslo (cadera) la hace el glúteo mayor, que no está entre las opciones; la clave se sostiene solo si «muslo» se entiende como «pierna».

**Explicación publicada:** El cuádriceps femoral es el extensor de la rodilla (extiende la pierna sobre el muslo) y el recto femoral flexiona además la cadera. La extensión de la cadera (del muslo sobre la pelvis) la realizan sobre todo el glúteo mayor y los isquiotibiales.

**Tu respuesta:** _pendiente_

## 64. ⚠️ Duda · `ENURM-2010-067` · salió en 2010

**La situación más destructiva en los accidentes cerebro-vasculares es:**

- A) La hemorragia epidural
- B) La hemorragia subdural
- C) La hemorragia subaracnoidea
- D) El infarto cerebral  ← *documento y publicada (igual)*

**Especialidad:** neurologia · **Tema:** Accidente cerebrovascular: gravedad · **Archivo:** `revision/lote-n009.json`

> **Por qué se marca:** Pregunta ambigua: «más destructiva» no está definido; la hemorragia subaracnoidea tiene mayor mortalidad. Considerar reescribirla o retirarla.

**Explicación publicada:** Entre las opciones, el infarto cerebral es el accidente cerebrovascular propiamente dicho y el que produce necrosis del tejido cerebral, con secuelas permanentes. Las hemorragias epidural y subdural son traumáticas en su mayoría y no se clasifican como ictus.

**Tu respuesta:** _pendiente_

## 65. ❌ Difiere del documento · `ENURM-2010-081` · salió en 2010

**El método diagnóstico más específico en las patologías de vesicular biliar es la:**

- A) TAC  ← *documento*
- B) Radiografía
- C) Sonografia
- D) Gammagrafia  ← *publicada*

**Especialidad:** cirugia · **Tema:** Gammagrafía biliar (HIDA) · **Archivo:** `revision/lote-n009.json`

> **Por qué se marca:** Difiere del documento. El documento marca la TC, pero la prueba más específica en la colecistitis aguda es la gammagrafía con HIDA; la ecografía es la inicial (Schwartz).

**Explicación publicada:** La gammagrafía con HIDA es la prueba más sensible y específica para la colecistitis aguda: si la vesícula no se visualiza, el cístico está obstruido. La ecografía es la prueba inicial de elección por su disponibilidad.

**Tu respuesta:** _pendiente_

## 66. ⚠️ Duda · `ENURM-2013-032` · salió en 2013

**La mayoría de los niños con infección perinatal por VIH, empiezan a presentar los síntomas clínicos relacionados con la enfermedad, aproximadamente a la edad de:**

- A) 1-3 años de edad
- B) 1-2 años de edad  ← *documento y publicada (igual)*
- C) Entre los 5 meses y los 2 años de edad
- D) al momento del nacimiento

**Especialidad:** pediatria · **Tema:** VIH perinatal: evolución · **Archivo:** `revision/lote-n010.json`

> **Por qué se marca:** Las fuentes describen un patrón bimodal y no una edad única de inicio; las opciones B y C se solapan. Confirmar la clave.

**Explicación publicada:** Sin tratamiento, la infección perinatal por VIH tiene un patrón bimodal: un 15-25 % progresa rápido y enferma en el primer año, y la mayoría desarrolla síntomas más tarde. La clave del documento da 1 a 2 años como edad habitual de inicio de los síntomas.

**Tu respuesta:** _pendiente_

## 67. ⚠️ Duda · `ENURM-2013-040` · salió en 2013

**La sífilis no tratada en el embarazo infecta al feto con una frecuencia de:**

- A) 20-30%
- B) 95-100%  ← *documento y publicada (igual)*
- C) 40-50%
- D) 60-70%

**Especialidad:** ginecologia-obstetricia · **Tema:** Sífilis congénita: transmisión · **Archivo:** `revision/lote-n010.json`

> **Por qué se marca:** La tasa varía mucho con el estadio (casi 100 % en la secundaria, ~10 % en la latente tardía); la clave solo vale para la sífilis temprana. Confirmar.

**Explicación publicada:** La transmisión de la sífilis al feto depende del estadio materno: es casi del 100 % en la sífilis secundaria y del 70-100 % en la primaria, y baja en la latente tardía. La clave toma el valor de la sífilis temprana no tratada.

**Tu respuesta:** _pendiente_

## 68. ⚠️ Duda · `ENURM-2013-044` · salió en 2013

**El pico de incidencia del cáncer epitelial de ovario, está entre los:**

- A) 35-45 años.
- B) 40-45 años.
- C) 65-70 años  ← *documento y publicada (igual)*
- D) 56-60 años

**Especialidad:** ginecologia-obstetricia · **Tema:** Cáncer epitelial de ovario: edad · **Archivo:** `revision/lote-n010.json`

> **Por qué se marca:** Las fuentes dan la mediana en ~63 años y el pico entre los 60 y 70; las opciones C y D quedan cerca del valor. Confirmar la clave.

**Explicación publicada:** El cáncer epitelial de ovario es sobre todo de la posmenopausia: la mediana de edad al diagnóstico es de unos 63 años y la incidencia máxima se sitúa entre los 60 y 70 años.

**Tu respuesta:** _pendiente_

## 69. ❌ Difiere del documento · `ENURM-2013-062` · salió en 2013

**Dentro de Las manifestaciones de la hemorragia digestiva, se encuentra la Hematoquezia, que significa:**

- A) Vómitos con sangre roja o en borra de café
- B) Heces mal olientes y negras  ← *documento*
- C) Evacuacion de sangre color rojo vino  ← *publicada*
- D) Sangre oculta en heces

**Especialidad:** gastroenterologia · **Tema:** Hematoquecia · **Archivo:** `revision/lote-n010.json`

> **Por qué se marca:** Difiere del documento. El documento marca «heces malolientes y negras», que es la melena; la hematoquecia es la expulsión de sangre roja por el recto.

**Explicación publicada:** La hematoquecia es la expulsión de sangre roja o rojo vinoso por el recto, típica de la hemorragia digestiva baja. Las heces negras y malolientes son melena y el vómito con sangre es hematemesis.

**Tu respuesta:** _pendiente_

## 70. ⚠️ Duda · `ENURM-2013-065` · salió en 2013

**En el tratamiento del estreñimiento, lo que debe hacerse es tratar la enfermedad subyacente en los pacientes. En el caso de un tratamiento paliativo, cual de los siguientes medicamentos produce una diarrea osmótica?**

- A) Leche de magnesia  ← *documento y publicada (igual)*
- B) Lactulosa
- C) Aceite de recino
- D) Extracto de cascara sagrada

**Especialidad:** farmacologia · **Tema:** Laxantes osmóticos · **Archivo:** `revision/lote-n010.json`

> **Por qué se marca:** La lactulosa (opción B) también produce diarrea osmótica; la pregunta tiene dos respuestas correctas.

**Explicación publicada:** La leche de magnesia (hidróxido de magnesio) es un laxante osmótico salino: retiene agua en la luz intestinal. La lactulosa también es osmótica. El aceite de ricino y la cáscara sagrada son estimulantes.

**Tu respuesta:** _pendiente_

## 71. ⚠️ Duda · `ENURM-2013-077` · salió en 2013

**Entre los signos que evidencian que un paciente con dengue presentara la complicación de fiebre hemorrágica se encuentran:**

- A) inyección conjuntival, hipersensibilidad del musculo abdominal
- B) Hipotensión y aumento de plaquetas
- C) Petequias y bradicardia  ← *documento y publicada (igual)*
- D) Pruebas hepáticas normales

**Especialidad:** infectologia · **Tema:** Dengue: signos de complicación · **Archivo:** `revision/lote-n011.json`

> **Por qué se marca:** Las opciones no reflejan bien los signos de alarma de la OPS 2022; el dolor abdominal (opción A) es un signo de alarma reconocido. Considerar reescribir la pregunta.

**Explicación publicada:** En la clasificación clásica de la OMS, las manifestaciones hemorrágicas (petequias, prueba del torniquete positiva) acompañaban al dengue hemorrágico. Hoy la OPS usa signos de alarma: dolor abdominal intenso, vómitos persistentes, acumulación de líquidos, sangrado de mucosas, letargo, hepatomegalia y hematocrito en ascenso con plaquetas en descenso.

**Tu respuesta:** _pendiente_

## 72. ❌ Difiere del documento · `ENURM-2013-084` · salió en 2013

**El microorganismo patógeno aislado más frecuentemente en las infecciones post-operatorias:**

- A) Cándida albicans
- B) Streptococo B hemolítico grupo A  ← *documento*
- C) Estafilococo coagulasa negativo  ← *publicada*
- D) Klebsiela

**Especialidad:** cirugia · **Tema:** Infección del sitio quirúrgico: gérmenes · **Archivo:** `revision/lote-n011.json`

> **Por qué se marca:** Difiere del documento. El documento marca el estreptococo del grupo A, causa rara de infección posoperatoria; el germen más frecuente es S. aureus (no está entre las opciones), seguido de los estafilococos coagulasa negativos. La respuesta correcta (S. aureus) no está entre las opciones; se publicó la más cercana. Considerar reescribir las opciones.

**Explicación publicada:** El germen más aislado en las infecciones del sitio quirúrgico es Staphylococcus aureus, seguido de los estafilococos coagulasa negativos, los enterococos y los bacilos gramnegativos. S. aureus no está entre las opciones; de ellas, los coagulasa negativos son los más frecuentes.

**Tu respuesta:** _pendiente_

## 73. ❌ Difiere del documento · `ENURM-2013-088` · salió en 2013

**Las quemaduras que afectan hasta las capas reticulares de la dermis se consideran como de:**

- A) Primer grado
- B) segundo grado de espesor parcial superficial  ← *documento*
- C) Segundo grado de espesor parcial profundo  ← *publicada*
- D) Tercer grado

**Especialidad:** cirugia · **Tema:** Quemadura de segundo grado profundo · **Archivo:** `revision/lote-n011.json`

> **Por qué se marca:** Difiere del documento. El documento marca segundo grado superficial, pero la afectación de la dermis reticular corresponde al espesor parcial profundo; la superficial llega a la dermis papilar (Sabiston).

**Explicación publicada:** La quemadura de espesor parcial profundo afecta a la dermis reticular: es pálida, menos dolorosa, con flictenas rotas, y tarda más de 3 semanas en curar o requiere injerto. La superficial llega solo a la dermis papilar.

**Tu respuesta:** _pendiente_

## 74. ⚠️ Duda · `ENURM-2014-008` · salió en 2014

**La lesión de uno de los siguientes nervios produce voz debilitada:**

- A) Laringeo recurrente  ← *documento y publicada (igual)*
- B) Laringeo superior
- C) Laríngeo inferior
- D) Hipogloso

**Especialidad:** oftalmologia-orl · **Tema:** Nervio laríngeo recurrente · **Archivo:** `revision/lote-n011.json`

> **Por qué se marca:** El laríngeo inferior (opción C) es el mismo nervio recurrente y el laríngeo superior también produce voz débil; la pregunta admite más de una respuesta.

**Explicación publicada:** La lesión unilateral del nervio laríngeo recurrente paraliza la cuerda vocal y produce disfonía, con voz débil y soplada. La del laríngeo superior afecta al cricotiroideo y causa pérdida de los tonos agudos y fatiga vocal.

**Tu respuesta:** _pendiente_

## 75. ⚠️ Duda · `ENURM-2014-017` · salió en 2014

**Con una pérdida de sangre de un 15%. ¿Cuál parámetro podemos encontrar aun dentro de un rango normal?**

- A) Frecuencia respiratoria  ← *documento y publicada (igual)*
- B) Frecuencia cardiaca
- C) Diuresis
- D) Presión arterial

**Especialidad:** emergencias · **Tema:** Hemorragia clase I · **Archivo:** `revision/lote-n011.json`

> **Por qué se marca:** En la clase I del ATLS todos los parámetros (FC, PA, FR y diuresis) pueden estar normales; la pregunta admite varias respuestas.

**Explicación publicada:** En la hemorragia clase I del ATLS (pérdida de hasta el 15 % del volumen) la frecuencia cardíaca, la presión arterial, la frecuencia respiratoria y la diuresis suelen ser normales o casi normales. La clave del documento señala la frecuencia respiratoria.

**Tu respuesta:** _pendiente_

## 76. ❌ Difiere del documento · `ENURM-2014-027` · salió en 2014

**¿Cuál de las siguientes acciones es la más efectiva e importante cuando un neonato requiere reanimación?**

- A) Oxigeno con mascarilla
- B) Masaje cardiaco  ← *documento*
- C) Ventilación pulmonar  ← *publicada*
- D) Administrar adrenalina

**Especialidad:** pediatria · **Tema:** Reanimación neonatal: ventilación · **Archivo:** `revision/lote-n011.json`

> **Por qué se marca:** Difiere del documento. El documento marca el masaje cardíaco, pero en la reanimación neonatal lo más importante y efectivo es la ventilación (programa de reanimación neonatal).

**Explicación publicada:** La ventilación pulmonar eficaz es la acción más importante y efectiva en la reanimación neonatal: la mayoría de los recién nacidos que la necesitan responden solo con ventilación con presión positiva. El masaje cardíaco se inicia si la frecuencia sigue <60 lpm tras 30 segundos de ventilación eficaz.

**Tu respuesta:** _pendiente_

## 77. ⚠️ Duda · `ENURM-2014-039` · salió en 2014

**¿Cuál de los siguientes es el signo más frecuente en la intoxicación por órganos fosforados en un niño?**

- A) Vómitos  ← *documento y publicada (igual)*
- B) Miosis
- C) Midriasis
- D) Fasciculaciones

**Especialidad:** emergencias · **Tema:** Intoxicación por organofosforados en niños · **Archivo:** `revision/lote-n012.json`

> **Por qué se marca:** La miosis (opción B) también se describe como el signo más frecuente en muchas series; la pregunta admite más de una respuesta. Confirmar la clave.

**Explicación publicada:** Los organofosforados producen síndrome colinérgico: vómitos, diarrea, sialorrea, broncorrea, bradicardia y miosis, con fasciculaciones y debilidad. En niños son muy frecuentes los síntomas digestivos y los del sistema nervioso central (letargo, convulsiones); la clave del documento señala los vómitos.

**Tu respuesta:** _pendiente_

## 78. ⚠️ Duda · `ENURM-2014-051` · salió en 2014

**La primera dosis recomendada de Sulfato de Magnesio que debe administrársele a una paciente eclámptica que llega a una UNAP, antes de referirla es de:**

- A) 1 gramo E.V.
- B) 6 gramos E.V.  ← *documento y publicada (igual)*
- C) 4 gramos E.V.
- D) 10 gramos I.M.

**Especialidad:** ginecologia-obstetricia · **Tema:** Eclampsia: dosis de sulfato de magnesio · **Archivo:** `revision/lote-n012.json`

> **Por qué se marca:** Las guías aceptan 4 g (Zuspan, OMS) o 6 g (Sibai) IV; la opción C también es correcta. Confirmar con la norma nacional.

**Explicación publicada:** La dosis de impregnación de sulfato de magnesio en la eclampsia es de 4 a 6 g IV en 15-20 minutos (Zuspan: 4 g; Sibai: 6 g), seguida de 1 a 2 g/h. La clave del documento da 6 g.

**Tu respuesta:** _pendiente_

## 79. ⚠️ Duda · `ENURM-2014-059` · salió en 2014

**Señale cuál de estos medicamentos es la primera elección para el tratamiento de la hipertensión inducid por el embarazo, grado severo:**

- A) Nifedipina
- B) Sulfato de Magnesio
- C) Hidralazina  ← *documento y publicada (igual)*
- D) Metil Dopa

**Especialidad:** ginecologia-obstetricia · **Tema:** Preeclampsia grave: antihipertensivo · **Archivo:** `revision/lote-n012.json`

> **Por qué se marca:** Las guías actuales (ACOG) ponen hidralazina, labetalol y nifedipino al mismo nivel; la opción A también es defendible.

**Explicación publicada:** La hidralazina IV es el antihipertensivo clásico en la hipertensión grave del embarazo. Las guías actuales consideran igual de válidos el labetalol IV y el nifedipino oral.

**Tu respuesta:** _pendiente_

## 80. ⚠️ Duda · `ENURM-2014-062` · salió en 2014

**Un paciente llega al centro de salud luego de ingerir más de 30 tabletas de acetaminofén con intento suicida. Muere 4 horas después. ¿Cuál sería la causa de muerte más probable en este caso?**

- A) Arritmia
- B) Fallo hepático  ← *documento y publicada (igual)*
- C) Edema pulmonar no cardiogénico
- D) Fallo respiratorio

**Especialidad:** emergencias · **Tema:** Intoxicación por acetaminofén · **Archivo:** `revision/lote-n012.json`

> **Por qué se marca:** El fallo hepático por acetaminofén tarda días; la muerte a las 4 horas no es compatible con el cuadro. Considerar reescribir el enunciado.

**Explicación publicada:** La intoxicación por acetaminofén causa necrosis hepática y la muerte por insuficiencia hepática aguda suele ocurrir a los 3-5 días; las primeras horas son casi asintomáticas. Una muerte a las 4 horas sugiere otra causa o coingesta, aunque el fallo hepático es la causa de muerte característica de este tóxico.

**Tu respuesta:** _pendiente_

## 81. ❌ Difiere del documento · `ENURM-2014-069` · salió en 2014

**El diagnóstico definitivo de enfisema pulmonar se realiza por medio de:**

- A) Historia clínica
- B) Historia clínica y examen físico
- C) Tomografia computarizada de torax  ← *publicada*
- D) Historia clínica, examen físico, radiografía de tórax  ← *documento*

**Especialidad:** neumologia · **Tema:** Enfisema: diagnóstico · **Archivo:** `revision/lote-n012.json`

> **Por qué se marca:** Difiere del documento. El documento marca historia, exploración y radiografía, que solo sugieren el enfisema; la tomografía computarizada es la que lo confirma in vivo (GOLD).

**Explicación publicada:** El enfisema es un diagnóstico anatómico (destrucción de las paredes alveolares). La tomografía computarizada de alta resolución es el estudio que lo confirma y cuantifica in vivo; la historia, la exploración y la radiografía solo lo sugieren. La espirometría confirma la EPOC.

**Tu respuesta:** _pendiente_

## 82. ⚠️ Duda · `ENURM-2014-070` · salió en 2014

**Un joven de 20 años, presenta evacuaciones liquidas con moco y estrías sanguinolentas, precedidas por cólicos de moderada intensidad que mejoran tras deposición, acompañada de tenesmo anal. El coprológico reporta abundante moco, leucocitos y glóbulos rojos. El hemograma es normal. ¿Cuál de las siguientes infestaciones debe sospecharse?**

- A) Entamoeba Coli
- B) Entamoeba Hystolitica  ← *documento y publicada (igual)*
- C) Salmonelosis
- D) Disenteria bacilar

**Especialidad:** infectologia · **Tema:** Amebiasis intestinal · **Archivo:** `revision/lote-n012.json`

> **Por qué se marca:** Los leucocitos abundantes en heces orientan más a disentería bacilar (opción D); en la amebiana suelen ser escasos. Confirmar la clave.

**Explicación publicada:** La diarrea con moco y sangre, cólicos y tenesmo, sin fiebre ni alteraciones del hemograma, en un adulto joven, sugiere colitis amebiana (Entamoeba histolytica). La pregunta habla de infestación por parásitos; Entamoeba coli no es patógena.

**Tu respuesta:** _pendiente_

## 83. ❌ Difiere del documento · `ENURM-2014-079` · salió en 2014

**En un paciente diagnosticado de meningitis bacteriana aguda, para administrar antibióticos se debe:**

- A) Determinar el germen causal por medio de cultivo  ← *documento*
- B) Realizar una punción lumbar
- C) Iniciar la administración de antibióticos según la clínica  ← *publicada*
- D) Realizar una tomografía axial computarizada

**Especialidad:** infectologia · **Tema:** Meningitis bacteriana: antibiótico empírico · **Archivo:** `revision/lote-n012.json`

> **Por qué se marca:** Difiere del documento. El documento marca determinar el germen por cultivo antes del antibiótico, pero en la meningitis bacteriana el tratamiento empírico se inicia de inmediato según la clínica (Mandell, IDSA).

**Explicación publicada:** Ante la sospecha de meningitis bacteriana el antibiótico se inicia de inmediato y de forma empírica según la clínica y la edad (ceftriaxona con vancomicina, más ampicilina si hay riesgo de Listeria). No se espera el cultivo ni la TC: se toman hemocultivos y, si es posible, punción lumbar sin retrasar el tratamiento.

**Tu respuesta:** _pendiente_

## 84. ⚠️ Duda · `ENURM-2014-085` · salió en 2014

**¿en cuál de los siguientes traumas, no se espera encontrar obstrucción de las vías aéreas superiores?**

- A) Heridas cervicales penetrantes
- B) Hematoma cervical
- C) Trauma facial  ← *documento y publicada (igual)*
- D) Quemadura de 3er grado

**Especialidad:** emergencias · **Tema:** Obstrucción de la vía aérea en trauma · **Archivo:** `revision/lote-n013.json`

> **Por qué se marca:** Según el ATLS el trauma maxilofacial sí causa obstrucción de la vía aérea; la pregunta es ambigua. Considerar reescribirla o retirarla.

**Explicación publicada:** El ATLS describe como causas de obstrucción de la vía aérea el traumatismo maxilofacial, las heridas y hematomas cervicales, el trauma laríngeo y las quemaduras de cara o vía aérea. Una quemadura de tercer grado lejos de la cara no compromete la vía aérea; un trauma facial menor tampoco. La clave del documento señala el trauma facial.

**Tu respuesta:** _pendiente_

## 85. ❌ Difiere del documento · `ENURM-2014-088` · salió en 2014

**¿Cuál es el método diagnóstico de elección en la úlcera péptica perforada?**

- A) Tomografía de abdomen
- B) Sonografia  ← *documento*
- C) Radiografía de torax  ← *publicada*
- D) Endoscopia digestiva

**Especialidad:** cirugia · **Tema:** Úlcera perforada: diagnóstico · **Archivo:** `revision/lote-n013.json`

> **Por qué se marca:** Difiere del documento. El documento marca la sonografía, pero el estudio inicial de elección para la úlcera perforada es la radiografía de tórax de pie (neumoperitoneo), con la TC como alternativa más sensible.

**Explicación publicada:** En la úlcera péptica perforada, la radiografía de tórax de pie muestra aire libre bajo el diafragma en el 75-80 % de los casos y es el estudio inicial clásico. La TC es la más sensible si la radiografía es negativa. La endoscopia está contraindicada.

**Tu respuesta:** _pendiente_

## 86. ❌ Difiere del documento · `ENURM-2014-097` · salió en 2014

**Paciente de 60 años de edad que se presenta con dolor en fosa iliaca izquierda, que se irradia a la región supra pubica y a la ingle izquierda. Presenta cambios en el ritmo intestinal, fiebre, escalofrio y urgencia urinaria. ¿Cuál es el diagnostico?**

- A) Apendicitis
- B) Adenocarcinoma de ciego
- C) Calculo renal  ← *documento*
- D) Diverticulitis  ← *publicada*

**Especialidad:** gastroenterologia · **Tema:** Diverticulitis · **Archivo:** `revision/lote-n013.json`

> **Por qué se marca:** Difiere del documento. El documento marca cálculo renal, pero el dolor en fosa ilíaca izquierda con fiebre, escalofríos y cambio del ritmo intestinal en un paciente de 60 años orienta a diverticulitis; el cólico renal no da fiebre ni cambios intestinales sin complicación.

**Explicación publicada:** Dolor en fosa ilíaca izquierda en un paciente mayor, con fiebre, escalofríos y cambio del ritmo intestinal, es diverticulitis sigmoidea; la inflamación cercana a la vejiga explica la urgencia urinaria.

**Tu respuesta:** _pendiente_

## 87. ❌ Difiere del documento · `ENURM-2014-098` · salió en 2014

**Paciente con historia clínica de pirosis de largo tiempo de evolución y regurgitación de alimentos digeridos de menos tiempo y disfagia ocasional. ¿Cuál de los siguientes es el diagnóstico más probable?**

- A) Acalasia
- B) Hernia hiatal  ← *publicada*
- C) divertículo esofágico  ← *documento*
- D) Ulcera péptica

**Especialidad:** gastroenterologia · **Tema:** Hernia hiatal y reflujo · **Archivo:** `revision/lote-n013.json`

> **Por qué se marca:** Difiere del documento. El documento marca divertículo esofágico, pero la pirosis de larga evolución con regurgitación de alimento digerido orienta a reflujo con hernia hiatal; el divertículo regurgita alimento no digerido.

**Explicación publicada:** La pirosis de larga evolución con regurgitación de alimentos ya digeridos y disfagia ocasional sugiere enfermedad por reflujo con hernia hiatal. La regurgitación de alimentos no digeridos es típica del divertículo de Zenker y de la acalasia.

**Tu respuesta:** _pendiente_

## 88. ❌ Difiere del documento · `ENURM-2015-042` · salió en 2015

**El estudio más sensible para diagnosticar miomatosis uterina es:**

- A) Tomografía axial computarizada
- B) Ecografía transvaginal  ← *documento*
- C) Resonancia magnética  ← *publicada*
- D) Biopsia endometrial

**Especialidad:** ginecologia-obstetricia · **Tema:** Miomas: imagen · **Archivo:** `revision/lote-n013.json`

> **Por qué se marca:** Difiere del documento. El documento marca la ecografía transvaginal, que es la prueba inicial; el estudio más sensible para los miomas es la resonancia magnética (Williams Ginecología).

**Explicación publicada:** La ecografía transvaginal es la prueba inicial de elección para los miomas por su disponibilidad y buena precisión. La resonancia magnética es el estudio más sensible y exacto para contar, medir y localizar los miomas, útil antes de la cirugía o la embolización.

**Tu respuesta:** _pendiente_

## 89. ❌ Difiere del documento · `ENURM-2016-070` · salió en 2016

**En el tratamiento de una crisis asmática aguda y grave se utiliza:**

- A) Aminofilina EV.
- B) Antibióticos orales.
- C) Prednisona oral.  ← *publicada*
- D) Agonista Beta 2, EV.  ← *documento*

**Especialidad:** neumologia · **Tema:** Crisis asmática grave · **Archivo:** `revision/lote-n013.json`

> **Por qué se marca:** Difiere del documento. El documento marca el betaagonista IV, que GINA no recomienda de rutina; de las opciones, el tratamiento indicado es el corticoide sistémico precoz, y la prednisona oral es tan eficaz como la IV.

**Explicación publicada:** En la crisis asmática grave GINA recomienda betaagonista de acción corta inhalado (nebulizado o con aerocámara), bromuro de ipratropio, oxígeno y corticoides sistémicos precoces: la prednisona oral es tan eficaz como la IV. Los betaagonistas IV y la aminofilina no se recomiendan de rutina.

**Tu respuesta:** _pendiente_

## 90. ❌ Difiere del documento · `ENURM-2018-024` · salió en 2018

**¿Cuál es la principal causa de muerte en niños provocada por accidentes?**

- A) Quemaduras  ← *documento*
- B) Broncoaspiración
- C) Ahogamiento  ← *publicada*
- D) Caídas durante juegos

**Especialidad:** pediatria · **Tema:** Muertes infantiles por accidentes · **Archivo:** `revision/lote-n013.json`

> **Por qué se marca:** Difiere del documento. El documento marca las quemaduras, pero según la OMS el ahogamiento causa más muertes accidentales en niños que las quemaduras. Los traumatismos por tránsito, que no están entre las opciones, también encabezan la lista; confirmar la clave con los datos nacionales.

**Explicación publicada:** Según la OMS, el ahogamiento y los traumatismos por tránsito son las principales causas de muerte accidental en niños; el ahogamiento es la primera en muchos grupos de 1 a 4 años. Las quemaduras causan mucha morbilidad, pero menos muertes.

**Tu respuesta:** _pendiente_

## 91. ❌ Difiere del documento · `ENURM-2019-001` · salió en 2019

**El riesgo de transmisión a través de la lactancia materna en mujeres con infección crónica por VIH es de:**

- A) 15-30 %
- B) 10-15 %
- C) 20-25 %  ← *documento*
- D) 9-16 %  ← *publicada*

**Especialidad:** infectologia · **Tema:** VIH y lactancia materna · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** Difiere del documento. El documento marca 20-25 %, pero el riesgo de transmisión por lactancia en la infección crónica es de alrededor del 14 % (Dunn); la opción 9-16 % es la que lo contiene. Las cifras varían entre estudios y las opciones se solapan; confirmar la clave.

**Explicación publicada:** Sin tratamiento antirretroviral, el riesgo adicional de transmisión del VIH por la lactancia es de alrededor del 14 % en la mujer con infección crónica (establecida antes del embarazo) y de unos 29 % si la infección es reciente durante la lactancia (metaanálisis de Dunn). Con carga viral suprimida el riesgo es <1 %.

**Tu respuesta:** _pendiente_

## 92. ⚠️ Duda · `ENURM-2019-012` · salió en 2019

**Niño de 9 años con enrojecimiento doloroso de la espalda tras una jornada de playa; la piel blanquea a la presión y no hay ampollas. ¿Cuál es el diagnóstico?**

- A) Quemadura de primer grado  ← *documento y publicada (igual)*
- B) Quemadura de segundo grado profunda
- C) Quemadura de tercer grado
- D) Quemadura de segundo grado

**Especialidad:** cirugia · **Tema:** Quemadura de primer grado · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** El caso clínico original no está en el documento; se reconstruyó un enunciado coherente con la clave. Revisar el enunciado.

**Explicación publicada:** El eritema doloroso, sin ampollas, que blanquea a la presión, afecta solo la epidermis: es una quemadura de primer grado (como la solar). Cura en 3 a 7 días sin cicatriz.

**Tu respuesta:** _pendiente_

## 93. ⚠️ Duda · `ENURM-2019-013` · salió en 2019

**En un niño con quemadura solar de primer grado en la espalda, sin otros hallazgos, para el tratamiento se recomienda:**

- A) Manejo ambulatorio  ← *documento y publicada (igual)*
- B) Ingresar al hospital
- C) Antibiótico sistémicos
- D) Manejo quirúrgico

**Especialidad:** cirugia · **Tema:** Quemadura de primer grado: manejo · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** El caso clínico original no está en el documento; se reconstruyó un enunciado coherente con la clave. Revisar el enunciado.

**Explicación publicada:** La quemadura de primer grado se maneja de forma ambulatoria: analgésicos, compresas frías, hidratación de la piel y protección solar. No requiere antibióticos, ingreso ni cirugía.

**Tu respuesta:** _pendiente_

## 94. ⚠️ Duda · `ENURM-2019-018` · salió en 2019

**La aplicación profilaxis post mordida de un perro debidamente vacunado contra la rabia consiste en:**

- A) Aislamiento del paciente mordido
- B) Sacrificio animal
- C) Limpieza exhaustiva de la herida  ← *documento y publicada (igual)*
- D) Observar al animal

**Especialidad:** infectologia · **Tema:** Rabia: mordedura de perro vacunado · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** La observación del animal (opción D) también forma parte de la profilaxis; la pregunta admite dos respuestas.

**Explicación publicada:** Tras la mordedura de un perro debidamente vacunado lo primero e indispensable es lavar exhaustivamente la herida con agua y jabón por 15 minutos y aplicar antiséptico. Además, el perro se observa durante 10 días; si enferma, se inicia la profilaxis con vacuna e inmunoglobulina.

**Tu respuesta:** _pendiente_

## 95. ⚠️ Duda · `ENURM-2019-031` · salió en 2019

**Embarazada de 34 años con 12 semanas de gestación y antecedente de hipertensión arterial; en la consulta tiene 150/95 mmHg en dos tomas, proteinuria negativa y sin síntomas. ¿Cuál es el diagnóstico probable?**

- A) Hipertensión crónica y sobre eclampsia sobreañadida.
- B) Eclampsia
- C) Hipertensión gestacional
- D) Hipertensión crónica  ← *documento y publicada (igual)*

**Especialidad:** ginecologia-obstetricia · **Tema:** Hipertensión crónica en el embarazo · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** El caso clínico original no está en el documento; se reconstruyó un enunciado coherente con la clave. Revisar el enunciado.

**Explicación publicada:** La hipertensión diagnosticada antes del embarazo o antes de las 20 semanas, sin proteinuria ni daño de órganos, es hipertensión crónica.

**Tu respuesta:** _pendiente_

## 96. ⚠️ Duda · `ENURM-2019-036` · salió en 2019

**Embarazada de 32 semanas con sangrado vaginal rojo rutilante, indoloro, de inicio súbito; útero blando, no doloroso, y frecuencia cardíaca fetal normal. ¿Cuál de los siguientes es el diagnóstico probable?**

- A) Desprendimiento prematuro de placenta normalmente inserta
- B) Placenta previa  ← *documento y publicada (igual)*
- C) Vasa previa
- D) Rotura uterina

**Especialidad:** ginecologia-obstetricia · **Tema:** Placenta previa · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** El caso clínico original no está en el documento; se reconstruyó un enunciado coherente con la clave. Revisar el enunciado.

**Explicación publicada:** El sangrado rojo rutilante, indoloro, con útero blando en el tercer trimestre es típico de la placenta previa. El desprendimiento cursa con dolor e hipertonía uterina.

**Tu respuesta:** _pendiente_

## 97. ⚠️ Duda · `ENURM-2019-039` · salió en 2019

**Puérpera Rh negativa no sensibilizada (Coombs indirecto negativo) cuyo recién nacido es Rh positivo. ¿Cuáles son los pasos a seguir?**

- A) Pinzamiento del cordón umbilical después del cese de los latidos funiculares. Luego administrar inmunoglobulina anti D a la madre antes de las 72 horas de puerperio.
- B) Pinzamiento inmediato del cordón umbilical, luego administrar inmunoglobulina anti D a la madre antes de las 72 horas de puerperio.  ← *documento y publicada (igual)*
- C) Pinzamiento inmediato del cordón umbilical, luego administrar inmunoglobulina anti D al feto antes de las 72 horas de puerperio
- D) Pinzamiento inmediato del cordón umbilical, luego administrar inmunoglobulina anti D al feto antes de las 96 horas del puerperio.

**Especialidad:** ginecologia-obstetricia · **Tema:** Isoinmunización Rh: manejo en el parto · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** El caso clínico original no está en el documento; se reconstruyó el enunciado. Las guías actuales permiten el pinzamiento tardío también en la madre Rh negativa; revisar.

**Explicación publicada:** En la madre Rh negativa no sensibilizada con recién nacido Rh positivo se administra inmunoglobulina anti-D a la madre antes de las 72 horas posparto. Clásicamente se recomienda el pinzamiento inmediato del cordón para reducir el paso de sangre fetal a la madre.

**Tu respuesta:** _pendiente_

## 98. ⚠️ Duda · `ENURM-2019-041` · salió en 2019

**Mujer de 28 años con flujo vaginal grisáceo, homogéneo, con olor a pescado que aumenta tras el coito, sin prurito; pH vaginal de 5 y células clave en el examen en fresco. ¿Cuál es el diagnóstico probable?**

- A) Vaginosis bacteriana  ← *documento y publicada (igual)*
- B) Vaginitis por tricomonas
- C) Candidiasis vaginal
- D) Vaginitis atrófica

**Especialidad:** ginecologia-obstetricia · **Tema:** Vaginosis bacteriana · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** El caso clínico original no está en el documento; se reconstruyó un enunciado coherente con la clave. Revisar el enunciado.

**Explicación publicada:** Flujo gris homogéneo con olor a pescado, pH >4,5, prueba de aminas positiva y células clave cumplen los criterios de Amsel de la vaginosis bacteriana (Gardnerella vaginalis y anaerobios).

**Tu respuesta:** _pendiente_

## 99. ⚠️ Duda · `ENURM-2019-054` · salió en 2019

**Mujer de 45 años, obesa, con dolor en la planta del talón que es máximo con los primeros pasos de la mañana y mejora al caminar; dolor a la palpación de la inserción medial de la fascia en el calcáneo. ¿Cuál es su valoración inicial?**

- A) Fractura del hueso Calcáneo
- B) Gota
- C) Neoplasia
- D) Fascitis plantar  ← *documento y publicada (igual)*

**Especialidad:** ortopedia · **Tema:** Fascitis plantar · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** El caso clínico original no está en el documento; se reconstruyó un enunciado coherente con la clave. Revisar el enunciado.

**Explicación publicada:** El dolor en el talón con los primeros pasos de la mañana, que mejora al caminar y empeora tras estar de pie mucho tiempo, con dolor en la inserción de la fascia, es característico de la fascitis plantar.

**Tu respuesta:** _pendiente_

## 100. ⚠️ Duda · `ENURM-2019-056` · salió en 2019

**En los pacientes con fascitis plantar, ¿qué porcentaje aproximado tiene sobrepeso u obesidad?**

- A) 20 % o más
- B) 30 % o más
- C) 40 % o más
- D) 80 % o más  ← *documento y publicada (igual)*

**Especialidad:** ortopedia · **Tema:** Fascitis plantar y obesidad · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** El caso clínico original no está en el documento y la cifra exacta varía entre series (≈70-80 %); se reconstruyó el enunciado. Revisar enunciado y clave.

**Explicación publicada:** La obesidad es el principal factor de riesgo de la fascitis plantar. Diversas series describen sobrepeso u obesidad en la gran mayoría de los pacientes (alrededor del 70 al 80 %); la clave del documento da 80 % o más.

**Tu respuesta:** _pendiente_

## 101. ⚠️ Duda · `ENURM-2019-062` · salió en 2019

**Paciente con absceso cutáneo drenado y celulitis alrededor, con cultivo de Staphylococcus aureus resistente a meticilina adquirido en la comunidad, sensible a clindamicina. ¿Cuál tratamiento oral se utiliza?**

- A) Amoxicilina y clavulanico
- B) Azitromicina por alergia a la penicilina
- C) Clindamicina  ← *documento y publicada (igual)*
- D) Penicilina Benzatinica

**Especialidad:** infectologia · **Tema:** Absceso cutáneo por SARM · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** El caso clínico original no está en el documento; se reconstruyó un enunciado coherente con la clave (clindamicina). Revisar el enunciado.

**Explicación publicada:** Para las infecciones de piel por S. aureus resistente a meticilina adquirido en la comunidad, los antibióticos orales útiles son clindamicina, trimetoprim-sulfametoxazol y doxiciclina. Los betalactámicos (amoxicilina-clavulánico, penicilina) no cubren SARM y la azitromicina tiene mucha resistencia.

**Tu respuesta:** _pendiente_

## 102. ⚠️ Duda · `ENURM-2019-091` · salió en 2019

**La mamografía de cribado que se le realiza a mujeres de más de 40 años para prevenir el cáncer de mama. ¿Se debe hacer cada qué tiempo?**

- A) 6 meses
- B) 12 meses  ← *documento y publicada (igual)*
- C) 18 meses
- D) 24 meses

**Especialidad:** ginecologia-obstetricia · **Tema:** Mamografía de cribado: intervalo · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** La USPSTF 2024 recomienda la mamografía cada 24 meses (opción D) y otras guías cada 12; confirmar la clave.

**Explicación publicada:** El intervalo de la mamografía de cribado depende de la guía: la American Cancer Society y el ACOG recomiendan cada año de los 45 a los 54 años (opcional desde los 40), y la USPSTF 2024 cada dos años de los 40 a los 74. La clave del documento da cada 12 meses.

**Tu respuesta:** _pendiente_

## 103. ❌ Difiere del documento · `ENURM-2020-034` · salió en 2020

**¿Cuál es la discapacidad del desarrollo específicas entre los niños de 3-17 años más frecuente a nivel internacional?**

- A) Convulsiones en mayores de 12 meses
- B) Trastorno por déficit de atención con hiperactividad  ← *publicada*
- C) Autismo  ← *documento*
- D) Ceguera total

**Especialidad:** pediatria · **Tema:** Discapacidades del desarrollo · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** Difiere del documento. El documento marca el autismo, pero según los CDC la discapacidad del desarrollo más frecuente en niños de 3 a 17 años es el TDAH (≈9-10 % frente a ≈2,5-3 % del autismo).

**Explicación publicada:** Según las encuestas de los CDC (NHIS), la discapacidad del desarrollo más frecuente en niños de 3 a 17 años es el trastorno por déficit de atención con hiperactividad (≈9-10 %), seguido de las dificultades de aprendizaje y el autismo (≈2,5-3 %).

**Tu respuesta:** _pendiente_

## 104. ❌ Difiere del documento · `ENURM-2020-074` · salió en 2020

**Una mujer de 65 años va a consulta de emergencia por historia de pirosis y regurgitación, dolor torácico y disfagia, en ocasiones tos crónica, al examen físico el médico encontró obesidad abdominal, la señora se define como glotona. ¿Qué patología considera tiene esta señora?**

- A) Dispepsia  ← *documento*
- B) Coronariopatía
- C) Enfermedad por reflujo gastroesofágico  ← *publicada*
- D) Esofagitis infecciosa

**Especialidad:** gastroenterologia · **Tema:** Enfermedad por reflujo gastroesofágico · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** Difiere del documento. El documento marca dispepsia, pero la pirosis y la regurgitación con tos crónica, dolor torácico y disfagia en una paciente obesa definen la enfermedad por reflujo gastroesofágico.

**Explicación publicada:** Pirosis y regurgitación, con dolor torácico, disfagia y tos crónica, en una mujer obesa, son típicos de la enfermedad por reflujo gastroesofágico.

**Tu respuesta:** _pendiente_

## 105. ⚠️ Duda · `ENURM-2020-095` · salió en 2020

**Apolinar de 22 años de edad es oriundo de una zona rural de San Cristóbal es traído a la consulta de un hospital general, presentando un cuadro de dolor abdominal más acentuado en el hipocondrio derecho acompañado de fiebre. Al examen físico presenta hepatomegalia y en los análisis y estudios para clínicos nos trae un hemograma con una leucocitosis de 15,000 por 103/mm3, además ALT y AST están normales con una fosfatasa alcalina en 615 UI/L, un hemocultivo que reporta no crecimiento en 72 horas. Una Tomografía axial computarizada abdominal en la cual se visualiza una imagen tabicada con zona de contraste en el lóbulo derecho. Según los hallazgos y el cuadro clínico ¿Qué patología presenta Apolinar?**

- A) Enfermedad hidatídica
- B) Absceso Hepático piógeno
- C) Esquistosomiasis hepática
- D) Absceso Hepático amebiano  ← *documento y publicada (igual)*

**Especialidad:** infectologia · **Tema:** Absceso hepático amebiano · **Archivo:** `revision/lote-n014.json`

> **Por qué se marca:** La imagen tabicada orienta también a quiste hidatídico (opción A); confirmar la clave.

**Explicación publicada:** Un hombre joven de zona rural con fiebre, dolor en hipocondrio derecho, hepatomegalia, leucocitosis, fosfatasa alcalina elevada con transaminasas normales, hemocultivo negativo y una lesión en el lóbulo derecho sugiere absceso hepático amebiano. El absceso piógeno suele dar hemocultivos positivos y aparece en mayores con patología biliar.

**Tu respuesta:** _pendiente_

## 106. ❌ Difiere del documento · `ENURM-2021A-023` · salió en 2021-A

**El lactante se sienta solo y permanece sentado independientemente sin soporte, con la espalda recta a l edad de:**

- A) 12 meses
- B) 10 meses  ← *documento*
- C) 9 meses  ← *publicada*
- D) 8 meses

**Especialidad:** pediatria · **Tema:** Desarrollo motor: sedestación · **Archivo:** `revision/lote-n015.json`

> **Por qué se marca:** Difiere del documento. El documento marca 10 meses, pero la sedestación estable sin apoyo con la espalda recta se logra hacia los 8-9 meses (Nelson). Las tablas difieren entre 7 y 9 meses; las opciones C y D quedan cerca. Confirmar la clave.

**Explicación publicada:** El lactante se sienta sin apoyo de forma momentánea hacia los 6-7 meses y se mantiene sentado solo, estable y con la espalda recta hacia los 8-9 meses (Nelson).

**Tu respuesta:** _pendiente_

## 107. ⚠️ Duda · `ENURM-2021A-025` · salió en 2021-A

**Cuando el lactante pronuncia sus primeras palabras:**

- A) 9 meses
- B) 10 meses  ← *documento y publicada (igual)*
- C) 12 meses
- D) 14 meses

**Especialidad:** pediatria · **Tema:** Desarrollo del lenguaje: primeras palabras · **Archivo:** `revision/lote-n015.json`

> **Por qué se marca:** Muchas fuentes sitúan la primera palabra con significado a los 12 meses (opción C); confirmar la clave.

**Explicación publicada:** Hacia los 9-10 meses el niño dice «mamá» o «papá» con significado; hacia los 12 meses dice una a tres palabras. La clave del documento da 10 meses.

**Tu respuesta:** _pendiente_

## 108. ⚠️ Duda · `ENURM-2021A-038` · salió en 2021-A

**Las infecciones o infestaciones cutáneas más frecuentes en los niños de centro de cuidados infantil es e impétigo producido por:**

- A) Estreptococos del grupo A  ← *documento y publicada (igual)*
- B) Virus
- C) Salmonella
- D) Bacteria

**Especialidad:** pediatria · **Tema:** Impétigo · **Archivo:** `revision/lote-n015.json`

> **Por qué se marca:** Hoy S. aureus es la causa más frecuente del impétigo (Nelson), y no está entre las opciones; confirmar la clave.

**Explicación publicada:** El impétigo es la infección cutánea más frecuente en niños de guarderías. Lo causan Staphylococcus aureus (hoy la causa principal, sobre todo del ampolloso) y Streptococcus pyogenes (grupo A); la clave del documento señala el estreptococo del grupo A.

**Tu respuesta:** _pendiente_

## 109. ⚠️ Duda · `ENURM-2021A-066` · salió en 2021-A

**Trastorno en el que una parte del miocardio recibe un aporte insuficiente de sangre y oxígeno respecto a su demanda, casi siempre por aterosclerosis de las arterias coronarias epicárdicas. ¿Cuál de las siguientes respuestas se ajusta a esta descripción?**

- A) Cardiopatía isquémica  ← *documento y publicada (igual)*
- B) Cardiopatía congénita
- C) Valvulopatía
- D) Arritmia

**Especialidad:** cardiologia · **Tema:** Cardiopatía isquémica: definición · **Archivo:** `revision/lote-n016.json`

> **Por qué se marca:** La descripción original no está en el documento; se reconstruyó un enunciado coherente con la clave. Revisar el enunciado.

**Explicación publicada:** La cardiopatía isquémica es el desequilibrio entre el aporte y la demanda de oxígeno del miocardio; su causa más frecuente es la aterosclerosis coronaria (Harrison).

**Tu respuesta:** _pendiente_

## 110. ❌ Difiere del documento · `ENURM-2021A-069` · salió en 2021-A

**Es la hepatopatía crónica más frecuente en muchas partes del mundo, incluido Estados Unidos:**

- A) Cirrosis hepática  ← *documento*
- B) Hígado graso  ← *publicada*
- C) Hepatitis viral
- D) Hipertensión portal

**Especialidad:** gastroenterologia · **Tema:** Hígado graso no alcohólico · **Archivo:** `revision/lote-n016.json`

> **Por qué se marca:** Difiere del documento. El documento marca la cirrosis, pero según Harrison la hepatopatía crónica más frecuente en muchas partes del mundo, incluido Estados Unidos, es el hígado graso no alcohólico.

**Explicación publicada:** La enfermedad por hígado graso no alcohólico (hoy enfermedad hepática esteatósica asociada a disfunción metabólica, MASLD) es la hepatopatía crónica más frecuente en muchas partes del mundo, incluido Estados Unidos (Harrison). La cirrosis es la etapa final de muchas hepatopatías, no una enfermedad en sí.

**Tu respuesta:** _pendiente_

## 111. ❌ Difiere del documento · `ENURM-2021A-087` · salió en 2021-A

**Un masculino de 50 años en su quinto día de post quirúrgico de una laparotomía abdominal de emergencia por traumatismo, presenta fiebre, la herida se observa eritematosa, al retirar algunas suturas cutáneas el cirujano evidencia secreción purulenta con un poco de sangre. ¿Cuál sería la causa probable?**

- A) Cuerpo extraño
- B) Infección del sitio quirúrgico  ← *publicada*
- C) Fistula entero cutáneo  ← *documento*
- D) Absceso Sub hepático

**Especialidad:** cirugia · **Tema:** Infección del sitio quirúrgico · **Archivo:** `revision/lote-n016.json`

> **Por qué se marca:** Difiere del documento. El documento marca fístula enterocutánea, pero la secreción purulenta en la herida al quinto día con eritema y fiebre es una infección del sitio quirúrgico; la fístula drena contenido intestinal.

**Explicación publicada:** Fiebre al quinto día posoperatorio con herida eritematosa y secreción purulenta al retirar puntos es una infección superficial del sitio quirúrgico. Se trata abriendo y drenando la herida.

**Tu respuesta:** _pendiente_

## 112. ⚠️ Duda · `ENURM-2021A-090` · salió en 2021-A

**Euclides de 60 años de edad, fue llevado a su consulta con historia de masa a nivel inguinal derecho, la cual se reduce de manera espontánea. Al examen físico se introduce dedo examinador por anillo inguinal profundo (interno) se le pide al paciente realizar maniobra de Valsalva y el contenido se palpa en el dorso de dedo. ¿Qué tipo de Hernia inguinal sugiere el examen físico que presenta el paciente?**

- A) Supra vesical
- B) Femoral
- C) Directa  ← *documento y publicada (igual)*
- D) Indirecta

**Especialidad:** cirugia · **Tema:** Exploración de la hernia inguinal · **Archivo:** `revision/lote-n016.json`

> **Por qué se marca:** Las descripciones de la maniobra varían entre textos (punta o dorso del dedo); confirmar la clave.

**Explicación publicada:** Al invaginar el escroto con el dedo hacia el anillo inguinal profundo y pedir maniobra de Valsalva, el impulso que golpea la punta del dedo sugiere hernia indirecta y el que golpea el dorso o pulpejo, hernia directa (a través del triángulo de Hesselbach). La exploración física es poco precisa para distinguirlas.

**Tu respuesta:** _pendiente_

## 113. ⚠️ Duda · `ENURM-2021B-049` · salió en 2021-B

**Proporción de lactantes protegidos de la influenza durante seis meses por lo menos cuando las madres reciben prenatal la vacuna contra la influenza:**

- A) 53%
- B) 43%
- C) 33%  ← *documento y publicada (igual)*
- D) 23%

**Especialidad:** pediatria · **Tema:** Vacuna materna contra la influenza · **Archivo:** `revision/lote-n017.json`

> **Por qué se marca:** La protección del lactante varía mucho entre estudios (≈30-60 %); confirmar la clave con la fuente del examen.

**Explicación publicada:** La vacunación contra la influenza en el embarazo protege a la madre y, por paso de anticuerpos, al lactante durante sus primeros 6 meses, cuando aún no puede vacunarse. La eficacia en el lactante varía entre estudios (de un tercio a más del 60 %); la clave del documento da 33 %.

**Tu respuesta:** _pendiente_

## 114. ⚠️ Duda · `ENURM-2021B-054` · salió en 2021-B

**Complicación médica más frecuente en el embarazo**

- A) Hipertensión arterial
- B) Cardiopatía
- C) Diabetes  ← *documento y publicada (igual)*
- D) Neumonía

**Especialidad:** ginecologia-obstetricia · **Tema:** Complicaciones médicas del embarazo · **Archivo:** `revision/lote-n017.json`

> **Por qué se marca:** Algunas fuentes consideran la hipertensión (opción A) igual o más frecuente; confirmar la clave.

**Explicación publicada:** Williams señala la diabetes como la complicación médica más frecuente del embarazo (sumando la gestacional y la pregestacional). Los trastornos hipertensivos también son muy frecuentes y en algunas series los superan.

**Tu respuesta:** _pendiente_

## 115. ⚠️ Duda · `ENURM-2021C-005` · salió en 2021-C

**¿Cuáles son los factores determinantes de la presión arterial?**

- A) Gasto cardiaco y volumen latido
- B) Fracción de eyección y resistencia vascular periférica
- C) Gasto cardiaco y resistencia vascular periférica  ← *documento y publicada (igual)*
- D) Frecuencia cardiaca y volumen sistólico

**Especialidad:** cardiologia · **Tema:** Determinantes de la presión arterial · **Archivo:** `revision/lote-n018.json`

> **Por qué se marca:** El enunciado original está incompleto en el documento; se reconstruyó a partir de las opciones. Revisar el enunciado.

**Explicación publicada:** La presión arterial media es el producto del gasto cardíaco por la resistencia vascular periférica (PA = GC × RVP).

**Tu respuesta:** _pendiente_

## 116. ❌ Difiere del documento · `ENURM-2021C-025` · salió en 2021-C

**Una causa muy frecuente de la infección de la vía respiratoria superior es debido a:**

- A) Virus  ← *publicada*
- B) Influenza
- C) Estafilococos
- D) Estreptococo del grupo A  ← *documento*

**Especialidad:** pediatria · **Tema:** Infección respiratoria alta: etiología · **Archivo:** `revision/lote-n018.json`

> **Por qué se marca:** Difiere del documento. El documento marca el estreptococo del grupo A, pero la causa más frecuente de las infecciones respiratorias altas son los virus; el estreptococo causa una minoría de las faringitis.

**Explicación publicada:** La gran mayoría de las infecciones de la vía respiratoria superior (resfriado común, faringitis, laringitis) son virales: rinovirus, coronavirus, adenovirus, VSR e influenza. El estreptococo del grupo A causa solo el 15-30 % de las faringitis en niños y el 5-15 % en adultos.

**Tu respuesta:** _pendiente_

## 117. ⚠️ Duda · `ENURM-2021C-048` · salió en 2021-C

**Embarazada de 38 semanas con dilatación de 3-4 cm, borramiento del 60-70 %, cuello blando, en posición anterior y la cabeza en −1 de De Lee. ¿Cuántos puntos aporta cada uno de estos parámetros al índice de Bishop?**

- A) 0
- B) 1
- C) 2  ← *documento y publicada (igual)*
- D) 3

**Especialidad:** ginecologia-obstetricia · **Tema:** Índice de Bishop · **Archivo:** `revision/lote-n018.json`

> **Por qué se marca:** En el documento la pregunta pide la clasificación total, que es 10 y no está entre las opciones; se reescribió para preguntar la puntuación de cada parámetro. Revisar.

**Explicación publicada:** En el índice de Bishop: dilatación 3-4 cm = 2; borramiento 60-70 % = 2; consistencia blanda = 2; posición anterior = 2; estación −1 = 2. Cada parámetro aporta 2 puntos y el total es 10, un cuello favorable para la inducción.

**Tu respuesta:** _pendiente_

## 118. ⚠️ Duda · `ENURM-2021C-092` · salió en 2021-C

**Esta condición ocurre cuando se fracturan tres o más costillas contiguas en al menos dos sitios. Puede s evidente el movimiento paradójico de este segmento en pacientes con ventilación espontánea, por la presión intrapleural negativa durante la inspiración.**

- A) Tórax paradójico
- B) Tórax inestable
- C) Tórax flácido  ← *documento y publicada (igual)*
- D) Síndrome torácico agudo

**Especialidad:** emergencias · **Tema:** Tórax inestable · **Archivo:** `revision/lote-n019.json`

> **Por qué se marca:** «Tórax inestable» (B) y «tórax flácido» (C) son sinónimos; la pregunta tiene dos respuestas correctas. Considerar reescribir las opciones.

**Explicación publicada:** El tórax inestable o flácido se produce cuando se fracturan varias costillas contiguas en dos o más sitios, creando un segmento que se mueve de forma paradójica con la respiración espontánea. Ambos nombres designan la misma lesión.

**Tu respuesta:** _pendiente_

## 119. ⚠️ Duda · `ENURM-2022A-021` · salió en 2021-C, 2022-A

**La sífilis no tratada durante el embarazo tiene una tasa de transmisión vertical de:**

- A) 80%
- B) 90%
- C) 95%
- D) Próximo al 100% .  ← *documento y publicada (igual)*

**Especialidad:** ginecologia-obstetricia · **Tema:** Sífilis: transmisión vertical · **Archivo:** `revision/lote-n019.json`

> **Por qué se marca:** La tasa depende del estadio: cerca del 100 % solo en la sífilis primaria y secundaria. Confirmar la clave.

**Explicación publicada:** En la sífilis primaria y secundaria no tratadas la transmisión vertical se acerca al 100 %; en la latente temprana es de un 40 % y en la tardía, menor del 10 %.

**Tu respuesta:** _pendiente_

## 120. ⚠️ Duda · `ENURM-2022A-025` · salió en 2022-A, 2022-D

**La enfermedad de VIH puede evitarse mediante:**

- A) Examen de laboratorio
- B) Tratamiento adecuado
- C) Fármacos profilácticos o vacunación  ← *documento y publicada (igual)*
- D) Seguimiento de cerca a los infectados

**Especialidad:** infectologia · **Tema:** Prevención del VIH · **Archivo:** `revision/lote-n020.json`

> **Por qué se marca:** La opción incluye la vacunación, que no existe para el VIH; solo la parte de fármacos profilácticos es correcta. Considerar reescribir la opción.

**Explicación publicada:** La infección por VIH puede prevenirse con fármacos profilácticos: profilaxis preexposición (tenofovir-emtricitabina o cabotegravir) y posexposición, además del preservativo y el tratamiento como prevención. No existe aún una vacuna eficaz contra el VIH.

**Tu respuesta:** _pendiente_

## 121. ⚠️ Duda · `ENURM-2022A-051` · salió en 2022-A, 2022-D

**De los siguientes rangos de dilatación cervical, identifique el que mejor represente el umbral del trabajo de parto activo en presencia de contracciones uterinas.**

- A) 3-5 cm  ← *documento y publicada (igual)*
- B) 2-3 cm
- C) 1-2 cm
- D) 0-2 cm

**Especialidad:** ginecologia-obstetricia · **Tema:** Trabajo de parto activo: umbral · **Archivo:** `revision/lote-n020.json`

> **Por qué se marca:** Las guías actuales sitúan el inicio de la fase activa en 6 cm, valor que no está entre las opciones. Considerar reescribir las opciones.

**Explicación publicada:** Clásicamente (Friedman) la fase activa empezaba con 3 a 5 cm de dilatación con contracciones regulares. Las guías actuales (ACOG 2014, OMS 2018, Williams 26.ª) sitúan el inicio de la fase activa en 6 cm.

**Tu respuesta:** _pendiente_

## 122. ⚠️ Duda · `ENURM-2022A-073` · salió en 2022-A

**Los coronavirus estacionales producen resfriados comunes, sobre todo a finales del otoño, en invierno y a principios de la primavera. ¿Qué porcentaje de los resfriados se atribuye a los coronavirus?**

- A) 5 a 15%
- B) 10 a 25%
- C) 15 a 35%  ← *documento y publicada (igual)*
- D) 20 a 45 %

**Especialidad:** infectologia · **Tema:** Coronavirus y resfriado común · **Archivo:** `revision/lote-n020.json`

> **Por qué se marca:** El enunciado original estaba incompleto en el documento; se reconstruyó con el texto que acompañaba a la pregunta anterior. Las cifras varían entre fuentes; confirmar la clave.

**Explicación publicada:** Los coronavirus estacionales causan alrededor del 10-15 % de los resfriados comunes en promedio, y hasta un 35 % en los picos estacionales. La clave del documento da 15 a 35 %. El rinovirus es la causa más frecuente.

**Tu respuesta:** _pendiente_

## 123. ❌ Difiere del documento · `ENURM-2022A-078` · salió en 2022-A

**¿Cuál de los siguientes valores es considerado punto de corte a partir del cual es diagnóstico de emergencia y urgencia hipertensiva?**

- A) 160/100 mmhg
- B) 140/90 mmhg  ← *documento*
- C) 170/110 mmHg
- D) 180/120 mmhg.  ← *publicada*

**Especialidad:** cardiologia · **Tema:** Crisis hipertensiva: definición · **Archivo:** `revision/lote-n020.json`

> **Por qué se marca:** Difiere del documento. El documento marca 140/90 mmHg, que es el umbral diagnóstico de hipertensión; la urgencia y la emergencia hipertensivas se definen por ≥180/120 mmHg (ACC/AHA 2017).

**Explicación publicada:** La urgencia y la emergencia hipertensivas se definen por una presión arterial ≥180/120 mmHg: sin daño agudo de órganos es urgencia y con daño es emergencia (ACC/AHA 2017).

**Tu respuesta:** _pendiente_

## 124. ⚠️ Duda · `ENURM-2022A-083` · salió en 2022-A

**Niño de 7 años presenta masa abdominal que atraviesa la línea media. El niño ha referido en algún momento a su madre dolor abdominal y presenta como antecedente anihidra. El diagnóstico es compatible con:**

- A) Neuroblastoma
- B) Tumor de Wilms  ← *documento y publicada (igual)*
- C) Hepatoma
- D) Hodking

**Especialidad:** pediatria · **Tema:** Tumor de Wilms y aniridia · **Archivo:** `revision/lote-n020.json`

> **Por qué se marca:** La masa que cruza la línea media sugiere neuroblastoma (A), mientras que la aniridia sugiere Wilms (B); el enunciado es contradictorio. Considerar reescribirlo.

**Explicación publicada:** La aniridia se asocia al tumor de Wilms (síndrome WAGR, deleción 11p13). El Wilms suele ser una masa en un flanco que no cruza la línea media; el neuroblastoma, en cambio, suele cruzarla.

**Tu respuesta:** _pendiente_

## 125. ⚠️ Duda · `ENURM-2022A-098` · salió en 2022-A

**¿Cuál es el estudio de elección para diagnóstico de litiasis vesicular?**

- A) Sonografía
- B) Colangiografía I.V
- C) Resonancia magnética
- D) Ecografía de abdomen superior  ← *documento y publicada (igual)*

**Especialidad:** cirugia · **Tema:** Litiasis vesicular: ecografía · **Archivo:** `revision/lote-n021.json`

> **Por qué se marca:** Las opciones A (sonografía) y D (ecografía) son la misma prueba; la pregunta tiene dos respuestas correctas.

**Explicación publicada:** La ecografía del abdomen superior es el estudio de elección para la litiasis vesicular: sensibilidad y especificidad mayores del 95 %, imagen ecogénica con sombra acústica posterior.

**Tu respuesta:** _pendiente_

## 126. ❌ Difiere del documento · `ENURM-2022A-100` · salió en 2021-B, 2022-A

**Paciente femenina de 40 años de edad, que, al servicio de emergencias, refiriendo que hace aproximadamente cinco a meses, presenta deposiciones líquidas y semi-pastosas, en ocasiones con presenc de sangre y flemas, acompañado en ocasiones de febrículas y fiebre de 39C, dolor abdominal, anorexia, astenia y pérdida de peso. Se tuvo en cuenta estudios de hematología, imagenología y endoscopia la cual sol se observó afectado al colon izquierdo, presentando lesiones discontinuas, edema de la mucosa, úlceras profundas, serpiginosas y visualización de orificios fistulosos. ¿Cuál de las siguientes opciones corresponde su diagnóstico?**

- A) Enfermedad de Crohn
- B) Colitis de Crohn.  ← *publicada*
- C) Colitis indeterminada
- D) Colitis ulcerosa  ← *documento*

**Especialidad:** gastroenterologia · **Tema:** Colitis de Crohn · **Archivo:** `revision/lote-n021.json`

> **Por qué se marca:** Difiere del documento. El documento marca colitis ulcerosa, pero las lesiones discontinuas, las úlceras serpiginosas profundas y las fístulas son de la enfermedad de Crohn; con afectación solo del colon se llama colitis de Crohn. Las opciones A y B describen la misma enfermedad; considerar reescribir las opciones.

**Explicación publicada:** Lesiones discontinuas, úlceras profundas y serpiginosas, edema de la mucosa y orificios fistulosos son característicos de la enfermedad de Crohn; si solo afecta al colon se denomina colitis de Crohn. La colitis ulcerosa es continua, desde el recto, con úlceras superficiales y sin fístulas.

**Tu respuesta:** _pendiente_

## 127. ⚠️ Duda · `ENURM-2022B-094` · salió en 2022-B

**La mamografía de cribado que se le realiza a mujeres asintomáticas de más de 40 año para prevenir el cáncer de mama, se debe realizar cada que tiempo:**

- A) 6 meses
- B) 12 meses  ← *documento y publicada (igual)*
- C) 18 meses
- D) 24 meses

**Especialidad:** ginecologia-obstetricia · **Tema:** Mamografía de cribado: intervalo · **Archivo:** `revision/lote-n022.json`

> **Por qué se marca:** La USPSTF 2024 recomienda cada 24 meses (opción D); confirmar la clave.

**Explicación publicada:** El intervalo de la mamografía de cribado varía según la guía: anual en las recomendaciones del ACOG y la American Cancer Society (45-54 años, opcional desde los 40) y bienal en la USPSTF 2024 (40-74 años). La clave del documento da 12 meses.

**Tu respuesta:** _pendiente_

## 128. ❌ Difiere del documento · `ENURM-2022B-095` · salió en 2019, 2022-B

**Un masculino de 42 años en su 3er día de post quirúrgico de una laparotomía abdominal de control de daño, presenta fiebre, la herida se observa eritematosa, al retirar algunas suturas cutáneas el cirujano evidencia secreción purulenta con un poco de sangre. Cuál sería la causa probable?**

- A) Cuerpo extraño
- B) Infección del sitio quirúrgico  ← *publicada*
- C) Fistula entero cutáneo  ← *documento*
- D) Absceso Sub hepático

**Especialidad:** cirugia · **Tema:** Infección del sitio quirúrgico · **Archivo:** `revision/lote-n022.json`

> **Por qué se marca:** Difiere del documento. El documento marca fístula enterocutánea, pero la salida de pus por la herida con eritema y fiebre es una infección del sitio quirúrgico; la fístula drena contenido intestinal.

**Explicación publicada:** Fiebre con herida eritematosa y salida de pus con algo de sangre al retirar puntos tras una laparotomía es una infección superficial del sitio quirúrgico; se abre y drena la herida.

**Tu respuesta:** _pendiente_

## 129. ❌ Difiere del documento · `ENURM-2022C-035` · salió en 2022-C

**Las mujeres embarazadas se pueden clasificar de alto riesgo por:**

- A) Nivel escolaridad  ← *documento*
- B) Historia clínica  ← *publicada*
- C) Estado socio-económico
- D) Nacionalidad

**Especialidad:** ginecologia-obstetricia · **Tema:** Embarazo de alto riesgo · **Archivo:** `revision/lote-n023.json`

> **Por qué se marca:** Difiere del documento. El documento marca el nivel de escolaridad, pero la clasificación de alto riesgo se basa en la historia clínica (antecedentes obstétricos y médicos y hallazgos del embarazo actual).

**Explicación publicada:** Las embarazadas se clasifican de alto riesgo según la historia clínica: antecedentes obstétricos (abortos, pretérmino, cesáreas, preeclampsia), enfermedades maternas y hallazgos del embarazo actual. La escolaridad y el nivel socioeconómico son factores sociales que se consideran, pero no definen la clasificación.

**Tu respuesta:** _pendiente_

## 130. ⚠️ Duda · `ENURM-2022C-040` · salió en 2022-C

**En países en vías de desarrollo la causa más importante de diarrea aguda es debida a:**

- A) Shigella
- B) Salmonellas
- C) Virus
- D) Echerichia coli enteropatógeno  ← *documento y publicada (igual)*

**Especialidad:** pediatria · **Tema:** Diarrea aguda en países en desarrollo · **Archivo:** `revision/lote-n023.json`

> **Por qué se marca:** Según la OMS el rotavirus (opción C) es la causa principal de diarrea grave en niños de países en desarrollo; confirmar la clave.

**Explicación publicada:** En países en desarrollo la diarrea aguda infantil se debe sobre todo a rotavirus (la causa principal de diarrea grave) y a Escherichia coli diarreogénica (enterotoxigénica y enteropatógena), la principal causa bacteriana. La clave del documento señala E. coli enteropatógena.

**Tu respuesta:** _pendiente_

## 131. ⚠️ Duda · `ENURM-2022C-061` · salió en 2022-C, 2022-D

**Manuel, 26 años, diabético tipo 1 acude a la consulta por un cuadro de vómitos, evacuaciones diarreicas y acuosas acompañadas de fiebre de 39 grados y deshidratación moderada. ¿Cuál podría ser el patógeno que este causando el cuadro clínico en este paciente?**

- A) Rotavirus  ← *documento y publicada (igual)*
- B) Astrovirus
- C) Giardia lamblia
- D) Salmonella typhi

**Especialidad:** infectologia · **Tema:** Gastroenteritis aguda en adultos · **Archivo:** `revision/lote-n023.json`

> **Por qué se marca:** En adultos el rotavirus es una causa poco frecuente; ninguna opción es claramente la más probable. Considerar reescribir la pregunta.

**Explicación publicada:** Vómitos, diarrea acuosa, fiebre y deshidratación en un adulto sugieren gastroenteritis aguda infecciosa (viral o por Salmonella no tifoidea). La clave del documento señala el rotavirus, que en adultos es menos frecuente que el norovirus.

**Tu respuesta:** _pendiente_

## 132. ❌ Difiere del documento · `ENURM-2022C-081` · salió en 2022-C

**Femenina de 22 años edad, viene a la consulta por una masa, no dolorosa, en la ingle derecha de tres meses de evolución. ¿Cuál es el diagnóstico más probable en esta paciente?**

- A) Hernia inguinal incisional
- B) Hernia inguinal directa  ← *documento*
- C) Hernia deslizada
- D) Hernia femoral  ← *publicada*

**Especialidad:** cirugia · **Tema:** Masa inguinal en mujer joven · **Archivo:** `revision/lote-n023.json`

> **Por qué se marca:** Difiere del documento. El documento marca hernia directa, que es propia de hombres mayores y rara en mujeres jóvenes; entre las opciones la femoral es la más probable en una mujer. La respuesta más probable (hernia inguinal indirecta) no está entre las opciones; se publicó la más cercana. Considerar reescribir las opciones.

**Explicación publicada:** En una mujer joven con masa inguinal no dolorosa la hernia más frecuente es la inguinal indirecta, que no está entre las opciones. La hernia femoral es mucho más frecuente en mujeres que en hombres; la directa es propia de hombres mayores. De las opciones, la femoral es la más probable.

**Tu respuesta:** _pendiente_

## 133. ⚠️ Duda · `ENURM-2022C-084` · salió en 2022-C

**Femenina de 35 años edad, viene a emergencia luego de explosión de tanque de gas en la cocina de su casa, presenta quemaduras de segundo grado superficial y profundas en 2/3 de la extremidad superior derecha, 1/2 del tronco anterior. ¿Cuál es el % de superficie corporal quemada en esta paciente?**

- A) 18 % SCTQ
- B) 20 % SCTQ
- C) 24% SCTQ  ← *documento y publicada (igual)*
- D) 30% SCTQ

**Especialidad:** cirugia · **Tema:** Superficie corporal quemada · **Archivo:** `revision/lote-n023.json`

> **Por qué se marca:** Con «1/2 del tronco anterior» el cálculo da 15 %, que no está entre las opciones; la clave (24 %) solo se obtiene tomando la mitad del tronco completo. Revisar el enunciado.

**Explicación publicada:** Con la regla de los nueve, 2/3 del miembro superior derecho (9 %) son 6 %. Si «la mitad del tronco» se interpreta como la mitad del tronco completo (anterior y posterior, 36 %), son 18 % y el total es 24 %; si es la mitad del tronco anterior (18 %), son 9 % y el total sería 15 %, valor que no está entre las opciones.

**Tu respuesta:** _pendiente_

## 134. ⚠️ Duda · `ENURM-2023-011` · salió en 2023

**Gammapatía monoclonal benigna:**

- A) Macroglobulinemia de Waldenstrom
- B) Síndrome crónico aglutininas frías  ← *documento y publicada (igual)*
- C) Mieloma múltiple
- D) . Amiloidosis

**Especialidad:** hematologia · **Tema:** Gammapatías monoclonales · **Archivo:** `revision/lote-n024.json`

> **Por qué se marca:** La gammapatía monoclonal «benigna» por excelencia es la MGUS, que no está entre las opciones. Confirmar la clave.

**Explicación publicada:** La enfermedad crónica por aglutininas frías se debe a una IgM monoclonal (generalmente kappa) producida por un clon B de bajo grado, de curso benigno en la mayoría. Waldenström, mieloma y amiloidosis son gammapatías malignas o con daño de órganos.

**Tu respuesta:** _pendiente_

## 135. ⚠️ Duda · `ENURM-2023-013` · salió en 2023

**Tomando en cuenta que el riñón es la principal vía de eliminación de los fármacos, ¿cuál es la cantidad de fármacos que se excreta vía renal de manera inalterada para todos los fármacos administrados en el humano?**

- A) 5-10%
- B) 25-30%  ← *documento y publicada (igual)*
- C) 50-70%
- D) 80-90%

**Especialidad:** farmacologia · **Tema:** Excreción renal de fármacos · **Archivo:** `revision/lote-n024.json`

> **Por qué se marca:** La excreción renal inalterada varía mucho entre fármacos y no hay un valor único aceptado; confirmar la fuente de la clave.

**Explicación publicada:** La proporción de un fármaco que se excreta sin cambios por el riñón varía mucho (de casi 0 a más del 90 %). La clave del documento da 25-30 % como promedio; los fármacos con alta excreción renal inalterada requieren ajuste en la insuficiencia renal.

**Tu respuesta:** _pendiente_

## 136. ❌ Difiere del documento · `ENURM-2023-087` · salió en 2023

**Dentro de los microorganismos patogénicos que se aislan con más frecuencia de los dispositivos (prótesis) colocados a un paciente son:**

- A) Cándida albicans
- B) Estreptococo B- hemolítico del grupo A  ← *documento*
- C) Estafilococo coagulasa negativo  ← *publicada*
- D) Klebsiella Pneumoniae

**Especialidad:** infectologia · **Tema:** Infecciones de prótesis · **Archivo:** `revision/lote-n024.json`

> **Por qué se marca:** Difiere del documento. El documento marca el estreptococo del grupo A, causa rara de infección de dispositivos; los estafilococos coagulasa negativos son los más aislados por formar biopelículas.

**Explicación publicada:** Los estafilococos coagulasa negativos (S. epidermidis) son los gérmenes más aislados en las infecciones de prótesis y dispositivos por su capacidad de formar biopelículas.

**Tu respuesta:** _pendiente_

## 137. ⚠️ Duda · `ENURM-2024-017` · salió en 2024

**Órgano linfoide de la respuesta inmune y especifica:**

- A) Medula ósea
- B) Bazo
- C) Ganglios linfáticos  ← *documento y publicada (igual)*
- D) Placas de Peyer

**Especialidad:** ciencias-basicas · **Tema:** Órganos linfoides secundarios · **Archivo:** `revision/lote-n024.json`

> **Por qué se marca:** El bazo y las placas de Peyer también son órganos linfoides secundarios; la pregunta admite varias respuestas.

**Explicación publicada:** Los ganglios linfáticos son órganos linfoides secundarios donde se inicia la respuesta inmunitaria específica frente a antígenos llegados por la linfa.

**Tu respuesta:** _pendiente_

## 138. ⚠️ Duda · `ENURM-2024-020` · salió en 2024

**¿Cuál de estas alteraciones cromosómicas se presenta más frecuente en abortos?**

- A) Síndrome de Edwards
- B) Síndrome de Down
- C) Síndrome de Turner  ← *documento y publicada (igual)*
- D) Trisomía 16

**Especialidad:** ginecologia-obstetricia · **Tema:** Cromosomopatías en los abortos · **Archivo:** `revision/lote-n024.json`

> **Por qué se marca:** La trisomía 16 (opción D) es la trisomía más frecuente en abortos; según cómo se lea la pregunta, también es defendible.

**Explicación publicada:** Alrededor de la mitad de los abortos del primer trimestre tienen alteraciones cromosómicas. La monosomía X (síndrome de Turner, 45,X) es la anomalía cromosómica específica más frecuente; las trisomías en conjunto son el grupo más frecuente y entre ellas la trisomía 16.

**Tu respuesta:** _pendiente_

## 139. ⚠️ Duda · `ENURM-2024-038` · salió en 2024

**En el manejo de los líquidos en el dengue se debe evitar la hiperhidratación que puede contribuir a:**

- A) Disminución de la volemia
- B) Aumento de la diuresis
- C) Insuficiencia cardíaca  ← *documento y publicada (igual)*
- D) Edema generalizado

**Especialidad:** infectologia · **Tema:** Dengue: sobrehidratación · **Archivo:** `revision/lote-n025.json`

> **Por qué se marca:** El edema generalizado (opción D) también es consecuencia de la hiperhidratación; la OPS destaca sobre todo el edema pulmonar. Confirmar la clave.

**Explicación publicada:** En el dengue la hiperhidratación, sobre todo en la fase de reabsorción del plasma extravasado, puede causar edema pulmonar, derrames, insuficiencia respiratoria e insuficiencia cardíaca. Por eso los líquidos se ajustan al hematocrito, la diuresis y la clínica.

**Tu respuesta:** _pendiente_

## 140. ⚠️ Duda · `ENURM-2024-046` · salió en 2024

**La pérdida espontánea habitual (recurrente) del embarazo en parejas fértiles se define como:**

- A) 3 o más pérdidas consecutivas de embarazo de 20 semanas o menos de gestación  ← *documento y publicada (igual)*
- B) 3 o más pérdidas consecutivas de embarazo menor de 20 semanas en cualquier momento de la vida reproductiva
- C) 2 o más pérdidas consecutivas de embarazo menor de 20 semanas de gestación
- D) Pérdidas consecutivas de embarazo menor de 20 semanas de gestación

**Especialidad:** ginecologia-obstetricia · **Tema:** Pérdida gestacional recurrente · **Archivo:** `revision/lote-n025.json`

> **Por qué se marca:** Las guías actuales (ASRM) usan dos o más pérdidas (opción C); confirmar la clave.

**Explicación publicada:** Clásicamente el aborto habitual o recurrente se define como tres o más pérdidas consecutivas de embarazo de 20 semanas o menos. La ASRM considera estudiar a partir de dos o más pérdidas clínicas.

**Tu respuesta:** _pendiente_

## 141. ❌ Difiere del documento · `ENURM-2024-060` · salió en 2024

**Paciente de 21 años, primigesta, 40 semanas en labor de parto, sin complicaciones materna ni fetales; es ingresada en sala de preparto. Luego de comprobarse dilatación cerval completa y cérvix borrado y dilatado se traslada a sala de expulsivo en donde se asiste el parto, obteniéndose un recién nacido en buenas condiciones el cual es entregado al neonatólogo. Luego de la ligadura y sección del cordón umbilical aún falta asistir el alumbramiento. ¿En cuál etapa de la 3era fase del trabajo de parto está la paciente?**

- A) Primera etapa
- B) Segunda etapa  ← *documento*
- C) Tercera etapa  ← *publicada*
- D) Cuarta fase

**Especialidad:** ginecologia-obstetricia · **Tema:** Tercera etapa del trabajo de parto · **Archivo:** `revision/lote-n025.json`

> **Por qué se marca:** Difiere del documento. El documento marca la segunda etapa, pero tras el nacimiento y antes de la salida de la placenta la paciente está en la tercera etapa (alumbramiento) (Williams).

**Explicación publicada:** Tras el nacimiento y la sección del cordón, mientras falta la salida de la placenta, la paciente está en la tercera etapa del trabajo de parto (alumbramiento). La segunda etapa termina con la salida del feto.

**Tu respuesta:** _pendiente_

## 142. ⚠️ Duda · `ENURM-2024-071` · salió en 2024

**¿Cuál de los siguientes tipos de bebidas alcohólicas está asociado con más alta incidencia de carcinoma epidermoide de esófago?**

- A) Vino
- B) Ginebra
- C) Whisky  ← *documento y publicada (igual)*
- D) Cerveza

**Especialidad:** gastroenterologia · **Tema:** Alcohol y carcinoma epidermoide de esófago · **Archivo:** `revision/lote-n025.json`

> **Por qué se marca:** La asociación es con las bebidas destiladas en general; ginebra y whisky son ambas destiladas. Confirmar la clave.

**Explicación publicada:** El consumo de alcohol, sobre todo de bebidas destiladas de alta graduación (whisky y otros licores), se asocia al carcinoma epidermoide de esófago, con efecto sinérgico con el tabaco.

**Tu respuesta:** _pendiente_

## 143. ⚠️ Duda · `ENURM-2024-085` · salió en 2024

**Pregunta: Un paciente de 67 años se somete a una colecistectomía laparoscópica. Durante la cirugía, se observa una lesión en el conducto cístico. ¿Cuál de las siguientes acciones es la más apropiada en este escenario?**

- A) Ligadura del conducto cístico.
- B) Clampaje del conducto cístico.
- C) Colocación de un drenaje en el conducto cístico.
- D) Realizar una colangiografía intraoperatoria.  ← *documento y publicada (igual)*

**Especialidad:** cirugia · **Tema:** Lesión de la vía biliar en la colecistectomía · **Archivo:** `revision/lote-n025.json`

> **Por qué se marca:** Si la lesión es solo del conducto cístico identificado, basta ligarlo (opción A); la colangiografía se justifica si hay duda sobre la anatomía. Considerar reescribir el enunciado.

**Explicación publicada:** Si durante una colecistectomía se sospecha una lesión de la vía biliar, la colangiografía intraoperatoria define la anatomía y el alcance de la lesión antes de decidir la reparación. Un conducto cístico bien identificado se liga o clipa de forma habitual.

**Tu respuesta:** _pendiente_

## 144. ❌ Difiere del documento · `ENURM-2024-092` · salió en 2024

**¿Cuál de los siguientes factores de riesgo es el más frecuente para individuos que nunca han fumado?**

- A) Radón residencial  ← *publicada*
- B) Ambiente con humo de tabaco  ← *documento*
- C) Combustión de carbón y leña en interiores
- D) Factores virales: HPV 16 y 18

**Especialidad:** neumologia · **Tema:** Cáncer de pulmón en no fumadores · **Archivo:** `revision/lote-n025.json`

> **Por qué se marca:** Difiere del documento. El documento marca el humo de tabaco ambiental, pero según la EPA y la OMS el radón residencial es el principal factor de riesgo de cáncer de pulmón en quienes nunca han fumado. Algunas fuentes dan peso similar al humo de tabaco ambiental; confirmar la clave.

**Explicación publicada:** El radón residencial es el principal factor de riesgo de cáncer de pulmón en personas que nunca han fumado (EPA, OMS) y la segunda causa en la población general; el humo de tabaco ambiental y la combustión de biomasa también contribuyen.

**Tu respuesta:** _pendiente_

## 145. ⚠️ Duda · `ENURM-2024-096` · salió en 2024

**¿Cuál de las siguientes opciones es un factor de riesgo conocido para el desarrollo de cáncer de colon?**

- A) Envejecimiento  ← *documento y publicada (igual)*
- B) Actividad física regular
- C) Antecedentes familiares de poliposis adenomatosa
- D) Dieta baja en grasas

**Especialidad:** gastroenterologia · **Tema:** Cáncer de colon: factores de riesgo · **Archivo:** `revision/lote-n025.json`

> **Por qué se marca:** Los antecedentes familiares de poliposis adenomatosa (opción C) también son un factor de riesgo conocido; la pregunta tiene dos respuestas correctas.

**Explicación publicada:** La edad es el principal factor de riesgo del cáncer de colon: más del 90 % aparece después de los 50 años. Los antecedentes familiares de poliposis adenomatosa (PAF) también son factor de riesgo, de alto riesgo pero poco frecuente.

**Tu respuesta:** _pendiente_
