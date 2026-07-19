export function renderLlmsTxt(): string {
  return `# ProofSlip

> Provider-backed release proofs for GitHub Actions. Verify the workflow job identity behind a release, then share a public proof URL.

Website: https://proofslip.ai
Docs: https://proofslip.ai/docs
OpenAPI: https://proofslip.ai/.well-known/openapi.json
Privacy: https://proofslip.ai/privacy
Full agent reference: https://proofslip.ai/llms-full.txt

## Primary agent workflow: proofslip-release-proof skill

Install:
npx skills add Johnny-Z13/proofslip --skill proofslip-release-proof

Source:
https://github.com/Johnny-Z13/proofslip/tree/master/.agents/skills/proofslip-release-proof

Use the skill to verify an existing release-proof URL or to prepare the smallest change to the GitHub Actions workflow that actually deploys or releases a project. Inspect before editing, show the proposed change, and ask for approval. Do not create a synthetic proof-only workflow. Do not commit, push, or release without separate authorization.

The bundled verification helper accepts a proof ID or URL:
node .agents/skills/proofslip-release-proof/scripts/verify-proof.mjs https://proofslip.ai/proof/prf_...

Report provider-verified issuer facts, ProofSlip observations, submitted context, expiry, and limitations as separate lanes.

## API contract: release-proof/v1

Create:
POST /v1/proofs/releases/github-actions
Authorization: Bearer <GitHub Actions OIDC token>

The OIDC token must use audience https://proofslip.ai. No ProofSlip account or API key is required.

Optional JSON body:
{
  "schema_version": "release-proof/v1",
  "idempotency_key": "owner/repo:run_id:attempt",
  "deployment": {"url": "https://app.example.com", "health_path": "/health"},
  "submitted_context": {"environment": "production"}
}

Successful creation returns 201. An identical replay or idempotent retry returns 200.

Fetch JSON:
GET /v1/proofs/{proof_id}

Human view:
GET /proof/{proof_id}

Both fetch routes are public. Proofs have a 90-day validity window. Expired proofs remain inspectable and return 410 with is_expired=true and the full record.

## Trust boundary

- issuer: provider-verified GitHub Actions job identity and execution-context claims.
- observations: facts observed separately by ProofSlip, such as an HTTP status at issuance time.
- submitted_context: caller-supplied labels; always unverified.

A release proof does NOT prove that tests passed, that the full workflow succeeded, or that a deployment contains the claimed commit.

## Privacy warning

Proof URLs are public, including proofs created from private repositories. Repository metadata and submitted context in the proof can be read by anyone with the URL. Review https://proofslip.ai/privacy before enabling private-repository workflows.

## Legacy receipt API

The original ephemeral receipt API remains available:

- POST /v1/auth/signup — create a ProofSlip API key.
- POST /v1/receipts — create a 60-second to 24-hour receipt; API key required.
- GET /v1/verify/{receipt_id}?format=json — public receipt verification.
- GET /v1/receipts/{receipt_id}/status — public lightweight polling.

Published MCP and LangChain integrations currently expose these legacy receipt tools:

- npx -y @proofslip/mcp-server
- pip install langchain-proofslip

## Error envelope

{"error":"error_code","message":"Description","request_id":"req_..."}

Release-proof error codes include validation_error, unsupported_issuer, invalid_attestation, proof_not_found, idempotency_conflict, payload_too_large, and rate_limited.
`
}
