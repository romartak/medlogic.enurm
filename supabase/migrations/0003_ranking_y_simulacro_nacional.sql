-- MedLogic ENURM: ranking de estudiantes y simulacro nacional mensual.
-- Seguro de ejecutar varias veces. Lo aplica el despliegue de producción en Vercel
-- (scripts/migrate.mjs) o puedes pegarlo en Supabase → SQL Editor.
--
-- Privacidad: nadie lee estas tablas directamente. Las listas salen de funciones que solo
-- devuelven el primer nombre e inicial (o «Estudiante» si la persona no quiere salir con su nombre).

-- 1. Estadísticas públicas de cada estudiante (las sube la app al sincronizar).
create table if not exists public.leaderboard (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  show_name boolean not null default true,
  university text,
  answered integer not null default 0,
  correct integer not null default 0,
  minutes integer not null default 0,
  xp integer not null default 0,
  streak integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint leaderboard_valores check (
    (display_name is null or char_length(display_name) <= 40)
    and (university is null or char_length(university) <= 80)
    and answered between 0 and 500000
    and correct between 0 and answered
    and minutes between 0 and 1000000
    and xp between 0 and 20000000
    and streak between 0 and 5000
  )
);

alter table public.leaderboard enable row level security;

drop policy if exists "Ranking propio: leer" on public.leaderboard;
create policy "Ranking propio: leer" on public.leaderboard for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Ranking propio: crear" on public.leaderboard;
create policy "Ranking propio: crear" on public.leaderboard for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Ranking propio: actualizar" on public.leaderboard;
create policy "Ranking propio: actualizar" on public.leaderboard for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Ranking propio: borrar" on public.leaderboard;
create policy "Ranking propio: borrar" on public.leaderboard for delete to authenticated using ((select auth.uid()) = user_id);

drop trigger if exists leaderboard_touch on public.leaderboard;
create trigger leaderboard_touch before insert or update on public.leaderboard
  for each row execute function public.touch_updated_at();

revoke all on public.leaderboard from anon, authenticated;
grant select, insert, update, delete on public.leaderboard to authenticated;

-- Valor por el que se ordena: xp, preguntas, precisión (con 50+ respuestas) o minutos de estudio.
create or replace function public.ranking_valor(l public.leaderboard, orden text)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select case orden
    when 'answered' then l.answered::numeric
    when 'accuracy' then case when l.answered >= 50 then round(l.correct::numeric / l.answered, 4) else null end
    when 'minutes' then l.minutes::numeric
    else l.xp::numeric
  end
$$;

-- Lista del ranking (todo el país o una universidad). Solo cuenta a quien estudió en los últimos 120 días.
create or replace function public.ranking_lista(p_orden text default 'xp', p_universidad text default null, p_limite integer default 50)
returns table (posicion bigint, nombre text, universidad text, respondidas integer, acierto numeric, xp integer, minutos integer, racha integer, es_yo boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with base as (
    select l.*, public.ranking_valor(l, p_orden) as valor
    from public.leaderboard l
    where l.answered > 0
      and l.updated_at > now() - interval '120 days'
      and (p_universidad is null or l.university = p_universidad)
  )
  select
    rank() over (order by b.valor desc nulls last, b.answered desc) as posicion,
    case when b.show_name and b.display_name is not null then b.display_name else 'Estudiante' end as nombre,
    b.university,
    b.answered,
    case when b.answered > 0 then round(b.correct::numeric / b.answered, 4) else 0 end,
    b.xp,
    b.minutes,
    b.streak,
    b.user_id = (select auth.uid())
  from base b
  where b.valor is not null
  order by 1
  limit least(greatest(coalesce(p_limite, 50), 1), 100)
$$;

-- Mi posición en el país y en mi universidad.
create or replace function public.ranking_mi_posicion(p_orden text default 'xp')
returns table (posicion_pais bigint, total_pais bigint, posicion_universidad bigint, total_universidad bigint, universidad text)
language sql
stable
security definer
set search_path = ''
as $$
  with base as (
    select l.user_id, l.university, l.answered, public.ranking_valor(l, p_orden) as valor
    from public.leaderboard l
    where l.answered > 0 and l.updated_at > now() - interval '120 days'
  ),
  ranked as (
    select b.*,
      rank() over (order by b.valor desc nulls last, b.answered desc) as pos_pais,
      count(*) over () as tot_pais,
      rank() over (partition by b.university order by b.valor desc nulls last, b.answered desc) as pos_uni,
      count(*) over (partition by b.university) as tot_uni
    from base b
    where b.valor is not null
  )
  select r.pos_pais, r.tot_pais, r.pos_uni, r.tot_uni, r.university
  from ranked r
  where r.user_id = (select auth.uid())
$$;

-- Universidades ordenadas por XP promedio de sus estudiantes (solo con 3 o más, para no exponer a nadie).
create or replace function public.ranking_universidades()
returns table (universidad text, estudiantes bigint, respondidas bigint, acierto numeric, xp_promedio numeric)
language sql
stable
security definer
set search_path = ''
as $$
  select l.university, count(*), sum(l.answered),
    round(sum(l.correct)::numeric / nullif(sum(l.answered), 0), 4),
    round(avg(l.xp), 0)
  from public.leaderboard l
  where l.answered > 0
    and l.updated_at > now() - interval '120 days'
    and l.university is not null
    and l.university <> 'sin-decir'
  group by l.university
  having count(*) >= 3
  order by 5 desc
$$;

-- 2. Simulacro nacional: el mismo examen para todos cada mes; solo cuenta el primer intento.
create table if not exists public.simulacro_nacional (
  user_id uuid not null references auth.users (id) on delete cascade,
  edicion text not null,
  correctas integer not null,
  total integer not null,
  segundos integer not null,
  universidad text,
  created_at timestamptz not null default now(),
  primary key (user_id, edicion),
  constraint simulacro_nacional_valores check (
    edicion ~ '^[0-9]{4}-[0-9]{2}$'
    and total between 1 and 200
    and correctas between 0 and total
    and segundos between 0 and 14400
    and (universidad is null or char_length(universidad) <= 80)
  )
);

alter table public.simulacro_nacional enable row level security;

drop policy if exists "Simulacro propio: leer" on public.simulacro_nacional;
create policy "Simulacro propio: leer" on public.simulacro_nacional for select to authenticated using ((select auth.uid()) = user_id);
-- Solo se puede entregar la edición del mes en curso (hora de República Dominicana), y una sola vez (clave primaria).
drop policy if exists "Simulacro propio: entregar" on public.simulacro_nacional;
create policy "Simulacro propio: entregar" on public.simulacro_nacional for insert to authenticated
  with check ((select auth.uid()) = user_id and edicion = to_char(now() at time zone 'America/Santo_Domingo', 'YYYY-MM'));

revoke all on public.simulacro_nacional from anon, authenticated;
grant select, insert on public.simulacro_nacional to authenticated;

-- Resultado del país para una edición y mi percentil (qué porcentaje sacó menos que yo).
create or replace function public.simulacro_resultados(p_edicion text)
returns table (participantes bigint, promedio numeric, mejor integer, mis_correctas integer, total integer, percentil numeric, posicion bigint, promedio_universidad numeric, participantes_universidad bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with e as (select * from public.simulacro_nacional where edicion = p_edicion),
  yo as (select * from e where user_id = (select auth.uid()))
  select
    (select count(*) from e),
    (select round(avg(correctas::numeric / total) * 100, 1) from e),
    (select max(round(correctas::numeric / total * 100))::integer from e),
    yo.correctas,
    yo.total,
    case when (select count(*) from e) > 1
      then round((select count(*) from e where correctas::numeric / total < yo.correctas::numeric / yo.total)::numeric / ((select count(*) from e) - 1) * 100, 0)
      else null end,
    (select count(*) from e where correctas::numeric / total > yo.correctas::numeric / yo.total) + 1,
    (select round(avg(correctas::numeric / total) * 100, 1) from e where universidad = yo.universidad),
    (select count(*) from e where universidad = yo.universidad)
  from yo
$$;

revoke execute on function public.ranking_valor(public.leaderboard, text) from public, anon, authenticated;
revoke execute on function public.ranking_lista(text, text, integer) from public, anon;
revoke execute on function public.ranking_mi_posicion(text) from public, anon;
revoke execute on function public.ranking_universidades() from public, anon;
revoke execute on function public.simulacro_resultados(text) from public, anon;
grant execute on function public.ranking_lista(text, text, integer) to authenticated;
grant execute on function public.ranking_mi_posicion(text) to authenticated;
grant execute on function public.ranking_universidades() to authenticated;
grant execute on function public.simulacro_resultados(text) to authenticated;
