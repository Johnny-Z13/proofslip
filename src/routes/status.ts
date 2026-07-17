import { Hono } from 'hono'
import { getDb } from '../db/client.js'
import { receipts } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { rateLimitByIp } from '../middleware/rate-limit.js'
import { isTerminal, getNextPollAfterSeconds } from '../lib/polling.js'
import { errorResponse } from '../lib/errors.js'

const statusRouter = new Hono()

statusRouter.use('*', rateLimitByIp(120))

/**
 * Lightweight status-only endpoint for polling.
 * Returns minimal payload — no summary, payload, or ref.
 */
statusRouter.get('/:receiptId/status', async (c) => {
  const receiptId = c.req.param('receiptId')
  const db = getDb()

  // Only select the columns we need
  const results = await db
    .select({
      id: receipts.id,
      type: receipts.type,
      status: receipts.status,
      expiresAt: receipts.expiresAt,
    })
    .from(receipts)
    .where(eq(receipts.id, receiptId))

  const receipt = results[0]

  if (!receipt || receipt.expiresAt < new Date()) {
    return errorResponse(c, 404, 'receipt_not_found', 'Receipt does not exist, has expired, or has been deleted.')
  }

  const terminal = isTerminal(receipt.type, receipt.status)
  const nextPoll = getNextPollAfterSeconds(receipt.type, receipt.status)

  return c.json({
    receipt_id: receipt.id,
    status: receipt.status,
    is_terminal: terminal,
    next_poll_after_seconds: nextPoll,
    expires_at: receipt.expiresAt.toISOString(),
  })
})

export { statusRouter }
