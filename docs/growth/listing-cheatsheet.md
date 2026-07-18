# Listing Cheat Sheet

Copy source: [`message-source.md`](message-source.md)

Use the release-proof copy for general ProofSlip listings. Use the legacy integration copy only on listings for packages that still expose receipt tools.

## ProofSlip — primary product

**Name:** ProofSlip

**Category:** Provider-backed release proofs for GitHub Actions

**Tagline:** A public proof that a specific GitHub Actions job ran for a specific commit.

**One-liner:** Verify the GitHub Actions job identity behind a release and share a public proof of the repository, commit, workflow, and run.

**Short description:** ProofSlip verifies GitHub Actions OIDC and issues a stable public release proof that coding agents and humans can inspect. Provider claims, ProofSlip observations, and workflow-supplied labels remain separate.

**Trust limitation:** A release proof establishes the job identity and execution context that requested it. It does not prove that tests passed, the full workflow succeeded, or a deployment contains the commit.

**Privacy warning:** Proof URLs are public, including proofs from private repositories. Repository metadata and submitted context in the proof can be read by anyone with the URL.

### Links

- Website: https://proofslip.ai
- GitHub: https://github.com/Johnny-Z13/proofslip
- Docs: https://proofslip.ai/docs
- OpenAPI: https://proofslip.ai/.well-known/openapi.json
- Agent context: https://proofslip.ai/llms.txt
- Privacy: https://proofslip.ai/privacy

### Primary API

- `POST /v1/proofs/releases/github-actions` — create from a GitHub Actions OIDC token; no ProofSlip account.
- `GET /v1/proofs/{proof_id}` — fetch public proof JSON.
- `GET /proof/{proof_id}` — view the public human evidence page.

### Keywords

release proof, release provenance, GitHub Actions, OIDC, coding agents, CI/CD, deployment evidence, workflow identity, agent handoff, public verification, OpenAPI

## Legacy receipt integrations

These packages currently expose the original short-lived receipt API. Do not claim that they create provider-backed release proofs.

### MCP server

**Package:** `@proofslip/mcp-server`

**Install:** `npx -y @proofslip/mcp-server`

**Official MCP name:** `ai.proofslip/mcp-server`

**MCP manifest:** https://proofslip.ai/.well-known/mcp.json

**Accurate package description:** Legacy ProofSlip tools for creating, verifying, and polling short-lived workflow receipts. ProofSlip's primary GitHub Actions release-proof API is available separately through OpenAPI and is not currently an MCP tool.

**Tools:**

- `create_receipt` — create a short-lived workflow receipt.
- `verify_receipt` — fetch a valid receipt.
- `check_status` — poll receipt status.
- `signup` — create a legacy receipt API key.

### LangChain

**Package:** `langchain-proofslip`

**Install:** `pip install langchain-proofslip`

**Accurate package description:** LangChain tools for ProofSlip's legacy short-lived receipt API. The package does not currently create GitHub Actions release proofs.

### JS/TS SDK

**Package:** `@proofslip/sdk`

**Accurate package description:** JavaScript/TypeScript client for ProofSlip's legacy receipt API. Release-proof creation currently uses the public OpenAPI/HTTP contract directly.

### Proofslip Assistant GPT

**Status:** Legacy receipt integration.

The existing GPT Action cannot mint a GitHub Actions OIDC token and must not be described as creating release proofs.

## ContextCapsule

**Name:** ContextCapsule

**Tagline:** Portable execution context for agent workflows.

**One-liner:** Package the facts, state, constraints, and next-step intent agents need to continue reliably between handoffs.

**Website:** https://contextcapsule.ai

**GitHub:** https://github.com/Johnny-Z13/context-capsule

**npm:** https://www.npmjs.com/package/@contextcapsule/mcp-server

**Install:** `npx -y @contextcapsule/mcp-server`

**Keywords:** context capsule, agent handoff, execution context, workflow state, multi-agent, MCP

## Ecosystem pitch

ProofSlip and ContextCapsule are two primitives for reliable agent handoffs. ProofSlip provides evidence of what was verified; ContextCapsule carries the situation and what should happen next.

## Listing and submission surfaces

| Surface | Location | Current ProofSlip scope |
|---|---|---|
| Official MCP Registry | `ai.proofslip/mcp-server` | Legacy receipt tools |
| npm | `@proofslip/mcp-server`, `@proofslip/sdk` | Legacy receipt tools/client |
| PyPI | `langchain-proofslip` | Legacy receipt tools |
| Smithery / mcp.so | Existing listing | Audit copy; legacy MCP capability |
| Glama.ai | Existing listing | Audit copy; legacy MCP capability |
| PulseMCP | Official-registry ingestion | Verify presence and copy |
| OpenAI GPT Store | Existing Proofslip Assistant | Legacy receipt Action |
| OpenAPI and agent discovery | proofslip.ai | Primary release-proof API plus labeled legacy operations |

## Pre-submission checklist

- Does the surface describe the primary product or a specific legacy package?
- Does the copy match `message-source.md`?
- Are release-proof trust limitations present where space allows?
- Is public/private-repository exposure disclosed when workflow setup is shown?
- Does the listing avoid claiming MCP, LangChain, SDK, or GPT support for release-proof creation?
- Are package versions and URLs verified immediately before submission?
