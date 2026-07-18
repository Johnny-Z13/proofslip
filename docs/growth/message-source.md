# ProofSlip Canonical Growth Message

Last verified: 2026-07-18

This is the canonical messaging source for growth work, listings, outreach drafts, automation prompts, and ecosystem positioning. If another growth document conflicts with this file, update that document before reusing its copy.

Technical specifications and source code remain the authority for implementation details.

## Primary position

**Category:** Provider-backed release proofs for GitHub Actions.

**Tagline:** A public proof that a specific GitHub Actions job ran for a specific commit.

**One-liner:** ProofSlip verifies a GitHub Actions OIDC token and issues a stable public proof of the repository, commit, workflow, and run behind a release claim.

**Short description:** ProofSlip gives coding agents and humans a portable, independently inspectable record of the GitHub Actions job identity behind a release. No ProofSlip account or API key is required.

**Long description:** ProofSlip verifies GitHub Actions OIDC, records the provider-backed repository, commit, ref, workflow, run, actor, and event claims, and returns a public release-proof URL. Optional facts observed by ProofSlip and labels supplied by the workflow remain visibly separate from provider-verified claims. A proof shows which job identity requested it; it does not claim that tests passed or that a deployment contains the commit.

## The problem

Coding agents can say that they shipped something, but the next agent or human often receives only a claim, a message, or a mutable log link. ProofSlip turns the release job identity into a portable evidence object that can be checked before work continues.

## What a release proof establishes

Every `release-proof/v1` object separates three sources:

| Field | Source | Meaning |
|---|---|---|
| `issuer` | GitHub Actions OIDC, provider-verified | The identity and execution context of the workflow job that requested the token. |
| `observations` | ProofSlip | Optional facts ProofSlip observed at issuance time, such as an HTTP status. |
| `submitted_context` | Workflow input | Caller-supplied labels, always displayed as unverified. |

## What it does not establish

A release proof does not prove:

- That tests passed.
- That every workflow step completed successfully.
- That a deployment contains the provider-verified commit.
- That submitted labels are true.
- That the underlying code is safe, correct, or approved.

The limits are part of the product. Do not inflate the claim in listings or content.

## Access and retention

- Creation uses a GitHub Actions OIDC bearer token with audience `https://proofslip.ai`.
- No ProofSlip account or API key is required for release proofs.
- Proof JSON and human proof pages are public.
- This includes proofs created from private repositories; repository metadata and submitted context in the proof can become public.
- Release proofs have a 90-day validity window.
- Expiration is not deletion in V1. Expired records remain publicly inspectable with HTTP 410 until an explicit deletion request or future retention policy removes them.

Always include the public-data warning when recommending private-repository use.

## Primary audiences

1. Developers supervising AI coding agents.
2. Teams using autonomous or semi-autonomous release workflows.
3. CI/CD and platform engineers who need portable release provenance.
4. Agent-framework and tool builders that need a verifiable handoff artifact.
5. Agents deciding whether a claimed release step actually has provider-backed evidence.

## Primary use cases

- Attach a proof URL to an agent handoff.
- Add a proof to a GitHub Actions job summary or release record.
- Gate the next agent step on a publicly fetchable evidence object.
- Preserve the exact repository, SHA, workflow, and run identity behind a release claim.
- Keep provider claims, service observations, and workflow labels from being conflated.

## Current product surfaces

### Release-proof surfaces

- Website: https://proofslip.ai
- Human docs: https://proofslip.ai/docs
- Create: `POST /v1/proofs/releases/github-actions`
- Fetch JSON: `GET /v1/proofs/{proof_id}`
- Human view: `GET /proof/{proof_id}`
- OpenAPI: https://proofslip.ai/.well-known/openapi.json
- Agent context: https://proofslip.ai/llms.txt and https://proofslip.ai/llms-full.txt
- Discovery: `agent.json`, `ai-plugin.json`, sitemap, and privacy policy.

### Legacy receipt surfaces

ProofSlip still operates the original short-lived receipt API for agent handshakes, approvals, resumable workflows, and polling.

The following published integrations currently expose only the legacy receipt API, not release-proof creation:

- `@proofslip/sdk`
- `@proofslip/mcp-server`
- `langchain-proofslip`
- The existing Proofslip Assistant GPT Action

Never describe those integrations as creating provider-backed release proofs until their implementation actually supports it.

## ContextCapsule relationship

Approved ecosystem wording:

- **ProofSlip** is evidential: "Here is what was verified, by whom, and when."
- **ContextCapsule** is navigational: "Here is the situation, what matters, and what should happen next."

Together they support reliable agent handoffs: ProofSlip supplies inspectable evidence; ContextCapsule supplies the context and next-step intent.

Do not imply that ContextCapsule automatically verifies a release proof unless that integration is implemented and tested.

## Copy blocks

### Directory tagline

Provider-backed release proofs for GitHub Actions.

### Directory one-liner

Verify the GitHub Actions job identity behind a release and share a public proof of the repository, commit, workflow, and run.

### Agent-facing description

Use ProofSlip when a workflow or coding agent claims a release occurred and you need provider-backed evidence of the GitHub Actions job identity. Fetch the public proof and inspect `issuer`, `observations`, and `submitted_context` as separate trust categories. Do not treat the proof as evidence that tests passed or that a deployment contains the commit.

### Ecosystem pitch

ProofSlip and ContextCapsule are two primitives for reliable agent handoffs. ProofSlip provides evidence of what was verified; ContextCapsule carries the situation and what should happen next.

## Keywords

release proof, release provenance, GitHub Actions, OIDC, coding agents, CI/CD, deployment evidence, workflow identity, agent handoff, public verification, MCP, OpenAPI

Use `receipts`, `ephemeral`, and `polling` only when describing the legacy receipt API.

## Language to avoid

Do not use these as primary product claims:

- "Ephemeral receipts that prove agent actions happened."
- "Proof that the deployment contains this commit."
- "Proof that the workflow succeeded."
- "Proof that tests passed."
- "Tamper-proof" or "trustless."
- "Private proof" or wording that implies proof URLs are access-controlled.
- "Permanent" when describing retention; use "stable public URL" and explain the V1 validity/deletion behavior.

## Current status

- `release-proof/v1` is live in production.
- The database migration and public contract are deployed.
- The complete local test stack and post-deploy smoke checks pass.
- A genuine production OIDC creation canary still requires a GitHub Actions runner and should be release-triggered rather than daily to avoid permanent proof and analytics noise.
- Organic adoption is not yet established; first-party tests and canaries must not be reported as users.

## Messaging change rule

Any proposal that changes the primary category, trust claim, public-data behavior, retention description, or relationship to the legacy API must update this file and the relevant tests in the same reviewed change.
