export function renderLlmsFullTxt(): string {
  return `# ProofSlip — Complete Agent Reference

> ProofSlip creates provider-backed, publicly inspectable release proofs from GitHub Actions OIDC attestations. The legacy short-lived receipt API remains operational as a separate surface.

Base URL: https://proofslip.ai
Human docs: https://proofslip.ai/docs
OpenAPI 3.1: https://proofslip.ai/.well-known/openapi.json
Privacy: https://proofslip.ai/privacy
Source: https://github.com/Johnny-Z13/proofslip

## 1. release-proof/v1

### What is verified

ProofSlip validates a GitHub Actions OIDC token's signature against GitHub's JWKS, then validates:

- issuer: https://token.actions.githubusercontent.com
- audience: https://proofslip.ai
- exp, nbf, and iat time constraints with 60 seconds of clock tolerance
- required GitHub job claims, including repository identity, visibility, ref, SHA, workflow reference, run ID, run attempt, actor, event, subject, and token ID

The raw token is never persisted. The token ID is stored only as a SHA-256 digest for replay protection.

### Trust categories

Every proof keeps three evidence sources structurally separate:

1. issuer — provider-verified GitHub Actions job identity and execution context.
2. observations — facts ProofSlip observed itself at issuance time.
3. submitted_context — caller-supplied labels, stored and displayed as unverified.

Never infer that a proof establishes more than these fields say. In particular, GitHub OIDC does not prove that tests passed, that the whole workflow succeeded, or that a deployment contains the claimed commit.

### Create a release proof

POST /v1/proofs/releases/github-actions
Authorization: Bearer <GitHub Actions OIDC JWT>
Content-Type: application/json

No ProofSlip API key or account is required.

All request-body fields are optional:

{
  "schema_version": "release-proof/v1",
  "idempotency_key": "owner/repo:run_id:attempt",
  "deployment": {
    "url": "https://app.example.com",
    "health_path": "/health"
  },
  "submitted_context": {
    "environment": "production",
    "label": "web release"
  }
}

Constraints:

- total request body: at most 16KB
- idempotency_key: 1 to 255 characters, unique per provider-verified repository
- deployment.url: public HTTPS URL, default port only, at most 512 characters
- deployment.health_path: begins with /, at most 256 characters
- submitted_context: flat string map, at most 10 entries and 1KB serialized UTF-8

Deployment observations:

- DNS is resolved once and the request is pinned to a validated public address.
- Private, loopback, link-local, metadata, CGNAT, multicast, and other blocked addresses are rejected.
- Redirects are not followed.
- Response bodies and headers are not read or stored.
- Observation timeout is five seconds.
- Observation failure is recorded separately and does not invalidate the provider-backed proof.

Example response:

{
  "proof_id": "prf_...",
  "proof_url": "https://proofslip.ai/proof/prf_...",
  "schema_version": "release-proof/v1",
  "is_valid": true,
  "is_expired": false,
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
    "sha": "0123456789abcdef0123456789abcdef01234567",
    "workflow_ref": "owner/repo/.github/workflows/release.yml@refs/heads/main",
    "run_id": "789",
    "run_attempt": 1,
    "actor": "octocat",
    "event_name": "push",
    "subject": "repo:owner/repo:ref:refs/heads/main",
    "run_url": "https://github.com/owner/repo/actions/runs/789",
    "commit_url": "https://github.com/owner/repo/commit/0123456789abcdef0123456789abcdef01234567"
  },
  "observations": [],
  "submitted_context": null,
  "issued_at": "2026-07-18T00:00:00.000Z",
  "expires_at": "2026-10-16T00:00:00.000Z"
}

Status codes:

- 201: new proof created
- 200: identical token replay or idempotent retry; existing proof returned
- 400 validation_error: invalid body
- 400 unsupported_issuer: token issuer is not GitHub Actions
- 401 invalid_attestation: missing token or failed signature, audience, time, or claim validation
- 409 idempotency_conflict: token or idempotency key reused with different request or provider claims
- 413 payload_too_large: body exceeds 16KB
- 429 rate_limited: creation exceeds 30 requests/min per source IP

### Fetch a proof

GET /v1/proofs/{proof_id}

Public JSON; no authentication.

- 200: proof exists inside its 90-day validity window
- 410: proof is expired; full record is still returned with is_valid=false and is_expired=true
- 404 proof_not_found: unknown proof ID

Human view:

GET /proof/{proof_id}

The human route serves HTML by default. It serves JSON when Accept includes application/json or when ?format=json is supplied.

### Replay and idempotency

- A reused OIDC token ID can return only the identical existing proof.
- idempotency_key is scoped to the provider-verified repository.
- Changing provider claims, deployment target, submitted context, or idempotency key creates a conflict instead of mutating or replacing evidence.
- Proof records are immutable through the application API.

### Public access and retention

Proof URLs are public, including proofs created from private repositories. Provider claims may reveal repository name, owner, ref, SHA, workflow, actor, and run identifiers. submitted_context is also public.

Release proofs have a 90-day validity window. V1 retains expired proof records so they remain inspectable and returns them with HTTP 410. Expiration is not automatic deletion. See https://proofslip.ai/privacy for deletion requests.

## 2. Legacy receipt API

The following API predates release-proof/v1 and remains operational for general agent workflows. It is not provider-backed.

### Get an API key

POST /v1/auth/signup
Content-Type: application/json

{"email":"dev@example.com","source":"api"}

The response returns an ak_ API key once. Save it immediately. This key is used only for legacy receipt creation.

### Create a receipt

POST /v1/receipts
Authorization: Bearer ak_...
Content-Type: application/json

{
  "type": "action",
  "status": "success",
  "summary": "Refund issued",
  "payload": {"amount": 42},
  "idempotency_key": "refund-8812",
  "expires_in": 86400
}

Receipt types: action, approval, handshake, resume, failure.

Receipt TTL: 60 to 86400 seconds. Default: 86400 seconds. Expired receipts return 404 and are deleted by automated cleanup.

### Verify a receipt

GET /v1/verify/{receipt_id}?format=json

Public. Returns the full valid receipt or 404 when missing, expired, or deleted.

### Poll receipt status

GET /v1/receipts/{receipt_id}/status

Public. Returns receipt_id, status, is_terminal, next_poll_after_seconds, and expires_at.

### Published integrations

The current MCP and LangChain packages expose the legacy receipt API:

npx -y @proofslip/mcp-server
pip install langchain-proofslip

MCP tools: create_receipt, verify_receipt, check_status, signup.
LangChain tools: ProofSlipCreateReceiptTool, ProofSlipVerifyReceiptTool, ProofSlipCheckStatusTool.

## 3. Common error envelope

All API errors use:

{"error":"error_code","message":"Human-readable description","request_id":"req_..."}

Use request_id when reporting a problem to hello@proofslip.ai.

## 4. Discovery endpoints

- https://proofslip.ai/llms.txt — compact agent reference
- https://proofslip.ai/llms-full.txt — this full reference
- https://proofslip.ai/.well-known/openapi.json — OpenAPI 3.1
- https://proofslip.ai/.well-known/agent.json — agent manifest
- https://proofslip.ai/.well-known/mcp.json — current legacy receipt MCP package
- https://proofslip.ai/docs — human documentation
`
}
