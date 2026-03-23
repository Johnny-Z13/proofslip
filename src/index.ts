import { Hono } from 'hono'
import { receiptsRouter } from './routes/receipts.js'
import { verifyRouter } from './routes/verify.js'

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/v1/receipts', receiptsRouter)
app.route('/v1/verify', verifyRouter)
app.route('/verify', verifyRouter)

export default app
