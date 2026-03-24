import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { receiptsRouter } from './routes/receipts.js'
import { verifyRouter } from './routes/verify.js'
import { renderLandingPage } from './views/landing-page.js'

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

export default app
