# Dudas para responder

Preguntas nuevas de la recopilación ENURM 2002-2024 que **están publicadas con el aviso «Respuesta por confirmar»**: la respuesta publicada difiere de la del documento o hay una duda sobre el enunciado o la respuesta. Las demás coinciden con el documento y con la bibliografía.

Hay **52** por confirmar. Para cada una dime qué hacer (*confirmar la publicada*, *usar la del documento*, *reescribir* o *retirar*).

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
