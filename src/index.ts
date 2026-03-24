import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { receiptsRouter } from './routes/receipts.js'
import { verifyRouter } from './routes/verify.js'
import { authRouter } from './routes/auth.js'
import { cronRouter } from './routes/cron.js'
import { renderLandingPage } from './views/landing-page.js'
import { rateLimitByIp } from './middleware/rate-limit.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fontPath = resolve(__dirname, 'public/fonts/DepartureMono-Regular.woff2')
const fontBuffer = readFileSync(fontPath)

const app = new Hono()

app.get('/fonts/DepartureMono-Regular.woff2', (c) => {
  c.header('Content-Type', 'font/woff2')
  c.header('Cache-Control', 'public, max-age=31536000, immutable')
  return c.body(fontBuffer)
})
app.get('/', (c) => c.html(renderLandingPage()))
app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/v1/receipts', receiptsRouter)
app.route('/v1/verify', verifyRouter)
app.route('/verify', verifyRouter)
app.route('/v1/auth', authRouter)
app.route('/cron', cronRouter)

export default app
