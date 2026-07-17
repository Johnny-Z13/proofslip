# ProofSlip Repositioning Plan: Release Proof

Status: proposed
Implementation owner: Fable
Product and launch owner: Codex

## 1. Outcome

Reposition ProofSlip from a generic receipt API into a focused open-source verification tool for coding-agent releases.

Core promise:

> Your coding agent says it shipped. ProofSlip checks the provider and gives the next agent a receipt it can verify.

The first production workflow should produce a public, machine-readable proof backed by GitHub Actions identity and execution metadata. It must demonstrate a stronger trust boundary than an agent writing its own success claim.

## 2. Target User and Job

Primary user:

- Solo developers and small engineering teams using Codex, Claude Code, Cursor, or other coding agents.
- Teams that let agents work asynchronously or hand work between agents and humans.

Job to be done:

> When an agent or CI workflow says a release completed, let me verify the exact repository, commit, workflow run, and observed deployment result before I continue.

Initial buyer, if monetization emerges:

- Engineering lead or founder running several agent-authored changes per week.

## 3. MVP Boundary

### Included

- GitHub Actions as the first authoritative issuer.
- GitHub OIDC verification for repository, commit SHA, ref, workflow, run, actor, issuer, audience, and timestamps.
- Optional HTTP observation of a deployment or health URL at issuance time.
- Immutable hosted proof record.
- Public JSON and human-readable verification views.
- Agent Skill for verifying a proof and setting up the release-proof workflow.
- A real demonstration repository that creates fresh proofs automatically.
- Anonymous aggregate usage measurement without storing secrets or private payloads.

### Explicitly excluded

- Generic approval, handshake, resume, and failure workflows in the new positioning.
- Vercel OAuth, GitHub App installation, Stripe, Resend, Railway, or other connectors in the first release.
- Team dashboard, billing, alerts, policy builder, or enterprise compliance features.
- Claims that ProofSlip prevents side effects or duplicate actions.
- Claims that self-submitted metadata is independently verified.
- Breaking removal of the existing receipt API.

## 4. Trust Model

The product must clearly separate three things:

1. **Provider-verified facts**: claims extracted from and cryptographically tied to a valid GitHub Actions OIDC token.
2. **ProofSlip observations**: facts ProofSlip independently observed, such as an HTTP status at a deployment URL.
3. **Submitted context**: labels or notes supplied by the workflow, which are useful but not independently verified.

The UI and API must never visually merge these categories.

GitHub OIDC proves the identity and execution context of the job that requested the token. It does **not** by itself prove that every test passed, that an entire workflow concluded successfully, or that a deployment contains the claimed commit. Those stronger statements require a separate authoritative observation and must not appear as verified facts in V1.

### GitHub OIDC checks

The server must verify, at minimum:

- Token signature against GitHub's current JWKS.
- `iss` equals GitHub Actions' token issuer.
- `aud` is the ProofSlip production audience.
- Token expiry and not-before constraints.
- Repository, repository ID, repository owner, owner ID, visibility, ref, SHA, workflow reference, run ID, run number, run attempt, actor, event, subject, and token ID claims are present and normalized.
- The token ID (`jti`) is stored only as a one-way digest and cannot be reused to create conflicting proofs.
- The proof cannot be reissued with conflicting content under the same idempotency key.

Do not treat arbitrary request fields as provider-verified merely because a valid OIDC token accompanies the request.

## 5. API Plan

Keep the existing `/v1/receipts` and verification routes operational as a legacy/general API during the experiment.

Add a narrow release-proof contract.

### Create GitHub Actions release proof

`POST /v1/proofs/releases/github-actions`

Authentication:

- GitHub Actions OIDC token with a ProofSlip-specific audience.
- Do not require a ProofSlip API key for this workflow.

Request body:

```json
{
  "schema_version": "release-proof/v1",
  "idempotency_key": "repository:workflow_run_id:attempt",
  "deployment": {
    "url": "https://example.vercel.app",
    "health_path": "/health"
  },
  "submitted_context": {
    "environment": "production",
    "label": "web release"
  }
}
```

Response:

```json
{
  "proof_id": "prf_...",
  "proof_url": "https://proofslip.ai/proof/prf_...",
  "schema_version": "release-proof/v1",
  "issuer": {
    "type": "github_actions",
    "repository": "owner/repo",
    "sha": "...",
    "ref": "refs/heads/main",
    "workflow_ref": "...",
    "run_id": "...",
    "run_attempt": 1,
    "actor": "..."
  },
  "observations": [],
  "issued_at": "...",
  "expires_at": "..."
}
```

### Fetch proof

`GET /v1/proofs/:proof_id`

- Public, read-only JSON.
- Return explicit `is_valid`, `is_expired`, `trust_level`, and `verification_method` fields.
- Include source URLs for the GitHub workflow run and observed deployment.

### Human proof view

`GET /proof/:proof_id`

- Human-readable evidence view.
- Content negotiation may serve JSON when explicitly requested, but do not rely on ambiguous user-agent detection.

### Error contract

Use the existing structured error envelope and always include the request ID. Add specific codes for:

- `invalid_attestation`
- `unsupported_issuer`
- `claim_mismatch`
- `observation_failed`
- `idempotency_conflict`

The creation route must fail closed if provider verification fails.

## 6. Data Model

Prefer a separate `proofs` table rather than forcing authoritative evidence into the existing generic receipt columns.

Minimum fields:

- `id`
- `schema_version`
- `proof_type`
- `issuer_type`
- normalized issuer claims as JSONB
- observations as JSONB
- submitted context as JSONB
- idempotency key
- created/issued/expiry timestamps
- request ID
- optional compact evidence digest

Constraints:

- Proof records are immutable after creation.
- Submitted context has a strict size limit and must not allow HTML injection.
- Store no OIDC token after verification.
- Store no API keys, provider tokens, response bodies, cookies, or headers from deployment observations.
- Deployment checks must block private-network and metadata-service destinations to prevent SSRF.

## 7. Packages and Agent Surfaces

### Agent Skill

Add a repository Skill such as `skills/release-proof/SKILL.md`.

Responsibilities:

- Explain when release proof is appropriate.
- Verify an existing proof before a downstream agent continues.
- Generate or install the minimal GitHub Actions workflow after explicit user approval.
- Clearly report verified facts, observations, submitted context, expiry, and uncertainty.
- Never claim a deployment is verified when only GitHub workflow identity is verified.

Target install route:

```bash
npx skills add Johnny-Z13/proofslip
```

### GitHub workflow helper

Provide one copy-paste workflow example in the main repository first. Extract a dedicated GitHub Marketplace Action only after the end-to-end workflow is stable and used outside Z13 Labs.

The workflow should:

1. Run after the release and required checks.
2. Request an OIDC token with `id-token: write` and the ProofSlip audience.
3. Create a release proof.
4. Write the proof URL to the GitHub Actions summary.
5. Optionally comment on or attach the proof to a release without spamming pull requests.

### Existing MCP, SDK, and LangChain packages

- Preserve existing methods and document them as the general/legacy receipt API.
- Add proof-fetch/verify support only after the REST contract is stable.
- Do not add release-proof creation to every wrapper in the first implementation pass.
- Update all package base URLs to the canonical domain and add production smoke tests that include authentication across redirects.

## 8. Website Plan

### Homepage

Replace category-first language with the job:

> Your coding agent says it shipped. Check the slip.

Supporting line:

> ProofSlip verifies GitHub Actions identity, commit, workflow run, and deployment observations, then creates a receipt another agent can check.

Primary CTA:

- `Add release proof`

Secondary CTA:

- `View a real proof`

Do not make email signup the primary homepage action.

Homepage sections:

1. Real, automatically refreshed proof example.
2. What ProofSlip verified.
3. What ProofSlip did not verify.
4. Three-step GitHub Actions setup.
5. Agent verification example.
6. Open-source and self-hosting links.
7. Legacy receipt API link for existing integrations.

### Proof page

Show:

- Status: valid, expired, or invalid.
- Repository and exact commit.
- Workflow and run link.
- Issuer identity and verification method.
- Deployment observation, timestamp, URL, and HTTP result.
- Submitted context in a visibly separate section.
- Machine-readable JSON link.
- Small `Verify releases in your project` install link.

### Documentation

Reorder docs:

1. Release Proof quick start.
2. Trust model.
3. GitHub Actions workflow.
4. Verify from an agent.
5. API reference.
6. Security and privacy.
7. General receipt API under a clearly labelled legacy/general section.

Update `llms.txt`, `llms-full.txt`, OpenAPI, MCP manifests, sitemap, privacy page, README files, package descriptions, and registry text from the same canonical positioning.

## 9. README Plan

The repository README should answer within the first screen:

- What exact problem is solved?
- What does ProofSlip verify?
- How do I run the first successful workflow?
- What will the resulting proof look like?

Required sections:

- One-sentence promise.
- Real proof screenshot or JSON excerpt.
- Five-minute GitHub Actions quick start.
- Trust model and limitations.
- Agent Skill install.
- API and self-hosting.
- Contributing.
- Roadmap limited to evidence-backed next steps.

Remove or demote broad examples involving approvals, handshakes, refunds, duplicate payments, and generic orchestration.

## 10. Reliability, Security, and Privacy

Before launch:

- Signup email must return success only when the email is accepted by Resend; a failed email must not permanently strand the generated key.
- Canonical-domain redirects must not strip auth in any published quick start.
- Rate limiting must behave predictably under serverless concurrency or be described honestly.
- Usage limits must either be enforced or removed from pricing copy.
- Request IDs must be present in every error response.
- All discovery documents and package READMEs must agree on endpoints, tool names, auth, IDs, and domains.
- Deployment observation must use strict outbound URL policy, redirect limits, response size limits, and timeouts.
- Proof creation must not log tokens or secrets.
- Privacy documentation must describe provider claims and aggregate telemetry.

## 11. Tests and Verification

Add or update tests for:

- Valid GitHub OIDC token fixture and claim mapping.
- Invalid signature, issuer, audience, expiry, missing claim, and replay/idempotency cases.
- Submitted fields never becoming verified claims.
- SSRF and redirect protection for deployment observations.
- Immutable proof records.
- JSON and HTML proof views.
- Request IDs and error shapes.
- Skill setup and proof-verification scripts.
- Root, SDK, MCP, Python package, and production smoke suites.
- Live canonical-domain auth flow.
- A weekly demonstration workflow that creates a real proof and verifies it.

Do not mock the entire trust boundary in the only end-to-end test. At least one controlled CI test must use a real GitHub Actions OIDC token against production or a production-equivalent environment.

## 12. Instrumentation

Record aggregate events without sensitive payloads:

- `release_proof_created`
- `release_proof_create_failed` by reason
- `release_proof_viewed_html`
- `release_proof_fetched_json`
- `external_repository_first_seen`
- `external_repository_repeat_week`

Hash private repository identifiers before aggregation. Public repositories may retain their public slug only if the privacy policy states this clearly.

## 13. Launch Acceptance Criteria

The repositioned ProofSlip is ready to seed only when:

- A clean external demo repository can add the workflow from the README.
- The workflow creates a provider-backed proof without a ProofSlip account or API key.
- A second agent can fetch the proof and distinguish verified facts from submitted context.
- The proof describes GitHub OIDC as job identity and execution context, not as proof that all tests or the whole workflow succeeded.
- The proof page links to the exact GitHub run and commit.
- The deployment observation is truthful and safe.
- All production smoke tests pass against the canonical domain.
- The homepage and every package use the new positioning.
- The old API remains functional or is explicitly documented as deprecated.

## 14. Post-MVP Expansion Rules

Add Vercel-native verification only after at least three external repositories create release proofs in two separate weeks.

Add paid/private features only after direct demand. Likely paid candidates:

- Private proof visibility and access control.
- Longer retention.
- Provider connections that verify deployment-to-commit mapping.
- Team identities and policy gates.
- Signed export bundles and audit retention.
- Webhooks and reliability guarantees.

Do not build a dashboard merely to create a retention loop. Build it only when users need to manage recurring proofs.

## 15. Fable Implementation Sequence

Execute in small reviewable changes after the current stabilization work is committed:

1. Write the `release-proof/v1` contract, trust-boundary fixtures, and negative security cases before adding routes.
2. Add the immutable proof table and migration.
3. Implement GitHub OIDC discovery, JWKS verification, claim normalization, `jti` replay protection, and tests.
4. Add the create and fetch API routes with no deployment observation.
5. Add safe deployment URL observation as a separate evidence source.
6. Add JSON and human proof views.
7. Add the minimal GitHub workflow helper and demo repository.
8. Add the Agent Skill for setup and downstream verification.
9. Reposition the homepage, README, docs, packages, and discovery metadata.
10. Add aggregate instrumentation and production smoke coverage.
11. Deploy behind an internal or unlisted preview, exercise a real GitHub OIDC token, then enable the public quick start.

Every step should leave the legacy receipt API passing its existing tests.

## 16. Implementation References

- [GitHub OpenID Connect reference](https://docs.github.com/en/actions/reference/security/oidc)
- [GitHub deployment security hardening](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments)
- [Agent Skills specification](https://agentskills.io/specification)
- [Agent Skills script guidance](https://agentskills.io/skill-creation/using-scripts)
