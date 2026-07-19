import { describe, expect, it } from 'vitest'
import app from '../../src/index.js'

describe('Search indexing controls', () => {
  it('lists only durable public HTML pages in the sitemap', async () => {
    const res = await app.request('/sitemap.xml')
    const xml = await res.text()

    expect(res.status).toBe(200)
    expect(xml).toContain('<loc>https://proofslip.ai</loc>')
    expect(xml).toContain('<loc>https://proofslip.ai/docs</loc>')
    expect(xml).toContain('<loc>https://proofslip.ai/privacy</loc>')
    expect(xml).toContain('<loc>https://proofslip.ai/example</loc>')
    expect(xml).not.toContain('/llms.txt</loc>')
    expect(xml).not.toContain('/.well-known/')
    expect(xml).not.toContain('/v1/')
  })

  it('keeps authenticated and private routes out of crawler scope', async () => {
    const res = await app.request('/robots.txt')
    const robots = await res.text()

    expect(res.status).toBe(200)
    expect(robots).toContain('Disallow: /cron/')
    expect(robots).toContain('Disallow: /dev/')
    expect(robots).toContain('Disallow: /v1/')
  })

  it.each([
    '/llms.txt',
    '/llms-full.txt',
    '/.well-known/openapi.json',
    '/.well-known/mcp.json',
    '/.well-known/agent.json',
    '/.well-known/ai-plugin.json',
  ])('marks machine discovery resource %s as non-indexable', async (path) => {
    const res = await app.request(path)

    expect(res.status).toBe(200)
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow')
  })
})
