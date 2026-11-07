// Prueba de las migraciones de Supabase contra un Postgres real (PGlite, en memoria).
// Simula lo mínimo de Supabase (roles anon y authenticated, auth.users, auth.uid()) y aplica todas las
// migraciones en orden. Después usa las funciones nuevas como lo haría cada tipo de persona, incluidos los
// intentos de abuso: visitante sin cuenta, cuenta que quiere leer tablas cerradas, datos inválidos, topes.
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

const DIR = join(import.meta.dirname, 'migrations')
const db = new PGlite()
const ok = (cond: unknown, what: string) => expect(cond, what).toBeTruthy()
const U: Record<string, string> = {}
type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const as = async <T,>(who: string, fn: () => Promise<T>): Promise<T> => {
  await db.exec(who === 'anon' ? `set role anon; select set_config('request.jwt.claim.sub','',false)` : `set role authenticated; select set_config('request.jwt.claim.sub','${U[who]}',false)`)
  try {
    return await fn()
  } finally {
    await db.exec('reset role')
  }
}
const q = (s: string, p?: unknown[]) => db.query<Row>(s, p)
const fails_with = async (fn: () => Promise<unknown>): Promise<(Error & { code?: string }) | null> => {
  try {
    await fn()
    return null
  } catch (e) {
    return e as Error & { code?: string }
  }
}

beforeAll(async () => {
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb not null default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant all on functions to anon, authenticated;
  `)
  for (const f of readdirSync(DIR).filter((x) => x.endsWith('.sql')).sort()) await db.exec(readFileSync(join(DIR, f), 'utf8'))
  for (const n of ['u1', 'u2', 'u3', 'u4', 'u5']) U[n] = (await q(`insert into auth.users (email, raw_user_meta_data) values ('${n}@x.com', '{"name":"Nombre ${n} Apellido"}') returning id`)).rows[0].id
}, 60_000)

describe('migraciones de Supabase', () => {
  it('la 0008 se puede aplicar dos veces sin error', async () => {
    await db.exec(readFileSync(join(DIR, '0008_comunidad_y_calidad.sql'), 'utf8'))
  })

  it('reportes', async () => {
    ok((await fails_with(() => as('anon', () => q(`select public.reportar_pregunta('bq-1','respuesta',null)`))))?.message.includes('permission denied'), 'visitante sin cuenta no puede reportar')
    ok((await as('u1', () => q(`select public.reportar_pregunta('bq-1','respuesta','La B es la correcta')`))).rows[0].reportar_pregunta === 'ok', 'cuenta reporta una pregunta')
    ok((await as('u1', () => q(`select public.reportar_pregunta('bq-1','enunciado',null)`))).rows[0].reportar_pregunta === 'ya_reportada', 'segundo reporte de la misma persona/pregunta: ya_reportada')
    ok((await fails_with(() => as('u1', () => q(`select public.reportar_pregunta('bq-2','inventado',null)`))))?.code === '22023', 'motivo inválido se rechaza')
    ok((await fails_with(() => as('u1', () => q(`select public.reportar_pregunta('bq-2',null,null)`))))?.code === '22023', 'motivo nulo se rechaza (sin atajo con NULL)')
    ok((await fails_with(() => as('u1', () => q(`select public.reportar_pregunta('${'x'.repeat(41)}','otro',null)`))))?.code === '22023', 'identificador de pregunta demasiado largo se rechaza')
    ok((await fails_with(() => as('u1', () => q(`select * from public.reportes_preguntas`))))?.message.includes('permission denied'), 'ninguna cuenta puede leer la tabla de reportes')
    ok((await fails_with(() => as('u1', () => q(`insert into public.reportes_preguntas (user_id,pregunta,motivo,estado) values ('${U.u1}','bq-9','otro','descartado')`))))?.message.includes('permission denied'), 'ninguna cuenta puede insertar directo (ni forzar el estado)')
    ok((await fails_with(() => as('u1', () => q(`select * from public.reportes_resumen`))))?.message.includes('permission denied'), 'ninguna cuenta puede leer el resumen de administración')
    ok((await as('u2', () => q(`select public.reportar_pregunta('bq-1','respuesta',null)`))).rows[0].reportar_pregunta === 'ok', 'segunda persona reporta la misma pregunta')
    ok((await as('anon', () => q(`select * from public.preguntas_en_revision()`))).rows.length === 0, 'con 2 reportes aún no está «en revisión»')
    await as('u3', () => q(`select public.reportar_pregunta('bq-1','explicacion',null)`))
    const rev = (await as('anon', () => q(`select * from public.preguntas_en_revision()`))).rows
    ok(rev.length === 1 && rev[0].pregunta === 'bq-1' && Number(rev[0].reportes) === 3, 'con 3 reportes de personas distintas sale «en revisión» (visible sin cuenta)')
    await q(`update public.reportes_preguntas set estado='revisado' where pregunta='bq-1'`)
    ok((await as('anon', () => q(`select * from public.preguntas_en_revision()`))).rows.length === 0, 'al marcarlos revisados, deja de estar en revisión')
    for (let i = 0; i < 20; i++) await as('u4', () => q(`select public.reportar_pregunta('t-${i}','otro',null)`))
    ok((await fails_with(() => as('u4', () => q(`select public.reportar_pregunta('t-21','otro',null)`))))?.code === '54000', 'hasta 20 reportes por día; el 21 se frena')

    // ============ 2. Votos
  })

  it('votos de explicación', async () => {
    ok((await fails_with(() => as('anon', () => q(`select public.votar_explicacion('bq-5', true)`))))?.message.includes('permission denied'), 'sin cuenta no se puede votar')
    await as('u1', () => q(`select public.votar_explicacion('bq-5', true)`))
    await as('u2', () => q(`select public.votar_explicacion('bq-5', true)`))
    await as('u3', () => q(`select public.votar_explicacion('bq-5', false)`))
    let v = (await as('anon', () => q(`select * from public.votos_de_explicacion('bq-5')`))).rows[0]
    ok(Number(v.utiles) === 2 && Number(v.no_utiles) === 1, 'conteo público: 2 útiles, 1 no útil')
    await as('u1', () => q(`select public.votar_explicacion('bq-5', false)`))
    v = (await as('anon', () => q(`select * from public.votos_de_explicacion('bq-5')`))).rows[0]
    ok(Number(v.utiles) === 1 && Number(v.no_utiles) === 2, 'cambiar el voto no lo duplica')
    ok((await fails_with(() => as('u1', () => q(`select public.votar_explicacion('bq-5', null)`))))?.code === '22023', 'voto nulo se rechaza')
    ok((await fails_with(() => as('u1', () => q(`select * from public.votos_explicacion`))))?.message.includes('permission denied'), 'nadie lee quién votó qué')
    v = (await as('anon', () => q(`select * from public.votos_de_explicacion('sin-votos')`))).rows[0]
    ok(Number(v.utiles) === 0 && Number(v.no_utiles) === 0, 'pregunta sin votos devuelve ceros')

    // ============ 3. Ligas y reto
  })

  it('ligas y reto entre universidades', async () => {
    await db.exec(`set session_replication_role = replica`) // sin el límite de 1 escritura/seg de 0002 (no es lo que se prueba aquí)
    const W = '2026-W45'
    const setStats = (who: string, xp: number, uni: string, semana = W) => as(who, () => q(`update public.leaderboard set semana=$1, xp_semana=$2, university=$3, ultimo_estudio=current_date, streak=5 where user_id='${U[who]}'`, [semana, xp, uni]))
    await setStats('u1', 50, 'uasd'); await setStats('u2', 80, 'uasd'); await setStats('u3', 450, 'uasd'); await setStats('u4', 320, 'pucmm'); await setStats('u5', 30, 'pucmm')
    let liga = (await as('u1', () => q(`select * from public.liga_semanal('${W}')`))).rows
    ok(liga.length === 3 && liga.every((r: Row) => r.liga === 1), 'u1 (50 pts) ve la liga Bronce con 3 personas (50, 80 y 30)')
    ok(liga[0].puntos === 80 && Number(liga[0].posicion) === 1 && liga.find((r: Row) => r.es_yo)?.puntos === 50, 'ordenada por puntos y marca quién soy')
    ok(liga.every((r: Row) => r.nombre !== null) && !liga.some((r: Row) => 'user_id' in r), 'no se expone ningún identificador de usuario')
    liga = (await as('u3', () => q(`select * from public.liga_semanal('${W}')`))).rows
    ok(liga.length === 2 && liga.every((r: Row) => r.liga === 3), 'u3 (450) y u4 (320) están juntos en Oro')
    ok((await as('u1', () => q(`select * from public.liga_semanal('2026-W10')`))).rows.length === 0, 'una semana sin datos no devuelve filas')
    ok((await fails_with(() => as('anon', () => q(`select * from public.liga_semanal('${W}')`))))?.message.includes('permission denied'), 'sin cuenta no se ve la liga')
    const lim = await as('u1', () => q(`select * from public.liga_semanal('${W}', 1)`))
    ok(lim.rows.length === 2 && lim.rows.some((r: Row) => r.es_yo), 'con límite 1 igual aparezco yo')
    ok((await fails_with(() => as('u1', () => q(`update public.leaderboard set semana='mal' where user_id='${U.u1}'`))))?.message.includes('leaderboard_semana_valores'), 'una semana con formato inválido se rechaza')
    ok((await fails_with(() => as('u1', () => q(`update public.leaderboard set xp_semana=100001 where user_id='${U.u1}'`))))?.message.includes('leaderboard_semana_valores'), 'puntos fuera de rango se rechazan')
    let reto = (await as('u1', () => q(`select * from public.reto_universidades('${W}')`))).rows
    ok(reto.length === 1 && reto[0].universidad === 'uasd' && Number(reto[0].participantes) === 3 && reto[0].es_la_mia === true, 'reto: solo UASD (3 participantes); PUCMM (2) no se muestra por privacidad')
    ok(Number(reto[0].puntos_promedio) === Math.round((50 + 80 + 450) / 3), 'promedio de puntos correcto')
    const thr = [[0, 1], [99, 1], [100, 2], [299, 2], [300, 3], [599, 3], [600, 4], [999, 4], [1000, 5], [50000, 5]]
    let thrOk = true
    for (const [p, l] of thr) if (Number((await q(`select public.liga_de(${p}) as l`)).rows[0].l) !== l) thrOk = false
    ok(thrOk, 'umbrales de liga_de: 0/100/300/600/1000')

    // ============ 4. Compañeros
  })

  it('compañero de estudio', async () => {
    ok((await fails_with(() => as('anon', () => q(`select public.companero_codigo()`))))?.message.includes('permission denied'), 'sin cuenta no hay código')
    const c1 = (await as('u1', () => q(`select public.companero_codigo() as c`))).rows[0].c
    ok(/^[A-HJ-NP-Z2-9]{8}$/.test(c1), `código de 8 caracteres sin letras confusas (${c1})`)
    ok((await as('u1', () => q(`select public.companero_codigo() as c`))).rows[0].c === c1, 'mientras vale, el código es el mismo')
    ok((await as('u1', () => q(`select public.companero_unirse('${c1}') as r`))).rows[0].r === 'es_tuyo', 'no puedes unirte a ti mismo')
    ok((await as('u2', () => q(`select public.companero_unirse('XXXXXXXX') as r`))).rows[0].r === 'codigo_invalido', 'código inexistente')
    ok((await as('u2', () => q(`select public.companero_unirse(null) as r`))).rows[0].r === 'codigo_invalido', 'código nulo no rompe')
    ok((await as('u2', () => q(`select public.companero_unirse('${c1.slice(0, 4).toLowerCase()}-${c1.slice(4)}') as r`))).rows[0].r === 'ok', 'u2 se une con el código (acepta minúsculas y guion)')
    ok((await as('u2', () => q(`select public.companero_unirse('${c1}') as r`))).rows[0].r === 'ya_son', 'unirse dos veces: ya_son')
    let est = (await as('u1', () => q(`select * from public.companero_estado(current_date)`))).rows
    ok(est.length === 1 && est[0].estudio_hoy === true && est[0].racha === 5 && est[0].nombre === (await q(`select display_name from public.leaderboard where user_id='${U.u2}'`)).rows[0].display_name, 'u1 ve a u2: estudió hoy, racha 5, nombre corto')
    est = (await as('u2', () => q(`select * from public.companero_estado(current_date)`))).rows
    ok(est.length === 1, 'la relación es mutua: u2 ve a u1')
    ok((await as('u3', () => q(`select * from public.companero_estado(current_date)`))).rows.length === 0, 'una tercera persona no ve nada de ellos')
    est = (await as('u1', () => q(`select * from public.companero_estado(current_date + 3)`))).rows
    ok(est[0].estudio_hoy === false && est[0].racha === 0, 'si pasaron días sin estudiar: no estudió hoy y la racha se muestra en 0')
    await q(`update public.leaderboard set show_name=false where user_id='${U.u2}'`)
    ok((await as('u1', () => q(`select nombre from public.companero_estado(current_date)`))).rows[0].nombre === 'Compañero', 'si no quiere mostrar su nombre, sale como «Compañero»')
    for (const w of ['u3', 'u4']) { await as(w, () => q(`select public.companero_unirse('${c1}')`)) }
    ok((await as('u5', () => q(`select public.companero_unirse('${c1}') as r`))).rows[0].r === 'lleno', 'tope de 3 compañeros por persona')
    ok((await q(`select count(*)::int c from public.companeros`)).rows[0].c === 3, 'quedaron 3 parejas')
    const pareja = est[0].pareja
    await as('u3', () => q(`select public.companero_dejar('${pareja}')`))
    ok((await q(`select count(*)::int c from public.companeros`)).rows[0].c === 3, 'alguien ajeno no puede deshacer una pareja')
    await as('u2', () => q(`select public.companero_dejar('${pareja}')`))
    ok((await q(`select count(*)::int c from public.companeros`)).rows[0].c === 2, 'cualquiera de los dos puede dejar la pareja')
    await q(`update public.codigos_companero set expira = now() - interval '1 minute' where user_id='${U.u1}'`)
    ok((await as('u5', () => q(`select public.companero_unirse('${c1}') as r`))).rows[0].r === 'codigo_invalido', 'un código vencido no sirve')
    const c1b = (await as('u1', () => q(`select public.companero_codigo() as c`))).rows[0].c
    ok(c1b !== c1 && /^[A-HJ-NP-Z2-9]{8}$/.test(c1b), 'al vencer se genera uno nuevo')
    ok((await fails_with(() => as('u1', () => q(`select * from public.companeros`))))?.message.includes('permission denied'), 'nadie lee la tabla de parejas')
    ok((await fails_with(() => as('u1', () => q(`select * from public.codigos_companero`))))?.message.includes('permission denied'), 'nadie lee la tabla de códigos')

    // ============ 5. Borrar cuenta y permisos
    await db.exec(`set session_replication_role = origin`) // las cascadas de borrado son triggers: se reactivan
  })

  it('borrado de cuenta y permisos', async () => {
    await as('u1', () => q(`select public.delete_own_account()`))
    const left = (await q(`select (select count(*)::int from public.reportes_preguntas where user_id='${U.u1}') r, (select count(*)::int from public.votos_explicacion where user_id='${U.u1}') v, (select count(*)::int from public.companeros where '${U.u1}' in (a,b)) c, (select count(*)::int from public.codigos_companero where user_id='${U.u1}') k`)).rows[0]
    ok(left.r + left.v + left.c + left.k === 0, 'al borrar la cuenta se borran sus reportes, votos, parejas y códigos')
    const priv = async (role: string, fn: string) => (await q(`select has_function_privilege('${role}', '${fn}', 'execute') as p`)).rows[0].p
    ok(!(await priv('anon', 'public.liga_de(integer)')) && !(await priv('authenticated', 'public.liga_de(integer)')), 'liga_de no es llamable desde la app')
    ok((await priv('anon', 'public.preguntas_en_revision()')) && (await priv('anon', 'public.votos_de_explicacion(text)')), 'los conteos públicos sí los puede pedir un visitante')
    ok(!(await priv('anon', 'public.reportar_pregunta(text,text,text)')) && !(await priv('anon', 'public.companero_estado(date)')) && !(await priv('anon', 'public.liga_semanal(text,integer)')), 'las funciones que piden sesión no las puede llamar un visitante')
  })
})
