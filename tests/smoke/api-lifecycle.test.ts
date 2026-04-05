import { describe, it, expect } from 'vitest'

const BASE = process.env.PROOFSLIP_BASE_URL || 'https://www.proofslip.ai'
const API_KEY = process.env.PROOFSLIP_API_KEY

describe('Smoke: API Lifecycle', () => {
  let receiptId: string
  let verifyUrl: string
  const idempotencyKey = `test_${Date.now()}_${Math.random().toString(36).slice(2)}`

  it('health check returns 200', async () => {
    const res = await fetch(`${BASE}/health`)
    expect(res.status).toBe(200)
  })

  it('creates a receipt', async () => {
    expect(API_KEY).toBeTruthy()
    const res = await fetch(`${BASE}/v1/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        type: 'action',
        status: 'completed',
        summary: `Automated test receipt ${new Date().toISOString()}`,
        idempotency_key: idempotencyKey,
        expires_in: 60,
      }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.receipt_id).toMatch(/^rct_/)
    expect(data.verify_url).toContain('/verify/')
    receiptId = data.receipt_id
    verifyUrl = data.verify_url
  })

  it('verifies the receipt (JSON)', async () => {
    const res = await fetch(`${BASE}/v1/verify/${receiptId}?format=json`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.receipt_id).toBe(receiptId)
    expect(data.type).toBe('action')
    expect(data.status).toBe('completed')
    expect(data.summary).toContain('Automated test receipt')
    expect(data.is_terminal).toBe(true)
  })

  it('polls receipt status', async () => {
    const res = await fetch(`${BASE}/v1/receipts/${receiptId}/status`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.receipt_id).toBe(receiptId)
    expect(data.status).toBe('completed')
    expect(data.is_terminal).toBe(true)
    expect(data).toHaveProperty('expires_at')
  })

  it('idempotency returns same receipt', async () => {
    const res = await fetch(`${BASE}/v1/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        type: 'action',
        status: 'completed',
        summary: 'Idempotency conflict test',
        idempotency_key: idempotencyKey,
        expires_in: 60,
      }),
    })
    // 409 = same idempotency key with different content — proves idempotency check works
    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error).toBe('idempotency_conflict')
  })

  it('verifies the receipt (HTML)', async () => {
    const res = await fetch(`${BASE}/v1/verify/${receiptId}`, {
      headers: { Accept: 'text/html' },
    })
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(res.headers.get('content-type')).toContain('text/html')
    expect(html).toContain(receiptId)
  })
})
