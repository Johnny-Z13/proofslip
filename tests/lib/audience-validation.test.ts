import { describe, it, expect } from 'vitest'
import { validateCreateReceipt, isValidationError } from '../../src/lib/validate.js'

describe('audience field validation', () => {
  const validBody = { type: 'action', status: 'success', summary: 'Test receipt' }

  it('accepts audience: "human"', () => {
    const result = validateCreateReceipt({ ...validBody, audience: 'human' })
    expect(isValidationError(result)).toBe(false)
    if (!isValidationError(result)) {
      expect(result.audience).toBe('human')
    }
  })

  it('accepts missing audience', () => {
    const result = validateCreateReceipt(validBody)
    expect(isValidationError(result)).toBe(false)
    if (!isValidationError(result)) {
      expect(result.audience).toBeUndefined()
    }
  })

  it('rejects invalid audience value', () => {
    const result = validateCreateReceipt({ ...validBody, audience: 'bot' })
    expect(isValidationError(result)).toBe(true)
    if (isValidationError(result)) {
      expect(result.message).toContain('audience')
    }
  })

  it('rejects non-string audience', () => {
    const result = validateCreateReceipt({ ...validBody, audience: 123 })
    expect(isValidationError(result)).toBe(true)
  })
})
