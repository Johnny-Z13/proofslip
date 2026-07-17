import { describe, it, expect, beforeAll } from 'vitest'
import { verifyGitHubOidcToken, OidcVerificationError } from '../../src/lib/github-oidc.js'
import { createOidcFixture, BASE_CLAIMS, type OidcFixture } from '../helpers/oidc-fixtures.js'

let fixture: OidcFixture

beforeAll(async () => {
  fixture = await createOidcFixture()
})

async function expectReason(promise: Promise<unknown>, reason: string) {
  try {
    await promise
    expect.unreachable(`expected OidcVerificationError(${reason})`)
  } catch (err) {
    expect(err).toBeInstanceOf(OidcVerificationError)
    expect((err as OidcVerificationError).reason).toBe(reason)
  }
}

describe('verifyGitHubOidcToken', () => {
  it('verifies a valid token and normalizes claims', async () => {
    const token = await fixture.sign()
    const claims = await verifyGitHubOidcToken(token, { getKey: fixture.getKey })

    expect(claims.repository).toBe(BASE_CLAIMS.repository)
    expect(claims.repositoryId).toBe(BASE_CLAIMS.repository_id)
    expect(claims.repositoryOwner).toBe(BASE_CLAIMS.repository_owner)
    expect(claims.repositoryVisibility).toBe('public')
    expect(claims.sha).toBe('a'.repeat(40))
    expect(claims.runId).toBe(BASE_CLAIMS.run_id)
    expect(claims.runAttempt).toBe(1)
    expect(claims.actor).toBe('octocat')
    expect(claims.eventName).toBe('push')
    expect(claims.subject).toBe(BASE_CLAIMS.sub)
    expect(claims.jti).toMatch(/^test-jti-/)
  })

  it('accepts run_attempt as a number', async () => {
    const token = await fixture.sign({ run_attempt: 2 })
    const claims = await verifyGitHubOidcToken(token, { getKey: fixture.getKey })
    expect(claims.runAttempt).toBe(2)
  })

  it('rejects a token signed by an unrelated key', async () => {
    const token = await fixture.sign({}, { useWrongKey: true })
    await expectReason(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
      'invalid_signature',
    )
  })

  it('rejects a wrong issuer', async () => {
    const token = await fixture.sign({}, { issuer: 'https://evil.example.com' })
    await expectReason(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
      'invalid_issuer',
    )
  })

  it('rejects a wrong audience', async () => {
    const token = await fixture.sign({}, { audience: 'https://someone-else.example.com' })
    await expectReason(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
      'invalid_audience',
    )
  })

  it('rejects an expired token', async () => {
    const token = await fixture.sign({}, { expiresIn: '-10m' })
    await expectReason(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
      'token_expired',
    )
  })

  it('rejects a not-yet-valid token', async () => {
    const token = await fixture.sign({}, { notBefore: '10m' })
    await expectReason(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
      'token_expired',
    )
  })

  it('rejects a malformed token', async () => {
    await expectReason(
      verifyGitHubOidcToken('not-a-jwt', { getKey: fixture.getKey }),
      'malformed_token',
    )
  })

  const requiredClaims = [
    'repository',
    'repository_id',
    'repository_owner',
    'repository_owner_id',
    'repository_visibility',
    'ref',
    'sha',
    'workflow_ref',
    'run_id',
    'actor',
    'event_name',
    'jti',
  ]

  for (const claim of requiredClaims) {
    it(`rejects a token missing ${claim}`, async () => {
      const token = await fixture.sign({ [claim]: undefined })
      await expectReason(
        verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
        `missing_claim:${claim}`,
      )
    })
  }

  it('rejects a token with an empty required claim', async () => {
    const token = await fixture.sign({ repository: '' })
    await expectReason(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
      'missing_claim:repository',
    )
  })

  it('rejects a token with a non-numeric run_attempt', async () => {
    const token = await fixture.sign({ run_attempt: 'zero' })
    await expectReason(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
      'missing_claim:run_attempt',
    )
  })

  it('rejects a run_attempt with trailing garbage — "1abc" must not become 1', async () => {
    const token = await fixture.sign({ run_attempt: '1abc' })
    await expectReason(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
      'missing_claim:run_attempt',
    )
  })

  it('rejects a non-integer numeric run_attempt', async () => {
    const token = await fixture.sign({ run_attempt: 1.5 })
    await expectReason(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
      'missing_claim:run_attempt',
    )
  })

  it('rejects a token without an exp claim', async () => {
    const token = await fixture.sign({}, { omitExp: true })
    await expectReason(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
      'missing_claim:exp',
    )
  })

  it('rejects a token without an iat claim', async () => {
    const token = await fixture.sign({}, { omitIat: true })
    await expectReason(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
      'missing_claim:iat',
    )
  })

  it('rejects a token signed with a non-RS256 algorithm', async () => {
    const token = await fixture.sign({}, { useHs256: true })
    await expectReason(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
      'invalid_signature',
    )
  })

  it('rejects the combined bypass: garbage run_attempt with no temporal claims', async () => {
    const token = await fixture.sign({ run_attempt: '1abc' }, { omitExp: true, omitIat: true })
    await expect(
      verifyGitHubOidcToken(token, { getKey: fixture.getKey }),
    ).rejects.toBeInstanceOf(OidcVerificationError)
  })
})
