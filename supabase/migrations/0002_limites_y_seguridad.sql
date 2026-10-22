-- MedLogic ENURM: límites y permisos mínimos (defensa ante abusos).
-- Seguro de ejecutar varias veces. Lo aplica solo el despliegue de producción en Vercel
-- (scripts/migrate.mjs) o puedes pegarlo en Supabase → SQL Editor.

-- 1. La copia de progreso debe ser de MedLogic y no pasar de 8 MB (mismo límite que la app).
alter table public.user_state drop constraint if exists user_state_snapshot_valido;
alter table public.user_state add constraint user_state_snapshot_valido check (
  jsonb_typeof(snapshot) = 'object'
  and snapshot ->> 'app' = 'medlogic-enurm'
  and octet_length(snapshot::text) <= 8000000
);

-- 2. Nombres cortos en el perfil.
alter table public.profiles drop constraint if exists profiles_nombre_corto;
alter table public.profiles add constraint profiles_nombre_corto check (display_name is null or char_length(display_name) <= 80);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'), 80))
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 3. Freno a escrituras en ráfaga: como mucho una actualización por segundo y usuario
--    (la app sube los cambios cada pocos segundos; un script abusivo recibe error).
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and old.updated_at > now() - interval '1 second' then
    raise exception 'Demasiadas actualizaciones seguidas' using errcode = '54000';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- 4. Permisos mínimos: los visitantes sin sesión no tocan nada; los usuarios, solo lo que usa la app
--    (y las políticas RLS de 0001 los limitan a sus propias filas).
revoke all on public.profiles, public.user_state from anon;
revoke all on public.profiles, public.user_state from authenticated;
grant select, update (display_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.user_state to authenticated;

-- Las funciones internas no se llaman desde la API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
