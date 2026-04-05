import { describe, it, expect } from 'vitest'
import app from '../../src/index.js'

describe('Landing page', () => {
  it('serves HTML at GET /', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('ProofSlip')
    expect(html).toContain('Departure Mono')
    expect(html).toContain('receipt')
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

  it('has signup form', async () => {
    const res = await app.request('/')
    const html = await res.text()
    expect(html).toContain('signup-email')
    expect(html).toContain('doSignup')
  })

  it('has trust section', async () => {
    const res = await app.request('/')
    const html = await res.text()
    expect(html.toLowerCase()).toContain('trust')
  })

  it('serves OG image at /og-image.png as PNG', async () => {
    const res = await app.request('/og-image.png')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('image/png')
  })
})
