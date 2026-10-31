-- MedLogic ENURM: qué opción eligió cada persona en cada pregunta, para mostrar el porcentaje de la comunidad
-- («el 62 % pensó lo mismo que tú»). Seguro de ejecutar varias veces. Lo aplica el despliegue de producción
-- en Vercel (scripts/migrate.mjs) o puedes pegarlo en Supabase → SQL Editor.
--
-- Privacidad: nadie lee esta tabla directamente. La app solo recibe totales por opción de una función, nunca
-- quién eligió qué. Solo cuenta la PRIMERA respuesta de cada persona a cada pregunta (la que dio antes de ver
-- la explicación), y solo pueden aportar cuentas con sesión. Al borrar la cuenta se borran sus respuestas.

create table if not exists public.respuestas_preguntas (
  user_id uuid not null references auth.users (id) on delete cascade,
  pregunta text not null,
  opcion smallint not null,
  created_at timestamptz not null default now(),
  primary key (user_id, pregunta),
  constraint respuestas_preguntas_valores check (char_length(pregunta) between 1 and 40 and opcion between 0 and 5)
);

-- Para contar rápido las opciones de una pregunta.
create index if not exists respuestas_preguntas_conteo_idx on public.respuestas_preguntas (pregunta, opcion);

alter table public.respuestas_preguntas enable row level security;

-- Cada cuenta solo puede crear respuestas propias; no hay política de lectura ni de cambio (la primera respuesta es la que vale).
drop policy if exists "Respuesta propia: crear" on public.respuestas_preguntas;
create policy "Respuesta propia: crear" on public.respuestas_preguntas for insert to authenticated with check ((select auth.uid()) = user_id);

revoke all on public.respuestas_preguntas from anon, authenticated;
grant insert on public.respuestas_preguntas to authenticated;

-- Tope por cuenta: el banco tiene ~1.100 preguntas; esto frena a quien intente llenar la tabla con identificadores inventados.
create or replace function public.limitar_respuestas_preguntas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.respuestas_preguntas where user_id = new.user_id) >= 3000 then
    raise exception 'Demasiadas respuestas guardadas' using errcode = '54000';
  end if;
  return new;
end;
$$;

drop trigger if exists respuestas_preguntas_limite on public.respuestas_preguntas;
create trigger respuestas_preguntas_limite before insert on public.respuestas_preguntas
  for each row execute function public.limitar_respuestas_preguntas();

revoke execute on function public.limitar_respuestas_preguntas() from public, anon, authenticated;

-- Totales por opción de una pregunta. Lo puede pedir cualquiera (también quien no tiene cuenta): solo devuelve conteos.
create or replace function public.respuestas_de_pregunta(p_pregunta text)
returns table (opcion smallint, votos bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select r.opcion, count(*)::bigint
  from public.respuestas_preguntas r
  where r.pregunta = p_pregunta
  group by r.opcion
  order by r.opcion;
$$;

revoke all on function public.respuestas_de_pregunta(text) from public;
grant execute on function public.respuestas_de_pregunta(text) to anon, authenticated;
