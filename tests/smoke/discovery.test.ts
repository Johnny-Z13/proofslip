import { describe, it, expect } from 'vitest'

const BASE = process.env.PROOFSLIP_BASE_URL || 'https://proofslip.ai'

describe('Smoke: Discovery Endpoints', () => {
  it('GET /llms.txt returns valid content', async () => {
    const res = await fetch(`${BASE}/llms.txt`)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('ProofSlip')
  })

  it('GET /llms-full.txt returns full API reference', async () => {
    const res = await fetch(`${BASE}/llms-full.txt`)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('POST /v1/receipts')
  })

  it('GET /.well-known/openapi.json returns valid OpenAPI spec', async () => {
    const res = await fetch(`${BASE}/.well-known/openapi.json`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('openapi')
    expect(data).toHaveProperty('paths')
    expect(data).toHaveProperty('info')
  })

  it('GET /.well-known/mcp.json returns MCP manifest', async () => {
    const res = await fetch(`${BASE}/.well-known/mcp.json`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('tools')
  })

  it('GET /.well-known/ai-plugin.json returns ChatGPT plugin manifest', async () => {
    const res = await fetch(`${BASE}/.well-known/ai-plugin.json`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('name_for_model')
    expect(data.name_for_model).toBe('proofslip')
  })

  it('GET /.well-known/agent.json returns agent manifest', async () => {
    const res = await fetch(`${BASE}/.well-known/agent.json`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(typeof data).toBe('object')
  })

  it('GET /docs returns documentation page', async () => {
    const res = await fetch(`${BASE}/docs`)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('API')
  })

  it('GET /privacy returns privacy page', async () => {
    const res = await fetch(`${BASE}/privacy`)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Privacy')
  })

  it('GET /example returns example receipt', async () => {
    const res = await fetch(`${BASE}/example`)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html.toLowerCase()).toContain('receipt')
  })
})
