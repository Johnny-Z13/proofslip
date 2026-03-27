import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/index.js'
import { seedTestApiKey, cleanupTestApiKey } from '../helpers.js'

let apiKey: string
let apiKeyId: string
let humanReceiptId: string
let agentReceiptId: string

beforeAll(async () => {
  const result = await seedTestApiKey()
  apiKey = result.key
  apiKeyId = result.keyId

  // Create receipt with audience: human
  const humanRes = await app.request('/v1/receipts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      type: 'approval',
      status: 'pending',
      summary: 'OG tag test receipt for humans',
      audience: 'human',
    }),
  })
  humanReceiptId = (await humanRes.json()).receipt_id

  // Create receipt without audience
  const agentRes = await app.request('/v1/receipts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      type: 'action',
      status: 'success',
      summary: 'Agent-only receipt, no OG tags',
    }),
  })
  agentReceiptId = (await agentRes.json()).receipt_id
})

afterAll(async () => {
  await cleanupTestApiKey(apiKeyId)
})

describe('Audience flag and OG tags', () => {
  it('includes audience in create response when set', async () => {
    const res = await app.request('/v1/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        type: 'action',
        status: 'success',
        summary: 'Audience response test',
        audience: 'human',
      }),
    })
    const body = await res.json()
    expect(body.audience).toBe('human')
  })

  it('omits audience from create response when not set', async () => {
    const res = await app.request('/v1/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        type: 'action',
        status: 'success',
        summary: 'No audience response test',
      }),
    })
    const body = await res.json()
    expect(body.audience).toBeUndefined()
  })

  it('includes OG meta tags in HTML when audience is human', async () => {
    const res = await app.request(`/verify/${humanReceiptId}`, {
      headers: { Accept: 'text/html' },
    })
    const html = await res.text()
    expect(html).toContain('og:title')
    expect(html).toContain('og:description')
    expect(html).toContain('og:image')
    expect(html).toContain('twitter:card')
    expect(html).toContain('twitter:site')
    expect(html).toContain('OG tag test receipt for humans')
  })

  it('omits OG meta tags in HTML when audience is not set', async () => {
    const res = await app.request(`/verify/${agentReceiptId}`, {
      headers: { Accept: 'text/html' },
    })
    const html = await res.text()
    expect(html).not.toContain('og:title')
    expect(html).not.toContain('twitter:card')
  })

  it('rejects invalid audience value via API', async () => {
    const res = await app.request('/v1/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        type: 'action',
        status: 'success',
        summary: 'Bad audience test',
        audience: 'robot',
      }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('validation_error')
  })
})
