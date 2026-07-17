import { createMiddleware } from 'hono/factory'
import { nanoid } from 'nanoid'
import { errorResponse } from '../lib/errors.js'

/**
 * CORS middleware.
 * Allows any origin to call the API (public API).
 * Restricts methods and headers to what ProofSlip actually uses.
 */
export const cors = createMiddleware(async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
  c.header('Access-Control-Expose-Headers', 'X-Request-Id, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset')
  c.header('Access-Control-Max-Age', '86400')

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204)
  }

  await next()
})

/**
 * Attaches a unique request ID to every request/response.
 * Developers can reference this when reporting issues.
 */
export const requestId = createMiddleware(async (c, next) => {
  const id = c.req.header('x-request-id') || `req_${nanoid(16)}`
  c.set('requestId', id)
  c.header('X-Request-Id', id)
  await next()
})

/**
 * Rejects request bodies larger than maxBytes.
 * Prevents abuse before JSON parsing starts.
 */
export function bodyLimit(maxBytes: number) {
  return createMiddleware(async (c, next) => {
    const tooLarge = () =>
      errorResponse(c, 413, 'payload_too_large', `Request body must be ${Math.floor(maxBytes / 1024)}KB or smaller.`)

    const contentLength = c.req.header('content-length')
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      return tooLarge()
    }

    // The header can be absent (chunked) or lie — measure the actual bytes.
    // Hono caches the buffered body, so downstream json()/text() reuse it.
    if (c.req.method !== 'GET' && c.req.method !== 'HEAD' && c.req.raw.body) {
      const body = await c.req.arrayBuffer()
      if (body.byteLength > maxBytes) {
        return tooLarge()
      }
    }

    await next()
  })
}

/**
 * Security headers for all responses.
 */
export const securityHeaders = createMiddleware(async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
})
