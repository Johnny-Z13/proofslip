import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { apiKeys, receipts } from '../src/db/schema.js'
import { generateApiKey, generateApiKeyId, getKeyPrefix } from '../src/lib/ids.js'
import { sha256 } from '../src/lib/hash.js'
import { eq } from 'drizzle-orm'

export function getTestDb() {
  const sql = neon(process.env.DATABASE_URL!)
  return drizzle(sql)
}

export async function seedTestApiKey() {
  const db = getTestDb()
  const key = generateApiKey()
  const keyId = generateApiKeyId()

  await db.insert(apiKeys).values({
    id: keyId,
    keyPrefix: getKeyPrefix(key),
    keyHash: sha256(key),
    ownerEmail: 'test@proofslip.ai',
    tier: 'free',
    usageResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })

  return { key, keyId }
}

export async function cleanupTestApiKey(keyId: string) {
  const db = getTestDb()
  await db.delete(receipts).where(eq(receipts.apiKeyId, keyId))
  await db.delete(apiKeys).where(eq(apiKeys.id, keyId))
}
