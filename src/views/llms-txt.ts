export function renderLlmsTxt(): string {
  return `# ProofSlip

> Ephemeral verification receipts for AI agent workflows.

ProofSlip is a free API that creates short-lived proof tokens (receipts) that agents verify before acting. Receipts expire after 24 hours. No stale state, no replay attacks, no duplicate actions.

## API Base URL

https://proofslip.ai

## Authentication

Create receipts requires a Bearer token API key. Verification is public.
Get a free key: POST /v1/auth/signup with {"email": "you@example.com", "source": "api"}

## Endpoints

### Create Receipt
POST /v1/receipts
Authorization: Bearer ak_...

Request:
{
  "type": "action | approval | handshake | resume | failure",
  "status": "success",
  "summary": "Refund of $42.00 issued to customer #8812",
  "payload": { ... },
  "idempotency_key": "refund-8812-2026-03-23",
  "expires_in": 86400
}

Response (201):
{
  "receipt_id": "rct_...",
  "verify_url": "https://proofslip.ai/verify/rct_...",
  "created_at": "2026-03-23T12:00:00Z",
  "expires_at": "2026-03-24T12:00:00Z"
}

### Verify Receipt
GET /v1/verify/{receipt_id}?format=json

Response (200):
{
  "receipt_id": "rct_...",
  "valid": true,
  "type": "action",
  "status": "success",
  "summary": "Refund of $42.00 issued to customer #8812",
  "payload": { ... },
  "expires_at": "2026-03-24T12:00:00Z",
  "expired": false
}

### Check Status (lightweight poll)
GET /v1/receipts/{receipt_id}/status

Response (200):
{
  "receipt_id": "rct_...",
  "status": "success",
  "is_terminal": true,
  "next_poll_after_seconds": null,
  "expires_at": "2026-03-24T12:00:00Z"
}

## Receipt Types

- action — Record a completed event (refund, deploy, notification)
- approval — Gate an action on a human or agent decision
- handshake — Coordinate between two agents before either acts
- resume — Bookmark a safe continuation point in a pipeline
- failure — Structured error record with bounded retry window

## MCP Server

Install as an MCP tool for Claude, Cursor, or any MCP client:
npx -y @proofslip/mcp-server

## Key Properties

- Receipts expire after 24 hours (configurable 60s–24h)
- Receipt IDs are cryptographically random
- Idempotency keys prevent duplicate creation
- Verification is public — no API key needed to verify
- Every receipt has a human-readable URL and a JSON API
- Free tier: 500 receipts/month
`;
}
