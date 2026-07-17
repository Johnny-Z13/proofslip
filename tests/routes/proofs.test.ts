import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { eq } from 'drizzle-orm'
import app from '../../src/index.js'
import { __setTestOidcGetKey } from '../../src/routes/proofs.js'
import { createOidcFixture, BASE_CLAIMS, type OidcFixture } from '../helpers/oidc-fixtures.js'
import { getTestDb } from '../helpers.js'
import { proofs, proofEvents } from '../../src/db/schema.js'

let fixture: OidcFixture

beforeAll(async () => {
  fixture = await createOidcFixture()
  __setTestOidcGetKey(fixture.getKey)
})

afterAll(async () => {
  __setTestOidcGetKey(undefined)
  const db = getTestDb()
  await db.delete(proofs).where(eq(proofs.repository, BASE_CLAIMS.repository))
  // Public-repo events keep the readable slug as their digest.
  await db.delete(proofEvents).where(eq(proofEvents.repositoryDigest, BASE_CLAIMS.repository))
})

let requestCounter = 0

function createProof(token: string, body?: unknown) {
  requestCounter++
  return app.request('/v1/proofs/releases/github-actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Forwarded-For': `203.0.113.${requestCounter}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('POST /v1/proofs/releases/github-actions', () => {
  it('rejects a request without an OIDC token', async () => {
    const res = await app.request('/v1/proofs/releases/github-actions', { method: 'POST' })
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('invalid_attestation')
    expect(data.request_id).toBeTruthy()
  })

  it('rejects a non-GitHub issuer as unsupported', async () => {
    const token = await fixture.sign({}, { issuer: 'https://accounts.example.com' })
    const res = await createProof(token)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('unsupported_issuer')
  })

  it('rejects a token signed by an unrelated key', async () => {
    const token = await fixture.sign({}, { useWrongKey: true })
    const res = await createProof(token)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('invalid_attestation')
  })

  it('rejects a token with the wrong audience', async () => {
    const token = await fixture.sign({}, { audience: 'https://someone-else.example.com' })
    const res = await createProof(token)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('invalid_attestation')
  })

  it('rejects a token missing a required claim', async () => {
    const token = await fixture.sign({ sha: undefined })
    const res = await createProof(token)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('invalid_attestation')
  })

  it('rejects an invalid body before creating anything', async () => {
    const token = await fixture.sign()
    const res = await createProof(token, { submitted_context: { count: 3 } })
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('validation_error')
  })

  it('creates a proof from a bare authenticated POST', async () => {
    const token = await fixture.sign()
    const res = await createProof(token)
    expect(res.status).toBe(201)

    const data = await res.json()
    expect(data.proof_id).toMatch(/^prf_/)
    expect(data.proof_url).toContain(`/proof/${data.proof_id}`)
    expect(data.schema_version).toBe('release-proof/v1')
    expect(data.trust_level).toBe('provider_verified')
    expect(data.verification_method).toBe('github_actions_oidc')
    expect(data.is_valid).toBe(true)
    expect(data.is_expired).toBe(false)
    expect(data.issuer.repository).toBe(BASE_CLAIMS.repository)
    expect(data.issuer.sha).toBe(BASE_CLAIMS.sha)
    expect(data.issuer.run_url).toBe(
      `https://github.com/${BASE_CLAIMS.repository}/actions/runs/${BASE_CLAIMS.run_id}`,
    )
    expect(data.issuer.commit_url).toBe(
      `https://github.com/${BASE_CLAIMS.repository}/commit/${BASE_CLAIMS.sha}`,
    )
    expect(data.observations).toEqual([])
    expect(data.submitted_context).toBeNull()

    const stored = await getTestDb().select().from(proofs).where(eq(proofs.id, data.proof_id))
    expect((stored[0].issuerClaims as Record<string, unknown>).jti).toBeUndefined()
  })

  it('never merges submitted context into provider-verified claims', async () => {
    const token = await fixture.sign()
    const res = await createProof(token, {
      submitted_context: { repository: 'evil-org/evil-repo', sha: 'f'.repeat(40) },
    })
    expect(res.status).toBe(201)

    const data = await res.json()
    expect(data.issuer.repository).toBe(BASE_CLAIMS.repository)
    expect(data.issuer.sha).toBe(BASE_CLAIMS.sha)
    expect(data.submitted_context).toEqual({
      repository: 'evil-org/evil-repo',
      sha: 'f'.repeat(40),
    })
  })

  it('returns the identical proof for a replayed token', async () => {
    const token = await fixture.sign()
    const first = await createProof(token)
    expect(first.status).toBe(201)
    const created = await first.json()

    const replay = await createProof(token)
    expect(replay.status).toBe(200)
    const replayed = await replay.json()
    expect(replayed.proof_id).toBe(created.proof_id)
  })

  it('rejects a replayed token with different content', async () => {
    const token = await fixture.sign()
    const first = await createProof(token, { submitted_context: { environment: 'production' } })
    expect(first.status).toBe(201)

    const conflict = await createProof(token, { submitted_context: { environment: 'staging' } })
    expect(conflict.status).toBe(409)
    const data = await conflict.json()
    expect(data.error).toBe('idempotency_conflict')
  })

  it('returns the existing proof for the same idempotency key with a fresh token', async () => {
    const idempotencyKey = `idem-${Date.now()}`
    const first = await createProof(await fixture.sign(), { idempotency_key: idempotencyKey })
    expect(first.status).toBe(201)
    const created = await first.json()

    const rerun = await createProof(await fixture.sign(), { idempotency_key: idempotencyKey })
    expect(rerun.status).toBe(200)
    const replayed = await rerun.json()
    expect(replayed.proof_id).toBe(created.proof_id)
  })

  it('returns one proof for concurrent identical idempotent requests with fresh tokens', async () => {
    const idempotencyKey = `idem-race-${Date.now()}`
    const [first, second] = await Promise.all([
      createProof(await fixture.sign(), { idempotency_key: idempotencyKey }),
      createProof(await fixture.sign(), { idempotency_key: idempotencyKey }),
    ])

    expect([first.status, second.status].sort()).toEqual([200, 201])
    const [firstBody, secondBody] = await Promise.all([first.json(), second.json()])
    expect(firstBody.proof_id).toBe(secondBody.proof_id)
  })

  it('rejects the same idempotency key when provider-verified claims differ', async () => {
    const idempotencyKey = `idem-claims-${Date.now()}`
    const first = await createProof(await fixture.sign(), { idempotency_key: idempotencyKey })
    expect(first.status).toBe(201)

    const conflict = await createProof(
      await fixture.sign({ sha: 'b'.repeat(40) }),
      { idempotency_key: idempotencyKey },
    )
    expect(conflict.status).toBe(409)
    expect((await conflict.json()).error).toBe('idempotency_conflict')
  })

  it('treats a replay with the same deployment target as identical', async () => {
    const token = await fixture.sign()
    const deployment = { url: 'https://proofslip-test-target.invalid', health_path: '/health' }
    const first = await createProof(token, { deployment })
    expect(first.status).toBe(201)
    const created = await first.json()

    const replay = await createProof(token, { deployment })
    expect(replay.status).toBe(200)
    const replayed = await replay.json()
    expect(replayed.proof_id).toBe(created.proof_id)
  })

  it('rejects a replayed token with a different deployment target', async () => {
    const token = await fixture.sign()
    const first = await createProof(token, {
      deployment: { url: 'https://proofslip-test-target.invalid' },
    })
    expect(first.status).toBe(201)

    const conflict = await createProof(token, {
      deployment: { url: 'https://other-target.invalid' },
    })
    expect(conflict.status).toBe(409)
    const data = await conflict.json()
    expect(data.error).toBe('idempotency_conflict')
  })

  it('rejects the same idempotency key with a different deployment target', async () => {
    const idempotencyKey = `idem-deploy-${Date.now()}`
    const first = await createProof(await fixture.sign(), {
      idempotency_key: idempotencyKey,
      deployment: { url: 'https://proofslip-test-target.invalid' },
    })
    expect(first.status).toBe(201)

    const conflict = await createProof(await fixture.sign(), {
      idempotency_key: idempotencyKey,
      deployment: { url: 'https://proofslip-test-target.invalid', health_path: '/health' },
    })
    expect(conflict.status).toBe(409)
    const data = await conflict.json()
    expect(data.error).toBe('idempotency_conflict')
  })

  it('rejects the same idempotency key with different content', async () => {
    const idempotencyKey = `idem-conflict-${Date.now()}`
    const first = await createProof(await fixture.sign(), {
      idempotency_key: idempotencyKey,
      submitted_context: { environment: 'production' },
    })
    expect(first.status).toBe(201)

    const conflict = await createProof(await fixture.sign(), {
      idempotency_key: idempotencyKey,
      submitted_context: { environment: 'staging' },
    })
    expect(conflict.status).toBe(409)
    const data = await conflict.json()
    expect(data.error).toBe('idempotency_conflict')
  })
})

describe('GET /v1/proofs/:proofId', () => {
  it('returns the proof as public JSON', async () => {
    const created = await (await createProof(await fixture.sign())).json()

    const res = await app.request(`/v1/proofs/${created.proof_id}`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.proof_id).toBe(created.proof_id)
    expect(data.is_valid).toBe(true)
    expect(data.trust_level).toBe('provider_verified')
  })

  it('returns 404 for an unknown proof', async () => {
    const res = await app.request('/v1/proofs/prf_does_not_exist')
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('proof_not_found')
  })
})

describe('GET /proof/:proofId', () => {
  it('serves the human evidence view with separated trust sections', async () => {
    const created = await (
      await createProof(await fixture.sign(), { submitted_context: { environment: 'production' } })
    ).json()

    const res = await app.request(`/proof/${created.proof_id}`)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/html')

    const html = await res.text()
    expect(html).toContain('Provider-verified · GitHub Actions OIDC')
    expect(html).toContain('Observed by ProofSlip')
    expect(html).toContain('Submitted context — not verified')
    expect(html).toContain('What this does not prove')
    expect(html).toContain(BASE_CLAIMS.repository)
    expect(html).toContain(`/v1/proofs/${created.proof_id}`)
  })

  it('serves JSON on explicit Accept: application/json', async () => {
    const created = await (await createProof(await fixture.sign())).json()

    const res = await app.request(`/proof/${created.proof_id}`, {
      headers: { Accept: 'application/json' },
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.proof_id).toBe(created.proof_id)
  })

  it('serves JSON on ?format=json', async () => {
    const created = await (await createProof(await fixture.sign())).json()

    const res = await app.request(`/proof/${created.proof_id}?format=json`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.proof_id).toBe(created.proof_id)
  })

  it('returns an HTML 404 for an unknown proof', async () => {
    const res = await app.request('/proof/prf_does_not_exist')
    expect(res.status).toBe(404)
    expect(res.headers.get('Content-Type')).toContain('text/html')
  })
})
