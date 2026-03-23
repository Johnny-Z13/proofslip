import { describe, it, expect } from 'vitest'
import app from '../../src/index.js'

describe('Landing page', () => {
  it('serves HTML at GET /', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('ProofSlip')
    expect(html).toContain('Departure Mono')
    expect(html).toContain('24-hour receipts')
    expect(html).toContain('Get your API key')
  })
})
