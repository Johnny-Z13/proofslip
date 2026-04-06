import { describe, it, expect, vi, beforeEach } from 'vitest'

const BASE_URL = 'https://proofslip.ai'
const API_KEY = 'ak_test1234567890'

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('ProofSlipClient constructor', () => {
  it('accepts explicit apiKey and baseUrl', async () => {
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    const fetch = mockFetch(200, { status: 'ok' })
    vi.stubGlobal('fetch', fetch)
    await client.checkStatus('rct_test')
    const [url] = fetch.mock.calls[0]
    expect(url).toContain(BASE_URL)
  })

  it('reads PROOFSLIP_API_KEY from env', async () => {
    vi.stubEnv('PROOFSLIP_API_KEY', API_KEY)
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient()
    const fetch = mockFetch(201, { receipt_id: 'rct_123' })
    vi.stubGlobal('fetch', fetch)
    await client.createReceipt({ type: 'action', status: 'success', summary: 'test' })
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['Authorization']).toBe(`Bearer ${API_KEY}`)
  })

  it('defaults baseUrl to https://proofslip.ai', async () => {
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient()
    const fetch = mockFetch(200, { status: 'ok' })
    vi.stubGlobal('fetch', fetch)
    await client.checkStatus('rct_test')
    const [url] = fetch.mock.calls[0]
    expect(url).toContain('https://proofslip.ai')
  })
})

describe('ProofSlipClient.createReceipt', () => {
  it('returns typed Receipt on 201', async () => {
    const receiptData = {
      receipt_id: 'rct_abc',
      type: 'action',
      status: 'success',
      summary: 'deployed v2',
      verify_url: 'https://proofslip.ai/v1/verify/rct_abc',
      created_at: '2026-04-05T00:00:00Z',
      expires_at: '2026-04-06T00:00:00Z',
      idempotency_key: null,
      is_terminal: true,
      next_poll_after_seconds: null,
    }
    vi.stubGlobal('fetch', mockFetch(201, receiptData))
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    const receipt = await client.createReceipt({ type: 'action', status: 'success', summary: 'deployed v2' })
    expect(receipt.receipt_id).toBe('rct_abc')
    expect(receipt.verify_url).toContain('rct_abc')
  })

  it('sends Authorization header', async () => {
    const fetch = mockFetch(201, { receipt_id: 'rct_abc' })
    vi.stubGlobal('fetch', fetch)
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    await client.createReceipt({ type: 'action', status: 'success', summary: 'x' })
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['Authorization']).toBe(`Bearer ${API_KEY}`)
  })

  it('throws ProofSlipError on 401', async () => {
    vi.stubGlobal('fetch', mockFetch(401, { error: 'unauthorized', message: 'Invalid API key' }))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: 'bad_key', baseUrl: BASE_URL })
    await expect(client.createReceipt({ type: 'action', status: 'x', summary: 'x' }))
      .rejects.toThrow(ProofSlipError)
    try {
      await client.createReceipt({ type: 'action', status: 'x', summary: 'x' })
    } catch (err) {
      expect((err as InstanceType<typeof ProofSlipError>).code).toBe('unauthorized')
      expect((err as InstanceType<typeof ProofSlipError>).status).toBe(401)
    }
  })

  it('throws ProofSlipError on 409 idempotency conflict', async () => {
    vi.stubGlobal('fetch', mockFetch(409, { error: 'idempotency_conflict', message: 'Duplicate key' }))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    try {
      await client.createReceipt({ type: 'action', status: 'x', summary: 'x', idempotency_key: 'dup' })
    } catch (err) {
      expect((err as InstanceType<typeof ProofSlipError>).code).toBe('idempotency_conflict')
      expect((err as InstanceType<typeof ProofSlipError>).status).toBe(409)
    }
  })

  it('throws ProofSlipError with requestId on 500', async () => {
    vi.stubGlobal('fetch', mockFetch(500, { error: 'internal_error', message: 'boom', request_id: 'req_xyz' }))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    try {
      await client.createReceipt({ type: 'action', status: 'x', summary: 'x' })
    } catch (err) {
      expect((err as InstanceType<typeof ProofSlipError>).requestId).toBe('req_xyz')
    }
  })
})

describe('ProofSlipClient.verifyReceipt', () => {
  it('returns typed VerifyResult on 200', async () => {
    const data = {
      receipt_id: 'rct_abc',
      valid: true,
      type: 'action',
      status: 'success',
      summary: 'test',
      payload: null,
      ref: null,
      created_at: '2026-04-05T00:00:00Z',
      expires_at: '2026-04-06T00:00:00Z',
      expired: false,
      is_terminal: true,
      next_poll_after_seconds: null,
    }
    vi.stubGlobal('fetch', mockFetch(200, data))
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    const result = await client.verifyReceipt('rct_abc')
    expect(result.valid).toBe(true)
    expect(result.receipt_id).toBe('rct_abc')
  })

  it('does not send Authorization header', async () => {
    const fetch = mockFetch(200, { receipt_id: 'rct_abc' })
    vi.stubGlobal('fetch', fetch)
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    await client.verifyReceipt('rct_abc')
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['Authorization']).toBeUndefined()
  })

  it('encodes receipt ID in URL', async () => {
    const fetch = mockFetch(200, { receipt_id: 'rct_abc' })
    vi.stubGlobal('fetch', fetch)
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    await client.verifyReceipt('rct_has spaces&more')
    const [url] = fetch.mock.calls[0]
    expect(url).toContain(encodeURIComponent('rct_has spaces&more'))
  })

  it('throws ProofSlipError on 404', async () => {
    vi.stubGlobal('fetch', mockFetch(404, { error: 'not_found', message: 'Receipt not found' }))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    await expect(client.verifyReceipt('rct_missing')).rejects.toThrow(ProofSlipError)
  })
})

describe('ProofSlipClient.checkStatus', () => {
  it('returns typed StatusResult on 200', async () => {
    const data = {
      receipt_id: 'rct_abc',
      status: 'pending',
      is_terminal: false,
      next_poll_after_seconds: 15,
      expires_at: '2026-04-06T00:00:00Z',
    }
    vi.stubGlobal('fetch', mockFetch(200, data))
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    const result = await client.checkStatus('rct_abc')
    expect(result.status).toBe('pending')
    expect(result.is_terminal).toBe(false)
  })

  it('does not send Authorization header', async () => {
    const fetch = mockFetch(200, { status: 'ok' })
    vi.stubGlobal('fetch', fetch)
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    await client.checkStatus('rct_abc')
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['Authorization']).toBeUndefined()
  })
})

describe('ProofSlipClient.signup', () => {
  it('returns SignupResult on 201', async () => {
    const data = { api_key: 'ak_new_key', tier: 'free', message: 'Key created' }
    vi.stubGlobal('fetch', mockFetch(201, data))
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    const result = await client.signup('user@example.com')
    expect(result.api_key).toBe('ak_new_key')
    expect(result.tier).toBe('free')
  })

  it('sends source: "api" in body', async () => {
    const fetch = mockFetch(201, { api_key: 'ak_x', tier: 'free', message: 'ok' })
    vi.stubGlobal('fetch', fetch)
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    await client.signup('user@example.com')
    const [, init] = fetch.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body.source).toBe('api')
    expect(body.email).toBe('user@example.com')
  })

  it('throws ProofSlipError on 409 email exists', async () => {
    vi.stubGlobal('fetch', mockFetch(409, { error: 'email_exists', message: 'Already registered' }))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    try {
      await client.signup('existing@example.com')
    } catch (err) {
      expect((err as InstanceType<typeof ProofSlipError>).code).toBe('email_exists')
    }
  })
})

describe('ProofSlipClient — network errors', () => {
  it('throws ProofSlipError with code network_error on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    try {
      await client.verifyReceipt('rct_abc')
    } catch (err) {
      expect(err).toBeInstanceOf(ProofSlipError)
      expect((err as InstanceType<typeof ProofSlipError>).code).toBe('network_error')
      expect((err as InstanceType<typeof ProofSlipError>).status).toBe(0)
      expect((err as InstanceType<typeof ProofSlipError>).message).toBe('Connection refused')
    }
  })

  it('throws ProofSlipError with generic message for non-Error throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('string error'))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    try {
      await client.verifyReceipt('rct_abc')
    } catch (err) {
      expect((err as InstanceType<typeof ProofSlipError>).message).toBe('Network error')
    }
  })
})
