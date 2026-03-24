import { Hono } from 'hono'
import { getDb } from '../db/client.js'
import { receipts } from '../db/schema.js'
import { lt } from 'drizzle-orm'
import { errorResponse } from '../lib/errors.js'

const cronRouter = new Hono()

cronRouter.post('/cleanup', async (c) => {
  // Protect with a shared secret so only authorized callers can trigger
  const authHeader = c.req.header('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return errorResponse(c, 401, 'unauthorized', 'Invalid cron secret.')
  }

  const db = getDb()
  const now = new Date()

  // Delete in batches to avoid long-running queries
  const deleted = await db
    .delete(receipts)
    .where(lt(receipts.expiresAt, now))
    .returning({ id: receipts.id })

  return c.json({
    deleted_count: deleted.length,
    cleaned_at: now.toISOString(),
  })
})

export { cronRouter }
