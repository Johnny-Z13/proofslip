import { Hono } from 'hono'
import { receiptsRouter } from './routes/receipts.js'

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/v1/receipts', receiptsRouter)

export default app
