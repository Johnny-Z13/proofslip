import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/index.js'
import { seedTestApiKey, cleanupTestApiKey } from '../helpers.js'

let apiKey: string
let apiKeyId: string
let receiptId: string

beforeAll(async () => {
  const result = await seedTestApiKey()
  apiKey = result.key
  apiKeyId = result.keyId

  const res = await app.request('/v1/receipts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      type: 'action',
      status: 'success',
      summary: 'Content negotiation test receipt',
    }),
  })
  receiptId = (await res.json()).receipt_id
})

afterAll(async () => {
  await cleanupTestApiKey(apiKeyId)
})

describe('Verify content negotiation', () => {
  it('returns JSON when Accept: application/json', async () => {
    const res = await app.request(`/v1/verify/${receiptId}`, {
      headers: { Accept: 'application/json' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('application/json')
    const body = await res.json()
    expect(body.valid).toBe(true)
  })

  it('returns JSON when ?format=json', async () => {
    const res = await app.request(`/v1/verify/${receiptId}?format=json`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.valid).toBe(true)
  })

  it('returns HTML when Accept: text/html', async () => {
    const res = await app.request(`/v1/verify/${receiptId}`, {
      headers: { Accept: 'text/html' },
    })
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Departure Mono')
    expect(html).toContain('ProofSlip')
    expect(html).toContain('Verified')
  })

  it('returns HTML 404 page for missing receipt', async () => {
    const res = await app.request('/v1/verify/rct_nonexistent12345678', {
      headers: { Accept: 'text/html' },
    })
    expect(res.status).toBe(404)
    const html = await res.text()
    expect(html).toContain('Expired / Not Found')
  })

  it('works via /verify shortcut route too', async () => {
    const res = await app.request(`/verify/${receiptId}?format=json`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.receipt_id).toBe(receiptId)
  })
})
