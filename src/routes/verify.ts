import { Hono } from 'hono'
import { getDb } from '../db/client.js'
import { receipts } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { renderVerifyPage } from '../views/verify-page.js'
import { renderNotFoundPage } from '../views/not-found-page.js'
import { rateLimitByIp } from '../middleware/rate-limit.js'
import { isTerminal, getNextPollAfterSeconds } from '../lib/polling.js'

const verifyRouter = new Hono()

verifyRouter.use('*', rateLimitByIp(120))

verifyRouter.get('/:receiptId', async (c) => {
  const receiptId = c.req.param('receiptId')
  const db = getDb()

  const results = await db
    .select()
    .from(receipts)
    .where(eq(receipts.id, receiptId))

  const receipt = results[0]

  if (!receipt || receipt.expiresAt < new Date()) {
    const wantsJson =
      c.req.header('Accept')?.includes('application/json') ||
      c.req.query('format') === 'json'

    if (wantsJson) {
      return c.json(
        { error: 'receipt_not_found', message: 'Receipt does not exist, has expired, or has been deleted.' },
        404
      )
    }
    return c.html(renderNotFoundPage(), 404)
  }

  const terminal = isTerminal(receipt.type, receipt.status)
  const nextPoll = getNextPollAfterSeconds(receipt.type, receipt.status)

  const wantsJson =
    c.req.header('Accept')?.includes('application/json') ||
    c.req.query('format') === 'json'

  if (wantsJson) {
    return c.json({
      receipt_id: receipt.id,
      valid: true,
      type: receipt.type,
      status: receipt.status,
      summary: receipt.summary,
      payload: receipt.payload,
      ref: receipt.ref,
      created_at: receipt.createdAt.toISOString(),
      expires_at: receipt.expiresAt.toISOString(),
      expired: false,
      is_terminal: terminal,
      next_poll_after_seconds: nextPoll,
    })
  }

  return c.html(renderVerifyPage({
    id: receipt.id,
    type: receipt.type,
    status: receipt.status,
    summary: receipt.summary,
    payload: receipt.payload,
    ref: receipt.ref,
    createdAt: receipt.createdAt.toISOString(),
    expiresAt: receipt.expiresAt.toISOString(),
  }))
})

export { verifyRouter }
