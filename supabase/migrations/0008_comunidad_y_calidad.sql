-- MedLogic ENURM: reportes de errores en preguntas, votos sobre las explicaciones, ligas semanales,
-- reto semanal entre universidades y compañero de estudio con código.
-- Seguro de ejecutar varias veces. Lo aplica el despliegue de producción en Vercel (scripts/migrate.mjs)
-- o puedes pegarlo en Supabase → SQL Editor.
--
-- Privacidad: nadie lee estas tablas directamente (no tienen políticas ni permisos para visitantes ni
-- cuentas). Todo pasa por funciones que validan quién llama y devuelven solo lo mínimo: conteos, primer
-- nombre e inicial, y el estado de estudio de tus compañeros. Al borrar la cuenta se borra todo lo suyo.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Reportes de errores en preguntas
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.reportes_preguntas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pregunta text not null,
  motivo text not null,
  detalle text,
  -- nuevo: pendiente de revisar · revisado: ya se corrigió · descartado: no era un error
  estado text not null default 'nuevo',
  created_at timestamptz not null default now(),
  unique (user_id, pregunta),
  constraint reportes_preguntas_valores check (
    char_length(pregunta) between 1 and 40
    and motivo in ('respuesta', 'enunciado', 'explicacion', 'otro')
    and (detalle is null or char_length(detalle) <= 500)
    and estado in ('nuevo', 'revisado', 'descartado')
  )
);

create index if not exists reportes_preguntas_pregunta_idx on public.reportes_preguntas (pregunta) where estado = 'nuevo';

alter table public.reportes_preguntas enable row level security;
revoke all on public.reportes_preguntas from anon, authenticated;

-- Resumen para quien administra (se mira en Supabase → Table Editor o SQL Editor). Con security_invoker, ninguna
-- cuenta de la app puede leerlo: solo el dueño del proyecto.
create or replace view public.reportes_resumen with (security_invoker = true) as
  select r.pregunta,
         count(*) as total,
         count(*) filter (where r.estado = 'nuevo') as nuevos,
         array_agg(distinct r.motivo) as motivos,
         max(r.created_at) as ultimo
  from public.reportes_preguntas r
  group by r.pregunta;

revoke all on public.reportes_resumen from anon, authenticated;

-- Reportar una pregunta: una vez por persona y pregunta, máximo 20 al día y 500 en total.
create or replace function public.reportar_pregunta(p_pregunta text, p_motivo text, p_detalle text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Inicia sesión para reportar' using errcode = '28000';
  end if;
  if coalesce(char_length(p_pregunta), 0) not between 1 and 40 or coalesce(p_motivo, '') not in ('respuesta', 'enunciado', 'explicacion', 'otro') then
    raise exception 'Reporte no válido' using errcode = '22023';
  end if;
  if (select count(*) from public.reportes_preguntas where user_id = uid and created_at > now() - interval '1 day') >= 20
     or (select count(*) from public.reportes_preguntas where user_id = uid) >= 500 then
    raise exception 'Demasiados reportes' using errcode = '54000';
  end if;
  insert into public.reportes_preguntas (user_id, pregunta, motivo, detalle)
  values (uid, p_pregunta, p_motivo, nullif(left(btrim(coalesce(p_detalle, '')), 500), ''))
  on conflict (user_id, pregunta) do nothing;
  if not found then
    return 'ya_reportada';
  end if;
  return 'ok';
end;
$$;

revoke all on function public.reportar_pregunta(text, text, text) from public, anon;
grant execute on function public.reportar_pregunta(text, text, text) to authenticated;

-- Preguntas con 3 o más reportes pendientes de personas distintas: la app muestra «en revisión». Solo conteos.
create or replace function public.preguntas_en_revision()
returns table (pregunta text, reportes bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select r.pregunta, count(*)::bigint
  from public.reportes_preguntas r
  where r.estado = 'nuevo'
  group by r.pregunta
  having count(*) >= 3
$$;

revoke all on function public.preguntas_en_revision() from public;
grant execute on function public.preguntas_en_revision() to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. «¿Te sirvió esta explicación?»
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.votos_explicacion (
  user_id uuid not null references auth.users (id) on delete cascade,
  pregunta text not null,
  util boolean not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, pregunta),
  constraint votos_explicacion_valores check (char_length(pregunta) between 1 and 40)
);

create index if not exists votos_explicacion_conteo_idx on public.votos_explicacion (pregunta, util);

alter table public.votos_explicacion enable row level security;
revoke all on public.votos_explicacion from anon, authenticated;

-- Votar (o cambiar el voto). Tope por cuenta, como en las respuestas de la comunidad.
create or replace function public.votar_explicacion(p_pregunta text, p_util boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Inicia sesión para votar' using errcode = '28000';
  end if;
  if coalesce(char_length(p_pregunta), 0) not between 1 and 40 or p_util is null then
    raise exception 'Voto no válido' using errcode = '22023';
  end if;
  if not exists (select 1 from public.votos_explicacion where user_id = uid and pregunta = p_pregunta)
     and (select count(*) from public.votos_explicacion where user_id = uid) >= 3000 then
    raise exception 'Demasiados votos guardados' using errcode = '54000';
  end if;
  insert into public.votos_explicacion (user_id, pregunta, util)
  values (uid, p_pregunta, p_util)
  on conflict (user_id, pregunta) do update set util = excluded.util, updated_at = now();
end;
$$;

revoke all on function public.votar_explicacion(text, boolean) from public, anon;
grant execute on function public.votar_explicacion(text, boolean) to authenticated;

-- Totales de una explicación. Lo puede pedir cualquiera: solo devuelve conteos.
create or replace function public.votos_de_explicacion(p_pregunta text)
returns table (utiles bigint, no_utiles bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) filter (where v.util)::bigint, count(*) filter (where not v.util)::bigint
  from public.votos_explicacion v
  where v.pregunta = p_pregunta
$$;

revoke all on function public.votos_de_explicacion(text) from public;
grant execute on function public.votos_de_explicacion(text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Ligas semanales y reto entre universidades
-- ─────────────────────────────────────────────────────────────────────────────
-- La app sube, junto al resto del resumen, los puntos de la semana en curso, el identificador de esa semana
-- («2026-W45», semana ISO) y el último día en que estudió (para el compañero de estudio).
alter table public.leaderboard add column if not exists semana text;
alter table public.leaderboard add column if not exists xp_semana integer not null default 0;
alter table public.leaderboard add column if not exists ultimo_estudio date;

alter table public.leaderboard drop constraint if exists leaderboard_semana_valores;
alter table public.leaderboard add constraint leaderboard_semana_valores check (
  (semana is null or semana ~ '^[0-9]{4}-W[0-9]{2}$')
  and xp_semana between 0 and 100000
);

-- Liga según los puntos de la semana: 1 Bronce · 2 Plata · 3 Oro · 4 Zafiro · 5 Diamante.
-- Los umbrales deben coincidir con LEAGUES en src/lib/league.ts (una prueba lo comprueba).
create or replace function public.liga_de(p_puntos integer)
returns smallint
language sql
immutable
set search_path = ''
as $$
  select (case
    when p_puntos >= 1000 then 5
    when p_puntos >= 600 then 4
    when p_puntos >= 300 then 3
    when p_puntos >= 100 then 2
    else 1
  end)::smallint
$$;

revoke execute on function public.liga_de(integer) from public, anon, authenticated;

-- Quienes están en tu misma liga esta semana, ordenados por puntos (los 30 primeros y siempre tú).
create or replace function public.liga_semanal(p_semana text, p_limite integer default 30)
returns table (posicion bigint, nombre text, liga smallint, puntos integer, es_yo boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with yo as (
    select coalesce(max(public.liga_de(l.xp_semana)), 1) as liga
    from public.leaderboard l
    where l.user_id = (select auth.uid()) and l.semana = p_semana
  ),
  base as (
    select l.user_id, l.show_name, l.display_name, l.xp_semana, public.liga_de(l.xp_semana) as liga
    from public.leaderboard l
    where l.semana = p_semana and l.xp_semana > 0
  ),
  ranked as (
    select b.*, rank() over (order by b.xp_semana desc) as pos
    from base b, yo
    where b.liga = yo.liga
  )
  select r.pos,
         case when r.show_name and r.display_name is not null then r.display_name else 'Estudiante' end,
         r.liga,
         r.xp_semana,
         r.user_id = (select auth.uid())
  from ranked r
  where r.pos <= least(greatest(coalesce(p_limite, 30), 1), 100) or r.user_id = (select auth.uid())
  order by r.pos, 2
$$;

revoke all on function public.liga_semanal(text, integer) from public, anon;
grant execute on function public.liga_semanal(text, integer) to authenticated;

-- Reto de la semana: universidades ordenadas por puntos promedio de quienes estudiaron esta semana.
-- Solo cuentan universidades con 3 o más participantes, para no exponer a nadie.
create or replace function public.reto_universidades(p_semana text)
returns table (universidad text, participantes bigint, puntos_total bigint, puntos_promedio numeric, es_la_mia boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select l.university,
         count(*)::bigint,
         sum(l.xp_semana)::bigint,
         round(avg(l.xp_semana), 0),
         coalesce(l.university = (select m.university from public.leaderboard m where m.user_id = (select auth.uid())), false)
  from public.leaderboard l
  where l.semana = p_semana
    and l.xp_semana > 0
    and l.university is not null
    and l.university <> 'sin-decir'
  group by l.university
  having count(*) >= 3
  order by 4 desc, 2 desc
  limit 30
$$;

revoke all on function public.reto_universidades(text) from public, anon;
grant execute on function public.reto_universidades(text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Compañero de estudio con código
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.companeros (
  id uuid primary key default gen_random_uuid(),
  a uuid not null references auth.users (id) on delete cascade,
  b uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint companeros_orden check (a < b),
  unique (a, b)
);

create index if not exists companeros_b_idx on public.companeros (b);

alter table public.companeros enable row level security;
revoke all on public.companeros from anon, authenticated;

create table if not exists public.codigos_companero (
  user_id uuid primary key references auth.users (id) on delete cascade,
  codigo text not null unique,
  expira timestamptz not null,
  constraint codigos_companero_formato check (codigo ~ '^[A-HJ-NP-Z2-9]{8}$')
);

alter table public.codigos_companero enable row level security;
revoke all on public.codigos_companero from anon, authenticated;

-- Mi código para invitar (8 letras y números sin confusiones, vale 48 horas). Si ya tengo uno vigente, es el mismo.
create or replace function public.companero_codigo()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v text;
  bytes bytea;
  i integer;
begin
  if uid is null then
    raise exception 'Inicia sesión para invitar a un compañero' using errcode = '28000';
  end if;
  select c.codigo into v from public.codigos_companero c where c.user_id = uid and c.expira > now();
  if v is not null then
    return v;
  end if;
  loop
    v := '';
    bytes := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    for i in 0..7 loop
      v := v || substr(alfabeto, (get_byte(bytes, i) % 32) + 1, 1);
    end loop;
    begin
      insert into public.codigos_companero (user_id, codigo, expira)
      values (uid, v, now() + interval '48 hours')
      on conflict (user_id) do update set codigo = excluded.codigo, expira = excluded.expira;
      return v;
    exception when unique_violation then
      null; -- el código ya existía: se intenta otro
    end;
  end loop;
end;
$$;

revoke all on function public.companero_codigo() from public, anon;
grant execute on function public.companero_codigo() to authenticated;

-- Unirse con el código de otra persona. Devuelve: ok · codigo_invalido · es_tuyo · ya_son · lleno.
create or replace function public.companero_unirse(p_codigo text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  limpio text := replace(upper(btrim(coalesce(p_codigo, ''))), '-', '');
  otro uuid;
begin
  if uid is null then
    raise exception 'Inicia sesión para unirte' using errcode = '28000';
  end if;
  select c.user_id into otro from public.codigos_companero c where c.codigo = limpio and c.expira > now();
  if otro is null then
    return 'codigo_invalido';
  end if;
  if otro = uid then
    return 'es_tuyo';
  end if;
  if exists (select 1 from public.companeros where a = least(uid, otro) and b = greatest(uid, otro)) then
    return 'ya_son';
  end if;
  if (select count(*) from public.companeros where a = uid or b = uid) >= 3
     or (select count(*) from public.companeros where a = otro or b = otro) >= 3 then
    return 'lleno';
  end if;
  insert into public.companeros (a, b) values (least(uid, otro), greatest(uid, otro));
  return 'ok';
end;
$$;

revoke all on function public.companero_unirse(text) from public, anon;
grant execute on function public.companero_unirse(text) to authenticated;

-- Cómo van mis compañeros: nombre corto, si ya estudiaron hoy, su racha y su último día de estudio.
-- p_hoy es la fecha de hoy según el dispositivo de quien pregunta (cada persona estudia en su zona horaria).
create or replace function public.companero_estado(p_hoy date default current_date)
returns table (pareja uuid, nombre text, estudio_hoy boolean, racha integer, ultimo_estudio date, desde timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id,
         case when l.show_name and l.display_name is not null then l.display_name else 'Compañero' end,
         coalesce(l.ultimo_estudio = p_hoy, false),
         case when l.ultimo_estudio >= p_hoy - 1 then l.streak else 0 end,
         l.ultimo_estudio,
         c.created_at
  from public.companeros c
  join public.leaderboard l on l.user_id = case when c.a = (select auth.uid()) then c.b else c.a end
  where (select auth.uid()) in (c.a, c.b)
  order by c.created_at
$$;

revoke all on function public.companero_estado(date) from public, anon;
grant execute on function public.companero_estado(date) to authenticated;

-- Dejar de ser compañeros (cualquiera de los dos puede).
create or replace function public.companero_dejar(p_pareja uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Inicia sesión' using errcode = '28000';
  end if;
  delete from public.companeros where id = p_pareja and uid in (a, b);
end;
$$;

revoke all on function public.companero_dejar(uuid) from public, anon;
grant execute on function public.companero_dejar(uuid) to authenticated;
