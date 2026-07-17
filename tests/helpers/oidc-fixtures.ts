import { generateKeyPair, generateSecret, SignJWT, exportJWK, createLocalJWKSet } from 'jose'
import type { JWTVerifyGetKey } from 'jose'
import { GITHUB_OIDC_ISSUER, PROOFSLIP_AUDIENCE } from '../../src/lib/github-oidc.js'

/**
 * Test fixture for GitHub Actions OIDC tokens: a local RSA keypair whose
 * public half is exposed as a JWKS resolver, and a signer that produces
 * GitHub-shaped tokens. Lets tests exercise the full verification path
 * (signature included) without GitHub.
 */

export interface OidcFixture {
  getKey: JWTVerifyGetKey
  /** A second, unrelated key set — tokens signed by `sign` never verify against it. */
  wrongKey: JWTVerifyGetKey
  sign: (overrides?: Record<string, unknown>, opts?: SignOpts) => Promise<string>
}

interface SignOpts {
  issuer?: string
  audience?: string
  expiresIn?: string
  notBefore?: string
  /** Sign with the unrelated key so signature verification fails. */
  useWrongKey?: boolean
  /** Omit the exp claim entirely. */
  omitExp?: boolean
  /** Omit the iat claim entirely. */
  omitIat?: boolean
  /** Omit the nbf claim entirely. */
  omitNbf?: boolean
  /** Override iat with an explicit NumericDate. */
  issuedAt?: number
  /** Sign with a symmetric HS256 key instead of RS256. */
  useHs256?: boolean
}

export const BASE_CLAIMS = {
  repository: 'octo-org/octo-repo',
  repository_id: '74',
  repository_owner: 'octo-org',
  repository_owner_id: '65',
  repository_visibility: 'public',
  ref: 'refs/heads/main',
  sha: 'a'.repeat(40),
  workflow: 'Release',
  workflow_ref: 'octo-org/octo-repo/.github/workflows/release.yml@refs/heads/main',
  run_id: '1234567890',
  run_number: '42',
  run_attempt: '1',
  actor: 'octocat',
  actor_id: '12',
  event_name: 'push',
  sub: 'repo:octo-org/octo-repo:ref:refs/heads/main',
  environment: 'production',
}

let counter = 0

export async function createOidcFixture(): Promise<OidcFixture> {
  const { publicKey, privateKey } = await generateKeyPair('RS256')
  const wrong = await generateKeyPair('RS256')
  const hs256Secret = await generateSecret('HS256')

  const jwk = { ...(await exportJWK(publicKey)), alg: 'RS256', use: 'sig', kid: 'test-key' }
  const wrongJwk = { ...(await exportJWK(wrong.publicKey)), alg: 'RS256', use: 'sig', kid: 'wrong-key' }

  const getKey = createLocalJWKSet({ keys: [jwk] })
  const wrongKey = createLocalJWKSet({ keys: [wrongJwk] })

  const sign = async (overrides: Record<string, unknown> = {}, opts: SignOpts = {}) => {
    counter++
    const claims: Record<string, unknown> = {
      ...BASE_CLAIMS,
      jti: `test-jti-${Date.now()}-${counter}`,
      ...overrides,
    }
    // An override set to undefined removes the claim entirely.
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) delete claims[key]
    }

    const alg = opts.useHs256 ? 'HS256' : 'RS256'
    const jwt = new SignJWT(claims)
      .setProtectedHeader({ alg, kid: opts.useWrongKey ? 'wrong-key' : 'test-key' })
      .setIssuer(opts.issuer ?? GITHUB_OIDC_ISSUER)
      .setAudience(opts.audience ?? PROOFSLIP_AUDIENCE)
    if (!opts.omitIat) jwt.setIssuedAt(opts.issuedAt)
    if (!opts.omitExp) jwt.setExpirationTime(opts.expiresIn ?? '5m')
    if (!opts.omitNbf) jwt.setNotBefore(opts.notBefore ?? '0s')

    if (opts.useHs256) return jwt.sign(hs256Secret)
    return jwt.sign(opts.useWrongKey ? wrong.privateKey : privateKey)
  }

  return { getKey, wrongKey, sign }
}
