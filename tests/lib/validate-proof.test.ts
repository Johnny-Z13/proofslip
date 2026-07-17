import { describe, it, expect } from 'vitest'
import { validateCreateProof, isProofValidationError, PROOF_SCHEMA_VERSION } from '../../src/lib/validate-proof.js'

function expectError(body: unknown, messagePart: string) {
  const result = validateCreateProof(body)
  expect(isProofValidationError(result)).toBe(true)
  if (isProofValidationError(result)) {
    expect(result.error).toBe('validation_error')
    expect(result.message).toContain(messagePart)
  }
}

describe('validateCreateProof', () => {
  it('accepts an empty body — a bare OIDC-authenticated POST is valid', () => {
    const result = validateCreateProof(undefined)
    expect(isProofValidationError(result)).toBe(false)
    if (!isProofValidationError(result)) {
      expect(result.schema_version).toBe(PROOF_SCHEMA_VERSION)
      expect(result.idempotency_key).toBeUndefined()
      expect(result.deployment).toBeUndefined()
      expect(result.submitted_context).toBeUndefined()
    }
  })

  it('accepts a full valid body', () => {
    const result = validateCreateProof({
      schema_version: PROOF_SCHEMA_VERSION,
      idempotency_key: 'octo-org/octo-repo:1234567890:1',
      deployment: { url: 'https://app.example.com', health_path: '/health' },
      submitted_context: { environment: 'production' },
    })
    expect(isProofValidationError(result)).toBe(false)
    if (!isProofValidationError(result)) {
      expect(result.deployment?.url).toBe('https://app.example.com')
      expect(result.submitted_context).toEqual({ environment: 'production' })
    }
  })

  it('rejects an unknown schema_version', () => {
    expectError({ schema_version: 'release-proof/v2' }, PROOF_SCHEMA_VERSION)
  })

  it('rejects an empty idempotency_key', () => {
    expectError({ idempotency_key: '  ' }, 'idempotency_key')
  })

  it('rejects an idempotency_key over 255 chars', () => {
    expectError({ idempotency_key: 'x'.repeat(256) }, '255')
  })

  it('rejects a deployment.url over 512 chars', () => {
    expectError({ deployment: { url: `https://example.com/${'x'.repeat(512)}` } }, '512')
  })

  it('rejects a non-observable deployment.url', () => {
    expectError({ deployment: { url: 'http://app.example.com' } }, 'https_required')
    expectError({ deployment: { url: 'https://10.0.0.1' } }, 'ip_literal_not_allowed')
    expectError({ deployment: { url: 'https://db.internal' } }, 'non_public_hostname')
  })

  it('rejects a health_path that does not start with /', () => {
    expectError({ deployment: { url: 'https://app.example.com', health_path: 'health' } }, 'health_path')
  })

  it('rejects submitted_context with more than 10 entries', () => {
    const ctx = Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`k${i}`, 'v']))
    expectError({ submitted_context: ctx }, '10')
  })

  it('rejects submitted_context with non-string values', () => {
    expectError({ submitted_context: { count: 3 } }, 'strings')
    expectError({ submitted_context: { nested: { a: 1 } } }, 'strings')
  })

  it('rejects submitted_context with oversized keys or values', () => {
    expectError({ submitted_context: { ['k'.repeat(65)]: 'v' } }, '64')
    expectError({ submitted_context: { k: 'v'.repeat(257) } }, '256')
  })

  it('rejects submitted_context serializing over 1KB', () => {
    const ctx = Object.fromEntries(Array.from({ length: 5 }, (_, i) => [`key-${i}`, 'v'.repeat(250)]))
    expectError({ submitted_context: ctx }, '1KB')
  })

  it('rejects an array body', () => {
    expectError([], 'JSON object')
  })
})
