import { describe, it, expect } from 'vitest'
import { validateCreateReceipt, isValidationError } from '../../src/lib/validate.js'

describe('validateCreateReceipt', () => {
  const validBody = { type: 'action', status: 'success', summary: 'Test receipt' }

  it('accepts valid minimal body', () => {
    expect(isValidationError(validateCreateReceipt(validBody))).toBe(false)
  })

  it('rejects missing type', () => {
    const r = validateCreateReceipt({ status: 'ok', summary: 'test' })
    expect(isValidationError(r)).toBe(true)
  })

  it('rejects invalid type', () => {
    expect(isValidationError(validateCreateReceipt({ ...validBody, type: 'invalid' }))).toBe(true)
  })

  it('rejects missing summary', () => {
    expect(isValidationError(validateCreateReceipt({ type: 'action', status: 'ok' }))).toBe(true)
  })

  it('rejects summary over 280 chars', () => {
    expect(isValidationError(validateCreateReceipt({ ...validBody, summary: 'a'.repeat(281) }))).toBe(true)
  })

  it('rejects payload over 4KB', () => {
    expect(isValidationError(validateCreateReceipt({ ...validBody, payload: { data: 'x'.repeat(5000) } }))).toBe(true)
  })

  it('rejects non-object ref', () => {
    expect(isValidationError(validateCreateReceipt({ ...validBody, ref: 'hello' }))).toBe(true)
  })

  it('rejects expires_in under 60', () => {
    expect(isValidationError(validateCreateReceipt({ ...validBody, expires_in: 30 }))).toBe(true)
  })

  it('rejects expires_in over 86400', () => {
    expect(isValidationError(validateCreateReceipt({ ...validBody, expires_in: 100000 }))).toBe(true)
  })

  it('accepts full body with all optional fields', () => {
    const result = validateCreateReceipt({
      ...validBody,
      payload: { amount: 42 },
      ref: { run_id: 'run_123', agent_id: 'bot-1' },
      expires_in: 3600,
      idempotency_key: 'idem-123',
    })
    expect(isValidationError(result)).toBe(false)
  })
})
