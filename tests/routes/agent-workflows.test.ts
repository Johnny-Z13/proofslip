import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/index.js'
import { seedTestApiKey, cleanupTestApiKey } from '../helpers.js'

let apiKey: string
let apiKeyId: string

beforeAll(async () => {
  const result = await seedTestApiKey()
  apiKey = result.key
  apiKeyId = result.keyId
})

afterAll(async () => {
  await cleanupTestApiKey(apiKeyId)
})

function post(path: string, body: object, key?: string) {
  return app.request(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key !== undefined ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify(body),
  })
}

function get(path: string, headers?: Record<string, string>) {
  return app.request(path, { headers })
}

// ─── 1. Refund Bot: action + idempotency ────────────────────────

describe('Refund Bot — action receipt with safe retry', () => {
  let receiptId: string

  it('creates an action receipt', async () => {
    const res = await post('/v1/receipts', {
      type: 'action',
      status: 'success',
      summary: 'Refund of $42.00 issued to customer #8812',
      payload: { amount: 42, currency: 'USD', customer_id: '8812' },
      ref: { run_id: 'run_test_001', agent_id: 'refund-bot' },
      idempotency_key: 'test-refund-001',
    }, apiKey)

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.receipt_id).toMatch(/^rct_/)
    expect(body.type).toBe('action')
    expect(body.status).toBe('success')
    expect(body.verify_url).toContain(body.receipt_id)
    receiptId = body.receipt_id
  })

  it('verifies the receipt as JSON', async () => {
    const res = await get(`/v1/verify/${receiptId}?format=json`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.valid).toBe(true)
    expect(body.type).toBe('action')
    expect(body.payload).toEqual({ amount: 42, currency: 'USD', customer_id: '8812' })
  })

  it('retries with same idempotency key — gets same receipt back', async () => {
    const res = await post('/v1/receipts', {
      type: 'action',
      status: 'success',
      summary: 'Refund of $42.00 issued to customer #8812',
      payload: { amount: 42, currency: 'USD', customer_id: '8812' },
      ref: { run_id: 'run_test_001', agent_id: 'refund-bot' },
      idempotency_key: 'test-refund-001',
    }, apiKey)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.receipt_id).toBe(receiptId)
  })
})

// ─── 2. Approval Poller ─────────────────────────────────────────

describe('Approval Poller — pending receipt with polling', () => {
  let receiptId: string

  it('creates a pending approval receipt', async () => {
    const res = await post('/v1/receipts', {
      type: 'approval',
      status: 'pending',
      summary: 'Deploy to prod requires ops approval',
      payload: { requester: 'deploy-bot', environment: 'production' },
    }, apiKey)

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.type).toBe('approval')
    expect(body.status).toBe('pending')
    receiptId = body.receipt_id
  })

  it('polls the receipt — still pending', async () => {
    const res = await get(`/v1/verify/${receiptId}?format=json`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.valid).toBe(true)
    expect(body.status).toBe('pending')
    expect(body.payload).toEqual({ requester: 'deploy-bot', environment: 'production' })
  })
})

// ─── 3. Handshake Agent ─────────────────────────────────────────

describe('Handshake Agent — scope verification', () => {
  let receiptId: string

  it('creates a handshake receipt with scopes', async () => {
    const res = await post('/v1/receipts', {
      type: 'handshake',
      status: 'connected',
      summary: 'CRM tool connected with read-only access',
      payload: { tool: 'salesforce', read: true, write: false, scopes: ['contacts.read'] },
      ref: { agent_id: 'crm-agent', session_id: 'sess_abc' },
    }, apiKey)

    expect(res.status).toBe(201)
    receiptId = (await res.json()).receipt_id
  })

  it('verifies scopes in payload before proceeding', async () => {
    const res = await get(`/v1/verify/${receiptId}?format=json`)
    const body = await res.json()
    expect(body.payload.write).toBe(false)
    expect(body.payload.scopes).toContain('contacts.read')
  })
})

// ─── 4. Expired Receipt ─────────────────────────────────────────

describe('Expired Receipt — TTL enforcement', () => {
  it('creates a receipt with minimum TTL', async () => {
    const res = await post('/v1/receipts', {
      type: 'action',
      status: 'done',
      summary: 'Short-lived receipt for TTL test',
      expires_in: 60,
    }, apiKey)

    expect(res.status).toBe(201)
    const body = await res.json()
    const expiresAt = new Date(body.expires_at)
    const diff = expiresAt.getTime() - Date.now()
    expect(diff).toBeLessThan(65000)
    expect(diff).toBeGreaterThan(50000)
  })

  it('returns 404 for a nonexistent receipt', async () => {
    const res = await get('/v1/verify/rct_doesnotexist123456?format=json')
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('receipt_not_found')
  })
})

// ─── 5. Bad Actor — error cases ─────────────────────────────────

describe('Bad Actor — auth and validation errors', () => {
  it('rejects missing auth header', async () => {
    const res = await app.request('/v1/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'action', status: 'ok', summary: 'test' }),
    })
    expect(res.status).toBe(401)
  })

  it('rejects invalid API key format', async () => {
    const res = await post('/v1/receipts', {
      type: 'action', status: 'ok', summary: 'test',
    }, 'not-a-valid-key')
    expect(res.status).toBe(401)
  })

  it('rejects valid format but wrong key', async () => {
    const res = await post('/v1/receipts', {
      type: 'action', status: 'ok', summary: 'test',
    }, 'ak_0000000000000000000000000000000000000000000000000000000000000000')
    expect(res.status).toBe(401)
  })

  it('rejects invalid receipt type', async () => {
    const res = await post('/v1/receipts', {
      type: 'bogus', status: 'ok', summary: 'test',
    }, apiKey)
    expect(res.status).toBe(400)
  })

  it('rejects missing required fields', async () => {
    const res = await post('/v1/receipts', {
      type: 'action',
    }, apiKey)
    expect(res.status).toBe(400)
  })

  it('rejects summary over 280 chars', async () => {
    const res = await post('/v1/receipts', {
      type: 'action', status: 'ok', summary: 'x'.repeat(281),
    }, apiKey)
    expect(res.status).toBe(400)
  })

  it('returns 409 on idempotency conflict', async () => {
    await post('/v1/receipts', {
      type: 'action', status: 'success', summary: 'original',
      idempotency_key: 'conflict-test-key',
    }, apiKey)

    const res = await post('/v1/receipts', {
      type: 'failure', status: 'error', summary: 'different content',
      idempotency_key: 'conflict-test-key',
    }, apiKey)
    expect(res.status).toBe(409)
  })
})
