import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/index.js'
import { seedTestApiKey, cleanupTestApiKey, getTestDb } from '../helpers.js'
import { proofEvents, receipts } from '../../src/db/schema.js'
import { eq } from 'drizzle-orm'

let apiKey: string
let apiKeyId: string
let originalCronSecret: string | undefined

const TEST_CRON_SECRET = 'test-cron-secret'
const OLD_EVENT_ID = `pevt_cron_old_${Date.now()}`
const FRESH_EVENT_ID = `pevt_cron_fresh_${Date.now()}`

beforeAll(async () => {
  const result = await seedTestApiKey()
  apiKey = result.key
  apiKeyId = result.keyId
  originalCronSecret = process.env.CRON_SECRET
  process.env.CRON_SECRET = TEST_CRON_SECRET
})

afterAll(async () => {
  const db = getTestDb()
  await db.delete(proofEvents).where(eq(proofEvents.id, OLD_EVENT_ID))
  await db.delete(proofEvents).where(eq(proofEvents.id, FRESH_EVENT_ID))
  await cleanupTestApiKey(apiKeyId)
  if (originalCronSecret === undefined) {
    delete process.env.CRON_SECRET
  } else {
    process.env.CRON_SECRET = originalCronSecret
  }
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
    await db
      .update(receipts)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(receipts.id, receipt_id))

    // Run cleanup
    const res = await app.request('/cron/cleanup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_CRON_SECRET}`,
      },
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

  it('deletes aggregate proof events after 90 days and keeps fresh events', async () => {
    const db = getTestDb()
    await db.insert(proofEvents).values([
      {
        id: OLD_EVENT_ID,
        event: 'release_proof_fetched_json',
        createdAt: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000),
      },
      {
        id: FRESH_EVENT_ID,
        event: 'release_proof_fetched_json',
        createdAt: new Date(),
      },
    ])

    const res = await app.request('/cron/cleanup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${TEST_CRON_SECRET}` },
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.deleted_proof_events_count).toBeGreaterThanOrEqual(1)

    const oldRows = await db.select().from(proofEvents).where(eq(proofEvents.id, OLD_EVENT_ID))
    const freshRows = await db.select().from(proofEvents).where(eq(proofEvents.id, FRESH_EVENT_ID))
    expect(oldRows).toHaveLength(0)
    expect(freshRows).toHaveLength(1)
  })

  it('returns 0 deleted when nothing is expired', async () => {
    const res = await app.request('/cron/cleanup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_CRON_SECRET}`,
      },
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.deleted_count).toBeGreaterThanOrEqual(0)
  })

  it('rejects invalid cron secret when CRON_SECRET is set', async () => {
    const res = await app.request('/cron/cleanup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer wrong-secret',
      },
    })
    expect(res.status).toBe(401)
  })

  it('accepts GET requests (Vercel cron invokes with GET)', async () => {
    const res = await app.request('/cron/cleanup', {
      method: 'GET',
      headers: { Authorization: `Bearer ${TEST_CRON_SECRET}` },
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.deleted_count).toBeGreaterThanOrEqual(0)
  })

  it('rejects all callers when CRON_SECRET is unset (fail closed)', async () => {
    delete process.env.CRON_SECRET

    try {
      const res = await app.request('/cron/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status).toBe(401)
    } finally {
      process.env.CRON_SECRET = TEST_CRON_SECRET
    }
  })
})
