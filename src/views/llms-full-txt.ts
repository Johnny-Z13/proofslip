export function renderLlmsFullTxt(): string {
  return `# ProofSlip — Complete API Reference

> Ephemeral verification receipts for AI agent workflows.

ProofSlip is a free API that creates short-lived proof tokens (receipts) that agents verify before acting. Receipts expire after 24 hours. No stale state, no replay attacks, no duplicate actions.

## API Base URL

https://proofslip.ai

## Authentication

Most endpoints require a Bearer token.
Header: Authorization: Bearer ak_...

Get a free key:
POST /v1/auth/signup
Body: {"email": "you@example.com", "source": "api"}

The API key is returned once in the response. Save it immediately — it cannot be retrieved later.

Verification endpoints (GET /v1/verify/*) are public and require NO authentication.

## Rate Limits

- 60 requests per minute per API key
- 500 receipts per month on the free tier
- Exceeding limits returns HTTP 429 with a Retry-After header

---

## Endpoints

### POST /v1/receipts — Create a Receipt

Creates a verifiable receipt when something happens in your agent workflow.

**Auth:** Required (Bearer token)

**Request body:**
| Field            | Type     | Required | Description                                      |
|------------------|----------|----------|--------------------------------------------------|
| type             | string   | yes      | One of: action, approval, handshake, resume, failure |
| status           | string   | yes      | Freeform status string (e.g. "success", "pending") |
| summary          | string   | yes      | Human-readable summary, max 280 chars            |
| payload          | object   | no       | Structured JSON data, max 4KB                    |
| ref              | object   | no       | Workflow reference IDs (see below)               |
| expires_in       | integer  | no       | TTL in seconds, 60–86400. Default: 86400 (24h)  |
| idempotency_key  | string   | no       | Prevents duplicate creation on retry             |
| audience         | string   | no       | Set to "human" for enriched social cards on verify page |

**ref object fields (all optional):**
- run_id, agent_id, action_id, workflow_id, session_id

**Example request:**
\`\`\`
POST /v1/receipts
Authorization: Bearer ak_live_abc123
Content-Type: application/json

{
  "type": "action",
  "status": "success",
  "summary": "Refund of $42.00 issued to customer #8812",
  "payload": {
    "amount": 42.00,
    "currency": "USD",
    "customer_id": "8812"
  },
  "ref": {
    "run_id": "run_abc",
    "agent_id": "billing-agent"
  },
  "idempotency_key": "refund-8812-2026-03-23",
  "expires_in": 3600
}
\`\`\`

**Example response (201):**
\`\`\`json
{
  "receipt_id": "rct_k7x9m2p4",
  "type": "action",
  "status": "success",
  "summary": "Refund of $42.00 issued to customer #8812",
  "verify_url": "https://proofslip.ai/verify/rct_k7x9m2p4",
  "created_at": "2026-03-23T12:00:00Z",
  "expires_at": "2026-03-23T13:00:00Z",
  "idempotency_key": "refund-8812-2026-03-23",
  "is_terminal": true,
  "next_poll_after_seconds": null
}
\`\`\`

**Error responses:**
- 400 — Validation error (missing required field, summary too long, invalid type)
- 401 — Missing or invalid API key
- 409 — Idempotency conflict (same key, different body)
- 429 — Rate limited

---

### GET /v1/verify/{receipt_id} — Verify a Receipt

Returns full receipt data. No authentication required.

**Query params:**
| Param  | Required | Description                    |
|--------|----------|--------------------------------|
| format | no       | Set to "json" to force JSON    |

**Example request:**
\`\`\`
GET /v1/verify/rct_k7x9m2p4?format=json
\`\`\`

**Example response (200):**
\`\`\`json
{
  "receipt_id": "rct_k7x9m2p4",
  "valid": true,
  "type": "action",
  "status": "success",
  "summary": "Refund of $42.00 issued to customer #8812",
  "payload": {
    "amount": 42.00,
    "currency": "USD",
    "customer_id": "8812"
  },
  "ref": {
    "run_id": "run_abc",
    "agent_id": "billing-agent"
  },
  "created_at": "2026-03-23T12:00:00Z",
  "expires_at": "2026-03-23T13:00:00Z",
  "expired": false,
  "is_terminal": true,
  "next_poll_after_seconds": null
}
\`\`\`

**Error responses:**
- 404 — Receipt not found, expired, or deleted

Without ?format=json, the endpoint returns an HTML verification page suitable for sharing.

---

### GET /v1/receipts/{receipt_id}/status — Poll Receipt Status

Lightweight status check. Returns only status fields — no summary, payload, or ref. Ideal for polling loops.

**Example request:**
\`\`\`
GET /v1/receipts/rct_k7x9m2p4/status
\`\`\`

**Example response (200):**
\`\`\`json
{
  "receipt_id": "rct_k7x9m2p4",
  "status": "success",
  "is_terminal": true,
  "next_poll_after_seconds": null,
  "expires_at": "2026-03-23T13:00:00Z"
}
\`\`\`

**Polling guidance:**
- If is_terminal is true, stop polling — the status won't change.
- If is_terminal is false, poll again after next_poll_after_seconds.
- Receipts expire; once expired, this returns 404.

---

### POST /v1/auth/signup — Get a Free API Key

**No auth required.**

**Request body:**
| Field  | Type   | Required | Description                              |
|--------|--------|----------|------------------------------------------|
| email  | string | yes      | Your email address                       |
| source | string | no       | "api" returns key directly, "web" emails it. Default: "api" |

**Example request:**
\`\`\`
POST /v1/auth/signup
Content-Type: application/json

{"email": "dev@example.com", "source": "api"}
\`\`\`

**Example response (201):**
\`\`\`json
{
  "api_key": "ak_live_abc123def456",
  "tier": "free",
  "message": "Save this key — it cannot be retrieved later."
}
\`\`\`

**Error responses:**
- 400 — Invalid email
- 409 — Email already has an API key

---

## Receipt Types

| Type       | Use Case                                                  |
|------------|-----------------------------------------------------------|
| action     | Record a completed event (refund issued, deploy finished) |
| approval   | Gate an action on a human or agent decision               |
| handshake  | Coordinate between two agents before either acts          |
| resume     | Bookmark a safe continuation point in a pipeline          |
| failure    | Structured error record with bounded retry window         |

---

## Common Patterns

### Idempotent Operations
Use idempotency_key to ensure an action isn't recorded twice:
\`\`\`
POST /v1/receipts
{"type": "action", "status": "success", "summary": "Deploy v2.1.0", "idempotency_key": "deploy-v2.1.0"}
\`\`\`
If the same key is sent again with the same body, you get the original receipt back. Different body = 409 conflict.

### Agent-to-Agent Handshake
Agent A creates a handshake receipt. Agent B verifies it before proceeding:
\`\`\`
# Agent A creates
POST /v1/receipts
{"type": "handshake", "status": "ready", "summary": "Data pipeline output ready for analysis"}

# Agent B verifies before acting
GET /v1/verify/rct_...?format=json
# Only proceed if valid: true and expired: false
\`\`\`

### Human Approval Gate
Create an approval receipt and share the verify URL with a human:
\`\`\`
POST /v1/receipts
{"type": "approval", "status": "pending", "summary": "Approve $5,000 vendor payment", "audience": "human"}
\`\`\`
The verify URL renders a human-readable page with social card metadata when audience is "human".

### Short-Lived Tokens
Set expires_in to create receipts that expire quickly:
\`\`\`
POST /v1/receipts
{"type": "action", "status": "success", "summary": "OTP generated", "expires_in": 300}
\`\`\`
This receipt expires in 5 minutes.

---

## MCP Server

Install as an MCP tool for Claude, Cursor, or any MCP-compatible client:

\`\`\`
npx -y @proofslip/mcp-server
\`\`\`

Available MCP tools:
- create_receipt — Create a new receipt
- verify_receipt — Verify a receipt by ID
- check_status — Lightweight status poll

---

## Error Format

All errors return JSON:
\`\`\`json
{
  "error": "error_code",
  "message": "Human-readable description",
  "request_id": "req_..."
}
\`\`\`

Error codes: validation_error, unauthorized, not_found, idempotency_conflict, rate_limited, internal_error

---

## Key Properties

- Receipts expire after 24 hours by default (configurable 60s–24h)
- Receipt IDs are cryptographically random (rct_ prefix)
- Idempotency keys prevent duplicate creation
- Verification is public — no API key needed
- Every receipt has a human-readable verify URL and a JSON API
- Free tier: 500 receipts/month, 60 req/min
`;
}
