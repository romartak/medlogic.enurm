-- MedLogic ENURM: cuentas y progreso sincronizado.
-- Ejecuta este archivo una vez en Supabase → SQL Editor (o con `supabase db push`).

-- Perfil público mínimo de cada usuario.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- Una fila por usuario con la copia completa de su progreso (el mismo formato del respaldo JSON).
create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_state enable row level security;

-- Cada usuario solo puede ver y modificar lo suyo.
drop policy if exists "Perfil propio: leer" on public.profiles;
create policy "Perfil propio: leer" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Perfil propio: actualizar" on public.profiles;
create policy "Perfil propio: actualizar" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Progreso propio: leer" on public.user_state;
create policy "Progreso propio: leer" on public.user_state for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Progreso propio: crear" on public.user_state;
create policy "Progreso propio: crear" on public.user_state for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Progreso propio: actualizar" on public.user_state;
create policy "Progreso propio: actualizar" on public.user_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Progreso propio: borrar" on public.user_state;
create policy "Progreso propio: borrar" on public.user_state for delete to authenticated using ((select auth.uid()) = user_id);

-- updated_at lo pone el servidor en cada cambio (la app lo usa para detectar copias más nuevas).
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists user_state_touch on public.user_state;
create trigger user_state_touch before insert or update on public.user_state
  for each row execute function public.touch_updated_at();

-- Crea el perfil al registrarse (toma el nombre del formulario o de Google).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
