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

function createReceipt(body: object) {
  return app.request('/v1/receipts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })
}

describe('GET /v1/receipts/:id/status', () => {
  it('returns lightweight status for a terminal receipt', async () => {
    const createRes = await createReceipt({
      type: 'action',
      status: 'success',
      summary: 'Status endpoint test — terminal',
    })
    const { receipt_id } = await createRes.json()

    const res = await app.request(`/v1/receipts/${receipt_id}/status`)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.receipt_id).toBe(receipt_id)
    expect(body.status).toBe('success')
    expect(body.is_terminal).toBe(true)
    expect(body.next_poll_after_seconds).toBeNull()
    expect(body.expires_at).toBeTruthy()
    // Should NOT include heavy fields
    expect(body.summary).toBeUndefined()
    expect(body.payload).toBeUndefined()
    expect(body.ref).toBeUndefined()
  })

  it('returns polling guidance for a non-terminal receipt', async () => {
    const createRes = await createReceipt({
      type: 'approval',
      status: 'pending',
      summary: 'Status endpoint test — pending',
    })
    const { receipt_id } = await createRes.json()

    const res = await app.request(`/v1/receipts/${receipt_id}/status`)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.is_terminal).toBe(false)
    expect(body.next_poll_after_seconds).toBe(30)
  })

  it('returns 404 for nonexistent receipt', async () => {
    const res = await app.request('/v1/receipts/rct_doesnotexist123456/status')
    expect(res.status).toBe(404)
  })

  it('does not require API key auth', async () => {
    const createRes = await createReceipt({
      type: 'action',
      status: 'done',
      summary: 'No auth required for status check',
    })
    const { receipt_id } = await createRes.json()

    // No Authorization header
    const res = await app.request(`/v1/receipts/${receipt_id}/status`)
    expect(res.status).toBe(200)
  })
})

describe('GET /v1/verify/:id — polling fields', () => {
  it('includes is_terminal and next_poll_after_seconds in JSON response', async () => {
    const createRes = await createReceipt({
      type: 'approval',
      status: 'pending',
      summary: 'Polling fields test',
    })
    const { receipt_id } = await createRes.json()

    const res = await app.request(`/v1/verify/${receipt_id}?format=json`)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.is_terminal).toBe(false)
    expect(body.next_poll_after_seconds).toBe(30)
  })

  it('returns null next_poll for terminal receipts', async () => {
    const createRes = await createReceipt({
      type: 'action',
      status: 'success',
      summary: 'Terminal polling test',
    })
    const { receipt_id } = await createRes.json()

    const res = await app.request(`/v1/verify/${receipt_id}?format=json`)
    const body = await res.json()
    expect(body.is_terminal).toBe(true)
    expect(body.next_poll_after_seconds).toBeNull()
  })
})
