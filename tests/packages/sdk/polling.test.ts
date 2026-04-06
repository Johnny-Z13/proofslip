import { describe, it, expect } from 'vitest'
import { isTerminal, getNextPollAfterSeconds } from '../../../packages/sdk/src/polling.js'

describe('isTerminal', () => {
  it('action type is always terminal', () => {
    expect(isTerminal('action', 'pending')).toBe(true)
    expect(isTerminal('action', 'success')).toBe(true)
  })

  it('failure type is always terminal', () => {
    expect(isTerminal('failure', 'pending')).toBe(true)
  })

  it('resume type is always terminal', () => {
    expect(isTerminal('resume', 'pending')).toBe(true)
  })

  it('approval with terminal status is terminal', () => {
    expect(isTerminal('approval', 'approved')).toBe(true)
    expect(isTerminal('approval', 'rejected')).toBe(true)
    expect(isTerminal('approval', 'denied')).toBe(true)
  })

  it('approval with non-terminal status is not terminal', () => {
    expect(isTerminal('approval', 'pending')).toBe(false)
    expect(isTerminal('approval', 'awaiting_review')).toBe(false)
  })

  it('handshake with terminal status is terminal', () => {
    expect(isTerminal('handshake', 'connected')).toBe(true)
    expect(isTerminal('handshake', 'disconnected')).toBe(true)
  })

  it('handshake with non-terminal status is not terminal', () => {
    expect(isTerminal('handshake', 'pending')).toBe(false)
    expect(isTerminal('handshake', 'negotiating')).toBe(false)
  })
})

describe('getNextPollAfterSeconds', () => {
  it('returns null for terminal states', () => {
    expect(getNextPollAfterSeconds('action', 'success')).toBeNull()
    expect(getNextPollAfterSeconds('failure', 'failed')).toBeNull()
    expect(getNextPollAfterSeconds('approval', 'approved')).toBeNull()
  })

  it('returns 30 for approval pending/awaiting_review', () => {
    expect(getNextPollAfterSeconds('approval', 'pending')).toBe(30)
    expect(getNextPollAfterSeconds('approval', 'awaiting_review')).toBe(30)
  })

  it('returns 15 for approval with other non-terminal status', () => {
    expect(getNextPollAfterSeconds('approval', 'in_progress')).toBe(15)
  })

  it('returns 10 for handshake pending/negotiating', () => {
    expect(getNextPollAfterSeconds('handshake', 'pending')).toBe(10)
    expect(getNextPollAfterSeconds('handshake', 'negotiating')).toBe(10)
  })

  it('returns 15 for handshake with other non-terminal status', () => {
    expect(getNextPollAfterSeconds('handshake', 'in_progress')).toBe(15)
  })

  it('returns 15 as default for unknown non-terminal', () => {
    expect(getNextPollAfterSeconds('handshake', 'custom_status')).toBe(15)
  })
})
