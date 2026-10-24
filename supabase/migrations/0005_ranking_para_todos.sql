-- MedLogic ENURM: el ranking muestra a todas las cuentas activas, también a las recién creadas.
-- Seguro de ejecutar varias veces. Lo aplica el despliegue de producción en Vercel
-- (scripts/migrate.mjs) o puedes pegarlo en Supabase → SQL Editor.
--
-- Antes solo salía quien ya tenía preguntas respondidas y había subido su resumen: una cuenta nueva
-- (o cuyo resumen aún no se había subido) no aparecía ni para ella misma. Ahora:
--   1. Cada cuenta nueva entra al ranking desde que se registra (con 0), con su primer nombre e inicial.
--   2. Las cuentas que ya existían y no tienen fila se agregan una vez.
--   3. Las listas ya no exigen tener respuestas: se ordenan por el valor elegido y los de 0 quedan al final.

-- Nombre público corto: «Robinson Santos» → «Robinson S.»; con título se conserva el apellido: «Dra. Genao».
create or replace function public.nombre_corto(p_nombre text)
returns text
language sql
immutable
set search_path = ''
as $$
  with partes as (
    select regexp_split_to_array(btrim(coalesce(p_nombre, '')), '\s+') as p
  )
  select nullif(
    case
      when p[1] ~* '^dra?\.?$' and coalesce(p[2], '') <> '' then left(p[1], 4) || ' ' || left(p[2], 20)
      when coalesce(p[2], '') <> '' then left(p[1], 20) || ' ' || upper(left(p[2], 1)) || '.'
      else left(p[1], 20)
    end, '')
  from partes
$$;

revoke execute on function public.nombre_corto(text) from public, anon, authenticated;

-- Al registrarse: perfil y lugar en el ranking.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nombre text := left(coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'), 80);
begin
  insert into public.profiles (id, display_name)
  values (new.id, v_nombre)
  on conflict (id) do nothing;
  insert into public.leaderboard (user_id, display_name)
  values (new.id, public.nombre_corto(v_nombre))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Cuentas que ya existían sin fila en el ranking.
insert into public.leaderboard (user_id, display_name)
select u.id, public.nombre_corto(p.display_name)
from auth.users u
left join public.profiles p on p.id = u.id
where not exists (select 1 from public.leaderboard l where l.user_id = u.id)
on conflict (user_id) do nothing;

-- Lista del ranking (todo el país o una universidad). Cuenta a quien estuvo activo en los últimos 120 días.
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
    where l.updated_at > now() - interval '120 days'
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
    where l.updated_at > now() - interval '120 days'
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
    coalesce(round(sum(l.correct)::numeric / nullif(sum(l.answered), 0), 4), 0),
    round(avg(l.xp), 0)
  from public.leaderboard l
  where l.updated_at > now() - interval '120 days'
    and l.university is not null
    and l.university <> 'sin-decir'
  group by l.university
  having count(*) >= 3
  order by 5 desc
$$;

revoke execute on function public.ranking_lista(text, text, integer) from public, anon;
revoke execute on function public.ranking_mi_posicion(text) from public, anon;
revoke execute on function public.ranking_universidades() from public, anon;
grant execute on function public.ranking_lista(text, text, integer) to authenticated;
grant execute on function public.ranking_mi_posicion(text) to authenticated;
grant execute on function public.ranking_universidades() to authenticated;
