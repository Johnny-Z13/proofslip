import { FONT_FACE_CSS } from './font.js'

export function renderLandingPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProofSlip — 24-hour receipts for agent workflows</title>
  <meta name="description" content="Ephemeral, machine-readable receipts that let AI agents verify what happened before deciding what happens next. Create, verify, expire. That's it.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://proofslip.ai">
  <meta property="og:title" content="ProofSlip — 24-hour receipts for agent workflows">
  <meta property="og:description" content="Ephemeral, machine-readable receipts that let AI agents verify what happened before deciding what happens next.">
  <meta property="og:image" content="https://proofslip.ai/og-image.png">
  <meta property="og:url" content="https://proofslip.ai">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ProofSlip">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@proofslip">
  <meta name="twitter:title" content="ProofSlip — 24-hour receipts for agent workflows">
  <meta name="twitter:description" content="Ephemeral, machine-readable receipts that let AI agents verify what happened before deciding what happens next.">
  <meta name="twitter:image" content="https://proofslip.ai/og-image.png">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%230a0a0a'/><text x='50' y='68' text-anchor='middle' font-size='52' font-family='monospace' fill='%23e0e0e0'>P</text></svg>">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ProofSlip",
    "description": "24-hour ephemeral receipts for AI agent workflows. Create, verify, expire.",
    "url": "https://proofslip.ai",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
  </script>
  <style>
    ${FONT_FACE_CSS}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Departure Mono', monospace;
      font-size: 16px;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem 1rem;
    }
    .container {
      max-width: 640px;
      width: 100%;
    }

    /* Hero */
    .hero {
      text-align: center;
      margin-bottom: 4rem;
    }
    .hero-brand {
      font-size: 5.5rem;
      font-weight: normal;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }
    .hero-tagline {
      font-size: 0.95rem;
      color: #666;
      margin-bottom: 1.5rem;
    }
    .hero-headline {
      font-size: 1.3rem;
      font-weight: normal;
      line-height: 1.5;
      margin-bottom: 1rem;
    }
    .hero-subcopy {
      font-size: 0.9rem;
      color: #555;
      line-height: 1.6;
    }

    /* Receipt showcase */
    .showcase {
      margin-bottom: 4rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .section-label {
      font-size: 1.4rem;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: 1.5rem;
    }
    .receipt {
      background: #fafaf5;
      color: #1a1a1a;
      max-width: 420px;
      width: 100%;
      padding: 2rem 1.5rem;
      position: relative;
    }
    .receipt::after {
      content: '';
      display: block;
      position: absolute;
      bottom: -8px;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(135deg, #fafaf5 33.33%, transparent 33.33%) -8px 0,
                  linear-gradient(225deg, #fafaf5 33.33%, transparent 33.33%) -8px 0;
      background-size: 16px 8px;
    }
    .receipt-header {
      text-align: center;
      padding-bottom: 1rem;
      border-bottom: 1px dashed #ccc;
      margin-bottom: 1rem;
    }
    .receipt-header h2 {
      font-size: 1rem;
      font-weight: normal;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .verified-badge {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.25rem 0.75rem;
      border: 1px solid #16a34a;
      color: #16a34a;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .receipt-id {
      text-align: center;
      font-size: 0.65rem;
      color: #999;
      margin-bottom: 1rem;
    }
    .divider {
      border: none;
      border-top: 1px dashed #ccc;
      margin: 1rem 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.8rem;
      line-height: 1.4;
    }
    .row .label {
      color: #888;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }
    .row .value {
      text-align: right;
      max-width: 65%;
      word-break: break-word;
    }
    .summary-block {
      margin: 1rem 0;
      padding: 0.75rem;
      background: #f0f0ea;
      font-size: 0.8rem;
      line-height: 1.5;
    }
    .receipt details { margin-top: 1rem; }
    .receipt summary {
      cursor: pointer;
      font-size: 0.7rem;
      color: #888;
      letter-spacing: 0.05em;
    }
    .receipt pre {
      background: #f0f0ea;
      padding: 0.75rem;
      overflow-x: auto;
      font-size: 0.65rem;
      margin-top: 0.5rem;
      font-family: 'Departure Mono', monospace;
    }
    .receipt-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px dashed #ccc;
    }
    .receipt-footer a {
      color: #888;
      text-decoration: none;
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .receipt-footer a:hover { color: #1a1a1a; }

    /* How it works */
    .how-it-works {
      margin-bottom: 4rem;
    }
    .steps {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .step {
      background: #111;
      border: 1px solid #222;
      padding: 1.5rem;
    }
    .step-number {
      font-size: 0.75rem;
      color: #444;
      letter-spacing: 0.1em;
      margin-bottom: 0.5rem;
    }
    .step-title {
      font-size: 1.4rem;
      color: #e0e0e0;
      margin-bottom: 0.75rem;
      font-weight: normal;
    }
    .step-description {
      font-size: 0.85rem;
      color: #666;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .step-description:last-child {
      margin-bottom: 0;
    }
    .code-block {
      background: #0a0a0a;
      border: 1px solid #1a1a1a;
      color: #7c9a5e;
      padding: 1rem;
      font-size: 0.75rem;
      line-height: 1.6;
      overflow-x: auto;
      font-family: 'Departure Mono', monospace;
    }
    .code-block .comment {
      color: #444;
    }

    /* Use cases */
    .use-cases {
      margin-bottom: 4rem;
    }
    .use-case-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .use-case {
      border: 1px solid #1a1a1a;
      padding: 1rem;
    }
    .use-case-type {
      font-size: 1.4rem;
      color: #e0e0e0;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.4rem;
    }
    .use-case-description {
      font-size: 0.85rem;
      color: #888;
      line-height: 1.5;
    }

    /* CTA */
    .cta {
      margin-bottom: 4rem;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      background: #fafaf5;
      color: #0a0a0a;
      padding: 0.85rem 2rem;
      text-decoration: none;
      font-family: 'Departure Mono', monospace;
      font-size: 0.9rem;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    .cta-button:hover {
      background: #e8e8e0;
    }
    .cta-subtext {
      font-size: 0.8rem;
      color: #444;
    }

    /* Footer */
    .site-footer {
      font-size: 0.8rem;
      color: #444;
      text-align: center;
      padding-top: 2rem;
      border-top: 1px solid #1a1a1a;
      width: 100%;
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      body { padding: 2rem 0.75rem; }
      .hero { margin-bottom: 2.5rem; }
      .hero-brand { font-size: 2.5rem; letter-spacing: 0.15em; }
      .hero-tagline { font-size: 0.8rem; }
      .hero-headline { font-size: 1.1rem; }
      .hero-subcopy { font-size: 0.8rem; }
      .section-label { font-size: 1.1rem; }
      .receipt { padding: 1.5rem 1rem; max-width: 100%; }
      .row .value { max-width: 60%; font-size: 0.7rem; }
      .step { padding: 1rem; }
      .step-title { font-size: 1.1rem; }
      .code-block { font-size: 0.65rem; padding: 0.75rem; }
      .use-case-type { font-size: 1.1rem; }
      .how-it-works, .use-cases, .showcase { margin-bottom: 2.5rem; }
      .cta-button { padding: 0.75rem 1.5rem; font-size: 0.85rem; }
    }

    @media (max-width: 380px) {
      .hero-brand { font-size: 2rem; }
      .row { flex-direction: column; gap: 0.2rem; }
      .row .value { text-align: left; max-width: 100%; }
    }
  </style>
</head>
<body>
  <main class="container">

    <!-- Hero -->
    <section class="hero">
      <div class="hero-brand">ProofSlip</div>
      <div class="hero-tagline">ephemeral verification for agent workflows</div>
      <h1 class="hero-headline">24-hour receipts your agents can check before they act.</h1>
      <p class="hero-subcopy">Issue a signed receipt when something happens. Your agents verify it before taking action. No receipt, no action. Receipts expire automatically — no stale state, no replay attacks.</p>
    </section>

    <!-- Receipt Showcase -->
    <section class="showcase">
      <div class="section-label">Sample Receipt</div>
      <div class="receipt">
        <div class="receipt-header">
          <h2>ProofSlip</h2>
          <div class="verified-badge">Verified</div>
        </div>
        <div class="receipt-id">rct_7f3k9x2m</div>
        <div class="row"><span class="label">Type</span><span class="value">action</span></div>
        <div class="row"><span class="label">Status</span><span class="value">success</span></div>
        <div class="summary-block">Refund of $42.00 issued to customer #8812</div>
        <hr class="divider">
        <div class="row"><span class="label">Created</span><span class="value">Mon, 23 Mar 2026 12:00:00 GMT</span></div>
        <div class="row"><span class="label">Expires</span><span class="value">Tue, 24 Mar 2026 12:00:00 GMT</span></div>
        <details>
          <summary>&gt; view payload</summary>
          <pre>{
  "customer_id": 8812,
  "refund_amount": 42.00,
  "currency": "USD",
  "reason": "duplicate_charge",
  "initiated_by": "agent/billing-v2"
}</pre>
        </details>
        <div class="receipt-footer">
          <a href="/">proofslip.ai</a>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works">
      <div class="section-label">How It Works</div>
      <div class="steps">

        <div class="step">
          <div class="step-number">01</div>
          <div class="step-title">Create</div>
          <p class="step-description">Your system issues a receipt when a significant event occurs — a payment processed, an approval granted, a handshake completed.</p>
          <div class="code-block"><span class="comment"># POST /v1/receipts</span>
{
  "type": "action",
  "status": "success",
  "summary": "Refund of $42.00 issued to customer #8812",
  "idempotency_key": "refund-8812-2026-03-23"
}</div>
        </div>

        <div class="step">
          <div class="step-number">02</div>
          <div class="step-title">Verify</div>
          <p class="step-description">Before taking action, your agent checks the receipt. A valid receipt confirms the prerequisite event actually happened.</p>
          <div class="code-block"><span class="comment"># GET /verify/rct_7f3k9x2m</span>
{
  "id": "rct_7f3k9x2m",
  "type": "action",
  "status": "success",
  "valid": true,
  "expires_at": "2026-03-24T12:00:00Z"
}

<span class="comment"># or view the styled receipt in the browser ↗</span></div>
        </div>

        <div class="step">
          <div class="step-number">03</div>
          <div class="step-title">Expire</div>
          <p class="step-description">Receipts automatically expire after 24 hours. Expired receipts return invalid — your agents know the authorization window has closed. No manual cleanup required.</p>
        </div>

      </div>
    </section>

    <!-- Use Cases -->
    <section class="use-cases">
      <div class="section-label">Receipt Types</div>
      <div class="use-case-list">

        <div class="use-case">
          <div class="use-case-type">action</div>
          <div class="use-case-description">Confirm a side-effectful operation completed — a payment, a write, a deletion. Downstream agents verify before proceeding.</div>
        </div>

        <div class="use-case">
          <div class="use-case-type">approval</div>
          <div class="use-case-description">A human or system approved a request. The receipt proves the approval exists and hasn't expired before the agent acts on it.</div>
        </div>

        <div class="use-case">
          <div class="use-case-type">handshake</div>
          <div class="use-case-description">Two agents or services acknowledged each other. Useful for multi-step orchestration where each step must confirm the previous.</div>
        </div>

        <div class="use-case">
          <div class="use-case-type">resume</div>
          <div class="use-case-description">A paused workflow is cleared to continue. The receipt gates re-entry, preventing double-execution after interruption.</div>
        </div>

        <div class="use-case">
          <div class="use-case-type">failure</div>
          <div class="use-case-description">Record that something failed in a verifiable way. Downstream agents can check whether a known failure is still within its reporting window.</div>
        </div>

      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <a href="mailto:api@proofslip.ai" class="cta-button">Get your API key</a>
      <div class="cta-subtext">Free tier — 500 receipts/month. No credit card.</div>
    </section>

    <!-- Footer -->
    <footer class="site-footer">
      proofslip.ai — receipts expire, trust compounds.
    </footer>

  </main>
</body>
</html>`
}
