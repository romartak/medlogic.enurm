# Lote 001: 30 preguntas nuevas para confirmar

Borrador preparado para que **tú, como médico, confirmes cada respuesta antes de publicar**. Nada de esto está publicado.

- ✅ **20 confirmadas:** la respuesta del documento coincide con la que yo daría.
- ⚠️ **6 dudosas:** el enunciado o las opciones son ambiguos. Hay que decidir si se mantiene, se reescribe o se retira.
- ❌ **4 con discrepancia:** el documento marca una respuesta y yo propongo otra.

**Cómo decidir:** dime el número de cada pregunta y qué hacer: *aprobar*, *usar tu propuesta*, *mantener la del documento*, *reescribir* o *retirar*. Las aprobadas pasan a `data/banco/revision/` y se publican con `node scripts/build-bank.mjs`.

Mi redacción puede tener errores. En especial, las ❌ y las ⚠️ conviene contrastarlas con tu libro de referencia. Las fuentes citadas son los libros generales del banco, sin capítulo: el capítulo exacto hay que confirmarlo.

Los años salen de la recopilación. Una pregunta «High yield» salió en 2 o más exámenes distintos. Las de 2010 que aparecen dos veces en el mismo examen son un error de numeración del documento y no cuentan.

## ❌ Discrepo del documento (cambia la respuesta)

### 1. ❌ `ENURM-2007-014` · salió en 2007

**Coco Gram+ ordenados en paquetes irregulares que causan abscesos, infecciones piógenas (endocarditis osteomielitis) síndrome de choque toxico:**

- A) Clostridum botulinum
- B) Staphylococcus epidermidis
- C) Staphylococcus aureaus  ← *mi propuesta*
- D) Streptococcus pyogenes  ← *documento*

**Especialidad:** infectologia · **Tema:** Staphylococcus aureus

> El documento marca D (Streptococcus pyogenes), pero los cocos grampositivos en racimos que causan abscesos, endocarditis, osteomielitis y síndrome de choque tóxico son Staphylococcus aureus (C). Corrijo la respuesta a C.

**Explicación propuesta:** Staphylococcus aureus es un coco grampositivo que se agrupa en racimos («paquetes irregulares»), coagulasa positivo. Causa abscesos, infecciones piógenas, endocarditis, osteomielitis y síndrome de choque tóxico. Streptococcus pyogenes forma cadenas.

### 2. ❌ `ENURM-2009-014` · salió en 2009

**El siguiente ácido graso no esencial regula el metabolismo del colesterol:**

- A) Oleico  ← *mi propuesta*
- B) Palmitico  ← *documento*
- C) Araquidonico
- D) Omega 3

**Especialidad:** ciencias-basicas · **Tema:** Lípidos: ácidos grasos y colesterol

> El documento marca B (palmítico), pero el ácido palmítico es saturado y eleva el colesterol. El ácido graso no esencial que ayuda a regular el colesterol es el oleico (A). Corrijo a A. Confianza media: revisa la fuente original.

**Explicación propuesta:** El ácido oleico es un ácido graso monoinsaturado (omega-9) que el organismo puede sintetizar, por lo que no es esencial; sustituir grasas saturadas por oleico reduce el LDL-colesterol. El palmítico es saturado y eleva el colesterol, y el omega-3 y el araquidónico se consideran esenciales.

### 3. ❌ `ENURM-2013-010` · salió en 2013

**Durante el ensayo clínico de un nuevo fármaco, se incluye una muestra grande de pacientes, distribuidos al azar, con un diseño doble ciego y se busca evaluar su seguridad y eficacia. Esta fase corresponde a:**

- A) Fase aguda preclinica
- B) fase clínica 2  ← *documento*
- C) Fase clinica 1
- D) fase clínica 3  ← *mi propuesta*

**Especialidad:** farmacologia · **Tema:** Ensayos clínicos: fases

> El documento marca fase 2 (B), pero una muestra grande, aleatoria, doble ciego, que evalúa seguridad y eficacia corresponde a la fase 3 (D). Corrijo a D.

**Explicación propuesta:** Fase I: pocos voluntarios sanos, seguridad y farmacocinética. Fase II: grupo reducido de pacientes, eficacia preliminar y dosis. Fase III: muestra grande, aleatorizada, controlada y doble ciego, para confirmar la eficacia y la seguridad. Fase IV: vigilancia tras la comercialización.

### 4. ❌ `ENURM-2014-014` · salió en 2014

**Después de ejercitarse por una hora, ¿Cuál de los siguientes órganos experimenta los menores descensos en la presión sanguínea?**

- A) Intestinos
- B) Riñones  ← *documento*
- C) Cerebro  ← *mi propuesta*
- D) Páncreas

**Especialidad:** ciencias-basicas · **Tema:** Fisiología del ejercicio: flujo sanguíneo

> El enunciado dice «presión sanguínea» pero el concepto es el flujo sanguíneo. El documento marca riñones (B), que es de los territorios que más disminuyen; el cerebro conserva su flujo (C). Corrijo a C con confianza media: revisa la fuente original.

**Explicación propuesta:** Durante el ejercicio el flujo sanguíneo se redistribuye hacia el músculo esquelético y la piel y disminuye en los territorios esplácnicos (intestinos, hígado, páncreas) y en el riñón. El cerebro conserva su flujo por autorregulación, así que es el que menos disminuye.

## ⚠️ Dudosas: necesito tu decisión

### 5. ⚠️ `ENURM-2010-024` · salió en 2010

**Las propiedades anti-infecciosas de la leche maternal se basan en su contenido de:**

- A) Factores del complemento
- B) Abundante IgA  ← *documento y confirmada*
- C) Linfocitos B y T
- D) Todas las anteriores

**Especialidad:** pediatria · **Tema:** Lactancia materna: protección inmunológica

> Pregunta ambigua: la leche materna contiene IgA, linfocitos y complemento, así que «todas las anteriores» también es defendible. Recomiendo reescribirla («La inmunoglobulina más abundante de la leche materna es:») o retirarla. En el documento sale dos veces en 2010 (n.º 24 y 34).

**Explicación propuesta:** La leche materna protege al lactante con varios componentes: IgA secretora (la inmunoglobulina predominante), lactoferrina, lisozima, oligosacáridos, leucocitos (macrófagos y linfocitos) y pequeñas cantidades de complemento.

### 6. ⚠️ `ENURM-2010-025` · salió en 2010

**El dolor de la madre al amamantar por lo común se debe a:**

- A) Alteración de la piel del pezón o mala posición del niño al mamar.  ← *mi propuesta*
- B) Mala posición de la madre o del niño al mamar
- C) Tamaño excesivamente grande del niño
- D) Todas las anteriores  ← *documento*

**Especialidad:** pediatria · **Tema:** Lactancia materna: dolor al amamantar

> El documento marca D («todas las anteriores»), pero C («tamaño excesivamente grande del niño») no es una causa habitual de dolor y las opciones A y B se superponen. Propongo A (lesión del pezón o mala posición del niño). Confirma, reescribe o retira. Sale dos veces en 2010 (n.º 25 y 35).

**Explicación propuesta:** El dolor de la madre al amamantar se debe sobre todo a un mal agarre o mala posición del niño y a lesiones del pezón (grietas, irritación). Corregir la posición y el agarre suele resolverlo.

### 7. ⚠️ `ENURM-2010-028` · salió en 2010

**La sepsis temprana del recién nacido se produce debida a una infección por:**

- A) via trasplacentaria o por via ascendente  ← *mi propuesta*
- B) parto traumático
- C) Ruptura prematura de membranas
- D) Ay B son correctas  ← *documento*

**Especialidad:** pediatria · **Tema:** Sepsis neonatal temprana

> La clave del documento es D («A y B»), pero B («parto traumático») no es causa de sepsis temprana, y la ruptura prematura de membranas (C) es su principal factor de riesgo. Propongo A. Confirma, reescribe o retira. Sale dos veces en 2010 (n.º 28 y 38).

**Explicación propuesta:** La sepsis neonatal temprana (primeras 72 horas) se adquiere por transmisión vertical: por vía ascendente desde el canal vaginal (sobre todo con ruptura prematura de membranas o corioamnionitis), por vía transplacentaria o al pasar por el canal del parto.

### 8. ⚠️ `ENURM-2024-026` · salió en 2023, 2024 · 🔥 **High yield**

**Muchos de los fallecimientos ocurridos en los pacientes con fiebre hemorrágica por dengue se deben a:**

- A) Diagnóstico tardío
- B) Sobrehidratación  ← *documento y confirmada*
- C) Anemia
- D) Retraso en el tratamiento

**Especialidad:** infectologia · **Tema:** Dengue grave: causas de muerte

> Pregunta ambigua: A («diagnóstico tardío») y D («retraso en el tratamiento») son casi iguales y también son causas de muerte. Mantengo B (clave del documento, salió en 2023 y 2024). Recomiendo reescribirla («...se deben a un manejo inadecuado de los líquidos») o retirarla.

**Explicación propuesta:** En el dengue grave la mayoría de las muertes ocurren por choque no reconocido a tiempo y por un manejo inadecuado de líquidos: la reposición insuficiente deja al paciente en choque y la sobrehidratación produce edema pulmonar, derrame pleural y dificultad respiratoria.

### 9. ⚠️ `ENURM-2007-011` · salió en 2007

**Debido a las características de absorción de hierro, una forma correcta de administrarlo es:**

- A) En forma de sales férricas vía oral
- B) Por vía oral o intravenosa, pero nunca intramuscular
- C) En una sola dosis por vía intravenosa
- D) En forma de sales ferrosas por vía oral durante dos semanas  ← *documento y confirmada*

**Especialidad:** hematologia · **Tema:** Tratamiento con hierro

> Mantengo D por ser la menos mala, pero «durante dos semanas» es demasiado corto: el tratamiento dura meses. Sugiero reescribir D («...durante varios meses») o confirmar con la fuente original.

**Explicación propuesta:** El hierro se absorbe mejor en forma ferrosa (Fe2+) en el duodeno y el yeyuno proximal, por eso se administra como sales ferrosas (sulfato, fumarato, gluconato) por vía oral. El tratamiento debe mantenerse varios meses, hasta unos 3 meses después de normalizar la hemoglobina, para reponer los depósitos.

### 10. ⚠️ `ENURM-2014-021` · salió en 2014

**En relación con las convulsiones en un lactante hiponatrémico, estas ocurren por lo general:**

- A) Antes del tratamiento  ← *documento y confirmada*
- B) Posterior al tratamiento
- C) Durante el tratamiento
- D) Solo ocurren como secuela

**Especialidad:** pediatria · **Tema:** Hiponatremia en el lactante

> No pude confirmar esta clave con una fuente. La literatura describe convulsiones tanto al presentarse la hiponatremia como durante una corrección brusca. Pide la fuente original o retírala.

**Explicación propuesta:** Las convulsiones por hiponatremia se deben al edema cerebral cuando el sodio cae, sobre todo por debajo de 120 a 125 mEq/L y de forma rápida, y por lo general son la forma de presentación (antes del tratamiento). También pueden aparecer si se hidrata con soluciones hipotónicas o si el sodio cambia bruscamente.

## ✅ Confirmadas (la respuesta del documento es correcta)

### 11. ✅ `ENURM-2010-023` · salió en 2010

**El absceso cerebral es una infección del Sistema Nervioso Central de carácter:**

- A) Focal  ← *documento y confirmada*
- B) Difuso
- C) Meningeo
- D) Medular

**Especialidad:** infectologia · **Tema:** Absceso cerebral

> En el documento esta pregunta sale dos veces dentro del mismo examen 2010 (n.º 23 y 33): no es una repetición entre años.

**Explicación propuesta:** El absceso cerebral es una infección focal del parénquima: una colección de pus encapsulada en una zona localizada del encéfalo. Se diferencia de la meningitis y la encefalitis, que son difusas.

### 12. ✅ `ENURM-2010-029` · salió en 2010

**El diagnostico de septicemia del recien nacido se confirma mediante:**

- A) Cultivo de sangre/LCR.  ← *documento y confirmada*
- B) Cultivo de heces
- C) Hemograma
- D) Cultivo de orina

**Especialidad:** pediatria · **Tema:** Sepsis neonatal: diagnóstico

> Sale dos veces en 2010 (n.º 29 y 39), con la misma respuesta.

**Explicación propuesta:** La sepsis neonatal se confirma aislando el germen: el hemocultivo es el estándar de oro y, ante sospecha de meningitis, se agrega el cultivo de líquido cefalorraquídeo.

### 13. ✅ `ENURM-2010-099` · salió en 2010

**Los ruidos intestinales de lucha estan presentes en:**

- A) La obstrucción intestinal mecánica  ← *documento y confirmada*
- B) El ileo paralitico
- C) Trombosis mesenterica
- D) Pancreatitis aguda

**Especialidad:** cirugia · **Tema:** Obstrucción intestinal

> Sale dos veces en 2010 (n.º 99 y 100).

**Explicación propuesta:** En la obstrucción mecánica el intestino aumenta su peristaltismo para vencer el obstáculo y produce ruidos hidroaéreos aumentados, de tono metálico («ruidos de lucha»). En el íleo paralítico los ruidos disminuyen o desaparecen.

### 14. ✅ `ENURM-2011-056` · salió en 2010, 2011 · 🔥 **High yield**

**La relación existente entre el dorso del feto y uno de los flancos del abdomen materno es:**

- A) Situacion
- B) Orientación
- C) Presentación
- D) Posición  ← *documento y confirmada*

**Especialidad:** ginecologia-obstetricia · **Tema:** Estática fetal

> Salió en 2010 y en 2011: repetida entre exámenes.

**Explicación propuesta:** La posición fetal es la relación entre el dorso del feto y un lado (flanco) del abdomen materno: izquierda o derecha, anterior o posterior. No se debe confundir con la situación (eje del feto respecto al de la madre) ni con la presentación (parte fetal que se encaja en la pelvis).

### 15. ✅ `ENURM-2024-025` · salió en 2022-B, 2022-D, 2024 · 🔥 **High yield**

**La prevención primaria de la infección por rabia canina consiste en:**

- A) Vacunar mascota
- B) Evitar mascota
- C) Vacunación de todos los animales domésticos  ← *documento y confirmada*
- D) Bioseguridad en la manipulación en laboratorio de sangre de paciente con rabia

**Especialidad:** salud-publica · **Tema:** Rabia: prevención primaria

> Salió en 2022-B, 2022-D y 2024. La opción A (vacunar la mascota) es parcialmente correcta; mantengo la C por ser la más completa.

**Explicación propuesta:** La rabia humana se previene de raíz controlando la enfermedad en su reservorio: la vacunación sostenida de los animales domésticos (perros y gatos) es la medida de prevención primaria de mayor impacto. Vacunar a una sola mascota protege a ese animal, pero no corta la transmisión en la comunidad.

### 16. ✅ `ENURM-2024-044` · salió en 2022-C, 2024 · 🔥 **High yield**

**El lugar de implantación más frecuente es del embarazo ectópico es:**

- A) Trompas de Falopio  ← *documento y confirmada*
- B) Ovarios
- C) Abdomen
- D) Cérvix

**Especialidad:** ginecologia-obstetricia · **Tema:** Embarazo ectópico

> Salió en 2022-C y 2024.

**Explicación propuesta:** Más del 95 % de los embarazos ectópicos se implantan en la trompa de Falopio, sobre todo en su porción ampular. Los demás sitios (ovario, abdomen, cuello uterino) son raros.

### 17. ✅ `ENURM-2024-049` · salió en 2023, 2024 · 🔥 **High yield**

**¿En cuál de las siguientes arterias nace la arteria ovárica derecha?**

- A) Renal derecha
- B) Uterina derecha
- C) Aorta abdominal  ← *documento y confirmada*
- D) Tubárica

**Especialidad:** ciencias-basicas · **Tema:** Anatomía pélvica: arterias ováricas

> Salió en 2023 y 2024.

**Explicación propuesta:** Las arterias ováricas nacen de la cara anterior de la aorta abdominal, por debajo de las renales; la derecha nace directamente de la aorta, y la izquierda con frecuencia de la aorta o de la arteria renal izquierda. Descienden por el retroperitoneo hasta el ligamento suspensorio del ovario.

### 18. ✅ `ENURM-2024-055` · salió en 2013, 2024 · 🔥 **High yield**

**La hormona que se encuentra más elevada en la postmenopausia es:**

- A) FSH  ← *documento y confirmada*
- B) Progesterona
- C) Estrógenos
- D) Estradiol

**Especialidad:** ginecologia-obstetricia · **Tema:** Menopausia

> Salió en 2013 y 2024.

**Explicación propuesta:** Tras la menopausia, los folículos se agotan y los estrógenos caen. Sin la retroalimentación negativa de estrógenos e inhibina, la hipófisis aumenta la FSH (y la LH); la FSH elevada es el hallazgo hormonal característico.

### 19. ✅ `ENURM-2024-063` · salió en 2021-C, 2022-B, 2024 · 🔥 **High yield**

**Patología que se caracteriza por un inicio súbito de inflamación color rojo encendido en el rostro o las extremidades. Cuyas características distintivas son márgenes indurados bien definidos rápida progresión y dolor intenso.**

- A) Celulitis
- B) Piodermia
- C) Impétigo
- D) Erisipela  ← *documento y confirmada*

**Especialidad:** dermatologia · **Tema:** Erisipela

> Salió en 2021-C, 2022-B y 2024.

**Explicación propuesta:** La erisipela es una infección superficial de la dermis y de los vasos linfáticos, casi siempre por Streptococcus pyogenes. Se reconoce por su placa roja brillante, de bordes elevados, indurados y bien delimitados, con dolor y fiebre, en cara o piernas.

### 20. ✅ `ENURM-2024-064` · salió en 2021-B, 2022-B, 2024 · 🔥 **High yield**

**Enfermedad multiorgánica causada por una reacción autoinmunitaria a la infección por estreptococos del grupo A que se acompaña de carditis, artritis con nódulos subcutáneas eritema y corea menor**

- A) Lupus
- B) Fiebre reumática  ← *documento y confirmada*
- C) Síndromes antifosfolípidos
- D) Artritis reumatoide

**Especialidad:** reumatologia · **Tema:** Fiebre reumática

> Salió en 2021-B, 2022-B y 2024.

**Explicación propuesta:** La fiebre reumática es una complicación autoinmune tardía de la faringitis por estreptococo beta-hemolítico del grupo A. Sus manifestaciones mayores (criterios de Jones) son carditis, artritis migratoria, corea de Sydenham, eritema marginado y nódulos subcutáneos.

### 21. ✅ `ENURM-2024-065` · salió en 2022-B, 2024 · 🔥 **High yield**

**Trastorno hidroelectrolítico que se presenta en un 25% de los pacientes con pancreatitis aguda:**

- A) Hiponatremia
- B) Hiperkalemia
- C) Hipocalcemia  ← *documento y confirmada*
- D) Hipomagnesemia

**Especialidad:** gastroenterologia · **Tema:** Pancreatitis aguda: hipocalcemia

> Salió en 2022-B y 2024.

**Explicación propuesta:** En la pancreatitis aguda el calcio se une a los ácidos grasos liberados en la necrosis grasa (saponificación), y además hay hipoalbuminemia; por eso es frecuente la hipocalcemia, que además marca mayor gravedad.

### 22. ✅ `ENURM-2024-067` · salió en 2023, 2024 · 🔥 **High yield**

**Terapia de elección para el tratamiento de la sífilis temprana:**

- A) Penicilina G benzatínica 2.4 millones de unidades dosis única  ← *documento y confirmada*
- B) Penicilina VK 500 mg cada 6 horas por 14 días
- C) Ceftriaxona 2g al día por 21 días
- D) Azitromicina 1g dosis única

**Especialidad:** infectologia · **Tema:** Sífilis temprana: tratamiento

> Salió en 2023 y 2024.

**Explicación propuesta:** La sífilis temprana (primaria, secundaria y latente temprana) se trata con una dosis única de penicilina G benzatínica, 2,4 millones de unidades por vía intramuscular. En alérgicos se usa doxiciclina, y en embarazadas se desensibiliza.

### 23. ✅ `ENURM-2024-068` · salió en 2022-C, 2022-D, 2024 · 🔥 **High yield**

**Un paciente llego a consulta con anemia, se le realizo la prueba de Schilling, que reportó positivo, por lo que se determinó que la causa es por una absorción deficiente de:**

- A) Cobalamina  ← *documento y confirmada*
- B) Folato
- C) Hierro
- D) Zinc

**Especialidad:** hematologia · **Tema:** Anemia megaloblástica por déficit de B12

> Salió en 2022-C, 2022-D y 2024.

**Explicación propuesta:** La prueba de Schilling mide la absorción de vitamina B12 (cobalamina) marcada: primero sola y luego con factor intrínseco. Si es anormal, indica una absorción deficiente de cobalamina, como en la anemia perniciosa.

### 24. ✅ `ENURM-2007-017` · salió en 2007

**Para vigilancia epidemiológica de la meningitis bacteriana, una persona presenta fiebre y rigidez de nuca podemos decir que es un:**

- A) Caso confirmado
- B) Caso sospechoso  ← *documento y confirmada*
- C) Caso Probable
- D) Caso secundario

**Especialidad:** salud-publica · **Tema:** Vigilancia epidemiológica: definiciones de caso

> Confirmada con las definiciones de caso habituales; si tu programa usa otra definición, ajusta.

**Explicación propuesta:** En la vigilancia de la meningitis bacteriana, una persona con fiebre y rigidez de nuca cumple la definición de caso sospechoso: cuadro clínico compatible, sin confirmación de laboratorio. Será probable con un LCR sugestivo y confirmado con aislamiento del germen.

### 25. ✅ `ENURM-2008-008` · salió en 2008

**El asma bronquial es una contraindicación para la administración de:**

- A) Propanolol  ← *documento y confirmada*
- B) Atropina
- C) Isoproterenol
- D) Salbutamol

**Especialidad:** farmacologia · **Tema:** Betabloqueantes: contraindicaciones

**Explicación propuesta:** El propranolol es un betabloqueante no selectivo: al bloquear los receptores beta-2 de los bronquios provoca broncoconstricción, por eso está contraindicado en el asma.

### 26. ✅ `ENURM-2008-016` · salió en 2008

**Medicamento utilizado en la prevención y control de las convulsiones en pacientes con eclampsia y preeclampsia:**

- A) Fenitoina
- B) Sulfato de magnesio  ← *documento y confirmada*
- C) Bicarbonato de sódio
- D) Litio.

**Especialidad:** ginecologia-obstetricia · **Tema:** Preeclampsia y eclampsia: anticonvulsivante

**Explicación propuesta:** El sulfato de magnesio es el fármaco de elección para prevenir y controlar las convulsiones en la preeclampsia grave y la eclampsia. Hay que vigilar el reflejo patelar, la frecuencia respiratoria y la diuresis, y tener gluconato de calcio como antídoto.

### 27. ✅ `ENURM-2011-003` · salió en 2011

**El prolapso rectal es una complicacion frecuentemente encontrada en la:**

- A) Esquistosomiasis
- B) Teniasis
- C) Fasciolosis
- D) Tricocefalosis  ← *documento y confirmada*

**Especialidad:** infectologia · **Tema:** Tricocefalosis

**Explicación propuesta:** Trichuris trichiura (tricocéfalo) vive en el colon. En las infecciones masivas, sobre todo en niños desnutridos, causa diarrea con moco y sangre, anemia y prolapso rectal.

### 28. ✅ `ENURM-2011-004` · salió en 2011

**El Clostridium Perfringens produce una alfa-toxina responsable de la siguiente condición:**

- A) Tetanus
- B) Gangrena gaseosa  ← *documento y confirmada*
- C) Difteria
- D) Botulismo

**Especialidad:** infectologia · **Tema:** Clostridium perfringens

**Explicación propuesta:** Clostridium perfringens produce una alfa-toxina (lecitinasa o fosfolipasa C) que destruye las membranas celulares y causa mionecrosis o gangrena gaseosa.

### 29. ✅ `ENURM-2013-008` · salió en 2013

**Una paciente embarazada que presenta anemia microcitica-Hipocromica con 9 gramos de Hemoglobina, e tratamiento más adecuado debe ser:**

- A) inyección de eritropoyetina
- B) tabletas de sulfato Ferroso  ← *documento y confirmada*
- C) Suplemento de Acido Fólico
- D) inyecciones de hidroxicobalamina

**Especialidad:** ginecologia-obstetricia · **Tema:** Anemia en el embarazo

**Explicación propuesta:** Una embarazada con hemoglobina de 9 g/dL y anemia microcítica hipocrómica tiene una anemia ferropénica moderada. El tratamiento de primera línea es hierro oral (sulfato ferroso).

### 30. ✅ `ENURM-2014-016` · salió en 2014

**Los niveles elevados de alfafetoproteína en el 2do. Trimestre de embarazo están fuertemente asociado a**

- A) Síndrome de Down
- B) Síndrome de Edwards
- C) Espina bífida  ← *documento y confirmada*
- D) Síndrome de Patau

**Especialidad:** ginecologia-obstetricia · **Tema:** Tamizaje prenatal: alfafetoproteína

**Explicación propuesta:** La alfafetoproteína en suero materno se eleva en los defectos del tubo neural (espina bífida, anencefalia) y en defectos de la pared abdominal. En el síndrome de Down y en la trisomía 18 está baja o normal.
