import { describe, expect, it } from 'vitest'
import app from '../../src/index.js'

describe('release-proof public contract', () => {
  it('publishes release proofs as the primary OpenAPI surface', async () => {
    const response = await app.request('/.well-known/openapi.json')
    expect(response.status).toBe(200)

    const spec = await response.json()
    expect(spec.paths).toHaveProperty('/v1/proofs/releases/github-actions')
    expect(spec.paths).toHaveProperty('/v1/proofs/{proofId}')
    expect(spec.components.securitySchemes).toHaveProperty('githubOidc')
    expect(spec.paths['/v1/proofs/releases/github-actions'].post.security).toEqual([
      { githubOidc: [] },
    ])
  })

  it('keeps trust categories and limitations explicit in human docs', async () => {
    const response = await app.request('/docs')
    const html = await response.text()
    const normalized = html.toLowerCase()

    expect(html).toContain('/v1/proofs/releases/github-actions')
    expect(normalized).toContain('provider-verified')
    expect(normalized).toContain('submitted_context')
    expect(normalized).toContain('does not prove')
    expect(normalized).toContain('private repositories')
  })

  it('states the public 90-day validity and post-expiry behavior in llms.txt', async () => {
    const response = await app.request('/llms.txt')
    const body = await response.text()

    expect(body).toContain('release-proof/v1')
    expect(body).toContain('90-day validity window')
    expect(body).toContain('Expired proofs remain inspectable')
    expect(body).toContain('private repositories')
  })

  it('discloses that release proofs are public and not auto-deleted', async () => {
    const response = await app.request('/privacy')
    const html = await response.text()

    expect(html).toContain('Release proofs are public')
    expect(html).toContain('V1 does not automatically delete expired proof records')
    expect(html).toContain('source IP')
    expect(html).toContain('raw GitHub OIDC token is not stored or logged')
  })

  it('labels the current MCP package as the legacy receipt surface', async () => {
    const response = await app.request('/.well-known/mcp.json')
    const manifest = await response.json()

    expect(manifest.scope).toBe('legacy_receipt_api')
    expect(manifest.primary_api.schema_version).toBe('release-proof/v1')
    expect(manifest.primary_api.note).toContain('not currently an MCP tool')
  })
})
