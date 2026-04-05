import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProofSlipClient } from '../../../packages/mcp-server/src/client.js'

const BASE_URL = 'https://proofslip.ai'
const API_KEY = 'ak_test1234'

function makeFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('ProofSlipClient.hasApiKey', () => {
  it('returns true when apiKey is provided', () => {
    const client = new ProofSlipClient(BASE_URL, API_KEY)
    expect(client.hasApiKey()).toBe(true)
  })

  it('returns false when apiKey is omitted', () => {
    const client = new ProofSlipClient(BASE_URL)
    expect(client.hasApiKey()).toBe(false)
  })

  it('returns false when apiKey is empty string', () => {
    const client = new ProofSlipClient(BASE_URL, '')
    expect(client.hasApiKey()).toBe(false)
  })
})

describe('ProofSlipClient.createReceipt — Authorization header', () => {
  it('sends Authorization header when apiKey is set', async () => {
    const mockFetch = makeFetch(200, { receipt_id: 'rct_123' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient(BASE_URL, API_KEY)
    await client.createReceipt({ type: 'action', status: 'success', summary: 'did a thing' })

    const [, init] = mockFetch.mock.calls[0]
    expect(init.headers['Authorization']).toBe(`Bearer ${API_KEY}`)
  })

  it('does NOT send Authorization header when apiKey is absent', async () => {
    const mockFetch = makeFetch(200, { receipt_id: 'rct_123' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient(BASE_URL)
    await client.createReceipt({ type: 'action', status: 'success', summary: 'did a thing' })

    const [, init] = mockFetch.mock.calls[0]
    expect(init.headers['Authorization']).toBeUndefined()
  })
})

describe('ProofSlipClient.verifyReceipt — no auth', () => {
  it('does NOT send Authorization header', async () => {
    const mockFetch = makeFetch(200, { receipt_id: 'rct_abc' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient(BASE_URL, API_KEY)
    await client.verifyReceipt('rct_abc')

    const [, init] = mockFetch.mock.calls[0]
    expect(init?.headers?.['Authorization']).toBeUndefined()
  })

  it('encodes the receipt ID in the URL', async () => {
    const mockFetch = makeFetch(200, { receipt_id: 'rct_has spaces&more' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient(BASE_URL, API_KEY)
    await client.verifyReceipt('rct_has spaces&more')

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain(encodeURIComponent('rct_has spaces&more'))
    expect(url).not.toContain(' ')
  })
})

describe('ProofSlipClient.checkStatus — no auth', () => {
  it('does NOT send Authorization header', async () => {
    const mockFetch = makeFetch(200, { status: 'success', is_terminal: true })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient(BASE_URL, API_KEY)
    await client.checkStatus('rct_abc')

    const [, init] = mockFetch.mock.calls[0]
    expect(init?.headers?.['Authorization']).toBeUndefined()
  })

  it('encodes receipt ID in the URL', async () => {
    const mockFetch = makeFetch(200, { status: 'success' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient(BASE_URL, API_KEY)
    await client.checkStatus('rct_special/chars?here')

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain(encodeURIComponent('rct_special/chars?here'))
  })
})

describe('ProofSlipClient — HTTP error responses', () => {
  it('returns ok:false on 401', async () => {
    const mockFetch = makeFetch(401, { error: 'unauthorized', message: 'Invalid API key' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient(BASE_URL, 'bad_key')
    const result = await client.createReceipt({ type: 'action', status: 'success', summary: 'x' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(401)
      expect(result.error).toBe('unauthorized')
      expect(result.message).toBe('Invalid API key')
    }
  })

  it('returns ok:false on 404', async () => {
    const mockFetch = makeFetch(404, { error: 'not_found', message: 'Receipt not found' })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient(BASE_URL)
    const result = await client.verifyReceipt('rct_missing')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(404)
      expect(result.error).toBe('not_found')
    }
  })

  it('returns ok:false on 500 with fallback error fields', async () => {
    const mockFetch = makeFetch(500, {})
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient(BASE_URL, API_KEY)
    const result = await client.createReceipt({ type: 'action', status: 'success', summary: 'x' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(500)
      expect(result.error).toBe('request_failed')
      expect(result.message).toBe('Request failed with status 500')
    }
  })
})

describe('ProofSlipClient — network errors', () => {
  it('returns ok:false with network_error on fetch throw', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Connection refused'))
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient(BASE_URL, API_KEY)
    const result = await client.createReceipt({ type: 'action', status: 'success', summary: 'x' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('network_error')
      expect(result.message).toBe('Connection refused')
      expect(result.status).toBe(0)
    }
  })

  it('returns ok:false with generic message for non-Error throws', async () => {
    const mockFetch = vi.fn().mockRejectedValue('some string error')
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient(BASE_URL, API_KEY)
    const result = await client.verifyReceipt('rct_abc')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('network_error')
      expect(result.message).toBe('Network error')
      expect(result.status).toBe(0)
    }
  })
})

describe('ProofSlipClient — successful responses return data', () => {
  it('returns ok:true with data on 200', async () => {
    const payload = { receipt_id: 'rct_abc', status: 'success' }
    const mockFetch = makeFetch(200, payload)
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient(BASE_URL, API_KEY)
    const result = await client.verifyReceipt('rct_abc')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual(payload)
    }
  })
})
