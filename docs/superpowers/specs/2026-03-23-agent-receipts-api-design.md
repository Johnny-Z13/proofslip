# ProofSlip API - Design Spec

Ephemeral verification receipts for agent workflows. Create. Verify. Expires in 24 hours.

## Product shape

Solo-dev API business. Two core endpoints. One landing page. Pay-per-request pricing. Viral growth through verify URLs.

Inspired by the Screenshot API model: simple, useful, cheap to run, organic developer adoption.

## The problem

Agents increasingly interact with other agents, services, and humans across boundaries. When Agent A tells Agent B "I did the thing," there's no lightweight way for Agent B to verify that independently. Teams currently solve this with raw logs, database flags, or trust-on-faith. This creates duplicate actions, unsafe retries, and ambiguous workflow state.

## The solution

A hosted API that lets any agent or service create a short-lived, verifiable receipt. The receipt has a public verify URL that anyone can check - no auth required on the verify side. Receipts expire after 24 hours by default, keeping storage costs near zero.

## Why this works as a business

- **Viral by design**: Every verify URL exposes the product to the other side of the transaction. Agents become the sales team.
- **Cheap to run**: Ephemeral data. Postgres + TTL cron. No blob storage. No long-term retention at free tier.
- **Screenshot API economics**: Pay per receipt created. Free tier for adoption. Volume tiers for revenue.
- **Expansion path**: Saved receipts, webhooks, signed receipts, approval workflows (HumanGate), agent profiles (Workforce) - all possible later if traction warrants.

## Core endpoints

### 1. Create receipt

```
POST /v1/receipts
Authorization: Bearer {api_key}
```

**Request:**

```json
{
  "type": "action",
  "status": "success",
  "summary": "Refund of $42.00 issued to customer #8812",
  "payload": {
    "action": "refund",
    "amount": 42.00,
    "currency": "USD",
    "customer_id": "8812",
    "retry_safe": false,
    "duplicate_risk": "high"
  },
  "ref": {
    "run_id": "run_abc123",
    "agent_id": "refund-bot-v2",
    "action_id": "act_xyz789"
  },
  "expires_in": 86400,
  "idempotency_key": "refund-8812-20260323"
}
```

**Response:**

```json
{
  "receipt_id": "rct_7f3k9x2m",
  "type": "action",
  "status": "success",
  "summary": "Refund of $42.00 issued to customer #8812",
  "verify_url": "https://proofslip.ai/verify/rct_7f3k9x2m",
  "created_at": "2026-03-23T14:30:00Z",
  "expires_at": "2026-03-24T14:30:00Z",
  "idempotency_key": "refund-8812-20260323"
}
```

**Fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | One of: `action`, `approval`, `handshake`, `resume`, `failure` |
| `status` | Yes | Freeform string. Common: `success`, `failed`, `partial`, `pending`, `approved`, `rejected` |
| `summary` | Yes | Human-readable one-liner. Max 280 chars. |
| `payload` | No | Structured JSON. Max 4KB. Machine-readable detail. |
| `ref` | No | Reference IDs for linking. All fields optional: `run_id`, `agent_id`, `action_id`, `workflow_id`, `session_id` |
| `expires_in` | No | Seconds until expiry. Default 86400 (24h). Max 86400 on free tier. |
| `idempotency_key` | No | If provided, duplicate POSTs with same key return the original receipt. |

### 2. Verify receipt

```
GET /v1/verify/{receipt_id}
(No auth required)
```

**Response:**

```json
{
  "receipt_id": "rct_7f3k9x2m",
  "valid": true,
  "type": "action",
  "status": "success",
  "summary": "Refund of $42.00 issued to customer #8812",
  "payload": {
    "action": "refund",
    "amount": 42.00,
    "currency": "USD",
    "customer_id": "8812",
    "retry_safe": false,
    "duplicate_risk": "high"
  },
  "ref": {
    "run_id": "run_abc123",
    "agent_id": "refund-bot-v2",
    "action_id": "act_xyz789"
  },
  "created_at": "2026-03-23T14:30:00Z",
  "expires_at": "2026-03-24T14:30:00Z",
  "expired": false
}
```

**Not found or expired response (HTTP 404):**

```json
{
  "error": "receipt_not_found",
  "message": "Receipt does not exist, has expired, or has been deleted."
}
```

Expired receipts are hard-deleted by the TTL cron. There is no distinction between "expired" and "never existed" from the caller's perspective. This is intentional — it keeps the data model simple and avoids retaining data past TTL.

## API key provisioning

### Signup flow

1. Developer enters email on landing page
2. Server generates API key (`ak_` + 32-char random hex), stores SHA-256 hash + first 8 chars as prefix
3. Key is emailed to the developer and shown once on screen
4. Key is never stored in plaintext and cannot be retrieved later

### Key management page

Minimal authenticated page at `/settings` (magic link login via email):

- View masked key (`ak_7f3k9x2m...`)
- See current tier and usage count
- Rotate key (generates new key, invalidates old one)
- Delete account

No OAuth. No password. Magic link keeps it simple.

### Endpoints

```
POST /v1/auth/signup        -- email -> sends API key
POST /v1/auth/magic-link    -- email -> sends login link for settings page
POST /v1/auth/rotate-key    -- requires magic-link session -> invalidates old key, returns new one
```

## Error format

All errors use a consistent envelope:

```json
{
  "error": "error_code",
  "message": "Human-readable description."
}
```

| Status | Error code | When |
|--------|-----------|------|
| 400 | `validation_error` | Missing required fields, payload too large, invalid type |
| 401 | `unauthorized` | Missing or invalid API key |
| 404 | `receipt_not_found` | Receipt doesn't exist or has expired |
| 409 | `idempotency_conflict` | Same idempotency key but different request body |
| 429 | `rate_limited` | Too many requests |

## Rate limits

| Endpoint | Limit | Scope |
|----------|-------|-------|
| `POST /v1/receipts` | 60/min | Per API key |
| `GET /v1/verify/{id}` | 120/min | Per IP |
| `POST /v1/auth/*` | 5/min | Per IP |

Rate limit headers on every response:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset` (Unix timestamp)

## Usage tracking and billing

- `usage_count` on `api_keys` increments on each successful `POST /v1/receipts`
- `usage_reset_at` aligns with monthly billing cycle (set on signup, resets every 30 days)
- When usage exceeds tier limit: requests still succeed but are billed at overage rate
- Stripe metered billing tracks overage. Tier subscription is flat monthly.
- No hard cutoff — receipts never fail due to billing. This avoids breaking agent workflows mid-run.

## Verify page (the growth engine)

When a human visits `https://proofslip.ai/verify/rct_7f3k9x2m` in a browser, they see a clean HTML page:

```
+------------------------------------------+
|  ProofSlip                          |
+------------------------------------------+
|                                          |
|  VERIFIED                                |
|  Receipt rct_7f3k9x2m                    |
|                                          |
|  Type: action                            |
|  Status: success                         |
|  Summary: Refund of $42.00 issued to     |
|           customer #8812                 |
|                                          |
|  Created: 23 Mar 2026, 14:30 UTC         |
|  Expires: 24 Mar 2026, 14:30 UTC         |
|                                          |
|  [View payload] (expandable)             |
|                                          |
+------------------------------------------+
|  Create receipts for your agent          |
|  workflows -> proofslip.ai          |
+------------------------------------------+
```

- The verify URL (`/verify/{id}`) and the API path (`/v1/verify/{id}`) both route to the same handler.
- Content negotiation: returns HTML by default (browsers). Returns JSON when `Accept: application/json` header is present or `?format=json` query param is set.
- The `/verify/{id}` path (without `/v1/`) is the canonical public URL used in `verify_url` responses — cleaner for sharing.
- The footer is the viral CTA. Every verify page is a landing page.
- Clean, fast, no JavaScript required for basic view.

## Receipt types

Keep these minimal at MVP. The `type` field is a string enum:

| Type | When to use |
|------|-------------|
| `action` | Confirms an action happened (email sent, record updated, refund issued) |
| `approval` | Tracks approval state (pending -> approved/rejected) |
| `handshake` | Confirms a connection/auth between systems (scopes granted, session established) |
| `resume` | Marks where a paused workflow can resume |
| `failure` | Records a failure with retry/escalation guidance |

Developers can use any type. The API doesn't enforce different schemas per type - the `payload` is freeform JSON.

## Idempotency

If `idempotency_key` is provided on POST:
- First request: creates the receipt, stores the key
- Subsequent requests with same key + same API key: returns the original receipt (HTTP 200, not 201)
- Keys are scoped to the API key owner
- Keys expire when the receipt expires

This is critical for the core value prop: agents can safely retry receipt creation without duplicates.

## Data model

Single table, simple schema:

```sql
CREATE TABLE receipts (
  id            TEXT PRIMARY KEY,       -- rct_ prefix + 21-char nanoid (e.g. rct_V1StGXR8_Z5jdHi6B-myT)
  api_key_id    TEXT NOT NULL,          -- FK to api_keys
  type          TEXT NOT NULL,
  status        TEXT NOT NULL,
  summary       TEXT NOT NULL,
  payload       JSONB,
  ref           JSONB,
  idempotency_key TEXT,                 -- NULLable; Postgres UNIQUE allows multiple NULLs
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  UNIQUE(api_key_id, idempotency_key)
);

CREATE INDEX idx_receipts_expires_at ON receipts(expires_at);
CREATE INDEX idx_receipts_api_key_id ON receipts(api_key_id);
```

```sql
CREATE TABLE api_keys (
  id            TEXT PRIMARY KEY,
  key_prefix    TEXT NOT NULL,           -- first 8 chars of key (for fast lookup)
  key_hash      TEXT NOT NULL UNIQUE,   -- SHA-256 hash (API keys are high-entropy, no need for bcrypt)
  owner_email   TEXT NOT NULL,
  tier          TEXT NOT NULL DEFAULT 'free',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usage_count   INTEGER DEFAULT 0,
  usage_reset_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
```

**TTL cleanup:** Cron job or pg_cron runs every hour:

```sql
DELETE FROM receipts WHERE expires_at < NOW();
```

That's it. No event sourcing. No audit tables. No blob storage.

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Runtime | Node.js + TypeScript | Fast to build, cheap hosting |
| Framework | Hono or Fastify | Lightweight, fast, good DX |
| Database | Postgres (Neon or Supabase) | Free tier available, JSONB support, simple |
| Hosting | Railway or Fly.io | Cheap, easy deploy, scales down to $0 |
| Landing page | Same app, server-rendered HTML | One deploy, no separate site |
| Verify page | Same app, content-negotiated (HTML/JSON) | The growth engine lives in the API |
| Auth | API key in header | Simple. No OAuth complexity. |
| Payments | Stripe | Per-receipt metered billing or tier-based |

## Pricing

| Tier | Price | Receipts/month | Extras |
|------|-------|----------------|--------|
| Free | $0 | 500 | 24h expiry only |
| Starter | $9/mo | 2,000 | 24h expiry |
| Pro | $29/mo | 10,000 | Up to 7-day expiry |
| Business | $79/mo | 50,000 | Up to 30-day expiry, webhooks (future), priority support |
| Overage | $0.006/receipt | Beyond tier limit | Priced above per-receipt cost of next tier to create upgrade pressure |

Free tier exists for adoption. Revenue comes from volume.

## Landing page

One page. Five sections:

1. **Hero**: "Verifiable receipts for agent workflows" + code snippet showing POST + verify
2. **How it works**: Create -> Share verify URL -> Anyone can verify -> Expires automatically
3. **Use cases**: 4 cards (retry safety, approval verification, handshake confirmation, cross-agent proof)
4. **Pricing**: The table above
5. **Get started**: Email signup -> instant API key

No dashboard at MVP. API key management via email-based self-service (or a tiny settings page).

## What's NOT in MVP

- Dashboard for viewing your receipts
- Webhooks
- Saved/starred receipts
- Signed/tamper-evident receipts
- Team accounts
- Receipt search/query endpoint
- Any HumanGate or Workforce features
- Analytics

All of these are expansion. MVP is: create, verify, expire, pay.

## Security considerations

- API key auth flow: extract first 8 chars as prefix -> lookup candidates by `key_prefix` index -> SHA-256 hash the full key -> compare against `key_hash`. Fast O(1) lookup, no slow hashing.
- API keys are hashed at rest (never stored in plaintext)
- Rate limiting on both POST (per API key) and GET/verify (per IP) to prevent abuse
- Receipt IDs are nanoids (not sequential) - unguessable
- Payload size capped at 4KB to prevent storage abuse
- No PII requirements or guarantees at MVP - receipts are operational artifacts, not identity documents
- HTTPS only

## Success metrics

**Week 1-4 (launch):**
- API keys created
- Receipts created
- Verify hits (especially from unique IPs different from creator)

**Month 2-3 (traction):**
- Verify-to-signup conversion rate (how many verify page visitors become creators)
- Repeat usage (developers creating receipts regularly, not just testing)
- Free-to-paid conversion

**Month 4+ (growth):**
- Organic verify URL traffic
- SEO traffic to landing page
- Revenue / MRR

## Expansion roadmap (only if traction)

**Phase 2 - Stickiness:**
- Receipt query endpoint (find latest receipt by ref IDs)
- Webhook notifications (receipt created/updated/expiring)
- Save/star receipts (paid tier - override TTL)
- Tiny dashboard for receipt history

**Phase 3 - Trust layer:**
- Signed receipts (HMAC or JWT-based tamper evidence)
- Receipt chains (link receipts to parent receipts)
- Batch create endpoint

**Phase 4 - Platform (only if product-market fit is proven):**
- HumanGate-style approval workflows
- Agent Workforce-style profiles and trust scoring
- Team accounts and RBAC
- Enterprise tier

## Build estimate

Solo dev, focused execution:
- API (2 endpoints + auth + rate limiting): buildable
- Database + TTL cleanup: buildable
- Landing page: buildable
- Verify page (HTML + JSON): buildable
- Stripe integration: buildable
- Deploy to Railway/Fly: buildable

## Key risks

1. **"Just use a database"** - Mitigated by the cross-boundary verify URL. You can't give someone a link to your internal DB.
2. **Low initial volume** - Mitigated by free tier and build-in-public marketing.
3. **Abuse (spam receipts)** - Mitigated by rate limiting and payload size caps.
4. **No one knows they need this yet** - Mitigated by verify URL virality and SEO content about agent workflow problems.

## References

- [Screenshot API ($269K ARR solo founder)](https://superframeworks.com/blog/screenshot-one) - business model inspiration
- [OpenAI Agentic Commerce Protocol](https://developers.openai.com/commerce) - validates receipt pattern for agent transactions
- [Mem0 ($24M Series A)](https://mem0.ai/) - agent memory layer, different problem (persistent vs ephemeral)
- [State management is #1 challenge for agentic AI](https://intellyx.com/2025/02/24/why-state-management-is-the-1-challenge-for-agentic-ai/)
- [The lucrative world of boring API businesses](https://boringcashcow.com/showcase/the-lucrative-world-of-boring-screenshot-api-businesses)
