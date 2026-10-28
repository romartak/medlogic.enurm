-- rls_auto_enable() es la función del event trigger que activa RLS en las tablas nuevas de public.
-- No debe poder llamarse desde la API (/rest/v1/rpc/rls_auto_enable) ni por anónimos ni por usuarios.
-- Quitar EXECUTE no afecta al event trigger: Postgres no lo comprueba al dispararlo.
-- Idempotente y con guarda: si la función no existe (otra base), no hace nada.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end
$$;
