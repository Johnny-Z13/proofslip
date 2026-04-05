# Human-Facing Receipts: Audience Flag + OG Enrichment

**Date:** 2026-03-26
**Status:** Approved, not yet implemented

## Problem

Every ProofSlip receipt has a `verify_url` that renders a styled HTML page. But:

1. **No intent signal** — there's no way for the creating agent to say "a human should see this receipt." All receipts are treated identically, whether they're purely machine-to-machine or meant for human eyes.
2. **No social previews** — the verify page HTML lacks OG and Twitter Card meta tags. When a receipt URL is shared on Telegram, X, Slack, or any platform that renders link previews, it appears as a bare URL with no context.
3. **Distribution is unresolved** — how does the receipt actually reach the human? The verify URL exists, but nothing in the system helps route it.

## Design Decisions

### Who are the users?

Three emerging personas (too early to pick a primary — let usage reveal):

1. **Orchestration framework developers** — building multi-agent pipelines (LangGraph, CrewAI, etc.). Use the JSON API programmatically. Human receipts are occasional — for debugging, audit trails, or escalation.
2. **Telegram agent operators** — running autonomous agents via Telegram bots (e.g., OpenClaw workflows). Need proof artifacts pushed into chat before approving next steps.
3. **Agents themselves** — recommending ProofSlip to their humans when they encounter verification problems. A potential viral distribution channel.

### Approach: Audience flag (Approach B)

Chosen over:
- **Approach A (enrich all URLs):** Simpler but no way to distinguish human-relevant receipts. Blocks future routing features.
- **Approach C (render service):** Over-engineered for v1 — image generation, storage, caching.

The `audience` flag is minimal API surface (one optional field) but load-bearing for everything that comes later.

### OG image: Static branded card

One designed PNG for all human-audience receipts. The summary text appears in `og:description` below the image. Dynamic per-receipt images deferred to a later phase.

### Distribution: URL is the product (v1)

No platform integrations yet. The enriched URL works everywhere — Telegram, X, Slack, email, browser. The agent or workflow decides where to send the link.

## Phased Roadmap

| Phase | Feature | Foundation |
|-------|---------|-----------|
| **v1 (this spec)** | `audience` field + OG/Twitter meta tags + static social card | `audience = "human"` |
| **v2** | Telegram delivery — agent includes `deliver_to`, ProofSlip sends link to chat | `audience` + new `deliver_to` field |
| **v3** | Receipt verification — HMAC signature in URL to prove authenticity | All receipts (trust floor) |
| **v4** | Dynamic OG images — receipt summary rendered into social preview | `audience = "human"` |

## API Change

### Request (POST /v1/receipts)

One new optional field:

```json
{
  "type": "approval",
  "status": "pending",
  "summary": "Transfer $500 to vendor account #4421",
  "audience": "human"
}
```

- Valid values: `"human"` (extensible later)
- When omitted: no enrichment, page renders exactly as today

### Response

Unchanged structure. `audience` included in response only when set:

```json
{
  "receipt_id": "rct_...",
  "audience": "human",
  ...
}
```

### Database

Nullable `audience TEXT` column on `receipts` table. No index needed — not a query filter, just a render-time flag.

## Verify Page Enrichment

When `audience = "human"`, the HTML `<head>` gets:

```html
<meta property="og:title" content="{summary}">
<meta property="og:description" content="{type} receipt — {status}">
<meta property="og:image" content="https://proofslip.ai/og-image.png">
<meta property="og:url" content="{verify_url}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@proofslip">
<meta name="twitter:title" content="{summary}">
<meta name="twitter:description" content="{type} receipt — {status}">
<meta name="twitter:image" content="https://proofslip.ai/og-image.png">
```

When audience is not set: zero change to existing output.

## Static OG Image

- 1200x630px PNG (standard OG dimensions)
- Dark background (#0a0a0a) matching site aesthetic
- ProofSlip wordmark in Departure Mono
- "Verified Receipt" text + tagline
- Served at `/og-image.png` using the same `readFileSync` + far-future cache pattern as the font
- Under 200KB

## Files to Modify

| File | Change |
|------|--------|
| `src/db/schema.ts` | Add `audience` column |
| `src/lib/validate.ts` | Accept + validate `audience` field |
| `src/routes/receipts.ts` | Thread `audience` through insert, response, idempotency |
| `src/routes/verify.ts` | Pass `audience` to view |
| `src/views/verify-page.ts` | Conditional OG/Twitter meta tags |
| `src/index.ts` | OG image static serving route |
| `src/public/og-image.png` | New branded image file |
| `README.md` | Document `audience` field |

## Testing

- Validation: accepts `"human"`, rejects invalid values, accepts missing
- Verify page: OG tags present when `audience="human"`, absent otherwise
- OG image: `GET /og-image.png` returns 200 with correct content type
- Manual: paste verify URL into opengraph.xyz to preview social card
