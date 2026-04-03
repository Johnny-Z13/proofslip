# ProofSlip

Portable proof objects for agent workflows.

## Live

- **Production:** https://proofslip.ai
- **Domain:** proofslip.ai
- **Sister product:** [ContextCapsule](https://contextcapsule.ai) — same ecosystem, shared design language
- **ContextCapsule repo:** D:\Projects\context-capsule (keep READMEs and CLAUDE.md cross-referenced)

## Product Position

ProofSlip and ContextCapsule are two primitives for reliable agent workflows:

- **ProofSlip** (evidential) — "Here's what actually happened, and you can verify it."
- **ContextCapsule** (navigational) — "Here's the situation, what matters, and what should happen next."

ProofSlip creates verifiable receipts that prove actions happened. Agents check receipts before deciding what to do next. Receipts are ephemeral (24h default), typed, and include polling guidance for non-terminal states.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Hono v4
- **ORM:** Drizzle ORM with Neon PostgreSQL
- **Language:** TypeScript (strict mode)
- **Deployment:** Vercel serverless
- **Testing:** Vitest
- **MCP:** @modelcontextprotocol/sdk for MCP server package

## Development

```bash
npm run dev          # Local dev server
npm test             # Run tests
npm run db:generate  # Generate migrations
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed API key
```

## Architecture Principles

- Ephemeral by default (receipts expire, 24h default)
- Idempotency built into the protocol
- Content negotiation (JSON for agents, HTML for humans)
- Polling guidance (is_terminal, next_poll_after_seconds)
- Discovery endpoints (/llms.txt, OpenAPI, MCP manifest)
- Middleware composition: security → auth → rate limit → business logic

## ContextCapsule Alignment

These projects share brand, stack, and patterns. Keep them consistent:

- **Brand:** Dark theme (#0a0a0a bg), green accent (#16a34a), Departure Mono font
- **Stack:** Hono v4, Drizzle ORM, Neon PostgreSQL, Vercel serverless, Vitest
- **Middleware order:** CORS → security headers → request ID → body limit → logger
- **Auth:** Bearer token `ak_` prefix, SHA-256 hash, prefix-based lookup
- **Rate limiting:** In-memory sliding window, per-key and per-IP
- **Views:** Template literal HTML (no JSX), inline styles, no client-side JS
- **Discovery:** llms.txt, llms-full.txt, openapi.json, mcp.json, agent.json
- **IDs:** Prefixed nanoid (`rct_`, `ak_`, `key_`)
- **Errors:** `{ error: "code", message: "description", request_id: "req_..." }`
- **Tests:** Vitest, unit tests in tests/lib/, route tests in tests/routes/

## Chaining with ContextCapsule

Capsules reference receipts via `refs.receipt_ids`. The core loop:

1. Agent completes work → creates ProofSlip receipt (proof it happened)
2. Agent creates ContextCapsule referencing that receipt (navigation for next agent)
3. Next agent fetches capsule, verifies receipt via ProofSlip, continues

Key patterns:
- **Prove-Then-Continue** — receipt proves step N, capsule navigates step N+1
- **Receipt as Gate** — capsule guardrails reference receipts as preconditions
- **Error Recovery** — failure receipts + capsule with retry intent

See `D:\Projects\context-capsule\docs\plans\chaining-patterns.md` for full pattern catalog (6 patterns + anti-patterns).

When modifying ProofSlip APIs or response shapes, check that chaining patterns still work — capsules depend on `receipt_id` and `status` fields from verify responses.

## Project Status

Live in production. Core API (create, verify, poll, auth, cleanup) implemented. Zero users currently — pre-adoption phase.

**Future plans (not yet started):**
- Umbrella brand site connecting ProofSlip + ContextCapsule (only after both have users)
