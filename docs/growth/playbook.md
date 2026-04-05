# ProofSlip Growth Playbook

Strategy: **Ecosystem Saturation** — be everywhere agents and devs look for tools.

---

## Phase 1: Registry Blitz (Immediate)

Get ProofSlip listed on every tool registry and marketplace.

| Action | Status | Notes |
|--------|--------|-------|
| Publish MCP server to npm | DONE | `@proofslip/mcp-server@0.2.2` |
| smithery.yaml in package | DONE | Included in published package |
| Submit to Smithery (mcp.so) | DONE | Listed on mcp.so |
| ~~Submit to mcp.run~~ | SKIPPED | Rebranded to turbomcp.ai — now enterprise gateway, not a public directory |
| Submit to Composio tool registry | NOT STARTED | Agent tool marketplace |
| Submit to LangChain community tools | NOT STARTED | Needs LangChain tool wrapper |
| Submit to CrewAI tools directory | NOT STARTED | Needs CrewAI tool wrapper |
| Register GPT Action (OpenAI GPT Store) | NOT STARTED | ai-plugin.json + OpenAPI already live |
| List on Glama.ai MCP directory | DONE | MCP listing site |
| List on PulseMCP directory | PENDING | Auto-ingests from official registry weekly — no action needed |
| Submit to official MCP registry | DONE | `ai.proofslip/mcp-server` v0.2.3. PulseMCP auto-ingests weekly. |

## Phase 2: Framework Integrations (Next)

Build thin wrappers so ProofSlip appears native in popular agent frameworks.

| Action | Status | Notes |
|--------|--------|-------|
| `@proofslip/sdk` — JS/TS client library | NOT STARTED | Thin fetch wrapper, typed responses, 3-line integration |
| LangChain tool wrapper | NOT STARTED | Uses SDK, registers as LangChain Tool |
| CrewAI tool wrapper | NOT STARTED | Python wrapper using REST API |
| AutoGen tool definition | NOT STARTED | Uses OpenAPI spec |
| n8n community node | NOT STARTED | Lower priority — niche audience |

## Phase 3: Content (One Piece, Make It Count)

One reference tutorial that shows a real agentic workflow using ProofSlip + ContextCapsule.

| Action | Status | Notes |
|--------|--------|-------|
| Pick canonical workflow example | NOT STARTED | e.g., multi-agent refund processing |
| Build open-source reference repo | NOT STARTED | LangChain or CrewAI based |
| Write tutorial / walkthrough | NOT STARTED | Publish on dev.to or framework community docs |
| Add "Integrations" section to proofslip.ai | NOT STARTED | Show framework logos + install snippets |

## Phase 4: Ecosystem Compounding (Ongoing)

| Action | Status | Notes |
|--------|--------|-------|
| Monitor receipt creation from unknown sources | NOT STARTED | Signal that organic discovery is working |
| Cross-link ContextCapsule in all listings | ONGOING | Both products reinforce each other |
| Keep discovery endpoints current | ONGOING | llms.txt, openapi.json, mcp.json, agent.json |
| Respond to framework version changes | ONGOING | Update wrappers when LangChain/CrewAI release new versions |

---

## Discovery Infrastructure (Already Built)

These endpoints are live at `proofslip.ai`:

- `/llms.txt` — LLM context summary
- `/llms-full.txt` — Complete API reference for LLMs
- `/.well-known/openapi.json` — OpenAPI 3.1 spec
- `/.well-known/mcp.json` — MCP server manifest
- `/.well-known/ai-plugin.json` — ChatGPT plugin manifest
- `/.well-known/agent.json` — Agent protocol discovery
- `/docs` — Human-readable API docs
- `/sitemap.xml` — SEO crawl map

---

## ContextCapsule — Mirror Progress

CC follows the same playbook. ProofSlip leads, CC inherits. Managed from this project via `additionalDirectories`.

### Phase 1: Registry Blitz

| Action | Status | Notes |
|--------|--------|-------|
| Publish MCP server to npm | DONE | `@contextcapsule/mcp-server` |
| Submit to Smithery (mcp.so) | NOT CHECKED | Verify if already listed |
| List on Glama.ai | NOT CHECKED | Verify if already listed |
| Submit to official MCP registry | NOT STARTED | Needs `mcpName`, `server.json`, DNS TXT on contextcapsule.ai |
| List on PulseMCP | NOT STARTED | Auto-ingests from official registry |
| Register GPT Action | NOT STARTED | Needs ai-plugin.json + OpenAPI on contextcapsule.ai |
| Submit to Composio | NOT STARTED | Follow ProofSlip pattern |

---

## Prioritization Principle

**Registry listings first** (Phase 1) because they're high leverage and low effort — you submit once and they compound forever. Framework integrations (Phase 2) require code but unlock the biggest audiences. Content (Phase 3) is last because one great piece beats ten mediocre ones.
