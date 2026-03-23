import { describe, it, expect } from 'vitest'
import { generateReceiptId, generateApiKeyId, generateApiKey, getKeyPrefix } from '../../src/lib/ids.js'

describe('generateReceiptId', () => {
  it('starts with rct_ prefix', () => {
    expect(generateReceiptId()).toMatch(/^rct_/)
  })
  it('is 25 chars total (4 prefix + 21 nanoid)', () => {
    expect(generateReceiptId()).toHaveLength(25)
  })
  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateReceiptId()))
    expect(ids.size).toBe(100)
  })
})

describe('generateApiKey', () => {
  it('starts with ak_ prefix', () => {
    expect(generateApiKey()).toMatch(/^ak_/)
  })
  it('is 67 chars total (3 prefix + 64 hex)', () => {
    expect(generateApiKey()).toHaveLength(67)
  })
})

describe('getKeyPrefix', () => {
  it('returns first 11 chars (ak_ + 8 hex)', () => {
    const key = 'ak_abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    expect(getKeyPrefix(key)).toBe('ak_abcdef12')
  })
})
