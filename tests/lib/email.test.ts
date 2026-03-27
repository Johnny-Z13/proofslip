import { describe, it, expect } from 'vitest'
import { renderWelcomeEmail } from '../../src/lib/email.js'

describe('renderWelcomeEmail', () => {
  const testKey = 'ak_abc123def456'
  const html = renderWelcomeEmail(testKey)

  it('includes the API key', () => {
    expect(html).toContain(testKey)
  })

  it('includes ProofSlip branding', () => {
    expect(html).toContain('ProofSlip')
    expect(html).toContain('API Key Issued')
  })

  it('includes curl quickstart with the key', () => {
    expect(html).toContain('curl -X POST')
    expect(html).toContain(`Bearer ${testKey}`)
  })

  it('includes save warning', () => {
    expect(html).toContain('cannot be retrieved later')
  })

  it('includes proofslip.ai link', () => {
    expect(html).toContain('https://proofslip.ai')
  })

  it('is valid HTML', () => {
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('</html>')
  })
})
