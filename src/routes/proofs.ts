import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { getDb } from '../db/client.js'
import { proofs } from '../db/schema.js'
import { errorResponse } from '../lib/errors.js'
import { generateProofId } from '../lib/ids.js'
import { sha256 } from '../lib/hash.js'
import { stableStringify } from '../lib/stable-json.js'
import { rateLimitByIp } from '../middleware/rate-limit.js'
import { verifyGitHubOidcToken, OidcVerificationError, toStoredGitHubActionsClaims } from '../lib/github-oidc.js'
import type { GitHubActionsClaims, StoredGitHubActionsClaims } from '../lib/github-oidc.js'
import { validateCreateProof, isProofValidationError, PROOF_SCHEMA_VERSION } from '../lib/validate-proof.js'
import type { CreateProofInput } from '../lib/validate-proof.js'
import { observeDeployment, buildObservationUrl } from '../lib/observe-deployment.js'
import { buildProofResponse, type ProofRow } from '../lib/proof-format.js'
import { recordProofEvent } from '../lib/proof-events.js'
import { renderProofPage } from '../views/proof-page.js'
import { renderNotFoundPage } from '../views/not-found-page.js'
import type { JWTVerifyGetKey } from 'jose'

const PROOF_TTL_MS = 90 * 24 * 60 * 60 * 1000 // 90 days

// Test seam: route-level injection of the OIDC key resolver. Production never sets this.
let testOidcGetKey: JWTVerifyGetKey | undefined
export function __setTestOidcGetKey(getKey: JWTVerifyGetKey | undefined) {
  if (process.env.NODE_ENV === 'production') return
  testOidcGetKey = getKey
}

const proofsRouter = new Hono()

proofsRouter.use('*', rateLimitByIp(30))

/**
 * Whether an existing proof row matches a repeated request closely enough to
 * be an idempotent replay (same submitted content) rather than a conflict.
 * The deployment target is part of the fingerprint — a request observing a
 * different URL is different content, never a replay.
 */
function matchesExisting(row: ProofRow, validated: CreateProofInput, claims: GitHubActionsClaims): boolean {
  const storedObservations = (row.observations ?? []) as Array<{ url?: string }>
  const storedObservationUrl = storedObservations[0]?.url ?? null
  const requestedObservationUrl = validated.deployment ? buildObservationUrl(validated.deployment) : null
  const storedIssuer = row.issuerClaims as Record<string, unknown>
  // Ignore a legacy raw jti if one exists in a pre-fix row. New rows never
  // persist it; the digest remains the sole replay identifier.
  const { jti: _legacyJti, ...storedIssuerWithoutJti } = storedIssuer

  return (
    (row.idempotencyKey ?? null) === (validated.idempotency_key ?? null) &&
    storedObservationUrl === requestedObservationUrl &&
    stableStringify(storedIssuerWithoutJti) === stableStringify(toStoredGitHubActionsClaims(claims)) &&
    stableStringify(row.submittedContext ?? null) === stableStringify(validated.submitted_context ?? null)
  )
}

proofsRouter.post('/releases/github-actions', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    await recordProofEvent({ event: 'release_proof_create_failed', reason: 'missing_token' })
    return errorResponse(c, 401, 'invalid_attestation', 'Missing OIDC token. Send Authorization: Bearer <GitHub Actions OIDC token>.')
  }
  const token = authHeader.slice(7)

  // Read the raw text rather than trusting Content-Length — a body sent
  // without the header (e.g. chunked) must never be silently ignored.
  let rawBody: unknown
  const bodyText = await c.req.text()
  if (bodyText.trim() !== '') {
    try {
      rawBody = JSON.parse(bodyText)
    } catch {
      return errorResponse(c, 400, 'validation_error', 'Request body must be valid JSON.')
    }
  }

  const validated = validateCreateProof(rawBody)
  if (isProofValidationError(validated)) {
    await recordProofEvent({ event: 'release_proof_create_failed', reason: 'validation_error' })
    return errorResponse(c, 400, validated.error, validated.message)
  }

  // Fail closed: any verification failure rejects the request.
  let claims: GitHubActionsClaims
  try {
    claims = await verifyGitHubOidcToken(token, testOidcGetKey ? { getKey: testOidcGetKey } : undefined)
  } catch (err) {
    if (err instanceof OidcVerificationError) {
      await recordProofEvent({ event: 'release_proof_create_failed', reason: err.reason })
      if (err.reason === 'invalid_issuer') {
        return errorResponse(c, 400, 'unsupported_issuer', 'Only GitHub Actions OIDC tokens are supported in release-proof/v1.')
      }
      return errorResponse(c, 401, 'invalid_attestation', `OIDC verification failed: ${err.message}`)
    }
    throw err
  }

  const db = getDb()
  const jtiDigest = sha256(claims.jti)

  const conflict = () =>
    errorResponse(c, 409, 'idempotency_conflict', 'A proof already exists for this token or idempotency key with different content.')

  // Replay protection: a reused token may only return the identical existing proof.
  const byJti = await db.select().from(proofs).where(eq(proofs.jtiDigest, jtiDigest))
  if (byJti[0]) {
    if (!matchesExisting(byJti[0], validated, claims)) return conflict()
    return c.json(buildProofResponse(byJti[0]), 200)
  }

  // Idempotency: same repository + key (e.g. a re-run job with a fresh token).
  if (validated.idempotency_key) {
    const byKey = await db
      .select()
      .from(proofs)
      .where(and(eq(proofs.repository, claims.repository), eq(proofs.idempotencyKey, validated.idempotency_key)))
    if (byKey[0]) {
      if (!matchesExisting(byKey[0], validated, claims)) return conflict()
      return c.json(buildProofResponse(byKey[0]), 200)
    }
  }

  // Optional deployment observation — a separate evidence source; its failure
  // is recorded, never fatal.
  const observations = validated.deployment ? [await observeDeployment(validated.deployment)] : []

  const requestId = (c as any).get('requestId') || null
  let inserted: ProofRow
  try {
    const rows = await db.insert(proofs).values({
      id: generateProofId(),
      schemaVersion: PROOF_SCHEMA_VERSION,
      proofType: 'release',
      issuerType: 'github_actions',
      repository: claims.repository,
      issuerClaims: toStoredGitHubActionsClaims(claims),
      observations,
      submittedContext: validated.submitted_context ?? null,
      idempotencyKey: validated.idempotency_key ?? null,
      jtiDigest,
      requestId,
      expiresAt: new Date(Date.now() + PROOF_TTL_MS),
    }).returning()
    inserted = rows[0]
  } catch (err) {
    // Concurrent duplicate (jti or idempotency unique index) — return the winner if identical.
    const e = err as { code?: string; message?: string }
    if (e?.code === '23505' || e?.message?.includes('idx_proofs_')) {
      let winner = (await db.select().from(proofs).where(eq(proofs.jtiDigest, jtiDigest)))[0]
      if (!winner && validated.idempotency_key) {
        winner = (
          await db
            .select()
            .from(proofs)
            .where(and(eq(proofs.repository, claims.repository), eq(proofs.idempotencyKey, validated.idempotency_key)))
        )[0]
      }
      if (winner) {
        if (!matchesExisting(winner, validated, claims)) return conflict()
        return c.json(buildProofResponse(winner), 200)
      }
      return conflict()
    }
    throw err
  }

  await recordProofEvent({
    event: 'release_proof_created',
    repository: claims.repository,
    repositoryVisibility: claims.repositoryVisibility,
  })

  return c.json(buildProofResponse(inserted), 201)
})

proofsRouter.get('/:proofId', async (c) => {
  const proofId = c.req.param('proofId')
  const db = getDb()

  const rows = await db.select().from(proofs).where(eq(proofs.id, proofId))
  const row = rows[0]
  if (!row) {
    return errorResponse(c, 404, 'proof_not_found', 'Proof does not exist.')
  }

  const response = buildProofResponse(row)
  const claims = row.issuerClaims as unknown as StoredGitHubActionsClaims
  await recordProofEvent({
    event: 'release_proof_fetched_json',
    repository: claims.repository,
    repositoryVisibility: claims.repositoryVisibility,
  })

  // Expired proofs stay visible (410): an expired proof is still evidence that expired.
  return c.json(response, response.is_expired ? 410 : 200)
})

// Human evidence view at /proof/:proofId. HTML by default; JSON only on
// explicit Accept: application/json or ?format=json (spec §GET /proof/:proof_id).
const proofPageRouter = new Hono()

proofPageRouter.use('*', rateLimitByIp(120))

proofPageRouter.get('/:proofId', async (c) => {
  const proofId = c.req.param('proofId')
  const db = getDb()

  const wantsJson =
    c.req.header('Accept')?.includes('application/json') ||
    c.req.query('format') === 'json'

  const rows = await db.select().from(proofs).where(eq(proofs.id, proofId))
  const row = rows[0]
  if (!row) {
    if (wantsJson) {
      return errorResponse(c, 404, 'proof_not_found', 'Proof does not exist.')
    }
    return c.html(renderNotFoundPage(), 404)
  }

  const response = buildProofResponse(row)
  const claims = row.issuerClaims as unknown as StoredGitHubActionsClaims
  await recordProofEvent({
    event: wantsJson ? 'release_proof_fetched_json' : 'release_proof_viewed_html',
    repository: claims.repository,
    repositoryVisibility: claims.repositoryVisibility,
  })

  // Expired proofs stay visible (410): an expired proof is still evidence that expired.
  const status = response.is_expired ? 410 : 200
  if (wantsJson) return c.json(response, status)
  return c.html(renderProofPage(response), status)
})

export { proofsRouter, proofPageRouter }
