import { describe, it, expect } from 'vitest'
import app from '../../src/index.js'

// These paths reject before any database access, so they run without DATABASE_URL.
describe('error envelope consistency', () => {
  it('404 fallback includes error, message, and request_id', async () => {
    const res = await app.request('/no-such-route', {
      headers: { Accept: 'application/json' },
    })
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('not_found')
    expect(data.message).toBeTruthy()
    expect(data.request_id).toMatch(/^req_/)
  })

  it('413 body limit includes request_id', async () => {
    const res = await app.request('/v1/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': '999999' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(413)
    const data = await res.json()
    expect(data.error).toBe('payload_too_large')
    expect(data.request_id).toMatch(/^req_/)
  })

  it('401 missing auth includes request_id', async () => {
    const res = await app.request('/v1/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'action', status: 'success', summary: 'x' }),
    })
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('unauthorized')
    expect(data.request_id).toMatch(/^req_/)
  })

  it('echoes a caller-supplied x-request-id', async () => {
    const res = await app.request('/no-such-route', {
      headers: { Accept: 'application/json', 'x-request-id': 'req_caller123' },
    })
    const data = await res.json()
    expect(data.request_id).toBe('req_caller123')
    expect(res.headers.get('X-Request-Id')).toBe('req_caller123')
  })
})
