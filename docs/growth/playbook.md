# ProofSlip Growth Playbook

Strategy: **workflow-native propagation** — make provider-backed release proofs easy to create, inspect, share, and discover wherever coding-agent releases happen.

Canonical messaging: [`message-source.md`](message-source.md)

## Phase 0: release-proof foundation

| Action | Status | Notes |
|---|---|---|
| Deploy `release-proof/v1` | DONE | GitHub Actions OIDC create route, public JSON, and human proof page are live. |
| Apply proof schema migration | DONE | Production and isolated test branch are migrated. |
| Reposition homepage | DONE | Release proofs lead; legacy receipts are secondary. |
| Align public docs and discovery | DONE | README, docs, privacy, OpenAPI, llms files, agent manifest, and MCP manifest aligned. |
| Establish canonical growth message | DONE | `docs/growth/message-source.md`. |
| Align active growth documents | DONE | Thesis, playbook, listing copy, and current log updated. |
| Build privacy-safe adoption pulse | NOT STARTED | Aggregate-only output through a dedicated read-only database role. |
| Add real production OIDC canary | NOT STARTED | Trigger after releases, not daily; exclude it from organic metrics. |

## Phase 1: GitHub release workflow distribution

Make the release-proof pattern easy to copy at the point where it is useful.

| Action | Status | Notes |
|---|---|---|
| Publish workflow snippet in docs | DONE | OIDC permission, audience, proof creation, and public proof response documented. |
| Add a dogfooded release workflow | NOT STARTED | Create and verify a real proof after production releases. |
| Evaluate a reusable/composite GitHub Action | NOT STARTED | Build only if it removes meaningful setup without hiding the trust model. |
| Create a reference repository | NOT STARTED | Minimal coding-agent release → ProofSlip → handoff example. |
| Add job-summary output pattern | NOT STARTED | Show how to put the proof URL in `GITHUB_STEP_SUMMARY`. |
| Evaluate GitHub Marketplace fit | NOT STARTED | Only after a maintained Action exists. |

## Phase 2: agent and machine discovery

| Action | Status | Notes |
|---|---|---|
| `/llms.txt` and `/llms-full.txt` | DONE | Release-proof-first contract live. |
| OpenAPI 3.1 | DONE | Release-proof operations primary; legacy operations labeled. |
| `agent.json` and `ai-plugin.json` | DONE | Per-operation auth and trust categories published. |
| Sitemap and human docs | DONE | Public proof, docs, privacy, and discovery surfaces linked. |
| Monitor discovery drift | NOT STARTED | Daily sentinel proposed in `codex-automation-plan.md`. |
| Monitor new release/provenance surfaces | NOT STARTED | Weekly primary-source scout proposed. |

## Phase 3: reference artifact

Create one strong, reproducible example rather than a stream of generic content.

| Action | Status | Notes |
|---|---|---|
| Pick canonical workflow | NOT STARTED | Coding agent ships through GitHub Actions, creates proof, hands URL to next agent. |
| Build open-source reference repo | NOT STARTED | Keep the happy path small and the trust limitations explicit. |
| Write technical walkthrough | NOT STARTED | Derive it from the working repo and real proof output. |
| Add integration/example section to site | NOT STARTED | Show only implemented, tested integrations. |
| Submit to relevant framework docs | NOT STARTED | After the example proves product fit. |

## Phase 4: measure and compound

| Action | Status | Notes |
|---|---|---|
| Monitor organic proof creation | NOT STARTED | Exclude Z13, smoke, and canary traffic. |
| Monitor proof views and JSON fetches | NOT STARTED | Compare with creations without exposing private repository identity. |
| Track first external repository | NOT STARTED | First genuine adoption milestone. |
| Keep listings and discovery current | ONGOING | Release-proof message is canonical. |
| Cross-link ContextCapsule carefully | ONGOING | Evidence + navigation; do not imply an unimplemented automatic integration. |
| Respond to platform changes | ONGOING | Prioritize GitHub OIDC, CI/CD provenance, OpenAPI, and agent discovery changes. |

## Legacy ecosystem reach

These surfaces still matter as discovery bridges, but their current tools expose the legacy short-lived receipt API. Listings must say that plainly.

### Registry and package status

| Action | Status | Notes |
|---|---|---|
| Publish MCP server to npm | DONE | `@proofslip/mcp-server`; legacy receipt tools. |
| Include Smithery metadata | DONE | Published package contains its listing metadata. |
| List on mcp.so / Smithery | DONE | Copy should be audited against the canonical message. |
| List on Glama.ai | DONE | Copy should be audited against the canonical message. |
| Publish to official MCP Registry | DONE | `ai.proofslip/mcp-server`; legacy receipt tools. |
| PulseMCP ingestion | PENDING | Expected through official-registry ingestion; verify current presence. |
| Publish JS/TS SDK | DONE | `@proofslip/sdk`; legacy receipt client. |
| Publish LangChain package | DONE | `langchain-proofslip`; legacy receipt tools. |
| Proofslip Assistant GPT | LEGACY | Existing Action covers receipts and cannot mint GitHub Actions OIDC. Do not present it as release-proof creation. |
| CrewAI wrapper | DEFERRED | Do not create another legacy wrapper unless usage evidence justifies it. |
| AutoGen definition | DEFERRED | OpenAPI may already be sufficient; validate demand first. |
| n8n community node | DEFERRED | Reassess only with a concrete release-workflow use case. |

### Explicitly skipped

| Surface | Status | Reason |
|---|---|---|
| mcp.run | SKIPPED | Rebranded as an enterprise gateway rather than a public directory. |
| Composio | SKIPPED | No useful self-service listing path was available at the time checked. Revisit only with new evidence. |

## ContextCapsule alignment

ContextCapsule remains the navigational sister product:

- ProofSlip: evidence of what was verified.
- ContextCapsule: the situation, constraints, and next-step intent.

ProofSlip leads release-proof experimentation. ContextCapsule should inherit only proven discovery patterns, not automatically mirror every package or listing.

## Prioritization rules

1. Fix trust, privacy, or public-contract drift before growth work.
2. Prefer workflow-native release surfaces over generic directories.
3. Prefer one real reference implementation over multiple thin wrappers.
4. Do not count first-party tests or canaries as adoption.
5. Do not build an integration without a plausible discovery path and maintenance owner.
6. Never let legacy receipt integrations imply release-proof capability.
7. Public submissions and publishing remain human-approved.

## Next concrete milestone

Create a release-triggered GitHub Actions canary that produces a real ProofSlip, writes its URL to the job summary, verifies the public JSON/human views, and is excluded from organic adoption metrics.
