import { describe, it, expect, afterAll } from 'vitest'
import app from '../../src/index.js'
import { getTestDb } from '../helpers.js'
import { apiKeys } from '../../src/db/schema.js'
import { eq } from 'drizzle-orm'

// Track created keys for cleanup
const createdEmails: string[] = []

afterAll(async () => {
  const db = getTestDb()
  for (const email of createdEmails) {
    await db.delete(apiKeys).where(eq(apiKeys.ownerEmail, email))
  }
})

let reqCounter = 0

function post(path: string, body: object) {
  reqCounter++
  return app.request(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': `10.0.0.${reqCounter}`,
    },
    body: JSON.stringify(body),
  })
}

describe('POST /v1/auth/signup', () => {
  it('creates an API key for a new email', async () => {
    const email = `signup-test-${Date.now()}@proofslip.ai`
    createdEmails.push(email)

    const res = await post('/v1/auth/signup', { email })
    expect(res.status).toBe(201)

    const data = await res.json()
    expect(data.api_key).toMatch(/^ak_[0-9a-f]{64}$/)
    expect(data.tier).toBe('free')
    expect(data.message).toContain('Save this key')
  })

  it('rejects duplicate email', async () => {
    const email = `dup-test-${Date.now()}@proofslip.ai`
    createdEmails.push(email)

    await post('/v1/auth/signup', { email })
    const res = await post('/v1/auth/signup', { email })
    expect(res.status).toBe(409)

    const data = await res.json()
    expect(data.error).toBe('email_exists')
  })

  it('rejects missing email', async () => {
    const res = await post('/v1/auth/signup', {})
    expect(res.status).toBe(400)
  })

  it('rejects invalid email format', async () => {
    const res = await post('/v1/auth/signup', { email: 'not-an-email' })
    expect(res.status).toBe(400)

    const data = await res.json()
    expect(data.error).toBe('validation_error')
  })

  it('returns a key that works for creating receipts', async () => {
    const email = `e2e-test-${Date.now()}@proofslip.ai`
    createdEmails.push(email)

    const signupRes = await post('/v1/auth/signup', { email })
    expect(signupRes.status).toBe(201)

    const { api_key } = await signupRes.json()
    expect(api_key).toMatch(/^ak_[0-9a-f]{64}$/)

    const receiptRes = await app.request('/v1/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.99',
        Authorization: `Bearer ${api_key}`,
      },
      body: JSON.stringify({
        type: 'action',
        status: 'success',
        summary: 'E2E test receipt',
      }),
    })

    expect(receiptRes.status).toBe(201)
    const receipt = await receiptRes.json()
    expect(receipt.receipt_id).toMatch(/^rct_/)
  })
})
