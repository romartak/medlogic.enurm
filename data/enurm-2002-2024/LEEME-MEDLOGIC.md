# Preguntas ENURM 2002-2024 para MedLogic

Entrega para el repositorio `romartak/medlogic.enurm`. Comparada con `origin/main` en el commit `0ca106f` (31 de octubre de 2026).

Fuente: `EXAMEN ENURM 2002-2024.pdf`, una recopilación que no es publicación oficial. Hay 2,652 entradas de 28 exámenes y 2,455 preguntas distintas.

## Archivos

| Archivo | Contenido |
|---|---|
| `enurm-2002-2024-por-anio.json` | Las 2,652 entradas, agrupadas por examen y con todos los campos. Es la fuente completa. |
| `nuevas-para-medlogic.json` | 1,320 preguntas distintas que MedLogic no tiene, sin avisos, con una sola entrada por grupo de repetidas. |
| `para-revisar.json` | 274 entradas con avisos, respuestas en conflicto o diferencias con MedLogic. |
| `enurm-2002-2024-por-anio.md` | La misma información en formato legible para personas. |

## Qué hacer en MedLogic

1. Empieza por `nuevas-para-medlogic.json`. No traigas `enurm-2002-2024-por-anio.json` completo, porque duplicarías preguntas.
2. Pasa cada pregunta nueva por el flujo de revisión de `data/banco/revision/` y `scripts/build-bank.mjs`: `build-bank` solo publica preguntas revisadas.
3. Asigna especialidad y tema a cada una. De las 1,320, 817 traen `specialty: null`, y el importador convierte una especialidad vacía en Medicina Interna. Las otras 503 traen la clasificación automática del banco de ENURMIA, que tiene errores conocidos.
4. No uses `para-revisar.json` sin revisar cada caso contra la bibliografía o el PDF.
5. Saca del documento lo que te sirva. En 2024, 98 de las 100 entradas traen su bibliografía en `referencia`, y unas 120 de 2008 a 2011 traen comentarios en `nota`.

## Límites de los datos

- **Las respuestas son las del documento y no están verificadas clínicamente.** Se leyeron del texto en rojo (2002-2023) y del recuadro negro (2024). No se dedujo ninguna.
- **El documento tiene errores.** La revisión de MedLogic ya corrigió 166 de 1,166 preguntas, cerca del 14 %, así que es razonable esperar errores parecidos en las nuevas.
- **Control disponible:** de las 693 preguntas comparables con el banco oficial de ENURMIA (2021 y 2022), 686 coinciden y 7 difieren. Esas 7 traen `difiere_del_banco_oficial`.
- **Las correcciones de MedLogic mandan.** `medlogic_difiere: true` (122 entradas) indica que el documento y MedLogic no dan la misma respuesta. Probablemente sea una corrección ya hecha, así que no la sobrescribas.
- **Las retiradas siguen retiradas.** `retirada_en_medlogic` y `grupo_retirado` marcan preguntas parecidas a las 84 que MedLogic retiró. Están fuera de `nuevas-para-medlogic.json`.
- **La detección de repetidas y de presencia en MedLogic es por parecido de texto.** Puede haber falsos positivos o negativos en preguntas casi iguales con casos clínicos distintos.

## Campos principales

| Campo | Significado |
|---|---|
| `id` | Examen y número, por ejemplo `ENURM-2021A-065`. Un sufijo `-2` indica un número repetido dentro del examen. |
| `opciones`, `respuesta`, `respuesta_texto` | Opciones por letra y la marcada en el documento. |
| `estado` | Cómo se leyó la respuesta: `marcada_rojo`, `marcada_rojo_parcial`, `marcada_rojo_desplazada`, `marcada_recuadro`, `sin_marca`, `varias_marcadas`. Queda vacío si la entrada no tiene opciones. |
| `grupo`, `repeticiones`, `aparece_en` | Grupo de repetidas y exámenes donde aparece. |
| `es_representante` | La entrada elegida para representar al grupo. |
| `conflicto_respuesta` | El grupo tiene respuestas distintas entre sus apariciones. |
| `en_medlogic`, `id_medlogic`, `grupo_en_medlogic` | Presencia en el banco publicado de MedLogic. |
| `en_banco_enurmia` | Pregunta equivalente en el banco oficial 2021-2022 de ENURMIA. |
| `revisar` | Lista de avisos; vacía si no se detectó ningún problema. |

## Problemas conocidos

- **Exámenes incompletos en el documento:** 2004 (65 entradas), 2005 (17) y 2006 (88). También faltan preguntas sueltas en 2002, 2003 y 2008.
- **ENURM 2022-B, pregunta 78:** no trae número en el documento y quedó pegada a la opción D de la 77. Se debe rehacer a mano desde el PDF.
- **ENURM 2010:** las preguntas 20 a 29 se repiten como 30 a 39, a veces con otra respuesta marcada. Dos preguntas llevan el número 18 por un error de numeración.
- **Sin respuesta marcada:** 29 entradas. Algunas no traen opciones porque el documento solo da la respuesta en texto.
- **`opcion_vacia`:** 34 entradas en las que el texto de dos opciones quedó unido en una sola.
