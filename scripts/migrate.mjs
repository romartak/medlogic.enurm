// Aplica las migraciones de supabase/migrations a la base de datos de Supabase durante el despliegue
// de PRODUCCIÓN en Vercel. Así no hay que pegar SQL a mano: con la integración de Supabase del
// Marketplace de Vercel, la variable POSTGRES_URL_NON_POOLING ya existe.
//
// - Solo corre en producción (VERCEL_ENV=production) o con MIGRATE=1, para que una vista previa
//   de una rama no cambie la base de datos real.
// - Cada archivo se aplica una sola vez, en orden, dentro de una transacción, y se anota en
//   public.medlogic_migraciones.
// - Si algo falla, avisa y deja seguir la compilación: la página se publica igual (sin cuentas).
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import postgres from 'postgres'

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL
const enabled = process.env.MIGRATE === '1' || process.env.VERCEL_ENV === 'production'
const dir = join(import.meta.dirname, '..', 'supabase', 'migrations')

if (!url || !enabled) {
  console.log(`[migraciones] Omitidas (${!url ? 'sin POSTGRES_URL_NON_POOLING' : 'no es producción'}).`)
  process.exit(0)
}

const sql = postgres(url, { ssl: url.includes('localhost') ? false : 'require', max: 1, connect_timeout: 20, onnotice: () => {} })

try {
  await sql.unsafe(`
    create table if not exists public.medlogic_migraciones (nombre text primary key, aplicada timestamptz not null default now());
    alter table public.medlogic_migraciones enable row level security;
    revoke all on public.medlogic_migraciones from anon, authenticated;
  `)
  const done = new Set((await sql`select nombre from public.medlogic_migraciones`).map((r) => r.nombre))
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()
  let applied = 0
  for (const file of files) {
    if (done.has(file)) continue
    const text = await readFile(join(dir, file), 'utf8')
    await sql.begin(async (tx) => {
      await tx.unsafe(text)
      await tx`insert into public.medlogic_migraciones (nombre) values (${file})`
    })
    console.log(`[migraciones] Aplicada ${file}`)
    applied++
  }
  console.log(applied ? `[migraciones] Listo: ${applied} nueva(s).` : '[migraciones] La base de datos ya estaba al día.')
} catch (err) {
  console.warn(`[migraciones] AVISO: no se pudieron aplicar (${err?.message ?? err}). La página se publica igual; revisa docs/DESPLIEGUE.md.`)
} finally {
  await sql.end({ timeout: 5 })
}
