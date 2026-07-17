import { jwtVerify, errors as joseErrors, createRemoteJWKSet } from 'jose'
import type { JWTVerifyGetKey, JWTPayload } from 'jose'

/**
 * GitHub Actions OIDC token verification for release-proof/v1.
 *
 * A verified token proves the identity and execution context of the workflow
 * job that requested it — nothing more. See docs/specs/release-proof-v1.md.
 */

export const GITHUB_OIDC_ISSUER = 'https://token.actions.githubusercontent.com'
export const PROOFSLIP_AUDIENCE = 'https://proofslip.ai'
const GITHUB_JWKS_URL = `${GITHUB_OIDC_ISSUER}/.well-known/jwks`

export class OidcVerificationError extends Error {
  constructor(
    message: string,
    /** Stable machine reason: invalid_signature, invalid_issuer, invalid_audience, token_expired, token_not_yet_valid, missing_claim:<name>, malformed_token */
    public readonly reason: string,
  ) {
    super(message)
    this.name = 'OidcVerificationError'
  }
}

export interface GitHubActionsClaims {
  repository: string
  repositoryId: string
  repositoryOwner: string
  repositoryOwnerId: string
  repositoryVisibility: string
  ref: string
  sha: string
  workflowRef: string
  runId: string
  runAttempt: number
  actor: string
  eventName: string
  subject: string
  jti: string
}

// Persist every normalized provider claim except the raw token ID. Replay
// protection stores only sha256(jti), as required by the V1 trust contract.
export type StoredGitHubActionsClaims = Omit<GitHubActionsClaims, 'jti'>

export function toStoredGitHubActionsClaims({
  jti: _discarded,
  ...claims
}: GitHubActionsClaims): StoredGitHubActionsClaims {
  return claims
}

// Claims that must be present as non-empty strings, keyed by token claim name.
const REQUIRED_STRING_CLAIMS = [
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
  'sub',
  'jti',
] as const

let cachedRemoteJwks: JWTVerifyGetKey | null = null

function getGitHubJwks(): JWTVerifyGetKey {
  if (!cachedRemoteJwks) {
    cachedRemoteJwks = createRemoteJWKSet(new URL(GITHUB_JWKS_URL))
  }
  return cachedRemoteJwks
}

function requireString(payload: JWTPayload, claim: string): string {
  const value = payload[claim]
  if (typeof value !== 'string' || value.length === 0) {
    throw new OidcVerificationError(`Token is missing required claim: ${claim}`, `missing_claim:${claim}`)
  }
  return value
}

function normalizeClaims(payload: JWTPayload): GitHubActionsClaims {
  for (const claim of REQUIRED_STRING_CLAIMS) {
    requireString(payload, claim)
  }

  // Strict: an integer, or a string of digits only — "1abc" must not become 1.
  const rawAttempt = payload.run_attempt
  const runAttempt =
    typeof rawAttempt === 'number' && Number.isInteger(rawAttempt)
      ? rawAttempt
      : typeof rawAttempt === 'string' && /^\d+$/.test(rawAttempt)
        ? parseInt(rawAttempt, 10)
        : NaN
  if (!Number.isInteger(runAttempt) || runAttempt < 1) {
    throw new OidcVerificationError('Token is missing required claim: run_attempt', 'missing_claim:run_attempt')
  }

  return {
    repository: payload.repository as string,
    repositoryId: payload.repository_id as string,
    repositoryOwner: payload.repository_owner as string,
    repositoryOwnerId: payload.repository_owner_id as string,
    repositoryVisibility: payload.repository_visibility as string,
    ref: payload.ref as string,
    sha: payload.sha as string,
    workflowRef: payload.workflow_ref as string,
    runId: payload.run_id as string,
    runAttempt,
    actor: payload.actor as string,
    eventName: payload.event_name as string,
    subject: payload.sub as string,
    jti: payload.jti as string,
  }
}

/**
 * Verify a GitHub Actions OIDC token and return normalized claims.
 * Throws OidcVerificationError on any failure — callers must fail closed.
 *
 * `opts.getKey` allows tests to supply a local key set; production always
 * verifies against GitHub's JWKS.
 */
export async function verifyGitHubOidcToken(
  token: string,
  opts?: { getKey?: JWTVerifyGetKey; audience?: string },
): Promise<GitHubActionsClaims> {
  let payload: JWTPayload
  try {
    const result = await jwtVerify(token, opts?.getKey ?? getGitHubJwks(), {
      algorithms: ['RS256'],
      issuer: GITHUB_OIDC_ISSUER,
      audience: opts?.audience ?? PROOFSLIP_AUDIENCE,
      requiredClaims: ['exp', 'nbf', 'iat'],
      clockTolerance: 60,
    })
    payload = result.payload
  } catch (err) {
    if (err instanceof OidcVerificationError) throw err
    if (err instanceof joseErrors.JWTExpired) {
      throw new OidcVerificationError('Token has expired.', 'token_expired')
    }
    if (err instanceof joseErrors.JWTClaimValidationFailed) {
      if (err.reason === 'missing') {
        throw new OidcVerificationError(`Token is missing required claim: ${err.claim}`, `missing_claim:${err.claim}`)
      }
      if (err.claim === 'iss') {
        throw new OidcVerificationError('Token issuer is not GitHub Actions.', 'invalid_issuer')
      }
      if (err.claim === 'aud') {
        throw new OidcVerificationError('Token audience is not the ProofSlip audience.', 'invalid_audience')
      }
      if (err.claim === 'nbf' || err.claim === 'iat') {
        throw new OidcVerificationError('Token is not yet valid.', 'token_not_yet_valid')
      }
      throw new OidcVerificationError(`Token claim validation failed: ${err.claim}`, `missing_claim:${err.claim}`)
    }
    if (err instanceof joseErrors.JWSSignatureVerificationFailed) {
      throw new OidcVerificationError('Token signature verification failed.', 'invalid_signature')
    }
    if (err instanceof joseErrors.JWSInvalid || err instanceof joseErrors.JWTInvalid) {
      throw new OidcVerificationError('Token is malformed.', 'malformed_token')
    }
    throw new OidcVerificationError('Token verification failed.', 'invalid_signature')
  }

  // `jose` requires `iat` above, but only evaluates it when maxTokenAge is
  // configured. Reject a non-numeric or materially future issuance time here.
  const now = Math.floor(Date.now() / 1000)
  if (typeof payload.iat !== 'number') {
    throw new OidcVerificationError('Token is missing required claim: iat', 'missing_claim:iat')
  }
  if (payload.iat > now + 60) {
    throw new OidcVerificationError('Token is not yet valid.', 'token_not_yet_valid')
  }

  return normalizeClaims(payload)
}
