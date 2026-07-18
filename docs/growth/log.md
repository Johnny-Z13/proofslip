# ProofSlip Growth Log

Running record of what's been shipped, listed, and submitted.

---

## 2026-07-18

- **Shipped `release-proof/v1` to production.** ProofSlip now verifies GitHub Actions OIDC and publishes public proof JSON and human evidence pages for a repository, commit, ref, workflow, and run.
- Repositioned the homepage, README, docs, privacy policy, OpenAPI, llms files, and agent discovery around provider-backed release proofs. Legacy receipt APIs and packages remain available but are explicitly labeled.
- Hardened proof verification and storage: raw `jti` is no longer persisted, provider claims participate in idempotency matching, temporal claims fail closed, concurrent retries return the winning proof, submitted-context size is measured in UTF-8 bytes, and tests cannot target the production database.
- Created a persistent isolated Neon test branch and verified all four test layers plus post-deploy production checks.
- Established `docs/growth/message-source.md` as the canonical growth message and aligned the active thesis, playbook, listing cheat sheet, and GPT maintenance guide.
- Added a Codex scheduled-task plan for reliability, privacy-safe adoption signals, ecosystem scouting, artifact briefs, and weekly review. No automations have been enabled yet.

## 2026-07-17

- **P0 fix: flipped canonical domain.** proofslip.ai now serves production directly; www.proofslip.ai 308-redirects to it. Previously the bare domain 307-redirected to www, and Node fetch / Python requests strip Authorization headers on cross-host redirects — so every published integration (SDK, MCP server, langchain-proofslip, OpenAPI spec, docs curl examples) got 401 on authenticated calls with default settings. Agents could sign up (no auth header) but never create a receipt. Verified fixed live.
- Fixed scheduled cleanup: Vercel cron invokes with GET but the route was POST-only — the hourly cleanup had 404'd since launch. Route now accepts GET; cron auth fails closed if CRON_SECRET is unset.
- Hardened create-receipt: idempotency insert race no longer 500s, conflict check now includes payload/ref, idempotency_key and ref are validated.
- Smoke tests now target https://proofslip.ai (canonical).

## 2026-04-06

- Built `@proofslip/sdk` v0.1.0 — JS/TS client (4 methods + waitForTerminal polling helper), 42 tests
- Refactored `@proofslip/mcp-server` to use SDK as shared dependency (deleted internal client)

## 2026-04-05

- Created "Proofslip Assistant" GPT for OpenAI GPT Store — product-expert voice, schema-bound instructions, tested against edge cases

- Published `@proofslip/mcp-server` v0.2.3 to npm (added `mcpName`, `server.json`)
- Published to official MCP registry as `ai.proofslip/mcp-server` (DNS auth via ed25519 keypair on proofslip.ai)
- PulseMCP will auto-ingest within ~1 week
- DNS TXT record added to proofslip.ai root for MCP registry auth
- Added /privacy page for GPT Store requirement
- Created GPT Store setup guide at docs/growth/gpt-store-setup.md
- Composio skipped — no self-service listing, request board only
- Built `langchain-proofslip` Python package (3 tools + toolkit, ready for PyPI publish)
- Published `langchain-proofslip` v0.1.0 to PyPI — https://pypi.org/project/langchain-proofslip/0.1.0/

## 2026-04-04

- Created growth strategy docs (thesis, playbook, this log)
- Audited current state: MCP server published (v0.2.2), all discovery endpoints live, smithery.yaml shipped
- Decision: Ecosystem saturation strategy (Approach A) over generic npm wrapper (safe-step rejected)
- Rationale: Agent-driven discovery > developer marketing. Receipts have built-in virality. See `thesis.md`.

## Pre-2026-04-04 (retroactive)

- `@proofslip/mcp-server` published to npm (v0.2.2, 4 versions to date)
- Discovery endpoints deployed: llms.txt, llms-full.txt, openapi.json, mcp.json, ai-plugin.json, agent.json
- Listed on Smithery (MCP registry)
- Listed on Glama.ai (MCP directory)
- Landing page, docs page, verify page all live at proofslip.ai
- ContextCapsule cross-links added to README and discovery files
