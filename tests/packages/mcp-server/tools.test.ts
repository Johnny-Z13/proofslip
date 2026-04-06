import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProofSlipClient } from '@proofslip/sdk'

const BASE_URL = 'https://proofslip.ai'
const API_KEY = 'ak_test5678'

function makeFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.restoreAllMocks()
  delete process.env.PROOFSLIP_API_KEY
  delete process.env.PROOFSLIP_BASE_URL
})

import { afterEach } from 'vitest'
afterEach(() => {
  process.env = { ...originalEnv }
})

describe('createReceipt — request body', () => {
  it('sends all provided fields in the request body', async () => {
    const mockFetch = makeFetch(200, { receipt_id: 'rct_123' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    await client.createReceipt({
      type: 'file_upload',
      status: 'success',
      summary: 'Uploaded report.pdf',
      payload: { size: 1024, mime: 'application/pdf' },
      idempotency_key: 'upload-abc-123',
      expires_in: 3600,
    })

    const [, init] = mockFetch.mock.calls[0]
    const body = JSON.parse(init.body)

    expect(body.type).toBe('file_upload')
    expect(body.status).toBe('success')
    expect(body.summary).toBe('Uploaded report.pdf')
    expect(body.payload).toEqual({ size: 1024, mime: 'application/pdf' })
    expect(body.idempotency_key).toBe('upload-abc-123')
    expect(body.expires_in).toBe(3600)
  })

  it('sends minimal required fields without optional ones', async () => {
    const mockFetch = makeFetch(200, { receipt_id: 'rct_456' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    await client.createReceipt({
      type: 'action',
      status: 'pending',
      summary: 'Started job',
    })

    const [, init] = mockFetch.mock.calls[0]
    const body = JSON.parse(init.body)

    expect(body.type).toBe('action')
    expect(body.status).toBe('pending')
    expect(body.summary).toBe('Started job')
    expect(body.idempotency_key).toBeUndefined()
    expect(body.expires_in).toBeUndefined()
    expect(body.payload).toBeUndefined()
  })

  it('POSTs to /v1/receipts', async () => {
    const mockFetch = makeFetch(200, { receipt_id: 'rct_789' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    await client.createReceipt({ type: 'action', status: 'success', summary: 'done' })

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/v1/receipts`)
    expect(init.method).toBe('POST')
  })
})

describe('verifyReceipt — response data', () => {
  it('returns full receipt data from the API', async () => {
    const receipt = {
      receipt_id: 'rct_abc',
      type: 'file_upload',
      status: 'success',
      summary: 'Uploaded report.pdf',
      payload: { size: 1024 },
      created_at: '2026-04-04T00:00:00.000Z',
      expires_at: '2026-04-05T00:00:00.000Z',
      is_terminal: true,
    }
    const mockFetch = makeFetch(200, receipt)
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    const result = await client.verifyReceipt('rct_abc')

    expect(result).toEqual(receipt)
  })

  it('GETs /v1/verify/:id?format=json', async () => {
    const mockFetch = makeFetch(200, { receipt_id: 'rct_abc' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    await client.verifyReceipt('rct_abc')

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/v1/verify/rct_abc?format=json`)
  })
})

describe('checkStatus — response data', () => {
  it('returns minimal status data', async () => {
    const statusData = {
      status: 'pending',
      is_terminal: false,
      next_poll_after_seconds: 5,
    }
    const mockFetch = makeFetch(200, statusData)
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    const result = await client.checkStatus('rct_abc')

    expect(result).toEqual(statusData)
  })

  it('GETs /v1/receipts/:id/status', async () => {
    const mockFetch = makeFetch(200, { status: 'success' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    await client.checkStatus('rct_abc')

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/v1/receipts/rct_abc/status`)
  })
})

describe('signup — request body and auth', () => {
  it('sends email and source:api in the body', async () => {
    const mockFetch = makeFetch(200, { api_key: 'ak_newkey' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    await client.signup('test@example.com')

    const [, init] = mockFetch.mock.calls[0]
    const body = JSON.parse(init.body)

    expect(body.email).toBe('test@example.com')
    expect(body.source).toBe('api')
  })

  it('does NOT send Authorization header even when apiKey is set', async () => {
    const mockFetch = makeFetch(200, { api_key: 'ak_newkey' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    await client.signup('test@example.com')

    const [, init] = mockFetch.mock.calls[0]
    expect(init.headers['Authorization']).toBeUndefined()
  })

  it('POSTs to /v1/auth/signup', async () => {
    const mockFetch = makeFetch(200, { api_key: 'ak_newkey' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    await client.signup('user@example.com')

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/v1/auth/signup`)
    expect(init.method).toBe('POST')
  })
})
