import { beforeEach, describe, expect, it, vi } from 'vitest'

const insert = vi.fn()
const rpc = vi.fn()
const user = { current: null as { id: string } | null }

vi.mock('./supabase', () => ({
  isSupabaseConfigured: true,
  getSupabase: async () => ({ from: () => ({ insert }), rpc }),
}))
vi.mock('@/store/auth', () => ({ useAuth: { getState: () => ({ user: user.current }) } }))

const store = new Map<string, string>()
vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) })

const { fetchCommunity, recordVote, sharePercents } = await import('./community')

beforeEach(() => {
  insert.mockReset()
  rpc.mockReset()
  store.clear()
  user.current = null
})

describe('porcentajes de la comunidad', () => {
  it('suman exactamente 100 aunque haya decimales', () => {
    for (const counts of [[1, 1, 1], [3, 3, 3, 1], [7, 0, 0, 0], [33, 33, 34], [1, 2, 4, 8, 16]]) {
      expect(sharePercents(counts).reduce((a, b) => a + b, 0)).toBe(100)
    }
    expect(sharePercents([1, 1, 1])).toEqual([34, 33, 33])
  })
  it('sin respuestas devuelve ceros', () => {
    expect(sharePercents([0, 0, 0])).toEqual([0, 0, 0])
  })
})

describe('guardar la respuesta', () => {
  it('sin sesión no manda nada', async () => {
    await recordVote('bq-1_1', 2)
    expect(insert).not.toHaveBeenCalled()
  })
  it('con sesión manda la opción elegida, una sola vez', async () => {
    user.current = { id: 'u1' }
    insert.mockResolvedValue({ error: null })
    await recordVote('bq-1_1', 2)
    await recordVote('bq-1_1', 2)
    expect(insert).toHaveBeenCalledTimes(1)
    expect(insert).toHaveBeenCalledWith({ user_id: 'u1', pregunta: 'bq-1_1', opcion: 2 })
  })
  it('si ya había respondido antes (23505) lo da por enviado y no reintenta', async () => {
    user.current = { id: 'u1' }
    insert.mockResolvedValue({ error: { code: '23505' } })
    await recordVote('bq-2_2', 1)
    await recordVote('bq-2_2', 1)
    expect(insert).toHaveBeenCalledTimes(1)
  })
  it('si falla por otro motivo, se reintenta la próxima vez', async () => {
    user.current = { id: 'u1' }
    insert.mockResolvedValue({ error: { code: '500' } })
    await recordVote('bq-3_3', 0)
    await recordVote('bq-3_3', 0)
    expect(insert).toHaveBeenCalledTimes(2)
  })
})

describe('leer lo que eligió la comunidad', () => {
  it('arma los totales en el orden de las opciones y los guarda en memoria', async () => {
    rpc.mockResolvedValue({ data: [{ opcion: 1, votos: '6' }, { opcion: 3, votos: 4 }], error: null })
    const v = await fetchCommunity('bq-4_4', 4)
    expect(v).toEqual({ counts: [0, 6, 0, 4], total: 10 })
    await fetchCommunity('bq-4_4', 4)
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith('respuestas_de_pregunta', { p_pregunta: 'bq-4_4' })
  })
  it('si la consulta falla devuelve null y no se queda con el error', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'x' } })
    expect(await fetchCommunity('bq-5_5', 4)).toBeNull()
    rpc.mockResolvedValueOnce({ data: [{ opcion: 0, votos: 1 }], error: null })
    expect((await fetchCommunity('bq-5_5', 4))?.total).toBe(1)
  })
  it('ignora opciones fuera de rango', async () => {
    rpc.mockResolvedValue({ data: [{ opcion: 5, votos: 9 }, { opcion: 0, votos: 2 }], error: null })
    expect(await fetchCommunity('bq-6_6', 4)).toEqual({ counts: [2, 0, 0, 0], total: 2 })
  })
})
