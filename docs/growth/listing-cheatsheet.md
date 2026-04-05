# Listing Cheat Sheet

Copy-paste details for submitting ProofSlip and ContextCapsule to directories and registries.

---

## ProofSlip

**Name:** ProofSlip
**Tagline:** Ephemeral receipts that prove agent actions happened
**One-liner:** Verifiable proof objects for agentic workflows — create, verify, and poll ephemeral receipts so agents can trust what already happened before deciding what to do next.
**Website:** https://proofslip.ai
**GitHub:** https://github.com/Johnny-Z13/proofslip
**npm (MCP server):** https://www.npmjs.com/package/@proofslip/mcp-server
**Install:** `npx -y @proofslip/mcp-server`
**API Docs:** https://proofslip.ai/docs
**OpenAPI:** https://proofslip.ai/.well-known/openapi.json
**MCP Manifest:** https://proofslip.ai/.well-known/mcp.json

**MCP Tools:**
- `create_receipt` — Create an ephemeral receipt (action, approval, handshake, resume, failure)
- `verify_receipt` — Verify a receipt by ID (full data)
- `check_receipt_status` — Lightweight status polling
- `signup` — Get a free API key

**Keywords:** receipts, verification, idempotency, agent workflows, proof, ephemeral, multi-agent, MCP

---

## ContextCapsule

**Name:** ContextCapsule
**Tagline:** Portable execution context for agent workflows
**One-liner:** Package the facts, state, and next-step intent agents need to continue reliably between handoffs.
**Website:** https://www.contextcapsule.ai
**GitHub:** https://github.com/Johnny-Z13/context-capsule
**npm (MCP server):** https://www.npmjs.com/package/@contextcapsule/mcp-server
**Install:** `npx -y @contextcapsule/mcp-server`

**Keywords:** context, capsule, agent handoff, navigation, workflow state, multi-agent, MCP

---

## Ecosystem Pitch (when both can be mentioned)

ProofSlip and ContextCapsule are two primitives for reliable agent workflows. ProofSlip proves what happened (evidential). ContextCapsule navigates what's next (navigational). Together they make multi-agent handoffs verifiable and resumable.

---

## Submission URLs

| Directory | Submit URL | Type |
|-----------|-----------|------|
| PulseMCP | https://www.pulsemcp.com/submit | Web form — paste GitHub repo URL |
| Official MCP Registry | CLI: `mcp-publisher publish` | Domain auth (`ai.proofslip`), needs DNS TXT or `/.well-known/mcp-registry-auth` on proofslip.ai |
| Smithery | https://smithery.ai | Already listed |
| Glama.ai | https://glama.ai | Already listed |
| Composio | https://composio.dev | Tool marketplace — TBD |
| OpenAI GPT Store | https://chat.openai.com/gpts/editor | Manual GPT Action creation |
