import { describe, it, expect } from 'vitest'
import { sha256 } from '../../src/lib/hash.js'

describe('sha256', () => {
  it('returns consistent hash for same input', () => {
    expect(sha256('test')).toBe(sha256('test'))
  })
  it('returns different hash for different input', () => {
    expect(sha256('a')).not.toBe(sha256('b'))
  })
  it('returns 64-char hex string', () => {
    expect(sha256('test')).toHaveLength(64)
    expect(sha256('test')).toMatch(/^[0-9a-f]+$/)
  })
})
