-- MedLogic ENURM: cada persona puede borrar su propia cuenta desde «Mi cuenta».
-- Seguro de ejecutar varias veces. Lo aplica el despliegue de producción en Vercel (scripts/migrate.mjs).
--
-- Borra la fila de auth.users del usuario que llama; el perfil, la copia de progreso, el ranking y
-- el simulacro nacional se eliminan solos (todas esas tablas referencian auth.users con on delete cascade).
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Inicia sesión para borrar tu cuenta' using errcode = '28000';
  end if;
  delete from auth.users where id = uid;
end;
$$;

-- Solo usuarios con sesión; los visitantes sin sesión no pueden llamarla.
revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
