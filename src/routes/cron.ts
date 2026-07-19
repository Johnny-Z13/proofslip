import { Hono } from 'hono'
import { getDb } from '../db/client.js'
import { proofEvents, receipts } from '../db/schema.js'
import { lt } from 'drizzle-orm'
import { errorResponse } from '../lib/errors.js'

const cronRouter = new Hono()

// Vercel cron invokes this path with GET; POST kept for manual triggering.
cronRouter.on(['GET', 'POST'], '/cleanup', async (c) => {
  // Protect with a shared secret so only authorized callers can trigger.
  // Fail closed: if CRON_SECRET is not configured, nobody can trigger cleanup.
  const authHeader = c.req.header('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return errorResponse(c, 401, 'unauthorized', 'Invalid cron secret.')
  }

  const db = getDb()
  const now = new Date()
  const proofEventCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  // Delete in batches to avoid long-running queries
  const deleted = await db
    .delete(receipts)
    .where(lt(receipts.expiresAt, now))
    .returning({ id: receipts.id })

  const deletedProofEvents = await db
    .delete(proofEvents)
    .where(lt(proofEvents.createdAt, proofEventCutoff))
    .returning({ id: proofEvents.id })

  return c.json({
    deleted_count: deleted.length,
    deleted_proof_events_count: deletedProofEvents.length,
    cleaned_at: now.toISOString(),
  })
})

export { cronRouter }
