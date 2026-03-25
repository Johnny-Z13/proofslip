import { Hono } from 'hono'
import { getDb } from '../db/client.js'
import { receipts, apiKeys } from '../db/schema.js'
import { eq, and, sql } from 'drizzle-orm'
import { generateReceiptId } from '../lib/ids.js'
import { validateCreateReceipt, isValidationError } from '../lib/validate.js'
import { errorResponse } from '../lib/errors.js'
import { apiKeyAuth } from '../middleware/api-key-auth.js'
import { rateLimitByApiKey } from '../middleware/rate-limit.js'
import { isTerminal, getNextPollAfterSeconds } from '../lib/polling.js'

const receiptsRouter = new Hono()

receiptsRouter.use('*', apiKeyAuth)
receiptsRouter.use('*', rateLimitByApiKey)

receiptsRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const validated = validateCreateReceipt(body)

  if (isValidationError(validated)) {
    return errorResponse(c, 400, validated.error, validated.message)
  }

  const apiKeyRecord = (c as any).get('apiKeyRecord') as { id: string }
  const db = getDb()

  // Idempotency check
  if (validated.idempotency_key) {
    const existing = await db
      .select()
      .from(receipts)
      .where(
        and(
          eq(receipts.apiKeyId, apiKeyRecord.id),
          eq(receipts.idempotencyKey, validated.idempotency_key)
        )
      )

    if (existing.length > 0) {
      const receipt = existing[0]

      // Detect conflict: same key but different content
      if (receipt.type !== validated.type || receipt.status !== validated.status || receipt.summary !== validated.summary) {
        return errorResponse(c, 409, 'idempotency_conflict', 'A receipt with this idempotency_key already exists with different content.')
      }

      const baseUrl = process.env.BASE_URL || 'https://proofslip.ai'
      return c.json({
        receipt_id: receipt.id,
        type: receipt.type,
        status: receipt.status,
        summary: receipt.summary,
        verify_url: `${baseUrl}/verify/${receipt.id}`,
        created_at: receipt.createdAt.toISOString(),
        expires_at: receipt.expiresAt.toISOString(),
        idempotency_key: receipt.idempotencyKey,
        is_terminal: isTerminal(receipt.type, receipt.status),
        next_poll_after_seconds: getNextPollAfterSeconds(receipt.type, receipt.status),
      }, 200)
    }
  }

  const receiptId = generateReceiptId()
  const expiresIn = validated.expires_in || 86400
  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  await db.insert(receipts).values({
    id: receiptId,
    apiKeyId: apiKeyRecord.id,
    type: validated.type,
    status: validated.status,
    summary: validated.summary,
    payload: validated.payload || null,
    ref: validated.ref || null,
    idempotencyKey: validated.idempotency_key || null,
    expiresAt,
  })

  // Increment usage count (must await — Vercel kills execution after response)
  await db.update(apiKeys)
    .set({ usageCount: sql`${apiKeys.usageCount} + 1` })
    .where(eq(apiKeys.id, apiKeyRecord.id))
    .catch(() => {})

  const baseUrl = process.env.BASE_URL || 'https://proofslip.ai'

  return c.json({
    receipt_id: receiptId,
    type: validated.type,
    status: validated.status,
    summary: validated.summary,
    verify_url: `${baseUrl}/verify/${receiptId}`,
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    idempotency_key: validated.idempotency_key || null,
    is_terminal: isTerminal(validated.type, validated.status),
    next_poll_after_seconds: getNextPollAfterSeconds(validated.type, validated.status),
  }, 201)
})

export { receiptsRouter }
