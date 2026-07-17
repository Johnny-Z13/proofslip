# ProofSlip

**A public proof that a specific GitHub Actions job ran for a specific commit.**

ProofSlip verifies a GitHub Actions OIDC token, records the provider-backed job identity and execution context, and returns a stable public proof URL. No ProofSlip account or API key is required for release proofs.

[Live site](https://proofslip.ai) · [Docs](https://proofslip.ai/docs) · [OpenAPI](https://proofslip.ai/.well-known/openapi.json) · [Privacy](https://proofslip.ai/privacy)

## What a release proof means

Every `release-proof/v1` object keeps three evidence sources separate:

| Field | Source | What it establishes |
|---|---|---|
| `issuer` | GitHub Actions OIDC, provider-verified | The identity and execution context of the workflow job that requested the token. |
| `observations` | ProofSlip | Optional facts ProofSlip observed at issuance time, such as an HTTP status. |
| `submitted_context` | Workflow input | Caller-supplied labels, explicitly marked unverified. |

A proof does **not** establish that tests passed, that the entire workflow succeeded, or that a deployment contains the claimed commit.

## GitHub Actions quickstart

```yaml
permissions:
  contents: read
  id-token: write

steps:
  - name: Create ProofSlip release proof
    shell: bash
    run: |
      TOKEN="$(curl -sSf \
        -H "Authorization: bearer ${ACTIONS_ID_TOKEN_REQUEST_TOKEN}" \
        "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=https%3A%2F%2Fproofslip.ai" \
        | jq -r .value)"

      BODY="$(jq -n \
        --arg key "${GITHUB_REPOSITORY}:${GITHUB_RUN_ID}:${GITHUB_RUN_ATTEMPT}" \
        '{idempotency_key:$key}')"

      curl --fail-with-body -sS \
        -X POST https://proofslip.ai/v1/proofs/releases/github-actions \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        --data "${BODY}"
```

Optional request fields let the workflow ask ProofSlip to observe a public HTTPS endpoint and attach unverified labels:

```json
{
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
```

The response includes a human `proof_url` and a machine-readable `proof_id`:

```json
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
    "ref": "refs/heads/main",
    "sha": "...",
    "run_id": "...",
    "run_attempt": 1
  },
  "observations": [],
  "submitted_context": null,
  "issued_at": "...",
  "expires_at": "..."
}
```

Fetch JSON with:

```bash
curl https://proofslip.ai/v1/proofs/prf_...
```

## API surface

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/v1/proofs/releases/github-actions` | GitHub Actions OIDC | Create a provider-backed release proof. |
| `GET` | `/v1/proofs/:proof_id` | None | Fetch public proof JSON. |
| `GET` | `/proof/:proof_id` | None | View the human evidence page. |
| `POST` | `/v1/receipts` | ProofSlip API key | Create a legacy workflow receipt. |
| `GET` | `/v1/verify/:receipt_id` | None | Verify a legacy receipt. |
| `GET` | `/v1/receipts/:receipt_id/status` | None | Poll legacy receipt status. |
| `POST` | `/v1/auth/signup` | None | Create an API key for legacy receipts. |

The full contract is available in [the human docs](https://proofslip.ai/docs), [OpenAPI](https://proofslip.ai/.well-known/openapi.json), and [`docs/specs/release-proof-v1.md`](docs/specs/release-proof-v1.md).

## Public access and retention

Release proof URLs are public, including proofs created from private repositories. The proof can expose repository metadata, workflow identifiers, actor, ref, SHA, and any submitted context.

Release proofs have a 90-day validity window. After that window they return HTTP `410` with `is_expired: true`, but V1 keeps the full record inspectable. Expiration is not automatic deletion. Read the [privacy policy](https://proofslip.ai/privacy) before enabling private-repository workflows.

Legacy receipts are different: they expire after at most 24 hours and are deleted by automated cleanup.

## Security properties

- GitHub OIDC signature verification against GitHub's JWKS.
- Strict issuer, audience, expiry, not-before, issued-at, algorithm, and required-claim checks.
- Raw OIDC tokens are never stored or logged.
- Token IDs are stored only as SHA-256 digests for replay protection.
- Provider claims, ProofSlip observations, and submitted context never share a trust category.
- Release proof records are immutable through the application API.
- Idempotent retries return the existing proof; conflicting retries fail with `409`.
- Deployment observations use public HTTPS only, pin the validated DNS address, never follow redirects, and never read response bodies.
- Global request bodies are limited to 16KB.

## Legacy receipt integrations

The published integrations currently expose the original short-lived receipt API, not release-proof creation.

### MCP

```bash
npx -y @proofslip/mcp-server
```

Tools: `create_receipt`, `verify_receipt`, `check_status`, `signup`.

### LangChain

```bash
pip install langchain-proofslip
```

Tools: create receipt, verify receipt, and check status, plus a toolkit wrapper.

## Machine discovery

| Endpoint | Format | Purpose |
|---|---|---|
| [`/llms.txt`](https://proofslip.ai/llms.txt) | Text | Compact agent context. |
| [`/llms-full.txt`](https://proofslip.ai/llms-full.txt) | Text | Complete agent contract. |
| [`/.well-known/openapi.json`](https://proofslip.ai/.well-known/openapi.json) | JSON | OpenAPI 3.1. |
| [`/.well-known/agent.json`](https://proofslip.ai/.well-known/agent.json) | JSON | Agent discovery. |
| [`/.well-known/mcp.json`](https://proofslip.ai/.well-known/mcp.json) | JSON | Legacy receipt MCP package. |

## Local development

Requirements: Node.js 18+ and PostgreSQL (the production deployment uses Neon).

```bash
git clone https://github.com/Johnny-Z13/proofslip.git
cd proofslip
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

Important environment variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Application database. Production deployments point this at the production branch. |
| `TEST_DATABASE_URL` | Dedicated test database or Neon branch. It must not resolve to the same target as `DATABASE_URL`. |
| `BASE_URL` | Public base URL; defaults to `https://proofslip.ai`. |
| `CRON_SECRET` | Protects the receipt-cleanup route. |
| `RESEND_API_KEY` | Optional transactional signup email. |
| `PROOFSLIP_API_KEY` | Used by production smoke tests for legacy receipts. |

The integration test setup remaps `DATABASE_URL` to `TEST_DATABASE_URL` and fails closed if the two targets are identical, including pooled versus direct Neon URLs.

## Tests

```bash
npm run test:unit      # unit + integration; mutates TEST_DATABASE_URL only
npm run test:smoke     # live production smoke tests
npm run test:packages  # SDK + MCP package tests
npm run test:all       # all four layers, including LangChain pytest
```

The LangChain layer runs from `packages/langchain/.venv` when available.

## Project structure

```text
src/
├── routes/proofs.ts          # release-proof create/fetch routes
├── routes/receipts.ts        # legacy receipt creation
├── lib/github-oidc.ts        # GitHub OIDC verification
├── lib/observe-deployment.ts # pinned-address HTTPS observation
├── lib/proof-format.ts       # shared public proof representation
└── views/                    # HTML and discovery surfaces
packages/
├── sdk/                      # legacy receipt TypeScript client
├── mcp-server/               # @proofslip/mcp-server
└── langchain/                # langchain-proofslip
tests/
├── lib/
├── routes/
├── smoke/
└── packages/
```

## ContextCapsule

ProofSlip is the evidential primitive in the ProofSlip + ContextCapsule pair:

- **ProofSlip:** “Here is what was verified, by whom, and when.”
- **ContextCapsule:** “Here is the situation, what matters, and what should happen next.”

The existing legacy loop remains: an agent creates a receipt, a capsule references its `receipt_id`, and the next agent verifies the receipt before continuing. Release proofs add a stronger provider-backed evidence object for GitHub release workflows.

## Status

ProofSlip is live and open source. `release-proof/v1` is implemented locally and should be deployed only after the database migration, public-contract review, and full test stack pass together.
