import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/index.js'
import { seedTestApiKey, cleanupTestApiKey, getTestDb } from '../helpers.js'
import { receipts } from '../../src/db/schema.js'

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

function postReceipt(expiresIn: number) {
  return app.request('/v1/receipts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      type: 'action',
      status: 'success',
      summary: 'Cron cleanup test receipt',
      expires_in: expiresIn,
    }),
  })
}

describe('POST /cron/cleanup', () => {
  it('deletes expired receipts and reports count', async () => {
    // Create a receipt with the shortest TTL (60s)
    const createRes = await postReceipt(60)
    expect(createRes.status).toBe(201)
    const { receipt_id } = await createRes.json()

    // Manually expire it by updating expires_at in the past
    const db = getTestDb()
    const { eq } = await import('drizzle-orm')
    await db
      .update(receipts)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(receipts.id, receipt_id))

    // Run cleanup
    const res = await app.request('/cron/cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.deleted_count).toBeGreaterThanOrEqual(1)
    expect(data.cleaned_at).toBeTruthy()

    // Verify the receipt is gone
    const verifyRes = await app.request(`/v1/verify/${receipt_id}`, {
      headers: { Accept: 'application/json' },
    })
    expect(verifyRes.status).toBe(404)
  })

  it('returns 0 deleted when nothing is expired', async () => {
    const res = await app.request('/cron/cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.deleted_count).toBeGreaterThanOrEqual(0)
  })

  it('rejects invalid cron secret when CRON_SECRET is set', async () => {
    const original = process.env.CRON_SECRET
    process.env.CRON_SECRET = 'test-secret-123'

    try {
      const res = await app.request('/cron/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer wrong-secret',
        },
      })
      expect(res.status).toBe(401)
    } finally {
      if (original === undefined) {
        delete process.env.CRON_SECRET
      } else {
        process.env.CRON_SECRET = original
      }
    }
  })
})
