# release-proof/v1 — Contract

Status: implemented spec (source of truth for the V1 surface)
Parent plan: `docs/repositioning/proofslip-release-proof-plan.md`

## Trust boundary (normative)

Every proof carries exactly three, structurally separate, evidence categories:

1. **`issuer` (provider-verified)** — claims extracted from a GitHub Actions OIDC token whose
   signature, issuer, audience, and validity window ProofSlip verified against GitHub's JWKS.
   These prove *the identity and execution context of the workflow job that requested the token*.
   They do **not** prove that tests passed, that the whole workflow succeeded, or that any
   deployment contains the claimed commit.
2. **`observations` (ProofSlip-observed)** — facts ProofSlip itself observed at issuance time
   (an HTTP status at a deployment URL). Attributed to ProofSlip, timestamped, method-labelled.
3. **`submitted_context` (unverified)** — free-form labels supplied by the workflow. Stored and
   displayed verbatim as *submitted, not verified*. Never merged into the other categories.

No API response, HTML view, or marketing copy may present category 2 or 3 content as
provider-verified, or describe category 1 as more than job identity + execution context.

## Endpoints

### `POST /v1/proofs/releases/github-actions`

Auth: `Authorization: Bearer <GitHub Actions OIDC token>`. No ProofSlip API key.

The OIDC token must satisfy ALL of:

| Check | Requirement |
|---|---|
| Signature | Valid against GitHub's JWKS (`https://token.actions.githubusercontent.com/.well-known/jwks`) |
| `iss` | `https://token.actions.githubusercontent.com` |
| `aud` | `https://proofslip.ai` |
| `exp` / `nbf` / `iat` | Within validity window (60s clock tolerance) |
| Required claims | `repository`, `repository_id`, `repository_owner`, `repository_owner_id`, `repository_visibility`, `ref`, `sha`, `workflow_ref`, `run_id`, `run_attempt`, `actor`, `event_name`, `sub`, `jti` — all present, non-empty strings (`run_attempt` numeric-string or number) |
| Replay | `jti` is stored as a SHA-256 digest; a reused `jti` can only return the identical existing proof, never create or alter one |

Request body (all fields optional; `schema_version` defaults to `release-proof/v1`):

```json
{
  "schema_version": "release-proof/v1",
  "idempotency_key": "owner/repo:run_id:attempt",
  "deployment": { "url": "https://app.example.com", "health_path": "/health" },
  "submitted_context": { "environment": "production", "label": "web release" }
}
```

Body constraints:
- `idempotency_key`: string, 1–255 chars. Unique per `repository` claim (not per caller-supplied field).
- `deployment.url`: https URL, ≤ 512 chars, publicly routable host (see SSRF policy below).
- `deployment.health_path`: path starting with `/`, ≤ 256 chars.
- `submitted_context`: flat JSON object, string keys/values only, ≤ 10 entries, serialized ≤ 1024 bytes.
- Total body ≤ 16KB (global limit).

Success `201` (or `200` on idempotent replay):

```json
{
  "proof_id": "prf_...",
  "proof_url": "https://proofslip.ai/proof/prf_...",
  "schema_version": "release-proof/v1",
  "trust_level": "provider_verified",
  "verification_method": "github_actions_oidc",
  "issuer": {
    "type": "github_actions",
    "repository": "owner/repo",
    "repository_id": "123",
    "repository_owner": "owner",
    "repository_owner_id": "456",
    "repository_visibility": "public",
    "ref": "refs/heads/main",
    "sha": "…40 hex…",
    "workflow_ref": "owner/repo/.github/workflows/release.yml@refs/heads/main",
    "run_id": "789",
    "run_attempt": 1,
    "actor": "octocat",
    "event_name": "push",
    "subject": "repo:owner/repo:ref:refs/heads/main",
    "run_url": "https://github.com/owner/repo/actions/runs/789",
    "commit_url": "https://github.com/owner/repo/commit/<sha>"
  },
  "observations": [
    {
      "kind": "http_check",
      "method": "proofslip_http_observation",
      "url": "https://app.example.com/health",
      "status_code": 200,
      "response_time_ms": 143,
      "observed_at": "…",
      "note": "Status observed by ProofSlip at issuance time. Does not prove the deployment contains the claimed commit."
    }
  ],
  "submitted_context": { "environment": "production" },
  "issued_at": "…",
  "expires_at": "…"
}
```

Failed observation does not fail proof creation; it records
`{"kind":"http_check","error":"observation_failed","reason":"…"}` instead. Failed OIDC
verification always fails the request (fail closed).

Errors (envelope `{ error, message, request_id }`):
- `401 invalid_attestation` — signature, issuer, audience, expiry, or missing-claim failure. Message states which check failed but never echoes the token.
- `400 unsupported_issuer` — non-GitHub issuer explicitly declared.
- `409 idempotency_conflict` — same `(repository, idempotency_key)` with different content, or reused `jti` with different content.
- `400 validation_error` — body constraint violations.
- `429 rate_limited` — per-IP limit.

### `GET /v1/proofs/:proof_id`

Public JSON. Same shape as create, plus `is_valid` (verification succeeded at issuance and record intact) and `is_expired`. Expired proofs return `410` with `is_expired: true` and the full record (unlike receipts, expiry is visible, not a 404 — an expired proof is still evidence that expired). Unknown ID: `404 proof_not_found`.

### `GET /proof/:proof_id`

Human evidence view. Sections in order: status banner, provider-verified facts (with GitHub run/commit links), ProofSlip observations, submitted context (visually separated, labelled "submitted, not verified"), what-this-does-not-prove, JSON link, install route. Serves JSON only on explicit `Accept: application/json` or `?format=json`.

## SSRF / observation policy (normative)

- `https://` only, default port only.
- Hostname must not be an IP literal and must not resolve (A/AAAA, checked at request time) to: loopback, RFC1918, link-local/169.254 (cloud metadata), CGNAT 100.64/10, unique-local/site-local IPv6, unspecified, multicast, or broadcast addresses. IPv4-mapped IPv6 is unwrapped before checking.
- Redirects are never followed (`redirect: manual`); a 3xx is recorded as the observed status.
- Response body is never read; only status code and elapsed time are recorded.
- 5-second timeout via AbortController; timeout recorded as `observation_failed / timeout`.
- No request headers beyond a static `User-Agent: ProofSlip-Observer/1`; no cookies; no auth.
- Never stored: response bodies, response headers, certificates, resolved IPs.

## Storage (normative)

- Proof records are immutable — no UPDATE path exists in application code.
- The OIDC token is never persisted or logged; only normalized claims and the `jti` SHA-256 digest.
- Proofs expire 90 days after issuance (V1 default; retention tiers are a later, paid concern).
- `submitted_context` is stored as validated flat string map (HTML-escaped at render time, like all fields).

## Instrumentation (aggregate only)

`proof_events` rows: event name ∈ {`release_proof_created`, `release_proof_create_failed`, `release_proof_viewed_html`, `release_proof_fetched_json`}, failure reason code where applicable, repository digest (SHA-256 of repo slug for private repos; public repos keep the public slug), visibility flag, timestamp. No tokens, emails, IPs, or payload content.
