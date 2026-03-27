import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import app from '../../src/index.js'

beforeAll(() => {
  vi.stubEnv('DEV_SECRET', 'test-secret-123')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('Dev console endpoint', () => {
  it('returns 404 without key', async () => {
    const res = await app.request('/dev/console')
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('not_found')
  })

  it('returns 404 with wrong key', async () => {
    const res = await app.request('/dev/console?key=wrong')
    expect(res.status).toBe(404)
  })

  it('returns HTML with correct key', async () => {
    const res = await app.request('/dev/console?key=test-secret-123')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Dev Console')
    expect(html).toContain('noindex')
    expect(html).toContain('preset-btn')
  })
})
