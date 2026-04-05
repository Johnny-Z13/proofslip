# ProofSlip Growth Log

Running record of what's been shipped, listed, and submitted.

---

## 2026-04-05

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
