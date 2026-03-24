# ProofSlip: Integration Tests + Landing Page Design

**Date:** 2026-03-23
**Status:** Approved

---

## 1. Integration Tests — Pretend Agent Scenarios

### Strategy

**Approach A: In-process Hono test client** — Tests call `app.request()` directly against the real Neon DB. No HTTP server needed. Fast, reliable, no port conflicts.

### Test Framework

Vitest (already configured). Tests go in `tests/` directory.

### Test File: `tests/routes/agent-workflows.test.ts`

Five agent scenario groups:

#### 1.1 Refund Bot (Action + Idempotency)
- Creates an action receipt for a refund
- Verifies the receipt via JSON (valid: true, correct payload)
- Retries with same idempotency key → gets back same receipt (HTTP 200)
- Safe retry confirmed: no duplicate receipts created

#### 1.2 Approval Poller
- Creates an approval receipt with status `pending`
- Verifies it → sees `status: pending`
- (Simulates polling — verifies multiple times, receipt stays valid)

#### 1.3 Handshake Agent
- Creates a handshake receipt with scopes in payload
- Verifies → confirms payload contains granted scopes
- Agent reads payload to decide next action

#### 1.4 Expired Receipt Check
- Creates a receipt with `expires_in: 60` (minimum TTL)
- Verifies it immediately → valid
- Manually checks expiry logic (receipt with past expiry → 404)

#### 1.5 Bad Actor / Error Cases
- No auth header → 401
- Invalid API key format → 401
- Valid format but wrong key → 401
- Missing required fields → 400
- Invalid type enum → 400
- Summary > 280 chars → 400
- Payload > 4KB → 400
- Idempotency conflict (same key, different content) → 409
- Verify nonexistent receipt → 404

### Test File: `tests/routes/verify-content-negotiation.test.ts`

- Request with `Accept: application/json` → JSON response
- Request with `?format=json` → JSON response
- Request with `Accept: text/html` → HTML response containing "Departure Mono"
- 404 HTML page contains "Expired / Not Found"

### Test Setup

- Seed a test API key in `beforeAll`
- Clean up created receipts in `afterAll`
- Use real Neon DB (dotenv loaded via vitest config)

---

## 2. Landing Page

### Route

`GET /` → serves the landing page HTML

### Design (Approved)

Dark theme (`#0a0a0a` background), Departure Mono font throughout.

**Layout order (top to bottom):**

1. **Hero** — "ProofSlip" brand, tagline, headline, sub-copy
2. **Receipt showcase** — Real-looking receipt card (the product itself, front and center)
3. **How it works** — 3 steps: Create, Verify, Expire (with code snippets)
4. **Use cases** — 5 receipt types: action, approval, handshake, resume, failure
5. **CTA** — "Get your API key" button, free tier callout
6. **Footer** — "receipts expire, trust compounds."

### Visual Details

- Background: `#0a0a0a`
- Receipt card: `#fafaf5` with torn-edge bottom (CSS triangles)
- Text: `#e0e0e0` (light), `#666`/`#555` (muted), `#444` (subtle)
- Green accent: `#16a34a` (verified badge), `#7c9a5e` (code)
- Cards/steps: `#111` bg, `#222` border
- Code blocks: `#0a0a0a` bg, green text
- Base font size: 16px
- Brand: 1.5rem, Headline: 1.3rem, Body: 0.85-0.95rem

### Implementation

- New file: `src/views/landing-page.ts` (same pattern as verify-page.ts)
- Add `GET /` route in `src/index.ts`
- Single HTML string template, inline CSS, Departure Mono from CDN

### Font Sizes (final)

| Element | Size |
|---------|------|
| Body base | 16px |
| Brand title | 1.5rem |
| Headline | 1.3rem |
| Tagline | 0.95rem |
| Sub-copy | 0.9rem |
| Step titles | 1rem |
| Step descriptions | 0.85rem |
| Code blocks | 0.75rem |
| Section headings | 0.85rem |
| Use case types | 0.75rem |
| Use case text | 0.85rem |
| CTA text | 0.9rem |
| Receipt rows | 0.95rem |
| Receipt labels | 0.8rem |
