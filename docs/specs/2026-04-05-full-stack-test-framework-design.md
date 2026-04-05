# Full Stack Test Framework Design

**Date:** 2026-04-05
**Status:** Approved
**Scope:** ProofSlip only (extend to ContextCapsule later using same pattern)

## Summary

A single command (`npm run test:all`) that tests every layer of ProofSlip — unit tests, API lifecycle against production, discovery endpoints, link checking, and published package logic — and prints a pass/fail report.

## Motivation

ProofSlip has grown to include a core API, MCP server package, LangChain package, discovery endpoints, and a landing page. The existing test suite covers the core API well (~150 tests) but the published packages have zero tests, and there's no way to verify production endpoints work after a deploy.

## Design Decisions

- **Real HTTP calls against production** for smoke tests. Receipts auto-expire in 24h, no cleanup needed.
- **Vitest for all TypeScript tests** (existing + new). No new test runner.
- **pytest for Python (LangChain) tests**. Separate toolchain, orchestrated by wrapper script.
- **Mocked HTTP for package tests**. Test tool logic, not the API (that's what smoke tests are for).
- **ProofSlip only for now**. CC inherits the pattern later.

## Test Layers

### Layer 1: Unit & Integration Tests (existing)

Location: `tests/lib/`, `tests/routes/`

No changes. These continue to test validators, utilities, middleware, and route handlers using Hono's in-memory request simulation against a real Neon database.

### Layer 2: Smoke Tests (new)

Location: `tests/smoke/`

Real HTTP calls against `https://proofslip.ai`. API key from `PROOFSLIP_API_KEY` env var.

**`api-lifecycle.test.ts`** — ordered lifecycle flow:

1. `GET /health` — returns 200
2. `POST /v1/receipts` — create receipt (type: action, status: completed, summary: "Test receipt from automated suite"). Returns `receipt_id` and `verify_url`.
3. `GET /v1/verify/:id?format=json` — verify receipt returns full data, matches what was created.
4. `GET /v1/receipts/:id/status` — returns status, is_terminal, next_poll_after_seconds.
5. `POST /v1/receipts` with same `idempotency_key` — returns same receipt_id (no duplicate).
6. `GET /v1/verify/:id` with `Accept: text/html` — returns HTML containing receipt data.

**`discovery.test.ts`** — independent checks, can run in parallel:

| Endpoint | Assert |
|----------|--------|
| `GET /llms.txt` | 200, body contains "ProofSlip" |
| `GET /llms-full.txt` | 200, body contains "POST /v1/receipts" |
| `GET /.well-known/openapi.json` | 200, valid JSON, has `openapi` key |
| `GET /.well-known/mcp.json` | 200, valid JSON, has `tools` key |
| `GET /.well-known/ai-plugin.json` | 200, valid JSON, has `name_for_model` key |
| `GET /.well-known/agent.json` | 200, valid JSON |
| `GET /docs` | 200, body contains "API" |
| `GET /privacy` | 200, body contains "Privacy" |
| `GET /example` | 200, body contains "receipt" |

**`links.test.ts`** — link checker:

1. Fetch landing page HTML from `https://proofslip.ai`
2. Extract all `href` attribute values
3. Filter to HTTP(S) URLs (skip anchors, mailto, etc.)
4. HEAD request each URL
5. Assert all return 2xx or 3xx
6. Same for links extracted from `/llms.txt`

### Layer 3: Package Tests — MCP Server (new)

Location: `tests/packages/mcp-server/`

Run in Vitest. Mock the HTTP client (`ProofSlipClient`) to test tool logic in isolation.

**`client.test.ts`**:
- Constructs correct Authorization header from API key
- Builds correct URLs for each endpoint
- Handles 2xx responses (parses JSON)
- Handles 4xx/5xx responses (throws with status + message)
- Respects custom base_url

**`create-receipt.test.ts`**:
- Validates input via Zod schema (rejects invalid type, missing required fields)
- Builds correct POST body from tool input
- Returns formatted receipt data on success

**`verify-receipt.test.ts`**:
- Builds correct GET URL with receipt_id
- Passes format=json query parameter
- Returns full receipt data

**`check-status.test.ts`**:
- Builds correct URL
- Returns minimal status fields (id, status, is_terminal, next_poll_after_seconds, expires_at)

**`signup.test.ts`**:
- Sends email in POST body
- Returns API key on success

### Layer 4: Package Tests — LangChain (new)

Location: `packages/langchain/tests/`

Run in pytest. Mock `requests` library via `unittest.mock.patch`.

**`test_client.py`**:
- Constructs correct Authorization header
- Builds correct URLs
- Handles success and error responses
- Respects custom base_url

**`test_tools.py`**:
- Each tool (`ProofSlipCreateReceipt`, `ProofSlipVerifyReceipt`, `ProofSlipCheckStatus`) calls the correct client method
- Tool descriptions are non-empty strings
- Input schemas have correct fields
- API key from env var when not passed directly
- Raises ValueError when no API key available

**`test_toolkit.py`**:
- `ProofSlipToolkit.get_tools()` returns exactly 3 tools
- All tools are configured with the same credentials
- Tools have unique names

## Orchestrator Script

Location: `scripts/test-all.ts`

Run via: `npm run test:all` → `tsx scripts/test-all.ts`

Steps (sequential):
1. Run `vitest run` (all TS tests: existing + smoke + packages)
2. Run `pytest packages/langchain/tests/` (Python tests)
3. Print combined summary report

Exit code: 0 if all pass, 1 if any fail.

Report format:
```
═══════════════════════════════════════
  ProofSlip Full Stack Test Report
═══════════════════════════════════════

[1/4] Unit & Integration Tests
  ✓ N suites passed

[2/4] Smoke Tests (proofslip.ai)
  ✓ API lifecycle (6 checks)
  ✓ Discovery (9 endpoints)
  ✓ Links (N checked, 0 broken)

[3/4] MCP Server Package
  ✓ N suites passed

[4/4] LangChain Package
  ✓ N suites passed

═══════════════════════════════════════
  ALL PASSED ✓
═══════════════════════════════════════
```

## Vitest Configuration Changes

Smoke tests need longer timeouts (network calls). Add to `vitest.config.ts`:

```typescript
testTimeout: process.env.SMOKE ? 30000 : 5000
```

Or configure per-file via `describe` timeout options.

## npm Scripts

```json
"test": "vitest",
"test:smoke": "vitest run tests/smoke/",
"test:packages": "vitest run tests/packages/",
"test:all": "tsx scripts/test-all.ts"
```

## File Structure

```
scripts/
└── test-all.ts

tests/
├── lib/                          # (existing) Unit tests
├── routes/                       # (existing) Integration tests
├── smoke/
│   ├── api-lifecycle.test.ts
│   ├── discovery.test.ts
│   └── links.test.ts
├── packages/
│   └── mcp-server/
│       ├── client.test.ts
│       ├── create-receipt.test.ts
│       ├── verify-receipt.test.ts
│       ├── check-status.test.ts
│       └── signup.test.ts
├── helpers.ts                    # (existing)
└── setup.ts                     # (existing)

packages/langchain/
└── tests/
    ├── test_client.py
    ├── test_tools.py
    └── test_toolkit.py
```

## Future Extension

- **ContextCapsule:** Duplicate the smoke test pattern for contextcapsule.ai. Same layers, different endpoints.
- **Cron:** Wrap `npm run test:smoke` in a daily cron job for production monitoring.
- **GitHub Actions:** Move `npm run test:all` into a CI workflow triggered on push.
