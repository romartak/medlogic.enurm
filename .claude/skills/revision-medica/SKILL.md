---
name: revision-medica
description: "Revisa preguntas del banco del ENURM antes de publicarlas: verifica la respuesta correcta contra la bibliografía, la redacción del enunciado, las explicaciones por opción y el formato. Úsala al agregar, importar, corregir o auditar preguntas en data/banco o con npm run import:questions."
---

# Revisión médica de preguntas del banco

El banco es el núcleo del producto: una respuesta equivocada enseña mal a quien estudia. Esta revisión se hace pregunta por pregunta, nunca en bloque.

## Dónde está todo

- Formato de campos y ejemplos: `docs/FORMATO_PREGUNTAS.md` (léelo antes de importar).
- Banco original recopilado: `data/banco/original.json`.
- Revisiones por lote: `data/banco/revision/lote-NNN.json`. Cada entrada lleva el `id` de la pregunta original, la respuesta correcta (`a`, base 0: 0 = A), el motivo si la corrige (`rev`), la explicación (`ex`), el análisis por opción (`oe`), correcciones de enunciado u opciones (`fix`) y, si se retira, `drop` con el motivo. Los años y las apariciones no se escriben a mano: `node scripts/build-apariciones.mjs` los calcula desde la recopilación `data/enurm-2002-2024/` (28 exámenes) y desde las repeticiones retiradas («Repetida: es la misma pregunta que Q10_4»), y `build-bank.mjs` los publica. Una pregunta que salió en 2 o más exámenes queda marcada como High yield.
- Reconstruir el banco publicado: `node scripts/build-bank.mjs`.
- Informe de cambios: `docs/REVISION-RESPUESTAS.md` (corregidas y retiradas, con el motivo).

## Qué verificar en cada pregunta

1. **La respuesta marcada es la correcta según la bibliografía.** Si el documento original difiere, se corrige y se registra el motivo (ver el estilo de `docs/REVISION-RESPUESTAS.md`). Cuando la clave oficial y la bibliografía discrepan, se dice en la explicación.
2. **El enunciado tiene una sola respuesta defendible.** Si hay dos opciones igualmente correctas, o las opciones son causas cuando se pregunta por manifestaciones, se reescribe el enunciado o se retira la pregunta.
3. **Las opciones no se contradicen ni repiten** y tienen forma parecida (longitud y tipo), sin pistas gramaticales.
4. **La explicación dice por qué la correcta lo es y por qué cada incorrecta no lo es** (campo `oe`, una entrada por opción, comenzando con «Correcta:» o «Incorrecta:»).
5. **Datos numéricos y dosis** coinciden con la fuente citada; si hay guías que cambian con los años, indicar la edición.
6. **Fuente:** toda pregunta nueva o corregida cita su referencia (libro, guía, DOI). Sin fuente no se publica.
7. **Especialidad y tema** correctos y dentro de las especialidades reconocidas (`src/data/specialties.ts`).

## Cómo trabajar

- Revisa por lotes pequeños y deja el resultado en `data/banco/revision/`, no editando `original.json`.
- La pregunta que no se pueda salvar se retira con `"drop": "motivo"` en su entrada del lote, en vez de borrarla del original. Queda listada en `docs/REVISION-RESPUESTAS.md`.
- Después de cambiar un lote: `node scripts/build-apariciones.mjs && node scripts/build-bank.mjs`, `npm test` y `npm run build`.
- Las preguntas nuevas de la recopilación están en `data/enurm-2002-2024/nuevas-para-medlogic.json` (1.320, sin verificar). No se publican sin pasar por este flujo: cada una necesita especialidad, tema, respuesta confirmada con bibliografía y análisis por opción. Los casos con avisos están en `para-revisar.json`.
- Flujo de las preguntas nuevas: se verifica cada una contra la bibliografía. Las que tienen **alta confianza** (incluidas las correcciones claras de la respuesta del documento, con `rev` explicando el motivo) van a `data/banco/revision/lote-nNNN.json` y se publican con `node scripts/build-apariciones.mjs && node scripts/build-bank.mjs`. Las que tienen **dudas** (enunciado ambiguo, respuesta que no se puede confirmar, dos opciones defendibles) NO se publican: van a `data/banco/borradores/dudas-NNN.json` con `_veredicto` y `_nota` (por qué se duda), y `node scripts/build-dudas.mjs` genera `docs/dudas-para-responder.md` para repasarlas una por una con el médico. Al resolverse una duda, pasa a `revision/` (sin los campos `_`) o se retira. Los ids de las nuevas son `ENURM-2010-023` y se publican como `bq-2010-023`. Nunca se resuelve una duda sin el médico.
- Si dudas de una respuesta, no la publiques: déjala anotada para que la confirme el dueño (médico). No inventes referencias ni DOIs.
