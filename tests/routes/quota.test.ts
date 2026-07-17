import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/index.js'
import { seedTestApiKey, cleanupTestApiKey, getTestDb } from '../helpers.js'
import { apiKeys } from '../../src/db/schema.js'
import { eq } from 'drizzle-orm'

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

function postReceipt() {
  return app.request('/v1/receipts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      type: 'action',
      status: 'success',
      summary: 'Quota test receipt',
    }),
  })
}

describe('free-tier quota enforcement', () => {
  it('rejects creation once the monthly limit is reached', async () => {
    const db = getTestDb()
    await db.update(apiKeys).set({ usageCount: 500 }).where(eq(apiKeys.id, apiKeyId))

    const res = await postReceipt()
    expect(res.status).toBe(429)
    const data = await res.json()
    expect(data.error).toBe('quota_exceeded')
    expect(data.request_id).toBeTruthy()
  })

  it('resets the counter when the usage window has passed', async () => {
    const db = getTestDb()
    await db.update(apiKeys)
      .set({ usageCount: 500, usageResetAt: new Date(Date.now() - 1000) })
      .where(eq(apiKeys.id, apiKeyId))

    const res = await postReceipt()
    expect(res.status).toBe(201)
  })
})
