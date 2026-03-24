import { describe, it, expect } from 'vitest'
import { checkRateLimit } from '../../src/lib/rate-limit.js'

describe('checkRateLimit', () => {
  it('allows requests within the limit', () => {
    const key = `test-allow-${Date.now()}`
    const result = checkRateLimit(key, 3, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('blocks requests over the limit', () => {
    const key = `test-block-${Date.now()}`
    checkRateLimit(key, 2, 60_000)
    checkRateLimit(key, 2, 60_000)
    const result = checkRateLimit(key, 2, 60_000)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('resets after window expires', async () => {
    const key = `test-reset-${Date.now()}`
    checkRateLimit(key, 1, 50) // 50ms window
    const blocked = checkRateLimit(key, 1, 50)
    expect(blocked.allowed).toBe(false)

    await new Promise((r) => setTimeout(r, 60))
    const fresh = checkRateLimit(key, 1, 50)
    expect(fresh.allowed).toBe(true)
  })

  it('tracks different keys independently', () => {
    const keyA = `test-a-${Date.now()}`
    const keyB = `test-b-${Date.now()}`
    checkRateLimit(keyA, 1, 60_000)
    const resultA = checkRateLimit(keyA, 1, 60_000)
    const resultB = checkRateLimit(keyB, 1, 60_000)
    expect(resultA.allowed).toBe(false)
    expect(resultB.allowed).toBe(true)
  })

  it('returns correct limit and resetAt fields', () => {
    const key = `test-fields-${Date.now()}`
    const result = checkRateLimit(key, 10, 60_000)
    expect(result.limit).toBe(10)
    expect(result.remaining).toBe(9)
    expect(typeof result.resetAt).toBe('number')
    expect(result.resetAt).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })
})
