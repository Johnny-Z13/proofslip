import { describe, it, expect } from 'vitest'
import { ProofSlipError } from '../../../packages/sdk/src/errors.js'

describe('ProofSlipError', () => {
  it('is an instance of Error', () => {
    const err = new ProofSlipError('Not found', 'not_found', 404)
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(ProofSlipError)
  })

  it('stores code, status, and message', () => {
    const err = new ProofSlipError('Invalid API key', 'unauthorized', 401)
    expect(err.message).toBe('Invalid API key')
    expect(err.code).toBe('unauthorized')
    expect(err.status).toBe(401)
  })

  it('stores optional requestId', () => {
    const err = new ProofSlipError('Server error', 'internal_error', 500, 'req_abc123')
    expect(err.requestId).toBe('req_abc123')
  })

  it('has undefined requestId by default', () => {
    const err = new ProofSlipError('Oops', 'internal_error', 500)
    expect(err.requestId).toBeUndefined()
  })

  it('has the name ProofSlipError', () => {
    const err = new ProofSlipError('test', 'test', 0)
    expect(err.name).toBe('ProofSlipError')
  })
})
