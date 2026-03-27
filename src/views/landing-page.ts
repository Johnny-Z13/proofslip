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
    .hero-plain {
      font-size: 0.95rem;
      color: #888;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .hero-pain {
      font-size: 0.9rem;
      color: #a85454;
      line-height: 1.6;
      margin-bottom: 1rem;
      font-style: italic;
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

    /* Comparison */
    .comparison {
      margin-bottom: 4rem;
    }
    .comparison-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .comparison-item {
      border: 1px solid #1a1a1a;
      padding: 1rem;
    }
    .comparison-what {
      font-size: 0.9rem;
      color: #e0e0e0;
      margin-bottom: 0.4rem;
    }
    .comparison-problem {
      font-size: 0.8rem;
      color: #666;
      line-height: 1.6;
    }
    .comparison-punchline {
      font-size: 0.85rem;
      color: #888;
      line-height: 1.6;
      padding: 1rem;
      border-left: 2px solid #16a34a;
    }

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

    /* Trust section */
    .trust-section {
      margin-bottom: 4rem;
    }
    .trust-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .trust-item {
      border: 1px solid #1a1a1a;
      padding: 1rem;
    }
    .trust-q {
      font-size: 0.85rem;
      color: #e0e0e0;
      margin-bottom: 0.4rem;
    }
    .trust-a {
      font-size: 0.8rem;
      color: #666;
      line-height: 1.6;
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
    .use-case-scenario {
      font-size: 0.85rem;
      color: #888;
      line-height: 1.5;
      margin-bottom: 0.5rem;
    }
    .use-case-pain {
      font-size: 0.8rem;
      color: #a85454;
      line-height: 1.5;
      font-style: italic;
    }

    /* CTA */
    .cta {
      margin-bottom: 4rem;
      text-align: center;
    }
    .signup-row {
      display: flex;
      gap: 0;
      margin-bottom: 0.75rem;
      max-width: 480px;
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
      font-size: 0.8rem;
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
      max-width: 480px;
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
      .how-it-works, .use-cases, .showcase, .trust-section, .comparison { margin-bottom: 2.5rem; }
      .hero-plain { font-size: 0.85rem; }
      .hero-pain { font-size: 0.8rem; }
      .trust-q { font-size: 0.8rem; }
      .trust-a { font-size: 0.75rem; }
      .cta-button { padding: 0.75rem 1.5rem; font-size: 0.85rem; }
      .signup-row { flex-direction: column; }
      .signup-input { border-right: 1px solid #222; }
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
      <p class="hero-plain">A short-lived proof token that one agent creates and another verifies — before it does anything irreversible.</p>
      <p class="hero-pain">Your agent executed twice. The approval expired but nobody checked. A workflow resumed from stale state and charged the customer again.</p>
      <p class="hero-subcopy">ProofSlip issues verifiable receipts with a built-in expiry window. Your agents check the receipt before acting. No valid receipt, no action. No stale state, no replay attacks, no "I thought it was approved."</p>
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

    <!-- Why not just... -->
    <section class="comparison">
      <div class="section-label">Why not just use...</div>
      <div class="comparison-grid">
        <div class="comparison-item">
          <div class="comparison-what">A database flag?</div>
          <div class="comparison-problem">Flags don't expire, don't travel between services, and don't tell the next agent <em>when</em> the state changed. You end up building TTL logic, polling, and cleanup yourself.</div>
        </div>
        <div class="comparison-item">
          <div class="comparison-what">A webhook?</div>
          <div class="comparison-problem">Webhooks push events but don't prove they happened. If the receiver was down, the event is lost. There's no artifact the next agent can check independently.</div>
        </div>
        <div class="comparison-item">
          <div class="comparison-what">A log?</div>
          <div class="comparison-problem">Logs record history. They don't answer "is this still valid right now?" An agent can't query a log line with a URL and get back a yes/no with an expiry window.</div>
        </div>
      </div>
      <div class="comparison-punchline">Logs tell you what happened. Flags tell you current state. ProofSlip gives the next agent portable, expiring proof it can verify before acting.</div>
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

    <!-- How Trust Works -->
    <section class="trust-section">
      <div class="section-label">How Trust Works</div>
      <div class="trust-grid">
        <div class="trust-item">
          <div class="trust-q">What gets stored?</div>
          <div class="trust-a">Type, status, a 280-char summary, optional JSON payload (4KB max), and expiry time. Nothing more. You control what goes in.</div>
        </div>
        <div class="trust-item">
          <div class="trust-q">Can receipts be forged?</div>
          <div class="trust-a">Receipt IDs are cryptographically random. Only the API key holder can create receipts, and only the verify endpoint confirms them. No ID, no proof.</div>
        </div>
        <div class="trust-item">
          <div class="trust-q">What does verify actually check?</div>
          <div class="trust-a">That the receipt exists, was created by a valid key, and hasn't expired. If any of those fail, the response says invalid. Your agent stops.</div>
        </div>
        <div class="trust-item">
          <div class="trust-q">What happens at expiry?</div>
          <div class="trust-a">The receipt returns not found. Expired receipts are deleted permanently — no archive, no ghost state. The authorization window is closed.</div>
        </div>
        <div class="trust-item">
          <div class="trust-q">What about replays?</div>
          <div class="trust-a">Receipts are read-only after creation. Combined with expiry, the window for replay is bounded. Idempotency keys prevent duplicate creation.</div>
        </div>
      </div>
    </section>

    <!-- Use Cases -->
    <section class="use-cases">
      <div class="section-label">Receipt Types</div>
      <div class="use-case-list">

        <div class="use-case">
          <div class="use-case-type">action</div>
          <div class="use-case-scenario">Agent refunds a customer $42. Issuing agent creates a receipt. Notification agent verifies the receipt exists before emailing the customer.</div>
          <div class="use-case-pain">Without it: notification fires on stale data, customer gets a refund email for a failed transaction.</div>
        </div>

        <div class="use-case">
          <div class="use-case-type">approval</div>
          <div class="use-case-scenario">Human approves a $5k vendor payment in Telegram. Agent creates an approval receipt. Payment agent checks the receipt before executing the transfer.</div>
          <div class="use-case-pain">Without it: approval expires, agent pays anyway because it cached "approved" from an hour ago.</div>
        </div>

        <div class="use-case">
          <div class="use-case-type">handshake</div>
          <div class="use-case-scenario">Two agents need to coordinate a data migration. Each confirms readiness. The receipt proves both sides acknowledged before either starts writing.</div>
          <div class="use-case-pain">Without it: one agent starts writing while the other is still reading. Partial state, corrupted data.</div>
        </div>

        <div class="use-case">
          <div class="use-case-type">resume</div>
          <div class="use-case-scenario">A deploy pipeline pauses after canary. Oncall clears it to continue. The resume receipt gates re-entry into the deploy sequence.</div>
          <div class="use-case-pain">Without it: pipeline resumes from a stale checkpoint and re-deploys an already-rolled-back version.</div>
        </div>

        <div class="use-case">
          <div class="use-case-type">failure</div>
          <div class="use-case-scenario">Payment processor returns an error. Agent creates a failure receipt. Retry agent checks — if the failure receipt is still valid, it knows the error is recent and retries. If expired, it escalates.</div>
          <div class="use-case-pain">Without it: retry agent loops on a failure from 6 hours ago, burning API calls and hitting rate limits.</div>
        </div>

      </div>
    </section>

    <!-- CTA / Signup -->
    <section class="cta" id="signup">
      <div class="section-label" style="color: #16a34a">Get your API key</div>
      <div id="signup-form">
        <div class="signup-row">
          <input type="email" id="signup-email" placeholder="you@example.com" class="signup-input" autocomplete="email">
          <button id="signup-btn" class="cta-button" onclick="doSignup()">Get key</button>
        </div>
        <div class="cta-subtext">Free tier — 500 receipts/month. No credit card.</div>
        <div class="cta-legal">We'll email you product updates. No spam.</div>
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
        btn.textContent = "Get key";
      }
    }
    function resetSignup() {
      document.getElementById("signup-error").style.display = "none";
      document.getElementById("signup-form").style.display = "block";
    }
    document.getElementById("signup-email").addEventListener("keydown", function(e) {
      if (e.key === "Enter") doSignup();
    });
  </script>
</body>
</html>`
}
