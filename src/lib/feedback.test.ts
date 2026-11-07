import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpc = vi.fn()
vi.mock('./supabase', () => ({ isSupabaseConfigured: true, getSupabase: async () => ({ rpc }) }))

import { useAuth } from '@/store/auth'
import { fetchExplanationVotes, fetchInReview, hasReported, myVote, sendReport, voteExplanation, votesLabel } from './feedback'

// localStorage mínimo para el entorno de pruebas (node)
const store = new Map<string, string>()
vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) })

const signIn = () => useAuth.setState({ user: { id: 'u1' } as never, status: 'signed-in' })
const signOut = () => useAuth.setState({ user: null, status: 'signed-out' })

beforeEach(() => {
  rpc.mockReset()
  store.clear()
  signOut()
})

describe('sendReport', () => {
  it('sin cuenta no envía nada', async () => {
    expect(await sendReport('bq-1', 'respuesta', '')).toBe('sin-sesion')
    expect(rpc).not.toHaveBeenCalled()
  })
  it('envía el motivo y el detalle recortado, y recuerda que ya reportó', async () => {
    signIn()
    rpc.mockResolvedValue({ data: 'ok', error: null })
    expect(await sendReport('bq-1', 'enunciado', '  falta una opción  ')).toBe('ok')
    expect(rpc).toHaveBeenCalledWith('reportar_pregunta', { p_pregunta: 'bq-1', p_motivo: 'enunciado', p_detalle: 'falta una opción' })
    expect(hasReported('bq-1')).toBe(true)
    expect(hasReported('bq-2')).toBe(false)
  })
  it('un detalle vacío viaja como null y uno enorme se recorta a 500', async () => {
    signIn()
    rpc.mockResolvedValue({ data: 'ok', error: null })
    await sendReport('bq-1', 'otro', '   ')
    expect(rpc.mock.calls[0][1].p_detalle).toBeNull()
    await sendReport('bq-2', 'otro', 'x'.repeat(900))
    expect(rpc.mock.calls[1][1].p_detalle).toHaveLength(500)
  })
  it('distingue ya reportada, tope diario y error', async () => {
    signIn()
    rpc.mockResolvedValueOnce({ data: 'ya_reportada', error: null })
    expect(await sendReport('bq-1', 'otro', '')).toBe('ya_reportada')
    rpc.mockResolvedValueOnce({ data: null, error: { code: '54000' } })
    expect(await sendReport('bq-2', 'otro', '')).toBe('limite')
    rpc.mockResolvedValueOnce({ data: null, error: { code: '500' } })
    expect(await sendReport('bq-3', 'otro', '')).toBe('error')
    expect(hasReported('bq-3')).toBe(false)
    rpc.mockRejectedValueOnce(new Error('sin red'))
    expect(await sendReport('bq-4', 'otro', '')).toBe('error')
  })
})

describe('votos de explicación', () => {
  it('sin cuenta el voto queda solo en el dispositivo', async () => {
    expect(await voteExplanation('bq-1', true)).toBe('local')
    expect(myVote('bq-1')).toBe(true)
    expect(rpc).not.toHaveBeenCalled()
  })
  it('con cuenta se envía y se puede cambiar', async () => {
    signIn()
    rpc.mockResolvedValue({ data: null, error: null })
    expect(await voteExplanation('bq-1', true)).toBe('ok')
    expect(await voteExplanation('bq-1', false)).toBe('ok')
    expect(rpc).toHaveBeenLastCalledWith('votar_explicacion', { p_pregunta: 'bq-1', p_util: false })
    expect(myVote('bq-1')).toBe(false)
  })
  it('si el envío falla, el voto igual queda guardado aquí', async () => {
    signIn()
    rpc.mockResolvedValue({ data: null, error: { code: '500' } })
    expect(await voteExplanation('bq-9', true)).toBe('local')
    expect(myVote('bq-9')).toBe(true)
  })
  it('lee los totales públicos (los bigint llegan como texto)', async () => {
    rpc.mockResolvedValue({ data: [{ utiles: '12', no_utiles: '2' }], error: null })
    expect(await fetchExplanationVotes('bq-50')).toEqual({ utiles: 12, noUtiles: 2 })
    rpc.mockResolvedValue({ data: [{ utiles: '1', no_utiles: '1' }], error: null })
    expect(await fetchExplanationVotes('bq-50')).toEqual({ utiles: 12, noUtiles: 2 }) // viene del caché
  })
  it('el texto de totales espera al menos 5 votos', () => {
    expect(votesLabel(null)).toBeNull()
    expect(votesLabel({ utiles: 3, noUtiles: 1 })).toBeNull()
    expect(votesLabel({ utiles: 12, noUtiles: 2 })).toBe('12 de 14 personas la marcaron útil (86 %)')
  })
})

describe('preguntas en revisión', () => {
  it('devuelve el conjunto de identificadores y falla en silencio', async () => {
    rpc.mockResolvedValueOnce({ data: [{ pregunta: 'bq-7', reportes: 3 }], error: null })
    const ids = await fetchInReview()
    expect(ids.has('bq-7')).toBe(true)
    expect(ids.has('bq-8')).toBe(false)
  })
})
