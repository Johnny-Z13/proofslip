import { Hono } from 'hono'
import { getDb } from '../db/client.js'
import { apiKeys } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { generateApiKey, generateApiKeyId, getKeyPrefix } from '../lib/ids.js'
import { sha256 } from '../lib/hash.js'
import { errorResponse } from '../lib/errors.js'
import { rateLimitByIp } from '../middleware/rate-limit.js'

const authRouter = new Hono()

authRouter.use('*', rateLimitByIp(5))

authRouter.post('/signup', async (c) => {
  const body = await c.req.json().catch(() => null)

  if (!body || typeof body.email !== 'string' || !body.email.trim()) {
    return errorResponse(c, 400, 'validation_error', 'Missing required field: email')
  }

  const email = body.email.trim().toLowerCase()

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse(c, 400, 'validation_error', 'Invalid email format.')
  }

  const db = getDb()

  // Check if email already has a key
  const existing = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(eq(apiKeys.ownerEmail, email))

  if (existing.length > 0) {
    return errorResponse(c, 409, 'email_exists', 'An API key already exists for this email. Contact support to rotate your key.')
  }

  const key = generateApiKey()
  const keyId = generateApiKeyId()

  await db.insert(apiKeys).values({
    id: keyId,
    keyPrefix: getKeyPrefix(key),
    keyHash: sha256(key),
    ownerEmail: email,
    tier: 'free',
    usageResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })

  return c.json({
    api_key: key,
    tier: 'free',
    message: 'Save this key now. It cannot be retrieved later.',
  }, 201)
})

export { authRouter }
