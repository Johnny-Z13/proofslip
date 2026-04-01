import { FONT_FACE_CSS } from './font.js'

export function renderLandingPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProofSlip — AI Agent Verification API | Ephemeral Receipts for Agent Workflows</title>
  <meta name="description" content="Free API for AI agent verification. Create short-lived proof tokens that agents check before acting. Prevent duplicate actions, stale approvals, and unsafe retries in multi-agent workflows. Create, verify, expire.">
  <meta name="keywords" content="AI agent verification, agent workflow receipts, ephemeral receipts API, agent to agent verification, prevent duplicate agent actions, AI proof token, multi-agent orchestration, LLM agent tools, agent workflow safety, idempotency for agents">
  <meta name="robots" content="index, follow">
  <meta name="author" content="ProofSlip">
  <link rel="canonical" href="https://proofslip.ai">
  <meta property="og:title" content="ProofSlip — Ephemeral Receipts for AI Agent Workflows">
  <meta property="og:description" content="Free verification API for AI agents. Short-lived proof tokens that prevent duplicate actions, stale approvals, and unsafe retries. Create, verify, expire.">
  <meta property="og:image" content="https://proofslip.ai/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://proofslip.ai">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ProofSlip">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@proofslip">
  <meta name="twitter:title" content="ProofSlip — Ephemeral Receipts for AI Agent Workflows">
  <meta name="twitter:description" content="Free verification API for AI agents. Short-lived proof tokens that prevent duplicate actions, stale approvals, and unsafe retries.">
  <meta name="twitter:image" content="https://proofslip.ai/og-image.png">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%230a0a0a'/><text x='50' y='68' text-anchor='middle' font-size='52' font-family='monospace' fill='%23e0e0e0'>P</text></svg>">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ProofSlip",
    "description": "Free AI agent verification API. Create ephemeral receipts that agents verify before acting. Prevents duplicate actions, stale approvals, and unsafe retries in multi-agent workflows.",
    "url": "https://proofslip.ai",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "keywords": "AI agent verification, ephemeral receipts, agent workflow, multi-agent orchestration, proof token",
    "creator": {
      "@type": "Organization",
      "name": "ProofSlip",
      "url": "https://proofslip.ai"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier — 500 receipts per month"
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
      padding: 6rem 1.5rem;
    }
    .container {
      max-width: 600px;
      width: 100%;
    }

    /* Hero */
    .hero {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .hero-brand {
      font-size: 5.5rem;
      font-weight: normal;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 1rem;
      white-space: nowrap;
    }
    .hero-tagline {
      font-size: 0.85rem;
      color: #555;
      margin-bottom: 2rem;
    }
    .hero-headline {
      font-size: 1.2rem;
      font-weight: normal;
      line-height: 1.6;
      margin-bottom: 0;
    }

    /* CTA — right after hero */
    .cta {
      margin-bottom: 3rem;
      text-align: center;
    }
    .signup-row {
      display: flex;
      gap: 0;
      margin-bottom: 0.75rem;
      max-width: 440px;
      margin-left: auto;
      margin-right: auto;
    }
    .signup-input {
      flex: 1;
      background: #111;
      border: 1px solid #222;
      border-right: none;
      color: #e0e0e0;
      font-family: 'Departure Mono', monospace;
      font-size: 0.85rem;
      padding: 0.85rem 1rem;
    }
    .signup-input:focus {
      outline: none;
      border-color: #444;
    }
    .signup-input::placeholder { color: #444; }
    .cta-button {
      background: #16a34a;
      color: #fff;
      border: 1px solid #16a34a;
      padding: 0.85rem 1.5rem;
      font-family: 'Departure Mono', monospace;
      font-size: 0.85rem;
      letter-spacing: 0.05em;
      cursor: pointer;
      white-space: nowrap;
    }
    .cta-button:hover {
      background: #15803d;
      border-color: #15803d;
    }
    .cta-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .cta-subtext {
      font-size: 0.75rem;
      color: #444;
    }
    .cta-legal {
      font-size: 0.65rem;
      color: #333;
      margin-top: 0.4rem;
    }
    .key-display {
      background: #111;
      border: 1px solid #16a34a;
      padding: 1.25rem;
      margin-bottom: 0.75rem;
      text-align: left;
      max-width: 440px;
      margin-left: auto;
      margin-right: auto;
    }
    .key-label {
      font-size: 0.7rem;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.5rem;
    }
    .signup-error-msg {
      font-size: 0.85rem;
      color: #a85454;
    }

    /* Receipt showcase */
    .showcase {
      margin-bottom: 5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .section-label {
      font-size: 0.7rem;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-bottom: 2rem;
      text-align: center;
    }
    .receipt {
      background: #fafaf5;
      color: #1a1a1a;
      max-width: 400px;
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
      margin-bottom: 5rem;
    }
    .steps {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .step {
      background: #111;
      border: 1px solid #1a1a1a;
      padding: 1.5rem;
    }
    .step-number {
      font-size: 0.7rem;
      color: #333;
      letter-spacing: 0.1em;
      margin-bottom: 0.5rem;
    }
    .step-title {
      font-size: 1.2rem;
      color: #e0e0e0;
      margin-bottom: 0.5rem;
      font-weight: normal;
    }
    .step-description {
      font-size: 0.8rem;
      color: #555;
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

    /* Comparison */
    .comparison {
      margin-bottom: 5rem;
    }
    .comparison-grid {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .comparison-item {
      display: flex;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #111;
    }
    .comparison-what {
      font-size: 0.8rem;
      color: #555;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .comparison-problem {
      font-size: 0.8rem;
      color: #333;
      line-height: 1.5;
    }
    .comparison-punchline {
      font-size: 0.8rem;
      color: #888;
      line-height: 1.6;
      padding-left: 1rem;
      border-left: 2px solid #16a34a;
    }

    /* Two interfaces */
    .two-ways {
      margin-bottom: 5rem;
    }
    .two-ways-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background: #1a1a1a;
      border: 1px solid #1a1a1a;
    }
    .two-ways-item {
      background: #0a0a0a;
      padding: 1.25rem;
    }
    .two-ways-label {
      font-size: 0.65rem;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: 0.5rem;
    }
    .two-ways-title {
      font-size: 0.9rem;
      color: #e0e0e0;
      margin-bottom: 0.4rem;
    }
    .two-ways-desc {
      font-size: 0.75rem;
      color: #555;
      line-height: 1.5;
    }
    .two-ways-footnote {
      font-size: 0.75rem;
      color: #333;
      margin-top: 1rem;
      text-align: center;
    }

    /* Failure cases */
    .failures {
      margin-bottom: 5rem;
    }
    .failure-card {
      border: 1px solid #1a1a1a;
      margin-bottom: 1rem;
      overflow: hidden;
    }
    .failure-scenario {
      padding: 1.25rem;
      background: #0d0d0d;
    }
    .failure-label {
      font-size: 0.65rem;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.5rem;
    }
    .failure-title {
      font-size: 0.9rem;
      color: #e0e0e0;
      margin-bottom: 0.5rem;
    }
    .failure-halves {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background: #1a1a1a;
    }
    .failure-half {
      padding: 1rem 1.25rem;
      background: #0a0a0a;
    }
    .failure-half-label {
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.5rem;
    }
    .failure-half-label.without { color: #a85454; }
    .failure-half-label.with { color: #16a34a; }
    .failure-half p {
      font-size: 0.75rem;
      color: #666;
      line-height: 1.6;
      margin: 0;
    }
    .failure-half.bad p { color: #776060; }
    .failure-half.good p { color: #8a8a8a; }
    .failure-half code {
      font-family: 'Departure Mono', monospace;
      font-size: 0.7rem;
      background: #111;
      padding: 0.1rem 0.35rem;
    }

    @media (max-width: 640px) {
      .failure-halves { grid-template-columns: 1fr; }
    }

    /* Use cases */
    .use-cases {
      margin-bottom: 5rem;
    }
    .use-case-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .use-case {
      display: flex;
      gap: 1rem;
      padding: 0.6rem 0;
      border-bottom: 1px solid #111;
      align-items: baseline;
    }
    .use-case:last-child { border-bottom: none; }
    .use-case-type {
      font-size: 0.75rem;
      color: #e0e0e0;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      flex-shrink: 0;
      min-width: 90px;
    }
    .use-case-scenario {
      font-size: 0.75rem;
      color: #555;
      line-height: 1.5;
    }

    /* MCP install */
    .mcp-install {
      margin-bottom: 5rem;
      text-align: center;
    }
    .mcp-install-cmd {
      display: inline-block;
      background: #111;
      border: 1px solid #1a1a1a;
      padding: 0.6rem 1.25rem;
      font-size: 0.75rem;
      color: #7c9a5e;
      font-family: 'Departure Mono', monospace;
      margin-top: 1rem;
      letter-spacing: 0.02em;
    }
    .mcp-install-note {
      font-size: 0.65rem;
      color: #333;
      margin-top: 0.6rem;
    }
    .mcp-install-note a {
      color: #444;
      text-decoration: none;
    }
    .mcp-install-note a:hover {
      color: #888;
    }

    /* Footer nav */
    .footer-nav {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #111;
      width: 100%;
    }
    .footer-nav a {
      font-size: 0.75rem;
      color: #444;
      text-decoration: none;
      letter-spacing: 0.05em;
    }
    .footer-nav a:hover {
      color: #888;
    }

    /* Footer */
    .site-footer {
      font-size: 0.75rem;
      color: #333;
      text-align: center;
      width: 100%;
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      body { padding: 3rem 1rem; }
      .hero { margin-bottom: 2rem; }
      .hero-brand { font-size: 2.5rem; letter-spacing: 0.15em; }
      .hero-tagline { font-size: 0.75rem; }
      .hero-headline { font-size: 1rem; }
      .section-label { font-size: 0.65rem; }
      .receipt { padding: 1.5rem 1rem; max-width: 100%; }
      .row .value { max-width: 60%; font-size: 0.7rem; }
      .step { padding: 1rem; }
      .step-title { font-size: 1rem; }
      .code-block { font-size: 0.65rem; padding: 0.75rem; }
      .two-ways-grid { grid-template-columns: 1fr; }
      .use-case { flex-direction: column; gap: 0.25rem; }
      .use-case-type { min-width: auto; }
      .how-it-works, .use-cases, .showcase, .comparison, .two-ways, .mcp-install { margin-bottom: 3rem; }
      .cta { margin-bottom: 2rem; }
      .cta-button { padding: 0.75rem 1.5rem; font-size: 0.85rem; }
      .signup-row { flex-direction: column; }
      .signup-input { border-right: 1px solid #222; }
      .comparison-item { flex-direction: column; gap: 0.25rem; }
    }

    @media (max-width: 380px) {
      .hero-brand { font-size: 2rem; }
      .row { flex-direction: column; gap: 0.2rem; }
      .row .value { text-align: left; max-width: 100%; }
    }

    /* Glyph flicker — subtle O ↔ 0 swap */
    .glyph-flicker {
      display: inline-block;
      transition: opacity 0.12s ease;
    }
  </style>
</head>
<body>
  <main class="container">

    <!-- Hero -->
    <section class="hero">
      <div class="hero-brand" aria-label="ProofSlip"><span>P</span><span>R</span><span class="glyph-flicker" data-alt="0">O</span><span class="glyph-flicker" data-alt="0">O</span><span>F</span><span>S</span><span>L</span><span>I</span><span>P</span></div>
      <div class="hero-tagline">ephemeral verification for agent workflows</div>
      <h1 class="hero-headline">24-hour receipts your agents check before they act.</h1>
    </section>

    <!-- CTA — immediately visible -->
    <section class="cta" id="signup">
      <div id="signup-form">
        <div class="signup-row">
          <input type="email" id="signup-email" placeholder="you@example.com" class="signup-input" autocomplete="email">
          <button id="signup-btn" class="cta-button" onclick="doSignup()">Get API key</button>
        </div>
        <div class="cta-subtext">Free — 500 receipts/month. No credit card.</div>
      </div>
      <div id="signup-result" style="display:none">
        <div class="key-display">
          <div class="key-label" style="color:#16a34a;font-size:0.85rem;margin-bottom:0.75rem">Check your email</div>
          <div style="font-size:0.8rem;color:#888;line-height:1.6;">Your API key has been sent to <strong id="sent-email" style="color:#e0e0e0"></strong>.<br>It looks like a receipt — you'll recognize it.</div>
        </div>
        <div class="cta-subtext" style="margin-top:0.75rem">Didn't get it? Check spam, or sign up via curl for instant access.</div>
      </div>
      <div id="signup-error" style="display:none">
        <div class="signup-error-msg" id="signup-error-msg"></div>
        <button class="cta-button" onclick="resetSignup()" style="margin-top:0.75rem">Try again</button>
      </div>
    </section>

    <!-- Receipt Showcase -->
    <section class="showcase">
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
          <p class="step-description">Issue a receipt when something happens — a payment, an approval, a handshake.</p>
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
          <p class="step-description">Before acting, your agent checks the receipt. Valid receipt = go. No receipt = stop.</p>
          <div class="code-block"><span class="comment"># GET /verify/rct_7f3k9x2m</span>
{
  "id": "rct_7f3k9x2m",
  "valid": true,
  "expires_at": "2026-03-24T12:00:00Z"
}</div>
        </div>

        <div class="step">
          <div class="step-number">03</div>
          <div class="step-title">Expire</div>
          <p class="step-description">Receipts auto-expire after 24 hours. No cleanup. No stale state.</p>
        </div>

      </div>
    </section>

    <!-- Two ways to verify -->
    <section class="two-ways">
      <div class="section-label">One receipt, two interfaces</div>
      <div class="two-ways-grid">
        <div class="two-ways-item">
          <div class="two-ways-label">For humans</div>
          <div class="two-ways-title">Shareable URL</div>
          <div class="two-ways-desc">Every receipt has a unique verification page. Send the link — anyone can confirm the receipt is real and current.</div>
        </div>
        <div class="two-ways-item">
          <div class="two-ways-label">For agents</div>
          <div class="two-ways-title">JSON API</div>
          <div class="two-ways-desc">Same receipt, machine-readable. Your agent GETs the endpoint and gets a yes/no with an expiry window.</div>
        </div>
      </div>
      <div class="two-ways-footnote">Every receipt ID is cryptographically random and verifiable.</div>
    </section>

    <!-- Why not just... -->
    <section class="comparison">
      <div class="section-label">Why not just use...</div>
      <div class="comparison-grid">
        <div class="comparison-item">
          <div class="comparison-what">A database flag?</div>
          <div class="comparison-problem">No expiry, no portability between services.</div>
        </div>
        <div class="comparison-item">
          <div class="comparison-what">A webhook?</div>
          <div class="comparison-problem">Pushes events but doesn't prove they happened.</div>
        </div>
        <div class="comparison-item">
          <div class="comparison-what">A log?</div>
          <div class="comparison-problem">Records history. Doesn't answer "is this still valid?"</div>
        </div>
      </div>
      <div class="comparison-punchline">ProofSlip gives the next agent portable, expiring proof it can verify before acting.</div>
    </section>

    <!-- Why agents need receipts -->
    <section class="failures">
      <div class="section-label">Why agents need receipts</div>

      <div class="failure-card">
        <div class="failure-scenario">
          <div class="failure-label">Duplicate refund</div>
          <div class="failure-title">Two agents process the same refund because neither can prove it already happened.</div>
        </div>
        <div class="failure-halves">
          <div class="failure-half bad">
            <div class="failure-half-label without">Without ProofSlip</div>
            <p>Agent A refunds $42. Agent B sees the same ticket, refunds $42 again. Customer gets $84. Your DB flag was stale.</p>
          </div>
          <div class="failure-half good">
            <div class="failure-half-label with">With ProofSlip</div>
            <p>Agent A creates a receipt with <code>idempotency_key: "refund-8812"</code>. Agent B tries the same key &mdash; gets the existing receipt back. One refund, one proof.</p>
          </div>
        </div>
      </div>

      <div class="failure-card">
        <div class="failure-scenario">
          <div class="failure-label">Stale approval</div>
          <div class="failure-title">An agent acts on a human approval that was given 3 days ago for a different context.</div>
        </div>
        <div class="failure-halves">
          <div class="failure-half bad">
            <div class="failure-half-label without">Without ProofSlip</div>
            <p>Manager approved a $500 payment on Monday. Friday, a different agent finds that approval flag and pushes $5,000. The flag never expired.</p>
          </div>
          <div class="failure-half good">
            <div class="failure-half-label with">With ProofSlip</div>
            <p>Approval receipt expires in 1 hour. Agent checks <code>valid: true</code> and <code>expired: false</code> before every action. Stale approval = automatic stop.</p>
          </div>
        </div>
      </div>

      <div class="failure-card">
        <div class="failure-scenario">
          <div class="failure-label">Broken handshake</div>
          <div class="failure-title">Agent B starts writing to a shared resource before Agent A is done reading it.</div>
        </div>
        <div class="failure-halves">
          <div class="failure-half bad">
            <div class="failure-half-label without">Without ProofSlip</div>
            <p>Agent A is mid-read. Agent B assumes it&rsquo;s done and starts writing. Data corruption. No coordination, just hope.</p>
          </div>
          <div class="failure-half good">
            <div class="failure-half-label with">With ProofSlip</div>
            <p>Agent A creates a <code>handshake</code> receipt when ready. Agent B verifies it exists before writing. No receipt = wait.</p>
          </div>
        </div>
      </div>

      <div class="failure-card">
        <div class="failure-scenario">
          <div class="failure-label">Unsafe retry</div>
          <div class="failure-title">A pipeline crashes and restarts from the beginning instead of where it left off.</div>
        </div>
        <div class="failure-halves">
          <div class="failure-half bad">
            <div class="failure-half-label without">Without ProofSlip</div>
            <p>Pipeline fails at step 7 of 10. Restarts at step 1. Re-sends emails, re-processes payments, re-deploys artifacts. Chaos.</p>
          </div>
          <div class="failure-half good">
            <div class="failure-half-label with">With ProofSlip</div>
            <p>Each step creates a <code>resume</code> receipt. On restart, the pipeline checks which receipts are still valid and skips to step 8.</p>
          </div>
        </div>
      </div>

    </section>

    <!-- Use Cases -->
    <section class="use-cases">
      <div class="section-label">Receipt Types</div>
      <div class="use-case-list">
        <div class="use-case">
          <div class="use-case-type">action</div>
          <div class="use-case-scenario">Verify a refund happened before emailing the customer.</div>
        </div>
        <div class="use-case">
          <div class="use-case-type">approval</div>
          <div class="use-case-scenario">Gate a payment on a fresh human approval — not a cached one.</div>
        </div>
        <div class="use-case">
          <div class="use-case-type">handshake</div>
          <div class="use-case-scenario">Prove both agents acknowledged before either starts writing.</div>
        </div>
      </div>
    </section>

    <!-- MCP -->
    <section class="mcp-install">
      <div class="section-label">MCP Server</div>
      <div class="mcp-install-cmd">npx -y @proofslip/mcp-server</div>
      <div class="mcp-install-note">Works with Claude Desktop, Cursor, Windsurf, and any MCP client. <a href="https://www.npmjs.com/package/@proofslip/mcp-server" target="_blank">npm ↗</a></div>
    </section>

    <!-- Footer nav -->
    <nav class="footer-nav">
      <a href="/docs">API docs</a>
      <a href="/llms.txt">llms.txt</a>
      <a href="https://www.npmjs.com/package/@proofslip/mcp-server" target="_blank">npm</a>
      <a href="https://github.com/Johnny-Z13/proof-slip" target="_blank">GitHub</a>
    </nav>

    <!-- Footer -->
    <footer class="site-footer">
      proofslip.ai — receipts expire, trust compounds.
    </footer>

  </main>
  <script>
    var SIGNUP_URL = "/v1/auth/signup";
    async function doSignup() {
      var email = document.getElementById("signup-email").value.trim();
      if (!email) return;
      var btn = document.getElementById("signup-btn");
      btn.disabled = true;
      btn.textContent = "...";
      try {
        var res = await fetch(SIGNUP_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, source: "web" })
        });
        var data = await res.json();
        if (!res.ok) {
          document.getElementById("signup-form").style.display = "none";
          document.getElementById("signup-error-msg").textContent = data.message || "Something went wrong.";
          document.getElementById("signup-error").style.display = "block";
          return;
        }
        document.getElementById("signup-form").style.display = "none";
        document.getElementById("sent-email").textContent = email;
        document.getElementById("signup-result").style.display = "block";
      } catch (err) {
        document.getElementById("signup-form").style.display = "none";
        document.getElementById("signup-error-msg").textContent = "Network error. Try again.";
        document.getElementById("signup-error").style.display = "block";
      } finally {
        btn.disabled = false;
        btn.textContent = "Get API key";
      }
    }
    function resetSignup() {
      document.getElementById("signup-error").style.display = "none";
      document.getElementById("signup-form").style.display = "block";
    }
    document.getElementById("signup-email").addEventListener("keydown", function(e) {
      if (e.key === "Enter") doSignup();
    });

    // Glyph flicker: O ↔ 0
    (function() {
      var glyphs = document.querySelectorAll('.glyph-flicker');
      glyphs.forEach(function(el, i) {
        var original = el.textContent;
        var alt = el.getAttribute('data-alt');
        var showing = true;
        var delay = i * 2400;
        setTimeout(function tick() {
          el.style.opacity = '0';
          setTimeout(function() {
            showing = !showing;
            el.textContent = showing ? original : alt;
            el.style.opacity = '1';
          }, 120);
          setTimeout(tick, 4000 + Math.random() * 2000);
        }, 3000 + delay);
      });
    })();
  </script>
</body>
</html>`
}
