import { describe, it, expect, vi, beforeEach } from 'vitest'

const BASE_URL = 'https://proofslip.ai'

beforeEach(() => {
  vi.restoreAllMocks()
  vi.useFakeTimers()
})

describe('ProofSlipClient.waitForTerminal', () => {
  it('returns immediately if first poll is terminal', async () => {
    const terminalStatus = {
      receipt_id: 'rct_abc',
      status: 'completed',
      is_terminal: true,
      next_poll_after_seconds: null,
      expires_at: '2026-04-06T00:00:00Z',
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(terminalStatus),
    }))
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    const result = await client.waitForTerminal('rct_abc')
    expect(result.is_terminal).toBe(true)
    expect(result.status).toBe('completed')
  })

  it('polls until terminal and returns final status', async () => {
    const pending = {
      receipt_id: 'rct_abc',
      status: 'pending',
      is_terminal: false,
      next_poll_after_seconds: 1,
      expires_at: '2026-04-06T00:00:00Z',
    }
    const done = {
      receipt_id: 'rct_abc',
      status: 'approved',
      is_terminal: true,
      next_poll_after_seconds: null,
      expires_at: '2026-04-06T00:00:00Z',
    }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(pending) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(pending) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(done) })
    vi.stubGlobal('fetch', fetchMock)

    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })

    const promise = client.waitForTerminal('rct_abc')

    // Advance through the two poll delays
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(1000)

    const result = await promise
    expect(result.status).toBe('approved')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('calls onPoll callback after each poll', async () => {
    const pending = {
      receipt_id: 'rct_abc',
      status: 'pending',
      is_terminal: false,
      next_poll_after_seconds: 1,
      expires_at: '2026-04-06T00:00:00Z',
    }
    const done = {
      receipt_id: 'rct_abc',
      status: 'approved',
      is_terminal: true,
      next_poll_after_seconds: null,
      expires_at: '2026-04-06T00:00:00Z',
    }
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(pending) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(done) }))

    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    const polls: string[] = []

    const promise = client.waitForTerminal('rct_abc', {
      onPoll: (s) => polls.push(s.status),
    })
    await vi.advanceTimersByTimeAsync(1000)
    await promise
    expect(polls).toEqual(['pending', 'approved'])
  })

  it('throws poll_timeout after maxAttempts', async () => {
    const pending = {
      receipt_id: 'rct_abc',
      status: 'pending',
      is_terminal: false,
      next_poll_after_seconds: 1,
      expires_at: '2026-04-06T00:00:00Z',
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, status: 200, json: () => Promise.resolve(pending),
    }))

    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })

    // Capture the rejection immediately so it doesn't become unhandled
    let caughtErr: unknown
    const promise = client.waitForTerminal('rct_abc', { maxAttempts: 3 })
      .then(() => { throw new Error('should not resolve') })
      .catch((err) => { caughtErr = err })

    // Advance past 3 poll intervals
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(1000)

    await promise
    expect(caughtErr).toBeInstanceOf(ProofSlipError)
    expect((caughtErr as any).code).toBe('poll_timeout')
  })

  it('throws ProofSlipError if receipt not found during polling', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'not_found', message: 'Receipt not found' }),
    }))

    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })

    await expect(client.waitForTerminal('rct_missing')).rejects.toThrow(ProofSlipError)
  })
})
