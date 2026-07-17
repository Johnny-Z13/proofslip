import { Hono } from 'hono'
import { getDb } from '../db/client.js'
import { receipts, apiKeys } from '../db/schema.js'
import { eq, and, sql } from 'drizzle-orm'
import { generateReceiptId } from '../lib/ids.js'
import { validateCreateReceipt, isValidationError, type CreateReceiptInput } from '../lib/validate.js'
import { errorResponse } from '../lib/errors.js'
import { apiKeyAuth } from '../middleware/api-key-auth.js'
import { rateLimitByApiKey } from '../middleware/rate-limit.js'
import { isTerminal, getNextPollAfterSeconds } from '../lib/polling.js'
import { stableStringify } from '../lib/stable-json.js'

const receiptsRouter = new Hono()

receiptsRouter.use('*', apiKeyAuth)
receiptsRouter.use('*', rateLimitByApiKey)

type ReceiptRow = typeof receipts.$inferSelect
type ApiKeyRow = typeof apiKeys.$inferSelect

// Advertised free-tier limit (docs, llms.txt, package READMEs all say 500/month)
const FREE_TIER_MONTHLY_LIMIT = 500

function receiptJson(receipt: ReceiptRow) {
  const baseUrl = process.env.BASE_URL || 'https://proofslip.ai'
  return {
    receipt_id: receipt.id,
    type: receipt.type,
    status: receipt.status,
    summary: receipt.summary,
    verify_url: `${baseUrl}/verify/${receipt.id}`,
    created_at: receipt.createdAt.toISOString(),
    expires_at: receipt.expiresAt.toISOString(),
    idempotency_key: receipt.idempotencyKey,
    ...(receipt.audience ? { audience: receipt.audience } : {}),
    is_terminal: isTerminal(receipt.type, receipt.status),
    next_poll_after_seconds: getNextPollAfterSeconds(receipt.type, receipt.status),
  }
}

function conflictsWith(receipt: ReceiptRow, validated: CreateReceiptInput): boolean {
  return (
    receipt.type !== validated.type ||
    receipt.status !== validated.status ||
    receipt.summary !== validated.summary ||
    receipt.audience !== (validated.audience || null) ||
    stableStringify(receipt.payload) !== stableStringify(validated.payload || null) ||
    stableStringify(receipt.ref) !== stableStringify(validated.ref || null)
  )
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; message?: string }
  return e?.code === '23505' || !!e?.message?.includes('idx_receipts_idempotency')
}

receiptsRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const validated = validateCreateReceipt(body)

  if (isValidationError(validated)) {
    return errorResponse(c, 400, validated.error, validated.message)
  }

  const apiKeyRecord = (c as any).get('apiKeyRecord') as ApiKeyRow
  const db = getDb()

  const findExisting = async (): Promise<ReceiptRow | undefined> => {
    if (!validated.idempotency_key) return undefined
    const rows = await db
      .select()
      .from(receipts)
      .where(
        and(
          eq(receipts.apiKeyId, apiKeyRecord.id),
          eq(receipts.idempotencyKey, validated.idempotency_key)
        )
      )
    return rows[0]
  }

  // Idempotency check — replays return the stored receipt and never consume quota
  const existing = await findExisting()
  if (existing) {
    // Detect conflict: same key but different content
    if (conflictsWith(existing, validated)) {
      return errorResponse(c, 409, 'idempotency_conflict', 'A receipt with this idempotency_key already exists with different content.')
    }
    return c.json(receiptJson(existing), 200)
  }

  // Enforce the advertised free-tier quota. Reset the counter when the window has passed.
  if (apiKeyRecord.tier === 'free') {
    let usage = apiKeyRecord.usageCount ?? 0
    if (apiKeyRecord.usageResetAt && apiKeyRecord.usageResetAt < new Date()) {
      usage = 0
      await db.update(apiKeys)
        .set({ usageCount: 0, usageResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
        .where(eq(apiKeys.id, apiKeyRecord.id))
        .catch(() => {})
    }
    if (usage >= FREE_TIER_MONTHLY_LIMIT) {
      return errorResponse(c, 429, 'quota_exceeded', `Free tier limit of ${FREE_TIER_MONTHLY_LIMIT} receipts per month reached. Quota resets at ${apiKeyRecord.usageResetAt?.toISOString() ?? 'the start of your next usage window'}.`)
    }
  }

  const receiptId = generateReceiptId()
  const expiresIn = validated.expires_in || 86400
  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  let inserted: ReceiptRow
  try {
    const rows = await db.insert(receipts).values({
      id: receiptId,
      apiKeyId: apiKeyRecord.id,
      type: validated.type,
      status: validated.status,
      summary: validated.summary,
      payload: validated.payload || null,
      ref: validated.ref || null,
      idempotencyKey: validated.idempotency_key || null,
      audience: validated.audience || null,
      expiresAt,
    }).returning()
    inserted = rows[0]
  } catch (err) {
    // Concurrent request with the same idempotency_key won the insert race —
    // fall back to the row it created instead of surfacing a 500.
    if (isUniqueViolation(err)) {
      const winner = await findExisting()
      if (winner) {
        if (conflictsWith(winner, validated)) {
          return errorResponse(c, 409, 'idempotency_conflict', 'A receipt with this idempotency_key already exists with different content.')
        }
        return c.json(receiptJson(winner), 200)
      }
    }
    throw err
  }

  // Increment usage count (must await — Vercel kills execution after response)
  await db.update(apiKeys)
    .set({ usageCount: sql`${apiKeys.usageCount} + 1` })
    .where(eq(apiKeys.id, apiKeyRecord.id))
    .catch(() => {})

  return c.json(receiptJson(inserted), 201)
})

export { receiptsRouter }
