import { describe, it, expect } from 'vitest'
import { isTerminal, getNextPollAfterSeconds } from '../../src/lib/polling.js'

describe('isTerminal', () => {
  it('action receipts are always terminal', () => {
    expect(isTerminal('action', 'success')).toBe(true)
    expect(isTerminal('action', 'pending')).toBe(true)
  })

  it('failure receipts are always terminal', () => {
    expect(isTerminal('failure', 'error')).toBe(true)
  })

  it('resume receipts are always terminal', () => {
    expect(isTerminal('resume', 'resumed')).toBe(true)
  })

  it('approval with pending status is NOT terminal', () => {
    expect(isTerminal('approval', 'pending')).toBe(false)
  })

  it('approval with approved status IS terminal', () => {
    expect(isTerminal('approval', 'approved')).toBe(true)
  })

  it('approval with rejected status IS terminal', () => {
    expect(isTerminal('approval', 'rejected')).toBe(true)
  })

  it('handshake with connected status IS terminal', () => {
    expect(isTerminal('handshake', 'connected')).toBe(true)
  })

  it('handshake with negotiating status is NOT terminal', () => {
    expect(isTerminal('handshake', 'negotiating')).toBe(false)
  })
})

describe('getNextPollAfterSeconds', () => {
  it('returns null for terminal states', () => {
    expect(getNextPollAfterSeconds('action', 'success')).toBeNull()
    expect(getNextPollAfterSeconds('failure', 'error')).toBeNull()
    expect(getNextPollAfterSeconds('approval', 'approved')).toBeNull()
  })

  it('returns 30 for pending approval', () => {
    expect(getNextPollAfterSeconds('approval', 'pending')).toBe(30)
  })

  it('returns 10 for pending handshake', () => {
    expect(getNextPollAfterSeconds('handshake', 'pending')).toBe(10)
  })

  it('returns 15 as default for unknown non-terminal states', () => {
    expect(getNextPollAfterSeconds('approval', 'some_custom_status')).toBe(15)
  })
})
