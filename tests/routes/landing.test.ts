import { describe, it, expect } from 'vitest'
import app from '../../src/index.js'

describe('Landing page', () => {
  it('serves HTML at GET /', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('ProofSlip')
    expect(html).toContain('Departure Mono')
    expect(html).toContain('Your coding agent says it shipped. Check the slip.')
  })

  it('has SEO meta tags', async () => {
    const res = await app.request('/')
    const html = await res.text()
    expect(html).toContain('meta name="description"')
    expect(html).toContain('rel="canonical"')
    expect(html).toContain('og:title')
    expect(html).toContain('twitter:card')
    expect(html).toContain('application/ld+json')
  })

  it('leads with release proof instead of email signup', async () => {
    const res = await app.request('/')
    const html = await res.text()
    expect(html).toContain('Add release proof')
    expect(html).toContain('/v1/proofs/releases/github-actions')
    expect(html).not.toContain('signup-email')
    expect(html).not.toContain('doSignup')
  })

  it('keeps the three evidence categories visibly separate', async () => {
    const res = await app.request('/')
    const html = await res.text()
    expect(html).toContain('Provider-verified')
    expect(html).toContain('ProofSlip-observed')
    expect(html).toContain('Submitted, not verified')
    expect(html).toContain('does not prove that every test passed')
  })

  it('preserves a route to the legacy receipt API', async () => {
    const res = await app.request('/')
    const html = await res.text()
    expect(html).toContain('general receipt API')
    expect(html).toContain('href="/docs"')
  })

  it('serves OG image at /og-image.png as PNG', async () => {
    const res = await app.request('/og-image.png')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('image/png')
  })
})
