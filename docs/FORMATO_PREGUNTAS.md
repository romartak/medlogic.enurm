# Formato del banco de preguntas

La plataforma acepta **CSV** o **JSON**. El importador es flexible: reconoce encabezados en español o en inglés, con o sin tildes y mayúsculas.

## Cómo se carga el banco

El banco se carga **una sola vez, por el mantenedor del proyecto**, y se publica con la web para todos los usuarios (los usuarios no suben preguntas):

```bash
npm run import:questions -- banco.csv
```

Esto valida el archivo, muestra los errores por fila y el conteo por año y especialidad, y genera `public/data/questions.json`. Al hacer commit de ese archivo, la web lo usa automáticamente. Mientras no exista, la plataforma usa las preguntas de muestra.

El script acepta varios archivos a la vez y opciones:

```bash
npm run import:questions -- 2018.csv 2019.csv 2020.json   # combina todos
npm run import:questions -- nuevas.csv --merge             # añade al banco existente
npm run import:questions -- banco.csv --base 1             # fuerza respuestas numéricas desde 1
```

## Campos

| Campo | Obligatorio | Encabezados aceptados | Notas |
| --- | --- | --- | --- |
| Enunciado | ✅ | `stem`, `pregunta`, `enunciado`, `question`, `caso` | |
| Opciones | ✅ (mín. 2) | Columnas `option_a`…`option_f`, `opcion_a`, `Opción A`, `a`…`f` — o un campo `options`/`opciones` | En JSON puede ser un arreglo, un objeto `{A: …}` o un arreglo de objetos `{ text, correct }`. En CSV también `A) uno \| B) dos`. Se eliminan prefijos como `a) `. |
| Respuesta | ✅ | `answer`, `respuesta`, `correcta`, `clave` | Letra (`A`–`F`), número o el texto exacto de la opción. Los números se detectan como base 1 o base 0 automáticamente (o con `--base`). |
| Año | | `year`, `año`, `anio`, `examen` | Se extrae el primer año de 4 dígitos (`"ENURM 2019"` → 2019). |
| Especialidad | | `specialty`, `especialidad`, `area`, `materia`, `categoria` | Se normaliza: `Gineco`, `GO`, `Obstetricia` → Ginecología y Obstetricia. Si no se reconoce, se crea una nueva. Sin valor → Medicina Interna. |
| Tema | | `topic`, `tema`, `subtema` | |
| Explicación | | `explanation`, `explicacion`, `justificacion`, `comentario` | Explicación general de la respuesta correcta. |
| Análisis por opción | | `optionExplanations` / `explicaciones` (arreglo en el orden de las opciones) o columnas `explicacion_a`, `explicacion_b`… | Por qué cada opción es correcta o incorrecta. Se muestra al estudiante cuando elige esa opción. |
| Fisiopatología | | `pathophysiology`, `fisiopatologia`, `mecanismo` | Procesos fisiológicos que explican la respuesta. |
| Puntos clave | | `keyPoints`, `puntos_clave`, `perlas` | Arreglo o lista separada por saltos de línea, `;` o `\|`. |
| Bibliografía | | `references`, `referencias`, `bibliografia` | Arreglo de textos u objetos `{ citation, doi, url, kind }`. El DOI se detecta solo y se enlaza a doi.org. |
| Referencia | | `reference`, `referencia`, `bibliografia`, `fuente` | |
| Dificultad | | `difficulty`, `dificultad` | `1/2/3` o `fácil/media/difícil`. |
| Etiquetas | | `tags`, `etiquetas` | Separadas por `,` `;` o `\|`. |
| Imagen | | `image`, `imagen` | URL (p. ej. un ECG en `public/img/`). |
| Apariciones | | `appearances`, `apariciones`, `veces` | Veces que salió la pregunta en los exámenes (entero de 1 a 50). Con 2 o más se marca como **High yield** y tiene su propio filtro. |
| Años en que salió | | `years`, `anios`, `años` | Lista de años de ENURM en que apareció (`2007;2015`). Con ellos se muestra «apareció en N de los 28 exámenes recopilados». |
| Id | | `id`, `codigo`, `numero` | Si falta se genera uno estable a partir del año y el enunciado, para que el progreso de los usuarios no se pierda al reimportar. |

### Especialidades reconocidas

`medicina-interna`, `cardiologia`, `neumologia`, `gastroenterologia`, `nefrologia`, `endocrinologia`, `infectologia`, `hematologia`, `neurologia`, `reumatologia`, `pediatria`, `ginecologia-obstetricia`, `cirugia`, `ortopedia`, `urologia`, `salud-publica`, `psiquiatria`, `dermatologia`, `farmacologia`, `emergencias`, `ciencias-basicas`, `oftalmologia-orl`, `etica`. Los alias están en `src/data/specialties.ts`.

## Ejemplo CSV

```csv
id,year,specialty,topic,stem,option_a,option_b,option_c,option_d,answer,explanation
2019-001,2019,Pediatría,Bronquiolitis,"¿Agente más frecuente de la bronquiolitis?",Adenovirus,Virus sincitial respiratorio,Rinovirus,Mycoplasma,B,"El VSR causa la mayoría de los casos."
```

Guarda el CSV en UTF-8 (en Excel: *Guardar como → CSV UTF-8*) para que las tildes se lean bien.

## Ejemplo JSON

```json
[
  {
    "id": "2019-001",
    "year": 2019,
    "specialty": "Pediatría",
    "topic": "Bronquiolitis",
    "stem": "¿Agente más frecuente de la bronquiolitis?",
    "options": ["Adenovirus", "Virus sincitial respiratorio", "Rinovirus", "Mycoplasma"],
    "answer": "B",
    "explanation": "El VSR causa la mayoría de los casos.",
    "optionExplanations": [
      "Incorrecta. El adenovirus causa una minoría de bronquiolitis, a veces graves (bronquiolitis obliterante).",
      "Correcta. El VSR causa la mayoría de los casos, con pico en menores de 6 meses.",
      "Incorrecta. El rinovirus es el segundo agente más frecuente.",
      "Incorrecta. Mycoplasma causa neumonía atípica en escolares, no bronquiolitis del lactante."
    ],
    "pathophysiology": "El virus infecta el epitelio de los bronquiolos: necrosis, edema de la submucosa y tapones de moco y detritos obstruyen la vía aérea pequeña…",
    "keyPoints": ["Tratamiento de soporte", "No usar broncodilatadores ni corticoides de rutina"],
    "references": [
      { "citation": "Ralston SL, et al. Clinical Practice Guideline: The Diagnosis, Management, and Prevention of Bronchiolitis. Pediatrics. 2014;134(5):e1474-e1502.", "doi": "10.1542/peds.2014-2742" }
    ]
  }
]
```

También se acepta `{ "questions": [...] }` o un objeto agrupado por año: `{ "2019": [...], "2020": [...] }`.
