import { Hono } from 'hono'
import { receiptsRouter } from './routes/receipts.js'
import { verifyRouter } from './routes/verify.js'
import { authRouter } from './routes/auth.js'
import { cronRouter } from './routes/cron.js'
import { statusRouter } from './routes/status.js'
import { renderLandingPage } from './views/landing-page.js'
import { cors, requestId, bodyLimit, securityHeaders } from './middleware/security.js'
import { requestLogger } from './middleware/logger.js'

const app = new Hono()

// ─── Global middleware (order matters) ───────────────────────────
app.use('*', cors)
app.use('*', securityHeaders)
app.use('*', requestId)
app.use('*', bodyLimit(16_384)) // 16KB max body
app.use('*', requestLogger)

// ─── Global error handler ────────────────────────────────────────
app.onError((err, c) => {
  const requestIdValue = (c as any).get('requestId') || null
  console.error(JSON.stringify({
    ts: new Date().toISOString(),
    error: err.message,
    request_id: requestIdValue,
    method: c.req.method,
    path: c.req.path,
  }))

  return c.json({
    error: 'internal_error',
    message: 'An unexpected error occurred. Please try again later.',
    request_id: requestIdValue,
  }, 500)
})

// ─── Routes ──────────────────────────────────────────────────────
app.get('/', (c) => c.html(renderLandingPage()))
app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/v1/receipts', statusRouter)
app.route('/v1/receipts', receiptsRouter)
app.route('/v1/verify', verifyRouter)
app.route('/verify', verifyRouter)
app.route('/v1/auth', authRouter)
app.route('/cron', cronRouter)

// ─── 404 fallback ────────────────────────────────────────────────
app.notFound((c) => {
  return c.json({ error: 'not_found', message: 'Route not found.' }, 404)
})

export default app
