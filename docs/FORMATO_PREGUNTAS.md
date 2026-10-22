# Formato del banco de preguntas

La plataforma acepta **CSV** o **JSON**. El importador es flexible: reconoce encabezados en español o en inglés, con o sin tildes y mayúsculas.

## Dos formas de cargar preguntas

| Forma | Para quién | Cómo |
| --- | --- | --- |
| **Banco oficial** (se publica con la web, lo ven todos) | Mantenedores del proyecto | `npm run import:questions -- banco.csv` → genera `public/data/questions.json`. Haz commit de ese archivo. |
| **Importación local** (solo en ese navegador) | Cualquier usuario | Página **Importar preguntas** dentro de la app. Se guarda en IndexedDB. |

Si existen ambas, se combinan por `id` (la importada local gana). Mientras no haya ninguna, se usan las preguntas de muestra.

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
| Explicación | | `explanation`, `explicacion`, `justificacion`, `comentario` | Muy recomendada: es lo que más enseña. |
| Referencia | | `reference`, `referencia`, `bibliografia`, `fuente` | |
| Dificultad | | `difficulty`, `dificultad` | `1/2/3` o `fácil/media/difícil`. |
| Etiquetas | | `tags`, `etiquetas` | Separadas por `,` `;` o `\|`. |
| Imagen | | `image`, `imagen` | URL (p. ej. un ECG en `public/img/`). |
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
    "explanation": "El VSR causa la mayoría de los casos."
  }
]
```

También se acepta `{ "questions": [...] }` o un objeto agrupado por año: `{ "2019": [...], "2020": [...] }`.
