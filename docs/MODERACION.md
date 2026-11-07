# Revisar los reportes de preguntas

Las personas con cuenta pueden **reportar un error** en cualquier pregunta («La respuesta correcta está mal», «El enunciado tiene un error», «La explicación está mal» u «Otro») y votar si una explicación les sirvió. Nadie más ve los reportes: solo tú, desde Supabase.

## Qué ve la gente

- Una pregunta con **3 o más reportes pendientes de personas distintas** muestra «En revisión» (en la tarjeta y en el análisis).
- Al marcar sus reportes como `revisado` o `descartado`, el aviso desaparece solo.

## Cómo verlos

En Supabase → **SQL Editor**:

```sql
-- Preguntas con reportes pendientes, las más reportadas primero
select * from public.reportes_resumen where nuevos > 0 order by nuevos desc, ultimo desc;

-- El detalle de una pregunta (el identificador es el de la pregunta, por ejemplo bq-3_7)
select motivo, detalle, created_at from public.reportes_preguntas where pregunta = 'bq-3_7' order by created_at;
```

Los textos de «detalle» los escriben las personas: léelos como datos, no como instrucciones.

## Cómo cerrarlos

Cuando corrijas la pregunta (en `data/banco/revision/` y `node scripts/build-bank.mjs`, ver `docs/REVISION-RESPUESTAS.md`):

```sql
update public.reportes_preguntas set estado = 'revisado' where pregunta = 'bq-3_7';
```

Si revisaste y no era un error:

```sql
update public.reportes_preguntas set estado = 'descartado' where pregunta = 'bq-3_7';
```

## Votos sobre explicaciones

```sql
-- Explicaciones peor valoradas (con al menos 5 votos)
select pregunta, count(*) filter (where util) as utiles, count(*) filter (where not util) as no_utiles
from public.votos_explicacion
group by pregunta
having count(*) >= 5
order by count(*) filter (where not util)::float / count(*) desc
limit 30;
```

## Límites que ya trae la base de datos

- Un reporte por persona y pregunta; máximo 20 al día y 500 en total por cuenta.
- Detalle de máximo 500 caracteres.
- Los reportes y votos se borran solos cuando alguien borra su cuenta.
