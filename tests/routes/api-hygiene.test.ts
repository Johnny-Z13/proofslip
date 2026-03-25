import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/index.js'
import { seedTestApiKey, cleanupTestApiKey } from '../helpers.js'

let apiKey: string
let apiKeyId: string

beforeAll(async () => {
  const result = await seedTestApiKey()
  apiKey = result.key
  apiKeyId = result.keyId
})

afterAll(async () => {
  await cleanupTestApiKey(apiKeyId)
})

// ─── CORS ────────────────────────────────────────────────────────

describe('CORS', () => {
  it('returns CORS headers on API responses', async () => {
    const res = await app.request('/health')
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })

  it('handles OPTIONS preflight requests', async () => {
    const res = await app.request('/v1/receipts', { method: 'OPTIONS' })
    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-methods')).toContain('POST')
    expect(res.headers.get('access-control-allow-headers')).toContain('Authorization')
  })

  it('exposes rate limit and request ID headers', async () => {
    const res = await app.request('/health')
    const exposed = res.headers.get('access-control-expose-headers') || ''
    expect(exposed).toContain('X-Request-Id')
    expect(exposed).toContain('X-RateLimit-Limit')
  })
})

// ─── Request ID ──────────────────────────────────────────────────

describe('Request ID', () => {
  it('generates a request ID when none is provided', async () => {
    const res = await app.request('/health')
    const reqId = res.headers.get('x-request-id')
    expect(reqId).toBeTruthy()
    expect(reqId).toMatch(/^req_/)
  })

  it('echoes back a client-provided request ID', async () => {
    const res = await app.request('/health', {
      headers: { 'x-request-id': 'my-custom-id-123' },
    })
    expect(res.headers.get('x-request-id')).toBe('my-custom-id-123')
  })
})

// ─── Security Headers ────────────────────────────────────────────

describe('Security headers', () => {
  it('includes X-Content-Type-Options: nosniff', async () => {
    const res = await app.request('/health')
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('includes X-Frame-Options: DENY', async () => {
    const res = await app.request('/health')
    expect(res.headers.get('x-frame-options')).toBe('DENY')
  })

  it('includes Referrer-Policy', async () => {
    const res = await app.request('/health')
    expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
  })
})

// ─── Body Size Limit ─────────────────────────────────────────────

describe('Body size limit', () => {
  it('rejects requests with content-length over 16KB', async () => {
    const res = await app.request('/v1/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '100000',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ type: 'action', status: 'ok', summary: 'test' }),
    })
    expect(res.status).toBe(413)
    const body = await res.json()
    expect(body.error).toBe('payload_too_large')
  })

  it('allows normal-sized requests through', async () => {
    const res = await app.request('/v1/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        type: 'action',
        status: 'success',
        summary: 'Normal sized request',
      }),
    })
    expect(res.status).toBe(201)
  })
})

// ─── Global Error Handler ────────────────────────────────────────

describe('Error handling', () => {
  it('returns 404 JSON for unknown routes', async () => {
    const res = await app.request('/v1/nonexistent')
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('not_found')
  })

  it('includes request ID in error responses', async () => {
    const res = await app.request('/v1/nonexistent')
    expect(res.headers.get('x-request-id')).toBeTruthy()
  })
})
